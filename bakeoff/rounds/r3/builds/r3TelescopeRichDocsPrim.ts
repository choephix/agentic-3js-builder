import * as THREE from "three";
import { createBuilder, paint, stripes, grain, svg } from "../../../../src/index";

export const meta = {
  name: "Explorer's Brass Telescope",
  description: "Brass telescope with leather wraps and finder scope on a mahogany tripod with a star chart tray.",
};

export default function build() {
  const b = createBuilder({ name: "telescope" });
  const BRASS = "#c9972e", BRASS_D = "#9a6f1c", LEATHER = "#5a2e1a", LEATHER_D = "#3e1f12";
  const WOOD = grain("#6b2e1a", "#4d1f12", { size: 0.02, axis: "y" });
  const RUBBER = "#1c1c1c", GLASS = "#9fd6e6", PAPER = "#e8dcb5", RED = "#8a2a2a";

  const hubY = 1.2;
  const hub = b.joint("tripodHub", { at: [0, hubY, 0] });
  const mount = b.joint("mount", { parent: hub, at: [0, hubY + 0.1, 0] });
  const tube = b.joint("tube", { parent: mount, at: [0, hubY + 0.2, -0.05], aim: [0, hubY + 0.35, 0.8] });

  // tripod legs
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 2;
    const dx = Math.cos(a), dz = Math.sin(a);
    const top: [number, number, number] = [dx * 0.06, hubY - 0.02, dz * 0.06];
    const foot: [number, number, number] = [dx * 0.62, 0.0, dz * 0.62];
    const midP: [number, number, number] = [dx * 0.34, hubY * 0.5, dz * 0.34];
    b.rod(top, foot, [0.032, 0.02], { color: WOOD, sides: 6, bone: hub });
    // brass leg cap
    b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.07, 8), BRASS, { at: [dx * 0.1, hubY - 0.07, dz * 0.1], aim: [dx * 0.62, -hubY, dz * 0.62], bone: hub });
    // brass ferrule at foot
    b.spike([dx * 0.6, 0.07, dz * 0.6], [0, -1, 0], 0.08, 0.022, { color: BRASS_D, bone: hub });
    b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.05, 8), BRASS, { at: [dx * 0.57, 0.12, dz * 0.57], aim: [dx * 0.62, -hubY, dz * 0.62], bone: hub });
    // brace to tray ring
    b.rod(midP, [dx * 0.0, hubY * 0.5 - 0.0, dz * 0.0], 0.008, { color: BRASS_D, bone: hub });
  }
  // hub head
  b.part(new THREE.CylinderGeometry(0.12, 0.14, 0.1, 6), BRASS, { at: [0, hubY, 0], bone: hub });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 6), WOOD, { at: [0, hubY - 0.06, 0], bone: hub });
  b.part(new THREE.CylinderGeometry(0.06, 0.08, 0.12, 8), BRASS_D, { at: [0, hubY + 0.1, 0], bone: mount });

  // tray with star chart (triangle tray)
  const trayY = 0.62;
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 3), WOOD, { at: [0, trayY, 0], rotation: [0, 90, 0], bone: hub });
  b.part(new THREE.TorusGeometry(0.2, 0.008, 4, 3), BRASS, { at: [0, trayY + 0.012, 0], rotation: [90, 0, 90], bone: hub });
  const chartP = svg(`<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#e8dcb5"/><g fill="#3a2a18"><circle cx="8" cy="8" r="2"/><circle cx="22" cy="20" r="2"/><circle cx="36" cy="10" r="2"/><circle cx="50" cy="22" r="2"/><circle cx="58" cy="9" r="2"/></g><path d="M8 8L22 20L36 10L50 22" stroke="#3a2a18" stroke-width="1.2" fill="none"/></svg>`, { size: 128 });
  b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.22, 10), PAPER, { at: [0, trayY + 0.045, 0.02], rotation: [0, 0, 90], bone: hub });
  b.part(new THREE.CylinderGeometry(0.037, 0.037, 0.02, 10), RED, { at: [-0.1, trayY + 0.045, 0.02], rotation: [0, 0, 90], bone: hub });
  b.part(new THREE.CylinderGeometry(0.037, 0.037, 0.02, 10), RED, { at: [0.1, trayY + 0.045, 0.02], rotation: [0, 0, 90], bone: hub });
  b.part(new THREE.CylinderGeometry(0.038, 0.038, 0.002, 10), "#ffffff", { at: [0, trayY + 0.045, 0.02], rotation: [0, 0, 90], bone: hub, texture: chartP });

  // yoke: fork on mount
  for (const s of [1, -1]) {
    b.rod([s * 0.07, hubY + 0.12, -0.05], [s * 0.1, hubY + 0.3, -0.05], 0.02, { color: BRASS, bone: mount, sides: 6 });
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 8), BRASS_D, { at: [s * 0.105, hubY + 0.3, -0.05], rotation: [0, 0, 90], bone: mount });
    b.part(new THREE.SphereGeometry(0.03, 6, 4), BRASS, { at: [s * 0.13, hubY + 0.3, -0.05], bone: mount });
  }

  // main tube along z
  const z0 = -0.55, z1 = 0.75, cy = hubY + 0.3, cz = -0.05;
  const along = (z: number): [number, number, number] => [0, cy, cz + z];
  const seg = (za: number, zb: number, r: number, col: any, sides = 12) =>
    b.rod(along(za), along(zb), r, { color: col, sides, bone: tube });
  seg(-0.5, -0.2, 0.05, BRASS);
  seg(-0.2, -0.12, 0.052, LEATHER);
  seg(-0.12, 0.2, 0.052, BRASS);
  seg(0.2, 0.38, 0.056, LEATHER);
  seg(0.38, 0.65, 0.062, BRASS);
  // main wide objective barrel
  seg(0.65, 0.88, 0.075, BRASS_D);
  // leather stitching bands and engraved rings
  for (const z of [-0.2, -0.12, 0.2, 0.38, 0.65, 0.88, -0.45, 0.05, 0.5]) {
    const r = z > 0.6 ? 0.08 : z > 0.3 ? 0.063 : 0.059;
    b.part(new THREE.TorusGeometry(r, 0.006, 4, 12), BRASS_D, { at: along(z), aim: [0, 0, 1], axis: "z", bone: tube });
  }
  for (let i = 0; i < 6; i++) {
    const z = 0.0 + i * 0.03 + 0.205;
    b.part(new THREE.TorusGeometry(0.0575, 0.0035, 4, 12), LEATHER_D, { at: along(z - 0.2 + 0.0 + 0.2 - 0.03 * 0), aim: [0, 0, 1], axis: "z", bone: tube });
  }
  // dew shield
  b.rod(along(0.88), along(1.12), [0.1, 0.11], { color: BRASS, sides: 12, bone: tube, caps: "none" });
  b.part(new THREE.TorusGeometry(0.11, 0.01, 4, 12), BRASS_D, { at: along(1.12), aim: [0, 0, 1], axis: "z", bone: tube });
  b.part(new THREE.CircleGeometry(0.095, 12), GLASS, { at: along(0.9), dir: [0, 0, 1], axis: "z", bone: tube });
  // end cap ring + eyepiece
  b.part(new THREE.CylinderGeometry(0.058, 0.05, 0.05, 12), BRASS_D, { at: along(-0.52), aim: [0, 0, 1], axis: "y", rotation: [90, 0, 0], bone: tube });
  b.rod(along(-0.55), along(-0.75), 0.028, { color: BRASS, sides: 10, bone: tube });
  b.rod(along(-0.75), along(-0.82), [0.036, 0.04], { color: RUBBER, sides: 10, bone: tube });
  b.part(new THREE.TorusGeometry(0.04, 0.008, 4, 10), RUBBER, { at: along(-0.83), aim: [0, 0, 1], axis: "z", bone: tube });
  b.part(new THREE.CircleGeometry(0.025, 8), GLASS, { at: along(-0.822), dir: [0, 0, -1], axis: "z", bone: tube });

  // focus knobs
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.12, 6), BRASS_D, { at: [s * 0.08, cy - 0.01, cz - 0.4], rotation: [0, 0, 90], bone: tube });
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 10), BRASS, { at: [s * 0.15, cy - 0.01, cz - 0.4], rotation: [0, 0, 90], bone: tube });
    b.part(new THREE.TorusGeometry(0.035, 0.005, 4, 10), LEATHER, { at: [s * 0.17, cy - 0.01, cz - 0.4], rotation: [0, 90, 0], bone: tube });
  }

  // finder scope
  const fy = cy + 0.13;
  const fa = (z: number): [number, number, number] => [0, fy, cz + z];
  b.rod(fa(-0.2), fa(0.3), [0.02, 0.026], { color: BRASS, sides: 10, bone: tube });
  b.rod(fa(0.3), fa(0.42), [0.034, 0.034], { color: BRASS_D, sides: 10, bone: tube });
  b.rod(fa(-0.28), fa(-0.2), 0.015, { color: RUBBER, sides: 8, bone: tube });
  b.part(new THREE.CircleGeometry(0.03, 8), GLASS, { at: fa(0.421), dir: [0, 0, 1], axis: "z", bone: tube });
  for (const z of [-0.1, 0.25]) {
    b.part(new THREE.TorusGeometry(0.033, 0.006, 4, 10), BRASS_D, { at: fa(z), aim: [0, 0, 1], axis: "z", bone: tube });
    b.rod([0, cy + 0.05, cz + z], [0, fy - 0.02, cz + z], 0.008, { color: BRASS, sides: 6, bone: tube });
  }

  return b.root;
}
