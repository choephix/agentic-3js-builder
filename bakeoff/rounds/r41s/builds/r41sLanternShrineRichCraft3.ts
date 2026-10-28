import * as THREE from "three";
import { createBuilder, catmull, metal, paint, mix, mottle, noise, smoothstep, grain, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Inazuma Roadside Shrine",
  description: "Stylized roadside shrine with a torii gate, stone lanterns, kitsune guardians, paper lanterns and offerings.",
};

const VERM = "#d23a26", VERM_D = "#a82a1e", BLACK = "#2b2531", GOLD = "#f0c85a", PAPER = "#fff1cf";
const WARM = "#ffcf7a", ROOF = "#45508a", ROOF_D = "#343c6e", WHITE = "#fbf6ea", PINK = "#f6a9c0";

const STONE = paint((p, n) => {
  const base = mix("#8f93a6", "#b9bccb", noise(p, 0.18, 3));
  const moss = smoothstep(0.55, 0.9, n.y) * smoothstep(0.4, 0.65, noise(p, 0.25, 8));
  const low = smoothstep(0.25, 0.0, p.y) * 0.4;
  return mix(mix(base, "#6f9a5a", moss * 0.8), "#5c5a66", low);
});
const WOOD = grain("#8a5836", "#6a4128", { size: 0.03, axis: "y", seed: 4 });
const PATH = mottle("#8d8a96", "#b0adba", { size: 0.2, seed: 2 });
const GRASS = mottle("#6aa457", "#8cc468", { size: 0.35, seed: 5 });

const LATTICE = svg(`<svg viewBox="0 0 64 80"><rect width="64" height="80" fill="#fff1cf"/>
<g stroke="#8a4a2a" stroke-width="3">${[8, 20, 32, 44, 56].map((x) => `<path d="M${x} 0V80"/>`).join("")}${[10, 25, 40, 55, 70].map((y) => `<path d="M0 ${y}H64"/>`).join("")}</g>
<rect x="1.5" y="1.5" width="61" height="77" fill="none" stroke="#6a2a1a" stroke-width="3"/>
<circle cx="32" cy="40" r="9" fill="#d23a26" stroke="#6a2a1a" stroke-width="2"/><path d="M32 33l3 7-3 7-3-7z" fill="#f0c85a"/></svg>`, { size: 192 });
const PLAQUE = svg(`<svg viewBox="0 0 80 48"><rect width="80" height="48" rx="4" fill="#2b2531"/><rect x="3" y="3" width="74" height="42" rx="3" fill="none" stroke="#f0c85a" stroke-width="2"/>
<path d="M40 10l6 10h-12zM28 38c8-14 16-14 24 0M22 24h36" stroke="#f0c85a" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>`, { size: 160 });
const LANTERN = svg(`<svg viewBox="0 0 128 64"><rect width="128" height="64" fill="#e2412a"/>
<rect y="0" width="128" height="7" fill="#2b2531"/><rect y="57" width="128" height="7" fill="#2b2531"/>
${[0, 1, 2, 3].map((i) => `<g transform="translate(${i * 32 + 16} 32)"><circle r="13" fill="#fff1cf"/><path d="M0-8L5 0 0 8-5 0z" fill="#d23a26"/><circle r="2.5" fill="#f0c85a"/></g>`).join("")}</svg>`, { size: 256 });
const BARREL = svg(`<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#fff1cf"/><circle cx="32" cy="32" r="17" fill="#d23a26"/><path d="M32 20l5 12-5 12-5-12z" fill="#fff1cf"/></svg>`, { size: 96 });

export default function build() {
  const b = createBuilder({ name: "shrine" });
  const box = (w: number, h: number, d: number, color: any, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: at as any, rotation: rot as any });
  const cyl = (r0: number, r1: number, h: number, seg: number, color: any, at: number[]) =>
    b.part(new THREE.CylinderGeometry(r1, r0, h, seg), color, { at: at as any });
  const ball = (r: number, color: any, at: number[], sc: number[] = [1, 1, 1]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { at: at as any, scale: sc as any });

  // ground patch + path
  cyl(2.9, 2.9, 0.04, 14, GRASS, [0, 0.02, 0.2]);
  for (let i = 0; i < 7; i++) {
    const z = 3.2 - i * 0.62;
    box(0.7 + (i % 2) * 0.1, 0.05, 0.5, PATH, [((i * 37) % 5) * 0.03 - 0.06, 0.06, z], [0, (i % 3) * 6 - 6, 0]);
  }

  // ---------- shrine ----------
  box(2.0, 0.28, 1.6, STONE, [0, 0.16, -0.3]);
  box(1.0, 0.1, 0.4, STONE, [0, 0.07, 0.7]);
  box(1.4, 0.18, 0.35, STONE, [0, 0.1, 0.62]);
  box(1.3, 0.06, 1.0, "#5b3a28", [0, 0.33, -0.3]);
  box(1.15, 0.95, 0.85, WOOD, [0, 0.83, -0.35]);
  for (const sx of [1, -1]) for (const sz of [1, -1]) {
    cyl(0.07, 0.07, 1.0, 8, VERM, [sx * 0.62, 0.86, -0.35 + sz * 0.46]);
    cyl(0.1, 0.1, 0.06, 8, STONE, [sx * 0.62, 0.38, -0.35 + sz * 0.46]);
  }
  // door with lattice (glowing paper)
  glow(b.part(new THREE.PlaneGeometry(0.66, 0.8), "#ffffff", { at: [0, 0.82, 0.08], dir: [0, 0, 1], axis: "z", texture: LATTICE }), 0.45);
  box(0.76, 0.06, 0.06, VERM_D, [0, 1.25, 0.09]);
  box(0.06, 0.86, 0.06, VERM_D, [0.36, 0.82, 0.09]);
  box(0.06, 0.86, 0.06, VERM_D, [-0.36, 0.82, 0.09]);
  // veranda rail
  for (const sx of [1, -1]) box(0.05, 0.05, 0.9, VERM, [sx * 0.7, 0.62, 0.0]);
  box(1.5, 0.05, 0.05, VERM, [0, 0.6, 0.45]);
  // roof (hipped, 4-sided lathe)
  const roofProfile: any = [[0, 0.62], [0.88, 0.08], [1.02, -0.05], [1.0, -0.11], [0.84, -0.06], [0, -0.06]];
  b.lathe(roofProfile, { at: [0, 1.4, -0.35], segments: 4, spin: 45, color: ROOF });
  b.lathe([[0, 0.02], [0.9, -0.08], [0.9, -0.12], [0, -0.12]] as any, { at: [0, 1.36, -0.35], segments: 4, spin: 45, color: ROOF_D });
  box(0.32, 0.05, 0.32, GOLD, [0, 1.98, -0.35]);
  b.part(new THREE.ConeGeometry(0.07, 0.3, 6), GOLD, { at: [0, 2.15, -0.35] });
  ball(0.07, GOLD, [0, 2.0, -0.35]);
  for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]])
    b.part(new THREE.ConeGeometry(0.06, 0.2, 5), GOLD, { at: [sx * 0.88, 1.36, -0.35 + sz * 0.88], rotation: [sz * 40, 0, -sx * 40] });
  glow(b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 6), WARM, { at: [0, 1.5, 0.35] }), 1);

  // shimenawa across the door
  const rope = catmull([[-0.55, 1.34, 0.12], [-0.2, 1.26, 0.14], [0.2, 1.26, 0.14], [0.55, 1.34, 0.12]] as any);
  b.sweep(rope, 0.025, { color: "#d9c27a" });
  for (const x of [-0.35, -0.12, 0.12, 0.35])
    b.extrude([[0, 0], [0.05, 0], [0.05, -0.08], [0.02, -0.12], [0.05, -0.16], [0.0, -0.2], [-0.05, -0.15], [-0.02, -0.1], [-0.05, -0.06]] as any,
      { at: [x, 1.27, 0.16], x: [1, 0, 0], thickness: 0.01, color: WHITE });

  // offering table + offerings
  box(0.7, 0.05, 0.36, WOOD, [0, 0.4, 0.82]);
  for (const sx of [1, -1]) for (const sz of [1, -1]) box(0.05, 0.26, 0.05, WOOD, [sx * 0.3, 0.27, 0.82 + sz * 0.13]);
  cyl(0.11, 0.09, 0.03, 10, "#f2eee2", [-0.2, 0.44, 0.82]);
  for (const [x, z] of [[-0.23, 0.82], [-0.17, 0.85], [-0.2, 0.78]]) ball(0.035, "#d44a3a", [x, 0.49, z]);
  cyl(0.1, 0.08, 0.03, 10, "#f2eee2", [0.2, 0.44, 0.82]);
  for (let i = 0; i < 3; i++) {
    ball(0.032, [PINK, WHITE, "#9ccf7a"][i], [0.2, 0.49 + i * 0.062, 0.82]);
    cyl(0.004, 0.004, 0.2, 5, "#c89a60", [0.2, 0.53, 0.82]);
  }
  cyl(0.03, 0.03, 0.05, 8, "#e8e0d0", [0.0, 0.46, 0.76]);
  ball(0.045, "#e8602a", [0.0, 0.5, 0.88]);
  // sake barrel
  cyl(0.2, 0.2, 0.34, 12, WOOD, [1.2, 0.2, 0.75]);
  for (const y of [0.1, 0.3]) cyl(0.21, 0.21, 0.03, 12, GOLD, [1.2, y, 0.75]);
  b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", { at: [1.2, 0.2, 0.96], dir: [0, 0, 1], axis: "z", texture: BARREL });

  // ---------- fox guardians ----------
  for (const s of [1, -1]) {
    const x = s * 0.82, z = 0.7;
    box(0.34, 0.2, 0.34, STONE, [x, 0.12, z]);
    box(0.26, 0.28, 0.2, STONE, [x, 0.36, z - 0.03], [-12, 0, 0]);
    b.part(new THREE.SphereGeometry(0.13, 8, 6), STONE, { at: [x, 0.62, z + 0.04], scale: [1, 0.95, 0.95] });
    box(0.1, 0.09, 0.15, STONE, [x, 0.58, z + 0.17]);
    ball(0.025, BLACK, [x, 0.6, z + 0.25]);
    for (const e of [1, -1]) {
      b.part(new THREE.ConeGeometry(0.06, 0.18, 4), STONE, { at: [x + e * 0.08, 0.77, z], rotation: [0, 45, 0] });
      ball(0.02, BLACK, [x + e * 0.06, 0.64, z + 0.14]);
      b.part(new THREE.ConeGeometry(0.05, 0.3, 5), STONE, { at: [x + e * 0.1, 0.3, z - 0.2], rotation: [-70, 0, e * 25] });
    }
    box(0.28, 0.07, 0.05, VERM, [x, 0.5, z + 0.1], [10, 0, 0]);
    ball(0.025, GOLD, [x, 0.46, z + 0.13]);
  }

  // ---------- stone lanterns ----------
  const toro = (x: number, z: number) => {
    box(0.5, 0.1, 0.5, STONE, [x, 0.05, z]);
    cyl(0.13, 0.13, 0.5, 6, STONE, [x, 0.35, z]);
    cyl(0.2, 0.15, 0.08, 6, STONE, [x, 0.64, z]);
    glow(box(0.26, 0.26, 0.26, WARM, [x, 0.81, z]), 1.3);
    for (const [dx, dz, w, d] of [[0.14, 0, 0.04, 0.3], [-0.14, 0, 0.04, 0.3], [0, 0.14, 0.3, 0.04], [0, -0.14, 0.3, 0.04]])
      box(w, 0.3, d, STONE, [x + dx, 0.81, z + dz]);
    b.lathe([[0, 0.3], [0.2, 0.08], [0.36, -0.02], [0.35, -0.07], [0, -0.07]] as any, { at: [x, 1.0, z], segments: 6, color: STONE });
    ball(0.06, GOLD, [x, 1.33, z], [1, 1.3, 1]);
    b.part(new THREE.ConeGeometry(0.04, 0.1, 6), GOLD, { at: [x, 1.43, z] });
  };
  toro(1.35, 0.9); toro(-1.35, 0.9);

  // ---------- torii ----------
  const TZ = 2.0;
  for (const s of [1, -1]) {
    b.rod([s * 1.15, 0, TZ], [s * 1.1, 2.5, TZ], [0.14, 0.11], VERM, { sides: 10 } as any);
    cyl(0.2, 0.2, 0.18, 8, STONE, [s * 1.15, 0.09, TZ]);
    cyl(0.145, 0.145, 0.12, 10, BLACK, [s * 1.14, 0.24, TZ]);
    box(0.28, 0.1, 0.28, GOLD, [s * 1.1, 2.2, TZ]);
  }
  box(2.5, 0.16, 0.2, VERM, [0, 2.1, TZ]); // nuki
  box(0.36, 0.28, 0.13, "#ffffff", [0, 2.1, TZ]);
  b.part(new THREE.PlaneGeometry(0.36, 0.22), "#ffffff", { at: [0, 2.1, TZ + 0.07], dir: [0, 0, 1], axis: "z", texture: PLAQUE });
  box(2.7, 0.17, 0.3, BLACK, [0, 2.55, TZ]); // shimaki
  box(0.4, 0.2, 0.3, GOLD, [0, 2.55, TZ]);
  for (const s of [1, -1]) {
    box(1.1, 0.19, 0.34, VERM, [s * 1.2, 2.72, TZ], [0, 0, s * 8]);
    box(0.5, 0.19, 0.34, VERM, [s * 1.82, 2.8, TZ], [0, 0, s * 18]);
    box(0.08, 0.16, 0.3, GOLD, [s * 2.04, 2.86, TZ], [0, 0, s * 18]);
  }
  box(1.4, 0.19, 0.34, VERM, [0, 2.68, TZ]);
  // hanging paper lanterns
  for (const x of [-0.7, 0.7]) {
    b.rod([x, 2.0, TZ], [x, 1.8, TZ], 0.008, BLACK);
    cyl(0.08, 0.08, 0.04, 8, BLACK, [x, 1.78, TZ]);
    glow(b.part(new THREE.SphereGeometry(0.17, 10, 6), "#ffffff", { at: [x, 1.55, TZ], scale: [1, 1.25, 1], rotation: [0, -90, 0], texture: LANTERN }), 0.9);
    cyl(0.08, 0.08, 0.04, 8, BLACK, [x, 1.31, TZ]);
    for (let i = 0; i < 3; i++) b.rod([x + (i - 1) * 0.025, 1.3, TZ], [x + (i - 1) * 0.03, 1.12, TZ], 0.006, GOLD);
  }
  // shimenawa on torii
  b.sweep(catmull([[-1.1, 2.0, TZ + 0.14], [-0.4, 1.88, TZ + 0.14], [0.4, 1.88, TZ + 0.14], [1.1, 2.0, TZ + 0.14]] as any), 0.03, { color: "#d9c27a" });

  // sakura petals on ground
  for (let i = 0; i < 14; i++) {
    const a = i * 2.4, r = 0.8 + (i % 5) * 0.45;
    b.part(new THREE.CircleGeometry(0.035, 5), PINK, { at: [Math.sin(a) * r, 0.065, Math.cos(a) * r * 0.9 + 1.2], dir: [0, 1, 0], axis: "z" });
  }
  return b.root;
}
