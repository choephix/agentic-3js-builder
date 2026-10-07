```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Japanese garden diorama",
  description:
    "Square garden base with a red arched bridge over a koi pond, a stone lantern, a cloud-pruned pine, a cherry tree in full bloom, raked gravel, mossy rocks and stepping stones.",
};

const C = {
  base: "#4a3426",
  trim: "#2e1f15",
  gravel: "#e9e4d8",
  rake: "#c9c1ae",
  water: "#2b5f7d",
  stone: "#8f8d84",
  stoneDark: "#6a6862",
  stepStone: "#9c978a",
  moss: "#4f7d34",
  red: "#b3261e",
  redDark: "#8a1b16",
  lanternStone: "#bdb9ac",
  roofStone: "#8e8b80",
  glow: "#ffd98a",
  trunk: "#4e3224",
  pine: "#2c5a36",
  pineLight: "#41794a",
  blossom: "#f7bfd0",
  blossomDeep: "#e68aa8",
  blossomLight: "#fde3ea",
  koiOrange: "#f2741e",
  koiWhite: "#f7f2e8",
  ink: "#16120f",
};

export default function build() {
  const b = createBuilder({ name: "japanese-garden" });
  const rand = rng(11);
  const rr = (a: number, c: number) => a + (c - a) * rand();

  b.joint("garden", { at: [0, 0, 0] });

  // Matrix from position, Euler rotation and scale (scale, then rotate, then move).
  const M = (p: number[] = [0, 0, 0], r: number[] = [0, 0, 0], s: number[] = [1, 1, 1]) =>
    new THREE.Matrix4().compose(
      new THREE.Vector3(p[0], p[1], p[2]),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0], r[1], r[2])),
      new THREE.Vector3(s[0], s[1], s[2]),
    );

  // Bakes a transform into the geometry and adds it as a part.
  const put = (geo: THREE.BufferGeometry, color: string, m: THREE.Matrix4 = M()) => {
    geo.applyMatrix4(m);
    b.part(geo, color);
  };

  // ---- Base and ground -------------------------------------------------
  put(new THREE.BoxGeometry(2, 0.12, 2), C.base, M([0, 0.06, 0]));
  put(new THREE.BoxGeometry(2.06, 0.05, 0.08), C.trim, M([0, 0.1, 1.0]));
  put(new THREE.BoxGeometry(2.06, 0.05, 0.08), C.trim, M([0, 0.1, -1.0]));
  put(new THREE.BoxGeometry(0.08, 0.05, 2.0), C.trim, M([1.0, 0.1, 0]));
  put(new THREE.BoxGeometry(0.08, 0.05, 2.0), C.trim, M([-1.0, 0.1, 0]));

  // Raked gravel bed (top at y = 0.14).
  put(new THREE.BoxGeometry(1.96, 0.02, 1.96), C.gravel, M([0, 0.13, 0]));

  // Raked rings around the pond.
  for (const R of [0.72, 0.86]) {
    put(new THREE.TorusGeometry(R, 0.007, 4, 64), C.rake, M([0, 0.143, 0], [Math.PI / 2, 0, 0]));
  }

  // ---- Pond ------------------------------------------------------------
  put(new THREE.CylinderGeometry(0.5, 0.5, 0.02, 40), C.water, M([0, 0.145, 0]));

  // Rim boulders around the pond.
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + rr(-0.12, 0.12);
    const R = 0.52 + rr(-0.02, 0.03);
    const s = rr(0.045, 0.07);
    put(
      new THREE.DodecahedronGeometry(s, 0),
      i % 3 ? C.stone : C.stoneDark,
      M([Math.cos(a) * R, 0.14 + s * 0.3, Math.sin(a) * R], [rr(0, 3), rr(0, 3), rr(0, 3)], [1.15, 0.7, 1]),
    );
  }

  // ---- Koi ---------------------------------------------------------------
  const koi = (fx: number, fz: number, ang: number) => {
    const fm = (lp: number[], lr: number[] = [0, 0, 0], ls: number[] = [1, 1, 1]) =>
      M([fx, 0.158, fz], [0, ang, 0]).multiply(M(lp, lr, ls));
    // body
    put(new THREE.SphereGeometry(1, 10, 8), C.koiOrange, fm([0, 0, 0], [0, 0, 0], [0.06, 0.045, 0.13]));
    // white patches
    put(new THREE.SphereGeometry(1, 8, 6), C.koiWhite, fm([0, 0.03, 0.02], [0, 0, 0], [0.05, 0.02, 0.06]));
    put(new THREE.SphereGeometry(1, 8, 6), C.koiWhite, fm([0, 0.02, -0.06], [0, 0, 0], [0.04, 0.018, 0.04]));
    // tail (apex points back along -Z)
    put(new THREE.ConeGeometry(0.05, 0.09, 4), C.koiOrange, fm([0, 0, -0.17], [-Math.PI / 2, 0, 0]));
    // eyes
    put(new THREE.SphereGeometry(0.012, 6, 4), C.ink, fm([0.027, 0.018, 0.11]));
    put(new THREE.SphereGeometry(0.012, 6, 4), C.ink, fm([-0.027, 0.018, 0.11]));
  };
  koi(-0.2, -0.18, 0.7);
  koi(0.18, -0.25, -0.6);
  koi(-0.06, 0.22, 2.6);

  // ---- Red arched bridge crossing the pond along Z ----------------------
  const yb = (z: number) => 0.14 + 0.36 * (1 - (z / 0.8) ** 2);
  const N = 20;
  for (let i = 0; i < N; i++) {
    const z0 = -0.8 + (1.6 * i) / N;
    const z1 = z0 + 1.6 / N;
    const zm = (z0 + z1) / 2;
    const dy = yb(z1) - yb(z0);
    const dz = z1 - z0;
    const L = Math.hypot(dy, dz);
    const th = Math.atan2(-dy, dz);
    // deck planks
    put(
      new THREE.BoxGeometry(0.3, 0.03, L * 1.04),
      i % 2 ? C.red : C.redDark,
      M([0, yb(zm) + 0.01, zm], [th, 0, 0]),
    );
    // handrails
    for (const sx of [-0.15, 0.15]) {
      put(new THREE.BoxGeometry(0.03, 0.03, L * 1.04), C.red, M([sx, yb(zm) + 0.25, zm], [th, 0, 0]));
    }
  }
  // posts at every node
  for (let k = 0; k <= N; k++) {
    const zk = -0.8 + (1.6 * k) / N;
    for (const sx of [-0.15, 0.15]) {
      put(new THREE.CylinderGeometry(0.018, 0.018, 0.24, 6), C.redDark, M([sx, yb(zk) + 0.13, zk]));
    }
  }

  // ---- Stepping stones leading to the bridge ----------------------------
  for (const [x, z] of [
    [0.46, 0.93],
    [0.32, 0.86],
    [0.2, 0.8],
  ]) {
    put(new THREE.CylinderGeometry(0.1, 0.11, 0.03, 9), C.stepStone, M([x, 0.155, z], [0, rr(0, 3), 0]));
  }

  // ---- Mossy rocks in the gravel ----------------------------------------
  for (const [x, z, r] of [
    [-0.74, 0.46, 0.12],
    [0.78, -0.08, 0.11],
    [-0.36, 0.8, 0.08],
  ]) {
    put(new THREE.DodecahedronGeometry(r, 0), C.stoneDark, M([x, 0.14 + r * 0.6, z], [0.3, rr(0, 3), 0.2], [1.25, 0.85, 1]));
    put(new THREE.SphereGeometry(r * 0.95, 7, 5), C.moss, M([x, 0.14 + r * 1.05, z], [0, 0, 0], [1.05, 0.35, 0.95]));
  }

  // ---- Stone lantern ----------------------------------------------------
  const LX = -0.62;
  const LZ = -0.5;
  const lp = (y: number) => [LX, y, LZ];
  put(new THREE.CylinderGeometry(0.13, 0.15, 0.05, 8), C.lanternStone, M(lp(0.165)));
  put(new THREE.BoxGeometry(0.2, 0.04, 0.2), C.lanternStone, M(lp(0.21)));
  put(new THREE.CylinderGeometry(0.035, 0.05, 0.28, 7), C.lanternStone, M(lp(0.37)));
  put(new THREE.BoxGeometry(0.2, 0.04, 0.2), C.lanternStone, M(lp(0.53)));
  put(new THREE.BoxGeometry(0.18, 0.03, 0.18), C.lanternStone, M(lp(0.565)));
  for (const cx of [-0.07, 0.07]) {
    for (const cz of [-0.07, 0.07]) {
      put(new THREE.BoxGeometry(0.025, 0.16, 0.025), C.lanternStone, M([LX + cx, 0.66, LZ + cz]));
    }
  }
  put(new THREE.BoxGeometry(0.1, 0.12, 0.1), C.glow, M(lp(0.66)));
  put(new THREE.BoxGeometry(0.2, 0.03, 0.2), C.lanternStone, M(lp(0.755)));
  put(new THREE.ConeGeometry(0.16, 0.13, 4), C.roofStone, M(lp(0.82), [0, Math.PI / 4, 0]));
  put(new THREE.SphereGeometry(0.02, 6, 4), C.roofStone, M(lp(0.91)));

  // ---- Pine with cloud-pruned foliage -----------------------------------
  const PX = 0.62;
  const PZ = -0.52;
  const PY = 0.14;
  put(new THREE.CylinderGeometry(0.03, 0.045, 0.52, 6), C.trunk, M([PX, PY + 0.26, PZ]));
  const pads: [number, number, number, number, string][] = [
    [0, 0.5, 0, 0.25, C.pine],
    [0.17, 0.4, 0.05, 0.18, C.pineLight],
    [-0.15, 0.42, -0.04, 0.18, C.pine],
    [0.02, 0.33, -0.17, 0.16, C.pineLight],
    [-0.03, 0.62, 0.02, 0.16, C.pineLight],
    [0.1, 0.56, -0.12, 0.13, C.pine],
  ];
  for (const [dx, dy, dz, r, col] of pads) {
    put(new THREE.SphereGeometry(r, 8, 6), col, M([PX + dx, PY + dy, PZ + dz], [0, 0, 0], [1, 0.5, 1]));
  }

  // ---- Cherry tree in full bloom ----------------------------------------
  const CX = 0.52;
  const CZ = 0.42;
  const CY = 0.14;
  put(new THREE.CylinderGeometry(0.035, 0.06, 0.6, 7), C.trunk, M([CX, CY + 0.3, CZ]));
  // branches (base at trunk top, y = 0.74)
  put(new THREE.CylinderGeometry(0.012, 0.025, 0.4, 5), C.trunk, M([0.63, 0.905, CZ], [0, 0, -0.6]));
  put(new THREE.CylinderGeometry(0.012, 0.025, 0.36, 5), C.trunk, M([0.434, 0.898, CZ], [0, 0, 0.5]));
  put(new THREE.CylinderGeometry(0.012, 0.025, 0.38, 5), C.trunk, M([CX, 0.885, 0.543], [0.7, 0, 0]));

  // blossom clusters filling an ellipsoid crown
  const blossomCols = [C.blossom, C.blossomDeep, C.blossomLight];
  let placed = 0;
  while (placed < 46) {
    const x = rr(-1, 1);
    const y = rr(-1, 1);
    const z = rr(-1, 1);
    if (x * x + y * y + z * z > 1) continue;
    const r = rr(0.07, 0.12);
    const col = blossomCols[Math.floor(rand() * blossomCols.length)];
    put(new THREE.SphereGeometry(r, 7, 5), col, M([CX + x * 0.33, 1.02 + y * 0.2, CZ + z * 0.3]));
    placed++;
  }

  // petals drifting in the air
  for (let i = 0; i < 24; i++) {
    const col = blossomCols[Math.floor(rand() * blossomCols.length)];
    put(
      new THREE.SphereGeometry(0.02, 4, 3),
      col,
      M([CX + rr(-0.6, 0.6), rr(0.25, 1.1), CZ + rr(-0.5, 0.5)], [rand() * 3, rand() * 3, rand() * 3], [1, 0.3, 0.7]),
    );
  }
  // petals on the gravel under the tree
  for (let i = 0; i < 14; i++) {
    const a = rr(0, Math.PI * 2);
    const d = rr(0.05, 0.4);
    put(
      new THREE.SphereGeometry(0.02, 4, 3),
      blossomCols[Math.floor(rand() * blossomCols.length)],
      M([CX + Math.cos(a) * d, 0.145, CZ + Math.sin(a) * d], [0, rand() * 3, 0], [1, 0.3, 0.7]),
    );
  }

  return b.root;
}
```