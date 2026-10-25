import * as THREE from "three";
import { createBuilder, glow } from "../../../../src/index";

export const meta = {
  name: "Railgun Carrier",
  description: "Six-wheeled railgun carrier braced on four stabiliser legs, low-poly sci-fi military.",
};

const OLIVE = "#566048", OLIVE_D = "#3c4533", OLIVE_L = "#6c7858";
const DARK = "#1d2024", STEEL = "#8b929c", STEEL_D = "#4d535c";
const TIRE = "#15161a", HAZ = "#e0b82a", BLUE = "#4cc9ff", RED = "#c0392b", WHITE = "#e8e8e0";

export default function build() {
  const b = createBuilder({ name: "railgun-carrier" });
  const hull = b.joint("hull", { at: [0, 0.9, 0] });
  const turret = b.joint("turret", { parent: hull, at: [0, 1.75, -0.6], dir: [0, 1, 0] });
  const gun = b.joint("gun", { parent: turret, at: [0, 0.35, 0.3], dir: [0, 0, 1] });

  const box = (w: number, h: number, d: number, c: string, at: number[], bone: any = hull, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, ...(rot ? { rotation: rot } : {}) });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, at: number[], bone: any = hull, rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at, ...(rot ? { rotation: rot } : {}) });

  // Chassis
  box(2.4, 0.5, 7.2, OLIVE_D, [0, 0.75, 0]);
  box(2.6, 0.45, 6.4, OLIVE, [0, 1.2, -0.3]);
  box(2.2, 0.15, 6.0, OLIVE_L, [0, 1.5, -0.4]);
  // sloped front glacis
  box(2.5, 0.5, 1.2, OLIVE, [0, 1.15, 3.4], hull, [-30, 0, 0]);
  // cab
  box(2.0, 0.9, 1.7, OLIVE, [0, 1.85, 2.5]);
  box(1.9, 0.5, 0.15, DARK, [0, 2.0, 3.36], hull, [-20, 0, 0]);
  glow(box(1.7, 0.1, 0.05, BLUE, [0, 2.2, 3.4], hull, [-20, 0, 0]), 1.2);
  box(2.1, 0.12, 1.8, OLIVE_D, [0, 2.35, 2.5]);
  // hazard stripes at rear and front
  for (let i = -4; i <= 4; i++) {
    box(0.18, 0.3, 0.06, i % 2 ? HAZ : DARK, [i * 0.25, 0.8, -3.63]);
    box(0.18, 0.18, 0.06, i % 2 ? HAZ : DARK, [i * 0.25, 0.62, 3.65]);
  }
  // side armor plates & vents
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      box(0.1, 0.5, 1.6, i % 2 ? OLIVE_L : OLIVE, [s * 1.35, 1.1, -2 + i * 1.8]);
      box(0.04, 0.2, 0.9, DARK, [s * 1.42, 1.1, -2 + i * 1.8]);
    }
    box(0.05, 0.35, 0.35, WHITE, [s * 1.31, 1.75, 2.5]);
    box(0.06, 0.08, 0.3, RED, [s * 1.31, 1.75, 2.5]);
    // headlights
    glow(box(0.3, 0.14, 0.08, "#fff3b0", [s * 0.8, 1.0, 3.72]), 1.3);
  }

  // Wheels: 3 axles per side
  const wz = [-2.5, 0, 2.5];
  const wheels: any[] = [];
  for (const s of [1, -1])
    for (const z of wz) {
      cyl(0.62, 0.62, 0.55, 10, TIRE, [s * 1.45, 0.62, z], hull, [0, 0, 90]);
      cyl(0.35, 0.35, 0.6, 8, STEEL_D, [s * 1.47, 0.62, z], hull, [0, 0, 90]);
      cyl(0.12, 0.12, 0.66, 6, HAZ, [s * 1.48, 0.62, z], hull, [0, 0, 90]);
      box(0.9, 0.12, 1.0, OLIVE_D, [s * 1.3, 1.1, z]);
      wheels.push(1);
    }
  // axles
  for (const z of wz) cyl(0.1, 0.1, 2.9, 6, STEEL_D, [0, 0.62, z], hull, [0, 0, 90]);

  // Stabiliser legs (deployed, angled outward and down)
  for (const sx of [1, -1])
    for (const z of [-2.9, 1.8]) {
      const top = new THREE.Vector3(sx * 1.4, 1.0, z);
      const foot = new THREE.Vector3(sx * 2.7, 0.05, z);
      b.rod(top, foot, 0.14, STEEL_D, { bone: hull });
      b.rod(new THREE.Vector3(sx * 1.4, 1.25, z), new THREE.Vector3(sx * 2.3, 0.45, z), 0.07, STEEL, { bone: hull });
      b.part(new THREE.CylinderGeometry(0.2, 0.3, 0.14, 8), HAZ, { bone: hull, at: [sx * 2.7, 0.07, z] });
      b.part(new THREE.CylinderGeometry(0.4, 0.44, 0.1, 8), DARK, { bone: hull, at: [sx * 2.7, 0.0, z] });
      box(0.4, 0.4, 0.5, OLIVE_D, [sx * 1.6, 1.0, z]);
    }

  // Turret
  cyl(1.2, 1.3, 0.2, 12, STEEL_D, [0, 1.62, -0.6]);
  b.part(new THREE.CylinderGeometry(0.9, 1.15, 0.7, 8), OLIVE, { bone: turret, at: [0, 0.3, 0] });
  box(1.3, 0.35, 1.8, OLIVE_L, [0, 0.62, -0.3], turret);
  for (const s of [1, -1]) {
    box(0.5, 0.7, 1.4, OLIVE, [s * 0.75, 0.55, 0.3], turret);
    box(0.52, 0.12, 0.6, HAZ, [s * 0.75, 0.95, 0.3], turret);
  }
  // sensor mast
  cyl(0.04, 0.04, 0.6, 5, STEEL, [-0.6, 1.0, -0.8], turret);
  b.part(new THREE.SphereGeometry(0.12, 6, 4), RED, { bone: turret, at: [-0.6, 1.35, -0.8] });
  glow(b.part(new THREE.SphereGeometry(0.07, 5, 4), "#ff5040", { bone: turret, at: [-0.6, 1.4, -0.8] }), 1.5);

  // Railgun: two parallel rails, spacers, coil rings, muzzle
  for (const s of [1, -1]) {
    b.rod([s * 0.22, 0.0, 0.0], [s * 0.22, 0.0, 6.4], 0.12, STEEL, { bone: gun });
    b.rod([s * 0.22, 0.0, 6.4], [s * 0.22, 0.0, 6.7], 0.15, DARK, { bone: gun });
    b.rod([s * 0.22, 0.0, 0.0], [s * 0.22, 0.0, 6.4], 0.04, BLUE, { bone: gun, at: undefined });
  }
  box(0.9, 0.5, 1.8, OLIVE_D, [0, 0, 0.4], gun);
  box(0.55, 0.42, 1.3, STEEL_D, [0, 0, 2.2], gun);
  for (let i = 0; i < 7; i++) {
    const z = 1.2 + i * 0.85;
    box(0.8, 0.12, 0.16, STEEL_D, [0, 0.16, z], gun);
    box(0.8, 0.12, 0.16, STEEL_D, [0, -0.16, z], gun);
    glow(box(0.62, 0.08, 0.2, BLUE, [0, 0, z], gun), 1.4);
  }
  glow(box(0.3, 0.12, 0.12, BLUE, [0, 0, 6.72], gun), 2);
  // power cables
  b.rod([0, 0.45, 0.3], [0, 0.2, 2.2], 0.05, DARK, { bone: gun });

  // Ammo/capacitor tanks at rear
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.28, 0.28, 2.0, 8), STEEL_D, { bone: hull, at: [s * 0.7, 1.8, -2.2], rotation: [90, 0, 0] });
    glow(b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 8), BLUE, { bone: hull, at: [s * 0.7, 1.8, -2.0], rotation: [90, 0, 0] }), 1);
  }
  return b.root;
}
