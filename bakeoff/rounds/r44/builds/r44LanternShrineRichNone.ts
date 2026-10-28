import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { svg } from "../../../../src/index";
import { countershade, mottle, grain } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "roadside_shrine",
  description: "Inazuma-style roadside shrine with torii gate, stone lanterns, small hokora shrine and offerings.",
};

export default function build() {
  const b = createBuilder({ name: "shrine" });
  const R = rng(5);

  const RED = "#c8302a", DARK = "#2a2230", GOLD = "#e8b84a", PAPER = "#f6ecd0";
  const STONE = mottle("#9a9aa6", "#74768a", { size: 0.2, seed: 3 });
  const STONE_TOP = countershade("#a8b0a0", "#6c6e80", { level: 0.2 });
  const WOOD = grain("#7a4a2e", "#5a3422", { size: 0.04 });
  const MOSS = mottle("#5f8a48", "#3f6a3a", { size: 0.1, seed: 2 });
  const ROOF = "#3a3e5c";

  const box = (w: number, h: number, d: number, c: any, x: number, y: number, z: number, rz = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: [0, 0, rz] });
  const cyl = (rt: number, rb: number, h: number, c: any, x: number, y: number, z: number, seg = 8) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z] });

  // textures
  const KANJI = svg(`<svg viewBox="0 0 40 60"><rect width="40" height="60" fill="#1c1c28"/><rect x="2" y="2" width="36" height="56" fill="none" stroke="#e8b84a" stroke-width="2"/><path d="M10 14h20M20 10v40M12 28h16M10 44q10-8 20 0" stroke="#e8b84a" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>`, { size: 128 });
  const LANT = svg(`<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#ffcf6a"/><circle cx="32" cy="32" r="14" fill="#fff2b8"/><path d="M32 12v40M12 32h40" stroke="#b9732a" stroke-width="3"/></svg>`, { size: 64 });
  const TAG = svg(`<svg viewBox="0 0 20 50"><path d="M2 0h16v50l-8-8-8 8z" fill="#f6ecd0" stroke="#c8302a" stroke-width="1.5"/><path d="M10 8v26M6 16h8" stroke="#c8302a" stroke-width="2.5"/></svg>`, { size: 64 });

  // base steps
  box(2.6, 0.08, 3.4, STONE, 0, 0.03, 0.2);
  box(2.2, 0.1, 3.0, STONE_TOP, 0, 0.1, 0.2);
  box(1.0, 0.06, 1.0, MOSS, -0.9, 0.17, 1.3);

  // path stones
  for (let i = 0; i < 5; i++) box(0.7, 0.04, 0.4, STONE, (R() - 0.5) * 0.1, 0.18, 1.5 - i * 0.0 + 0.2 - i * 0.0 - i * 0.0);

  // torii at front
  const TZ = 1.6;
  for (const s of [1, -1]) {
    cyl(0.1, 0.12, 2.5, RED, s * 0.9, 1.35, TZ, 8);
    cyl(0.13, 0.13, 0.16, DARK, s * 0.9, 0.2, TZ, 8);
    box(0.14, 0.04, 0.14, GOLD, s * 0.9, 2.62, TZ);
  }
  box(2.9, 0.16, 0.2, RED, 0, 2.5, TZ);
  box(3.4, 0.1, 0.3, DARK, 0, 2.72, TZ);
  box(3.0, 0.1, 0.26, RED, 0, 2.64, TZ);
  for (const s of [1, -1]) box(0.4, 0.1, 0.3, DARK, s * 1.68, 2.77, TZ, s * 12);
  box(2.0, 0.1, 0.14, RED, 0, 2.15, TZ);
  b.part(new THREE.BoxGeometry(0.34, 0.5, 0.04), "#ffffff", { at: [0, 2.43, TZ + 0.12], texture: KANJI });
  // shimenawa
  b.sweep([[-0.8, 2.3, TZ + 0.15], [-0.3, 2.2, TZ + 0.15], [0.3, 2.2, TZ + 0.15], [0.8, 2.3, TZ + 0.15]], 0.045, { color: "#d8c488" });
  for (const x of [-0.5, 0, 0.5]) b.cards([{ at: new THREE.Vector3(x, 2.2, TZ + 0.16), axis: new THREE.Vector3(0, 1, 0) } as any], TAG, { size: [0.1, 0.25], lean: 180, flow: [0, 0, 1] });

  // stone lanterns
  for (const s of [1, -1]) {
    const x = s * 1.0, z = 0.6;
    cyl(0.14, 0.18, 0.1, STONE, x, 0.2, z, 6);
    cyl(0.07, 0.07, 0.5, STONE, x, 0.5, z, 6);
    cyl(0.2, 0.14, 0.1, STONE_TOP, x, 0.8, z, 6);
    const l = b.part(new THREE.BoxGeometry(0.28, 0.28, 0.28), "#ffffff", { at: [x, 1.0, z], texture: LANT });
    glow(l, 1.4);
    for (const px of [-1, 1]) for (const pz of [-1, 1]) cyl(0.025, 0.025, 0.3, STONE, x + px * 0.15, 1.0, z + pz * 0.15, 6);
    b.part(new THREE.ConeGeometry(0.34, 0.24, 6), STONE_TOP, { at: [x, 1.26, z] });
    b.part(new THREE.SphereGeometry(0.06, 6, 4), GOLD, { at: [x, 1.42, z] });
  }

  // hokora small shrine at back
  const SZ = -0.8;
  box(1.3, 0.3, 1.1, STONE, 0, 0.35, SZ);
  box(1.0, 0.8, 0.8, WOOD, 0, 0.9, SZ);
  for (const s of [1, -1]) box(0.08, 0.8, 0.08, RED, s * 0.5, 0.9, SZ + 0.4);
  b.part(new THREE.BoxGeometry(0.4, 0.55, 0.03), "#ffffff", { at: [0, 0.88, SZ + 0.41], texture: KANJI });
  box(1.5, 0.08, 1.3, DARK, 0, 1.35, SZ);
  b.part(new THREE.ConeGeometry(1.1, 0.6, 4), ROOF, { at: [0, 1.7, SZ], rotation: [0, 45, 0], scale: [1.1, 1, 0.95] });
  b.part(new THREE.SphereGeometry(0.08, 6, 4), GOLD, { at: [0, 2.08, SZ] });
  for (const s of [1, -1]) box(0.1, 0.1, 1.5, GOLD, s * 0.62, 1.55, SZ);

  // fox guardians
  for (const s of [1, -1]) {
    const x = s * 0.9, z = 1.0;
    box(0.4, 0.2, 0.4, STONE, x, 0.25, z);
    box(0.24, 0.3, 0.3, "#d8d4cc", x, 0.5, z);
    b.part(new THREE.SphereGeometry(0.13, 6, 5), "#d8d4cc", { at: [x, 0.8, z + 0.02] });
    b.part(new THREE.ConeGeometry(0.1, 0.18, 4), "#d8d4cc", { at: [x, 0.7, z + 0.17], rotation: [90, 0, 0] });
    for (const e of [1, -1]) b.part(new THREE.ConeGeometry(0.05, 0.16, 4), "#d8d4cc", { at: [x + e * 0.08, 0.98, z] });
    box(0.26, 0.06, 0.32, RED, x, 0.64, z);
  }

  // offerings
  box(0.7, 0.1, 0.4, WOOD, 0, 0.3, SZ + 0.9);
  cyl(0.1, 0.12, 0.1, "#f2f0ea", -0.2, 0.4, SZ + 0.9, 10);
  cyl(0.09, 0.09, 0.02, "#e8a050", -0.2, 0.46, SZ + 0.9, 10);
  b.part(new THREE.SphereGeometry(0.07, 6, 5), "#f0a0b8", { at: [0.1, 0.4, SZ + 0.9] });
  b.part(new THREE.SphereGeometry(0.07, 6, 5), "#f6ecd0", { at: [0.25, 0.4, SZ + 0.85] });
  b.part(new THREE.SphereGeometry(0.07, 6, 5), "#9bd08a", { at: [0.18, 0.4, SZ + 0.97] });
  cyl(0.06, 0.06, 0.16, "#3a5aa0", 0.3, 0.42, SZ + 0.95, 8);
  // sakura-ish bush
  for (let i = 0; i < 6; i++)
    b.part(new THREE.IcosahedronGeometry(0.25 + R() * 0.12, 0), i % 2 ? "#f2a6c0" : "#f7c4d6", { at: [-1.6 + R() * 0.5, 0.45 + R() * 0.3, -1 + R() * 0.6] });
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), "#ffd070", { at: [0, 0.6, SZ + 0.95] }), 1.5);

  return b.root;
}
