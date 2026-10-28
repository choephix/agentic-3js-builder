```ts
import * as THREE from "three";
import { createBuilder, rng, svg, paint, noise, mix, grain, mottle, countershade, frame } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "alchemist_workbench",
  description: "Genshin-style alchemist's workbench with potions, books, balance scales, herbs, mortar and burner.",
};

export default function build() {
  const b = createBuilder({ name: "workbench" });
  const R = rng(7);

  const WOOD = countershade(grain("#8a5a34", "#6a4125", { size: 0.02 }), "#4a2c18");
  const WOOD2 = grain("#a56d3c", "#7d4e2a", { size: 0.015, axis: "x", seed: 3 });
  const BRASS = "#d9a93f", DARK = "#2c2230", CREAM = "#f0e2bd", RED = "#a8322e", TEAL = "#2f8f86", PURPLE = "#6b4aa0";
  const CLOTH = paint((p) => mix("#2f6f6a", "#e8c76a", (Math.floor(p.x / 0.04) + Math.floor(p.z / 0.04)) % 2 ? 0.0 : 0.0 + (noise(p, 0.1) > 0.5 ? 0.08 : 0)));

  const box = (w: number, h: number, d: number, c: any, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, rotation: rot });
  const cyl = (rt: number, rb: number, h: number, c: any, at: number[], seg = 8) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at });

  // Table: top 1.6 x 0.8, height 0.9
  box(1.7, 0.08, 0.85, WOOD2, [0, 0.86, 0]);
  box(1.74, 0.03, 0.89, BRASS, [0, 0.815, 0]);
  for (const sx of [1, -1]) for (const sz of [1, -1]) {
    box(0.09, 0.8, 0.09, WOOD, [sx * 0.75, 0.4, sz * 0.36]);
    box(0.11, 0.05, 0.11, BRASS, [sx * 0.75, 0.04, sz * 0.36]);
  }
  box(1.5, 0.05, 0.07, WOOD, [0, 0.2, 0.36]);
  box(1.5, 0.05, 0.07, WOOD, [0, 0.2, -0.36]);
  box(1.45, 0.04, 0.7, WOOD2, [0, 0.22, 0]);
  // lower shelf items
  for (let i = 0; i < 3; i++) cyl(0.07, 0.08, 0.2, i % 2 ? "#7a5030" : "#5f3d22", [-0.5 + i * 0.18, 0.34, 0.1], 10);
  box(0.4, 0.14, 0.28, "#5a3a22", [0.4, 0.31, 0], [0, 8, 0]);
  box(0.42, 0.03, 0.3, BRASS, [0.4, 0.395, 0], [0, 8, 0]);

  // Runner cloth
  box(0.5, 0.012, 0.7, CLOTH, [-0.2, 0.906, 0]);

  const top = 0.91;
  // Back shelf with potion rack
  for (const sx of [1, -1]) box(0.06, 0.7, 0.06, WOOD, [sx * 0.8, top + 0.35, -0.36]);
  box(1.66, 0.05, 0.14, WOOD2, [0, top + 0.68, -0.35]);
  box(1.66, 0.04, 0.14, WOOD2, [0, top + 0.38, -0.35]);
  box(1.7, 0.08, 0.18, WOOD, [0, top + 0.75, -0.35]);
  box(1.72, 0.015, 0.2, BRASS, [0, top + 0.79, -0.35]);

  // Potions
  const bottle = (x: number, y: number, z: number, col: string, s: number, kind: number) => {
    const body = kind === 0
      ? new THREE.SphereGeometry(0.06 * s, 8, 6)
      : new THREE.CylinderGeometry(0.045 * s, 0.05 * s, 0.12 * s, 8);
    const by = y + (kind === 0 ? 0.06 * s : 0.06 * s);
    glow(b.part(body, col, { at: [x, by, z] }), 0.8);
    cyl(0.018 * s, 0.025 * s, 0.07 * s, "#bfe3e0", [x, by + 0.09 * s, z], 6);
    cyl(0.026 * s, 0.022 * s, 0.03 * s, "#8a5a34", [x, by + 0.14 * s, z], 6);
  };
  const cols = ["#ff5a7a", "#4fd1c5", "#b57cff", "#ffd24a", "#6ee06e", "#ff9a3c"];
  for (let i = 0; i < 7; i++) bottle(-0.7 + i * 0.22, top + 0.4, -0.35, cols[i % 6], 1 + (i % 3) * 0.1, i % 2);
  for (let i = 0; i < 6; i++) bottle(-0.62 + i * 0.24, top + 0.8, -0.35, cols[(i + 3) % 6], 0.9 + (i % 2) * 0.2, (i + 1) % 2);

  // Hanging herbs bundles from top beam
  const herbTex = svg(`<svg viewBox="0 0 32 64"><path d="M16 62 L16 8" stroke="#1d4a22" stroke-width="3"/><g fill="#4fae52" stroke="#1d4a22" stroke-width="1.5"><path d="M16 50 Q2 44 4 32 Q14 36 16 50Z"/><path d="M16 40 Q30 34 28 22 Q18 26 16 40Z"/><path d="M16 28 Q4 22 8 10 Q16 16 16 28Z"/><path d="M16 18 Q26 12 22 3 Q14 8 16 18Z" fill="#7fd06a"/></g></svg>`, { size: 128 });
  for (let i = 0; i < 5; i++) {
    const x = -0.6 + i * 0.3;
    b.rod([x, top + 0.74, -0.35], [x, top + 0.62, -0.35], 0.006, "#5a3a22");
    b.cards([frame([x, top + 0.74, -0.3], [0, 1, 0])], herbTex, { size: [0.14, 0.3], lean: 180, flow: [0, 0, 1], cross: true });
    box(0.05, 0.03, 0.05, RED, [x, top + 0.72, -0.3]);
  }

  // Books stack (right)
  const bk = [[0.34, 0.07, 0.24, RED, 4], [0.3, 0.06, 0.22, TEAL, -6], [0.32, 0.055, 0.22, PURPLE, 3], [0.26, 0.05, 0.19, "#c9892f", -4]];
  let y = top;
  bk.forEach(([w, h, d, c, r]: any) => {
    box(w, h, d, c, [0.55, y + h / 2, 0.05], [0, r, 0]);
    box(w - 0.02, h - 0.02, d + 0.01, CREAM, [0.56, y + h / 2, 0.055], [0, r, 0]);
    box(0.012, h + 0.002, d + 0.004, BRASS, [0.55 - w / 2, y + h / 2, 0.05], [0, r, 0]);
    y += h;
  });
  // open book
  const rune = svg(`<svg viewBox="0 0 64 48"><rect width="64" height="48" fill="#f3e6c4"/><g stroke="#5a3a22" stroke-width="1.5" fill="none"><path d="M6 8H28M6 14H28M6 20H26M36 8H58M36 14H58M36 20H54"/><circle cx="18" cy="36" r="7"/><path d="M18 29V43M11 36H25"/><path d="M46 29L53 43H39Z"/></g></svg>`, { size: 192 });
  box(0.3, 0.025, 0.22, RED, [0.0, top + 0.02, 0.22]);
  b.part(new THREE.PlaneGeometry(0.27, 0.2), "#ffffff", { at: [0, top + 0.036, 0.22], dir: [0, 1, 0], axis: "z", texture: rune });

  // Balance scales (left)
  const sx0 = -0.6, sz0 = 0.18;
  cyl(0.07, 0.09, 0.03, BRASS, [sx0, top + 0.015, sz0], 10);
  cyl(0.015, 0.02, 0.4, BRASS, [sx0, top + 0.2, sz0]);
  b.part(new THREE.SphereGeometry(0.03, 8, 6), BRASS, { at: [sx0, top + 0.42, sz0] });
  box(0.5, 0.02, 0.02, BRASS, [sx0, top + 0.4, sz0], [0, 0, 3]);
  for (const s of [1, -1]) {
    const px = sx0 + s * 0.25, py = top + 0.4 - s * 0.013 - 0.15;
    for (const dz of [-0.04, 0.04]) b.rod([px, py + 0.15, sz0], [px + (dz ? 0 : 0), py + 0.02, sz0 + dz], 0.003, BRASS);
    b.lathe([[0, 0], [0.09, 0.02], [0.1, 0.035], [0.09, 0.03], [0, 0.012]], { at: [px, py, sz0], color: BRASS, segments: 12 });
  }
  glow(b.part(new THREE.OctahedronGeometry(0.03), "#8ff0ff"), 1.4).mesh.position.set(sx0 + 0.25, top + 0.4 - 0.013 - 0.12, sz0);
  for (let i = 0; i < 3; i++) cyl(0.012, 0.014, 0.015, "#aaa", [sx0 - 0.25 + i * 0.03 - 0.03, top + 0.4 + 0.013 - 0.15 + 0.03, sz0], 8);

  // Mortar & pestle
  b.lathe([[0, 0], [0.05, 0], [0.09, 0.07], [0.1, 0.09], [0.085, 0.09], [0.04, 0.03], [0, 0.03]], { at: [-0.05, top, 0.28], color: "#6e7280", segments: 10 });
  b.rod([-0.05, top + 0.05, 0.28], [-0.01, top + 0.16, 0.25], [0.012, 0.022], "#e8dcc0");
  box(0.04, 0.01, 0.04, "#6ee06e", [-0.05, top + 0.05, 0.28]);

  // Alchemy burner with flask
  cyl(0.1, 0.12, 0.03, "#3b3440", [0.2, top + 0.015, 0.25], 10);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    b.rod([0.2 + Math.cos(a) * 0.07, top + 0.03, 0.25 + Math.sin(a) * 0.07], [0.2 + Math.cos(a) * 0.05, top + 0.2, 0.25 + Math.sin(a) * 0.05], 0.007, BRASS);
  }
  b.part(new THREE.ConeGeometry(0.035, 0.1, 6), "#ff8a2a", { at: [0.2, top + 0.08, 0.25] });
  glow(b.part(new THREE.ConeGeometry(0.02, 0.07, 6), "#ffe27a", { at: [0.2, top + 0.075, 0.25] }), 2);
  glow(b.part(new THREE.SphereGeometry(0.075, 10, 7), "#7be0c4", { at: [0.2, top + 0.29, 0.25] }), 0.9);
  cyl(0.02, 0.03, 0.1, "#bfe3e0", [0.2, top + 0.39, 0.25], 8);
  b.part(new THREE.TorusGeometry(0.075, 0.006, 5, 12), BRASS, { at: [0.2, top + 0.2, 0.25], rotation: [90, 0, 0] });

  // Candle + herbs on table + gems
  cyl(0.02, 0.02, 0.1, CREAM, [0.8, top + 0.05, 0.15], 8);
  glow(b.part(new THREE.ConeGeometry(0.012, 0.04, 5), "#ffd24a", { at: [0.8, top + 0.12, 0.15] }), 2);
  const gem = (x: number, z: number, c: string) => glow(b.part(new THREE.OctahedronGeometry(0.025), c, { at: [x, top + 0.025, z] }), 1.2);
  gem(0.15, 0.0, "#ff6a9a"); gem(0.25, -0.05, "#6ad0ff"); gem(0.08, 0.05, "#b57cff");
  for (let i = 0; i < 6; i++) b.cards([frame([-0.2 + R() * 0.2, top + 0.012, 0.0 + R() * 0.15], [0, 1, 0])], herbTex, { size: [0.06, 0.12], lean: 85, flow: [R() - 0.5, 0, R() - 0.5], mirror: true });

  // Scroll
  b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.3, 8), CREAM, { at: [0.2, top + 0.025, -0.05], rotation: [0, 0, 90] });
  b.part(new THREE.CylinderGeometry(0.028, 0.028, 0.02, 8), RED, { at: [0.2, top + 0.025, -0.05], rotation: [0, 0, 90] });

  return b.root;
}
```