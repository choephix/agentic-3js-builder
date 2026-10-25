```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  name: "Six-wheeled railgun carrier",
  description:
    "Low-poly sci-fi military 6x6 carrier with a long elevated railgun, glowing capacitor collars and four deployed hydraulic stabiliser legs with ground pads.",
};

// Palette
const OLIVE = "#566548";
const OLIVE_D = "#434f38";
const TAN = "#a39467";
const DARK = "#272b30";
const GUN = "#39414a";
const STEEL = "#8b949e";
const STEEL_D = "#5d656e";
const ORANGE = "#e8731f";
const CYAN = "#58ecff";
const TIRE = "#17191c";
const GLASS = "#2a7088";
const WHITE = "#e6e6dc";
const RED = "#ff3b2e";
const LAMP = "#fff1b0";

const DEG = Math.PI / 180;
const X_AXIS = new THREE.Vector3(1, 0, 0);

export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });

  // ---------- helpers ----------
  const box = (size: number[], at: number[], color: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, rotation: rot });
  const cyl = (r: number, h: number, at: number[], dir: number[], color: string, seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, dir, flat: true });

  // Gun frame: pivot + elevation. Local +Z is the barrel direction.
  const PIV = new THREE.Vector3(0, 3.05, -1.2);
  const ELEV = 10 * DEG;
  const qG = new THREE.Quaternion().setFromAxisAngle(X_AXIS, -ELEV);
  const gp = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyQuaternion(qG).add(PIV);
  const gbox = (size: number[], p: number[], color: string) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at: gp(p[0], p[1], p[2]), quat: qG });
  const gcyl = (r: number, h: number, p: number[], axis: "x" | "y" | "z", color: string, seg = 8) => {
    const g = new THREE.CylinderGeometry(r, r, h, seg);
    if (axis === "z") g.rotateX(Math.PI / 2);
    if (axis === "x") g.rotateZ(Math.PI / 2);
    return b.part(g, color, { at: gp(p[0], p[1], p[2]), quat: qG, flat: true });
  };

  // ---------- hull ----------
  b.extrude(
    [
      [-4.0, 1.15],
      [-3.8, 0.95],
      [3.6, 0.95],
      [4.2, 1.25],
      [4.2, 1.55],
      [2.3, 2.05],
      [-3.9, 2.05],
      [-4.0, 1.9],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.4, color: OLIVE },
  );
  box([2.0, 0.08, 7.6], [0, 0.93, 0], DARK); // belly plate
  box([2.2, 0.04, 6.0], [0, 2.07, -0.9], OLIVE_D); // top deck plate
  // camo patches
  const camo = [
    [1.4, 1.7, 1.6, 0.4],
    [-0.6, 1.5, 0.9, 0.45],
    [-2.8, 1.65, 1.2, 0.35],
    [3.2, 1.45, 0.9, 0.3],
    [-1.6, 1.25, 1.0, 0.25],
  ];
  for (const s of [1, -1])
    camo.forEach(([z, y, w, h], i) => box([0.03, h, w], [s * 1.2, y + (s > 0 ? 0 : 0.05), z * s * (i % 2 ? 1 : 1)], i % 2 ? TAN : OLIVE_D));
  // side panel lines + pods
  for (const s of [1, -1]) {
    box([0.03, 0.04, 7.2], [s * 1.21, 1.95, 0], DARK);
    box([0.34, 0.6, 1.1], [s * 1.38, 1.5, -1.1], GUN); // storage pod
    box([0.04, 0.5, 0.9], [s * 1.56, 1.5, -1.1], STEEL_D);
    box([0.05, 0.08, 0.4], [s * 1.59, 1.5, -1.1], ORANGE);
  }
  // front bumper + lamps
  box([2.6, 0.2, 0.3], [0, 1.0, 4.2], STEEL_D);
  for (const s of [1, -1]) {
    glow(box([0.42, 0.18, 0.06], [s * 0.8, 1.4, 4.2], LAMP), 1.5);
    box([0.5, 0.26, 0.04], [s * 0.8, 1.4, 4.19], DARK);
    cyl(0.07, 0.3, [s * 1.1, 1.0, 4.35], [0, 0, 1], STEEL, 6); // tow hook stub
    glow(box([0.4, 0.14, 0.05], [s * 0.8, 1.55, -4.0], RED), 1.2); // tail lights
  }
  box([1.0, 0.22, 0.04], [0, 1.5, 4.0], WHITE, [-18, 0, 0]);
  box([0.5, 0.1, 0.05], [0, 1.5, 4.02], ORANGE, [-18, 0, 0]);

  // ---------- cab ----------
  box([2.0, 0.9, 1.5], [0, 2.5, 1.65], OLIVE);
  box([1.8, 0.1, 1.3], [0, 3.0, 1.65], OLIVE_D);
  box([1.7, 0.55, 0.06], [0, 2.65, 2.42], GLASS, [-20, 0, 0]);
  for (const s of [1, -1]) {
    box([0.04, 0.4, 0.9], [s * 1.01, 2.65, 1.65], GLASS);
    box([0.04, 0.12, 0.9], [s * 1.01, 2.3, 1.65], DARK);
    glow(box([0.4, 0.07, 0.1], [s * 0.5, 3.1, 1.2], ORANGE), 1.2); // roof beacons
    cyl(0.025, 1.2, [s * 0.9, 3.6, -3.3], [0, 1, 0], STEEL, 5); // antennas
  }
  cyl(0.2, 0.1, [0.5, 3.1, 2.0], [0, 1, 0], STEEL_D, 8); // hatch
  b.rod([-0.6, 3.05, 1.0], [-0.6, 3.5, 1.0], 0.025, STEEL);
  box([0.28, 0.12, 0.22], [-0.6, 3.55, 1.0], DARK);
  glow(box([0.2, 0.06, 0.03], [-0.6, 3.55, 1.12], CYAN), 1.3);

  // ---------- engine deck ----------
  box([2.2, 0.35, 1.2], [0, 2.225, -3.4], OLIVE_D);
  for (let i = 0; i < 5; i++) box([1.6, 0.03, 0.08], [0, 2.41, -3.0 - i * 0.2 - 0.05], DARK);
  for (const s of [1, -1]) {
    cyl(0.13, 0.6, [s * 0.85, 2.7, -3.8], [0, 1, 0], STEEL_D, 8);
    cyl(0.16, 0.08, [s * 0.85, 3.02, -3.8], [0, 1, 0], DARK, 8);
    box([0.1, 0.1, 0.9], [s * 0.4, 2.45, -3.4], ORANGE);
  }

  // ---------- wheels ----------
  const WHEEL_Z = [2.8, 0.2, -2.4];
  const WY = 0.78;
  const lugs: THREE.BufferGeometry[] = [];
  for (const s of [1, -1])
    for (const z of WHEEL_Z) {
      const wx = s * 1.6;
      cyl(0.6, 0.55, [wx, WY, z], [1, 0, 0], TIRE, 12);
      cyl(0.4, 0.6, [wx, WY, z], [1, 0, 0], STEEL, 10);
      cyl(0.22, 0.66, [wx, WY, z], [1, 0, 0], ORANGE, 8);
      cyl(0.09, 0.7, [wx, WY, z], [1, 0, 0], DARK, 6);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        cyl(0.035, 0.05, [s * 1.9, WY + Math.cos(a) * 0.3, z + Math.sin(a) * 0.3], [1, 0, 0], STEEL_D, 5);
      }
      for (let k = 0; k < 12; k++) {
        const g = new THREE.BoxGeometry(0.58, 0.14, 0.22);
        g.translate(0, 0.62, 0);
        g.rotateX((k / 12) * Math.PI * 2);
        g.translate(wx, WY, z);
        lugs.push(g);
      }
      // axle + suspension
      cyl(0.16, 0.5, [s * 1.38, WY, z], [1, 0, 0], STEEL_D, 8);
      b.rod([s * 1.2, 1.15, z + 0.2], [s * 1.55, WY + 0.1, z], 0.07, STEEL);
      b.rod([s * 1.2, 1.15, z - 0.2], [s * 1.55, WY + 0.1, z], 0.07, STEEL);
      // fender
      box([0.72, 0.12, 1.5], [s * 1.6, 1.55, z], OLIVE);
      box([0.08, 0.3, 1.5], [s * 1.94, 1.42, z], OLIVE_D);
      box([0.72, 0.1, 0.05], [s * 1.6, 1.5, z + 0.78], ORANGE);
    }
  b.part(mergeGeometries(lugs)!, TIRE, { at: [0, 0, 0], flat: true });

  // ---------- stabiliser legs ----------
  for (const s of [1, -1])
    for (const z of [1.5, -3.5]) {
      box([1.2, 0.3, 0.46], [s * 1.7, 1.2, z], GUN); // beam
      box([0.6, 0.04, 0.3], [s * 1.6, 1.37, z], ORANGE); // hazard stripe
      box([0.2, 0.04, 0.3], [s * 1.95, 1.37, z], DARK);
      b.rod([s * 1.25, 1.9, z], [s * 2.1, 1.3, z], 0.08, STEEL); // brace
      cyl(0.2, 0.52, [s * 2.3, 1.2, z], [0, 0, 1], STEEL_D, 8); // knuckle
      const top = [s * 2.3, 1.2, z];
      const foot = [s * 2.9, 0.3, z];
      const midp = [(top[0] + foot[0]) / 2, (top[1] + foot[1]) / 2, z];
      b.rod(top, midp, 0.14, GUN);
      b.rod(midp, foot, 0.09, STEEL);
      cyl(0.15, 0.1, midp, [s * 0.55, 1, 0], ORANGE, 8);
      b.part(new THREE.SphereGeometry(0.16, 8, 6), STEEL_D, { at: foot, flat: true });
      cyl(0.52, 0.22, [s * 2.9, 0.1, z], [0, 1, 0], GUN, 8); // pad
      cyl(0.42, 0.04, [s * 2.9, 0.22, z], [0, 1, 0], ORANGE, 8);
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
        box([0.12, 0.1, 0.12], [s * 2.9 + Math.cos(a) * 0.5, 0.1, z + Math.sin(a) * 0.5], DARK);
      }
    }

  // ---------- turret ----------
  cyl(1.3, 0.3, [0, 2.2, -1.2], [0, 1, 0], GUN, 12);
  cyl(1.05, 0.06, [0, 2.38, -1.2], [0, 1, 0], ORANGE, 12);
  box([2.2, 0.5, 2.0], [0, 2.65, -1.7], OLIVE); // turret rear housing
  box([2.0, 0.08, 1.8], [0, 2.94, -1.7], OLIVE_D);
  for (const s of [1, -1]) {
    box([0.3, 1.1, 1.5], [s * 0.85, 2.9, -1.2], OLIVE); // trunnion towers
    box([0.04, 0.5, 1.0], [s * 1.02, 2.9, -1.2], TAN);
    cyl(0.22, 0.4, [s * 0.85, 3.05, -1.2], [1, 0, 0], STEEL_D, 8);
    glow(box([0.04, 0.12, 0.5], [s * 1.12, 2.65, -1.7], CYAN), 1.1);
  }

  // ---------- railgun ----------
  gbox([1.0, 0.9, 1.6], [0, 0, 0.3], GUN); // breech
  gbox([1.0, 0.1, 1.2], [0, 0.5, 0.4], STEEL_D);
  gbox([0.7, 0.4, 1.0], [0, 0.6, -0.6], DARK); // feed tray
  for (let i = 0; i < 3; i++) gcyl(0.08, 0.9, [-0.2 + i * 0.2, 0.84, -0.6], "z", ORANGE, 6);
  gcyl(0.2, 2.0, [0, 0, 0.3], "x", STEEL_D, 8); // trunnion bar
  for (const s of [1, -1]) {
    gcyl(0.2, 1.7, [s * 0.68, 0.38, 0.35], "z", GUN, 8); // capacitor cylinders
    for (let k = 0; k < 3; k++) glow(gcyl(0.215, 0.1, [s * 0.68, 0.38, -0.2 + k * 0.5], "z", CYAN, 8), 1.3);
    gbox([0.1, 0.25, 0.4], [s * 0.55, -0.2, 1.0], STEEL_D);
  }
  // rails
  for (const s of [1, -1]) {
    gbox([0.14, 0.24, 7.0], [s * 0.28, 0, 4.1], STEEL);
    gbox([0.04, 0.26, 7.0], [s * 0.35, 0, 4.1], STEEL_D);
  }
  glow(gbox([0.2, 0.06, 6.9], [0, 0, 4.1], CYAN), 1.6);
  for (let i = 0; i < 6; i++) {
    const z = 1.7 + i;
    gbox([0.92, 0.08, 0.3], [0, 0.32, z], GUN);
    gbox([0.92, 0.08, 0.3], [0, -0.32, z], GUN);
    for (const s of [1, -1]) {
      gbox([0.08, 0.64, 0.3], [s * 0.46, 0, z], GUN);
      glow(gbox([0.09, 0.2, 0.12], [s * 0.46, 0, z], CYAN), 1.4);
    }
    glow(gbox([0.5, 0.02, 0.1], [0, 0.37, z], CYAN), 1.2);
    gbox([0.46, 0.18, 0.12], [0, 0, z + 0.5], DARK); // insulator bridge
  }
  // muzzle
  gbox([0.95, 0.72, 0.5], [0, 0, 7.85], GUN);
  gbox([1.0, 0.1, 0.6], [0, 0.4, 7.85], STEEL_D);
  glow(gbox([0.3, 0.1, 0.03], [0, 0, 8.12], CYAN), 1.8);
  for (const s of [1, -1]) gbox([0.05, 0.9, 0.3], [s * 0.5, 0, 7.85], STEEL_D);
  // targeting sensor + cable
  gbox([0.3, 0.3, 0.4], [0.7, 0.5, 1.3], DARK);
  glow(gbox([0.18, 0.18, 0.03], [0.7, 0.5, 1.52], CYAN), 1.4);
  gcyl(0.05, 5.5, [-0.45, -0.2, 3.8], "z", DARK, 5);
  // orange band marking on breech
  gbox([1.04, 0.08, 0.2], [0, 0.2, 0.85], ORANGE);
  gbox([1.04, 0.08, 0.2], [0, -0.2, 0.85], ORANGE);

  // markings
  box([0.5, 0.03, 0.5], [0.6, 2.08, 0.4], WHITE);
  box([0.3, 0.035, 0.1], [0.6, 2.09, 0.4], ORANGE);

  return b.root;
}
```