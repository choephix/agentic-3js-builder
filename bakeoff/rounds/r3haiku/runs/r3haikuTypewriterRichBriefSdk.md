```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

type Vec = [number, number, number];

export const meta = {
  name: "1930s racing-green typewriter",
  description:
    "Glossy racing-green portable typewriter with cream-lettered chrome keys in staggered rows, a semicircle of type bars, a chrome carriage return lever, a black platen with a half-typed sheet, and a brass maker's badge.",
};

const GREEN = "#1d5a36";
const DEEP = "#0f3a24";
const CHROME = "#cdd5dc";
const CREAM = "#f2e7c9";
const BLACK = "#151515";
const BRASS = "#b48a3c";
const PAPER = "#f6f0de";
const INK = "#2b2b2b";

function vec(a: Vec): THREE.Vector3 {
  return new THREE.Vector3(a[0], a[1], a[2]);
}

// Two unit vectors perpendicular to y, forming a right-handed frame with it.
function perp(y: THREE.Vector3) {
  const ref = Math.abs(y.z) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1);
  const x = new THREE.Vector3().crossVectors(y, ref).normalize();
  const z = new THREE.Vector3().crossVectors(x, y).normalize();
  return { x, z };
}

export default function build() {
  const b = createBuilder({ name: "typewriter" });
  b.joint("machine", { at: [0, 0, 0] });

  // Bake a geometry (built in local space) into its own basis and centre, then add it as a part.
  const place = (
    geo: THREE.BufferGeometry,
    c: THREE.Vector3,
    x: THREE.Vector3,
    y: THREE.Vector3,
    z: THREE.Vector3,
    color: string,
  ) => {
    geo.applyMatrix4(new THREE.Matrix4().makeBasis(x, y, z).setPosition(c));
    b.part(geo, color, { at: [0, 0, 0] });
  };

  // Axis-aligned or explicitly oriented box.
  const block = (
    size: Vec,
    c: Vec,
    color: string,
    x: Vec = [1, 0, 0],
    y: Vec = [0, 1, 0],
    z: Vec = [0, 0, 1],
  ) => {
    place(new THREE.BoxGeometry(size[0], size[1], size[2]), vec(c), vec(x), vec(y), vec(z), color);
  };

  // Cylinder whose axis runs along dir.
  const rod = (r: number, len: number, c: Vec, dir: Vec, color: string, seg = 14) => {
    const y = vec(dir).normalize();
    const { x, z } = perp(y);
    place(new THREE.CylinderGeometry(r, r, len, seg), vec(c), x, y, z, color);
  };

  // Thin bar from a to b.
  const beam = (a: Vec, bb: Vec, w: number, t: number, color: string) => {
    const A = vec(a);
    const B = vec(bb);
    const d = B.clone().sub(A);
    const L = d.length();
    const y = d.clone().normalize();
    const { x, z } = perp(y);
    place(new THREE.BoxGeometry(w, L, t), A.clone().add(B).multiplyScalar(0.5), x, y, z, color);
  };

  // ---- Base, feet and body -------------------------------------------------
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      rod(0.013, 0.02, [sx * 0.19, 0.01, sz * 0.14], [0, 1, 0], BLACK, 12);
    }
  }
  block([0.43, 0.012, 0.33], [0, 0.026, 0], BLACK);
  block([0.44, 0.078, 0.34], [0, 0.071, 0], GREEN);
  block([0.44, 0.006, 0.006], [0, 0.04, 0.172], CHROME);

  // Keyboard tray at the front, with a chrome lip.
  block([0.42, 0.02, 0.15], [0, 0.12, 0.1], GREEN);
  block([0.42, 0.006, 0.008], [0, 0.131, 0.174], CHROME);

  // Maker's badge on the front panel.
  block([0.08, 0.03, 0.004], [0, 0.075, 0.173], BRASS);
  block([0.05, 0.01, 0.002], [0, 0.075, 0.176], DEEP);

  // ---- Keys: four staggered rows, stepping up towards the carriage -----------
  const rows = [
    { z: 0.155, y: 0.135, n: 10, dx: 0 },
    { z: 0.12, y: 0.15, n: 10, dx: 0.017 },
    { z: 0.085, y: 0.165, n: 9, dx: 0 },
    { z: 0.05, y: 0.18, n: 9, dx: 0.017 },
  ];
  for (const row of rows) {
    // Riser under the row so each step is solid.
    block([0.41, row.y - 0.13, 0.034], [0, (row.y + 0.13) / 2, row.z], GREEN);
    for (let i = 0; i < row.n; i++) {
      const x = (i - (row.n - 1) / 2) * 0.034 + row.dx;
      // Chrome rim, dark cap, cream letter chip.
      rod(0.0195, 0.005, [x, row.y + 0.0025, row.z], [0, 1, 0], CHROME, 16);
      rod(0.0165, 0.006, [x, row.y + 0.008, row.z], [0, 1, 0], DEEP, 14);
      block([0.008, 0.001, 0.009], [x, row.y + 0.0115, row.z], CREAM);
    }
  }

  // ---- Type bars: a semicircular fan rising from the body to the platen ------
  const N = 21;
  for (let i = 0; i < N; i++) {
    const phi = -1.0 + (2.0 * i) / (N - 1);
    const P: Vec = [0.15 * Math.sin(phi), 0.1, -0.04 - 0.04 * (1 - Math.cos(phi))];
    const S: Vec = [0.05 * Math.sin(phi), 0.26, -0.082];
    beam(P, S, 0.004, 0.0025, CHROME);
    block([0.006, 0.006, 0.006], S, BLACK);
  }

  // ---- Carriage: end plates, chrome top rail, black platen -------------------
  for (const sx of [-1, 1]) {
    block([0.012, 0.2, 0.07], [sx * 0.205, 0.21, -0.11], GREEN);
    // Platen knobs in brass.
    rod(0.014, 0.03, [sx * 0.23, 0.27, -0.11], [1, 0, 0], BRASS, 14);
  }
  block([0.44, 0.008, 0.022], [0, 0.31, -0.12], CHROME);
  rod(0.027, 0.36, [0, 0.27, -0.11], [1, 0, 0], BLACK, 24);

  // Chrome carriage return lever on the right-hand plate with a black grip.
  beam([0.212, 0.2, -0.09], [0.25, 0.24, -0.035], 0.008, 0.008, CHROME);
  rod(0.012, 0.02, [0.258, 0.248, -0.03], [1, 0, 0], BLACK, 12);

  // ---- Paper: a sheet wrapped over the platen, half typed -------------------
  const sx: Vec = [1, 0, 0];
  const sy: Vec = [0, 0.98007, -0.19867];
  const sz: Vec = [0, 0.19867, 0.98007];
  const sheetC: Vec = [0, 0.35, -0.095];
  block([0.26, 0.16, 0.002], sheetC, PAPER, sx, sy, sz);

  // Point on the sheet at (u across, v up it, n out of its face).
  const onSheet = (u: number, v: number, n = 0.0016): Vec => [
    u,
    0.35 + 0.98007 * v + 0.19867 * n,
    -0.095 - 0.19867 * v + 0.98007 * n,
  ];

  const lines: { v: number; count: number }[] = [
    { v: -0.045, count: 17 },
    { v: -0.02, count: 14 },
    { v: 0.005, count: 17 },
    { v: 0.03, count: 9 },
  ];
  for (const line of lines) {
    for (let k = 0; k < line.count; k++) {
      if (k % 6 === 5) continue; // word gaps
      const u = -0.11 + k * 0.0095;
      block([0.0065, 0.0055, 0.0006], onSheet(u, line.v), INK, sx, sy, sz);
    }
  }

  return b.root;
}
```