```ts
import * as THREE from "three";
import { createBuilder, frame, rng, svg, grain, mottle, paint } from "agentic-3js-builder";
import { cel } from "agentic-3js-builder/kits/toon";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Wizard's Bookshelf",
  description:
    "A tall arched high-fantasy bookshelf with gilded tomes, scrolls, glowing orbs, candles, a skull, potions, an open spellbook and a wizard hat, standing on a runic stone dais.",
};

// ---------- palette ----------
const GOLD = metal("gilt");
const DARKGOLD = metal("brass", { tarnish: 0.4 });
const WOOD_V = cel(grain("#7a4a2a", "#4a2a14", { size: 0.03, axis: "y", seed: 3 }));
const WOOD_H = cel(grain("#7a4a2a", "#4a2a14", { size: 0.03, axis: "x", seed: 5 }));
const WOOD_D = cel(grain("#3b2418", "#24150d", { size: 0.03, axis: "y", seed: 8 }));
const STONE = cel(mottle("#7a7396", "#524c6e", { size: 0.12, seed: 4 }));
const BOOKS = ["#8a1f45", "#2a4a9a", "#2f7a52", "#6a30a0", "#b85a22", "#1f6a78", "#9a2e2e", "#3e3e86"];
const PAGE = "#f1e4c0";
const PARCH = "#e8d49a";
const WAX = "#f4ead0";

// ---------- textures ----------
const GL = "#f2c94c";
const labelTex = (sym: string) =>
  svg(
    `<svg viewBox="0 0 40 60"><rect x="2" y="2" width="36" height="56" rx="4" fill="#1b1230" stroke="${GL}" stroke-width="3"/>${sym}</svg>`,
    { size: 128 },
  );
const LABELS = [
  labelTex(`<path d="M26 12 A18 18 0 1 0 26 48 A13 13 0 1 1 26 12Z" fill="${GL}"/><circle cx="29" cy="30" r="2.5" fill="${GL}"/>`),
  labelTex(`<polygon points="20,10 24,25 38,25 27,34 31,49 20,40 9,49 13,34 2,25 16,25" fill="${GL}" transform="scale(0.9) translate(2,3)"/>`),
  labelTex(`<ellipse cx="20" cy="30" rx="15" ry="9" fill="none" stroke="${GL}" stroke-width="3"/><circle cx="20" cy="30" r="5" fill="#6fe6ff"/><circle cx="20" cy="30" r="2" fill="#1b1230"/><path d="M20 8 V16 M8 12 L12 18 M32 12 L28 18" stroke="${GL}" stroke-width="2.5"/>`),
];

let ringStr = "";
for (let i = 0; i < 24; i++) {
  const a = (i * 15 * Math.PI) / 180;
  const x1 = 100 + Math.sin(a) * 78, y1 = 100 - Math.cos(a) * 78;
  const x2 = 100 + Math.sin(a) * 86, y2 = 100 - Math.cos(a) * 86;
  ringStr += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="#6fe6ff" stroke-width="${i % 2 ? 2 : 3.5}"/>`;
}
let star = "";
for (let i = 0; i < 5; i++) {
  const a = (i * 144 * Math.PI) / 180;
  star += `${(100 + Math.sin(a) * 66).toFixed(1)},${(100 - Math.cos(a) * 66).toFixed(1)} `;
}
const CIRCLE = svg(
  `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="96" fill="none" stroke="${GL}" stroke-width="3"/><circle cx="100" cy="100" r="74" fill="none" stroke="${GL}" stroke-width="2.5"/><circle cx="100" cy="100" r="40" fill="none" stroke="#6fe6ff" stroke-width="2.5"/>${ringStr}<polygon points="${star}" fill="none" stroke="${GL}" stroke-width="3" stroke-linejoin="round"/><circle cx="100" cy="100" r="7" fill="#6fe6ff"/></svg>`,
  { size: 640 },
);

let stars = "";
const sr = rng(11);
for (let i = 0; i < 40; i++)
  stars += `<circle cx="${(sr() * 120).toFixed(1)}" cy="${(sr() * 180).toFixed(1)}" r="${(0.8 + sr() * 1.6).toFixed(1)}" fill="${i % 4 ? "#fff4c0" : "#9fe8ff"}"/>`;
const BACK = svg(
  `<svg viewBox="0 0 120 180"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c1450"/><stop offset="1" stop-color="#0c0a24"/></linearGradient></defs><rect width="120" height="180" fill="url(#g)"/>${stars}<path d="M20 30 L45 55 L40 90 L75 110 L95 80" fill="none" stroke="${GL}" stroke-width="1.2"/><path d="M30 130 L60 150 L90 135" fill="none" stroke="#9fe8ff" stroke-width="1.2"/></svg>`,
  { size: 512 },
);

const orbTex = (a: string, b: string, c: string) =>
  svg(
    `<svg viewBox="0 0 200 100"><defs><linearGradient id="o" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="200" height="100" fill="url(#o)"/><path d="M0 60 Q30 30 60 55 T120 50 T200 55" fill="none" stroke="${c}" stroke-width="7" opacity="0.8"/><path d="M0 30 Q40 5 80 28 T160 25 T200 30" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.7"/><circle cx="50" cy="75" r="5" fill="#fff"/><circle cx="140" cy="70" r="4" fill="#fff"/><circle cx="100" cy="20" r="3" fill="#fff"/></svg>`,
    { size: 256 },
  );
const ORB_BLUE = orbTex("#5a3fd0", "#2fc4f0", "#c8f4ff");
const ORB_AMBER = orbTex("#f08a20", "#ffd860", "#fff2b0");
const ORB_TEAL = orbTex("#18a090", "#68f0c0", "#e0fff0");

const EMBLEM = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#1b1230" stroke="${GL}" stroke-width="4"/><path d="M60 18 A32 32 0 1 0 60 82 A25 25 0 1 1 60 18Z" fill="${GL}"/><polygon points="66,38 69,47 78,47 71,53 74,62 66,57 58,62 61,53 54,47 63,47" fill="#6fe6ff"/><path d="M50 4 V12 M50 88 V96 M4 50 H12" stroke="${GL}" stroke-width="3"/></svg>`,
  { size: 256 },
);

let runes = "";
for (let r = 0; r < 9; r++) {
  const rr = rng(40 + r);
  let x = 6;
  while (x < 50) {
    const w = 3 + rr() * 6;
    runes += `<rect x="${x.toFixed(1)}" y="${8 + r * 8}" width="${w.toFixed(1)}" height="2.4" rx="1" fill="${GL}"/>`;
    x += w + 2.5;
  }
}
const PAGERUNES = svg(`<svg viewBox="0 0 56 80">${runes}<circle cx="28" cy="76" r="2" fill="#6fe6ff"/></svg>`, { size: 192 });

// ---------- builder ----------
export default function build() {
  const b = createBuilder({ name: "wizard_bookshelf" });
  const root = b.joint("root", { at: [0, 0, 0] });

  const put = (geo: THREE.BufferGeometry, color: any, at: number[], o: any = {}) =>
    b.part(geo, color, { bone: root, at, ...o });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const D2R = Math.PI / 180;

  // compound helper rotated about y
  const comp = (cx: number, cy: number, cz: number, ang: number) => {
    const a = ang * D2R, c = Math.cos(a), s = Math.sin(a);
    return (geo: THREE.BufferGeometry, color: any, ox: number, oy: number, oz: number, o: any = {}) =>
      put(geo, color, [cx + ox * c + oz * s, cy + oy, cz - ox * s + oz * c], { rotation: [0, ang, 0], ...o });
  };

  // ---------- stage ----------
  const BASE = 0.04;
  b.lathe(
    [[0, 0], [1.45, 0], [1.45, 0.025], [1.37, BASE], [0, BASE]],
    { at: [0, 0, 0], bone: root, color: STONE, segments: 20 },
  );
  put(new THREE.PlaneGeometry(2.7, 2.7), "#ffffff", [0, BASE + 0.0015, 0.05], {
    dir: [0, 1, 0], axis: "z", up: [0, 0, -1], texture: CIRCLE,
  });
  glow(b.root.children.length ? (put(new THREE.PlaneGeometry(0.001, 0.001), "#ffffff", [0, -5, 0]) as any) : (null as any), 0);

  // ---------- carcass ----------
  put(box(1.58, 0.1, 0.46), WOOD_H, [0, 0.09, 0]); // plinth / bottom board
  put(box(1.66, 0.03, 0.5), GOLD, [0, 0.055, 0]); // gilded foot trim
  for (const s of [1, -1]) {
    put(box(0.06, 1.95, 0.4), WOOD_V, [s * 0.68, 1.115, 0]);
    put(box(0.075, 1.95, 0.02), GOLD, [s * 0.68, 1.115, 0.205]); // gold edge strip
    put(box(0.09, 0.09, 0.44), GOLD, [s * 0.68, 0.19, 0]); // corner blocks
    put(box(0.09, 0.07, 0.44), GOLD, [s * 0.68, 2.06, 0]);
  }
  put(box(1.46, 0.05, 0.42), WOOD_H, [0, 2.07, 0]);
  put(box(1.5, 0.02, 0.44), GOLD, [0, 2.1, 0]);
  put(box(1.32, 1.95, 0.03), WOOD_D, [0, 1.115, -0.19]);
  glow(put(new THREE.PlaneGeometry(1.3, 1.9), "#ffffff", [0, 1.12, -0.173], { dir: [0, 0, 1], axis: "z", texture: BACK }), 0.45);
  for (const y of [0.64, 1.14, 1.64]) {
    put(box(1.32, 0.04, 0.4), WOOD_H, [0, y, 0]);
    put(box(1.32, 0.012, 0.02), GOLD, [0, y, 0.205]);
  }

  // ---------- crown ----------
  const CY = 2.12;
  const outline: [number, number][] = [
    [-0.74, 0], [0.74, 0], [0.74, 0.08], [0.5, 0.14], [0.3, 0.28], [0.14, 0.42], [0, 0.5],
    [-0.14, 0.42], [-0.3, 0.28], [-0.5, 0.14], [-0.74, 0.08],
  ];
  b.extrude(outline, { at: [0, CY, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.3, bevel: 0.01, color: WOOD_V, bone: root });
  for (let i = 0; i < outline.length; i++) {
    const p = outline[i], q = outline[(i + 1) % outline.length];
    if (i === 0) continue;
    b.rod([p[0], CY + p[1], 0.156], [q[0], CY + q[1], 0.156], 0.009, GOLD, { bone: root, sides: 6 });
  }
  glow(put(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", [0, CY + 0.22, 0.153], { dir: [0, 0, 1], axis: "z", texture: EMBLEM }), 0.9);
  // crystal finials
  const crystal = (x: number, y: number, sc: number) => {
    put(cyl(0.03 * sc, 0.05 * sc, 0.07 * sc, 6), GOLD, [x, y, 0]);
    glow(put(new THREE.OctahedronGeometry(0.05 * sc), "#7ff0ff", [x, y + 0.1 * sc, 0], { scale: [1, 1.9, 1], flat: true }), 1.4);
  };
  crystal(0.72, CY + 0.1, 1);
  crystal(-0.72, CY + 0.1, 1);
  crystal(0, CY + 0.53, 1.4);
  // wizard hat
  {
    const hx = -0.44, hy = CY + 0.15;
    const HAT = "#3a2a86";
    b.lathe([[0, 0], [0.15, 0], [0.14, 0.012], [0.07, 0.03], [0.06, 0.05], [0, 0.05]], { at: [hx, hy, 0], bone: root, color: HAT, segments: 12 });
    put(new THREE.ConeGeometry(0.062, 0.24, 8), HAT, [hx, hy + 0.16, 0]);
    put(cyl(0.065, 0.07, 0.025, 8), GOLD, [hx, hy + 0.06, 0]);
    put(new THREE.ConeGeometry(0.035, 0.13, 6), HAT, [hx + 0.045, hy + 0.3, 0], { rotation: [0, 0, -42] });
    glow(put(new THREE.OctahedronGeometry(0.014), "#ffe27a", [hx + 0.11, hy + 0.34, 0]), 1);
    glow(put(new THREE.PlaneGeometry(0.045, 0.045), "#ffffff", [hx, hy + 0.062, 0.071], { dir: [0, 0, 1], axis: "z", texture: labelTex(`<polygon points="20,8 24,24 38,24 27,34 31,50 20,40 9,50 13,34 2,24 16,24" fill="${GL}"/>`) }), 0.6);
  }

  // ---------- item helpers ----------
  const book = (x: number, base: number, w: number, h: number, d: number, col: string, tilt = 0, k = 0) => {
    const t = tilt * D2R, c = Math.cos(t), s = Math.sin(t);
    const cy = base + (h / 2) * c + (w / 2) * Math.abs(s);
    const L = (geo: THREE.BufferGeometry, color: any, ox: number, oy: number, oz: number, o: any = {}) =>
      put(geo, color, [x + ox * c - oy * s, cy + ox * s + oy * c, oz], { rotation: [0, 0, tilt], ...o });
    L(box(w, h, d), col, 0, 0, 0);
    for (const sg of [1, -1]) L(box(w + 0.004, 0.01, d + 0.004), GOLD, 0, sg * h * 0.32, 0);
    if (w > 0.04) {
      const lh = Math.min(h * 0.34, 0.09);
      L(new THREE.PlaneGeometry(w * 0.72, lh), "#ffffff", 0, 0, d / 2 + 0.003, {
        dir: [0, 0, 1], axis: "z", up: [-s, c, 0], texture: LABELS[k % 3],
      });
    }
  };
  const row = (x0: number, x1: number, base: number, maxH: number, seed: number) => {
    const r = rng(seed);
    let x = x0;
    for (;;) {
      const w = 0.034 + r() * 0.036;
      if (x + w > x1) break;
      const h = Math.min(maxH, 0.2 + r() * 0.2);
      book(x + w / 2, base, w, h, 0.21 + r() * 0.04, BOOKS[Math.floor(r() * BOOKS.length)], 0, Math.floor(r() * 3));
      x += w + 0.003;
    }
    return x;
  };
  const flat = (cx: number, base: number, cz: number, w: number, d: number, th: number, col: string, ang: number) => {
    const L = comp(cx, base, cz, ang);
    L(box(w, 0.008, d), col, 0, th - 0.004, 0);
    L(box(w, 0.008, d), col, 0, 0.004, 0);
    L(box(w - 0.012, th - 0.016, d - 0.008), PAGE, 0.004, th / 2, 0);
    L(box(0.014, th, d), col, -w / 2 + 0.007, th / 2, 0);
    L(box(0.006, th * 0.55, 0.035), GOLD, w / 2, th / 2, 0);
    L(box(0.016, 0.01, d + 0.004), GOLD, -w / 2 + 0.007, th * 0.25, 0);
    L(box(0.016, 0.01, d + 0.004), GOLD, -w / 2 + 0.007, th * 0.75, 0);
    return base + th;
  };
  const candle = (x: number, y: number, z: number, h: number, r = 0.02, dish = true) => {
    const y0 = y + (dish ? 0.008 : 0);
    if (dish) put(cyl(r * 2.3, r * 2.5, 0.008, 10), GOLD, [x, y + 0.004, z]);
    put(cyl(r, r * 1.05, h, 8), WAX, [x, y0 + h / 2, z]);
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1 + x * 9;
      put(sph(r * 0.4, 5, 4), WAX, [x + Math.cos(a) * r, y0 + h - 0.01 - i * 0.02, z + Math.sin(a) * r], { scale: [1, 2.2, 1] });
    }
    put(cyl(0.0018, 0.0018, 0.012, 4), "#2a2018", [x, y0 + h + 0.005, z]);
    glow(put(new THREE.ConeGeometry(0.013, 0.05, 6), "#ff9a2e", [x, y0 + h + 0.035, z]), 1.3);
    glow(put(new THREE.ConeGeometry(0.0072, 0.032, 6), "#fff2a8", [x, y0 + h + 0.027, z]), 1.6);
  };
  const orb = (x: number, y: number, z: number, r: number, tex: THREE.Texture) => {
    put(cyl(r * 0.5, r * 0.8, 0.03, 8), GOLD, [x, y + 0.015, z]);
    put(new THREE.TorusGeometry(r * 0.75, 0.007, 4, 10), GOLD, [x, y + 0.04 + r * 0.15, z], { rotation: [90, 0, 0] });
    for (let i = 0; i < 3; i++) {
      const a = (i * 120 + 30) * D2R;
      put(cyl(0.005, 0.008, r * 1.0, 5), GOLD, [x + Math.cos(a) * r * 0.62, y + 0.05 + r * 0.55, z + Math.sin(a) * r * 0.62], { dir: [-Math.cos(a) * 0.25, 1, -Math.sin(a) * 0.25] });
    }
    glow(put(sph(r, 12, 8), "#ffffff", [x, y + 0.03 + r * 0.82, z], { texture: tex, rotation: [0, -90, 0] }), 0.95);
  };
  const scroll = (cx: number, cy: number, cz: number, len: number, ang: number) => {
    const a = ang * D2R;
    const d: [number, number, number] = [Math.cos(a), 0, -Math.sin(a)];
    const at = (k: number) => [cx + d[0] * k, cy, cz + d[2] * k];
    put(cyl(0.02, 0.02, len, 8), PARCH, at(0), { dir: d });
    put(cyl(0.0065, 0.0065, len + 0.05, 5), "#4a2a14", at(0), { dir: d });
    for (const s of [1, -1]) {
      put(cyl(0.013, 0.013, 0.014, 6), DARKGOLD, at(s * (len / 2 + 0.028)), { dir: d });
      put(cyl(0.0215, 0.0215, 0.012, 8), "#c8a860", at(s * (len / 2 - 0.005)), { dir: d });
    }
    put(cyl(0.0225, 0.0225, 0.012, 8), "#a82838", at(len * 0.1), { dir: d });
    put(sph(0.011, 6, 4), "#c83048", [cx + d[0] * len * 0.1, cy + 0.02, cz + d[2] * len * 0.1], { scale: [1, 0.5, 1] });
  };
  const potion = (x: number, y: number, z: number, col: string) => {
    glow(
      b.lathe([[0, 0], [0.03, 0], [0.034, 0.02], [0.03, 0.05], [0.012, 0.07], [0.012, 0.09], [0.016, 0.095], [0, 0.095]], {
        at: [x, y, z], bone: root, color: col, segments: 8,
      }),
      0.7,
    );
    put(cyl(0.013, 0.011, 0.02, 6), "#b88a55", [x, y + 0.105, z]);
  };
  const skull = (x: number, y: number, z: number) => {
    const BONE = "#e8dfc8";
    put(sph(0.05, 8, 6), BONE, [x, y + 0.062, z], { scale: [1, 0.95, 1.05] });
    put(box(0.05, 0.03, 0.04), BONE, [x, y + 0.028, z + 0.022]);
    put(box(0.046, 0.02, 0.04), BONE, [x, y + 0.008, z + 0.022]); // jaw
    for (const s of [1, -1]) {
      put(sph(0.014, 6, 4), "#1a1020", [x + s * 0.02, y + 0.062, z + 0.042]);
      glow(put(sph(0.006, 5, 4), "#8cff9a", [x + s * 0.02, y + 0.062, z + 0.052]), 1.5);
    }
    put(box(0.008, 0.014, 0.006), "#1a1020", [x, y + 0.04, z + 0.05]);
    return y + 0.108;
  };

  // ---------- shelf 1 (bottom) ----------
  {
    const base = 0.14;
    const end = row(-0.62, -0.05, base, 0.42, 21);
    book(end + 0.09, base, 0.04, 0.3, 0.23, BOOKS[3], 15, 2);
    orb(0.27, base, 0.03, 0.115, ORB_BLUE);
    const top = flat(0.55, base, 0.02, 0.3, 0.22, 0.045, BOOKS[0], -8);
    flat(0.55, top, 0.02, 0.26, 0.2, 0.04, BOOKS[1], 6);
  }
  // ---------- shelf 2 ----------
  {
    const base = 0.66;
    scroll(-0.45, base + 0.02, 0.05, 0.3, 4);
    scroll(-0.4, base + 0.02, -0.04, 0.28, -6);
    scroll(-0.43, base + 0.06, 0.01, 0.3, 2);
    let t = flat(-0.05, base, 0.0, 0.3, 0.22, 0.05, BOOKS[4], 5);
    t = flat(-0.05, t, 0.0, 0.27, 0.2, 0.04, BOOKS[2], -9);
    t = flat(-0.05, t, 0.0, 0.24, 0.19, 0.035, BOOKS[5], 10);
    candle(-0.05, t, 0.0, 0.1, 0.02, true);
    const end = row(0.2, 0.55, base, 0.4, 33);
    book(end + 0.09, base, 0.04, 0.3, 0.23, BOOKS[7], -15, 0);
  }
  // ---------- shelf 3 ----------
  {
    const base = 1.16;
    row(-0.62, -0.1, base, 0.42, 55);
    orb(0.17, base, 0.03, 0.095, ORB_AMBER);
    potion(0.4, base, 0.06, "#c040e8");
    potion(0.47, base, -0.02, "#58e0b0");
    candle(0.57, base, 0.04, 0.16, 0.022, true);
  }
  // ---------- shelf 4 (top) ----------
  {
    const base = 1.66;
    // scroll urn
    b.lathe([[0, 0], [0.06, 0], [0.085, 0.07], [0.07, 0.16], [0.045, 0.2], [0.06, 0.225], [0.05, 0.23], [0, 0.23]], {
      at: [-0.48, base, 0.03], bone: root, color: "#2f5a8a", segments: 10,
    });
    put(new THREE.TorusGeometry(0.075, 0.006, 4, 10), GOLD, [-0.48, base + 0.1, 0.03], { rotation: [90, 0, 0] });
    const dirs = [[-0.25, 1, 0.1], [0.2, 1, -0.1], [0.05, 1, 0.3], [-0.1, 1, -0.25]];
    dirs.forEach((dv, i) => {
      const v = new THREE.Vector3(dv[0], dv[1], dv[2]).normalize();
      const len = 0.24 + i * 0.015;
      const p = [-0.48, base + 0.2, 0.03].map((c, k) => c + [v.x, v.y, v.z][k] * len * 0.4);
      put(cyl(0.017, 0.017, len, 7), i % 2 ? PARCH : "#d6bd82", p, { dir: [v.x, v.y, v.z] });
      put(cyl(0.019, 0.019, 0.01, 7), "#a82838", p, { dir: [v.x, v.y, v.z] });
    });
    // open spellbook
    const bx = 0.0, by = base + 0.005, th = 10 * D2R;
    put(cyl(0.05, 0.075, 0.025, 8), GOLD, [bx, by + 0.012, 0.0]);
    for (const s of [1, -1]) {
      const phi = s * th;
      const cx = bx + s * 0.1 * Math.cos(th), cy = by + 0.05 + 0.1 * Math.sin(th);
      put(box(0.22, 0.014, 0.3), BOOKS[0], [cx, cy - 0.016, 0], { rotation: [0, 0, phi / D2R] });
      put(box(0.2, 0.024, 0.28), PAGE, [cx, cy, 0], { rotation: [0, 0, phi / D2R] });
      const n = [-Math.sin(phi), Math.cos(phi), 0];
      glow(
        put(new THREE.PlaneGeometry(0.17, 0.24), "#ffffff", [cx + n[0] * 0.0135, cy + n[1] * 0.0135, 0], {
          dir: n, axis: "z", up: [0, 0, -1], texture: PAGERUNES,
        }),
        1,
      );
    }
    put(box(0.02, 0.05, 0.3), BOOKS[0], [bx, by + 0.04, 0]);
    [[-0.1, 0.2, 0.05], [0.12, 0.26, -0.03], [0.02, 0.31, 0.08]].forEach(([dx, dy, dz], i) =>
      glow(put(new THREE.OctahedronGeometry(0.014 + i * 0.002), i % 2 ? "#ffe27a" : "#7ff0ff", [bx + dx, base + dy * 0.9, dz], { flat: true }), 1.5),
    );
    // skull + candle, potions
    const top = skull(0.43, base, 0.04);
    candle(0.43, top, 0.04, 0.07, 0.018, false);
    potion(0.56, base, 0.0, "#ff6a5a");
    potion(0.3, base, 0.08, "#7ac8ff");
  }

  // ---------- floor dressing ----------
  {
    let t = BASE;
    t = flat(1.0, t, 0.2, 0.36, 0.26, 0.06, BOOKS[3], 20);
    t = flat(1.0, t, 0.2, 0.32, 0.24, 0.05, BOOKS[1], -12);
    t = flat(1.0, t, 0.2, 0.28, 0.22, 0.05, BOOKS[6], 30);
    t = flat(1.0, t, 0.2, 0.24, 0.2, 0.04, BOOKS[4], -6);
    candle(1.0, t, 0.2, 0.14, 0.024, true);
    put(cyl(0.12, 0.13, 0.012, 10), GOLD, [-1.0, BASE + 0.006, 0.28]);
    candle(-1.0, BASE + 0.012, 0.28, 0.26, 0.03, false);
    candle(-0.93, BASE + 0.012, 0.36, 0.15, 0.022, false);
    candle(-1.06, BASE + 0.012, 0.36, 0.08, 0.02, false);
    orb(-0.75, BASE, 0.62, 0.075, ORB_TEAL);
    scroll(0.72, BASE + 0.02, 0.62, 0.34, 35);
    scroll(0.82, BASE + 0.02, 0.5, 0.3, -20);
  }

  void frame; void paint;
  return b.root;
}
```