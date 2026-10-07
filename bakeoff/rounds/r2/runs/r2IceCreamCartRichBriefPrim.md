```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Seaside Ice Cream Cart",
  description:
    "Mint and cream push cart with a scalloped pink-and-white striped canopy, spoked wheels, chrome lid, cone-shaped sign and a row of giant pastel cones on top.",
};

export default function build() {
  const b = createBuilder({ name: "icecreamcart" });
  const root = b.joint("root", { at: [0, 0, 0] });

  const P = (g: THREE.BufferGeometry, color: string, x: number, y: number, z: number) =>
    b.part(g, color, { at: [x, y, z], bone: root });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  const MINT = "#9fe3c8", MINT_D = "#6fc9a8", CREAM = "#fff3d6";
  const PINK = "#ff8fb1", WHITE = "#fffaf2", CHROME = "#cfd8dc", DARK = "#4a4a55";

  // chassis + body
  P(box(1.2, 0.06, 1.6), DARK, 0, 0.47, 0);
  P(box(1.2, 0.2, 1.6), MINT, 0, 0.6, 0);
  P(box(1.24, 0.14, 1.64), CREAM, 0, 0.77, 0);
  P(box(1.2, 0.2, 1.6), MINT, 0, 0.94, 0);
  P(box(1.26, 0.04, 1.66), CREAM, 0, 1.05, 0);
  // panel inset trim
  for (const s of [-1, 1]) P(box(0.02, 0.28, 1.2), MINT_D, s * 0.61, 0.6, 0);
  P(box(1.0, 0.28, 0.02), MINT_D, 0, 0.6, 0.81);

  // chrome lid (domed, front half) + handle
  P(new THREE.CylinderGeometry(0.28, 0.28, 1.05, 12, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).rotateY(0).rotateX(0), CHROME, 0, 1.07, 0.35)
    .scale?.set?.(1, 1, 1);
  P(box(1.1, 0.03, 0.02), CHROME, 0, 1.07, 0.63);
  P(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8).rotateZ(Math.PI / 2), DARK, 0, 1.36, 0.35);
  // lid hinge back
  P(box(1.1, 0.06, 0.05), CHROME, 0, 1.08, -0.2);

  // wheels
  for (const s of [-1, 1]) {
    const x = s * 0.72, y = 0.45, z = 0.1;
    P(new THREE.TorusGeometry(0.42, 0.045, 6, 20).rotateY(Math.PI / 2), "#2f2f3a", x, y, z);
    P(new THREE.TorusGeometry(0.37, 0.015, 4, 20).rotateY(Math.PI / 2), CHROME, x, y, z);
    for (let i = 0; i < 8; i++) {
      P(box(0.025, 0.78, 0.025).rotateX((i * Math.PI) / 8), CHROME, x, y, z);
    }
    P(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 8).rotateZ(Math.PI / 2), PINK, x, y, z);
    P(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 6).rotateZ(Math.PI / 2), DARK, x * 0.88, y, z);
  }
  // axle
  P(new THREE.CylinderGeometry(0.025, 0.025, 1.5, 8).rotateZ(Math.PI / 2), DARK, 0, 0.45, 0.1);

  // back stand legs
  for (const s of [-1, 1]) {
    P(new THREE.CylinderGeometry(0.03, 0.025, 0.48, 6), DARK, s * 0.5, 0.24, -0.7);
    P(box(0.12, 0.03, 0.12), DARK, s * 0.5, 0.015, -0.7);
  }

  // push handle
  for (const s of [-1, 1]) {
    P(new THREE.CylinderGeometry(0.025, 0.025, 0.6, 8).rotateX(Math.PI / 2), CHROME, s * 0.4, 0.9, -1.1);
  }
  P(new THREE.CylinderGeometry(0.025, 0.025, 0.8, 8).rotateZ(Math.PI / 2), CHROME, 0, 0.9, -1.4);
  for (const s of [-1, 1]) {
    P(new THREE.CylinderGeometry(0.04, 0.04, 0.2, 8).rotateZ(Math.PI / 2), PINK, s * 0.3, 0.9, -1.4);
  }

  // canopy posts
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    P(new THREE.CylinderGeometry(0.022, 0.022, 1.1, 6), CHROME, sx * 0.56, 1.6, sz * 0.7);
  }

  // striped scalloped canopy
  const N = 12, half = 0.96, w = (half * 2) / N;
  const canopyY = (x: number) => 2.0 + 0.25 * (1 - (x / 1.0) ** 2);
  for (let i = 0; i < N; i++) {
    const xc = -half + w * (i + 0.5);
    const col = i % 2 === 0 ? PINK : WHITE;
    const ang = Math.atan(-0.5 * xc);
    P(box(w / Math.cos(ang) + 0.005, 0.04, 1.7).rotateZ(ang), col, xc, canopyY(xc), 0);
    for (const sz of [-1, 1]) {
      P(new THREE.SphereGeometry(w / 2, 8, 6).scale(1, 0.85, 0.35), col, xc, canopyY(xc) - 0.05, sz * 0.85);
      P(new THREE.SphereGeometry(0.025, 6, 4), "#ffd84a", xc, canopyY(xc) - 0.16, sz * 0.9);
    }
  }
  // ridge trim
  P(new THREE.CylinderGeometry(0.03, 0.03, 1.74, 6).rotateX(Math.PI / 2), CHROME, 0, 2.27, 0);

  // row of giant fake cones
  const flavors = ["#ffb3d1", "#b9f0d9", "#fff1a8", "#c9b6ff", "#ffcfa3"];
  for (let i = 0; i < 5; i++) {
    const z = -0.6 + i * 0.3;
    P(new THREE.ConeGeometry(0.13, 0.34, 8).rotateX(Math.PI), "#e2b169", 0, 2.45, z);
    P(new THREE.TorusGeometry(0.13, 0.012, 4, 8).rotateX(Math.PI / 2), "#b9823c", 0, 2.55, z);
    P(new THREE.SphereGeometry(0.17, 8, 6), flavors[i], 0, 2.72, z);
    P(new THREE.TorusGeometry(0.15, 0.03, 5, 8).rotateX(Math.PI / 2), flavors[(i + 2) % 5], 0, 2.63, z);
    P(new THREE.SphereGeometry(0.035, 6, 4), "#e53950", 0, 2.9, z);
  }

  // cone-shaped sign on front
  const sz = 0.83;
  P(box(0.62, 0.34, 0.02), CREAM, 0, 0.77, 0.81);
  P(new THREE.ConeGeometry(0.15, 0.3, 4).rotateX(Math.PI).scale(1, 1, 0.25), "#e2b169", 0, 0.72, sz);
  P(new THREE.SphereGeometry(0.15, 8, 6).scale(1, 0.8, 0.3), PINK, 0, 0.9, sz + 0.005);
  P(new THREE.SphereGeometry(0.1, 8, 6).scale(1, 0.8, 0.3), "#b9f0d9", 0, 0.99, sz + 0.01);
  P(new THREE.SphereGeometry(0.025, 6, 4), "#e53950", 0, 1.06, sz + 0.02);
  for (const s of [-1, 1]) P(box(0.012, 0.28, 0.012).rotateZ(s * 0.5), "#b9823c", s * 0.045, 0.72, sz + 0.02);

  // flag on top
  P(new THREE.CylinderGeometry(0.01, 0.01, 0.3, 4), CHROME, 0, 3.0, -0.7);
  P(box(0.2, 0.12, 0.01), PINK, 0.1, 3.08, -0.7);

  return b.root;
}
```