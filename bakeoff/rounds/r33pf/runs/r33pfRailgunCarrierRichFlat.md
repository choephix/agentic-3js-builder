```ts
import * as THREE from "three";
import { createBuilder, glow } from "agentic-3js-builder";

export const meta = {
  name: "Railgun Carrier",
  description: "Six-wheeled railgun carrier braced on stabiliser legs, low-poly sci-fi military.",
};

const HULL = "#4f5b45";
const HULL_D = "#3a4434";
const HULL_L = "#6b7a5c";
const DARK = "#1d2024";
const STEEL = "#8b929b";
const TIRE = "#16171a";
const HAZ = "#e0b422";
const CYAN = "#4fe8ff";
const RED = "#c23a2e";

export default function build() {
  const b = createBuilder({ name: "railgunCarrier" });
  const root = b.joint("root", { at: [0, 0.6, 0] });
  const turret = b.joint("turret", { parent: root, at: [0, 1.45, -0.3], dir: [0, 1, 0], role: "hinge" });
  const gun = b.joint("gunPitch", { parent: turret, at: [0, 0.35, 0.2], dir: [0, 0, 1], role: "hinge" });

  const box = (w: number, h: number, d: number, c: string, at: number[], bone = root, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: at as any, bone, rotation: rot as any });
  const cyl = (rt: number, rb: number, h: number, c: string, at: number[], dir: number[], seg = 8, bone = root) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: at as any, dir: dir as any, bone });

  // hull
  box(2.2, 0.6, 6.4, HULL, [0, 1.0, 0]);
  box(1.9, 0.3, 6.0, HULL_L, [0, 1.38, 0]);
  box(2.0, 0.25, 6.2, HULL_D, [0, 0.72, 0]);
  // sloped nose
  b.part(new THREE.BoxGeometry(2.0, 0.5, 1.2), HULL, { at: [0, 1.15, 3.55], rotation: [-20, 0, 0], bone: root });
  // cab
  box(1.6, 0.6, 1.4, HULL_D, [0, 1.75, 2.3]);
  b.part(new THREE.BoxGeometry(1.4, 0.35, 0.1), CYAN, { at: [0, 1.85, 3.02], rotation: [-15, 0, 0], bone: root });
  glow(b.part(new THREE.BoxGeometry(1.3, 0.28, 0.06), CYAN, { at: [0, 1.86, 3.05], rotation: [-15, 0, 0], bone: root }), 1.2);
  // headlights
  for (const s of [1, -1]) {
    glow(box(0.25, 0.15, 0.08, "#fff2b0", [s * 0.8, 1.0, 4.1]), 1.4);
    box(0.3, 0.08, 6.0, HAZ, [s * 1.12, 0.95, 0]);
    box(0.08, 0.5, 0.5, DARK, [s * 1.12, 1.4, -2.8]);
    // fender plates
    for (let i = 0; i < 3; i++) box(0.5, 0.12, 1.5, HULL_L, [s * 1.2, 0.95, 2.0 - i * 2.0]);
  }
  // engine vents rear
  for (let i = 0; i < 4; i++) box(1.5, 0.06, 0.05, DARK, [0, 1.0 + i * 0.12, -3.22]);
  box(0.3, 0.3, 0.1, RED, [0.6, 1.0, -3.25]);
  // antenna
  cyl(0.02, 0.03, 1.2, DARK, [0.8, 2.3, 1.6], [0, 1, 0], 6);
  b.part(new THREE.SphereGeometry(0.05, 6, 4), RED, { at: [0.8, 2.9, 1.6], bone: root });

  // wheels: 3 axles
  const zs = [2.4, 0, -2.4];
  const wheels: any[] = [];
  zs.forEach((z, i) => {
    for (const s of [1, -1]) {
      const wj = b.joint(`wheel${i + 1}${s > 0 ? "L" : "R"}`, { parent: root, at: [s * 1.3, 0.6, z], dir: [s, 0, 0], role: "hinge" });
      wheels.push(wj);
      b.part(new THREE.CylinderGeometry(0.6, 0.6, 0.5, 10), TIRE, { at: [s * 1.3, 0.6, z], dir: [s, 0, 0], bone: wj });
      b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.54, 8), STEEL, { at: [s * 1.3, 0.6, z], dir: [s, 0, 0], bone: wj });
      b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.6, 6), DARK, { at: [s * 1.3, 0.6, z], dir: [s, 0, 0], bone: wj });
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2;
        b.part(new THREE.SphereGeometry(0.04, 5, 4), HAZ, {
          at: [s * 1.58, 0.6 + Math.sin(a) * 0.24, z + Math.cos(a) * 0.24],
          bone: wj,
        });
      }
      box(0.15, 0.15, 0.15, DARK, [s * 1.0, 0.65, z]);
      box(0.6, 0.12, 0.2, DARK, [s * 0.75, 0.75, z]);
    }
  });

  // stabiliser legs (deployed outward)
  for (const s of [1, -1]) {
    for (const [i, z] of [1.2, -1.2].entries()) {
      const hip = b.joint(`outrigger${i + 1}${s > 0 ? "L" : "R"}`, { parent: root, at: [s * 1.1, 0.9, z], dir: [s, -0.2, 0], role: "leg" });
      b.part(new THREE.BoxGeometry(0.3, 0.3, 0.3), DARK, { at: [s * 1.1, 0.9, z], bone: hip });
      b.rod([s * 1.1, 0.9, z], [s * 2.3, 0.7, z], 0.1, STEEL, { bone: hip });
      b.rod([s * 2.3, 0.7, z], [s * 2.6, 0.05, z], 0.09, HAZ, { bone: hip });
      b.rod([s * 1.7, 0.85, z], [s * 2.5, 0.35, z], 0.05, DARK, { bone: hip });
      b.part(new THREE.CylinderGeometry(0.28, 0.34, 0.1, 8), DARK, { at: [s * 2.6, 0.05, z], bone: hip });
    }
  }

  // turret
  cyl(1.0, 1.1, 0.25, DARK, [0, 1.55, -0.3], [0, 1, 0], 12, turret);
  b.part(new THREE.BoxGeometry(1.8, 0.7, 2.0), HULL, { at: [0, 0.2, 0], bone: turret });
  b.part(new THREE.BoxGeometry(1.6, 0.2, 1.7), HULL_L, { at: [0, 0.62, -0.1], bone: turret });
  b.part(new THREE.BoxGeometry(0.5, 0.6, 1.0), HULL_D, { at: [0, 0.35, -1.4], bone: turret });
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.2, 0.6, 0.9), HULL_D, { at: [s * 1.0, 0.35, 0.3], bone: turret });
    glow(b.part(new THREE.BoxGeometry(0.06, 0.1, 0.6), CYAN, { at: [s * 1.12, 0.4, 0.3], bone: turret }), 1.2);
  }

  // railgun: two rails with glowing core
  const L = 5.2;
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.22, 0.28, L), STEEL, { at: [s * 0.28, 0.35, 0.2 + L / 2 + 0.9], bone: gun });
    b.part(new THREE.BoxGeometry(0.26, 0.1, L - 0.3), DARK, { at: [s * 0.28, 0.54, 0.2 + L / 2 + 0.9], bone: gun });
  }
  glow(b.part(new THREE.BoxGeometry(0.2, 0.14, L - 0.2), CYAN, { at: [0, 0.35, 0.2 + L / 2 + 0.9], bone: gun }), 1.5);
  b.part(new THREE.BoxGeometry(0.9, 0.7, 1.4), HULL_D, { at: [0, 0.35, 0.8], bone: gun });
  for (let i = 0; i < 5; i++) {
    const z = 1.9 + i * 0.95;
    b.part(new THREE.BoxGeometry(0.85, 0.12, 0.14), HAZ, { at: [0, 0.65, z], bone: gun });
    b.part(new THREE.BoxGeometry(0.85, 0.12, 0.14), DARK, { at: [0, 0.05, z], bone: gun });
  }
  b.part(new THREE.BoxGeometry(0.9, 0.45, 0.25), DARK, { at: [0, 0.35, 0.2 + L + 0.95], bone: gun });
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.3, 8), DARK, { at: [0, 0.35, 6.4], rotation: [90, 0, 0], bone: gun });

  // roof side panels, markings
  box(0.5, 0.05, 0.5, HAZ, [0.6, 1.55, 1.2]);
  box(0.5, 0.05, 0.5, RED, [-0.6, 1.55, 1.2]);
  box(0.5, 0.05, 0.5, HAZ, [0.7, 1.55, -2.4]);

  return b.root;
}
```