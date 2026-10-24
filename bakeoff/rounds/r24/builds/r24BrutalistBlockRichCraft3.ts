import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, rng, paint, mix, noise, rgb, smoothstep, svg, mottle } from "../../../../src/index";
import type { Paint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Marlowe House",
  description:
    "A brutalist housing slab on heavy pilotis: board-formed raw concrete, deep polychrome loggias, rear access decks, two bridged stair towers, a lit lobby, an end-wall mural and a sculpted roof terrace with chimneys and a canopy.",
};

// ---------------------------------------------------------------------------------------------------------------
// Layout constants (meters)

const EX = 33.7; // end-wall plane
const ZF = 6.6; // core front wall
const ZB = -8; // core back wall
const ZFR = 9.45; // front edge of the loggia slabs
const P = 5.6; // underside of the first floor (pilotis height)
const FH = 3.0; // storey height
const N = 11; // storeys
const T = 0.4; // slab thickness
const BAYS = 20;
const BW = 66 / BAYS;
const Y = (i: number) => P + i * FH;
const ROOF = Y(N) + T;

const fract = (x: number) => x - Math.floor(x);
const hash1 = (i: number, s = 0) => fract(Math.sin(i * 127.1 + s * 311.7) * 43758.5453);

const C = {
  grey: "#948f86",
  greyD: "#7a766d",
  offw: "#e9e2d0",
  red: "#c9452d",
  yel: "#e3a62a",
  blue: "#2e68a6",
  grn: "#3e8b5b",
  org: "#d9703a",
  wood: "#a8744a",
  woodD: "#6f4a2e",
  steel: "#6d7882",
  steelD: "#3b4046",
  pot: "#b5603a",
  leaf1: "#3f7a3c",
  leaf2: "#5f9a49",
  leaf3: "#2f5f35",
  cloth1: "#f2efe6",
  cloth2: "#4a79b5",
  cloth3: "#d8503a",
  cloth4: "#e8c240",
  dish: "#d9dadb",
  glassB: "#8fc4dc",
  soil: "#4a3a2c",
  lobby: "#6a645b",
  beacon: "#e23b2e",
  louv: "#2e3033",
  lounger: "#f1eee4",
};
const PANEL: [number, string][] = [
  [0.3, C.offw],
  [0.46, C.red],
  [0.62, C.yel],
  [0.76, C.blue],
  [0.88, C.grn],
  [1.01, C.org],
];
const pickPanel = (r: number) => PANEL.find(([t]) => r < t)![1];
const DOORS = [C.red, C.blue, C.yel, C.grn, C.woodD];

// ---------------------------------------------------------------------------------------------------------------
// Geometry helpers

const bx = (w: number, h: number, d: number, x: number, y: number, z: number) =>
  new THREE.BoxGeometry(w, h, d).translate(x, y, z);
const cy = (rt: number, rb: number, h: number, seg: number, x: number, y: number, z: number) =>
  new THREE.CylinderGeometry(rt, rb, h, seg).translate(x, y, z);
const ico = (r: number, x: number, y: number, z: number, detail = 0) =>
  new THREE.IcosahedronGeometry(r, detail).translate(x, y, z);

type Face = "+z" | "-z" | "+x" | "-x";
function pln(w: number, h: number, face: Face, x: number, y: number, z: number) {
  const g = new THREE.PlaneGeometry(w, h);
  if (face === "-z") g.rotateY(Math.PI);
  else if (face === "+x") g.rotateY(Math.PI / 2);
  else if (face === "-x") g.rotateY(-Math.PI / 2);
  return g.translate(x, y, z);
}

function merge(geos: THREE.BufferGeometry[]) {
  const g = mergeGeometries(geos.map((x) => (x.index ? x.toNonIndexed() : x)));
  if (!g) throw new Error("merge failed");
  return g;
}

// ---------------------------------------------------------------------------------------------------------------
// Paints

function concretePaint(seed: number, warm: boolean): Paint {
  const lo = rgb(warm ? "#6d675f" : "#6a6a67");
  const hi = rgb(warm ? "#b4ac9d" : "#aaa9a2");
  const dark = rgb("#2f2d2b");
  const lime = rgb("#cfcbc0");
  const moss = rgb("#55663a");
  const mud = rgb("#463e33");
  const q = new THREE.Vector3();
  return paint((p, n) => {
    let c = mix(lo, hi, smoothstep(0.3, 0.7, noise(p, 7, seed)));
    c = mix(c, lo, 0.35 * smoothstep(0.5, 0.78, noise(p, 0.45, seed + 3)));
    c = mix(c, hi, 0.2 * smoothstep(0.55, 0.8, noise(p, 1.7, seed + 6)));
    if (Math.abs(n.y) < 0.6) {
      const u = Math.abs(n.x) > Math.abs(n.z) ? p.z : p.x;
      const board = p.y / 0.45;
      const tone = hash1(Math.floor(board), seed) - 0.5;
      c = mix(c, tone > 0 ? hi : lo, Math.abs(tone) * 0.45);
      if (fract(board) < 0.14) c = mix(c, lo, 0.4);
      if (fract(u / 2.4) < 0.025) c = mix(c, dark, 0.28);
      const yy = (p.y - P) / FH;
      const under = smoothstep(0.15, 1, yy - Math.floor(yy));
      const streak = noise(q.set(u, p.y * 0.12, seed * 3.7), 0.45, seed + 2);
      c = mix(c, dark, 0.6 * smoothstep(0.55, 0.8, streak) * (0.2 + 0.8 * under));
      const efflo = noise(q.set(u * 1.3, p.y * 0.2, 9), 0.3, seed + 11);
      c = mix(c, lime, 0.35 * smoothstep(0.7, 0.85, efflo) * under);
    } else if (n.y > 0.6) {
      c = mix(c, hi, 0.2);
      c = mix(c, moss, 0.55 * smoothstep(0.58, 0.72, noise(p, 1.1, seed + 8)));
    } else {
      c = mix(c, dark, 0.38);
    }
    return mix(c, mud, 0.55 * (1 - smoothstep(0, 1.6, p.y)));
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Textures

function winSvg(o: {
  top: string;
  bot: string;
  curtain?: string;
  blind?: number;
  plants?: boolean;
  lamp?: boolean;
  frame?: string;
}) {
  const f = o.frame ?? "#302e2b";
  let s = `<svg viewBox="0 0 96 84" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${o.top}"/><stop offset="1" stop-color="${o.bot}"/></linearGradient></defs>`;
  s += `<rect width="96" height="84" fill="${f}"/>`;
  for (const x of [4, 50]) {
    s += `<rect x="${x}" y="4" width="42" height="72" fill="url(#g)"/>`;
    if (o.lamp)
      s += `<path d="M${x + 14} 76 L${x + 14} 52 Q${x + 14} 44 ${x + 21} 44 Q${x + 28} 44 ${x + 28} 52 L${x + 28} 76Z" fill="#7a3d12" opacity=".5"/><circle cx="${x + 21}" cy="30" r="5" fill="#fff6d8" opacity=".8"/>`;
    if (o.plants)
      s += `<ellipse cx="${x + 10}" cy="70" rx="9" ry="8" fill="#2f5d34"/><ellipse cx="${x + 30}" cy="72" rx="7" ry="6" fill="#3d7a3e"/>`;
    s += `<path d="M${x} 76 L${x + 26} 4 H${x + 34} L${x + 8} 76Z" fill="#fff" opacity=".16"/>`;
    s += `<rect x="${x}" y="4" width="42" height="6" fill="#000" opacity=".22"/>`;
  }
  if (o.curtain) {
    for (const x of [4, 76]) {
      s += `<rect x="${x}" y="4" width="16" height="72" fill="${o.curtain}"/>`;
      s += `<path d="M${x + 4} 4V76 M${x + 8} 4V76 M${x + 12} 4V76" stroke="#000" stroke-width="1" opacity=".22"/>`;
    }
  }
  if (o.blind) {
    for (const x of [4, 50]) {
      s += `<rect x="${x}" y="4" width="42" height="${72 * o.blind}" fill="#e8e4d8"/>`;
      for (let y = 8; y < 4 + 72 * o.blind; y += 4)
        s += `<path d="M${x} ${y}H${x + 42}" stroke="#a8a496" stroke-width="0.8"/>`;
    }
  }
  s += `<rect x="46" y="0" width="4" height="84" fill="${f}"/><rect x="43" y="36" width="2" height="10" fill="#bbb"/><rect x="51" y="36" width="2" height="10" fill="#bbb"/>`;
  s += `<rect y="76" width="96" height="8" fill="#4a4741"/><rect y="76" width="96" height="1.5" fill="#8c877d"/></svg>`;
  return s;
}

function slitSvg() {
  let s = `<svg viewBox="0 0 20 120" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#86a6b8"/><stop offset="1" stop-color="#2b4658"/></linearGradient></defs><rect width="20" height="120" fill="#2c2c2e"/>`;
  for (let i = 0; i < 3; i++) {
    const y = 2 + 40 * i;
    s += `<rect x="2" y="${y}" width="16" height="36" fill="${i === 1 ? "#f2c777" : "url(#g)"}"/>`;
    s += `<path d="M2 ${y + 34} L18 ${y + 20} M2 ${y + 20} L18 ${y + 6}" stroke="#1f1f20" stroke-width="1.6" opacity=".7"/>`;
    s += `<path d="M10 ${y}V${y + 36}" stroke="#2c2c2e" stroke-width="1.2"/>`;
  }
  return s + `</svg>`;
}

function bridgeSvg() {
  let s = `<svg viewBox="0 0 120 30" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9d0da"/><stop offset="1" stop-color="#5d7a89"/></linearGradient></defs><rect width="120" height="30" fill="#34322f"/>`;
  for (let i = 0; i < 4; i++) {
    s += `<rect x="${2 + i * 29.5}" y="3" width="27" height="24" fill="url(#g)"/>`;
    s += `<rect x="${2 + i * 29.5}" y="3" width="27" height="6" fill="#f4e6b8" opacity=".5"/>`;
    s += `<path d="M${2 + i * 29.5 + 4} 27 L${2 + i * 29.5 + 16} 3 H${2 + i * 29.5 + 22} L${2 + i * 29.5 + 10} 27Z" fill="#fff" opacity=".15"/>`;
  }
  return s + `</svg>`;
}

function shopSvg() {
  let s = `<svg viewBox="0 0 116 44" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe0a8"/><stop offset="1" stop-color="#f0a85a"/></linearGradient></defs><rect width="116" height="44" fill="#23262a"/>`;
  s += `<rect x="2" y="2" width="112" height="40" fill="url(#g)"/>`;
  s += `<rect x="2" y="28" width="112" height="14" fill="#8a5a32" opacity=".35"/>`;
  for (let i = 0; i < 8; i++) s += `<rect x="${6 + i * 3.4}" y="20" width="3" height="5" fill="#6b6256" stroke="#3b362f" stroke-width=".4"/>`;
  s += `<path d="M78 42 V32 H100 V42Z" fill="#5a3b20" opacity=".6"/>`;
  for (const x of [20, 56, 88]) s += `<circle cx="${x}" cy="12" r="3.2" fill="#fff8e0"/><path d="M${x} 2V9" stroke="#333" stroke-width=".6"/>`;
  for (let i = 0; i <= 10; i++) s += `<rect x="${1.4 + i * 11.2}" y="2" width="1.3" height="40" fill="#23262a"/>`;
  s += `<rect x="2" y="30" width="112" height="1.4" fill="#23262a"/>`;
  s += `<rect x="47" y="2" width="22" height="40" fill="#2f3337"/><rect x="49" y="4" width="8.6" height="38" fill="#ffd98f"/><rect x="58.4" y="4" width="8.6" height="38" fill="#ffd98f"/>`;
  s += `<rect x="55.5" y="20" width="1" height="8" fill="#ddd"/><rect x="59.5" y="20" width="1" height="8" fill="#ddd"/>`;
  return s + `<path d="M6 40 L30 4 H38 L14 40Z" fill="#fff" opacity=".13"/></svg>`;
}

function doorSvg() {
  return `<svg viewBox="0 0 38 84" xmlns="http://www.w3.org/2000/svg"><rect width="38" height="84" fill="#8a8a8a"/><rect x="2" y="2" width="34" height="80" fill="#e4e4e4" stroke="#555" stroke-width="2"/><rect x="7" y="8" width="24" height="30" fill="#cfcfcf" stroke="#777"/><rect x="7" y="44" width="24" height="32" fill="#cfcfcf" stroke="#777"/><circle cx="19" cy="24" r="2" fill="#333"/><rect x="13" y="56" width="12" height="3" fill="#555"/><rect x="24" y="40" width="9" height="5" fill="#fff" stroke="#333" stroke-width=".6"/><text x="28.5" y="44" font-size="4.4" text-anchor="middle" font-family="sans-serif" fill="#222">14</text><circle cx="31" cy="52" r="1.6" fill="#444"/></svg>`;
}

function signSvg() {
  return `<svg viewBox="0 0 180 14" xmlns="http://www.w3.org/2000/svg"><rect width="180" height="14" fill="#1d3442"/><rect x="1" y="1" width="178" height="12" fill="none" stroke="#e8dfc7" stroke-width=".6"/><text x="90" y="10.2" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="bold" font-size="8.6" letter-spacing="1.6" fill="#f1ead6">MARLOWE HOUSE</text></svg>`;
}

function numberSvg() {
  return `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="#c9452d"/><rect x="3" y="3" width="54" height="54" fill="none" stroke="#f1ead6" stroke-width="2"/><circle cx="30" cy="30" r="22" fill="none" stroke="#f1ead6" stroke-width="1.5"/><text x="30" y="43" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="bold" font-size="38" fill="#f1ead6">B</text></svg>`;
}

function muralSvg() {
  const ink = "#1a1613";
  let s = `<svg viewBox="0 0 48 108" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="108" fill="#e9e0c8"/>`;
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8;
    s += `<path d="M${24 + 16 * Math.cos(a)} ${24 + 16 * Math.sin(a)} L${24 + 23 * Math.cos(a)} ${24 + 23 * Math.sin(a)}" stroke="${ink}" stroke-width=".9"/>`;
  }
  s += `<circle cx="24" cy="24" r="16" fill="#d8512c" stroke="${ink}" stroke-width="1.2"/><circle cx="24" cy="24" r="11" fill="#f1b32b" stroke="${ink}" stroke-width="1"/><circle cx="24" cy="24" r="5.5" fill="#d8512c" stroke="${ink}" stroke-width="1"/>`;
  s += `<rect x="22" y="40" width="4" height="6" fill="#e3a62a" stroke="${ink}" stroke-width="1"/>`;
  s += `<polygon points="19,46 5,31 8,27 21,40" fill="#e3a62a" stroke="${ink}" stroke-width="1.1"/><polygon points="29,46 43,31 40,27 27,40" fill="#e3a62a" stroke="${ink}" stroke-width="1.1"/>`;
  s += `<circle cx="6" cy="29" r="3.2" fill="#c9452d" stroke="${ink}" stroke-width="1"/><circle cx="42" cy="29" r="3.2" fill="#c9452d" stroke="${ink}" stroke-width="1"/>`;
  s += `<rect x="19" y="44" width="10" height="22" fill="#3e8b5b" stroke="${ink}" stroke-width="1.2"/>`;
  s += `<rect x="19" y="66" width="4.6" height="20" fill="#2e68a6" stroke="${ink}" stroke-width="1.1"/><rect x="24.4" y="66" width="4.6" height="20" fill="#2e68a6" stroke="${ink}" stroke-width="1.1"/>`;
  s += `<rect x="3" y="52" width="10" height="16" fill="#c9452d" stroke="${ink}" stroke-width="1"/><rect x="3" y="68" width="10" height="6.2" fill="#e3a62a" stroke="${ink}" stroke-width="1"/><rect x="35" y="56" width="10" height="6.2" fill="#2e68a6" stroke="${ink}" stroke-width="1"/><rect x="35" y="62.2" width="10" height="10" fill="#e9e0c8" stroke="${ink}" stroke-width="1"/>`;
  s += `<path d="M5 48 Q9 44 13 48 M35 46 Q39 42 43 46" stroke="${ink}" stroke-width=".9" fill="none"/>`;
  s += `<rect x="0" y="82" width="48" height="26" fill="#24477a"/><path d="M0 82H48" stroke="${ink}" stroke-width="1.4"/>`;
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 8; c++) {
      const lit = (r * 7 + c * 3) % 5 === 0;
      s += `<rect x="${2 + c * 5.6}" y="${85 + r * 5.5}" width="4" height="3.6" fill="${lit ? "#f1b32b" : "#12233d"}"/>`;
    }
  return s + `</svg>`;
}

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "marlowe_house", paintSize: 2048 });
  const rnd = rng(2024);

  const CONC = concretePaint(3, false);
  const CONC_W = concretePaint(8, true);

  const TEX = {
    winA: svg(winSvg({ top: "#a9c4d0", bot: "#4d6572", plants: true }), { size: 192 }),
    winB: svg(winSvg({ top: "#9db8c6", bot: "#506978", curtain: "#e28a3c" }), { size: 192 }),
    winC: svg(winSvg({ top: "#6f8794", bot: "#2b3d49", blind: 0.55 }), { size: 192 }),
    winLit: svg(winSvg({ top: "#ffe3a0", bot: "#ff9f43", lamp: true, curtain: "#fff1d0" }), { size: 192 }),
    door: svg(doorSvg(), { size: 128 }),
    slit: svg(slitSvg(), { size: 256 }),
    bridge: svg(bridgeSvg(), { size: 256 }),
    shop: svg(shopSvg(), { size: 1024 }),
    sign: svg(signSvg(), { size: 1024 }),
    number: svg(numberSvg(), { size: 256 }),
    mural: svg(muralSvg(), { size: 1024 }),
  };

  // Merge buckets: flat colour and textured --------------------------------------------------------------------
  const flat = new Map<string, THREE.BufferGeometry[]>();
  const put = (color: string, g: THREE.BufferGeometry) => {
    const list = flat.get(color) ?? [];
    list.push(g);
    flat.set(color, list);
  };
  const tsets = new Map<string, { tex: THREE.Texture; tint: string; glowS: number; geos: THREE.BufferGeometry[] }>();
  const tput = (name: string, tex: THREE.Texture, g: THREE.BufferGeometry, tint = "#ffffff", glowS = 0) => {
    let s = tsets.get(name);
    if (!s) {
      s = { tex, tint, glowS, geos: [] };
      tsets.set(name, s);
    }
    s.geos.push(g);
  };

  // ===============================================================================================================
  // Structure
  b.part(new THREE.BoxGeometry(2 * EX, Y(N) - P, ZF - ZB), CONC, {
    at: [0, (P + Y(N)) / 2, (ZF + ZB) / 2],
    name: "core",
  });
  b.part(new THREE.BoxGeometry(2 * (EX + 0.1), T, ZFR - (ZB - 0.35)), CONC, {
    at: [0, Y(N) + T / 2, (ZFR + ZB - 0.35) / 2],
    name: "roofSlab",
  });
  b.part(new THREE.BoxGeometry(2 * (EX + 0.1), 1.0, 0.9), CONC, { at: [0, P - 0.5, ZFR - 0.45], name: "frontBeam" });

  for (let i = 0; i < N; i++) {
    const deck = i % 3 === 2;
    b.part(new THREE.BoxGeometry(2 * (EX + 0.1), T, ZFR - (ZF - 0.1)), CONC, {
      at: [0, Y(i) + T / 2 - 0.01, (ZFR + ZF - 0.1) / 2],
      name: `slabF${i}`,
    });
    const depth = deck ? 1.9 : 0.45;
    const zc = deck ? ZB - 0.85 : ZB - 0.125;
    b.part(new THREE.BoxGeometry(2 * (EX + 0.1), T, depth), CONC, { at: [0, Y(i) + T / 2 - 0.01, zc], name: `slabB${i}` });
    if (deck) {
      const y = Y(i) + T + 0.525;
      for (const [x0, x1] of [
        [-33.6, -21.2],
        [-18.4, 18.4],
        [21.2, 33.6],
      ])
        put(C.grey, bx(x1 - x0, 1.05, 0.16, (x0 + x1) / 2, y, ZB - 1.72));
      put(C.greyD, bx(67.2, 0.06, 0.26, 0, Y(i) + T + 1.08, ZB - 1.72));
    }
  }

  // Loggia dividers: full-height concrete fins
  for (let j = 0; j <= BAYS; j++) {
    const end = j === 0 || j === BAYS;
    const w = end ? 0.8 : 0.45;
    let x = -33 + j * BW;
    if (j === 0) x -= 0.3;
    if (j === BAYS) x += 0.3;
    b.part(new THREE.BoxGeometry(w, Y(N) - P, 2.9), CONC, { at: [x, (P + Y(N)) / 2, (ZF - 0.1 + 9.4) / 2], name: `fin${j}` });
  }

  // Pilotis
  for (let k = 0; k <= 10; k++) {
    const x = -33 + 6.6 * k;
    for (const z of [5.0, -5.0]) {
      if (z > 0 && k === 5) continue;
      b.frustumBox([x, 0, z], [x, P + 0.02, z], [1.0, 1.7], [1.7, 2.4], { color: CONC, name: `pier${k}_${z > 0 ? "f" : "b"}` });
    }
  }

  // Lobby, steps and sign
  put(C.lobby, bx(11.6, 0.2, 7.8, 0, 0.1, 3.8));
  for (let i = 1; i <= 3; i++) put(C.grey, bx(9, 0.15 * (4 - i), 0.38, 0, (0.15 * (4 - i)) / 2, 7.7 + i * 0.38));
  tput("shop", TEX.shop, pln(11.6, 4.4, "+z", 0, 2.4, 7.6), "#ffffff", 0.7);
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.3, 4.4, 1.3), CONC, { at: [s * 5.95, 2.4, 6.95], name: "lobbyWall" });
  tput("sign", TEX.sign, pln(9, 0.7, "+z", 0, P - 0.5, ZFR + 0.02));

  // ===============================================================================================================
  // Front loggias
  for (let k = 0; k < N; k++) {
    const fl = Y(k) + T;
    const ch = FH - T;
    for (let j = 0; j < BAYS; j++) {
      const x = -33 + (j + 0.5) * BW;
      const pc = pickPanel(rnd());
      put(pc, bx(BW - 0.45, ch, 0.2, x, fl + ch / 2, ZF + 0.05));
      const wr = rnd();
      const wn = wr < 0.42 ? "winA" : wr < 0.68 ? "winB" : wr < 0.88 ? "winC" : "winLit";
      tput(wn, TEX[wn], pln(2.4, 2.1, "+z", x, fl + 1.4, ZF + 0.17), "#ffffff", wn === "winLit" ? 0.9 : 0);

      const pr = rnd();
      put(pr < 0.7 ? C.grey : pr < 0.85 ? C.offw : pc, bx(BW - 0.45, 1.0, 0.18, x, fl + 0.5, 9.3));
      put(C.greyD, bx(BW - 0.4, 0.07, 0.3, x, fl + 1.035, 9.3));

      const e = rnd();
      if (e < 0.14) {
        for (let i = 0; i < 7; i++) put(C.wood, bx(0.05, 1.4, 0.3, x - 1.2 + i * 0.4, fl + 1.8, 9.1));
        put(C.woodD, bx(2.85, 0.06, 0.34, x, fl + 2.5, 9.1));
        put(C.woodD, bx(2.85, 0.06, 0.34, x, fl + 1.1, 9.1));
      } else if (e < 0.42) {
        const px = x + (rnd() - 0.5) * 1.4;
        put(C.pot, cy(0.2, 0.15, 0.4, 6, px, fl + 0.2, 8.6));
        put([C.leaf1, C.leaf2, C.leaf3][Math.floor(rnd() * 3)], ico(0.38 + rnd() * 0.12, px, fl + 0.95, 8.6));
      } else if (e < 0.58) {
        put(C.steelD, bx(2.5, 0.025, 0.025, x, fl + 2.15, 8.4));
        for (let i = 0; i < 4; i++)
          put([C.cloth1, C.cloth2, C.cloth3, C.cloth4][Math.floor(rnd() * 4)], bx(0.34, 0.5, 0.02, x - 0.9 + i * 0.6, fl + 1.88, 8.4));
      } else if (e < 0.66) {
        put(C.steelD, bx(0.03, 0.4, 0.03, x + 0.9, fl + 1.25, 9.0));
        put(C.dish, new THREE.SphereGeometry(0.26, 8, 3, 0, Math.PI * 2, 0, 1.0).rotateX(-Math.PI / 2).translate(x + 0.9, fl + 1.5, 9.0));
      }
    }
  }

  // ===============================================================================================================
  // Back facade, bridges, towers
  for (let k = 0; k < N; k++) {
    const deck = k % 3 === 2;
    const fl = Y(k) + T;
    for (let j = 0; j < BAYS; j++) {
      const x = -33 + (j + 0.5) * BW;
      if (deck && Math.abs(Math.abs(x) - 19.8) < 1.7) continue;
      const wr = rnd();
      const wn = wr < 0.5 ? "winA" : wr < 0.75 ? "winB" : wr < 0.9 ? "winC" : "winLit";
      const lit = wn === "winLit" ? 0.9 : 0;
      if (deck) {
        tput(wn, TEX[wn], pln(1.4, 1.22, "-z", x - 0.8, fl + 1.5, ZB - 0.02), "#ffffff", lit);
        const dc = DOORS[Math.floor(rnd() * DOORS.length)];
        tput("door" + dc, TEX.door, pln(0.95, 2.1, "-z", x + 0.9, fl + 1.05, ZB - 0.02), dc);
      } else {
        tput(wn, TEX[wn], pln(1.8, 1.58, "-z", x, fl + 1.5, ZB - 0.02), "#ffffff", lit);
      }
    }
  }

  const TW = 6.4;
  const TD = 6.0;
  const TH = 44;
  const TCZ = -17.8;
  const TFRONT = TCZ + TD / 2; // -14.8
  for (const [ti, tx] of [-19.8, 19.8].entries()) {
    for (const k of [2, 5, 8]) {
      const zc = (-9.0 + (TFRONT - 0.1)) / 2;
      const len = Math.abs(-9.0 - (TFRONT - 0.1));
      put("#8a877e", bx(2.4, FH - 0.02, len, tx, Y(k) + FH / 2, zc));
      put(C.greyD, bx(2.8, 0.25, len, tx, Y(k + 1) - 0.14, zc));
      put(C.greyD, bx(2.8, 0.25, len, tx, Y(k) + 0.1, zc));
      for (const s of [1, -1]) tput("bridge", TEX.bridge, pln(4.2, 1.05, s > 0 ? "+x" : "-x", tx + s * 1.22, Y(k) + 1.7, -12.2));
    }
    b.part(new THREE.BoxGeometry(TW, TH, TD), CONC_W, { at: [tx, TH / 2, TCZ], name: `tower${ti}` });
    for (const sx of [1, -1])
      for (const sz of [1, -1])
        b.part(new THREE.BoxGeometry(0.8, TH, 0.8), CONC_W, {
          at: [tx + (sx * TW) / 2, TH / 2, TCZ + (sz * TD) / 2],
          name: "pilaster",
        });
    for (let i = 0; i < 7; i++) {
      const y = 4.5 + 6 * i;
      for (const dx of [-2.0, 2.0]) tput("slit", TEX.slit, pln(1.0, 6, "+z", tx + dx, y, TFRONT + 0.02));
      for (const dx of [-1.3, 1.3]) tput("slit", TEX.slit, pln(1.0, 6, "-z", tx + dx, y, TCZ - TD / 2 - 0.02));
      tput("slit", TEX.slit, pln(1.0, 6, "+x", tx + TW / 2 + 0.02, y, TCZ));
      tput("slit", TEX.slit, pln(1.0, 6, "-x", tx - TW / 2 - 0.02, y, TCZ));
    }
    put(ti === 0 ? C.red : C.blue, bx(0.9, 34, 0.12, tx, 22, TCZ - TD / 2 - 0.06));
    put(ti === 0 ? C.yel : C.org, bx(0.9, 34, 0.12, tx + (ti === 0 ? 1 : -1) * 3.26, 22, TCZ));
    b.part(new THREE.BoxGeometry(TW + 1.0, 1.0, TD + 1.0), CONC_W, { at: [tx, TH + 0.5, TCZ], name: "towerCap" });
    b.part(new THREE.BoxGeometry(3.4, 2.4, 3.4), CONC_W, { at: [tx, TH + 2.2, TCZ], name: "liftRoom" });
    for (let i = 0; i < 6; i++) {
      put(C.louv, bx(2.4, 0.09, 0.05, tx, TH + 1.6 + i * 0.25, TCZ + 1.72));
      put(C.louv, bx(2.4, 0.09, 0.05, tx, TH + 1.6 + i * 0.25, TCZ - 1.72));
    }
    put(C.steel, cy(0.06, 0.07, 5.5, 6, tx, TH + 3.4 + 2.75, TCZ));
    put(C.steel, bx(1.8, 0.05, 0.05, tx, TH + 7.6, TCZ));
    put(C.steel, bx(1.2, 0.05, 0.05, tx, TH + 8.2, TCZ));
    glow(b.part(new THREE.SphereGeometry(0.16, 6, 4), C.beacon, { at: [tx, TH + 9.0, TCZ], name: "beacon" }), 1.6);
    // tower foot door
    tput("door" + C.red, TEX.door, pln(0.95, 2.1, "+x", tx + (tx > 0 ? -TW / 2 - 0.02 : TW / 2 + 0.02) * -1, 1.05, TCZ + 1.0), C.red);
  }

  // ===============================================================================================================
  // End walls
  tput("mural", TEX.mural, pln(12, 27, "+x", EX + 0.02, 20.9, -0.5));
  tput("number", TEX.number, pln(6, 6, "-x", -(EX + 0.02), 29, 2));
  for (let i = 0; i < 5; i++) tput("slit", TEX.slit, pln(1.0, 6, "-x", -(EX + 0.02), P + 4 + 6 * i, -4));
  for (let i = 0; i < 5; i++) tput("slit", TEX.slit, pln(1.0, 6, "-x", -(EX + 0.02), P + 4 + 6 * i, -2.4));

  // ===============================================================================================================
  // Roof terrace
  b.part(new THREE.BoxGeometry(2 * (EX + 0.1), 1.1, 0.25), CONC, { at: [0, ROOF + 0.55, ZFR - 0.125], name: "parapetF" });
  b.part(new THREE.BoxGeometry(2 * (EX + 0.1), 1.1, 0.3), CONC, { at: [0, ROOF + 0.55, ZB - 0.2], name: "parapetB" });
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.3, 1.1, ZFR - (ZB - 0.35)), CONC, {
      at: [s * (EX - 0.05), ROOF + 0.55, (ZFR + ZB - 0.35) / 2],
      name: "parapetEnd",
    });
  for (let i = 0; i < 8; i++) put(C.greyD, bx(0.4, 0.4, 1.1, -29.5 + i * 8.4, ROOF - 0.2, ZFR + 0.45));

  // Pavilion
  b.part(new THREE.BoxGeometry(14, 3.6, 7.4), CONC_W, { at: [-21, ROOF + 1.8, 0.5], name: "pavilion" });
  b.part(new THREE.BoxGeometry(15, 0.5, 8.4), CONC, { at: [-21, ROOF + 3.85, 0.5], name: "pavilionRoof" });
  for (const dx of [-4.7, 0, 4.7]) tput("bridge", TEX.bridge, pln(4.2, 1.2, "+z", -21 + dx, ROOF + 1.9, 4.22));
  put(C.louv, bx(1.6, 2.2, 0.06, -28.01, ROOF + 1.2, 0.5));
  // Ramp up to the pavilion roof
  b.extrude(
    [
      [0, 0],
      [-8, 0],
      [-8, 3.6],
      [0, 0.15],
    ],
    { at: [-6, ROOF, 2.2], x: [1, 0, 0], y: [0, 1, 0], thickness: 2.4, color: CONC, name: "ramp" },
  );
  // Sculpted canopy
  for (const cx of [-2, 6])
    for (const cz of [0.6, 4.4]) put(C.grey, bx(0.35, 2.6, 0.35, cx, ROOF + 1.3, cz));
  b.extrude(
    [
      [0, 0, "sharp"],
      [2.5, 0.35],
      [5, 0.7],
      [7.5, 0.35],
      [10, 0, "sharp"],
      [10, 0.3, "sharp"],
      [7.5, 0.75],
      [5, 1.15],
      [2.5, 0.8],
      [0, 0.3, "sharp"],
    ],
    {
      at: [-3.5, ROOF + 2.6, 2.5],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 5.4,
      smoothing: 1,
      color: paint((_p, n) => (n.y < -0.4 ? C.org : CONC)),
      name: "canopy",
    },
  );
  // Chimneys
  [
    [12, 1.0],
    [16, 1.18],
    [20, 0.86],
  ].forEach(([x, f], i) => {
    const prof: [number, number][] = [
      [0, 0],
      [1.0, 0],
      [1.0, 0.5],
      [0.65, 0.7],
      [0.65, 4.0],
      [1.05, 4.4],
      [1.05, 4.9],
      [0.75, 4.9],
      [0.75, 4.7],
      [0, 4.7],
    ];
    b.lathe(
      prof.map(([r, h]) => [r * f, h * f] as [number, number]),
      { at: [x, ROOF, -3], segments: 8, color: CONC, name: `chimney${i}` },
    );
  });
  // Machine room + water tank
  b.part(new THREE.BoxGeometry(6, 2.6, 5), CONC_W, { at: [28, ROOF + 1.3, -3], name: "machineRoom" });
  for (let i = 0; i < 7; i++) put(C.louv, bx(3.2, 0.1, 0.05, 28, ROOF + 0.8 + i * 0.22, -0.48));
  for (const dx of [-1.2, 1.2])
    for (const dz of [-1.2, 1.2]) put(C.steelD, bx(0.12, 0.8, 0.12, 28 + dx, ROOF + 3.0, -3 + dz));
  put(C.steel, cy(1.5, 1.5, 2.4, 10, 28, ROOF + 4.6, -3));
  put(C.steelD, cy(1.55, 1.55, 0.1, 10, 28, ROOF + 4.0, -3));
  put(C.steelD, cy(1.55, 1.55, 0.1, 10, 28, ROOF + 5.2, -3));
  // Pergola with loungers
  for (const px of [11, 19])
    for (const pz of [3.5, 7]) put(C.wood, bx(0.2, 2.5, 0.2, px, ROOF + 1.25, pz));
  for (const pz of [3.5, 7]) put(C.woodD, bx(8.8, 0.18, 0.24, 15, ROOF + 2.55, pz));
  for (let i = 0; i < 12; i++) put(C.wood, bx(0.1, 0.1, 3.9, 11 + i * 0.73, ROOF + 2.7, 5.25));
  for (const lx of [12.5, 15, 17.5]) {
    put(C.lounger, bx(0.7, 0.14, 1.9, lx, ROOF + 0.3, 5.2));
    put(C.lounger, bx(0.7, 0.5, 0.1, lx, ROOF + 0.6, 4.3).rotateX(0));
  }
  // Planters, shrubs, trees
  [-30, -22, -4, 4, 24].forEach((x, i) => {
    put(C.greyD, bx(4, 0.7, 1.3, x, ROOF + 0.35, 7.7));
    b.part(new THREE.BoxGeometry(3.7, 0.1, 1.0), mottle("#3e6b34", "#6f9b46", { size: 0.5, seed: 2 + i }), {
      at: [x, ROOF + 0.72, 7.7],
      name: "planterTop",
    });
    for (let s = 0; s < 3; s++) put([C.leaf1, C.leaf2, C.leaf3][(i + s) % 3], ico(0.42 + 0.1 * ((i + s) % 2), x - 1.2 + s * 1.2, ROOF + 1.05, 7.7));
  });
  for (const tx of [-32, 31.5]) {
    put(C.woodD, cy(0.14, 0.18, 2.2, 6, tx, ROOF + 1.1, 7.4));
    put(C.leaf2, ico(1.3, tx, ROOF + 3.0, 7.4, 1));
    put(C.leaf1, ico(0.9, tx + 0.6, ROOF + 3.8, 7.2, 1));
  }
  // Skylights
  for (const sx of [-10, -4, 2]) tput("skylight", TEX.winA, new THREE.BufferGeometry(), "#fff"); // placeholder removed below
  tsets.delete("skylight");
  const sky: THREE.BufferGeometry[] = [];
  for (const sx of [-10, -4, 2]) sky.push(new THREE.ConeGeometry(0.95, 0.8, 4).rotateY(Math.PI / 4).translate(sx, ROOF + 0.4, -4.8));
  glow(b.part(merge(sky), C.glassB, { at: [0, 0, 0], name: "skylights" }), 0.5);
  // Mast on the pavilion
  put(C.steel, cy(0.07, 0.09, 8, 6, -26, ROOF + 4.1 + 3.5, 0));
  for (let i = 0; i < 3; i++) put(C.steel, bx(2.2 - i * 0.5, 0.05, 0.05, -26, ROOF + 8.6 + i * 1.4, 0));
  glow(b.part(new THREE.SphereGeometry(0.17, 6, 4), C.beacon, { at: [-26, ROOF + 11.8, 0], name: "mastBeacon" }), 1.6);
  // Roof railing along the pavilion terrace
  for (let i = 0; i <= 14; i++) put(C.steelD, bx(0.05, 1.0, 0.05, -28 + i, ROOF + 4.6, 4.4));
  put(C.steelD, bx(14, 0.05, 0.05, -21, ROOF + 5.1, 4.4));

  // ===============================================================================================================
  // Flush merged buckets
  for (const [color, geos] of flat) b.part(merge(geos), color, { at: [0, 0, 0], name: `flat${color}` });
  for (const [name, s] of tsets) {
    const part = b.part(merge(s.geos), s.tint, { at: [0, 0, 0], texture: s.tex, name: `tex_${name}` });
    if (s.glowS) glow(part, s.glowS);
  }

  return b.root;
}
