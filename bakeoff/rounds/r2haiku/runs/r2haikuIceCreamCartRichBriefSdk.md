```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Seaside ice cream cart",
  description:
    "A mint and cream ice cream cart with a pink and white scalloped canopy, spoked wheels, a chrome freezer lid, a cone-shaped sign and a row of giant pastel cones.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "ice-cream-cart" });

  // Palette
  const MINT = "#9ee6c8";
  const CREAM = "#fff4e0";
  const PINK = "#ff8fb1";
  const WHITE = "#ffffff";
  const CHROME = "#cfd8dc";
  const DARK = "#2d3a44";
  const TYRE = "#2b2f36";
  const WAFFLE = "#e0a96d";
  const VANILLA = "#fff1c1";
  const CHOC = "#8b5a3c";
  const BLUE = "#a9b8ff";
  const PISTA = "#c9f5a5";
  const CHERRY = "#e5484d";

  // Skeleton: the cart root and two wheel joints that turn on their axles.
  const root = b.joint("cart", { at: [0, 0, 0] });
  const wheelL = b.joint("wheelL", { at: [0.62, 0.32, 0], parent: root });
  const wheelR = b.joint("wheelR", { at: [-0.62, 0.32, 0], parent: root });

  type J = typeof root;

  const put = (geo: THREE.BufferGeometry, color: string, at: V, bone?: J) =>
    bone ? b.part(geo, color, { at, bone }) : b.part(geo, color, { at });

  const box = (w: number, h: number, d: number, at: V, color: string) =>
    put(new THREE.BoxGeometry(w, h, d), color, at);

  // Tube between two points, oriented by dir.
  const tube = (a: V, c: V, r: number, color: string) => {
    const A = new THREE.Vector3(...a);
    const B = new THREE.Vector3(...c);
    const d = B.clone().sub(A);
    const len = d.length();
    const mid = A.clone().add(B).multiplyScalar(0.5);
    const geo = new THREE.CylinderGeometry(r, r, len, 10);
    b.part(geo, color, {
      at: [mid.x, mid.y, mid.z],
      dir: [d.x / len, d.y / len, d.z / len],
    });
  };

  // ---------- Body ----------
  box(1.0, 0.08, 1.5, [0, 0.38, 0], DARK); // chassis
  box(1.1, 0.66, 1.6, [0, 0.71, 0], MINT); // main body
  box(1.18, 0.08, 1.68, [0, 1.08, 0], CREAM); // counter top rim
  box(0.02, 0.07, 1.62, [0.556, 0.9, 0], PINK); // side trim bands
  box(0.02, 0.07, 1.62, [-0.556, 0.9, 0], PINK);

  // Serving window with cream frame and a little shelf.
  box(0.82, 0.44, 0.02, [0, 0.82, 0.8], CREAM);
  box(0.72, 0.36, 0.03, [0, 0.82, 0.815], DARK);
  box(0.92, 0.04, 0.24, [0, 0.6, 0.92], CREAM);

  // Chrome freezer lid: a half-sunk cylinder along Z.
  put(
    new THREE.CylinderGeometry(0.36, 0.36, 1.0, 20).rotateX(Math.PI / 2),
    CHROME,
    [0, 1.12, -0.1],
  );

  // ---------- Canopy ----------
  const pole = new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8);
  put(pole.clone(), CHROME, [0.5, 1.57, 0.78]);
  put(pole.clone(), CHROME, [-0.5, 1.57, 0.78]);

  const slatXs = [-0.625, -0.375, -0.125, 0.125, 0.375, 0.625];
  slatXs.forEach((x, i) => {
    const c = i % 2 === 0 ? PINK : WHITE;
    box(0.25, 0.06, 1.0, [x, 2.0, 1.1], c); // canopy slat
    const scallop = new THREE.SphereGeometry(0.125, 10, 6);
    scallop.scale(1, 0.6, 1);
    put(scallop, c, [x, 1.97, 1.6]); // scalloped edge
  });

  // Giant pastel cones standing tip-down along the canopy top.
  const cones = [
    { x: -0.6, scoop: PINK },
    { x: -0.3, scoop: VANILLA },
    { x: 0, scoop: PISTA },
    { x: 0.3, scoop: CHOC },
    { x: 0.6, scoop: BLUE },
  ];
  cones.forEach(({ x, scoop }) => {
    const cone = new THREE.ConeGeometry(0.2, 0.55, 16).rotateX(Math.PI);
    put(cone, WAFFLE, [x, 2.305, 1.1]); // tip at y 2.03, base at 2.58
    const ball = new THREE.SphereGeometry(0.22, 14, 10);
    ball.scale(1, 0.85, 1);
    put(ball, scoop, [x, 2.72, 1.1]);
    const cherry = new THREE.SphereGeometry(0.05, 8, 6);
    put(cherry, CHERRY, [x, 2.93, 1.1]);
  });

  // ---------- Push handle (rear, -Z) ----------
  tube([-0.45, 1.04, -0.8], [-0.45, 1.3, -1.25], 0.025, CHROME);
  tube([0.45, 1.04, -0.8], [0.45, 1.3, -1.25], 0.025, CHROME);
  tube([-0.45, 1.3, -1.25], [0.45, 1.3, -1.25], 0.03, CHROME);
  tube([-0.5, 1.3, -1.25], [-0.4, 1.3, -1.25], 0.045, PINK); // grips
  tube([0.4, 1.3, -1.25], [0.5, 1.3, -1.25], 0.045, PINK);

  // ---------- Cone-shaped hand-painted sign ----------
  const outline = [
    [-0.3, 0.28],
    [0.3, 0.28],
    [0, -0.42],
  ];
  const inner = [
    [-0.22, 0.2],
    [0.22, 0.2],
    [0, -0.32],
  ];
  b.extrude(outline, { at: [0, 1.4, 0.82], x: [1, 0, 0], y: [0, 1, 0] });
  b.extrude(inner, { at: [0, 1.4, 0.84], x: [1, 0, 0], y: [0, 1, 0] });
  const signScoop = new THREE.SphereGeometry(0.15, 12, 8);
  signScoop.scale(1, 0.85, 1);
  put(signScoop, PINK, [0, 1.78, 0.84]);

  // ---------- Wheels ----------
  const spokeCount = 6;
  const addWheel = (x: number, joint: J) => {
    put(
      new THREE.CylinderGeometry(0.32, 0.32, 0.14, 24).rotateZ(Math.PI / 2),
      TYRE,
      [x, 0.32, 0],
      joint,
    );
    put(
      new THREE.CylinderGeometry(0.25, 0.25, 0.16, 24).rotateZ(Math.PI / 2),
      MINT,
      [x, 0.32, 0],
      joint,
    );
    put(
      new THREE.CylinderGeometry(0.08, 0.08, 0.18, 12).rotateZ(Math.PI / 2),
      CHROME,
      [x, 0.32, 0],
      joint,
    );
    for (let k = 0; k < spokeCount; k++) {
      const t = (k * Math.PI * 2) / spokeCount;
      const spoke = new THREE.BoxGeometry(0.03, 0.18, 0.03).rotateX(
        Math.PI / 2 - t,
      );
      put(
        spoke,
        CREAM,
        [x, 0.32 + Math.sin(t) * 0.17, Math.cos(t) * 0.17],
        joint,
      );
    }
  };
  addWheel(0.62, wheelL);
  addWheel(-0.62, wheelR);

  return b.root;
}
```