```ts
import * as THREE from "three";
import { createBuilder, rng, mottle, paint, noise, smoothstep, mix, svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = { name: "Sky Island", description: "Floating island with ruins, waterfall, trees and crystals in a Genshin-like style" };

export default function build() {
  const b = createBuilder({ name: "skyisland" });
  const R = rng(5);
  const GRASS = mottle("#7fcf4a", "#5fb83e", { size: 0.5, seed: 2 });
  const ROCK = paint((p, n) => {
    const t = noise(p, 0.35, 4);
    const base = mix("#8a7a6a", "#5d5061", smoothstep(0.3, 0.7, t));
    return n.y < -0.3 ? mix(base, "#3f3a52", 0.5) : base;
  });
  const STONE = mottle("#e7dcc2", "#bfb298", { size: 0.2, seed: 7 });
  const MOSS = mottle("#5aa63a", "#3f8a35", { size: 0.15 });
  const GOLD = "#e9b84a";
  const WATER = "#6fd6ff";

  const Y0 = 2.0; // top surface height

  // Floating rock underside: stacked inverted frustums (lathe)
  b.lathe([[0, 0.05], [0.9, 0.35], [1.8, 0.9], [2.6, 1.5], [3.0, 1.9], [0, 1.9]].map(([x, y]) => [x, y] as [number, number]),
    { at: [0, 0.0, 0], color: ROCK, segments: 9 });
  // hanging rock spikes
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.3;
    const r = 1.0 + R() * 1.0;
    const h = 0.6 + R() * 0.9;
    b.part(new THREE.ConeGeometry(0.28 + R() * 0.15, h, 6), ROCK, { at: [Math.cos(a) * r, 0.6 + 0.5 - h * 0.1 + 0.2, Math.sin(a) * r], rotation: [180, 0, 0], flat: true });
  }
  // grass top
  b.lathe([[0, 1.85], [3.05, 1.85], [3.1, 2.0], [2.9, 2.12], [0, 2.14]].map(([x, y]) => [x, y] as [number, number]),
    { at: [0, 0, 0], color: GRASS, segments: 10 });
  // dirt lip
  b.lathe([[2.9, 1.8], [3.08, 1.8], [3.08, 1.95], [2.9, 1.95]].map(([x, y]) => [x, y] as [number, number]),
    { at: [0, 0, 0], color: "#9a6b3e", segments: 10 });

  // crystals under island glowing
  for (let i = 0; i < 4; i++) {
    const a = i * 1.7 + 0.5;
    glow(b.part(new THREE.OctahedronGeometry(0.22, 0), "#7be0ff", { at: [Math.cos(a) * 1.3, 0.3 + (i % 2) * 0.3, Math.sin(a) * 1.3], scale: [0.7, 1.8, 0.7], flat: true }), 1.2);
  }

  // Ruins: floor, columns, arch
  b.part(new THREE.CylinderGeometry(1.0, 1.1, 0.12, 8), STONE, { at: [-0.9, Y0 + 0.1, -0.3], flat: true });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const x = -0.9 + Math.cos(a) * 0.8, z = -0.3 + Math.sin(a) * 0.8;
    const broken = i % 3 === 1;
    const h = broken ? 0.5 : 1.1;
    b.part(new THREE.CylinderGeometry(0.1, 0.12, h, 8), STONE, { at: [x, Y0 + 0.16 + h / 2, z], flat: true });
    b.part(new THREE.BoxGeometry(0.3, 0.07, 0.3), STONE, { at: [x, Y0 + 0.17, z] });
    if (!broken) {
      b.part(new THREE.BoxGeometry(0.3, 0.08, 0.3), STONE, { at: [x, Y0 + 0.16 + h + 0.04, z] });
      b.part(new THREE.SphereGeometry(0.1, 6, 4), MOSS, { at: [x, Y0 + 0.16 + h + 0.1, z], scale: [1.4, 0.5, 1.4] });
    }
  }
  // arch
  b.part(new THREE.BoxGeometry(0.2, 1.5, 0.25), STONE, { at: [0.2, Y0 + 0.8, 0.7] });
  b.part(new THREE.BoxGeometry(0.2, 1.1, 0.25), STONE, { at: [1.1, Y0 + 0.6, 0.7] });
  b.part(new THREE.BoxGeometry(1.3, 0.2, 0.3), STONE, { at: [0.65, Y0 + 1.6, 0.7] });
  b.part(new THREE.BoxGeometry(0.3, 0.3, 0.3), STONE, { at: [0.65, Y0 + 1.82, 0.7] });
  glow(b.part(new THREE.OctahedronGeometry(0.12, 0), GOLD, { at: [0.65, Y0 + 1.1, 0.7], scale: [1, 1.5, 1], flat: true }), 1.5);
  const RUNE = svg(`<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="13" fill="none" stroke="#ffd36a" stroke-width="3"/><path d="M16 5 L24 22 L8 22Z M16 27 L16 12" fill="none" stroke="#ffd36a" stroke-width="3"/></svg>`, { size: 128 });
  glow(b.part(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", { at: [0.65, Y0 + 0.93, 0.85], dir: [0, 0, 1], axis: "z", texture: RUNE }));
  // stairs
  for (let i = 0; i < 4; i++) b.part(new THREE.BoxGeometry(1.0, 0.1, 0.25), STONE, { at: [0.65, Y0 + 0.07 + i * 0.1, 1.9 - i * 0.25 + 0.0] });

  // trees
  const tree = (x: number, z: number, s: number, c: string) => {
    b.part(new THREE.CylinderGeometry(0.07 * s, 0.1 * s, 0.9 * s, 6), "#7a5232", { at: [x, Y0 + 0.4 * s, z], flat: true });
    for (let k = 0; k < 3; k++) {
      b.part(new THREE.IcosahedronGeometry((0.5 - k * 0.1) * s, 0), mottle(c, "#8fe05a", { size: 0.2 }), { at: [x + (k - 1) * 0.12 * s, Y0 + (0.95 + k * 0.3) * s, z + (k % 2) * 0.1], flat: true });
    }
  };
  tree(1.8, -1.2, 1.2, "#4fa83a");
  tree(-2.0, 1.2, 1.0, "#e98fa0");
  tree(2.0, 0.6, 0.8, "#5cb843");
  tree(-0.3, -2.1, 0.9, "#e98fa0");
  tree(0.3, 1.8, 0.0 + 0.7, "#4fa83a");

  // rocks and flowers
  for (let i = 0; i < 10; i++) {
    const a = R() * 6.28, r = 0.6 + R() * 2.0;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (i < 4) b.part(new THREE.DodecahedronGeometry(0.12 + R() * 0.1, 0), "#9a9486", { at: [x, Y0 + 0.05, z], flat: true });
    else b.part(new THREE.SphereGeometry(0.05, 5, 4), i % 2 ? "#fff3a0" : "#ffffff", { at: [x, Y0 + 0.06, z] });
  }

  // waterfall at edge (+X side)
  const ex = 2.95;
  b.part(new THREE.BoxGeometry(0.9, 0.12, 0.7), WATER, { at: [2.35, Y0 + 0.02, -0.2] }); // pond
  b.part(new THREE.BoxGeometry(0.28, 2.6, 0.5), WATER, { at: [ex + 0.05, Y0 - 1.25, -0.2] });
  b.part(new THREE.BoxGeometry(0.12, 2.4, 0.4), "#d8f6ff", { at: [ex + 0.2, Y0 - 1.35, -0.2] });
  for (let i = 0; i < 3; i++) b.part(new THREE.SphereGeometry(0.28 - i * 0.05, 6, 4), "#e8fbff", { at: [ex + 0.15 + i * 0.1, Y0 - 2.7 - i * 0.25, -0.2], scale: [1.2, 0.7, 1.2] });
  // mist
  for (let i = 0; i < 5; i++) b.part(new THREE.IcosahedronGeometry(0.2, 0), "#ffffff", { at: [ex + 0.3 + R() * 0.5, Y0 - 3.4 - R() * 0.4, -0.2 + R() * 0.5], flat: true });

  // golden floating shards
  for (let i = 0; i < 5; i++) {
    glow(b.part(new THREE.OctahedronGeometry(0.12, 0), GOLD, { at: [-2.6 + i * 0.4, Y0 + 2.4 + (i % 2) * 0.4, 0.5 - i * 0.3], scale: [1, 1.6, 1], flat: true }), 1.3);
  }
  // small floating rock
  b.part(new THREE.DodecahedronGeometry(0.4, 0), ROCK, { at: [-3.7, 1.1, 1.0], flat: true });
  b.part(new THREE.CylinderGeometry(0.4, 0.2, 0.1, 6), GRASS, { at: [-3.7, 1.5, 1.0], flat: true });

  return b.root;
}
```