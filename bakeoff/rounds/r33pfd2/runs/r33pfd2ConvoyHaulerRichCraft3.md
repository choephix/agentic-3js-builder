```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Convoy Hauler",
  description: "Low-poly cyberpunk armoured hauler tractor with a sealed cargo pod, neon trim and turret.",
};

export default function build() {
  const b = createBuilder({ name: "hauler" });
  const body = b.joint("body", { at: [0, 0.9, 0] });

  const HULL = panelled(metal("iron"), { size: 0.4, rivets: 0.08 });
  const PLATE = panelled(metal("blued", { tarnish: 0.4 }), { size: 0.35 });
  const POD = panelled(metal("steel", { tarnish: 0.5 }), { size: 0.5, rivets: 0.1 });
  const DARK = "#14131c";
  const TYRE = "#1b1b22";
  const CYAN = "#22f0ff";
  const PINK = "#ff2d95";
  const AMBER = "#ffb02e";

  const box = (w: number, h: number, d: number, c: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: body, at, ...extra });

  // chassis
  box(2.6, 0.35, 8.4, DARK, [0, 0.55, -0.4]);
  box(2.9, 0.5, 8.0, HULL, [0, 0.95, -0.4]);

  // cab (front, +Z)
  box(2.7, 1.1, 2.4, PLATE, [0, 1.65, 2.6]);
  b.part(new THREE.CylinderGeometry(0.9, 1.35, 0.6, 4), PLATE, { bone: body, at: [0, 1.4, 4.0], rotation: [0, 45, 0], scale: [1.4, 1, 0.9] });
  // sloped armoured roof
  b.part(new THREE.CylinderGeometry(0.9, 1.35, 0.5, 4), HULL, { bone: body, at: [0, 2.45, 2.5], rotation: [0, 45, 0], scale: [1, 1, 0.85] });
  // windscreen slit
  glow(box(2.1, 0.28, 0.06, CYAN, [0, 2.1, 3.62]), 1.4);
  // nose bumper wedge
  b.part(new THREE.BoxGeometry(2.9, 0.4, 0.5), DARK, { bone: body, at: [0, 0.75, 4.65], rotation: [-15, 0, 0] });
  // headlights
  for (const s of [1, -1]) {
    glow(box(0.5, 0.18, 0.08, "#f6ffcc", [s * 1.0, 1.2, 4.55]), 1.6);
    box(0.18, 1.2, 0.18, DARK, [s * 1.5, 2.1, 1.7]); // exhaust stacks
    glow(box(0.2, 0.05, 0.2, AMBER, [s * 1.5, 2.72, 1.7]), 1.2);
  }

  // cargo pod: sealed cylinder-ish low poly
  b.part(new THREE.CylinderGeometry(1.25, 1.25, 4.6, 8), POD, { bone: body, at: [0, 2.0, -2.7], rotation: [90, 22.5, 0] });
  for (const z of [-0.8, -2.7, -4.6]) {
    b.part(new THREE.CylinderGeometry(1.32, 1.32, 0.22, 8), DARK, { bone: body, at: [0, 2.0, z], rotation: [90, 22.5, 0] });
    glow(b.part(new THREE.CylinderGeometry(1.34, 1.34, 0.06, 8), PINK, { bone: body, at: [0, 2.0, z + 0.14], rotation: [90, 22.5, 0] }), 1.2);
  }
  // pod end cap and seal door
  b.part(new THREE.CylinderGeometry(0.6, 1.25, 0.5, 8), POD, { bone: body, at: [0, 2.0, -5.2], rotation: [90, 22.5, 0] });
  const SEAL = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#1a0f1c" stroke="#ff2d95" stroke-width="4"/><path d="M32 12 L50 44 H14Z" fill="none" stroke="#22f0ff" stroke-width="4"/><circle cx="32" cy="36" r="4" fill="#ffb02e"/></svg>`,
    { size: 128 },
  );
  glow(
    b.part(new THREE.PlaneGeometry(1.0, 1.0), "#ffffff", { bone: body, at: [0, 2.0, -5.47], dir: [0, 0, -1], axis: "z", texture: SEAL }),
    1,
  );
  // pod side hazard stripes
  const HAZ = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#111"/><path d="M0 16L8 0H20L12 16ZM24 16L32 0H44L36 16ZM48 16L56 0H68L60 16Z" fill="#ffb02e"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(3.4, 0.5), "#ffffff", { bone: body, at: [s * 1.28, 1.5, -2.7], dir: [s, 0, 0], axis: "z", up: [0, 0, 1], texture: HAZ, rotation: undefined });

  // neon underglow strips and side lights
  for (const s of [1, -1]) {
    glow(box(0.08, 0.08, 7.6, CYAN, [s * 1.47, 0.78, -0.4]), 1.5);
    glow(box(0.08, 0.1, 1.2, PINK, [s * 1.47, 1.65, 2.6]), 1.3);
  }
  glow(box(2.4, 0.1, 0.1, PINK, [0, 0.35, 4.75]), 1.3);

  // armoured side skirts
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.2, 0.7, 6.4), PLATE, { bone: body, at: [s * 1.5, 0.55, -0.4] });
    for (let i = 0; i < 5; i++) box(0.1, 0.5, 0.9, DARK, [s * 1.62, 0.55, -2.6 + i * 1.4]);
  }

  // turret on cab roof
  const tur = b.joint("turret", { parent: body, at: [0, 2.8, 2.3] });
  b.part(new THREE.CylinderGeometry(0.5, 0.65, 0.35, 8), PLATE, { bone: tur, at: [0, 2.95, 2.3] });
  b.part(new THREE.BoxGeometry(0.7, 0.4, 0.9), HULL, { bone: tur, at: [0, 3.3, 2.3] });
  const gun = b.joint("gun", { parent: tur, at: [0, 3.3, 2.7], dir: [0, 0, 1] });
  for (const s of [1, -1]) {
    b.rod([s * 0.16, 3.3, 2.7], [s * 0.16, 3.3, 4.0], 0.06, DARK, { bone: gun });
    glow(b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 6), CYAN, { bone: gun, at: [s * 0.16, 3.3, 4.02], rotation: [90, 0, 0] }), 1.5);
  }
  // antennas
  for (const [x, h] of [[-1.1, 1.6], [1.1, 1.2]]) {
    b.rod([x, 2.6, 1.6], [x, 2.6 + h, 1.6], 0.025, DARK, { bone: body });
    glow(b.part(new THREE.SphereGeometry(0.07, 5, 4), PINK, { bone: body, at: [x, 2.6 + h, 1.6] }), 1.5);
  }

  // wheels: 3 axles per side
  const rn = rng(5);
  const axles = [3.1, 0.9, -1.8, -3.6];
  axles.forEach((z, i) => {
    for (const s of [1, -1]) {
      const w = b.joint(`wheel${s > 0 ? "L" : "R"}${i + 1}`, { parent: body, at: [s * 1.6, 0.62, z], dir: [s, 0, 0], role: "hinge" });
      b.part(new THREE.CylinderGeometry(0.62, 0.62, 0.55, 8), TYRE, { bone: w, at: [s * 1.6, 0.62, z], dir: [1, 0, 0] });
      b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.6, 6), metal("steel"), { bone: w, at: [s * 1.62, 0.62, z], dir: [1, 0, 0] });
      glow(b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.62, 6), rn() > 0.5 ? CYAN : PINK, { bone: w, at: [s * 1.64, 0.62, z], dir: [1, 0, 0] }), 1.2);
      b.part(new THREE.BoxGeometry(0.2, 0.08, 1.4), DARK, { bone: body, at: [s * 1.6, 1.3, z] }); // fender
    }
  });

  // rear hitch & tail lights
  box(2.4, 0.5, 0.4, DARK, [0, 0.9, -5.0]);
  for (const s of [1, -1]) glow(box(0.4, 0.2, 0.06, "#ff2222", [s * 0.9, 1.0, -5.22]), 1.5);

  return b.root;
}
```