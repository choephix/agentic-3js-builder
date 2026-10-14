```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Ice Cream Cart",
  description: "A stylized pushcart with striped canopy, freezer box, wheels and ice cream cones.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "iceCreamCart" });
  b.joint("root", { at: [0, 0, 0] });
  const r = rng(7);

  const CREAM = "#fff2d6", RED = "#e8465a", WHITE = "#fffaf0", TEAL = "#4fb8b0";
  const WOOD = "#a8693a", DARK = "#4a3426", METAL = "#b8c0c8", PINK = "#f6a5c0";
  const CHOC = "#6b3a22", VAN = "#f7e08a", MINT = "#9fe0c0";

  const box = (w: number, h: number, d: number, c: string, at: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at });
  const cyl = (rt: number, rb: number, h: number, c: string, at: [number, number, number], seg = 10, rot?: [number, number, number]) => {
    const g = new THREE.CylinderGeometry(rt, rb, h, seg);
    if (rot) g.rotateX(rot[0]), g.rotateY(rot[1]), g.rotateZ(rot[2]);
    return b.part(g, c, { at });
  };

  // Chassis frame
  box(1.5, 0.08, 0.9, DARK, [0, 0.48, 0]);
  // Freezer body
  box(1.4, 0.6, 0.8, TEAL, [0, 0.84, 0]);
  // cream trim bands
  box(1.44, 0.07, 0.84, CREAM, [0, 0.58, 0]);
  box(1.44, 0.07, 0.84, CREAM, [0, 1.12, 0]);
  // Lid
  box(1.5, 0.06, 0.9, WHITE, [0, 1.18, 0]);
  // Panels on front/back
  for (const z of [0.41, -0.41]) {
    box(1.1, 0.34, 0.02, CREAM, [0, 0.85, z]);
    box(1.0, 0.24, 0.025, RED, [0, 0.85, z * 1.005]);
    for (let i = 0; i < 4; i++) {
      cyl(0.045, 0.045, 0.03, WHITE, [-0.36 + i * 0.24, 0.85, z * 1.04], 8, [Math.PI / 2, 0, 0]);
    }
  }

  // Wheels (sides)
  for (const x of [0.78, -0.78]) {
    const wy = 0.38;
    b.part(new THREE.TorusGeometry(0.36, 0.045, 6, 16).rotateY(Math.PI / 2), DARK, { at: [x, wy, 0] });
    cyl(0.07, 0.07, 0.1, METAL, [x, wy, 0], 8, [0, 0, Math.PI / 2]);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI;
      const g = new THREE.BoxGeometry(0.03, 0.7, 0.03);
      g.rotateX(a);
      b.part(g, WOOD, { at: [x, wy, 0] });
    }
  }
  // axle
  cyl(0.03, 0.03, 1.6, METAL, [0, 0.38, 0], 6, [0, 0, Math.PI / 2]);

  // Handles at back (push)
  for (const x of [0.5, -0.5]) {
    const g = new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6);
    g.rotateX(Math.PI / 2 - 0.2);
    b.part(g, WOOD, { at: [x, 0.7, -0.85] });
  }
  cyl(0.035, 0.035, 1.1, WOOD, [0, 0.82, -1.28], 6, [0, 0, Math.PI / 2]);

  // Front stand leg
  for (const x of [0.5, -0.5]) {
    box(0.06, 0.4, 0.06, DARK, [x, 0.26, 0.5]);
    box(0.14, 0.04, 0.14, DARK, [x, 0.02, 0.5]);
  }

  // Umbrella pole
  cyl(0.035, 0.035, 1.4, METAL, [0, 1.9, -0.05], 8);
  cyl(0.05, 0.05, 0.08, METAL, [0, 1.22, -0.05], 8);

  // Striped canopy: 12 wedge sectors
  const N = 12, top = 2.55, rim = 2.1, R = 1.35;
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2, a1 = ((i + 1) / N) * Math.PI * 2;
    const p = (a: number, rr: number, y: number) => [Math.cos(a) * rr, y, Math.sin(a) * rr];
    const v = [p(0, 0, top), p(a0, R, rim), p(a1, R, rim)].flat();
    const pos = new Float32Array([...v]);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.computeVertexNormals();
    const mat = i % 2 ? WHITE : RED;
    // double-sided via both windings
    b.part(g, mat, { at: [0, 0, -0.05] });
    const g2 = g.clone();
    const idx = [0, 2, 1];
    const p2 = new Float32Array(9);
    idx.forEach((k, j) => { for (let c = 0; c < 3; c++) p2[j * 3 + c] = pos[k * 3 + c]; });
    g2.setAttribute("position", new THREE.BufferAttribute(p2, 3));
    g2.computeVertexNormals();
    b.part(g2, mat, { at: [0, 0, -0.05] });
    // scalloped valance
    const am = (a0 + a1) / 2;
    const sc = new THREE.CylinderGeometry(0.18, 0.18, 0.02, 8, 1, false, 0, Math.PI);
    sc.rotateX(Math.PI / 2);
    sc.rotateY(-am + Math.PI / 2);
    b.part(sc, mat, { at: [Math.cos(am) * R * 0.97, rim - 0.02, Math.sin(am) * R * 0.97 - 0.05] });
  }
  // finial
  b.part(new THREE.SphereGeometry(0.07, 8, 6), VAN, { at: [0, top + 0.06, -0.05] });
  cyl(0.02, 0.03, 0.1, METAL, [0, top + 0.02, -0.05], 6);

  // Scoop tubs on lid (open tubs)
  const flavors = [PINK, VAN, CHOC, MINT];
  for (let i = 0; i < 4; i++) {
    const x = -0.45 + i * 0.3;
    cyl(0.12, 0.1, 0.08, METAL, [x, 1.25, 0.2], 10);
    b.part(new THREE.SphereGeometry(0.11, 8, 6), flavors[i], { at: [x, 1.31, 0.2] });
  }

  // Cone display stand with cones
  box(0.5, 0.04, 0.2, WOOD, [0.45, 1.24, -0.22]);
  for (let i = 0; i < 3; i++) {
    const x = 0.3 + i * 0.15;
    const c = new THREE.ConeGeometry(0.055, 0.2, 8);
    c.rotateX(Math.PI);
    b.part(c, "#d9a05b", { at: [x, 1.36, -0.22] });
    b.part(new THREE.SphereGeometry(0.065, 8, 6), flavors[(i + 1) % 4], { at: [x, 1.5, -0.22] });
    b.part(new THREE.SphereGeometry(0.018, 5, 4), RED, { at: [x, 1.575, -0.22] });
  }

  // Giant cone sign on front
  const cone = new THREE.ConeGeometry(0.22, 0.5, 8);
  cone.rotateX(Math.PI);
  b.part(cone, "#d9a05b", { at: [-0.5, 1.55, 0.3] });
  b.part(new THREE.SphereGeometry(0.24, 8, 6), PINK, { at: [-0.5, 1.88, 0.3] });
  b.part(new THREE.SphereGeometry(0.17, 8, 6), VAN, { at: [-0.5, 2.08, 0.3] });
  b.part(new THREE.SphereGeometry(0.04, 6, 4), RED, { at: [-0.5, 2.26, 0.3] });
  // sprinkles
  const cols = [RED, TEAL, VAN, WHITE];
  for (let i = 0; i < 14; i++) {
    const a = r() * Math.PI * 2, e = r() * 0.8;
    const s = 0.245;
    b.part(new THREE.BoxGeometry(0.03, 0.01, 0.01), cols[i % 4], {
      at: [-0.5 + Math.cos(a) * Math.cos(e) * s, 1.88 + Math.sin(e) * s, 0.3 + Math.sin(a) * Math.cos(e) * s],
    });
  }

  // Bunting along canopy rim front
  for (let i = 0; i < 7; i++) {
    const x = -1.1 + i * 0.37;
    const t = new THREE.ConeGeometry(0.07, 0.16, 3);
    t.rotateX(Math.PI);
    b.part(t, cols[i % 4], { at: [x, 1.98, 0.62 - Math.abs(x) * 0.12] });
  }

  // Bell on handle
  b.part(new THREE.SphereGeometry(0.05, 8, 6), VAN, { at: [0.45, 0.76, -1.28] });

  return b.root;
}
```