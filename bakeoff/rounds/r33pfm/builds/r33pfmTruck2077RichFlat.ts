import * as THREE from "three";
import { createBuilder, patches } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Warhauler 2077",
  description: "Low-poly cyberpunk armored 8x8 military truck with neon trim, roof turret, missile pods and a drone deck.",
};

// palette
const HULL = "#2b303a";
const HULL_L = "#3d4553";
const OLIVE = "#3a4435";
const OLIVE_D = "#262d24";
const BLACK = "#101218";
const STEEL = "#6b7482";
const STEEL_D = "#464d5a";
const MAG = "#ff2e88";
const CYAN = "#19e6ff";
const YEL = "#ffc400";
const RED = "#ff2a2a";
const WHITE = "#e8f6ff";
const GLASS = "#0a2a3a";
const ORANGE = "#ff7a1a";

export default function build() {
  const b = createBuilder({ name: "warhauler2077" });

  type Rot = [number, number, number];
  const box = (c: string, w: number, h: number, d: number, x: number, y: number, z: number, rot?: Rot, g = 0) => {
    const p = b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: rot, flat: true });
    if (g) glow(p, g);
    return p;
  };
  const cyl = (c: string, rt: number, rb: number, h: number, seg: number, x: number, y: number, z: number, rot?: Rot, g = 0) => {
    const p = b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z], rotation: rot, flat: true });
    if (g) glow(p, g);
    return p;
  };
  const ball = (c: string, r: number, x: number, y: number, z: number, g = 0, sc?: [number, number, number]) => {
    const p = b.part(new THREE.SphereGeometry(r, 8, 6), c, { at: [x, y, z], scale: sc, flat: true });
    if (g) glow(p, g);
    return p;
  };
  const AX: Rot = [0, 0, 90]; // cylinder along X
  const AZ: Rot = [90, 0, 0]; // cylinder along Z

  // ---------- chassis ----------
  for (const s of [1, -1]) {
    box(BLACK, 0.22, 0.3, 7.6, s * 0.85, 0.85, -0.2);
    box(STEEL_D, 0.06, 0.2, 7.4, s * 0.97, 0.85, -0.2);
  }
  for (let i = 0; i < 9; i++) box(STEEL_D, 1.9, 0.14, 0.18, 0, 0.82, -3.7 + i * 0.9);
  // drive shaft + diffs
  cyl(STEEL, 0.07, 0.07, 6.8, 6, 0, 0.7, -0.3, AZ);

  // ---------- wheels ----------
  const axles = [2.75, 1.45, -2.0, -3.3];
  const WR = 0.7;
  axles.forEach((az, ai) => {
    cyl(STEEL_D, 0.09, 0.09, 3.0, 6, 0, WR, az, AX); // axle
    box(BLACK, 1.0, 0.3, 0.4, 0, 0.9, az); // diff housing
    for (const s of [1, -1]) {
      const cx = s * 1.5;
      cyl(BLACK, WR, WR, 0.56, 14, cx, WR, az, AX);
      cyl(STEEL, 0.44, 0.44, 0.6, 12, cx, WR, az, AX);
      cyl(HULL, 0.36, 0.36, 0.64, 12, cx, WR, az, AX);
      cyl(CYAN, 0.13, 0.13, 0.67, 8, cx, WR, az, AX, 1.4);
      for (let k = 0; k < 14; k++) {
        const a = (k / 14) * Math.PI * 2;
        box(HULL_L, 0.58, 0.08, 0.2, cx, WR + Math.cos(a) * 0.7, az + Math.sin(a) * 0.7, [(a * 180) / Math.PI, 0, 0]);
      }
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        cyl(STEEL, 0.04, 0.04, 0.05, 6, s * 1.8, WR + Math.cos(a) * 0.26, az + Math.sin(a) * 0.26, AX);
      }
      // fender
      box(OLIVE, 0.78, 0.12, 1.7, cx, 1.5, az);
      box(OLIVE_D, 0.8, 0.3, 0.08, cx, 1.38, az + 0.85);
      box(OLIVE_D, 0.8, 0.3, 0.08, cx, 1.38, az - 0.85);
      box(ORANGE, 0.5, 0.03, 0.12, cx, 1.58, az, undefined, 0.8); // fender light strip
      if (ai < 2) box(YEL, 0.2, 0.03, 0.2, cx, 1.58, az + 0.55);
    }
  });

  // ---------- lower hull / cab ----------
  box(HULL, 2.5, 0.9, 2.5, 0, 1.3, 2.5);
  box(HULL_L, 2.4, 0.08, 2.4, 0, 1.78, 2.5);
  // hood (sloping)
  box(OLIVE, 2.4, 0.5, 1.3, 0, 1.98, 3.15, [8, 0, 0]);
  box(OLIVE_D, 0.8, 0.1, 1.0, 0, 2.27, 3.15, [8, 0, 0]);
  // cab
  box(OLIVE, 2.4, 1.0, 1.5, 0, 2.3, 1.9);
  box(OLIVE_D, 2.46, 0.12, 1.56, 0, 2.86, 1.9);
  // windshield + side windows
  box(GLASS, 2.1, 0.75, 0.06, 0, 2.42, 2.66, [-22, 0, 0]);
  glow(box(CYAN, 2.1, 0.03, 0.06, 0, 2.8, 2.58, [-22, 0, 0]), 0.9);
  for (const s of [1, -1]) {
    box(GLASS, 0.05, 0.5, 0.9, s * 1.22, 2.45, 2.15);
    box(BLACK, 0.07, 0.04, 1.0, s * 1.22, 2.72, 2.15);
    box(STEEL_D, 0.1, 0.1, 0.3, s * 1.26, 2.1, 2.55); // door handle zone
    box(HULL_L, 0.08, 0.7, 0.04, s * 1.23, 2.2, 1.5); // door seam
    // armor skirts with neon
    box(OLIVE_D, 0.12, 0.5, 1.5, s * 1.3, 1.2, 0.0, undefined);
    box(OLIVE_D, 0.12, 0.5, 1.7, s * 1.3, 1.2, -2.65);
    box(OLIVE_D, 0.12, 0.5, 1.3, s * 1.3, 1.2, 2.1 - 0.25 * 0);
    glow(box(CYAN, 0.04, 0.05, 1.3, s * 1.37, 1.0, 2.1), 1.3);
    glow(box(CYAN, 0.04, 0.05, 1.5, s * 1.37, 1.0, 0.0), 1.3);
    glow(box(MAG, 0.04, 0.05, 1.7, s * 1.37, 1.0, -2.65), 1.3);
    // side mirrors
    box(STEEL_D, 0.4, 0.04, 0.04, s * 1.4, 2.5, 2.6);
    box(BLACK, 0.06, 0.4, 0.22, s * 1.62, 2.5, 2.6);
    glow(box(CYAN, 0.02, 0.3, 0.16, s * 1.66, 2.5, 2.6), 0.8);
    // front armor wings
    box(OLIVE, 0.14, 0.7, 2.3, s * 1.3, 1.4, 2.5);
    box(YEL, 0.15, 0.08, 0.5, s * 1.3, 1.25, 3.4, [0, 0, 0]);
    // headlights
    glow(box(WHITE, 0.45, 0.1, 0.06, s * 0.85, 1.65, 3.78), 2);
    glow(box(CYAN, 0.2, 0.05, 0.06, s * 0.85, 1.55, 3.78), 1.5);
    // exhaust stacks behind cab
    cyl(STEEL_D, 0.12, 0.12, 2.1, 8, s * 1.15, 3.0, 1.1);
    cyl(BLACK, 0.14, 0.14, 0.12, 8, s * 1.15, 4.05, 1.1);
    cyl(ORANGE, 0.08, 0.08, 0.1, 8, s * 1.15, 4.1, 1.1, undefined, 1.2);
    for (let k = 0; k < 3; k++) cyl(STEEL, 0.15, 0.15, 0.05, 8, s * 1.15, 2.2 + k * 0.5, 1.1);
    // fuel tanks between axles
    cyl(STEEL, 0.28, 0.28, 1.0, 10, s * 1.2, 0.95, 0.35, AZ);
    cyl(YEL, 0.29, 0.29, 0.08, 10, s * 1.2, 0.95, 0.15, AZ);
    cyl(YEL, 0.29, 0.29, 0.08, 10, s * 1.2, 0.95, 0.55, AZ);
    // missile pods on cargo flanks
    box(HULL, 0.5, 0.8, 1.6, s * 1.6, 2.7, -1.0);
    box(BLACK, 0.52, 0.82, 0.05, s * 1.6, 2.7, -0.2);
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 3; j++) {
        cyl(BLACK, 0.1, 0.1, 0.06, 8, s * 1.6 - (i - 0.5) * 0.22, 2.45 + j * 0.25, -0.2 + 0.0, AZ);
        cyl(RED, 0.065, 0.065, 0.07, 8, s * 1.6 - (i - 0.5) * 0.22, 2.45 + j * 0.25, -0.19, AZ, 1.2);
      }
    box(YEL, 0.52, 0.06, 0.3, s * 1.6, 3.12, -1.5);
    box(STEEL_D, 0.3, 0.6, 0.2, s * 1.45, 2.2, -1.0); // pod mount
  }

  // ---------- front end ----------
  box(BLACK, 2.6, 0.55, 0.3, 0, 1.0, 3.75); // bumper
  box(STEEL_D, 2.8, 0.25, 0.3, 0, 0.82, 3.95, [-12, 0, 0]);
  // plow blade
  box(OLIVE_D, 3.0, 0.5, 0.2, 0, 0.8, 4.15, [-25, 0, 0]);
  for (let i = 0; i < 7; i++) box(i % 2 ? YEL : BLACK, 0.2, 0.5, 0.05, -1.2 + i * 0.4, 0.8, 4.27, [-25, 0, 0]);
  // grille
  box(BLACK, 1.5, 0.7, 0.1, 0, 1.45, 3.76);
  for (let i = 0; i < 6; i++) glow(box(MAG, 1.4, 0.04, 0.06, 0, 1.2 + i * 0.1, 3.82), 1.4);
  // winch
  cyl(STEEL, 0.1, 0.1, 0.6, 8, 0, 0.95, 3.7, AX);
  box(YEL, 0.1, 0.1, 0.15, 0, 0.95, 3.9);
  // fog/aux lights on roof
  box(BLACK, 2.2, 0.14, 0.2, 0, 2.97, 2.5);
  for (let i = 0; i < 5; i++) glow(box(WHITE, 0.3, 0.08, 0.06, -0.8 + i * 0.4, 2.97, 2.62), 2);

  // ---------- cab roof gear ----------
  box(HULL_L, 1.0, 0.12, 0.9, 0, 3.0, 1.6);
  cyl(STEEL, 0.03, 0.03, 1.2, 5, -0.9, 3.5, 1.3); // antenna
  cyl(STEEL, 0.03, 0.03, 0.9, 5, 0.9, 3.4, 1.5);
  ball(RED, 0.05, -0.9, 4.12, 1.3, 2);
  ball(CYAN, 0.05, 0.9, 3.87, 1.5, 2);
  // radar dish
  cyl(STEEL_D, 0.05, 0.05, 0.35, 6, 0, 3.2, 1.6);
  cyl(STEEL, 0.4, 0.05, 0.1, 10, 0, 3.45, 1.6, [30, 0, 0]);
  cyl(CYAN, 0.04, 0.04, 0.3, 5, 0, 3.55, 1.7, [30, 0, 0], 1.3);
  // sensor dome
  ball(CYAN, 0.2, 0.7, 3.1, 1.8, 0.9, [1, 0.7, 1]);

  // ---------- cargo module ----------
  const CAM = patches(OLIVE, OLIVE_D, { size: 0.5, gap: 0.0 });
  b.part(new THREE.BoxGeometry(2.8, 1.6, 4.9), CAM, { at: [0, 2.4, -2.55], flat: true });
  box(HULL, 2.9, 0.18, 5.0, 0, 1.55, -2.55); // base plate
  box(HULL, 2.9, 0.12, 5.0, 0, 3.22, -2.55); // roof plate
  for (let i = 0; i < 8; i++) {
    const z = -4.7 + i * 0.66;
    box(HULL_L, 2.88, 1.7, 0.1, 0, 2.4, z);
    for (const s of [1, -1]) {
      glow(box(i % 2 ? CYAN : MAG, 0.04, 0.08, 0.2, s * 1.43, 2.0, z + 0.33), 1.5);
    }
  }
  // diagonal hazard stripes on side panels
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++) box(YEL, 0.04, 0.12, 0.55, s * 1.42, 2.95, -4.5 + i * 0.8, [-35, 0, 0]);
  // emblem on sides: chevron
  for (const s of [1, -1]) {
    glow(box(MAG, 0.05, 0.1, 0.9, s * 1.43, 2.55, -2.4, [40, 0, 0]), 1.2);
    glow(box(MAG, 0.05, 0.1, 0.9, s * 1.43, 2.55, -2.4, [-40, 0, 0]), 1.2);
    box(WHITE, 0.05, 0.12, 0.12, s * 1.43, 2.8, -2.4);
    // vent grilles
    for (let k = 0; k < 4; k++) box(BLACK, 0.05, 0.05, 0.7, s * 1.42, 1.85 + k * 0.08, -3.9);
  }
  // roof rails & crates
  for (const s of [1, -1]) cyl(STEEL, 0.03, 0.03, 4.6, 6, s * 1.3, 3.4, -2.55, AZ);
  box(OLIVE_D, 0.7, 0.4, 0.8, -0.9, 3.45, -4.3);
  box(YEL, 0.72, 0.05, 0.1, -0.9, 3.45, -4.3);
  box(STEEL_D, 0.6, 0.3, 0.6, 0.9, 3.4, -4.4);
  // drone deck
  cyl(BLACK, 0.55, 0.55, 0.06, 12, 0.7, 3.3, -3.2);
  glow(cyl(CYAN, 0.45, 0.45, 0.02, 12, 0.7, 3.34, -3.2), 1.2);
  box(MAG, 0.5, 0.02, 0.1, 0.7, 3.36, -3.2);
  box(MAG, 0.1, 0.02, 0.5, 0.7, 3.36, -3.2);
  // drone
  box(HULL, 0.2, 0.08, 0.2, 0.7, 3.42, -3.2);
  for (const dx of [-1, 1])
    for (const dz of [-1, 1]) {
      box(STEEL_D, 0.2, 0.02, 0.02, 0.7 + dx * 0.1, 3.44, -3.2 + dz * 0.1, [0, 45 * dx * dz, 0]);
      cyl(CYAN, 0.07, 0.07, 0.01, 8, 0.7 + dx * 0.17, 3.47, -3.2 + dz * 0.17, undefined, 1.2);
    }

  // ---------- turret ----------
  const TY = 3.28, TZ = -0.9;
  cyl(STEEL_D, 0.55, 0.62, 0.2, 12, 0, TY + 0.1, TZ);
  cyl(BLACK, 0.45, 0.5, 0.08, 12, 0, TY + 0.24, TZ);
  box(OLIVE, 0.9, 0.45, 1.0, 0, TY + 0.5, TZ);
  box(HULL_L, 0.7, 0.2, 0.7, 0, TY + 0.82, TZ - 0.05, [0, 0, 0]);
  box(OLIVE_D, 1.0, 0.1, 0.9, 0, TY + 0.66, TZ + 0.05, [0, 0, 0]);
  glow(box(CYAN, 0.4, 0.08, 0.04, 0, TY + 0.62, TZ + 0.52), 1.5); // sensor slit
  ball(RED, 0.06, 0, TY + 0.95, TZ + 0.1, 2);
  for (const s of [1, -1]) {
    box(STEEL_D, 0.2, 0.3, 0.5, s * 0.55, TY + 0.55, TZ + 0.2);
    // twin barrels
    cyl(BLACK, 0.06, 0.06, 1.7, 8, s * 0.55, TY + 0.55, TZ + 1.2, AZ);
    cyl(STEEL, 0.1, 0.1, 0.5, 8, s * 0.55, TY + 0.55, TZ + 0.55, AZ);
    for (let k = 0; k < 3; k++) cyl(STEEL_D, 0.09, 0.09, 0.06, 8, s * 0.55, TY + 0.55, TZ + 1.1 + k * 0.25, AZ);
    cyl(CYAN, 0.04, 0.04, 0.06, 6, s * 0.55, TY + 0.55, TZ + 2.07, AZ, 1.8);
    // ammo box
    box(YEL, 0.22, 0.3, 0.4, s * 0.7, TY + 0.4, TZ - 0.3);
  }
  // rear antennae on turret
  cyl(STEEL, 0.02, 0.02, 0.8, 4, -0.4, TY + 1.1, TZ - 0.4);

  // ---------- rear ----------
  box(BLACK, 2.6, 0.4, 0.3, 0, 1.2, -5.15); // rear bumper
  for (let i = 0; i < 6; i++) box(i % 2 ? YEL : BLACK, 0.22, 0.38, 0.05, -1.1 + i * 0.44, 1.2, -5.32);
  for (const s of [1, -1]) {
    glow(box(RED, 0.5, 0.18, 0.06, s * 1.0, 1.85, -5.03), 2);
    glow(box(RED, 0.5, 0.08, 0.06, s * 1.0, 2.1, -5.03), 1.5);
    box(STEEL_D, 0.1, 1.3, 0.1, s * 0.5, 2.4, -5.03); // door hinges
  }
  box(HULL_L, 0.05, 1.3, 0.06, 0, 2.4, -5.03); // door seam
  glow(box(MAG, 1.2, 0.06, 0.06, 0, 3.05, -5.03), 1.5);
  // rear ladder
  for (let i = 0; i < 5; i++) box(STEEL, 0.5, 0.04, 0.04, 0, 1.6 + i * 0.35, -5.1);
  box(STEEL_D, 0.04, 1.6, 0.04, -0.25, 2.3, -5.1);
  box(STEEL_D, 0.04, 1.6, 0.04, 0.25, 2.3, -5.1);
  // license plate neon
  glow(box(CYAN, 0.6, 0.18, 0.04, 0, 1.55, -5.06), 1.3);
  box(BLACK, 0.5, 0.1, 0.05, 0, 1.55, -5.08);

  // underglow
  glow(box(MAG, 2.0, 0.04, 6.0, 0, 0.55, -0.2), 1.2);

  return b.root;
}
