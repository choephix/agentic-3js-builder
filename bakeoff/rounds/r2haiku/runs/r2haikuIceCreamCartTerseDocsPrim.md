```ts
import * as THREE from "three";
import { createBuilder, spots, stripes, svg } from "agentic-3js-builder";

export const meta = {
  name: "Ice cream cart",
  description: "A mint street cart with a striped awning, scalloped valance, tubs of scoops and a giant cone sign.",
};

const MINT = "#7fd6b8";
const CREAM = "#fff1dc";
const RED = "#e5484d";
const PINK = "#ff8fb1";
const DARK = "#2b2d42";
const CHROME = "#c9ced6";
const WAFFLE = "#d9a35b";
const CHOC = "#5a3a2a";

export default function build() {
  const b = createBuilder({ name: "ice-cream-cart" });
  const cart = b.joint("cart", { at: [0, 0, 0] });

  // Scoop: a turned profile, scaled by k, sitting on `at`.
  const scoop = (at: [number, number, number], color: any, k: number) => {
    const profile: [number, number][] = [
      [0, 0],
      [0.17, 0],
      [0.19, 0.05],
      [0.18, 0.13],
      [0.13, 0.2],
      [0.07, 0.25],
      [0, 0.27],
    ].map(([x, y]) => [x * k, y * k] as [number, number]);
    b.lathe(profile, { at, bone: cart, smoothing: 1, color });
  };

  // Chassis, body, skirt and freezer lid.
  b.part(new THREE.BoxGeometry(1.0, 0.1, 0.7), DARK, { at: [0, 0.3, 0], bone: cart });
  b.part(new THREE.BoxGeometry(1.0, 0.6, 0.6), MINT, { at: [0, 0.65, 0], bone: cart });
  b.part(new THREE.BoxGeometry(1.04, 0.06, 0.64), CREAM, { at: [0, 0.37, 0], bone: cart });
  b.part(new THREE.BoxGeometry(0.92, 0.08, 0.52), CREAM, { at: [0, 0.99, -0.02], bone: cart });

  // Serving window with a dark recess, and a painted sign board above it.
  b.part(new THREE.BoxGeometry(0.72, 0.22, 0.02), DARK, { at: [0, 0.7, 0.31], bone: cart });
  const sign = svg(
    `<svg viewBox="0 0 80 16" xmlns="http://www.w3.org/2000/svg">
       <rect width="80" height="16" rx="3" fill="#fff1dc"/>
       <text x="40" y="12" font-size="12" font-family="sans-serif" font-weight="bold" text-anchor="middle" fill="#e5484d">ICE CREAM</text>
     </svg>`,
    { size: 512 },
  );
  b.part(new THREE.PlaneGeometry(0.8, 0.1), "#ffffff", {
    at: [0, 0.9, 0.315],
    dir: [0, 0, 1],
    axis: "z",
    texture: sign,
    bone: cart,
  });

  // Serving counter and two tubs with scoops.
  b.part(new THREE.BoxGeometry(0.9, 0.04, 0.24), CREAM, { at: [0, 0.56, 0.42], bone: cart });
  for (const [x, color] of [
    [-0.25, PINK],
    [0.2, MINT],
  ] as const) {
    b.part(new THREE.CylinderGeometry(0.09, 0.07, 0.1, 10), CHROME, { at: [x, 0.63, 0.42], bone: cart });
    scoop([x, 0.68, 0.42], color, 0.55);
  }

  // Wheels with chrome hubs, one per side.
  for (const x of [-0.55, 0.55]) {
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.07, 14), DARK, {
      at: [x, 0.2, 0.05],
      rotation: [0, 0, 90],
      bone: cart,
    });
    b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.09, 10), CHROME, {
      at: [x, 0.2, 0.05],
      rotation: [0, 0, 90],
      bone: cart,
    });
  }

  // Push handle: two arms from the body back and a crossbar.
  for (const x of [-0.42, 0.42]) {
    b.rod([x, 0.85, -0.3], [x, 0.95, -0.8], 0.022, { color: CHROME, bone: cart });
  }
  b.rod([-0.42, 0.95, -0.8], [0.42, 0.95, -0.8], 0.022, { color: CHROME, bone: cart });

  // Umbrella canopy: a striped top, four chrome posts and a scalloped valance.
  for (const x of [-0.44, 0.44]) {
    for (const z of [-0.24, 0.24]) {
      b.rod([x, 1.03, z], [x, 1.83, z], 0.025, { color: CHROME, bone: cart });
    }
  }
  b.part(new THREE.BoxGeometry(1.3, 0.05, 1.0), stripes(RED, CREAM, { size: 0.22, axis: "x" }), {
    at: [0, 1.85, 0],
    bone: cart,
  });
  for (let i = 0; i < 8; i++) {
    const x = -0.6 + (i * 1.2) / 7;
    b.part(new THREE.SphereGeometry(0.09, 10, 5, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), CREAM, {
      at: [x, 1.825, 0.5],
      bone: cart,
    });
  }

  // Giant cone sign on top of the canopy: a wafer, a pink scoop and a cherry.
  b.part(new THREE.ConeGeometry(0.16, 0.4, 12), WAFFLE, {
    at: [0, 2.075, 0],
    rotation: [180, 0, 0],
    bone: cart,
  });
  scoop([0, 2.275, 0], spots(PINK, CHOC, { size: 0.05, amount: 0.3, seed: 2 }), 1.0);
  b.part(new THREE.SphereGeometry(0.045, 8, 6), RED, { at: [0, 2.575, 0], bone: cart });

  return b.root;
}
```