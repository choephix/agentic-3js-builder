```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Ice Cream Cart",
  description:
    "A pushcart with a striped umbrella canopy, a cream-coloured cabinet with lids and tubs, spoked wheels, a handlebar and a cone sign on each side.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "iceCreamCart" });
  const CREAM = "#fff1d6";
  const MINT = "#7fd8c0";
  const PINK = "#ff8fb1";
  const RED = "#e84a5f";
  const DARK = "#3a2f35";
  const METAL = "#b9c2c9";
  const WAFFLE = "#d9a05b";
  const CHOC = "#6b3e26";
  const YELLOW = "#ffd35a";

  b.joint("root", { at: [0, 0, 0] });
  const wheelR = 0.355;
  b.joint("wheelL", { parent: "root", at: [0.5, wheelR, 0] });
  b.joint("wheelR", { parent: "root", at: [-0.5, wheelR, 0] });

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 12) => new THREE.CylinderGeometry(rt, rb, h, s);
  const sph = (r: number, s = 10) => new THREE.SphereGeometry(r, s, Math.max(6, s - 2));

  // chassis
  b.part(box(0.9, 0.06, 1.4), DARK, { at: [0, 0.5, 0], bone: "root" });
  // axle
  b.part(cyl(0.03, 0.03, 1.1, 8), METAL, { at: [0, wheelR, 0], rotation: [0, 0, 90], bone: "root" });

  // cabinet
  b.part(box(0.95, 0.58, 1.3), CREAM, { at: [0, 0.82, 0], bone: "root" });
  // stripe trims
  b.part(box(0.97, 0.07, 1.32), MINT, { at: [0, 0.6, 0], bone: "root" });
  b.part(box(0.97, 0.07, 1.32), PINK, { at: [0, 1.08, 0], bone: "root" });
  b.part(box(0.99, 0.03, 1.34), RED, { at: [0, 1.125, 0], bone: "root" });

  // lids (front half closed)
  for (const s of [1, -1]) {
    b.part(box(0.44, 0.04, 0.6), METAL, { at: [s * 0.23, 1.17, 0.33], bone: "root" });
    b.part(box(0.1, 0.03, 0.04), DARK, { at: [s * 0.23, 1.2, 0.5], bone: "root" });
  }
  // open tubs with scoops at the back
  const flavours = [PINK, MINT, YELLOW];
  [-0.27, 0, 0.27].forEach((x, i) => {
    b.part(cyl(0.115, 0.1, 0.1, 12), METAL, { at: [x, 1.2, -0.38], bone: "root" });
    b.part(sph(0.1), flavours[i], { at: [x, 1.26, -0.38], scale: [1, 0.7, 1], bone: "root" });
  });
  b.part(box(0.9, 0.04, 0.4), CHOC, { at: [0, 1.155, -0.38], bone: "root" });

  // front panel menu board
  b.part(box(0.6, 0.3, 0.02), DARK, { at: [0, 0.85, 0.66], bone: "root" });
  [YELLOW, PINK, MINT].forEach((c, i) =>
    b.part(box(0.4, 0.04, 0.025), c, { at: [0, 0.94 - i * 0.09, 0.665], bone: "root" }),
  );

  // side cone signs
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.1, 0.28, 4), WAFFLE, {
      at: [s * 0.49, 0.72, 0],
      rotation: [180, 0, 0],
      scale: [0.4, 1, 1],
      bone: "root",
    });
    b.part(sph(0.115), PINK, { at: [s * 0.49, 0.9, 0], scale: [0.4, 1, 1], bone: "root" });
    b.part(sph(0.095), MINT, { at: [s * 0.49, 1.0, 0], scale: [0.4, 1, 1], bone: "root" });
    b.part(sph(0.03, 8), RED, { at: [s * 0.49, 1.07, 0], bone: "root" });
  }

  // wheels
  for (const [name, s] of [["wheelL", 1], ["wheelR", -1]] as const) {
    const x = s * 0.5;
    b.part(new THREE.TorusGeometry(0.31, 0.045, 6, 20), DARK, { at: [x, wheelR, 0], rotation: [0, 90, 0], bone: name });
    b.part(cyl(0.07, 0.07, 0.08, 10), METAL, { at: [x, wheelR, 0], rotation: [0, 0, 90], bone: name });
    b.part(cyl(0.035, 0.035, 0.12, 8), RED, { at: [x, wheelR, 0], rotation: [0, 0, 90], bone: name });
    for (let k = 0; k < 3; k++)
      b.part(box(0.025, 0.6, 0.025), METAL, { at: [x, wheelR, 0], rotation: [k * 60, 0, 0], bone: name });
  }

  // handlebar at back
  for (const s of [1, -1]) {
    b.rod([s * 0.38, 0.62, -0.62], [s * 0.38, 1.0, -1.15], 0.022, { color: METAL, bone: "root" });
    b.part(cyl(0.03, 0.03, 0.14, 8), RED, { at: [s * 0.42, 1.0, -1.15], rotation: [0, 0, 90], bone: "root" });
  }
  b.part(cyl(0.022, 0.022, 0.8, 8), METAL, { at: [0, 1.0, -1.15], rotation: [0, 0, 90], bone: "root" });

  // front kickstand
  b.rod([0, 0.52, 0.62], [0, 0.0 + 0.02, 0.95], 0.02, { color: METAL, bone: "root" });
  b.part(box(0.2, 0.03, 0.1), DARK, { at: [0, 0.015, 0.95], bone: "root" });

  // umbrella pole
  b.part(cyl(0.025, 0.025, 1.15, 8), METAL, { at: [0, 1.72, -0.05], bone: "root" });
  b.part(cyl(0.05, 0.05, 0.08, 10), DARK, { at: [0, 1.17, -0.05], bone: "root" });

  // canopy wedges
  const n = 12;
  const rimY = 2.15;
  const cH = 0.42;
  const cR = 1.15;
  for (let k = 0; k < n; k++) {
    const g = new THREE.ConeGeometry(cR, cH, 1, 1, true, (k / n) * Math.PI * 2, (Math.PI * 2) / n);
    b.part({ geometry: g, color: k % 2 ? CREAM : RED, at: [0, rimY + cH / 2, -0.05], bone: "root", flat: true });
    // bunting ball at rim
    const a = ((k + 0.5) / n) * Math.PI * 2;
    b.part(sph(0.05, 6), k % 2 ? PINK : MINT, {
      at: [Math.sin(a) * (cR + 0.01), rimY - 0.03, -0.05 + Math.cos(a) * (cR + 0.01)],
      bone: "root",
    });
  }
  // underside disc so the canopy isn't see-through
  b.part(cyl(cR, cR, 0.015, 12), "#f4dfc0", { at: [0, rimY, -0.05], bone: "root" });
  // finial: tiny cone with scoop
  b.part(new THREE.ConeGeometry(0.05, 0.14, 6), WAFFLE, { at: [0, rimY + cH + 0.06, -0.05], rotation: [180, 0, 0], bone: "root" });
  b.part(sph(0.07), PINK, { at: [0, rimY + cH + 0.17, -0.05], bone: "root" });
  b.part(sph(0.02, 6), RED, { at: [0, rimY + cH + 0.25, -0.05], bone: "root" });

  // bell on handle side
  b.part(sph(0.04, 8), YELLOW, { at: [0.3, 1.04, -1.15], scale: [1, 0.9, 1], bone: "root" });

  return b.root;
}
```