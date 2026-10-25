import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Warhound 2077 Militarized Truck",
  "description": "A low-poly cyberpunk armored 6x6 military truck with a wedge cab, neon trim, roof turret and a cargo bed carrying a missile rack and cargo modules."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#3a4150",
  hullDark: "#22262f",
  hullLight: "#5a6475",
  trim: "#e7b814",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2fb8",
  glass: "#0e2a3a",
  tire: "#15161a",
  rim: "#8a93a3",
  steel: "#7b8494",
  rust: "#7a4a2a",
  red: "#d62a2a",
  lightWhite: "#fff6d8",
  olive: "#4a5238",
  black: "#0a0a0d",
};
const M = {
  chassisTop: [0, 1.15, 0] as [number, number, number],
  cabFloor: [0, 1.15, 2.4] as [number, number, number],
  bedFloor: [0, 1.3, -1.8] as [number, number, number],
  turretRing: [0, 2.55, 2.2] as [number, number, number],
  axleFront: [0, 0.62, 2.6] as [number, number, number],
  axleRear1: [0, 0.62, -1.6] as [number, number, number],
  axleRear2: [0, 0.62, -3] as [number, number, number],
  bedFront: [0, 1.3, 0.3] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassis
  (() => {
function buildChassis({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z], ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, at: number[], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at, ...o });
  const SIDE = [1, -1];
  const AX = [2.6, -1.6, -3.0];

  // ladder rails and cross members
  for (const s of SIDE) {
    box(0.16, 0.3, 8.2, P.hullDark, s * 0.6, 0.85, -0.05);
    box(0.04, 0.22, 8.0, P.steel, s * 0.69, 0.85, -0.05);
    // skirts with neon
    box(0.08, 0.34, 4.6, P.hull, s * 1.3, 0.72, -0.1);
    box(0.03, 0.05, 4.4, P.neonCyan, s * 1.35, 0.8, -0.1);
    box(0.03, 0.04, 4.4, P.trim, s * 1.35, 0.62, -0.1);
    // rivets on skirts
    for (let i = 0; i < 12; i++) b.part(new THREE.SphereGeometry(0.025, 5, 4), P.steel, { bone, at: [s * 1.36, 0.7, -2.2 + i * 0.4] });
    // fuel tank
    cyl(0.24, 0.24, 1.3, 8, P.hullLight, [s * 1.0, 0.62, 0.5], { rotation: [90, 0, 0] });
    for (const z of [-0.1, 1.1]) box(0.06, 0.1, 0.5, P.black, s * 1.0, 0.62, 0.5 + (z < 0 ? -0.45 : 0.45)).scale.set(1, 1, 0.1);
    cyl(0.1, 0.1, 0.05, 8, P.red, [s * 1.0, 0.62, 1.17], { rotation: [90, 0, 0] });
    // exhaust stack
    cyl(0.07, 0.07, 1.2, 8, P.steel, [s * 1.0, 1.0, 1.0]);
    cyl(0.09, 0.09, 0.12, 8, P.black, [s * 1.0, 1.62, 1.0]);
    // tow hooks and tow eye
    box(0.1, 0.1, 0.35, P.red, s * 0.45, 0.6, 4.0);
    box(0.28, 0.05, 0.05, P.red, s * 0.45, 0.6, 4.18);
  }
  for (let i = 0; i < 9; i++) {
    const z = -3.8 + i * 0.95;
    box(1.2, 0.14, 0.14, P.hullDark, 0, 0.9, z);
  }

  // axles
  for (const z of AX) {
    cyl(0.07, 0.07, 2.6, 8, P.steel, [0, 0.62, z], { rotation: [0, 0, 90] });
    b.part(new THREE.SphereGeometry(0.26, 8, 6), P.hullDark, { bone, at: [0, 0.62, z] });
    box(0.28, 0.1, 0.3, P.neonCyan, 0, 0.62, z + 0.25).scale.set(1, 0.4, 0.3);
    for (const s of SIDE) {
      // leaf springs
      for (let k = 0; k < 3; k++) box(0.1, 0.03, 1.3 - k * 0.25, P.steel, s * 0.85, 0.78 + k * 0.035, z);
      box(0.14, 0.12, 0.14, P.hullDark, s * 0.85, 0.72, z);
      // mud flaps
      box(0.04, 0.4, 0.5, P.black, s * 1.38, 0.55, z - 0.7);
      box(0.045, 0.04, 0.5, P.neonMagenta, s * 1.38, 0.36, z - 0.7);
    }
  }

  // driveshafts
  cyl(0.05, 0.05, 4.4, 8, P.steel, [0, 0.62, 0.5], { rotation: [90, 0, 0] });
  cyl(0.05, 0.05, 1.4, 8, P.steel, [0, 0.62, -2.3], { rotation: [90, 0, 0] });
  for (const z of [-1.0, 1.9]) cyl(0.09, 0.09, 0.1, 8, P.hullLight, [0, 0.62, z], { rotation: [90, 0, 0] });

  // underbody armor
  box(1.7, 0.08, 2.6, P.hullDark, 0, 0.47, -0.2);
  box(1.7, 0.08, 1.3, P.hullDark, 0, 0.47, -3.4);
  for (let i = 0; i < 5; i++) {
    for (const s of SIDE) {
      box(0.3, 0.02, 0.08, P.trim, s * 0.45, 0.43, -1.1 + i * 0.4, { rotation: [0, s * 35, 0] });
    }
  }
  for (let i = 0; i < 10; i++)
    for (const s of SIDE) b.part(new THREE.SphereGeometry(0.02, 5, 4), P.steel, { bone, at: [s * 0.78, 0.42, -1.5 + i * 0.3] });

  // front bumper and winch
  box(2.5, 0.35, 0.3, P.hullDark, 0, 0.6, 4.0);
  box(2.5, 0.06, 0.32, P.trim, 0, 0.8, 4.0);
  cyl(0.13, 0.13, 0.7, 8, P.steel, [0, 0.6, 4.18], { rotation: [0, 0, 90] });
  cyl(0.15, 0.15, 0.06, 8, P.hullLight, [0.38, 0.6, 4.18], { rotation: [0, 0, 90] });
  cyl(0.15, 0.15, 0.06, 8, P.hullLight, [-0.38, 0.6, 4.18], { rotation: [0, 0, 90] });
  box(0.1, 0.1, 0.1, P.red, 0, 0.6, 4.3);

  // rear tow bar
  box(1.6, 0.18, 0.2, P.hullDark, 0, 0.6, -4.1);
  cyl(0.05, 0.05, 0.4, 8, P.steel, [0, 0.55, -4.25], { rotation: [90, 0, 0] });
  b.part(new THREE.TorusGeometry(0.1, 0.03, 5, 8), P.steel, { bone, at: [0, 0.55, -4.45] });
  for (const s of SIDE) box(0.1, 0.1, 0.04, P.red, s * 0.7, 0.7, -4.27);
}
    return buildChassis;
  })(),
  // wheels
  (() => {
function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.62, W = 0.5;
  const rand = rng(11);
  const wheels: [string, number, number][] = [
    ["wheelFL", 1, M.axleFront[2]],
    ["wheelFR", -1, M.axleFront[2]],
    ["wheelML", 1, M.axleRear1[2]],
    ["wheelMR", -1, M.axleRear1[2]],
    ["wheelBL", 1, M.axleRear2[2]],
    ["wheelBR", -1, M.axleRear2[2]],
  ];
  const cyl = (r: number, h: number, seg = 12) => new THREE.CylinderGeometry(r, r, h, seg);

  for (const [name, s, z] of wheels) {
    const bone = J[name];
    const cx = 1.3 * s;
    const c = new THREE.Vector3(cx, R, z);
    const dir: [number, number, number] = [s, 0, 0];
    const put = (g: THREE.BufferGeometry, col: string, off: number, o: any = {}) =>
      b.part(g, col, { bone, at: [cx + s * off, R, z], dir, ...o });

    // tire
    put(cyl(R, W, 12), P.tire, 0, { flat: true });
    // sidewall shoulders
    put(cyl(R * 0.93, W + 0.04, 12), P.black, 0, { flat: true });
    // tread blocks
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + Math.PI / 12;
      const rr = R + 0.02;
      const y = R + Math.cos(a) * rr;
      const zz = z + Math.sin(a) * rr;
      const blk = b.part(new THREE.BoxGeometry(W * 0.9, 0.07, 0.17), P.black, {
        bone, at: [cx, y, zz], flat: true,
      });
      blk.mesh.rotation.x = -a + 0;
      blk.mesh.rotation.order = "XYZ";
      blk.mesh.rotation.x = Math.atan2(Math.sin(a), Math.cos(a)) * -1 + Math.PI;
      blk.mesh.rotation.x = a;
    }
    // rim disc
    put(cyl(R * 0.62, 0.1, 12), P.rim, s * 0 + W / 2 - 0.02, { flat: true });
    put(cyl(R * 0.5, 0.06, 12), P.steel, W / 2 + 0.03, { flat: true });
    // bolt ring
    const out = W / 2 + 0.07;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      put(cyl(0.028, 0.05, 6), P.hullDark, out, {
        at: [cx + s * out, R + Math.cos(a) * 0.27, z + Math.sin(a) * 0.27],
      });
    }
    // hub cap glowing
    glow(put(cyl(0.16, 0.08, 8), P.neonCyan, out + 0.02, { flat: true }), 1.4);
    put(cyl(0.07, 0.05, 6), P.black, out + 0.06);
    // neon ring on rim
    glow(put(new THREE.TorusGeometry(0.34, 0.016, 4, 16), P.neonCyan, W / 2 + 0.02, {
      axis: "z", dir,
    }), 1.2);
    // brake disc inside
    put(cyl(0.34, 0.04, 12), P.steel, -W / 2 + 0.06, { flat: true });
    // caliper
    b.part(new THREE.BoxGeometry(0.1, 0.2, 0.24), P.red, {
      bone, at: [cx - s * (W / 2 - 0.06), R + 0.3, z + 0.12], flat: true,
    });
    // axle stub
    put(cyl(0.09, 0.4, 8), P.hullDark, -W / 2 - 0.1);

    // fender arch: top slab and sides
    const fx = cx;
    const fy = R * 2 + 0.08;
    b.part(new THREE.BoxGeometry(W + 0.2, 0.08, R * 2 + 0.3), P.hull, {
      bone: J.body, at: [fx, fy, z], flat: true,
    });
    for (const dz of [-1, 1]) {
      const sl = b.part(new THREE.BoxGeometry(W + 0.2, 0.08, 0.4), P.hull, {
        bone: J.body, at: [fx, R * 1.75, z + dz * (R + 0.05)], flat: true,
      });
      sl.mesh.rotation.x = dz * 0.9;
      b.part(new THREE.BoxGeometry(W + 0.22, 0.04, 0.1), P.trim, {
        bone: J.body, at: [fx, R * 1.45, z + dz * (R + 0.3)], flat: true,
      });
    }
    // trim edge on top
    b.part(new THREE.BoxGeometry(0.05, 0.05, R * 2 + 0.34), P.trim, {
      bone: J.body, at: [fx + s * (W / 2 + 0.1), fy, z], flat: true,
    });
    // magenta underglow
    glow(b.part(new THREE.BoxGeometry(0.05, 0.03, R * 1.6), P.neonMagenta, {
      bone: J.body, at: [fx - s * (W / 2 + 0.02), fy - 0.07, z],
    }), 1.3);
    // rivets on fender
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.SphereGeometry(0.02, 5, 4), P.steel, {
        bone: J.body, at: [fx + s * 0.18, fy + 0.05, z - 0.45 + i * 0.3 + rand() * 0.02],
      });
    }
  }
}
    return buildWheels;
  })(),
  // cab
  (() => {
function buildCab({ b, J, P }: any) {
  const cab = J.cab;
  const body = J.body;
  const R = rng(5);
  const box = (w: number, h: number, d: number, c: string, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: cab, at, flat: true, ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, at: number[], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone: cab, at, flat: true, ...o });
  const sph = (r: number, c: string, at: number[], o: any = {}) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), c, { bone: cab, at, flat: true, ...o });

  // main hull: lower block, wedge upper, hood
  box(2.7, 0.7, 2.9, P.hull, [0, 1.65, 2.7]);
  box(2.5, 0.55, 1.2, P.hullLight, [0, 2.0, 3.55], { rotation: [14, 0, 0] });
  box(2.4, 0.7, 1.4, P.hull, [0, 2.2, 2.2]);
  box(2.45, 0.1, 1.5, P.hullDark, [0, 2.58, 2.1]);
  box(2.2, 0.1, 1.2, P.hullLight, [0, 2.5, 3.1], { rotation: [-22, 0, 0] });
  // underside armour
  box(2.8, 0.2, 3.0, P.hullDark, [0, 1.3, 2.8]);
  // windscreen slit + side windows
  box(2.0, 0.22, 0.05, P.glass, [0, 2.3, 2.93], { rotation: [-22, 0, 0] });
  box(2.1, 0.06, 0.04, P.neonCyan, [0, 2.43, 2.96], { rotation: [-22, 0, 0] });
  for (const s of [1, -1]) {
    box(0.04, 0.3, 0.9, P.glass, [s * 1.23, 2.25, 2.4]);
    box(0.06, 0.1, 1.0, P.hullDark, [s * 1.24, 2.45, 2.4]);
    box(0.06, 0.1, 1.0, P.hullDark, [s * 1.24, 2.05, 2.4]);
    // door seams, handle
    box(0.03, 0.8, 0.03, P.black, [s * 1.36, 1.7, 2.0]);
    box(0.03, 0.8, 0.03, P.black, [s * 1.36, 1.7, 3.0]);
    box(0.05, 0.05, 0.22, P.steel, [s * 1.38, 1.75, 2.8]);
    // hazard stripes on pillars
    for (let i = 0; i < 4; i++)
      box(0.06, 0.1, 0.12, i % 2 ? P.black : P.trim, [s * 1.24, 2.2 + i * 0.1 - 0.15, 1.55], { rotation: [0, 0, 20] });
    // step boards
    box(0.3, 0.06, 1.6, P.steel, [s * 1.5, 1.3, 2.7]);
    box(0.3, 0.02, 1.62, P.trim, [s * 1.5, 1.34, 2.7]);
    // mirrors with cameras
    box(0.05, 0.05, 0.3, P.hullDark, [s * 1.5, 2.2, 3.15]);
    box(0.1, 0.22, 0.14, P.hullDark, [s * 1.6, 2.2, 3.15]);
    sph(0.04, P.red, [s * 1.6, 2.28, 3.24]);
    // emblem decal: yellow and magenta
    box(0.02, 0.3, 0.3, P.trim, [s * 1.37, 1.95, 3.5]);
    box(0.02, 0.14, 0.14, P.neonMagenta, [s * 1.385, 1.95, 3.5], { rotation: [45, 0, 0] });
    // headlights
    box(0.4, 0.18, 0.08, P.lightWhite, [s * 0.95, 1.75, 4.17]);
    box(0.46, 0.04, 0.1, P.black, [s * 0.95, 1.86, 4.17]);
    // marker lights
    sph(0.05, P.red, [s * 1.38, 1.5, 1.3]);
    sph(0.05, P.red, [s * 1.38, 2.5, 1.3]);
    // bumper bolts
    for (let i = 0; i < 3; i++) sph(0.03, P.steel, [s * (0.5 + i * 0.35), 1.45, 4.22]);
    // bull-bar uprights
    box(0.1, 0.7, 0.1, P.hullDark, [s * 1.1, 1.65, 4.35]);
    // hood stripes
    box(0.14, 0.02, 1.0, P.trim, [s * 0.5, 2.1, 3.62], { rotation: [14, 0, 0] });
    // exhaust stack
    // searchlights
  }
  // front grille and light bar
  box(1.4, 0.5, 0.06, P.black, [0, 1.65, 4.17]);
  for (let i = 0; i < 6; i++) box(1.3, 0.03, 0.04, P.steel, [0, 1.45 + i * 0.08, 4.2]);
  box(1.8, 0.08, 0.1, P.neonCyan, [0, 2.0, 4.17]);
  // bumper + winch
  box(2.9, 0.3, 0.3, P.hullDark, [0, 1.35, 4.3]);
  box(2.9, 0.05, 0.32, P.trim, [0, 1.52, 4.3]);
  cyl(0.1, 0.1, 0.6, 8, P.steel, [0, 1.35, 4.5], { rotation: [0, 0, 90] });
  box(0.25, 0.04, 0.1, P.red, [0, 1.35, 4.62]);
  // bull bar rails
  box(2.4, 0.1, 0.1, P.hullDark, [0, 1.95, 4.38]);
  box(2.4, 0.1, 0.1, P.hullDark, [0, 1.4, 4.38]);
  box(0.1, 0.6, 0.1, P.hullDark, [0, 1.7, 4.38]);
  // roof armor, turret ring seat
  box(2.2, 0.12, 1.2, P.hullLight, [0, 2.66, 2.0]);
  cyl(0.5, 0.55, 0.08, 12, P.hullDark, [0, 2.7, 2.2]);
  cyl(0.52, 0.52, 0.02, 12, P.neonMagenta, [0, 2.74, 2.2]);
  // sensor domes + searchlight + antennas
  sph(0.12, P.glass, [0.8, 2.72, 1.6]);
  sph(0.08, P.red, [-0.8, 2.72, 1.6]);
  box(0.25, 0.18, 0.3, P.hullDark, [-0.7, 2.76, 2.5]);
  cyl(0.09, 0.07, 0.12, 8, P.lightWhite, [-0.7, 2.78, 2.66], { rotation: [90, 0, 0] });
  for (const s of [1, -1]) {
    cyl(0.01, 0.015, 1.0 + (s > 0 ? 0.3 : 0), 5, P.black, [s * 1.0, 3.15, 1.4]);
    sph(0.025, P.neonMagenta, [s * 1.0, 3.7 + (s > 0 ? 0.0 : -0.3), 1.4]);
  }
  // exhaust stack beside cab (rear left)
  cyl(0.09, 0.09, 1.4, 8, P.steel, [1.3, 2.3, 1.35]);
  cyl(0.11, 0.11, 0.12, 8, P.black, [1.3, 3.02, 1.35]);
  for (let i = 0; i < 3; i++) cyl(0.115, 0.115, 0.04, 8, P.trim, [1.3, 1.8 + i * 0.35, 1.35]);
  // back wall
  box(2.6, 1.0, 0.1, P.hullDark, [0, 1.95, 1.25]);
  // interior: seats, dash glow
  for (const s of [1, -1]) {
    box(0.6, 0.1, 0.6, P.red, [s * 0.5, 1.95, 2.3]);
    box(0.6, 0.5, 0.1, P.red, [s * 0.5, 2.2, 1.95]);
  }
  box(2.0, 0.15, 0.3, P.hullDark, [0, 2.1, 3.0]);
  box(1.4, 0.04, 0.2, P.neonCyan, [0, 2.2, 3.0]);
  // rivets along hood and flanks
  for (let i = 0; i < 14; i++) {
    const s = i % 2 ? 1 : -1;
    sph(0.025, P.steel, [s * (0.3 + R() * 0.9), 2.18, 3.9 - R() * 0.1 - (i % 7) * 0.05], { scale: [1, 0.5, 1] });
    sph(0.025, P.steel, [s * 1.36, 1.5 + (i % 5) * 0.08, 1.5 + i * 0.1]);
  }
  // roof vents
  for (let i = 0; i < 4; i++) box(0.5, 0.03, 0.06, P.black, [0.1, 2.74, 1.6 + i * 0.12]);
}
    return buildCab;
  })(),
  // turret
  (() => {
function buildTurret({ b, J, P, M }: Ctx) {
  const R = rng(77);
  const yaw = J.turretYaw;
  const gun = J.gun;
  const cx = M.turretRing[0], cy = M.turretRing[1], cz = M.turretRing[2];
  const GUNM = "#2b303b";
  const box = (w: number, h: number, d: number, col: string, at: number[], bone: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at: [cx + at[0], cy + at[1], cz + at[2]], rotation: rot });
  const cyl = (rt: number, rb: number, h: number, seg: number, col: string, at: number[], bone: any, dir?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), col, { bone, at: [cx + at[0], cy + at[1], cz + at[2]], dir });

  // ring base (static on cab)
  cyl(0.7, 0.75, 0.1, 16, P.hullDark, [0, 0.05, 0], J.cab);
  glow(cyl(0.72, 0.72, 0.03, 16, P.neonMagenta, [0, 0.11, 0], J.cab), 1.5);
  // teeth around ring
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.07, 0.05, 0.06), P.steel, {
      bone: J.cab, at: [cx + Math.sin(a) * 0.73, cy + 0.07, cz + Math.cos(a) * 0.73],
      rotation: [0, (a * 180) / Math.PI, 0],
    });
  }
  // rotating platform
  cyl(0.62, 0.66, 0.1, 12, P.hull, [0, 0.17, 0], yaw);
  // faceted housing
  b.part(new THREE.CylinderGeometry(0.42, 0.55, 0.36, 6), P.hullLight, { bone: yaw, at: [cx, cy + 0.4, cz] });
  b.part(new THREE.CylinderGeometry(0.3, 0.42, 0.14, 6), P.hull, { bone: yaw, at: [cx, cy + 0.65, cz] });
  box(0.5, 0.06, 0.4, P.hullDark, [0, 0.74, -0.05], yaw);
  // hatch
  cyl(0.12, 0.12, 0.04, 8, P.steel, [-0.15, 0.78, -0.1], yaw);
  // side armor plates with yellow stripes
  for (const s of [1, -1]) {
    box(0.08, 0.38, 0.62, P.hull, [s * 0.5, 0.4, 0.05], yaw, [0, 0, s * 10]);
    for (let k = 0; k < 3; k++)
      box(0.02, 0.07, 0.1, P.trim, [s * 0.55, 0.3 + k * 0.1, -0.15 + k * 0.2], yaw, [20, 0, 0]);
    for (let k = 0; k < 4; k++) cyl(0.015, 0.015, 0.02, 6, P.steel, [s * 0.545, 0.55, -0.2 + k * 0.15], yaw, [1, 0, 0]);
    // smoke dischargers
    for (let k = 0; k < 3; k++) {
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 6), P.olive, {
        bone: yaw, at: [cx + s * 0.58, cy + 0.55 + k * 0.001, cz - 0.3 + k * 0.07], dir: [s * 0.6, 0.6, 0.3],
      });
    }
  }
  // front mantlet
  box(0.7, 0.3, 0.2, P.hullLight, [0, 0.42, 0.45], yaw);
  box(0.74, 0.04, 0.22, P.trim, [0, 0.58, 0.45], yaw);
  // sensor pod
  box(0.2, 0.2, 0.26, P.hullDark, [0.38, 0.8, 0.3], yaw);
  glow(b.part(new THREE.SphereGeometry(0.075, 8, 6), P.red, { bone: yaw, at: [cx + 0.38, cy + 0.8, cz + 0.45] }), 2);
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 8), P.black, {
    bone: yaw, at: [cx + 0.38, cy + 0.8, cz + 0.43], dir: [0, 0, 1],
  });
  // antennas
  for (let k = 0; k < 3; k++) {
    const x = -0.3 + k * 0.08;
    const h = 0.3 + R() * 0.2;
    b.part(new THREE.CylinderGeometry(0.008, 0.012, h, 5), P.black, { bone: yaw, at: [cx + x, cy + 0.8 + h / 2, cz - 0.3] });
    glow(b.part(new THREE.SphereGeometry(0.02, 5, 4), P.neonCyan, { bone: yaw, at: [cx + x, cy + 0.82 + h, cz - 0.3] }), 1.5);
  }
  // ammo box + belt feed
  box(0.3, 0.26, 0.36, P.olive, [-0.52, 0.38, -0.1], yaw);
  box(0.32, 0.04, 0.38, P.trim, [-0.52, 0.53, -0.1], yaw);
  for (let k = 0; k < 6; k++)
    b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.06, 6), P.trim, {
      bone: yaw, at: [cx - 0.4 + k * 0.05, cy + 0.42 + k * 0.012, cz + 0.12 + k * 0.05], rotation: [90, 0, 0],
    });

  // guns (gun joint at 2.85, z 2.5)
  for (const s of [1, -1]) {
    const x = s * 0.2;
    const y = 0.45;
    // receiver
    box(0.14, 0.16, 0.5, GUNM, [x, y, 0.55], gun);
    // barrel
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 8), P.black, { bone: gun, at: [cx + x, cy + y, cz + 1.35], dir: [0, 0, 1] });
    // cooling sleeve
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.55, 8), P.steel, { bone: gun, at: [cx + x, cy + y, cz + 1.0], dir: [0, 0, 1] });
    for (let k = 0; k < 5; k++)
      b.part(new THREE.CylinderGeometry(0.068, 0.068, 0.025, 8), P.hullDark, {
        bone: gun, at: [cx + x, cy + y, cz + 0.8 + k * 0.1], dir: [0, 0, 1],
      });
    // muzzle brake
    b.part(new THREE.CylinderGeometry(0.055, 0.055, 0.14, 6), P.hullDark, { bone: gun, at: [cx + x, cy + y, cz + 1.9], dir: [0, 0, 1] });
    box(0.02, 0.12, 0.05, P.black, [x, y, 1.9], gun);
    box(0.12, 0.02, 0.05, P.black, [x, y, 1.9], gun);
    glow(b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 6), P.neonCyan, { bone: gun, at: [cx + x, cy + y, cz + 1.97], dir: [0, 0, 1] }), 1.5);
  }
  box(0.1, 0.1, 0.4, P.hullDark, [0, 0.45, 0.55], gun);
  box(0.5, 0.05, 0.1, P.trim, [0, 0.58, 0.8], gun);
}
    return buildTurret;
  })(),
  // cargoBed
  (() => {
function buildCargoBed({ b, J, P, M }: Ctx) {
  const body = J.body;
  const rack = J.rack;
  const R = rng(77);
  const OLIVE = P.olive, DARK = P.hullDark, HULL = P.hull, LIGHT = P.hullLight;
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, bone: any = body) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z] });
  const cyl = (rt: number, rb: number, len: number, c: string, at: number[], dir: number[], seg = 8, bone: any = body) =>
    b.part(new THREE.CylinderGeometry(rt, rb, len, seg), c, { bone, at, dir });

  // deck
  box(2.8, 0.1, 4.7, DARK, 0, 1.3, -1.85);
  for (let i = 0; i < 14; i++) box(2.6, 0.012, 0.06, HULL, 0, 1.36, -4.05 + i * 0.32);
  for (const s of [1, -1]) {
    // side armor panels
    box(0.1, 0.6, 4.6, HULL, s * 1.4, 1.65, -1.85);
    box(0.12, 0.12, 4.7, LIGHT, s * 1.4, 1.98, -1.85);
    box(0.12, 0.08, 4.7, P.trim, s * 1.4, 1.35, -1.85);
    // hazard stripes
    for (let i = 0; i < 9; i++) {
      b.part(new THREE.BoxGeometry(0.02, 0.4, 0.12), P.trim, { bone: body, at: [s * 1.46, 1.65, -3.9 + i * 0.5], rotation: [0, 0, 0] });
    }
    // vents
    for (let i = 0; i < 4; i++) for (let k = 0; k < 3; k++)
      box(0.02, 0.035, 0.35, P.black, s * 1.46, 1.55 + k * 0.1, -3.3 + i * 0.6 + 0.0);
    // neon strip
    box(0.03, 0.03, 4.4, P.neonCyan, s * 1.46, 1.38, -1.85);
    // tie-down straps and rivets
    for (let i = 0; i < 6; i++) box(0.04, 0.05, 0.05, P.steel, s * 1.46, 1.92, -3.9 + i * 0.75);
  }
  // headboard
  box(2.8, 1.4, 0.14, HULL, 0, 2.0, 0.4);
  box(2.9, 0.1, 0.2, LIGHT, 0, 2.72, 0.4);
  for (let i = 0; i < 5; i++) box(0.3, 0.08, 0.03, P.trim, -1 + i * 0.5, 1.5, 0.3);
  for (let i = 0; i < 6; i++) box(0.5, 0.04, 0.02, P.black, -1.2 + i * 0.48, 2.3, 0.32);
  // tailgate
  box(2.8, 0.7, 0.1, HULL, 0, 1.7, -4.15);
  box(2.4, 0.05, 0.04, P.neonMagenta, 0, 1.95, -4.22);
  box(2.4, 0.05, 0.04, P.neonCyan, 0, 1.5, -4.22);
  for (const s of [1, -1]) {
    box(0.2, 0.14, 0.05, P.red, s * 1.2, 1.7, -4.22);
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 6), P.red, { bone: body, at: [s * 0.9, 1.7, -4.22], dir: [0, 0, 1] });
  }
  // number plate
  box(0.6, 0.2, 0.03, P.lightWhite, 0, 1.7, -4.23);
  for (let i = 0; i < 4; i++) box(0.07, 0.12, 0.02, P.black, -0.21 + i * 0.14, 1.7, -4.25);
  // bumper + hitch
  box(2.9, 0.25, 0.25, DARK, 0, 1.0, -4.3);
  box(2.9, 0.05, 0.1, P.trim, 0, 1.15, -4.42);
  cyl(0.08, 0.08, 0.3, P.steel, [0, 1.0, -4.55], [0, 0, 1]);
  b.part(new THREE.SphereGeometry(0.1, 6, 4), P.steel, { bone: body, at: [0, 1.0, -4.7] });

  // containers
  const mods: [number, number, number, number, number, string][] = [
    [-0.7, -0.6, 1.2, 0.9, 1.5, OLIVE],
    [0.7, -0.6, 1.2, 0.9, 1.5, LIGHT],
    [-0.7, -2.0, 1.2, 0.7, 1.1, LIGHT],
  ];
  for (const [x, z, w, h, d, c] of mods) {
    const y = 1.35 + h / 2;
    box(w, h, d, c, x, y, z);
    box(w + 0.04, 0.06, d + 0.04, DARK, x, 1.38 + h, z);
    for (let k = -1; k <= 1; k += 2) box(0.05, h, d + 0.03, DARK, x + k * w * 0.3, y, z);
    box(w * 0.5, 0.2, 0.02, P.glass, x, y + 0.1, z + d / 2 + 0.01);
    box(w * 0.46, 0.14, 0.02, P.neonCyan, x, y + 0.1, z + d / 2 + 0.02);
    box(0.3, 0.08, 0.02, P.trim, x - 0.25, y - 0.2, z + d / 2 + 0.01);
    for (const sx of [-1, 1]) for (const sz of [-1, 1])
      b.part(new THREE.SphereGeometry(0.03, 5, 4), P.steel, { bone: body, at: [x + sx * w * 0.45, 1.35 + h, z + sz * d * 0.45] });
  }
  // straps
  for (const x of [-0.7, 0.7]) box(0.08, 0.02, 1.7, P.black, x + 0.2, 2.27, -0.6);
  // ammo crates
  for (let i = 0; i < 4; i++) {
    const x = 0.5 + (i % 2) * 0.5, z = -2.0 - Math.floor(i / 2) * 0.5;
    box(0.45, 0.3, 0.4, i % 2 ? P.rust : OLIVE, x, 1.5, z);
    box(0.47, 0.05, 0.1, P.trim, x, 1.67, z);
    box(0.1, 0.06, 0.02, P.black, x, 1.5, z + 0.21);
  }
  // jerrycans
  for (let i = 0; i < 3; i++) {
    const x = 1.15, z = -1.0 - i * 0.3;
    box(0.2, 0.34, 0.24, P.red, x, 1.52, z);
    box(0.08, 0.06, 0.1, P.black, x, 1.72, z);
  }
  // antenna mast
  const ax = -1.25, az = 0.2;
  cyl(0.02, 0.03, 1.2, P.black, [ax, 2.75, az], [0, 1, 0]);
  b.part(new THREE.SphereGeometry(0.05, 6, 4), P.neonMagenta, { bone: body, at: [ax, 3.0, az] });
  cyl(0.06, 0.06, 0.08, DARK, [ax, 2.15, az], [0, 1, 0]);

  // missile rack on rack joint
  const rl = (p: number[]) => p;
  box(1.5, 0.12, 1.2, DARK, 0, 1.9, -3.2, rack);
  for (const s of [1, -1]) box(0.08, 0.5, 1.2, HULL, s * 0.78, 2.15, -3.2, rack);
  box(1.6, 0.06, 0.1, P.trim, 0, 2.0, -3.78, rack);
  let n = 0;
  for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
    const x = -0.45 + c * 0.45, y = 2.1 + r * 0.38, z = -3.2;
    cyl(0.17, 0.17, 1.2, P.steel, [x, y, z], [0, 0, 1], 8, rack);
    cyl(0.12, 0.12, 0.05, P.black, [x, y, z + 0.6], [0, 0, 1], 8, rack);
    b.part(new THREE.ConeGeometry(0.1, 0.25, 8), P.red, { bone: rack, at: [x, y, z + 0.52], dir: [0, 0, 1] });
    cyl(0.18, 0.18, 0.06, P.trim, [x, y, z - 0.45], [0, 0, 1], 8, rack);
    n++;
  }
  box(1.5, 0.05, 0.05, P.neonMagenta, 0, 2.6, -2.6, rack);
  // deck rivets
  for (let i = 0; i < 20; i++)
    b.part(new THREE.SphereGeometry(0.02, 4, 3), P.steel, { bone: body, at: [(R() - 0.5) * 2.4, 1.36, -4 + R() * 4] });
}
    return buildCargoBed;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "warhound2077" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1,0], dir: [0,0,1], role: "spine" });
  J["cab"] = b.joint("cab", { parent: J["body"], at: [0,1.3,2.4], dir: [0,0,1], role: "hinge", group: "cab" });
  J["turretYaw"] = b.joint("turretYaw", { parent: J["cab"], at: [0,2.55,2.2], dir: [0,1,0], role: "hinge", group: "turret" });
  J["gun"] = b.joint("gun", { parent: J["turretYaw"], at: [0,2.85,2.5], dir: [0,0,1], role: "hinge", group: "turret" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.3,0.62,2.6], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.3,0.62,2.6], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelML"] = b.joint("wheelML", { parent: J["body"], at: [1.3,0.62,-1.6], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelMR"] = b.joint("wheelMR", { parent: J["body"], at: [-1.3,0.62,-1.6], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelBL"] = b.joint("wheelBL", { parent: J["body"], at: [1.3,0.62,-3], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelBR"] = b.joint("wheelBR", { parent: J["body"], at: [-1.3,0.62,-3], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["rack"] = b.joint("rack", { parent: J["body"], at: [0,1.9,-3.2], dir: [0,0.5,-1], role: "hinge", group: "cargo" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
