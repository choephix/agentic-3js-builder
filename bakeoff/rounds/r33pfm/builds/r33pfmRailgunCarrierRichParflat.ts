import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Six-Wheeled Railgun Carrier",
  "description": "A low-poly sci-fi military six-wheeled heavy carrier with a long electromagnetic railgun on its back, braced on four hydraulic stabiliser legs."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#4a5240",
  hullDark: "#2f352b",
  hullLight: "#6b7560",
  armor: "#3b4250",
  trim: "#e7b814",
  warning: "#e8661c",
  tire: "#17191c",
  rim: "#8a919b",
  steel: "#9aa3ad",
  darkMetal: "#262a30",
  neonCyan: "#2ff3ff",
  glass: "#14323f",
  white: "#e9ece8",
  red: "#c0322b",
  hydraulic: "#c9ced4",
  rubber: "#0e0f11",
};
const M = {
  deckTop: [0, 1.7, -1] as [number, number, number],
  cabFloor: [0, 1, 3] as [number, number, number],
  railgunPivot: [0, 2.3, -0.6] as [number, number, number],
  breechMount: [0, 2.3, -3.2] as [number, number, number],
  muzzle: [0, 2.3, 5.4] as [number, number, number],
  axleFront: [0, 0.7, 3.2] as [number, number, number],
  axleMid: [0, 0.7, 0.2] as [number, number, number],
  axleRear: [0, 0.7, -2.8] as [number, number, number],
  legFrontL: [1.9, 1.2, 2] as [number, number, number],
  legFrontR: [-1.9, 1.2, 2] as [number, number, number],
  legRearL: [1.9, 1.2, -3.4] as [number, number, number],
  legRearR: [-1.9, 1.2, -3.4] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassis
  (() => {
function buildChassis({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);

  const box = (w: number, h: number, d: number, color: string, at: [number, number, number], rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, rotation: rot, flat: true });
  const cyl = (rt: number, rb: number, h: number, sides: number, color: string, at: [number, number, number], rot?: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, sides), color, { bone, at, rotation: rot, flat: true });

  // Lower tub (chamfered with a tapered lower skirt) from z=-5 to 1.6
  box(3.4, 0.55, 6.5, P.hull, [0, 1.15, -1.7]);
  box(3.0, 0.2, 6.4, P.hullDark, [0, 0.95, -1.7]);
  // chamfer strips along the bottom edges
  for (const s of [1, -1]) {
    box(0.22, 0.3, 6.5, P.hull, [s * 1.7, 1.0, -1.7], [0, 0, s * 35]);
  }
  // upper deck plates
  box(3.6, 0.14, 6.5, P.hullLight, [0, 1.68, -1.7]);
  // raised panel seams
  for (let i = 0; i < 8; i++) {
    box(3.5, 0.03, 0.05, P.hullDark, [0, 1.76, -4.7 + i * 0.85]);
  }
  for (const x of [-1.2, 1.2]) box(0.05, 0.03, 6.3, P.hullDark, [x, 1.76, -1.7]);
  // deck chamfer sides
  for (const s of [1, -1]) {
    box(0.2, 0.14, 6.5, P.hull, [s * 1.82, 1.62, -1.7], [0, 0, s * -30]);
  }

  // side skirts above wheels + arch frames
  const axles = [3.2, 0.2, -2.8];
  for (const s of [1, -1]) {
    box(0.12, 0.5, 6.4, P.hull, [s * 1.9, 1.3, -1.8]);
    for (const z of axles) {
      if (z > 1.6) continue; // front arch belongs to the cab
      // arch frame: top and fore/aft posts
      box(0.14, 0.12, 1.7, P.hullDark, [s * 1.93, 1.43, z]);
      for (const d of [-0.88, 0.88]) box(0.14, 0.4, 0.12, P.hullDark, [s * 1.93, 1.2, z + d]);
      // wheel arch angled corners
      box(0.14, 0.12, 0.4, P.hullDark, [s * 1.93, 1.36, z + 0.72], [s * 0, 0, 0]);
    }
    // hazard sill stripe
    for (let i = 0; i < 14; i++) {
      const z = -4.8 + i * 0.47;
      if (Math.abs(z - 0.2) < 0.9 || Math.abs(z + 2.8) < 0.9) continue;
      box(0.06, 0.09, 0.22, i % 2 ? P.trim : P.darkMetal, [s * 1.97, 0.98, z], [30, 0, 0]);
    }
    // white unit number panel and digits
    box(0.03, 0.26, 0.9, P.white, [s * 1.97, 1.45, -1.1]);
    for (let k = 0; k < 3; k++) box(0.035, 0.16, 0.06, P.hullDark, [s * 1.99, 1.45, -1.35 + k * 0.25]);
    // side equipment boxes
    box(0.3, 0.4, 1.1, P.armor, [s * 2.03, 1.28, -1.1 + 0]);
    box(0.32, 0.4, 0.9, P.armor, [s * 2.03, 1.28, -4.0]);
    box(0.34, 0.06, 0.95, P.trim, [s * 2.03, 1.5, -4.0]);
    // latch + handles on equipment boxes
    box(0.05, 0.05, 0.3, P.steel, [s * 2.2, 1.28, -1.1]);
    box(0.05, 0.05, 0.3, P.steel, [s * 2.21, 1.28, -4.0]);
    // rivet rows along skirt
    for (let i = 0; i < 18; i++) {
      const z = -4.7 + i * 0.36;
      cyl(0.03, 0.03, 0.04, 6, P.steel, [s * 1.97, 1.62, z], [0, 0, 90]);
    }
    // rivets along deck edge
    for (let i = 0; i < 16; i++) {
      cyl(0.025, 0.025, 0.03, 6, P.steel, [s * 1.6, 1.77, -4.6 + i * 0.4]);
    }
  }

  // Stabiliser mounting blocks
  for (const key of ["legFrontL", "legFrontR", "legRearL", "legRearR"]) {
    const m = M[key];
    if (!m) continue;
    const s = Math.sign(m[0]);
    box(0.5, 0.55, 0.9, P.armor, [s * 1.88, 1.25, m[2]]);
    box(0.54, 0.1, 0.94, P.trim, [s * 1.88, 1.55, m[2]]);
    cyl(0.17, 0.17, 0.6, 8, P.darkMetal, [s * 2.0, 1.2, m[2]], [90, 0, 0]);
    cyl(0.07, 0.07, 0.64, 6, P.steel, [s * 2.0, 1.2, m[2]], [90, 0, 0]);
    for (const dz of [-0.3, 0.3]) for (const dy of [-0.2, 0.2])
      cyl(0.03, 0.03, 0.05, 6, P.steel, [s * 2.14, 1.25 + dy, m[2] + dz], [0, 0, 90]);
  }

  // Tail ramp plate
  box(3.4, 0.9, 0.2, P.hullDark, [0, 1.25, -5.0]);
  box(3.0, 0.7, 0.1, P.hull, [0, 1.25, -5.12], [0, 0, 0]);
  box(3.4, 0.5, 0.25, P.hull, [0, 1.62, -4.95], [-25, 0, 0]);
  // orange chevrons
  for (let i = 0; i < 6; i++) {
    const x = -1.25 + i * 0.5;
    box(0.2, 0.6, 0.04, i % 2 ? P.warning : P.darkMetal, [x, 1.2, -5.2], [0, 0, i % 2 ? 25 : -25]);
  }
  // tail lights
  for (const s of [1, -1]) {
    box(0.3, 0.2, 0.08, P.red, [s * 1.45, 1.55, -5.1]);
    box(0.2, 0.1, 0.04, P.warning, [s * 1.45, 1.38, -5.12]);
    // tow hooks
    box(0.14, 0.14, 0.3, P.darkMetal, [s * 0.9, 0.98, -5.15]);
    b.part(new THREE.TorusGeometry(0.1, 0.03, 4, 8, Math.PI * 1.5), P.steel, { bone, at: [s * 0.9, 0.95, -5.35], rotation: [90, 0, 0], flat: true });
  }
  // license/unit number tail plate
  box(0.9, 0.24, 0.04, P.white, [0, 1.22, -5.14]);
  for (let k = 0; k < 4; k++) box(0.08, 0.14, 0.03, P.hullDark, [-0.3 + k * 0.2, 1.22, -5.17]);

  // exhaust stacks (behind cab, at the sides)
  for (const s of [1, -1]) {
    cyl(0.1, 0.12, 0.8, 8, P.darkMetal, [s * 1.55, 2.15, 1.2]);
    cyl(0.13, 0.13, 0.1, 8, P.steel, [s * 1.55, 2.58, 1.2]);
    cyl(0.07, 0.07, 0.04, 8, P.rubber, [s * 1.55, 2.64, 1.2]);
    box(0.08, 0.3, 0.2, P.armor, [s * 1.55, 1.9, 1.05]);
    cyl(0.125, 0.125, 0.06, 8, P.trim, [s * 1.55, 2.35, 1.2]);
  }

  // top deck hatches and vents
  for (const s of [1, -1]) {
    box(0.8, 0.08, 0.6, P.hullDark, [s * 1.0, 1.79, -3.9]);
    for (let i = 0; i < 4; i++) box(0.7, 0.03, 0.05, P.darkMetal, [s * 1.0, 1.85, -4.1 + i * 0.13]);
    box(0.6, 0.05, 0.6, P.trim, [s * 1.0, 1.77, -2.6]);
    box(0.5, 0.07, 0.5, P.armor, [s * 1.0, 1.8, -2.6]);
    // amber marker lights
    box(0.1, 0.1, 0.12, P.warning, [s * 1.75, 1.8, 1.4]);
    box(0.1, 0.1, 0.12, P.warning, [s * 1.75, 1.8, -4.8]);
  }
  // cradle base plate under railgun
  box(1.6, 0.08, 1.8, P.hullDark, [0, 1.79, -0.6]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    cyl(0.05, 0.05, 0.05, 6, P.steel, [sx * 0.7, 1.85, -0.6 + sz * 0.8]);

  // front face connection plate to cab
  box(3.4, 0.7, 0.12, P.hullDark, [0, 1.35, 1.54]);
  box(3.0, 0.1, 0.14, P.trim, [0, 1.0, 1.56]);
  // hazard dashes along tail bottom and bottom plate
  for (let i = 0; i < 10; i++) box(0.2, 0.06, 0.04, i % 2 ? P.trim : P.darkMetal, [-1.4 + i * 0.31, 0.98, -5.2], [0, 0, 20]);
  // underside beams with some jitter bolts
  for (let i = 0; i < 6; i++) {
    const x = (R() - 0.5) * 2.4;
    cyl(0.04, 0.04, 0.05, 6, P.steel, [x, 1.0, -4.9 + R() * 0.1], [90, 0, 0]);
  }
  // central spine ridge
  box(0.5, 0.06, 6.2, P.hullDark, [0, 1.77, -1.8]);
  void frame;
}
    return buildChassis;
  })(),
  // cab
  (() => {
function buildCab({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(5);
  // box helper: center, size, color, optional rotation (deg xyz)
  const box = (c: number[], s: number[], color: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), color, {
      bone, at: c as any, rotation: rot as any,
    });
  const cyl = (c: number[], r: number, h: number, sides: number, color: string, rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(r, r, h, sides), color, { bone, at: c as any, rotation: rot as any });
  const sym = (fn: (s: number) => void) => { for (const s of [1, -1]) fn(s); };

  // --- main cab body ---
  box([0, 1.45, 3.0], [3.4, 1.0, 2.8], P.hull);
  box([0, 1.0, 3.3], [3.5, 0.5, 3.4], P.hullDark);
  // upper cabin (roof under 2.0)
  box([0, 1.85, 2.7], [3.0, 0.5, 1.7], P.armor);
  box([0, 1.98, 2.7], [2.6, 0.06, 1.3], P.hullLight);
  // sloped glacis
  box([0, 1.75, 3.95], [3.2, 0.9, 0.35], P.armor, [-38, 0, 0]);
  box([0, 1.25, 4.55], [3.3, 0.7, 0.5], P.armor, [28, 0, 0]);
  // side angular panels
  sym((s) => {
    box([s * 1.72, 1.55, 3.0], [0.14, 0.9, 2.6], P.hull);
    box([s * 1.76, 1.95, 2.9], [0.12, 0.35, 1.9], P.armor, [0, 0, s * -12]);
    // doors
    box([s * 1.8, 1.5, 2.55], [0.06, 0.8, 1.0], P.hullLight);
    box([s * 1.84, 1.45, 2.2], [0.05, 0.08, 0.22], P.darkMetal);
    box([s * 1.82, 1.82, 2.55], [0.04, 0.05, 0.9], P.darkMetal);
    // white unit marking
    box([s * 1.8, 1.25, 3.4], [0.04, 0.3, 0.5], P.white);
    box([s * 1.82, 1.25, 3.4], [0.03, 0.08, 0.34], P.hullDark);
    // hazard stripes on sill
    for (let i = 0; i < 6; i++)
      box([s * 1.8, 0.98, 1.9 + i * 0.5], [0.06, 0.12, 0.25], i % 2 ? P.hullDark : P.trim, [0, 0, 0]);
    // fenders over front wheels
    box([s * 1.72, 1.4, 3.2], [0.5, 0.18, 1.7], P.hullDark);
    box([s * 1.95, 1.2, 3.2], [0.12, 0.5, 1.6], P.hullDark);
    box([s * 1.65, 1.52, 4.0], [0.5, 0.2, 0.2], P.trim);
    // mirrors
    box([s * 1.95, 1.95, 3.5], [0.05, 0.05, 0.05], P.darkMetal);
    box([s * 2.0, 1.95, 3.48], [0.08, 0.3, 0.2], P.darkMetal);
    box([s * 2.04, 1.95, 3.48], [0.02, 0.24, 0.15], P.glass);
    // headlights
    box([s * 1.35, 1.35, 4.82], [0.5, 0.28, 0.1], P.darkMetal);
    box([s * 1.35, 1.35, 4.88], [0.38, 0.18, 0.05], P.white);
    box([s * 1.0, 1.35, 4.84], [0.14, 0.2, 0.08], P.trim);
    // plough teeth
    // roof lights
    cyl([s * 1.2, 2.06, 2.0], 0.1, 0.12, 6, P.warning);
    cyl([s * 1.2, 2.14, 2.0], 0.06, 0.06, 6, P.trim);
    // sensor mast support
  });

  // --- visor window ---
  box([0, 1.88, 3.7], [2.6, 0.5, 0.1], P.glass, [-38, 0, 0]);
  box([0, 2.16, 3.55], [2.7, 0.06, 0.1], P.neonCyan, [-38, 0, 0]);
  box([0, 1.62, 3.9], [2.7, 0.05, 0.08], P.neonCyan, [-38, 0, 0]);
  sym((s) => box([s * 1.32, 1.88, 3.72], [0.06, 0.55, 0.1], P.neonCyan, [-38, 0, 0]));
  box([0, 1.88, 3.72], [0.08, 0.5, 0.1], P.darkMetal, [-38, 0, 0]);
  // side windows
  sym((s) => box([s * 1.52, 1.88, 2.6], [0.04, 0.3, 1.2], P.glass));

  // --- grille/bumper ---
  box([0, 1.15, 4.85], [3.0, 0.4, 0.15], P.darkMetal);
  for (let i = -3; i <= 3; i++) box([i * 0.4, 1.15, 4.94], [0.08, 0.3, 0.04], P.steel);
  box([0, 0.92, 4.95], [3.6, 0.25, 0.3], P.hullDark);
  for (let i = 0; i < 9; i++)
    box([-1.6 + i * 0.4, 0.92, 5.0], [0.2, 0.22, 0.04], i % 2 ? P.hullDark : P.trim);
  // tow bar
  sym((s) => {
    box([s * 0.7, 0.95, 4.95], [0.12, 0.12, 0.2], P.darkMetal);
  });
  box([0, 0.98, 5.0], [1.5, 0.1, 0.08], P.steel);
  cyl([0, 1.0, 4.95], 0.1, 0.1, 8, P.steel, [90, 0, 0]);
  // plough plate
  box([0, 0.9, 4.75], [3.7, 0.5, 0.2], P.hullDark, [-20, 0, 0]);
  for (let i = 0; i < 8; i++)
    box([-1.6 + i * 0.46, 0.9, 4.86], [0.22, 0.4, 0.04], i % 2 ? P.hullDark : P.trim, [-20, 0, 0]);

  // --- roof hatch ---
  cyl([-0.5, 2.05, 2.5], 0.32, 0.08, 8, P.hullDark);
  cyl([-0.5, 2.1, 2.5], 0.22, 0.05, 8, P.armor);
  box([-0.5, 2.14, 2.5], [0.28, 0.04, 0.05], P.steel);

  // --- sensor mast at x=+1.1 ---
  box([1.1, 2.15, 2.2], [0.3, 0.2, 0.3], P.darkMetal);
  cyl([1.1, 2.6, 2.2], 0.05, 0.9, 6, P.steel);
  cyl([1.1, 3.0, 2.2], 0.07, 0.1, 6, P.darkMetal);
  // dish
  b.part(new THREE.SphereGeometry(0.28, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.white, {
    bone, at: [1.1, 2.85, 2.28], rotation: [-110, 0, 0], scale: [1, 0.5, 1],
  });
  cyl([1.1, 2.82, 2.4], 0.03, 0.2, 5, P.steel, [90, 0, 0]);
  box([1.1, 2.78, 2.52], [0.06, 0.06, 0.06], P.warning);
  // antenna
  cyl([1.45, 2.7, 2.1], 0.015, 1.4, 5, P.darkMetal);
  box([1.45, 3.42, 2.1], [0.05, 0.05, 0.05], P.red);
  cyl([-1.1, 2.5, 2.2], 0.012, 1.0, 5, P.darkMetal);

  // --- capacitor housing behind cab roof (z ~1.7-2.2) ---
  box([0, 1.9, 1.85], [3.0, 0.75, 0.5], P.hull);
  box([0, 2.3, 1.85], [3.0, 0.1, 0.55], P.hullDark);
  sym((s) => box([s * 1.52, 1.9, 1.85], [0.06, 0.6, 0.4], P.armor));
  for (let i = 0; i < 5; i++) {
    const x = -1.0 + i * 0.5;
    if (Math.abs(x) < 0.3) continue;
    cyl([x, 2.0, 2.12], 0.09, 0.5, 6, P.neonCyan, [0, 0, 90]);
  }
  for (let i = 0; i < 4; i++) {
    cyl([-1.2 + i * 0.8, 1.85, 2.12], 0.08, 0.6, 6, P.neonCyan, [0, 0, 0]);
  }
  box([0, 1.9, 2.12], [3.0, 0.06, 0.04], P.darkMetal);
  // warning stripes on housing
  for (let i = 0; i < 6; i++)
    box([-1.25 + i * 0.5, 2.37, 1.85], [0.24, 0.03, 0.4], i % 2 ? P.hullDark : P.warning);
  box([0, 1.55, 1.64], [1.2, 0.2, 0.05], P.white);
  box([0, 1.55, 1.62], [0.9, 0.08, 0.03], P.hullDark);

  // rivet rows
  for (let i = 0; i < 10; i++) {
    const x = -1.4 + i * 0.31;
    cyl([x, 1.2, 4.93], 0.025, 0.04, 5, P.steel, [90, 0, 0]);
  }
  sym((s) => {
    for (let i = 0; i < 5; i++) box([s * 1.8, 1.88, 3.4 + i * 0.0 - 0.0 + 0], [0.03, 0.03, 0.03], P.steel);
    for (let i = 0; i < 6; i++) cyl([s * 1.78, 1.2 + (R() * 0.0), 2.0 + i * 0.5], 0.025, 0.04, 5, P.steel, [0, 0, 90]);
  });
}
    return buildCab;
  })(),
  // wheels
  (() => {
function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.7;
  const W = 0.6;
  const rand = rng(11);

  const part = (geo: THREE.BufferGeometry, color: string, bone: any, at: number[], opts: any = {}) =>
    b.part(geo, color, { bone, at, flat: true, ...opts });

  // wheels: axis along x. Cylinder axis is Y, so rotate geometry into X axis via rotation z 90.
  const wheelDefs: [string, number, number, number][] = [
    ["wheelFL", 1, M.axleFront[2], 1],
    ["wheelFR", -1, M.axleFront[2], 1],
    ["wheelML", 1, M.axleMid[2], 1],
    ["wheelMR", -1, M.axleMid[2], 1],
    ["wheelBL", 1, M.axleRear[2], 1],
    ["wheelBR", -1, M.axleRear[2], 1],
  ];

  for (const [name, s, z] of wheelDefs) {
    const j = J[name];
    const cx = s * 1.65;
    const cy = 0.7;
    const at = (dx: number, dy = 0, dz = 0) => [cx + dx * s, cy + dy, z + dz];
    const axisDir = [s, 0, 0];

    // tire: 10-sided
    part(new THREE.CylinderGeometry(R, R, W, 10), P.tire, j, at(0), { dir: axisDir });
    // sidewall shoulders (slightly smaller darker rings)
    for (const o of [-1, 1]) {
      part(new THREE.CylinderGeometry(R * 0.86, R * 0.86, 0.04, 10), P.rubber, j, at(o * (W / 2 + 0.005)), {
        dir: axisDir,
      });
    }
    // tread blocks
    const n = 10;
    for (let i = 0; i < n; i++) {
      const a = ((i + 0.5) / n) * Math.PI * 2;
      const y = Math.sin(a) * (R + 0.03);
      const zz = Math.cos(a) * (R + 0.03);
      const block = new THREE.BoxGeometry(W * 0.92, 0.08, 0.22);
      part(block, P.rubber, j, at(0, y, zz), {
        quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(-a + Math.PI * 0, 0, 0)),
      });
    }
    // rim disc outside
    const out = W / 2 + 0.03;
    part(new THREE.CylinderGeometry(R * 0.6, R * 0.6, 0.06, 10), P.rim, j, at(out), { dir: axisDir });
    part(new THREE.CylinderGeometry(R * 0.66, R * 0.66, 0.03, 10), P.darkMetal, j, at(out - 0.03), { dir: axisDir });
    // hub cap
    part(new THREE.CylinderGeometry(0.18, 0.2, 0.1, 8), P.darkMetal, j, at(out + 0.07), { dir: axisDir });
    part(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 6), P.steel, j, at(out + 0.14), { dir: axisDir });
    // cyan hub ring
    part(new THREE.TorusGeometry(0.24, 0.022, 4, 12), P.neonCyan, j, at(out + 0.035), { dir: axisDir, axis: "z" });
    // lug bolts
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      part(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 6), P.steel, j, at(out + 0.04, Math.sin(a) * 0.32, Math.cos(a) * 0.32), {
        dir: axisDir,
      });
    }
    // inner hub disc
    part(new THREE.CylinderGeometry(R * 0.45, R * 0.45, 0.05, 8), P.darkMetal, j, at(-out), { dir: axisDir });

    // axle stub housing from wheel to hull
    part(new THREE.CylinderGeometry(0.12, 0.14, 0.5, 8), P.darkMetal, j, at(-0.55), { dir: axisDir });
    // suspension arm up to chassis underside
    const armA = new THREE.Vector3(cx - s * 0.5, cy, z);
    const armB = new THREE.Vector3(s * 1.2, 0.95, z);
    b.rod(armA, armB, 0.08, P.darkMetal, { bone: J.body });
    // hydraulic damper
    b.rod(new THREE.Vector3(s * 1.45, 0.78, z + 0.25), new THREE.Vector3(s * 1.1, 1.05, z + 0.25), 0.05, P.hydraulic, {
      bone: J.body,
    });
    b.rod(new THREE.Vector3(s * 1.45, 0.78, z + 0.25), new THREE.Vector3(s * 1.3, 0.88, z + 0.25), 0.07, P.steel, {
      bone: J.body,
    });
    // mud-guard bracket
    part(new THREE.BoxGeometry(0.12, 0.12, 0.3), P.darkMetal, J.body, [s * 1.2, 0.95, z - 0.25]);
  }

  // axle housings and differentials across the body
  for (const z of [M.axleFront[2], M.axleMid[2], M.axleRear[2]]) {
    b.rod([-1.2, 0.72, z], [1.2, 0.72, z], 0.1, P.darkMetal, { bone: J.body });
    part(new THREE.SphereGeometry(0.28, 8, 6), P.darkMetal, J.body, [0, 0.72, z]);
    part(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 8), P.hydraulic, J.body, [0, 0.72, z + 0.26], { dir: [0, 0, 1] });
    part(new THREE.BoxGeometry(0.5, 0.1, 0.2), P.hullDark, J.body, [0, 0.95, z]);
  }
  // drive shaft along the body
  b.rod([0, 0.72, -2.8], [0, 0.72, 3.2], 0.06, P.darkMetal, { bone: J.body });
  // cross members
  for (const z of [1.7, -1.3]) part(new THREE.BoxGeometry(2.4, 0.08, 0.12), P.darkMetal, J.body, [0, 0.95, z]);
}
    return buildWheels;
  })(),
  // railgun
  (() => {
type Ctx = {
  b: any;
  J: Record<string, any>;
  P: Record<string, string>;
  M: Record<string, [number, number, number]>;
};

function buildRailgun({ b, J, P }: Ctx) {
  const bone = J.railgun;
  const Y = 2.3;
  const OLIVE = "#4a5240";

  const box = (
    w: number,
    h: number,
    d: number,
    color: string,
    x: number,
    y: number,
    z: number,
    glowing = 0,
  ) => {
    const p = b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at: [x, y, z] });
    if (glowing) glow(p, glowing);
    return p;
  };
  const cyl = (
    r0: number,
    r1: number,
    len: number,
    sides: number,
    color: string,
    x: number,
    y: number,
    z: number,
    glowing = 0,
  ) => {
    const p = b.part(new THREE.CylinderGeometry(r0, r1, len, sides), color, {
      bone,
      at: [x, y, z],
      dir: [0, 0, 1],
    });
    if (glowing) glow(p, glowing);
    return p;
  };

  // ---------- Cradle base ----------
  box(1.5, 0.12, 2.2, P.hullDark, 0, 1.76, -0.6);
  box(1.3, 0.1, 1.9, P.armor, 0, 1.87, -0.6);
  for (const s of [1, -1]) {
    // trunnion frames
    box(0.14, 0.62, 1.5, P.armor, s * 0.62, 2.1, -0.6);
    box(0.18, 0.12, 1.6, P.hullDark, s * 0.62, 2.43, -0.6);
    box(0.16, 0.5, 0.2, P.hullDark, s * 0.62, 2.15, -1.3);
    box(0.16, 0.5, 0.2, P.hullDark, s * 0.62, 2.15, 0.1);
    cyl(0.14, 0.14, 0.34, 8, P.steel, s * 0.72, Y, -0.6);
    cyl(0.07, 0.07, 0.4, 6, P.darkMetal, s * 0.74, Y, -0.6);
    // warning stripes on frames
    for (let i = 0; i < 4; i++)
      box(0.02, 0.1, 0.18, i % 2 ? P.hullDark : P.warning, s * 0.71, 2.3, -1.15 + i * 0.3);
    // bolts
    for (let i = 0; i < 4; i++) cyl(0.03, 0.03, 0.03, 6, P.steel, s * 0.72, 1.9 + (i % 2) * 0.3, -1.1 + i * 0.35);
  }
  // cradle gussets
  for (const z of [-1.35, 0.15]) box(1.0, 0.1, 0.16, P.hullDark, 0, 1.97, z);

  // ---------- Barrel: twin rails ----------
  const RAIL_Z0 = -2.4,
    RAIL_Z1 = 5.0;
  const len = RAIL_Z1 - RAIL_Z0;
  const mid = (RAIL_Z0 + RAIL_Z1) / 2;
  for (const s of [1, -1]) {
    box(0.2, 0.3, len, P.steel, s * 0.22, Y, mid);
    box(0.06, 0.06, len, P.hullLight, s * 0.22, Y + 0.17, mid);
    box(0.04, 0.2, len - 0.2, P.darkMetal, s * 0.33, Y, mid);
  }
  // cyan channel
  box(0.24, 0.12, len, P.neonCyan, 0, Y, mid, 1.4);
  box(0.3, 0.04, len, P.darkMetal, 0, Y - 0.12, mid);
  // cross braces every 0.5m
  for (let z = -2.2; z <= 4.9; z += 0.5) {
    box(0.78, 0.07, 0.1, P.darkMetal, 0, Y + 0.2, z);
    box(0.78, 0.07, 0.1, P.darkMetal, 0, Y - 0.2, z);
    box(0.05, 0.05, 0.12, P.neonCyan, 0, Y + 0.245, z, 1);
  }

  // ---------- Capacitor coil rings (rear barrel) ----------
  for (let i = 0; i < 6; i++) {
    const z = -2.2 + i * 0.34;
    box(0.92, 0.62, 0.12, P.darkMetal, 0, Y, z);
    box(0.95, 0.08, 0.14, P.neonCyan, 0, Y + 0.34, z, 1.2);
    box(0.95, 0.08, 0.14, P.neonCyan, 0, Y - 0.34, z, 1.2);
    for (const s of [1, -1]) box(0.08, 0.5, 0.15, P.neonCyan, s * 0.47, Y, z, 1.2);
  }

  // ---------- Muzzle brake ----------
  cyl(0.3, 0.46, 0.5, 8, P.armor, 0, Y, 4.75);
  cyl(0.46, 0.4, 0.7, 8, P.hullDark, 0, Y, 5.1);
  cyl(0.4, 0.3, 0.4, 8, P.armor, 0, Y, 5.4 - 0.05);
  for (const z of [4.6, 4.95, 5.3]) cyl(0.49, 0.49, 0.07, 8, P.trim, 0, Y, z);
  for (const s of [1, -1]) {
    box(0.05, 0.3, 0.5, P.darkMetal, s * 0.47, Y, 5.1);
    box(0.5, 0.05, 0.4, P.darkMetal, 0, Y + 0.47, 5.1);
  }
  cyl(0.12, 0.12, 0.05, 8, P.neonCyan, 0, Y, 5.42, 1.6);

  // ---------- Breech block ----------
  box(1.5, 1.2, 1.1, P.armor, 0, Y, -3.0);
  box(1.56, 0.1, 1.16, P.hullDark, 0, Y + 0.62, -3.0);
  box(1.56, 0.1, 1.16, P.hullDark, 0, Y - 0.62, -3.0);
  for (const s of [1, -1]) {
    box(0.1, 0.9, 1.0, P.hullDark, s * 0.78, Y, -3.0);
    for (let i = 0; i < 3; i++) box(0.03, 0.1, 0.18, i % 2 ? P.hullDark : P.warning, s * 0.84, Y + 0.3 - i * 0.3, -3.0);
  }
  // front face chamfer plate
  box(1.2, 0.9, 0.12, P.hullDark, 0, Y, -2.42);
  // rear face + hatch
  box(1.0, 0.8, 0.08, P.hullDark, 0, Y, -3.58);
  box(0.6, 0.5, 0.06, P.armor, 0, Y + 0.02, -3.64);
  box(0.64, 0.04, 0.07, P.trim, 0, Y + 0.3, -3.65);
  box(0.64, 0.04, 0.07, P.trim, 0, Y - 0.26, -3.65);
  cyl(0.06, 0.06, 0.1, 8, P.steel, 0.2, Y + 0.02, -3.7).rotation;
  box(0.2, 0.05, 0.06, P.steel, 0, Y + 0.02, -3.7);
  // red warning light
  cyl(0.09, 0.09, 0.14, 8, P.red, -0.45, Y + 0.72, -3.0).rotation;
  const lamp = b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.14, 8), P.red, {
    bone,
    at: [-0.5, Y + 0.76, -3.0],
  });
  glow(lamp, 1.5);
  box(0.26, 0.04, 0.26, P.darkMetal, -0.5, Y + 0.68, -3.0);
  // top vents on breech
  for (let i = 0; i < 4; i++) box(0.7, 0.03, 0.06, P.darkMetal, 0.2, Y + 0.68, -3.3 + i * 0.2);
  // orange warning stripe on breech top
  for (let i = 0; i < 5; i++) box(0.12, 0.02, 0.9, i % 2 ? P.hullDark : P.warning, -0.1 + i * 0.16 - 0.2 + 0.35, Y + 0.69, -2.95).rotation;

  // ---------- Recoil pistons ----------
  for (const s of [1, -1]) {
    cyl(0.1, 0.1, 1.5, 8, P.hydraulic, s * 0.55, Y - 0.35, -1.55);
    cyl(0.05, 0.05, 1.5, 6, P.steel, s * 0.55, Y - 0.35, -0.1);
    cyl(0.13, 0.13, 0.08, 8, P.darkMetal, s * 0.55, Y - 0.35, -0.85);
    box(0.14, 0.14, 0.14, P.darkMetal, s * 0.55, Y - 0.35, -2.35);
    cyl(0.07, 0.07, 0.1, 6, P.trim, s * 0.55, Y - 0.35, 0.7);
  }

  // ---------- Cable runs ----------
  for (const s of [1, -1]) {
    box(0.07, 0.07, 2.6, P.darkMetal, s * 0.82, Y - 0.15, -1.9);
    box(0.07, 0.07, 2.2, P.darkMetal, s * 0.9, Y - 0.35, -1.7);
    box(0.07, 0.4, 0.07, P.darkMetal, s * 0.86, Y - 0.1, -0.55);
  }
  box(0.07, 0.07, 1.8, P.darkMetal, 0, Y + 0.4, -1.2);
  box(0.07, 0.07, 1.2, P.neonCyan, 0, Y + 0.45, -1.0, 1);

  // ---------- Ammo slug rack ----------
  box(0.7, 0.08, 0.5, P.darkMetal, 0.2, Y + 0.76 + 0.0, -3.0 - 0.0).visible = false;
  box(0.08, 0.5, 0.5, P.hullDark, -0.55, 3.0, -3.0).visible = false;
  box(0.9, 0.06, 0.45, P.hullDark, 0.0, 2.95, -3.9 + 0.55 - 0.1 + 0.05).visible = false;
  for (const s of [1, -1]) {
    box(0.06, 0.4, 0.4, P.hullDark, s * 0.42, 1.96 + 0.0, -3.55);
  }
  box(0.9, 0.05, 0.4, P.hullDark, 0, 1.78, -3.55);
  for (let i = 0; i < 4; i++) cyl(0.08, 0.08, 0.34, 6, P.steel, -0.3 + i * 0.2, 1.95, -3.55).rotation;
  for (let i = 0; i < 4; i++) cyl(0.04, 0.04, 0.1, 6, P.trim, -0.3 + i * 0.2, 1.95, -3.74);

  // ---------- Orange warning stripes on rails near muzzle / hazard ----------
  for (let i = 0; i < 4; i++) box(0.24, 0.02, 0.12, i % 2 ? P.hullDark : P.warning, 0.22, Y + 0.2, 3.6 + i * 0.2);
  for (let i = 0; i < 4; i++) box(0.24, 0.02, 0.12, i % 2 ? P.hullDark : P.warning, -0.22, Y + 0.2, 3.6 + i * 0.2);
  // white marking
  box(0.3, 0.02, 0.12, P.white, 0.0, Y + 0.7 + 0.0, -3.2).visible = false;
  box(0.28, 0.02, 0.1, P.white, 0.4, Y + 0.69, -3.4);
}
    return buildRailgun;
  })(),
  // stabilisers
  (() => {
function buildStabilisers({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const cyl = (r0: number, r1: number, h: number, n = 8) => new THREE.CylinderGeometry(r0, r1, h, n);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  const defs: [string, number, number, number][] = [
    ["legFL", 1, M.legFrontL[2], M.legFrontL[2]],
    ["legFR", -1, M.legFrontR[2], M.legFrontR[2]],
    ["legBL", 1, M.legRearL[2], -3.55],
    ["legBR", -1, M.legRearR[2], -3.55],
  ];

  for (const [name, s, mountZ, z] of defs) {
    const bone = J[name];
    const X = 1.92;
    const A: [number, number, number] = [s * 1.45, 1.38, z];
    const K: [number, number, number] = [s * X, 0.82, z];

    // mount block and pivot at chassis corner
    b.part(box(0.5, 0.42, 0.5), P.hullDark, { bone, at: [s * 1.75, 1.2, z] });
    b.part(cyl(0.16, 0.16, 0.56, 8), P.darkMetal, { bone, at: [s * 1.78, 1.28, z], dir: [0, 0, 1] });
    b.part(cyl(0.07, 0.07, 0.6, 6), P.steel, { bone, at: [s * 1.78, 1.28, z], dir: [0, 0, 1] });

    // upper strut (45 degrees outward and down)
    b.rod(A, K, [0.1, 0.09], P.hull, { bone, section: "box", caps: "flat" });
    b.rod(
      [A[0] + s * 0.05, A[1] + 0.1, z],
      [K[0] - s * 0.04, K[1] + 0.06, z],
      [0.05, 0.03],
      P.hullLight,
      { bone, section: "box", caps: "flat" },
    );

    // hydraulic cylinder beside the strut
    const hz = z + 0.2;
    const h0: [number, number, number] = [s * 1.5, 1.42, hz];
    const h1: [number, number, number] = [s * 1.78, 1.08, hz];
    const h2: [number, number, number] = [s * 1.94, 0.88, hz];
    b.rod(h0, h1, 0.07, P.hydraulic, { bone, sides: 8 });
    b.rod(h1, h2, 0.035, P.steel, { bone, sides: 6 });
    b.part(cyl(0.085, 0.085, 0.06, 8), P.darkMetal, { bone, at: h0, aim: h1 });
    b.part(cyl(0.05, 0.05, 0.1, 6), P.darkMetal, { bone, at: h2, dir: [0, 0, 1] });
    b.rod(h2, [K[0], K[1], z + 0.1], 0.025, P.steel, { bone, sides: 6 });

    // knee block
    b.part(box(0.34, 0.26, 0.34), P.hullDark, { bone, at: [K[0], K[1], z] });
    b.part(cyl(0.11, 0.11, 0.4, 8), P.darkMetal, { bone, at: [K[0], K[1], z], dir: [0, 0, 1] });
    // cyan status light on knee (outward face)
    glow(
      b.part(box(0.04, 0.1, 0.1), P.neonCyan, { bone, at: [K[0] + s * 0.18, K[1], z] }),
      1.4,
    );
    b.part(box(0.02, 0.14, 0.14), P.darkMetal, { bone, at: [K[0] + s * 0.17, K[1], z] });

    // lower leg: sleeve + chrome rod
    b.part(cyl(0.12, 0.13, 0.4, 8), P.hull, { bone, at: [X, 0.62, z].map((v, i) => (i === 0 ? s * v : v)) as [number, number, number] });
    b.part(cyl(0.065, 0.065, 0.46, 8), P.hydraulic, { bone, at: [s * X, 0.37, z] });
    b.part(cyl(0.075, 0.075, 0.05, 8), P.steel, { bone, at: [s * X, 0.42, z] });
    // orange warning stripes on sleeve
    for (let i = 0; i < 3; i++) {
      b.part(cyl(0.133, 0.135, 0.04, 8), i % 2 ? P.trim : P.warning, {
        bone,
        at: [s * X, 0.74 - i * 0.1, z],
      });
    }

    // gussets
    for (const dz of [-0.1, 0.1]) {
      b.extrude(
        [
          [0, -0.28],
          [0, 0.05],
          [-0.26, 0.05],
        ],
        { at: [s * (X - 0.1), K[1] - 0.06, z + dz], x: [s, 0, 0], thickness: 0.03, color: P.hullDark, bone },
      );
    }

    // foot pad
    const sc: [number, number, number] = [1, 1, 1.3];
    b.part(cyl(0.2, 0.2, 0.08, 8), P.rubber, { bone, at: [s * X, 0.04, z], scale: sc });
    b.part(cyl(0.2, 0.21, 0.1, 8), P.darkMetal, { bone, at: [s * X, 0.13, z], scale: sc });
    b.part(cyl(0.22, 0.22, 0.035, 8), P.trim, { bone, at: [s * X, 0.1, z], scale: sc });
    b.part(cyl(0.13, 0.15, 0.06, 8), P.hullDark, { bone, at: [s * X, 0.21, z], scale: sc });
    // hazard ticks on pad edge
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 8;
      b.part(box(0.07, 0.025, 0.07), P.warning, {
        bone,
        at: [s * X + Math.cos(a) * 0.2, 0.17, z + Math.sin(a) * 0.26],
      });
    }
    // bolts
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.part(cyl(0.022, 0.022, 0.03, 6), P.steel, {
        bone,
        at: [s * X + Math.cos(a) * 0.11, 0.26, z + Math.sin(a) * 0.14],
      });
    }
    // bolts on mount block
    for (const [dx, dy] of [[-0.15, 0.12], [0.15, 0.12], [-0.15, -0.12], [0.15, -0.12]]) {
      b.part(cyl(0.025, 0.025, 0.03, 6), P.steel, {
        bone,
        at: [s * 1.75 + dx, 1.2 + dy, z + 0.26],
        dir: [0, 0, 1],
      });
    }
    // hazard stripe on mount block
    b.part(box(0.5, 0.06, 0.04), R() > 2 ? P.warning : P.trim, { bone, at: [s * 1.75, 1.02, z + 0.26] });
  }
}
    return buildStabilisers;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "railgunCarrier" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1.2,0], dir: [0,0,1], role: "spine" });
  J["railgun"] = b.joint("railgun", { parent: J["body"], at: [0,2.3,-0.6], dir: [0,0,1], role: "hinge", group: "gun" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.65,0.7,3.2], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.65,0.7,3.2], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelML"] = b.joint("wheelML", { parent: J["body"], at: [1.65,0.7,0.2], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelMR"] = b.joint("wheelMR", { parent: J["body"], at: [-1.65,0.7,0.2], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelBL"] = b.joint("wheelBL", { parent: J["body"], at: [1.65,0.7,-2.8], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelBR"] = b.joint("wheelBR", { parent: J["body"], at: [-1.65,0.7,-2.8], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["legFL"] = b.joint("legFL", { parent: J["body"], at: [1.9,1.2,2], dir: [1,-1,0], role: "leg", group: "stabilisers" });
  J["legFR"] = b.joint("legFR", { parent: J["body"], at: [-1.9,1.2,2], dir: [-1,-1,0], role: "leg", group: "stabilisers" });
  J["legBL"] = b.joint("legBL", { parent: J["body"], at: [1.9,1.2,-3.4], dir: [1,-1,0], role: "leg", group: "stabilisers" });
  J["legBR"] = b.joint("legBR", { parent: J["body"], at: [-1.9,1.2,-3.4], dir: [-1,-1,0], role: "leg", group: "stabilisers" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
