```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Racing Green Typewriter",
  description:
    "1930s desk typewriter in glossy racing green with chrome-rimmed round keys, a semicircular type-bar basket, carriage with a half-typed sheet, a chrome return lever and a brass maker's badge.",
};

export default function build() {
  const b = createBuilder({ name: "typewriter" });
  const base = b.joint("base", { at: [0, 0.05, 0] });

  const GREEN = "#0f4a2e";
  const DKGREEN = "#0a3320";
  const CHROME = "#d9dee3";
  const BLACK = "#151515";
  const CREAM = "#efe3c0";
  const BRASS = "#c49a3a";
  const PAPER = "#f6f1e2";
  const INK = "#262626";

  // deterministic local random
  let seed = 1930;
  const rnd = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const add = (g: THREE.BufferGeometry, color: string, at: number[]) =>
    b.part(g, color, { at: at as [number, number, number], bone: base });
  const box = (w: number, h: number, d: number, color: string, at: number[], rx = 0) => {
    const g = new THREE.BoxGeometry(w, h, d);
    if (rx) g.rotateX(rx);
    return add(g, color, at);
  };
  const cylX = (r: number, len: number, seg: number, color: string, at: number[]) => {
    const g = new THREE.CylinderGeometry(r, r, len, seg);
    g.rotateZ(Math.PI / 2);
    return add(g, color, at);
  };
  const cylY = (r: number, len: number, seg: number, color: string, at: number[]) =>
    add(new THREE.CylinderGeometry(r, r, len, seg), color, at);
  const cylZ = (r: number, len: number, seg: number, color: string, at: number[]) => {
    const g = new THREE.CylinderGeometry(r, r, len, seg);
    g.rotateX(Math.PI / 2);
    return add(g, color, at);
  };
  const rod = (a: number[], c: number[], r: number, color: string, seg = 5) => {
    const va = new THREE.Vector3(...a);
    const vc = new THREE.Vector3(...c);
    const d = vc.clone().sub(va);
    const len = d.length();
    const g = new THREE.CylinderGeometry(r, r, len, seg);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()));
    const m = va.clone().add(vc).multiplyScalar(0.5);
    return add(g, color, [m.x, m.y, m.z]);
  };
  const sphere = (r: number, color: string, at: number[]) =>
    add(new THREE.SphereGeometry(r, 8, 6), color, at);

  // ---------- body ----------
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) cylY(0.016, 0.022, 8, CHROME, [sx * 0.15, 0.011, sz * 0.15]);
  box(0.38, 0.1, 0.38, GREEN, [0, 0.07, 0]); // lower body
  box(0.36, 0.1, 0.23, GREEN, [0, 0.17, -0.075]); // rear block, top y=0.22
  box(0.384, 0.006, 0.384, CHROME, [0, 0.022, 0]); // base trim
  box(0.384, 0.006, 0.384, CHROME, [0, 0.118, 0]);
  box(0.3, 0.003, 0.002, CREAM, [0, 0.035, 0.1915]); // pinstripe
  for (const sx of [-1, 1]) {
    box(0.002, 0.004, 0.34, CREAM, [sx * 0.1915, 0.04, 0]);
    box(0.004, 0.07, 0.2, DKGREEN, [sx * 0.182, 0.17, -0.08]); // side panel
    box(0.003, 0.05, 0.16, CHROME, [sx * 0.185, 0.17, -0.08]);
  }
  box(0.28, 0.003, 0.004, CHROME, [0, 0.09, 0.191]);

  // ---------- keyboard deck ----------
  const th = Math.atan(0.5);
  const n = new THREE.Vector3(0, Math.cos(th), Math.sin(th));
  const tv = new THREE.Vector3(0, Math.sin(th), -Math.cos(th));
  const surfY = (z: number) => 0.12 + (0.2 - z) * 0.5;
  box(0.35, 0.02, 0.215, DKGREEN, [0, 0.16 - n.y * 0.01, 0.12 - n.z * 0.01], th);
  // chrome deck edge rods
  rod([-0.175, surfY(0.215) , 0.215], [0.175, surfY(0.215), 0.215], 0.004, CHROME, 6);
  for (const sx of [-1, 1]) rod([sx * 0.176, surfY(0.215), 0.215], [sx * 0.176, surfY(0.015), 0.015], 0.003, CHROME, 5);

  const glyphs: Record<string, number[][]> = {
    T: [[0, 0.0043, 0.008, 0.0015], [0, 0, 0.0015, 0.01]],
    L: [[-0.003, 0, 0.0015, 0.01], [0, -0.0043, 0.008, 0.0015]],
    H: [[-0.003, 0, 0.0015, 0.01], [0.003, 0, 0.0015, 0.01], [0, 0, 0.006, 0.0015]],
    I: [[0, 0, 0.0015, 0.01], [0, 0.0043, 0.005, 0.0015], [0, -0.0043, 0.005, 0.0015]],
    E: [[-0.003, 0, 0.0015, 0.01], [0.0005, 0.0043, 0.006, 0.0015], [0.0005, 0, 0.005, 0.0015], [0.0005, -0.0043, 0.006, 0.0015]],
    O: [[-0.003, 0, 0.0015, 0.01], [0.003, 0, 0.0015, 0.01], [0, 0.0043, 0.006, 0.0015], [0, -0.0043, 0.006, 0.0015]],
  };
  const letters = Object.keys(glyphs);

  const key = (x: number, z: number) => {
    const p = new THREE.Vector3(x, surfY(z), z);
    const at = (h: number, dt = 0, dx = 0) =>
      [p.x + n.x * h + tv.x * dt + dx, p.y + n.y * h + tv.y * dt, p.z + n.z * h + tv.z * dt];
    const stem = new THREE.CylinderGeometry(0.003, 0.003, 0.014, 6);
    stem.rotateX(th);
    add(stem, CHROME, at(0.005));
    const rim = new THREE.CylinderGeometry(0.0118, 0.0118, 0.007, 14);
    rim.rotateX(th);
    add(rim, CHROME, at(0.0155));
    const cap = new THREE.CylinderGeometry(0.0092, 0.0092, 0.0085, 14);
    cap.rotateX(th);
    add(cap, BLACK, at(0.0167));
    const letter = letters[Math.floor(rnd() * letters.length)];
    for (const [gx, gt, w, d] of glyphs[letter]) {
      const g = new THREE.BoxGeometry(w, 0.0008, d);
      g.rotateX(th);
      add(g, CREAM, at(0.0214, gt, gx));
    }
  };

  const counts = [10, 10, 9, 9];
  const offs = [0, 0.0075, 0.015, 0.0225];
  const rowZ = [0.16, 0.123, 0.086, 0.049];
  counts.forEach((c, r) => {
    for (let j = 0; j < c; j++) {
      key((j - (c - 1) / 2) * 0.029 + offs[r] - 0.011, rowZ[r]);
    }
  });
  // space bar
  {
    const z = 0.195;
    const p = new THREE.Vector3(0, surfY(z), z).add(n.clone().multiplyScalar(0.01));
    const g = new THREE.BoxGeometry(0.15, 0.008, 0.013);
    g.rotateX(th);
    add(g, CHROME, [p.x, p.y, p.z]);
  }

  // ---------- badge ----------
  {
    const g = new THREE.CylinderGeometry(0.018, 0.018, 0.004, 16);
    g.rotateX(Math.PI / 2);
    g.scale(1.7, 1, 1);
    add(g, BRASS, [0, 0.062, 0.192]);
    const g2 = new THREE.CylinderGeometry(0.014, 0.014, 0.003, 16);
    g2.rotateX(Math.PI / 2);
    g2.scale(1.7, 1, 1);
    add(g2, "#8a6a22", [0, 0.062, 0.1935]);
    box(0.036, 0.004, 0.002, BRASS, [0, 0.067, 0.1955]);
    box(0.026, 0.003, 0.002, BRASS, [0, 0.057, 0.1955]);
    for (const sx of [-1, 1]) sphere(0.0025, CHROME, [sx * 0.036, 0.062, 0.192]);
  }

  // ---------- type basket ----------
  const H = [0, 0.225, -0.07];
  cylY(0.02, 0.012, 10, CHROME, [H[0], H[1] - 0.004, H[2]]);
  cylY(0.012, 0.01, 8, BLACK, [H[0], H[1] + 0.004, H[2]]);
  const N = 27;
  for (let i = 0; i < N; i++) {
    const a = THREE.MathUtils.degToRad(-78 + (156 * i) / (N - 1));
    const dx = Math.sin(a), dz = -Math.cos(a);
    const a0 = [H[0] + dx * 0.025, 0.229, H[2] + dz * 0.025];
    const a1 = [H[0] + dx * 0.085, 0.272, H[2] + dz * 0.085];
    rod(a0, a1, 0.0016, CHROME, 4);
    box(0.005, 0.006, 0.004, i % 2 ? CREAM : CHROME, [a1[0], a1[1] + 0.002, a1[2]]);
  }
  {
    const g = new THREE.TorusGeometry(0.048, 0.0035, 5, 28, Math.PI);
    g.rotateX(-Math.PI / 2);
    add(g, CHROME, [H[0], 0.245, H[2]]);
  }
  // ribbon spools
  for (const sx of [-1, 1]) {
    cylY(0.04, 0.003, 14, CHROME, [sx * 0.14, 0.2255, -0.07 + 0.0]);
    cylY(0.033, 0.011, 14, BLACK, [sx * 0.14, 0.2335, -0.07]);
    cylY(0.04, 0.003, 14, CHROME, [sx * 0.14, 0.2415, -0.07]);
    cylY(0.008, 0.02, 8, CHROME, [sx * 0.14, 0.235, -0.07]);
  }

  // ---------- carriage ----------
  const PZ = -0.14, PY = 0.33;
  for (const sx of [-1, 1]) {
    box(0.02, 0.08, 0.02, GREEN, [sx * 0.178, 0.26, -0.15]); // posts
    box(0.012, 0.075, 0.1, CHROME, [sx * 0.198, 0.325, PZ]); // end plates
    cylX(0.018, 0.022, 10, BLACK, [sx * 0.222, PY, PZ]); // knobs
    cylX(0.004, 0.03, 6, CHROME, [sx * 0.21, PY, PZ]);
  }
  cylX(0.0255, 0.385, 14, BLACK, [0, PY, PZ]); // platen
  cylX(0.0045, 0.42, 6, CHROME, [0, 0.296, -0.19]);
  cylX(0.0045, 0.42, 6, CHROME, [0, 0.296, -0.095]);
  box(0.4, 0.008, 0.02, GREEN, [0, 0.292, -0.15]);
  // bail rod over the platen front
  cylX(0.0022, 0.37, 5, CHROME, [0, 0.318, -0.108]);
  for (const sx of [-1, 1]) rod([sx * 0.185, 0.318, -0.108], [sx * 0.19, 0.335, -0.125], 0.0022, CHROME, 5);

  // return lever
  rod([0.21, 0.345, PZ], [0.238, 0.375, -0.115], 0.0035, CHROME, 6);
  rod([0.238, 0.375, -0.115], [0.255, 0.372, -0.065], 0.0035, CHROME, 6);
  sphere(0.0045, CHROME, [0.238, 0.375, -0.115]);
  sphere(0.013, BLACK, [0.256, 0.372, -0.058]);

  // ---------- paper ----------
  const PZp = -0.1685;
  box(0.215, 0.19, 0.0016, PAPER, [0, 0.405, PZp]);
  box(0.215, 0.0016, 0.036, PAPER, [0, 0.31, -0.15]); // tucked in below
  const zf = PZp + 0.0016;
  // typed lines
  const rows = 7;
  for (let r = 0; r < rows; r++) {
    const y = 0.372 + r * 0.0085;
    const full = r === rows - 1 ? 0.07 : 0.17;
    let x = -0.085 + (r === 0 ? 0.04 : 0);
    const xEnd = -0.085 + full;
    while (x < xEnd) {
      const w = Math.min(0.012 + rnd() * 0.028, xEnd - x);
      if (w > 0.004) box(w, 0.0024, 0.0006, INK, [x + w / 2, y, zf]);
      x += w + 0.006;
    }
  }
  // heading (centered, darker/wider)
  box(0.08, 0.0032, 0.0006, INK, [0, 0.445, zf]);

  // lift the whole thing: root joint sits near the middle; model rests on y=0
  return b.root;
}
```