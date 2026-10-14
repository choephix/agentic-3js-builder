```ts
import * as THREE from "three";
import { createBuilder, noise, paint, stripes, svg } from "agentic-3js-builder";

export const meta = {
  name: "Seaside ice cream cart",
  description: "A mint and cream ice cream cart with a scalloped pink and white canopy, spoked wheels, a chrome freezer lid, a cone sign and a row of giant pastel cones.",
};

const MINT = "#9fe3cf";
const CREAM = "#fff1d6";
const PINK = "#ff8fb1";
const WHITE = "#fffaf3";
const CHROME = "#d5dde2";
const WAFFLE = "#d9a25b";
const TYRE = "#2b2d42";
const GOLD = "#ffd166";
const CHASSIS = "#3d405b";

// Scalloped valance outline: a flat top edge with a row of downward bumps along the bottom.
function scallops(half: number, top: number, yc: number, count: number): [number, number][] {
  const w = (2 * half) / count;
  const r = w / 2;
  const pts: [number, number][] = [[-half, top]];
  for (let k = 0; k < count; k++) {
    const cx = -half + (k + 0.5) * w;
    for (let j = 0; j < 5; j++) {
      const a = Math.PI * (1 - j / 5);
      pts.push([cx + r * Math.cos(a), yc - r * Math.sin(a)]);
    }
  }
  pts.push([half, yc], [half, top]);
  return pts;
}

const candy = stripes(PINK, WHITE, { size: 0.2, axis: "x", width: 0.5, wobble: 0.04 });
const bodyPaint = paint((p) => (p.y < 0.6 ? CREAM : MINT));
const signPaint = paint((p, n, s) =>
  s[1] > 1.6 ? (noise(p, 0.06, 4) > 0.55 ? "#ff9bbd" : "#ffc2d6") : "#e7b26b",
);

export default function build() {
  const b = createBuilder({ name: "ice-cream-cart", detail: 1, paintSize: 1024 });
  b.joint("cart", { at: [0, 0, 0] });

  // Chassis and body
  b.part(new THREE.BoxGeometry(1.5, 0.1, 1.6), CHASSIS, { at: [0, 0.4, 0] });
  const body = b.part(new THREE.BoxGeometry(1.7, 0.6, 1.8), bodyPaint, { at: [0, 0.75, 0] });

  // Decal logo on the right side of the body
  const logo = svg(
    `<svg viewBox="0 0 240 110" xmlns="http://www.w3.org/2000/svg">
      <path d="M70 52 L120 104 L170 52 Z" fill="#e0a85c" stroke="#8a5a2b" stroke-width="3"/>
      <path d="M58 56 Q60 18 120 14 Q180 18 182 56 Q160 68 145 56 Q120 74 96 56 Q78 68 58 56 Z" fill="#ff8fb8" stroke="#8a2d52" stroke-width="3"/>
      <circle cx="120" cy="20" r="8" fill="#e63946"/>
      <text x="120" y="46" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">SCOOPS</text>
    </svg>`,
    { size: 512 },
  );
  b.decal(body, logo, { at: [0.85, 0.9, -0.4], dir: [1, 0, 0], size: [0.5, 0.22] });

  // Serving window on the front
  b.part(new THREE.BoxGeometry(1.0, 0.3, 0.04), CHASSIS, { at: [0, 0.8, 0.915] });

  // Freezer lid in chrome
  b.part(new THREE.BoxGeometry(1.3, 0.1, 0.8), CHROME, { at: [0, 1.1, 0.25] });

  // Wheels: tyre, hub, six spokes
  const wheel = (x: number) => {
    const y = 0.42;
    const z = 0.1;
    b.part(new THREE.TorusGeometry(0.4, 0.06, 8, 20), TYRE, { at: [x, y, z], rotation: [0, 90, 0] });
    b.part(new THREE.CylinderGeometry(0.08, 0.08, 0.12, 10), GOLD, { at: [x, y, z], rotation: [0, 0, 90] });
    for (let k = 0; k < 6; k++)
      b.part(new THREE.BoxGeometry(0.035, 0.74, 0.045), GOLD, { at: [x, y, z], rotation: [k * 30, 0, 0] });
  };
  wheel(-0.95);
  wheel(0.95);

  // Canopy poles
  for (const x of [-0.8, 0.8])
    for (const z of [-0.8, 0.8]) b.rod([x, 1.0, z], [x, 1.8, z], 0.035, { color: CHROME });

  // Canopy: a flattened arch along z, striped pink and white
  b.sweep(
    [
      [0, 1.9, -0.9],
      [0, 1.9, 0.9],
    ],
    (t) => [0.98, 0.26] as [number, number],
    { color: candy, caps: "flat", sides: 12 },
  );

  // Scalloped valances at the front and back of the canopy
  b.extrude(scallops(1.0, 1.9, 1.72, 10), {
    color: candy,
    at: [0, 0, 0.92],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.05,
  });
  b.extrude(scallops(1.0, 1.9, 1.72, 10), {
    color: candy,
    at: [0, 0, -0.92],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.05,
  });

  // Handle at the back
  b.capsule([-0.75, 1.05, -1.12], [0.75, 1.05, -1.12], 0.035, { color: CHROME });
  for (const x of [-0.75, 0.75]) b.rod([x, 0.6, -0.92], [x, 1.05, -1.12], 0.03, { color: CHROME });

  // Cone-shaped sign on a post at the front
  const sign: [number, number][] = [];
  for (let i = 0; i <= 8; i++) {
    const a = (Math.PI * i) / 8;
    sign.push([0.26 * Math.cos(a), 1.6 + 0.26 * Math.sin(a)]);
  }
  sign.push([0, 1.05]);
  b.extrude(sign, { color: signPaint, at: [0, 0, 1.15], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.05 });
  b.rod([0, 0.8, 0.95], [0, 1.35, 1.12], 0.025, { color: CHROME });

  // Row of giant pastel cones standing on the canopy crest, tips down
  const flavours = ["#ff9ec4", "#a8f0d1", "#c9b6ff", "#fff09a", "#ffc9a3"];
  flavours.forEach((flavour, i) => {
    const x = -0.72 + i * 0.36;
    const top = 1.9 + 0.26 * Math.sqrt(1 - (x / 0.98) ** 2);
    const y0 = top - 0.03;

    const cone = new THREE.ConeGeometry(0.13, 0.36, 12);
    cone.rotateX(Math.PI);
    b.part(cone, WAFFLE, { at: [x, y0 + 0.18, 0] });

    const scoop = new THREE.SphereGeometry(0.16, 14, 10);
    scoop.scale(1, 0.8, 1);
    b.part(scoop, flavour, { at: [x, y0 + 0.42, 0] });

    b.part(new THREE.SphereGeometry(0.05, 8, 6), "#e63946", { at: [x, y0 + 0.56, 0] });
  });

  return b.root;
}
```