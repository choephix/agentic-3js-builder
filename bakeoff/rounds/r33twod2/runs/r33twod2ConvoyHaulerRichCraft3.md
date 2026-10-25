```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { svg } from "agentic-3js-builder";

export const meta = {
  name: "Convoy Hauler",
  description: "Low-poly cyberpunk armoured hauler guarding a sealed cargo pod, with neon trim and turret.",
};

export default function build() {
  const b = createBuilder({ name: "hauler" });
  const body = b.joint("chassis", { at: [0, 0.6, 0] });
  const turretJ = b.joint("turret", { parent: body, at: [0, 1.75, 0.9], dir: [0, 0, 1] });
  const barrelJ = b.joint("barrel", { parent: turretJ, at: [0, 1.8, 1.2], dir: [0, 0, 1] });

  const HULL = panelled(metal("iron"), { size: 0.4 });
  const DARK = "#14121c";
  const NEON = "#19f0ff";
  const PINK = "#ff2e9a";
  const YEL = "#ffd23a";
  const POD = panelled(metal("steel", { tarnish: 0.3 }), { size: 0.5, rivets: 0.06 });
  const box = (w: number, h: number, d: number, c: any, at: number[], bone: any = body, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot, flat: true });

  // chassis
  box(2.2, 0.5, 5.2, HULL, [0, 0.85, 0]);
  box(2.0, 0.5, 2.0, HULL, [0, 1.3, 1.5]); // cab
  box(1.9, 0.12, 0.05, DARK, [0, 1.42, 2.52], body); // visor
  glow(box(1.7, 0.1, 0.04, NEON, [0, 1.42, 2.54]), 1.5);
  // sloped nose
  b.part(new THREE.CylinderGeometry(0.9, 1.15, 0.7, 4, 1), HULL, { bone: body, at: [0, 0.95, 2.85], rotation: [90, 45, 0], flat: true });
  // wheels
  const tex = svg(`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#222"/><circle cx="32" cy="32" r="16" fill="#555"/><circle cx="32" cy="32" r="6" fill="#19f0ff"/></svg>`);
  for (const s of [1, -1])
    for (const z of [-1.9, -0.6, 0.7, 1.9]) {
      b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.5, 10), DARK, { bone: body, at: [s * 1.2, 0.5, z], rotation: [0, 0, 90], flat: true });
      b.part(new THREE.CircleGeometry(0.4, 10), "#ffffff", { bone: body, at: [s * 1.46, 0.5, z], dir: [s, 0, 0], axis: "z", texture: tex });
      box(0.15, 0.3, 1.1, HULL, [s * 1.2, 0.95, z], body);
    }
  // side armour with neon strips
  for (const s of [1, -1]) {
    box(0.15, 0.55, 4.6, panelled(metal("iron", { tarnish: 0.6 }), { size: 0.3 }), [s * 1.15, 1.1, -0.2]);
    glow(box(0.04, 0.06, 4.4, s > 0 ? NEON : PINK, [s * 1.24, 0.9, -0.2]), 1.4);
    box(0.5, 0.2, 0.6, YEL, [s * 1.0, 1.65, 1.9]); // lights housing
    glow(box(0.3, 0.1, 0.05, "#fff3b0", [s * 1.0, 1.65, 2.22]), 2);
  }
  // cargo pod
  b.part(new THREE.CylinderGeometry(0.95, 0.95, 3.0, 8), POD, { bone: body, at: [0, 1.85, -1.2], rotation: [90, 22.5, 0], flat: true });
  for (const z of [-2.6, -1.9, -1.2, -0.5, 0.2]) b.part(new THREE.TorusGeometry(0.97, 0.05, 4, 8), DARK, { bone: body, at: [0, 1.85, z], flat: true });
  for (const z of [-2.7, 0.3]) b.part(new THREE.SphereGeometry(0.95, 8, 4, 0, 6.3, 0, 1.57), POD, { bone: body, at: [0, 1.85, z], rotation: [z < 0 ? -90 : 90, 0, 0], flat: true });
  glow(box(0.9, 0.12, 0.05, PINK, [0, 2.0, 0.34]), 1.5);
  const seal = svg(`<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#101018"/><path d="M8 56 L32 8 L56 56Z" fill="none" stroke="#ff2e9a" stroke-width="5"/><rect x="29" y="26" width="6" height="16" fill="#ff2e9a"/></svg>`);
  glow(b.part(new THREE.PlaneGeometry(0.7, 0.7), "#ffffff", { bone: body, at: [0.97, 1.9, -1.2], dir: [1, 0, 0], axis: "z", texture: seal }), 1.2);
  glow(b.part(new THREE.PlaneGeometry(0.7, 0.7), "#ffffff", { bone: body, at: [-0.97, 1.9, -1.2], dir: [-1, 0, 0], axis: "z", texture: seal }), 1.2);
  // turret
  b.part(new THREE.CylinderGeometry(0.5, 0.6, 0.35, 8), HULL, { bone: turretJ, at: [0, 1.75, 0.9], flat: true });
  b.part(new THREE.BoxGeometry(0.8, 0.35, 0.9), HULL, { bone: turretJ, at: [0, 2.0, 0.95], flat: true });
  b.part(new THREE.CylinderGeometry(0.07, 0.09, 1.6, 6), DARK, { bone: barrelJ, at: [0, 2.0, 1.9], rotation: [90, 0, 0], flat: true });
  glow(b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 6), NEON, { bone: barrelJ, at: [0, 2.0, 2.72], rotation: [90, 0, 0] }), 2);
  // antennas
  const r = rng(3);
  for (let i = 0; i < 3; i++) {
    const x = -0.8 + i * 0.4 + r() * 0.1;
    b.part(new THREE.CylinderGeometry(0.015, 0.02, 1 + i * 0.3, 5), DARK, { bone: body, at: [x, 2.0 + i * 0.15, 1.0 - i * 0.2] });
    glow(b.part(new THREE.SphereGeometry(0.05, 5, 4), i % 2 ? PINK : NEON, { bone: body, at: [x, 2.5 + i * 0.3, 1.0 - i * 0.2] }), 2);
  }
  // rear bumper & tail lights
  box(2.2, 0.3, 0.25, DARK, [0, 0.8, -2.7]);
  for (const s of [1, -1]) glow(box(0.4, 0.12, 0.05, "#ff2020", [s * 0.7, 0.9, -2.84]), 1.8);
  return b.root;
}
```