```ts
import * as THREE from "three";
import { createBuilder, frame, catmull } from "agentic-3js-builder";

export const meta = {
  name: "Fennec kit on a dune",
  description:
    "A standing fennec fox kit with huge peach-lined ears, a gold-and-cream coat, a black-tipped tail, a woven leather collar and a brass bell.",
};

const CREAM = "#f5e6c8";
const GOLD = "#e0a65a";
const PEACH = "#f8c8a0";
const INK = "#2a1c16";
const TIP = "#1e1613";
const WHITE = "#ffffff";
const LEATHER_A = "#7c4a2a";
const LEATHER_B = "#5a3420";
const BRASS = "#e3b44f";
const DUNE_A = "#ebd09a";
const DUNE_B = "#cc9f62";

const ball = (r: number, seg = 12) =>
  new THREE.SphereGeometry(r, seg, Math.round(seg * 0.7));

const blob = (rx: number, ry: number, rz: number, seg = 12) => {
  const g = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.7));
  g.scale(rx, ry, rz);
  return g;
};

const cube = (s: number) => new THREE.BoxGeometry(s, s, s);

// Mirror a 2D outline across the ear's vertical axis, keeping its winding.
function mirror(outline: number[][], side: number): number[][] {
  const m = outline.map(([u, v]) => [u * side, v]);
  return side < 0 ? m.reverse() : m;
}

const EAR_SHELL = [
  [-0.058, 0], [0.058, 0], [0.062, 0.09], [0.042, 0.17],
  [0, 0.21], [-0.042, 0.17], [-0.062, 0.09],
];
const EAR_LINING = [
  [-0.042, 0.012], [0.042, 0.012], [0.046, 0.09], [0.03, 0.155],
  [0, 0.185], [-0.03, 0.155], [-0.046, 0.09],
];
const EAR_BASE = [0.06, 0.43, 0.175];

export default function build() {
  const b = createBuilder({ name: "fennec-kit" });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.285, -0.11] });
  const spinePts = [
    [0, 0.285, -0.11],
    [0, 0.295, 0.0],
    [0, 0.305, 0.08],
  ];
  const spine = b.chain("spine", catmull(spinePts), { role: "spine" });
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.305, 0.08],
      [0, 0.335, 0.135],
      [0, 0.365, 0.185],
    ]),
    { role: "neck" },
  );
  const head = b.joint("head", { at: [0, 0.385, 0.19], parent: hips });
  const jaw = b.joint("jaw", { at: [0, 0.342, 0.25], parent: head });
  const earL = b.joint("earL", { at: EAR_BASE, parent: head });
  const earR = b.joint("earR", {
    at: [-EAR_BASE[0], EAR_BASE[1], EAR_BASE[2]],
    parent: head,
  });

  // ---------- scenery: the dune the kit stands on ----------
  b.lathe(
    [[0, 0.1], [0.1, 0.098], [0.2, 0.085], [0.3, 0.058], [0.4, 0.024], [0.46, 0]],
    { at: [0, 0, 0], axis: [0, 1, 0], color: DUNE_A },
  );
  b.lathe([[0, 0.05], [0.09, 0.046], [0.16, 0.03], [0.2, 0]], {
    at: [0.3, 0, -0.22],
    axis: [0, 1, 0],
    color: DUNE_B,
  });
  b.stick(blob(0.026, 0.018, 0.022, 10), DUNE_B, frame([-0.22, 0.05, 0.14], [0, 1, 0]));
  b.stick(blob(0.018, 0.013, 0.016, 10), DUNE_B, frame([-0.27, 0.035, 0.2], [0, 1, 0]));

  // ---------- body: gold back over a cream belly ----------
  const bodyR = (t: number) => 0.066 + 0.01 * Math.sin(Math.PI * t);
  b.sweep(spine, { radius: bodyR, color: GOLD });
  b.sweep(
    catmull(spinePts.map(([x, y, z]) => [x, y - 0.024, z])),
    { radius: bodyR, color: CREAM },
  );
  b.stick(ball(0.066, 14), GOLD, frame([0, 0.285, -0.11], [0, 0, -1]));
  b.stick(ball(0.066, 14), GOLD, frame([0, 0.305, 0.08], [0, 0, 1]));
  b.stick(blob(0.05, 0.06, 0.04, 10), CREAM, frame([0, 0.27, 0.11], [0, 0, 1]));

  // ---------- neck and head ----------
  b.sweep(neck, { radius: (t: number) => 0.06 - 0.006 * t, color: GOLD });

  b.stick(ball(0.078, 16), GOLD, head);
  b.stick(blob(0.042, 0.036, 0.042, 12), CREAM, frame([0.042, 0.365, 0.235], [0, 0, 1]));
  b.stick(blob(0.042, 0.036, 0.042, 12), CREAM, frame([-0.042, 0.365, 0.235], [0, 0, 1]));
  b.sweep(
    catmull([
      [0, 0.385, 0.2],
      [0, 0.37, 0.26],
      [0, 0.36, 0.31],
    ]),
    { radius: (t: number) => 0.046 - 0.024 * t, color: CREAM },
  );
  b.stick(blob(0.026, 0.018, 0.04, 10), CREAM, jaw);
  b.stick(ball(0.021, 10), INK, frame([0, 0.362, 0.318], [0, 0, 1]));

  for (const s of [1, -1]) {
    b.stick(ball(0.024, 12), INK, frame([s * 0.04, 0.395, 0.25], [0, 0, 1]));
    b.stick(ball(0.0065, 8), WHITE, frame([s * 0.047, 0.404, 0.268], [0, 0, 1]));
  }

  // ---------- satin ears: gold shell, peach lining on the front ----------
  for (const s of [1, -1]) {
    const ear = s > 0 ? earL : earR;
    const base = [s * EAR_BASE[0], EAR_BASE[1], EAR_BASE[2]];
    const lean = [s * 0.3, 1, -0.08];
    b.extrude(mirror(EAR_SHELL, s), {
      at: ear,
      x: [1, 0, 0],
      y: lean,
      depth: 0.012,
      color: GOLD,
    });
    b.extrude(mirror(EAR_LINING, s), {
      at: [base[0], base[1], base[2] + 0.012],
      x: [1, 0, 0],
      y: lean,
      depth: 0.012,
      color: PEACH,
    });
  }

  // ---------- woven collar and brass bell ----------
  const axis = [0, 0.496, 0.868];
  const down = [0, -0.868, 0.496];
  const centre = [0, 0.335, 0.135];
  const R = 0.067;
  for (let row = 0; row < 2; row++) {
    const h = row === 0 ? -0.0085 : 0.0085;
    for (let i = 0; i < 24; i++) {
      const th = ((i + row * 0.5) / 24) * Math.PI * 2;
      const c = Math.cos(th);
      const sn = Math.sin(th);
      const radial = [c, down[1] * sn, down[2] * sn];
      const at = centre.map((v, k) => v + R * radial[k] + h * axis[k]);
      const col = (i + row) % 2 === 0 ? LEATHER_A : LEATHER_B;
      b.stick(cube(0.017), col, frame(at, radial));
    }
  }
  b.stick(ball(0.018, 12), BRASS, frame([0, 0.262, 0.182], [0, -1, 0]));
  b.stick(cube(0.01), BRASS, frame([0, 0.283, 0.17], [0, 1, 0]));
  b.stick(cube(0.008), INK, frame([0, 0.244, 0.182], [0, -1, 0]));

  // ---------- fluffy tail with a black tip ----------
  const tailPts = [
    [0, 0.29, -0.16],
    [0, 0.28, -0.25],
    [0, 0.29, -0.33],
    [0, 0.33, -0.38],
  ];
  const tail = b.chain("tail", catmull(tailPts), { role: "tail" });
  const tailR = (t: number) => 0.03 + 0.04 * Math.sin(Math.PI * t) + 0.008 * (1 - t);
  b.sweep(tail, { radius: tailR, color: GOLD });
  b.sweep(
    catmull(tailPts.map(([x, y, z]) => [x, y - 0.024, z])),
    { radius: (t: number) => tailR(t) * 0.88, color: CREAM },
  );
  b.stick(ball(0.044, 12), TIP, tail.at(0.93));

  // ---------- legs with oversized cream paws ----------
  const leg = (name: string, x: number, zTop: number, zKnee: number, zAnkle: number, zPaw: number) => {
    const lg = b.chain(
      name,
      catmull([
        [x, 0.27, zTop],
        [x, 0.17, zKnee],
        [x, 0.125, zAnkle],
      ]),
      { role: "leg" },
    );
    b.sweep(lg, { radius: (t: number) => 0.026 - 0.008 * t, color: GOLD });
    b.stick(ball(0.042, 12), CREAM, frame([x, 0.11, zPaw], [0, 0, 1]));
  };
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    leg(`legF${side}`, s * 0.05, 0.06, 0.075, 0.085, 0.108);
    leg(`legH${side}`, s * 0.055, -0.09, -0.105, -0.085, -0.06);
  }

  return b.root;
}
```