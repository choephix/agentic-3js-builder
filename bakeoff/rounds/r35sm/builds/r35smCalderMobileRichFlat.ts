import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Calder Mobile",
  description:
    "A hanging kinetic mobile in the manner of Alexander Calder: black wire arms balanced in a nested tree, with red, yellow, blue, black and white organic discs, leaves and balls hanging at the ends.",
};

const RED = "#d7261e";
const YELLOW = "#f2c018";
const BLUE = "#1f4fa8";
const BLACK = "#151515";
const WHITE = "#f2efe6";
const WIRE = "#1a1a1a";

type Item = {
  k: "blob" | "ellipse" | "ball";
  rx: number;
  ry?: number;
  c: string;
  drop: number;
  yaw?: number;
  flat?: boolean;
  seed?: number;
};
type Spec = {
  drop: number;
  len: number;
  ang: number;
  split: number;
  tilt?: number;
  a: Item | { node: Spec; drop: number };
  b: Item | { node: Spec; drop: number };
};

const TREE: Spec = {
  drop: 0.3,
  len: 1.05,
  ang: 20,
  split: 0.5,
  tilt: 0.02,
  a: {
    drop: 0.3,
    node: {
      drop: 0.0,
      len: 0.62,
      ang: 80,
      split: 0.45,
      tilt: -0.02,
      a: { k: "blob", rx: 0.1, ry: 0.085, c: RED, drop: 0.24, seed: 3, yaw: 30 },
      b: {
        drop: 0.2,
        node: {
          drop: 0.0,
          len: 0.38,
          ang: -40,
          split: 0.5,
          a: { k: "ellipse", rx: 0.065, ry: 0.065, c: YELLOW, drop: 0.14, flat: true },
          b: { k: "blob", rx: 0.05, ry: 0.11, c: BLACK, drop: 0.3, seed: 8, yaw: 70 },
        },
      },
    },
  },
  b: {
    drop: 0.42,
    node: {
      drop: 0.0,
      len: 0.85,
      ang: -60,
      split: 0.4,
      tilt: 0.03,
      a: { k: "blob", rx: 0.14, ry: 0.12, c: BLUE, drop: 0.26, seed: 5, yaw: -20 },
      b: {
        drop: 0.22,
        node: {
          drop: 0.0,
          len: 0.52,
          ang: 30,
          split: 0.5,
          a: { k: "ellipse", rx: 0.045, ry: 0.1, c: WHITE, drop: 0.2, yaw: 45 },
          b: { k: "ball", rx: 0.04, c: RED, drop: 0.38 },
        },
      },
    },
  },
};

function outline(it: Item): [number, number][] {
  const ry = it.ry ?? it.rx;
  const r = rng(it.seed ?? 1);
  const n = it.k === "blob" ? 14 : 20;
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const v = it.k === "blob" ? 0.78 + 0.3 * Math.sin(a * 2 + (it.seed ?? 1)) * 0.6 + 0.12 * r() : 1;
    pts.push([Math.cos(a) * it.rx * v, Math.sin(a) * ry * v]);
  }
  return pts;
}

export default function build() {
  const b = createBuilder({ name: "calderMobile" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  let minY = Infinity;

  const wire = (p: THREE.Vector3, q: THREE.Vector3, r: number, emit: boolean) => {
    if (emit) b.rod(p, q, r, WIRE, { sides: 5 });
  };

  const hang = (E: THREE.Vector3, it: Item, emit: boolean) => {
    const Q = V(E.x, E.y - it.drop, E.z);
    wire(E, Q, 0.0018, emit);
    const yaw = ((it.yaw ?? 0) * Math.PI) / 180;
    const cs = Math.cos(yaw);
    const sn = Math.sin(yaw);
    if (it.k === "ball") {
      const c = V(Q.x, Q.y - it.rx * 0.9, Q.z);
      minY = Math.min(minY, c.y - it.rx);
      if (emit) b.part(new THREE.SphereGeometry(it.rx, 12, 8), it.c, { at: c, flat: true });
      return;
    }
    const ry = it.ry ?? it.rx;
    if (it.flat) {
      const c = V(Q.x, Q.y - 0.004, Q.z);
      minY = Math.min(minY, c.y - 0.004);
      if (emit)
        b.extrude(outline(it), { at: c, x: [cs, 0, sn], y: [-sn, 0, cs], thickness: 0.006, color: it.c });
      return;
    }
    const c = V(Q.x, Q.y - ry * 0.9, Q.z);
    minY = Math.min(minY, c.y - ry);
    if (emit) {
      b.extrude(outline(it), { at: c, x: [cs, 0, sn], y: [0, 1, 0], thickness: 0.006, color: it.c });
      // small eyelet where the wire meets the shape
      b.part(new THREE.SphereGeometry(0.007, 6, 4), WIRE, { at: Q });
    }
  };

  const walk = (P: THREE.Vector3, s: Spec, emit: boolean) => {
    const A = V(P.x, P.y - s.drop, P.z);
    wire(P, A, 0.002, emit);
    const a = (s.ang * Math.PI) / 180;
    const d = V(Math.cos(a), 0, Math.sin(a));
    const tilt = s.tilt ?? 0;
    const E1 = V(A.x - d.x * s.len * s.split, A.y + tilt, A.z - d.z * s.len * s.split);
    const E2 = V(A.x + d.x * s.len * (1 - s.split), A.y - tilt, A.z + d.z * s.len * (1 - s.split));
    if (emit) {
      b.rod(E1, E2, 0.0028, WIRE, { sides: 5 });
      b.part(new THREE.SphereGeometry(0.009, 8, 6), WIRE, { at: A });
      b.part(new THREE.SphereGeometry(0.006, 6, 4), WIRE, { at: E1 });
      b.part(new THREE.SphereGeometry(0.006, 6, 4), WIRE, { at: E2 });
    }
    for (const [E, it] of [
      [E1, s.a],
      [E2, s.b],
    ] as const) {
      if ("node" in it) {
        const Q = V(E.x, E.y - it.drop, E.z);
        wire(E, Q, 0.0018, emit);
        walk(Q, it.node, emit);
        // the sub-node's own drop is 0, so its arm starts at Q
      } else hang(E, it, emit);
    }
  };

  walk(V(0, 0, 0), TREE, false);
  const top = -minY + 0.0;
  const hookY = top + 0.35;
  // ceiling hook: a ring and a short stem down to the first wire
  const P = V(0, top, 0);
  b.rod(V(0, hookY, 0), P, 0.002, WIRE, { sides: 5 });
  b.part(new THREE.TorusGeometry(0.03, 0.004, 6, 14), WIRE, { at: [0, hookY + 0.03, 0], rotation: [90, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.012, 8), WIRE, { at: [0, hookY, 0] });
  walk(P, TREE, true);

  return b.root;
}
