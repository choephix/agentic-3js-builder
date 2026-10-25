import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Railgun Carrier",
  description: "Six-wheeled sci-fi railgun carrier braced on four stabiliser legs, low-poly military.",
};

const HULL = "#4f5b4a";
const HULL2 = "#6b7760";
const DARK = "#23272b";
const STEEL = "#8a9096";
const TYRE = "#1b1c1e";
const GLASS = "#63c7e6";
const CYAN = "#5ff2ff";
const WARN = "#e8b923";

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (r: number, h: number, s = 8) => new THREE.CylinderGeometry(r, r, h, s);

export default function build() {
  const b = createBuilder({ name: "railgunCarrier" });
  const R = rng(5);
  const chassis = b.joint("chassis", { at: [0, 0.9, 0], role: "spine" });

  // ---- hull
  b.part(box(2.5, 0.5, 8.4), HULL, { bone: chassis, at: [0, 1.0, 0] });
  b.part(box(2.7, 0.18, 8.0), DARK, { bone: chassis, at: [0, 0.72, 0] });
  b.frustumBox([0, 1.25, -4.2], [0, 1.25, -5.3], [2.4, 0.5], [1.9, 0.3], { bone: chassis, color: HULL2 });
  for (const s of [1, -1]) {
    b.part(box(0.06, 0.34, 7.6), HULL2, { bone: chassis, at: [s * 1.28, 1.05, 0] });
    for (let i = 0; i < 6; i++)
      b.part(box(0.08, 0.1, 0.5), WARN, { bone: chassis, at: [s * 1.3, 0.85, -3 + i * 1.2] });
  }
  // deck armour
  b.part(box(2.2, 0.16, 5.0), HULL2, { bone: chassis, at: [0, 1.34, -0.6] });
  for (let i = 0; i < 9; i++)
    b.part(box(2.0, 0.03, 0.06), DARK, { bone: chassis, at: [0, 1.44, -2.8 + i * 0.55] });

  // ---- cab
  b.part(box(2.3, 0.9, 1.9), HULL, { bone: chassis, at: [0, 1.7, 3.0] });
  b.frustumBox([0, 1.3, 4.0], [0, 1.2, 4.7], [2.3, 0.7], [2.0, 0.4], { bone: chassis, color: HULL2 });
  b.part(box(2.0, 0.4, 0.06), GLASS, { bone: chassis, at: [0, 1.9, 3.98], rotation: [-18, 0, 0] });
  b.part(box(2.3, 0.1, 1.9), HULL2, { bone: chassis, at: [0, 2.2, 3.0] });
  for (const s of [1, -1]) {
    b.part(box(0.04, 0.35, 0.9), GLASS, { bone: chassis, at: [s * 1.16, 1.9, 3.1] });
    glow(b.part(box(0.4, 0.12, 0.05), CYAN, { bone: chassis, at: [s * 0.8, 1.2, 4.72] }));
  }
  b.part(box(1.9, 0.06, 0.2), DARK, { bone: chassis, at: [0, 1.0, 4.75] });
  b.part(cyl(0.03, 0.8, 6), STEEL, { bone: chassis, at: [-0.9, 2.65, 2.4] });
  glow(b.part(new THREE.SphereGeometry(0.06, 6, 4), CYAN, { bone: chassis, at: [-0.9, 3.05, 2.4] }));

  // ---- turret + railgun
  const yaw = b.joint("yaw", { parent: chassis, at: [0, 1.45, -1.0], dir: [1, 0, 0], up: [0, 0, 1], role: "hinge" });
  b.part(cyl(1.0, 0.12, 12), DARK, { bone: chassis, at: [0, 1.46, -1.0] });
  b.part(cyl(0.85, 0.5, 8), HULL, { bone: yaw, at: [0, 1.75, -1.0], flat: true });
  b.part(box(1.6, 0.5, 1.8), HULL2, { bone: yaw, at: [0, 2.0, -1.3] });
  const pitch = b.joint("pitch", { parent: yaw, at: [0, 2.15, -0.5], dir: [0, 0, 1], role: "hinge" });
  for (const s of [1, -1]) b.part(box(0.12, 0.6, 1.0), HULL, { bone: yaw, at: [s * 0.55, 2.3, -0.7] });
  b.part(box(0.9, 0.5, 1.2), DARK, { bone: pitch, at: [0, 2.15, -0.9] });
  for (const s of [1, -1]) {
    b.part(box(0.14, 0.2, 5.0), STEEL, { bone: pitch, at: [s * 0.2, 2.15, 2.4] });
    b.part(box(0.1, 0.1, 5.0), DARK, { bone: pitch, at: [s * 0.2, 2.3, 2.4] });
    for (let i = 0; i < 4; i++) {
      b.part(cyl(0.16, 0.5, 8), HULL, { bone: pitch, at: [s * 0.55, 2.2, -0.2 + i * 0.7], rotation: [90, 0, 0], flat: true });
      glow(b.part(new THREE.TorusGeometry(0.16, 0.025, 5, 8), CYAN, { bone: pitch, at: [s * 0.55, 2.2, 0.06 + i * 0.7] }), 1.4);
    }
  }
  glow(b.part(box(0.12, 0.08, 4.8), CYAN, { bone: pitch, at: [0, 2.15, 2.4] }), 1.6);
  for (let i = 0; i < 5; i++) b.part(box(0.7, 0.34, 0.1), DARK, { bone: pitch, at: [0, 2.15, 0.6 + i * 0.95] });
  b.part(box(0.7, 0.4, 0.3), STEEL, { bone: pitch, at: [0, 2.15, 4.95] });
  glow(b.part(box(0.3, 0.14, 0.04), CYAN, { bone: pitch, at: [0, 2.15, 5.12] }), 1.8);
  // dome sensor on turret
  b.part(new THREE.SphereGeometry(0.22, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), GLASS, { bone: yaw, at: [0.6, 2.25, -1.8], flat: true });

  // ---- rear greeble: power cells
  for (let i = 0; i < 3; i++) {
    b.part(box(0.9, 0.5, 0.5), DARK, { bone: chassis, at: [0, 1.65, -3.3 - i * 0.0] });
  }
  for (let i = -1; i <= 1; i++) {
    glow(b.part(box(0.2, 0.3, 0.04), CYAN, { bone: chassis, at: [i * 0.28, 1.65, -3.58] }));
  }
  for (let i = 0; i < 8; i++)
    b.part(box(0.1 + R() * 0.1, 0.06, 0.1 + R() * 0.1), STEEL, { bone: chassis, at: [(R() - 0.5) * 1.8, 1.45, 1.0 + R() * 0.8] });

  // ---- six wheels with suspension
  const zs = [3.0, 0.2, -2.6];
  for (const [zi, z] of zs.entries()) {
    for (const [side, s] of [["L", 1], ["R", -1]] as const) {
      const front = zi === 0;
      const susp = b.joint(`susp${side}${zi}`, { parent: chassis, at: [s * 0.9, 0.85, z], dir: [0, 1, 0], role: "hinge" });
      const hub: [number, number, number] = [s * 1.3, 0.55, z];
      const steer = front ? b.joint(`steer${side}`, { parent: susp, at: hub, dir: [0, 0, 1], up: [1, 0, 0], role: "hinge" }) : susp;
      const w = b.joint(`wheel${side}${zi}`, { parent: steer, at: hub, dir: [0, 1, 0], role: "hinge" });
      b.part(cyl(0.55, 0.5, 12), TYRE, { bone: w, at: hub, rotation: [0, 0, 90], flat: true });
      b.part(cyl(0.34, 0.54, 8), STEEL, { bone: w, at: hub, rotation: [0, 0, 90], flat: true });
      b.part(cyl(0.12, 0.6, 6), DARK, { bone: w, at: hub, rotation: [0, 0, 90] });
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        b.part(cyl(0.03, 0.04, 6), WARN, { bone: w, at: [s * 1.58, 0.55 + 0.23 * Math.cos(a), z + 0.23 * Math.sin(a)], rotation: [0, 0, 90] });
      }
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        b.part(box(0.5, 0.1, 0.16), TYRE, { bone: w, at: [s * 1.3, 0.55 + 0.56 * Math.cos(a), z + 0.56 * Math.sin(a)], rotation: [(a * 180) / Math.PI, 0, 0] });
      }
      b.rod([s * 0.9, 0.9, z], hub, 0.07, STEEL, { bone: susp, sides: 6 });
      b.rod([s * 1.0, 1.25, z + 0.2], [s * 1.2, 0.7, z + 0.1], 0.05, WARN, { bone: susp, sides: 6 });
      // fender
      b.part(box(0.2, 0.08, 1.4), HULL2, { bone: chassis, at: [s * 1.35, 1.2, z] });
    }
  }

  // ---- stabiliser legs (deployed)
  const legSpots: [number, number, string][] = [[1, 1.6, "FL"], [-1, 1.6, "FR"], [1, -3.6, "RL"], [-1, -3.6, "RR"]];
  for (const [s, z, n] of legSpots) {
    const root = b.joint(`outrigger${n}`, { parent: chassis, at: [s * 1.3, 1.0, z], dir: [s, -0.2, 0], role: "leg" });
    b.part(box(0.4, 0.3, 0.5), DARK, { bone: root, at: [s * 1.3, 1.0, z] });
    const knee: [number, number, number] = [s * 2.5, 1.05, z];
    b.rod([s * 1.3, 1.0, z], knee, 0.11, HULL2, { bone: root, section: "box" });
    const foot = b.joint(`stab${n}`, { parent: root, at: knee, dir: [0, -1, 0], role: "leg" });
    b.rod(knee, [s * 2.6, 0.12, z], 0.1, STEEL, { bone: foot, sides: 8 });
    b.rod([s * 1.5, 0.95, z + 0.12], [s * 2.55, 0.6, z + 0.12], 0.04, WARN, { bone: root, sides: 6 }); // ram
    b.part(cyl(0.3, 0.12, 8), DARK, { bone: foot, at: [s * 2.6, 0.06, z], flat: true });
    b.part(cyl(0.2, 0.06, 8), WARN, { bone: foot, at: [s * 2.6, 0.01, z] });
    b.part(cyl(0.16, 0.5, 8), HULL2, { bone: foot, at: [s * 2.55, 0.55, z], flat: true });
  }

  // lights
  for (const s of [1, -1]) {
    glow(b.part(cyl(0.1, 0.05, 8), "#fff3b0", { bone: chassis, at: [s * 0.9, 1.0, 4.78], rotation: [90, 0, 0] }));
  }
  return b.root;
}
