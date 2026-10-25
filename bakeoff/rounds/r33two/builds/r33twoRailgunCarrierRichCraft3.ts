import * as THREE from "three";
import { createBuilder, rng, paint, mix, noise, smoothstep, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Railgun Carrier",
  description: "Six-wheeled military railgun carrier braced on four stabiliser legs, low-poly sci-fi.",
};

const HULL = "#4f5a43";
const HULL_D = "#38412f";
const PLATE = "#667357";
const DARK = "#1c1f1a";
const RUBBER = "#17181a";
const STEEL = "#8a9099";
const HAZ = "#e0b020";
const CYAN = "#46e8ff";
const RED = "#d83a2a";

const hullPaint = paint((p, n) => {
  const base = mix(HULL_D, PLATE, smoothstep(-0.3, 0.8, n.y));
  const w = noise(p, 0.25, 3);
  return mix(base, "#2c3326", smoothstep(0.55, 0.85, w) * 0.5);
});

const stripeTex = svg(
  `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e0b020"/>${[0, 1, 2, 3, 4, 5, 6, 7]
    .map((i) => `<path d="M${i * 16 - 8} 16 L${i * 16} 0 L${i * 16 + 8} 0 L${i * 16} 16Z" fill="#17181a"/>`)
    .join("")}</svg>`,
  { size: 128 },
);
const emblem = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#1c1f1a" stroke="#e8e8e0" stroke-width="4"/><path d="M12 32 H52 M40 20 L52 32 L40 44" stroke="#46e8ff" stroke-width="6" fill="none"/></svg>`,
  { size: 128 },
);
const hatch = svg(
  `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#667357"/><rect x="6" y="6" width="52" height="52" fill="none" stroke="#2c3326" stroke-width="4"/><circle cx="32" cy="32" r="9" fill="#2c3326"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });
  const R = rng(5);
  const root = b.joint("hull", { at: [0, 0.95, 0], role: "spine" });
  const turret = b.joint("turret", { parent: root, at: [0, 1.75, -0.4], dir: [0, 0, 1] });
  const cradle = b.joint("cradle", { parent: turret, at: [0, 0.5, 0.2], dir: [0, 0, 1], role: "hinge" });

  const box = (w: number, h: number, d: number, c: any, at: number[], bone: any = root, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, ...o });
  const cyl = (r: number, r2: number, h: number, seg: number, c: any, at: number[], dir: number[], bone: any = root) =>
    b.part(new THREE.CylinderGeometry(r, r2, h, seg), c, { bone, at, dir });

  // Hull: lower tub + upper deck + sloped glacis
  box(2.4, 0.7, 7.2, hullPaint, [0, 0.95, 0]);
  box(2.2, 0.5, 6.4, hullPaint, [0, 1.5, -0.2]);
  b.frustumBox([0, 1.1, 3.6], [0, 1.45, 4.3], [2.4, 0.7], [2.1, 0.2], { bone: root, color: hullPaint });
  b.frustumBox([0, 1.0, -3.6], [0, 1.0, -4.0], [2.2, 0.6], [1.9, 0.4], { bone: root, color: HULL_D });
  // Cab
  box(1.9, 0.8, 1.6, hullPaint, [0, 2.0, 2.5]);
  b.part(new THREE.BoxGeometry(1.6, 0.35, 0.05), CYAN, { bone: root, at: [0, 2.1, 3.32], rotation: [-12, 0, 0] });
  glow(b.part(new THREE.BoxGeometry(1.5, 0.3, 0.04), CYAN, { bone: root, at: [0, 2.1, 3.33], rotation: [-12, 0, 0] }), 0.9);
  // Hull plating & details
  for (const s of [1, -1]) {
    box(0.08, 0.55, 5.6, PLATE, [s * 1.24, 1.0, 0]);
    b.part(new THREE.PlaneGeometry(1.2, 0.3), "#ffffff", { bone: root, at: [s * 1.26, 1.4, 1.5], dir: [s, 0, 0], axis: "z", texture: stripeTex });
    b.part(new THREE.CircleGeometry(0.28, 12), "#ffffff", { bone: root, at: [s * 1.26, 1.05, -0.5], dir: [s, 0, 0], axis: "z", texture: emblem });
    // headlights
    glow(box(0.25, 0.14, 0.06, "#fff3b0", [s * 0.8, 1.2, 4.33], root), 1.4);
    // fender boxes
    for (let i = 0; i < 3; i++) box(0.5, 0.06, 1.5, HULL_D, [s * 1.55, 0.72, -2.2 + i * 2.2]);
    // exhaust stacks
    cyl(0.1, 0.1, 0.9, 8, STEEL, [s * 0.9, 2.1, -2.9], [0, 1, 0]);
    cyl(0.12, 0.12, 0.08, 8, DARK, [s * 0.9, 2.58, -2.9], [0, 1, 0]);
    // antennae
    b.rod([s * 0.8, 1.8, -3.2], [s * 0.8, 3.4, -3.4], 0.02, DARK, { bone: root });
    glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), RED, { bone: root, at: [s * 0.8, 3.42, -3.4] }), 1.5);
  }
  box(1.4, 0.04, 1.0, "#ffffff", [0, 1.78, -2.2], root, {});
  b.part(new THREE.PlaneGeometry(1.0, 0.8), "#ffffff", { bone: root, at: [0, 1.77, -2.2], dir: [0, 1, 0], axis: "z", texture: hatch });
  // Grille & tow hook
  for (let i = 0; i < 4; i++) box(1.5, 0.04, 0.05, DARK, [0, 1.0 + i * 0.1, 4.32]);
  box(0.3, 0.12, 0.3, STEEL, [0, 0.7, 4.2]);

  // Wheels: 3 per side
  const zs = [2.6, 0, -2.6];
  const wheels: any[] = [];
  for (const s of [1, -1])
    zs.forEach((z, i) => {
      const w = b.joint(`wheel${s > 0 ? "L" : "R"}${i + 1}`, { parent: root, at: [s * 1.5, 0.62, z], dir: [s, 0, 0], role: "leg" });
      wheels.push(w);
      cyl(0.62, 0.62, 0.55, 12, RUBBER, [s * 1.5, 0.62, z], [s, 0, 0], w);
      cyl(0.36, 0.36, 0.6, 10, STEEL, [s * 1.5, 0.62, z], [s, 0, 0], w);
      cyl(0.12, 0.12, 0.66, 6, DARK, [s * 1.5, 0.62, z], [s, 0, 0], w);
      b.ring({ at: new THREE.Vector3(s * 1.8, 0.62, z), axis: new THREE.Vector3(s, 0, 0) } as any, { count: 6, radius: 0.24 }, (it: any) =>
        b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6), DARK, { bone: w, at: it.at, dir: [s, 0, 0] }),
      );
      // axle strut
      box(0.5, 0.12, 0.2, HULL_D, [s * 1.1, 0.75, z]);
    });

  // Stabiliser legs: four, deployed outward and down
  const legs: [number, number][] = [[1, 1.8], [-1, 1.8], [1, -3.0], [-1, -3.0]];
  legs.forEach(([s, z], i) => {
    const hip = [s * 1.2, 1.1, z];
    const foot = [s * 2.7, 0.08, z + (z > 0 ? 0.6 : -0.6)];
    const kneeP = [s * 2.2, 1.0, z + (z > 0 ? 0.3 : -0.3)];
    const j1 = b.joint(`stabHip${i + 1}`, { parent: root, at: hip, aim: kneeP, role: "leg" });
    const j2 = b.joint(`stabKnee${i + 1}`, { parent: j1, at: kneeP, aim: foot, role: "leg" });
    b.rod(hip, kneeP, 0.1, HULL_D, { bone: j1 });
    b.rod(kneeP, [foot[0], 0.2, foot[2]], 0.09, STEEL, { bone: j2 });
    b.rod([s * 1.9, 0.9, z], [s * 2.6, 0.5, z + (z > 0 ? 0.5 : -0.5)], 0.04, DARK, { bone: j2 });
    cyl(0.2, 0.2, 0.2, 8, HAZ, kneeP, [0, 0, 1], j2);
    cyl(0.32, 0.4, 0.14, 8, STEEL, [foot[0], 0.07, foot[2]], [0, 1, 0], j2);
    cyl(0.18, 0.18, 0.2, 8, DARK, [foot[0], 0.22, foot[2]], [0, 1, 0], j2);
  });

  // Turret
  cyl(1.0, 1.1, 0.25, 12, HULL_D, [0, 1.85, -0.4], [0, 1, 0], turret);
  box(2.0, 0.7, 2.6, hullPaint, [0, 2.3, -0.5], turret);
  b.frustumBox([0, 2.3, 0.8], [0, 2.3, 1.2], [1.8, 0.6], [1.2, 0.4], { bone: turret, color: hullPaint });
  for (const s of [1, -1]) {
    box(0.2, 0.9, 2.4, PLATE, [s * 1.0, 2.3, -0.4], turret);
    glow(box(0.04, 0.12, 1.4, CYAN, [s * 1.12, 2.35, -0.4], turret), 1.2);
    b.part(new THREE.CircleGeometry(0.3, 12), "#ffffff", { bone: turret, at: [s * 1.12, 2.35, -1.2], dir: [s, 0, 0], axis: "z", texture: emblem });
    // cradle arms
    box(0.18, 0.5, 0.9, STEEL, [s * 0.55, 2.8, 0.5], turret);
  }
  // Capacitor bank on turret rear
  for (let i = 0; i < 4; i++) {
    cyl(0.22, 0.22, 1.1, 8, STEEL, [-0.7 + i * 0.47, 2.95, -1.4], [0, 0, 1], turret);
    glow(cyl(0.24, 0.24, 0.1, 8, CYAN, [-0.7 + i * 0.47, 2.95, -0.9], [0, 0, 1], turret), 1.2);
  }
  // Railgun: twin rails on cradle
  box(0.8, 0.5, 1.6, DARK, [0, 2.8, 0.6], cradle);
  for (const s of [1, -1]) {
    b.rod([s * 0.2, 2.8, 1.2], [s * 0.2, 2.8, 6.4], 0.14, STEEL, { bone: cradle, sides: 4 });
    for (let k = 0; k < 6; k++) cyl(0.2, 0.2, 0.1, 6, HAZ, [s * 0.2, 2.8, 1.8 + k * 0.85], [0, 0, 1], cradle);
    glow(b.rod([s * 0.2, 2.8, 6.4], [s * 0.2, 2.8, 6.6], 0.1, CYAN, { bone: cradle }), 1.6);
  }
  box(0.28, 0.16, 5.2, DARK, [0, 2.8, 3.9], cradle);
  box(0.9, 0.7, 0.4, HULL_D, [0, 2.8, 1.5], cradle);
  box(0.9, 0.1, 0.3, HULL_D, [0, 2.8, 6.0], cradle);
  b.part(new THREE.PlaneGeometry(0.9, 0.2), "#ffffff", { bone: cradle, at: [0, 3.17, 1.5], dir: [0, 1, 0], axis: "z", texture: stripeTex });

  // Cargo hatch & rear ammo boxes
  for (let i = 0; i < 3; i++) box(0.5, 0.35, 0.5, i % 2 ? HULL_D : PLATE, [-0.7 + i * 0.7, 1.95, -3.2 + R() * 0.1]);
  b.pose(cradle, { axis: [1, 0, 0], deg: -4 });
  return b.root;
}
