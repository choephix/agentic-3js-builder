```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import type { Builder } from "agentic-3js-builder";

export const meta = {
  name: "Calder Mobile",
  description: "A hanging mobile in the manner of Alexander Calder: black wire arms balancing painted red, blue, yellow and black sheet-metal shapes.",
};

export const REQUESTS = [
  { id: "redDiscRim", kind: "add", part: "redDisc", what: "Thin white painted rim line and a tiny rivet-like pivot dot where the wire joins the big red disc, in WHITE and BLACK.", at: [-1.26, 1.4, -0.06], normal: [0, 0, 1], bone: null, room: [0.5, 0.5, 0.1] },
  { id: "blueLeafVein", kind: "add", part: "blueLeaf", what: "Slim raised midrib and a few short side veins on the blue leaf in a darker BLUE_DARK, as thin strips seated on its face.", at: [-0.5, 1.05, 0.0], normal: [0, 0, 1], bone: null, room: [0.3, 0.55, 0.08] },
  { id: "yellowLeafCut", kind: "add", part: "yellowLeaf", what: "Two small round cut-out-look dots in BLACK and a thin BLACK edge line near the tip of the long yellow leaf.", at: [0.2, 0.4, 0.2], normal: [0, 0, 1], bone: null, room: [0.3, 0.75, 0.08] },
  { id: "blackHalfDots", kind: "add", part: "blackHalf", what: "A row of three small WHITE dots along the flat top edge of the black half-disc.", at: [1.3, 1.1, 0.1], normal: [0, 0, 1], bone: null, room: [0.45, 0.25, 0.08] },
  { id: "smallRedStar", kind: "add", part: "redSmall", what: "A tiny YELLOW disc inset in the small red disc, as a layered bullseye.", at: [0.55, 0.7, 0.3], normal: [0, 0, 1], bone: null, room: [0.35, 0.35, 0.08] },
  { id: "armCounterweights", kind: "add", part: "arm1", what: "Small black counterweight beads and twisted wire loops at the ends of the top arm.", at: [-0.88, 2.3, -0.18], normal: [0, 1, 0], bone: null, room: [0.2, 0.2, 0.2] },
  { id: "ceilingHook", kind: "add", part: "canopy", what: "Brass-like hook and swivel detail under the ceiling canopy, with a small collar ring.", at: [0, 2.85, 0], normal: [0, 1, 0], bone: null, room: [0.2, 0.25, 0.2] },
  { id: "whiteAccent", kind: "add", part: "arm4", what: "A small WHITE ellipse accent hung on a short extra wire from the middle of the second arm.", at: [-0.9, 1.7, -0.18], normal: [0, -1, 0], bone: null, room: [0.25, 0.4, 0.1] },
  { id: "redDiscTex", kind: "texture", part: "redDisc", what: "Subtle brushed matte paint in RED with faint darker brush strokes and a few tiny chips showing grey metal." },
  { id: "blueLeafTex", kind: "texture", part: "blueLeaf", what: "Matte BLUE paint with slight sprayed gradient toward the tip and fine edge wear." },
  { id: "yellowLeafTex", kind: "texture", part: "yellowLeaf", what: "Sunny YELLOW enamel with soft hand-painted streaks along its length." },
];

export const RED = "#d62a1f";
export const BLUE = "#1f4fc4";
export const YELLOW = "#f2c418";
export const BLACK = "#16161a";
export const WHITE = "#f4f1e8";
export const WIRE = "#26262b";

export const STAGE2: ((b: Builder) => void)[] = [];

type V = [number, number, number];
type Shape = { kind: string; r: number; h?: number; color: string; name: string };
type Node =
  | { t: "el"; s: Shape; rot: number }
  | { t: "arm"; drop: number; la: number; lb: number; yaw: number; a: [number, Node]; b: [number, Node]; name: string };

function ellipse(rx: number, ry: number, n = 20): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    out.push([rx * Math.sin(a), -ry + ry * Math.cos(a)]);
  }
  return out;
}
function outlineOf(s: Shape): any[] {
  if (s.kind === "disc") return ellipse(s.r, s.r, 20);
  if (s.kind === "half") {
    const o: [number, number][] = [];
    for (let i = 0; i <= 10; i++) {
      const a = (i / 10) * Math.PI;
      o.push([s.r * Math.cos(a), -s.r * Math.sin(a)]);
    }
    return o;
  }
  const h = s.h ?? 0.5;
  return [
    [0, 0, "sharp"],
    [s.r * 0.7, -h * 0.25],
    [s.r, -h * 0.5],
    [s.r * 0.6, -h * 0.8],
    [0, -h, "sharp"],
    [-s.r * 0.6, -h * 0.8],
    [-s.r, -h * 0.5],
    [-s.r * 0.7, -h * 0.25],
  ];
}

export default function build() {
  const b = createBuilder({ name: "calderMobile" });
  const V3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const wire = (a: THREE.Vector3, c: THREE.Vector3) => b.rod(a, c, 0.004, WIRE, { name: "wire" });
  const bead = (p: THREE.Vector3, r: number, color = WIRE) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { at: p, name: "bead" });

  function place(n: Node, p: THREE.Vector3) {
    if (n.t === "el") {
      bead(p, 0.011);
      b.extrude(outlineOf(n.s), {
        at: p,
        x: [Math.cos(n.rot), 0, Math.sin(n.rot)],
        thickness: 0.012,
        bevel: 0.002,
        color: n.s.color,
        name: n.s.name,
      });
      return;
    }
    const H = V3(p.x, p.y - n.drop, p.z);
    wire(p, H);
    const dir = V3(Math.cos(n.yaw), 0, Math.sin(n.yaw));
    const A = H.clone().addScaledVector(dir, -n.la);
    const B = H.clone().addScaledVector(dir, n.lb);
    b.rod(A, B, 0.007, BLACK, { name: n.name });
    bead(H, 0.016, BLACK);
    bead(A, 0.014, BLACK);
    bead(B, 0.014, BLACK);
    for (const [end, [w, child]] of [[A, n.a], [B, n.b]] as [THREE.Vector3, [number, Node]][]) {
      const top = V3(end.x, end.y - w, end.z);
      wire(end, top);
      place(child, top);
    }
  }

  const el = (kind: string, r: number, color: string, name: string, rot = 0, h?: number): Node => ({
    t: "el", s: { kind, r, color, name, h }, rot,
  });

  const arm3: Node = {
    t: "arm", drop: 0.3, la: 0.35, lb: 0.3, yaw: 0.5, name: "arm3",
    a: [0.4, el("leaf", 0.13, YELLOW, "yellowLeaf", 0.5, 0.75)],
    b: [0.3, el("disc", 0.16, RED, "redSmall", 1.1)],
  };
  const arm2: Node = {
    t: "arm", drop: 0.3, la: 0.5, lb: 0.4, yaw: -0.6, name: "arm2",
    a: [0.3, arm3],
    b: [0.5, el("half", 0.2, BLACK, "blackHalf", 0.3)],
  };
  const arm4: Node = {
    t: "arm", drop: 0.25, la: 0.4, lb: 0.3, yaw: -0.3, name: "arm4",
    a: [0.35, el("disc", 0.2, RED, "redDisc", 0.4)],
    b: [0.45, el("leaf", 0.12, BLUE, "blueLeaf", -0.5, 0.5)],
  };
  const arm1: Node = {
    t: "arm", drop: 0.45, la: 0.9, lb: 0.6, yaw: 0.2, name: "arm1",
    a: [0.3, arm4],
    b: [0.25, arm2],
  };

  // ceiling canopy and hook
  b.part(new THREE.CylinderGeometry(0.07, 0.09, 0.03, 12), BLACK, { at: [0, 2.96, 0], name: "canopy" });
  b.part(new THREE.TorusGeometry(0.03, 0.006, 6, 14), WIRE, { at: [0, 2.9, 0], dir: [0, 0, 1], axis: "z", name: "hookRing" });
  const root = V3(0, 2.75, 0);
  wire(V3(0, 2.87, 0), root);
  place(arm1, root);

  for (const add of STAGE2) add(b);
  return b.root;
}
```