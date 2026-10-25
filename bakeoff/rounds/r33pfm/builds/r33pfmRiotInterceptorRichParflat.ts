import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Riot Control Interceptor VX-9",
  "description": "A hulking corporate riot-control hover-truck in Cyberpunk 2077 style: armored matte-black hull, roof water cannon turret, glowing neon light bars and emissive corporate branding."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#2a2d36",
  hullLight: "#434856",
  hullDark: "#14161c",
  armor: "#1c1e25",
  hazardYellow: "#f2c614",
  hazardBlack: "#101010",
  glass: "#0b1a24",
  glassGlow: "#1d5a6e",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2bd6",
  neonRed: "#ff2a3c",
  neonBlue: "#2b5cff",
  tyre: "#0e0e11",
  rim: "#7b8190",
  metal: "#5b6270",
  water: "#7fe3ff",
  white: "#e8eef2",
  corpRed: "#d11a2a",
  warnOrange: "#ff8a1c",
  rubber: "#23252b",
};
const M = {
  chassisTop: [0, 1.5, 0] as [number, number, number],
  cabFloor: [0, 1.5, 1.1] as [number, number, number],
  bayFloor: [0, 1.5, -1.6] as [number, number, number],
  turretRing: [0, 2.15, -0.5] as [number, number, number],
  barrelMuzzle: [0, 2.45, 1.4] as [number, number, number],
  axleFront: [0, 0.55, 2] as [number, number, number],
  axleRear: [0, 0.55, -2] as [number, number, number],
  noseFront: [0, 0.9, 3.2] as [number, number, number],
  roofBar: [0, 2.3, 0.9] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassis
  (() => {
function buildChassis({ b, J, P }: any) {
  const bone = J.body;
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at: [x, y, z], ...o });
  const neon = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, s = 1.4) =>
    glow(box(w, h, d, color, x, y, z), s);
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, at: number[], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, ...o });

  // main slab: y 0.3..1.5
  box(2.3, 0.9, 5.4, P.hull, 0, 0.95, -0.3);
  // lower underbody plating and skid plate
  box(2.0, 0.2, 5.6, P.hullDark, 0, 0.35, 0);
  box(1.4, 0.06, 3.6, P.armor, 0, 0.27, 0);
  // top deck plate
  box(2.5, 0.12, 5.8, P.hullLight, 0, 1.44, 0);
  // wedge nose
  b.extrude([[0, 0.3], [0.9, 0.3], [0.9, 0.75], [0, 1.35]], {
    at: [-1.15, 0, 2.4], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.01, color: P.hull, bone,
  });
  b.part(new THREE.BoxGeometry(2.4, 0.25, 0.8), P.hull, { bone, at: [0, 1.2, 2.85], rotation: [-30, 0, 0] });
  box(2.5, 0.7, 0.5, P.hull, 0, 0.8, 2.95);
  // front bumper
  box(2.6, 0.35, 0.3, P.armor, 0, 0.55, 3.1);
  // bull-bar ram with hazard chevrons
  box(2.4, 0.18, 0.2, P.hullDark, 0, 0.95, 3.3);
  box(0.2, 0.6, 0.2, P.hullDark, 1.0, 0.75, 3.25);
  box(0.2, 0.6, 0.2, P.hullDark, -1.0, 0.75, 3.25);
  box(0.2, 0.6, 0.2, P.hullDark, 0, 0.75, 3.25);
  for (let i = 0; i < 8; i++) {
    const x = -1.05 + i * 0.3;
    box(0.14, 0.14, 0.04, i % 2 ? P.hazardBlack : P.hazardYellow, x, 0.95, 3.42, { rotation: [0, 0, 35] });
  }
  for (let i = 0; i < 8; i++) {
    const x = -1.05 + i * 0.3;
    box(0.14, 0.22, 0.04, i % 2 ? P.hazardBlack : P.hazardYellow, x, 0.55, 3.27, { rotation: [0, 0, 35] });
  }
  // headlights slits & light bar
  for (const s of [1, -1]) {
    neon(0.5, 0.07, 0.05, P.white, s * 0.8, 1.05, 3.22, 1.8);
    box(0.6, 0.14, 0.03, P.hullDark, s * 0.8, 1.05, 3.205);
  }
  neon(2.1, 0.06, 0.06, P.neonCyan, 0, 0.72, 3.27, 2);
  // tow hooks
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.08, 0.025, 5, 8), P.metal, { bone, at: [s * 0.55, 0.5, 3.28] });
    box(0.1, 0.1, 0.1, P.metal, s * 0.55, 0.5, 3.22);
  }
  // side skirts + neon strips
  for (const s of [1, -1]) {
    box(0.12, 0.35, 3.4, P.armor, s * 1.22, 0.55, 0);
    neon(0.04, 0.05, 3.3, P.neonMagenta, s * 1.29, 0.42, 0.0, 1.6);
    neon(0.04, 0.04, 3.3, P.neonCyan, s * 1.29, 0.5, 0.0, 1.4);
    // side panel plates and seams
    for (const z of [-2.2, -0.9, 0.9, 2.2]) box(0.03, 0.8, 0.04, P.hullDark, s * 1.16, 0.95, z);
    box(0.04, 0.05, 5.4, P.hullDark, s * 1.17, 1.2, -0.3);
    // wheel arches
    for (const z of [2, -2]) {
      box(0.35, 0.1, 1.4, P.armor, s * 1.2, 1.12, z);
      box(0.3, 0.7, 0.12, P.armor, s * 1.25, 0.8, z + 0.78);
      box(0.3, 0.7, 0.12, P.armor, s * 1.25, 0.8, z - 0.78);
      box(0.3, 0.1, 1.5, P.hullLight, s * 1.3, 1.17, z, { rotation: [0, 0, s * -12] });
      neon(0.05, 0.05, 1.3, P.neonMagenta, s * 1.4, 1.06, z, 1.5);
      // fender bolts
      for (const dz of [-0.6, 0.6]) cyl(0.04, 0.04, 0.05, 6, P.metal, [s * 1.47, 1.2, z + dz], { rotation: [0, 0, 90] });
    }
    // rear tail lights
    neon(0.8, 0.09, 0.05, P.neonRed, s * 0.7, 1.15, -3.18, 1.8);
    neon(0.3, 0.05, 0.05, P.warnOrange, s * 1.0, 0.85, -3.18, 1.4);
  }
  // rear bumper
  box(2.6, 0.35, 0.3, P.armor, 0, 0.55, -3.05);
  for (let i = 0; i < 8; i++) {
    box(0.14, 0.3, 0.04, i % 2 ? P.hazardBlack : P.hazardYellow, -1.05 + i * 0.3, 0.55, -3.21, { rotation: [0, 0, 35] });
  }
  neon(1.0, 0.04, 0.04, P.neonRed, 0, 0.82, -3.2, 1.6);
  // rear hooks
  for (const s of [1, -1]) box(0.1, 0.1, 0.18, P.metal, s * 0.7, 0.45, -3.25);
  // hood vents and grille on nose top
  for (let i = 0; i < 5; i++) box(0.5, 0.02, 0.05, P.hullDark, 0, 1.52, 1.5 + i * 0.12);
  for (let i = 0; i < 4; i++) box(1.4, 0.04, 0.03, P.hullDark, 0, 0.9 + i * 0.1, 3.23 - 0.0);
  // deck seams and rivets
  box(2.3, 0.02, 0.04, P.hullDark, 0, 1.51, 0.2);
  box(2.3, 0.02, 0.04, P.hullDark, 0, 1.51, -1.6);
  const r = new THREE.SphereGeometry(0.025, 5, 4);
  for (const s of [1, -1])
    for (let i = 0; i < 9; i++) b.part(r, P.metal, { bone, at: [s * 1.1, 1.51, -2.8 + i * 0.7] });
  // underside details
  for (let i = 0; i < 4; i++) box(1.8, 0.04, 0.08, P.armor, 0, 0.23, -1.5 + i * 1.0);
  // front ID plate
  box(0.5, 0.12, 0.03, P.white, 0, 0.5, 3.0);
  neon(0.4, 0.04, 0.03, P.corpRed, 0, 0.5, 3.02, 1.2);
}
    return buildChassis;
  })(),
  // cab
  (() => {
function buildCab({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, ...o });
  const gbox = (w: number, h: number, d: number, c: string, at: number[], s = 1, o: any = {}) =>
    glow(box(w, h, d, c, at, o), s);
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, at: number[], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at, ...o });

  // ---- main cab shell (z 0.2..2.6, y 1.5..2.3)
  box(2.3, 0.5, 2.4, P.hull, [0, 1.75, 1.4]); // lower body
  // hood sloping down to the nose
  b.frustumBox([0, 1.95, 1.9], [0, 1.95, 2.6], [2.3, 0.3], [2.1, 0.18], { bone, color: P.hullLight });
  box(2.2, 0.06, 0.7, P.hullDark, [0, 2.02, 2.25], { rotation: [-8, 0, 0] });
  // hood vents
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++) {
      box(0.5, 0.025, 0.04, P.hullDark, [s * 0.55, 2.07 - 0.012 * i, 2.1 + i * 0.12], { rotation: [-8, 0, 0] });
      box(0.46, 0.012, 0.015, P.neonCyan, [s * 0.55, 2.085 - 0.012 * i, 2.15 + i * 0.12], { rotation: [-8, 0, 0] });
    }
  // greenhouse (upper cabin)
  box(2.1, 0.42, 1.35, P.hullLight, [0, 2.06, 0.95]);
  // roof panel
  box(2.05, 0.08, 1.2, P.armor, [0, 2.31, 0.85]);
  box(2.15, 0.04, 1.3, P.hullDark, [0, 2.26, 0.85]);
  // sloped windscreen
  const ws = box(1.8, 0.62, 0.06, P.glass, [0, 2.0, 1.62], { rotation: [38, 0, 0] });
  box(1.9, 0.05, 0.08, P.armor, [0, 2.3, 1.45], { rotation: [38, 0, 0] });
  box(1.9, 0.05, 0.08, P.armor, [0, 1.7, 1.78], { rotation: [38, 0, 0] });
  // glass reflection strips
  for (const [x, w] of [[-0.45, 0.07], [-0.3, 0.025], [0.5, 0.05]] as number[][])
    glow(box(w, 0.5, 0.01, P.glassGlow, [x, 2.0, 1.645], { rotation: [38, 0, 0] }), 0.8);
  // wipers
  for (const s of [1, -1]) {
    box(0.55, 0.015, 0.02, P.hullDark, [s * 0.45, 1.8, 1.72], { rotation: [38, 0, s * 12] });
  }
  // A-pillars
  for (const s of [1, -1]) {
    box(0.1, 0.7, 0.1, P.armor, [s * 1.0, 2.0, 1.6], { rotation: [38, 0, 0] });
    box(0.08, 0.5, 0.1, P.armor, [s * 1.05, 2.05, 0.3]);
  }

  // ---- side details
  for (const s of [1, -1]) {
    const x = s * 1.08;
    // slit side windows with frames
    box(0.04, 0.2, 0.95, P.armor, [x, 2.1, 0.95]);
    box(0.045, 0.14, 0.85, P.glass, [x + s * 0.005, 2.1, 0.95]);
    glow(box(0.047, 0.015, 0.7, P.glassGlow, [x + s * 0.006, 2.14, 0.95]), 0.8);
    // door seams
    box(0.02, 0.5, 0.025, P.hullDark, [s * 1.155, 1.78, 1.55]);
    box(0.02, 0.5, 0.025, P.hullDark, [s * 1.155, 1.78, 0.5]);
    box(0.02, 0.025, 1.05, P.hullDark, [s * 1.155, 1.54, 1.03]);
    box(0.02, 0.025, 1.05, P.hullDark, [s * 1.155, 2.0, 1.03]);
    // handle
    box(0.05, 0.04, 0.2, P.metal, [s * 1.175, 1.93, 0.65]);
    // logo: hex + bars
    const hx = s * 1.165;
    const hex = (r: number, c: string, g: number) =>
      glow(b.part(new THREE.CylinderGeometry(r, r, 0.012, 6), c, { bone, at: [hx, 1.78, 1.05], dir: [s, 0, 0], rotation: undefined as any }), g);
    b.part(new THREE.CylinderGeometry(0.19, 0.19, 0.01, 6), P.hullDark, { bone, at: [hx, 1.78, 1.05], dir: [s, 0, 0] });
    hex(0.16, P.corpRed, 1.2);
    b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.012, 6), P.white, { bone, at: [hx + s * 0.004, 1.78, 1.05], dir: [s, 0, 0] });
    for (let i = 0; i < 3; i++)
      gbox(0.012, 0.03, 0.12 + 0.04 * i, P.white, [hx, 1.66 + 0.06 * i - 0.0, 1.0 - 0.0 + (i ? 0 : 0) - 0.3 + 0.0], 1);
    gbox(0.012, 0.025, 0.22, P.white, [hx, 1.58, 1.05], 1);
    // mirror
    const mx = s * 1.25;
    box(0.2, 0.025, 0.04, P.armor, [s * 1.17, 2.12, 1.5]);
    box(0.08, 0.2, 0.14, P.armor, [mx, 2.1, 1.5]);
    gbox(0.01, 0.12, 0.02, P.neonCyan, [mx + s * 0.045, 2.1, 1.55], 1.2);
    gbox(0.012, 0.012, 0.012, P.warnOrange, [mx + s * 0.045, 2.2, 1.45], 1.5);
    // cyan trim along sill
    gbox(0.012, 0.02, 2.2, P.neonCyan, [s * 1.155, 1.53, 1.35], 1);
    // hazard sills near roof edge
    box(0.06, 0.05, 1.3, P.hazardYellow, [s * 1.07, 2.27, 0.9]);
    for (let i = 0; i < 6; i++)
      box(0.065, 0.052, 0.07, P.hazardBlack, [s * 1.07, 2.27, 0.4 + i * 0.2], { rotation: [0, 0, 0] });
  }

  // seat silhouette behind glass
  box(0.5, 0.35, 0.12, P.hullDark, [0.4, 2.0, 0.55]);
  box(0.5, 0.35, 0.12, P.hullDark, [-0.4, 2.0, 0.55]);
  box(0.2, 0.12, 0.12, P.hullDark, [0.4, 2.22, 0.55]);
  box(0.2, 0.12, 0.12, P.hullDark, [-0.4, 2.22, 0.55]);
  // dashboard
  box(1.8, 0.1, 0.3, P.hullDark, [0, 1.78, 1.5]);

  // ---- roof light bar at roofBar (z 0.9, y 2.3)
  box(1.7, 0.06, 0.26, P.armor, [0, 2.38, M.roofBar[2]]);
  const segs = 8;
  for (let i = 0; i < segs; i++) {
    const x = -0.75 + (1.5 * i) / (segs - 1);
    const left = i < segs / 2;
    gbox(0.17, 0.07, 0.22, left ? P.neonRed : P.neonBlue, [x, 2.43, M.roofBar[2]], 1.6);
    box(0.02, 0.075, 0.24, P.armor, [x + 0.095, 2.43, M.roofBar[2]]);
  }
  for (const s of [1, -1]) {
    cyl(0.05, 0.06, 0.06, 6, P.armor, [s * 0.95, 2.38, 0.5]);
    gbox(0.06, 0.05, 0.06, P.warnOrange, [s * 0.95, 2.43, 0.5], 1.8);
    cyl(0.05, 0.06, 0.06, 6, P.armor, [s * 0.95, 2.38, 1.3]);
    gbox(0.06, 0.05, 0.06, P.warnOrange, [s * 0.95, 2.43, 1.3], 1.8);
  }

  // ---- antennas
  for (const [x, z, h] of [[-0.95, 0.3, 0.6], [0.95, 0.3, 0.4]] as number[][]) {
    cyl(0.012, 0.02, h, 6, P.metal, [x, 2.35 + h / 2, z]);
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), P.neonRed, { bone, at: [x, 2.37 + h, z] }), 2);
  }

  // ---- nose face of cab: cowl lights
  gbox(1.6, 0.02, 0.02, P.neonCyan, [0, 1.62, 2.62], 1);
  box(2.2, 0.06, 0.08, P.armor, [0, 1.56, 2.6]);

  // little rivets on the roof
  for (let i = 0; i < 10; i++)
    b.part(new THREE.SphereGeometry(0.018, 5, 4), P.metal, {
      bone, at: [(R() - 0.5) * 1.8, 2.36, 0.4 + R() * 0.9 + (R() > 2 ? 0 : 0)],
    });
  void ws;
}
    return buildCab;
  })(),
  // bay
  (() => {
function buildBay({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number, color: string, at: [number, number, number], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...o });
  const lit = (w: number, h: number, d: number, color: string, at: [number, number, number], s = 1) =>
    glow(box(w, h, d, color, at), s);
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, at: [number, number, number], dir: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, dir });

  const X0 = 1.25, Y0 = 1.5, Y1 = 2.5, Z0 = -3.15, Z1 = 0.2;
  const cx = 0, cy = (Y0 + Y1) / 2, cz = (Z0 + Z1) / 2, W = 2 * X0, H = Y1 - Y0, D = Z1 - Z0;

  // main body
  box(W - 0.06, H - 0.1, D, P.hull, [cx, cy - 0.03, cz]);
  box(W, 0.3, D, P.hullDark, [cx, Y0 + 0.15, cz]);
  // roof slab (leaves turret ring clear)
  box(W - 0.1, 0.06, D - 0.1, P.hullLight, [cx, Y1 - 0.02, cz]);
  // roof ribs
  for (let i = 0; i < 6; i++) {
    const z = -2.9 + i * 0.55;
    if (Math.abs(z - -0.5) < 0.55) continue;
    box(W - 0.2, 0.05, 0.07, P.armor, [0, Y1 + 0.03, z]);
  }
  // corner pillars
  for (const sx of [1, -1])
    for (const z of [Z0 + 0.05, Z1 - 0.05]) box(0.14, H, 0.14, P.armor, [sx * (X0 - 0.05), cy, z]);

  // side details
  for (const s of [1, -1]) {
    const x = s * X0;
    // panel seams
    for (let i = 0; i < 5; i++) box(0.02, H - 0.35, 0.025, P.hullDark, [x, cy + 0.08, -2.7 + i * 0.7]);
    box(0.02, 0.025, D - 0.2, P.hullDark, [x, cy - 0.05, cz]);
    // rivets
    for (let i = 0; i < 12; i++)
      for (const y of [Y0 + 0.4, Y1 - 0.12])
        b.part(new THREE.SphereGeometry(0.02, 5, 4), P.metal, { bone, at: [x + s * 0.01, y, -3.0 + i * 0.26] });
    // neon trim along upper edge
    lit(0.03, 0.04, D - 0.3, P.neonCyan, [x + s * 0.01, Y1 - 0.08, cz], 1.4);
    // vent grilles with red slits
    for (const z of [-2.4, -1.5]) {
      box(0.04, 0.4, 0.5, P.armor, [x + s * 0.01, Y0 + 0.5, z]);
      for (let k = 0; k < 5; k++) lit(0.03, 0.025, 0.42, P.neonRed, [x + s * 0.035, Y0 + 0.34 + k * 0.08, z], 1.3);
    }
    // logo: hex + bars
    const lz = -0.55, ly = Y0 + 0.62;
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 6), P.hullDark, { bone, at: [x + s * 0.02, ly, lz], dir: [s, 0, 0] });
    glow(b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.03, 6), P.corpRed, { bone, at: [x + s * 0.035, ly, lz], dir: [s, 0, 0] }), 1.3);
    lit(0.03, 0.04, 0.2, P.white, [x + s * 0.05, ly, lz], 1.5);
    // RIOT id block: bars
    box(0.03, 0.22, 0.8, P.armor, [x + s * 0.02, ly + 0.02, -1.55]);
    for (let k = 0; k < 4; k++) {
      lit(0.03, 0.14, 0.05, P.white, [x + s * 0.045, ly + 0.02, -1.85 + k * 0.17 + (k > 1 ? 0.05 : 0)], 1.4);
    }
    lit(0.03, 0.03, 0.7, P.white, [x + s * 0.045, ly - 0.07, -1.55], 1.2);
    // hazard chevrons lower side
    for (let i = 0; i < 9; i++)
      box(0.025, 0.1, 0.2, i % 2 ? P.hazardBlack : P.hazardYellow, [x + s * 0.01, Y0 + 0.07, -3.0 + i * 0.3], { rotation: [0, 0, 0] });
  }

  // rear face
  const zr = Z0 - 0.01;
  box(2.1, 0.85, 0.05, P.armor, [0, cy - 0.02, zr]);
  box(0.03, 0.85, 0.06, P.hullDark, [0, cy - 0.02, zr - 0.02]);
  for (const s of [1, -1]) {
    box(0.95, 0.75, 0.04, P.hullLight, [s * 0.5, cy - 0.02, zr - 0.04]);
    box(0.04, 0.3, 0.06, P.metal, [s * 0.1, cy - 0.02, zr - 0.08]);
    // tail lights
    lit(0.18, 0.1, 0.04, P.neonRed, [s * 1.0, Y0 + 0.9, zr - 0.04], 1.6);
    lit(0.18, 0.04, 0.04, P.warnOrange, [s * 1.0, Y0 + 0.78, zr - 0.04], 1.2);
    // hinges
    for (const y of [Y0 + 0.3, Y0 + 0.75]) cyl(0.03, 0.03, 0.12, 6, P.metal, [s * 1.02, y, zr - 0.05], [0, 1, 0]);
  }
  box(0.5, 0.07, 0.04, P.glass, [0.5, cy + 0.2, zr - 0.07]);
  glow(box(0.4, 0.025, 0.02, P.glassGlow, [0.5, cy + 0.2, zr - 0.09]), 1);
  // rear hazard band
  for (let i = 0; i < 12; i++)
    box(0.2, 0.14, 0.03, i % 2 ? P.hazardBlack : P.hazardYellow, [-1.1 + i * 0.2, Y0 + 0.1, zr - 0.04], { rotation: [0, 0, 20] });
  // license plate
  box(0.5, 0.17, 0.03, P.white, [0, Y0 + 0.5, zr - 0.07]);
  for (let i = 0; i < 5; i++) lit(0.05, 0.1, 0.02, i % 2 ? P.neonMagenta : P.neonCyan, [-0.18 + i * 0.09, Y0 + 0.5, zr - 0.09], 1.5);
  lit(0.9, 0.03, 0.03, P.neonCyan, [0, Y1 - 0.1, zr - 0.04], 1.4);

  // front wall: neon seam where cab meets
  lit(2.0, 0.03, 0.03, P.neonCyan, [0, Y1 - 0.12, Z1 - 0.02], 1.2);

  // roof deck: water tank at the rear
  const tz = -2.4;
  b.part(new THREE.CylinderGeometry(0.45, 0.45, 1.5, 10), P.metal, { bone, at: [0, Y1 + 0.5, tz], dir: [1, 0, 0] });
  for (const dx of [-0.55, -0.2, 0.2, 0.55]) b.part(new THREE.CylinderGeometry(0.47, 0.47, 0.06, 10), P.armor, { bone, at: [dx, Y1 + 0.5, tz], dir: [1, 0, 0] });
  for (const dx of [-0.6, 0.6]) box(0.12, 0.2, 0.9, P.armor, [dx, Y1 + 0.12, tz]);
  lit(0.5, 0.05, 0.05, P.water, [0, Y1 + 0.95, tz], 1.4);
  box(0.3, 0.1, 0.3, P.hazardYellow, [0, Y1 + 0.97, tz + 0.3]);
  // hose reels
  for (const s of [1, -1]) {
    const rx = s * 0.9, rz = -1.7;
    b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.22, 10), P.hazardYellow, { bone, at: [rx, Y1 + 0.3, rz], dir: [1, 0, 0] });
    cyl(0.1, 0.1, 0.3, 6, P.metal, [rx, Y1 + 0.3, rz], [1, 0, 0]);
    for (const dz of [-0.2, 0.2]) box(0.04, 0.5, 0.06, P.armor, [rx + s * 0.13, Y1 + 0.25, rz + dz]);
    b.sweep(
      [[rx, Y1 + 0.3, rz + 0.1], [rx + s * 0.05, Y1 + 0.4, rz + 0.3], [rx * 0.6, Y1 + 0.15, -1.2], [0.3 * s, Y1 + 0.1, -0.9]],
      0.035,
      { color: P.rubber, bone, sides: 6 },
    );
    // coil wraps
    for (let k = 0; k < 3; k++) {
      b.part(new THREE.TorusGeometry(0.27 + k * 0.01, 0.025, 4, 10), P.rubber, { bone, at: [rx + (k - 1) * 0.07, Y1 + 0.3, rz], dir: [1, 0, 0], axis: "z" });
    }
  }
  // supply pipe from tank forward (toward turret)
  b.sweep([[0, Y1 + 0.5, tz + 0.45], [0, Y1 + 0.55, -1.5], [0, Y1 + 0.35, -1.1]], 0.05, { color: P.rubber, bone, sides: 6 });
  cyl(0.07, 0.07, 0.1, 6, P.metal, [0, Y1 + 0.35, -1.1], [0, 0, 1]);

  // roof cyan neon edge lines
  for (const s of [1, -1]) lit(0.04, 0.03, D - 0.3, P.neonCyan, [s * (X0 - 0.12), Y1 + 0.02, cz], 1.3);

  // amber beacon rear
  cyl(0.14, 0.16, 0.06, 8, P.armor, [0.8, Y1 + 0.03, -2.95], [0, 1, 0]);
  glow(b.part(new THREE.SphereGeometry(0.13, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), P.warnOrange, { bone, at: [0.8, Y1 + 0.06, -2.95] }), 1.6);
  // antennas
  for (const [ax, az, hh] of [[-0.95, -1.0, 0.9], [-0.8, -2.9, 0.6], [1.0, -0.2, 0.5]] as const) {
    cyl(0.012, 0.02, hh, 5, P.metal, [ax, Y1 + hh / 2, az], [0, 1, 0]);
    glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), P.neonRed, { bone, at: [ax, Y1 + hh, az] }), 1.6);
  }
  // roof vent boxes
  for (let i = 0; i < 3; i++) {
    box(0.4, 0.08, 0.25, P.armor, [-0.6 + (i % 2) * 0.1, Y1 + 0.07, -0.9 + i * 0.2 - 0.3]);
  }
  void R; void frame;
}
    return buildBay;
  })(),
  // turret
  (() => {
function buildTurret({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const yaw = J.turretYaw;
  const cannon = J.cannon;
  const [cx, cy, cz] = M.turretRing;

  const cyl = (rt: number, rb: number, h: number, n: number) => new THREE.CylinderGeometry(rt, rb, h, n);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  // Cannon barrel axis runs along +Z. Rotate cylinder (Y axis) to Z.
  const barrelAt = (z: number, y = 2.45) => [0, y, z] as [number, number, number];
  const zcyl = (rt: number, rb: number, len: number, n: number, color: string, z: number, bone = cannon, y = 2.45) =>
    b.part(cyl(rt, rb, len, n), color, { bone, at: barrelAt(z, y), dir: [0, 0, 1], flat: true });

  // ---- Fixed base ring (on body) ----
  b.part(cyl(0.55, 0.6, 0.1, 16), P.armor, { bone: J.body, at: [cx, cy + 0.05, cz], flat: true });
  b.part(cyl(0.5, 0.5, 0.04, 16), P.hullDark, { bone: J.body, at: [cx, cy + 0.12, cz], flat: true });
  glow(b.part(cyl(0.585, 0.585, 0.025, 20), P.neonCyan, { bone: J.body, at: [cx, cy + 0.04, cz], flat: true }), 1.6);
  // toothed collar
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    b.part(box(0.07, 0.06, 0.05), P.metal, {
      bone: J.body,
      at: [cx + Math.sin(a) * 0.5, cy + 0.15, cz + Math.cos(a) * 0.5],
      rotation: [0, (a * 180) / Math.PI, 0],
    });
  }

  // ---- Yaw pod ----
  b.part(cyl(0.44, 0.48, 0.2, 10), P.hull, { bone: yaw, at: [cx, cy + 0.25, cz], flat: true });
  b.part(cyl(0.38, 0.44, 0.14, 10), P.hullLight, { bone: yaw, at: [cx, cy + 0.42, cz], flat: true });
  b.part(cyl(0.2, 0.3, 0.06, 10), P.armor, { bone: yaw, at: [cx, cy + 0.52, cz], flat: true });
  // armor plates around drum
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    b.part(box(0.2, 0.18, 0.04), i % 2 ? P.armor : P.hullDark, {
      bone: yaw,
      at: [cx + Math.sin(a) * 0.47, cy + 0.27, cz + Math.cos(a) * 0.47],
      rotation: [0, (a * 180) / Math.PI, 0],
    });
  }
  // hazard stripes on drum rim
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.part(box(0.1, 0.03, 0.03), i % 2 ? P.hazardYellow : P.hazardBlack, {
      bone: yaw,
      at: [cx + Math.sin(a) * 0.46, cy + 0.38, cz + Math.cos(a) * 0.46],
      rotation: [0, (a * 180) / Math.PI, 0],
    });
  }

  // ---- Pitch cradle: side brackets ----
  for (const s of [1, -1]) {
    b.part(box(0.1, 0.34, 0.5), P.hull, { bone: yaw, at: [s * 0.3, 2.5, -0.2] });
    b.part(box(0.04, 0.3, 0.44), P.hullLight, { bone: yaw, at: [s * 0.36, 2.5, -0.2] });
    b.part(cyl(0.06, 0.06, 0.14, 8), P.metal, { bone: yaw, at: [s * 0.33, 2.45, -0.2], dir: [1, 0, 0] });
    // hydraulic pistons
    b.rod([s * 0.36, 2.27, -0.5], [s * 0.3, 2.42, 0.0], 0.03, P.rim, { bone: yaw });
    b.rod([s * 0.3, 2.42, 0.0], [s * 0.28, 2.5, 0.2], 0.018, P.white, { bone: cannon });
    b.part(new THREE.SphereGeometry(0.04, 6, 4), P.warnOrange, { bone: yaw, at: [s * 0.36, 2.27, -0.5] });
  }

  // ---- Breech block ----
  b.part(box(0.46, 0.4, 0.5), P.hullDark, { bone: cannon, at: [0, 2.45, -0.3] });
  b.part(box(0.4, 0.06, 0.46), P.hullLight, { bone: cannon, at: [0, 2.66, -0.3] });
  for (const s of [1, -1]) {
    glow(b.part(box(0.02, 0.04, 0.34), P.neonCyan, { bone: cannon, at: [s * 0.235, 2.5, -0.3] }), 1.5);
  }

  // ---- Barrel ----
  zcyl(0.19, 0.21, 0.5, 10, P.hull, 0.15);
  zcyl(0.17, 0.17, 1.0, 10, P.metal, 0.75);
  // hazard-striped section
  for (let i = 0; i < 4; i++) {
    zcyl(0.178, 0.178, 0.1, 10, i % 2 ? P.hazardBlack : P.hazardYellow, 0.3 + i * 0.1 + 0.55);
  }
  // reinforcement bands
  for (const z of [0.05, 0.5, 0.95]) {
    zcyl(0.215, 0.215, 0.07, 10, P.armor, z);
    zcyl(0.222, 0.222, 0.012, 10, P.hazardYellow, z + 0.045);
  }
  // barrel spine rail with lights
  b.part(box(0.06, 0.04, 0.9), P.armor, { bone: cannon, at: [0, 2.665, 0.55] });
  for (let i = 0; i < 4; i++) {
    glow(b.part(box(0.04, 0.02, 0.06), P.neonCyan, { bone: cannon, at: [0, 2.69, 0.25 + i * 0.22] }), 1.5);
  }

  // ---- Nozzle ----
  zcyl(0.2, 0.26, 0.2, 10, P.armor, 1.3);
  zcyl(0.27, 0.27, 0.06, 10, P.metal, 1.4);
  glow(zcyl(0.285, 0.285, 0.03, 10, P.neonCyan, 1.4), 1.8);
  const core = zcyl(0.17, 0.17, 0.04, 10, P.water, M.barrelMuzzle[2] + 0.02);
  glow(core, 2.0);
  zcyl(0.1, 0.1, 0.05, 8, P.white, 1.44);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.part(box(0.04, 0.06, 0.06), P.rim, {
      bone: cannon,
      at: [Math.sin(a) * 0.26, 2.45 + Math.cos(a) * 0.26, 1.42],
      rotation: [0, 0, (-a * 180) / Math.PI],
    });
  }

  // ---- Sensor camera on pod side ----
  b.part(box(0.14, 0.12, 0.16), P.armor, { bone: yaw, at: [-0.28, 2.72, -0.1] });
  b.part(cyl(0.045, 0.045, 0.08, 8), P.hullDark, { bone: yaw, at: [-0.28, 2.72, 0.02], dir: [0, 0, 1], flat: true });
  glow(b.part(cyl(0.032, 0.032, 0.02, 8), P.neonRed, { bone: yaw, at: [-0.28, 2.72, 0.065], dir: [0, 0, 1] }), 2);
  // warning light
  b.part(cyl(0.05, 0.06, 0.04, 8), P.armor, { bone: yaw, at: [0.28, 2.7, -0.7], flat: true });
  glow(b.part(new THREE.SphereGeometry(0.05, 8, 5), P.warnOrange, { bone: yaw, at: [0.28, 2.74, -0.7] }), 2);

  // ---- Supply hose from rear tank into pod ----
  const hose = [
    [0, 2.25, -1.15],
    [0.12, 2.6, -1.1],
    [0.15, 2.68, -0.8],
    [0.0, 2.6, -0.55],
  ];
  b.sweep(hose, 0.045, { bone: yaw, color: P.rubber, sides: 6 });
  for (const t of [0.2, 0.5, 0.8]) {
    const p = hose[Math.min(3, Math.round(t * 3))];
    b.part(cyl(0.06, 0.06, 0.04, 6), P.metal, { bone: yaw, at: [p[0], p[1], p[2]], flat: true });
  }
  b.part(box(0.2, 0.1, 0.12), P.metal, { bone: yaw, at: [0, 2.2, -1.15] });
  glow(b.part(box(0.12, 0.02, 0.04), P.water, { bone: yaw, at: [0, 2.26, -1.15] }), 1.3);
}
    return buildTurret;
  })(),
  // wheels
  (() => {
function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.55;
  const W = 0.5;
  const rand = rng(11);

  const wheelDefs: { joint: any; s: number; z: number }[] = [
    { joint: J.wheelFL, s: 1, z: M.axleFront[2] },
    { joint: J.wheelFR, s: -1, z: M.axleFront[2] },
    { joint: J.wheelRL, s: 1, z: M.axleRear[2] },
    { joint: J.wheelRR, s: -1, z: M.axleRear[2] },
  ];

  // Cylinder along the X axis helper: cylinders are along Y, so aim with dir [1,0,0]
  const cyl = (rt: number, rb: number, h: number, seg: number) => new THREE.CylinderGeometry(rt, rb, h, seg);

  wheelDefs.forEach(({ joint, s, z }, wi) => {
    const cx = 1.15 * s;
    const cy = R;
    const X: [number, number, number] = [s, 0, 0];
    const at = (dx: number, dy = 0, dz = 0): [number, number, number] => [cx + dx * s, cy + dy, z + dz];

    // Tyre: faceted main + shoulders
    b.part(cyl(R, R, W, 14), P.tyre, { bone: joint, at: at(0), dir: X, flat: true });
    b.part(cyl(R * 0.93, R * 0.97, 0.06, 14), P.rubber, { bone: joint, at: at(0.26), dir: X, flat: true });
    b.part(cyl(R * 0.93, R * 0.97, 0.06, 14), P.rubber, { bone: joint, at: at(-0.26), dir: X, flat: true });

    // Tread blocks around circumference
    const blocks = 14;
    for (let i = 0; i < blocks; i++) {
      const a = (i / blocks) * Math.PI * 2 + (wi % 2) * 0.1;
      const py = Math.cos(a) * (R + 0.015);
      const pz = Math.sin(a) * (R + 0.015);
      b.part(new THREE.BoxGeometry(W * 0.86, 0.06, 0.12), P.hullDark, {
        bone: joint,
        at: [cx, cy + py, z + pz],
        dir: [0, Math.cos(a), Math.sin(a)],
        flat: true,
      });
    }

    // Rim ring and outer disc
    const ox = 0.255;
    b.part(cyl(R * 0.66, R * 0.66, 0.05, 12), P.rim, { bone: joint, at: at(ox), dir: X, flat: true });
    b.part(cyl(R * 0.5, R * 0.55, 0.05, 12), P.metal, { bone: joint, at: at(ox + 0.03), dir: X, flat: true });
    // Inner lip
    b.part(cyl(R * 0.6, R * 0.6, 0.04, 12), P.metal, { bone: joint, at: at(-ox), dir: X, flat: true });

    // Neon ring on face
    glow(
      b.part(new THREE.TorusGeometry(R * 0.4, 0.014, 5, 16), wi % 2 ? P.neonCyan : P.neonMagenta, {
        bone: joint,
        at: at(ox + 0.062),
        dir: X,
        axis: "z",
      }),
      1.6,
    );

    // Hub
    b.part(cyl(0.13, 0.15, 0.1, 8), P.hullLight, { bone: joint, at: at(ox + 0.08), dir: X, flat: true });
    b.part(cyl(0.05, 0.05, 0.05, 6), P.hullDark, { bone: joint, at: at(ox + 0.15), dir: X, flat: true });

    // Lug nuts
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(cyl(0.025, 0.025, 0.04, 6), P.white, {
        bone: joint,
        at: at(ox + 0.1, Math.cos(a) * 0.2, Math.sin(a) * 0.2),
        dir: X,
        flat: true,
      });
    }

    // Spokes between hub and rim
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.3;
      const mid = R * 0.36;
      b.part(new THREE.BoxGeometry(0.04, R * 0.3, 0.075), P.metal, {
        bone: joint,
        at: [cx + ox * s + 0.03 * s, cy + Math.cos(a) * mid, z + Math.sin(a) * mid],
        dir: [0, Math.cos(a), Math.sin(a)],
        flat: true,
      });
    }

    // Brake disc (inner side) + red caliper
    b.part(cyl(R * 0.5, R * 0.5, 0.03, 14), P.metal, { bone: joint, at: at(-0.2), dir: X, flat: true });
    b.part(new THREE.BoxGeometry(0.1, 0.16, 0.2), P.corpRed, {
      bone: joint,
      at: [cx - 0.2 * s, cy + 0.0, z + 0.34 * (wi < 2 ? 1 : -1) * 0],
      flat: true,
    });
    const ca = wi < 2 ? 0.9 : -0.9;
    b.part(new THREE.BoxGeometry(0.09, 0.2, 0.14), P.corpRed, {
      bone: joint,
      at: [cx - 0.2 * s, cy + Math.cos(ca) * 0.34, z + Math.sin(ca) * 0.34],
      rotation: [(ca * 180) / Math.PI - 90, 0, 0],
      flat: true,
    });

    // Axle stub toward the chassis
    const ix = 1.15 * s - 0.25 * s;
    b.part(cyl(0.07, 0.07, 0.5, 8), P.metal, { bone: joint, at: [cx - 0.5 * s, cy, z], dir: X, flat: true });
    // Suspension arms (sweeps) up to the chassis
    const inner = [1.0 * s, 1.0, z];
    b.sweep(
      [
        [cx - 0.42 * s, cy, z],
        [cx - 0.55 * s, cy + 0.3, z + 0.12],
        [inner[0] * 0.9, 1.0, z + 0.1],
      ],
      0.045,
      { bone: joint, color: P.metal, sides: 6 },
    );
    b.sweep(
      [
        [cx - 0.42 * s, cy - 0.05, z],
        [cx - 0.55 * s, cy + 0.2, z - 0.16],
        [inner[0] * 0.9, 0.95, z - 0.18],
      ],
      0.04,
      { bone: joint, color: P.hullLight, sides: 6 },
    );
    // Shock absorber
    b.rod([cx - 0.5 * s, cy + 0.05, z + 0.0], [cx - 0.38 * s, 1.05, z - 0.02], 0.03, P.warnOrange, {
      bone: joint,
    });

    // Mud flap behind the wheel
    const back = wi < 2 ? -1 : -1;
    const fz = z + back * (R + 0.08);
    b.part(new THREE.BoxGeometry(0.4, 0.34, 0.03), P.rubber, { bone: joint, at: [cx, 0.42, fz], flat: true });
    // hazard marks
    for (let k = 0; k < 3; k++) {
      b.part(new THREE.BoxGeometry(0.07, 0.05, 0.036), k % 2 ? P.hazardBlack : P.hazardYellow, {
        bone: joint,
        at: [cx - 0.12 + k * 0.12, 0.3, fz + back * 0.002],
        rotation: [0, 0, 30],
        flat: true,
      });
    }
    // small neon edge on flap
    glow(
      b.part(new THREE.BoxGeometry(0.34, 0.012, 0.036), wi % 2 ? P.neonMagenta : P.neonCyan, {
        bone: joint,
        at: [cx, 0.25, fz],
      }),
      1.3,
    );
  });
}
    return buildWheels;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "riotInterceptor" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1,0], dir: [0,0,1], role: "spine" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.15,0.55,2], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.15,0.55,2], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelRL"] = b.joint("wheelRL", { parent: J["body"], at: [1.15,0.55,-2], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelRR"] = b.joint("wheelRR", { parent: J["body"], at: [-1.15,0.55,-2], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["turretYaw"] = b.joint("turretYaw", { parent: J["body"], at: [0,2.15,-0.5], dir: [0,1,0], role: "hinge", group: "turret" });
  J["cannon"] = b.joint("cannon", { parent: J["turretYaw"], at: [0,2.45,-0.2], dir: [0,0,1], role: "hinge", group: "turret" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
