import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Hoverjack Technical",
  "description": "A militarized pickup truck converted to ride on four vectored hover thrusters, in low-poly cyberpunk style with neon underglow, armor plates and a roof-mounted gun."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#3a4150",
  hullDark: "#232833",
  hullLight: "#5a6578",
  armor: "#4d5a48",
  armorDark: "#2f382d",
  trim: "#e7b814",
  black: "#0d0f14",
  glass: "#1b3a4a",
  glassGlint: "#5fd0e8",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2bd6",
  neonOrange: "#ff8a1c",
  headlight: "#fff6c8",
  taillight: "#ff2a2a",
  metal: "#8a93a3",
  rust: "#7a4a2a",
  decalWhite: "#e8ecf0",
};
const M = {
  floorLine: [0, 0, 0] as [number, number, number],
  chassisTop: [0, 1.15, 0] as [number, number, number],
  chassisBottom: [0, 0.55, 0] as [number, number, number],
  cabFloor: [0, 1.15, 0.35] as [number, number, number],
  bedFloor: [0, 1.1, -1.6] as [number, number, number],
  hoodFront: [0, 1.2, 2.7] as [number, number, number],
  gunRing: [0, 1.75, -1.3] as [number, number, number],
  thrusterFL: [1.35, 0.75, 1.75] as [number, number, number],
  thrusterFR: [-1.35, 0.75, 1.75] as [number, number, number],
  thrusterRL: [1.35, 0.75, -1.75] as [number, number, number],
  thrusterRR: [-1.35, 0.75, -1.75] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassis
  (() => {
function buildChassis({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number, color: string, at: number[], opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...opts });
  const glowBox = (w: number, h: number, d: number, color: string, at: number[], s = 1.2) =>
    glow(box(w, h, d, color, at), s);

  // Main slab: lower dark, upper hull
  box(2.1, 0.32, 5.3, P.hullDark, [0, 0.72, 0]);
  box(2.3, 0.3, 5.2, P.hull, [0, 0.98, 0]);
  // chamfer strips along upper edges
  for (const s of [1, -1]) {
    box(0.14, 0.14, 5.1, P.hullLight, [s * 1.14, 1.12, 0], { rotation: [0, 0, s * 45] });
    box(0.14, 0.14, 5.1, P.hullDark, [s * 1.1, 0.56, 0], { rotation: [0, 0, s * 45] });
  }
  // belly skid plates
  box(1.7, 0.1, 4.6, P.armorDark, [0, 0.5, 0]);
  for (let i = 0; i < 5; i++) box(1.5, 0.04, 0.12, P.black, [0, 0.44, -1.8 + i * 0.9]);
  for (const s of [1, -1]) {
    box(0.1, 0.1, 4.4, P.armor, [s * 0.9, 0.47, 0]);
    // underglow
    glowBox(0.06, 0.04, 4.0, P.neonCyan, [s * 0.72, 0.42, 0], 1.5);
    glowBox(1.4, 0.04, 0.06, P.neonCyan, [0, 0.42, s * 1.9], 1.5);
  }

  // sills with magenta strip + hazard stripes
  for (const s of [1, -1]) {
    box(0.16, 0.2, 2.6, P.hullLight, [s * 1.2, 0.9, 0.0]);
    glowBox(0.03, 0.05, 2.5, P.neonMagenta, [s * 1.29, 0.9, 0.0], 1.4);
    for (let i = 0; i < 6; i++)
      box(0.035, 0.18, 0.14, P.trim, [s * 1.285, 1.12, -0.9 + i * 0.36], { rotation: [0, 0, 0] });
    // wheel-arch armor panels over pylons
    for (const z of [1.75, -1.75]) {
      box(0.1, 0.1, 1.3, P.armor, [s * 1.2, 1.2, z]);
      box(0.12, 0.32, 1.1, P.armor, [s * 1.2, 1.02, z]);
      box(0.14, 0.06, 1.2, P.trim, [s * 1.21, 1.2, z]);
      box(0.1, 0.24, 0.1, P.armorDark, [s * 1.2, 1.0, z + 0.62], { rotation: [20, 0, 0] });
      box(0.1, 0.24, 0.1, P.armorDark, [s * 1.2, 1.0, z - 0.62], { rotation: [-20, 0, 0] });
      for (let k = 0; k < 4; k++)
        b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 6), P.metal, {
          bone, at: [s * 1.27, 1.04, z - 0.4 + k * 0.27], dir: [s, 0, 0],
        });
    }
  }

  // front bumper + ram bar
  box(2.3, 0.3, 0.3, P.armorDark, [0, 0.85, 2.62]);
  box(2.0, 0.12, 0.2, P.trim, [0, 0.98, 2.76]);
  box(1.6, 0.2, 0.18, P.armor, [0, 0.78, 2.78], { rotation: [-15, 0, 0] });
  for (const s of [1, -1]) {
    box(0.12, 0.5, 0.12, P.black, [s * 0.75, 0.82, 2.82]);
    box(0.12, 0.12, 0.3, P.black, [s * 0.9, 0.7, 2.76]);
    // tow hooks
    b.part(new THREE.TorusGeometry(0.07, 0.02, 5, 8), P.metal, { bone, at: [s * 0.45, 0.62, 2.82] });
    glowBox(0.4, 0.05, 0.03, P.neonCyan, [s * 0.5, 0.97, 2.86], 1.4);
  }
  // rear bumper
  box(2.3, 0.28, 0.26, P.armorDark, [0, 0.82, -2.62]);
  box(2.3, 0.07, 0.28, P.trim, [0, 0.98, -2.62]);
  for (const s of [1, -1]) {
    box(0.4, 0.14, 0.04, P.black, [s * 0.8, 0.82, -2.76]);
    b.part(new THREE.TorusGeometry(0.06, 0.02, 5, 8), P.metal, { bone, at: [s * 0.35, 0.6, -2.7] });
  }
  // license plate
  box(0.5, 0.16, 0.03, P.decalWhite, [0, 0.8, -2.77]);
  for (let i = 0; i < 4; i++) box(0.06, 0.08, 0.035, P.black, [-0.15 + i * 0.1, 0.8, -2.785]);
  glowBox(1.2, 0.04, 0.03, P.neonMagenta, [0, 0.93, -2.77], 1.4);

  // hood side hazard decals and panel seams
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++)
      box(0.03, 0.12, 0.14, P.trim, [s * 1.16, 0.85, 2.1 + i * 0.16], { rotation: [0, 0, 0] });
    box(0.03, 0.2, 0.5, P.decalWhite, [s * 1.16, 0.95, 0.9]);
    box(0.03, 0.03, 5.0, P.black, [s * 1.16, 0.78, 0]);
  }
  for (const z of [-1.2, 0.35, 1.2, 2.2]) box(2.31, 0.02, 0.03, P.black, [0, 1.12, z]);

  // rivets scattered
  const rg = new THREE.CylinderGeometry(0.022, 0.022, 0.03, 6);
  for (let i = 0; i < 28; i++) {
    const s = i % 2 ? 1 : -1;
    const z = -2.4 + (i / 28) * 4.8 + R() * 0.05;
    b.part(rg, P.metal, { bone, at: [s * 1.17, 0.7 + R() * 0.05, z], dir: [s, 0, 0] });
  }
  // grime on lower faces
  for (let i = 0; i < 6; i++)
    box(0.5 + R() * 0.4, 0.02, 0.4 + R() * 0.5, P.rust, [(R() - 0.5) * 1.4, 0.38, -2 + i * 0.8]);
}
    return buildChassis;
  })(),
  // cab
  (() => {
function buildCab({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(5);
  // box helper: center, size, color
  const box = (c: number[], s: number[], col: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), col, { bone, at: c as any, rotation: rot as any });
  const glw = (c: number[], s: number[], col: string, k = 1.4) => glow(box(c, s, col), k);
  // wedge prism (side-profile polygon in z/y extruded along x)
  const prism = (pts: number[][], w: number, x: number, col: string) =>
    b.extrude(pts as any, { at: [x - w / 2, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: w, color: col, bone });

  // ---- hood: sloped wedge z 1.2..2.7
  prism([[1.2, 1.15], [2.7, 1.15], [2.7, 1.5], [2.3, 1.62], [1.2, 1.78]], 2.1, 0, P.armor);
  box([0, 1.64, 1.75], [1.9, 0.05, 1.1], P.armorDark, [-14, 0, 0]);
  // hood scoop
  box([0, 1.74, 1.85], [0.6, 0.14, 0.7], P.hullDark, [-14, 0, 0]);
  box([0, 1.8, 2.12], [0.46, 0.05, 0.16], P.black, [-14, 0, 0]);
  // hood vents
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++)
      box([s * 0.62, 1.66 - i * 0.012, 1.55 + i * 0.12], [0.34, 0.015, 0.05], P.black, [-14, 0, 0]);
  // hazard stripes on hood edges
  for (const s of [1, -1]) box([s * 1.03, 1.5, 2.0], [0.04, 0.05, 1.3], P.trim, [-14, 0, 0]);
  // armor overlays
  for (const s of [1, -1]) {
    box([s * 0.98, 1.4, 2.0], [0.08, 0.3, 1.0], P.armorDark);
    box([s * 0.99, 1.4, 2.0], [0.04, 0.2, 0.8], P.armor);
  }
  // grille front
  box([0, 1.36, 2.69], [1.5, 0.34, 0.06], P.black);
  for (let i = 0; i < 6; i++) box([0, 1.26 + i * 0.055, 2.725], [1.4, 0.015, 0.02], P.metal);
  box([0, 1.55, 2.6], [1.9, 0.12, 0.2], P.armorDark, [-20, 0, 0]);
  // headlights + DRL
  for (const s of [1, -1]) {
    glw([s * 0.78, 1.38, 2.72], [0.3, 0.2, 0.06], P.headlight, 1.8);
    box([s * 0.78, 1.38, 2.69], [0.36, 0.26, 0.04], P.black);
    glw([s * 0.78, 1.22, 2.72], [0.34, 0.03, 0.04], P.neonCyan, 1.5);
    box([s * 0.45, 1.52, 2.72], [0.04, 0.12, 0.05], P.trim);
  }

  // ---- cab body z -0.5..1.2
  prism([[-0.5, 1.15], [1.2, 1.15], [1.2, 1.78], [0.55, 2.22], [-0.45, 2.22], [-0.5, 2.1]], 2.1, 0, P.hull);
  // pillars & roof
  box([0, 2.27, 0.05], [2.14, 0.08, 1.0], P.armor);
  box([0, 2.31, 0.05], [1.7, 0.03, 0.7], P.armorDark);
  const wsAngle = -Math.atan2(0.44, 0.65) * 180 / Math.PI;
  // windshield (raked)
  const wsMid = [0, 2.0, 0.88];
  box(wsMid, [1.85, 0.03, 0.78], P.glass, [wsAngle + 90 - 90 + 0, 0, 0]);
  box([0, 2.0, 0.9], [1.5, 0.02, 0.5], P.glassGlint, [wsAngle, 0, 0]).mesh.visible = false;
  for (const s of [1, -1]) {
    box([s * 0.96, 2.0, 0.9], [0.09, 0.07, 0.85], P.armorDark, [wsAngle, 0, 0]);
    box([s * 1.07, 1.65, 1.05], [0.04, 0.5, 0.16], P.armor); // A pillar armor
    box([s * 1.07, 1.7, -0.45], [0.04, 0.7, 0.1], P.armor); // B/C pillar
    // side windows
    box([s * 1.065, 1.95, 0.42], [0.03, 0.4, 0.9], P.glass);
    box([s * 1.07, 2.02, 0.2], [0.02, 0.04, 0.5], P.glassGlint);
    box([s * 1.07, 1.92, 0.45], [0.02, 0.03, 0.4], P.glassGlint);
    for (let i = 0; i < 3; i++) box([s * 1.08, 1.95, 0.1 + i * 0.32], [0.03, 0.42, 0.03], P.black); // bars
    // door seams
    box([s * 1.062, 1.55, 0.95], [0.02, 0.8, 0.02], P.black);
    box([s * 1.062, 1.55, -0.05], [0.02, 0.8, 0.02], P.black);
    box([s * 1.062, 1.17, 0.45], [0.02, 0.02, 1.0], P.black);
    // handles
    box([s * 1.09, 1.68, 0.78], [0.05, 0.05, 0.2], P.metal);
    // hazard stripes
    for (let i = 0; i < 4; i++) box([s * 1.07, 1.35, -0.3 + i * 0.22], [0.02, 0.1, 0.1], P.trim, [0, 0, 0]);
    box([s * 1.065, 1.35, 0.15], [0.015, 0.012, 0.9], P.black);
    // mirrors
    box([s * 1.2, 1.75, 1.05], [0.05, 0.05, 0.14], P.black);
    box([s * 1.28, 1.8, 1.05], [0.06, 0.2, 0.16], P.hullDark);
    box([s * 1.31, 1.8, 1.05], [0.01, 0.16, 0.12], P.glassGlint);
  }
  // windshield glint streaks
  for (let i = 0; i < 3; i++) box([-0.4 + i * 0.35, 2.0, 0.9], [0.06, 0.012, 0.5], P.glassGlint, [wsAngle, 0, 20]).mesh.visible = false;
  // rear window
  box([0, 1.95, -0.5], [1.5, 0.4, 0.03], P.glass);
  box([0, 1.95, -0.53], [1.5, 0.03, 0.02], P.black);

  // interior
  for (const s of [1, -1]) {
    box([s * 0.45, 1.45, 0.3], [0.5, 0.1, 0.5], P.hullDark);
    box([s * 0.45, 1.75, 0.05], [0.5, 0.55, 0.1], P.hullDark);
    box([s * 0.45, 1.88, 0.05], [0.3, 0.12, 0.08], P.hullLight);
  }
  b.part(new THREE.TorusGeometry(0.14, 0.02, 5, 8), P.black, { bone, at: [0.45, 1.75, 0.95], rotation: [-40, 0, 0] });
  box([0, 1.62, 1.1], [1.8, 0.1, 0.2], P.black);

  // ---- roof light bar
  box([0, 2.4, 0.6], [1.5, 0.08, 0.16], P.black);
  for (let i = 0; i < 6; i++)
    glw([-0.62 + i * 0.25, 2.45, 0.6], [0.2, 0.07, 0.12], i % 2 ? P.neonMagenta : P.neonOrange, 1.6);
  box([0, 2.34, 0.6], [1.5, 0.05, 0.05], P.trim);
  // antennas
  for (const s of [1, -1]) {
    const h = s > 0 ? 0.9 : 0.6;
    b.rod([s * 0.9, 2.3, -0.3], [s * 0.95, 2.3 + h * 0.0 + 0.0, -0.3], 0.01, P.black, { bone });
    b.rod([s * 0.9, 2.3, -0.3], [s * 0.92, 2.3 + h * 0.001, -0.3], 0.015, P.black, { bone });
    b.part(new THREE.CylinderGeometry(0.008, 0.016, 0.0 + 0.1 + 0.0, 5), P.metal, { bone, at: [s * 0.9, 2.35, -0.3] });
  }
  glw([0.9, 2.33, -0.3], [0.04, 0.04, 0.04], P.neonCyan);
  glw([-0.9, 2.33, -0.3], [0.04, 0.04, 0.04], P.neonMagenta);
  // roof armor corners
  for (const s of [1, -1]) for (const z of [-0.4, 0.5]) box([s * 0.95, 2.3, z], [0.2, 0.06, 0.2], P.armorDark);
  // sill neon
  for (const s of [1, -1]) glw([s * 1.07, 1.2, 0.45], [0.02, 0.025, 1.6], P.neonMagenta, 1.3);
  // rivets on hood
  for (let i = 0; i < 8; i++) {
    const x = (R() - 0.5) * 1.6;
    b.part(new THREE.SphereGeometry(0.018, 5, 4), P.metal, { bone, at: [x, 1.68 - 0.0, 2.45 - R() * 0.2] as any });
  }
}
    return buildCab;
  })(),
  // bed
  (() => {
function buildBed({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z], ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, x: number, y: number, z: number, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at: [x, y, z], ...o });
  const G = (p: any, s = 1.2) => glow(p, s);

  // floor
  box(2.3, 0.08, 2.2, P.hullDark, 0, 1.14, -1.6);
  for (let i = 0; i < 9; i++) box(2.0, 0.025, 0.07, P.black, 0, 1.2, -0.7 - i * 0.22);

  // side walls
  for (const s of [1, -1]) {
    box(0.1, 0.55, 2.2, P.hull, s * 1.1, 1.45, -1.6);
    box(0.12, 0.1, 2.2, P.armor, s * 1.1, 1.78, -1.6);
    box(0.13, 0.04, 2.2, P.trim, s * 1.1, 1.68, -1.6);
    // chamfered armor plates
    for (let i = 0; i < 3; i++) {
      box(0.04, 0.34, 0.6, P.armor, s * 1.17, 1.42, -0.95 - i * 0.7, { rotation: [0, 0, s * 4] });
      box(0.05, 0.05, 0.62, P.armorDark, s * 1.18, 1.62, -0.95 - i * 0.7);
    }
    // wheel arch bulges
    box(0.16, 0.3, 0.7, P.hullLight, s * 1.12, 1.3, -1.75, { rotation: [0, 0, s * 8] });
    // tie-down hooks
    for (const z of [-0.9, -2.4]) {
      b.part(new THREE.TorusGeometry(0.05, 0.015, 5, 8), P.metal, { bone, at: [s * 1.03, 1.7, z], rotation: [0, 90, 0] });
    }
    // rail neon
    G(box(0.03, 0.03, 2.1, P.neonMagenta, s * 1.17, 1.3, -1.6));
  }

  // tailgate
  box(2.3, 0.6, 0.1, P.hull, 0, 1.45, -2.65);
  box(2.0, 0.4, 0.04, P.armor, 0, 1.45, -2.72);
  box(2.3, 0.1, 0.12, P.armorDark, 0, 1.78, -2.65);
  for (let i = 0; i < 4; i++) box(2.3, 0.04, 0.13, i % 2 ? P.black : P.trim, 0, 1.3 + i * 0.0, -2.66, { scale: [1, 1, 1] });
  G(box(1.7, 0.05, 0.03, P.neonMagenta, 0, 1.6, -2.75));
  for (const s of [1, -1]) {
    G(box(0.22, 0.14, 0.05, P.taillight, s * 0.95, 1.42, -2.73), 1.4);
    box(0.28, 0.2, 0.03, P.black, s * 0.95, 1.42, -2.7);
  }
  // front wall
  box(2.3, 0.7, 0.1, P.hullDark, 0, 1.5, -0.55);

  // roll hoop
  for (const s of [1, -1]) cyl(0.04, 0.04, 0.8, 8, P.armorDark, s * 0.9, 2.0, -0.62);
  box(1.9, 0.08, 0.08, P.armorDark, 0, 1.9, -0.62);
  // spotlight
  cyl(0.09, 0.07, 0.16, 8, P.black, 0, 2.0, -0.62, { rotation: [90, 0, 0] });
  G(cyl(0.07, 0.07, 0.03, 8, P.headlight, 0, 2.0, -0.53, { rotation: [90, 0, 0] }), 1.5);
  cyl(0.02, 0.02, 0.1, 6, P.metal, 0, 1.94, -0.62);

  // gun pedestal
  cyl(0.18, 0.28, 0.45, 8, P.armorDark, 0, 1.4, M.gunRing[2]);
  cyl(0.3, 0.3, 0.1, 12, P.armor, 0, 1.68, M.gunRing[2]);
  b.part(new THREE.TorusGeometry(0.3, 0.02, 5, 16), P.trim, { bone, at: [0, 1.74, M.gunRing[2]], rotation: [90, 0, 0] });
  G(b.part(new THREE.TorusGeometry(0.22, 0.012, 4, 16), P.neonCyan, { bone, at: [0, 1.745, M.gunRing[2]], rotation: [90, 0, 0] }));
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    cyl(0.02, 0.02, 0.03, 6, P.metal, Math.sin(a) * 0.25, 1.75, M.gunRing[2] + Math.cos(a) * 0.25);
  }

  // ammo crates
  for (const [x, z] of [[0.7, -2.2], [0.72, -1.7]] as number[][]) {
    box(0.5, 0.4, 0.4, P.armor, x, 1.38, z);
    box(0.52, 0.05, 0.42, P.trim, x, 1.58, z);
    box(0.05, 0.4, 0.42, P.trim, x - 0.15, 1.38, z);
    box(0.05, 0.4, 0.42, P.trim, x + 0.15, 1.38, z);
    b.part(new THREE.TorusGeometry(0.05, 0.012, 4, 8), P.metal, { bone, at: [x, 1.62, z] , rotation: [90, 0, 0]});
  }
  // fuel drum
  cyl(0.22, 0.22, 0.6, 10, P.rust, -0.7, 1.5, -2.2);
  for (const y of [1.3, 1.5, 1.7]) cyl(0.235, 0.235, 0.03, 10, P.armorDark, -0.7, y, -2.2);
  cyl(0.06, 0.06, 0.05, 6, P.metal, -0.7, 1.82, -2.2);
  box(0.2, 0.01, 0.2, P.trim, -0.7, 1.805, -2.2);
}
    return buildBed;
  })(),
  // thrusters
  (() => {
function buildThrusters({ b, J, P, M }: any) {
  const names = ["FL", "FR", "RL", "RR"];
  const CY = 0.55;
  const R = 0.55;
  const part = (geo: THREE.BufferGeometry, color: string, bone: any, at: number[], o: any = {}) =>
    b.part(geo, color, { bone, at, flat: true, ...o });

  for (const n of names) {
    const j = J["thruster" + n];
    const m = M["thruster" + n];
    const sx = m[0] > 0 ? 1 : -1;
    const cx = sx * 1.4;
    const cz = m[2];
    const C = [cx, CY, cz];
    const oct = (r0: number, r1: number, h: number, color: string, y: number, o: any = {}) =>
      part(new THREE.CylinderGeometry(r1, r0, h, 8), color, j, [cx, y, cz], { rotation: [0, 22.5, 0], ...o });

    // duct housing: outer shell, hazard bands top and bottom
    oct(R, R, 0.5, P.hullLight, CY);
    oct(R * 1.02, R * 1.02, 0.06, P.trim, 0.1);
    oct(R * 1.02, R * 1.02, 0.06, P.trim, 0.97 - 0.42 + 0.0 + 0.0);
    oct(R * 0.9, R * 0.9, 0.12, P.hullDark, 0.04);
    // black inner shroud (top face inside)
    oct(0.46, 0.46, 0.46, P.black, CY, { });
    // magenta rim ring
    glow(part(new THREE.TorusGeometry(0.48, 0.03, 4, 8), P.neonMagenta, j, [cx, CY + 0.26, cz], { rotation: [90, 22.5, 0] }), 1.4);
    // core disc
    glow(part(new THREE.CylinderGeometry(0.17, 0.17, 0.06, 10), P.neonCyan, j, [cx, CY - 0.02, cz]), 1.8);
    part(new THREE.CylinderGeometry(0.07, 0.07, 0.14, 8), P.metal, j, [cx, CY, cz]);
    // spoke vanes
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const rr = 0.3;
      part(new THREE.BoxGeometry(0.28, 0.025, 0.06), P.metal, j, [cx + Math.cos(a) * rr * 0.8, CY + 0.03, cz + Math.sin(a) * rr * 0.8], {
        rotation: [0, (-a * 180) / Math.PI, 0],
      });
    }
    // vectoring flaps below
    for (const fz of [-1, 1]) {
      part(new THREE.BoxGeometry(0.6, 0.03, 0.16), P.hullDark, j, [cx, 0.08, cz + fz * 0.3], { rotation: [fz * 20, 0, 0] });
      part(new THREE.BoxGeometry(0.62, 0.02, 0.03), P.trim, j, [cx, 0.09, cz + fz * 0.38], { rotation: [fz * 20, 0, 0] });
    }
    // pylon strut from chassis side (x=±1.15) to duct
    const inner = [sx * 1.15, 0.95, cz];
    const outer = [cx - sx * 0.4, 0.7, cz];
    b.rod(inner, outer, 0.09, P.hull, { bone: j });
    b.rod([sx * 1.15, 0.62, cz], [cx - sx * 0.45, 0.45, cz], 0.06, P.armorDark, { bone: j });
    part(new THREE.BoxGeometry(0.1, 0.34, 0.34), P.armor, j, [sx * 1.2, 0.8, cz]);
    // hydraulic piston
    b.rod([sx * 1.18, 0.55, cz + 0.2], [cx - sx * 0.45, 0.62, cz + 0.2], 0.03, P.metal, { bone: j });
    b.rod([sx * 1.18, 0.55, cz + 0.2], [sx * 1.3, 0.58, cz + 0.2], 0.045, P.hullDark, { bone: j });
    b.rod([sx * 1.18, 0.55, cz - 0.2], [cx - sx * 0.45, 0.62, cz - 0.2], 0.03, P.metal, { bone: j });
    // bolts
    for (let i = 0; i < 8; i++) {
      const a = ((i + 0.5) * Math.PI) / 4;
      part(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 5), P.metal, j, [cx + Math.cos(a) * 0.5, CY + 0.27, cz + Math.sin(a) * 0.5]);
    }
  }
}
    return buildThrusters;
  })(),
  // turret
  (() => {
function buildTurret({ b, J, P, M }: Ctx) {
  const BRASS = "#c9a23a";
  const BRASS_D = "#8a6a1e";
  const yaw = J.gunYaw;
  const pit = J.gunPitch;
  const gz = M.gunRing[2];
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r1: number, r2: number, h: number, s = 8) => new THREE.CylinderGeometry(r1, r2, h, s);
  const put = (g: THREE.BufferGeometry, c: string, bone: any, at: number[], o: any = {}) =>
    b.part(g, c, { bone, at, flat: true, ...o });
  const glowMat = (p: any, k = 1) => {
    const m = p.mesh.material as THREE.MeshStandardMaterial;
    const c = m.clone();
    c.emissive.copy(m.color);
    c.emissiveIntensity = k;
    p.mesh.material = c;
    return p;
  };

  // ---- yaw collar + shield (on gunYaw)
  put(cyl(0.42, 0.46, 0.1, 12), P.armorDark, yaw, [0, 1.8, gz]);
  put(cyl(0.47, 0.47, 0.03, 12), P.trim, yaw, [0, 1.76, gz]);
  put(cyl(0.3, 0.34, 0.1, 10), P.hullDark, yaw, [0, 1.9, gz]);
  // shield plates in front of the gun
  put(box(0.8, 0.42, 0.05), P.armor, yaw, [0, 2.08, gz + 0.3], { rotation: [-12, 0, 0] });
  put(box(0.82, 0.04, 0.07), P.trim, yaw, [0, 2.29, gz + 0.34], { rotation: [-12, 0, 0] });
  for (const s of [1, -1]) {
    put(box(0.05, 0.38, 0.4), P.armor, yaw, [s * 0.4, 2.05, gz + 0.12], { rotation: [0, s * 12, 0] });
    put(box(0.07, 0.04, 0.42), P.trim, yaw, [s * 0.4, 2.25, gz + 0.12]);
    // cradle side arms
    put(box(0.06, 0.28, 0.26), P.hullLight, yaw, [s * 0.22, 2.0, gz]);
    put(cyl(0.05, 0.05, 0.1, 8), P.metal, yaw, [s * 0.27, 2.0, gz], { rotation: [0, 0, 90] });
    // rivets on shield
    for (const rx of [-0.25, 0.25])
      put(new THREE.SphereGeometry(0.02, 5, 4), P.metal, yaw, [rx * s, 2.0, gz + 0.34]);
  }
  put(box(0.5, 0.05, 0.06), P.black, yaw, [0, 2.1, gz + 0.335], { rotation: [-12, 0, 0] }); // sight slit

  // ---- gun (on gunPitch)
  const gy = 2.0;
  put(box(0.3, 0.26, 0.55), P.hull, pit, [0, gy, gz + 0.05]);
  put(box(0.32, 0.04, 0.57), P.hullLight, pit, [0, gy + 0.14, gz + 0.05]);
  put(box(0.24, 0.2, 0.08), P.hullDark, pit, [0, gy, gz - 0.27]);
  // vent grille on the rear
  for (let i = 0; i < 4; i++) put(box(0.2, 0.015, 0.03), P.black, pit, [0, gy - 0.06 + i * 0.045, gz - 0.325]);
  // side vents
  for (const s of [1, -1])
    for (let i = 0; i < 3; i++) put(box(0.01, 0.12, 0.03), P.black, pit, [s * 0.155, gy + 0.02, gz - 0.1 + i * 0.07]);

  // twin barrels
  for (const s of [1, -1]) {
    const x = s * 0.09;
    put(cyl(0.035, 0.035, 0.9, 8), P.metal, pit, [x, gy + 0.02, gz + 0.7], { rotation: [90, 0, 0] });
    put(cyl(0.065, 0.065, 0.5, 8), P.hullDark, pit, [x, gy + 0.02, gz + 0.5], { rotation: [90, 0, 0] });
    for (let i = 0; i < 4; i++)
      put(cyl(0.068, 0.068, 0.04, 8), P.black, pit, [x, gy + 0.02, gz + 0.32 + i * 0.1], { rotation: [90, 0, 0] });
    put(cyl(0.055, 0.05, 0.12, 8), P.armorDark, pit, [x, gy + 0.02, gz + 1.18], { rotation: [90, 0, 0] });
    put(cyl(0.03, 0.03, 0.02, 6), P.black, pit, [x, gy + 0.02, gz + 1.25], { rotation: [90, 0, 0] });
    put(box(0.1, 0.012, 0.06), P.black, pit, [x, gy + 0.02, gz + 1.18]);
  }
  put(box(0.1, 0.1, 0.1), P.trim, pit, [0, gy + 0.02, gz + 0.36]);

  // ammo box with belt
  put(box(0.2, 0.2, 0.3), P.armor, pit, [0.27, gy - 0.05, gz + 0.02]);
  put(box(0.21, 0.03, 0.31), P.trim, pit, [0.27, gy + 0.05, gz + 0.02]);
  put(box(0.1, 0.04, 0.08), P.metal, pit, [0.27, gy + 0.0, gz + 0.19]);
  const r = rng(5);
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    put(box(0.035, 0.03, 0.045), i % 2 ? BRASS : BRASS_D, pit, [0.25 - t * 0.14, gy + 0.05 - t * 0.04 + r() * 0.005, gz + 0.22 + t * 0.03], {
      rotation: [0, 0, 20 * t],
    });
  }

  // sight scope (glowing orange)
  put(cyl(0.035, 0.035, 0.22, 8), P.black, pit, [-0.1, gy + 0.2, gz + 0.1], { rotation: [90, 0, 0] });
  glowMat(put(cyl(0.032, 0.032, 0.01, 8), P.neonOrange, pit, [-0.1, gy + 0.2, gz + 0.215], { rotation: [90, 0, 0] }), 1.6);
  put(box(0.03, 0.06, 0.03), P.metal, pit, [-0.1, gy + 0.15, gz + 0.1]);
  put(box(0.03, 0.06, 0.03), P.metal, pit, [-0.1, gy + 0.15, gz + 0.0]);

  // status light
  glowMat(put(new THREE.SphereGeometry(0.02, 6, 4), P.neonCyan, pit, [0.1, gy + 0.15, gz - 0.2]), 1.5);

  // handles and grip bars at the rear
  for (const s of [1, -1]) {
    put(cyl(0.012, 0.012, 0.2, 6), P.metal, pit, [s * 0.14, gy - 0.02, gz - 0.38], { rotation: [0, 0, 90 * 0] });
    put(cyl(0.015, 0.015, 0.14, 6), P.black, pit, [s * 0.14, gy - 0.1, gz - 0.42], { rotation: [0, 0, 0] });
    put(cyl(0.012, 0.012, 0.1, 6), P.metal, pit, [s * 0.14, gy - 0.03, gz - 0.35], { rotation: [90, 0, 0] });
  }
  put(cyl(0.012, 0.012, 0.3, 6), P.metal, pit, [0, gy - 0.1, gz - 0.44], { rotation: [0, 0, 90] });
}
    return buildTurret;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "hoverTechnical" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,0.85,0], dir: [0,0,1], role: "spine" });
  J["gunYaw"] = b.joint("gunYaw", { parent: J["body"], at: [0,1.75,-1.3], dir: [0,1,0], role: "hinge", group: "gun" });
  J["gunPitch"] = b.joint("gunPitch", { parent: J["gunYaw"], at: [0,2,-1.3], dir: [1,0,0], role: "hinge", group: "gun" });
  J["thrusterFL"] = b.joint("thrusterFL", { parent: J["body"], at: [1.35,0.75,1.75], dir: [1,0,0], role: "hinge", group: "thrusters" });
  J["thrusterFR"] = b.joint("thrusterFR", { parent: J["body"], at: [-1.35,0.75,1.75], dir: [-1,0,0], role: "hinge", group: "thrusters" });
  J["thrusterRL"] = b.joint("thrusterRL", { parent: J["body"], at: [1.35,0.75,-1.75], dir: [1,0,0], role: "hinge", group: "thrusters" });
  J["thrusterRR"] = b.joint("thrusterRR", { parent: J["body"], at: [-1.35,0.75,-1.75], dir: [-1,0,0], role: "hinge", group: "thrusters" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
