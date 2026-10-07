```ts
import * as THREE from "three";
import { createBuilder, catmull, rng } from "agentic-3js-builder";
import { mottle } from "agentic-3js-builder";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  name: "Japanese garden diorama",
  description:
    "Square diorama: red arched bridge over a koi pond with three koi, stone lantern, cloud pine, blossoming cherry with falling petals, raked gravel, mossy rocks and stepping stones.",
};

export default function build() {
  const b = createBuilder({ name: "garden" });
  const root = b.joint("base", { at: [0, 0, 0] });
  const R = rng(11);
  const G = 0.09; // ground top

  const P = (g: THREE.BufferGeometry, c: any, o: any = {}) => b.part(g, c, { bone: root, flat: true, ...o });
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);

  // ---- base and ground ----
  P(box(1.0, 0.05, 1.0), "#5a3a22", { at: [0, 0.025, 0] });
  P(box(1.02, 0.012, 1.02), "#3e2615", { at: [0, 0.006, 0] });
  P(box(0.96, 0.04, 0.96), mottle("#6f9d4c", "#5b8a40", { size: 0.09, seed: 3 }), { at: [0, 0.07, 0] });

  // ---- pond ----
  const PC = [0.05, -0.05], PRX = 0.3, PRZ = 0.2;
  P(cyl(1, 1, 0.012, 24), "#4aa3b8", { at: [PC[0], G + 0.006, PC[1]], scale: [PRX, 1, PRZ] });
  const rimCols = ["#8d8d88", "#7b7b78", "#a0a09a"];
  const N = 24;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const r = 0.025 + R() * 0.02;
    P(new THREE.IcosahedronGeometry(r, 0), rimCols[i % 3], {
      at: [PC[0] + Math.cos(a) * (PRX + 0.01), G + 0.008, PC[1] + Math.sin(a) * (PRZ + 0.01)],
      scale: [1.2, 0.6, 1],
      rotation: [0, R() * 180, 0],
    });
  }
  // lily pads
  for (const [x, z] of [[-0.12, 0.03], [0.2, -0.14]]) {
    P(cyl(0.028, 0.028, 0.003, 9), "#3f8a43", { at: [x, G + 0.0135, z] });
    P(sph(0.007, 6, 4), "#f4a8c0", { at: [x + 0.004, G + 0.017, z] });
  }

  // ---- koi ----
  const ORANGE = "#f2701e", WHITE = "#f8f4ea";
  const koi = (cx: number, cz: number, a: number, sc: number, bands: [number, string][]) => {
    const f = [Math.sin(a), Math.cos(a)];
    const sd = [Math.cos(a), -Math.sin(a)];
    const W = (lx: number, lz: number, y = G + 0.012): [number, number, number] => [
      cx + (lx * sd[0] + lz * f[0]) * sc,
      y,
      cz + (lx * sd[1] + lz * f[1]) * sc,
    ];
    const pts = [W(0, 0.075), W(0.006, 0.04), W(0, 0), W(-0.012, -0.04), W(-0.006, -0.07)];
    const prof = (t: number) => (t < 0.25 ? 0.7 + 1.2 * t : 1 - 0.75 * ((t - 0.25) / 0.75));
    b.sweep(catmull(pts), (t: number) => [0.014 * sc * prof(t), 0.011 * sc * prof(t)], {
      bone: root,
      bands,
      color: bands[0][1],
      sides: 8,
    });
    for (const e of [1, -1])
      P(sph(0.0035 * sc * 1.2, 5, 4), "#161616", { at: W(e * 0.011, 0.065, G + 0.0185) });
    // tail
    const tailAt = W(-0.006, -0.07);
    b.extrude(
      [[0, 0.003], [0.035, 0.024], [0.027, 0], [0.035, -0.024], [0, -0.003]],
      {
        at: tailAt,
        x: [-f[0], 0, -f[1]],
        y: [sd[0], 0, sd[1]],
        thickness: 0.002,
        color: "#fbe3cc",
        bone: root,
      },
    );
    // pectoral fins
    for (const e of [1, -1])
      b.extrude([[0, 0.004], [0.026, -0.01], [0.03, 0.002]], {
        at: W(e * 0.012, 0.035),
        x: [e * sd[0] * 0.8 - f[0] * 0.6, 0, e * sd[1] * 0.8 - f[1] * 0.6],
        y: [f[0], 0, f[1]],
        thickness: 0.0015,
        color: "#fbe3cc",
        bone: root,
      });
    // ripple
    P(new THREE.TorusGeometry(0.05 * sc, 0.0012, 3, 20), "#bfe6ee", {
      at: [cx, G + 0.0125, cz],
      rotation: [90, 0, 0],
    });
  };
  koi(-0.08, -0.1, 0.5, 1.15, [[0.16, ORANGE], [0.45, WHITE], [0.7, ORANGE], [1, WHITE]]);
  koi(0.22, 0.02, 3.7, 1.0, [[0.2, WHITE], [0.5, ORANGE], [0.75, WHITE], [1, ORANGE]]);
  koi(0.0, -0.01, -1.9, 0.85, [[0.2, ORANGE], [0.55, WHITE], [1, ORANGE]]);

  // ---- bridge ----
  const bz = -0.05;
  const by = (x: number) => G + 0.03 + 0.14 * (1 - Math.pow((x - 0.05) / 0.41, 2));
  const bx = (i: number, n: number) => -0.36 + (0.82 * i) / n;
  const arch = (dy: number, dz: number, n = 10) =>
    catmull(Array.from({ length: n + 1 }, (_, i) => [bx(i, n), by(bx(i, n)) + dy, bz + dz] as number[]));
  const RED = "#c4281f", DRED = "#8e1a16";
  const deck = arch(0, 0);
  b.sweep(deck, () => [0.068, 0.008], { bone: root, section: "box", color: "#a8321f", caps: "flat" });
  for (const s of [1, -1])
    b.sweep(arch(-0.016, s * 0.065), () => [0.007, 0.016], { bone: root, section: "box", color: DRED, caps: "flat" });
  b.along(deck, 16, (at: any) => P(box(0.15, 0.03, 0.012), "#d2593a", { frame: at, at: at.at, bone: root }));
  for (const s of [1, -1]) {
    b.sweep(arch(0.078, s * 0.066), 0.007, { bone: root, color: RED, sides: 6 });
    b.sweep(arch(0.04, s * 0.066), 0.0045, { bone: root, color: RED, sides: 6 });
    for (let i = 0; i <= 8; i++) {
      const x = bx(i, 8);
      P(cyl(0.007, 0.007, 0.08, 6), RED, { at: [x, by(x) + 0.04, bz + s * 0.066] });
      P(sph(0.011, 6, 4), "#e8b73a", { at: [x, by(x) + 0.085, bz + s * 0.066] });
    }
  }
  for (const x of [-0.385, 0.485])
    P(box(0.06, 0.035, 0.18), "#8a8a85", { at: [x, G + 0.0175, bz] });

  // ---- stone lantern ----
  const L = [-0.4, 0.1];
  const STONE = "#9a9a94", STONE2 = "#85857f";
  let y = G;
  const stack = (g: THREE.BufferGeometry, h: number, c: string) => {
    P(g, c, { at: [L[0], y + h / 2, L[1]] });
    y += h;
  };
  stack(cyl(0.035, 0.042, 0.02, 6), 0.02, STONE2);
  stack(cyl(0.012, 0.014, 0.07, 6), 0.07, STONE);
  stack(cyl(0.04, 0.03, 0.014, 6), 0.014, STONE2);
  const fy = y;
  stack(box(0.044, 0.04, 0.044), 0.04, STONE);
  for (const [dx, dz, ry] of [[0, 0.023, 0], [0, -0.023, 0], [0.023, 0, 90], [-0.023, 0, 90]])
    P(box(0.022, 0.022, 0.004), "#ffd77a", { at: [L[0] + dx, fy + 0.02, L[1] + dz], rotation: [0, ry, 0] });
  P(cyl(0.012, 0.062, 0.035, 6), STONE2, { at: [L[0], y + 0.0175, L[1]] });
  y += 0.035;
  P(sph(0.011, 6, 4), STONE, { at: [L[0], y + 0.008, L[1]] });

  // ---- gravel and rocks ----
  P(box(0.6, 0.012, 0.27), "#f1efe6", { at: [-0.18, G + 0.006, 0.335] });
  for (let i = 0; i < 6; i++)
    P(box(0.36, 0.004, 0.005), "#cfcdc3", { at: [-0.07, G + 0.0135, 0.235 + i * 0.04] });
  const rock = (x: number, z: number, r: number, onGravel = false) => {
    const base = G + (onGravel ? 0.01 : 0);
    P(new THREE.IcosahedronGeometry(r, 1), "#7d7d78", {
      at: [x, base + r * 0.45, z],
      scale: [1.2, 0.8, 1],
      rotation: [0, R() * 180, 0],
    });
    P(new THREE.IcosahedronGeometry(r * 0.8, 1), "#4f8a3a", {
      at: [x, base + r * 0.82, z],
      scale: [1.15, 0.38, 0.95],
    });
    for (let k = 0; k < 3; k++)
      P(sph(r * 0.2, 5, 4), "#6aa443", {
        at: [x + (R() - 0.5) * r * 2, base + r * 0.25, z + (R() - 0.5) * r * 2],
        scale: [1, 0.5, 1],
      });
  };
  rock(-0.38, 0.33, 0.05, true);
  P(new THREE.TorusGeometry(0.085, 0.003, 3, 24), "#d6d4ca", { at: [-0.38, G + 0.0135, 0.33], rotation: [90, 0, 0] });
  P(new THREE.TorusGeometry(0.115, 0.003, 3, 24), "#d6d4ca", { at: [-0.38, G + 0.0135, 0.33], rotation: [90, 0, 0] });
  rock(-0.27, 0.43, 0.028, true);
  rock(0.29, 0.19, 0.045);
  rock(-0.15, -0.4, 0.05);
  rock(0.4, -0.36, 0.04);

  // ---- stepping stones ----
  [[0.4, 0.4], [0.37, 0.31], [0.41, 0.22], [0.38, 0.13], [0.41, 0.04]].forEach(([x, z], i) => {
    P(cyl(0.034, 0.038, 0.018, 8), i % 2 ? "#8f8f8a" : "#a3a39d", {
      at: [x, G + 0.008, z],
      scale: [1, 1, 0.85 + (i % 3) * 0.1],
      rotation: [0, i * 23, 0],
    });
  });

  // ---- pine ----
  const trunkPine = catmull([[-0.3, G - 0.01, -0.32], [-0.31, G + 0.08, -0.33], [-0.28, G + 0.16, -0.32], [-0.3, G + 0.25, -0.33]]);
  b.sweep(trunkPine, [0.018, 0.006], { bone: root, color: "#5b3f2b", sides: 6 });
  const pad = (cx: number, cy: number, cz: number, r: number) => {
    const g1 = "#2f5f36", g2 = "#417a44";
    P(new THREE.IcosahedronGeometry(r, 1), g1, { at: [cx, cy, cz], scale: [1.2, 0.5, 1.1] });
    P(new THREE.IcosahedronGeometry(r * 0.7, 1), g1, { at: [cx + r * 0.7, cy - r * 0.05, cz + r * 0.1], scale: [1.1, 0.5, 1] });
    P(new THREE.IcosahedronGeometry(r * 0.7, 1), g1, { at: [cx - r * 0.65, cy - r * 0.05, cz - r * 0.15], scale: [1.1, 0.5, 1] });
    P(new THREE.IcosahedronGeometry(r * 0.75, 1), g2, { at: [cx, cy + r * 0.28, cz], scale: [1.1, 0.4, 1] });
  };
  const pineBr: [number[], number[], number][] = [
    [[-0.31, G + 0.09, -0.33], [-0.2, G + 0.13, -0.3], 0.06],
    [[-0.3, G + 0.13, -0.33], [-0.41, G + 0.18, -0.35], 0.055],
    [[-0.28, G + 0.18, -0.32], [-0.27, G + 0.22, -0.2], 0.05],
    [[-0.29, G + 0.2, -0.33], [-0.26, G + 0.245, -0.42], 0.045],
  ];
  for (const [a, e, r] of pineBr) {
    b.rod(a, e, [0.007, 0.004], { bone: root, color: "#5b3f2b", sides: 5 });
    pad(e[0], e[1] + 0.012, e[2], r);
  }
  pad(-0.3, G + 0.29, -0.33, 0.05);

  // ---- cherry ----
  const CX = 0.28, CZ = -0.32;
  b.sweep(catmull([[CX, G - 0.01, CZ], [CX - 0.01, G + 0.1, CZ + 0.01], [CX + 0.01, G + 0.2, CZ], [CX, G + 0.3, CZ]]), [0.032, 0.012], {
    bone: root, color: "#4a3024", sides: 6,
  });
  const limbs: number[][] = [[CX - 0.15, G + 0.33, CZ + 0.02], [CX + 0.15, G + 0.34, CZ + 0.03], [CX, G + 0.36, CZ - 0.14], [CX + 0.02, G + 0.4, CZ + 0.1]];
  for (const e of limbs) b.rod([CX, G + 0.22, CZ], e, [0.011, 0.005], { bone: root, color: "#4a3024", sides: 5 });
  const pinks = ["#f7b6cb", "#f39ab9", "#fbd0dd", "#ee86aa"];
  for (let i = 0; i < 34; i++) {
    const a = R() * Math.PI * 2;
    const d = Math.sqrt(R()) * 0.2;
    const yy = G + 0.36 + 0.12 * (1 - d / 0.2) + (R() - 0.4) * 0.09;
    P(new THREE.IcosahedronGeometry(0.05 + R() * 0.04, 1), pinks[i % 4], {
      at: [CX + Math.cos(a) * d, yy, CZ + Math.sin(a) * d],
      scale: [1, 0.8, 1],
    });
  }

  // ---- petals ----
  const petalGeos: Record<string, THREE.BufferGeometry[]> = { "#fbc3d4": [], "#ffe9f0": [] };
  const inPond = (x: number, z: number) => Math.pow((x - PC[0]) / PRX, 2) + Math.pow((z - PC[1]) / PRZ, 2) < 0.9;
  for (let i = 0; i < 90; i++) {
    const falling = i < 40;
    const x = falling ? CX + (R() - 0.5) * 0.6 : (R() - 0.5) * 0.9;
    const z = falling ? CZ + (R() - 0.3) * 0.6 : (R() - 0.5) * 0.9;
    let yy: number;
    if (falling) yy = G + 0.02 + R() * 0.4;
    else if (inPond(x, z)) yy = G + 0.0135;
    else if (x < 0.12 && z > 0.2 && z < 0.47 && x > -0.48) yy = G + 0.0145;
    else yy = G + 0.003;
    const g = new THREE.BoxGeometry(0.014, 0.0015, 0.01);
    g.applyMatrix4(
      new THREE.Matrix4().compose(
        new THREE.Vector3(x, yy, z),
        new THREE.Quaternion().setFromEuler(
          new THREE.Euler(falling ? R() * 3 : (R() - 0.5) * 0.2, R() * 6, falling ? R() * 3 : (R() - 0.5) * 0.2),
        ),
        new THREE.Vector3(1, 1, 1),
      ),
    );
    petalGeos[i % 2 ? "#fbc3d4" : "#ffe9f0"].push(g);
  }
  for (const c of Object.keys(petalGeos)) {
    const m = mergeGeometries(petalGeos[c]);
    if (m) b.part(m, c, { bone: root, at: [0, 0, 0] });
  }

  return b.root;
}
```