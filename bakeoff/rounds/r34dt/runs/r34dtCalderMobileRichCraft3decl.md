```ts
import * as THREE from "three";
import { createBuilder, rng, line, frame } from "agentic-3js-builder";

export const meta = {
  name: "Calder Mobile",
  description: "Hanging kinetic mobile in the style of Alexander Calder: balanced wire arms with painted organic shapes.",
};

const RED = "#d62828";
const BLUE = "#1d4e9e";
const YELLOW = "#f2b705";
const BLACK = "#16161a";
const WHITE = "#f4efe4";
const WIRE = "#2a2a2e";

export default function build() {
  const b = createBuilder({ name: "calderMobile" });
  const R = rng(5);

  // Hanging mobile: total height ~2.0, lowest point at y=0.
  const top = b.joint("ceilingHook", { at: [0, 2.0, 0] });
  b.part(new THREE.TorusGeometry(0.03, 0.006, 6, 10), WIRE, { bone: top, at: [0, 1.99, 0] });

  // organic shape builder: extruded blob hanging from a wire
  const blob = (parent: any, at: number[], outline: number[][], color: string, scale: number, spin: number) => {
    const pts = outline.map(([x, y]) => [x * scale, y * scale] as [number, number]);
    b.extrude(pts, {
      at: [at[0], at[1], at[2]],
      x: [Math.cos(spin), 0, Math.sin(spin)],
      thickness: 0.008,
      smoothing: 2,
      color,
      bone: parent,
    });
  };

  const LEAF = [[0, 0], [0.5, 0.3], [1, 0.1], [0.6, -0.3], [0.1, -0.2]];
  const DISC = Array.from({ length: 10 }, (_, i) => [Math.cos((i / 10) * 6.283) * 0.5, Math.sin((i / 10) * 6.283) * 0.5]);
  const KIDNEY = [[-0.5, 0], [-0.2, 0.4], [0.3, 0.45], [0.5, 0], [0.1, -0.1], [0.2, -0.4], [-0.3, -0.35]];
  const DROP = [[0, 0.6], [0.35, 0], [0.25, -0.4], [-0.25, -0.4], [-0.35, 0]];

  // Recursive-ish arm: a bar at height y with two hanging ends.
  type Node = { y: number; half: number; l: any; r: any };
  const arm = (name: string, parent: any, cx: number, y: number, half: number, tilt: number) => {
    const j = b.joint(name, { parent, at: [cx, y, 0], role: "hinge" });
    const a: [number, number, number] = [cx - half, y + tilt, 0];
    const c: [number, number, number] = [cx + half, y - tilt, 0];
    b.rod(a, c, 0.004, WIRE, { bone: j });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), BLACK, { bone: j, at: [cx, y, 0] });
    return { j, a, c };
  };
  const hang = (parent: any, from: number[], len: number) => {
    b.rod([from[0], from[1], from[2]], [from[0], from[1] - len, from[2]], 0.0025, WIRE, { bone: parent });
    return [from[0], from[1] - len, from[2]];
  };

  // Main arm
  b.rod([0, 1.99, 0], [0, 1.7, 0], 0.003, WIRE, { bone: top });
  const m = arm("armMain", top, 0, 1.7, 0.5, 0.03);

  // Left branch
  const lp = hang(m.j, m.a, 0.25);
  const l = arm("armL", m.j, lp[0], lp[1], 0.28, -0.02);
  const l1 = hang(l.j, l.a, 0.3);
  const l2 = hang(l.j, l.c, 0.5);
  blob(l.j, l1, DISC, RED, 0.28, 0.4);
  blob(l.j, l2, LEAF, BLACK, 0.38, 0.9);

  // Right branch with sub-branch
  const rp = hang(m.j, m.c, 0.4);
  const r = arm("armR", m.j, rp[0], rp[1], 0.32, 0.03);
  const r1 = hang(r.j, r.a, 0.45);
  blob(r.j, r1, KIDNEY, YELLOW, 0.4, -0.5);
  const r2p = hang(r.j, r.c, 0.2);
  const rr = arm("armRR", r.j, r2p[0], r2p[1], 0.18, -0.03);
  const q1 = hang(rr.j, rr.a, 0.35);
  const q2 = hang(rr.j, rr.c, 0.2);
  blob(rr.j, q1, DROP, BLUE, 0.3, 0.3);
  blob(rr.j, q2, DISC, WHITE, 0.2, 1.2);

  // Low centre dangling piece
  const cp = hang(l.j, [l.a[0] + 0.05, l.a[1], 0], 0.0);
  void cp;
  const lowY = Math.min(l2[1] - 0.3, q1[1] - 0.2);
  // shift: ensure lowest sits on y=0 by adding a small drop on the main arm centre
  const dp = hang(m.j, [0, 1.7, 0], 1.7 - 0.55);
  blob(m.j, dp, DROP, BLUE, 0.42, 0.0);
  void lowY; void R; void line; void frame;

  return b.root;
}
```