import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Riot Interceptor R-9 'Pacifier'",
  "description": "A corporate cyberpunk riot-control interceptor: armored wedge hull on heavy wheels, roof water cannon, and glowing neon light bars."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#2b2f3a",
  hullDark: "#14161d",
  hullLight: "#4a5162",
  armor: "#3a404f",
  trim: "#f2c200",
  hazardBlack: "#101010",
  neonCyan: "#2ff3ff",
  neonPink: "#ff2e93",
  neonYellow: "#fff04a",
  glass: "#0b2a3a",
  tire: "#101114",
  rim: "#7b8296",
  steel: "#9aa3b5",
  tank: "#2f6f8f",
  tankBand: "#1b3d52",
  warnRed: "#e0243a",
  white: "#e9edf5",
};
const M = {
  deckTop: [0, 1.5, -0.6] as [number, number, number],
  cabinRoof: [0, 2, 0.3] as [number, number, number],
  turretRing: [0, 2.05, -1] as [number, number, number],
  cannonMuzzle: [0, 2.5, 1.9] as [number, number, number],
  axleFront: [0, 0.55, 1.9] as [number, number, number],
  axleRear: [0, 0.55, -1.8] as [number, number, number],
  bumperFront: [0, 0.7, 2.95] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // hull
  (() => {
function buildHull({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, ...o });
  const neon = (w: number, h: number, d: number, c: string, at: number[], s = 1.4) =>
    glow(box(w, h, d, c, at), s);
  const cyl = (r: number, len: number, c: string, at: number[], dir: number[], seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), c, { bone, at, dir });

  // main chassis
  box(2.5, 0.5, 5.6, P.hullDark, [0, 0.55, 0]);
  box(2.5, 0.55, 3.1, P.hull, [0, 1.05, -1.4]);
  box(2.4, 0.5, 2.0, P.hull, [0, 1.0, 0.3]);
  // sloped hood wedge
  b.slab([
    [-1.2, 1.25, 1.2], [1.2, 1.25, 1.2], [1.2, 0.95, 2.8], [-1.2, 0.95, 2.8],
  ], { color: P.armor, thickness: 0.12, bone });
  box(2.4, 0.5, 1.7, P.hull, [0, 0.9, 2.0], { rotation: [-14, 0, 0] });
  box(2.0, 0.08, 1.5, P.hullLight, [0, 1.23, 1.95], { rotation: [-14, 0, 0] });
  // hood vents
  for (let i = 0; i < 5; i++) {
    box(0.7, 0.03, 0.06, P.hullDark, [0, 1.28 - i * 0.03, 1.5 + i * 0.22], { rotation: [-14, 0, 0] });
  }
  // hood center ridge
  box(0.12, 0.08, 1.4, P.trim, [0, 1.27, 1.95], { rotation: [-14, 0, 0] });

  // ram bumper
  box(2.6, 0.45, 0.45, P.armor, [0, 0.7, 2.8]);
  box(2.3, 0.2, 0.3, P.hullDark, [0, 0.4, 2.9]);
  for (let i = 0; i < 8; i++) {
    const x = -1.12 + i * 0.32;
    box(0.17, 0.4, 0.04, i % 2 ? P.hazardBlack : P.trim, [x, 0.7, 3.03]);
  }
  box(2.6, 0.06, 0.5, P.steel, [0, 0.95, 2.8]);
  // pink nose strip
  neon(2.0, 0.07, 0.05, P.neonPink, [0, 0.9, 3.06], 1.8);
  neon(2.0, 0.04, 0.05, P.neonPink, [0, 0.52, 3.06], 1.4);
  // headlight slits
  for (const s of [1, -1]) {
    neon(0.6, 0.07, 0.05, P.white, [s * 0.85, 1.12, 2.78], 1.8);
    box(0.7, 0.14, 0.03, P.hazardBlack, [s * 0.85, 1.12, 2.74]);
    // tow hooks
    cyl(0.05, 0.3, P.steel, [s * 0.6, 0.35, 3.0], [0, 0, 1]);
    box(0.12, 0.12, 0.05, P.warnRed, [s * 1.1, 0.7, 3.04]);
  }

  // side skirts and panels
  for (const s of [1, -1]) {
    box(0.18, 0.4, 2.0, P.armor, [s * 1.3, 0.55, 0], {});
    box(0.06, 0.34, 1.9, P.hullLight, [s * 1.4, 0.55, 0]);
    // hazard stripes on skirt
    for (let i = 0; i < 8; i++) box(0.04, 0.3, 0.12, i % 2 ? P.hazardBlack : P.trim, [s * 1.44, 0.55, -0.85 + i * 0.24]);
    // underglow tubes
    neon(0.07, 0.07, 4.6, P.neonCyan, [s * 1.15, 0.32, 0], 1.6);
    // upper body side panels
    box(0.08, 0.6, 3.0, P.hullLight, [s * 1.27, 1.0, -1.4]);
    box(0.08, 0.55, 1.6, P.armor, [s * 1.23, 0.98, 0.5]);
    // door seams
    for (const z of [-0.3, 1.3]) box(0.03, 0.55, 0.03, P.hazardBlack, [s * 1.28, 1.0, z]);
    box(0.03, 0.03, 1.6, P.hazardBlack, [s * 1.28, 0.72, 0.5]);
    box(0.05, 0.05, 0.22, P.steel, [s * 1.29, 1.08, 0.1]);
    // logo plates
    box(0.03, 0.22, 0.5, P.hazardBlack, [s * 1.3, 1.0, -1.5]);
    box(0.04, 0.12, 0.3, P.trim, [s * 1.32, 1.0, -1.5]);
    neon(0.04, 0.03, 0.3, P.neonYellow, [s * 1.33, 1.2, -1.5]);
    // side neon bar
    neon(0.04, 0.05, 2.6, P.neonMagenta ?? P.neonPink, [s * 1.31, 1.28, -1.3]);
    // fender arches over wheels
    for (const z of [1.9, -1.8]) {
      b.part(new THREE.TorusGeometry(0.78, 0.09, 6, 12, Math.PI), P.armor, {
        bone, at: [s * 1.22, 0.55, z], rotation: [0, 90, 0],
      });
      box(0.2, 0.1, 1.5, P.hullDark, [s * 1.3, 1.33, z]);
    }
  }

  // rear bumper
  box(2.5, 0.4, 0.4, P.armor, [0, 0.6, -3.0]);
  box(2.2, 0.1, 0.3, P.steel, [0, 0.4, -3.1]);
  for (let i = 0; i < 8; i++) box(0.17, 0.12, 0.04, i % 2 ? P.hazardBlack : P.trim, [-1.12 + i * 0.32, 0.8, -3.2]);
  for (const s of [1, -1]) {
    neon(0.9, 0.09, 0.05, P.warnRed, [s * 0.75, 0.62, -3.22], 1.8);
    box(0.4, 0.4, 0.05, P.hazardBlack, [s * 0.75, 1.1, -3.0]);
  }
  box(0.7, 0.3, 0.05, P.hazardBlack, [0, 1.1, -3.01]);
  box(0.5, 0.18, 0.04, P.trim, [0, 1.1, -3.04]);
  neon(0.3, 0.05, 0.04, P.neonCyan, [0, 1.1, -3.07]);

  // bolts on deck and bumper
  for (let i = 0; i < 14; i++) {
    const x = (R() - 0.5) * 2.2;
    const z = -2.7 + R() * 5.2;
    if (z > -1 && z < 1.0) continue;
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 6), P.steel, { bone, at: [x, 1.34, z] });
  }
  // hull front emblem
  box(0.5, 0.3, 0.04, P.hazardBlack, [0, 0.72, 3.05]);
  box(0.3, 0.16, 0.04, P.warnRed, [0, 0.72, 3.07]);
  box(0.1, 0.1, 0.04, P.white, [0, 0.72, 3.09]);
}
    return buildHull;
  })(),
  // cabin
  (() => {
function buildCabin({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, ...o });
  const lit = (w: number, h: number, d: number, c: string, at: number[], s = 1.3, o: any = {}) =>
    glow(box(w, h, d, c, at, o), s);
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, at: number[], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at, ...o });

  // main cabin body (tapered with extrude silhouette side view)
  const side = [
    [-1.0, 0], [1.4, 0], [1.4, 0.35], [0.9, 0.8], [-0.2, 0.8], [-1.0, 0.7],
  ] as [number, number][];
  b.extrude(side, { at: [-1.1, 1.5, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.2, color: P.hull, bone });
  // fix: extrude is centred on thickness axis; origin x of outline maps to z
  // roof slab sloped
  box(2.3, 0.1, 1.5, P.armor, [0, 2.3, 0.1], { rotation: [-6, 0, 0] });
  box(2.4, 0.05, 1.6, P.hullDark, [0, 2.26, 0.1]);
  // windshield visor slit
  box(1.8, 0.16, 0.05, P.glass, [0, 2.05, 1.12], { rotation: [-35, 0, 0] });
  glow(box(1.8, 0.02, 0.02, P.neonCyan, [0, 2.14, 1.17], { rotation: [-35, 0, 0] }), 1.2);
  box(1.95, 0.05, 0.08, P.hullDark, [0, 1.96, 1.1], { rotation: [-35, 0, 0] });
  // A-pillars
  for (const s of [1, -1]) {
    box(0.1, 0.55, 0.12, P.hullLight, [s * 0.98, 2.0, 1.08], { rotation: [-35, 0, s * -4] });
    // side slits
    box(0.03, 0.14, 0.9, P.glass, [s * 1.12, 2.0, 0.2]);
    box(0.02, 0.02, 0.9, P.neonCyan, [s * 1.135, 2.08, 0.2]);
    glow(box(0.02, 0.02, 0.9, P.neonCyan, [s * 1.14, 2.08, 0.2]), 1.2);
    // door plates
    box(0.04, 0.5, 0.8, P.armor, [s * 1.13, 1.75, 0.2]);
    box(0.045, 0.5, 0.04, P.hullDark, [s * 1.14, 1.75, -0.2]);
    box(0.045, 0.5, 0.04, P.hullDark, [s * 1.14, 1.75, 0.6]);
    box(0.05, 0.05, 0.7, P.trim, [s * 1.15, 1.58, 0.2]);
    // hazard stripes on door lower
    for (let i = 0; i < 6; i++)
      box(0.05, 0.06, 0.1, i % 2 ? P.hazardBlack : P.trim, [s * 1.16, 1.66, -0.1 + i * 0.12], { rotation: [25, 0, 0] });
    // handle
    box(0.06, 0.04, 0.16, P.steel, [s * 1.17, 1.85, 0.5]);
    // rear light strip
    lit(0.04, 0.04, 0.5, P.neonPink, [s * 1.16, 1.52, 0.2], 1.3);
    // sensor pod on roof edge
    cyl(0.07, 0.09, 0.1, 8, P.hullDark, [s * 1.0, 2.36, 0.9]);
    b.part(new THREE.SphereGeometry(0.06, 8, 6), P.warnRed, { bone, at: [s * 1.0, 2.43, 0.9] });
    glow(b.part(new THREE.SphereGeometry(0.045, 6, 4), P.warnRed, { bone, at: [s * 1.0, 2.46, 0.9] }), 1.5);
  }
  // roof light bar housing
  box(1.9, 0.1, 0.22, P.hullDark, [0, 2.38, 0.55]);
  const cols = [P.neonCyan, P.neonPink, P.neonYellow, P.neonPink, P.neonCyan];
  cols.forEach((c, i) => {
    lit(0.34, 0.07, 0.18, c, [-0.74 + i * 0.37, 2.45, 0.55], 1.6);
    box(0.02, 0.1, 0.2, P.hullDark, [-0.925 + i * 0.37, 2.44, 0.55]);
  });
  box(1.9, 0.02, 0.24, P.steel, [0, 2.5, 0.55]);
  // strobe housings
  for (const s of [1, -1]) {
    cyl(0.08, 0.1, 0.12, 8, P.hullDark, [s * 0.95, 2.36, 0.0]);
    glow(cyl(0.06, 0.06, 0.05, 8, s > 0 ? P.neonCyan : P.neonPink, [s * 0.95, 2.44, 0.0]), 1.6);
  }
  // front roof pink-yellow thin bars
  lit(1.6, 0.03, 0.04, P.neonYellow, [0, 2.33, 0.95], 1.4);
  // antenna
  cyl(0.012, 0.02, 0.6, 6, P.steel, [-0.8, 2.6, -0.5]);
  cyl(0.04, 0.04, 0.05, 6, P.hullDark, [-0.8, 2.34, -0.5]);
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), P.warnRed, { bone, at: [-0.8, 2.9, -0.5] }), 1.5);
  // second antenna + dish
  cyl(0.01, 0.015, 0.4, 6, P.steel, [0.7, 2.5, -0.55]);
  b.part(new THREE.ConeGeometry(0.1, 0.06, 10), P.white, { bone, at: [0.7, 2.7, -0.5], rotation: [90, 0, 0] });
  // rear wall of cabin with grille vent
  box(1.6, 0.6, 0.06, P.hullDark, [0, 1.85, -0.98]);
  for (let i = 0; i < 7; i++) box(1.4, 0.03, 0.04, P.steel, [0, 1.65 + i * 0.075, -1.0]);
  box(0.06, 0.6, 0.04, P.trim, [-0.75, 1.85, -1.0]);
  box(0.06, 0.6, 0.04, P.trim, [0.75, 1.85, -1.0]);
  // front: hood-meeting hazard & logo plate
  box(1.2, 0.22, 0.05, P.armor, [0, 1.65, 1.38]);
  box(0.3, 0.14, 0.02, P.trim, [0, 1.65, 1.41]);
  box(0.1, 0.1, 0.02, P.warnRed, [0, 1.65, 1.42], { rotation: [0, 0, 45] });
  // roof rivets / panel lines
  for (let i = 0; i < 10; i++)
    box(0.04, 0.02, 0.04, P.hullLight, [(R() - 0.5) * 2.0, 2.33, -0.6 + R() * 0.5]);
  box(2.0, 0.015, 0.03, P.trim, [0, 2.32, -0.2]);
  // roof camera dome
  b.part(new THREE.SphereGeometry(0.1, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), P.steel, { bone, at: [0, 2.33, -0.1] });
  glow(box(0.05, 0.03, 0.03, P.neonCyan, [0, 2.4, 0.0]), 1.5);
}
    return buildCabin;
  })(),
  // wheels
  (() => {
function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.55; // tire radius
  const W = 0.5; // tire width
  const wheels: [string, number, number][] = [
    ["wheelFL", 1, M.axleFront[2]],
    ["wheelFR", -1, M.axleFront[2]],
    ["wheelRL", 1, M.axleRear[2]],
    ["wheelRR", -1, M.axleRear[2]],
  ];
  const rand = rng(11);
  const MUD = "#1f1a14";

  // cylinder along the wheel axle (local x, outward = s)
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, bone: any, at: number[], s: number, flat = true) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, dir: [s, 0, 0], flat });

  for (const [name, s, z] of wheels) {
    const j = J[name];
    const cx = 1.15 * s;
    const cy = R;
    const P3 = (dx: number, y: number, zz: number) => [cx + dx * s, cy + y, z + zz];

    // tire
    cyl(R, R, W, 20, P.tire, j, [cx, cy, z], s);
    // sidewall bulge rings
    cyl(R * 0.9, R * 0.9, W + 0.04, 20, "#1a1b20", j, [cx, cy, z], s);
    // tread blocks
    const n = 18;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const y = Math.sin(a) * (R + 0.012);
      const zz = Math.cos(a) * (R + 0.012);
      b.part(new THREE.BoxGeometry(W * 0.9, 0.05, 0.1), "#07080a", {
        bone: j,
        at: [cx, cy + y, z + zz],
        quat: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -a + Math.PI / 2 * 0 + 0),
      });
    }
    // shoulder grooves
    for (const k of [-1, 1]) cyl(R + 0.005, R + 0.005, 0.03, 20, "#07080a", j, [cx + k * 0.13 * s, cy, z], s);

    // rim outer face
    const face = cx + s * (W / 2 + 0.005);
    cyl(0.36, 0.36, 0.04, 12, P.rim, j, [face, cy, z], s);
    cyl(0.33, 0.33, 0.05, 12, "#4d5364", j, [face + s * 0.01, cy, z], s);
    // neon pink ring
    b.part(new THREE.TorusGeometry(0.37, 0.022, 5, 24), P.neonPink, {
      bone: j,
      at: [face + s * 0.02, cy, z],
      dir: [s, 0, 0],
      axis: "z",
    });
    // spokes
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const mid = 0.18;
      b.part(new THREE.BoxGeometry(0.05, 0.3, 0.07), P.steel, {
        bone: j,
        at: [face + s * 0.04, cy + Math.sin(a) * mid, z + Math.cos(a) * mid],
        quat: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -a + Math.PI / 2 + Math.PI / 2),
        flat: true,
      });
    }
    // hub + cap
    cyl(0.1, 0.1, 0.1, 10, P.steel, j, [face + s * 0.05, cy, z], s);
    cyl(0.05, 0.05, 0.12, 8, P.neonCyan, j, [face + s * 0.07, cy, z], s);
    // lug nuts
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.3;
      b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 6), P.white, {
        bone: j,
        at: [face + s * 0.08, cy + Math.sin(a) * 0.075, z + Math.cos(a) * 0.075],
        dir: [s, 0, 0],
      });
    }

    // inner side: brake disc + caliper
    const inner = cx - s * (W / 2 - 0.02);
    cyl(0.3, 0.3, 0.03, 16, "#6a6f7c", j, [inner - s * 0.03, cy, z], s);
    cyl(0.31, 0.31, 0.012, 16, "#2a2d36", j, [inner - s * 0.02, cy, z], s);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.04, 5), "#14161d", {
        bone: j,
        at: [inner - s * 0.03, cy + Math.sin(a) * 0.2, z + Math.cos(a) * 0.2],
        dir: [s, 0, 0],
      });
    }
    b.part(new THREE.BoxGeometry(0.1, 0.16, 0.2), P.warnRed, {
      bone: j,
      at: [inner - s * 0.06, cy + 0.0, z - 0.3 * (z > 0 ? -1 : -1) * 0 + 0.28],
      flat: true,
    });
    b.part(new THREE.BoxGeometry(0.11, 0.04, 0.12), P.hullDark, {
      bone: j,
      at: [inner - s * 0.06, cy + 0.0, z + 0.28],
    });
    // inner hub disc
    cyl(0.2, 0.2, 0.05, 10, P.hullLight, j, [inner - s * 0.07, cy, z], s);

    // mud flap behind tire
    const back = z - R - 0.06;
    b.part(new THREE.BoxGeometry(0.34, 0.34, 0.035), MUD, { bone: j, at: [cx, 0.26, back], flat: true });
    b.part(new THREE.BoxGeometry(0.34, 0.06, 0.04), P.trim, { bone: j, at: [cx, 0.4, back], flat: true });
    b.part(new THREE.BoxGeometry(0.2, 0.05, 0.04), P.neonYellow, { bone: j, at: [cx, 0.2 + rand() * 0.02, back - 0.002] });
    b.part(new THREE.BoxGeometry(0.06, 0.1, 0.04), P.white, { bone: j, at: [cx + 0.1 * s, 0.3, back - 0.002] });
    // flap mount bracket
    b.part(new THREE.BoxGeometry(0.4, 0.05, 0.1), P.hullDark, { bone: j, at: [cx, 0.46, back + 0.04] });
  }
}
    return buildWheels;
  })(),
  // bed
  (() => {
function buildBed({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, at: number[], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at, ...o });
  const X = [0, 0, 1];
  const ALONG_X = { dir: [1, 0, 0] };
  const ALONG_Z = { dir: [0, 0, 1] };

  // Bed floor plate
  box(2.3, 0.08, 1.9, P.hullDark, [0, 1.54, -2]);
  box(2.3, 0.2, 0.08, P.armor, [0, 1.6, -1.06]); // front bulkhead
  // Side walls
  for (const s of [1, -1]) {
    box(0.08, 0.3, 1.9, P.armor, [s * 1.14, 1.68, -2]);
    box(0.1, 0.05, 1.9, P.trim, [s * 1.14, 1.85, -2]);
  }

  // Tank (horizontal cylinder along Z)
  const tz = -2.0;
  const ty = 1.95;
  cyl(0.36, 0.36, 1.5, 16, P.tank, [0, ty, tz], ALONG_Z.dir ? { dir: [0, 0, 1] } : {});
  for (const e of [1, -1]) {
    cyl(0.3, 0.36, 0.1, 16, P.tankBand, [0, ty, tz + e * 0.78], { dir: [0, 0, e] });
  }
  for (const z of [-0.55, -0.15, 0.25, 0.65]) {
    cyl(0.375, 0.375, 0.07, 16, P.tankBand, [0, ty, tz + z - 0.1], { dir: [0, 0, 1] });
    box(0.04, 0.04, 0.04, P.steel, [0.37, ty, tz + z - 0.1]);
  }
  // Cradle saddles
  for (const z of [-0.5, 0.5]) {
    box(0.9, 0.2, 0.12, P.hullLight, [0, 1.65, tz + z]);
  }
  // Highlight stripe on tank
  box(0.06, 0.02, 1.3, P.neonCyan, [0, ty + 0.365, tz]);

  // Fill hatch on top
  cyl(0.14, 0.15, 0.06, 8, P.steel, [0, ty + 0.36, tz + 0.35]);
  cyl(0.09, 0.09, 0.05, 8, P.hullDark, [0, ty + 0.4, tz + 0.35]);
  box(0.2, 0.03, 0.03, P.trim, [0, ty + 0.44, tz + 0.35]);

  // Pressure gauge on rear face (tank end)
  cyl(0.11, 0.11, 0.04, 14, P.steel, [0, ty + 0.02, tz - 0.79], { dir: [0, 0, -1] });
  glow(cyl(0.085, 0.085, 0.03, 14, P.white, [0, ty + 0.02, tz - 0.81], { dir: [0, 0, -1] }), 0.5);
  box(0.012, 0.07, 0.01, P.warnRed, [0.01, ty + 0.05, tz - 0.835], { rotation: [0, 0, 30] });
  box(0.05, 0.012, 0.01, P.hazardBlack, [0, ty + 0.02, tz - 0.84]);

  // Pipes and hoses
  for (const s of [1, -1]) {
    b.rod([s * 0.3, 1.75, -1.2], [s * 0.3, 2.0, -1.2], 0.04, P.steel, { bone });
    b.sweep(
      [[s * 0.3, 2.0, -1.2], [s * 0.45, 2.15, -1.15], [s * 0.35, 2.25, -0.95], [s * 0.15, 2.3, -0.85]],
      0.035,
      { bone, color: P.hazardBlack },
    );
    b.part(new THREE.TorusGeometry(0.045, 0.012, 5, 8), P.trim, { bone, at: [s * 0.3, 1.9, -1.2], dir: [0, 1, 0], axis: "z" });
    b.rod([s * 0.5, 1.7, -1.15], [s * 0.5, 1.7, -2.6], 0.03, P.steel, { bone });
  }
  b.capsule([0, 1.68, -1.12], [0, 1.9, -1.12], 0.05, P.steel, { bone });

  // Side tool lockers
  for (const s of [1, -1]) {
    box(0.24, 0.3, 1.0, P.armor, [s * 0.98, 1.74, -1.9]);
    box(0.02, 0.22, 0.4, P.hull, [s * 1.11, 1.74, -2.2]);
    box(0.02, 0.22, 0.4, P.hull, [s * 1.11, 1.74, -1.65]);
    box(0.03, 0.04, 0.06, P.trim, [s * 1.125, 1.74, -2.0]);
    box(0.03, 0.03, 0.1, P.steel, [s * 1.125, 1.78, -1.55]);
    box(0.26, 0.02, 1.0, P.hullLight, [s * 0.98, 1.9, -1.9]);
  }

  // Tailgate frame with hazard stripes
  const gz = -2.96;
  box(2.3, 0.1, 0.08, P.hull, [0, 2.12, gz]);
  box(2.3, 0.1, 0.08, P.hull, [0, 1.58, gz]);
  for (const s of [1, -1]) box(0.1, 0.6, 0.08, P.hull, [s * 1.1, 1.85, gz]);
  for (let i = 0; i < 9; i++) {
    const x = -1.0 + i * 0.25;
    box(0.11, 0.06, 0.02, i % 2 ? P.hazardBlack : P.trim, [x, 1.58, gz - 0.05]);
    box(0.11, 0.06, 0.02, i % 2 ? P.trim : P.hazardBlack, [x, 2.12, gz - 0.05]);
  }
  for (const s of [1, -1]) for (let i = 0; i < 4; i++)
    box(0.06, 0.1, 0.02, i % 2 ? P.hazardBlack : P.trim, [s * 1.1, 1.67 + i * 0.12, gz - 0.05]);
  // Gate panel with emblem
  box(2.0, 0.45, 0.04, P.hullDark, [0, 1.85, gz + 0.02]);
  box(0.3, 0.3, 0.02, P.hullLight, [0, 1.85, gz - 0.02]);
  box(0.06, 0.2, 0.02, P.warnRed, [0, 1.85, gz - 0.04], { rotation: [0, 0, 45] });
  box(0.06, 0.2, 0.02, P.warnRed, [0, 1.85, gz - 0.04], { rotation: [0, 0, -45] });

  // Rear neon bar
  glow(box(2.0, 0.05, 0.05, P.neonPink, [0, 2.2, gz - 0.02]), 1.6);
  box(2.1, 0.03, 0.07, P.hullDark, [0, 2.17, gz - 0.02]);

  // Beacons
  for (const s of [1, -1]) {
    cyl(0.1, 0.12, 0.05, 10, P.hullDark, [s * 1.0, 2.2, -2.8]);
    glow(cyl(0.08, 0.1, 0.12, 10, s > 0 ? P.warnRed : P.neonYellow, [s * 1.0, 2.28, -2.8]), 1.8);
    b.part(new THREE.SphereGeometry(0.08, 8, 4, 0, 6.28, 0, 1.57), s > 0 ? P.warnRed : P.neonYellow, { bone, at: [s * 1.0, 2.33, -2.8] });
    box(0.2, 0.02, 0.04, P.hazardBlack, [s * 1.0, 2.29, -2.8]);
  }

  // Small rivets/lights on bed side rails
  for (let i = 0; i < 6; i++) for (const s of [1, -1])
    glow(box(0.02, 0.03, 0.08, i % 2 ? P.neonCyan : P.neonYellow, [s * 1.19, 1.68, -2.8 + i * 0.3 + R() * 0.02]), 1.2);
}
    return buildBed;
  })(),
  // turret
  (() => {
function buildTurret({ b, J, P, M }: Ctx) {
  const yaw = J.turretYaw;
  const pitch = J.cannonPitch;
  const R = rng(5);
  const GLOW = "#8ff9ff";
  const DARKRING = "#0e0f14";

  // helper: cylinder along Y at a point, on a bone
  const cyl = (rt: number, rb: number, h: number, sides: number, color: string, at: number[], bone: any, dir?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, sides), color, { bone, at, ...(dir ? { dir } : {}) });
  const box = (w: number, h: number, d: number, color: string, at: number[], bone: any) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at });
  // cylinder along Z (barrel axis) centred at z
  const zcyl = (rt: number, rb: number, len: number, color: string, y: number, z: number, x = 0, sides = 12) =>
    b.part(new THREE.CylinderGeometry(rt, rb, len, sides), color, { bone: pitch, at: [x, y, z], dir: [0, 0, 1] });

  // ---- base ring on yaw
  cyl(0.46, 0.5, 0.08, 20, P.hullDark, [0, 2.08, -1], yaw);
  cyl(0.42, 0.42, 0.06, 20, P.hullLight, [0, 2.14, -1], yaw);
  // hazard band: alternating segments around ring
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.1, 0.05, 0.05), i % 2 ? P.hazardBlack : P.trim, {
      bone: yaw,
      at: [Math.sin(a) * 0.46, 2.1, -1 + Math.cos(a) * 0.46],
      rotation: [0, (a * 180) / Math.PI, 0],
    });
  }
  // cyan ring light
  b.part(new THREE.TorusGeometry(0.4, 0.014, 6, 24), P.neonCyan, { bone: yaw, at: [0, 2.18, -1], rotation: [90, 0, 0] });

  // pivot housing: pedestal and side cheeks
  cyl(0.28, 0.34, 0.14, 8, P.armor, [0, 2.25, -0.95], yaw);
  box(0.62, 0.3, 0.5, P.armor, [0, 2.38, -0.9], yaw);
  box(0.66, 0.06, 0.54, P.hullLight, [0, 2.54 - 0.01, -0.9], yaw);
  for (const s of [1, -1]) {
    box(0.08, 0.36, 0.56, P.hull, [s * 0.35, 2.38, -0.9], yaw);
    cyl(0.07, 0.07, 0.06, 8, P.steel, [s * 0.4, 2.38, -0.9], yaw, [1, 0, 0]);
    for (let k = 0; k < 3; k++) box(0.1, 0.02, 0.1, P.trim, [s * 0.36, 2.28 + k * 0.08, -0.62], yaw);
  }

  // ---- barrel on pitch
  const by = 2.38;
  zcyl(0.15, 0.17, 0.7, P.armor, by, -0.75); // breech
  zcyl(0.11, 0.11, 2.2, P.steel, by, 0.5, 0, 12); // main barrel
  zcyl(0.135, 0.135, 0.12, P.hullDark, by, -0.35);
  zcyl(0.135, 0.135, 0.12, P.hullDark, by, 0.2);
  zcyl(0.135, 0.135, 0.12, P.hullDark, by, 0.9);
  // hazard band
  zcyl(0.125, 0.125, 0.22, P.trim, by, 0.55);
  for (let i = 0; i < 3; i++) zcyl(0.128, 0.128, 0.05, P.hazardBlack, by, 0.48 + i * 0.07);
  // flared muzzle
  zcyl(0.22, 0.12, 0.3, P.hull, by, 1.55, 0, 12);
  zcyl(0.24, 0.22, 0.08, P.hullDark, by, 1.74, 0, 12);
  // neon rings
  for (const z of [0.1, 1.2, 1.45]) {
    b.part(new THREE.TorusGeometry(z > 1 ? 0.15 : 0.145, 0.014, 6, 20), P.neonCyan, { bone: pitch, at: [0, by, z], rotation: [0, 0, 0] });
  }
  // glowing nozzle core
  zcyl(0.15, 0.15, 0.04, GLOW, by, 1.74);
  zcyl(0.08, 0.08, 0.06, P.white, by, 1.76);
  // cyan flow strip along top
  box(0.03, 0.02, 1.2, P.neonCyan, [0, by + 0.125, 0.55], pitch);
  // side stabilizer rails
  for (const s of [1, -1]) {
    box(0.04, 0.05, 1.0, P.hullLight, [s * 0.17, by - 0.02, 0.4], pitch);
    cyl(0.04, 0.04, 0.1, 8, P.steel, [s * 0.2, by, -0.45], pitch, [1, 0, 0]);
  }
  // pitch trunnion
  cyl(0.09, 0.09, 0.7, 10, P.steel, [0, by, -0.55], pitch, [1, 0, 0]);

  // ---- feed hoses to the tank (rear)
  for (const s of [1, -1]) {
    const path = [
      [s * 0.12, by - 0.05, -0.95],
      [s * 0.3, 2.2, -1.2],
      [s * 0.38, 2.12, -1.4],
    ];
    b.sweep(path, 0.04, { bone: yaw, color: P.hullDark });
    b.part(new THREE.TorusGeometry(0.045, 0.012, 5, 8), P.steel, { bone: yaw, at: [s * 0.38, 2.12, -1.4] });
    cyl(0.055, 0.055, 0.06, 8, P.steel, [s * 0.3, 2.2, -1.2], yaw, [1, 0.3, 0]);
  }

  // ---- camera pod and sensor on top
  box(0.2, 0.14, 0.22, P.hull, [0.2, 2.62 - 0.0, -0.9], yaw);
  b.part(new THREE.SphereGeometry(0.09, 8, 6), P.hullDark, { bone: yaw, at: [0.2, 2.45 + 0.17, -0.78] });
  b.part(new THREE.SphereGeometry(0.045, 8, 6), P.neonPink, { bone: yaw, at: [0.2, 2.62, -0.7] });
  cyl(0.012, 0.012, 0.16, 5, P.steel, [-0.22, 2.58, -1.1], yaw);
  b.part(new THREE.SphereGeometry(0.025, 6, 4), P.warnRed, { bone: yaw, at: [-0.22, 2.68, -1.1] });
  // warning emblem plate
  box(0.12, 0.1, 0.02, P.trim, [0, 2.4, -0.62], yaw);
  box(0.03, 0.06, 0.025, P.hazardBlack, [0, 2.4, -0.62], yaw);
  void R; void frame; void M;
}
    return buildTurret;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "riotInterceptor" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1,0], dir: [0,0,1], role: "spine" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.15,0.55,1.9], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.15,0.55,1.9], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelRL"] = b.joint("wheelRL", { parent: J["body"], at: [1.15,0.55,-1.8], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelRR"] = b.joint("wheelRR", { parent: J["body"], at: [-1.15,0.55,-1.8], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["turretYaw"] = b.joint("turretYaw", { parent: J["body"], at: [0,2.05,-1], dir: [0,1,0], role: "hinge", group: "turret" });
  J["cannonPitch"] = b.joint("cannonPitch", { parent: J["turretYaw"], at: [0,2.35,-0.9], dir: [0,0,1], role: "hinge", group: "turret" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
