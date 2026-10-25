import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";
import { svg } from "../../../../src/index";

export const meta = {
  name: "Armoured Convoy Hauler",
  description: "Low-poly cyberpunk armoured hauler tractor guarding a sealed cargo pod, with neon trim, armour plating and warning markings.",
};

export default function build() {
  const b = createBuilder({ name: "hauler" });
  const R = rng(5);

  const HULL = panelled(metal("iron"), { size: 0.5, rivets: 0.12 });
  const PLATE = panelled(metal("steel", { tarnish: 0.4 }), { size: 0.4, rivets: 0.1 });
  const DARK = "#14131c";
  const TYRE = "#1b1b22";
  const NEON = "#18f0e0";
  const PINK = "#ff2d95";
  const AMBER = "#ffb020";
  const GLASS = "#0f3a4a";

  const hub = b.joint("chassis", { at: [0, 0.9, 0], role: "spine" });
  const cab = b.joint("cab", { parent: hub, at: [0, 1.2, 1.9], dir: [0, 0, 1] });
  const pod = b.joint("pod", { parent: hub, at: [0, 1.6, -2.4], dir: [0, 0, -1] });

  const box = (w: number, h: number, d: number, c: any, at: number[], bone: any = hub, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, ...extra });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: any, at: number[], dir: number[], bone: any = hub) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at, dir });

  // Frame
  box(2.0, 0.35, 7.2, DARK, [0, 0.85, -0.3]);
  box(2.2, 0.12, 7.0, PLATE, [0, 0.62, -0.3]);

  // Cab
  box(2.3, 1.1, 2.0, HULL, [0, 1.55, 2.0], cab);
  box(2.1, 0.6, 1.3, HULL, [0, 2.4, 1.7], cab);
  box(1.9, 0.5, 0.06, GLASS, [0, 2.4, 2.38], cab);
  glow(box(1.7, 0.08, 0.05, NEON, [0, 2.12, 2.4], cab), 1.5);
  // sloped prow
  b.part(new THREE.CylinderGeometry(1.0, 1.25, 0.9, 4, 1), PLATE, { bone: cab, at: [0, 1.2, 3.15], rotation: [90, 45, 0], scale: [1.05, 1, 0.9] });
  // bull bar
  box(2.5, 0.25, 0.25, PLATE, [0, 0.8, 3.55], cab);
  for (const s of [1, -1]) {
    box(0.18, 0.7, 0.2, PLATE, [s * 1.2, 1.0, 3.5], cab);
    glow(box(0.5, 0.16, 0.06, AMBER, [s * 0.75, 1.35, 3.6], cab), 1.6);
    cyl(0.08, 0.08, 1.2, 6, PLATE, [s * 1.2, 3.0, 1.3], [0, 1, 0], cab);
    glow(box(0.1, 0.1, 0.1, PINK, [s * 1.2, 3.65, 1.3], cab), 2);
    box(0.5, 0.5, 0.9, PLATE, [s * 1.4, 1.7, 1.6], cab);
  }
  glow(box(2.0, 0.07, 0.05, PINK, [0, 2.75, 2.26], cab), 1.5);

  // Cargo pod
  const podMat = panelled(metal("steel", { tarnish: 0.3 }), { size: 0.6 });
  b.part(new THREE.CylinderGeometry(1.15, 1.15, 4.4, 8), podMat, { bone: pod, at: [0, 0, 0], dir: [0, 0, 1] });
  for (const z of [-1.7, -0.6, 0.6, 1.7]) {
    b.part(new THREE.CylinderGeometry(1.2, 1.2, 0.18, 8), DARK, { bone: pod, at: [0, 0, z], dir: [0, 0, 1] });
    glow(b.part(new THREE.CylinderGeometry(1.215, 1.215, 0.04, 8), NEON, { bone: pod, at: [0, 0, z + 0.12], dir: [0, 0, 1] }), 1.2);
  }
  b.part(new THREE.CylinderGeometry(0.6, 1.15, 0.6, 8), PLATE, { bone: pod, at: [0, 0, -2.5], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(1.15, 0.6, 0.6, 8), PLATE, { bone: pod, at: [0, 0, 2.5], dir: [0, 0, 1] });
  const warn = svg(`<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="6" fill="#14131c"/><path d="M32 8 L58 54 H6Z" fill="none" stroke="#ffb020" stroke-width="5"/><rect x="29" y="24" width="6" height="16" fill="#ffb020"/><rect x="29" y="44" width="6" height="6" fill="#ffb020"/></svg>`, { size: 128 });
  for (const s of [1, -1])
    glow(b.part(new THREE.PlaneGeometry(0.9, 0.9), "#ffffff", { bone: pod, at: [s * 1.16, 0.2, 0.2], dir: [s, 0, 0], axis: "z", texture: warn }), 1);
  // seal clamps
  for (const s of [1, -1]) for (const z of [-1.1, 1.1])
    box(0.25, 0.5, 0.5, DARK, [s * 1.2, -0.3, z], pod);
  // cradle
  box(2.6, 0.3, 4.8, DARK, [0, -1.15, 0], pod);
  for (const s of [1, -1]) box(0.2, 0.9, 4.4, PLATE, [s * 1.3, -0.6, 0], pod);

  // Wheels
  const wheelPositions: number[][] = [];
  for (const z of [2.4, 0.4, -1.8, -3.0]) for (const s of [1, -1]) wheelPositions.push([s * 1.25, 0.55, z]);
  for (const [x, y, z] of wheelPositions) {
    const s = Math.sign(x);
    b.part(new THREE.CylinderGeometry(0.55, 0.55, 0.55, 10), TYRE, { bone: hub, at: [x, y, z], dir: [1, 0, 0] });
    cyl(0.3, 0.3, 0.6, 6, PLATE, [x + s * 0.03, y, z], [1, 0, 0]);
    glow(b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.64, 6), NEON, { bone: hub, at: [x + s * 0.03, y, z], dir: [1, 0, 0] }), 1.3);
    box(0.08, 0.75, 1.2, HULL, [x - s * 0.1, y + 0.55, z]);
  }
  // fenders / side skirts
  for (const s of [1, -1]) {
    box(0.15, 0.5, 5.8, PLATE, [s * 1.1, 0.95, -0.7]);
    glow(box(0.05, 0.06, 5.0, s > 0 ? NEON : PINK, [s * 1.19, 0.98, -0.7]), 1.4);
  }

  // Rear lights and hitch
  for (const s of [1, -1]) glow(box(0.4, 0.18, 0.06, "#ff2020", [s * 0.7, 1.0, -3.95]), 1.6);
  cyl(0.15, 0.15, 0.8, 6, DARK, [0, 1.2, 0.3], [0, 1, 0]);

  // antennas and greebles
  for (let i = 0; i < 8; i++) {
    const x = (R() - 0.5) * 1.4;
    box(0.2 + R() * 0.2, 0.15 + R() * 0.15, 0.3, PLATE, [x, 1.1, -3.5 + R() * 1.6]);
  }

  return b.root;
}
