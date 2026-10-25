import * as THREE from "three";
import { createBuilder, rng, paint, noise, mix } from "../../../../src/index";
import { svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Railgun Carrier",
  description: "Six-wheeled railgun carrier braced on four stabiliser legs, low-poly sci-fi military.",
};

const OLIVE = "#5b6b45";
const OLIVE_D = "#3f4b30";
const DARK = "#23262b";
const STEEL = "#8b929c";
const TAN = "#a89a6a";
const TIRE = "#17181a";
const WARN = "#e0b020";
const CYAN = "#5ff0ff";

const HULL = paint((p, n) => {
  const k = noise(p, 0.25, 3);
  const base = mix(OLIVE, OLIVE_D, k * 0.7);
  return mix(base, "#9aa58a", Math.max(0, n.y) * 0.18);
});

const STRIPE = svg(
  `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e0b020"/>${[0, 1, 2, 3, 4, 5, 6, 7]
    .map((i) => `<path d="M${i * 16 - 8} 16 L${i * 16} 0 L${i * 16 + 8} 0 L${i * 16} 16Z" fill="#1a1a1a"/>`)
    .join("")}</svg>`,
  { size: 128 },
);
const EMBLEM = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#1d2218" stroke="#e0b020" stroke-width="4"/><path d="M12 40 L52 24 M12 32 L52 32" stroke="#5ff0ff" stroke-width="5"/><path d="M32 8 L38 24 L26 24Z" fill="#e0b020"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });
  const r = rng(5);
  const root = b.joint("hull", { at: [0, 0.9, 0], role: "spine" });
  const turret = b.joint("turret", { parent: root, at: [0, 1.75, -0.6], dir: [0, 0, 1] });
  const elev = b.joint("elevation", { parent: turret, at: [0, 0.5, 0.4], dir: [0, 0, 1], role: "hinge" });

  const box = (w: number, h: number, d: number, col: any, at: number[], bone: any = root, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, ...extra });

  // chassis
  box(2.6, 0.5, 8.4, DARK, [0, 0.85, 0]);
  box(2.9, 0.7, 7.6, HULL, [0, 1.45, -0.2]);
  // sloped nose
  b.frustumBox([0, 1.45, 3.6], [0, 1.45, 4.5], [2.9, 0.7], [2.5, 0.35], { bone: root, color: HULL });
  box(2.4, 0.08, 0.9, OLIVE_D, [0, 1.85, 3.8]);
  // cab
  box(2.3, 0.9, 1.7, OLIVE_D, [0, 2.15, 2.8]);
  box(2.0, 0.45, 0.1, "#223a44", [0, 2.3, 3.68], root, { rotation: [-15, 0, 0] });
  glow(box(1.9, 0.1, 0.05, CYAN, [0, 2.45, 3.7]), 1.2);
  // side armour plates
  for (const s of [1, -1]) {
    box(0.12, 0.6, 7, OLIVE_D, [s * 1.5, 1.4, -0.2]);
    for (let i = 0; i < 5; i++) box(0.16, 0.5, 0.08, DARK, [s * 1.52, 1.4, -2.8 + i * 1.4]);
    b.part(new THREE.PlaneGeometry(1.4, 0.35), "#ffffff", {
      bone: root, at: [s * 1.585, 1.55, 1.5], dir: [s, 0, 0], axis: "z", texture: STRIPE,
    });
    b.part(new THREE.CircleGeometry(0.4, 12), "#ffffff", {
      bone: root, at: [s * 1.59, 1.45, -1.5], dir: [s, 0, 0], axis: "z", texture: EMBLEM,
    });
    // headlights
    glow(box(0.3, 0.15, 0.1, "#fff1b0", [s * 1.0, 1.35, 4.45]), 1.4);
    // exhaust
    b.part(new THREE.CylinderGeometry(0.1, 0.12, 1.1, 6), STEEL, { bone: root, at: [s * 1.2, 2.3, 1.9] });
  }
  // rear deck
  box(2.6, 0.2, 2.2, DARK, [0, 1.85, -2.9]);
  box(2.0, 0.5, 1.0, TAN, [0, 2.05, -3.2]);

  // wheels: 3 axles
  const wheelZ = [3.0, 0.2, -2.6];
  wheelZ.forEach((z, i) => {
    for (const s of [1, -1]) {
      const w = b.joint(`wheel${s > 0 ? "L" : "R"}${i + 1}`, { parent: root, at: [s * 1.55, 0.6, z], dir: [s, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.62, 0.62, 0.55, 10), TIRE, { bone: w, at: [s * 1.6, 0.62, z], dir: [s, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.6, 8), STEEL, { bone: w, at: [s * 1.62, 0.62, z], dir: [s, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.66, 6), WARN, { bone: w, at: [s * 1.62, 0.62, z], dir: [s, 0, 0] });
      // fender
      box(0.7, 0.1, 1.6, OLIVE_D, [s * 1.6, 1.3, z], root);
      // axle
      b.rod([s * 0.2, 0.62, z], [s * 1.3, 0.62, z], 0.12, DARK, { bone: root });
    }
  });

  // stabiliser legs (4) with pads
  const legs: [number, number][] = [[1, 2.2], [-1, 2.2], [1, -3.4], [-1, -3.4]];
  legs.forEach(([s, z], i) => {
    const hip = b.joint(`stabHip${i + 1}`, { parent: root, at: [s * 1.5, 1.2, z], dir: [s, -0.4, 0], role: "leg" });
    const foot = [s * 2.7, 0.08, z];
    b.rod([s * 1.5, 1.2, z], [s * 2.5, 0.55, z], 0.14, STEEL, { bone: hip });
    b.rod([s * 2.5, 0.55, z], [s * 2.7, 0.15, z], 0.1, WARN, { bone: hip });
    b.part(new THREE.CylinderGeometry(0.4, 0.46, 0.14, 8), DARK, { bone: hip, at: foot });
    b.rod([s * 1.5, 1.7, z], [s * 2.35, 0.8, z], 0.06, DARK, { bone: hip });
  });

  // turret ring
  b.part(new THREE.CylinderGeometry(1.5, 1.6, 0.35, 10), DARK, { bone: turret, at: [0, 1.95, -0.6] });
  box(2.0, 0.8, 2.6, HULL, [0, 2.45, -0.6], turret);
  box(2.2, 0.15, 2.2, OLIVE_D, [0, 2.9, -0.7], turret);
  for (const s of [1, -1]) {
    box(0.5, 1.2, 1.4, OLIVE_D, [s * 1.0, 3.0, 0.2], turret);
    glow(box(0.06, 0.5, 0.06, CYAN, [s * 1.28, 3.0, 0.7]), 1.2);
  }
  // capacitor banks
  for (let i = 0; i < 4; i++) {
    b.part(new THREE.CylinderGeometry(0.22, 0.22, 1.6, 8), i % 2 ? STEEL : TAN, {
      bone: turret, at: [-0.6 + i * 0.4, 3.1, -1.3], dir: [0, 0, 1], });
    glow(b.part(new THREE.TorusGeometry(0.23, 0.03, 4, 8), CYAN, { bone: turret, at: [-0.6 + i * 0.4, 3.1, -0.9], dir: [0, 0, 1], axis: "z" }), 1.3);
  }

  // railgun barrel (twin rails)
  box(1.0, 0.9, 1.2, DARK, [0, 3.0, 0.9], elev);
  for (const s of [1, -1]) {
    b.rod([s * 0.32, 3.0, 1.2], [s * 0.32, 3.0, 7.6], 0.17, STEEL, { bone: elev, section: "box" } as any);
    glow(b.rod([s * 0.2, 3.0, 1.6], [s * 0.2, 3.0, 7.2], 0.04, CYAN, { bone: elev }), 1.5);
    b.rod([s * 0.32, 3.0, 7.4], [s * 0.32, 3.0, 8.0], 0.1, DARK, { bone: elev });
  }
  for (let i = 0; i < 6; i++) {
    box(1.0, 0.5, 0.18, i % 2 ? WARN : DARK, [0, 3.0, 2.0 + i * 1.0], elev);
  }
  box(0.8, 0.4, 0.4, DARK, [0, 3.0, 8.1], elev);
  // rear antennas and lamp
  b.rod([-0.9, 2.1, -3.6], [-0.9, 4.1, -3.7], 0.03, STEEL, { bone: root });
  glow(b.part(new THREE.SphereGeometry(0.08, 6, 4), "#ff3030", { bone: root, at: [-0.9, 4.15, -3.7] }), 1.5);
  // tow hooks / rivets
  for (let i = 0; i < 8; i++) {
    b.part(new THREE.SphereGeometry(0.05, 5, 4), STEEL, { bone: root, at: [-1.0 + r() * 2, 1.82, -4.0 + r() * 0.2] });
  }
  b.pose(elev, { axis: [1, 0, 0], deg: -4 });
  return b.root;
}
