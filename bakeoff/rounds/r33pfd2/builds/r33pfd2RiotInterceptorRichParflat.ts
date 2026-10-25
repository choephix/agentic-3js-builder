import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Riot Interceptor R-9 'Pacifier'",
  "description": "A corporate riot-control armored interceptor with a roof water cannon and glowing neon light bars, in Cyberpunk 2077 style."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#2b2f3a",
  hullLight: "#4a5062",
  hullDark: "#14161d",
  trimYellow: "#f2c40f",
  trimBlack: "#0c0c10",
  glass: "#0b1a24",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2bd6",
  neonRed: "#ff2b3a",
  neonBlue: "#2b6bff",
  tire: "#101012",
  rim: "#8a90a0",
  steel: "#6c7280",
  tank: "#c9d2dc",
  tankBlue: "#2a7fc0",
  logo: "#e8e8f0",
  headlight: "#fff6d0",
  rust: "#6a3a24",
};
const M = {
  chassisTop: [0, 1.2, 0] as [number, number, number],
  cabRoof: [0, 2, 0.6] as [number, number, number],
  turretRing: [0, 2.15, -1.2] as [number, number, number],
  frontAxle: [0, 0.55, 1.9] as [number, number, number],
  rearAxle: [0, 0.55, -1.7] as [number, number, number],
  tankFront: [0, 1.2, -0.7] as [number, number, number],
  bumperFront: [0, 0.7, 3] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassisFront
  (() => {
function buildChassisFront({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z], rotation: rot });
  const gbox = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, s = 1.2) =>
    glow(box(w, h, d, c, x, y, z), s);
  const cyl = (r: number, h: number, c: string, at: number[], rot: [number, number, number], seg = 8, r2?: number) =>
    b.part(new THREE.CylinderGeometry(r, r2 ?? r, h, seg), c, { bone, at: at as [number, number, number], rotation: rot });

  // main hull block behind hood (lower body)
  box(2.5, 0.55, 2.2, P.hullDark, 0, 0.62, 1.9);
  // sloped wedge hood
  b.extrude(
    [[0, 0], [2.2, 0], [2.2, 0.28], [0.1, 0.62], [0, 0.62]],
    { at: [-1.2, 0.9, 0.8], x: [0, 0, 1], y: [0, 1, 0], thickness: 0, color: P.hull, bone },
  );
  for (const s of [1, -1]) {
    b.extrude(
      [[0, 0], [2.2, 0], [2.2, 0.28], [0.1, 0.62], [0, 0.62]],
      { at: [s * 1.2, 0.9, 0.8], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.1, color: P.hull, bone, bevel: 0.02 },
    );
  }
  // hood top slab sloped
  box(2.3, 0.1, 2.25, P.hull, 0, 1.3, 1.9, [-8, 0, 0]);
  box(2.2, 0.06, 1.2, P.hullLight, 0, 1.36, 1.5, [-8, 0, 0]);
  // hood center ridge and vents
  box(0.12, 0.08, 1.8, P.hullDark, 0, 1.4, 1.9, [-8, 0, 0]);
  for (let i = 0; i < 5; i++) for (const s of [1, -1])
    box(0.5, 0.02, 0.05, P.trimBlack, s * 0.55, 1.36 - i * 0.012, 1.1 + i * 0.12, [-8, 0, 0]);
  // front fascia
  box(2.4, 0.7, 0.15, P.hull, 0, 0.95, 2.95, [12, 0, 0]);
  // grille
  box(1.2, 0.3, 0.06, P.trimBlack, 0, 0.8, 3.03);
  for (let i = 0; i < 6; i++) box(1.1, 0.02, 0.04, P.steel, 0, 0.69 + i * 0.05, 3.065);
  // headlight slits
  for (const s of [1, -1]) {
    box(0.8, 0.14, 0.05, P.trimBlack, s * 0.8, 1.08, 3.0, [12, 0, 0]);
    gbox(0.7, 0.07, 0.05, P.headlight, s * 0.8, 1.08, 3.03, 1.6);
    gbox(0.3, 0.03, 0.05, P.neonCyan, s * 0.95, 1.0, 3.03, 1.5);
  }
  // bumper
  box(2.6, 0.32, 0.35, P.hullDark, 0, 0.5, 2.9);
  box(2.2, 0.2, 0.3, P.hull, 0, 0.5, 3.0, [0, 0, 0]);
  // hazard chevrons on bumper
  for (let i = -5; i <= 5; i++)
    box(0.12, 0.2, 0.02, i % 2 ? P.trimYellow : P.trimBlack, i * 0.2, 0.5, 3.17, [0, 0, 20]);
  // plow push bar
  for (const s of [1, -1]) {
    box(0.12, 0.45, 0.12, P.steel, s * 0.9, 0.55, 3.1);
    box(0.12, 0.3, 0.5, P.hullDark, s * 1.0, 0.5, 2.9);
  }
  box(2.0, 0.14, 0.14, P.steel, 0, 0.78, 3.2);
  box(2.0, 0.05, 0.1, P.trimYellow, 0, 0.78, 3.28);
  box(2.0, 0.28, 0.1, P.hullDark, 0, 0.45, 3.25, [-25, 0, 0]);
  // underglow
  gbox(2.0, 0.04, 0.05, P.neonMagenta, 0, 0.31, 3.05, 1.5);
  gbox(0.04, 0.04, 1.8, P.neonMagenta, 1.1, 0.32, 2.0, 1.2);
  gbox(0.04, 0.04, 1.8, P.neonMagenta, -1.1, 0.32, 2.0, 1.2);
  // tow hooks
  for (const s of [1, -1]) {
    b.part(new THREE.TorusGeometry(0.07, 0.02, 5, 8), P.rust, { bone, at: [s * 0.5, 0.4, 3.12] });
    box(0.06, 0.06, 0.08, P.steel, s * 0.5, 0.47, 3.1);
  }
  // license plate
  box(0.5, 0.14, 0.02, P.logo, 0, 0.38, 3.07);
  box(0.4, 0.03, 0.01, P.hullDark, 0, 0.38, 3.085);
  box(0.12, 0.05, 0.01, P.neonRed, 0.14, 0.42, 3.085);
  // wheel arches, fenders, skirts
  for (const s of [1, -1]) {
    const ax = s * 1.15;
    b.part(new THREE.TorusGeometry(0.66, 0.07, 5, 14, Math.PI), P.hullDark, {
      bone, at: [s * 1.24, M.frontAxle[1], M.frontAxle[2]], rotation: [0, 90, 0],
    });
    glow(b.part(new THREE.TorusGeometry(0.7, 0.025, 4, 14, Math.PI), P.neonMagenta, {
      bone, at: [s * 1.3, M.frontAxle[1], M.frontAxle[2]], rotation: [0, 90, 0],
    }), 1.4);
    // fender panel above arch
    box(0.3, 0.12, 1.5, P.hullLight, s * 1.15, 1.28, 1.9);
    box(0.08, 0.5, 1.5, P.hull, s * 1.27, 1.1, 1.9);
    // arch side flare blocks
    box(0.14, 0.3, 0.14, P.hullDark, s * 1.28, 0.9, 1.15);
    box(0.14, 0.3, 0.14, P.hullDark, s * 1.28, 0.9, 2.65);
    // skirt
    box(0.1, 0.22, 0.7, P.hullDark, s * 1.28, 0.45, 1.2);
    gbox(0.03, 0.03, 0.65, P.neonCyan, s * 1.335, 0.5, 1.2, 1.4);
    gbox(0.03, 0.03, 1.1, P.neonCyan, s * 1.3, 1.02, 1.55, 1.2);
    // hazard stripes on fender
    for (let i = 0; i < 4; i++)
      box(0.02, 0.1, 0.12, i % 2 ? P.trimBlack : P.trimYellow, s * 1.315, 1.2, 2.45 + i * 0.12, [0, 0, 0]);
    // rivets
    for (let i = 0; i < 5; i++) b.part(new THREE.SphereGeometry(0.02, 5, 3), P.steel, { bone, at: [s * 1.32, 1.0, 1.0 + i * 0.3] });
  }
  // side marker lights
  for (const s of [1, -1]) gbox(0.04, 0.06, 0.1, P.neonRed, s * 1.31, 0.85, 3.0, 1.3);
  // cowl/windshield base meeting cab
  box(2.3, 0.1, 0.2, P.hullDark, 0, 1.33, 0.85);
  const rg = rng(4);
  for (let i = 0; i < 10; i++)
    box(0.1, 0.01, 0.1 + rg() * 0.1, P.rust, (rg() - 0.5) * 2, 1.4 - 0.005, 1.0 + rg() * 1.6, [-8, 0, 0]);
  // chassis rail underside
  box(0.3, 0.2, 2.0, P.hullDark, 0.5, 0.4, 1.9);
  box(0.3, 0.2, 2.0, P.hullDark, -0.5, 0.4, 1.9);
}
    return buildChassisFront;
  })(),
  // cab
  (() => {
function buildCab({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const r = rng(11);
  const box = (w: number, h: number, d: number, c: string, at: [number, number, number], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, ...o });
  const lit = (w: number, h: number, d: number, c: string, at: [number, number, number], s = 1.4, o: any = {}) =>
    glow(box(w, h, d, c, at, o), s);

  // main shell: lower body
  box(2.5, 0.7, 1.5, P.hull, [0, 1.55, 0.05]);
  // upper greenhouse, sloped roof via tilted slab
  box(2.3, 0.45, 1.3, P.hullLight, [0, 2.05, -0.05]);
  box(2.4, 0.08, 1.2, P.hullDark, [0, 2.3, -0.15]);
  // sloped windshield pillar frame / hood-cowl wedge
  box(2.4, 0.08, 0.55, P.hullDark, [0, 2.12, 0.55], { rotation: [-38, 0, 0] });
  // windshield glass
  box(2.0, 0.28, 0.04, P.glass, [0, 2.04, 0.66], { rotation: [-38, 0, 0] });
  glow(box(1.9, 0.02, 0.02, P.neonCyan, [0, 2.2, 0.57], { rotation: [-38, 0, 0] }), 1.2);
  // windshield bars
  for (const x of [-0.5, 0, 0.5]) box(0.03, 0.3, 0.05, P.steel, [x, 2.04, 0.67], { rotation: [-38, 0, 0] });
  // beltline hazard stripe
  for (const s of [1, -1]) {
    box(0.04, 0.1, 1.5, P.trimBlack, [s * 1.26, 1.78, 0.05]);
    for (let i = 0; i < 9; i++)
      box(0.05, 0.1, 0.08, P.trimYellow, [s * 1.26, 1.78, -0.62 + i * 0.16], { rotation: [0, 0, 0] });
  }
  // front/back hazard on cowl
  box(2.3, 0.08, 0.06, P.trimYellow, [0, 1.9, 0.78]);
  box(2.3, 0.4, 0.05, P.hullDark, [0, 1.6, 0.78]);
  // rear wall
  box(2.4, 0.9, 0.06, P.hullDark, [0, 1.75, -0.7]);
  for (const x of [-0.8, 0, 0.8]) box(0.4, 0.08, 0.04, P.steel, [x, 2.0, -0.74]);

  for (const s of [1, -1]) {
    // side windows with bars
    box(0.04, 0.3, 1.0, P.glass, [s * 1.17, 2.07, -0.05]);
    for (let i = 0; i < 6; i++) box(0.05, 0.3, 0.025, P.steel, [s * 1.19, 2.07, -0.5 + i * 0.18]);
    box(0.05, 0.03, 1.05, P.steel, [s * 1.19, 2.23, -0.05]);
    box(0.05, 0.03, 1.05, P.steel, [s * 1.19, 1.92, -0.05]);
    // door seams and handles
    box(0.03, 0.75, 0.025, P.trimBlack, [s * 1.26, 1.55, 0.35]);
    box(0.03, 0.75, 0.025, P.trimBlack, [s * 1.26, 1.55, -0.45]);
    box(0.03, 0.025, 0.8, P.trimBlack, [s * 1.26, 1.2, -0.05]);
    box(0.06, 0.05, 0.2, P.steel, [s * 1.27, 1.65, 0.2]);
    box(0.06, 0.05, 0.2, P.steel, [s * 1.27, 1.65, -0.3]);
    // shield emblem
    const sh = b.extrude(
      [[-0.13, 0.12], [0.13, 0.12], [0.13, -0.03], [0, -0.16, "sharp"], [-0.13, -0.03]],
      { at: [s * 1.27, 1.45, 0.05], x: [0, 0, s], y: [0, 1, 0], thickness: 0.02, color: P.logo, bone },
    );
    b.extrude(
      [[-0.08, 0.08], [0.08, 0.08], [0.08, -0.02], [0, -0.1, "sharp"], [-0.08, -0.02]],
      { at: [s * 1.285, 1.45, 0.05], x: [0, 0, s], y: [0, 1, 0], thickness: 0.015, color: P.neonMagenta, bone },
    );
    glow(box(0.02, 0.02, 0.02, P.neonMagenta, [s * 1.3, 1.45, 0.05]), 1.5);
    // mirrors
    box(0.05, 0.05, 0.3, P.hullDark, [s * 1.4, 1.95, 0.55], { rotation: [0, 0, s * 20] });
    box(0.1, 0.3, 0.18, P.hullDark, [s * 1.5, 1.95, 0.6]);
    box(0.02, 0.24, 0.13, P.glass, [s * 1.5 + s * 0.06, 1.95, 0.6]);
    glow(box(0.1, 0.02, 0.02, P.neonCyan, [s * 1.5, 2.12, 0.6]), 1.3);
    // neon sideline on cab
    glow(box(0.03, 0.03, 1.5, P.neonCyan, [s * 1.27, 1.3, 0.05]), 1.4);
    // roof rails
    box(0.06, 0.06, 1.1, P.steel, [s * 1.05, 2.37, -0.15]);
    // sensor pods
    box(0.18, 0.12, 0.2, P.hullDark, [s * 0.9, 2.38, 0.35]);
    glow(box(0.08, 0.06, 0.02, P.neonRed, [s * 0.9, 2.38, 0.46]), 1.6);
  }

  // roof light bar
  box(1.9, 0.08, 0.32, P.hullDark, [0, 2.38, 0.25]);
  for (const x of [-0.85, 0.85]) box(0.1, 0.12, 0.3, P.steel, [x, 2.36, 0.25]);
  const cols = [P.neonRed, P.neonRed, P.neonBlue, P.neonBlue, P.neonCyan, P.neonCyan, P.neonBlue, P.neonBlue, P.neonRed, P.neonRed];
  cols.forEach((c, i) => {
    lit(0.17, 0.1, 0.28, c, [-0.81 + i * 0.18, 2.47, 0.25], 1.8);
    lit(0.15, 0.03, 0.02, c, [-0.81 + i * 0.18, 2.47, 0.4], 1.8);
  });
  box(1.9, 0.03, 0.34, P.trimBlack, [0, 2.54, 0.25]);

  // antenna
  box(0.1, 0.1, 0.1, P.steel, [-0.9, 2.4, -0.5]);
  b.rod([-0.9, 2.42, -0.5], [-0.95, 2.3 + 0.0, -0.5], 0.01, P.steel, { bone });
  b.rod([-0.9, 2.42, -0.5], [-0.88, 2.3 + 0.5 - 0.0, -0.5], 0.012, P.steel, { bone });
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), P.neonRed, { bone, at: [-0.88, 2.8 - 0.0, -0.5] }), 1.8);
  // sensor dome
  b.part(new THREE.SphereGeometry(0.12, 8, 5, 0, 6.283, 0, 1.57), P.hullLight, { bone, at: [0.6, 2.32, -0.5] });
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonCyan, { bone, at: [0.6, 2.4, -0.42] }), 1.6);

  // headlight-ish cowl slit and wipers
  lit(0.6, 0.03, 0.02, P.neonMagenta, [0, 1.9, 0.8], 1.3);
  for (const s of [1, -1]) b.rod([s * 0.3, 1.97, 0.7], [s * 0.7, 2.1, 0.62], 0.01, P.trimBlack, { bone });
  // bolts
  for (let i = 0; i < 10; i++)
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 6), P.steel, {
      bone,
      at: [-1.05 + i * 0.233, 2.28 + r() * 0.0, -0.69],
      dir: [0, 0, 1],
    });
}
    return buildCab;
  })(),
  // rear
  (() => {
function buildRear({ b, J, P, M }: any) {
  const bone = J.body;
  const R = rng(9);
  const box = (w: number, h: number, d: number, c: string, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, ...o });
  const cyl = (rt: number, rb: number, h: number, c: string, at: number[], axis: "x" | "y" | "z" = "y", seg = 12) => {
    const dir = axis === "x" ? [1, 0, 0] : axis === "z" ? [0, 0, 1] : [0, 1, 0];
    return b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at, dir });
  };
  const lit = (w: number, h: number, d: number, c: string, at: number[], s = 1.5) => glow(box(w, h, d, c, at), s);

  // chassis deck and frame
  box(2.3, 0.3, 2.3, P.hullDark, [0, 0.55, -1.85]);
  box(2.5, 0.12, 2.3, P.hull, [0, 1.95, -1.85]);

  // tank: horizontal cylinder
  cyl(0.72, 0.72, 2.0, P.tank, [0, 1.3, -1.85], "z", 16);
  for (const z of [-2.5, -1.85, -1.2]) {
    cyl(0.735, 0.735, 0.2, P.tankBlue, [0, 1.3, z], "z", 16);
  }
  for (const z of [-2.85, -0.85]) cyl(0.7, 0.55, 0.12, P.hullLight, [0, 1.3, z], "z", 16);
  // logo plates on sides
  for (const s of [1, -1]) {
    box(0.04, 0.4, 0.6, P.logo, [s * 0.73, 1.35, -1.85]);
    box(0.05, 0.22, 0.36, P.tankBlue, [s * 0.75, 1.35, -1.85]);
    glow(box(0.06, 0.06, 0.3, P.neonMagenta, [s * 0.77, 1.35, -1.85]), 1.5);
    // lockers
    box(0.2, 0.55, 1.5, P.hull, [s * 1.2, 0.95, -1.95]);
    box(0.04, 0.4, 1.3, P.hullLight, [s * 1.31, 0.95, -1.95]);
    for (let i = 0; i < 6; i++) for (const dy of [0.15, -0.15])
      b.part(new THREE.SphereGeometry(0.018, 5, 4), P.steel, { bone, at: [s * 1.33, 0.95 + dy, -2.55 + i * 0.22] });
    // wheel arches with neon
    const arch = b.part(new THREE.TorusGeometry(0.66, 0.05, 6, 14, Math.PI), P.hullDark, { bone, at: [s * 1.2, 0.55, -1.7], rotation: [0, 90, 0] });
    glow(b.part(new THREE.TorusGeometry(0.7, 0.025, 4, 14, Math.PI), P.neonMagenta, { bone, at: [s * 1.32, 0.55, -1.7], rotation: [0, 90, 0] }), 1.5);
    // sideline neon
    lit(0.04, 0.04, 2.2, P.neonCyan, [s * 1.31, 0.42, -1.85]);
    // exhaust stacks
    cyl(0.07, 0.07, 0.9, P.steel, [s * 1.0, 2.5 - 0.3, -0.9]);
    cyl(0.09, 0.09, 0.08, P.hullDark, [s * 1.0, 2.1, -0.9]);
    cyl(0.08, 0.08, 0.05, P.rust, [s * 1.0, 2.1 + 0.46, -0.9]);
    // tail lights
    lit(0.4, 0.1, 0.05, P.neonRed, [s * 0.8, 1.0, -3.0], 2);
    lit(0.2, 0.06, 0.05, P.neonCyan, [s * 0.8, 0.85, -3.01]);
  }
  // exhaust stack top bumps to stay in box
  // rear bumper with hazard stripes
  box(2.6, 0.3, 0.2, P.trimBlack, [0, 0.45, -2.9]);
  for (let i = 0; i < 10; i++)
    box(0.14, 0.3, 0.21, i % 2 ? P.trimBlack : P.trimYellow, [-1.17 + i * 0.26, 0.45, -2.9], { rotation: [0, 0, 20] });
  lit(1.6, 0.05, 0.04, P.neonRed, [0, 0.68, -3.0]);
  box(0.6, 0.18, 0.03, P.logo, [0, 0.78, -2.99]);

  // pump housing at rear center-low
  box(0.9, 0.5, 0.5, P.hull, [0, 0.9, -2.7]);
  box(0.8, 0.06, 0.45, P.hullLight, [0, 1.17, -2.7]);
  for (let i = 0; i < 4; i++) box(0.7, 0.03, 0.02, P.hullDark, [0, 0.8 + i * 0.08, -2.96]);
  // gauges
  for (const x of [-0.25, 0.25]) {
    cyl(0.07, 0.07, 0.04, P.steel, [x, 1.05, -2.97], "z", 14);
    glow(cyl(0.055, 0.055, 0.045, P.neonCyan, [x, 1.05, -2.985], "z", 14), 1.2);
    box(0.01, 0.05, 0.01, P.trimBlack, [x, 1.06, -3.0]);
  }
  // pipes and valves
  b.sweep([[ -0.3, 1.15, -2.7], [-0.3, 1.5, -2.8], [-0.1, 1.9, -2.7]], 0.04, { bone, color: P.steel });
  b.sweep([[0.3, 1.15, -2.7], [0.3, 1.5, -2.8], [0.1, 1.9, -2.7]], 0.04, { bone, color: P.steel });
  for (const x of [-0.3, 0.3]) {
    cyl(0.06, 0.06, 0.1, P.neonRed, [x, 1.4, -2.8], "x", 8);
    box(0.2, 0.03, 0.03, P.trimYellow, [x, 1.4, -2.8]);
  }
  // ladder on left rear
  for (const x of [0.95, 1.15]) box(0.04, 1.5, 0.04, P.steel, [x, 1.2, -3.0]);
  for (let i = 0; i < 6; i++) box(0.24, 0.03, 0.04, P.steel, [1.05, 0.6 + i * 0.25, -3.0]);
  // hose coils on roof deck
  const coil: number[][] = [];
  for (let i = 0; i <= 40; i++) {
    const a = i * 0.5;
    coil.push([-0.75 + Math.cos(a) * 0.2, 2.06 + Math.sin(a) * 0.05 + i * 0.002, -2.4 + Math.sin(a) * 0.2]);
  }
  b.sweep(coil, 0.025, { bone, color: P.trimBlack });
  cyl(0.28, 0.28, 0.06, P.hullLight, [-0.75, 2.04, -2.4], "y", 12);
  // turret ring seat
  cyl(0.42, 0.45, 0.08, P.steel, [0, 2.05, -1.2], "y", 16);
  glow(b.part(new THREE.TorusGeometry(0.43, 0.02, 4, 20), P.neonCyan, { bone, at: [0, 2.1, -1.2], rotation: [90, 0, 0] }), 1.5);
  // deck edge hazard
  for (let i = 0; i < 8; i++) box(0.15, 0.03, 0.1, i % 2 ? P.trimBlack : P.trimYellow, [-1.0 + i * 0.3, 2.02, -0.8]);
  // rust stencil marks
  for (let i = 0; i < 5; i++)
    for (const s of [1, -1])
      box(0.02, 0.05 + R() * 0.1, 0.06 + R() * 0.1, P.rust, [s * 0.74 + s * 0.005, 1.0 + R() * 0.15, -2.4 + i * 0.25 - 0.1], {});
  // axle hint
  cyl(0.06, 0.06, 2.3, P.steel, [0, 0.55, -1.7], "x", 8);
}
    return buildRear;
  })(),
  // turret
  (() => {
function buildTurret({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const [cx, cy, cz] = M.turretRing;

  const box = (w: number, h: number, d: number, col: string, at: number[], bone: any, opts: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone, at, ...opts });
  const cyl = (rt: number, rb: number, h: number, seg: number, col: string, at: number[], bone: any, dir?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), col, { bone, at, ...(dir ? { dir } : {}) });

  // ---------- Base (rides body) ----------
  cyl(0.5, 0.56, 0.1, 16, P.hullDark, [cx, cy - 0.02, cz], J.body);
  cyl(0.46, 0.46, 0.05, 16, P.steel, [cx, cy + 0.05, cz], J.body);
  glow(b.part(new THREE.TorusGeometry(0.5, 0.012, 4, 24), P.neonCyan, { bone: J.body, at: [cx, cy + 0.01, cz], dir: [0, 1, 0], axis: "z" }), 1.4);
  glow(b.part(new THREE.TorusGeometry(0.44, 0.01, 4, 24), P.neonCyan, { bone: J.body, at: [cx, cy + 0.085, cz], dir: [0, 1, 0], axis: "z" }), 1.2);
  // bolts on base
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    cyl(0.018, 0.018, 0.03, 6, P.steel, [cx + Math.sin(a) * 0.53, cy + 0.04, cz + Math.cos(a) * 0.53], J.body);
  }
  // hazard stripes on base edge
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    box(0.07, 0.04, 0.03, i % 2 ? P.trimBlack : P.trimYellow, [cx + Math.sin(a) * 0.565, cy - 0.04, cz + Math.cos(a) * 0.565], J.body, { rotation: [0, (a * 180) / Math.PI, 0] });
  }

  // ---------- Swivel (rides turretYaw) ----------
  const Y = J.turretYaw;
  const sy = cy + 0.1;
  cyl(0.36, 0.4, 0.14, 12, P.hull, [cx, sy + 0.07, cz], Y);
  box(0.62, 0.3, 0.5, P.hull, [cx, sy + 0.28, cz], Y);
  box(0.5, 0.06, 0.4, P.hullLight, [cx, sy + 0.46, cz], Y);
  for (const s of [1, -1]) {
    // side armor plates
    box(0.06, 0.34, 0.56, P.hullLight, [cx + s * 0.35, sy + 0.3, cz], Y);
    box(0.02, 0.1, 0.5, P.trimYellow, [cx + s * 0.385, sy + 0.2, cz], Y);
    for (let k = 0; k < 4; k++)
      box(0.025, 0.1, 0.06, P.trimBlack, [cx + s * 0.39, sy + 0.2, cz - 0.18 + k * 0.12], Y, { rotation: [30, 0, 0] });
    for (let k = 0; k < 3; k++) cyl(0.015, 0.015, 0.03, 6, P.steel, [cx + s * 0.385, sy + 0.4, cz - 0.18 + k * 0.18], Y, [1, 0, 0]);
    // handles
    b.part(new THREE.TorusGeometry(0.07, 0.014, 5, 10, Math.PI), P.steel, { bone: Y, at: [cx + s * 0.4, sy + 0.5, cz - 0.18], dir: [s, 0, 0], axis: "z" });
    // gun cradle arms
    box(0.06, 0.3, 0.2, P.hullDark, [cx + s * 0.22, sy + 0.55, cz + 0.2], Y);
    cyl(0.04, 0.04, 0.05, 8, P.steel, [cx + s * 0.27, sy + 0.62, cz + 0.2], Y, [1, 0, 0]);
  }
  // sensor eye
  box(0.2, 0.12, 0.08, P.hullDark, [cx, sy + 0.32, cz + 0.28], Y);
  glow(b.part(new THREE.SphereGeometry(0.04, 8, 6), P.neonRed, { bone: Y, at: [cx, sy + 0.32, cz + 0.33] }), 2);
  glow(box(0.14, 0.015, 0.01, P.neonRed, [cx, sy + 0.4, cz + 0.325], Y), 1.5);
  // gauge
  cyl(0.06, 0.06, 0.03, 12, P.steel, [cx - 0.12, sy + 0.5, cz - 0.12], Y);
  glow(cyl(0.05, 0.05, 0.01, 12, P.tankBlue, [cx - 0.12, sy + 0.52, cz - 0.12], Y), 1);
  box(0.006, 0.012, 0.045, P.neonRed, [cx - 0.12, sy + 0.527, cz - 0.12], Y, { rotation: [0, 30, 0] });
  // rear antenna pod / hose manifold
  cyl(0.1, 0.1, 0.22, 10, P.steel, [cx, sy + 0.3, cz - 0.38], Y, [1, 0, 0]);
  cyl(0.11, 0.11, 0.04, 10, P.trimYellow, [cx - 0.1, sy + 0.3, cz - 0.38], Y, [1, 0, 0]);
  cyl(0.11, 0.11, 0.04, 10, P.trimYellow, [cx + 0.1, sy + 0.3, cz - 0.38], Y, [1, 0, 0]);

  // ---------- Hoses curling back to the tank ----------
  for (const s of [1, -1]) {
    const pts = [
      [cx + s * 0.1, sy + 0.3, cz - 0.45],
      [cx + s * 0.2, sy + 0.2, cz - 0.7],
      [cx + s * 0.32, sy + 0.05, cz - 0.95],
      [cx + s * 0.3, sy - 0.05, cz - 1.25],
      [cx + s * 0.2, sy - 0.08, cz - 1.5],
      [cx + s * 0.15, sy - 0.05, cz - 1.75],
    ];
    b.sweep(pts, 0.035, { color: P.hullDark, bone: J.body, sides: 6 });
    for (const t of [0.35, 0.7]) {
      const i = Math.floor(t * 5);
      b.part(new THREE.TorusGeometry(0.04, 0.01, 4, 8), P.trimYellow, { bone: J.body, at: pts[i + 1], dir: [0, 0, 1], axis: "z" });
    }
    cyl(0.05, 0.05, 0.06, 8, P.steel, pts[5], J.body, [0, 0, 1]);
  }

  // ---------- Barrel (rides cannonPitch) ----------
  const C = J.cannonPitch;
  const by = cy + 0.62;
  cyl(0.11, 0.11, 0.3, 10, P.hullDark, [cx, by, cz + 0.2], C, [1, 0, 0]);
  b.rod([cx, by, cz - 0.1], [cx, by, cz + 0.9], 0.1, P.steel, { bone: C, sides: 10 });
  b.rod([cx, by, cz + 0.9], [cx, by, cz + 1.9], 0.075, P.hull, { bone: C, sides: 10 });
  b.rod([cx, by, cz + 1.9], [cx, by, cz + 2.15], [0.085, 0.1], P.tankBlue, { bone: C, sides: 10 });
  for (const z of [0.5, 1.2, 1.7, 2.12]) {
    b.part(new THREE.TorusGeometry(z > 2 ? 0.1 : 0.105, 0.016, 5, 14), z > 2 ? P.steel : P.trimYellow, { bone: C, at: [cx, by, cz + z], dir: [0, 0, 1], axis: "z" });
  }
  glow(b.part(new THREE.TorusGeometry(0.06, 0.012, 5, 14), P.neonCyan, { bone: C, at: [cx, by, cz + 2.16], dir: [0, 0, 1], axis: "z" }), 1.6);
  cyl(0.055, 0.055, 0.02, 10, P.hullDark, [cx, by, cz + 2.155], C, [0, 0, 1]);
  // cyan strip and hazard on barrel
  glow(box(0.02, 0.012, 0.8, P.neonCyan, [cx, by + 0.105, cz + 0.5], C), 1.3);
  for (let k = 0; k < 5; k++)
    box(0.04, 0.014, 0.06, k % 2 ? P.trimBlack : P.trimYellow, [cx, by + 0.082, cz + 1.0 + k * 0.1], C);
  // sight and top rail
  box(0.05, 0.04, 0.3, P.hullLight, [cx, by + 0.13, cz + 1.3], C);
  // pressure collar
  cyl(0.13, 0.13, 0.12, 10, P.hullLight, [cx, by, cz + 0.8], C, [0, 0, 1]);
  for (let i = 0; i < 6; i++) {
    const a = R() * 6.28;
    cyl(0.012, 0.012, 0.02, 5, P.steel, [cx + Math.sin(a) * 0.13, by + Math.cos(a) * 0.13, cz + 0.8], C);
  }
}
    return buildTurret;
  })(),
  // wheels
  (() => {
function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.55;
  const W = 0.42; // tire width
  const BRAKE = "#9aa0ae";
  const CALIPER = "#c02030";

  const wheels: [string, number, number][] = [
    ["wheelFL", 1, M.frontAxle[2]],
    ["wheelFR", -1, M.frontAxle[2]],
    ["wheelRL", 1, M.rearAxle[2]],
    ["wheelRR", -1, M.rearAxle[2]],
  ];

  // X-axis oriented cylinder helper (axis along wheel axle)
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, bone: any, at: number[], flat = true) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, dir: [1, 0, 0], flat });

  for (const [name, s, z] of wheels) {
    const j = J[name];
    const y = M.frontAxle[1];
    const cx = s * 1.15;
    const outer = s * (1.15 + W / 2);
    const bone = j;

    // octagonal tire
    cyl(R, R, W, 8, P.tire, bone, [cx, y, z]);
    // sidewall shoulder rings (slightly smaller darker band)
    cyl(R * 0.8, R * 0.8, W + 0.02, 8, "#1b1b20", bone, [cx, y, z]);

    // tread blocks around circumference
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const ry = Math.sin(a) * (R + 0.015);
      const rz = Math.cos(a) * (R + 0.015);
      b.part(new THREE.BoxGeometry(W * 0.9, 0.07, 0.17), "#1a1a1e", {
        bone,
        at: [cx, y + ry, z + rz],
        rotation: [(-a * 180) / Math.PI + 0, 0, 0],
      });
    }

    // rim disc on outer face
    const faceX = s * (1.15 + W / 2 + 0.005);
    cyl(R * 0.68, R * 0.68, 0.04, 16, P.rim, bone, [faceX, y, z]);
    // dark recessed dish
    cyl(R * 0.5, R * 0.5, 0.05, 12, "#555b6a", bone, [s * (1.15 + W / 2 + 0.015), y, z]);
    // neon magenta ring edge
    const ring = b.part(new THREE.TorusGeometry(R * 0.69, 0.018, 5, 20), P.neonMagenta, {
      bone,
      at: [s * (1.15 + W / 2 + 0.03), y, z],
      dir: [1, 0, 0],
      axis: "z",
    });
    glow(ring, 1.4);
    // hub
    cyl(0.13, 0.13, 0.1, 8, P.steel, bone, [s * (1.15 + W / 2 + 0.04), y, z]);
    cyl(0.06, 0.06, 0.13, 6, P.hullDark, bone, [s * (1.15 + W / 2 + 0.05), y, z]);

    // bolt ring
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.part(new THREE.CylinderGeometry(0.022, 0.022, 0.04, 6), P.steel, {
        bone,
        at: [s * (1.15 + W / 2 + 0.06), y + Math.sin(a) * 0.2, z + Math.cos(a) * 0.2],
        dir: [1, 0, 0],
      });
    }
    // spokes (box ribs)
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.BoxGeometry(0.03, 0.06, R * 1.15), "#6b7180", {
        bone,
        at: [s * (1.15 + W / 2 + 0.03), y, z],
        rotation: [(i * 45), 0, 0],
      });
    }

    // brake disc behind rim (inner side)
    const innerX = s * (1.15 - W / 2 + 0.02);
    cyl(R * 0.52, R * 0.52, 0.025, 14, BRAKE, bone, [innerX, y, z]);
    cyl(R * 0.2, R * 0.2, 0.04, 8, P.hullDark, bone, [innerX, y, z]);
    // caliper (fixed to body so it doesn't spin)
    b.part(new THREE.BoxGeometry(0.1, 0.16, 0.2), CALIPER, {
      bone: J.body,
      at: [s * (1.15 - W / 2 + 0.02), y + 0.05, z + R * 0.45],
    });
    b.part(new THREE.BoxGeometry(0.04, 0.05, 0.22), P.trimBlack, {
      bone: J.body,
      at: [s * (1.15 - W / 2 + 0.02), y + 0.15, z + R * 0.45],
    });

    // stub axle to chassis
    cyl(0.07, 0.07, 0.4, 8, P.steel, J.body, [s * 0.95, y, z]);

    // suspension arms (upper and lower wishbones)
    const ax = s * 0.7;
    const arm = (yy: number, dz: number) => {
      b.rod([ax, yy, z + dz], [s * 1.0, y + (yy - y) * 0.2, z], 0.035, P.hullDark, { bone: J.body });
    };
    arm(y + 0.28, 0.35);
    arm(y + 0.28, -0.35);
    arm(y - 0.22, 0.4);
    arm(y - 0.22, -0.4);
    // shock absorber
    b.rod([s * 0.9, y + 0.0, z + 0.05], [s * 0.8, y + 0.5, z + 0.05], 0.045, P.trimYellow, { bone: J.body });
    b.rod([s * 0.9, y + 0.0, z + 0.05], [s * 0.85, y + 0.2, z + 0.05], 0.06, P.steel, { bone: J.body });
  }

  // full axles across body
  for (const z of [M.frontAxle[2], M.rearAxle[2]]) {
    b.rod([-0.95, 0.55, z], [0.95, 0.55, z], 0.07, P.steel, { bone: J.body });
    // differential housing
    b.part(new THREE.SphereGeometry(0.2, 8, 6), P.hullDark, { bone: J.body, at: [0, 0.55, z], flat: true });
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.12, 8), P.steel, {
      bone: J.body,
      at: [0, 0.55, z + (z > 0 ? 0.18 : -0.18)],
      dir: [0, 0, 1],
      axis: "y",
    });
  }
}
    return buildWheels;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "riotInterceptor" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1,0], dir: [0,0,1], role: "spine" });
  J["turretYaw"] = b.joint("turretYaw", { parent: J["body"], at: [0,2.15,-1.2], dir: [0,1,0], role: "hinge", group: "turret" });
  J["cannonPitch"] = b.joint("cannonPitch", { parent: J["turretYaw"], at: [0,2.6,-1.2], dir: [0,0,1], role: "hinge", group: "turret" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.15,0.55,1.9], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.15,0.55,1.9], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelRL"] = b.joint("wheelRL", { parent: J["body"], at: [1.15,0.55,-1.7], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelRR"] = b.joint("wheelRR", { parent: J["body"], at: [-1.15,0.55,-1.7], dir: [-1,0,0], role: "hinge", group: "wheels" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
