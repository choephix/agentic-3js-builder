import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Convoy Hauler MX-9",
  "description": "A low-poly cyberpunk armoured six-wheel convoy hauler with a slab-sided cab and a sealed, glowing cargo pod on its rear bed."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#2f3540",
  hullDark: "#1b1f27",
  hullLight: "#4a5565",
  trim: "#e7b814",
  trimDark: "#14120a",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2fb4",
  glass: "#0b2a3a",
  tire: "#101114",
  rim: "#8a93a3",
  podShell: "#d9dde3",
  podRib: "#8b94a3",
  warnRed: "#e0262f",
  metal: "#6b7482",
  rust: "#7a4a2b",
};
const M = {
  deckTop: [0, 1.2, 0] as [number, number, number],
  cabRear: [0, 1.2, 2.2] as [number, number, number],
  podBase: [0, 1.25, -1.4] as [number, number, number],
  axleFront: [0, 0.6, 3] as [number, number, number],
  axleRear1: [0, 0.6, -1.6] as [number, number, number],
  axleRear2: [0, 0.6, -3.4] as [number, number, number],
  bumperFront: [0, 0.7, 4.5] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassis
  (() => {
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

function buildChassis({ b, J, P }: Ctx) {
  const bone = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, g = false, rot?: number[]) => {
    const p = b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at: [x, y, z], rotation: rot, flat: true });
    if (g) glow(p, 1.4);
    return p;
  };
  const cyl = (r: number, len: number, seg: number, color: string, x: number, y: number, z: number, rot: number[]) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { bone, at: [x, y, z], rotation: rot, flat: true });

  // main hull slab with chamfers
  box(2.9, 0.5, 6.6, P.hull, 0, 0.9, -1.15);
  box(2.5, 0.12, 6.6, P.hullLight, 0, 1.17, -1.15);
  for (const s of [1, -1]) {
    box(0.16, 0.5, 6.6, P.hullLight, s * 1.42, 1.0, -1.15, false, [0, 0, s * 20]);
    box(0.1, 0.1, 6.6, P.neonCyan, s * 1.5, 0.62, -1.15, true);
  }
  // deck plate
  box(2.6, 0.04, 6.4, P.hullDark, 0, 1.2, -1.15);
  // underbody
  box(2.0, 0.3, 5.6, P.hullDark, 0, 0.55, -1.2);
  box(1.2, 0.2, 1.2, P.metal, 0, 0.5, 0.6);
  box(0.8, 0.18, 1.4, P.metal, 0, 0.5, -2.5);
  // rivet rows & tie-down rings
  for (const s of [1, -1]) {
    for (let i = 0; i < 14; i++) {
      const z = -4.2 + i * 0.45;
      b.part(new THREE.SphereGeometry(0.035, 5, 4), P.metal, { bone, at: [s * 1.32, 1.24, z] });
    }
    for (let i = 0; i < 4; i++) {
      const z = -3.8 + i * 1.7;
      const ring = b.part(new THREE.TorusGeometry(0.08, 0.02, 5, 8), P.metal, { bone, at: [s * 1.42, 1.25, z], rotation: [90, 0, 0] });
      box(0.2, 0.03, 0.14, P.hullDark, s * 1.42, 1.215, z);
    }
  }
  // skirts with hazard stripes
  for (const s of [1, -1]) {
    // gaps for wheel arches: skirts between axles and forward
    const segs: [number, number][] = [[2.2, 1.25], [-0.5, 2.0], [-2.5, 1.0]];
    for (const [z, len] of segs) {
      box(0.1, 0.32, len, P.hullDark, s * 1.55, 0.7, z - 0.0);
      const n = Math.floor(len / 0.2);
      for (let i = 0; i < n; i++) {
        if (i % 2) continue;
        box(0.03, 0.26, 0.1, P.trim, s * 1.61, 0.7, z - len / 2 + 0.1 + i * 0.2, false, [0, 0, 0]);
      }
    }
    // fuel tank
    cyl(0.24, 1.1, 8, P.metal, s * 1.5, 0.95, 1.0, [90, 0, 0]);
    for (const dz of [-0.35, 0.35]) cyl(0.255, 0.08, 8, P.trim, s * 1.5, 0.95, 1.0 + dz, [90, 0, 0]);
    cyl(0.07, 0.08, 6, P.warnRed, s * 1.5, 1.2, 1.0, [0, 0, 0]);
    // battery cases
    for (let i = 0; i < 2; i++) {
      box(0.28, 0.28, 0.5, P.hullLight, s * 1.55, 0.95, -0.45 - i * 0.0 + (i ? -0.0 : 0) - i * 0.0 + 0 - (i ? 0.6 : 0) + 0.0);
      box(0.04, 0.06, 0.3, P.neonCyan, s * 1.7, 1.02, -0.45 - (i ? 0.6 : 0), true);
    }
    // mud flaps
    for (const z of [-2.0, -4.0]) {
      box(0.05, 0.4, 0.6, P.hullDark, s * 1.45, 0.45, z - 0.0 - 0.0);
      box(0.06, 0.06, 0.5, P.trim, s * 1.45, 0.62, z);
    }
    // front fender stubs
    box(0.12, 0.16, 0.8, P.trim, s * 1.5, 1.1, 2.0);
  }
  // rear bumper
  box(3.0, 0.4, 0.3, P.hullDark, 0, 0.7, -4.5 + 0.0);
  box(3.0, 0.08, 0.32, P.trim, 0, 0.9, -4.5);
  for (let i = 0; i < 7; i++) box(0.12, 0.3, 0.02, P.trimDark, -1.2 + i * 0.4, 0.7, -4.67);
  for (const s of [1, -1]) {
    box(0.4, 0.16, 0.06, P.warnRed, s * 1.0, 0.72, -4.68, true);
    box(0.5, 0.04, 0.08, P.hullLight, s * 1.0, 0.82, -4.68);
  }
  box(1.0, 0.06, 0.06, P.neonCyan, 0, 0.5, -4.66, true);
  box(2.6, 0.05, 0.05, P.neonCyan, 0, 0.42, -3.6, true);
  box(0.05, 0.05, 4.2, P.neonCyan, 0.0, 0.42, -1.5, true);
  // front hull / cab mating plate
  box(2.6, 0.1, 0.3, P.metal, 0, 1.22, 2.1);
  box(2.9, 0.4, 0.2, P.hullLight, 0, 0.85, 2.1);
  for (let i = 0; i < 5; i++) b.part(new THREE.SphereGeometry(0.04, 5, 4), P.metal, { bone, at: [-1 + i * 0.5, 1.28, 2.1] });
  // cradle rails for pod
  for (const s of [1, -1]) box(0.14, 0.06, 5.8, P.trimDark, s * 0.9, 1.25, -1.5);
  // small panel seams on deck
  for (let i = 0; i < 6; i++) box(2.4, 0.01, 0.03, P.hullLight, 0, 1.225, -4 + i * 1.0 + R() * 0.05);
}
    return buildChassis;
  })(),
  // cab
  (() => {
function buildCab({ b, J, P, M }: Ctx) {
  const bone = J.cab;
  const R = rng(9);
  // box helper: center, size
  const box = (c: number[], s: number[], col: string, o: any = {}) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), col, { bone, at: c, ...o });
  const lit = (c: number[], s: number[], col: string, k = 1.4) => glow(box(c, s, col), k);
  const wedge = (c: number[], w: number, h: number, d: number, col: string) => {
    // wedge: sloped front, built as a triangular prism extruded across x
    return b.extrude(
      [[0, 0], [d, 0], [d, h * 0.25], [0, h]],
      { at: [c[0] - w / 2, c[1], c[2]], x: [0, 0, 1], y: [0, 1, 0], thickness: w, color: col, bone },
    );
  };

  // main cab body (rear section)
  box([0, 1.85, 2.85], [2.9, 1.3, 1.3], P.hull);
  // lower body skirt
  box([0, 1.45, 3.3], [3.0, 0.5, 2.2], P.hullDark);
  // sloped hood: extrude side profile (z forward, y up), thickness across x
  b.extrude(
    [[0, 0], [1.4, 0], [1.4, 0.35], [0.9, 0.55], [0, 0.75]],
    { at: [0, 1.7, 3.1], x: [0, 0, 1], y: [0, 1, 0], thickness: 2.7, color: P.hull, bone },
  ).mesh.position.x += 0;
  // hood bevel panels
  for (const s of [1, -1]) {
    box([s * 0.95, 2.28, 3.75], [0.7, 0.05, 1.0], P.hullLight, { rotation: [-14, 0, s * 6] });
    box([s * 1.45, 2.0, 3.5], [0.1, 0.9, 1.9], P.hullLight);
  }
  // roof
  box([0, 2.55, 2.75], [2.7, 0.2, 1.1], P.hullLight);
  box([0, 2.45, 2.3], [2.4, 0.2, 0.3], P.hullDark);
  // visor windscreen
  box([0, 2.28, 3.28], [2.3, 0.3, 0.06], P.neonCyan, { rotation: [-35, 0, 0] });
  glow(b.part(new THREE.BoxGeometry(2.1, 0.2, 0.06), P.glass, { bone, at: [0, 2.28, 3.3], rotation: [-35, 0, 0] }), 0.3);
  // side window slits
  for (const s of [1, -1]) {
    box([s * 1.47, 2.2, 2.85], [0.05, 0.22, 0.8], P.glass);
    box([s * 1.46, 2.2, 2.85], [0.03, 0.28, 0.9], P.neonCyan);
    box([s * 1.47, 2.2, 2.85], [0.05, 0.2, 0.78], P.glass);
    // door seams
    box([s * 1.5, 1.8, 2.5], [0.03, 1.0, 0.03], P.hullDark);
    box([s * 1.5, 1.8, 3.2], [0.03, 1.0, 0.03], P.hullDark);
    box([s * 1.5, 1.35, 2.85], [0.03, 0.03, 0.7], P.hullDark);
    // handle
    box([s * 1.52, 1.85, 2.65], [0.04, 0.05, 0.2], P.metal);
    // armour plates + hazard trim
    box([s * 1.53, 1.5, 3.6], [0.06, 0.55, 1.2], P.hullLight);
    for (let i = 0; i < 4; i++) box([s * 1.57, 1.28 + (i % 2) * 0.01, 3.1 + i * 0.3], [0.03, 0.06, 0.18], P.trim, { rotation: [0, 0, 0] });
    for (let i = 0; i < 6; i++) {
      const z = 3.1 + (i % 3) * 0.5;
      b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 6), P.metal, { bone, at: [s * 1.57, 1.35 + Math.floor(i / 3) * 0.3, z], dir: [s, 0, 0] });
    }
    // mirrors
    box([s * 1.7, 2.1, 3.15], [0.06, 0.3, 0.05], P.metal);
    box([s * 1.82, 2.2, 3.15], [0.12, 0.28, 0.2], P.hullDark);
    box([s * 1.76, 2.2, 3.15], [0.02, 0.22, 0.14], P.neonCyan);
    // exhaust stacks behind cab
    b.part(new THREE.CylinderGeometry(0.1, 0.12, 1.3, 8), P.metal, { bone: J.body, at: [s * 1.2, 2.2, 2.35] });
    b.part(new THREE.CylinderGeometry(0.13, 0.13, 0.08, 8), P.hullDark, { bone: J.body, at: [s * 1.2, 2.85, 2.35] });
    b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 8), P.trimDark, { bone: J.body, at: [s * 1.2, 2.64, 2.35] });
    for (let i = 0; i < 3; i++) b.part(new THREE.TorusGeometry(0.12, 0.03, 4, 8), P.trim, { bone: J.body, at: [s * 1.2, 1.75 + i * 0.3, 2.35], rotation: [90, 0, 0] });
    // headlight strips
    lit([s * 0.8, 1.72, 4.52], [0.7, 0.1, 0.05], P.neonCyan, 2);
    box([s * 0.8, 1.72, 4.49], [0.8, 0.18, 0.04], P.hullDark);
    // bull bar uprights
    box([s * 0.9, 1.25, 4.55], [0.1, 0.9, 0.1], P.metal);
    box([s * 1.4, 1.05, 4.4], [0.18, 0.5, 0.2], P.hullLight);
    // roof lights
    lit([s * 0.8, 2.74, 2.9], [0.4, 0.1, 0.25], s > 0 ? P.neonMagenta : P.neonCyan, 2);
    lit([s * 0.25, 2.74, 2.9], [0.4, 0.1, 0.25], s > 0 ? P.neonCyan : P.neonMagenta, 2);
    // fender trim hazard on hood side
    box([s * 1.4, 1.62, 3.9], [0.12, 0.08, 1.2], P.trim);
  }
  // light bar housing
  box([0, 2.69, 2.9], [2.2, 0.1, 0.4], P.hullDark);
  // front fascia
  box([0, 1.7, 4.4], [2.6, 0.7, 0.2], P.hullDark);
  // grille slats
  for (let i = 0; i < 5; i++) box([0, 1.5 + i * 0.1, 4.52], [0.9, 0.04, 0.04], P.metal);
  // bumper
  box([0, 0.9, 4.35], [2.9, 0.4, 0.35], P.hull);
  box([0, 1.1, 4.5], [2.9, 0.06, 0.1], P.trim);
  box([0, 0.78, 4.5], [2.4, 0.05, 0.08], P.neonCyan);
  glow(box([0, 0.78, 4.52], [2.4, 0.04, 0.03], P.neonCyan), 1.8);
  // bull bar rail
  box([0, 1.7, 4.62], [2.0, 0.08, 0.08], P.metal);
  box([0, 1.3, 4.62], [2.0, 0.08, 0.08], P.metal);
  // emblem stripe on hood
  box([0, 2.28, 3.85], [0.12, 0.03, 1.0], P.trim);
  box([0, 2.3, 3.85], [0.04, 0.03, 0.9], P.neonMagenta);
  // rear wall detail
  box([0, 1.9, 2.18], [2.6, 1.1, 0.06], P.hullDark);
  for (let i = 0; i < 6; i++) box([-1.0 + i * 0.4, 2.35, 2.14], [0.2, 0.04, 0.03], P.trim);
  // rivets on hood
  for (let i = 0; i < 8; i++) {
    const s = i % 2 ? 1 : -1;
    b.part(new THREE.SphereGeometry(0.03, 5, 4), P.metal, { bone, at: [s * (0.3 + R() * 0.8), 2.3 - (i % 3) * 0.0, 3.5 + i * 0.12] });
  }
}
    return buildCab;
  })(),
  // wheels
  (() => {
function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.6;
  const rand = rng(11);
  const YEL = P.trim;
  const sides = [1, -1];
  const axles = [
    { z: M.axleFront[2], n: "F" },
    { z: M.axleRear1[2], n: "M" },
    { z: M.axleRear2[2], n: "B" },
  ];

  // Orient a cylinder (axis Y) along X
  const along = (dx: number) => ({ dir: [dx, 0, 0] as [number, number, number] });

  for (const ax of axles) {
    // Axle bar across
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 2.5, 8), P.metal, {
      bone: J.body, at: [0, 0.6, ax.z], dir: [1, 0, 0],
    });
    // Differential housing
    b.part(new THREE.SphereGeometry(0.22, 8, 6), P.hullDark, {
      bone: J.body, at: [0, 0.6, ax.z], scale: [1, 0.9, 1],
    });
    // Leaf pack + springs
    for (const s of sides) {
      const x = s * 0.95;
      for (let i = 0; i < 4; i++) {
        const len = 0.9 - i * 0.14;
        b.part(new THREE.BoxGeometry(0.16, 0.025, len), i % 2 ? P.metal : P.hullLight, {
          bone: J.body, at: [x, 0.78 + i * 0.03, ax.z + (rand() - 0.5) * 0.02],
        });
      }
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 6), P.hullDark, {
        bone: J.body, at: [x, 0.9, ax.z], dir: [0, 1, 0],
      });
      // Coil spring (stacked rings)
      for (let i = 0; i < 4; i++) {
        b.part(new THREE.TorusGeometry(0.07, 0.014, 5, 8), P.metal, {
          bone: J.body, at: [x, 0.95 + i * 0.06, ax.z + 0.35], dir: [0, 1, 0], axis: "z",
        });
      }
      // Shock absorber
      b.rod([x, 0.7, ax.z + 0.35], [x, 1.18, ax.z + 0.35], 0.03, P.warnRed, { bone: J.body });
    }
  }

  for (const s of sides) {
    for (const ax of axles) {
      const name = "wheel" + ax.n + (s > 0 ? "L" : "R");
      const j = J[name];
      const cx = s * 1.3;
      const at = [cx, 0.6, ax.z] as [number, number, number];
      const o = along(s);

      // Tire
      b.part(new THREE.CylinderGeometry(R, R, 0.5, 14), P.tire, { bone: j, at, ...o, flat: true });
      // Shoulder chamfers
      for (const k of [1, -1]) {
        b.part(new THREE.CylinderGeometry(R * 0.9, R * 0.97, 0.06, 14), P.tire, {
          bone: j, at: [cx + s * k * 0.27, 0.6, ax.z], ...o, flat: true,
        });
      }
      // Tread blocks
      const n = 14;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const y = 0.6 + Math.cos(a) * (R + 0.02);
        const z = ax.z + Math.sin(a) * (R + 0.02);
        const blk = b.part(new THREE.BoxGeometry(0.46, 0.05, 0.18), i % 2 ? P.hullDark : P.tire, {
          bone: j, at: [cx, y, z],
          rotation: [(-a * 180) / Math.PI + 90 - 90 + 0, 0, 0],
        });
        blk.mesh.rotation.set(a, 0, 0);
      }
      // Rim disc outer face
      const ox = cx + s * 0.26;
      b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 12), P.rim, { bone: j, at: [ox, 0.6, ax.z], ...o, flat: true });
      b.part(new THREE.TorusGeometry(0.4, 0.035, 5, 12), P.hullLight, {
        bone: j, at: [ox + s * 0.02, 0.6, ax.z], dir: [s, 0, 0], axis: "z",
      });
      // Bolt ring
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), P.trimDark, {
          bone: j, at: [ox + s * 0.04, 0.6 + Math.cos(a) * 0.25, ax.z + Math.sin(a) * 0.25], ...o,
        });
      }
      // Spokes accent
      for (let i = 0; i < 3; i++) {
        const sp = b.part(new THREE.BoxGeometry(0.03, 0.62, 0.07), P.hullDark, {
          bone: j, at: [ox + s * 0.03, 0.6, ax.z],
        });
        sp.mesh.rotation.set((i * Math.PI) / 3, 0, 0);
      }
      // Hub + glowing cap
      b.part(new THREE.CylinderGeometry(0.15, 0.17, 0.12, 8), P.metal, { bone: j, at: [ox + s * 0.06, 0.6, ax.z], ...o });
      glow(
        b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.05, 8), P.neonCyan, {
          bone: j, at: [ox + s * 0.12, 0.6, ax.z], ...o,
        }),
        1.6,
      );
      // Brake disc (inner side)
      const ix = cx - s * 0.3;
      b.part(new THREE.CylinderGeometry(0.33, 0.33, 0.03, 12), P.metal, { bone: j, at: [ix, 0.6, ax.z], ...o });
      b.part(new THREE.BoxGeometry(0.1, 0.2, 0.14), P.warnRed, {
        bone: J.body, at: [ix - s * 0.02, 0.6 + 0.3, ax.z],
      });

      // Fender arch trim: hull arc segments over wheel with yellow edge
      const segs = 7;
      for (let i = 0; i < segs; i++) {
        const a = -Math.PI * 0.45 + (i / (segs - 1)) * Math.PI * 0.9;
        const rr = R + 0.12;
        const y = 0.6 + Math.cos(a) * rr;
        const z = ax.z + Math.sin(a) * rr;
        const f = b.part(new THREE.BoxGeometry(0.62, 0.05, 0.22), P.hull, { bone: J.body, at: [cx, y, z] });
        f.mesh.rotation.set(a, 0, 0);
        const e = b.part(new THREE.BoxGeometry(0.04, 0.055, 0.22), YEL, {
          bone: J.body, at: [cx + s * 0.31, y, z],
        });
        e.mesh.rotation.set(a, 0, 0);
      }
    }
  }
}
    return buildWheels;
  })(),
  // cargoPod
  (() => {
function buildCargoPod({ b, J, P, M }: Ctx) {
  const bone = J.pod;
  const R = rng(5);
  const CY = 2.2; // pod axis height
  const RAD = 0.9; // hex circumradius
  const Z0 = -4.0, Z1 = 1.2; // body span
  const LEN = Z1 - Z0, ZC = (Z0 + Z1) / 2;

  const part = (geo: THREE.BufferGeometry, color: string, at: number[], extra: any = {}) =>
    b.part(geo, color, { bone, at, flat: true, ...extra });
  const box = (w: number, h: number, d: number, color: string, at: number[], extra: any = {}) =>
    part(new THREE.BoxGeometry(w, h, d), color, at, extra);
  const hexAxisZ = (r: number, len: number, color: string, at: number[], seg = 6) =>
    part(new THREE.CylinderGeometry(r, r, len, seg), color, at, { rotation: [90, 0, 0] });

  // Cradle base
  box(2.6, 0.12, LEN + 0.4, P.hullDark, [0, 1.31, ZC]);
  box(2.4, 0.08, LEN + 0.2, P.hullLight, [0, 1.39, ZC]);
  for (const s of [1, -1]) {
    box(0.1, 0.1, LEN + 0.3, P.trim, [s * 1.3, 1.38, ZC]);
    for (let i = 0; i < 6; i++) {
      const z = Z0 + 0.3 + i * (LEN - 0.6) / 5;
      box(0.35, 0.55, 0.3, P.hullDark, [s * 0.6, 1.62, z]);
      box(0.3, 0.1, 0.34, P.trim, [s * 0.6, 1.9, z]);
    }
  }

  // Main hex body
  hexAxisZ(RAD, LEN, P.podShell, [0, CY, ZC]);
  // slightly larger ribs
  const ribZ: number[] = [];
  for (let i = 0; i < 7; i++) ribZ.push(Z0 + 0.35 + i * (LEN - 0.7) / 6);
  ribZ.forEach((z) => hexAxisZ(RAD + 0.06, 0.14, P.podRib, [0, CY, z]));

  // End caps (domed, faceted)
  part(new THREE.SphereGeometry(RAD, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2), P.podShell, [0, CY, Z1], { rotation: [90, 0, 0] });
  part(new THREE.SphereGeometry(RAD, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2), P.podShell, [0, CY, Z0], { rotation: [-90, 0, 0] });
  hexAxisZ(RAD + 0.08, 0.1, P.hullDark, [0, CY, Z1 + 0.02]);
  hexAxisZ(RAD + 0.08, 0.1, P.hullDark, [0, CY, Z0 - 0.02]);
  glow(part(new THREE.CylinderGeometry(0.25, 0.25, 0.05, 6), P.neonMagenta, [0, CY, Z0 - 0.88], { rotation: [90, 0, 0] }), 1.5);

  // Glowing magenta seams at hex vertices (vertices at angles k*60 with cylinder axis rotated)
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3;
    const x = Math.sin(a) * RAD * 1.0, y = Math.cos(a) * RAD * 1.0;
    if (y < -0.2) continue;
    const g = box(0.07, 0.07, LEN - 0.4, P.neonMagenta, [x * 1.0, CY + y, ZC], { rotation: [0, 0, -(a * 180) / Math.PI] });
    glow(g, 1.6);
  }

  // Hazard bands
  [Z0 + 1.0, Z1 - 0.9].forEach((z) => {
    hexAxisZ(RAD + 0.03, 0.5, P.trimDark, [0, CY, z]);
    for (let i = 0; i < 6; i++) {
      const a = (i * 60 + 30) * Math.PI / 180;
      const r = RAD * 0.87 + 0.06;
      box(0.55, 0.06, 0.12, P.trim, [Math.sin(a) * r, CY + Math.cos(a) * r, z], { rotation: [0, 0, -(a * 180) / Math.PI + 90 * 0], });
    }
  });
  // Hazard stripes on the sides
  for (const s of [1, -1])
    for (let i = 0; i < 7; i++) {
      box(0.04, 0.5, 0.16, i % 2 ? P.trimDark : P.trim, [s * (RAD * 0.87 + 0.04), CY, Z0 + 0.6 + i * 0.22], { rotation: [0, 0, 0] });
    }

  // Clamp straps over the top
  [-0.3, -1.9, -3.2].forEach((z) => {
    hexAxisZ(RAD + 0.12, 0.2, P.metal, [0, CY, z]);
    for (const s of [1, -1]) {
      box(0.16, 0.5, 0.28, P.hullDark, [s * 1.0, 1.65, z]);
      box(0.2, 0.12, 0.3, P.trim, [s * 1.0, 1.4, z]);
      for (const dz of [-0.07, 0.07]) {
        part(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 6), P.rim, [s * 1.08, 1.7, z + dz], { rotation: [0, 0, 90] });
      }
    }
    for (const bx of [-0.35, 0.35]) part(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 6), P.rim, [bx, CY + RAD + 0.2, z]);
    box(0.5, 0.05, 0.22, P.hullDark, [0, CY + RAD + 0.15, z]);
  });

  // Corner brackets near cradle
  for (const s of [1, -1])
    for (const z of [Z0 + 0.1, Z1 - 0.1]) {
      box(0.1, 0.5, 0.1, P.metal, [s * 1.15, 1.6, z]);
      box(0.3, 0.1, 0.3, P.metal, [s * 1.15, 1.45, z]);
    }

  // Hatch door on the left side (+X)
  const hx = RAD * 0.87 + 0.05;
  box(0.06, 0.9, 1.2, P.hullDark, [hx, CY, -0.9]);
  box(0.08, 0.78, 1.08, P.podRib, [hx + 0.01, CY, -0.9]);
  box(0.1, 0.06, 1.08, P.trim, [hx + 0.02, CY + 0.2, -0.9]);
  box(0.1, 0.06, 1.08, P.trim, [hx + 0.02, CY - 0.2, -0.9]);
  box(0.12, 0.05, 0.05, P.hullDark, [hx + 0.03, CY, -0.9]); // seam
  box(0.1, 0.2, 0.14, P.hullDark, [hx + 0.04, CY, -0.35]); // keypad
  for (let i = 0; i < 6; i++)
    box(0.04, 0.04, 0.04, P.metal, [hx + 0.1, CY + 0.06 - Math.floor(i / 2) * 0.06, -0.38 + (i % 2) * 0.06]);
  glow(box(0.1, 0.08, 0.08, P.neonCyan, [hx + 0.05, CY + 0.2, -0.35]), 1.8);
  for (const dz of [-1.35, -1.55]) glow(box(0.1, 0.08, 0.08, P.warnRed, [hx + 0.05, CY + 0.2, dz]), 1.6);

  // Emblem bars on other side
  for (let i = 0; i < 3; i++) box(0.04, 0.1, 0.9 - i * 0.2, i === 1 ? P.warnRed : P.podRib, [-hx - 0.01, CY + 0.25 - i * 0.2, -1.5]);
  box(0.04, 0.5, 0.1, P.hullDark, [-hx - 0.01, CY, -2.3]);

  // Lock indicators on rear cap
  for (const dx of [-0.35, 0.35]) glow(box(0.14, 0.14, 0.06, P.warnRed, [dx, CY + 0.35, Z0 - 0.55]), 1.5);

  // Antenna
  const ax = 0.3, az = -2.6, atop = CY + RAD;
  box(0.25, 0.08, 0.25, P.hullDark, [ax, atop + 0.02, az]);
  part(new THREE.CylinderGeometry(0.015, 0.025, 0.9, 6), P.metal, [ax, atop + 0.5, az]);
  part(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 6), P.metal, [ax, atop + 0.55, az + 0.0], { rotation: [0, 0, 90] });
  glow(part(new THREE.SphereGeometry(0.05, 6, 4), P.warnRed, [ax, atop + 0.97, az]), 2);

  // Rivets along ribs
  ribZ.forEach((z, i) => {
    if (i % 2) return;
    for (const s of [1, -1]) box(0.05, 0.05, 0.05, P.metal, [s * (RAD * 0.87 + 0.1), CY - 0.35 + R() * 0.7, z]);
  });
}
    return buildCargoPod;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "convoyHauler" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1,0], dir: [0,0,1], role: "spine" });
  J["cab"] = b.joint("cab", { parent: J["body"], at: [0,1.2,3.3], dir: [0,0,1], role: "hinge", group: "cab" });
  J["pod"] = b.joint("pod", { parent: J["body"], at: [0,1.25,-1.4], dir: [0,0,-1], role: "hinge", group: "pod" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.3,0.6,3], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.3,0.6,3], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelML"] = b.joint("wheelML", { parent: J["body"], at: [1.3,0.6,-1.6], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelMR"] = b.joint("wheelMR", { parent: J["body"], at: [-1.3,0.6,-1.6], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelBL"] = b.joint("wheelBL", { parent: J["body"], at: [1.3,0.6,-3.4], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelBR"] = b.joint("wheelBR", { parent: J["body"], at: [-1.3,0.6,-3.4], dir: [-1,0,0], role: "hinge", group: "wheels" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
