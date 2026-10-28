import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";
import { svg } from "../../../../src/index";
import { rng } from "../../../../src/index";
import { catmull } from "../../../../src/index";

export const meta = {
  name: "Alchemist's Workbench",
  description:
    "A cel-shaded Genshin-style alchemy bench with glowing potions, stacked books, brass scales, a mortar and hanging herbs.",
  style: "Genshin Impact",
};

const WOOD = cel("#a8683a", "#6a3a3a");
const WOOD_D = cel("#6e4028", "#40243a");
const WOOD_L = cel("#c98a52", "#8a5244");
const GOLD = cel("#f6c552", "#b9742c");
const TEAL = cel("#3ed6bd", "#2a86b4");
const NAVY = cel("#26365f", "#171f48");
const RED = cel("#b8313a", "#6e1f3e");
const CREAM = cel("#f7f3e8", "#b7c6dc");
const STONE = cel("#9aa6b8", "#5a6288");
const GREEN = cel("#6cc04a", "#2f8a5a");
const CLOTH = cel("#8f4a9c", "#5a2a7a");

const LABEL = svg(
  `<svg viewBox="0 0 48 64"><rect x="3" y="3" width="42" height="58" rx="6" fill="#f7f3e8" stroke="#f6c552" stroke-width="4"/><path d="M24 14 L36 32 L24 50 L12 32Z" fill="none" stroke="#3a4a7a" stroke-width="4"/><circle cx="24" cy="32" r="5" fill="#3ed6bd" stroke="#26365f" stroke-width="2"/></svg>`,
  { size: 128 },
);
const BOOK = svg(
  `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="none"/><circle cx="32" cy="16" r="10" fill="none" stroke="#f6c552" stroke-width="3"/><path d="M32 6V26M22 16H42" stroke="#f6c552" stroke-width="2.4"/><path d="M4 4H60M4 28H60" stroke="#f6c552" stroke-width="2.4"/></svg>`,
  { size: 128 },
);
const LEAF = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 62 C2 42 2 18 16 2 C30 18 30 42 16 62Z" fill="#6cc04a" stroke="#2f6a3a" stroke-width="3"/><path d="M16 60V10" stroke="#2f6a3a" stroke-width="3"/></svg>`,
  { size: 96 },
);

export default function build() {
  const b = createBuilder({ name: "alchemistBench" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const R = rng(5);
  const box = (s: [number, number, number], at: [number, number, number], c: any, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(...s), c, { bone: root, at, rotation: rot, flat: true });
  const cyl = (rt: number, rb: number, h: number, at: [number, number, number], c: any, seg = 10) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone: root, at, flat: true });
  const sph = (r: number, at: [number, number, number], c: any, sc: [number, number, number] = [1, 1, 1]) =>
    b.part(new THREE.SphereGeometry(r, 10, 7), c, { bone: root, at, scale: sc });

  // bench
  const TOP = 0.9;
  box([2.0, 0.08, 0.9], [0, TOP - 0.04, 0], WOOD_L);
  box([2.04, 0.04, 0.94], [0, TOP - 0.1, 0], WOOD_D);
  for (const x of [-0.9, 0.9])
    for (const z of [-0.36, 0.36]) box([0.1, 0.8, 0.1], [x, 0.4, z], WOOD);
  box([1.8, 0.07, 0.07], [0, 0.25, 0.36], WOOD_D);
  box([1.8, 0.07, 0.07], [0, 0.25, -0.36], WOOD_D);
  box([1.8, 0.04, 0.7], [0, 0.22, 0], WOOD);
  for (let i = 0; i < 4; i++) box([0.4, 0.006, 0.01], [-0.7 + i * 0.47, TOP + 0.001, 0.2 + R() * 0.1], WOOD_D);
  // back shelf
  box([2.0, 0.9, 0.06], [0, TOP + 0.45, -0.46], WOOD);
  box([2.0, 0.05, 0.28], [0, TOP + 0.55, -0.35], WOOD_L);
  for (const x of [-0.9, 0.9]) box([0.08, 0.5, 0.08], [x, TOP + 0.28, -0.4], WOOD_D);
  // potions
  const pot = (x: number, z: number, y: number, col: string, r: number, h: number, label = true) => {
    const cr = new THREE.Vector2();
    void cr;
    sph(r, [x, y + r, z], cel(col, "#3a3a7a"), [1, 1, 1]);
    cyl(r * 0.3, r * 0.34, h, [x, y + r * 1.8 + h / 2 - 0.02, z], cel(col, "#3a3a7a"), 8);
    glow(b.part(new THREE.SphereGeometry(r * 0.78, 8, 6), col, { bone: root, at: [x, y + r, z] }), 0.9);
    cyl(r * 0.36, r * 0.3, 0.04, [x, y + r * 1.8 + h + 0.0, z], WOOD_D, 7);
    b.part(new THREE.TorusGeometry(r * 0.34, 0.006, 4, 8), GOLD, { bone: root, at: [x, y + r * 1.8 + h - 0.03, z], rotation: [90, 0, 0] });
    if (label)
      b.part(new THREE.PlaneGeometry(r * 0.9, r * 1.2), "#ffffff", { bone: root, at: [x, y + r, z + r * 1.02], dir: [0, 0, 1], axis: "z", texture: LABEL });
  };
  pot(-0.75, 0.15, TOP, "#ff5a8a", 0.09, 0.07);
  pot(-0.55, 0.05, TOP, "#4fe6c8", 0.07, 0.06);
  pot(-0.62, -0.1, TOP, "#ffd84c", 0.06, 0.05, false);
  const SH = TOP + 0.575;
  pot(-0.7, -0.35, SH, "#8f6cff", 0.07, 0.07);
  pot(-0.5, -0.33, SH, "#4fe6c8", 0.055, 0.06);
  pot(0.5, -0.34, SH, "#ff9a4a", 0.07, 0.07);
  pot(0.72, -0.35, SH, "#6cf3ff", 0.06, 0.06);
  // flask on burner
  cyl(0.1, 0.12, 0.03, [0.2, TOP + 0.015, 0.2], GOLD);
  for (const a of [0, 2.1, 4.2]) cyl(0.012, 0.012, 0.14, [0.2 + Math.cos(a) * 0.08, TOP + 0.1, 0.2 + Math.sin(a) * 0.08], NAVY, 5);
  glow(b.part(new THREE.ConeGeometry(0.03, 0.08, 6), "#ff9a2c", { bone: root, at: [0.2, TOP + 0.07, 0.2] }), 1.5);
  sph(0.11, [0.2, TOP + 0.26, 0.2], cel("#6cf3ff", "#3a6aa0"));
  cyl(0.03, 0.04, 0.1, [0.2, TOP + 0.4, 0.2], cel("#6cf3ff", "#3a6aa0"), 8);
  glow(b.part(new THREE.SphereGeometry(0.09, 8, 6), "#4fe6c8", { bone: root, at: [0.2, TOP + 0.25, 0.2] }), 1);
  b.sweep(catmull([[0.2, TOP + 0.44, 0.2], [0.3, TOP + 0.5, 0.15], [0.38, TOP + 0.38, 0.05], [0.4, TOP + 0.2, -0.02]]), 0.012, { color: GOLD, bone: root, sides: 6 });
  // books
  const bc = [RED, NAVY, GREEN, CLOTH];
  for (let i = 0; i < 4; i++) {
    const w = 0.34 - i * 0.03;
    box([w, 0.07, 0.24], [0.62 + (R() - 0.5) * 0.04, TOP + 0.035 + i * 0.075, 0.05], bc[i], [0, (R() - 0.5) * 16, 0]);
    box([w - 0.02, 0.04, 0.23], [0.62 + 0.012, TOP + 0.035 + i * 0.075, 0.056], CREAM, [0, 0, 0]);
  }
  b.part(new THREE.PlaneGeometry(0.2, 0.1), "#ffffff", { bone: root, at: [0.62, TOP + 0.3 + 0.001, 0.05], dir: [0, 1, 0], axis: "z", up: [0, 0, -1], texture: BOOK });
  // open book
  box([0.22, 0.02, 0.3], [-0.2, TOP + 0.01, 0.25], RED);
  box([0.2, 0.02, 0.28], [-0.31, TOP + 0.03, 0.25], CREAM, [0, 0, 6]);
  box([0.2, 0.02, 0.28], [-0.09, TOP + 0.03, 0.25], CREAM, [0, 0, -6]);
  // shelf books
  for (let i = 0; i < 5; i++) box([0.06, 0.26 + R() * 0.06, 0.18], [-0.1 + i * 0.07, SH + 0.15, -0.35], bc[i % 4]);
  // scales
  const sx = 0.95 - 0.45;
  void sx;
  const bx = 0.05;
  const bz = -0.2;
  cyl(0.1, 0.12, 0.03, [bx, TOP + 0.015, bz], GOLD);
  cyl(0.015, 0.02, 0.4, [bx, TOP + 0.23, bz], GOLD, 6);
  box([0.5, 0.02, 0.02], [bx, TOP + 0.43, bz], GOLD, [0, 0, 6]);
  sph(0.025, [bx, TOP + 0.44, bz], GOLD);
  for (const s of [-1, 1]) {
    const px = bx + s * 0.25;
    const py = TOP + 0.43 - s * 0.026;
    for (const a of [0, 2.1, 4.2])
      b.rod([px, py, bz], [px + Math.cos(a) * 0.07, py - 0.17, bz + Math.sin(a) * 0.07], 0.003, { color: GOLD, bone: root, sides: 4 });
    b.lathe([[0, 0], [0.08, 0.02], [0.085, 0.03], [0.07, 0.03], [0, 0.012]], { at: [px, py - 0.18, bz], bone: root, color: GOLD, segments: 12 });
  }
  sph(0.03, [bx - 0.25, TOP + 0.02 + 0.06 - 0.04, bz], cel("#ff5a8a", "#8a2a5a"));
  // mortar and pestle
  b.lathe([[0, 0], [0.07, 0], [0.1, 0.05], [0.115, 0.09], [0.095, 0.09], [0.06, 0.04], [0, 0.03]], { at: [-0.35, TOP, -0.15], bone: root, color: STONE, segments: 10 });
  cyl(0.02, 0.012, 0.2, [-0.31, TOP + 0.13, -0.15], STONE, 6).rotation.z = -0.4;
  glow(b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.006, 10), "#6cc04a", { bone: root, at: [-0.35, TOP + 0.075, -0.15] }), 0.6);
  // herbs hanging
  box([2.0, 0.04, 0.04], [0, TOP + 1.12, -0.42], WOOD_D);
  for (let i = 0; i < 6; i++) {
    const x = -0.8 + i * 0.32;
    b.rod([x, TOP + 1.12, -0.42], [x, TOP + 1.0, -0.42], 0.004, { color: cel("#c9a468", "#8a6a3a"), bone: root, sides: 4 });
    b.part(new THREE.TorusGeometry(0.025, 0.008, 4, 8), cel("#c9a468", "#8a6a3a"), { bone: root, at: [x, TOP + 0.99, -0.42], rotation: [90, 0, 0] });
    b.cards(
      [0, 1, 2, 3, 4].map((k) => ({ at: [x + (k - 2) * 0.012, TOP + 0.99, -0.42 + (k % 2) * 0.01], axis: [0, 1, 0] } as any)),
      LEAF,
      { size: [0.07, 0.2], lean: 180, flow: [0, 0, 1], bone: root, sink: 0, spin: 180, rng: R, vary: 0.2 },
    );
  }
  // herb bundle on bench and pots
  cyl(0.07, 0.05, 0.1, [0.9, TOP + 0.05, 0.25], cel("#c9683a", "#7a3a3a"));
  b.cards(
    [0, 1, 2, 3, 4, 5].map((k) => ({ at: [0.9 + (k - 2.5) * 0.015, TOP + 0.1, 0.25], axis: [(k - 2.5) * 0.2, 1, 0] } as any)),
    LEAF,
    { size: [0.08, 0.16], lean: 15, cross: true, bone: root, rng: R, vary: 0.2 },
  );
  // lantern on the shelf
  cyl(0.07, 0.08, 0.02, [0.1, SH + 0.01, -0.35], NAVY, 6);
  glow(b.part(new THREE.CylinderGeometry(0.05, 0.055, 0.14, 6), "#ffb347", { bone: root, at: [0.1, SH + 0.09, -0.35] }), 1.4);
  b.part(new THREE.ConeGeometry(0.09, 0.07, 6), NAVY, { bone: root, at: [0.1, SH + 0.195, -0.35] });
  void INK;
  return b.root;
}
