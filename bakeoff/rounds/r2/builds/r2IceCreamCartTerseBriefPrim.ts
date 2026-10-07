import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Ice Cream Cart",
  description: "A cheerful striped-canopy ice cream push cart with wheels, tubs, cones and a bell.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "iceCreamCart" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const wheelL = b.joint("wheelL", { at: [0.62, 0.35, -0.1], parent: root });
  const wheelR = b.joint("wheelR", { at: [-0.62, 0.35, -0.1], parent: root });

  const cream = "#fff1d6", red = "#e0404f", white = "#fffaf0", wood = "#a8683a",
    dark = "#4a3020", teal = "#3fb5b0", steel = "#b8c0c8", pink = "#ff9ec0",
    choc = "#6b3a22", yellow = "#ffd34e", green = "#7fd08a";

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 12) => new THREE.CylinderGeometry(rt, rb, h, s);
  const P = (g: THREE.BufferGeometry, c: string, at: number[], extra: any = {}) =>
    b.part(g, c, { at, bone: root, ...extra });

  // body
  P(box(1.0, 0.6, 1.5), teal, [0, 0.8, 0]);
  P(box(1.06, 0.08, 1.56), cream, [0, 1.14, 0]);
  P(box(1.06, 0.1, 1.56), wood, [0, 0.48, 0]);
  // chassis
  P(box(0.9, 0.08, 1.4), dark, [0, 0.42, 0]);
  // axle
  P(cyl(0.03, 0.03, 1.3, 8), steel, [0, 0.35, -0.1], { rotation: [0, 0, Math.PI / 2] });
  // side panels decor
  for (const s of [1, -1]) {
    P(box(0.02, 0.4, 1.2), cream, [s * 0.51, 0.8, 0]);
    P(box(0.03, 0.28, 0.5), red, [s * 0.52, 0.8, -0.3]);
    P(box(0.03, 0.28, 0.5), yellow, [s * 0.52, 0.8, 0.3]);
  }
  // front stripes
  for (let i = 0; i < 4; i++) P(box(0.22, 0.5, 0.02), i % 2 ? white : red, [-0.39 + i * 0.26, 0.8, 0.76]);

  // wheels
  for (const [j, s] of [[wheelL, 1], [wheelR, -1]] as [THREE.Object3D, number][]) {
    const bone = j as any;
    b.part(cyl(0.35, 0.35, 0.06, 16), dark, { at: [s * 0.66, 0.35, -0.1], bone, rotation: [0, 0, Math.PI / 2] });
    b.part(cyl(0.27, 0.27, 0.08, 16), wood, { at: [s * 0.66, 0.35, -0.1], bone, rotation: [0, 0, Math.PI / 2] });
    b.part(cyl(0.06, 0.06, 0.12, 8), steel, { at: [s * 0.68, 0.35, -0.1], bone, rotation: [0, 0, Math.PI / 2] });
    for (let k = 0; k < 4; k++) {
      b.part(box(0.07, 0.54, 0.03), wood, {
        at: [s * 0.7, 0.35, -0.1], bone, rotation: [(k * Math.PI) / 4, 0, 0],
      });
    }
  }

  // tubs on top
  const flav = [pink, cream, choc, green];
  for (let i = 0; i < 4; i++) {
    const x = -0.36 + i * 0.24;
    P(cyl(0.1, 0.09, 0.14, 10), steel, [x, 1.25, 0.2]);
    P(new THREE.SphereGeometry(0.1, 8, 6), flav[i], [x, 1.33, 0.2]);
    P(cyl(0.1, 0.09, 0.14, 10), steel, [x, 1.25, -0.2]);
    P(new THREE.SphereGeometry(0.1, 8, 6), flav[(i + 2) % 4], [x, 1.33, -0.2]);
  }

  // canopy poles
  for (const sx of [1, -1]) for (const sz of [1, -1])
    P(cyl(0.025, 0.025, 1.1, 8), wood, [sx * 0.52, 1.7, sz * 0.7]);
  // canopy stripes (sloped)
  for (let i = 0; i < 8; i++) {
    const x = -0.7 + i * 0.2;
    P(box(0.2, 0.05, 1.9), i % 2 ? white : red, [x + 0.1 - 0.0, 2.3, 0]);
  }
  P(box(1.6, 0.04, 0.04), red, [0, 2.26, 0.97]);
  // scalloped valance
  for (let i = 0; i < 8; i++) {
    const x = -0.7 + i * 0.2 + 0.1;
    P(new THREE.ConeGeometry(0.1, 0.14, 4), i % 2 ? white : red, [x, 2.2, 0.97], { rotation: [Math.PI, Math.PI / 4, 0] });
    P(new THREE.ConeGeometry(0.1, 0.14, 4), i % 2 ? white : red, [x, 2.2, -0.97], { rotation: [Math.PI, Math.PI / 4, 0] });
  }
  P(new THREE.SphereGeometry(0.07, 8, 6), yellow, [0, 2.38, 0]);
  P(cyl(0.015, 0.015, 0.1, 6), dark, [0, 2.34, 0]);

  // handle (push bar) at back
  P(cyl(0.025, 0.025, 1.0, 8), wood, [0, 0.95, -0.95], { rotation: [0, 0, Math.PI / 2] });
  for (const s of [1, -1]) P(cyl(0.025, 0.025, 0.5, 8), wood, [s * 0.5, 0.75, -0.9], { rotation: [0.6, 0, 0] });

  // bell on front
  P(new THREE.ConeGeometry(0.08, 0.1, 10), yellow, [0.5, 1.42, 0.75]);
  P(cyl(0.015, 0.015, 0.2, 6), steel, [0.5, 1.3, 0.75]);

  // cone sign on front
  P(new THREE.ConeGeometry(0.12, 0.3, 8), yellow, [0, 1.9, 0.9], { rotation: [Math.PI, 0, 0] });
  P(new THREE.SphereGeometry(0.13, 8, 6), pink, [0, 2.1, 0.9]);
  P(new THREE.SphereGeometry(0.04, 6, 4), red, [0, 2.24, 0.9]);

  // front prop leg
  P(cyl(0.025, 0.025, 0.4, 6), steel, [0, 0.2, 0.7]);

  b.root.position.y = 0;
  return b.root;
}
