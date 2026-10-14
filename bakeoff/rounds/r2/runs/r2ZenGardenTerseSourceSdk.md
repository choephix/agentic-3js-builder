```ts
import * as THREE from "three";
import { createBuilder, rng, paint, mottle } from "agentic-3js-builder";

export const meta = {
  name: "Japanese Garden",
  description:
    "A walled 8x8 m stroll garden: raked gravel with rocks, a koi pond crossed by a red arched bridge, stepping stones, a stone lantern, a tsukubai basin, a cloud-pruned pine, a maple, bamboo and a bamboo fence.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "japanese_garden" });
  b.joint("root", { at: [0, 0, 0] });
  const rand = rng(11);
  const G = 0.26; // moss ground level

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const ico = (r: number, d = 1) => new THREE.IcosahedronGeometry(r, d);
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  type Opt = { rot?: [number, number, number]; scale?: number | [number, number, number]; flat?: boolean };
  const P = (g: THREE.BufferGeometry, color: any, at: number[], o: Opt = {}) =>
    b.part(g, color, { at, rotation: o.rot, scale: o.scale, flat: o.flat });

  // ---------- palette ----------
  const STONE = mottle("#8a877e", "#a29e92", { size: 0.3, seed: 4 });
  const MOSS = mottle("#4f7a34", "#6d9a3f", { size: 0.15, seed: 5 });
  const rockPaint = paint((p, n) => (n.y > 0.6 ? MOSS : STONE));
  const GREY = "#8d8a82";
  const DGREY = "#5d5b56";
  const WOOD = "#7a4a2b";
  const DWOOD = "#4b2f1d";
  const RED = "#b3281e";
  const GOLD = "#d9a93a";
  const AMBER = "#ffcf6b";

  // ---------- ground ----------
  P(box(8, 0.2, 8), "#5b4632", [0, 0.1, 0]);
  P(box(8, 0.06, 8), mottle("#3f6e2e", "#6c9b3e", { size: 0.6, seed: 2 }), [0, 0.23, 0]);

  // ---------- gravel garden ----------
  const gx0 = -3.8, gx1 = -0.6, gz0 = 0.4, gz1 = 3.8;
  const gcx = (gx0 + gx1) / 2, gcz = (gz0 + gz1) / 2;
  P(box(gx1 - gx0, 0.04, gz1 - gz0), "#d9d4c4", [gcx, 0.28, gcz]);
  const edge = (w: number, d: number, x: number, z: number) => P(box(w, 0.08, d), DGREY, [x, 0.3, z]);
  edge(gx1 - gx0 + 0.08, 0.08, gcx, gz0);
  edge(gx1 - gx0 + 0.08, 0.08, gcx, gz1);
  edge(0.08, gz1 - gz0, gx0, gcz);
  edge(0.08, gz1 - gz0, gx1, gcz);

  const rocks: Array<[number, number, number, number, number]> = [
    [-2.6, 2.1, 0.5, 0.36, 0.42],
    [-2.0, 1.75, 0.3, 0.22, 0.3],
    [-3.0, 2.6, 0.32, 0.25, 0.28],
  ];
  const cx = -2.6, cz = 2.15, R = 1.15;
  for (let x = gx0 + 0.18; x < gx1 - 0.1; x += 0.14) {
    const dx = Math.abs(x - cx);
    if (dx < R) {
      const half = Math.sqrt(R * R - dx * dx);
      const a = cz - half, c = cz + half;
      P(box(0.04, 0.025, a - gz0 - 0.15), "#ece8da", [x, 0.31, (gz0 + 0.1 + a) / 2]);
      P(box(0.04, 0.025, gz1 - 0.1 - c), "#ece8da", [x, 0.31, (c + gz1 - 0.1) / 2]);
    } else P(box(0.04, 0.025, gz1 - gz0 - 0.2), "#ece8da", [x, 0.31, gcz]);
  }
  for (const r of [0.85, 1.0]) {
    P(new THREE.TorusGeometry(r, 0.02, 4, 28), "#ece8da", [cx, 0.31, cz], { rot: [90, 0, 0] });
  }
  rocks.forEach(([x, z, sx, sy, sz], i) => {
    P(ico(1, 1), rockPaint, [x, 0.3 + sy * 0.6, z], { scale: [sx, sy, sz], rot: [0, i * 70, 0], flat: true });
  });

  // ---------- pond ----------
  P(cyl(1, 1, 0.03, 18), "#3b3a33", [1.5, 0.275, -1.2], { scale: [1.75, 1, 1.25] });
  P(cyl(1, 1, 0.04, 18), "#2f6f78", [1.5, 0.28, -1.2], { scale: [1.6, 1, 1.1] });
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    const x = 1.5 + Math.cos(a) * 1.72;
    const z = -1.2 + Math.sin(a) * 1.22;
    if (Math.abs(x - 1.5) < 0.75) continue;
    const r = 0.16 + rand() * 0.14;
    P(ico(1, 1), rockPaint, [x, G + r * 0.45, z], {
      scale: [r * 1.3, r * 0.8, r],
      rot: [0, rand() * 180, 0],
      flat: true,
    });
  }
  const koi = (x: number, z: number, ang: number, col: string, spot: string) => {
    const s = Math.sin((ang * Math.PI) / 180), c = Math.cos((ang * Math.PI) / 180);
    P(sph(1), col, [x, 0.305, z], { scale: [0.07, 0.045, 0.2], rot: [0, ang, 0] });
    P(sph(1), spot, [x + s * 0.03, 0.335, z + c * 0.03], { scale: [0.04, 0.02, 0.08], rot: [0, ang, 0] });
    P(sph(1), col, [x - s * 0.24, 0.303, z - c * 0.24], { scale: [0.07, 0.012, 0.07], rot: [0, ang, 0] });
  };
  koi(1.0, -1.0, 30, "#e8742a", "#f4f0e6");
  koi(2.0, -1.6, 200, "#f4f0e6", "#e8742a");
  koi(1.7, -0.6, 110, "#e8742a", "#2a2a2e");
  const pads: Array<[number, number]> = [[2.6, -0.8], [2.8, -1.1], [0.5, -1.7], [0.3, -1.4], [2.3, -2.0]];
  pads.forEach(([x, z]) => P(cyl(0.14, 0.14, 0.012, 9), "#4e8a3c", [x, 0.305, z]));
  P(cyl(0.01, 0.05, 0.07, 6), "#f0a5b8", [2.8, 0.34, -1.1]);
  P(cyl(0.01, 0.05, 0.07, 6), "#f0a5b8", [0.3, 0.34, -1.4]);

  // ---------- red arched bridge ----------
  const bz = -1.2, half = 1.3, bx = 1.5;
  const by = (u: number) => 0.36 + 0.38 * (1 - u * u);
  const N = 9;
  for (let i = 0; i < N; i++) {
    const u = -1 + ((i + 0.5) * 2) / N;
    const slope = -0.585 * u;
    const ang = (-Math.atan(slope) * 180) / Math.PI;
    const len = ((2 * half) / N) * 1.06 * Math.sqrt(1 + slope * slope);
    P(box(1.0, 0.05, len), WOOD, [bx, by(u) - 0.025, bz + u * half], { rot: [ang, 0, 0] });
  }
  for (const sx of [-1, 1]) {
    const X = bx + sx * 0.5;
    const rail = (dy: number, r: number) =>
      b.sweep(
        Array.from({ length: 9 }, (_, k) => {
          const u = -1 + k / 4;
          return [X, by(u) + dy, bz + u * half];
        }),
        r,
        { color: RED, sides: 6 },
      );
    rail(0.33, 0.028);
    rail(0.16, 0.02);
    b.sweep(
      Array.from({ length: 9 }, (_, k) => {
        const u = -1 + k / 4;
        return [bx + sx * 0.44, by(u) - 0.08, bz + u * half];
      }),
      0.045,
      { color: DWOOD, sides: 4 },
    );
    for (let k = 0; k <= 8; k += 2) {
      const u = -1 + k / 4;
      P(cyl(0.035, 0.035, 0.46, 6), RED, [X, by(u) + 0.15, bz + u * half]);
      P(sph(0.05, 6, 5), GOLD, [X, by(u) + 0.4, bz + u * half]);
    }
  }
  for (const z of [bz - half - 0.15, bz + half + 0.15]) P(box(1.1, 0.1, 0.36), GREY, [bx, 0.31, z]);

  // ---------- stepping stones ----------
  const steps: Array<[number, number]> = [[0.8, 3.6], [1.4, 3.0], [0.9, 2.4], [1.5, 1.8], [1.2, 1.15], [1.5, 0.55]];
  const stoneCols = ["#8d8a82", "#77746d", "#a09c92"];
  steps.forEach(([x, z], i) => {
    P(cyl(0.22, 0.27, 0.08, 9), stoneCols[i % 3], [x, G + 0.03, z], {
      scale: [1 + rand() * 0.3, 1, 0.9 + rand() * 0.3],
      rot: [0, rand() * 90, 0],
    });
  });

  // ---------- stone lantern ----------
  {
    const [lx, lz] = [3.2, 0.5];
    const y0 = G;
    P(cyl(0.22, 0.26, 0.08, 6), GREY, [lx, y0 + 0.04, lz]);
    P(cyl(0.08, 0.1, 0.5, 6), GREY, [lx, y0 + 0.33, lz]);
    P(cyl(0.14, 0.1, 0.07, 6), DGREY, [lx, y0 + 0.62, lz]);
    P(cyl(0.26, 0.2, 0.07, 6), GREY, [lx, y0 + 0.68, lz]);
    P(box(0.26, 0.26, 0.26), GREY, [lx, y0 + 0.84, lz]);
    P(box(0.13, 0.13, 0.29), AMBER, [lx, y0 + 0.84, lz]);
    P(box(0.29, 0.13, 0.13), AMBER, [lx, y0 + 0.84, lz]);
    P(cyl(0.04, 0.44, 0.2, 6), DGREY, [lx, y0 + 1.07, lz]);
    P(cyl(0.05, 0.08, 0.06, 6), GREY, [lx, y0 + 1.2, lz]);
    P(ico(0.07, 1), GREY, [lx, y0 + 1.27, lz]);
  }

  // ---------- tsukubai ----------
  {
    const [tx, tz] = [2.6, 2.3];
    P(cyl(0.28, 0.32, 0.35, 8), GREY, [tx, G + 0.17, tz]);
    P(cyl(0.2, 0.2, 0.01, 8), "#2f6f78", [tx, G + 0.355, tz]);
    P(cyl(0.025, 0.025, 0.5, 6), "#6f8f3a", [tx - 0.25, G + 0.5, tz - 0.25]);
    b.sweep([[tx - 0.25, G + 0.76, tz - 0.25], [tx - 0.12, G + 0.76, tz - 0.12], [tx - 0.05, G + 0.55, tz - 0.05]], 0.03, {
      color: "#6f8f3a",
      sides: 6,
    });
    b.rod([tx + 0.05, G + 0.37, tz + 0.1], [tx + 0.3, G + 0.4, tz + 0.2], 0.018, { color: WOOD, sides: 6 });
    P(cyl(0.05, 0.05, 0.03, 8), WOOD, [tx + 0.04, G + 0.38, tz + 0.09]);
  }

  // ---------- cloud-pruned pine ----------
  {
    const [px, pz] = [-2.9, -2.3];
    const T = (x: number, y: number, z: number) => [px + x, y, pz + z];
    b.sweep([T(0, G, 0), T(0.1, 0.7, 0.05), T(-0.15, 1.2, 0.1), T(-0.05, 1.7, -0.05), T(0.2, 2.1, 0)], [0.17, 0.12, 0.09, 0.06, 0.03], {
      color: "#5a3b26",
      sides: 7,
    });
    b.sweep([T(-0.1, 1.0, 0.1), T(-0.6, 1.2, 0.3), T(-1.2, 1.35, 0.4)], [0.06, 0.03], { color: "#5a3b26", sides: 6 });
    b.sweep([T(0.1, 1.5, 0), T(0.6, 1.65, -0.1), T(1.1, 1.8, -0.3)], [0.05, 0.025], { color: "#5a3b26", sides: 6 });
    const pine = mottle("#2f5d34", "#4a7d45", { size: 0.3, seed: 8 });
    const pads: Array<[number, number, number, number]> = [
      [-1.2, 1.45, 0.4, 0.75],
      [1.1, 1.9, -0.3, 0.7],
      [0.2, 2.35, 0.05, 0.6],
      [-0.5, 1.9, -0.3, 0.5],
      [0.5, 1.2, 0.5, 0.45],
    ];
    pads.forEach(([x, y, z, s]) => P(sph(1, 9, 5), pine, T(x, y, z), { scale: [s, s * 0.28, s * 0.85], flat: true }));
    P(ico(0.22, 1), rockPaint, T(0.35, 0.3, 0.3), { scale: [1.3, 0.8, 1], flat: true });
  }

  // ---------- maple ----------
  {
    const [mx, mz] = [3.3, -3.0];
    const T = (x: number, y: number, z: number) => [mx + x, y, mz + z];
    b.sweep([T(0, G, 0), T(0.05, 0.8, 0), T(-0.1, 1.3, 0.05)], [0.1, 0.07, 0.04], { color: "#4a3a30", sides: 6 });
    b.sweep([T(-0.05, 1.2, 0), T(0.25, 1.5, 0.1), T(0.5, 1.7, 0.2)], [0.04, 0.02], { color: "#4a3a30", sides: 5 });
    b.sweep([T(-0.1, 1.3, 0), T(-0.35, 1.55, 0), T(-0.6, 1.8, -0.1)], [0.04, 0.02], { color: "#4a3a30", sides: 5 });
    const leaf = mottle(mottle("#c4301f", "#e8631e", { size: 0.3, seed: 6 }), "#a01f24", { size: 0.5, seed: 3 });
    const blobs: Array<[number, number, number, number]> = [
      [0.5, 1.8, 0.2, 0.6],
      [-0.6, 1.9, -0.1, 0.6],
      [0, 2.25, 0, 0.55],
      [0.1, 1.75, 0.5, 0.45],
      [-0.2, 1.8, -0.5, 0.45],
    ];
    blobs.forEach(([x, y, z, r]) => P(ico(r, 1), leaf, T(x, y, z), { scale: [1, 0.75, 1], flat: true }));
    for (let i = 0; i < 14; i++) {
      const a = rand() * Math.PI * 2, d = 0.3 + rand() * 1.3;
      P(cyl(0.04, 0.04, 0.004, 5), i % 2 ? "#c4301f" : "#e8631e", [mx + Math.cos(a) * d - 0.3, G + 0.003, mz + Math.sin(a) * d + 0.5], {
        rot: [0, rand() * 90, 0],
      });
    }
  }

  // ---------- bamboo clump ----------
  {
    const [bx0, bz0] = [-3.5, -3.3];
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + rand();
      const o = 0.12 + rand() * 0.3;
      const x = bx0 + Math.cos(a) * o, z = bz0 + Math.sin(a) * o;
      const h = 2.6 + rand();
      const lx = Math.cos(a) * 0.25, lz = Math.sin(a) * 0.25;
      b.sweep([[x, G, z], [x + lx * 0.4, h * 0.5, z + lz * 0.4], [x + lx, h, z + lz]], [0.035, 0.03, 0.015], {
        color: "#6a9a3a",
        sides: 6,
      });
      for (let k = 1; k < 8; k++) {
        const t = k * 0.12;
        const yy = G + (h - G) * t;
        const bend = t < 0.5 ? 0.4 * t * 2 * 0.5 : 0.4 + (t - 0.5) * 1.2 * 0.5;
        P(cyl(0.042, 0.042, 0.025, 6), "#d2d58a", [x + lx * t * 0.9, yy, z + lz * t * 0.9]);
        void bend;
      }
      for (let k = 0; k < 3; k++) {
        const la = rand() * Math.PI * 2;
        P(sph(1, 6, 4), "#8cc04a", [x + lx + Math.cos(la) * 0.25, h - 0.1 - k * 0.2, z + lz + Math.sin(la) * 0.25], {
          scale: [0.28, 0.03, 0.08],
          rot: [0, -(la * 180) / Math.PI, -15],
        });
      }
    }
  }

  // ---------- bamboo fence ----------
  {
    const fz = -3.85;
    for (let x = -3.9; x <= 3.95; x += 0.13) P(cyl(0.022, 0.022, 1.1, 5), "#b9a05a", [x, G + 0.55, fz]);
    for (const y of [0.45, 0.95]) P(cyl(0.03, 0.03, 8, 6), "#8a7336", [0, y, fz + 0.06], { rot: [0, 0, 90] });
    P(cyl(0.04, 0.04, 8, 6), "#8a7336", [0, 1.42, fz], { rot: [0, 0, 90] });
    for (let x = -3.9; x <= 3.95; x += 1.0) P(cyl(0.045, 0.045, 1.2, 6), "#8a7336", [x, 0.7, fz + 0.1]);
  }

  // ---------- clipped azalea mounds ----------
  const mounds: Array<[number, number, number]> = [[-3.5, -0.2, 0.55], [-2.3, -0.9, 0.5], [-0.8, -2.2, 0.45], [3.5, 2.0, 0.45]];
  mounds.forEach(([x, z, r]) => {
    P(ico(1, 1), "#2f6b3a", [x, G + r * 0.25, z], { scale: [r, r * 0.6, r * 0.9], flat: true });
    for (let i = 0; i < 9; i++) {
      const a = rand() * Math.PI * 2, e = 0.3 + rand() * 0.9;
      P(ico(0.05, 0), "#f08fb0", [
        x + Math.cos(a) * Math.cos(e) * r * 0.9,
        G + r * 0.25 + Math.sin(e) * r * 0.6,
        z + Math.sin(a) * Math.cos(e) * r * 0.8,
      ]);
    }
  });

  return b.root;
}
```