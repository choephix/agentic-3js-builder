```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Railgun Carrier",
  description: "Six-wheeled railgun carrier braced on four stabiliser legs, low-poly sci-fi military.",
};

const HULL = "#5d6b4a";
const HULL_D = "#434f35";
const HULL_L = "#7a8a5f";
const DARK = "#1d2024";
const STEEL = "#8a9099";
const GUN = "#2e343b";
const YEL = "#e0b020";
const CYAN = "#46e6ff";
const GLASS = "#2b6e86";
const RUB = "#16171a";

export default function build() {
  const b = createBuilder({ name: "railgunCarrier" });
  const hull = b.joint("hull", { at: [0, 0.9, 0] });
  const turret = b.joint("turret", { parent: hull, at: [0, 1.75, -0.6], dir: [0, 1, 0] });
  const pitch = b.joint("gunPitch", { parent: turret, at: [0, 2.25, -0.4], dir: [0, 0, 1], role: "hinge" });

  const box = (w: number, h: number, d: number, c: string, at: number[], bone: any = hull, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: at as any, rotation: rot as any });
  const cyl = (r1: number, r2: number, h: number, seg: number, c: string, at: number[], bone: any = hull, dir?: number[]) =>
    b.part(new THREE.CylinderGeometry(r1, r2, h, seg), c, { bone, at: at as any, dir: dir as any });

  // chassis
  box(2.5, 0.7, 7.6, HULL, [0, 1.15, 0]);
  box(2.2, 0.35, 7.2, HULL_D, [0, 0.72, 0]);
  box(2.3, 0.18, 6.4, HULL_L, [0, 1.54, -0.4]);
  // sloped front glacis
  b.part(new THREE.BoxGeometry(2.4, 0.6, 1.4), HULL, { bone: hull, at: [0, 1.28, 3.9], rotation: [-22, 0, 0] });
  // cab
  box(2.0, 0.9, 1.7, HULL, [0, 1.95, 2.6]);
  box(1.8, 0.5, 0.1, GLASS, [0, 2.1, 3.48]);
  b.part(new THREE.BoxGeometry(1.8, 0.5, 0.1), GLASS, { bone: hull, at: [0, 2.2, 3.47], rotation: [-18, 0, 0] });
  for (const s of [1, -1]) box(0.08, 0.45, 1.0, GLASS, [s * 1.02, 2.1, 2.7]);
  box(2.05, 0.1, 1.75, HULL_D, [0, 2.45, 2.6]);
  // headlights
  for (const s of [1, -1]) {
    glow(box(0.3, 0.16, 0.08, "#fff2b0", [s * 0.8, 1.25, 4.5], hull, [-22, 0, 0]), 1.3);
    box(0.5, 0.1, 0.1, DARK, [s * 0.8, 1.05, 4.45]);
  }
  // hazard stripes on bumper
  box(2.5, 0.2, 0.2, DARK, [0, 0.8, 4.45]);
  for (let i = -5; i <= 5; i++) box(0.12, 0.2, 0.22, YEL, [i * 0.22, 0.8, 4.46]);
  // side skirts & armor plates
  for (const s of [1, -1]) {
    box(0.15, 0.6, 5.8, HULL_D, [s * 1.3, 1.1, -0.2]);
    for (let i = 0; i < 5; i++) box(0.1, 0.4, 0.9, HULL_L, [s * 1.38, 1.15, -2.2 + i * 1.1]);
    box(0.1, 0.1, 6.0, YEL, [s * 1.36, 1.5, -0.2]);
    // exhausts
    cyl(0.1, 0.12, 0.9, 6, DARK, [s * 1.0, 2.0, -3.3]);
    // antenna
    cyl(0.02, 0.02, 1.2, 4, STEEL, [s * 0.9, 3.0, 2.0]);
  }
  // rear
  box(2.3, 0.8, 0.3, HULL_D, [0, 1.2, -3.85]);
  for (const s of [1, -1]) glow(box(0.4, 0.14, 0.06, "#ff3030", [s * 0.8, 1.0, -4.03]), 1.2);
  // power core glow vents
  for (const s of [1, -1]) glow(box(0.06, 0.12, 1.4, CYAN, [s * 1.38, 0.95, -0.2]), 1.4);

  // wheels: 3 axles x 2
  const wz = [2.6, 0, -2.6];
  wz.forEach((z, i) => {
    box(2.0, 0.2, 0.3, DARK, [0, 0.55, z]);
    for (const s of [1, -1]) {
      const wh = b.joint(`wheel${s > 0 ? "L" : "R"}${i + 1}`, { parent: hull, at: [s * 1.45, 0.55, z], dir: [s, 0, 0], role: "leg" });
      cyl(0.55, 0.55, 0.5, 10, RUB, [s * 1.45, 0.55, z], wh, [1, 0, 0]);
      cyl(0.33, 0.33, 0.56, 8, STEEL, [s * 1.45, 0.55, z], wh, [1, 0, 0]);
      cyl(0.12, 0.12, 0.62, 6, DARK, [s * 1.45, 0.55, z], wh, [1, 0, 0]);
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2;
        b.part(new THREE.BoxGeometry(0.06, 0.1, 0.1), RUB, { bone: wh, at: [s * 1.45 + s * 0.26, 0.55 + Math.sin(a) * 0.55, z + Math.cos(a) * 0.55] });
      }
      // fender
      box(0.6, 0.1, 1.3, HULL_D, [s * 1.45, 1.2, z]);
    }
  });

  // stabiliser legs (4), deployed
  const corners: [number, number][] = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
  corners.forEach(([sx, sz], i) => {
    const base = [sx * 1.4, 1.0, sz * 2.6];
    const foot = [sx * 2.7, 0.08, sz * 3.2];
    const elbow = [sx * 2.2, 1.1, sz * 2.9];
    const leg = b.chain(`stab${i + 1}`, [base, elbow, foot] as any, { parent: hull, names: [`stabHip${i + 1}`, `stabKnee${i + 1}`, `stabFoot${i + 1}`], role: "leg" });
    b.sweep(leg, 0.14, { color: STEEL, section: { ngon: 6 } as any, skin: "rigid" });
    b.rod(elbow as any, foot as any, 0.2, HULL_D, { bone: leg.joints[1] });
    cyl(0.4, 0.5, 0.16, 8, DARK, [foot[0], 0.08, foot[2]], leg.tip ?? leg.joints[1]);
    box(0.3, 0.3, 0.3, YEL, [base[0] + sx * 0.2, base[1], base[2]]);
    b.part(new THREE.SphereGeometry(0.22, 6, 5), DARK, { bone: leg.joints[1], at: elbow as any });
  });

  // turret
  cyl(1.35, 1.45, 0.25, 12, DARK, [0, 1.7, -0.6], hull);
  cyl(1.2, 1.3, 0.55, 10, HULL, [0, 2.0, -0.6], turret);
  box(2.2, 0.9, 2.4, HULL, [0, 2.45, -0.4], turret);
  box(1.8, 0.25, 2.0, HULL_L, [0, 3.0, -0.4], turret);
  for (const s of [1, -1]) {
    box(0.3, 0.8, 2.2, HULL_D, [s * 1.2, 2.5, -0.4], turret);
    box(0.06, 0.5, 0.06, YEL, [s * 1.37, 2.5, 0.3], turret);
    glow(box(0.08, 0.16, 0.7, CYAN, [s * 1.36, 2.6, -0.8], turret), 1.4);
  }
  // sensor
  cyl(0.15, 0.15, 0.3, 8, DARK, [0.7, 3.25, 0.3], turret);
  glow(b.part(new THREE.SphereGeometry(0.12, 6, 5), CYAN, { bone: turret, at: [0.7, 3.45, 0.35] }), 1.5);

  // railgun
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.3, 0.3, 6), GUN, { bone: pitch, at: [s * 0.32, 2.5, 3.2] });
    glow(b.part(new THREE.BoxGeometry(0.06, 0.08, 5.4), CYAN, { bone: pitch, at: [s * 0.18, 2.5, 3.2] }), 1.6);
    b.part(new THREE.BoxGeometry(0.34, 0.34, 0.5), STEEL, { bone: pitch, at: [s * 0.32, 2.5, 6.3] });
  }
  for (let i = 0; i < 6; i++) {
    const z = 0.9 + i * 0.95;
    b.part(new THREE.BoxGeometry(1.0, 0.7, 0.18), HULL_D, { bone: pitch, at: [0, 2.5, z] });
    b.part(new THREE.BoxGeometry(0.12, 0.76, 0.2), YEL, { bone: pitch, at: [0.5, 2.5, z] });
    b.part(new THREE.BoxGeometry(0.12, 0.76, 0.2), YEL, { bone: pitch, at: [-0.5, 2.5, z] });
  }
  b.part(new THREE.BoxGeometry(1.0, 0.9, 1.4), HULL, { bone: pitch, at: [0, 2.5, 0.4] });
  // capacitor bank
  for (let i = 0; i < 4; i++) {
    cyl(0.18, 0.18, 1.0, 8, DARK, [-0.9 + i * 0.6, 3.2, -1.1], turret, [1, 0, 0]);
    glow(cyl(0.19, 0.19, 0.12, 8, CYAN, [-0.9 + i * 0.6, 3.2, -1.1], turret, [1, 0, 0]), 1.3);
  }

  return b.root;
}
```