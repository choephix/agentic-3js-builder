import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, frame } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Hover Technical",
  "description": "A militarized pickup truck converted to hover thrusters in a low-poly cyberpunk style: armored hull, caged cab, rear bed with a pintle gun, four ducted thrusters and neon underglow."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#3a404c",
  hullDark: "#23272f",
  hullLight: "#5a6272",
  armor: "#4d5543",
  trimYellow: "#e7b814",
  trimBlack: "#14161a",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2fb4",
  neonOrange: "#ff8a2a",
  glass: "#1b3a4d",
  glassGlow: "#58d6ff",
  metal: "#8c93a0",
  rust: "#7a4a2c",
  tire: "#101114",
  white: "#e8ecf2",
  red: "#d92b3a",
};
const M = {
  hullTop: [0, 1.25, 0] as [number, number, number],
  cabFloor: [0, 1.25, 0.4] as [number, number, number],
  bedFloor: [0, 1.15, -1.65] as [number, number, number],
  hoodTop: [0, 1.3, 2] as [number, number, number],
  gunPost: [0, 1.15, -1.9] as [number, number, number],
  thrusterFL: [1.2, 0.7, 1.75] as [number, number, number],
  thrusterFR: [-1.2, 0.7, 1.75] as [number, number, number],
  thrusterRL: [1.2, 0.7, -1.75] as [number, number, number],
  thrusterRR: [-1.2, 0.7, -1.75] as [number, number, number],
  underglow: [0, 0.55, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassis
  (() => {
function buildChassis({ b, J, P }: any) {
  const bone = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, opt: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at: [x, y, z], ...opt });
  const lit = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, s = 1) =>
    glow(box(w, h, d, color, x, y, z), s);
  const wedge = (pts: number[][], t: number, color: string, at: number[], x: number[], y: number[] = [0, 1, 0]) =>
    b.extrude(pts, { at, x, y, thickness: t, color, bone });

  // main slab: chamfered side profile (z along x-axis of drawing)
  wedge(
    [[-2.7, 0.62], [-2.55, 0.5], [2.55, 0.5], [2.7, 0.65], [2.7, 1.1], [2.5, 1.2], [1.4, 1.3], [-0.6, 1.3], [-2.7, 1.3]],
    2.2, P.hull, [0, 0, 0], [0, 0, 1],
  );
  // 'x' in extrude runs +z; thickness along x*y => centred about x=0
  box(2.0, 0.06, 4.8, P.hullDark, 0, 0.47, 0); // belly plate
  box(1.6, 0.04, 3.6, P.hullLight, 0, 0.44, 0);
  // hood
  box(2.1, 0.12, 1.3, P.hullLight, 0, 1.33, 2.05);
  box(1.9, 0.1, 0.9, P.armor, 0, 1.4, 2.0);
  // hood scoops
  for (const s of [1, -1]) {
    wedge([[0, 0], [0.5, 0], [0.4, 0.14], [0.05, 0.2]], 0.34, P.hullDark, [s * 0.62, 1.45, 1.75], [0, 0, 1]);
    box(0.28, 0.02, 0.3, P.neonOrange, s * 0.62, 1.47, 2.05);
  }
  // vent grille on hood
  for (let i = 0; i < 6; i++) box(0.9, 0.02, 0.04, P.trimBlack, 0, 1.46, 2.25 + i * 0.07);
  // stencil numbers: blocks
  for (const [dx, dz, w, d] of [[-0.45, 0, 0.05, 0.3], [-0.3, 0, 0.05, 0.3], [-0.375, 0.13, 0.2, 0.04], [0.3, 0, 0.05, 0.3], [0.5, 0, 0.05, 0.3], [0.4, 0.13, 0.2, 0.04], [0.4, -0.13, 0.2, 0.04]])
    box(w, 0.012, d, P.white, dx, 1.455, 1.75 + dz * 0.5 + 0.0);
  // armor seams on hood
  box(0.03, 0.015, 1.2, P.trimBlack, 0, 1.455, 2.05);
  box(1.9, 0.015, 0.03, P.trimBlack, 0, 1.455, 1.55);

  // front fascia + grille
  box(2.1, 0.5, 0.1, P.hullDark, 0, 0.95, 2.72);
  for (let i = 0; i < 5; i++) box(1.0, 0.03, 0.04, P.metal, 0, 0.82 + i * 0.07, 2.79);
  for (const s of [1, -1]) {
    lit(0.4, 0.16, 0.06, P.glassGlow, s * 0.72, 1.12, 2.77, 1.6);
    box(0.46, 0.22, 0.04, P.trimBlack, s * 0.72, 1.12, 2.74);
  }
  // bumper w/ ram bar
  box(2.3, 0.22, 0.25, P.hullLight, 0, 0.66, 2.7);
  box(2.3, 0.07, 0.27, P.trimYellow, 0, 0.74, 2.7);
  for (let i = -5; i <= 5; i++)
    wedge([[0, 0], [0.12, 0], [0.2, 0.07], [0.08, 0.07]], 0.28, P.trimBlack, [i * 0.2 - 0.05, 0.705, 2.7], [1, 0, 0], [0, 0, 1]);
  box(1.6, 0.1, 0.12, P.metal, 0, 0.9, 2.85);
  for (const s of [1, -1]) {
    box(0.1, 0.4, 0.14, P.hullDark, s * 0.8, 0.88, 2.82);
    box(0.14, 0.05, 0.1, P.metal, s * 0.95, 0.6, 2.85); // tow hooks
    box(0.05, 0.12, 0.1, P.metal, s * 0.99, 0.57, 2.85);
  }
  // rear bumper
  box(2.3, 0.22, 0.2, P.hullLight, 0, 0.68, -2.72);
  box(2.3, 0.06, 0.22, P.trimYellow, 0, 0.77, -2.72);
  for (const s of [1, -1]) {
    lit(0.3, 0.14, 0.05, P.red, s * 0.9, 1.1, -2.72, 1.3);
    box(0.36, 0.2, 0.04, P.trimBlack, s * 0.9, 1.1, -2.7);
    box(0.12, 0.05, 0.12, P.metal, s * 0.4, 0.6, -2.8);
  }
  box(1.0, 0.18, 0.04, P.hullDark, 0, 1.0, -2.72);

  // side skirts, vents, seams, rivets, neon
  for (const s of [1, -1]) {
    box(0.1, 0.34, 3.6, P.armor, s * 1.17, 0.78, 0);
    box(0.04, 0.05, 3.6, P.trimYellow, s * 1.23, 0.93, 0);
    for (let i = 0; i < 4; i++) box(0.04, 0.16, 0.05, P.trimBlack, s * 1.23, 0.78, -0.45 + i * 0.12 - 0.2);
    lit(0.05, 0.05, 4.4, s > 0 ? P.neonCyan : P.neonMagenta, s * 1.1, 0.52, 0, 1.4);
    box(0.03, 0.5, 0.03, P.trimBlack, s * 1.16, 1.0, 1.4);
    box(0.03, 0.5, 0.03, P.trimBlack, s * 1.16, 1.0, -0.6);
    for (let i = 0; i < 12; i++) {
      const z = -1.7 + i * 0.3;
      b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 6), P.metal, { bone, at: [s * 1.24, 0.65, z], dir: [s, 0, 0] });
    }
    // fender flares
    box(0.12, 0.1, 0.9, P.hullLight, s * 1.18, 1.3, 1.75);
    box(0.12, 0.1, 0.9, P.hullLight, s * 1.18, 1.3, -1.75);
    // side vents on hood flank
    for (let i = 0; i < 3; i++) box(0.03, 0.04, 0.3, P.trimBlack, s * 1.16, 1.05 + i * 0.08, 2.2);
  }
  // front/back underglow
  lit(2.0, 0.05, 0.05, P.neonMagenta, 0, 0.5, 2.55, 1.4);
  lit(2.0, 0.05, 0.05, P.neonCyan, 0, 0.5, -2.55, 1.4);
  // rivet rows on top
  for (let i = 0; i < 10; i++) {
    const x = -0.9 + i * 0.2;
    b.part(new THREE.SphereGeometry(0.02, 5, 4), P.metal, { bone, at: [x, 1.47, 2.62 - R() * 0.01] });
  }
  // bed rail deck panel seams
  box(2.2, 0.03, 0.04, P.trimBlack, 0, 1.31, -0.62);
  box(2.2, 0.03, 0.04, P.trimBlack, 0, 1.31, 1.42);
}
    return buildChassis;
  })(),
  // cab
  (() => {
function buildCab({ b, J, P, M }: Ctx) {
  const bone = J.cab;
  const glass = "#1b3a4d";
  const R = rng(5);

  // Helper: box at center (x,y,z) with size (w,h,d), optional rotation about X (deg)
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, rx = 0, ry = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, {
      bone,
      at: [x, y, z],
      rotation: [rx, ry, 0],
      flat: true,
    });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, at: number[], rot: number[] = [0, 0, 0]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at: at as [number, number, number], rotation: rot as [number, number, number], flat: true });
  const rod = (a: number[], c2: number[], r: number, c: string) =>
    b.rod(a as [number, number, number], c2 as [number, number, number], r, c, { bone, sides: 6 } as any);

  // Lower cab body (door/body block)
  box(2.1, 0.5, 2.0, P.hull, 0, 1.5, 0.4);
  box(2.2, 0.08, 2.0, P.hullDark, 0, 1.29, 0.4);
  // Beltline trim
  box(2.14, 0.05, 1.96, P.trimBlack, 0, 1.77, 0.4);

  // Greenhouse pillars and roof
  const gTop = 2.15;
  // Roof armor
  box(1.9, 0.1, 1.45, P.armor, 0, gTop + 0.05, 0.1);
  box(1.96, 0.04, 1.5, P.hullDark, 0, gTop - 0.02, 0.1);
  // Roof edge chamfers
  for (const s of [1, -1]) box(0.08, 0.1, 1.45, P.hullLight, s * 0.96, gTop + 0.03, 0.1, 0, 0);

  // Windshield (angled)
  const ws = box(1.8, 0.62, 0.05, glass, 0, 1.97, 0.88, -32);
  // windshield reflection strips
  for (const [i, x] of [-0.5, -0.1, 0.35].entries()) {
    box(0.05 + i * 0.02, 0.5, 0.01, P.glassGlow, x, 1.97, 0.905 + 0.0, -32, 0).position.z += 0;
  }
  // Windshield frame
  box(1.9, 0.06, 0.08, P.hullDark, 0, 2.27 - 0.05, 0.7, -32);
  box(1.9, 0.06, 0.08, P.hullDark, 0, 1.72, 1.05, -32);
  for (const s of [1, -1]) box(0.08, 0.66, 0.08, P.hullDark, s * 0.92, 1.97, 0.88, -32);

  // Side windows
  for (const s of [1, -1]) {
    box(0.04, 0.4, 0.55, glass, s * 0.97, 1.97, 0.45);
    box(0.04, 0.4, 0.5, glass, s * 0.97, 1.97, -0.2);
    box(0.045, 0.04, 0.35, P.glassGlow, s * 0.99, 2.05, 0.45, 0, 0);
    box(0.045, 0.04, 0.3, P.glassGlow, s * 0.99, 2.05, -0.2);
    // B pillar
    box(0.08, 0.5, 0.12, P.hullDark, s * 0.97, 1.97, 0.1);
    box(0.08, 0.5, 0.12, P.hullDark, s * 0.97, 1.97, -0.5);
    // Door panels
    box(0.05, 0.38, 0.8, P.hullLight, s * 1.06, 1.5, 0.45);
    box(0.06, 0.04, 0.2, P.metal, s * 1.1, 1.58, 0.15);
    // Hazard stripes (alternating)
    for (let k = 0; k < 5; k++) {
      box(0.06, 0.07, 0.07, k % 2 ? P.trimBlack : P.trimYellow, s * 1.09, 1.36, 0.1 + k * 0.1);
    }
    // Emblem on door: magenta diamond + dot
    box(0.04, 0.2, 0.2, P.neonMagenta, s * 1.1, 1.6, 0.68, 45, 0).rotation.set(Math.PI / 4, 0, 0);
    box(0.045, 0.08, 0.08, P.trimBlack, s * 1.11, 1.6, 0.68);
    // Rear door/panel
    box(0.05, 0.38, 0.8, P.hull, s * 1.06, 1.5, -0.3);
    // Mirrors
    box(0.08, 0.04, 0.3, P.hullDark, s * 1.15, 1.85, 0.95);
    box(0.06, 0.18, 0.26, P.trimBlack, s * 1.25, 1.87, 0.95);
    box(0.02, 0.12, 0.2, P.neonCyan, s * 1.285, 1.87, 0.95);
  }

  // Rear window
  box(1.7, 0.4, 0.05, glass, 0, 1.97, -0.55);
  box(1.4, 0.04, 0.01, P.glassGlow, 0, 2.08, -0.58);
  box(1.9, 0.5, 0.08, P.hullDark, 0, 1.97, -0.58 + 0.0).position.z = -0.52;
  box(1.74, 0.4, 0.04, glass, 0, 1.97, -0.56);

  // Rear cab wall under window
  box(2.0, 0.45, 0.06, P.armor, 0, 1.55, -0.57);

  // Roof light bar
  box(1.4, 0.1, 0.18, P.trimBlack, 0, 2.25, 0.55);
  const lamps = [P.neonOrange, P.neonCyan, P.neonOrange, P.neonCyan, P.neonOrange, P.neonCyan];
  lamps.forEach((c, i) => {
    box(0.18, 0.08, 0.2, c, -0.55 + i * 0.22, 2.27, 0.55);
  });
  // Roof plates and bolts
  box(0.6, 0.02, 0.5, P.hullLight, -0.5, 2.12 + 0.05, -0.15);
  box(0.6, 0.02, 0.5, P.hullLight, 0.5, 2.12 + 0.05, -0.15);
  for (let i = 0; i < 12; i++) {
    const x = (R() - 0.5) * 1.7;
    const z = -0.45 + R() * 1.1;
    cyl(0.03, 0.03, 0.03, 6, P.metal, [x, 2.22, z]);
  }

  // Roll cage over windows
  const cage = P.metal;
  for (const s of [1, -1]) {
    rod([s * 1.0, 1.77, 0.95], [s * 1.0, 2.2, 0.5], 0.025, cage);
    rod([s * 1.0, 2.2, 0.5], [s * 1.0, 2.2, -0.45], 0.025, cage);
    rod([s * 1.0, 2.2, -0.45], [s * 1.0, 1.77, -0.5], 0.025, cage);
    rod([s * 1.0, 1.77, 0.15], [s * 1.0, 2.2, 0.15], 0.02, cage);
  }
  rod([-1.0, 2.2, 0.15], [1.0, 2.2, 0.15], 0.02, cage);
  rod([-1.0, 2.2, -0.45], [1.0, 2.2, -0.45], 0.02, cage);
  rod([-1.0, 2.2, 0.15], [1.0, 2.2, -0.45], 0.015, cage);
  rod([1.0, 2.2, 0.15], [-1.0, 2.2, -0.45], 0.015, cage);

  // Cowl between cab and hood
  box(2.05, 0.2, 0.2, P.hullDark, 0, 1.7, 1.3);
  box(2.0, 0.04, 0.12, P.trimYellow, 0, 1.81, 1.3);
  // Wipers
  for (const s of [1, -1]) rod([s * 0.1 + s * 0.2, 1.74, 1.1], [s * 0.6, 1.9, 0.98], 0.012, P.trimBlack);

  // Dash screen visible through windshield
  box(0.7, 0.22, 0.04, P.trimBlack, 0.05, 1.82, 0.78, -20);
  box(0.62, 0.16, 0.02, P.neonCyan, 0.05, 1.82, 0.8, -20);
  box(0.2, 0.05, 0.02, P.neonMagenta, 0.2, 1.84, 0.815, -20);
  box(0.2, 0.05, 0.02, P.neonOrange, -0.1, 1.79, 0.815, -20);
  // Seats silhouettes
  for (const s of [1, -1]) {
    box(0.4, 0.35, 0.1, P.hullDark, s * 0.45, 1.7, -0.3);
  }

  // Antenna with neon tip
  const ax = -0.9, az = -0.3;
  box(0.08, 0.06, 0.08, P.trimBlack, ax, 2.22, az);
  rod([ax, 2.24, az], [ax - 0.05, 2.28 + 0.0, az - 0.05], 0.01, P.metal);
  const ant = b.rod([ax, 2.25, az], [ax - 0.05, 2.3, az - 0.05], 0.012, P.metal, { bone, sides: 6 } as any);
  b.part(new THREE.SphereGeometry(0.03, 6, 4), P.neonMagenta, { bone, at: [ax - 0.05, 2.3, az - 0.05] });

  // Front nose chamfer / A-pillar base and grille lights on cowl
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.035, 6, 4), P.neonCyan, { bone, at: [s * 0.9, 1.84, 1.38] });
  }
}
    return buildCab;
  })(),
  // bed
  (() => {
function buildBed({ b, J, P, M }: any) {
  const R = rng(11);
  const body = J.body, yaw = J.gunYaw, pitch = J.gunPitch;
  const box = (w: number, h: number, d: number, c: string, at: number[], bone: any = body, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, ...(rot ? { rotation: rot } : {}) });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, at: number[], bone: any = body, dir?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at, ...(dir ? { dir } : {}) });

  const fy = 1.15;
  // floor
  box(2.2, 0.08, 2.1, P.hullDark, [0, fy + 0.04, -1.65]);
  for (let i = 0; i < 9; i++) box(2.0, 0.02, 0.07, P.hullLight, [0, fy + 0.09, -2.55 + i * 0.22]);
  // side walls
  for (const s of [1, -1]) {
    box(0.1, 0.62, 2.1, P.hull, [s * 1.07, fy + 0.35, -1.65]);
    box(0.14, 0.06, 2.1, P.hullDark, [s * 1.07, fy + 0.68, -1.65]);
    box(0.02, 0.4, 1.7, P.armor, [s * 1.13, fy + 0.35, -1.65]);
    for (let i = 0; i < 4; i++) {
      box(0.025, 0.4, 0.03, P.hullDark, [s * 1.14, fy + 0.35, -2.35 + i * 0.5]);
      for (const z of [-0.2, 0.2]) box(0.03, 0.03, 0.03, P.metal, [s * 1.145, fy + 0.5, -2.35 + i * 0.5 + z * 0.4]);
    }
    for (const z of [-2.3, -1.0]) {
      b.part(new THREE.TorusGeometry(0.05, 0.012, 5, 8), P.metal, { bone: body, at: [s * 1.14, fy + 0.5, z], rotation: [0, 90, 0] });
    }
    box(0.03, 0.05, 0.9, P.trimYellow, [s * 1.14, fy + 0.62, -1.0]);
  }
  // front wall
  box(2.1, 0.7, 0.1, P.hull, [0, fy + 0.4, -0.65]);
  box(1.9, 0.3, 0.02, P.hullDark, [0, fy + 0.35, -0.7]);
  // tailgate
  box(2.2, 0.62, 0.1, P.hull, [0, fy + 0.35, -2.65]);
  box(2.0, 0.12, 0.02, P.trimYellow, [0, fy + 0.45, -2.71]);
  for (let i = 0; i < 8; i++)
    box(0.12, 0.12, 0.022, P.trimBlack, [-0.9 + i * 0.26, fy + 0.45, -2.712], body, [0, 0, 30]);
  for (const s of [1, -1]) {
    glow(box(0.2, 0.12, 0.04, P.red, [s * 0.88, fy + 0.2, -2.72]), 1.4);
    box(0.24, 0.16, 0.02, P.hullDark, [s * 0.88, fy + 0.2, -2.70]);
  }
  // roll bar
  for (const s of [1, -1]) {
    cyl(0.04, 0.04, 0.95, 6, P.metal, [s * 0.95, fy + 0.55, -0.85]);
    box(0.1, 0.1, 0.1, P.hullDark, [s * 0.95, fy + 0.1, -0.85]);
  }
  cyl(0.04, 0.04, 1.9, 6, P.metal, [0, fy + 1.0, -0.85], body, [1, 0, 0]);
  cyl(0.04, 0.04, 1.9, 6, P.metal, [0, fy + 0.7, -0.85], body, [1, 0, 0]);
  for (const s of [1, -1]) {
    cyl(0.1, 0.1, 0.16, 8, P.hullDark, [s * 0.5, fy + 1.1, -0.85], body, [0, 0, 1]);
    glow(cyl(0.085, 0.085, 0.03, 8, P.white, [s * 0.5, fy + 1.1, -0.76], body, [0, 0, 1]), 1.8);
    box(0.05, 0.14, 0.05, P.metal, [s * 0.5, fy + 1.0, -0.85]);
  }
  // cargo: crates
  const crate = (x: number, z: number, c: string, rot = 0) => {
    box(0.5, 0.3, 0.38, c, [x, fy + 0.23, z], body, [0, rot, 0]);
    box(0.52, 0.04, 0.4, P.hullDark, [x, fy + 0.4, z], body, [0, rot, 0]);
    box(0.1, 0.03, 0.02, P.trimBlack, [x, fy + 0.3, z + 0.2], body, [0, rot, 0]);
  };
  crate(0.65, -1.1, P.armor, 8);
  crate(0.7, -1.55, P.trimYellow, -6);
  box(0.4, 0.26, 0.34, P.armor, [0.68, fy + 0.57, -1.3], body, [0, 14, 0]);
  // drum
  cyl(0.22, 0.22, 0.6, 10, P.red, [-0.7, fy + 0.34, -1.2]);
  for (const y of [0.15, 0.5]) cyl(0.23, 0.23, 0.04, 10, P.hullDark, [-0.7, fy + y, -1.2]);
  cyl(0.2, 0.2, 0.02, 10, P.metal, [-0.7, fy + 0.65, -1.2]);
  box(0.12, 0.12, 0.01, P.trimYellow, [-0.7, fy + 0.35, -0.97]);
  // cable coil
  for (let i = 0; i < 3; i++)
    b.part(new THREE.TorusGeometry(0.2 - i * 0.015, 0.04, 5, 10), P.trimBlack, { bone: body, at: [-0.7, fy + 0.13 + i * 0.07, -2.0], rotation: [90, 0, 0] });
  // power cell
  box(0.3, 0.3, 0.3, P.hullDark, [-0.65, fy + 0.2, -2.4]);
  glow(cyl(0.09, 0.09, 0.4, 6, P.neonCyan, [-0.65, fy + 0.5, -2.4]), 2);
  cyl(0.11, 0.11, 0.04, 6, P.metal, [-0.65, fy + 0.7, -2.4]);
  // pintle post
  box(0.4, 0.1, 0.4, P.hullDark, [0, fy + 0.13, -1.9]);
  cyl(0.09, 0.12, 0.36, 8, P.metal, [0, fy + 0.3, -1.9]);
  cyl(0.07, 0.07, 0.3, 8, P.hullLight, [0, fy + 0.6, -1.9]);
  for (const a of [0, 120, 240]) {
    const r = (a * Math.PI) / 180;
    b.part(new THREE.BoxGeometry(0.05, 0.3, 0.05), P.metal, { bone: body, at: [Math.sin(r) * 0.16, fy + 0.2, -1.9 + Math.cos(r) * 0.16], rotation: [Math.cos(r) * 25, 0, -Math.sin(r) * 25] });
  }
  // gun (yaw): cradle
  box(0.36, 0.1, 0.3, P.hullDark, [0, 1.72, -1.9], yaw);
  for (const s of [1, -1]) box(0.06, 0.2, 0.2, P.hullLight, [s * 0.16, 1.78, -1.9], yaw);
  // pitch parts
  const gz = -1.9;
  const gy = 1.8;
  box(0.22, 0.2, 0.5, P.hull, [0, gy, gz], pitch);
  cyl(0.06, 0.06, 0.9, 8, P.hullDark, [0, gy, gz + 0.7], pitch, [0, 0, 1]);
  cyl(0.1, 0.1, 0.5, 8, P.hullLight, [0, gy, gz + 0.5], pitch, [0, 0, 1]);
  for (let i = 0; i < 4; i++) box(0.22, 0.02, 0.04, P.trimBlack, [0, gy + 0.09, gz + 0.35 + i * 0.1], pitch);
  cyl(0.085, 0.085, 0.1, 8, P.trimBlack, [0, gy, gz + 1.18], pitch, [0, 0, 1]);
  cyl(0.03, 0.03, 0.12, 6, P.metal, [0, gy, gz + 1.25], pitch, [0, 0, 1]);
  // ammo box + belt
  box(0.24, 0.26, 0.3, P.armor, [0.24, gy - 0.08, gz - 0.05], pitch);
  box(0.25, 0.04, 0.31, P.trimYellow, [0.24, gy + 0.07, gz - 0.05], pitch);
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    cyl(0.018, 0.018, 0.07, 5, "#c9a24a", [0.2 - t * 0.14, gy + 0.0 + Math.sin(t * 3) * 0.05 - 0.02, gz + 0.08 + t * 0.05], pitch, [1, 0, 0]);
  }
  // sight
  box(0.08, 0.08, 0.14, P.hullDark, [-0.09, gy + 0.15, gz + 0.1], pitch);
  glow(box(0.06, 0.06, 0.02, P.neonMagenta, [-0.09, gy + 0.15, gz + 0.18], pitch), 2);
  // shield plate
  box(0.8, 0.5, 0.05, P.armor, [0, gy + 0.05, gz + 0.38], pitch, [0, 0, 0]);
  box(0.82, 0.05, 0.07, P.trimYellow, [0, gy + 0.3, gz + 0.38], pitch);
  box(0.3, 0.06, 0.02, P.hullDark, [0, gy + 0.12, gz + 0.415], pitch);
  box(0.12, 0.1, 0.02, P.neonMagenta, [0.28, gy - 0.1, gz + 0.415], pitch);
  for (const s of [1, -1]) for (const y of [-0.15, 0.2]) box(0.03, 0.03, 0.02, P.metal, [s * 0.34, gy + y, gz + 0.42], pitch);
  // deck neon trim
  for (const s of [1, -1]) glow(box(0.02, 0.02, 1.8, P.neonCyan, [s * 1.14, fy + 0.15, -1.65]), 1.5);
}
    return buildBed;
  })(),
  // thrusters
  (() => {
function buildThrusters({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const mounts: Record<string, [any, number, number]> = {
    thrusterFL: [J.thrusterFL, 1, 1],
    thrusterFR: [J.thrusterFR, -1, 1],
    thrusterRL: [J.thrusterRL, 1, -1],
    thrusterRR: [J.thrusterRR, -1, -1],
  };
  const ORANGE = P.neonOrange;
  const PURPLE = "#8a1f6a";

  for (const name of Object.keys(mounts)) {
    const [bone, sx] = mounts[name];
    const m = M[name];
    const cx = m[0];
    const cz = m[2];
    const P3 = (x: number, y: number, z: number): [number, number, number] => [cx + x, y, cz + z];
    const put = (g: THREE.BufferGeometry, color: string, at: [number, number, number], opts: any = {}) =>
      b.part(g, color, { bone, at, flat: true, ...opts });

    // Octagonal ducted housing: outer shell (lathe-like via cylinders with 8 sides)
    const rOut = 0.5;
    const yBase = 0.18;
    const yTop = 0.78;
    // lower flared nozzle (bottom at y=0)
    put(new THREE.CylinderGeometry(0.4, 0.3, 0.18, 8), P.hullDark, P3(0, 0.09, 0), { rotation: [0, 22.5, 0] });
    // bottom lip ring
    put(new THREE.CylinderGeometry(0.42, 0.42, 0.03, 8), P.trimBlack, P3(0, 0.015, 0), { rotation: [0, 22.5, 0] });
    // main housing wall (hollow look: outer cylinder + dark inner)
    put(new THREE.CylinderGeometry(rOut, rOut * 0.9, yTop - yBase, 8, 1, true), P.hullDark, P3(0, (yTop + yBase) / 2, 0), { rotation: [0, 22.5, 0] });
    put(new THREE.CylinderGeometry(rOut * 0.9, rOut, yTop - yBase, 8, 1, true), P.hull, P3(0, (yTop + yBase) / 2, 0), { rotation: [0, 22.5, 0], scale: [0.86, 1, 0.86] });
    // top rim ring (octagonal torus-ish)
    put(new THREE.CylinderGeometry(rOut + 0.04, rOut + 0.04, 0.07, 8), P.hullLight, P3(0, yTop, 0), { rotation: [0, 22.5, 0], scale: [1, 1, 1] });
    put(new THREE.CylinderGeometry(rOut - 0.05, rOut - 0.05, 0.075, 8), P.hullDark, P3(0, yTop + 0.005, 0), { rotation: [0, 22.5, 0] });
    // orange exhaust ring
    glow(put(new THREE.CylinderGeometry(0.34, 0.34, 0.025, 8), ORANGE, P3(0, 0.2, 0), { rotation: [0, 22.5, 0] }), 1.4);
    // glowing cyan core disc facing down
    glow(put(new THREE.CylinderGeometry(0.28, 0.28, 0.03, 8), P.neonCyan, P3(0, 0.12, 0), { rotation: [0, 22.5, 0] }), 1.8);
    // fan hub + blades
    put(new THREE.CylinderGeometry(0.09, 0.09, 0.14, 8), P.metal, P3(0, 0.5, 0));
    put(new THREE.CylinderGeometry(0.04, 0.04, 0.2, 6), P.trimBlack, P3(0, 0.56, 0));
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * 360 + sx * 8;
      const rad = (a * Math.PI) / 180;
      const bx = Math.sin(rad) * 0.22;
      const bz = Math.cos(rad) * 0.22;
      put(new THREE.BoxGeometry(0.1, 0.02, 0.3), P.metal, P3(bx, 0.5, bz), { rotation: [0, a, 12] });
    }
    // fan guard struts (cross)
    for (let i = 0; i < 2; i++) {
      put(new THREE.BoxGeometry(0.9, 0.025, 0.04), P.trimBlack, P3(0, yTop - 0.05, 0), { rotation: [0, i * 90 + 22.5, 0] });
    }

    // hazard chevrons on the rim: 8 faces
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const r = rOut + 0.045;
      const px = Math.sin(a) * r;
      const pz = Math.cos(a) * r;
      const deg = (a * 180) / Math.PI;
      put(new THREE.BoxGeometry(0.2, 0.05, 0.015), i % 2 ? P.trimYellow : P.trimBlack, P3(px, yTop, pz), { rotation: [0, deg, 0] });
      put(new THREE.BoxGeometry(0.06, 0.05, 0.02), i % 2 ? P.trimBlack : P.trimYellow, P3(px * 1.0, yTop, pz), { rotation: [0, deg, 0] });
    }
    // vent slats around housing wall
    for (let i = 0; i < 8; i++) {
      if (i % 2) continue;
      const a = (i / 8) * Math.PI * 2;
      const r = rOut * 0.97;
      const deg = (a * 180) / Math.PI;
      for (let k = 0; k < 3; k++) {
        put(new THREE.BoxGeometry(0.22, 0.025, 0.02), P.trimBlack, P3(Math.sin(a) * (r + 0.01), 0.35 + k * 0.07, Math.cos(a) * (r + 0.01)), { rotation: [0, deg, 0] });
      }
    }
    // rivets
    for (let i = 0; i < 8; i++) {
      const a = ((i + 0.5) / 8) * Math.PI * 2;
      put(new THREE.SphereGeometry(0.018, 5, 4), P.metal, P3(Math.sin(a) * (rOut + 0.05), yTop + 0.03, Math.cos(a) * (rOut + 0.05)));
    }

    // pylon strut toward chassis (x = +-1.15)
    const wallX = sx * 1.15;
    const sxLocal = wallX - cx;
    const len = Math.abs(sxLocal) - 0.4;
    const midX = cx + sxLocal / 2 - sx * 0.2;
    put(new THREE.BoxGeometry(Math.abs(len) + 0.1, 0.16, 0.24), P.hullDark, [cx + (sxLocal - sx * 0.0) * 0.5 + sx * 0.2, 0.9, cz]);
    put(new THREE.BoxGeometry(0.1, 0.4, 0.2), P.hullLight, P3(sx * 0.3, 0.88, 0) as any, { rotation: [0, 0, -sx * 20] });
    // second brace
    put(new THREE.BoxGeometry(Math.abs(len), 0.07, 0.07), P.metal, [cx + sxLocal * 0.45 + sx * 0.1, 1.0, cz + 0.15], { rotation: [0, 0, 0] });
    put(new THREE.BoxGeometry(Math.abs(len), 0.07, 0.07), P.metal, [cx + sxLocal * 0.45 + sx * 0.1, 1.0, cz - 0.15]);
    // wall mount plate
    put(new THREE.BoxGeometry(0.06, 0.4, 0.5), P.hullLight, [wallX + sx * 0.0, 0.9, cz]);
    for (const dz of [-0.18, 0.18])
      for (const dy of [-0.12, 0.12]) put(new THREE.SphereGeometry(0.02, 5, 4), P.metal, [wallX + sx * 0.04, 0.9 + dy, cz + dz]);

    // fender-style armor shield: outer arch over the pod, outside
    const fx = cx + sx * 0.4;
    put(new THREE.BoxGeometry(0.06, 0.42, 0.95), P.hull, [cx + sx * 0.58, 0.62, cz], { });
    put(new THREE.BoxGeometry(0.06, 0.1, 0.8), P.hullLight, [cx + sx * 0.58, 0.9, cz], { rotation: [0, 0, sx * 0] });
    put(new THREE.BoxGeometry(0.45, 0.06, 0.95), P.hull, [fx, 0.88, cz]);
    // fender chamfers front and back
    for (const dz of [-1, 1]) {
      put(new THREE.BoxGeometry(0.4, 0.06, 0.2), P.hull, [fx, 0.8, cz + dz * 0.52], { rotation: [dz * 25, 0, 0] });
    }
    // yellow stripe on fender
    put(new THREE.BoxGeometry(0.02, 0.06, 0.7), P.trimYellow, [cx + sx * 0.62, 0.7, cz]);
    // magenta status light
    glow(put(new THREE.BoxGeometry(0.03, 0.05, 0.1), P.neonMagenta, [cx + sx * 0.62, 0.52, cz + 0.3]), 1.6);
    glow(put(new THREE.SphereGeometry(0.03, 6, 4), P.neonMagenta, P3(0, yTop + 0.06, 0.0).map((v, i) => (i === 0 ? v + sx * 0.0 : v)) as any), 0);
    // glow disc under pod (faint)
    glow(put(new THREE.CylinderGeometry(0.55, 0.55, 0.004, 8), P.neonCyan, P3(0, 0.004, 0), { rotation: [0, 22.5, 0] }), 0.5);
    // small orange pods on exhaust edge
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      glow(put(new THREE.BoxGeometry(0.05, 0.03, 0.05), ORANGE, P3(Math.sin(a) * 0.38, 0.1, Math.cos(a) * 0.38), { rotation: [0, (a * 180) / Math.PI, 0] }), 1.2);
    }
    void R;
  }
}
    return buildThrusters;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,0.9,0], dir: [0,0,1], role: "spine" });
  J["cab"] = b.joint("cab", { parent: J["body"], at: [0,1.25,0.4], dir: [0,0,1], role: "hinge", group: "cab" });
  J["gunYaw"] = b.joint("gunYaw", { parent: J["body"], at: [0,1.15,-1.9], dir: [0,1,0], role: "hinge", group: "gun" });
  J["gunPitch"] = b.joint("gunPitch", { parent: J["gunYaw"], at: [0,1.6,-1.9], dir: [0,0,1], role: "hinge", group: "gun" });
  J["thrusterFL"] = b.joint("thrusterFL", { parent: J["body"], at: [1.2,0.7,1.75], dir: [0,1,0], role: "hinge", group: "thrusters" });
  J["thrusterFR"] = b.joint("thrusterFR", { parent: J["body"], at: [-1.2,0.7,1.75], dir: [0,1,0], role: "hinge", group: "thrusters" });
  J["thrusterRL"] = b.joint("thrusterRL", { parent: J["body"], at: [1.2,0.7,-1.75], dir: [0,1,0], role: "hinge", group: "thrusters" });
  J["thrusterRR"] = b.joint("thrusterRR", { parent: J["body"], at: [-1.2,0.7,-1.75], dir: [0,1,0], role: "hinge", group: "thrusters" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
