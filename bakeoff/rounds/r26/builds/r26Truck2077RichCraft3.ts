import * as THREE from "three";
import { createBuilder, svg, rng, paint, mottle } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { metal, panelled } from "../../../../kits/clockwork";

export const meta = {
  name: "Warhog 2077",
  description: "Low-poly cyberpunk 6x6 armoured military truck with neon trim, roof turret and missile pods.",
};

export default function build() {
  const b = createBuilder({ name: "warhog2077" });
  const R = rng(77);

  const STEEL = "#2a2f39", DARK = "#14161c", RUBBER = "#0d0d10", CYAN = "#19f0ff", MAG = "#ff2bd6",
    AMBER = "#ffb020", GLASS = "#0a2a3a", RED = "#ff2a3a", OLIVE = "#3a4538";
  const HULL = panelled(metal("iron", { size: 0.25, tarnish: 0.5 }), { size: 0.55, rivets: 0.08 });
  const CAB = panelled(mottle("#2e3544", "#1d2230", { size: 0.5 }), { size: 0.5, rivets: 0.07 });
  const GUNM = metal("steel", { tarnish: 0.6, polish: 0.2 });
  const SKIRT = paint((p, n) => (n.y > 0.6 ? "#4a5260" : "#252a33"));

  const P = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) => b.part(g, c, { at, ...o });
  const box = (w: number, h: number, d: number, at: number[], c: any, o: any = {}) =>
    P(new THREE.BoxGeometry(w, h, d), c, at, o);
  const cyl = (r: number, r2: number, l: number, seg: number, at: number[], c: any, dir: number[] = [0, 1, 0]) =>
    P(new THREE.CylinderGeometry(r, r2, l, seg), c, at, { dir });
  const lamp = (w: number, h: number, d: number, at: number[], c: string, k = 1.4) =>
    glow(box(w, h, d, at, c), k);

  // ---- textures
  const HAZARD = svg(
    `<svg viewBox="0 0 120 8"><rect width="120" height="8" fill="#e8b020"/>${Array.from({ length: 16 }, (_, i) =>
      `<path d="M${i * 8} 8 L${i * 8 + 4} 0 L${i * 8 + 8} 0 L${i * 8 + 4} 8Z" fill="#111"/>`).join("")}</svg>`,
    { size: 480 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#0b0d12" stroke="#19f0ff" stroke-width="5"/>
    <path d="M50 14 L82 70 L50 58 L18 70Z" fill="#ff2bd6"/><path d="M50 30 L66 60 L50 54 L34 60Z" fill="#0b0d12"/>
    <text x="50" y="90" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="15" fill="#19f0ff">2077</text></svg>`,
    { size: 256 },
  );
  const GRILLE = svg(
    `<svg viewBox="0 0 100 40"><rect width="100" height="40" fill="#08090c"/>${Array.from({ length: 9 }, (_, i) =>
      `<rect x="4" y="${3 + i * 4.2}" width="92" height="2" fill="${i % 3 === 0 ? "#19f0ff" : "#3a4150"}"/>`).join("")}</svg>`,
    { size: 256 },
  );
  const SCREEN = svg(
    `<svg viewBox="0 0 64 40"><rect width="64" height="40" fill="#021018"/><path d="M4 30 L14 18 L24 24 L36 8 L46 20 L60 10" stroke="#19f0ff" stroke-width="2" fill="none"/>
    <rect x="4" y="34" width="30" height="3" fill="#ff2bd6"/><circle cx="52" cy="30" r="5" fill="none" stroke="#ffb020" stroke-width="2"/></svg>`,
    { size: 192 },
  );
  const VENT = svg(
    `<svg viewBox="0 0 40 40"><rect width="40" height="40" fill="#0a0b0e"/>${Array.from({ length: 7 }, (_, i) =>
      `<rect x="3" y="${3 + i * 5.2}" width="34" height="2.6" fill="#ff7a20"/>`).join("")}</svg>`,
    { size: 128 },
  );
  const flat = (tex: any, w: number, h: number, at: number[], dir: number[], tint = "#ffffff", g = 0) => {
    const p = P(new THREE.PlaneGeometry(w, h), tint, at, { dir, axis: "z", texture: tex });
    if (g) glow(p, g);
    return p;
  };

  // ---- chassis
  for (const s of [1, -1]) box(0.28, 0.4, 8.6, [s * 0.75, 0.95, -0.1], DARK);
  for (let z = -4; z <= 4; z += 1.0) box(1.8, 0.2, 0.25, [0, 0.9, z], DARK);
  box(2.2, 0.35, 8.0, [0, 0.72, -0.1], STEEL); // belly plate
  lamp(1.6, 0.04, 6.8, [0, 0.52, -0.2], CYAN, 1.2); // underglow
  box(2.5, 0.5, 8.6, [0, 1.25, -0.1], HULL);

  // ---- wheels
  const axles = [3.0, -1.2, -3.0];
  for (const z of axles)
    for (const s of [1, -1]) {
      const x = s * 1.45;
      cyl(0.72, 0.72, 0.55, 10, [x, 0.71, z], RUBBER, [1, 0, 0]);
      cyl(0.46, 0.46, 0.6, 10, [x, 0.71, z], GUNM, [1, 0, 0]);
      cyl(0.18, 0.18, 0.66, 8, [x, 0.71, z], DARK, [1, 0, 0]);
      glow(P(new THREE.TorusGeometry(0.4, 0.035, 4, 12), s > 0 ? CYAN : MAG, [x + s * 0.3, 0.71, z], { dir: [s, 0, 0], axis: "z" }), 1.5);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        cyl(0.03, 0.03, 0.08, 6, [x + s * 0.31, 0.71 + Math.sin(a) * 0.27, z + Math.cos(a) * 0.27], AMBER, [1, 0, 0]);
      }
      // tread blocks
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        box(0.57, 0.1, 0.18, [x, 0.71 + Math.sin(a) * 0.73, z + Math.cos(a) * 0.73], "#050507", { rotation: [(-a * 180) / Math.PI + 90, 0, 0] });
      }
      // fender
      box(0.8, 0.1, 1.75, [s * 1.45, 1.55, z], CAB);
      box(0.8, 0.3, 0.1, [s * 1.45, 1.4, z + 0.85], CAB, { rotation: [-25, 0, 0] });
      box(0.8, 0.3, 0.1, [s * 1.45, 1.4, z - 0.85], CAB, { rotation: [25, 0, 0] });
    }
  for (const z of axles) cyl(0.12, 0.12, 2.9, 8, [0, 0.71, z], DARK, [1, 0, 0]);

  // ---- cab
  b.extrude(
    [[2.2, 1.45], [4.5, 1.45], [4.55, 2.15], [3.95, 3.0], [2.9, 3.3], [2.2, 3.3]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.4, bevel: 0.06, color: CAB },
  );
  // hood nose
  box(2.3, 0.25, 0.5, [0, 2.2, 4.5], CAB);
  box(2.5, 0.5, 0.3, [0, 1.55, 4.6], STEEL); // bumper
  flat(GRILLE, 1.6, 0.64, [0, 1.95, 4.62], [0, 0, 1]);
  for (const s of [1, -1]) {
    lamp(0.5, 0.14, 0.1, [s * 0.85, 2.3, 4.58], "#e8ffff", 2);
    lamp(0.1, 0.5, 0.06, [s * 1.2, 1.95, 4.57], MAG);
    for (let i = 0; i < 3; i++) box(0.12, 0.5, 0.45, [s * (0.4 + i * 0.4), 1.4, 4.88], DARK); // ram teeth
    // side windows
    flat(SCREEN, 0.9, 0.5, [s * 1.215, 2.55, 3.2], [s, 0, 0], "#ffffff", 0.5);
    box(0.06, 0.55, 1.1, [s * 1.205, 2.55, 3.2], GLASS);
    flat(EMBLEM, 0.8, 0.8, [s * 1.215, 1.95, 3.4], [s, 0, 0]);
    // mirrors
    box(0.1, 0.5, 0.25, [s * 1.45, 2.6, 4.0], DARK);
    lamp(0.04, 0.4, 0.2, [s * 1.51, 2.6, 4.0], CYAN);
    // skirts
    box(0.12, 0.35, 7.6, [s * 1.3, 1.05, -0.1], SKIRT);
    flat(HAZARD, 7.0, 0.2, [s * 1.37, 1.05, -0.1], [s, 0, 0]);
    // stacks
    cyl(0.12, 0.12, 1.8, 8, [s * 1.12, 3.2, 2.0], GUNM);
    cyl(0.16, 0.12, 0.15, 8, [s * 1.12, 4.15, 2.0], DARK);
    lamp(0.18, 0.04, 0.18, [s * 1.12, 4.24, 2.0], AMBER);
  }
  box(2.0, 0.9, 0.06, [0, 2.6, 4.23], GLASS, { rotation: [-35.5, 0, 0] });
  glow(box(1.9, 0.06, 0.06, [0, 2.12, 4.4], CYAN), 1.6);
  box(2.2, 0.15, 1.1, [0, 3.35, 3.5], STEEL); // roof plate
  for (let i = 0; i < 4; i++) lamp(0.3, 0.06, 0.08, [-0.45 + i * 0.3, 3.46, 3.9], i % 2 ? RED : AMBER, 1.6);
  lamp(2.4, 0.05, 0.05, [0, 3.45, 2.3], MAG);

  // ---- cargo / armoured bed
  box(2.7, 1.5, 6.1, [0, 2.25, -1.1], HULL);
  box(2.5, 0.2, 5.8, [0, 3.1, -1.1], STEEL);
  for (let z = -3.6; z <= 1.4; z += 1.25) {
    box(2.8, 1.55, 0.1, [0, 2.25, z], DARK);
    for (const s of [1, -1]) {
      box(0.1, 0.9, 0.9, [s * 1.37, 2.2, z + 0.62], CAB);
      flat(VENT, 0.5, 0.4, [s * 1.43, 2.0, z + 0.62], [s, 0, 0], "#ffffff", 0.9);
    }
  }
  for (const s of [1, -1]) {
    lamp(0.05, 0.05, 6.0, [s * 1.38, 2.9, -1.1], s > 0 ? CYAN : MAG, 1.6);
    lamp(0.05, 0.05, 6.0, [s * 1.38, 1.6, -1.1], s > 0 ? MAG : CYAN, 1.4);
  }
  // rear
  box(2.4, 1.3, 0.12, [0, 2.2, -4.2], STEEL);
  for (const s of [1, -1]) {
    lamp(0.3, 0.6, 0.08, [s * 1.1, 2.0, -4.28], RED, 1.8);
    cyl(0.1, 0.1, 0.9, 8, [s * 0.5, 1.5, -4.5], GUNM, [0, 0, 1]);
  }
  box(0.7, 0.18, 0.06, [0, 1.7, -4.3], "#ddd8c0");
  box(2.7, 0.3, 0.3, [0, 1.05, -4.5], STEEL);
  // roof ribs and antennae
  for (let z = -3.8; z <= 1.6; z += 0.9) box(2.4, 0.08, 0.14, [0, 3.24, z], DARK);

  // ---- roof turret
  b.lathe([[0, 0], [0.75, 0], [0.75, 0.15], [0.55, 0.3], [0, 0.3]], { at: [0, 3.2, 0.8], color: GUNM, segments: 10 });
  box(1.2, 0.55, 1.3, [0, 3.7, 0.8], CAB);
  box(0.9, 0.2, 0.5, [0, 3.95, 0.5], STEEL);
  lamp(0.5, 0.12, 0.05, [0, 3.72, 1.46], CYAN, 1.8);
  for (const s of [1, -1]) {
    cyl(0.07, 0.07, 2.0, 8, [s * 0.32, 3.7, 2.0], DARK, [0, 0, 1]);
    cyl(0.12, 0.12, 0.35, 8, [s * 0.32, 3.7, 1.55], STEEL, [0, 0, 1]);
    glow(cyl(0.05, 0.05, 0.05, 6, [s * 0.32, 3.7, 3.02], AMBER, [0, 0, 1]), 2);
    box(0.25, 0.4, 0.5, [s * 0.75, 3.7, 0.8], STEEL);
  }
  // sensor mast and dish
  cyl(0.04, 0.04, 1.0, 6, [0.8, 3.75, -3.4], DARK);
  b.lathe([[0, 0], [0.4, 0.25], [0.38, 0.28], [0, 0.06]], { at: [0.8, 4.25, -3.4], color: STEEL, segments: 10 });
  glow(P(new THREE.SphereGeometry(0.06, 6, 4), RED, [0.8, 4.4, -3.4]), 2);
  for (const [x, h] of [[-0.9, 2.2], [-1.1, 1.6]] as number[][]) {
    cyl(0.015, 0.015, h, 4, [x, 3.2 + h / 2, -3.9], DARK);
    glow(P(new THREE.SphereGeometry(0.04, 4, 3), MAG, [x, 3.2 + h, -3.9]), 2);
  }

  // ---- missile pods
  for (const s of [1, -1]) {
    const pod = [s * 0.85, 3.55, -1.6];
    box(1.0, 0.8, 1.6, pod, CAB, { rotation: [-10, 0, 0] });
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 3; j++) {
        const x = s * (0.55 + i * 0.3) * 1 + (s > 0 ? 0.0 : 0) + (i ? 0 : 0);
        cyl(0.11, 0.11, 0.08, 8, [x + s * 0.0 + (s > 0 ? 0.0 : 0), 3.3 + j * 0.25, -0.8], "#050608", [0, 0, 1]);
        cyl(0.0, 0.08, 0.2, 6, [x, 3.3 + j * 0.25, -0.72], R() > 0.5 ? AMBER : RED, [0, 0, 1]);
      }
  }

  // ---- fuel tanks and detail clutter
  for (const s of [1, -1]) {
    cyl(0.28, 0.28, 1.4, 8, [s * 1.3, 1.45, -1.2 - 0], OLIVE, [0, 0, 1]);
    box(0.06, 0.4, 0.06, [s * 1.0, 1.0, 2.0], AMBER);
  }
  for (let i = 0; i < 8; i++) lamp(0.12, 0.04, 0.04, [1.26, 1.2 + (i % 2) * 0.12, 3.9 - i * 0.2], i % 2 ? CYAN : MAG, 1.3);
  flat(HAZARD, 2.2, 0.15, [0, 1.45, 4.77], [0, 0, 1]);

  return b.root;
}
