```ts
import * as THREE from "three";
import { createBuilder, svg } from "agentic-3js-builder";

export const meta = {
  name: "ice-cream-cart",
  description: "A seaside ice cream cart with a mint body, a pink and cream scalloped canopy, a chrome freezer lid, a cone sign and five giant pastel cones on top.",
};

const MINT = "#7fd8c4";
const CREAM = "#fff6e8";
const PINK = "#ff8fb1";
const CHROME = "#d5dde3";
const DARK = "#2d3142";
const RED = "#e35d4c";
const WAFFLE = "#e6a85c";

export default function build() {
  const b = createBuilder({ name: "ice-cream-cart" });
  b.joint("cart", { at: [0, 0, 0] });

  const part = (
    geo: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    rotation: [number, number, number] = [0, 0, 0],
  ) => b.part(geo, color, { at, rotation });

  // Chassis, body and counter
  part(new THREE.BoxGeometry(1.0, 0.12, 1.4), CREAM, [0, 0.32, 0]);
  part(new THREE.BoxGeometry(0.9, 0.57, 1.2), MINT, [0, 0.665, 0]);
  part(new THREE.BoxGeometry(0.92, 0.05, 1.22), CREAM, [0, 0.62, 0]); // waist band
  part(new THREE.BoxGeometry(1.0, 0.06, 0.3), CREAM, [0, 0.56, 0.7]); // serving counter

  // Serving window on the front
  part(new THREE.BoxGeometry(0.56, 0.36, 0.02), CREAM, [0, 0.76, 0.605]);
  part(new THREE.BoxGeometry(0.5, 0.3, 0.03), DARK, [0, 0.76, 0.62]);

  // Chrome freezer lid, a dome along Z
  b.lathe(
    [
      [0, -0.42],
      [0.3, -0.42],
      [0.4, -0.3],
      [0.4, 0.3],
      [0.3, 0.42],
      [0, 0.42],
    ],
    { at: [0, 0.95, 0], axis: [0, 0, 1], color: CHROME, smoothing: 1 },
  );

  // Wheels: rim, hub and three spokes on each side
  for (const s of [1, -1]) {
    const x = s * 0.52;
    b.part(new THREE.TorusGeometry(0.33, 0.04, 6, 18), RED, { at: [x, 0.37, 0], rotation: [0, 90, 0] });
    part(new THREE.CylinderGeometry(0.07, 0.07, 0.16, 10), CHROME, [x, 0.37, 0], [0, 0, 90]);
    for (const a of [0, 60, 120]) {
      part(new THREE.BoxGeometry(0.06, 0.66, 0.05), CREAM, [x, 0.37, 0], [a, 0, 0]);
    }
  }

  // Canopy: alternating pink and cream stripes on a gable roof
  const STRIPES = 8;
  const pitch = 0.2353; // rise over run, about 13.2 degrees
  const tilt = Math.atan(pitch) * (180 / Math.PI);
  const roofY = (x: number) => 2.0 - pitch * Math.abs(x);
  for (let i = 0; i < STRIPES; i++) {
    const x = -0.85 + 0.2125 * (i + 0.5);
    const color = i % 2 === 0 ? PINK : CREAM;
    const rz = x > 0 ? -tilt : tilt;
    part(new THREE.BoxGeometry(0.22, 0.04, 1.5), color, [x, roofY(x), 0], [0, 0, rz]);
  }

  // Scalloped valance, front and back
  for (let i = 0; i < STRIPES; i++) {
    const x = -0.85 + 0.2125 * (i + 0.5);
    const color = i % 2 === 0 ? PINK : CREAM;
    for (const z of [0.76, -0.76]) {
      part(new THREE.CylinderGeometry(0.105, 0.105, 0.03, 12), color, [x, roofY(x) - 0.03, z], [90, 0, 0]);
    }
  }

  // Chrome canopy poles and push bar
  for (const sx of [1, -1]) {
    for (const sz of [1, -1]) {
      part(new THREE.CylinderGeometry(0.025, 0.025, 0.96, 8), CHROME, [sx * 0.4, 1.43, sz * 0.6]);
    }
  }
  for (const s of [1, -1]) {
    part(new THREE.CylinderGeometry(0.025, 0.025, 0.62, 8), CHROME, [s * 0.42, 0.69, -0.75]);
  }
  part(new THREE.CylinderGeometry(0.025, 0.025, 0.84, 8), CHROME, [0, 1.0, -0.75], [0, 0, 90]);

  // Hand-painted cone sign on a pole at the front right
  part(new THREE.CylinderGeometry(0.02, 0.02, 0.51, 8), CHROME, [0.38, 0.845, 0.8]);
  b.extrude(
    [
      [0, -0.3, "sharp"],
      [0.2, 0.08],
      [0.16, 0.2],
      [0, 0.25],
      [-0.16, 0.2],
      [-0.2, 0.08],
    ],
    { at: [0.38, 1.12, 0.8], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.03, smoothing: 1, color: CREAM },
  );
  const signTex = svg(
    `<svg viewBox="0 0 100 138" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="40" r="30" fill="#ff7aa8"/>
      <path d="M26 36 Q34 26 42 36 Q50 26 58 36 Q66 26 74 36" fill="none" stroke="#fff6e8" stroke-width="4"/>
      <path d="M22 60 L50 134 L78 60 Z" fill="#e6a85c"/>
      <path d="M32 74 L62 108 M62 74 L40 108" stroke="#b86a22" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.4, 0.55), "#ffffff", {
    at: [0.38, 1.095, 0.83],
    dir: [0, 0, 1],
    axis: "z",
    texture: signTex,
  });

  // Five giant pastel cones along the top of the canopy
  const flavours = ["#ff9ec4", "#9fd8ff", "#fff1a1", "#c9b6ff", "#b8f2d0"];
  const zs = [-0.5, -0.25, 0, 0.25, 0.5];
  zs.forEach((z, i) => {
    b.part(new THREE.CylinderGeometry(0.1, 0, 0.25, 12), WAFFLE, [0, 2.14, z]);
    b.lathe(
      [
        [0, 0],
        [0.11, 0.03],
        [0.13, 0.1],
        [0.11, 0.18],
        [0.06, 0.23],
        [0, 0.26],
      ],
      { at: [0, 2.24, z], color: flavours[i], smoothing: 1 },
    );
    if (i === 2) {
      part(new THREE.SphereGeometry(0.035, 8, 6), RED, [0, 2.52, z]);
    }
  });

  return b.root;
}
```