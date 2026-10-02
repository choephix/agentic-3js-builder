import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { PartOptions } from "../src/parts";
import { glow } from "../kits/glow";

const INK = "#202436";
const TRACK = "#303948";
const TRACK_EDGE = "#566273";
const HULL = "#4fbf75";
const HULL_LIGHT = "#8be38c";
const HULL_DARK = "#2f855e";
const CREAM = "#fff0b5";
const GOLD = "#f6bd4e";
const CORAL = "#ef6f61";
const SKY = "#65c9d8";
const LAMP = "#fff4a8";

export const meta = {
  name: "Chunky Garden Tank",
  description: "A low-poly whimsical toy tank with friendly colors, chunky treads, a cheerful turret, and hand-built mechanical details.",
  style: "low-poly whimsical mix",
  commit: "34f986c",
};

export default function build() {
  const b = createBuilder({ name: "toyTank", detail: 0.8 });
  const root = b.joint("chassis", { at: [0, 0.72, 0], role: "spine", group: "vehicle" });
  const turret = b.joint("turretHinge", { parent: root, at: [0, 1.25, 0.02], dir: [0, 1, 0], role: "hinge", group: "turret" });
  const gun = b.joint("gunHinge", { parent: turret, at: [0, 1.43, 0.24], dir: [0, 0, 1], role: "hinge", group: "gun" });
  const part = (geometry: THREE.BufferGeometry, color: string, at: [number, number, number], options: PartOptions = {}) =>
    b.part(geometry, color, { bone: root, at, flat: true, ...options });
  const turretPart = (geometry: THREE.BufferGeometry, color: string, at: [number, number, number], options: PartOptions = {}) =>
    b.part(geometry, color, { bone: turret, at, flat: true, ...options });

  const gunPart = (geometry: THREE.BufferGeometry, color: string, at: [number, number, number], options: PartOptions = {}) =>
    b.part(geometry, color, { bone: gun, at, flat: true, ...options });


  // Low, broad hull with a raised rear deck and a sloped-looking front armor stack.
  part(new THREE.BoxGeometry(1.52, 0.48, 1.58), HULL, [0, 0.78, -0.02]);
  part(new THREE.BoxGeometry(1.34, 0.22, 1.28), HULL_LIGHT, [0, 1.08, -0.02]);
  part(new THREE.BoxGeometry(1.16, 0.18, 0.62), HULL_DARK, [0, 1.22, -0.36]);
  part(new THREE.BoxGeometry(1.28, 0.18, 0.3), CORAL, [0, 1.19, 0.5]);
  part(new THREE.BoxGeometry(1.18, 0.08, 0.08), CREAM, [0, 1.29, 0.48]);

  // Front bumper, tow hooks, and a pair of glowing lamps.
  part(new THREE.BoxGeometry(1.58, 0.16, 0.14), TRACK_EDGE, [0, 0.54, 0.82]);
  part(new THREE.BoxGeometry(1.25, 0.1, 0.1), GOLD, [0, 0.67, 0.91]);
  for (const s of [-1, 1]) {
    part(new THREE.CylinderGeometry(0.115, 0.115, 0.08, 8), LAMP, [s * 0.53, 0.82, 0.89], { rotation: [90, 0, 0] });
    glow(part(new THREE.BoxGeometry(0.14, 0.05, 0.04), CORAL, [s * 0.48, 0.62, 0.93]), 0.55);
    b.spike([s * 0.54, 0.55, 0.86], [s * 0.75, -0.05, 0.2], 0.18, 0.035, { bone: root, color: GOLD, sides: 5 });
  }

  // Side skirts and a generous row of chunky, faceted wheels.
  for (const s of [-1, 1]) {
    const x = s * 0.82;
    part(new THREE.BoxGeometry(0.26, 0.62, 1.84), TRACK, [x, 0.6, -0.03]);
    part(new THREE.BoxGeometry(0.08, 0.48, 1.72), TRACK_EDGE, [s * 0.975, 0.61, -0.03]);
    const wheelZ = [-0.62, -0.2, 0.25, 0.66];
    for (let i = 0; i < wheelZ.length; i++) {
      const z = wheelZ[i];
      const wheelBone = b.joint(`wheel${s > 0 ? "L" : "R"}${i}`, { parent: root, at: [x, 0.37, z], dir: [1, 0, 0], role: "hinge", group: "runningGear" });
      b.part(new THREE.CylinderGeometry(0.31, 0.31, 0.24, 10), TRACK_EDGE, { bone: wheelBone, at: [x, 0.37, z], rotation: [0, 0, 90], flat: true, name: `wheel${s > 0 ? "L" : "R"}${i}` });
      b.part(new THREE.CylinderGeometry(0.21, 0.21, 0.255, 10), HULL_DARK, { bone: wheelBone, at: [x + s * 0.015, 0.37, z], rotation: [0, 0, 90], flat: true });
      b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.27, 8), GOLD, { bone: wheelBone, at: [x + s * 0.02, 0.37, z], rotation: [0, 0, 90], flat: true });
      b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.28, 8), INK, { bone: wheelBone, at: [x + s * 0.025, 0.37, z], rotation: [0, 0, 90], flat: true });
    }
    // Top and bottom tread shoes make the silhouette read as a toy tank rather than a car.
    for (let i = 0; i < 9; i++) {
      const z = -0.86 + i * 0.215;
      part(new THREE.BoxGeometry(0.3, 0.12, 0.16), i % 2 ? TRACK_EDGE : INK, [x, 0.98, z]);
      part(new THREE.BoxGeometry(0.3, 0.12, 0.16), i % 2 ? INK : TRACK_EDGE, [x, 0.05, z]);
    }
    for (let i = 0; i < 3; i++) {
      const y = 0.25 + i * 0.22;
      part(new THREE.BoxGeometry(0.3, 0.15, 0.16), i % 2 ? TRACK_EDGE : INK, [x, y, -0.98]);
      part(new THREE.BoxGeometry(0.3, 0.15, 0.16), i % 2 ? INK : TRACK_EDGE, [x, y, 0.92]);
    }
    // Four little skirt rivets and one painted chevron on each side.
    for (const z of [-0.66, -0.22, 0.24, 0.67]) {
      b.part(new THREE.SphereGeometry(0.038, 6, 4), GOLD, { bone: root, at: [s * 1.0, 0.82, z], flat: true });
    }
    b.part(new THREE.BoxGeometry(0.045, 0.3, 0.045), CORAL, { bone: root, at: [s * 1.01, 0.61, 0.02], rotation: [0, 0, s * 32], flat: true });
    b.part(new THREE.BoxGeometry(0.045, 0.3, 0.045), CORAL, { bone: root, at: [s * 1.01, 0.61, 0.24], rotation: [0, 0, -s * 32], flat: true });
  }

  // Turret ring, faceted turret block, and rear counterweight.
  turretPart(new THREE.CylinderGeometry(0.56, 0.62, 0.14, 10), TRACK_EDGE, [0, 1.27, 0]);
  turretPart(new THREE.CylinderGeometry(0.44, 0.5, 0.16, 10), GOLD, [0, 1.36, 0]);
  turretPart(new THREE.BoxGeometry(0.92, 0.42, 0.84), HULL, [0, 1.52, -0.02]);
  turretPart(new THREE.BoxGeometry(0.72, 0.18, 0.62), HULL_LIGHT, [0, 1.75, -0.02]);
  turretPart(new THREE.BoxGeometry(0.7, 0.22, 0.2), CORAL, [0, 1.54, 0.42]);
  turretPart(new THREE.BoxGeometry(0.78, 0.12, 0.18), CREAM, [0, 1.67, 0.45]);
  turretPart(new THREE.BoxGeometry(0.72, 0.32, 0.18), HULL_DARK, [0, 1.5, -0.46]);

  // Big friendly hatch, handle, periscope, and a tiny pennant.
  turretPart(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 10), GOLD, [0, 1.88, -0.08]);
  turretPart(new THREE.CylinderGeometry(0.15, 0.15, 0.07, 10), HULL_DARK, [0, 1.92, -0.08]);
  turretPart(new THREE.TorusGeometry(0.09, 0.018, 5, 10), INK, [0, 1.96, -0.08], { rotation: [90, 0, 0] });
  turretPart(new THREE.BoxGeometry(0.08, 0.2, 0.12), SKY, [0.28, 1.91, -0.08]);
  turretPart(new THREE.CylinderGeometry(0.022, 0.022, 0.34, 6), INK, [0.28, 2.07, -0.08]);
  turretPart(new THREE.ConeGeometry(0.12, 0.16, 4), CORAL, [0.28, 2.3, -0.08], { rotation: [0, 0, 90] });

  // Main cannon and a colorful muzzle ring, hinged to the gun joint.
  gunPart(new THREE.BoxGeometry(0.34, 0.28, 0.32), HULL_DARK, [0, 1.47, 0.4]);
  gunPart(new THREE.CylinderGeometry(0.115, 0.14, 0.9, 8), HULL_LIGHT, [0, 1.52, 0.86], { rotation: [90, 0, 0] });
  gunPart(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 8), GOLD, [0, 1.55, 1.3], { rotation: [90, 0, 0] });
  gunPart(new THREE.CylinderGeometry(0.09, 0.09, 0.14, 8), INK, [0, 1.55, 1.4], { rotation: [90, 0, 0] });
  gunPart(new THREE.BoxGeometry(0.1, 0.08, 0.08), CORAL, [0.19, 1.52, 0.65]);
  gunPart(new THREE.BoxGeometry(0.1, 0.08, 0.08), CORAL, [-0.19, 1.52, 0.65]);

  // Small cables and exhaust stacks finish the back and make the silhouette lively.
  b.capsule([-0.48, 1.13, -0.59], [-0.48, 1.4, -0.71], 0.018, { bone: root, color: INK, sides: 5 });
  b.capsule([0.48, 1.13, -0.59], [0.48, 1.4, -0.71], 0.018, { bone: root, color: INK, sides: 5 });
  for (const s of [-1, 1]) {
    part(new THREE.CylinderGeometry(0.1, 0.12, 0.2, 8), INK, [s * 0.53, 1.26, -0.67]);
    part(new THREE.CylinderGeometry(0.07, 0.08, 0.08, 8), CORAL, [s * 0.53, 1.4, -0.67]);
    b.capsule([s * 0.92, 1.02, -0.52], [s * 0.92, 1.02, -0.23], 0.018, { bone: root, color: GOLD, sides: 5 });
  }

  // A toy-like rear service panel, tow ring, and paired tail lights give the back a readable finish.
  part(new THREE.BoxGeometry(1.02, 0.28, 0.07), HULL_DARK, [0, 0.78, -0.84]);
  part(new THREE.BoxGeometry(0.72, 0.07, 0.08), GOLD, [0, 0.58, -0.88]);
  part(new THREE.TorusGeometry(0.11, 0.025, 5, 10), GOLD, [0, 0.7, -0.9], { rotation: [90, 0, 0] });
  for (const s of [-1, 1]) {
    part(new THREE.BoxGeometry(0.16, 0.12, 0.07), CORAL, [s * 0.43, 0.87, -0.89]);
    part(new THREE.BoxGeometry(0.08, 0.06, 0.08), LAMP, [s * 0.43, 0.87, -0.935]);
  }

  return b.root;
}
