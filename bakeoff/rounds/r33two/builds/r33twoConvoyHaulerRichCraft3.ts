import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";
import { svg } from "../../../../src/index";

export const meta = {
  name: "Convoy Hauler",
  description: "Low-poly cyberpunk armoured hauler guarding a sealed cargo pod, with neon trim and glowing lights.",
};

export default function build() {
  const b = createBuilder({ name: "hauler" });
  const root = b.joint("chassis", { at: [0, 0.8, 0] });

  const HULL = panelled(metal("iron"), { size: 0.4, rivets: 0.08 });
  const PLATE = panelled(metal("blued", { tarnish: 0.3 }), { size: 0.5 });
  const DARK = "#14141c";
  const TYRE = "#101014";
  const CYAN = "#22f0ff";
  const PINK = "#ff2d95";
  const AMBER = "#ffb02e";
  const STEEL = metal("steel");

  const box = (w: number, h: number, d: number, color: any, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: root, at, ...opts });

  // Chassis frame
  box(2.2, 0.3, 7.2, DARK, [0, -0.15, 0]);
  box(2.0, 0.1, 7.0, STEEL, [0, 0.02, 0]);

  // Cab
  box(2.1, 0.9, 1.9, HULL, [0, 0.55, 2.4]);
  box(1.9, 0.7, 1.3, PLATE, [0, 1.3, 2.1]);
  b.part(new THREE.BoxGeometry(1.7, 0.4, 0.06), "#0b2a3a", { bone: root, at: [0, 1.35, 2.78], rotation: [-12, 0, 0] });
  glow(b.part(new THREE.BoxGeometry(1.5, 0.05, 0.02), CYAN, { bone: root, at: [0, 1.2, 2.82] }), 1.5);
  // Angled bumper & ram
  b.part(new THREE.BoxGeometry(2.3, 0.45, 0.35), PLATE, { bone: root, at: [0, 0.2, 3.5] });
  b.part(new THREE.ConeGeometry(0.5, 0.5, 4), STEEL, { bone: root, at: [0, 0.2, 3.85], rotation: [90, 45, 0], flat: true });
  // Headlights
  for (const s of [1, -1]) {
    glow(b.part(new THREE.BoxGeometry(0.4, 0.15, 0.06), AMBER, { bone: root, at: [s * 0.8, 0.55, 3.37] }), 2);
    // Exhaust stacks
    b.part(new THREE.CylinderGeometry(0.07, 0.09, 1.2, 6), STEEL, { bone: root, at: [s * 1.12, 1.2, 1.5] });
    b.part(new THREE.CylinderGeometry(0.1, 0.07, 0.1, 6), DARK, { bone: root, at: [s * 1.12, 1.82, 1.5] });
    // Side armour skirts
    box(0.12, 0.6, 5.0, PLATE, [s * 1.12, -0.05, -0.4]);
    glow(box(0.04, 0.05, 4.6, s > 0 ? CYAN : PINK, [s * 1.2, 0.1, -0.4]), 1.5);
  }
  // Roof light bar
  box(1.4, 0.1, 0.2, DARK, [0, 1.7, 2.2]);
  for (const x of [-0.5, 0, 0.5])
    glow(b.part(new THREE.BoxGeometry(0.3, 0.08, 0.22), x === 0 ? PINK : CYAN, { bone: root, at: [x, 1.75, 2.2] }), 2);

  // Wheels: 3 axles
  const rim = new THREE.CylinderGeometry(0.18, 0.18, 0.3, 8);
  for (const z of [2.4, -1.4, -2.9])
    for (const s of [1, -1]) {
      b.part(new THREE.CylinderGeometry(0.62, 0.62, 0.5, 10), TYRE, {
        bone: root, at: [s * 1.2, -0.18, z], dir: [1, 0, 0], flat: true,
      });
      b.part(rim, STEEL, { bone: root, at: [s * 1.47, -0.18, z], dir: [1, 0, 0] });
      glow(b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 6), PINK, { bone: root, at: [s * 1.62, -0.18, z], dir: [1, 0, 0] }), 1.5);
    }

  // Cargo pod: sealed capsule on cradle
  const podY = 1.15;
  box(1.9, 0.2, 4.4, DARK, [0, 0.2, -1.4]);
  for (const z of [-0.2, -1.4, -2.6]) {
    for (const s of [1, -1]) box(0.15, 0.7, 0.3, STEEL, [s * 0.75, 0.55, z]);
  }
  const POD = panelled(metal("steel", { tarnish: 0.4 }), { size: 0.45, rivets: 0.07 });
  b.lathe(
    [[0, -2.2], [0.7, -2.0], [0.95, -1.6], [1.0, -1.0], [1.0, 1.0], [0.95, 1.6], [0.7, 2.0], [0, 2.2]],
    { at: [0, podY + 0.25, -1.4], axis: [0, 0, 1], segments: 8, color: POD, bone: root },
  );
  // Pod bands & seals
  for (const z of [-3.0, -2.2, -1.4, -0.6, 0.2]) {
    b.part(new THREE.TorusGeometry(1.0, 0.05, 4, 8), z === -1.4 ? AMBER : DARK, {
      bone: root, at: [0, podY + 0.25, z], flat: true,
    });
  }
  glow(box(0.9, 0.3, 0.05, AMBER, [0, podY + 0.9, -0.0], { rotation: [-20, 0, 0] }), 1.2);
  // Pod lock hatch
  const lockTex = svg(
    `<svg viewBox="0 0 64 64"><rect x="2" y="2" width="60" height="60" rx="6" fill="#111"/><rect x="2" y="2" width="60" height="60" rx="6" fill="none" stroke="#ff2d95" stroke-width="4"/><path d="M32 12a10 10 0 0 0-10 10v6h-4v22h28V28h-4v-6a10 10 0 0 0-10-10zm0 6a4 4 0 0 1 4 4v6h-8v-6a4 4 0 0 1 4-4z" fill="#22f0ff"/><path d="M8 56h48" stroke="#ffb02e" stroke-width="3" stroke-dasharray="6 4"/></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1])
    glow(
      b.part(new THREE.PlaneGeometry(0.8, 0.8), "#ffffff", {
        bone: root, at: [s * 1.02, podY + 0.25, -1.4], dir: [s, 0, 0], axis: "z", texture: lockTex,
      }),
      1,
    );

  // Rear bumper & tail lights
  box(2.2, 0.35, 0.3, PLATE, [0, 0.0, -3.7]);
  for (const s of [1, -1]) glow(box(0.5, 0.12, 0.05, "#ff1a3a", [s * 0.65, 0.05, -3.87]), 2);

  // Turret guard on cab roof rear
  const tur = b.joint("turret", { parent: root, at: [0, 1.85, 1.45] });
  b.part(new THREE.CylinderGeometry(0.4, 0.5, 0.25, 8), PLATE, { bone: tur, at: [0, 1.95, 1.45], flat: true });
  b.part(new THREE.BoxGeometry(0.5, 0.3, 0.7), HULL, { bone: tur, at: [0, 2.2, 1.45] });
  for (const s of [1, -1]) {
    b.rod([s * 0.12, 2.2, 1.8], [s * 0.12, 2.2, 2.9], 0.05, STEEL, { bone: tur });
    glow(b.part(new THREE.SphereGeometry(0.06, 5, 4), PINK, { bone: tur, at: [s * 0.12, 2.2, 2.92] }), 2);
  }

  // Antenna
  b.rod([-0.9, 1.7, 1.7], [-0.9, 2.9, 1.5], 0.025, DARK, { bone: root });
  glow(b.part(new THREE.SphereGeometry(0.06, 5, 4), CYAN, { bone: root, at: [-0.9, 2.92, 1.5] }), 2);

  // Underglow
  glow(box(1.6, 0.03, 6.4, CYAN, [0, -0.32, 0]), 1);

  // Random scuff bolts on the pod
  const r = rng(5);
  const bolts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 20; i++) {
    const a = r() * Math.PI * 2;
    bolts.push(new THREE.BoxGeometry(0.06, 0.06, 0.06).translate(Math.sin(a) * 1.02, podY + 0.25 + Math.cos(a) * 1.02, -3 + r() * 3.2));
  }
  bolts.forEach((g) => b.part(g, AMBER, { bone: root, at: [0, 0, 0] }));

  return b.root;
}
