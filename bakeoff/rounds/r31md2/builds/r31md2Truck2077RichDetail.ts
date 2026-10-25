import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, paint, mix, noise, resolve, mottle, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "TX-77 Warhauler",
  description:
    "Futuristic militarized 8x8 heavy truck from 2077: cab-over armoured cab, plated camo cargo module, roof missile pod, remote weapon station, radar, drone, neon underglow. Low-poly cyberpunk.",
};

type V = [number, number, number];
const PI = Math.PI;
const DEG = PI / 180;

// ---------------------------------------------------------------- palette
const STEEL = "#4a525c", DSTEEL = "#23282e", BLACK = "#0d0f12", TIRE = "#17191d", TREAD = "#0b0c0e";
const RIM = "#737c88", RIMD = "#2b3138", BRASS = "#c79a2e", CYAN = "#19e8ff", MAG = "#ff2bd6";
const AMBER = "#ffb21a", RED = "#ff2a2a", WHITE = "#e8f6ff", HAZ = "#f2b705", GLASS = "#0a1c26";
const OLIVE = "#2e3b36", TAN = "#7b6a4c", ORANGE = "#e8561a", GREEN = "#7dff6a", MIL = "#3a4a3f";

// ---------------------------------------------------------------- paints
const CAMO = paint((p, n) => {
  const a = noise(p, 0.9, 11);
  const c = noise(p, 0.3, 5);
  let col: any = a > 0.57 ? "#34463f" : a < 0.43 ? "#141b20" : "#222e32";
  if (c > 0.68) col = mix(col, "#46563f", 0.6);
  if (n.y > 0.7) col = mix(col, "#7fa0a8", 0.12);
  const mud = Math.max(0, Math.min(1, (1.7 - p.y) / 1.1)) * noise(p, 0.25, 9);
  col = mix(col, "#4d4235", Math.min(1, mud * 1.3));
  return col;
});
const plated = (base: any, cu = 0.6, cv = 0.45) =>
  paint((p, n) => {
    const col = resolve(base, p, n);
    const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
    const [u, v] = ax >= ay && ax >= az ? [p.z, p.y] : ay >= az ? [p.x, p.z] : [p.x, p.y];
    const du = (((u / cu) % 1) + 1) % 1 * cu;
    const dv = (((v / cv) % 1) + 1) % 1 * cv;
    if (du < 0.008 || dv < 0.008) return mix(col, "#05080a", 0.85);
    if (du < 0.022 || dv < 0.022) return mix(col, "#9fb8c0", 0.16);
    const h = Math.hypot;
    if (
      h(du - 0.045, dv - 0.045) < 0.011 ||
      h(cu - du - 0.045, dv - 0.045) < 0.011 ||
      h(du - 0.045, cv - dv - 0.045) < 0.011 ||
      h(cu - du - 0.045, cv - dv - 0.045) < 0.011
    )
      return mix(col, "#cfe3e8", 0.5);
    return col;
  });
const HULL = plated(CAMO, 0.6, 0.45);
const DARK = mottle("#2a2f36", "#3c434d", { size: 0.15, seed: 4 });
const UNDER = mottle("#101316", "#222830", { size: 0.1, seed: 8 });

// ---------------------------------------------------------------- textures
const hazardSvg = (w: number, h: number) => {
  let s = "";
  for (let x = -h; x < w + h; x += 16) s += `<polygon points="${x},${h} ${x + 8},${h} ${x + 8 + h},0 ${x + h},0" fill="#0b0b0b"/>`;
  return svg(`<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><rect width="${w}" height="${h}" fill="#f2b705"/>${s}<rect width="${w}" height="${h}" fill="none" stroke="#111" stroke-width="2"/></svg>`, { size: 256 });
};
const HAZARD = hazardSvg(128, 24);
const WIND = svg(
  `<svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#17394a"/><stop offset="0.5" stop-color="#07131b"/><stop offset="1" stop-color="#0d2a38"/></linearGradient></defs>
  <rect width="200" height="90" rx="6" fill="#06090c"/><rect x="4" y="4" width="192" height="82" rx="4" fill="url(#g)"/>
  <path d="M100 4V86" stroke="#06090c" stroke-width="4"/>
  <polygon points="20,4 60,4 38,86 4,86" fill="#7fe9ff" opacity="0.12"/><polygon points="120,4 138,4 116,86 100,86" fill="#7fe9ff" opacity="0.1"/>
  <path d="M30 72 Q100 50 170 72" stroke="#19e8ff" stroke-width="1.6" fill="none" opacity="0.75"/>
  <path d="M60 80 L100 56 L140 80" stroke="#19e8ff" stroke-width="1" fill="none" opacity="0.5"/>
  <text x="112" y="22" font-size="7" fill="#19e8ff" font-family="monospace">SPD 087  HDG 214</text>
  <text x="112" y="31" font-size="6" fill="#ff2bd6" font-family="monospace">THREAT: NONE</text>
  <path d="M14 84 L92 52 M186 84 L108 52" stroke="#111" stroke-width="3"/></svg>`,
  { size: 512 },
);
const FACE = svg(
  `<svg viewBox="0 0 220 70" xmlns="http://www.w3.org/2000/svg">
  <rect width="220" height="70" fill="#1a2025"/><rect x="2" y="2" width="216" height="66" fill="none" stroke="#3b444e" stroke-width="2"/>
  <polygon points="10,8 80,12 80,36 10,34" fill="#07090b" stroke="#6b7682" stroke-width="2"/>
  <polygon points="210,8 140,12 140,36 210,34" fill="#07090b" stroke="#6b7682" stroke-width="2"/>
  <rect x="88" y="6" width="44" height="40" fill="#07090b" stroke="#6b7682" stroke-width="2"/>
  ${Array.from({ length: 8 }, (_, i) => `<rect x="90" y="${9 + i * 4.8}" width="40" height="2.4" fill="#3a434d"/>`).join("")}
  <polygon points="14,44 206,44 196,66 24,66" fill="#0b0e11" stroke="#56606b" stroke-width="1.5"/>
  ${Array.from({ length: 11 }, (_, i) => `<polygon points="${30 + i * 15},47 ${38 + i * 15},47 ${34 + i * 15},63 ${27 + i * 15},63" fill="#f2b705" opacity="0.55"/>`).join("")}
  <path d="M10 40 H80 M140 40 H210" stroke="#19e8ff" stroke-width="1.5"/>
  <polygon points="110,48 118,52 118,60 110,64 102,60 102,52" fill="#0d1418" stroke="#ffb21a" stroke-width="1.5"/>
  </svg>`,
  { size: 512 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <polygon points="50,3 93,26 93,74 50,97 7,74 7,26" fill="#0b1013" stroke="#ffb21a" stroke-width="4"/>
  <polygon points="50,12 84,30 84,70 50,88 16,70 16,30" fill="#16323a" stroke="#19e8ff" stroke-width="1.5"/>
  <path d="M50 22 L74 40 L62 40 L50 32 L38 40 L26 40 Z" fill="#ffb21a"/>
  <path d="M50 36 L66 50 L50 74 L34 50 Z" fill="#0b1013" stroke="#ffb21a" stroke-width="2"/>
  <circle cx="44" cy="52" r="3" fill="#19e8ff"/><circle cx="56" cy="52" r="3" fill="#19e8ff"/>
  <text x="50" y="86" font-size="11" text-anchor="middle" font-family="sans-serif" font-weight="bold" fill="#ffb21a">77</text></svg>`,
  { size: 256 },
);
const STENCIL = svg(
  `<svg viewBox="0 0 256 64" xmlns="http://www.w3.org/2000/svg">
  <text x="6" y="34" font-size="30" font-weight="bold" font-family="monospace" fill="#0a0c0d" stroke="#0a0c0d" stroke-width="3">TX-77 WARHAULER</text>
  <text x="6" y="34" font-size="30" font-weight="bold" font-family="monospace" fill="#cdd8cf" opacity="0.88">TX-77 WARHAULER</text>
  <text x="6" y="52" font-size="11" font-family="monospace" fill="#cdd8cf" opacity="0.8">8TH ORBITAL LOGISTICS // HLG-2077-04</text>
  ${Array.from({ length: 22 }, (_, i) => `<rect x="${176 + i * 3.6}" y="40" width="${i % 3 === 0 ? 2.6 : 1.2}" height="16" fill="#cdd8cf" opacity="0.8"/>`).join("")}
  <path d="M2 60 H254" stroke="#ffb21a" stroke-width="2"/></svg>`,
  { size: 1024 },
);
const REAR = svg(
  `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="150" fill="#1d2a26"/><rect x="3" y="3" width="194" height="144" fill="none" stroke="#05080a" stroke-width="3"/>
  <path d="M100 3V147" stroke="#05080a" stroke-width="4"/><path d="M3 75H197" stroke="#05080a" stroke-width="2"/>
  <rect x="10" y="10" width="80" height="10" fill="#f2b705"/><rect x="110" y="10" width="80" height="10" fill="#f2b705"/>
  ${Array.from({ length: 10 }, (_, i) => `<polygon points="${10 + i * 8},20 ${14 + i * 8},20 ${18 + i * 8},10 ${14 + i * 8},10" fill="#0b0b0b"/><polygon points="${110 + i * 8},20 ${114 + i * 8},20 ${118 + i * 8},10 ${114 + i * 8},10" fill="#0b0b0b"/>`).join("")}
  <text x="100" y="62" font-size="13" text-anchor="middle" font-weight="bold" font-family="monospace" fill="#f2b705">CAUTION</text>
  <text x="100" y="92" font-size="9" text-anchor="middle" font-family="monospace" fill="#cdd8cf">ORDNANCE // KEEP CLEAR</text>
  <circle cx="45" cy="115" r="14" fill="none" stroke="#ff2a2a" stroke-width="3"/><path d="M35 125 L55 105" stroke="#ff2a2a" stroke-width="3"/>
  <rect x="120" y="105" width="60" height="26" fill="#0b1013" stroke="#19e8ff" stroke-width="1.5"/>
  <text x="150" y="122" font-size="10" text-anchor="middle" font-family="monospace" fill="#19e8ff">LOCK 7-A</text>
  <circle cx="14" cy="75" r="4" fill="#ffb21a"/><circle cx="186" cy="75" r="4" fill="#ffb21a"/></svg>`,
  { size: 512 },
);
const PODFACE = svg(
  `<svg viewBox="0 0 128 48" xmlns="http://www.w3.org/2000/svg"><rect width="128" height="48" fill="#232b28"/>
  ${[0, 1].flatMap((r) => Array.from({ length: 5 }, (_, i) => `<circle cx="${14 + i * 25}" cy="${13 + r * 22}" r="9" fill="#05080a" stroke="#6b7682" stroke-width="2"/><circle cx="${14 + i * 25}" cy="${13 + r * 22}" r="5" fill="#8a2a1a"/><circle cx="${14 + i * 25}" cy="${13 + r * 22}" r="2" fill="#ff7a2a"/>`)).join("")}
  <rect x="0" y="0" width="128" height="48" fill="none" stroke="#f2b705" stroke-width="3"/></svg>`,
  { size: 512 },
);
const SCREEN = svg(
  `<svg viewBox="0 0 128 72" xmlns="http://www.w3.org/2000/svg"><rect width="128" height="72" fill="#031418"/>
  <rect x="2" y="2" width="124" height="68" fill="none" stroke="#19e8ff" stroke-width="2"/>
  ${Array.from({ length: 10 }, (_, i) => `<rect x="${8 + i * 8}" y="${60 - ((i * 37) % 30) - 8}" width="5" height="${((i * 37) % 30) + 8}" fill="#19e8ff" opacity="0.8"/>`).join("")}
  <text x="8" y="14" font-size="9" font-family="monospace" fill="#7dff6a">NAV 77.2 // LINK OK</text>
  <path d="M70 40 L90 28 L110 44 L122 30" stroke="#ff2bd6" stroke-width="2" fill="none"/></svg>`,
  { size: 256 },
);
const PLATE = svg(
  `<svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="32" rx="3" fill="#e9eee6" stroke="#111" stroke-width="2"/>
  <rect x="3" y="3" width="58" height="6" fill="#1d4ed8"/><text x="32" y="26" font-size="15" text-anchor="middle" font-weight="bold" font-family="monospace" fill="#111">NX-2077</text></svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------- builder + helpers
export default function build() {
  const b = createBuilder({ name: "tx77", paintSize: 2048 });
  const P = (g: THREE.BufferGeometry, c: any, at: V, o: any = {}) => b.part(g, c, { at, ...o });
  const box = (s: V, c: any, at: V, o: any = {}) => P(new THREE.BoxGeometry(s[0], s[1], s[2]), c, at, o);
  const taper = (rt: number, rb: number, h: number, seg: number, c: any, at: V, dir: V = [0, 1, 0], o: any = {}) =>
    P(new THREE.CylinderGeometry(rt, rb, h, seg), c, at, { dir, flat: true, ...o });
  const cyl = (r: number, h: number, seg: number, c: any, at: V, dir: V = [0, 1, 0], o: any = {}) => taper(r, r, h, seg, c, at, dir, o);
  const sph = (r: number, c: any, at: V, o: any = {}) => P(new THREE.SphereGeometry(r, 8, 6), c, at, { flat: true, ...o });
  const decal = (tex: any, w: number, h: number, at: V, dir: V, o: any = {}) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, ...o });
  const mg = (g: THREE.BufferGeometry[]) => mergeGeometries(g)!;
  const bolts = (axis: "x" | "y" | "z", pts: V[], r: number, h: number, c: any) => {
    const gs = pts.map((p) => {
      const g = new THREE.CylinderGeometry(r, r, h, 6);
      if (axis === "x") g.rotateZ(PI / 2);
      if (axis === "z") g.rotateX(PI / 2);
      g.translate(p[0], p[1], p[2]);
      return g;
    });
    return P(mg(gs), c, [0, 0, 0]);
  };
  const slatsZ = (n: number, size: V, gap: number, c: any, at: V) => {
    const gs = Array.from({ length: n }, (_, i) => new THREE.BoxGeometry(...size).translate(0, 0, (i - (n - 1) / 2) * gap));
    return P(mg(gs), c, at);
  };
  const slatsY = (n: number, size: V, gap: number, c: any, at: V) => {
    const gs = Array.from({ length: n }, (_, i) => new THREE.BoxGeometry(...size).translate(0, (i - (n - 1) / 2) * gap, 0));
    return P(mg(gs), c, at);
  };
  const side = [1, -1];

  // ---------------------------------------------------------------- wheels
  const R = 0.675, TW = 0.46, half = TW / 2;
  const AX = [2.75, 1.45, -1.85, -3.15];
  const WX = 1.1;
  function wheel(x: number, z: number, neon: string) {
    const at: V = [x, R, z];
    const o = { dir: [1, 0, 0] as V };
    P(new THREE.CylinderGeometry(0.6, 0.6, TW, 16), TIRE, at, o);
    const tr: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 16; i++)
      for (const sd of [-1, 1]) {
        const g = new THREE.BoxGeometry(0.15, TW * 0.44, 0.1);
        g.translate(0, sd * TW * 0.25, 0.62);
        g.rotateY((i / 16) * 2 * PI + sd * 0.14);
        tr.push(g);
      }
    P(mg(tr), TREAD, at, o);
    const rim: THREE.BufferGeometry[] = [], dish: THREE.BufferGeometry[] = [], lugs: THREE.BufferGeometry[] = [], neonG: THREE.BufferGeometry[] = [], side_: THREE.BufferGeometry[] = [];
    for (const sd of [-1, 1]) {
      rim.push(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 12).translate(0, sd * (half + 0.005), 0));
      rim.push(new THREE.TorusGeometry(0.4, 0.03, 4, 12).rotateX(PI / 2).translate(0, sd * (half + 0.03), 0));
      side_.push(new THREE.TorusGeometry(0.5, 0.014, 4, 16).rotateX(PI / 2).translate(0, sd * (half + 0.002), 0));
      dish.push(new THREE.CylinderGeometry(0.29, 0.29, 0.05, 12).translate(0, sd * (half + 0.035), 0));
      for (let i = 0; i < 6; i++) {
        const g = new THREE.BoxGeometry(0.07, 0.03, 0.2).translate(0, 0, 0.2);
        g.rotateY((i * PI) / 3);
        g.translate(0, sd * (half + 0.065), 0);
        rim.push(g);
      }
      dish.push(new THREE.CylinderGeometry(0.11, 0.13, 0.07, 8).translate(0, sd * (half + 0.075), 0));
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * 2 * PI;
        lugs.push(new THREE.CylinderGeometry(0.026, 0.026, 0.05, 6).translate(Math.sin(a) * 0.18, sd * (half + 0.1), Math.cos(a) * 0.18));
      }
      neonG.push(new THREE.TorusGeometry(0.34, 0.012, 4, 20).rotateX(PI / 2).translate(0, sd * (half + 0.045), 0));
    }
    P(mg(side_), "#3a3f46", at, o);
    P(mg(rim), RIM, at, o);
    P(mg(dish), RIMD, at, o);
    P(mg(lugs), BRASS, at, o);
    glow(P(mg(neonG), neon, at, o), 1.6);
  }
  const archOut: [number, number][] = [];
  for (let a = 0; a <= 180; a += 30) archOut.push([0.86 * Math.cos(a * DEG), 0.86 * Math.sin(a * DEG)]);
  for (let a = 180; a >= 0; a -= 30) archOut.push([0.77 * Math.cos(a * DEG), 0.77 * Math.sin(a * DEG)]);
  AX.forEach((z, i) => {
    for (const s of side) {
      wheel(s * WX, z, i < 2 ? CYAN : MAG);
      b.extrude(archOut, { at: [s * (WX + 0.04), R, z], x: [0, 0, 1], thickness: 0.6, bevel: 0.015, color: HULL });
      // mud flap
      box([0.5, 0.45, 0.03], BLACK, [s * (WX + 0.05), 0.42, z - 0.88]);
      box([0.5, 0.06, 0.035], HAZ, [s * (WX + 0.05), 0.2, z - 0.88]);
      // axle stub & hub bolts
      cyl(0.09, 0.4, 8, DSTEEL, [s * 0.75, R, z], [1, 0, 0]);
    }
    // axle beam, differential, air springs
    cyl(0.085, 1.7, 8, DSTEEL, [0, R, z], [1, 0, 0]);
    sph(0.27, DARK, [0, R, z], { scale: [1, 0.9, 1.1] });
    cyl(0.1, 0.1, 8, "#c0c8d0", [0, R, z + 0.28], [0, 0, 1]);
    for (const s of side) {
      cyl(0.13, 0.32, 8, BLACK, [s * 0.72, 0.9, z]);
      box([0.5, 0.05, 0.1], STEEL, [s * 0.72, 0.78, z]);
    }
  });

  // ---------------------------------------------------------------- chassis
  for (const s of side) {
    box([0.2, 0.32, 8.4], DSTEEL, [s * 0.55, 1.0, -0.1]);
    box([0.04, 0.2, 8.4], STEEL, [s * 0.66, 1.0, -0.1]);
    bolts("x", Array.from({ length: 16 }, (_, i) => [s * 0.68, 1.0, -4.1 + i * 0.52] as V), 0.022, 0.03, "#aab4be");
    // underglow strip
    glow(box([0.04, 0.03, 7.6], MAG, [s * 0.86, 1.16, -0.1]), 1.8);
  }
  for (let i = 0; i < 9; i++) box([1.2, 0.14, 0.14], STEEL, [0, 0.95, -4 + i * 0.95]);
  box([1.7, 0.3, 7.6], UNDER, [0, 1.3, -0.3]);
  cyl(0.06, 7.0, 8, DSTEEL, [0, 1.05, -0.3], [0, 0, 1]);
  // fuel tank (left) & battery pack (right)
  cyl(0.32, 1.5, 10, DARK, [1.0, 0.82, -0.2], [0, 0, 1]);
  for (const zz of [-0.7, 0.3]) cyl(0.335, 0.06, 10, STEEL, [1.0, 0.82, zz], [0, 0, 1]);
  cyl(0.06, 0.08, 6, BRASS, [1.0, 1.12, -0.2]);
  box([0.5, 0.56, 1.5], OLIVE, [-1.0, 0.86, -0.2]);
  for (let i = 0; i < 4; i++) glow(box([0.02, 0.38, 0.2], CYAN, [-1.265, 0.86, -0.75 + i * 0.36]), 1.4);
  box([0.04, 0.12, 0.3], HAZ, [-1.27, 1.08, 0.3]);
  // rear bumper
  box([2.5, 0.3, 0.36], DSTEEL, [0, 0.98, -4.4]);
  decal(HAZARD, 2.3, 0.2, [0, 0.98, -4.585], [0, 0, -1]);
  decal(PLATE, 0.5, 0.25, [0, 1.3, -4.3], [0, 0, -1]);
  for (const s of side) {
    glow(box([0.4, 0.14, 0.05], RED, [s * 0.95, 1.4, -4.22]), 1.8);
    glow(box([0.14, 0.14, 0.05], AMBER, [s * 1.12, 1.4, -4.22]), 1.5);
  }
  cyl(0.1, 0.5, 8, STEEL, [0, 0.85, -4.62], [0, 0, 1]);
  cyl(0.14, 0.12, 8, BRASS, [0, 0.85, -4.85], [0, 0, 1]);

  // ---------------------------------------------------------------- front bumper & plough
  box([2.55, 0.5, 0.42], DSTEEL, [0, 0.9, 4.2]);
  decal(HAZARD, 2.35, 0.3, [0, 0.9, 4.415], [0, 0, 1]);
  b.extrude([[0, 0], [0.6, 0], [0.6, 0.42], [0, 0.3]], { at: [0, 0.62, 4.1], x: [0, 0, 1], thickness: 2.2, bevel: 0.02, color: DARK });
  box([2.3, 0.1, 0.1], STEEL, [0, 1.3, 4.3]);
  for (const s of side) {
    box([0.12, 0.45, 0.14], STEEL, [s * 1.2, 1.1, 4.25]);
    glow(box([0.3, 0.1, 0.05], WHITE, [s * 0.7, 0.95, 4.43]), 1.6);
    box([0.1, 0.12, 0.3], "#c0392b", [s * 0.45, 0.78, 4.45]);
  }
  cyl(0.1, 0.9, 10, STEEL, [0, 0.82, 4.45], [1, 0, 0]);
  cyl(0.12, 0.05, 10, BRASS, [0.47, 0.82, 4.45], [1, 0, 0]);
  cyl(0.12, 0.05, 10, BRASS, [-0.47, 0.82, 4.45], [1, 0, 0]);
  b.sweep([[0, 0.82, 4.55], [0.1, 0.7, 4.65], [0.05, 0.6, 4.7]] as any, 0.018, { color: BLACK });
  box([0.16, 0.08, 0.1], ORANGE, [0.05, 0.57, 4.7]);
  decal(PLATE, 0.45, 0.22, [0.7, 0.9, 4.43], [0, 0, 1]);
  bolts("z", Array.from({ length: 8 }, (_, i) => [-1.1 + i * 0.31, 1.12, 4.42] as V), 0.025, 0.03, "#aab4be");

  // ---------------------------------------------------------------- cab
  const CAB: [number, number][] = [[1.5, 1.45], [4.05, 1.45], [4.1, 1.85], [3.72, 2.1], [3.22, 2.85], [1.75, 2.9], [1.5, 2.75]];
  b.extrude(CAB, { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.3, bevel: 0.05, color: HULL });
  decal(FACE, 2.2, 0.62, [0, 1.62, 4.125], [0, 0.05, 1]);
  glow(box([0.5, 0.1, 0.04], WHITE, [0.65, 1.78, 4.14]), 1.8);
  glow(box([0.5, 0.1, 0.04], WHITE, [-0.65, 1.78, 4.14]), 1.8);
  glow(box([2.0, 0.025, 0.03], CYAN, [0, 1.52, 4.14]), 1.6);
  decal(WIND, 2.1, 0.82, [0, 2.49, 3.5], [0, 0.555, 0.833]);
  for (const s of side) {
    b.part(new THREE.BoxGeometry(0.1, 0.08, 0.95), DSTEEL, { at: [s * 1.1, 2.47, 3.48], dir: [0, 0.832, -0.555], axis: "z" });
    // glass
    b.extrude([[1.95, 2.07], [3.6, 2.07], [3.35, 2.73], [1.95, 2.73]], { at: [s * 1.165, 0, 0], x: [0, 0, 1], thickness: 0.05, color: DSTEEL });
    b.extrude([[2.0, 2.12], [3.55, 2.12], [3.3, 2.68], [2.0, 2.68]], { at: [s * 1.19, 0, 0], x: [0, 0, 1], thickness: 0.04, color: GLASS });
    b.extrude([[2.1, 2.2], [2.4, 2.2], [2.55, 2.6], [2.1, 2.6]], { at: [s * 1.215, 0, 0], x: [0, 0, 1], thickness: 0.01, color: "#2a6a82" });
    // door seams, handle, step, emblem
    box([0.03, 1.2, 0.025], "#05080a", [s * 1.155, 2.18, 1.95]);
    box([0.03, 1.2, 0.025], "#05080a", [s * 1.155, 2.18, 3.55]);
    box([0.03, 0.025, 1.6], "#05080a", [s * 1.155, 1.6, 2.75]);
    box([0.06, 0.07, 0.3], BRASS, [s * 1.19, 2.0, 3.35]);
    box([0.03, 0.035, 0.34], "#05080a", [s * 1.17, 2.0, 3.35]);
    decal(EMBLEM, 0.38, 0.38, [s * 1.162, 1.82, 2.7], [s, 0, 0]);
    glow(box([0.03, 0.05, 0.1], AMBER, [s * 1.14, 1.6, 4.0]), 1.5);
    // side steps
    box([0.35, 0.05, 1.0], DSTEEL, [s * 1.28, 1.2, 2.75]);
    slatsZ(6, [0.3, 0.07, 0.04], 0.16, STEEL, [s * 1.28, 1.24, 2.75]);
    box([0.04, 0.3, 0.06], STEEL, [s * 1.12, 1.35, 2.3]);
    // exhaust stacks
    cyl(0.09, 2.0, 8, STEEL, [s * 1.0, 2.4, 1.35]);
    cyl(0.125, 0.95, 8, DARK, [s * 1.0, 1.95, 1.35]);
    cyl(0.13, 0.04, 8, BRASS, [s * 1.0, 1.5, 1.35]);
    cyl(0.13, 0.04, 8, BRASS, [s * 1.0, 2.4, 1.35]);
    taper(0.12, 0.09, 0.12, 8, BLACK, [s * 1.0, 3.45, 1.35]);
    glow(cyl(0.07, 0.02, 8, ORANGE, [s * 1.0, 3.5, 1.35]), 1.4);
    // mirror: arm, pod, lens
    box([0.45, 0.05, 0.05], DSTEEL, [s * 1.38, 2.5, 3.3]);
    box([0.1, 0.34, 0.16], DSTEEL, [s * 1.6, 2.38, 3.3]);
    glow(sph(0.035, GREEN, [s * 1.6, 2.5, 3.39]), 1.6);
    // cab side vent slats
    slatsY(5, [0.03, 0.025, 0.4], 0.055, BLACK, [s * 1.16, 1.68, 3.95]);
    // marker lights on roof
    glow(box([0.2, 0.05, 0.06], AMBER, [s * 1.0, 2.93, 1.8]), 1.4);
  }
  // roof: plate, visor, light bar, hatch, searchlight
  box([2.15, 0.06, 1.5], STEEL, [0, 2.94, 2.45]);
  bolts("y", Array.from({ length: 12 }, (_, i) => [-0.95 + (i % 6) * 0.38, 2.98, i < 6 ? 1.8 : 3.05] as V), 0.025, 0.03, "#aab4be");
  b.part(new THREE.BoxGeometry(2.2, 0.06, 0.35), DSTEEL, { at: [0, 2.99, 3.4], rotation: [12, 0, 0] });
  box([1.7, 0.1, 0.16], BLACK, [0, 3.0, 3.1]);
  glow(box([1.6, 0.05, 0.05], AMBER, [0, 3.0, 3.19]), 1.8);
  cyl(0.28, 0.06, 10, DARK, [0.5, 3.0, 2.0]);
  cyl(0.2, 0.04, 10, BLACK, [0.5, 3.04, 2.0]);
  box([0.25, 0.03, 0.03], STEEL, [0.5, 3.07, 2.0]);
  cyl(0.06, 0.2, 8, DSTEEL, [-0.7, 3.08, 2.0]);
  glow(cyl(0.07, 0.04, 8, WHITE, [-0.7, 3.2, 2.1], [0, 0.4, 1]), 1.6);
  // cab rear / gap fairing
  box([2.2, 0.9, 0.3], DARK, [0, 2.7, 1.35]);
  b.sweep([[0.3, 1.6, 1.5], [0.4, 1.4, 1.35], [0.3, 1.25, 1.2], [0.1, 1.5, 1.1]] as any, 0.025, { color: BLACK });
  b.sweep([[-0.3, 1.6, 1.5], [-0.4, 1.4, 1.35], [-0.3, 1.25, 1.2], [-0.1, 1.5, 1.1]] as any, 0.025, { color: AMBER });

  // remote weapon station on the cab roof
  cyl(0.3, 0.1, 10, DSTEEL, [0, 3.03, 2.3]);
  box([0.52, 0.4, 0.62], MIL, [0, 3.28, 2.3]);
  box([0.56, 0.06, 0.66], STEEL, [0, 3.5, 2.3]);
  cyl(0.085, 0.7, 8, DSTEEL, [0, 3.3, 2.9], [0, 0, 1]);
  cyl(0.045, 1.4, 8, BLACK, [0, 3.3, 3.55], [0, 0, 1]);
  cyl(0.065, 0.14, 8, STEEL, [0, 3.3, 4.28], [0, 0, 1]);
  for (let i = 0; i < 3; i++) cyl(0.075, 0.025, 8, DSTEEL, [0, 3.3, 3.2 + i * 0.25], [0, 0, 1]);
  box([0.3, 0.3, 0.4], OLIVE, [-0.42, 3.22, 2.25]);
  box([0.32, 0.04, 0.42], HAZ, [-0.42, 3.38, 2.25]);
  b.sweep([[-0.3, 3.22, 2.4], [-0.2, 3.1, 2.6], [-0.05, 3.25, 2.75]] as any, 0.012, { color: BRASS });
  box([0.2, 0.2, 0.28], DSTEEL, [0.4, 3.45, 2.5]);
  glow(sph(0.05, RED, [0.4, 3.45, 2.66]), 2);
  box([0.1, 0.1, 0.1], BLACK, [0.4, 3.62, 2.5]);

  // ---------------------------------------------------------------- cargo module
  box([2.4, 1.7, 5.4], HULL, [0, 2.3, -1.5]);
  box([2.2, 0.1, 5.2], STEEL, [0, 3.2, -1.5]);
  bolts("y", Array.from({ length: 22 }, (_, i) => [(i % 2 ? 1 : -1) * 1.05, 3.26, 0.9 - Math.floor(i / 2) * 0.46] as V), 0.025, 0.03, "#aab4be");
  for (const sx of side) for (const zz of [1.15, -4.15]) box([0.14, 1.74, 0.14], DSTEEL, [sx * 1.2, 2.3, zz]);
  for (const s of side) {
    for (const zz of [0.95, -0.05, -3.05, -4.05]) {
      box([0.07, 1.55, 0.12], DSTEEL, [s * 1.22, 2.3, zz]);
      bolts("x", [[s * 1.27, 1.75, zz], [s * 1.27, 2.3, zz], [s * 1.27, 2.85, zz]], 0.025, 0.03, BRASS);
    }
    glow(box([0.03, 0.045, 5.3], CYAN, [s * 1.205, 1.62, -1.5]), 1.7);
    box([0.03, 0.06, 5.3], HAZ, [s * 1.205, 1.52, -1.5]);
    decal(STENCIL, 2.3, 0.575, [s * 1.205, 2.5, -1.55], [s, 0, 0]);
    decal(EMBLEM, 0.7, 0.7, [s * 1.205, 2.4, 0.45], [s, 0, 0]);
    decal(SCREEN, 0.8, 0.45, [s * 1.205, 2.4, -3.55], [s, 0, 0], {});
    glow(box([0.82, 0.02, 0.03], MAG, [s * 1.215, 2.12, -3.55]), 1.5);
    // louvre vents
    slatsY(5, [0.03, 0.03, 0.8], 0.06, BLACK, [s * 1.205, 2.95, -1.55]);
    slatsY(5, [0.03, 0.03, 0.8], 0.06, BLACK, [s * 1.205, 2.95, -0.55]);
    // grab handles & tie-downs
    for (const zz of [-1.0, -2.1]) {
      box([0.05, 0.05, 0.4], STEEL, [s * 1.26, 1.95, zz]);
      box([0.06, 0.05, 0.05], STEEL, [s * 1.23, 1.95, zz - 0.18]);
      box([0.06, 0.05, 0.05], STEEL, [s * 1.23, 1.95, zz + 0.18]);
    }
    // armoured skirt between wheels
    box([0.06, 0.28, 1.5], DARK, [s * 1.2, 1.3, -0.2]);
    bolts("x", Array.from({ length: 5 }, (_, i) => [s * 1.24, 1.3, -0.8 + i * 0.3] as V), 0.02, 0.03, "#aab4be");
    // marker lights on cargo
    glow(box([0.04, 0.06, 0.18], AMBER, [s * 1.215, 3.02, -1.5]), 1.4);
  }
  // rear: doors, handles, ladder, lights
  decal(REAR, 2.2, 1.6, [0, 2.3, -4.222], [0, 0, -1]);
  for (const s of side) box([0.06, 0.4, 0.05], BRASS, [s * 0.1, 2.3, -4.25]);
  box([0.04, 0.5, 0.04], STEEL, [0, 2.3, -4.25]);
  for (const s of side) {
    box([0.05, 1.6, 0.05], STEEL, [s * 1.0 * 1.0, 2.2, -4.28]);
  }
  for (let i = 0; i < 6; i++) box([2.0, 0.04, 0.04], STEEL, [0, 1.65 + i * 0.28, -4.28]);
  // roof gear
  const f: V = [0, Math.sin(28 * DEG), Math.cos(28 * DEG)];
  cyl(0.55, 0.16, 12, DSTEEL, [0, 3.33, -1.3]);
  cyl(0.4, 0.1, 12, BLACK, [0, 3.43, -1.3]);
  for (const s of side) {
    box([0.12, 0.6, 0.36], MIL, [s * 0.76, 3.7, -1.3]);
    cyl(0.12, 0.18, 8, STEEL, [s * 0.67, 3.88, -1.3], [1, 0, 0]);
  }
  const pc: V = [0, 3.95, -1.3];
  b.part(new THREE.BoxGeometry(1.3, 0.55, 1.8), HULL, { at: pc, dir: f, axis: "z" });
  b.part(new THREE.BoxGeometry(1.0, 0.06, 1.5), DSTEEL, { at: [0, 4.28, -1.42], dir: f, axis: "z" });
  decal(PODFACE, 1.2, 0.5, [pc[0], pc[1] + f[1] * 0.912, pc[2] + f[2] * 0.912], f);
  for (const s of side) {
    b.part(new THREE.BoxGeometry(0.03, 0.4, 1.4), HAZ, { at: [s * 0.665, 3.95, -1.3], dir: f, axis: "z" });
    glow(sph(0.04, GREEN, [s * 0.4, 4.3, -1.7]), 1.8);
  }
  glow(b.part(new THREE.BoxGeometry(0.2, 0.02, 0.1), GREEN, { at: [0, 4.31, -1.9], dir: f, axis: "z" }), 1.6);
  // radar dish
  cyl(0.05, 0.9, 8, DSTEEL, [-0.6, 3.65, -3.6]);
  cyl(0.15, 0.1, 8, STEEL, [-0.6, 3.25, -3.6]);
  const ax: V = [0, 0.7, -0.7];
  b.lathe(
    [[0, 0], [0.12, 0.01], [0.3, 0.07], [0.5, 0.2], [0.5, 0.23], [0.3, 0.1], [0.12, 0.04], [0, 0.03]],
    { at: [-0.6, 4.1, -3.6], axis: ax, segments: 12, color: STEEL },
  );
  b.rod([-0.6, 4.1, -3.6], [-0.6 + 0, 4.1 + 0.28, -3.6 - 0.28], 0.015, DSTEEL);
  glow(sph(0.04, RED, [-0.6, 4.4, -3.9]), 1.8);
  // fans
  for (const xx of [0.65, -0.65]) {
    cyl(0.28, 0.08, 10, DARK, [xx, 3.28, -2.7]);
    cyl(0.22, 0.03, 10, BLACK, [xx, 3.33, -2.7]);
    box([0.44, 0.02, 0.03], STEEL, [xx, 3.35, -2.7]);
    box([0.03, 0.02, 0.44], STEEL, [xx, 3.35, -2.7]);
  }
  // recon drone parked on the roof
  box([0.3, 0.08, 0.3], DSTEEL, [0.7, 3.4, -3.5]);
  glow(box([0.1, 0.03, 0.04], CYAN, [0.7, 3.4, -3.34]), 1.8);
  for (const dx of side) for (const dz of side) {
    b.part(new THREE.BoxGeometry(0.05, 0.03, 0.34), STEEL, { at: [0.7 + dx * 0.15, 3.4, -3.5 + dz * 0.15], rotation: [0, dx * dz * 45, 0] });
    cyl(0.1, 0.01, 8, "#7a8591", [0.7 + dx * 0.29, 3.44, -3.5 + dz * 0.29]);
  }
  // antennas
  for (const [ax2, az2, hh] of [[1.0, 1.0, 1.6], [-1.0, -4.0, 1.9], [1.0, -4.0, 1.3], [-1.0, 1.0, 1.1]] as const) {
    cyl(0.045, 0.14, 6, BLACK, [ax2, 3.3, az2]);
    cyl(0.011, hh, 5, STEEL, [ax2, 3.3 + hh / 2, az2]);
    glow(sph(0.03, RED, [ax2, 3.3 + hh, az2]), 2);
  }
  // cab-to-cargo cable run on roof
  b.sweep([[0.9, 3.0, 1.6], [0.95, 3.2, 1.4], [0.85, 3.22, 1.0]] as any, 0.02, { color: BLACK });

  return b.root;
}
