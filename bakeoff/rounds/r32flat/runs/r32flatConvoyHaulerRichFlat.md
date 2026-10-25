```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Convoy Hauler",
  description: "Low-poly cyberpunk armoured convoy truck guarding a sealed, neon-banded cargo pod, with a roof turret.",
};

const GUN = "#2a2f3a";
const ARMOR = "#3b4252";
const ARMOR_HI = "#566074";
const DARK = "#14161c";
const TYRE = "#101114";
const HUB = "#7a828f";
const CYAN = "#19f0ff";
const MAGENTA = "#ff2bd6";
const YELLOW = "#ffc400";
const RED = "#ff2b3a";
const POD = "#2f3b4a";
const POD_HI = "#4a5b70";

export default function build() {
  const b = createBuilder({ name: "convoy_hauler" });

  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], rotation: rot });
  const cylX = (r: number, len: number, color: string, x: number, y: number, z: number, seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at: [x, y, z], rotation: [0, 0, 90] });
  const cylZ = (r: number, len: number, color: string, x: number, y: number, z: number, seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at: [x, y, z], rotation: [90, 0, 0] });
  const cylY = (r: number, len: number, color: string, x: number, y: number, z: number, seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at: [x, y, z] });
  const lit = (p: ReturnType<typeof box>, s = 1.4) => glow(p, s);

  // ---- chassis ----
  box(2.0, 0.4, 9.4, GUN, 0, 0.9, 0);
  box(1.6, 0.25, 9.0, DARK, 0, 0.62, 0);
  for (const s of [1, -1]) {
    lit(box(0.08, 0.08, 8.4, MAGENTA, s * 0.98, 0.62, 0), 1.6);
    lit(box(0.08, 0.08, 8.4, CYAN, s * 0.98, 0.53, 0), 1.2);
  }

  // ---- wheels ----
  const axles = [3.2, -1.5, -3.2];
  for (const z of axles)
    for (const s of [1, -1]) {
      const x = s * 1.35;
      cylX(0.6, 0.55, TYRE, x, 0.6, z, 10);
      cylX(0.34, 0.6, HUB, x, 0.6, z, 8);
      cylX(0.52, 0.2, ARMOR, x, 0.6, z, 10);
      lit(cylX(0.16, 0.66, CYAN, x, 0.6, z, 6), 1.6);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        box(0.08, 0.07, 0.07, DARK, s * 1.66, 0.6 + Math.sin(a) * 0.25, z + Math.cos(a) * 0.25);
      }
    }
  for (const z of axles) cylX(0.12, 2.8, DARK, 0, 0.6, z, 6);
  // fenders
  box(0.8, 0.12, 1.5, ARMOR, 1.35, 1.3, 3.2);
  box(0.8, 0.12, 1.5, ARMOR, -1.35, 1.3, 3.2);
  box(0.8, 0.12, 2.9, ARMOR, 1.35, 1.3, -2.35);
  box(0.8, 0.12, 2.9, ARMOR, -1.35, 1.3, -2.35);
  for (const s of [1, -1]) box(0.8, 0.08, 1.5, ARMOR_HI, s * 1.35, 1.37, 3.2);

  // ---- side skirts with hazard stripes ----
  for (const s of [1, -1]) {
    box(0.2, 0.6, 2.6, ARMOR, s * 1.2, 0.95, 0.45);
    for (let i = 0; i < 8; i++) box(0.04, 0.5, 0.15, i % 2 ? DARK : YELLOW, s * 1.31, 0.95, -0.7 + i * 0.3, [0, 0, 0]);
    // fuel / battery tank
    cylZ(0.28, 1.2, GUN, s * 1.1, 0.55, 0.5, 8);
  }

  // ---- cab (side-profile extrude) ----
  b.extrude(
    [
      [1.9, 1.1],
      [4.7, 1.1],
      [4.7, 1.9],
      [3.9, 2.2],
      [3.4, 3.1],
      [2.2, 3.1],
      [1.9, 2.9],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.3, bevel: 0.05, color: ARMOR },
  );
  // roof plate and armoured hood plate
  box(2.1, 0.1, 1.4, ARMOR_HI, 0, 3.14, 2.8);
  box(2.2, 0.08, 0.8, ARMOR_HI, 0, 2.04, 4.3, [-15, 0, 0]);
  // windshield (slanted, glowing)
  lit(box(1.7, 0.75, 0.05, CYAN, 0, 2.65, 3.66, [-29, 0, 0]), 0.9);
  box(1.8, 0.07, 0.07, DARK, 0, 3.05, 3.4);
  box(1.8, 0.07, 0.07, DARK, 0, 2.27, 3.88);
  // side windows
  for (const s of [1, -1]) {
    lit(box(0.05, 0.6, 0.85, CYAN, s * 1.16, 2.6, 2.85), 0.8);
    box(0.08, 0.1, 0.95, DARK, s * 1.17, 2.9, 2.85);
    box(0.1, 0.9, 0.06, DARK, s * 1.17, 2.6, 2.3);
    // door armour and handle
    box(0.06, 0.8, 1.1, ARMOR_HI, s * 1.16, 1.65, 2.85);
    box(0.1, 0.06, 0.25, MAGENTA, s * 1.2, 1.8, 2.5);
    // mirror
    box(0.4, 0.04, 0.04, DARK, s * 1.35, 2.5, 3.3);
    box(0.08, 0.3, 0.2, GUN, s * 1.55, 2.5, 3.3);
  }
  // grille and bumper
  box(2.2, 0.55, 0.3, DARK, 0, 1.3, 4.75);
  for (let i = 0; i < 5; i++) lit(box(1.8, 0.04, 0.05, i % 2 ? CYAN : MAGENTA, 0, 1.15 + i * 0.1, 4.92), 1.0);
  box(2.4, 0.3, 0.35, ARMOR_HI, 0, 0.95, 4.7);
  for (let i = 0; i < 6; i++) box(0.2, 0.25, 0.05, i % 2 ? DARK : YELLOW, -1 + i * 0.4, 0.95, 4.9);
  // wedge plough
  b.extrude(
    [
      [0, 0],
      [0.7, 0.25],
      [0.7, 0.6],
      [0, 0.6],
    ],
    { at: [0, 0.65, 4.7], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.0, color: ARMOR },
  );
  // headlights
  for (const s of [1, -1]) {
    lit(box(0.4, 0.18, 0.08, "#f4fbff", s * 0.85, 1.85, 4.72), 2.0);
    lit(box(0.15, 0.15, 0.08, RED, s * 1.2, 0.95, 4.7), 1.5);
  }
  // roof light bar
  box(1.8, 0.12, 0.3, DARK, 0, 3.26, 3.2);
  for (let i = 0; i < 6; i++) lit(box(0.25, 0.1, 0.32, i % 2 ? MAGENTA : CYAN, -0.7 + i * 0.28, 3.3, 3.2), 1.8);

  // ---- exhaust stacks and antennas ----
  for (const s of [1, -1]) {
    cylY(0.1, 2.4, DARK, s * 1.2, 2.5, 1.65, 8);
    cylY(0.14, 0.15, HUB, s * 1.2, 3.75, 1.65, 8);
    cylY(0.14, 0.1, ARMOR_HI, s * 1.2, 1.6, 1.65, 8);
  }
  cylY(0.02, 1.4, DARK, -0.8, 3.9, 2.4, 4);
  lit(box(0.06, 0.06, 0.06, RED, -0.8, 4.62, 2.4), 2.0);
  cylY(0.02, 0.9, DARK, 0.8, 3.7, 2.4, 4);
  // sensor dish
  cylY(0.04, 0.4, DARK, 0.5, 3.35, 2.4, 6);
  b.part(new THREE.ConeGeometry(0.28, 0.14, 8), HUB, { at: [0.5, 3.6, 2.45], rotation: [-40, 0, 0] });

  // ---- roof turret ----
  cylY(0.3, 0.12, GUN, 0, 3.25, 2.5, 8);
  box(0.55, 0.3, 0.6, ARMOR_HI, 0, 3.46, 2.5);
  box(0.3, 0.16, 0.34, GUN, 0, 3.7, 2.45);
  for (const s of [1, -1]) {
    cylZ(0.04, 0.9, DARK, s * 0.14, 3.48, 3.05, 6);
    cylZ(0.07, 0.15, GUN, s * 0.14, 3.48, 3.5, 6);
  }
  lit(box(0.1, 0.06, 0.04, RED, 0, 3.7, 2.62), 1.8);

  // ---- cargo cradle ----
  for (const z of [1.2, -0.6, -2.4, -4.1]) {
    box(2.2, 0.22, 0.4, GUN, 0, 1.2, z);
    for (const s of [1, -1]) box(0.2, 0.7, 0.3, GUN, s * 1.0, 1.55, z, [0, 0, s * -25]);
  }
  box(2.1, 0.12, 6.2, DARK, 0, 1.12, -1.4);

  // ---- sealed pod ----
  const podZ = -1.35;
  const podY = 2.65;
  const podL = 6.1;
  const R = 1.3;
  b.part(new THREE.CylinderGeometry(R, R, podL, 8), POD, { at: [0, podY, podZ], rotation: [90, 22.5, 0], flat: true });
  // top highlight ridge plates
  box(1.0, 0.08, podL - 0.4, POD_HI, 0, podY + R + 0.0, podZ);
  // armour bands
  for (let i = 0; i < 5; i++) {
    const z = podZ - podL / 2 + 0.5 + i * ((podL - 1) / 4);
    b.part(new THREE.CylinderGeometry(R + 0.08, R + 0.08, 0.3, 8), ARMOR, { at: [0, podY, z], rotation: [90, 22.5, 0], flat: true });
    lit(b.part(new THREE.CylinderGeometry(R + 0.1, R + 0.1, 0.06, 8), i % 2 ? MAGENTA : CYAN, { at: [0, podY, z + 0.08], rotation: [90, 22.5, 0], flat: true } as never), 1.5);
  }
  // front dome cap & rear door
  b.part(new THREE.CylinderGeometry(R * 0.7, R, 0.6, 8), ARMOR, { at: [0, podY, podZ + podL / 2 + 0.3], rotation: [90, 22.5, 0], flat: true });
  b.part(new THREE.CylinderGeometry(R, R * 0.8, 0.5, 8), ARMOR, { at: [0, podY, podZ - podL / 2 - 0.25], rotation: [90, 22.5, 0], flat: true });
  const rz = podZ - podL / 2 - 0.52;
  box(1.5, 1.5, 0.08, GUN, 0, podY, rz);
  box(0.06, 1.5, 0.1, DARK, 0, podY, rz - 0.02);
  box(1.5, 0.06, 0.1, DARK, 0, podY, rz - 0.02);
  lit(cylZ(0.28, 0.1, RED, 0, podY, rz - 0.06, 6), 1.8);
  cylZ(0.14, 0.12, DARK, 0, podY, rz - 0.1, 6);
  for (const s of [1, -1]) for (const t of [1, -1]) box(0.14, 0.14, 0.12, YELLOW, s * 0.62, podY + t * 0.62, rz - 0.02);
  // tail lights
  for (const s of [1, -1]) lit(box(0.22, 0.4, 0.08, RED, s * 1.0, 1.5, -4.45), 1.8);
  box(2.4, 0.3, 0.3, ARMOR_HI, 0, 0.95, -4.65);

  // pod side panels: glowing hazard code, hatches, vents
  for (const s of [1, -1]) {
    const x = s * (R * 0.93 + 0.06);
    box(0.08, 1.0, 2.2, DARK, x, podY, podZ + 0.3, [0, 0, s * -0]);
    for (let i = 0; i < 6; i++) lit(box(0.1, 0.1 + (i % 3) * 0.1, 0.2, i % 2 ? MAGENTA : CYAN, x + s * 0.02, podY - 0.3 + (i % 3) * 0.05, podZ - 0.5 + i * 0.32), 1.5);
    lit(box(0.1, 0.1, 2.0, MAGENTA, x + s * 0.02, podY + 0.45, podZ + 0.3), 1.2);
    // angled shoulder armour
    box(0.12, 0.6, 5.0, ARMOR, s * 1.1, podY + 0.9, podZ, [0, 0, s * -40]);
    // hazard triangle block
    for (let i = 0; i < 5; i++) box(0.06, 0.5, 0.2, i % 2 ? DARK : YELLOW, s * 1.28, podY - 0.7, podZ - 1.8 + i * 0.28, [0, 0, 0]);
    // vents
    for (let i = 0; i < 4; i++) box(0.06, 0.06, 0.8, DARK, s * 1.2, podY - 1.0 + i * 0.0, podZ + 2.0 - i * 0.0 + (i - 1.5) * 0.0).position.y += i * 0.0;
  }
  // roof beacons on pod
  for (const z of [podZ + 2.2, podZ - 2.2]) {
    cylY(0.12, 0.16, DARK, 0, podY + R + 0.12, z, 6);
    lit(b.part(new THREE.SphereGeometry(0.11, 6, 4), MAGENTA, { at: [0, podY + R + 0.25, z] }), 2.0);
  }
  // roof rack rails and antenna
  for (const s of [1, -1]) box(0.06, 0.06, 4.6, GUN, s * 0.55, podY + R + 0.12, podZ);
  cylY(0.025, 1.2, DARK, 0.4, podY + R + 0.75, podZ - 2.0, 4);

  // ground-contact sanity: glow pad lines are neon only
  return b.root;
}
```