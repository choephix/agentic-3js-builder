import * as THREE from "three";
import { createBuilder, rng, paint, mix, noise, grain, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Wizard's Bookshelf",
  description: "A tall anime-fantasy bookshelf crowded with tomes, scrolls, glowing orbs and candles.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "wizardBookshelf", paintSize: 1024 });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(7);

  const WOOD = grain("#5a3a6e", "#8a5a8e", { size: 0.05, axis: "y", seed: 3 });
  const WOOD_D = grain("#3a2450", "#5a3a6e", { size: 0.05, axis: "y", seed: 4 });
  const GOLD = "#ffd24d";
  const CREAM = "#fff1d0";
  const covers = ["#c8324f", "#2d4a9a", "#2fa88f", "#7a3fb0", "#e08a2c", "#3a7a3a"];

  const box = (s: V, at: V, c: any, rot?: V) =>
    b.part(new THREE.BoxGeometry(...s), c, { bone: root, at, rotation: rot, flat: true });

  // carcass
  const W = 1.6, H = 2.1, D = 0.42;
  for (const s of [-1, 1]) box([0.08, H, D], [s * (W / 2), H / 2, 0], WOOD);
  box([W + 0.16, 0.1, D + 0.06], [0, 0.05, 0], WOOD_D);
  box([W + 0.2, 0.1, D + 0.1], [0, H + 0.05, 0], WOOD);
  box([W, H, 0.04], [0, H / 2, -D / 2 + 0.02], WOOD_D);
  // arched crown
  b.extrude(
    [[-0.8, 0], [0.8, 0], [0.6, 0.18], [0.25, 0.3], [0, 0.4, "sharp"], [-0.25, 0.3], [-0.6, 0.18]],
    { at: [0, H + 0.1, 0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.1, bevel: 0.02, color: WOOD, bone: root },
  );
  const rune = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="none" stroke="#ffe27e" stroke-width="5"/><path d="M32 12 L48 44 L16 44 Z M32 52 V28" fill="none" stroke="#fff" stroke-width="4"/></svg>`,
    { size: 128 },
  );
  glow(b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", { bone: root, at: [0, H + 0.28, 0.06], dir: [0, 0, 1], axis: "z", texture: rune }), 1.2);
  for (const s of [-1, 1]) {
    b.part(new THREE.ConeGeometry(0.05, 0.2, 5), GOLD, { bone: root, at: [s * 0.82, H + 0.22, 0] });
  }

  // shelves
  const levels = [0.1, 0.55, 1.0, 1.45, 1.9];
  levels.forEach((y, i) => { if (i > 0) box([W, 0.05, D], [0, y, 0], WOOD_D); });

  const bookRow = (y0: number, x0: number, x1: number) => {
    let x = x0;
    while (x < x1 - 0.1) {
      const w = 0.05 + R() * 0.05;
      const h = 0.3 + R() * 0.12;
      const c = covers[Math.floor(R() * covers.length)];
      const lean = R() < 0.1 ? 12 : 0;
      box([w, h, 0.28], [x + w / 2, y0 + h / 2, 0], c, [0, 0, lean]);
      box([w + 0.004, 0.02, 0.285], [x + w / 2, y0 + h * 0.8, 0], GOLD, [0, 0, lean]);
      x += w + 0.004;
    }
    return x;
  };
  const bottom = (i: number) => levels[i] + 0.025;
  bookRow(bottom(0), -0.76, 0.1);
  bookRow(bottom(1), -0.76, -0.1);
  bookRow(bottom(3), 0.2, 0.76);
  bookRow(bottom(2), -0.2, 0.4);

  // stacked big tomes
  for (let k = 0; k < 4; k++) {
    box([0.4 - k * 0.03, 0.07, 0.3], [0.45, bottom(0) + 0.035 + k * 0.075, 0], covers[k], [0, k * 12, 0]);
    box([0.37 - k * 0.03, 0.05, 0.28], [0.45, bottom(0) + 0.035 + k * 0.075, 0.01], CREAM, [0, k * 12, 0]);
  }

  // scrolls
  for (let i = 0; i < 4; i++) {
    const y = bottom(2) + 0.07;
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.42, 8), CREAM, { bone: root, at: [0.55, y + i * 0.0, -0.1 + i * 0.001], rotation: [0, 0, 90] });
    break;
  }
  for (let i = 0; i < 5; i++) {
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8), i % 2 ? CREAM : "#e8d3a0", { bone: root, at: [0.55, bottom(2) + 0.03 + (i % 2) * 0.06, -0.1 + (i >> 1) * 0.06 - 0.02], rotation: [0, 0, 90] });
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 8), "#c8324f", { bone: root, at: [0.35, bottom(2) + 0.03 + (i % 2) * 0.06, -0.1 + (i >> 1) * 0.06 - 0.02], rotation: [0, 0, 90] });
  }

  // orbs on stands
  const orbs: [number, number, string][] = [[-0.45, 2, "#5ff2e0"], [0.3, 3, "#c080ff"], [-0.5, 1, "#ffb347"]];
  for (const [x, lv, col] of orbs) {
    const y = bottom(lv);
    b.part(new THREE.CylinderGeometry(0.09, 0.11, 0.05, 8), GOLD, { bone: root, at: [x, y + 0.025, 0] });
    glow(b.part(new THREE.SphereGeometry(0.1, 10, 8), col, { bone: root, at: [x, y + 0.15, 0] }), 1.4);
    b.part(new THREE.TorusGeometry(0.11, 0.012, 4, 12), GOLD, { bone: root, at: [x, y + 0.15, 0], rotation: [70, 0, 20] });
    glow(b.part(new THREE.OctahedronGeometry(0.03, 0), "#ffffff", { bone: root, at: [x - 0.03, y + 0.19, 0.06] }), 1.8);
  }

  // candles
  const candle = (x: number, y: number, h: number) => {
    b.part(new THREE.CylinderGeometry(0.07, 0.08, 0.02, 8), GOLD, { bone: root, at: [x, y + 0.01, 0.05] });
    b.part(new THREE.CylinderGeometry(0.025, 0.03, h, 8), CREAM, { bone: root, at: [x, y + h / 2 + 0.02, 0.05] });
    glow(b.part(new THREE.ConeGeometry(0.02, 0.06, 6), "#ff9a2c", { bone: root, at: [x, y + h + 0.05, 0.05] }), 1.6);
  };
  candle(-0.7, H + 0.0 + 0.1, 0.1);
  candle(0.7, H + 0.1, 0.14);
  candle(0.7, bottom(3), 0.1);
  candle(-0.15, bottom(1), 0.08);
  // wax drips and a skull-less crystal on top
  glow(b.part(new THREE.OctahedronGeometry(0.08, 0), "#7ffff0", { bone: root, at: [0, H + 0.55, 0], scale: [0.8, 1.6, 0.8] }), 1.5);

  // hanging star charm and tassels
  const tassel = svg(`<svg viewBox="0 0 24 64"><circle cx="12" cy="7" r="6" fill="#ffd24d"/><path d="M5 18H19L22 62H2Z" fill="#c8324f"/></svg>`, { size: 96 });
  b.cards(
    [-0.78, 0.78].map((x) => ({ at: new THREE.Vector3(x, H - 0.05, 0.22), axis: new THREE.Vector3(0, 1, 0) })) as any,
    tassel,
    { size: [0.08, 0.25], lean: 180, flow: [0, 0, 1], sink: 0, bone: root },
  );

  // feet
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    b.part(new THREE.SphereGeometry(0.07, 6, 4), GOLD, { bone: root, at: [sx * 0.82, 0.04, sz * 0.2] });

  return b.root;
}
