import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "ice-cream-cart",
  description: "A striped-awning ice cream cart with a scoop sign, serving counter, tubs and bubble spots.",
};

const MINT = "#8fd9b6";
const CREAM = "#fff6e0";
const RED = "#e63946";
const CHERRY = "#d62828";
const DARK = "#2b2d42";
const CHROME = "#c9d6df";
const YELLOW = "#ffd166";
const WAFFLE = "#d9a05b";
const PINK = "#ff8fab";
const CHOC = "#5a3320";

export default function build() {
  const b = createBuilder({ name: "ice-cream-cart" });

  // Helpers: every piece is a primitive placed by its centre, on the root.
  const put = (geo: THREE.BufferGeometry, color: string, x: number, y: number, z: number) =>
    b.part(geo, color, { at: [x, y, z] });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, seg: number) =>
    new THREE.CylinderGeometry(rt, rb, h, seg);
  const ball = (r: number, seg: number, sy = 1) => {
    const g = new THREE.SphereGeometry(r, seg, Math.max(6, seg - 2));
    g.scale(1, sy, 1);
    return g;
  };

  // Chassis and wheels
  put(box(1.04, 0.12, 1.5), DARK, 0, 0.42, 0);
  for (const s of [-1, 1]) {
    for (const z of [-0.45, 0.45]) {
      const tyre = cyl(0.3, 0.3, 0.1, 16).rotateZ(Math.PI / 2);
      put(tyre, DARK, s * 0.55, 0.3, z);
      const hub = cyl(0.14, 0.14, 0.03, 10).rotateZ(Math.PI / 2);
      put(hub, YELLOW, s * 0.61, 0.3, z);
    }
  }

  // Main cabinet
  put(box(1.0, 1.02, 1.4), MINT, 0, 0.99, 0);
  // Red trim lid and cream lid cap
  put(box(1.06, 0.06, 1.46), RED, 0, 1.53, 0);
  put(box(1.0, 0.03, 1.36), CREAM, 0, 1.58, 0);

  // Side bands
  for (const s of [-1, 1]) {
    put(box(0.02, 0.07, 1.42), RED, s * 0.51, 0.6, 0);
    put(box(0.02, 0.07, 1.42), RED, s * 0.51, 1.4, 0);
  }

  // Yellow side sign panel with mini scoops
  put(box(0.02, 0.4, 0.7), YELLOW, 0.51, 1.2, 0);
  const miniCols = [PINK, CHOC, MINT];
  [-0.2, 0, 0.2].forEach((z, i) => {
    put(ball(0.07, 12), miniCols[i], 0.52, 1.2, z);
  });

  // Bubble spots down the left side
  for (let i = 0; i < 12; i++) {
    const y = 0.62 + (i % 3) * 0.1;
    const z = -0.6 + i * 0.1;
    const col = [YELLOW, PINK, RED][i % 3];
    put(ball(0.035, 8), col, -0.51, y, z);
  }

  // Serving window on the front (+Z)
  put(box(0.86, 0.36, 0.02), CREAM, 0, 1.27, 0.712);
  put(box(0.7, 0.26, 0.02), DARK, 0, 1.27, 0.725);

  // Menu board below the counter
  put(box(0.8, 0.36, 0.02), DARK, 0, 0.72, 0.712);
  const lines = [0.8, 0.74, 0.68, 0.62];
  lines.forEach((y, i) => {
    const w = i === 0 ? 0.5 : 0.36 + (i % 2) * 0.1;
    put(box(w, 0.035, 0.01), i % 2 ? PINK : CREAM, -0.08 + (i === 0 ? 0 : -0.04), y, 0.726);
  });

  // Serving counter
  put(box(1.12, 0.04, 0.38), CREAM, 0, 1.0, 0.89);
  put(box(1.12, 0.06, 0.02), RED, 0, 0.97, 1.08);

  // Tubs and scoops on the counter
  const tubs = [PINK, CHOC, MINT];
  [-0.3, 0, 0.3].forEach((x, i) => {
    put(cyl(0.09, 0.08, 0.14, 12), tubs[i], x, 1.09, 0.89);
    put(ball(0.09, 12, 0.8), tubs[i] === CHOC ? PINK : tubs[i] === PINK ? CREAM : CHOC, x, 1.17, 0.89);
  });

  // Push bar and posts at the back
  put(cyl(0.025, 0.025, 1.1, 8).rotateZ(Math.PI / 2), CHROME, 0, 1.0, -0.84);
  for (const s of [-1, 1]) {
    put(cyl(0.025, 0.025, 0.5, 8), CHROME, s * 0.45, 0.73, -0.8);
  }

  // Awning poles
  for (const s of [-1, 1]) {
    put(cyl(0.02, 0.02, 0.5, 8), CHROME, s * 0.52, 1.81, 0.95);
  }

  // Striped awning, tilted so the front edge droops
  for (let i = 0; i < 8; i++) {
    const x = -0.455 + i * 0.13;
    const stripe = box(0.13, 0.03, 0.7).rotateX(0.2);
    put(stripe, i % 2 ? CREAM : RED, x, 2.0, 0.95);
  }

  // Scalloped valance along the front edge
  for (let i = 0; i < 8; i++) {
    const x = -0.455 + i * 0.13;
    put(ball(0.065, 10, 0.7), i % 2 ? RED : CREAM, x, 1.88, 1.3);
  }

  // Cone sign on top of the awning, tip down
  put(cyl(0, 0.16, 0.36, 12).rotateX(Math.PI), WAFFLE, 0, 2.2, 0.95);
  put(ball(0.2, 14, 0.8), PINK, 0, 2.44, 0.95);
  put(ball(0.18, 14, 0.8), CHOC, 0, 2.6, 0.95);
  put(ball(0.15, 12, 0.8), MINT, 0, 2.74, 0.95);
  put(ball(0.05, 8), CHERRY, 0, 2.9, 0.95);

  return b.root;
}
