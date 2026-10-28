import * as THREE from "three";
import { createBuilder, rng, svg, paint, mix, noise, smoothstep } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "roadside_shrine",
  description: "Inazuma-style roadside shrine with torii gate, stone lanterns, offerings and a small hokora.",
};

export default function build() {
  const b = createBuilder({ name: "shrine" });
  const R = rng(5);

  const RED = "#c8342b", DARKRED = "#8a2020", BLACK = "#2a2230", GOLD = "#e8c25a";
  const WOOD = "#8a5a3a", WOODD = "#5e3b27", ROOF = "#4a4a6a", ROOFL = "#6a6a92";
  const PAPER = "#fff1c8", WHITE = "#f4efe6", PINK = "#f3a6c0", GREEN = "#4f8f5a", PURPLE = "#8a5cc8";

  const STONE = paint((p, n) => {
    const m = noise(p, 0.12, 3);
    const base = mix("#a9a8a4", "#cfcdc4", m);
    const moss = smoothstep(0.55, 0.9, n.y) * smoothstep(0.45, 0.7, noise(p, 0.09, 8));
    const low = smoothstep(0.25, 0.0, p.y);
    return mix(mix(base, "#6f9a55", moss * 0.8), "#7b7466", low * 0.5);
  });
  const GRASS = paint((p) => mix("#6aa84f", "#8cc65a", noise(p, 0.15, 2)));

  const box = (w: number, h: number, d: number, c: any, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cyl = (rt: number, rb: number, h: number, c: any, x: number, y: number, z: number, seg = 8) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z] });

  // ground pad
  cyl(2.3, 2.4, 0.1, GRASS, 0, 0.04, 0.2, 12);
  // stone path
  for (let i = 0; i < 6; i++) box(0.9 - (i % 2) * 0.1, 0.06, 0.55, STONE, (i % 2 ? 0.06 : -0.06), 0.1, 2.0 - i * 0.62);

  // ---- torii gate
  const toriiZ = 1.5, tw = 1.5;
  for (const s of [1, -1]) {
    cyl(0.13, 0.15, 3.0, RED, s * tw, 1.6, toriiZ, 8);
    cyl(0.17, 0.17, 0.2, BLACK, s * tw, 0.2, toriiZ, 8);
    cyl(0.12, 0.12, 0.08, BLACK, s * tw, 2.9, toriiZ, 8);
  }
  box(3.7, 0.2, 0.22, BLACK, 0, 3.22, toriiZ);
  box(3.9, 0.12, 0.3, RED, 0, 3.4, toriiZ);
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.5, 0.12, 0.3), RED, { at: [s * 1.95, 3.5, toriiZ], rotation: [0, 0, s * 15] });
    b.part(new THREE.BoxGeometry(0.2, 0.2, 0.24), GOLD, { at: [s * 2.05, 3.55, toriiZ] });
  }
  box(3.1, 0.14, 0.16, RED, 0, 2.7, toriiZ);
  box(0.4, 0.5, 0.1, BLACK, 0, 3.0, toriiZ);
  const plaque = svg(
    `<svg viewBox="0 0 40 52"><rect width="40" height="52" rx="3" fill="#2a2230"/><rect x="3" y="3" width="34" height="46" rx="2" fill="none" stroke="#e8c25a" stroke-width="2"/><path d="M20 10 L20 40 M10 18 H30 M12 30 Q20 38 28 30" stroke="#e8c25a" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.38, 0.49), "#ffffff", { at: [0, 3.0, toriiZ + 0.07], dir: [0, 0, 1], axis: "z", texture: plaque });
  // shimenawa rope with shide
  b.sweep([[-1.4, 2.62, toriiZ + 0.14], [-0.5, 2.5, toriiZ + 0.16], [0.5, 2.5, toriiZ + 0.16], [1.4, 2.62, toriiZ + 0.14]], 0.045, { color: "#d9c48a" });
  const shide = svg(`<svg viewBox="0 0 20 40"><path d="M10 0 L20 10 L10 18 L20 28 L10 40 L0 28 L10 18 L0 10Z" fill="#ffffff" stroke="#bbb" stroke-width="1"/></svg>`, { size: 64 });
  for (let i = 0; i < 4; i++) {
    b.part(new THREE.PlaneGeometry(0.16, 0.32), "#ffffff", { at: [-0.9 + i * 0.6, 2.35, toriiZ + 0.17], dir: [0, 0, 1], axis: "z", texture: shide });
  }

  // ---- hokora (small shrine)
  const hz = -0.6;
  box(1.5, 0.3, 1.3, STONE, 0, 0.25, hz);
  box(1.3, 0.12, 1.1, STONE, 0, 0.46, hz);
  for (const sx of [1, -1]) for (const sz of [1, -1]) cyl(0.07, 0.07, 1.1, WOODD, sx * 0.55, 1.07, hz + sz * 0.42);
  box(1.1, 1.0, 0.8, WOOD, 0, 1.02, hz - 0.08);
  box(0.7, 0.8, 0.06, WOODD, 0, 1.0, hz + 0.34);
  const door = svg(`<svg viewBox="0 0 40 50"><rect width="40" height="50" fill="#5e3b27"/><path d="M0 0 L40 50 M40 0 L0 50" stroke="#3a2418" stroke-width="2"/><circle cx="20" cy="25" r="7" fill="#e8c25a"/></svg>`, { size: 128 });
  b.part(new THREE.PlaneGeometry(0.6, 0.72), "#ffffff", { at: [0, 1.0, hz + 0.38], dir: [0, 0, 1], axis: "z", texture: door });
  for (const s of [1, -1]) box(0.08, 0.9, 0.08, RED, s * 0.62, 1.02, hz + 0.38);
  // roof
  b.lathe([[0, 0], [1.25, 0], [1.1, 0.12], [0.1, 0.62], [0, 0.66]], { at: [0, 1.62, hz], segments: 4, spin: 45, color: ROOF });
  b.lathe([[0, 0], [1.38, 0], [1.38, 0.08], [0, 0.08]], { at: [0, 1.56, hz], segments: 4, spin: 45, color: ROOFL });
  cyl(0.04, 0.1, 0.3, GOLD, 0, 2.4, hz, 6);
  b.part(new THREE.SphereGeometry(0.1, 8, 6), GOLD, { at: [0, 2.58, hz] });
  // rope & bell
  b.sweep([[-0.4, 1.58, hz + 0.7], [0, 1.5, hz + 0.72], [0.4, 1.58, hz + 0.7]], 0.03, { color: RED });
  b.part(new THREE.SphereGeometry(0.1, 8, 6), GOLD, { at: [0, 1.38, hz + 0.72] });
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), "#fff3b0", { at: [0, 1.28, hz + 0.72] }), 1.5);
  // offering table + goods
  box(0.9, 0.08, 0.4, WOODD, 0, 0.62, hz + 0.9);
  for (const s of [1, -1]) box(0.06, 0.55, 0.06, WOODD, s * 0.4, 0.32, hz + 0.9);
  cyl(0.12, 0.1, 0.12, WHITE, -0.25, 0.72, hz + 0.9, 10);
  cyl(0.1, 0.12, 0.1, "#d98a3a", 0.0, 0.71, hz + 0.9, 10);
  // dango skewers
  for (let i = 0; i < 3; i++) {
    const x = 0.2 + i * 0.1;
    b.rod([x, 0.67, hz + 0.9], [x, 0.98, hz + 0.9], 0.008, WOOD);
    [PINK, WHITE, GREEN].forEach((c, k) => b.part(new THREE.SphereGeometry(0.045, 8, 6), c, { at: [x, 0.76 + k * 0.08, hz + 0.9] }));
  }
  // sake barrel & ema plaques
  cyl(0.28, 0.28, 0.4, WOOD, -1.3, 0.3, hz + 0.6, 12);
  for (const y of [0.18, 0.42]) cyl(0.295, 0.295, 0.04, BLACK, -1.3, y, hz + 0.6, 12);
  cyl(0.25, 0.25, 0.02, "#e8dfc4", -1.3, 0.51, hz + 0.6, 12);
  const ema = svg(`<svg viewBox="0 0 40 32"><path d="M0 8 L20 0 L40 8 V32 H0Z" fill="#d9a066" stroke="#5e3b27" stroke-width="2"/><path d="M20 10 l3 7 7 1 -5 5 2 7 -7 -4 -7 4 2 -7 -5 -5 7 -1z" fill="#c8342b"/></svg>`, { size: 96 });
  for (let i = 0; i < 4; i++)
    b.part(new THREE.PlaneGeometry(0.26, 0.21), "#ffffff", { at: [0.85, 1.0, hz + 0.1 + i * 0.01 - 0.35 + i * 0.01], dir: [1, 0, 0], axis: "z", texture: ema });
  // sakura tree
  cyl(0.12, 0.2, 1.9, WOODD, 1.9, 0.95, hz - 0.5, 6);
  for (let i = 0; i < 7; i++)
    b.part(new THREE.IcosahedronGeometry(0.55 + R() * 0.25, 0), i % 2 ? PINK : "#f7bfd2", {
      at: [1.9 + (R() - 0.5) * 1.1, 2.1 + R() * 0.7, hz - 0.5 + (R() - 0.5) * 1.0],
    });

  // ---- stone lanterns
  const lantern = (x: number, z: number) => {
    cyl(0.28, 0.32, 0.1, STONE, x, 0.15, z, 6);
    cyl(0.09, 0.11, 0.7, STONE, x, 0.55, z, 6);
    cyl(0.22, 0.14, 0.1, STONE, x, 0.95, z, 6);
    cyl(0.2, 0.2, 0.3, STONE, x, 1.15, z, 6);
    const win = svg(`<svg viewBox="0 0 20 20"><rect width="20" height="20" fill="#ffb347"/><rect x="2" y="2" width="16" height="16" fill="#ffe08a"/><path d="M10 2V18M2 10H18" stroke="#8a5a2a" stroke-width="1.2"/></svg>`, { size: 64 });
    for (const [dx, dz, dir] of [[0.17, 0, [1, 0, 0]], [-0.17, 0, [-1, 0, 0]], [0, 0.17, [0, 0, 1]], [0, -0.17, [0, 0, -1]]] as any)
      glow(b.part(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", { at: [x + dx * 1.05, 1.15, z + dz * 1.05], dir, axis: "z", texture: win }), 1.4);
    b.lathe([[0, 0], [0.4, 0], [0.3, 0.1], [0.05, 0.28], [0, 0.3]], { at: [x, 1.3, z], segments: 6, color: STONE });
    b.part(new THREE.SphereGeometry(0.07, 6, 4), STONE, { at: [x, 1.64, z] });
  };
  lantern(-1.0, 1.0);
  lantern(1.0, 1.0);

  // ---- hanging paper lanterns on torii
  const paper = svg(`<svg viewBox="0 0 40 50"><rect width="40" height="50" fill="#ffd9a0"/><rect y="0" width="40" height="5" fill="#2a2230"/><rect y="45" width="40" height="5" fill="#2a2230"/><path d="M20 12 V38 M12 18 H28 M13 30 H27" stroke="#c8342b" stroke-width="3" stroke-linecap="round"/></svg>`, { size: 96 });
  for (const s of [1, -1]) {
    b.rod([s * 0.8, 3.15, toriiZ], [s * 0.8, 2.95, toriiZ], 0.01, BLACK);
    glow(b.part(new THREE.CylinderGeometry(0.17, 0.15, 0.38, 10), "#ffffff", { at: [s * 0.8, 2.75, toriiZ], texture: paper }), 1.3);
    cyl(0.05, 0.05, 0.1, BLACK, s * 0.8, 2.52, toriiZ, 6);
  }

  // ---- fox guardian statues
  for (const s of [1, -1]) {
    const x = s * 0.9, z = 0.2;
    box(0.5, 0.25, 0.5, STONE, x, 0.22, z);
    b.part(new THREE.SphereGeometry(0.22, 8, 6), STONE, { at: [x, 0.55, z], scale: [1, 1.2, 0.9] });
    b.part(new THREE.SphereGeometry(0.15, 8, 6), STONE, { at: [x, 0.9, z + 0.04] });
    b.part(new THREE.ConeGeometry(0.08, 0.2, 4), STONE, { at: [x, 0.9, z + 0.2], rotation: [90, 0, 0] });
    for (const e of [1, -1]) b.part(new THREE.ConeGeometry(0.06, 0.2, 4), STONE, { at: [x + e * 0.09, 1.08, z] });
    b.part(new THREE.BoxGeometry(0.34, 0.07, 0.05), RED, { at: [x, 0.7, z + 0.15] });
    glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), PURPLE, { at: [x, 0.45, z + 0.25] }), 1.5);
  }

  return b.root;
}
