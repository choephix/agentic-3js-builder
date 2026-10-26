import * as THREE from "three";
import { createBuilder, rng, frame, line } from "../../../../src/index";

export const meta = {
  name: "calder-mobile",
  description: "A Calder-style hanging mobile: balanced wire arms with painted red, yellow, blue and black organic shapes.",
};

const WIRE = "#1a1a1a";
const RED = "#d62a1f";
const YEL = "#f2b81c";
const BLU = "#1f4fa8";
const BLK = "#151515";
const WHT = "#f2efe6";

export default function build() {
  const b = createBuilder({ name: "calder-mobile" });
  const r = rng(11);

  // Root joint at the ceiling hook
  const top = b.joint("hook", { at: [0, 2.0, 0] });

  // Simple blob outline generator for organic leaf shapes
  const blob = (w: number, h: number, k: number): [number, number][] => {
    const pts: [number, number][] = [];
    const n = 10;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const wob = 1 + k * Math.sin(a * 2 + 1) * 0.3 + k * 0.15 * Math.cos(a * 3);
      pts.push([Math.cos(a) * w * wob, Math.sin(a) * h * wob]);
    }
    return pts;
  };

  // A hanging shape: thin wire from (x,y,z) down by len, then a flat painted shape
  const dangle = (
    name: string,
    parent: THREE.Vector3Tuple,
    len: number,
    color: string,
    w: number,
    h: number,
    k: number,
    rot: number,
  ) => {
    const j = b.joint(name, { parent: top, at: parent });
    const end: THREE.Vector3Tuple = [parent[0], parent[1] - len, parent[2]];
    b.rod(parent, end, 0.004, WIRE, { bone: j });
    b.extrude(blob(w, h, k), {
      at: [end[0], end[1] - h * 0.9, end[2]],
      x: [Math.cos(rot), 0, Math.sin(rot)],
      thickness: 0.012,
      bevel: 0.003,
      color,
      bone: j,
    });
    // tiny loop at the hanger
    b.part(new THREE.SphereGeometry(0.01, 6, 4), WIRE, { bone: j, at: end });
    return end;
  };

  // A balanced arm between two points with a hanger at the middle
  const arm = (a: THREE.Vector3Tuple, c: THREE.Vector3Tuple) => {
    b.rod(a, c, 0.0055, WIRE, { bone: top });
    for (const p of [a, c]) b.part(new THREE.SphereGeometry(0.012, 6, 4), WIRE, { bone: top, at: p });
  };

  // Main hanger from the ceiling
  b.rod([0, 2.0, 0], [0, 1.72, 0], 0.004, WIRE, { bone: top });
  b.part(new THREE.TorusGeometry(0.03, 0.005, 5, 10), WIRE, { bone: top, at: [0, 2.0, 0] });

  // Level 1 arm
  arm([-0.75, 1.72, 0], [0.75, 1.72, 0]);
  b.part(new THREE.SphereGeometry(0.015, 6, 4), WIRE, { bone: top, at: [0, 1.72, 0] });

  // Left: big red leaf + sub-mobile
  dangle("redL", [-0.75, 1.72, 0], 0.35, RED, 0.2, 0.11, 1, 0.3);

  // Right: sub-arm at lower level
  b.rod([0.75, 1.72, 0], [0.75, 1.5, 0], 0.004, WIRE, { bone: top });
  arm([0.4, 1.5, 0.05], [1.15, 1.5, -0.05]);
  dangle("blueR", [0.4, 1.5, 0.05], 0.4, BLU, 0.13, 0.19, 1, 1.0);
  b.rod([1.15, 1.5, -0.05], [1.15, 1.3, -0.05], 0.004, WIRE, { bone: top });
  arm([0.95, 1.3, -0.05], [1.35, 1.3, 0.0]);
  dangle("blkR", [0.95, 1.3, -0.05], 0.3, BLK, 0.09, 0.14, 1, 0.2);
  dangle("yelR", [1.35, 1.3, 0.0], 0.5, YEL, 0.1, 0.1, 0.6, 0.9);

  // Left lower: hang from the red leaf side via second wire off arm
  b.rod([-0.3, 1.72, 0], [-0.3, 1.45, 0], 0.004, WIRE, { bone: top });
  arm([-0.6, 1.45, 0.08], [0.0, 1.45, -0.08]);
  dangle("yelL", [-0.6, 1.45, 0.08], 0.28, YEL, 0.12, 0.08, 1, 0.5);
  b.rod([0.0, 1.45, -0.08], [0.0, 1.2, -0.08], 0.004, WIRE, { bone: top });
  arm([-0.2, 1.2, -0.05], [0.2, 1.2, -0.1]);
  dangle("blkL", [-0.2, 1.2, -0.05], 0.35, BLK, 0.07, 0.12, 1, 1.3);
  dangle("redS", [0.2, 1.2, -0.1], 0.2, RED, 0.07, 0.07, 0.5, 0.0);

  // Depth arm (front/back) for 3D feel
  b.rod([0, 1.72, 0], [0, 1.72, 0.01], 0.003, WIRE, { bone: top });
  b.rod([0.0, 1.72, -0.3], [0.0, 1.72, 0.3], 0.005, WIRE, { bone: top });
  dangle("whtF", [0.0, 1.72, 0.3], 0.3, WHT, 0.08, 0.12, 1, 1.57);
  dangle("blueB", [0.0, 1.72, -0.3], 0.4, BLU, 0.07, 0.07, 0.8, 1.57);

  // Small scattered discs for rhythm
  for (let i = 0; i < 3; i++) {
    const x = -0.45 + i * 0.35 + (r() - 0.5) * 0.05;
    b.rod([x, 1.72, 0.0], [x, 1.72 - 0.05, 0.0], 0.002, WIRE, { bone: top });
  }

  return b.root;
}
