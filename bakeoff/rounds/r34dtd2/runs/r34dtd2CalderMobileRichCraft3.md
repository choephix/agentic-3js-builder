```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Calder Hanging Mobile",
  description:
    "A balanced, hanging kinetic sculpture in the style of Alexander Calder: black wire arms in a nested tree, with flat painted organic shapes in red, yellow, blue, white and black.",
};

const WIRE = "#17171a";
const RED = "#d8261f";
const YEL = "#f2c418";
const BLU = "#1f4fa8";
const WHT = "#f2efe6";
const BLK = "#202024";

type Out = [number, number][] | [number, number, "sharp"][];
type Shape = "ell" | "lens" | "moon" | "drop";

type Leaf = { k: "leaf"; shape: Shape; col: string; w: number; h: number; rot: number };
type Arm = { k: "arm"; a: number; b: number; ang: number; l: Node; r: Node; dl: number; dr: number };
type Node = Leaf | Arm;

const leaf = (shape: Shape, col: string, w: number, h: number, rot = 0): Leaf => ({ k: "leaf", shape, col, w, h, rot });
const arm = (a: number, b: number, ang: number, l: Node, dl: number, r: Node, dr: number): Arm => ({
  k: "arm", a, b, ang, l, r, dl, dr,
});

function outline(shape: Shape, w: number, h: number): any[] {
  const pts: any[] = [];
  if (shape === "ell") {
    for (let i = 0; i < 16; i++) {
      const t = (i / 16) * Math.PI * 2;
      pts.push([Math.cos(t) * w / 2, Math.sin(t) * h / 2]);
    }
  } else if (shape === "lens") {
    pts.push([-w / 2, 0, "sharp"]);
    for (let i = 1; i < 7; i++) pts.push([-w / 2 + (w * i) / 7, (h / 2) * Math.sin((Math.PI * i) / 7)]);
    pts.push([w / 2, 0, "sharp"]);
    for (let i = 6; i >= 1; i--) pts.push([-w / 2 + (w * i) / 7, -(h / 2) * Math.sin((Math.PI * i) / 7)]);
  } else if (shape === "moon") {
    const R = h / 2;
    const sx = w / h;
    const outer: any[] = [];
    const inner: any[] = [];
    for (let i = 0; i <= 10; i++) {
      const th = ((-100 + 20 * i) * Math.PI) / 180;
      outer.push([R * Math.cos(th) * sx, R * Math.sin(th)]);
      const bite = 0.75 * R * Math.cos((th * 90) / 100) * sx;
      inner.push([R * Math.cos(th) * sx + bite * 0.9 + 0.0, R * Math.sin(th)]);
    }
    // outer arc runs bottom->top on the left bulge; inner returns top->bottom
    outer[0] = [outer[0][0], outer[0][1], "sharp"];
    outer[10] = [outer[10][0], outer[10][1], "sharp"];
    pts.push(...outer);
    for (let i = 9; i >= 1; i--) pts.push(inner[i]);
  } else {
    // teardrop
    pts.push([0, h / 2, "sharp"]);
    for (let i = 1; i < 10; i++) {
      const t = (i / 10) * Math.PI;
      pts.push([(Math.sin(t) * w) / 2 * (i < 5 ? 0.9 : 1), h / 2 - (h * (1 - Math.cos(t))) / 2 * 0.9 - 0.0]);
    }
    pts.push([0, -h / 2]);
    for (let i = 9; i >= 1; i--) {
      const t = (i / 10) * Math.PI;
      pts.push([-(Math.sin(t) * w) / 2 * (i < 5 ? 0.9 : 1), h / 2 - (h * (1 - Math.cos(t))) / 2 * 0.9]);
    }
  }
  return pts;
}

function height(n: Node): number {
  if (n.k === "leaf") return n.h - 0.01;
  return Math.max(n.dl + height(n.l), n.dr + height(n.r));
}

export default function build() {
  const b = createBuilder({ name: "calder_mobile" });

  const tree: Node = arm(
    0.5, 0.34, 0.2,
    arm(
      0.26, 0.16, -0.6,
      leaf("ell", RED, 0.2, 0.2, 0.3), 0.18,
      arm(0.14, 0.1, 0.8, leaf("lens", BLK, 0.24, 0.1, 0.5), 0.14, leaf("ell", YEL, 0.1, 0.1), 0.2), 0.12,
    ),
    0.2,
    arm(
      0.2, 0.3, 0.9,
      arm(0.16, 0.22, -0.4, leaf("moon", BLU, 0.18, 0.3, 1.0), 0.16, leaf("drop", WHT, 0.14, 0.26, -0.3), 0.1), 0.14,
      arm(
        0.2, 0.12, 0.3,
        leaf("lens", RED, 0.3, 0.12, -0.8), 0.1,
        arm(0.1, 0.08, 1.2, leaf("ell", BLU, 0.09, 0.09), 0.12, leaf("moon", YEL, 0.14, 0.2, 0.4), 0.2), 0.2,
      ),
      0.1,
    ),
    0.16,
  );

  const topWire = 0.3;
  const y0 = height(tree) + 0.0;

  const ball = new THREE.SphereGeometry(0.008, 6, 4);
  const addBall = (p: THREE.Vector3) => b.part(ball, WIRE, { at: p.toArray() as [number, number, number] });

  function place(n: Node, p: THREE.Vector3) {
    if (n.k === "leaf") {
      const c = n.rot;
      const x: [number, number, number] = [Math.cos(c), 0, Math.sin(c)];
      const out = outline(n.shape, n.w, n.h);
      b.extrude(out as any, {
        at: [p.x, p.y - n.h / 2 + 0.01, p.z],
        x,
        thickness: 0.008,
        bevel: 0.002,
        color: n.col,
      });
      return;
    }
    const d = new THREE.Vector3(Math.cos(n.ang), 0, Math.sin(n.ang));
    const pl = p.clone().addScaledVector(d, -n.a);
    const pr = p.clone().addScaledVector(d, n.b);
    b.rod(pl.toArray() as any, pr.toArray() as any, 0.0045, WIRE);
    addBall(p);
    for (const [e, dr, ch] of [
      [pl, n.dl, n.l],
      [pr, n.dr, n.r],
    ] as [THREE.Vector3, number, Node][]) {
      const q = e.clone().add(new THREE.Vector3(0, -dr, 0));
      b.rod(e.toArray() as any, q.toArray() as any, 0.0028, WIRE);
      addBall(e);
      place(ch, q);
    }
  }

  const root = new THREE.Vector3(0, y0, 0);
  place(tree, root);

  // suspension wire and ceiling hook
  b.rod([0, y0, 0], [0, y0 + topWire, 0], 0.003, WIRE);
  b.part(new THREE.TorusGeometry(0.03, 0.005, 6, 12), WIRE, {
    at: [0, y0 + topWire + 0.03, 0],
    rotation: [0, 0, 0],
  });

  return b.root;
}
```