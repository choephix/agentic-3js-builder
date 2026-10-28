import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { cellPaint, pixelTexture, pixelArt, bayer, pick } from "../../../../kits/pixel";

export const meta = {
  name: "Monster Truck",
  description: "Pixel-art monster truck with huge tyres, flame livery, roll light bar and stacks.",
};

export default function build() {
  const b = createBuilder({ name: "monster_truck" });

  const TEXEL = 0.06;
  const RED = ["#5a0f10", "#8e1a16", "#c42a1c", "#e8502a"];
  const RUBBER = ["#0c0c10", "#17171d", "#23232b", "#2f2f39"];
  const STEEL = ["#4a4d5a", "#6e7285", "#98a0b8", "#c4cce0"];
  const YELLOW = "#f2c230";

  const bodyPaint = cellPaint(
    TEXEL,
    (c) => c.pick(RED, 0.45 + 0.4 * c.n.y + 0.12 * (c.random(2) - 0.5)),
    { dither: true },
  );
  const rubber = cellPaint(0.05, (c) => c.pick(RUBBER, 0.3 + 0.4 * c.random(1) + 0.1 * c.n.y));
  const steel = cellPaint(0.04, (c) => c.pick(STEEL, 0.4 + 0.3 * c.n.y + 0.3 * c.random(4)), { dither: true });
  const chassisPaint = cellPaint(0.05, (c) => c.pick(["#15151b", "#22222c", "#30303c"], 0.4 + 0.3 * c.random(3) + 0.3 * c.n.y));

  const box = (w: number, h: number, d: number, col: any, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { at, rotation: rot });
  const cyl = (r: number, h: number, seg: number, col: any, at: number[], dir: number[]) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), col, { at, dir });

  // textures
  const WINDOW = pixelTexture(16, 8, (g) => {
    g.fill((x, y) => (y < 1 || y > 6 || x < 1 || x > 14 ? "#0a0a10" : y < 3 ? "#3d6fa8" : "#2a4a7a"));
    g.fill((x, y) => ((x + y) % 7 === 0 && y > 0 && y < 7 && x > 0 && x < 15 ? "#8fc0ee" : undefined));
  });
  const GRILLE = pixelTexture(16, 8, (g) => {
    g.fill((x, y) => (y === 0 || y === 7 || x === 0 || x === 15 ? "#c4cce0" : x % 2 === 0 ? "#08080c" : "#6e7285"));
  });
  const FLAME = pixelTexture(40, 14, (g) => {
    g.fill((x, y, w, h) => {
      const fh = 3 + Math.abs(Math.sin(x * 0.75)) * 8 * (1 - x / (w + 8)) + (x % 5 === 0 ? 2 : 0);
      const d = h - 1 - y;
      if (d > fh) return undefined;
      return d > fh * 0.65 ? "#ffe45a" : d > fh * 0.3 ? "#ff9a1e" : "#f2d040";
    });
  });
  const PLATE = pixelArt(
    ["wwwwwwww", "wkkwkkkw", "wkwwkwkw", "wkkwkkkw", "wwwwwwww"],
    { w: "#f4ecd0", k: "#1a1a24" },
  );
  const STRIPE = pixelTexture(16, 4, (g) =>
    g.fill((x, y) => ((x + y) % 4 < 2 ? YELLOW : "#15151b")),
  );

  // chassis
  for (const s of [1, -1]) {
    box(0.18, 0.22, 4.3, chassisPaint, [s * 0.55, 1.2, 0]);
    box(0.08, 0.5, 0.08, chassisPaint, [s * 0.55, 1.6, 0.5]);
  }
  for (const z of [-1.9, -0.5, 0.6, 1.9]) box(1.28, 0.16, 0.16, chassisPaint, [0, 1.2, z]);
  // engine block and diff
  box(0.9, 0.5, 0.8, steel, [0, 1.55, 1.4]);
  for (let i = 0; i < 4; i++) cyl(0.07, 0.25, 6, "#c4cce0", [-0.3 + i * 0.2, 1.9, 1.4], [0, 1, 0]);
  cyl(0.06, 3.0, 6, "#30303c", [0, 1.1, 0], [0, 0, 1]);

  // wheels
  const WR = 0.86;
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const cx = sx * 1.4;
      const cz = sz * 1.55;
      cyl(0.8, 0.9, 16, rubber, [cx, WR, cz], [1, 0, 0]);
      for (let i = 0; i < 20; i++) {
        const a = (i / 20) * Math.PI * 2;
        const deg = (a * 180) / Math.PI;
        box(0.92, 0.13, 0.2, rubber, [cx, WR + Math.cos(a) * 0.82, cz + Math.sin(a) * 0.82], [deg, 0, 0]);
        if (i % 2 === 0)
          box(0.96, 0.05, 0.1, "#0a0a0e", [cx, WR + Math.cos(a) * 0.89, cz + Math.sin(a) * 0.89], [deg, 0, 0]);
      }
      cyl(0.6, 0.94, 14, "#c8301e", [cx, WR, cz], [1, 0, 0]);
      cyl(0.52, 0.96, 14, "#f4ecd0", [cx, WR, cz], [1, 0, 0]);
      cyl(0.42, 0.98, 10, steel, [cx, WR, cz], [1, 0, 0]);
      cyl(0.12, 1.04, 8, YELLOW, [cx, WR, cz], [1, 0, 0]);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        cyl(0.04, 1.03, 6, "#e8ecf8", [cx, WR + Math.cos(a) * 0.3, cz + Math.sin(a) * 0.3], [1, 0, 0]);
      }
      // axle stub to chassis
      cyl(0.09, 0.9, 8, "#30303c", [sx * 0.9, WR, cz], [1, 0, 0]);
    }
  for (const sz of [1, -1]) {
    box(2.0, 0.2, 0.2, chassisPaint, [0, WR, sz * 1.55]);
    b.part(new THREE.SphereGeometry(0.22, 8, 6), steel, { at: [0, WR, sz * 1.55] });
    // shocks and links
    for (const sx of [1, -1]) {
      b.rod([sx * 0.8, WR + 0.1, sz * 1.55 + 0.1], [sx * 0.75, 1.9, sz * 1.35], 0.07, YELLOW);
      b.rod([sx * 0.8, WR + 0.1, sz * 1.55 + 0.1], [sx * 0.75, 1.9, sz * 1.35], 0.12, "#15151b", { caps: "none" });
      b.rod([sx * 0.55, WR + 0.05, sz * 1.55], [sx * 0.55, 1.2, sz * 0.7], 0.05, "#7a7e90");
      b.rod([sx * 0.4, WR, sz * 1.55], [sx * 0.55, 1.2, sz * 2.0], 0.05, "#7a7e90");
    }
  }

  // body
  box(2.1, 0.65, 4.3, bodyPaint, [0, 2.175, 0]);
  box(1.9, 0.85, 1.7, bodyPaint, [0, 2.93, -0.55]);
  box(1.96, 0.1, 1.76, bodyPaint, [0, 3.4, -0.55]);
  box(0.8, 0.2, 0.8, bodyPaint, [0, 2.6, 1.3]);
  box(2.2, 0.1, 0.5, "#15151b", [0, 2.55, 2.0]);
  // fenders over tyres
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      box(0.28, 0.1, 1.3, bodyPaint, [sx * 1.1, 1.78, sz * 1.55]);
    }
  // bumpers
  box(2.4, 0.28, 0.3, steel, [0, 1.95, 2.3]);
  box(2.3, 0.28, 0.3, steel, [0, 1.95, -2.3]);
  box(2.3, 0.1, 0.32, YELLOW, [0, 2.12, 2.3]);
  // windows
  const win = (at: number[], dir: number[], w: number, h: number) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: WINDOW });
  win([0, 2.98, 0.306], [0, 0, 1], 1.6, 0.58);
  win([0, 2.98, -1.406], [0, 0, -1], 1.6, 0.58);
  for (const s of [1, -1]) win([s * 0.956, 2.98, -0.55], [s, 0, 0], 1.3, 0.55);
  // grille, lights, plate
  b.part(new THREE.PlaneGeometry(1.3, 0.5), "#ffffff", { at: [0, 2.15, 2.156], dir: [0, 0, 1], axis: "z", texture: GRILLE });
  for (const s of [1, -1]) {
    glow(box(0.4, 0.3, 0.1, "#fff3b0", [s * 0.8, 2.2, 2.16]), 1.4);
    glow(box(0.35, 0.22, 0.1, "#ff2a1a", [s * 0.8, 2.2, -2.16]), 1.2);
  }
  b.part(new THREE.PlaneGeometry(0.5, 0.25), "#ffffff", { at: [0, 1.95, 2.46], dir: [0, 0, 1], axis: "z", texture: PLATE });
  // flames and stripes
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(3.8, 0.55), "#ffffff", { at: [s * 1.056, 2.1, 0], dir: [s, 0, 0], axis: "z", texture: FLAME });
    b.part(new THREE.PlaneGeometry(3.0, 0.1), "#ffffff", { at: [s * 1.056, 1.88, 0], dir: [s, 0, 0], axis: "z", texture: STRIPE });
  }
  b.part(new THREE.PlaneGeometry(1.8, 0.12), "#ffffff", { at: [0, 2.5, 2.156], dir: [0, 0, 1], axis: "z", texture: STRIPE });
  // roof light bar
  box(1.7, 0.12, 0.18, "#15151b", [0, 3.52, -0.1]);
  for (let i = 0; i < 5; i++) glow(box(0.22, 0.2, 0.2, "#fff8c0", [-0.7 + i * 0.35, 3.62, -0.1]), 1.5);
  // exhaust stacks
  for (const s of [1, -1]) {
    cyl(0.1, 1.2, 8, steel, [s * 0.65, 3.05, -1.7], [0, 1, 0]);
    cyl(0.12, 0.1, 8, "#0a0a0e", [s * 0.65, 3.68, -1.7], [0, 1, 0]);
    cyl(0.14, 0.06, 8, YELLOW, [s * 0.65, 2.7, -1.7], [0, 1, 0]);
  }
  // spoiler
  for (const s of [1, -1]) box(0.1, 0.5, 0.2, "#15151b", [s * 0.8, 2.75, -2.0]);
  box(2.2, 0.1, 0.5, bodyPaint, [0, 3.02, -2.0]);
  // mirrors
  for (const s of [1, -1]) {
    box(0.06, 0.06, 0.3, "#15151b", [s * 1.05, 2.95, 0.15]);
    box(0.1, 0.22, 0.14, "#15151b", [s * 1.12, 2.95, 0.3]);
  }
  // door lines
  for (const s of [1, -1]) box(0.01, 0.8, 0.04, "#1a0a0a", [s * 0.955, 2.93, -0.55]);

  return b.root;
}
