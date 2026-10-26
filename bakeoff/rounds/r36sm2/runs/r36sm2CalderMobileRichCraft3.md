```ts
import * as THREE from "three";
import { createBuilder, mottle } from "agentic-3js-builder";

export const meta = {
  name: "Calder Mobile",
  description:
    "A hanging kinetic mobile in the manner of Alexander Calder: thin wire arms balanced in a cascade, with black, red, blue, yellow and white sheet-metal organic shapes, hung from a ceiling canopy.",
};

// ---------- palette ----------
const WIRE = "#17171b";
const BLACK = "#1b1b20";
const RED = "#d3241a";
const BLUE = "#1d4fa6";
const YELLOW = "#f1bf26";
const WHITE = "#f2eee2";

const sheet = (c: string, shade: string) => mottle(c, shade, { size: 0.09, contrast: 0.5, seed: 4 });
const PAINT: Record<string, ReturnType<typeof sheet>> = {
  [BLACK]: sheet(BLACK, "#2c2c34"),
  [RED]: sheet(RED, "#a81a12"),
  [BLUE]: sheet(BLUE, "#163b82"),
  [YELLOW]: sheet(YELLOW, "#d49f14"),
  [WHITE]: sheet(WHITE, "#d8d2c0"),
};

// ---------- outlines (unit ~1 m, centred) ----------
type Pt = [number, number] | [number, number, "sharp"];
const poly = (n: number, rx: number, ry: number): Pt[] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [Math.cos(a) * rx, Math.sin(a) * ry] as Pt;
  });

function crescent(): Pt[] {
  const out: Pt[] = [];
  for (let a = 90; a >= -90; a -= 30) {
    const r = (a * Math.PI) / 180;
    out.push(Math.abs(a) === 90 ? [0.5 * Math.cos(r), 0.5 * Math.sin(r), "sharp"] : [0.5 * Math.cos(r), 0.5 * Math.sin(r)]);
  }
  const phi0 = Math.asin(0.5 / 0.583);
  for (let k = 1; k < 6; k++) {
    const p = -phi0 + (2 * phi0 * k) / 6;
    out.push([-0.3 + 0.583 * Math.cos(p), 0.583 * Math.sin(p)]);
  }
  return out;
}

const OUT: Record<string, { pts: Pt[]; smooth: number }> = {
  leaf: {
    pts: [[0, 0.5, "sharp"], [-0.3, 0.1], [-0.22, -0.25], [0, -0.5, "sharp"], [0.2, -0.3], [0.3, 0.1]],
    smooth: 2,
  },
  disc: { pts: poly(14, 0.5, 0.5), smooth: 0 },
  kidney: {
    pts: [[-0.5, 0.1], [-0.3, 0.35], [0.1, 0.3], [0.45, 0.1], [0.5, -0.2], [0.2, -0.3], [0, -0.1], [-0.25, -0.3], [-0.5, -0.15]],
    smooth: 2,
  },
  crescent: { pts: crescent(), smooth: 0 },
  drop: {
    pts: [[0, 0.5, "sharp"], [-0.2, 0], [-0.28, -0.25], [0, -0.45], [0.28, -0.25], [0.2, 0]],
    smooth: 2,
  },
  oval: { pts: poly(16, 0.28, 0.5), smooth: 0 },
  blade: {
    pts: [[0, 0.5, "sharp"], [-0.1, 0.1], [-0.3, -0.5, "sharp"], [0.05, -0.2], [0.22, 0.0]],
    smooth: 1,
  },
};

// ---------- tree description ----------
type Shape = { t: "shape"; o: string; s: number; c: string; yaw: number; inlay?: string; k?: number };
type Arm = { t: "arm"; l: number; r: number; yaw: number; tilt: number; L: Node; R: Node; dl: number; dr: number };
type Node = Shape | Arm;

const sh = (o: string, s: number, c: string, yaw: number, inlay?: string, k = 0.42): Shape => ({
  t: "shape", o, s, c, yaw, inlay, k,
});
const arm = (l: number, r: number, yaw: number, tilt: number, dl: number, L: Node, dr: number, R: Node): Arm => ({
  t: "arm", l, r, yaw, tilt, L, R, dl, dr,
});

const TREE: Arm = arm(
  0.55, 0.78, 20, 2.5,
  0.2,
  arm(
    0.26, 0.3, -35, -4,
    0.3, sh("leaf", 0.34, BLACK, 20),
    0.16, arm(0.14, 0.2, 60, 5, 0.22, sh("disc", 0.15, RED, 0), 0.34, sh("drop", 0.24, YELLOW, 40)),
  ),
  0.3,
  arm(
    0.3, 0.52, 70, -3,
    0.22,
    arm(
      0.16, 0.24, 10, 6,
      0.26, sh("kidney", 0.3, BLUE, 30, WHITE),
      0.4, sh("oval", 0.26, WHITE, -20, RED, 0.3),
    ),
    0.2,
    arm(
      0.34, 0.2, -50, 3,
      0.18,
      arm(0.12, 0.18, 30, -6, 0.3, sh("crescent", 0.28, RED, 15), 0.2, sh("disc", 0.12, BLUE, 0)),
      0.46, sh("leaf", 0.5, BLACK, -30, YELLOW, 0.35),
    ),
  ),
);

// ---------- builder ----------
export default function build() {
  const b = createBuilder({ name: "calderMobile" });
  const R_WIRE = 0.0035;
  let minY = Infinity;

  const norm = (name: string, s: number) => {
    const o = OUT[name];
    const ys = o.pts.map((p) => p[1] * s);
    const top = Math.max(...ys);
    const bot = Math.min(...ys);
    const pts = o.pts.map((p) => {
      const q: any = [p[0] * s, p[1] * s - top];
      if (p.length === 3) q.push("sharp");
      return q as Pt;
    });
    return { pts, smooth: o.smooth, h: top - bot };
  };

  function place(node: Node, C: THREE.Vector3, real: boolean) {
    if (real) b.part(new THREE.SphereGeometry(0.008, 6, 4), WIRE, { at: C.toArray() as [number, number, number] });
    if (node.t === "shape") {
      const n = norm(node.o, node.s);
      minY = Math.min(minY, C.y - 0.006 - n.h);
      if (!real) return;
      const yaw = (node.yaw * Math.PI) / 180;
      const x: [number, number, number] = [Math.cos(yaw), 0, -Math.sin(yaw)];
      const at: [number, number, number] = [C.x, C.y - 0.006, C.z];
      b.extrude(n.pts, { at, x, thickness: 0.006, smoothing: n.smooth, color: PAINT[node.c], bevel: 0.0015 });
      if (node.inlay) {
        const cy = -n.h / 2;
        const k = node.k ?? 0.42;
        const ip = n.pts.map((p) => {
          const q: any = [p[0] * k, cy + (p[1] - cy) * k];
          if (p.length === 3) q.push("sharp");
          return q as Pt;
        });
        b.extrude(ip, { at, x, thickness: 0.011, smoothing: n.smooth, color: PAINT[node.inlay] });
      }
      return;
    }
    const yaw = (node.yaw * Math.PI) / 180;
    const tilt = (node.tilt * Math.PI) / 180;
    const dir = new THREE.Vector3(Math.cos(tilt) * Math.cos(yaw), Math.sin(tilt), -Math.cos(tilt) * Math.sin(yaw));
    const A = C.clone().addScaledVector(dir, -node.l);
    const B = C.clone().addScaledVector(dir, node.r);
    if (real) {
      b.rod(A.toArray() as any, B.toArray() as any, R_WIRE, { color: WIRE, sides: 5 });
      // end balls (counterweights) for a finished look
      for (const E of [A, B])
        b.part(new THREE.SphereGeometry(0.007, 6, 4), WIRE, { at: E.toArray() as any });
    }
    const ends: [THREE.Vector3, number, Node][] = [
      [A, node.dl, node.L],
      [B, node.dr, node.R],
    ];
    for (const [E, drop, child] of ends) {
      const loopC = E.clone().add(new THREE.Vector3(0, -0.012, 0));
      if (real) {
        b.part(new THREE.TorusGeometry(0.012, 0.0025, 5, 8), WIRE, {
          at: loopC.toArray() as any,
          rotation: [0, node.yaw, 0],
        });
      }
      const low = E.clone().add(new THREE.Vector3(0, -0.024, 0));
      const next = E.clone().add(new THREE.Vector3(0, -0.024 - drop, 0));
      if (real) b.rod(low.toArray() as any, next.toArray() as any, 0.0022, { color: WIRE, sides: 4 });
      place(child, next, real);
    }
  }

  // pass 1: measure
  place(TREE, new THREE.Vector3(0, 0, 0), false);
  const topY = -minY;
  const P = new THREE.Vector3(0, topY, 0);

  // pass 2: build
  place(TREE, P, true);

  // hanging wire, hook and ceiling canopy
  const wireTop = topY + 0.55;
  b.rod([0, topY, 0], [0, wireTop, 0], 0.0028, { color: WIRE, sides: 4 });
  b.part(new THREE.TorusGeometry(0.016, 0.003, 5, 8), WIRE, { at: [0, topY + 0.02, 0] });
  b.lathe(
    [[0, 0], [0.075, 0], [0.075, 0.012], [0.04, 0.03], [0.012, 0.045], [0, 0.045]],
    { at: [0, wireTop - 0.01, 0], color: "#cfcabb", segments: 12, smoothing: 0 },
  );
  b.part(new THREE.SphereGeometry(0.012, 6, 4), WIRE, { at: [0, wireTop, 0] });

  return b.root;
}
```