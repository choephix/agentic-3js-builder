```ts
import * as THREE from "three";
import { createBuilder, mottle } from "agentic-3js-builder";

export const meta = {
  name: "Calder Mobile",
  description:
    "A hanging kinetic mobile in the style of Alexander Calder: thin black wire arms balanced on strings, carrying flat painted organic shapes in red, yellow, blue, black and white.",
};

type Pt = [number, number] | [number, number, "sharp"];

// ---- palette -------------------------------------------------------------
const WIRE = "#161616";
const BLACK = mottle("#141414", "#2a2a2c", { size: 0.09, contrast: 0.6, seed: 1 });
const RED = mottle("#cf2a1e", "#e4402b", { size: 0.1, contrast: 0.6, seed: 2 });
const YELLOW = mottle("#f0bd24", "#f8d44c", { size: 0.1, contrast: 0.6, seed: 3 });
const BLUE = mottle("#1b43a4", "#2b5ec0", { size: 0.1, contrast: 0.6, seed: 4 });
const WHITE = mottle("#efeadb", "#fbf8ee", { size: 0.1, contrast: 0.6, seed: 5 });

// ---- shape outlines (unit size, centred near origin) ---------------------
function blob(seed: number, sx = 1, sy = 1, n = 18): Pt[] {
  const p2 = seed * 1.7, p3 = seed * 2.9;
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = 1 + 0.16 * Math.cos(2 * a + p2) + 0.1 * Math.cos(3 * a + p3);
    pts.push([Math.cos(a) * r * sx, Math.sin(a) * r * sy]);
  }
  return pts;
}
function disc(n = 16): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push([Math.cos(a), Math.sin(a)]);
  }
  return pts;
}
function crescent(): Pt[] {
  const pts: Pt[] = [];
  const k = 9;
  for (let i = 0; i <= k; i++) {
    const a = ((-120 + (240 * i) / k) * Math.PI) / 180;
    pts.push([Math.cos(a), Math.sin(a)]);
  }
  for (let i = k; i >= 0; i--) {
    const a = ((-120 + (240 * i) / k) * Math.PI) / 180;
    pts.push([0.4 + 0.75 * Math.cos(a), 0.75 * Math.sin(a)]);
  }
  return pts;
}
function petal(): Pt[] {
  return [
    [0, -1, "sharp"],
    [0.5, -0.2],
    [0.35, 0.55],
    [0, 1, "sharp"],
    [-0.5, -0.2],
    [-0.35, 0.55],
  ];
}
function wedge(): Pt[] {
  return [
    [-0.9, -0.6],
    [0.9, -0.6],
    [0.1, 0.9],
  ];
}

const SHAPES: Record<string, { pts: () => Pt[]; smooth: number }> = {
  blob1: { pts: () => blob(1, 1, 0.8), smooth: 0 },
  blob2: { pts: () => blob(3, 0.7, 1.1), smooth: 0 },
  blob3: { pts: () => blob(5, 1.2, 0.6), smooth: 0 },
  disc: { pts: () => disc(), smooth: 0 },
  crescent: { pts: crescent, smooth: 0 },
  petal: { pts: petal, smooth: 1 },
  wedge: { pts: wedge, smooth: 2 },
};

// ---- the mobile tree -----------------------------------------------------
type Leaf = { shape: string; s: number; color: any; yaw: number };
type Arm = {
  len: number;
  t: number; // pivot fraction from the left end
  yaw: number;
  tilt: number;
  l: Node;
  r: Node;
  ld: number; // string drop on the left
  rd: number;
};
type Node = { leaf: Leaf } | { arm: Arm };

const leaf = (shape: string, s: number, color: any, yaw: number): Node => ({ leaf: { shape, s, color, yaw } });

const TREE: Arm = {
  len: 1.6,
  t: 0.42,
  yaw: 0.25,
  tilt: 0.02,
  ld: 0.45,
  rd: 0.3,
  l: {
    arm: {
      len: 0.95,
      t: 0.5,
      yaw: 1.1,
      tilt: -0.03,
      ld: 0.38,
      rd: 0.62,
      l: leaf("crescent", 0.2, BLACK, 0.5),
      r: {
        arm: {
          len: 0.5,
          t: 0.5,
          yaw: -0.4,
          tilt: 0.04,
          ld: 0.28,
          rd: 0.4,
          l: leaf("petal", 0.11, WHITE, 1.2),
          r: leaf("disc", 0.07, RED, 0.3),
        },
      },
    },
  },
  r: {
    arm: {
      len: 1.2,
      t: 0.55,
      yaw: -0.7,
      tilt: 0.03,
      ld: 0.7,
      rd: 0.35,
      l: {
        arm: {
          len: 0.8,
          t: 0.45,
          yaw: 0.9,
          tilt: -0.04,
          ld: 0.3,
          rd: 0.55,
          l: leaf("blob1", 0.14, YELLOW, -0.6),
          r: {
            arm: {
              len: 0.42,
              t: 0.5,
              yaw: 0.2,
              tilt: 0.03,
              ld: 0.3,
              rd: 0.22,
              l: leaf("wedge", 0.08, BLUE, 0.9),
              r: leaf("blob2", 0.065, BLACK, 0.1),
            },
          },
        },
      },
      r: leaf("disc", 0.24, RED, 0.7),
    },
  },
};

function make(yoff: number) {
  const b = createBuilder({ name: "calderMobile" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y + yoff, z);

  const string = (a: THREE.Vector3, c: THREE.Vector3) => b.rod(a, c, 0.0022, WIRE, { sides: 4 });
  const bead = (p: THREE.Vector3, r = 0.007) => b.part(new THREE.SphereGeometry(r, 6, 4), WIRE, { at: p });

  function buildLeaf(l: Leaf, at: THREE.Vector3) {
    const def = SHAPES[l.shape];
    let pts = def.pts().map((p) => [p[0] * l.s, p[1] * l.s, ...(p.length === 3 ? ["sharp" as const] : [])] as Pt);
    // top point sits under the string
    let top = pts[0];
    for (const p of pts) if (p[1] > top[1]) top = p;
    const tx = top[0], ty = top[1];
    pts = pts.map((p) => [p[0] - tx, p[1], ...(p.length === 3 ? ["sharp" as const] : [])] as Pt);
    const cy = at.y - ty - 0.004;
    const x = [Math.cos(l.yaw), 0, Math.sin(l.yaw)] as [number, number, number];
    b.extrude(pts, {
      at: [at.x, cy, at.z],
      x,
      thickness: 0.007,
      bevel: 0.0015,
      smoothing: def.smooth,
      color: l.color,
    });
    // tiny wire eyelet where the string enters
    b.part(new THREE.TorusGeometry(0.008, 0.0017, 4, 8), WIRE, {
      at: [at.x, at.y - 0.004, at.z],
      dir: [-Math.sin(l.yaw), 0, Math.cos(l.yaw)],
      axis: "z",
    });
  }

  function place(n: Node, at: THREE.Vector3) {
    if ("leaf" in n) return buildLeaf(n.leaf, at);
    const a = n.arm;
    const cy = Math.cos(a.tilt);
    const d = new THREE.Vector3(Math.cos(a.yaw) * cy, Math.sin(a.tilt), Math.sin(a.yaw) * cy);
    const left = at.clone().addScaledVector(d, -a.len * a.t);
    const right = at.clone().addScaledVector(d, a.len * (1 - a.t));
    // arm wire, with a slightly thicker centre bead where it is hung
    b.rod(left, right, 0.0042, WIRE, { sides: 5 });
    b.part(new THREE.SphereGeometry(0.0095, 6, 5), WIRE, { at });
    // looped ends
    for (const e of [left, right]) {
      b.part(new THREE.SphereGeometry(0.0075, 6, 4), WIRE, { at: e });
    }
    const hang = (end: THREE.Vector3, drop: number, child: Node) => {
      const low = end.clone().add(new THREE.Vector3(0, -drop, 0));
      string(end, low);
      bead(low, 0.006);
      place(child, low);
    };
    hang(left, a.ld, a.l);
    hang(right, a.rd, a.r);
  }

  const pivot = V(0, 2.3, 0);
  // ceiling hook
  const hookTop = V(0, 2.8, 0);
  b.part(new THREE.TorusGeometry(0.03, 0.005, 5, 12), WIRE, { at: hookTop.clone().add(new THREE.Vector3(0, 0.03, 0)), dir: [1, 0, 0], axis: "z" });
  b.part(new THREE.SphereGeometry(0.012, 6, 4), WIRE, { at: hookTop });
  string(hookTop, pivot);
  place({ arm: TREE }, pivot);

  const box = new THREE.Box3().setFromObject(b.root, true);
  return { root: b.root, minY: box.min.y };
}

export default function build(): THREE.Object3D {
  const first = make(0);
  // shift so the lowest hanging shape just touches the floor
  const shift = -first.minY + 0.0;
  const second = make(shift);
  return second.root;
}
```