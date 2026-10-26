import * as THREE from "three";
import { createBuilder, rng, paint, mix, noise, smoothstep, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Arctic Research Outpost",
  description: "Firewatch-style flat colour diorama: cabin, radio mast, sled, tanks and a snowy base.",
};

export default function build() {
  const b = createBuilder({ name: "outpost" });
  b.joint("root", { at: [0, 0, 0] });

  const SNOW = "#f2e6dc", SNOW2 = "#e8c8b8", WALL = "#c2452d", WALL2 = "#8e2f2a", ROOF = "#3b3a4f";
  const TRIM = "#f4d9a6", WOOD = "#6b4430", METAL = "#6f7c8c", ORANGE = "#f08a2c", DARK = "#2a2438";
  const ROCK = "#7d6f7e", YEL = "#ffc857", ICE = "#9ad0d8";

  const box = (w: number, h: number, d: number, c: any, x: number, y: number, z: number, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: rot as any });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: any, x: number, y: number, z: number, rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z], rotation: rot as any });

  // Base: snow island with sunset gradient
  const snowPaint = paint((p, n) => {
    const t = noise(p, 1.2, 3);
    return mix(mix(SNOW, SNOW2, smoothstep(0.3, 0.8, t)), "#b9a7c4", smoothstep(0.2, -0.8, n.y) * 0.8);
  });
  b.lathe([[0, 0], [3.3, 0], [3.4, 0.1], [3.2, 0.22], [2.2, 0.3], [0, 0.34]], { at: [0, -0.02, 0], color: snowPaint, segments: 14 });
  const y0 = 0.3;

  // Cabin
  const wallPaint = paint((p, n) => {
    const plank = Math.abs(((p.y * 14) % 1) - 0.5) < 0.03;
    return plank ? WALL2 : mix(WALL, "#d8603a", smoothstep(0.2, 1.8, p.y) * 0.5 * (n.y > -0.5 ? 1 : 0));
  });
  box(1.6, 0.18, 1.3, WOOD, -0.5, y0 + 0.09, -0.2);
  b.part(new THREE.BoxGeometry(1.5, 0.9, 1.2), wallPaint, { at: [-0.5, y0 + 0.63, -0.2] });
  for (const s of [1, -1]) {
    b.extrude([[-0.75, 0], [0.75, 0], [0, 0.55]], { at: [-0.5 + s * 0.0, y0 + 1.08, -0.2 + s * 0.6], x: [1, 0, 0], thickness: 0.02, color: WALL });
    // roof slopes
    b.part(new THREE.BoxGeometry(1.0, 0.05, 1.5), ROOF, { at: [-0.5 + s * 0, y0 + 1.35, -0.2 + 0], rotation: [0, 0, 0] });
  }
  b.part(new THREE.BoxGeometry(1.0, 0.06, 1.5), ROOF, { at: [-0.5 - 0.37, y0 + 1.36, -0.2], rotation: [0, 0, 35] });
  b.part(new THREE.BoxGeometry(1.0, 0.06, 1.5), ROOF, { at: [-0.5 + 0.37, y0 + 1.36, -0.2], rotation: [0, 0, -35] });
  box(0.12, 0.2, 1.52, TRIM, -0.5, y0 + 1.66, -0.2);
  // roof snow
  b.part(new THREE.BoxGeometry(1.0, 0.07, 1.56), SNOW, { at: [-0.5 - 0.39, y0 + 1.42, -0.2], rotation: [0, 0, 35] });
  b.part(new THREE.BoxGeometry(1.0, 0.07, 1.56), SNOW, { at: [-0.5 + 0.39, y0 + 1.42, -0.2], rotation: [0, 0, -35] });
  // chimney with smoke puffs
  box(0.2, 0.5, 0.2, ROCK, -0.9, y0 + 1.6, -0.4);
  box(0.24, 0.05, 0.24, DARK, -0.9, y0 + 1.87, -0.4);
  for (let i = 0; i < 3; i++) b.part(new THREE.IcosahedronGeometry(0.1 + i * 0.04, 0), "#efe6ee", { at: [-0.9 + i * 0.08, y0 + 2.05 + i * 0.22, -0.4], flat: true });

  // Door and windows
  box(0.4, 0.65, 0.04, WOOD, -0.5, y0 + 0.5, 0.42);
  box(0.5, 0.05, 0.1, TRIM, -0.5, y0 + 0.86, 0.45);
  b.part(new THREE.SphereGeometry(0.025, 6, 4), YEL, { at: [-0.38, y0 + 0.5, 0.45] });
  box(0.5, 0.1, 0.4, SNOW, -0.5, y0 + 0.05, 0.62);
  const winTex = svg(`<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#ffcf6b"/><rect x="14" width="4" height="32" fill="#6b4430"/><rect y="14" width="32" height="4" fill="#6b4430"/><rect width="32" height="32" fill="none" stroke="#f4d9a6" stroke-width="4"/></svg>`, { size: 64 });
  for (const [x, z, d] of [[-1.0, 0.42, 0], [0.0, 0.0, 1]] as number[][]) {
    const m = b.part(new THREE.PlaneGeometry(0.38, 0.38), "#ffffff", d ? { at: [0.26, y0 + 0.65, -0.2], dir: [1, 0, 0], axis: "z", texture: winTex } : { at: [x + 0.05, y0 + 0.65, z + 0.01], dir: [0, 0, 1], axis: "z", texture: winTex });
    glow(m, 1.2);
  }
  const m2 = b.part(new THREE.PlaneGeometry(0.38, 0.38), "#ffffff", { at: [-1.26, y0 + 0.65, -0.2], dir: [-1, 0, 0], axis: "z", texture: winTex });
  glow(m2, 1.2);
  // porch lamp
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), YEL, { at: [-0.18, y0 + 0.85, 0.5] }), 2);

  // Radio mast
  cyl(0.2, 0.26, 0.12, 8, ROCK, 1.2, y0 + 0.06, -0.5);
  for (const [dx, dz] of [[0.2, 0.2], [-0.2, 0.2], [0.2, -0.2], [-0.2, -0.2]]) {
    b.rod([1.2 + dx, y0, -0.5 + dz], [1.2 + dx * 0.2, y0 + 3.2, -0.5 + dz * 0.2], 0.025, METAL);
  }
  for (let i = 0; i < 6; i++) {
    const y = y0 + 0.4 + i * 0.5, k = 0.2 * (1 - i / 6) + 0.04;
    b.rod([1.2 - k, y, -0.5 + k], [1.2 + k, y + 0.4, -0.5 - k], 0.012, METAL);
    b.rod([1.2 + k, y, -0.5 + k], [1.2 - k, y + 0.4, -0.5 - k], 0.012, METAL);
  }
  b.part(new THREE.SphereGeometry(0.06, 6, 4), "#e0393e", { at: [1.2, y0 + 3.35, -0.5] });
  glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), "#ff4a4a", { at: [1.2, y0 + 3.4, -0.5] }), 2.5);
  for (const a of [0, 1]) {
    b.part(new THREE.CylinderGeometry(0.2, 0.01, 0.12, 10, 1, true), METAL, { at: [1.2 + 0.2, y0 + 2.2 + a * 0.5, -0.5], rotation: [0, 0, 90] });
  }
  // guy wires
  for (const [x, z] of [[2.3, 0.7], [2.0, -1.8], [0.2, -1.8]]) b.rod([1.2, y0 + 2.6, -0.5], [x, y0, z], 0.008, DARK);

  // Weather station
  cyl(0.02, 0.02, 0.7, 6, METAL, 0.2, y0 + 0.35, 1.5);
  box(0.3, 0.3, 0.2, "#f4efe6", 0.2, y0 + 0.5, 1.5);
  box(0.34, 0.04, 0.24, ORANGE, 0.2, y0 + 0.67, 1.5);
  for (let i = 0; i < 3; i++) {
    const a = (i * 2 * Math.PI) / 3;
    b.rod([0.2, y0 + 0.85, 1.5], [0.2 + Math.cos(a) * 0.2, y0 + 0.85, 1.5 + Math.sin(a) * 0.2], 0.012, METAL);
    b.part(new THREE.SphereGeometry(0.05, 6, 4), ORANGE, { at: [0.2 + Math.cos(a) * 0.2, y0 + 0.85, 1.5 + Math.sin(a) * 0.2] });
  }
  cyl(0.02, 0.02, 0.3, 6, METAL, 0.2, y0 + 0.8, 1.5);

  // Fuel tanks
  for (const [x, z, c] of [[1.5, 1.0, ORANGE], [1.9, 0.5, "#d8603a"]] as any[]) {
    cyl(0.22, 0.22, 0.6, 10, c, x, y0 + 0.3, z);
    cyl(0.1, 0.22, 0.1, 10, c, x, y0 + 0.65, z);
    cyl(0.04, 0.04, 0.08, 6, DARK, x, y0 + 0.74, z);
    b.part(new THREE.TorusGeometry(0.22, 0.02, 4, 10), DARK, { at: [x, y0 + 0.3, z], rotation: [90, 0, 0] });
  }

  // Sled with crates
  box(0.9, 0.05, 0.4, WOOD, -1.8, y0 + 0.14, 1.4);
  for (const s of [1, -1]) {
    box(1.0, 0.05, 0.05, DARK, -1.8, y0 + 0.04, 1.4 + s * 0.2);
    box(0.05, 0.12, 0.05, DARK, -1.8 + 0.3, y0 + 0.09, 1.4 + s * 0.2);
    box(0.05, 0.12, 0.05, DARK, -1.8 - 0.3, y0 + 0.09, 1.4 + s * 0.2);
    b.part(new THREE.BoxGeometry(0.1, 0.05, 0.05), DARK, { at: [-2.33, y0 + 0.08, 1.4 + s * 0.2], rotation: [0, 0, 30] });
  }
  box(0.35, 0.25, 0.3, TRIM, -1.95, y0 + 0.29, 1.4);
  box(0.3, 0.2, 0.28, "#4f8a8b", -1.6, y0 + 0.26, 1.4);
  box(0.36, 0.03, 0.31, WALL2, -1.95, y0 + 0.43, 1.4);

  // Pines, rocks, ice
  const rg = rng(5);
  for (const [x, z, s] of [[-2.2, -1.2, 1.2], [-1.6, -1.9, 0.9], [-2.5, 0.0, 0.8], [2.4, -1.2, 1.0]]) {
    cyl(0.04 * s, 0.06 * s, 0.3 * s, 6, WOOD, x, y0 + 0.15 * s, z);
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.ConeGeometry((0.4 - i * 0.1) * s, 0.5 * s, 7), i % 2 ? "#2f5a4f" : "#264a44", { at: [x, y0 + (0.5 + i * 0.3) * s, z], flat: true });
      b.part(new THREE.ConeGeometry((0.3 - i * 0.1) * s, 0.2 * s, 7), SNOW, { at: [x, y0 + (0.62 + i * 0.3) * s, z], flat: true });
    }
  }
  for (let i = 0; i < 5; i++) {
    const a = rg() * 6.28, r = 2 + rg() * 0.8;
    b.part(new THREE.DodecahedronGeometry(0.15 + rg() * 0.15, 0), i % 2 ? ROCK : ICE, { at: [Math.cos(a) * r, y0 + 0.05, Math.sin(a) * r], flat: true });
  }
  // Footpath
  for (let i = 0; i < 6; i++) b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 6), "#d9c1c8", { at: [-0.5 + i * 0.12 + (i % 2) * 0.05, y0 + 0.01, 0.9 + i * 0.25], flat: true });

  return b.root;
}
