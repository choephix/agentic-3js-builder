import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Railgun Carrier",
  description:
    "Six-wheeled low-poly sci-fi military railgun carrier with a coil-ringed rail barrel, armoured cab and four deployed hydraulic stabiliser legs.",
};

// Palette
const HULL = "#59694a";
const HULL_D = "#434f38";
const HULL_L = "#74865f";
const DARK = "#24282e";
const GUN = "#3a4049";
const STEEL = "#808892";
const STEEL_D = "#575e68";
const TYRE = "#16181b";
const YELLOW = "#e2b61c";
const BLACK = "#15161a";
const WHITE = "#e9ecee";
const RED = "#c2332b";
const CYAN = "#58e6ff";
const ORANGE = "#ff8a2a";
const GLASS = "#2c6f86";
const LAMP = "#fff6c8";

export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });

  type Opt = Record<string, unknown>;
  const P = (g: THREE.BufferGeometry, c: string, at: number[], o: Opt = {}) =>
    b.part(g, c, { at, flat: true, ...o } as never);
  const box = (sx: number, sy: number, sz: number, c: string, x: number, y: number, z: number, o: Opt = {}) =>
    P(new THREE.BoxGeometry(sx, sy, sz), c, [x, y, z], o);
  const cyl = (
    r: number,
    h: number,
    c: string,
    x: number,
    y: number,
    z: number,
    ax: "x" | "y" | "z" = "y",
    seg = 8,
    o: Opt = {},
  ) =>
    P(
      new THREE.CylinderGeometry(r, r, h, seg),
      c,
      [x, y, z],
      ax === "y" ? o : { dir: ax === "x" ? [1, 0, 0] : [0, 0, 1], ...o },
    );

  // ---------- Chassis ----------
  box(2.2, 0.5, 10.2, DARK, 0, 1.2, 0); // main frame
  box(1.4, 0.3, 9.6, GUN, 0, 0.95, 0); // belly beam
  box(2.9, 0.2, 7.8, HULL, 0, 1.6, -1.1); // rear deck
  box(3.0, 0.08, 7.8, HULL_D, 0, 1.5, -1.1); // deck skirt shadow
  // deck edge trim
  for (const s of [1, -1]) {
    box(0.1, 0.12, 7.8, YELLOW, s * 1.42, 1.72, -1.1);
  }

  // ---------- Axles, wheels, fenders ----------
  const axles = [3.6, 0.6, -2.4];
  for (const z of axles) {
    cyl(0.12, 3.2, STEEL_D, 0, 0.69, z, "x", 8);
    P(new THREE.SphereGeometry(0.3, 8, 6), GUN, [0, 0.69, z]); // differential
    for (const s of [1, -1]) {
      const x = s * 1.55;
      cyl(0.7, 0.56, TYRE, x, 0.69, z, "x", 14);
      cyl(0.72, 0.22, "#202328", x, 0.69, z, "x", 14); // tread band
      cyl(0.42, 0.6, STEEL, x, 0.69, z, "x", 10);
      cyl(0.2, 0.68, YELLOW, x, 0.69, z, "x", 8);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        cyl(0.045, 0.05, DARK, x + s * 0.32, 0.69 + Math.cos(a) * 0.3, z + Math.sin(a) * 0.3, "x", 6);
      }
      // fender
      box(0.85, 0.12, 1.5, HULL_L, s * 1.55, 1.5, z);
      box(0.85, 0.12, 0.5, HULL_L, s * 1.55, 1.42, z + 0.95, { rotation: [-28, 0, 0] });
      box(0.85, 0.12, 0.5, HULL_L, s * 1.55, 1.42, z - 0.95, { rotation: [28, 0, 0] });
      box(0.08, 0.28, 1.9, HULL_D, s * 1.95, 1.5, z); // mud flap lip
    }
  }

  // ---------- Cab ----------
  b.extrude(
    [
      [2.9, 1.5],
      [5.0, 1.5],
      [5.0, 2.35],
      [4.7, 2.4],
      [4.3, 3.1],
      [2.9, 3.1],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.6, color: HULL, bevel: 0.05 },
  );
  glow(box(2.2, 0.8, 0.04, GLASS, 0, 2.76, 4.517, { rotation: [-29.7, 0, 0] }), 0.7);
  box(2.2, 0.05, 0.04, DARK, 0, 3.1, 4.3); // wiper line / visor
  box(2.7, 0.08, 0.45, HULL_D, 0, 3.12, 4.22); // roof visor
  for (const s of [1, -1]) {
    glow(box(0.04, 0.5, 0.85, GLASS, s * 1.31, 2.7, 3.7), 0.7);
    box(0.06, 0.58, 0.05, DARK, s * 1.31, 2.7, 3.24);
    box(0.06, 0.58, 0.05, DARK, s * 1.31, 2.7, 4.16);
    box(0.05, 0.12, 0.3, STEEL, s * 1.32, 2.0, 3.2); // door handle
    box(0.05, 0.9, 1.4, HULL_D, s * 1.31, 2.1, 3.6); // door recess
    // emblem
    cyl(0.22, 0.03, WHITE, s * 1.34, 2.15, 3.95, "x", 10);
    cyl(0.14, 0.04, RED, s * 1.34, 2.15, 3.95, "x", 10);
    // mirrors
    box(0.08, 0.35, 0.22, DARK, s * 1.55, 2.7, 4.35);
    box(0.3, 0.05, 0.05, DARK, s * 1.43, 2.8, 4.35);
    // headlights
    glow(box(0.5, 0.2, 0.06, LAMP, s * 0.95, 2.0, 5.01), 1.4);
    box(0.6, 0.28, 0.04, DARK, s * 0.95, 2.0, 5.0);
    // armour cheeks
    box(0.35, 0.75, 0.12, HULL_D, s * 1.2, 1.9, 5.04, { rotation: [0, s * 18, 0] });
    // exhaust stacks
    cyl(0.1, 1.9, STEEL_D, s * 1.15, 2.65, 2.65, "y", 8);
    cyl(0.13, 0.12, DARK, s * 1.15, 3.62, 2.65, "y", 8);
    // tail lights
    glow(box(0.45, 0.18, 0.05, RED, s * 1.05, 1.8, -5.03), 1.2);
  }
  // grille
  box(1.3, 0.55, 0.05, DARK, 0, 1.85, 5.02);
  for (let i = 0; i < 4; i++) box(1.2, 0.04, 0.07, STEEL_D, 0, 1.68 + i * 0.12, 5.03);
  // bumper with hazard stripes
  box(2.9, 0.3, 0.3, DARK, 0, 1.58, 5.08);
  for (let i = -5; i <= 5; i++) box(0.14, 0.26, 0.32, i % 2 ? YELLOW : BLACK, i * 0.26, 1.58, 5.08);
  cyl(0.06, 0.25, STEEL, 0, 1.4, 5.25, "z", 6); // tow hook
  // roof gear
  cyl(0.05, 0.6, STEEL_D, 0.8, 3.4, 3.2, "y", 6);
  cyl(0.32, 0.1, GUN, 0.8, 3.75, 3.3, "y", 10, { rotation: [-30, 0, 0] });
  P(new THREE.SphereGeometry(0.07, 6, 4), RED, [0.8, 3.76, 3.4]);
  cyl(0.02, 1.2, STEEL, -0.9, 3.7, 2.95, "y", 5); // whip antenna
  box(1.5, 0.1, 0.22, DARK, -0.1, 3.2, 3.9);
  glow(box(0.35, 0.09, 0.2, ORANGE, -0.7, 3.27, 3.9), 1.4);
  glow(box(0.35, 0.09, 0.2, ORANGE, 0.5, 3.27, 3.9), 1.4);

  // ---------- Deck gear ----------
  for (const s of [1, -1]) {
    box(0.5, 0.6, 1.5, HULL_D, s * 1.2, 2.05, 1.7);
    box(0.52, 0.08, 1.52, HULL_L, s * 1.2, 2.38, 1.7);
    box(0.04, 0.4, 0.5, STEEL_D, s * 1.47, 2.05, 1.7); // locker hatch
    cyl(0.03, 0.2, STEEL, s * 1.5, 2.05, 1.5, "y", 5);
  }
  // rear generator module
  box(2.5, 0.95, 1.7, HULL, 0, 2.18, -3.9);
  box(2.55, 0.12, 1.75, HULL_L, 0, 2.7, -3.9);
  for (let i = 0; i < 5; i++) box(1.7, 0.04, 0.08, DARK, 0, 2.77, -3.35 - i * 0.28);
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) box(0.05, 0.08, 1.2, DARK, s * 1.27, 2.0 + i * 0.16, -3.9);
    glow(box(0.3, 0.3, 0.05, ORANGE, s * 0.7, 2.3, -4.77), 1.2);
  }
  box(2.0, 0.5, 0.06, DARK, 0, 2.2, -4.77);
  box(2.5, 0.25, 0.3, DARK, 0, 1.58, -5.1); // rear bumper
  for (let i = -4; i <= 4; i++) box(0.14, 0.22, 0.32, i % 2 ? YELLOW : BLACK, i * 0.28, 1.58, -5.1);

  // ---------- Turntable & turret ----------
  cyl(1.55, 0.22, STEEL_D, 0, 1.82, -1.0, "y", 16);
  cyl(1.35, 0.1, YELLOW, 0, 1.96, -1.0, "y", 16);
  box(2.6, 0.4, 3.3, HULL, 0, 2.15, -1.0);
  box(2.4, 0.06, 3.1, HULL_L, 0, 2.38, -1.0);
  for (const s of [1, -1]) box(0.05, 0.1, 3.2, WHITE, s * 1.31, 2.15, -1.0);

  const PIV = new THREE.Vector3(0, 3.15, -1.0);
  const EL = (18 * Math.PI) / 180;
  const qB = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -EL);
  const bw = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyQuaternion(qB).add(PIV);
  const bl = (g: THREE.BufferGeometry, c: string, x: number, y: number, z: number) => {
    const w = bw(x, y, z);
    return b.part(g, c, { at: [w.x, w.y, w.z], quat: qB, flat: true } as never);
  };
  const bbox = (sx: number, sy: number, sz: number, c: string, x: number, y: number, z: number) =>
    bl(new THREE.BoxGeometry(sx, sy, sz), c, x, y, z);

  for (const s of [1, -1]) {
    // cheeks
    box(0.25, 1.6, 2.2, HULL, s * 1.0, 2.7, -1.0);
    box(0.27, 0.12, 2.0, HULL_L, s * 1.0, 3.55, -1.0);
    cyl(0.22, 0.5, STEEL, s * 0.7, PIV.y, PIV.z, "x", 10); // trunnion
    cyl(0.1, 0.62, YELLOW, s * 0.7, PIV.y, PIV.z, "x", 8);
    // capacitor banks
    cyl(0.3, 1.9, GUN, s * 1.4, 2.65, -1.5, "z", 10);
    for (const dz of [-0.6, 0, 0.6]) glow(cyl(0.315, 0.1, CYAN, s * 1.4, 2.65, -1.5 + dz, "z", 10), 1.3);
    cyl(0.22, 0.12, STEEL, s * 1.4, 2.65, -0.5, "z", 8);
    // elevation rams
    const a = [s * 0.75, 2.3, -2.2];
    const e = bw(s * 0.55, -0.35, -0.2);
    b.rod(a, [e.x, e.y, e.z], 0.07, STEEL as never);
    const m = [(a[0] + e.x) / 2, (a[1] + e.y) / 2, (a[2] + e.z) / 2];
    b.rod([a[0], a[1], a[2]], m, 0.11, STEEL_D as never);
    // buffers
    const bf = bw(s * 0.55, 0, -1.6);
    bl(new THREE.CylinderGeometry(0.1, 0.1, 0.9, 8).rotateX(Math.PI / 2), STEEL, s * 0.55, 0, -1.55);
    void bf;
  }
  box(1.5, 0.8, 1.2, GUN, 0, 3.0, -2.35); // power conduit cabinet
  glow(box(1.0, 0.1, 0.05, CYAN, 0, 3.2, -2.96), 1.2);

  // breech & rails
  bbox(1.0, 0.8, 2.0, GUN, 0, 0, -0.1);
  bbox(1.04, 0.1, 1.6, STEEL_D, 0, 0.45, -0.1);
  bbox(0.7, 0.5, 0.2, HULL_D, 0, 0, -1.2);
  glow(bbox(0.4, 0.12, 0.06, CYAN, 0, 0.05, -1.32), 1.4);
  for (const s of [1, -1]) bbox(0.24, 0.34, 7.7, STEEL, s * 0.2, 0, 4.65);
  glow(bbox(0.13, 0.06, 7.6, CYAN, 0, 0.02, 4.6), 1.5);
  // coil frames
  for (let i = 0; i < 7; i++) {
    const z = 1.4 + i * 1.0;
    const k = 1 - i * 0.04;
    const w = 0.9 * k;
    const h = 0.74 * k;
    bbox(w, 0.14, 0.3, GUN, 0, h / 2 - 0.05, z);
    bbox(w, 0.14, 0.3, GUN, 0, -h / 2 + 0.05, z);
    for (const s of [1, -1]) {
      bbox(0.14, h, 0.3, GUN, s * (w / 2 - 0.07), 0, z);
      glow(bbox(0.03, h * 0.5, 0.18, CYAN, s * (w / 2 + 0.01), 0, z), 1.4);
    }
    glow(bbox(w * 0.5, 0.03, 0.18, CYAN, 0, h / 2 + 0.03, z), 1.4);
    bbox(w * 0.3, 0.05, 0.08, YELLOW, 0, h / 2 + 0.05, z - 0.19);
  }
  // muzzle
  bbox(0.9, 0.6, 0.55, GUN, 0, 0, 8.55);
  bbox(0.5, 0.3, 0.08, BLACK, 0, 0, 8.84);
  glow(bbox(0.96, 0.05, 0.1, CYAN, 0, 0.33, 8.4), 1.5);
  bbox(0.1, 0.1, 0.4, YELLOW, 0.5, 0, 8.55);
  bbox(0.1, 0.1, 0.4, YELLOW, -0.5, 0, 8.55);
  // barrel top sensor
  bbox(0.16, 0.2, 0.5, DARK, 0, 0.55, 2.2);

  // ---------- Stabiliser legs ----------
  for (const s of [1, -1]) {
    for (const z of [1.95, -4.3]) {
      box(1.6, 0.3, 0.38, HULL_D, s * 1.9, 1.15, z); // beam
      for (let i = 0; i < 5; i++) box(0.12, 0.32, 0.4, i % 2 ? BLACK : YELLOW, s * (1.35 + i * 0.28), 1.15, z);
      b.extrude(
        [
          [0, 0],
          [1.0, 0],
          [0, 0.45],
        ],
        { at: [s * 1.1, 1.3, z], x: [s, 0, 0], thickness: 0.12, color: HULL },
      );
      cyl(0.18, 0.85, STEEL_D, s * 2.5, 0.93, z, "y", 8); // outer cylinder
      cyl(0.2, 0.1, YELLOW, s * 2.5, 1.3, z, "y", 8);
      cyl(0.1, 0.5, STEEL, s * 2.5, 0.4, z, "y", 8); // piston
      P(new THREE.SphereGeometry(0.15, 6, 4), GUN, [s * 2.5, 0.2, z]);
      cyl(0.52, 0.16, GUN, s * 2.5, 0.08, z, "y", 8); // pad
      cyl(0.55, 0.05, YELLOW, s * 2.5, 0.12, z, "y", 8);
      cyl(0.4, 0.08, GUN, s * 2.5, 0.12, z, "y", 8, { rotation: [0, 22, 0] });
      glow(box(0.14, 0.06, 0.14, ORANGE, s * 2.5, 1.5, z), 1.3); // status lamp
    }
  }

  // ---------- Hull markings ----------
  for (const s of [1, -1]) {
    box(0.04, 0.16, 0.7, WHITE, s * 1.46, 1.35, -3.5);
    box(0.04, 0.16, 0.3, RED, s * 1.46, 1.35, -2.9);
  }
  box(0.7, 0.04, 0.18, WHITE, 0, 2.43, -0.2);

  return b.root;
}
