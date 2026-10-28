```ts
import * as THREE from "three";
import { createBuilder, catmull } from "agentic-3js-builder";

export const meta = {
  name: "Strandbeest Wind Walker",
  description:
    "A Theo Jansen style beach creature: yellow PVC tube frame, eight Jansen-linkage legs on four crank axles, a bottle-built stomach along the ridge, a rear bottle sail, a water-feeler and a wind vane.",
};

// ---------------------------------------------------------------- palette
const YEL = "#f2c41a";
const YEL_D = "#d49d0c";
const BLK = "#23222a";
const STEEL = "#9ba1aa";
const CRANK = "#5e626c";
const BOTTLE = ["#bfe3ee", "#e3f1f3", "#b7dcc4"];
const CAP = ["#e8602c", "#f4f1e8", "#2f7fc4"];
const WHITE = "#f4f1e8";
const ORANGE = "#e8602c";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------- Jansen linkage (2D, units)
type P2 = [number, number];
function X(p1: P2, r1: number, p2: P2, r2: number, sign: number): P2 {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  const d = Math.hypot(dx, dy) || 1e-6;
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(r1 * r1 - a * a, 0));
  const ex = dx / d;
  const ey = dy / d;
  return [p1[0] + a * ex + h * sign * -ey, p1[1] + a * ey + h * sign * ex];
}
const P2_: P2 = [-38, -7.8];
function solve(theta: number) {
  const Q: P2 = [15 * Math.cos(theta), 15 * Math.sin(theta)];
  const A = X(P2_, 41.5, Q, 50, 1);
  const B = X(P2_, 39.3, Q, 61.9, -1);
  const C = X(A, 55.8, B, 36.7, -1);
  const F = X(C, 65.7, B, 49, -1);
  return { Q, A, B, C, F };
}

export default function build() {
  const b = createBuilder({ name: "strandbeest" });
  const S = 0.0165;
  const ZC = [0.35, -0.15, -0.65, -1.15];
  const DEG = Math.PI / 180;

  let minV = Infinity;
  for (let i = 0; i < 4; i++)
    for (const ph of [i * 90, i * 90 + 180]) minV = Math.min(minV, solve(ph * DEG).F[1]);
  const yOf = (v: number) => (v - minV) * S + 0.1;
  const y0 = yOf(0);
  const yP = yOf(P2_[1]);
  const yT = y0 + 0.28;
  const yR = y0 + 0.85;
  const zFront = 1.25;
  const zBack = -1.5;

  // ---------------------------------------------------------------- helpers
  const tube = (a: THREE.Vector3, c: THREE.Vector3, r = 0.03, col = YEL) => b.capsule(a, c, r, col);
  const disc = (at: THREE.Vector3, dir: number[], r: number, len: number, col: string) =>
    b.part(new THREE.CylinderGeometry(r, r, len, 10), col, { at, dir });
  const ball = (at: THREE.Vector3, r = 0.04, col = BLK) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), col, { at });

  function bottle(c: THREE.Vector3, ax: THREE.Vector3, len: number, r: number, k: number) {
    const a = ax.clone().normalize();
    const col = BOTTLE[k % 3];
    const at = (f: number) => c.clone().addScaledVector(a, f * len);
    b.part(new THREE.CylinderGeometry(r, r, len * 0.78, 8), col, { at: at(-0.11), dir: a });
    b.part(new THREE.CylinderGeometry(r * 1.03, r * 1.03, len * 0.2, 8), WHITE, { at: at(-0.14), dir: a });
    b.part(new THREE.CylinderGeometry(r * 0.36, r, len * 0.14, 8), col, { at: at(0.35), dir: a });
    b.part(new THREE.CylinderGeometry(r * 0.4, r * 0.4, len * 0.08, 8), CAP[(k + 1) % 3], { at: at(0.46), dir: a });
  }

  // ---------------------------------------------------------------- legs
  function leg(x0: number, zc: number, theta: number) {
    const n = solve(theta);
    const w = (p: P2, x: number) => V(x, yOf(p[1]), zc - p[0] * S);
    const O: P2 = [0, 0];
    const dx = 0.04;
    const link = (p: P2, q: P2, x: number, col: string, r = 0.016) => tube(w(p, x), w(q, x), r, col);

    link(O, n.Q, x0, CRANK, 0.02);
    link(n.Q, n.A, x0 + dx, YEL);
    link(n.Q, n.B, x0 - dx, YEL_D);
    link(P2_, n.A, x0 + dx, YEL);
    link(P2_, n.B, x0 - dx, YEL_D);
    link(n.A, n.C, x0 + dx, YEL);
    link(n.B, n.C, x0 - dx, YEL_D);
    link(n.B, n.F, x0 - dx, YEL_D);
    link(n.C, n.F, x0 + dx, YEL);

    const nodes: P2[] = [n.Q, n.A, n.B, n.C, n.F];
    for (const p of nodes) {
      const c = w(p, x0);
      b.rod(c.clone().add(V(-0.075, 0, 0)), c.clone().add(V(0.075, 0, 0)), 0.011, STEEL);
    }
    for (const p of [...nodes, O, P2_]) {
      const c = w(p, x0);
      for (const s of [1, -1]) disc(c.clone().add(V(s * 0.072, 0, 0)), [1, 0, 0], 0.026, 0.012, BLK);
    }
    // foot pad
    const f = w(n.F, x0);
    b.capsule(f, f.clone().add(V(0, -0.06, 0)), 0.032, BLK);
  }

  for (let i = 0; i < 4; i++) {
    const xi = 0.5 + 0.17 * i;
    const zc = ZC[i];
    leg(xi, zc, i * 90 * DEG);
    leg(-xi, zc, (i * 90 + 180) * DEG);
    // crank axle and pivot axle across the body
    const xe = xi + 0.1;
    b.rod(V(-xe, y0, zc), V(xe, y0, zc), 0.02, STEEL);
    const zP = zc + 38 * S;
    b.rod(V(-xe, yP, zP), V(xe, yP, zP), 0.02, STEEL);
    for (const s of [1, -1]) {
      disc(V(s * (xe + 0.01), y0, zc), [1, 0, 0], 0.035, 0.02, BLK);
      disc(V(s * (xe + 0.01), yP, zP), [1, 0, 0], 0.035, 0.02, BLK);
      // post from pivot axle to the lower beam
      tube(V(s * 0.36, yP, zP), V(s * 0.36, y0, zP), 0.022);
    }
  }

  // ---------------------------------------------------------------- frame
  for (const s of [1, -1]) {
    const x = s * 0.36;
    tube(V(x, y0, zBack), V(x, y0, zFront));
    tube(V(x, yT, zBack), V(x, yT, zFront));
    tube(V(x, y0, zBack), V(x, yT, zBack));
    tube(V(x, y0, zFront), V(x, yT, zFront));
    for (let i = 0; i < 4; i++) {
      const z = ZC[i];
      tube(V(x, y0, z), V(x, yT, z), 0.026);
      tube(V(x, yT, z), V(0, yR, z), 0.026);
      ball(V(x, y0, z));
      ball(V(x, yT, z));
      if (i < 3) {
        const z2 = ZC[i + 1];
        const flip = i % 2 === 0;
        tube(V(x, flip ? y0 : yT, z), V(x, flip ? yT : y0, z2), 0.016, YEL_D);
      }
    }
    // nose braces
    tube(V(x, y0, zFront), V(0, y0 + 0.15, 2.1));
    tube(V(x, yT, zFront), V(0, y0 + 0.15, 2.1), 0.024);
  }
  for (const z of ZC) {
    tube(V(-0.36, yT, z), V(0.36, yT, z), 0.02, YEL_D);
    ball(V(0, yR, z), 0.045);
  }
  tube(V(0, yR, zBack), V(0, yR, zFront), 0.032);
  tube(V(0, yR, zFront), V(0, y0 + 0.15, 2.1), 0.03);
  ball(V(0, y0 + 0.15, 2.1), 0.05, ORANGE);

  // stomach: bottles along the ridge
  for (let k = 0; k < 8; k++) {
    bottle(V(0, yR + 0.09, zBack + 0.25 + k * 0.33), V(0, 0, 1), 0.3, 0.055, k);
  }
  // pale side bottle lines
  for (const s of [1, -1])
    for (let k = 0; k < 4; k++)
      bottle(V(s * 0.2, yT + 0.17 - 0.0 * k, ZC[k] + 0.0), V(0, 0, 1), 0.24, 0.045, k + 1);

  // ---------------------------------------------------------------- rear sail
  const rowC = (t: number) => V(0, y0 + 0.3 + 0.95 * t, -1.5 - 0.7 * t);
  const rowW = (t: number) => 0.5 + 0.4 * t;
  let bi = 0;
  for (let k = 0; k <= 5; k++) {
    const t = k / 5;
    const c = rowC(t);
    const wv = rowW(t);
    tube(c.clone().add(V(-wv, 0, 0)), c.clone().add(V(wv, 0, 0)), 0.018, YEL_D);
    if (k === 0) continue;
    const nB = Math.floor((2 * wv) / 0.3);
    const step = (2 * wv) / nB;
    for (let j = 0; j < nB; j++) {
      const bx = -wv + (j + 0.5) * step;
      const cc = c.clone().add(V(bx, 0.07, 0));
      bottle(cc, V(j % 2 ? -1 : 1, 0, 0), step * 0.94, 0.06, bi++);
    }
  }
  for (const s of [1, -1]) {
    tube(rowC(0).add(V(s * 0.5, 0, 0)), rowC(1).add(V(s * 0.9, 0, 0)), 0.03);
    tube(V(s * 0.36, yT, zBack), rowC(0).add(V(s * 0.5, 0, 0)), 0.026);
    tube(V(0, yR, zBack), rowC(0.5).add(V(s * 0.7, 0, 0)), 0.02, YEL_D);
    ball(rowC(1).add(V(s * 0.9, 0.0, 0)), 0.05, ORANGE);
  }
  tube(rowC(0), rowC(1), 0.026);
  tube(V(0, yR, zBack), rowC(0.5), 0.02, YEL_D);

  // ---------------------------------------------------------------- feeler and vane
  const fp = [
    [0, y0 + 0.15, 2.1],
    [0, y0 + 0.22, 2.4],
    [0, y0 + 0.0, 2.7],
    [0, y0 - 0.3, 2.78],
  ];
  b.sweep(catmull(fp), 0.014, { color: YEL, caps: "round" });
  bottle(V(0, y0 - 0.5, 2.78), V(0, 1, 0), 0.34, 0.06, 0);
  tube(V(0, y0 - 0.33, 2.78), V(0, y0 - 0.3, 2.78), 0.012, BLK);

  tube(V(0, yR, 0.9), V(0, yR + 0.75, 0.9), 0.018, STEEL);
  ball(V(0, yR + 0.78, 0.9), 0.035, BLK);
  b.extrude(
    [
      [0, 0],
      [0.42, 0.07],
      [0, 0.2],
    ],
    { at: V(0, yR + 0.52, 0.9), x: [0, 0, -1], thickness: 0.012, color: ORANGE },
  );
  b.extrude(
    [
      [0, 0],
      [0.3, 0.05],
      [0, 0.1],
    ],
    { at: V(0, yR + 0.42, 0.9), x: [0, 0, -1], thickness: 0.012, color: WHITE },
  );

  return b.root;
}
```