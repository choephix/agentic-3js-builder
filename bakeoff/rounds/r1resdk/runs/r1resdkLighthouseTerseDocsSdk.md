```ts
import * as THREE from "three";
import { createBuilder, paint, stripes, mottle, scales, rng, countershade } from "agentic-3js-builder";

export const meta = {
  name: "Lighthouse Island",
  description: "A striped lighthouse with keeper's house on a tiny rocky island with a dock and boat.",
};

export default function build() {
  const b = createBuilder({ name: "lighthouse" });
  b.joint("base", { at: [0, 0, 0] });

  const WHITE = "#f4f1ea", RED = "#c8342b", DARK = "#2b2f3a", GLASS = "#9fe6f2";
  const BRASS = "#c9a24a", ROCK = "#7d7a74", ROCK2 = "#5f5d5a", GRASS = "#6f9a4a";
  const SAND = "#d8c79a", WOOD = "#8a5a35", ROOF = "#4a5a6a", SEA = "#3f86a8";
  const r = rng(11);

  // sea disc
  b.lathe([[0, 0], [2.6, 0], [2.6, 0.04], [0, 0.04]], { at: [0, -0.02, 0], segments: 24, color: SEA });

  // island: stacked rocky layers
  const rockPaint = mottle(ROCK, ROCK2, { size: 0.3, seed: 3 });
  b.lathe([[0, 0], [1.9, 0], [1.7, 0.2], [1.3, 0.38], [0, 0.4]], { at: [0, 0, 0], segments: 10, color: rockPaint });
  b.lathe([[0, 0], [1.3, 0], [1.1, 0.12], [0, 0.14]], { at: [0, 0.38, 0], segments: 9, color: GRASS });
  // beach rim
  b.lathe([[1.5, 0], [2.0, 0], [1.9, 0.05], [1.5, 0.12]], { at: [0, 0, 0], segments: 12, color: SAND });
  // boulders
  for (let i = 0; i < 9; i++) {
    const a = r() * Math.PI * 2, d = 1.5 + r() * 0.5, s = 0.1 + r() * 0.15;
    b.part(new THREE.IcosahedronGeometry(s, 0), i % 2 ? ROCK : ROCK2, {
      at: [Math.cos(a) * d, s * 0.5, Math.sin(a) * d], scale: [1, 0.7, 1], flat: true, bone: undefined,
    });
  }

  // tower
  const baseY = 0.5;
  const H = 3.4;
  const segs = 6;
  const tp = paint((p) => {
    const k = Math.floor((p.y - baseY) / (H / segs));
    return k % 2 === 0 ? RED : WHITE;
  });
  b.lathe([[0, 0], [0.55, 0], [0.5, H], [0, H]], { at: [0, baseY, 0], segments: 14, color: tp });
  b.lathe([[0.5, 0], [0.62, 0], [0.6, 0.12], [0.55, 0.15]], { at: [0, baseY, 0], segments: 14, color: ROCK2 });
  // door and windows
  b.part(new THREE.BoxGeometry(0.2, 0.34, 0.06), WOOD, { at: [0, baseY + 0.17, 0.55] });
  b.part(new THREE.BoxGeometry(0.26, 0.4, 0.03), DARK, { at: [0, baseY + 0.19, 0.54] });
  for (const y of [1.5, 2.4, 3.1]) {
    b.part(new THREE.BoxGeometry(0.1, 0.2, 0.05), DARK, { at: [0, baseY + y, 0.5 - y * 0.015] });
  }
  // gallery
  const gy = baseY + H;
  b.lathe([[0, 0], [0.8, 0], [0.8, 0.06], [0.45, 0.1], [0, 0.1]], { at: [0, gy, 0], segments: 14, color: DARK });
  // railing
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 5), DARK, { at: [Math.cos(a) * 0.76, gy + 0.17, Math.sin(a) * 0.76] });
  }
  b.sweep([[0.76, 0, 0], [0, 0, 0.76], [-0.76, 0, 0], [0, 0, -0.76]].map(p => [p[0], gy + 0.28, p[2]]) as number[][], 0.02, { color: DARK });
  const rail = [] as number[][];
  for (let i = 0; i <= 16; i++) { const a = (i / 16) * Math.PI * 2; rail.push([Math.cos(a) * 0.76, gy + 0.28, Math.sin(a) * 0.76]); }
  b.sweep(rail, 0.02, { color: BRASS, sides: 5 });
  // lantern room
  b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.5, 10), GLASS, { at: [0, gy + 0.35, 0], flat: true });
  b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.3, 8), "#fff4a8", { at: [0, gy + 0.35, 0] });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.31;
    b.part(new THREE.BoxGeometry(0.03, 0.52, 0.03), DARK, { at: [Math.cos(a) * 0.3, gy + 0.35, Math.sin(a) * 0.3] });
  }
  b.lathe([[0, 0], [0.38, 0], [0.34, 0.04], [0.04, 0.3], [0, 0.34]], { at: [0, gy + 0.6, 0], segments: 10, color: RED });
  b.part(new THREE.SphereGeometry(0.04, 6, 4), BRASS, { at: [0, gy + 0.98, 0] });
  b.spike([0, gy + 0.94, 0], [0, 1, 0], 0.2, 0.012, { color: DARK });

  // keeper's house
  const hx = -0.6, hz = 0.45;
  b.part(new THREE.BoxGeometry(0.7, 0.4, 0.5), WHITE, { at: [hx - 0.2, 0.55 + 0.2 - 0.05, hz + 0.3] });
  b.part(new THREE.CylinderGeometry(0, 0.5, 0.28, 4, 1), ROOF, { at: [hx - 0.2, 1.0, hz + 0.3], rotation: [0, 45, 0], scale: [1.1, 1, 0.8], flat: true });
  b.part(new THREE.BoxGeometry(0.1, 0.18, 0.05), WOOD, { at: [hx - 0.2, 0.62, hz + 0.56] });
  b.part(new THREE.BoxGeometry(0.1, 0.1, 0.05), GLASS, { at: [hx - 0.45, 0.78, hz + 0.56] });
  b.part(new THREE.BoxGeometry(0.1, 0.1, 0.05), GLASS, { at: [hx + 0.05, 0.78, hz + 0.56] });
  b.part(new THREE.BoxGeometry(0.08, 0.22, 0.08), ROCK2, { at: [hx - 0.05, 1.05, hz + 0.2] });

  // dock
  for (let i = 0; i < 7; i++) {
    b.part(new THREE.BoxGeometry(0.14, 0.03, 0.4), i % 2 ? WOOD : "#a06c40", { at: [1.4 + i * 0.15 + 0.3, 0.2, 0.9 + i * 0.06] , rotation: [0, -20, 0]});
  }
  for (const k of [0, 1, 2]) {
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 5), WOOD, { at: [1.7 + k * 0.4, 0.05, 0.75 + k * 0.1 + 0.3] });
  }

  // rowboat
  const boat = [[2.0, 0.07, 1.6]];
  b.part(new THREE.BoxGeometry(0.28, 0.1, 0.7), RED, { at: [2.0, 0.08, 1.9], rotation: [0, 15, 0] });
  b.part(new THREE.BoxGeometry(0.2, 0.04, 0.55), WOOD, { at: [2.0, 0.13, 1.9], rotation: [0, 15, 0] });
  b.part(new THREE.ConeGeometry(0.14, 0.2, 4), RED, { at: [2.05, 0.08, 2.3], rotation: [90, 0, 0], flat: true });
  void boat;

  // grass tufts / flowers
  for (let i = 0; i < 10; i++) {
    const a = r() * Math.PI * 2, d = 0.7 + r() * 0.5;
    if (Math.abs(Math.cos(a) * d) < 0.6 && Math.sin(a) * d > -0.1 && Math.sin(a) * d < 0.7) continue;
    b.part(new THREE.ConeGeometry(0.04, 0.12, 4), i % 3 ? "#4f8a3a" : "#e8c33a", { at: [Math.cos(a) * d, 0.52 + 0.04, Math.sin(a) * d] });
  }

  // light beams
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.2, 1.4, 6, 1, true), "#fff3a0", {
      at: [s * 0.9, gy + 0.35, 0], rotation: [0, 0, -s * 90], flat: true, scale: [1, 1, 0.4],
    });
  }

  return b.root;
}
```