```ts
import * as THREE from "three";
import { createBuilder, stripes, svg } from "agentic-3js-builder";

export const meta = {
  name: "Seaside ice cream cart",
  description:
    "A mint and cream ice cream cart with a pink and white scalloped canopy, spoked wheels, a chrome freezer lid, a push handle, a cone-shaped hand-painted sign and a row of giant pastel cones.",
};

const MINT = "#7fd9c0";
const CREAM = "#fff4e0";
const CHROME = "#cfd6df";
const PINK = "#ff7fb0";
const WAFFLE = "#e0a85a";
const DARK = "#2d3441";
const CHERRY = "#e0263e";

export default function iceCreamCart() {
  const b = createBuilder({ name: "ice-cream-cart", detail: 1, paintSize: 1024 });

  // Skeleton: a root for the cart and one bone per wheel, so the wheels can spin.
  b.joint("root", { at: [0, 0, 0] });
  b.joint("wheelL", { parent: "root", at: [0.47, 0.24, -0.15], dir: [1, 0, 0] });
  b.joint("wheelR", { parent: "root", at: [-0.47, 0.24, -0.15], dir: [1, 0, 0] });

  // Body: mint box with cream base, cream top and a dark serving hatch with a counter.
  b.part(new THREE.BoxGeometry(0.86, 0.5, 1.1), MINT, { at: [0, 0.5, 0], name: "body" });
  b.part(new THREE.BoxGeometry(0.9, 0.06, 1.14), CREAM, { at: [0, 0.26, 0], name: "baseTrim" });
  b.part(new THREE.BoxGeometry(0.9, 0.04, 1.14), CREAM, { at: [0, 0.77, 0], name: "topTrim" });
  b.part(new THREE.BoxGeometry(0.56, 0.3, 0.02), DARK, { at: [0, 0.52, 0.56], name: "hatch" });
  b.part(new THREE.BoxGeometry(0.66, 0.04, 0.14), CREAM, { at: [0, 0.36, 0.6], name: "counter" });

  // Chrome lid over the freezer: a flattened hemisphere.
  b.part(new THREE.SphereGeometry(0.4, b.segments(16), b.segments(6), 0, Math.PI * 2, 0, Math.PI / 2), CHROME, {
    at: [0, 0.75, 0.08],
    scale: [0.85, 0.25, 1],
    name: "freezerLid",
  });

  // Two big spoked wheels, each a pink rim, cream spokes and a chrome hub.
  for (const side of [1, -1]) {
    const bone = side > 0 ? "wheelL" : "wheelR";
    const at: [number, number, number] = [side * 0.47, 0.24, -0.15];
    b.part(new THREE.TorusGeometry(0.21, 0.03, b.segments(6), b.segments(20)), PINK, {
      at,
      rotation: [0, 90, 0],
      bone,
      name: "wheelRim",
    });
    for (let k = 0; k < 4; k++) {
      b.part(new THREE.BoxGeometry(0.03, 0.38, 0.03), CREAM, {
        at,
        rotation: [k * 45, 0, 0],
        bone,
        name: "spoke",
      });
    }
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.07, b.segments(8)), CHROME, {
      at,
      rotation: [0, 0, 90],
      bone,
      name: "hub",
    });
  }

  // Push handle at the back: two chrome posts, a bar and pink grips.
  for (const s of [1, -1]) {
    b.rod([s * 0.3, 0.75, -0.5], [s * 0.3, 0.95, -0.72], 0.02, { color: CHROME, name: "handlePost" });
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.2, b.segments(8)), PINK, {
      at: [s * 0.42, 0.95, -0.72],
      rotation: [0, 0, 90],
      name: "grip",
    });
  }
  b.rod([-0.42, 0.95, -0.72], [0.42, 0.95, -0.72], 0.025, { color: CHROME, name: "handleBar" });

  // Canopy: pink and white stripes on the roof and on a scalloped valance.
  const awning = stripes("#ff7fb0", "#ffffff", { size: 0.16, axis: "x", width: 0.5 });

  for (const s of [1, -1])
    for (const s2 of [1, -1])
      b.rod([s * 0.42, 0.77, s2 * 0.52], [s * 0.42, 0.98, s2 * 0.52], 0.02, { color: CHROME, name: "canopyPole" });

  b.part(new THREE.BoxGeometry(1.04, 0.04, 1.3), awning, { at: [0, 1.0, 0], name: "roof" });

  // Scalloped valance: a flat top edge with six downward bumps.
  const outline: [number, number][] = [
    [-0.52, 0],
    [0.52, 0],
  ];
  const n = 6;
  const w = 1.04 / n;
  for (let k = 0; k < n; k++) {
    const xa = 0.52 - k * w;
    const xb = xa - w;
    for (let j = 1; j <= 4; j++) {
      const t = j / 5;
      outline.push([xa + (xb - xa) * t, -0.16 * Math.sin(Math.PI * t)]);
    }
    outline.push([xb, 0]);
  }
  b.extrude(outline, {
    color: awning,
    at: [0, 0.98, 0.64],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.03,
    name: "valance",
  });

  // Row of giant fake cones along the top of the roof, each with a pastel scoop.
  const flavours = ["#8fe3c4", "#ff8fb1", "#ffe27a", "#9db4ff", "#ffb88c"];
  flavours.forEach((flavour, i) => {
    const x = -0.4 + i * 0.2;
    b.lathe(
      [
        [0, 0],
        [0.09, 0.24],
        [0, 0.24],
      ],
      { color: WAFFLE, at: [x, 1.0, 0.35], name: "cone" },
    );
    b.part(new THREE.SphereGeometry(0.13, b.segments(12), b.segments(8)), flavour, {
      at: [x, 1.27, 0.35],
      scale: [1, 0.85, 1],
      name: "scoop",
    });
  });
  b.part(new THREE.SphereGeometry(0.035, b.segments(6), b.segments(4)), CHERRY, {
    at: [0, 1.39, 0.35],
    name: "cherry",
  });

  // Hand-painted sign shaped like a cone, drawn as an SVG on a double-sided pair of planes on posts.
  const sign = svg(
    `<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 60 L86 60 L50 136 Z" fill="#e8a84b" stroke="#2b2b2b" stroke-width="4" stroke-linejoin="round"/>
      <path d="M26 72 L74 72 M32 86 L68 86 M40 100 L60 100 M30 66 L40 80 M60 66 L50 80" stroke="#b97826" stroke-width="3" fill="none"/>
      <circle cx="50" cy="44" r="40" fill="#ff7aa8" stroke="#2b2b2b" stroke-width="4"/>
      <circle cx="36" cy="28" r="7" fill="#ffd1e0"/>
      <text x="50" y="54" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle" fill="#ffffff">ICE</text>
    </svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.5, 0.7), "#ffffff", {
    texture: sign,
    at: [0.82, 0.92, 0.3],
    rotation: [0, 90, 0],
    name: "signFront",
  });
  b.part(new THREE.PlaneGeometry(0.5, 0.7), "#ffffff", {
    texture: sign,
    at: [0.82, 0.92, 0.3],
    rotation: [0, -90, 0],
    name: "signBack",
  });
  for (const z of [0.08, 0.52]) b.rod([0.8, 0, z], [0.8, 0.57, z], 0.02, { color: CHROME, name: "signPost" });

  return b.root;
}
```