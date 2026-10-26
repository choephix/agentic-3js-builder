import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Calder Hanging Mobile",
  description:
    "A balanced hanging mobile in the manner of Alexander Calder: black wire arms in nested balance, with painted sheet-metal leaves, discs and blobs in red, yellow, blue, black and white.",
};

const WIRE = "#1b1b1f";
const RED = "#d6281f";
const YEL = "#f2c014";
const BLU = "#1f4fa8";
const BLK = "#141416";
const WHT = "#f1ede2";

type V = [number, number, number];
type Kind = "ellipse" | "leaf" | "peanut" | "tri" | "disc";
type Shape = { s: Kind; size: number; color: string; rot: number; drop: number; stretch?: number };
type Arm = { arm: true; L: number; ang: number; r: number; kids: [Node, Node]; drops: [number, number] };
type Node = Shape | Arm;

const sh = (s: Kind, size: number, color: string, rot: number, drop = 0.25, stretch = 1): Shape => ({
  s, size, color, rot, drop, stretch,
});
const arm = (L: number, ang: number, r: number, kids: [Node, Node], drops: [number, number]): Arm => ({
  arm: true, L, ang, r, kids, drops,
});

function outline(kind: Kind, k: number): [number, number, "sharp"?][] {
  const pts: [number, number][] = [];
  if (kind === "ellipse" || kind === "disc") {
    const n = kind === "disc" ? 20 : 16;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push([Math.cos(a) * (kind === "disc" ? 1 : 0.7), Math.sin(a) * k]);
    }
    return pts as any;
  }
  if (kind === "leaf") {
    const n = 9;
    for (let i = 1; i < n; i++) {
      const t = i / n;
      pts.push([0.6 * Math.pow(Math.sin(Math.PI * t), 0.8), -1 + 2 * t]);
    }
    pts.push([0, 1]);
    for (let i = n - 1; i >= 1; i--) {
      const t = i / n;
      pts.push([-0.6 * Math.pow(Math.sin(Math.PI * t), 0.8), -1 + 2 * t]);
    }
    pts.unshift([0, -1]);
    return pts as any;
  }
  if (kind === "peanut") {
    const n = 20;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = 0.8 + 0.3 * Math.cos(2 * a);
      pts.push([Math.cos(a) * r, Math.sin(a) * r * 0.75]);
    }
    return pts as any;
  }
  return [[-1, -0.8, "sharp"], [1, -0.8, "sharp"], [0.1, 1, "sharp"]];
}

function make(dy: number) {
  const b = createBuilder({ name: "calder_mobile" });
  let minY = Infinity;
  const P = (x: number, y: number, z: number): V => [x, y + dy, z];
  const wire = (a: V, c: V, r = 0.0035) => b.rod(a, c, r, WIRE);

  function shape(top: V, n: Shape) {
    const s = n.size;
    const cy = top[1] - 0.04 - s;
    const c: V = [top[0], cy, top[2]];
    const pts = outline(n.s, 1).map((p) => [p[0] * s, p[1] * s * (n.stretch ?? 1), ...(p[2] ? ["sharp"] : [])]) as any;
    b.extrude(pts, {
      at: c,
      x: [Math.cos(n.rot), 0, Math.sin(n.rot)],
      y: [0.12, 1, 0.08],
      thickness: 0.006,
      color: n.color,
    });
    wire(top, [top[0], cy + s * 0.9 * (n.stretch ?? 1), top[2]], 0.003);
    b.part(new THREE.SphereGeometry(0.01, 6, 4), WIRE, { at: top });
    minY = Math.min(minY, cy - s * 1.05 * Math.max(1, n.stretch ?? 1) - dy);
  }

  function build(C: V, n: Node) {
    if (!("arm" in n)) return shape(C, n);
    const d: V = [Math.cos(n.ang), 0, Math.sin(n.ang)];
    const eL: V = [C[0] + d[0] * n.L * (1 - n.r), C[1], C[2] + d[2] * n.L * (1 - n.r)];
    const eR: V = [C[0] - d[0] * n.L * n.r, C[1], C[2] - d[2] * n.L * n.r];
    b.rod(eL, eR, 0.005, WIRE);
    b.part(new THREE.SphereGeometry(0.013, 6, 4), WIRE, { at: C });
    [eL, eR].forEach((e, i) => {
      const T: V = [e[0], e[1] - n.drops[i], e[2]];
      b.part(new THREE.SphereGeometry(0.008, 5, 4), WIRE, { at: e });
      wire(e, T);
      build(T, n.kids[i]);
    });
  }

  const tree = arm(1.3, 0.25, 0.42,
    [
      arm(0.8, 1.2, 0.5,
        [
          sh("leaf", 0.2, BLK, 0.4, 0.2),
          arm(0.5, -0.5, 0.45, [sh("disc", 0.1, RED, 1.0, 0.18), sh("ellipse", 0.13, WHT, 0.2, 0.25, 1.3)], [0.25, 0.2]),
        ],
        [0.22, 0.3]),
      arm(0.95, -0.7, 0.36,
        [
          arm(0.55, 0.3, 0.5, [sh("peanut", 0.14, YEL, 0.7, 0.2), sh("tri", 0.1, BLU, 1.2, 0.2)], [0.3, 0.28]),
          arm(0.7, 1.0, 0.4,
            [
              sh("disc", 0.15, BLU, 0.1, 0.22),
              arm(0.4, -1.0, 0.5, [sh("leaf", 0.12, RED, 0.5, 0.2), sh("disc", 0.07, BLK, 0.0, 0.18)], [0.2, 0.3]),
            ],
            [0.3, 0.35]),
        ],
        [0.4, 0.3]),
    ],
    [0.28, 0.45]);

  const topC = P(0, 2.2, 0);
  build(topC, tree);
  // hook and ring
  const hookTop = P(0, 2.6, 0);
  wire(topC, hookTop, 0.004);
  b.part(new THREE.TorusGeometry(0.03, 0.005, 5, 12), WIRE, { at: P(0, 2.63, 0), dir: [0, 0, 1], axis: "z" });
  return { b, minY: Math.min(minY, 0) };
}

export default function build() {
  const first = make(0);
  const second = make(-first.minY);
  return second.b.root;
}
