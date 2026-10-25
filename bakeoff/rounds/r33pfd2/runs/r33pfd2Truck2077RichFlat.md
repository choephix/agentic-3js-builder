```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Dystopia Hauler 2077",
  description: "Low-poly cyberpunk armored military truck with turret, neon trim, six wheels and cargo bay.",
};

const HULL = "#3a4150", HULL2 = "#2a2f3a", DARK = "#101216", PLATE = "#5a6272", OLIVE = "#4a5238";
const NEON = "#19f0ff", PINK = "#ff2d95", AMBER = "#ffb02e", RED = "#ff3030", GLASS = "#12303c", RUBBER = "#17181b", METAL = "#8a93a3";

export default function build() {
  const b = createBuilder({ name: "hauler" });
  const hull = b.joint("hull", { at: [0, 0.9, 0] });
  const turretJ = b.joint("turret", { parent: hull, at: [0, 2.35, -0.6], dir: [0, 1, 0] });
  const gunJ = b.joint("gun", { parent: turretJ, at: [0, 2.5, -0.2], dir: [0, 0, 1] });

  const box = (w: number, h: number, d: number, c: string, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: hull, at, ...o });
  const cyl = (rt: number, rb: number, h: number, c: string, at: number[], seg = 8, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone: hull, at, ...o });
  const lit = (w: number, h: number, d: number, c: string, at: number[], s = 1.4) =>
    glow(box(w, h, d, c, at), s);

  // chassis
  box(2.3, 0.35, 7.6, DARK, [0, 0.75, 0]);
  box(2.1, 0.5, 7.2, HULL2, [0, 1.1, 0]);
  // cab (front +Z)
  box(2.3, 1.1, 2.4, HULL, [0, 1.75, 2.5]);
  box(2.2, 0.8, 1.7, HULL, [0, 2.0, 2.1]);
  // sloped hood/nose
  b.part(new THREE.CylinderGeometry(1.0, 1.25, 1.8, 4), PLATE, { bone: hull, at: [0, 1.5, 3.9], rotation: [90, 45, 0], scale: [1, 1, 0.55] });
  box(2.2, 0.15, 1.2, OLIVE, [0, 2.3, 3.4], { rotation: [-14, 0, 0] });
  // windshield and side glass
  box(1.9, 0.6, 0.08, GLASS, [0, 2.2, 3.05], { rotation: [-25, 0, 0] });
  glow(box(1.9, 0.04, 0.05, NEON, [0, 2.52, 3.0], { rotation: [-25, 0, 0] }), 1.5);
  for (const s of [1, -1]) {
    box(0.06, 0.5, 1.2, GLASS, [s * 1.16, 2.15, 2.4]);
    // armor skirts
    box(0.14, 0.75, 6.4, HULL, [s * 1.2, 0.95, 0.2]);
    box(0.05, 0.1, 6.0, NEON, [s * 1.29, 0.7, 0.2]);
    glow(box(0.05, 0.1, 6.0, NEON, [s * 1.3, 0.7, 0.2]), 1.5);
    // plates and rivets on skirt
    for (let i = 0; i < 5; i++) {
      box(0.06, 0.5, 1.0, i % 2 ? PLATE : OLIVE, [s * 1.29, 1.0, -2.2 + i * 1.25]);
      cyl(0.05, 0.05, 0.05, METAL, [s * 1.34, 1.2, -2.2 + i * 1.25], 6, { rotation: [0, 0, 90] });
    }
    // headlights
    glow(box(0.5, 0.18, 0.08, AMBER, [s * 0.75, 1.55, 4.55], { rotation: [-10, 0, 0] }), 2);
    glow(box(0.3, 0.1, 0.06, NEON, [s * 0.75, 1.3, 4.6]), 2);
    // mirrors
    box(0.08, 0.4, 0.3, DARK, [s * 1.4, 2.2, 3.0]);
    // exhaust stacks
    cyl(0.1, 0.12, 1.8, METAL, [s * 1.0, 2.8, 1.5], 6);
    cyl(0.12, 0.12, 0.08, AMBER, [s * 1.0, 3.7, 1.5], 6);
    // antenna
    cyl(0.015, 0.02, 1.6, DARK, [s * 0.9, 3.2, 1.0], 4);
    glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), RED, { bone: hull, at: [s * 0.9, 4.0, 1.0] }), 2);
    // front bumper spikes
    b.part(new THREE.ConeGeometry(0.09, 0.4, 5), METAL, { bone: hull, at: [s * 0.8, 0.95, 4.9], rotation: [90, 0, 0] });
  }
  // bumper & ram
  box(2.5, 0.4, 0.4, PLATE, [0, 0.95, 4.8]);
  box(2.0, 0.12, 0.1, PINK, [0, 0.95, 5.02]);
  glow(box(1.6, 0.06, 0.04, PINK, [0, 0.98, 5.05]), 1.8);
  // grille slits
  for (let i = 0; i < 5; i++) box(1.1, 0.04, 0.05, DARK, [0, 1.15 + i * 0.1, 4.62]);

  // roof rack & sensors
  box(1.9, 0.1, 1.4, PLATE, [0, 2.42, 2.0]);
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 8), DARK, { bone: hull, at: [0.5, 2.55, 2.2] });
  glow(b.part(new THREE.SphereGeometry(0.12, 6, 4), NEON, { bone: hull, at: [0.5, 2.65, 2.2] }), 2);
  box(0.8, 0.12, 0.3, DARK, [-0.4, 2.55, 1.8]);
  glow(box(0.7, 0.04, 0.05, PINK, [-0.4, 2.62, 1.95]), 2);
  for (let i = 0; i < 4; i++) glow(box(0.4, 0.06, 0.06, i % 2 ? RED : AMBER, [0, 2.5, 2.7 - i * 0.2]), 1.5);

  // cargo bay
  box(2.4, 1.4, 4.2, OLIVE, [0, 2.0, -1.7]);
  box(2.5, 0.12, 4.3, HULL2, [0, 2.75, -1.7]);
  for (let i = 0; i < 6; i++) {
    box(2.5, 1.2, 0.1, HULL, [0, 2.0, -3.6 + i * 0.75]);
    for (const s of [1, -1]) box(0.04, 0.5, 0.5, i % 2 ? PINK : NEON, [s * 1.23, 2.0, -3.3 + i * 0.75]);
  }
  glow(box(2.1, 0.08, 0.06, RED, [0, 2.0, -3.84]), 1.8);
  glow(box(2.1, 0.08, 0.06, NEON, [0, 2.45, -3.84]), 1.8);
  // rear lights & hazard stripes
  for (const s of [1, -1]) {
    glow(box(0.4, 0.2, 0.08, RED, [s * 0.9, 1.2, -3.85]), 2);
    for (let i = 0; i < 4; i++) box(0.2, 0.3, 0.05, i % 2 ? AMBER : DARK, [s * (0.3 + i * 0.22), 1.6, -3.86], { rotation: [0, 0, 30] });
  }
  // side missile pods
  for (const s of [1, -1]) {
    box(0.5, 0.7, 2.0, HULL2, [s * 1.45, 2.3, -1.5]);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++)
      cyl(0.09, 0.09, 0.1, DARK, [s * 1.45 + (c - 1) * 0.15 * 0, 2.5 - r * 0.3, -0.5 - c * 0.6], 6, { rotation: [90, 0, 0] });
    for (let c = 0; c < 3; c++) b.part(new THREE.ConeGeometry(0.07, 0.2, 5), RED, { bone: hull, at: [s * 1.45, 2.5, -0.45 - c * 0.6], rotation: [90, 0, 0] });
  }

  // wheels: 3 axles
  const zs = [3.0, -0.6, -2.6];
  for (const z of zs) for (const s of [1, -1]) {
    const x = s * 1.25;
    b.part(new THREE.CylinderGeometry(0.62, 0.62, 0.55, 10), RUBBER, { bone: hull, at: [x, -0.28 + 0.0, z], rotation: [0, 0, 90] });
    b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.58, 8), METAL, { bone: hull, at: [x, -0.28, z], rotation: [0, 0, 90] });
    glow(b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.6, 8), NEON, { bone: hull, at: [x, -0.28, z], rotation: [0, 0, 90] }), 1.2);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      box(0.58, 0.08, 0.12, DARK, [x, -0.28 + Math.sin(a) * 0.27, z + Math.cos(a) * 0.27], { rotation: [(-a * 180) / Math.PI, 0, 0] });
    }
    // fender
    box(0.7, 0.1, 1.5, HULL, [x, 0.5, z]);
    box(0.7, 0.1, 0.1, NEON, [x, 0.5, z + 0.8]);
  }
  for (const z of zs) cyl(0.1, 0.1, 2.6, DARK, [0, -0.28, z], 6, { rotation: [0, 0, 90] });

  // turret
  const tb = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) => b.part(g, c, { bone: turretJ, at, ...o });
  tb(new THREE.CylinderGeometry(0.8, 0.9, 0.3, 8), PLATE, [0, 2.3, -0.6]);
  tb(new THREE.BoxGeometry(1.2, 0.5, 1.4), HULL, [0, 2.7, -0.6]);
  tb(new THREE.BoxGeometry(1.0, 0.2, 1.0), OLIVE, [0, 3.05, -0.7], {});
  glow(tb(new THREE.BoxGeometry(0.5, 0.12, 0.06), NEON, [0, 2.75, 0.12]), 2);
  glow(tb(new THREE.SphereGeometry(0.1, 6, 4), RED, [0.3, 3.2, -0.7]), 2);
  const gb = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) => b.part(g, c, { bone: gunJ, at, ...o });
  for (const s of [1, -1]) {
    gb(new THREE.CylinderGeometry(0.07, 0.07, 1.8, 6), DARK, [s * 0.3, 2.7, 0.9], { rotation: [90, 0, 0] });
    gb(new THREE.CylinderGeometry(0.11, 0.11, 0.3, 6), METAL, [s * 0.3, 2.7, 1.8], { rotation: [90, 0, 0] });
    glow(gb(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 6), NEON, [s * 0.3, 2.7, 1.97], { rotation: [90, 0, 0] }), 2);
    gb(new THREE.BoxGeometry(0.25, 0.3, 0.6), HULL2, [s * 0.3, 2.7, 0.1]);
  }

  // underglow
  glow(box(1.8, 0.04, 6.4, PINK, [0, 0.55, 0]), 1.6);

  return b.root;
}
```