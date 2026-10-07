```ts
import * as THREE from "three";
import { createBuilder, catmull, paint, scales } from "agentic-3js-builder";

const MINT = "#8fd9c0";
const CREAM = "#fff4df";
const PINK = "#ff8fb1";
const CHROME = "#dfe5ec";
const WAFFLE = "#d69a55";
const WAFFLE_DARK = "#b87a3a";
const CHERRY = "#e8434f";
const FLAVOURS = ["#ffb3c7", "#bdeccf", "#cbb8f2", "#fff0a6", "#ffc7a1", "#b9e0f7"];

export const meta = {
  name: "Seaside ice cream cart",
  description: "A mint and cream ice cream cart with a pink and white scalloped awning, spoked wheels and giant pastel cones.",
};

export default function build() {
  const b = createBuilder({ name: "ice-cream-cart" });
  const cart = b.joint("cart", { at: [0, 0, 0] });

  // Body: mint box, cream plinth, pink band
  b.part(new THREE.BoxGeometry(0.84, 0.6, 1.1), MINT, { at: [0, 0.8, 0], bone: cart });
  b.part(new THREE.BoxGeometry(0.86, 0.07, 1.12), PINK, { at: [0, 0.8, 0], bone: cart });
  b.part(new THREE.BoxGeometry(0.87, 0.09, 1.13), CREAM, { at: [0, 0.53, 0], bone: cart });

  // Chrome lid over the freezer, domed on the front top
  b.part(new THREE.SphereGeometry(0.22, 16, 10), CHROME, {
    at: [0, 1.1, 0.3],
    scale: [1, 0.4, 0.9],
    bone: cart,
  });

  // Wheels: pink rims, cream spokes, chrome hubs. Axle at y = 0.42 so the tyres touch the floor.
  for (const x of [-0.5, 0.5]) {
    const c: [number, number, number] = [x, 0.42, -0.1];
    b.part(new THREE.TorusGeometry(0.36, 0.06, 8, 24), PINK, { at: c, dir: [1, 0, 0], axis: "z", bone: cart });
    for (let k = 0; k < 6; k++) {
      b.part(new THREE.BoxGeometry(0.03, 0.66, 0.03), CREAM, { at: c, rotation: [k * 30, 0, 0], bone: cart });
    }
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 10), CHROME, { at: c, dir: [1, 0, 0], bone: cart });
  }

  // Push handle at the back
  const handle = catmull([
    [-0.3, 0.82, -0.5],
    [-0.3, 0.95, -0.85],
    [0.3, 0.95, -0.85],
    [0.3, 0.82, -0.5],
  ]);
  b.sweep(handle, 0.022, { color: CHROME });

  // Awning: a half-cylinder arch over the cart, striped pink and cream round its arc
  const awningGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.3, 24, 1, true, Math.PI / 2, Math.PI);
  awningGeo.rotateX(Math.PI / 2);
  awningGeo.translate(0, 1.3, 0.25);
  const awningPaint = paint((_p, _n, s) => (Math.floor(s[0] * 8) % 2 ? CREAM : PINK));
  b.part(awningGeo, awningPaint, { at: [0, 0, 0], bone: cart });

  // Scalloped valance hanging from the front edge of the awning
  const N = 9;
  for (let i = 0; i < N; i++) {
    const psi = (Math.PI * (i + 0.5)) / N;
    const x = 0.5 * Math.cos(psi);
    const y = 1.3 + 0.5 * Math.sin(psi) - 0.03;
    b.part(new THREE.SphereGeometry(0.05, 10, 6), i % 2 ? PINK : CREAM, {
      at: [x, y, 0.9],
      scale: [1, 1.2, 0.5],
      bone: cart,
    });
  }

  // Chrome posts holding the awning
  for (const x of [-0.42, 0.42]) {
    for (const z of [-0.35, 0.45]) {
      b.rod([x, 1.0, z], [x, 1.57, z], 0.022, { color: CHROME });
    }
  }

  // Hand-painted cone sign on the front of the cart, with a scoop and a cherry
  b.extrude(
    [
      [-0.2, 0.2],
      [0.2, 0.2],
      [0, -0.22, "sharp"],
    ],
    {
      at: [0, 0.98, 0.58],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.05,
      bevel: 0.01,
      color: scales(WAFFLE, WAFFLE_DARK, { size: 0.05 }),
      bone: cart,
    },
  );
  b.part(new THREE.SphereGeometry(0.12, 14, 9), FLAVOURS[0], { at: [0, 1.22, 0.6], bone: cart });
  b.part(new THREE.SphereGeometry(0.035, 8, 6), CHERRY, { at: [0, 1.36, 0.6], bone: cart });

  // Row of giant pastel cones along the top of the cart, tips set into the body
  let flavour = 0;
  for (const x of [-0.2, 0.2]) {
    for (const z of [-0.44, -0.27, -0.1]) {
      b.part(new THREE.ConeGeometry(0.07, 0.22, 10), WAFFLE, {
        at: [x, 1.17, z],
        rotation: [180, 0, 0],
        bone: cart,
      });
      b.part(new THREE.SphereGeometry(0.09, 12, 8), FLAVOURS[flavour % FLAVOURS.length], {
        at: [x, 1.3, z],
        scale: [1, 0.9, 1],
        bone: cart,
      });
      flavour++;
    }
  }

  return b.root;
}
```