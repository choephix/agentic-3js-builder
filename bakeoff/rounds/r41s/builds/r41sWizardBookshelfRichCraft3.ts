import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { grain, mottle, countershade } from "../../../../src/index";
import { svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "wizard_bookshelf",
  description: "High-fantasy anime wizard's bookshelf with rune-spined tomes, scrolls, glowing orbs, crystals and candles.",
};

const WOOD_D = "#3b2236";
const GOLD = "#f0c24e";
const PARCH = "#f3e3b8";
const CREAM = "#f7ecd0";
const BOOKS = ["#5a2a8c", "#1f7f8c", "#b3263f", "#233a7a", "#2c6e45", "#c9892a", "#7a2f6a", "#2f4f9e"];

export default function build() {
  const b = createBuilder({ name: "wizard_bookshelf" });
  const R = rng(11);
  const rnd = (a: number, c: number) => a + (c - a) * R();

  const wood = countershade(grain("#6a3f4e", "#4a2a3c", { size: 0.012, axis: "y", seed: 3 }), "#3a2030", { level: -0.2 });
  const woodH = grain("#74455a", "#4e2c40", { size: 0.012, axis: "x", seed: 5 });
  const back = mottle("#2a1a3c", "#3a2552", { size: 0.08, seed: 2 });

  const box = (w: number, h: number, d: number, color: any, x: number, y: number, z: number, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], ...extra });

  // ---------- textures
  const spineTex = (n: number, rune: number) => {
    let s = "";
    for (let i = 0; i < n; i++) s += `<rect x="0" y="${14 + i * 12}" width="40" height="4" fill="${GOLD}"/>`;
    s += `<rect x="0" y="4" width="40" height="3" fill="${GOLD}"/><rect x="0" y="193" width="40" height="3" fill="${GOLD}"/>`;
    const ry = 90 + rune * 6;
    const runes = [
      `<path d="M20 ${ry - 16} L20 ${ry + 16} M10 ${ry - 6} L30 ${ry + 6} M30 ${ry - 6} L10 ${ry + 6}" stroke="${GOLD}" stroke-width="4" fill="none"/>`,
      `<circle cx="20" cy="${ry}" r="10" stroke="${GOLD}" stroke-width="4" fill="none"/><circle cx="20" cy="${ry}" r="3" fill="${GOLD}"/>`,
      `<path d="M20 ${ry - 16} L30 ${ry} L20 ${ry + 16} L10 ${ry}Z" stroke="${GOLD}" stroke-width="4" fill="none"/>`,
      `<path d="M10 ${ry + 14} L20 ${ry - 14} L30 ${ry + 14} M13 ${ry + 4} L27 ${ry + 4}" stroke="${GOLD}" stroke-width="4" fill="none"/>`,
    ];
    return svg(`<svg viewBox="0 0 40 200">${s}${runes[rune % 4]}</svg>`, { size: 128 });
  };
  const SPINES = [0, 1, 2, 3, 4, 5].map((i) => spineTex(1 + (i % 3), i));
  const ORB_TEX = (c1: string, c2: string) =>
    svg(
      `<svg viewBox="0 0 64 64"><defs><radialGradient id="g" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs><rect width="64" height="64" fill="url(#g)"/><path d="M0 40 Q16 28 32 40 T64 38" stroke="#ffffff" stroke-opacity=".5" stroke-width="3" fill="none"/><path d="M0 22 Q20 12 40 22 T64 18" stroke="#ffffff" stroke-opacity=".4" stroke-width="2" fill="none"/></svg>`,
      { size: 128 },
    );
  const MOON = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#2a1a52" stroke="${GOLD}" stroke-width="5"/><path d="M60 22 A30 30 0 1 0 60 78 A24 24 0 1 1 60 22Z" fill="${GOLD}"/><path d="M74 30 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3Z" fill="#fff6c8"/><circle cx="30" cy="26" r="2.5" fill="#fff6c8"/><circle cx="80" cy="66" r="2" fill="#fff6c8"/></svg>`,
    { size: 256 },
  );
  const RUNE_SIDE = svg(
    `<svg viewBox="0 0 40 200"><g stroke="${GOLD}" stroke-width="3" fill="none" stroke-linecap="round">${[0, 1, 2, 3, 4]
      .map((i) => `<path d="M20 ${20 + i * 38} l-9 12 9 12 9 -12Z"/><path d="M20 ${48 + i * 38} v6"/>`)
      .join("")}</g></svg>`,
    { size: 128 },
  );
  const PAPER = svg(
    `<svg viewBox="0 0 40 40"><rect width="40" height="40" fill="${PARCH}"/><g stroke="#8a6a3a" stroke-width="1.4" stroke-linecap="round"><path d="M5 10h26M5 16h20M5 22h28M5 28h16"/></g></svg>`,
    { size: 64 },
  );

  // ---------- carcass
  const W = 1.1, D = 0.36, H = 1.9;
  box(0.05, H, D, wood, -W / 2 - 0.025, H / 2, 0);
  box(0.05, H, D, wood, W / 2 + 0.025, H / 2, 0);
  box(W, H, 0.03, back, 0, H / 2, -D / 2 + 0.015);
  box(W + 0.1, 0.14, D + 0.04, woodH, 0, 0.07, 0.01); // plinth
  box(W + 0.14, 0.02, D + 0.06, GOLD, 0, 0.15, 0.01);
  const yB = [0.17, 0.6, 1.02, 1.44, 1.86];
  yB.forEach((y, i) => {
    box(W, 0.035, D - 0.03, woodH, 0, y, 0.01);
    if (i > 0) box(W, 0.012, 0.012, GOLD, 0, y + 0.0, D / 2 - 0.004); // gilt front edge
  });
  // gold trim and rune strips on sides
  for (const s of [1, -1]) {
    box(0.012, H - 0.2, 0.02, GOLD, s * (W / 2 + 0.052), H / 2 + 0.05, D / 2 - 0.02);
    b.part(new THREE.PlaneGeometry(0.06, 0.3), "#ffffff", {
      at: [s * (W / 2 + 0.052), 1.2, 0.0],
      dir: [s, 0, 0],
      axis: "z",
      texture: RUNE_SIDE,
    });
    for (const z of [-0.14, 0.14]) b.part(new THREE.SphereGeometry(0.035, 6, 5), GOLD, { at: [s * 0.52, 0.03, z] });
    box(0.09, 0.08, D + 0.06, WOOD_D, s * (W / 2 + 0.03), 1.92, 0.01); // cornice end blocks
  }
  box(W + 0.2, 0.06, D + 0.08, wood, 0, 1.91, 0.01);
  box(W + 0.22, 0.015, D + 0.1, GOLD, 0, 1.945, 0.01);
  // crown gable with moon
  b.extrude(
    [[-0.55, 0], [0.55, 0], [0.42, 0.14], [0.22, 0.26], [0, 0.4, "sharp"], [-0.22, 0.26], [-0.42, 0.14]],
    { at: [0, 1.95, 0.0], x: [1, 0, 0], thickness: 0.05, bevel: 0.008, smoothing: 1, color: wood },
  );
  b.part(new THREE.CircleGeometry(0.13, 20), "#ffffff", { at: [0, 2.14, 0.03], dir: [0, 0, 1], axis: "z", texture: MOON });
  b.spike([0, 2.35, 0], [0, 1, 0], 0.12, 0.025, { color: GOLD });
  for (const s of [1, -1]) {
    b.spike([s * 0.5, 1.95, 0.0], [0, 1, 0], 0.16, 0.025, { color: GOLD });
    b.part(new THREE.SphereGeometry(0.03, 6, 5), "#ffeeaa", { at: [s * 0.5, 2.13, 0] });
  }

  // ---------- helpers
  const upright = (x: number, base: number, w: number, h: number, color: string, lean = 0) => {
    const d = 0.24;
    const a = (lean * Math.PI) / 180;
    const cy = base + (h / 2) * Math.cos(a) + (w / 2) * Math.sin(Math.abs(a));
    box(w, h, d, color, x, cy, 0.02, { rotation: [0, 0, lean] });
    // spine drawing
    const p = b.part(new THREE.PlaneGeometry(w - 0.004, h - 0.012), "#ffffff", {
      at: [x + Math.sin(a) * 0, cy, 0.02 + d / 2 + 0.002],
      texture: SPINES[Math.floor(R() * 6)],
      rotation: [0, 0, lean],
    });
    return p;
  };
  const booksRun = (x0: number, x1: number, base: number, hMax: number, leanEnd = false) => {
    let x = x0;
    while (x < x1 - 0.04) {
      const w = rnd(0.035, 0.07);
      if (x + w > x1) break;
      const h = rnd(hMax * 0.7, hMax);
      const col = BOOKS[Math.floor(R() * BOOKS.length)];
      upright(x + w / 2, base, w, h, col);
      x += w + 0.002;
    }
    if (leanEnd && x + 0.09 < x1 + 0.1) {
      upright(x + 0.07, base, 0.05, hMax * 0.85, BOOKS[Math.floor(R() * BOOKS.length)], -14);
      x += 0.12;
    }
    return x;
  };
  const flatBook = (x: number, y: number, w: number, d: number, th: number, color: string, yaw = 0) => {
    const o = { rotation: [0, yaw, 0] as number[] };
    box(w, 0.008, d, color, x, y + 0.004, 0.02, o);
    box(w, 0.008, d, color, x, y + th - 0.004, 0.02, o);
    box(w - 0.012, th - 0.016, d - 0.012, CREAM, x + 0.006, y + th / 2, 0.02, o);
    box(0.012, th, d, color, x - w / 2 + 0.006, y + th / 2, 0.02, o);
    box(0.03, 0.004, 0.03, GOLD, x + w / 2 - 0.02, y + th + 0.002, 0.02 + d / 2 - 0.02, o); // corner clasp
    return y + th;
  };
  const orb = (x: number, base: number, r: number, c1: string, c2: string, z = 0.03) => {
    b.lathe([[0, 0], [0.06, 0], [0.065, 0.012], [0.03, 0.03], [0.025, 0.05], [0.05, 0.075], [0, 0.075]], {
      at: [x, base, z], segments: 8, color: GOLD,
    });
    for (let i = 0; i < 3; i++) {
      const a = (i * 2 * Math.PI) / 3;
      b.spike([x + Math.sin(a) * 0.045, base + 0.05, z + Math.cos(a) * 0.045], [Math.sin(a) * 0.3, 1, Math.cos(a) * 0.3], 0.07, 0.008, { color: GOLD });
    }
    glow(
      b.part(new THREE.SphereGeometry(r, 12, 9), "#ffffff", { at: [x, base + 0.07 + r * 0.8, z], texture: ORB_TEX(c1, c2) }),
      1.3,
    );
  };
  const candle = (x: number, base: number, h: number, z = 0.03) => {
    b.part(new THREE.CylinderGeometry(0.045, 0.05, 0.012, 8), GOLD, { at: [x, base + 0.006, z] });
    b.part(new THREE.TorusGeometry(0.03, 0.006, 4, 8), GOLD, { at: [x + 0.04, base + 0.025, z], dir: [0, 0, 1], axis: "z" });
    b.part(new THREE.CylinderGeometry(0.02, 0.022, h, 8), CREAM, { at: [x, base + 0.012 + h / 2, z] });
    b.part(new THREE.CylinderGeometry(0.0235, 0.021, 0.03, 8), "#fff7e0", { at: [x, base + 0.012 + h - 0.012, z] }); // melted top
    b.part(new THREE.SphereGeometry(0.008, 5, 4), CREAM, { at: [x + 0.018, base + 0.012 + h * 0.6, z + 0.012] }); // drip
    b.rod([x, base + 0.012 + h, z], [x, base + 0.012 + h + 0.015, z], 0.002, "#222222");
    glow(b.spike([x, base + 0.012 + h + 0.01, z], [0, 1, 0], 0.06, 0.016, { color: "#ffb43c" }), 1.6);
    glow(b.spike([x, base + 0.012 + h + 0.01, z], [0, 1, 0], 0.035, 0.009, { color: "#fff2a0" }), 1.8);
  };
  const crystal = (x: number, base: number, z = 0.03) => {
    const cs = [[0, 0, 0.14, 0.03, 0], [0.04, 0.01, 0.09, 0.022, 18], [-0.035, 0.015, 0.1, 0.024, -20], [0.01, -0.03, 0.07, 0.018, 8]];
    for (const [dx, dz, h, r, t] of cs) {
      glow(b.spike([x + dx, base, z + dz], [Math.sin((t * Math.PI) / 180), 1, 0], h, r, { color: "#7ee8ff", sides: 6, caps: "point" } as any), 1.2);
    }
    b.part(new THREE.CylinderGeometry(0.06, 0.07, 0.02, 7), "#4a3a6a", { at: [x, base + 0.01, z] });
  };
  const scroll = (x: number, y: number, len: number, z = 0.03, col = "#c23b4e") => {
    b.part(new THREE.CylinderGeometry(0.028, 0.028, len, 8), "#ffffff", { at: [x, y, z], dir: [1, 0, 0], texture: PAPER });
    for (const s of [1, -1]) {
      b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 6), GOLD, { at: [x + (s * len) / 2, y, z], dir: [1, 0, 0] });
      b.part(new THREE.SphereGeometry(0.018, 6, 4), GOLD, { at: [x + (s * (len + 0.03)) / 2, y, z] });
    }
    b.part(new THREE.CylinderGeometry(0.031, 0.031, 0.02, 8), col, { at: [x - len * 0.2, y, z], dir: [1, 0, 0] });
    b.rod([x - len * 0.2, y - 0.03, z], [x - len * 0.2 - 0.03, y - 0.1, z + 0.02], 0.004, col);
  };
  const top = (i: number) => yB[i] + 0.0175;

  // ---------- row 0 (bottom): tomes + flat stack + orb
  let e = booksRun(-0.52, 0.0, top(0), 0.36, true);
  let sy = top(0);
  sy = flatBook(0.2, sy, 0.3, 0.22, 0.06, BOOKS[0], 4);
  sy = flatBook(0.2, sy, 0.27, 0.2, 0.05, BOOKS[2], -6);
  sy = flatBook(0.21, sy, 0.24, 0.19, 0.045, BOOKS[1], 8);
  orb(0.2, sy, 0.055, "#ff9ad5", "#7a2cc0");
  booksRun(0.38, 0.52, top(0), 0.33);

  // ---------- row 1: scroll rack + books
  booksRun(-0.52, -0.15, top(1), 0.34);
  // rack of scrolls
  box(0.34, 0.015, 0.2, woodH, -0.0, top(1) + 0.15, 0.03);
  box(0.02, 0.15, 0.2, wood, -0.16, top(1) + 0.075, 0.03);
  box(0.02, 0.15, 0.2, wood, 0.16, top(1) + 0.075, 0.03);
  scroll(0, top(1) + 0.19, 0.3, 0.03, "#2c9a8a");
  scroll(-0.02, top(1) + 0.255, 0.3, 0.03, "#c23b4e");
  scroll(0.0, top(1) + 0.075, 0.3, 0.03, "#5a2a8c");
  b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.3, 8), "#ffffff", { at: [0, top(1) + 0.0, 0.03], dir: [1, 0, 0], texture: PAPER, scale: [0.001, 0.001, 0.001] });
  booksRun(0.22, 0.52, top(1), 0.37, true);

  // ---------- row 2: candles, books, orb
  candle(-0.46, top(2), 0.12);
  booksRun(-0.38, -0.03, top(2), 0.35);
  orb(0.13, top(2), 0.065, "#9af0ff", "#2a6cd8");
  candle(0.3, top(2), 0.2);
  candle(0.42, top(2), 0.09, 0.06);
  booksRun(0.47, 0.54, top(2), 0.3);

  // ---------- row 3: crystal, orbs, books
  crystal(-0.42, top(3));
  booksRun(-0.3, 0.05, top(3), 0.3);
  orb(0.2, top(3), 0.05, "#ffe27a", "#d86a1a");
  orb(0.38, top(3), 0.04, "#a8ff9a", "#1f9a5a", 0.05);

  // ---------- top: candles & stack
  box(0.34, 0.01, 0.2, "#5a2a8c", -0.32, 1.887, 0.04);
  flatBook(-0.32, 1.895, 0.3, 0.2, 0.05, BOOKS[3], 6);
  flatBook(-0.32, 1.945, 0.26, 0.18, 0.045, BOOKS[5], -5);
  candle(-0.32, 1.99, 0.12);
  candle(0.3, top(4), 0.17, 0.04);
  candle(0.4, top(4), 0.08, 0.1);
  scroll(0.0, top(4) + 0.03, 0.3, 0.1, "#2c9a8a");

  return b.root;
}
