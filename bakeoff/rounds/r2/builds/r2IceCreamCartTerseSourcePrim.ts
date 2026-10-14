import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Ice Cream Cart",
  description: "A pushcart with striped canopy, freezer box, two spoked wheels, cone signage and scoops.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "iceCreamCart" });
  const r = rng(7);
  b.joint("root", { at: [0, 0.5, 0] });
  b.joint("wheelL", { parent: "root", at: [0.62, 0.38, -0.1], dir: [1, 0, 0] });
  b.joint("wheelR", { parent: "root", at: [-0.62, 0.38, -0.1], dir: [-1, 0, 0] });
  b.joint("lid", { parent: "root", at: [0, 1.0, -0.4], dir: [1, 0, 0], role: "hinge" });

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 12) => new THREE.CylinderGeometry(rt, rb, h, s);

  const CREAM = "#fff3dc", MINT = "#7fd8c3", PINK = "#ff8fb1", WOOD = "#a8693a", STEEL = "#c9d1d6", DARK = "#3b3b45", RED = "#e84a5f";

  // body
  b.part(box(1.0, 0.6, 1.4), CREAM, { at: [0, 0.75, 0], bone: "root" });
  b.part(box(1.06, 0.08, 1.46), MINT, { at: [0, 0.46, 0], bone: "root" });
  b.part(box(1.06, 0.08, 1.46), MINT, { at: [0, 1.06, 0], bone: "root" });
  // panels
  b.part(box(0.02, 0.36, 1.1), PINK, { at: [0.51, 0.78, 0], bone: "root" });
  b.part(box(0.02, 0.36, 1.1), PINK, { at: [-0.51, 0.78, 0], bone: "root" });
  // front hatch and handle
  b.part(box(0.6, 0.3, 0.02), STEEL, { at: [0, 0.78, 0.71], bone: "root" });
  b.part(cyl(0.02, 0.02, 0.2, 8), DARK, { at: [0, 0.78, 0.74], rotation: [0, 0, 90], bone: "root" });
  // lid
  b.part(box(0.96, 0.05, 0.6), STEEL, { at: [0, 0.03, 0.3], bone: "lid" , });
  b.part(box(0.1, 0.04, 0.04), DARK, { at: [0, 0.07, 0.6], bone: "lid" });

  // chassis and wheels
  b.part(box(0.9, 0.06, 1.3), WOOD, { at: [0, 0.42, 0], bone: "root" });
  b.part(cyl(0.03, 0.03, 1.5, 8), DARK, { at: [0, 0.38, -0.1], rotation: [0, 0, 90], bone: "root" });
  for (const [j, s] of [["wheelL", 1], ["wheelR", -1]] as const) {
    b.part(cyl(0.38, 0.38, 0.07, 16), DARK, { at: [0.62 * s, 0.38, -0.1], rotation: [0, 0, 90], bone: j });
    b.part(cyl(0.3, 0.3, 0.09, 16), RED, { at: [0.62 * s, 0.38, -0.1], rotation: [0, 0, 90], bone: j });
    b.part(cyl(0.07, 0.07, 0.12, 8), STEEL, { at: [0.62 * s, 0.38, -0.1], rotation: [0, 0, 90], bone: j });
    for (let i = 0; i < 4; i++)
      b.part(box(0.1, 0.6, 0.03), STEEL, { at: [0.67 * s, 0.38, -0.1], rotation: [(i * 45), 0, 0], bone: j });
  }

  // push handle
  b.part(cyl(0.025, 0.025, 0.8, 8), WOOD, { at: [0, 0.95, -0.95], rotation: [0, 0, 90], bone: "root" });
  for (const s of [-1, 1]) b.part(cyl(0.025, 0.025, 0.6, 8), WOOD, { at: [0.35 * s, 0.7, -0.85], rotation: [60, 0, 0], bone: "root" });

  // canopy posts
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    b.part(cyl(0.02, 0.02, 1.0, 8), STEEL, { at: [0.48 * sx, 1.6, 0.6 * sz], bone: "root" });
  // striped canopy
  for (let i = 0; i < 8; i++) {
    const x = -0.7 + i * 0.2 + 0.1;
    b.part(box(0.2, 0.05, 1.5), i % 2 ? CREAM : PINK, { at: [x, 2.12 - Math.abs(x) * 0.18, 0], rotation: [0, 0, -x * 15], bone: "root" });
    b.part(box(0.2, 0.12, 0.04), i % 2 ? CREAM : PINK, { at: [x, 1.95 - Math.abs(x) * 0.18, 0.77], rotation: [0, 0, -x * 15], bone: "root" });
    b.part(box(0.2, 0.12, 0.04), i % 2 ? CREAM : PINK, { at: [x, 1.95 - Math.abs(x) * 0.18, -0.77], rotation: [0, 0, -x * 15], bone: "root" });
  }
  b.part(new THREE.SphereGeometry(0.08, 8, 6), RED, { at: [0, 2.2, 0], bone: "root" });

  // sign cone atop
  b.part(new THREE.ConeGeometry(0.1, 0.3, 8), WOOD, { at: [0, 2.4, 0], rotation: [180, 0, 0], bone: "root" });
  b.part(new THREE.SphereGeometry(0.12, 8, 6), PINK, { at: [0, 2.58, 0], bone: "root" });
  b.part(new THREE.SphereGeometry(0.09, 8, 6), MINT, { at: [0, 2.7, 0], bone: "root" });

  // scoops on top of the box
  const flavors = [PINK, MINT, "#f6d365", "#8b5a3c"];
  flavors.forEach((c, i) => {
    const x = -0.33 + i * 0.22;
    b.part(new THREE.ConeGeometry(0.07, 0.18, 8), WOOD, { at: [x, 1.2, 0.45], rotation: [180, 0, 0], bone: "root" });
    b.part(new THREE.SphereGeometry(0.085, 8, 6), c, { at: [x, 1.34 + r() * 0.01, 0.45], bone: "root" });
  });

  // side menu board
  b.part(box(0.02, 0.25, 0.4), DARK, { at: [0.54, 0.78, 0.0], bone: "root" });
  for (let i = 0; i < 3; i++) b.part(box(0.025, 0.03, 0.28), flavors[i], { at: [0.55, 0.86 - i * 0.07, 0], bone: "root" });

  return b.root;
}
