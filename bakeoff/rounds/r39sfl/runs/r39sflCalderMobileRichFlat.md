```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Calder Mobile",
  description: "A hanging abstract mobile in the manner of Alexander Calder: black wire arms and strings carrying red, yellow, blue, white and black organic discs and leaves.",
};

const BLACK = "#16161a";
const RED = "#d62a1e";
const YELLOW = "#f2c314";
const BLUE = "#1e4fa8";
const WHITE = "#f4f0e6";
const WIRE = "#26262b";

type Leaf = { leaf: string; color: string; size: number; drop: number; tilt?: number };
type Arm = { len: number; pivot: number; yaw: number; drop: number; a: Node; b: Node; dropA?: number; dropB?: number };
type Node = Leaf | Arm;

const isLeaf = (n: Node): n is Leaf => "leaf" in n;

export default function build() {
  const b = createBuilder({ name: "calderMobile" });

  const tree: Arm = {
    len: 1.4, pivot: 0.4, yaw: 0, drop: 0,
    a: {
      len: 0.62, pivot: 0.5, yaw: 50, drop: 0.35,
      a: { leaf: "disc", color: WHITE, size: 0.09, drop: 0.2 },
      b: { leaf: "crescent", color: RED, size: 0.14, drop: 0.28 },
    },
    b: {
      len: 1.1, pivot: 0.45, yaw: 70, drop: 0.3,
      a: {
        len: 0.72, pivot: 0.42, yaw: -40, drop: 0.4,
        a: { leaf: "disc", color: YELLOW, size: 0.13, drop: 0.2 },
        b: { leaf: "petal", color: BLUE, size: 0.17, drop: 0.3 },
      },
      b: { leaf: "petal", color: BLACK, size: 0.24, drop: 0.55 },
    },
    dropA: 0.45,
    dropB: 0.5,
  };

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  function string(top: THREE.Vector3, bottom: THREE.Vector3) {
    b.rod(top, bottom, 0.0022, WIRE);
  }

  function leaf(n: Leaf, top: THREE.Vector3, dir: THREE.Vector3) {
    const s = n.size;
    const center = top.clone().add(V(0, -n.drop - s, 0));
    string(top, center.clone().add(V(0, s * 0.9, 0)));
    b.part(new THREE.SphereGeometry(0.008, 6, 4), WIRE, { at: top });
    const normal = V(-dir.z, 0, dir.x);
    if (n.leaf === "disc") {
      const g = new THREE.CylinderGeometry(s, s, 0.008, 20);
      g.scale(1, 1, 0.8);
      b.part(g, n.color, { at: center, dir: normal, axis: "y" });
      return;
    }
    let outline: [number, number][];
    if (n.leaf === "petal") {
      outline = [[-s * 0.55, 0], [0, s * 1.1], [s * 0.55, 0], [0, -s * 1.1]];
    } else {
      // crescent
      outline = [[-s, s * 0.4], [-s * 0.2, s * 0.95], [s * 0.7, s * 0.6], [s, -s * 0.2], [s * 0.5, -s * 0.9],
        [s * 0.5, -s * 0.2], [s * 0.1, s * 0.2], [-s * 0.4, s * 0.25]];
    }
    b.extrude(outline, { at: center, x: [dir.x, 0, dir.z], thickness: 0.008, smoothing: 2, color: n.color });
  }

  function arm(n: Arm, attach: THREE.Vector3) {
    const yaw = (n.yaw * Math.PI) / 180;
    const dir = V(Math.cos(yaw), 0, Math.sin(yaw));
    const p0 = attach.clone().addScaledVector(dir, -n.len * n.pivot);
    const p1 = attach.clone().addScaledVector(dir, n.len * (1 - n.pivot));
    b.rod(p0, p1, 0.005, BLACK);
    b.part(new THREE.SphereGeometry(0.011, 6, 4), BLACK, { at: p0 });
    b.part(new THREE.SphereGeometry(0.011, 6, 4), BLACK, { at: p1 });
    b.part(new THREE.TorusGeometry(0.014, 0.003, 5, 10), WIRE, { at: attach, dir: V(-dir.z, 0, dir.x), axis: "z" });
    const kids: [Node, THREE.Vector3, number][] = [
      [n.a, p0, n.dropA ?? 0],
      [n.b, p1, n.dropB ?? 0],
    ];
    for (const [k, p, d] of kids) {
      if (isLeaf(k)) {
        leaf(k, p, dir);
      } else {
        const drop = d || k.drop || 0.3;
        const next = p.clone().add(V(0, -drop, 0));
        string(p, next);
        arm(k, next);
      }
    }
  }

  const top = V(0, 3, 0);
  const rootAttach = V(0, 2.6, 0);
  // ceiling hook and string
  b.part(new THREE.TorusGeometry(0.05, 0.007, 6, 14), BLACK, { at: top.clone().add(V(0, 0.05, 0)), dir: [1, 0, 0], axis: "z" });
  string(top, rootAttach);
  arm(tree, rootAttach);

  // sit the lowest point on the floor
  const box = new THREE.Box3().setFromObject(b.root, true);
  b.root.position.y = -box.min.y;
  return b.root;
}
```