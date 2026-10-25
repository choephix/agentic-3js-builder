import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Warhound 2077 Militarized Hauler",
  "description": "A low-poly cyberpunk armoured six-wheeled military truck with an angular cab, neon trim, roof turret and a modular cargo bed, built from many small detail parts."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#3a4150",
  hullDark: "#20242e",
  hullLight: "#5a6478",
  armor: "#2c3340",
  trim: "#e7b814",
  black: "#0b0c10",
  tyre: "#17181c",
  rim: "#7b8396",
  glass: "#1a3a52",
  glassGlint: "#6fd7ff",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2fb8",
  tailRed: "#ff3a22",
  headWhite: "#fff6d0",
  warnOrange: "#ff8a1c",
  steel: "#8c93a3",
  rust: "#7a4a2c",
  olive: "#4a5238",
  screenGreen: "#5dff8a",
};
const M = {
  frontAxle: [0, 0.6, 2.7] as [number, number, number],
  midAxle: [0, 0.6, -1.6] as [number, number, number],
  rearAxle: [0, 0.6, -3] as [number, number, number],
  chassisTop: [0, 1.25, 0] as [number, number, number],
  cabFloor: [0, 1.3, 1.3] as [number, number, number],
  cabRear: [0, 1.3, 0.2] as [number, number, number],
  turretRing: [0, 3, 0.5] as [number, number, number],
  cargoFloor: [0, 1.4, -1.9] as [number, number, number],
  cargoFront: [0, 1.4, 0] as [number, number, number],
  hoodFront: [0, 1.5, 4] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassis
  (() => {
function buildChassis({ b, J, P, M }: Ctx) {
  const bone = J.body;
  const R = rng(77);

  const box = (w: number, h: number, d: number, color: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at: at as any, ...(rot ? { rotation: rot as any } : {}) });
  const cyl = (r: number, len: number, sides: number, color: string, at: number[], dir: number[]) =>
    b.part(new THREE.CylinderGeometry(r, r, len, sides), color, { bone, at: at as any, dir: dir as any });
  const lit = (p: any, s = 1.2) => glow(p, s);

  // ---- main girders and flanges
  for (const s of [1, -1]) {
    box(0.22, 0.34, 8.2, P.hullDark, [s * 0.55, 0.95, 0.0]);
    box(0.34, 0.05, 8.2, P.armor, [s * 0.55, 1.14, 0.0]);
    box(0.34, 0.05, 8.2, P.armor, [s * 0.55, 0.76, 0.0]);
    // rivets along the flange
    for (let i = 0; i < 16; i++) {
      b.part(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 6), P.steel, {
        bone, at: [s * 0.55, 1.17, -3.9 + i * 0.52], dir: [0, 1, 0],
      });
    }
    // lightening holes (dark) on web outer face
    for (let i = 0; i < 9; i++) {
      b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 6), P.black, {
        bone, at: [s * 0.665, 0.95, -3.6 + i * 0.9], dir: [1, 0, 0],
      });
    }
  }

  // ---- cross members
  for (let i = 0; i < 9; i++) {
    const z = -3.8 + i * 0.95;
    box(1.1, 0.14, 0.14, P.armor, [0, 0.9, z]);
    box(1.1, 0.04, 0.2, P.hullDark, [0, 0.83, z]);
  }

  // ---- armoured belly plate
  box(1.3, 0.06, 5.6, P.armor, [0, 0.5, 0.1]);
  box(1.0, 0.03, 5.0, P.hullDark, [0, 0.46, 0.1]);
  for (let i = 0; i < 12; i++) for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 6), P.steel, {
      bone, at: [s * 0.6, 0.47, -2.5 + i * 0.45], dir: [0, 1, 0],
    });
  }

  // ---- tanks: fuel left, batteries right
  const tank = cyl(0.22, 1.5, 8, P.olive, [0.8, 0.72, 0.5], [0, 0, 1]);
  cyl(0.225, 0.06, 8, P.trim, [0.8, 0.72, 0.1], [0, 0, 1]);
  cyl(0.225, 0.06, 8, P.trim, [0.8, 0.72, 0.9], [0, 0, 1]);
  box(0.04, 0.3, 1.5, P.hullDark, [0.8, 0.5, 0.5]);
  for (const z of [0.0, 1.0]) {
    cyl(0.235, 0.08, 8, P.steel, [0.8, 0.72, z], [0, 0, 1]);
    box(0.06, 0.1, 0.12, P.steel, [0.8, 0.52, z]);
  }
  cyl(0.05, 0.08, 6, P.warnOrange, [0.8, 0.95, 0.5], [0, 1, 0]);
  for (let i = 0; i < 3; i++) {
    box(0.4, 0.34, 0.42, P.hullDark, [-0.8, 0.72, -0.1 + i * 0.5]);
    box(0.36, 0.04, 0.38, P.armor, [-0.8, 0.92, -0.1 + i * 0.5]);
    for (const x of [-0.7, -0.9]) cyl(0.03, 0.05, 6, P.steel, [x, 0.96, -0.1 + i * 0.5], [0, 1, 0]);
    lit(box(0.3, 0.03, 0.04, P.screenGreen, [-0.8, 0.7, 0.115 + i * 0.5]), 1);
  }
  box(0.44, 0.04, 1.5, P.trim, [-0.8, 0.55, 0.4]);

  // ---- drive shafts and differentials
  cyl(0.06, 2.6, 8, P.steel, [0, 0.62, 1.5], [0, 0, 1]);
  cyl(0.06, 1.3, 8, P.steel, [0, 0.62, -2.3], [0, 0, 1]);
  cyl(0.06, 1.6, 8, P.steel, [0, 0.62, -0.6], [0, 0, 1]);
  for (const z of [0.2, 1.9]) cyl(0.09, 0.1, 6, P.hullLight, [0, 0.62, z], [0, 0, 1]);
  for (const z of [M.frontAxle[2], M.midAxle[2], M.rearAxle[2]]) {
    b.part(new THREE.SphereGeometry(0.2, 8, 6), P.hullLight, { bone, at: [0, 0.6, z] });
    cyl(0.07, 1.6, 8, P.steel, [0, 0.6, z], [1, 0, 0]);
    box(0.28, 0.1, 0.1, P.armor, [0, 0.8, z]);
    cyl(0.04, 0.08, 6, P.trim, [0, 0.4, z], [0, 1, 0]);
  }

  // ---- exhaust stacks
  for (const s of [1, -1]) {
    cyl(0.09, 0.8, 8, P.steel, [s * 1.28, 0.95, -0.3], [0, 1, 0]);
    cyl(0.1, 0.06, 8, P.trim, [s * 1.28, 0.65, -0.3], [0, 1, 0]);
    cyl(0.1, 0.06, 8, P.trim, [s * 1.28, 1.05, -0.3], [0, 1, 0]);
    lit(cyl(0.065, 0.03, 8, P.warnOrange, [s * 1.28, 1.35, -0.3], [0, 1, 0]), 1.8);
  }

  // ---- side skirts with neon
  for (const s of [1, -1]) {
    const x = s * 1.34;
    box(0.06, 0.4, 3.0, P.hull, [x, 0.78, 0.55]);
    box(0.04, 0.12, 3.0, P.hullLight, [x + s * 0.01, 1.0, 0.55]);
    lit(box(0.025, 0.03, 2.9, s > 0 ? P.neonMagenta : P.neonCyan, [x + s * 0.04, 0.9, 0.55]), 1.6);
    lit(box(0.025, 0.03, 2.9, s > 0 ? P.neonCyan : P.neonMagenta, [x + s * 0.04, 0.62, 0.55]), 1.6);
    for (let i = 0; i < 5; i++) {
      box(0.02, 0.3, 0.02, P.black, [x + s * 0.035, 0.77, -0.7 + i * 0.6]);
      for (const y of [0.72, 0.82]) {
        b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 6), P.steel, {
          bone, at: [x + s * 0.035, y, -0.9 + i * 0.6], dir: [s, 0, 0],
        });
      }
    }
    // hazard end caps
    for (let k = 0; k < 4; k++) box(0.07, 0.1, 0.12, k % 2 ? P.black : P.trim, [x, 0.6, 2.03 - k * 0.0 - 0.0 + (k - 1.5) * 0.0 - 0.0]).position.z += 0; 
    for (let k = 0; k < 6; k++) box(0.07, 0.38, 0.1, k % 2 ? P.black : P.trim, [x, 0.78, -0.96 + k * 0.0 + 0.0]).visible = k === 0;
    // short rear skirt behind rear wheels
    box(0.06, 0.3, 0.7, P.hull, [x, 0.8, -4.0]);
  }

  // ---- front bumper wedge
  box(2.7, 0.4, 0.3, P.hullDark, [0, 0.7, 4.1]);
  box(2.5, 0.3, 0.5, P.armor, [0, 0.62, 3.95], [-25, 0, 0]);
  box(2.2, 0.08, 0.6, P.hull, [0, 0.9, 3.95], [-18, 0, 0]);
  lit(box(2.2, 0.05, 0.1, P.neonCyan, [0, 0.4, 4.15]), 2);
  for (let i = 0; i < 12; i++) {
    box(0.2, 0.06, 0.12, i % 2 ? P.black : P.trim, [-1.1 + i * 0.2 + 0.1 - 0.1, 0.99, 4.2], [0, 0, 0]).position.x = -1.1 + i * 0.2;
  }
  for (const s of [1, -1]) {
    box(0.3, 0.3, 0.1, P.trim, [s * 1.3, 0.7, 4.27]);
    box(0.18, 0.2, 0.05, P.black, [s * 1.3, 0.7, 4.3]);
    // tow hooks
    box(0.1, 0.12, 0.3, P.steel, [s * 0.6, 0.6, 4.25]);
    b.part(new THREE.TorusGeometry(0.08, 0.025, 4, 8), P.steel, { bone, at: [s * 0.6, 0.55, 4.4], rotation: [90, 0, 0] as any });
    for (const x of [-0.12, 0.12]) cyl(0.02, 0.03, 6, P.steel, [s * 0.6 + x, 0.78, 4.22], [0, 0, 1]);
  }
  box(1.0, 0.12, 0.1, P.black, [0, 0.72, 4.27]);
  for (let i = 0; i < 5; i++) box(0.08, 0.08, 0.02, P.neonMagenta, [-0.4 + i * 0.2, 0.72, 4.33]).visible = true;

  // ---- rear bumper
  box(2.7, 0.4, 0.2, P.hullDark, [0, 0.7, -4.3]);
  box(2.6, 0.08, 0.24, P.armor, [0, 0.93, -4.3]);
  for (let i = 0; i < 12; i++) {
    const p = box(0.2, 0.3, 0.02, i % 2 ? P.black : P.trim, [0, 0.7, -4.41]);
    p.position.x = -1.1 + i * 0.2 + 0;
  }
  for (const s of [1, -1]) {
    lit(box(0.3, 0.14, 0.05, P.tailRed, [s * 1.05, 1.1, -4.4]), 1.5);
    lit(box(0.14, 0.1, 0.05, P.warnOrange, [s * 0.8, 1.1, -4.4]), 1.5);
    box(0.36, 0.2, 0.04, P.black, [s * 1.05, 1.1, -4.38]);
    for (let k = 0; k < 3; k++) lit(box(0.06, 0.06, 0.04, P.tailRed, [s * (1.1 + k * 0.08 - 0.08), 0.57, -4.43]), 1.2);
  }
  // tow hitch
  box(0.3, 0.2, 0.3, P.steel, [0, 0.6, -4.5]);
  cyl(0.06, 0.2, 8, P.black, [0, 0.72, -4.55], [0, 1, 0]);
  cyl(0.09, 0.04, 8, P.steel, [0, 0.83, -4.55], [0, 1, 0]);
  box(0.4, 0.04, 0.1, P.steel, [0, 0.5, -4.4]);

  // ---- engine bay hint & mount plates under cab/hood
  box(1.8, 0.1, 2.2, P.armor, [0, 1.3, 2.9]);
  box(1.8, 0.1, 1.0, P.armor, [0, 1.3, 0.7]);
  for (let i = 0; i < 6; i++) for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 6), P.steel, {
      bone, at: [s * 0.85, 1.36, 0.3 + i * 0.7], dir: [0, 1, 0],
    });
  }
  // suspension mounts and wiring
  for (const z of [M.frontAxle[2], M.midAxle[2], M.rearAxle[2]]) for (const s of [1, -1]) {
    box(0.2, 0.18, 0.5, P.hullLight, [s * 0.8, 1.05, z]);
    cyl(0.03, 0.4, 6, P.steel, [s * 0.75, 0.82, z + 0.2], [1, 0, 0]);
  }
  for (let i = 0; i < 6; i++) {
    const c = R() > 0.5 ? P.neonCyan : P.neonMagenta;
    lit(box(0.03, 0.03, 0.2, c, [0.0 + (i - 2.5) * 0.12, 0.38, -2.0 + R() * 4]), 1.2);
  }
}
    return buildChassis;
  })(),
  // runningGear
  (() => {
function buildRunningGear({ b, J, P, M }: any) {
  const R = 0.6, W = 0.5;
  const RIVET = P.steel;
  const wheels: [string, number, number][] = [
    ["wheelFL", 1, M.frontAxle[2]], ["wheelFR", -1, M.frontAxle[2]],
    ["wheelML", 1, M.midAxle[2]], ["wheelMR", -1, M.midAxle[2]],
    ["wheelRL", 1, M.rearAxle[2]], ["wheelRR", -1, M.rearAxle[2]],
  ];
  const box = (w: number, h: number, d: number, c: string, at: number[], bone: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, at: number[], bone: any, dir: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at, dir, flat: true });

  for (const [name, s, z] of wheels) {
    const j = J[name];
    const X = s * 1.2;
    const ox = s * 1; // outward
    const ax = [s, 0, 0];
    // tyre
    cyl(R, R, W, 8, P.tyre, [X, 0.6, z], j, ax);
    // sidewall shoulders
    cyl(R * 0.93, R * 0.93, W + 0.04, 8, P.black, [X, 0.6, z], j, ax);
    // tread blocks
    for (let i = 0; i < 8; i++) {
      const a = (i + 0.5) * Math.PI / 4 + Math.PI / 8 - Math.PI / 8;
      const rr = R + 0.015;
      const y = 0.6 + Math.sin(a) * rr, zz = z + Math.cos(a) * rr;
      b.part(new THREE.BoxGeometry(W * 0.9, 0.05, 0.2), P.black, {
        bone: j, at: [X, y, zz], rotation: [(-a * 180) / Math.PI + 90, 0, 0],
      });
    }
    // rim
    const fx = X + ox * (W / 2 + 0.01);
    cyl(0.38, 0.38, 0.05, 8, P.rim, [fx, 0.6, z], j, ax);
    cyl(0.3, 0.3, 0.03, 8, P.hullDark, [fx + ox * 0.03, 0.6, z], j, ax);
    // glowing hub ring
    glow(b.part(new THREE.TorusGeometry(0.22, 0.02, 4, 8), P.neonCyan, {
      bone: j, at: [fx + ox * 0.05, 0.6, z], dir: ax, axis: "z", flat: true }), 1.5);
    cyl(0.1, 0.12, 0.08, 8, P.steel, [fx + ox * 0.07, 0.6, z], j, ax);
    // bolts
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      cyl(0.02, 0.02, 0.04, 5, RIVET, [fx + ox * 0.05, 0.6 + Math.sin(a) * 0.32, z + Math.cos(a) * 0.32], j, ax);
    }
    // brake disc inboard
    cyl(0.3, 0.3, 0.03, 8, P.steel, [X - ox * (W / 2 + 0.06), 0.6, z], j, ax);
    cyl(0.16, 0.16, 0.12, 6, P.hullDark, [X - ox * (W / 2 + 0.08), 0.6, z], j, ax);

    // fender armour: top slab + front/back angled plates
    const fy = 1.28;
    box(0.62, 0.08, 1.5, P.armor, [s * 1.25, fy, z], J.body);
    box(0.62, 0.08, 0.5, P.armor, [s * 1.25, fy - 0.12, z + 0.9], J.body, [-35, 0, 0]);
    box(0.62, 0.08, 0.5, P.armor, [s * 1.25, fy - 0.12, z - 0.9], J.body, [35, 0, 0]);
    // outer flange
    box(0.06, 0.3, 1.5, P.hull, [s * 1.55, fy - 0.12, z], J.body);
    // hazard edge trim
    box(0.08, 0.06, 1.5, P.trim, [s * 1.57, fy - 0.3, z], J.body);
    for (let i = -3; i <= 3; i++) {
      box(0.085, 0.07, 0.08, P.black, [s * 1.57, fy - 0.3, z + i * 0.2], J.body, [0, 0, 0]);
      b.part(new THREE.BoxGeometry(0.02, 0.05, 0.05), RIVET, { bone: J.body, at: [s * 1.58, fy - 0.1, z + i * 0.22] });
    }
    // suspension: axle beam, arm, shock with coil
    box(1.0, 0.1, 0.1, P.hullDark, [s * 0.75, 0.6, z], J.body);
    box(0.08, 0.08, 0.7, P.armor, [s * 0.95, 0.88, z], J.body, [0, 0, 0]);
    // leaf springs
    for (let k = 0; k < 4; k++) {
      box(0.1, 0.025, 1.1 - k * 0.2, P.steel, [s * 0.95, 0.78 - k * 0.0 + k * 0.03, z], J.body);
    }
    box(0.14, 0.05, 0.14, P.hullDark, [s * 0.95, 0.68, z], J.body);
    // shock
    const sx = s * 0.88;
    cyl(0.03, 0.03, 0.4, 6, P.trim, [sx, 0.85, z + 0.35], J.body, [0, 1, 0.3]);
    for (let k = 0; k < 5; k++)
      b.part(new THREE.TorusGeometry(0.05, 0.012, 4, 6), P.neonMagenta, {
        bone: J.body, at: [sx + 0.0, 0.7 + k * 0.07, z + 0.35 + k * 0.02], dir: [0, 1, 0], axis: "z" });
    // mud flap
    const mz = z - 0.78;
    box(0.04, 0.4, 0.5, P.black, [s * 1.3, 0.35, mz - 0.1], J.body);
    box(0.045, 0.06, 0.4, P.trim, [s * 1.31, 0.45, mz - 0.1], J.body);
    box(0.045, 0.1, 0.1, P.neonMagenta, [s * 1.31, 0.27, mz - 0.1], J.body);
  }
}
    return buildRunningGear;
  })(),
  // cabHood
  (() => {
function buildCabHood({ b, J, P, M }: any) {
  const cab = J.cab;
  const R = rng(77);
  void M;
  void R;

  const box = (
    w: number, h: number, d: number, color: string,
    at: [number, number, number],
    rot?: [number, number, number],
    bone: any = cab,
  ) => b.part(new THREE.BoxGeometry(w, h, d), color, { at, bone, rotation: rot });
  const lamp = (w: number, h: number, d: number, color: string, at: [number, number, number], s = 1.2, rot?: [number, number, number]) =>
    glow(box(w, h, d, color, at, rot), s);
  const cyl = (rt: number, rb: number, len: number, seg: number, color: string, at: [number, number, number], rot?: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, len, seg), color, { at, bone: cab, rotation: rot, flat: true });

  const HOOD_TOP = (z: number) => 2.4 - 0.1818 * (z - 1.9);
  const SLOPE = 10.3;

  // ---------- HOOD WEDGE ----------
  b.extrude(
    [[1.9, 1.3], [4.1, 1.3], [4.1, 2.0], [3.6, 2.04], [1.9, 2.4]],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 2.4, color: P.hull, bone: cab, name: "hoodWedge" },
  );
  // hood lower dark skirt line
  box(2.44, 0.06, 2.2, P.hullDark, [0, 1.36, 3.0]);
  // hood centre raised spine + side crease plates
  box(0.5, 0.05, 1.7, P.hullLight, [0, HOOD_TOP(2.95) + 0.03, 2.95], [SLOPE, 0, 0]);
  for (const s of [1, -1]) {
    box(0.04, 0.12, 2.1, P.armor, [s * 1.2, 1.95, 3.0], [SLOPE * 0.5, 0, 0]);
    box(0.5, 0.05, 1.2, P.armor, [s * 0.85, HOOD_TOP(3.2) + 0.03, 3.2], [SLOPE, 0, 0]);
    // vents: slat stacks
    for (let i = 0; i < 6; i++) {
      const z = 2.3 + i * 0.1;
      box(0.38, 0.025, 0.05, P.black, [s * 0.85, HOOD_TOP(z) + 0.06, z], [SLOPE, 0, 0]);
    }
    // hood hold-down pins
    for (const z of [2.2, 3.9]) cyl(0.025, 0.025, 0.04, 6, P.steel, [s * 1.0, HOOD_TOP(z) + 0.02, z], [SLOPE, 0, 0]);
    // trim hazard stripes on hood edge
    for (let i = 0; i < 6; i++) {
      const z = 2.4 + i * 0.3;
      box(0.1, 0.03, 0.12, i % 2 ? P.black : P.trim, [s * 1.1, HOOD_TOP(z) + 0.02, z], [SLOPE, 0, 20 * s]);
    }
  }
  // hood scoop
  box(0.5, 0.1, 0.4, P.hullDark, [0, HOOD_TOP(3.6) + 0.08, 3.6], [SLOPE, 0, 0]);
  box(0.4, 0.04, 0.05, P.black, [0, HOOD_TOP(3.75) + 0.1, 3.75], [SLOPE, 0, 0]);

  // ---------- FRONT: GRILLE, LIGHTS, BAR ----------
  box(1.6, 0.4, 0.05, P.black, [0, 1.78, 4.11]);
  lamp(1.4, 0.05, 0.02, P.neonCyan, [0, 1.78, 4.15], 1.6);
  for (let i = 0; i < 11; i++) box(0.045, 0.32, 0.04, P.hullDark, [-0.7 + i * 0.14, 1.78, 4.14]);
  box(1.7, 0.04, 0.06, P.armor, [0, 1.99, 4.12]);
  box(1.7, 0.04, 0.06, P.armor, [0, 1.58, 4.12]);
  for (const s of [1, -1]) {
    // headlights
    box(0.46, 0.26, 0.06, P.hullDark, [s * 0.98, 1.8, 4.1]);
    lamp(0.34, 0.16, 0.05, P.headWhite, [s * 0.98, 1.82, 4.14], 1.5);
    box(0.4, 0.05, 0.07, P.armor, [s * 0.98, 1.97, 4.12], [0, 0, -12 * s]);
    lamp(0.4, 0.035, 0.05, P.neonMagenta, [s * 0.98, 1.64, 4.14], 1.6);
    lamp(0.035, 0.2, 0.05, P.neonMagenta, [s * 0.77, 1.82, 4.14], 1.4);
    // bull-bar posts
    box(0.09, 0.8, 0.09, P.hull, [s * 1.2, 1.6, 4.25]);
    box(0.09, 0.09, 0.3, P.hull, [s * 1.2, 1.9, 4.15]);
    box(0.09, 0.09, 0.3, P.hull, [s * 1.2, 1.45, 4.15]);
  }
  box(2.5, 0.13, 0.1, P.hull, [0, 2.03, 4.27]);
  box(2.5, 0.1, 0.1, P.hull, [0, 1.52, 4.27]);
  for (let i = -3; i <= 3; i++) box(0.06, 0.55, 0.06, P.armor, [i * 0.3, 1.78, 4.26]);
  for (let i = 0; i < 12; i++) {
    const x = -1.1 + i * 0.2;
    box(0.09, 0.1, 0.02, i % 2 ? P.black : P.trim, [x, 2.03, 4.325], [0, 0, 38]);
  }
  for (let i = 0; i < 12; i++) {
    const x = -1.1 + i * 0.2;
    box(0.08, 0.08, 0.02, i % 2 ? P.trim : P.black, [x, 1.52, 4.325], [0, 0, -38]);
  }
  // winch drum
  cyl(0.1, 0.1, 1.0, 10, P.steel, [0, 1.42, 4.17], [0, 0, 90]);
  for (const s of [1, -1]) {
    cyl(0.13, 0.13, 0.05, 10, P.hullDark, [s * 0.52, 1.42, 4.17], [0, 0, 90]);
    cyl(0.05, 0.05, 0.1, 6, P.trim, [s * 0.58, 1.42, 4.17], [0, 0, 90]);
  }
  box(0.2, 0.08, 0.1, P.trim, [0, 1.42, 4.27]);
  cyl(0.11, 0.11, 0.5, 8, P.black, [0, 1.42, 4.17], [0, 0, 90]);

  // ---------- CAB BODY ----------
  box(2.7, 1.05, 1.9, P.hull, [0, 1.825, 1.05]);
  box(2.74, 0.1, 1.92, P.hullDark, [0, 1.33, 1.05]);
  // interior
  box(2.3, 0.55, 0.05, P.black, [0, 2.62, 0.2]);
  box(2.3, 0.04, 1.4, P.hullDark, [0, 2.37, 0.95]);
  for (const s of [1, -1]) {
    box(0.55, 0.12, 0.5, P.black, [s * 0.5, 2.48, 0.75]);
    box(0.5, 0.45, 0.1, P.black, [s * 0.5, 2.7, 0.52]);
    box(0.4, 0.1, 0.05, P.rust, [s * 0.5, 2.8, 0.58]);
  }
  // dashboard
  box(2.2, 0.16, 0.25, P.hullDark, [0, 2.46, 1.72]);
  box(2.0, 0.04, 0.12, P.black, [0, 2.56, 1.66]);
  for (const x of [-0.6, 0.1, 0.65]) {
    lamp(0.3, 0.12, 0.02, P.screenGreen, [x, 2.6, 1.62], 1.3, [-60, 0, 0]);
  }
  cyl(0.17, 0.17, 0.04, 8, P.black, [-0.5, 2.62, 1.38], [-50, 0, 0]);
  // lower body details
  for (const s of [1, -1]) {
    const X = s * 1.36;
    // door panel outline
    for (const z of [0.62, 1.82]) box(0.02, 0.85, 0.02, P.black, [X, 1.88, z]);
    box(0.02, 0.02, 1.2, P.black, [X, 1.46, 1.22]);
    box(0.02, 0.02, 1.2, P.black, [X, 2.3, 1.22]);
    box(0.02, 0.8, 0.02, P.black, [X, 1.88, 1.22]);
    // handles
    box(0.04, 0.05, 0.22, P.steel, [X + s * 0.02, 2.18, 0.75]);
    box(0.04, 0.05, 0.22, P.steel, [X + s * 0.02, 2.18, 1.7]);
    // lock
    cyl(0.025, 0.025, 0.03, 6, P.black, [X + s * 0.015, 2.12, 0.75], [0, 0, 90]);
    // rivets
    for (let i = 0; i < 6; i++) {
      box(0.03, 0.03, 0.03, P.steel, [X + s * 0.01, 1.52, 0.7 + i * 0.2]);
      box(0.03, 0.03, 0.03, P.steel, [X + s * 0.01, 2.25, 0.7 + i * 0.2]);
    }
    // armour add-on plates
    box(0.08, 0.5, 0.5, P.armor, [X + s * 0.03, 1.72, 0.35]);
    box(0.1, 0.1, 0.5, P.trim, [X + s * 0.05, 1.99, 0.35], [0, 0, 0]);
    for (let i = 0; i < 4; i++) box(0.11, 0.06, 0.08, i % 2 ? P.black : P.trim, [X + s * 0.05, 1.45 + i * 0.11, 0.35]);
    box(0.08, 0.3, 0.55, P.armor, [X + s * 0.03, 1.62, 1.55], [0, 0, 0]);
    box(0.1, 0.2, 0.3, P.hullLight, [X + s * 0.04, 1.62, 1.55]);
    // step
    box(0.2, 0.05, 0.6, P.hullDark, [s * 1.4 - s * 0.05, 1.32, 1.25]);
    // neon trims
    lamp(0.04, 0.04, 1.8, P.neonMagenta, [X + s * 0.02, 1.38, 1.05], 1.5);
    lamp(0.04, 0.04, 1.9, P.neonCyan, [s * 1.26, 2.93, 1.0], 1.5);
    lamp(0.04, 0.5, 0.04, P.neonCyan, [s * 1.35, 1.8, 1.97], 1.4);
    // emblem: hex plate with chevron
    cyl(0.17, 0.17, 0.03, 6, P.black, [X + s * 0.03, 1.9, 1.22], [0, 0, 90]);
    cyl(0.13, 0.13, 0.04, 6, P.trim, [X + s * 0.03, 1.9, 1.22], [0, 0, 90]);
    box(0.05, 0.05, 0.18, P.black, [X + s * 0.05, 1.93, 1.17], [-40, 0, 0]);
    box(0.05, 0.05, 0.18, P.black, [X + s * 0.05, 1.93, 1.27], [40, 0, 0]);
    lamp(0.05, 0.05, 0.05, P.neonMagenta, [X + s * 0.06, 1.84, 1.22], 1.5);
    // front corner vertical
    box(0.12, 1.0, 0.12, P.armor, [s * 1.33, 1.82, 1.96]);

    // ----- greenhouse -----
    const GX = s * 1.2;
    box(0.1, 0.1, 1.9, P.armor, [GX, 2.38, 1.05]); // sill
    box(0.1, 0.6, 0.1, P.armor, [GX, 2.65, 1.0]); // B pillar
    box(0.1, 0.6, 0.12, P.armor, [GX, 2.65, 0.2]); // C pillar
    box(0.1, 0.72, 0.1, P.armor, [GX, 2.65, 1.78], [-34.7, 0, 0]); // A pillar
    box(0.1, 0.08, 1.6, P.armor, [GX, 2.91, 0.95]);
    // glass panes (upper)
    box(0.03, 0.26, 0.7, P.glass, [s * 1.22, 2.74, 0.6]);
    box(0.03, 0.26, 0.55, P.glass, [s * 1.22, 2.74, 1.32]);
    box(0.035, 0.03, 0.4, P.glassGlint, [s * 1.225, 2.8, 0.6], [-20, 0, 0]);
    box(0.035, 0.02, 0.3, P.glassGlint, [s * 1.225, 2.74, 0.55], [-20, 0, 0]);
    box(0.035, 0.03, 0.3, P.glassGlint, [s * 1.225, 2.8, 1.32], [-20, 0, 0]);
    // mirrors
    box(0.1, 0.04, 0.04, P.black, [s * 1.31, 2.55, 2.0]);
    box(0.1, 0.3, 0.2, P.hullDark, [s * 1.35, 2.6, 1.97]);
    lamp(0.04, 0.2, 0.14, P.screenGreen, [s * 1.35, 2.6, 1.86], 1.2);
    box(0.1, 0.05, 0.2, P.trim, [s * 1.35, 2.78, 1.97]);
    // antennas at roof rear
    cyl(0.015, 0.02, 1.0, 5, P.black, [s * 1.1, 3.0, 0.25], [s * 8, 0, 0]);
    lamp(0.05, 0.05, 0.05, P.warnOrange, [s * 1.14, 3.5, 0.25], 2);
    // sensor domes
    b.part(new THREE.SphereGeometry(0.1, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), P.hullLight, { at: [s * 0.9, 2.95, 1.3], bone: cab, flat: true });
    glow(b.part(new THREE.SphereGeometry(0.04, 5, 4), P.neonCyan, { at: [s * 0.9, 3.0, 1.37], bone: cab }), 1.8);
    cyl(0.12, 0.12, 0.03, 8, P.hullDark, [s * 0.9, 2.96, 1.3]);
    // roof armour edge
    box(0.12, 0.05, 1.6, P.hullDark, [s * 1.3, 2.93, 0.95]);
    for (let i = 0; i < 5; i++) box(0.05, 0.03, 0.05, P.steel, [s * 1.3, 2.97, 0.3 + i * 0.35]);
    // windscreen sidewalls neon
    lamp(0.03, 0.03, 0.72, P.neonMagenta, [s * 1.24, 2.64, 1.78], 1.4, [-34.7, 0, 0]);
  }

  // ---------- ROOF & WINDSCREEN ----------
  box(2.5, 0.1, 1.5, P.hullLight, [0, 2.9, 0.9]);
  box(2.6, 0.06, 0.3, P.hull, [0, 2.88, 1.6], [-8, 0, 0]); // visor
  box(2.6, 0.05, 0.05, P.trim, [0, 2.9, 1.76]);
  box(2.3, 0.05, 0.62, P.black, [0, 2.74, 0.15]);
  // windscreen frame and glass
  const wsN: [number, number, number] = [0, 0.57 * 0.03, 0.82 * 0.03];
  box(2.3, 0.74, 0.04, P.glass, [wsN[0], 2.66 + wsN[1], 1.78 + wsN[2]], [-34.7, 0, 0]);
  box(2.3, 0.07, 0.05, P.armor, [0, 2.4, 1.98], [-34.7, 0, 0]);
  box(0.06, 0.74, 0.05, P.armor, [0, 2.66, 1.8], [-34.7, 0, 0]);
  for (const s of [1, -1]) {
    box(0.5, 0.05, 0.03, P.glassGlint, [s * 0.55, 2.8, 1.72], [-34.7, 0, 0]);
    box(0.3, 0.03, 0.03, P.glassGlint, [s * 0.4, 2.7, 1.77], [-34.7, 0, 0]);
    // wiper
    box(0.7, 0.025, 0.025, P.black, [s * 0.5, 2.5, 1.95], [-34.7, 0, s * 8]);
  }
  // cab rear wall armour
  box(2.4, 0.9, 0.06, P.armor, [0, 1.85, 0.12]);
  lamp(2.2, 0.03, 0.03, P.neonCyan, [0, 2.31, 0.08], 1.4);
  for (let i = 0; i < 5; i++) box(0.4, 0.04, 0.03, P.hullLight, [-0.8 + i * 0.4, 1.6 + (i % 2) * 0.3, 0.08]);

  // ---------- ROOF LIGHT BAR ----------
  box(1.8, 0.1, 0.16, P.black, [0, 3.0, 1.62]);
  box(1.9, 0.04, 0.2, P.trim, [0, 2.96, 1.62]);
  for (let i = 0; i < 6; i++) lamp(0.2, 0.1, 0.04, P.warnOrange, [-0.75 + i * 0.3, 3.03, 1.71], 1.8);
  box(0.12, 0.12, 0.22, P.hullDark, [-0.9, 3.0, 1.62]);
  box(0.12, 0.12, 0.22, P.hullDark, [0.9, 3.0, 1.62]);
  for (const s of [1, -1]) lamp(0.12, 0.08, 0.04, P.neonMagenta, [s * 0.9, 3.0, 1.74], 1.6);

  // ---------- ROOF HATCH ----------
  const HJ = b.joint("cabHoodHatch", { parent: cab, at: [0.85, 2.96, 1.05], dir: [0, 0, 1], group: "cab", role: "hinge" });
  b.part(new THREE.BoxGeometry(0.5, 0.06, 0.5), P.hull, { at: [0.85, 3.0, 1.05], bone: HJ });
  b.part(new THREE.BoxGeometry(0.4, 0.04, 0.4), P.armor, { at: [0.85, 3.04, 1.05], bone: HJ });
  b.part(new THREE.BoxGeometry(0.16, 0.05, 0.04), P.steel, { at: [0.85, 3.08, 1.0], bone: HJ });
  for (const dx of [-0.2, 0.2]) for (const dz of [-0.2, 0.2])
    b.part(new THREE.BoxGeometry(0.04, 0.05, 0.04), P.steel, { at: [0.85 + dx, 3.06, 1.05 + dz], bone: HJ });
  box(0.58, 0.04, 0.58, P.hullDark, [0.85, 2.96, 1.05]);

  // ---------- ANTENNA CLUSTER / SENSOR MAST ----------
  box(0.12, 0.3, 0.12, P.hullDark, [-0.85, 3.1, 1.05]);
  b.part(new THREE.SphereGeometry(0.1, 6, 4), P.olive, { at: [-0.85, 3.3, 1.05], bone: cab, flat: true });
  lamp(0.06, 0.06, 0.06, P.neonCyan, [-0.85, 3.3, 1.14], 2);
  cyl(0.01, 0.015, 0.7, 4, P.black, [-0.7, 3.3, 1.0]);
  cyl(0.005, 0.01, 0.9, 4, P.black, [-1.0, 3.4, 0.9]);

  // ---------- UNIT EMBLEM on hood side/front plates ----------
  for (const s of [1, -1]) {
    box(0.03, 0.3, 0.7, P.armor, [s * 1.21, 1.7, 2.8]);
    box(0.035, 0.1, 0.5, P.trim, [s * 1.215, 1.7, 2.8]);
    for (let i = 0; i < 3; i++) box(0.04, 0.2, 0.04, P.black, [s * 1.22, 1.7, 2.6 + i * 0.2], [-30, 0, 0]);
    lamp(0.04, 0.03, 0.5, P.neonCyan, [s * 1.22, 1.5, 2.8], 1.4);
    lamp(0.04, 0.03, 0.5, P.neonMagenta, [s * 1.22, 1.9, 2.8], 1.4);
    // hood-side vents
    for (let i = 0; i < 4; i++) box(0.03, 0.04, 0.3, P.black, [s * 1.215, 1.55 + i * 0.0, 3.4 + i * 0.0], [0, 0, 0]);
  }
  // front chin plate below grille sides
  box(2.3, 0.1, 0.08, P.armor, [0, 1.36, 4.12]);
  // tow cable hooks
  for (const s of [1, -1]) box(0.1, 0.08, 0.1, P.trim, [s * 0.75, 1.42, 4.2]);
  void J;
}
    return buildCabHood;
  })(),
  // turret
  (() => {
function buildTurret({ b, J, P, M }: Ctx) {
  const R = rng(77);
  const yaw = J.turretYaw;
  const pitch = J.gunPitch;
  const BRASS = "#c9962a";
  const DARKM = "#15171d";
  const BASE_Y = M.turretRing[1];
  const CX = M.turretRing[0];
  const CZ = M.turretRing[2];

  // helper: box part
  const box = (w: number, h: number, d: number, color: string, at: number[], bone: any = yaw, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at: at as any, rotation: rot as any, flat: true });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, at: number[], bone: any = yaw, dir?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at: at as any, dir: dir as any, flat: true });
  const Z = [0, 0, 1];

  // ---------- ring base (rotating) ----------
  cyl(0.5, 0.55, 0.06, 8, P.hullDark, [CX, BASE_Y + 0.03, CZ]);
  cyl(0.44, 0.48, 0.1, 8, P.armor, [CX, BASE_Y + 0.11, CZ]);
  cyl(0.46, 0.46, 0.02, 8, P.trim, [CX, BASE_Y + 0.17, CZ]);
  // teeth
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    box(0.06, 0.05, 0.05, P.steel, [CX + Math.sin(a) * 0.54, BASE_Y + 0.04, CZ + Math.cos(a) * 0.54], yaw, [0, (a * 180) / Math.PI, 0]);
  }
  // rivets
  for (let i = 0; i < 12; i++) {
    const a = ((i + 0.5) / 12) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.018, 5, 4), P.steel, {
      bone: yaw,
      at: [CX + Math.sin(a) * 0.46, BASE_Y + 0.18, CZ + Math.cos(a) * 0.46],
    });
  }
  // hazard stripes on ring front
  for (let i = -3; i <= 3; i++) {
    box(0.05, 0.06, 0.02, i % 2 ? P.trim : P.black, [CX + i * 0.06, BASE_Y + 0.11, CZ + 0.485], yaw);
  }

  // ---------- housing ----------
  const hy = BASE_Y + 0.42;
  box(0.9, 0.3, 0.8, P.hull, [CX, hy, CZ + 0.1]);
  box(0.8, 0.14, 0.7, P.hullLight, [CX, hy + 0.2, CZ + 0.1]);
  // sloped front mantlet
  b.part(new THREE.BoxGeometry(0.8, 0.28, 0.12), P.armor, {
    bone: yaw, at: [CX, hy + 0.05, CZ + 0.54], rotation: [-20, 0, 0], flat: true,
  });
  // side armour plates
  for (const s of [1, -1]) {
    box(0.04, 0.26, 0.6, P.armor, [CX + s * 0.47, hy, CZ + 0.1], yaw, [0, 0, s * 8]);
    box(0.02, 0.05, 0.6, P.neonCyan, [CX + s * 0.5, hy - 0.08, CZ + 0.1]);
    for (let k = 0; k < 4; k++)
      box(0.02, 0.02, 0.12, P.black, [CX + s * 0.5, hy + 0.06, CZ - 0.12 + k * 0.14]);
  }
  // roof hazard stripes
  for (let i = 0; i < 6; i++)
    box(0.1, 0.012, 0.14, i % 2 ? P.trim : P.black, [CX - 0.25 + i * 0.1, hy + 0.277, CZ + 0.3], yaw, [0, 20, 0]);
  // vents
  for (let i = 0; i < 4; i++) box(0.3, 0.012, 0.03, P.black, [CX - 0.15, hy + 0.277, CZ - 0.1 - i * 0.06]);

  // ---------- sensor eye cluster ----------
  const eyeY = hy + 0.2;
  box(0.34, 0.16, 0.14, P.hullDark, [CX, eyeY, CZ + 0.62]);
  for (const x of [-0.1, 0.1]) {
    cyl(0.05, 0.05, 0.04, 8, P.black, [CX + x, eyeY, CZ + 0.7], yaw, Z);
    glow(cyl(0.035, 0.035, 0.03, 8, P.neonCyan, [CX + x, eyeY, CZ + 0.715], yaw, Z), 1.5);
  }
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), P.neonMagenta, { bone: yaw, at: [CX, eyeY + 0.03, CZ + 0.71] }), 1.5);

  // ---------- gun cradle (pitch) ----------
  const gy = hy + 0.02;
  const gz = CZ + 0.65;
  for (const s of [1, -1]) {
    box(0.1, 0.22, 0.3, P.hullDark, [CX + s * 0.3, gy, gz], pitch);
    // barrels
    const bx = CX + s * 0.3;
    cyl(0.04, 0.045, 1.0, 8, P.black, [bx, gy, gz + 0.65], pitch, Z);
    cyl(0.06, 0.06, 0.3, 8, P.steel, [bx, gy, gz + 0.35], pitch, Z); // shroud
    for (let k = 0; k < 3; k++) cyl(0.065, 0.065, 0.02, 8, P.trim, [bx, gy, gz + 0.25 + k * 0.1], pitch, Z);
    // muzzle brake
    cyl(0.062, 0.062, 0.12, 8, P.hullDark, [bx, gy, gz + 1.2], pitch, Z);
    box(0.14, 0.02, 0.08, P.black, [bx, gy + 0.045, gz + 1.2], pitch);
    box(0.14, 0.02, 0.08, P.black, [bx, gy - 0.045, gz + 1.2], pitch);
    box(0.02, 0.1, 0.08, P.black, [bx + 0.065, gy, gz + 1.2], pitch);
    box(0.02, 0.1, 0.08, P.black, [bx - 0.065, gy, gz + 1.2], pitch);
    glow(cyl(0.02, 0.02, 0.01, 6, P.warnOrange, [bx, gy, gz + 1.262], pitch, Z), 1.2);
  }
  box(0.5, 0.1, 0.2, P.armor, [CX, gy + 0.02, gz - 0.05], pitch);

  // ---------- ammo box + belt (left side, x+) ----------
  const ax = CX + 0.62;
  box(0.2, 0.2, 0.34, P.olive, [ax, hy + 0.05, CZ + 0.2], yaw);
  box(0.21, 0.03, 0.2, P.trim, [ax, hy + 0.16, CZ + 0.2], yaw);
  box(0.22, 0.04, 0.12, P.black, [ax, hy + 0.0, CZ + 0.2], yaw);
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const bxp = ax - 0.08 - t * 0.2;
    const byp = hy + 0.05 - Math.sin(t * Math.PI) * 0.0 + t * 0.06;
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.05, 6), BRASS, {
      bone: yaw, at: [bxp, byp - 0.1 + t * 0.0, CZ + 0.4 + t * 0.08], dir: [1, 0, 0], flat: true,
    });
  }
  box(0.01, 0.01, 0.01, BRASS, [ax, hy, CZ + 0.4]);

  // ---------- missile pod (right side, x-) ----------
  const px = CX - 0.62;
  box(0.26, 0.26, 0.5, P.hull, [px, hy + 0.05, CZ + 0.2]);
  box(0.28, 0.03, 0.52, P.trim, [px, hy + 0.2, CZ + 0.2]);
  for (const dx of [-0.055, 0.055])
    for (const dy of [-0.055, 0.055]) {
      cyl(0.04, 0.04, 0.06, 8, P.black, [px + dx, hy + 0.05 + dy, CZ + 0.47], yaw, Z);
      cyl(0.025, 0.025, 0.02, 6, P.tailRed, [px + dx, hy + 0.05 + dy, CZ + 0.5], yaw, Z);
    }
  box(0.02, 0.2, 0.3, P.neonMagenta, [px - 0.135, hy + 0.05, CZ + 0.15]);
  // pod mount
  box(0.1, 0.1, 0.3, P.armor, [px + 0.15, hy - 0.08, CZ + 0.2]);

  // ---------- radar dish on mast ----------
  const mx = CX + 0.25, mz = CZ - 0.15;
  cyl(0.02, 0.025, 0.4, 6, P.steel, [mx, hy + 0.48, mz]);
  cyl(0.045, 0.045, 0.04, 8, P.hullDark, [mx, hy + 0.3, mz]);
  const dish = b.part(new THREE.SphereGeometry(0.17, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2.4), P.hullLight, {
    bone: yaw, at: [mx, hy + 0.7, mz], rotation: [70, 0, 0], flat: true,
  });
  cyl(0.008, 0.008, 0.16, 5, P.steel, [mx, hy + 0.74, mz + 0.06], yaw, [0, 0.4, 1]);
  glow(b.part(new THREE.SphereGeometry(0.02, 5, 4), P.neonCyan, { bone: yaw, at: [mx, hy + 0.8, mz + 0.13] }), 1.5);
  // radar ring
  cyl(0.18, 0.18, 0.01, 8, P.trim, [mx, hy + 0.7, mz - 0.01], yaw, [0, 0.35, 1]);

  // ---------- rear: status lights, antenna, decal ----------
  const lights = [P.warnOrange, P.neonMagenta, P.warnOrange, P.neonCyan];
  lights.forEach((c, i) =>
    glow(b.part(new THREE.SphereGeometry(0.025, 6, 4), c, { bone: yaw, at: [CX - 0.18 + i * 0.12, hy + 0.12, CZ - 0.32] }), 1.4),
  );
  box(0.7, 0.2, 0.06, P.armor, [CX, hy + 0.02, CZ - 0.33]);
  cyl(0.008, 0.012, 0.5, 5, P.steel, [CX - 0.38, hy + 0.5, CZ - 0.28]);
  glow(b.part(new THREE.SphereGeometry(0.02, 5, 4), P.tailRed, { bone: yaw, at: [CX - 0.38, hy + 0.76, CZ - 0.28] }), 1.6);
  // number decal "07" from bars, on left plate
  const dx = CX + 0.505, dz = CZ + 0.25;
  box(0.012, 0.12, 0.025, P.headWhite, [dx, hy + 0.0, dz - 0.04]);
  box(0.012, 0.025, 0.07, P.headWhite, [dx, hy + 0.06, dz + 0.04]);
  box(0.012, 0.025, 0.07, P.headWhite, [dx, hy - 0.06, dz + 0.04]);
  box(0.012, 0.12, 0.025, P.headWhite, [dx, hy + 0.0, dz + 0.1]);
  // hazard stripes on side lower
  for (let i = 0; i < 5; i++)
    box(0.012, 0.03, 0.05, i % 2 ? P.trim : P.black, [CX - 0.505, hy - 0.1, CZ - 0.1 + i * 0.07]);
  // housing rivets
  for (let i = 0; i < 10; i++)
    b.part(new THREE.SphereGeometry(0.012, 5, 4), P.steel, {
      bone: yaw, at: [CX - 0.4 + (i % 5) * 0.2, hy + 0.285, CZ + 0.45 - Math.floor(i / 5) * 0.8 + R() * 0.0],
    });
}
    return buildTurret;
  })(),
  // cargoBed
  (() => {
function buildCargoBed({ b, J, P, M }: { b: any; J: any; P: Record<string, string>; M: any }) {
  const R = rng(77);
  const body = J.body;
  const ramp = J.rampHinge;
  const OLIVE = P.olive, RUST = P.rust;
  const BRASS = "#c9962b";
  const WHITE = "#d9dde6";

  const box = (s: number[], c: string, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), c, { bone: o.bone ?? body, at, rotation: o.rot });
  const cyl = (r0: number, r1: number, h: number, seg: number, c: string, at: number[], o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, seg), c, { bone: o.bone ?? body, at, rotation: o.rot });
  const ball = (r: number, c: string, at: number[], o: any = {}) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), c, { bone: o.bone ?? body, at });

  // ---- dimensions
  const ZF = -0.08, ZR = -4.2, L = ZF - ZR, ZC = (ZF + ZR) / 2;
  const Y0 = 1.5, Y1 = 2.6, YC = (Y0 + Y1) / 2, W = 1.4;

  // ---- deck & undercarriage lip
  box([2.9, 0.15, 4.3], P.hullDark, [0, 1.42, -2.1]);
  box([2.96, 0.05, 4.3], P.trim, [0, 1.36, -2.1]);
  for (let i = 0; i < 14; i++) box([0.2, 0.05, 0.22], i % 2 ? P.black : P.trim, [-1.4 + i * 0.215, 1.36, -4.25]);

  // ---- main container shell
  box([2 * W, Y1 - Y0, L], P.hull, [0, YC, ZC]);
  box([2 * W + 0.1, 0.1, L + 0.1], P.hullLight, [0, Y1 + 0.05, ZC]);
  box([2 * W + 0.06, 0.08, L + 0.06], P.armor, [0, Y0 + 0.02, ZC]);
  // roof edge cyan neon
  for (const s of [1, -1]) box([0.04, 0.04, L], P.neonCyan, [s * (W + 0.04), Y1 + 0.02, ZC]);
  // corner posts
  for (const s of [1, -1])
    for (const z of [ZF - 0.05, ZR + 0.05]) box([0.14, Y1 - Y0 + 0.1, 0.14], P.armor, [s * (W + 0.03), YC, z]);

  // ---- ribbed side panels
  for (const s of [1, -1]) {
    const x = s * (W + 0.03);
    for (let i = 0; i < 13; i++) {
      const z = ZF - 0.3 - i * 0.3;
      box([0.07, 0.95, 0.1], P.hullLight, [x, YC + 0.08, z]);
      box([0.03, 0.9, 0.025], P.hullDark, [s * (W + 0.01), YC + 0.08, z - 0.15]);
      for (const y of [YC - 0.3, YC + 0.45]) box([0.02, 0.02, 0.05], P.steel, [x + s * 0.04, y, z]);
    }
    // horizontal panel lines
    box([0.025, 0.03, L - 0.2], P.hullDark, [s * (W + 0.01), Y1 - 0.08, ZC]);
    box([0.025, 0.03, L - 0.2], P.hullDark, [s * (W + 0.01), YC - 0.2, ZC]);
    // hazard band along bottom
    for (let i = 0; i < 20; i++)
      box([0.03, 0.14, 0.1], i % 2 ? P.black : P.trim, [s * (W + 0.02), Y0 + 0.14, ZF - 0.12 - i * 0.2]);
  }

  // ---- roll-up hatches (one per side)
  for (const s of [1, -1]) {
    const x = s * (W + 0.07), z = -1.5;
    box([0.05, 0.8, 1.2], P.armor, [x, YC - 0.05, z]);
    for (let i = 0; i < 6; i++) box([0.03, 0.04, 1.1], P.hullDark, [x + s * 0.03, YC - 0.35 + i * 0.13, z]);
    box([0.06, 0.08, 1.3], P.trim, [x, YC + 0.38, z]);
    box([0.06, 0.04, 1.3], P.trim, [x, YC - 0.46, z]);
    for (const dz of [-0.62, 0.62]) box([0.06, 0.8, 0.05], P.trim, [x, YC - 0.05, z + dz]);
    box([0.05, 0.04, 0.3], P.steel, [x + s * 0.05, YC - 0.35, z + 0.2]);
    box([0.07, 0.07, 0.07], P.warnOrange, [x + s * 0.03, YC - 0.35, z - 0.45]);
  }

  // ---- warning decals (triangles) and hologram logo on the sides
  for (const s of [1, -1]) {
    const x = s * (W + 0.05);
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 3), P.trim, { bone: body, at: [x, YC + 0.1, -3.4], rotation: [90, 0, s * 90] });
    b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 3), P.black, { bone: body, at: [x + s * 0.005, YC + 0.1, -3.4], rotation: [90, 0, s * 90] });
    box([0.04, 0.12, 0.03], P.trim, [x + s * 0.02, YC + 0.1, -3.4]);
    // logo: ring + bars
    b.part(new THREE.TorusGeometry(0.2, 0.025, 4, 8), P.neonMagenta, { bone: body, at: [x, YC + 0.15, -2.55], rotation: [0, 90, 0] });
    box([0.03, 0.04, 0.34], P.neonCyan, [x, YC + 0.15, -2.55]);
    box([0.03, 0.34, 0.04], P.neonCyan, [x, YC + 0.15, -2.55]);
    ball(0.05, P.neonMagenta, [x + s * 0.02, YC + 0.15, -2.55]);
    box([0.03, 0.05, 0.5], P.neonMagenta, [x, YC - 0.15, -2.55]);
  }

  // ---- front wall details (against cab)
  box([2.2, 0.7, 0.05], P.armor, [0, YC, ZF + 0.02]);
  for (let i = 0; i < 4; i++) box([0.5, 0.06, 0.03], P.hullDark, [0, YC - 0.2 + i * 0.16, ZF + 0.05]);
  for (const s of [1, -1]) cyl(0.05, 0.05, 0.9, 6, P.black, [s * 1.0, YC, ZF + 0.07]);

  // ---- roof: vents, solar panels, antennas
  const RT = Y1 + 0.1;
  for (const s of [1, -1]) {
    const x = s * 0.9;
    box([0.5, 0.1, 0.6], P.armor, [x, RT + 0.05, -0.55]);
    for (let i = 0; i < 5; i++) box([0.44, 0.03, 0.04], P.black, [x, RT + 0.11, -0.7 + i * 0.1]);
  }
  for (const s of [1, -1])
    for (let k = 0; k < 2; k++) {
      const z = -1.0 - k * 1.05, x = s * 0.62;
      box([1.0, 0.04, 0.9], P.armor, [x, RT + 0.03, z]);
      box([0.92, 0.03, 0.82], P.glass, [x, RT + 0.065, z]);
      for (let i = 1; i < 4; i++) box([0.01, 0.01, 0.82], P.glassGlint, [x - 0.46 + i * 0.23, RT + 0.085, z]);
      for (let i = 1; i < 3; i++) box([0.92, 0.01, 0.01], P.glassGlint, [x, RT + 0.085, z - 0.41 + i * 0.27]);
    }
  // roof centre rail
  box([0.12, 0.05, 2.3], P.steel, [0, RT + 0.03, -1.55]);
  // antenna masts with blinkers
  for (const [x, z, h, c] of [[-1.15, -0.3, 0.75, P.warnOrange], [1.15, -0.3, 0.6, P.neonMagenta], [-1.2, -2.3, 0.5, P.neonCyan]] as any[]) {
    cyl(0.07, 0.07, 0.08, 6, P.armor, [x, RT + 0.04, z]);
    cyl(0.012, 0.02, h, 5, P.steel, [x, RT + h / 2, z]);
    ball(0.045, c, [x, RT + h + 0.03, z]);
  }
  // radio mast
  cyl(0.1, 0.12, 0.1, 8, P.armor, [0, RT + 0.05, -2.7]);
  cyl(0.02, 0.035, 0.42, 6, P.steel, [0, RT + 0.3, -2.7]);
  cyl(0.012, 0.012, 0.2, 5, P.steel, [0, RT + 0.52, -2.7]);
  ball(0.05, P.neonCyan, [0, 3.1 - 0.05, -2.7]);
  box([0.3, 0.015, 0.015], P.steel, [0, RT + 0.4, -2.7]);

  // ---- rear roof rack with crates and drums
  const rz0 = -3.9, rz1 = -3.0;
  for (const s of [1, -1]) {
    for (const z of [rz0, rz1]) cyl(0.025, 0.025, 0.3, 5, P.steel, [s * 1.2, RT + 0.15, z]);
    box([0.04, 0.04, rz1 - rz0 + 0.1], P.steel, [s * 1.2, RT + 0.3, (rz0 + rz1) / 2]);
  }
  box([2.44, 0.04, 0.04], P.steel, [0, RT + 0.3, rz0]);
  box([2.44, 0.04, 0.04], P.steel, [0, RT + 0.3, rz1]);
  box([2.4, 0.05, 0.9], P.armor, [0, RT + 0.03, (rz0 + rz1) / 2]);
  // crates
  const crate = (x: number, y: number, z: number, w: number, h: number, d: number) => {
    box([w, h, d], OLIVE, [x, y, z]);
    box([w + 0.02, 0.04, d + 0.02], P.hullDark, [x, y + h / 2 - 0.03, z]);
    box([w + 0.02, 0.04, d + 0.02], P.hullDark, [x, y - h / 2 + 0.03, z]);
    box([0.06, h + 0.01, d + 0.02], P.trim, [x - w * 0.3, y, z]);
    box([0.06, h + 0.01, d + 0.02], P.trim, [x + w * 0.3, y, z]);
    box([w * 0.25, 0.06, 0.02], P.black, [x, y, z + d / 2 + 0.01]);
  };
  crate(-0.75, RT + 0.2, -3.45, 0.55, 0.32, 0.7);
  crate(-0.75, RT + 0.52, -3.45, 0.5, 0.28, 0.6);
  crate(-0.15, RT + 0.2, -3.45, 0.5, 0.32, 0.7);
  // drums
  for (const [x, z] of [[0.55, -3.3], [0.55, -3.7], [1.0, -3.5]] as number[][]) {
    cyl(0.17, 0.17, 0.5, 8, RUST, [x, RT + 0.28, z]);
    for (const dy of [-0.14, 0.14]) cyl(0.18, 0.18, 0.03, 8, P.hullDark, [x, RT + 0.28 + dy, z]);
    cyl(0.1, 0.1, 0.02, 6, P.steel, [x, RT + 0.54, z]);
    cyl(0.03, 0.03, 0.04, 5, P.trim, [x + 0.05, RT + 0.56, z]);
  }
  // strap
  box([2.3, 0.02, 0.06], P.black, [0, RT + 0.62, -3.15]);
  box([0.06, 0.02, 0.9], P.black, [0.2, RT + 0.62, -3.45]);

  // ---- rear: frame, ramp door on rampHinge, lights, plate
  const ZD = -4.22;
  box([2.8, 0.14, 0.2], P.armor, [0, Y1 - 0.02, ZR - 0.02]);
  for (const s of [1, -1]) box([0.14, Y1 - Y0, 0.2], P.armor, [s * 1.33, YC, ZR - 0.02]);
  // door slab
  box([2.5, 1.0, 0.1], P.hull, [0, YC - 0.02, ZD - 0.05], { bone: ramp });
  box([2.4, 0.9, 0.04], P.armor, [0, YC - 0.02, ZD - 0.11], { bone: ramp });
  for (let i = 0; i < 4; i++) box([2.3, 0.025, 0.02], P.hullDark, [0, Y0 + 0.25 + i * 0.22, ZD - 0.14], { bone: ramp });
  for (const s of [1, -1]) box([0.12, 1.0, 0.13], P.hullLight, [s * 1.2, YC - 0.02, ZD - 0.06], { bone: ramp });
  // hazard chevrons on door
  for (let i = 0; i < 8; i++)
    box([0.2, 0.1, 0.02], i % 2 ? P.black : P.trim, [-0.9 + i * 0.26, Y0 + 0.1, ZD - 0.14], { bone: ramp });
  // hinge barrels
  for (const s of [1, -1]) cyl(0.05, 0.05, 0.3, 6, P.steel, [s * 0.9, Y0 + 0.02, ZD - 0.04], { bone: ramp, rot: [0, 0, 90] });
  // locking bars
  for (const y of [Y0 + 0.4, Y0 + 0.75]) {
    cyl(0.03, 0.03, 2.2, 6, P.steel, [0, y, ZD - 0.17], { bone: ramp, rot: [0, 0, 90] });
    for (const s of [1, -1]) {
      box([0.12, 0.12, 0.08], P.trim, [s * 1.05, y, ZD - 0.17], { bone: ramp });
      box([0.04, 0.2, 0.04], P.black, [s * 1.18, y, ZD - 0.2], { bone: ramp });
    }
  }
  // license plate
  box([0.5, 0.17, 0.02], WHITE, [0, Y0 + 0.08 + 0.15, ZD - 0.16], { bone: ramp });
  for (let i = 0; i < 5; i++) box([0.05, 0.08, 0.01], P.black, [-0.17 + i * 0.085, Y0 + 0.23, ZD - 0.175], { bone: ramp });
  box([0.5, 0.025, 0.015], P.neonCyan, [0, Y0 + 0.13, ZD - 0.175], { bone: ramp });
  // holographic unit logo on door
  b.part(new THREE.TorusGeometry(0.2, 0.02, 4, 8), P.neonMagenta, { bone: ramp, at: [0, YC + 0.28, ZD - 0.15] });
  box([0.3, 0.03, 0.015], P.neonCyan, [0, YC + 0.28, ZD - 0.16], { bone: ramp });
  box([0.03, 0.3, 0.015], P.neonCyan, [0, YC + 0.28, ZD - 0.16], { bone: ramp });
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 4), P.neonMagenta, { bone: ramp, at: [0, YC + 0.28, ZD - 0.165], rotation: [90, 0, 0] });

  // hydraulic arms (body side)
  for (const s of [1, -1]) {
    const x = s * 1.3;
    cyl(0.04, 0.04, 0.55, 6, P.steel, [x, YC - 0.1, ZR - 0.14], { rot: [70, 0, 0] });
    cyl(0.025, 0.025, 0.4, 6, P.trim, [x, YC - 0.3, ZR - 0.28], { rot: [70, 0, 0] });
    ball(0.05, P.black, [x, Y0 + 0.12, ZR - 0.2]);
    ball(0.05, P.black, [x, YC + 0.12, ZR - 0.06]);
  }

  // tail light clusters
  for (const s of [1, -1]) {
    const x = s * 1.26;
    box([0.2, 0.5, 0.06], P.hullDark, [x, Y0 + 0.35, ZR - 0.14]);
    box([0.14, 0.14, 0.05], P.tailRed, [x, Y0 + 0.55, ZR - 0.18]);
    box([0.14, 0.12, 0.05], P.tailRed, [x, Y0 + 0.4, ZR - 0.18]);
    box([0.14, 0.1, 0.05], P.warnOrange, [x, Y0 + 0.26, ZR - 0.18]);
    box([0.04, 0.5, 0.03], P.neonMagenta, [s * 1.12, Y0 + 0.35, ZR - 0.15]);
  }
  // roof-edge rear marker lights
  for (let i = 0; i < 5; i++) box([0.1, 0.06, 0.05], i % 2 ? P.warnOrange : P.tailRed, [-0.6 + i * 0.3, Y1 + 0.02, ZR - 0.14]);

  // ---- rivet rows on the fascia
  for (let i = 0; i < 14; i++) {
    const x = -1.22 + i * 0.188;
    ball(0.018, P.steel, [x, Y1 - 0.02, ZR - 0.13]);
  }
  void R; void M; void BRASS;
}
    return buildCargoBed;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "warhound2077" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1.25,0], dir: [0,0,1], role: "spine" });
  J["cab"] = b.joint("cab", { parent: J["body"], at: [0,1.3,1.3], dir: [0,0,1], role: "hinge", group: "cab" });
  J["turretYaw"] = b.joint("turretYaw", { parent: J["body"], at: [0,3,0.5], dir: [0,1,0], role: "hinge", group: "turret" });
  J["gunPitch"] = b.joint("gunPitch", { parent: J["turretYaw"], at: [0,3.35,0.7], dir: [0,0,1], role: "hinge", group: "turret" });
  J["rampHinge"] = b.joint("rampHinge", { parent: J["body"], at: [0,1.5,-4.2], dir: [1,0,0], role: "hinge", group: "cargo" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.2,0.6,2.7], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.2,0.6,2.7], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelML"] = b.joint("wheelML", { parent: J["body"], at: [1.2,0.6,-1.6], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelMR"] = b.joint("wheelMR", { parent: J["body"], at: [-1.2,0.6,-1.6], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelRL"] = b.joint("wheelRL", { parent: J["body"], at: [1.2,0.6,-3], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelRR"] = b.joint("wheelRR", { parent: J["body"], at: [-1.2,0.6,-3], dir: [-1,0,0], role: "hinge", group: "wheels" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
