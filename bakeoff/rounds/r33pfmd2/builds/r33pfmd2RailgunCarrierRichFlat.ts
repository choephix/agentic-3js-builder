import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Railgun Carrier RG-6",
  description:
    "Six-wheeled railgun carrier with a long coil-ringed rail barrel, capacitor bank, cab, and four deployed hydraulic stabiliser legs. Low-poly sci-fi military.",
};

const OLIVE = "#56653f";
const OLIVE_D = "#3b4630";
const OLIVE_L = "#6f7f50";
const TAN = "#8c8465";
const GUN = "#2b3037";
const GUN_L = "#444c57";
const DARK = "#14171b";
const STEEL = "#7d8793";
const CHROME = "#b9c4cf";
const RUBBER = "#1c1c1f";
const HAZ = "#e2b21c";
const RED = "#b8352b";
const CYAN = "#48e8ff";
const GLASS = "#1d4a5c";
const WHITE = "#e8e8e0";
const LAMP = "#fff3b0";

export default function build() {
  const b = createBuilder({ name: "railgun_carrier" });

  type Rot = [number, number, number];
  const B = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, rot?: Rot) => {
    const o: any = { at: [x, y, z], flat: true };
    if (rot) o.rotation = rot;
    return b.part(new THREE.BoxGeometry(w, h, d), color, o);
  };
  // cylinder: axis along "x" | "y" | "z"
  const C = (
    rt: number,
    rb: number,
    h: number,
    seg: number,
    color: string,
    x: number,
    y: number,
    z: number,
    axis: "x" | "y" | "z" = "y",
  ) => {
    const o: any = { at: [x, y, z], flat: true };
    if (axis === "x") o.rotation = [0, 0, 90];
    if (axis === "z") o.rotation = [90, 0, 0];
    return b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, o);
  };

  // ---------------- chassis ----------------
  B(2.9, 0.9, 10.6, OLIVE, 0, 1.3, 0); // main hull
  B(2.5, 0.3, 10.4, DARK, 0, 0.8, 0); // underbelly
  for (const s of [1, -1]) {
    B(0.14, 0.7, 10.2, OLIVE_D, s * 1.5, 1.3, 0); // side armour
    B(0.1, 0.12, 10.0, TAN, s * 1.56, 1.62, 0); // trim
    B(0.1, 0.12, 10.0, TAN, s * 1.56, 0.98, 0);
  }
  // top deck
  B(3.0, 0.14, 10.6, OLIVE_L, 0, 1.82, 0);
  // front glacis wedge and bumper
  B(2.9, 0.8, 0.9, OLIVE, 0, 1.2, 5.5, [-25, 0, 0]);
  B(3.1, 0.3, 0.35, GUN, 0, 0.95, 5.85);
  for (let i = -3; i <= 3; i++) B(0.18, 0.31, 0.37, i % 2 ? HAZ : DARK, i * 0.4, 0.95, 5.86);
  // rear plate and tow hooks
  B(2.9, 0.8, 0.3, OLIVE_D, 0, 1.3, -5.4);
  for (const s of [1, -1]) {
    B(0.3, 0.2, 0.4, STEEL, s * 1.0, 0.95, -5.7);
    glow(B(0.4, 0.14, 0.06, RED, s * 1.1, 1.55, -5.58), 1.2); // tail lamps
  }
  // headlights
  for (const s of [1, -1]) {
    glow(B(0.4, 0.2, 0.08, LAMP, s * 1.0, 1.45, 5.7, [-25, 0, 0]), 1.4);
    B(0.5, 0.28, 0.05, DARK, s * 1.0, 1.45, 5.66, [-25, 0, 0]);
  }

  // ---------------- cab ----------------
  B(2.6, 1.15, 2.5, OLIVE, 0, 2.4, 4.15);
  B(2.8, 0.14, 2.7, OLIVE_D, 0, 3.0, 4.15); // roof
  B(2.7, 0.1, 0.2, GUN, 0, 3.1, 5.4);
  glow(B(2.2, 0.55, 0.08, GLASS, 0, 2.55, 5.43, [-12, 0, 0]), 0.5);
  B(0.08, 0.6, 0.1, DARK, 0, 2.55, 5.46, [-12, 0, 0]);
  for (const s of [1, -1]) {
    glow(B(0.06, 0.45, 1.0, GLASS, s * 1.32, 2.5, 4.5), 0.4);
    B(0.1, 0.12, 1.3, GUN, s * 1.33, 2.2, 4.5);
    B(0.12, 0.7, 0.9, OLIVE_D, s * 1.33, 2.4, 3.4); // side armour box
    B(0.3, 0.12, 0.6, GUN, s * 1.0, 3.12, 3.6); // roof sensors
    // mirror
    B(0.08, 0.35, 0.2, DARK, s * 1.55, 2.55, 5.0);
  }
  // roof light bar
  B(1.4, 0.12, 0.25, GUN, 0, 3.14, 3.3);
  glow(B(0.3, 0.1, 0.2, RED, -0.4, 3.22, 3.3), 1.3);
  glow(B(0.3, 0.1, 0.2, CYAN, 0.4, 3.22, 3.3), 1.3);
  // gun saddle on cab roof
  B(1.5, 0.3, 0.8, GUN_L, 0, 3.3, 4.2);
  for (const s of [1, -1]) B(0.22, 0.5, 0.8, GUN, s * 0.62, 3.55, 4.2);

  // ---------------- generator and capacitor bank ----------------
  B(2.3, 0.75, 2.4, OLIVE_D, 0, 2.25, 1.5);
  for (let i = 0; i < 5; i++) B(1.6, 0.05, 0.12, DARK, 0, 2.35 + (i % 2) * 0.0, 0.7 + i * 0.4); // vent slats
  for (let i = 0; i < 5; i++) B(2.34, 0.05, 0.08, GUN, 0, 2.5, 0.5 + i * 0.5);
  for (const s of [1, -1]) {
    C(0.12, 0.12, 0.9, 6, STEEL, s * 0.9, 2.95, 2.3); // exhaust stacks
    C(0.16, 0.12, 0.1, 6, DARK, s * 0.9, 3.43, 2.3);
    B(0.1, 0.5, 1.8, GUN, s * 1.16, 2.25, 1.5); // side panel
  }
  // radar mast and dish
  C(0.05, 0.05, 0.9, 6, GUN, 0, 3.1, 0.7);
  b.part(new THREE.SphereGeometry(0.4, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2.2), STEEL, {
    at: [0, 3.6, 0.7],
    rotation: [25, 0, 0],
    flat: true,
  });
  C(0.03, 0.03, 0.35, 5, CHROME, 0, 3.8, 0.85, "y");

  // capacitor cans
  for (const x of [-0.85, 0, 0.85])
    for (const z of [-4.8, -3.9]) {
      C(0.36, 0.36, 1.2, 8, GUN_L, x, 2.5, z);
      C(0.38, 0.38, 0.1, 8, HAZ, x, 2.0, z);
      glow(C(0.39, 0.39, 0.1, 8, CYAN, x, 2.75, z), 1.4);
      C(0.2, 0.2, 0.12, 8, STEEL, x, 3.15, z);
    }
  // bus bars to breech
  for (const x of [-0.85, 0, 0.85]) B(0.12, 0.12, 1.2, DARK, x, 3.0, -3.3);
  B(2.6, 0.12, 0.2, DARK, 0, 3.12, -3.2);

  // ---------------- railgun ----------------
  const GY = 3.75;
  // cradle and cheeks
  B(1.7, 1.0, 3.2, GUN, 0, GY - 0.1, -1.5);
  B(1.8, 0.14, 3.3, GUN_L, 0, GY + 0.45, -1.5);
  for (const s of [1, -1]) {
    B(0.3, 1.45, 1.6, OLIVE, s * 1.05, 2.55, -1.5); // cheeks
    C(0.28, 0.28, 0.4, 8, STEEL, s * 0.92, GY - 0.1, -1.5, "x"); // trunnions
    B(0.35, 0.18, 1.8, HAZ, s * 1.05, 3.32, -1.5);
  }
  // breech
  B(1.2, 0.9, 0.9, GUN_L, 0, GY, -3.3);
  B(0.9, 0.6, 0.15, DARK, 0, GY, -3.8);
  glow(B(0.5, 0.1, 0.02, CYAN, 0, GY + 0.1, -3.89), 1.3);
  // rails
  for (const s of [1, -1]) {
    B(0.24, 0.3, 11.0, GUN_L, s * 0.3, GY, 3.0);
    B(0.06, 0.08, 11.0, STEEL, s * 0.3, GY + 0.19, 3.0); // top highlight
  }
  glow(B(0.32, 0.14, 11.0, CYAN, 0, GY, 3.0), 1.2);
  // brackets
  for (let i = 0; i < 9; i++) {
    const z = 0.9 + i * 1.0;
    B(1.0, 0.1, 0.16, GUN, 0, GY + 0.22, z);
    B(1.0, 0.1, 0.16, GUN, 0, GY - 0.22, z);
    for (const s of [1, -1]) B(0.1, 0.5, 0.16, GUN, s * 0.5, GY, z);
  }
  // coil rings
  for (let i = 0; i < 6; i++)
    glow(
      b.part(new THREE.TorusGeometry(0.58, 0.07, 5, 10), CYAN, { at: [0, GY, -0.6 + i * 0.4], flat: true }),
      1.2,
    );
  for (let i = 0; i < 4; i++) {
    b.part(new THREE.TorusGeometry(0.6, 0.09, 5, 10), GUN_L, { at: [0, GY, 4.4 + i * 0.7], flat: true });
  }
  // muzzle
  B(1.1, 0.55, 0.7, GUN, 0, GY, 8.7);
  B(1.14, 0.1, 0.2, HAZ, 0, GY + 0.3, 8.7);
  B(1.14, 0.1, 0.2, HAZ, 0, GY - 0.3, 8.7);
  glow(B(0.34, 0.16, 0.05, CYAN, 0, GY, 9.06), 1.6);
  // front support strut from cab saddle
  B(0.5, 0.3, 0.5, GUN_L, 0, GY - 0.45, 4.2);

  // ---------------- wheels ----------------
  const WZ = [-3.7, 0, 3.7];
  for (const s of [1, -1])
    for (const wz of WZ) {
      const wx = s * 1.9;
      C(0.6, 0.6, 0.62, 12, RUBBER, wx, 0.67, wz, "x");
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2 + 0.26;
        B(0.62, 0.1, 0.22, DARK, wx, 0.67 + Math.cos(a) * 0.62, wz + Math.sin(a) * 0.62, [(a * 180) / Math.PI, 0, 0]);
      }
      C(0.34, 0.34, 0.68, 8, STEEL, wx, 0.67, wz, "x");
      C(0.2, 0.2, 0.74, 8, OLIVE_D, wx, 0.67, wz, "x");
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        B(0.06, 0.07, 0.07, CHROME, s * 2.24, 0.67 + Math.cos(a) * 0.26, wz + Math.sin(a) * 0.26);
      }
      // fender
      B(0.85, 0.1, 1.7, OLIVE, wx, 1.37, wz);
      B(0.85, 0.35, 0.1, OLIVE_D, wx, 1.22, wz + 0.8, [20, 0, 0]);
      B(0.85, 0.35, 0.1, OLIVE_D, wx, 1.22, wz - 0.8, [-20, 0, 0]);
      // mud flap
      B(0.7, 0.4, 0.05, RUBBER, wx, 0.55, wz - 0.9);
      // suspension arm
      B(0.2, 0.2, 0.2, GUN, s * 1.55, 0.9, wz);
    }
  for (const wz of WZ) {
    B(3.4, 0.24, 0.24, GUN, 0, 0.67, wz); // axles
    C(0.3, 0.3, 0.6, 8, GUN_L, 0, 0.67, wz, "z"); // differentials
  }
  B(0.3, 0.2, 7.2, GUN, 0, 0.7, 0); // driveshaft

  // ---------------- stabiliser legs ----------------
  for (const s of [1, -1])
    for (const lz of [-1.8, 1.8]) {
      B(0.6, 0.7, 0.9, GUN, s * 1.65, 1.3, lz); // mount
      B(1.9, 0.4, 0.5, OLIVE, s * 2.5, 1.3, lz); // beam
      for (let i = 0; i < 4; i++) B(0.22, 0.03, 0.52, i % 2 ? DARK : HAZ, s * (2.0 + i * 0.4), 1.51, lz);
      C(0.34, 0.34, 0.62, 8, GUN_L, s * 3.4, 1.3, lz); // knuckle
      C(0.22, 0.22, 0.8, 8, STEEL, s * 3.4, 0.82, lz); // outer piston
      C(0.14, 0.14, 0.75, 8, CHROME, s * 3.4, 0.4, lz); // inner ram
      C(0.6, 0.66, 0.18, 8, GUN, s * 3.4, 0.09, lz); // foot pad
      C(0.26, 0.26, 0.22, 8, HAZ, s * 3.4, 0.28, lz);
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
        B(0.12, 0.2, 0.12, DARK, s * 3.4 + Math.cos(a) * 0.55, 0.12, lz + Math.sin(a) * 0.55);
      }
      b.rod([s * 1.75, 0.95, lz], [s * 3.3, 0.55, lz], 0.07, STEEL);
      glow(B(0.12, 0.1, 0.12, RED, s * 3.4, 1.55, lz), 1.2); // beacon
    }

  // ---------------- details ----------------
  // ladder at the rear side
  for (let i = 0; i < 5; i++) B(0.05, 0.05, 0.4, STEEL, 1.55, 1.1 + i * 0.16, -4.9);
  // markings
  for (const s of [1, -1]) {
    B(0.04, 0.4, 0.4, WHITE, s * 1.58, 1.35, 0.2);
    B(0.05, 0.14, 0.3, RED, s * 1.6, 1.35, 0.2);
    B(0.04, 0.24, 1.6, HAZ, s * 1.58, 1.35, 4.9);
    for (let i = 0; i < 3; i++) B(0.045, 0.3, 0.1, DARK, s * 1.59, 1.35, 4.5 + i * 0.35, [0, 0, 0]);
    // toolbox on the hull side
    B(0.25, 0.4, 1.0, GUN_L, s * 1.7, 1.45, -3.0);
  }
  // roof hatch on the deck
  B(0.8, 0.1, 0.8, GUN, 0.2, 1.93, -2.0);
  // antennas
  for (const [x, z, h] of [[-1.2, 3.2, 1.8], [1.2, 2.9, 1.3]] as number[][]) {
    C(0.025, 0.012, h, 5, GUN, x, 3.1 + h / 2, z);
    glow(B(0.06, 0.06, 0.06, RED, x, 3.1 + h, z), 1.4);
  }

  return b.root;
}
