import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Baba Yaga's Hut on Chicken Legs",
  "description": "A Slavic folk-art diorama of Baba Yaga's hut: a carved log cabin standing on two scaly golden chicken legs, with a steep teal-shingled roof, a rooster-head ridge finial, glowing carved windows and a wooden staircase descending from the door."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  log: "#7d5233",
  logEnd: "#b08a55",
  plank: "#8c5f36",
  shingle: "#3f6b5f",
  shingleDark: "#2e4a42",
  folk: "#c93a2e",
  folkGold: "#e2b13c",
  folkGreen: "#2f6d3f",
  cream: "#e8e3d0",
  glow: "#ffd977",
  ink: "#3a2a1c",
  scale: "#d9a13c",
  scaleDark: "#a66b1e",
  foot: "#c98a2a",
  moss: "#4f7a3a",
  smoke: "#d8dedd",
};
const M = {
  hutFloor: [0, 1.4, 0] as [number, number, number],
  eaves: [0, 2.75, 0] as [number, number, number],
  threshold: [0, 1.56, 1.08] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // legs
  (() => {
function buildLegs({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const sides: [number, string, string, string, string][] = [
    [1, "legL", "kneeL", "ankleL", "footL"],
    [-1, "legR", "kneeR", "ankleR", "footR"],
  ];
  const ring = (y: number, x: number, z: number, r: number, h: number, col: string, bone: any) =>
    b.part(new THREE.CylinderGeometry(r, r, h, 8), col, { bone, at: [x, y, z] });

  for (const [s, hn, kn, an, fn] of sides) {
    const hip = J[hn], knee = J[kn], ankle = J[an], foot = J[fn];
    const x0 = 0.55 * s, x1 = 0.68 * s, x2 = 0.64 * s;
    // upper shank
    b.sweep([[x0, 1.5, 0.05], [x1, 0.8, 0.1]], [0.13, 0.11], { bone: hip, color: P.scale, caps: "round" });
    // lower shank
    b.sweep([[x1, 0.8, 0.1], [x2, 0.3, 0.18]], [0.09, 0.075], { bone: knee, color: P.scale, caps: "round" });
    // scale bands
    for (let i = 0; i < 4; i++) {
      const t = i / 4;
      ring(1.4 - t * 0.5, x0 + (x1 - x0) * t, 0.05 + 0.05 * t, 0.14 - t * 0.02, 0.05, i % 2 ? P.scaleDark : P.scale, hip);
    }
    for (let i = 0; i < 3; i++) {
      const t = i / 3;
      ring(0.7 - t * 0.35, x1 + (x2 - x1) * t, 0.1 + 0.08 * t, 0.1 - t * 0.015, 0.045, i % 2 ? P.scale : P.scaleDark, knee);
    }
    // knee bulge
    b.part(new THREE.SphereGeometry(0.15, 8, 6), P.scaleDark, { bone: knee, at: [x1, 0.8, 0.1] });
    b.part(new THREE.TorusGeometry(0.14, 0.012, 4, 10), P.ink, { bone: knee, at: [x1, 0.8, 0.1], rotation: [90, 0, 0] });
    // spur
    b.part(new THREE.ConeGeometry(0.04, 0.18, 6), P.cream, { bone: knee, at: [x1, 0.8, -0.1], rotation: [-100, 0, 0] });
    // ankle bulge
    b.part(new THREE.SphereGeometry(0.11, 8, 6), P.scaleDark, { bone: ankle, at: [x2, 0.3, 0.18] });
    b.part(new THREE.TorusGeometry(0.1, 0.01, 4, 10), P.ink, { bone: ankle, at: [x2, 0.3, 0.18], rotation: [90, 0, 0] });
    // foot pad
    b.part(new THREE.CylinderGeometry(0.16, 0.19, 0.12, 8), P.foot, { bone: foot, at: [x2, 0.06, 0.28] });
    // toes
    for (const a of [-0.35, 0, 0.35]) {
      const dx = Math.sin(a), dz = Math.cos(a);
      const sx = x2 + dx * 0.1, sz = 0.3 + dz * 0.1;
      const ex = x2 + dx * 0.5, ez = 0.3 + dz * 0.5;
      b.sweep([[sx, 0.06, sz], [ex, 0.05, ez]], [0.06, 0.04], { bone: foot, color: P.scale, caps: "round" });
      b.sweep([[sx, 0.03, sz], [ex, 0.025, ez]], [0.05, 0.03], { bone: foot, color: P.foot, caps: "none" });
      b.part(new THREE.ConeGeometry(0.04, 0.14, 6), P.cream, {
        bone: foot, at: [x2 + dx * 0.56, 0.05, 0.3 + dz * 0.56], dir: [dx, -0.05, dz],
      });
    }
    // dewclaw
    b.part(new THREE.ConeGeometry(0.03, 0.12, 6), P.cream, { bone: foot, at: [x2, 0.06, 0.06], dir: [0, 0.1, -1] });
    // moss tufts
    for (let i = 0; i < 5; i++) {
      const a = R() * Math.PI * 2, d = 0.22 + R() * 0.15;
      const r = 0.06 + R() * 0.05;
      b.part(new THREE.SphereGeometry(r, 6, 4), P.moss, {
        bone: foot, at: [x2 + Math.cos(a) * d * 1.1, r * 0.3, 0.25 + Math.sin(a) * d * 0.8],
      });
    }
    // mushroom
    const mx = x2 + s * 0.35, mz = 0.2 + (s > 0 ? 0.05 : -0.05);
    b.part(new THREE.CylinderGeometry(0.02, 0.025, 0.12, 6), P.plank, { bone: foot, at: [mx, 0.06, mz] });
    b.part(new THREE.SphereGeometry(0.06, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), P.folk, { bone: foot, at: [mx, 0.11, mz] });
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1;
      b.part(new THREE.SphereGeometry(0.01, 4, 3), P.cream, {
        bone: foot, at: [mx + Math.cos(a) * 0.03, 0.15 - 0.005 * i, mz + Math.sin(a) * 0.03],
      });
    }
  }
}
    return buildLegs;
  })(),
  // cabin
  (() => {
function buildCabin({ b, J, P, M }: any) {
  const bone = J.hut;
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot });
  const cyl = (r: number, len: number, c: string, at: number[], axis: "x" | "z", seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), c, {
      bone,
      at,
      rotation: axis === "x" ? [0, 0, 90] : [90, 0, 0],
    });

  // floor platform
  box(2.1, 0.16, 2.3, P.plank, [0, 1.48, 0]);
  box(2.12, 0.04, 2.32, P.logEnd, [0, 1.42, 0]);
  for (let i = -4; i <= 4; i++) box(0.012, 0.01, 2.3, P.ink, [i * 0.23, 1.565, 0]);

  // log courses
  const r = 0.085;
  for (let i = 0; i < 7; i++) {
    const y = 1.56 + r + i * 0.17;
    const alongX = i % 2 === 0;
    const off = i % 2 === 0 ? 0 : 0.0;
    for (const s of [1, -1]) {
      const p = s * 1.0;
      if (alongX) {
        cyl(r, 2.3, P.log, [0, y, p], "x");
        for (const e of [1, -1]) {
          cyl(r * 1.01, 0.02, P.logEnd, [e * 1.151, y, p], "x");
          cyl(r * 0.55, 0.026, P.ink, [e * 1.152, y, p], "x", 8);
          cyl(r * 0.4, 0.03, P.logEnd, [e * 1.153, y, p], "x", 8);
        }
      } else {
        cyl(r, 2.3, P.log, [p, y, off], "z");
        for (const e of [1, -1]) {
          cyl(r * 1.01, 0.02, P.logEnd, [p, y, e * 1.151], "z");
          cyl(r * 0.55, 0.026, P.ink, [p, y, e * 1.152], "z", 8);
          cyl(r * 0.4, 0.03, P.logEnd, [p, y, e * 1.153], "z", 8);
        }
      }
    }
  }
  // fill core so walls are solid
  box(1.9, 1.19, 1.9, P.log, [0, 2.155, 0]);

  // windows: side walls and back
  const win = (x: number, z: number, nx: number, nz: number) => {
    const y = 2.05;
    const side = nx !== 0;
    const sw = (w: number, h: number, d: number) => (side ? [d, h, w] : [w, h, d]);
    const pos = (u: number, yy: number, d: number) =>
      side ? [x + nx * d, yy, z + u] : [x + u, yy, z + nz * d];
    const B = (w: number, h: number, d: number, c: string, u: number, yy: number, dd: number) => {
      const s = sw(w, h, d);
      box(s[0], s[1], s[2], c, pos(u, yy, dd));
    };
    B(0.5, 0.5, 0.03, P.cream, 0, y, 0.015);
    B(0.38, 0.38, 0.03, P.glow, 0, y, 0.035);
    B(0.02, 0.38, 0.02, P.cream, 0, y, 0.05);
    B(0.38, 0.02, 0.02, P.cream, 0, y, 0.05);
    for (const s of [1, -1]) {
      B(0.12, 0.46, 0.03, P.folkGreen, s * 0.33, y, 0.03);
      B(0.05, 0.3, 0.012, P.folkGold, s * 0.33, y, 0.05);
    }
    B(0.1, 0.1, 0.03, P.folkGold, 0, y + 0.37, 0.025);
    B(0.04, 0.04, 0.035, P.folk, 0, y + 0.37, 0.03);
    B(0.62, 0.05, 0.04, P.folk, 0, y + 0.29, 0.03);
  };
  win(1.0, 0, 1, 0);
  win(-1.0, 0, -1, 0);
  win(0, -1.0, 0, -1);

  // trim board with zigzag, all four sides
  const ty = 2.68;
  for (const s of [1, -1]) {
    box(2.2, 0.12, 0.04, P.folk, [0, ty, s * 1.1]);
    box(0.04, 0.12, 2.2, P.folk, [s * 1.1, ty, 0]);
    for (let i = 0; i < 14; i++) {
      const u = -1.0 + i * 0.154;
      const up = i % 2 === 0;
      const yy = ty + (up ? 0.03 : -0.03);
      box(0.07, 0.035, 0.03, P.folkGold, [u, yy, s * 1.115], [0, 0, up ? 30 : -30]);
      box(0.03, 0.035, 0.07, P.folkGold, [s * 1.115, yy, u], [30 * (up ? 1 : -1), 0, 0]);
    }
  }
  // corner posts hint
  for (const sx of [1, -1])
    for (const sz of [1, -1]) box(0.06, 0.12, 0.06, P.folkGreen, [sx * 1.1, ty, sz * 1.1]);
}
    return buildCabin;
  })(),
  // front
  (() => {
function buildFront({ b, J, P, M }: any) {
  const bone = J.hut;
  const R = rng(5);
  // box helper: center, size, color
  const box = (c: number[], s: number[], col: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), col, { bone, at: c, rotation: rot });
  const cyl = (c: number[], r: number, h: number, col: string, seg = 8, rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), col, { bone, at: c, rotation: rot });
  const zigzag = (x0: number, x1: number, y: number, z: number, n: number, col: string, h = 0.04) => {
    for (let i = 0; i < n; i++) {
      const x = x0 + ((i + 0.5) * (x1 - x0)) / n;
      b.part(new THREE.ConeGeometry(h * 0.7, h * 1.2, 4), col, { bone, at: [x, y, z], rotation: [180 * (i % 2), 0, 0] });
    }
  };
  const rosette = (x: number, y: number, z: number, r: number, col: string, mid: string) => {
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      b.part(new THREE.SphereGeometry(r * 0.4, 6, 4), col, { bone, at: [x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6, z] });
    }
    b.part(new THREE.SphereGeometry(r * 0.35, 6, 4), mid, { bone, at: [x, y, z + 0.005] });
  };

  // ---- door
  const dz = 1.1;
  const doorY = 1.855;
  box([0, doorY, dz], [0.62, 0.59, 0.06], P.plank);
  for (let i = 1; i < 5; i++) box([-0.31 + i * 0.124, doorY, dz + 0.032], [0.008, 0.57, 0.008], P.ink);
  // architrave
  box([-0.36, 1.87, dz + 0.01], [0.08, 0.66, 0.08], P.folk);
  box([0.36, 1.87, dz + 0.01], [0.08, 0.66, 0.08], P.folk);
  box([0, 2.21, dz + 0.01], [0.8, 0.1, 0.08], P.folk);
  zigzag(-0.38, 0.38, 2.28, dz + 0.02, 8, P.folkGold, 0.04);
  for (const s of [1, -1]) {
    rosette(s * 0.36, 2.21, dz + 0.06, 0.05, P.cream, P.folkGold);
  }
  for (const y of [1.7, 2.05]) {
    box([-0.24, y, dz + 0.04], [0.14, 0.03, 0.015], P.folkGold);
    cyl([-0.31, y, dz + 0.04], 0.018, 0.02, P.folkGold, 6, [90, 0, 0]);
  }
  b.part(new THREE.TorusGeometry(0.04, 0.008, 5, 12), P.ink, { bone, at: [0.2, 1.84, dz + 0.05] });
  cyl([0.2, 1.88, dz + 0.04], 0.012, 0.02, P.ink, 6, [90, 0, 0]);

  // ---- windows
  for (const s of [1, -1]) {
    const x = s * 0.82;
    const y = 2.05;
    box([x, y, 1.12], [0.4, 0.4, 0.06], P.cream);
    glow(box([x, y, 1.15], [0.3, 0.3, 0.02], P.glow), 1.2);
    box([x, y, 1.165], [0.3, 0.02, 0.01], P.cream);
    box([x, y, 1.165], [0.02, 0.3, 0.01], P.cream);
    // nalichniki
    box([x - 0.25, y, 1.13], [0.07, 0.46, 0.04], P.folk);
    box([x + 0.25, y, 1.13], [0.07, 0.46, 0.04], P.folk);
    box([x, y + 0.26, 1.13], [0.6, 0.08, 0.04], P.folk);
    zigzag(x - 0.28, x + 0.28, y + 0.33, 1.14, 7, P.folk, 0.045);
    box([x, y - 0.24, 1.13], [0.5, 0.05, 0.04], P.folk);
    rosette(x, y + 0.26, 1.16, 0.035, P.folkGold, P.cream);
    // shutters swung open ±25°
    for (const t of [1, -1]) {
      const hx = x + t * 0.3;
      const g = b.part(new THREE.BoxGeometry(0.16, 0.38, 0.025), P.folkGreen, {
        bone,
        at: [hx + t * 0.07, y, 1.2],
        rotation: [0, -t * 25 * s, 0],
      });
      b.part(new THREE.BoxGeometry(0.08, 0.04, 0.01), P.folkGold, { bone, at: [hx + t * 0.07, y + 0.08, 1.21], rotation: [0, -t * 25 * s, 0] });
    }
  }

  // ---- lantern
  const lx = 0.62;
  box([lx, 2.2, 1.17], [0.03, 0.03, 0.14], P.ink);
  cyl([lx, 2.1, 1.22], 0.006, 0.18, P.ink, 5);
  b.part(new THREE.ConeGeometry(0.06, 0.05, 6), P.folkGold, { bone, at: [lx, 2.0, 1.22] });
  glow(box([lx, 1.93, 1.22], [0.07, 0.1, 0.07], P.glow), 1.5);
  for (const dx of [-1, 1]) for (const dzz of [-1, 1]) box([lx + dx * 0.04, 1.93, 1.22 + dzz * 0.04], [0.012, 0.11, 0.012], P.folk);
  box([lx, 1.87, 1.22], [0.09, 0.02, 0.09], P.folkGold);

  // ---- landing
  box([0, 1.53, 1.3], [0.9, 0.06, 0.45], P.plank);
  box([0, 1.5, 1.3], [0.92, 0.01, 0.47], P.ink);

  // ---- stairs: 5 treads from (y1.5,z1.52) to (0.62,z1.8)
  const n = 5;
  for (let i = 0; i < n; i++) {
    const z = 1.6 + i * 0.07;
    const y = 1.2 - i * 0.14;
    box([0, y, z], [0.7, 0.04, 0.12], P.plank);
    box([0, y - 0.0, z + 0.061], [0.7, 0.03, 0.005], P.ink);
    box([0, y - 0.1, z - 0.03], [0.66, 0.1, 0.02], P.plank);
  }
  for (const s of [1, -1]) {
    // stringers
    b.rod([s * 0.37, 1.5, 1.5], [s * 0.37, 0.6, 1.95], 0.03, P.plank, { bone });
    b.rod([s * 0.4, 1.58, 1.5], [s * 0.4, 0.68, 1.95], 0.015, P.folk, { bone });
    // posts
    const pz = 1.9;
    cyl([s * 0.4, 0.4, pz], 0.035, 0.8, P.plank, 6);
    b.part(new THREE.SphereGeometry(0.045, 6, 4), P.folkGold, { bone, at: [s * 0.4, 0.82, pz] });
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5;
      b.part(new THREE.SphereGeometry(0.05, 6, 4), P.moss, {
        bone,
        at: [s * 0.4 + Math.cos(a) * 0.06, 0.02, pz + Math.sin(a) * 0.06],
        scale: [1, 0.6, 1],
      });
    }
    // railing
    b.rod([s * 0.4, 1.0, 1.6], [s * 0.4, 0.82, pz], 0.012, P.folk, { bone });
  }
  void R;
  void frame;
  void M;
}
    return buildFront;
  })(),
  // roof
  (() => {
function buildRoof({ b, J, P, M }: Ctx) {
  const bone = J.hut;
  const R = rng(5);
  const put = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { bone, at, ...o });
  const box = (w: number, h: number, d: number, c: string, at: number[], rot?: number[]) =>
    put(new THREE.BoxGeometry(w, h, d), c, at, rot ? { rotation: rot } : {});

  // slope geometry: eaves (x=1.45,y=2.7) to ridge (0,3.8)
  const run = 1.45, rise = 1.1;
  const len = Math.hypot(run, rise);
  const ang = Math.atan2(rise, run) * 180 / Math.PI;
  for (const s of [1, -1]) {
    const ux = -s * run / len, uy = rise / len; // up-slope direction
    const pt = (t: number, off = 0) => [s * run + ux * t * len + uy * off * -1 * -1 * 0 + (-uy * s) * off * 0, 2.7 + uy * t * len, 0];
    // base slab
    const mid = [s * run * 0.5, 3.25, 0];
    const rz = -s * ang;
    box(len, 0.05, 3.0, P.shingleDark, [mid[0], mid[1] - 0.02, 0], [0, 0, rz]);
    // shingle rows
    const rows = 9;
    for (let i = 0; i < rows; i++) {
      const t = (i + 0.5) / rows;
      const cx = s * run * (1 - t);
      const cy = 2.7 + rise * t + 0.04;
      const rl = len / rows;
      const nx = uy * s, ny = ux * -s * -1; // normal-ish
      for (let k = 0; k < 10; k++) {
        const z = -1.4 + k * 0.31 + (i % 2) * 0.15;
        if (z > 1.45) continue;
        box(rl * 0.95, 0.04, 0.29, (k + i) % 5 === 0 ? P.shingleDark : P.shingle,
          [cx + nx * 0.02, cy + 0.02, z], [0, 0, rz]);
      }
    }
    // eaves trim
    box(0.1, 0.12, 3.04, P.folkGreen, [s * (run + 0.02), 2.68, 0]);
    // rafters
    for (let k = 0; k < 7; k++) {
      const z = -1.35 + k * 0.45;
      box(len * 0.98, 0.08, 0.08, P.plank, [mid[0], mid[1] - 0.09, z], [0, 0, rz]);
    }
    // zigzag on gable edges
    for (const f of [1, -1]) {
      for (let k = 0; k < 8; k++) {
        const t = (k + 0.5) / 8;
        box(0.09, 0.07, 0.04, k % 2 ? P.folk : P.folkGold,
          [s * run * (1 - t) * 0.97, 2.78 + rise * t + (k % 2) * 0.04, f * 1.53], [0, 0, rz]);
      }
    }
  }

  // ridge pole
  put(new THREE.CylinderGeometry(0.1, 0.1, 3.0, 8), P.log, [0, 3.82, 0], { rotation: [90, 0, 0] });
  for (const f of [1, -1])
    put(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 8), P.logEnd, [0, 3.82, f * 1.51], { rotation: [90, 0, 0] });

  // gable boards with sun
  for (const f of [1, -1]) {
    const z = f * 1.2;
    const shape = [[-1.1, 2.72], [1.1, 2.72], [0, 3.72]];
    const sh = new THREE.Shape(shape.map((p) => new THREE.Vector2(p[0], p[1])));
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.06, bevelEnabled: false });
    put(g, P.cream, [0, 0, z - 0.03]);
    put(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 12), P.folkGold, [0, 3.1, z + f * 0.04], { rotation: [90, 0, 0] });
    put(new THREE.CylinderGeometry(0.1, 0.1, 0.035, 10), P.folk, [0, 3.1, z + f * 0.05], { rotation: [90, 0, 0] });
    for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4;
      box(0.06, 0.2, 0.03, P.folkGold, [Math.cos(a) * 0.3, 3.1 + Math.sin(a) * 0.3, z + f * 0.04],
        [0, 0, a * 180 / Math.PI - 90]);
    }
  }

  // rooster finial (front)
  const fz = 1.5;
  put(new THREE.SphereGeometry(0.17, 8, 6), P.plank, [0, 4.0 - 0.02, fz - 0.02]);
  box(0.2, 0.3, 0.2, P.plank, [0, 3.9, fz - 0.05]);
  put(new THREE.ConeGeometry(0.06, 0.2, 6), P.cream, [0, 4.0 - 0.0, fz + 0.2], { rotation: [90, 0, 0] });
  for (let k = 0; k < 3; k++)
    put(new THREE.ConeGeometry(0.05, 0.12, 5), P.folk, [0, 4.17 + (k === 1 ? 0.03 : 0), fz - 0.08 + k * 0.07]);
  put(new THREE.SphereGeometry(0.035, 6, 4), P.ink, [0.16, 4.03, fz + 0.03]);
  put(new THREE.SphereGeometry(0.035, 6, 4), P.ink, [-0.16, 4.03, fz + 0.03]);
  put(new THREE.SphereGeometry(0.05, 6, 4), P.folk, [0, 3.85, fz + 0.15]);

  // horse finial (back)
  const bz = -1.5;
  box(0.16, 0.4, 0.2, P.plank, [0, 4.02, bz + 0.02], [-15, 0, 0]);
  box(0.15, 0.15, 0.3, P.plank, [0, 4.2, bz - 0.12]);
  box(0.04, 0.35, 0.1, P.cream, [0, 4.0, bz + 0.12], [-15, 0, 0]);
  put(new THREE.ConeGeometry(0.04, 0.1, 5), P.plank, [0.05, 4.33, bz - 0.0]);
  put(new THREE.ConeGeometry(0.04, 0.1, 5), P.plank, [-0.05, 4.33, bz - 0.0]);

  // chimney
  const cx = 0.55, cz = -0.7;
  box(0.34, 0.6, 0.34, P.plank, [cx, 3.5, cz]);
  for (const dy of [3.3, 3.5, 3.7]) box(0.355, 0.02, 0.355, P.ink, [cx, dy, cz]);
  box(0.4, 0.08, 0.4, P.folkGreen, [cx, 3.78, cz]);
  const pr = [0.11, 0.09, 0.07];
  pr.forEach((r, i) =>
    put(new THREE.IcosahedronGeometry(r, 0), P.smoke, [cx + 0.03 * i + R() * 0.02, 3.88 + i * 0.07, cz]));
}
    return buildRoof;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "yagaHut" });
  const J: Record<string, Joint> = {};
  J["hut"] = b.joint("hut", { at: [0,1.4,0], dir: [0,1,0], role: "spine" });
  J["legL"] = b.joint("legL", { parent: J["hut"], at: [0.55,1.45,0.05], dir: [0,-1,0], role: "leg", group: "legs" });
  J["kneeL"] = b.joint("kneeL", { parent: J["legL"], at: [0.68,0.8,0.1], dir: [0,-1,0], role: "leg", group: "legs" });
  J["ankleL"] = b.joint("ankleL", { parent: J["kneeL"], at: [0.64,0.3,0.18], dir: [0,-0.5,0.8], role: "leg", group: "legs" });
  J["footL"] = b.joint("footL", { parent: J["ankleL"], at: [0.64,0.12,0.3], dir: [0,-0.15,0.95], role: "leg", group: "legs" });
  J["legR"] = b.joint("legR", { parent: J["hut"], at: [-0.55,1.45,0.05], dir: [0,-1,0], role: "leg", group: "legs" });
  J["kneeR"] = b.joint("kneeR", { parent: J["legR"], at: [-0.68,0.8,0.1], dir: [0,-1,0], role: "leg", group: "legs" });
  J["ankleR"] = b.joint("ankleR", { parent: J["kneeR"], at: [-0.64,0.3,0.18], dir: [0,-0.5,0.8], role: "leg", group: "legs" });
  J["footR"] = b.joint("footR", { parent: J["ankleR"], at: [-0.64,0.12,0.3], dir: [0,-0.15,0.95], role: "leg", group: "legs" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
