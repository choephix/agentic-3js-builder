import * as THREE from "three";
import { createBuilder, rng, paint, noise, mix, smoothstep, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Wizard's Bookshelf",
  description: "A tall arcane bookshelf with tomes, scrolls, glowing orbs and candles in a high-fantasy anime style.",
};

export default function build() {
  const b = createBuilder({ name: "wizardBookshelf" });
  const R = rng(11);

  const W = 1.4, H = 2.1, D = 0.38, T = 0.04;
  const WOOD = paint((p, n) => {
    const g = noise(p, 0.05, 3);
    const c = mix("#4a2a3e", "#7a4a52", g);
    return mix(c, "#a86a5a", smoothstep(0.6, 1, n.y) * 0.4);
  });
  const TRIM = "#e8b84a";
  const DARK = "#2a1630";

  const box = (w: number, h: number, d: number, col: any, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { at: [x, y, z] });

  // carcass
  box(T, H, D, WOOD, W / 2 - T / 2, H / 2, 0);
  box(T, H, D, WOOD, -W / 2 + T / 2, H / 2, 0);
  box(W, H, 0.02, DARK, 0, H / 2, -D / 2 + 0.01);
  const shelfY = [0.08, 0.55, 1.0, 1.45, 1.85];
  for (const y of shelfY) box(W, T, D, WOOD, 0, y, 0);
  // plinth
  box(W + 0.08, 0.08, D + 0.06, "#3a1f30", 0, 0.04, 0);
  // crown
  box(W + 0.12, 0.06, D + 0.08, "#3a1f30", 0, H + 0.03, 0);
  box(W + 0.04, 0.03, D + 0.02, TRIM, 0, H + 0.075, 0);
  // pointed gable
  b.extrude([[-0.5, 0], [0.5, 0], [0.12, 0.3], [-0.12, 0.3]], {
    at: [0, H + 0.09, 0], x: [1, 0, 0], thickness: D * 0.8, color: WOOD, bevel: 0.01,
  });
  // star emblem
  const star = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#2a1630" stroke="#e8b84a" stroke-width="4"/><path d="M32 8 L38 26 L57 26 L42 37 L48 56 L32 44 L16 56 L22 37 L7 26 L26 26Z" fill="#ffe27a" stroke="#fff3b0" stroke-width="2"/></svg>`, { size: 128 });
  glow(b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
    at: [0, H + 0.2, D * 0.4 + 0.012], dir: [0, 0, 1], axis: "z", texture: star,
  }), 0.8);
  // finials
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.03, 0.18, 6), TRIM, { at: [s * (W / 2 + 0.02), H + 0.15, 0] });
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), "#7af0ff", { at: [s * (W / 2 + 0.02), H + 0.27, 0] }), 1.5);
  }

  // tome spine texture
  const spineTex = svg(`<svg viewBox="0 0 16 64"><rect width="16" height="64" fill="#ffffff"/><rect y="6" width="16" height="3" fill="#8a8a8a"/><rect y="52" width="16" height="3" fill="#8a8a8a"/><circle cx="8" cy="30" r="3.5" fill="none" stroke="#444" stroke-width="1.5"/></svg>`, { size: 64 });
  const BOOKS = ["#7a2438", "#2c4a8a", "#2f6a4a", "#6a3a8a", "#a8622a", "#245a6a", "#8a2a5a"];

  const row = (shelf: number, x0: number, x1: number, h0: number) => {
    const y0 = shelfY[shelf] + T / 2;
    let x = x0;
    while (x < x1) {
      const w = 0.035 + R() * 0.04;
      const h = h0 + R() * 0.14;
      const d = D - 0.08 - R() * 0.04;
      if (x + w > x1) break;
      const col = BOOKS[Math.floor(R() * BOOKS.length)];
      const lean = R() < 0.1 ? 0.15 : 0;
      b.part(new THREE.BoxGeometry(w, h, d), col, { at: [x + w / 2, y0 + h / 2, 0.02], rotation: [0, 0, lean * 57] });
      b.part(new THREE.PlaneGeometry(w * 0.95, h * 0.9), TRIM, {
        at: [x + w / 2, y0 + h / 2, 0.02 + d / 2 + 0.002], dir: [0, 0, 1], axis: "z", texture: spineTex,
      });
      x += w + 0.004 + lean * 0.3;
    }
  };
  const L = -W / 2 + T, Rr = W / 2 - T;
  row(0, L + 0.02, Rr - 0.02, 0.28);
  row(1, L + 0.02, -0.15, 0.3);
  row(2, 0.25, Rr - 0.02, 0.28);
  row(3, L + 0.02, -0.4, 0.26);

  // stacked flat tomes
  const stack = (x: number, y: number, n: number) => {
    for (let i = 0; i < n; i++) {
      const w = 0.3 - i * 0.02;
      b.part(new THREE.BoxGeometry(w, 0.05, 0.22), BOOKS[(i * 3 + 1) % 7], { at: [x, y + 0.025 + i * 0.052, 0.03], rotation: [0, i * 12, 0] });
      b.part(new THREE.BoxGeometry(w - 0.02, 0.03, 0.2), "#f1e2b8", { at: [x + 0.01, y + 0.025 + i * 0.052, 0.04], rotation: [0, i * 12, 0] });
    }
  };
  stack(-0.15, shelfY[3] + T / 2, 4);
  stack(0.45, shelfY[1] + T / 2, 3);

  // scrolls in a rack (shelf 2 left)
  for (let i = 0; i < 6; i++) {
    const g = new THREE.CylinderGeometry(0.03, 0.03, 0.32, 8);
    const c = i % 2 ? "#f1e2b8" : "#e6cf98";
    b.part(g, c, { at: [-0.55 + (i % 3) * 0.075, shelfY[2] + 0.05 + Math.floor(i / 3) * 0.065, 0.02], rotation: [90, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.034, 0.034, 0.02, 8), "#a82a3a", { at: [-0.55 + (i % 3) * 0.075, shelfY[2] + 0.05 + Math.floor(i / 3) * 0.065, 0.17], rotation: [90, 0, 0] });
  }
  b.part(new THREE.BoxGeometry(0.28, 0.02, 0.3), "#3a1f30", { at: [-0.5, shelfY[2] + T / 2 + 0.01, 0.02] });

  // orbs
  const orb = (x: number, y: number, r: number, col: string, base = true) => {
    if (base) {
      b.part(new THREE.CylinderGeometry(r * 0.7, r * 0.9, 0.04, 8), TRIM, { at: [x, y + 0.02, 0.03] });
      b.part(new THREE.TorusGeometry(r * 0.75, 0.01, 4, 10), TRIM, { at: [x, y + 0.045, 0.03], rotation: [90, 0, 0] });
    }
    glow(b.part(new THREE.IcosahedronGeometry(r, 1), col, { at: [x, y + 0.04 + r * 0.9, 0.03], flat: true }), 1.3);
  };
  orb(0.0, shelfY[1] + T / 2, 0.09, "#7ad8ff");
  orb(-0.5, shelfY[1] + T / 2, 0.06, "#c58aff");
  orb(0.15, shelfY[2] + T / 2, 0.07, "#8affb0");
  orb(0.2, shelfY[4] + T / 2, 0.11, "#ff8ad0");
  orb(-0.35, shelfY[4] + T / 2, 0.07, "#7ad8ff");

  // skull-ish crystal cluster top shelf
  for (let i = 0; i < 3; i++)
    glow(b.part(new THREE.ConeGeometry(0.03 + i * 0.01, 0.16 + i * 0.05, 5), "#9a8aff", {
      at: [0.5 + i * 0.06, shelfY[4] + T / 2 + 0.1 + i * 0.02, 0.03], rotation: [0, i * 30, (i - 1) * 12], flat: true,
    }), 1.2);

  // candles
  const candle = (x: number, y: number, h: number) => {
    b.part(new THREE.CylinderGeometry(0.07, 0.08, 0.02, 8), TRIM, { at: [x, y + 0.01, 0.05] });
    b.part(new THREE.CylinderGeometry(0.035, 0.04, h, 8), "#f6ecd2", { at: [x, y + 0.02 + h / 2, 0.05] });
    b.part(new THREE.SphereGeometry(0.045, 6, 4), "#f6ecd2", { at: [x, y + 0.02 + h, 0.05], scale: [1, 0.35, 1] });
    glow(b.part(new THREE.ConeGeometry(0.02, 0.07, 6), "#ffb23a", { at: [x, y + 0.06 + h, 0.05] }), 2);
    glow(b.part(new THREE.ConeGeometry(0.01, 0.04, 5), "#fff2a0", { at: [x, y + 0.05 + h, 0.05] }), 2);
  };
  candle(0.55, shelfY[2] + T / 2, 0.14);
  candle(0.4, shelfY[2] + T / 2, 0.08);
  candle(-0.1, shelfY[4] + T / 2, 0.2);
  candle(0.05, shelfY[3] + T / 2, 0.12);
  candle(0.58, shelfY[3] + T / 2, 0.18);
  candle(-0.62, shelfY[1] + T / 2, 0.1);
  // melted wax drips
  for (let i = 0; i < 3; i++)
    b.part(new THREE.SphereGeometry(0.015, 5, 4), "#f6ecd2", { at: [0.58 + 0.03 * (i - 1), shelfY[3] + 0.2, 0.09], scale: [1, 1.8, 1] });

  // bottom cabinet doors
  for (const s of [1, -1]) {
    box(W / 2 - 0.06, 0.4, 0.025, "#5a2f48", s * (W / 4 - 0.005), 0.31, D / 2 + 0.005);
    box(W / 2 - 0.14, 0.3, 0.015, "#6a3a56", s * (W / 4 - 0.005), 0.31, D / 2 + 0.02);
    b.part(new THREE.SphereGeometry(0.025, 6, 4), TRIM, { at: [s * 0.05, 0.31, D / 2 + 0.04] });
  }
  box(0.01, 0.4, 0.03, TRIM, 0, 0.31, D / 2 + 0.01);

  // hanging cobweb-free bunting rune banner over shelf 3
  const rune = svg(`<svg viewBox="0 0 32 48"><path d="M0 0H32V48L16 38L0 48Z" fill="#2c4a8a" stroke="#e8b84a" stroke-width="2"/><path d="M16 8V28M10 14L22 22M22 14L10 22" stroke="#ffe27a" stroke-width="2.5" fill="none"/></svg>`, { size: 96 });
  b.part(new THREE.PlaneGeometry(0.14, 0.21), "#ffffff", { at: [0.45, shelfY[4] - 0.14, D / 2 + 0.005], dir: [0, 0, 1], axis: "z", texture: rune });

  return b.root;
}
