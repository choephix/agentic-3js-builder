import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

type V = [number, number, number];

export const meta = {
  name: "Ice cream cart",
  description:
    "A push cart with a striped canopy, a glass freezer case topped with scoops in waffle cones, a front sign and a chrome push handle.",
};

const RED = "#e5483f";
const CREAM = "#fbf4e4";
const WHITE = "#fffdf7";
const CHROME = "#c9ced6";
const DARK = "#2b2d33";
const TIRE = "#26272b";
const HUB = "#f2c230";
const GLASS = "#bfe7f4";
const WAFFLE = "#d9a05b";
const SIGN = "#f2c230";
const PINK = "#f7a1c0";
const MINT = "#9fdcae";
const BLUE = "#8fcdf0";
const VANILLA = "#fff0c2";
const CHOC = "#7a4a2e";
const CHERRY = "#d82c3c";

export default function build() {
  const b = createBuilder({ name: "ice-cream-cart" });
  b.joint("cart", { at: [0, 0, 0] });

  // A cylinder running from point a to point c (used for poles, arms, bars).
  const bar = (a: V, c: V, r: number, color: string, seg = 8) => {
    const d: V = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const len = Math.hypot(d[0], d[1], d[2]);
    const dir: V = [d[0] / len, d[1] / len, d[2] / len];
    const at: V = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at, dir });
  };

  // A wheel rolling on the X axis, centred at (x, radius, z).
  const wheel = (x: number, z: number, R: number) => {
    const at: V = [x, R, z];
    const axis: V = [1, 0, 0];
    b.part(new THREE.CylinderGeometry(R, R, 0.08, 20), TIRE, { at, dir: axis });
    b.part(new THREE.CylinderGeometry(R * 0.6, R * 0.6, 0.085, 12), CHROME, { at, dir: axis });
    b.part(new THREE.CylinderGeometry(R * 0.28, R * 0.28, 0.095, 10), HUB, { at, dir: axis });
  };

  // ---- Wheels and chassis --------------------------------------------------
  wheel(-0.67, -0.2, 0.3);
  wheel(0.67, -0.2, 0.3);
  wheel(-0.5, 0.42, 0.12);
  wheel(0.5, 0.42, 0.12);
  b.part(new THREE.BoxGeometry(1.12, 0.1, 1.0), DARK, { at: [0, 0.37, 0] });

  // ---- Freezer cabinet -----------------------------------------------------
  b.part(new THREE.BoxGeometry(1.2, 0.5, 0.9), RED, { at: [0, 0.67, 0] });
  b.part(new THREE.BoxGeometry(1.26, 0.06, 0.96), CREAM, { at: [0, 0.95, 0] });
  b.part(new THREE.BoxGeometry(0.02, 0.12, 0.9), WHITE, { at: [-0.61, 0.67, 0] });
  b.part(new THREE.BoxGeometry(0.02, 0.12, 0.9), WHITE, { at: [0.61, 0.67, 0] });
  b.part(new THREE.BoxGeometry(1.2, 0.04, 0.02), WHITE, { at: [0, 0.52, 0.46] });

  // Front sign with a little ice cream icon
  b.part(new THREE.BoxGeometry(0.8, 0.2, 0.03), SIGN, { at: [0, 0.75, 0.465] });
  b.part(new THREE.ConeGeometry(0.07, 0.14, 12), WAFFLE, { at: [0, 0.7, 0.49], dir: [0, -1, 0] });
  b.part(new THREE.SphereGeometry(0.075, 12, 8), PINK, { at: [0, 0.8, 0.49] });

  // ---- Glass display case with scoops --------------------------------------
  b.part(new THREE.BoxGeometry(1.0, 0.24, 0.7), GLASS, { at: [0, 1.13, 0] });
  b.part(new THREE.BoxGeometry(1.04, 0.03, 0.74), CREAM, { at: [0, 1.255, 0] });

  const flavours = [PINK, MINT, BLUE, VANILLA, CHOC];
  const xs = [-0.4, -0.2, 0, 0.2, 0.4];
  xs.forEach((x, i) => {
    // Waffle cone, tip pointing down into the case
    b.part(new THREE.ConeGeometry(0.09, 0.3, 12), WAFFLE, { at: [x, 1.42, 0], dir: [0, -1, 0] });
    // Scoop sitting in the cone rim
    b.part(new THREE.SphereGeometry(0.11, 14, 10), flavours[i], { at: [x, 1.6, 0] });
  });
  // Cherry on the middle scoop
  b.part(new THREE.SphereGeometry(0.035, 8, 6), CHERRY, { at: [0, 1.73, 0] });

  // ---- Canopy poles ---------------------------------------------------------
  for (const x of [-0.55, 0.55]) {
    for (const z of [-0.38, 0.38]) {
      bar([x, 0.98, z], [x, 1.625, z], 0.025, CHROME, 8);
    }
  }

  // ---- Striped umbrella canopy (alternating wedges) -------------------------
  const SLICES = 8;
  for (let i = 0; i < SLICES; i++) {
    const geo = new THREE.ConeGeometry(
      0.95,
      0.45,
      1,
      1,
      false,
      (i * Math.PI * 2) / SLICES,
      (Math.PI * 2) / SLICES,
    );
    b.part(geo, i % 2 === 0 ? RED : WHITE, { at: [0, 1.85, 0] });
  }

  // Scalloped valance hanging under the canopy edge
  const SCALLOPS = 16;
  for (let i = 0; i < SCALLOPS; i++) {
    const a = (i / SCALLOPS) * Math.PI * 2;
    const at: V = [Math.sin(a) * 0.93, 1.58, Math.cos(a) * 0.93];
    b.part(new THREE.SphereGeometry(0.09, 8, 6), i % 2 === 0 ? RED : WHITE, { at });
  }

  // Finial on top of the canopy
  bar([0, 2.07, 0], [0, 2.2, 0], 0.02, CHROME, 6);
  b.part(new THREE.SphereGeometry(0.045, 10, 8), CHROME, { at: [0, 2.22, 0] });

  // ---- Push handle ----------------------------------------------------------
  bar([-0.5, 0.92, -0.45], [-0.5, 0.95, -0.85], 0.03, CHROME);
  bar([0.5, 0.92, -0.45], [0.5, 0.95, -0.85], 0.03, CHROME);
  bar([-0.5, 0.95, -0.85], [0.5, 0.95, -0.85], 0.035, DARK, 10);
  bar([-0.6, 0.95, -0.85], [-0.4, 0.95, -0.85], 0.05, DARK, 10);
  bar([0.4, 0.95, -0.85], [0.6, 0.95, -0.85], 0.05, DARK, 10);

  return b.root;
}
