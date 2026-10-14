```ts
import * as THREE from "three";
import { createBuilder, patches, spots, stripes, svg } from "agentic-3js-builder";

export const meta = {
  name: "Ice cream cart",
  description: "A striped-awning ice cream cart on wheels: mint cabinet, serving window, tubs of scoops, a waffle-cone sign.",
};

// Palette
const CREAM = "#fff6e8";
const MINT = "#7fd3c4";
const RED = "#e8475f";
const YELLOW = "#ffd23f";
const CHROME = "#c9ced6";
const DARK = "#3b3b44";
const TUB = "#d9dfe6";

// Paints and textures
const awning = stripes(CREAM, RED, { size: 0.22, axis: "x", width: 0.5 });
const waffle = patches("#b06f2e", "#e7b576", { size: 0.07, gap: 0.14 });
const pinkScoop = spots("#f58bb0", ["#ffffff", "#3d9bd8", "#ffd23f"], { size: 0.07, amount: 0.4 });

const signTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 110">
  <rect x="4" y="4" width="592" height="102" rx="26" fill="${RED}"/>
  <text x="300" y="78" font-family="Arial Black, Arial, sans-serif" font-size="64" font-weight="900" fill="${CREAM}" text-anchor="middle">ICE CREAM</text>
</svg>`,
);

const menuTex = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 260">
  <rect width="200" height="260" rx="14" fill="#2e3b35"/>
  <text x="100" y="46" font-family="Arial Black, Arial, sans-serif" font-size="26" font-weight="900" fill="${CREAM}" text-anchor="middle">MENU</text>
  <circle cx="100" cy="100" r="36" fill="#f58bb0"/>
  <circle cx="66" cy="128" r="28" fill="#9fe3c7"/>
  <circle cx="134" cy="128" r="28" fill="#c98a5a"/>
  <polygon points="72,148 128,148 100,236" fill="#e0a866"/>
</svg>`,
);

export default function build() {
  const kit = createBuilder({ name: "ice-cream-cart", paintSize: 1024 });
  kit.joint("cart", { at: [0, 0, 0] });

  const box = (w: number, h: number, d: number, color: string | object, at: number[], extra = {}) =>
    kit.part(new THREE.BoxGeometry(w, h, d), color as string, { at, ...extra });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, at: number[], extra = {}) =>
    kit.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, ...extra });
  const ball = (r: number, color: string | object, at: number[], extra = {}) =>
    kit.part(new THREE.SphereGeometry(r, 14, 10), color as string, { at, ...extra });

  // Chassis and wheels
  box(1.26, 0.08, 0.76, DARK, [0, 0.34, 0]);
  for (const side of [-1, 1]) {
    cyl(0.2, 0.2, 0.08, 14, DARK, [side * 0.66, 0.2, -0.05], { rotation: [0, 0, 90] });
    cyl(0.08, 0.08, 0.1, 10, CHROME, [side * 0.7, 0.2, -0.05], { rotation: [0, 0, 90] });
    box(0.04, 0.1, 0.06, DARK, [side * 0.6, 0.25, -0.05]);
    // Front casters on a short leg
    cyl(0.06, 0.06, 0.05, 10, DARK, [side * 0.5, 0.06, 0.45], { rotation: [0, 0, 90] });
    box(0.04, 0.2, 0.04, DARK, [side * 0.5, 0.2, 0.45]);
  }
  kit.rod([-0.6, 0.2, -0.05], [0.6, 0.2, -0.05], 0.025, { color: DARK });

  // Cabinet body
  box(1.2, 0.8, 0.7, MINT, [0, 0.8, 0]);
  box(1.22, 0.06, 0.72, YELLOW, [0, 0.43, 0]);
  box(1.22, 0.06, 0.72, CREAM, [0, 1.2, 0]);

  // Serving window and counter
  box(0.86, 0.36, 0.02, CREAM, [0, 0.78, 0.36]);
  box(0.74, 0.28, 0.02, "#ffd98a", [0, 0.78, 0.372]);
  box(1.3, 0.05, 0.28, CREAM, [0, 0.665, 0.45]);

  // Tubs of scoops on the counter
  const flavours = ["#f58bb0", "#6b3a24", "#9fe3c7"];
  [-0.36, 0, 0.36].forEach((x, i) => {
    cyl(0.1, 0.085, 0.12, 14, TUB, [x, 0.725, 0.44]);
    ball(0.1, flavours[i], [x, 0.85, 0.44], { scale: [1, 0.85, 1] });
  });

  // Front sign and side menu boards
  kit.part(new THREE.PlaneGeometry(0.9, 0.165), "#ffffff", { at: [0, 1.08, 0.385], texture: signTex });
  for (const side of [-1, 1]) {
    box(0.02, 0.56, 0.46, "#8a5a3c", [side * 0.61, 0.8, -0.05]);
    kit.part(new THREE.PlaneGeometry(0.4, 0.52), "#ffffff", {
      at: [side * 0.625, 0.8, -0.05],
      rotation: [0, side * 90, 0],
      texture: menuTex,
    });
  }

  // Push handle at the back
  for (const side of [-1, 1]) kit.rod([side * 0.5, 0.42, -0.3], [side * 0.5, 1.0, -0.8], 0.03, { color: CHROME });
  kit.rod([-0.5, 1.0, -0.8], [0.5, 1.0, -0.8], 0.03, { color: CHROME });

  // Striped barrel awning: a half cylinder whose arc spans the width, running front to back
  kit.part(new THREE.CylinderGeometry(0.78, 0.78, 1.5, 24, 1, false, Math.PI / 2, Math.PI), awning, {
    at: [0, 1.2, 0.05],
    rotation: [90, 0, 0],
  });
  // Scalloped trim along the front rim
  for (let i = 0; i <= 8; i++) {
    const a = (i * Math.PI) / 8;
    ball(0.05, CREAM, [-0.78 * Math.cos(a), 1.2 + 0.78 * Math.sin(a), 0.8]);
  }

  // Sign pole, waffle cone, scoop and cherry
  kit.rod([0, 1.85, 0], [0, 2.05, 0], 0.035, { color: CHROME });
  kit.part(new THREE.ConeGeometry(0.2, 0.5, 14), waffle, { at: [0, 2.27, 0], rotation: [180, 0, 0] });
  ball(0.22, pinkScoop, [0, 2.72, 0], { scale: [1, 0.9, 1] });
  ball(0.05, "#d6203a", [0, 2.98, 0]);
  kit.rod([0, 2.98, 0], [0.03, 3.07, 0], 0.008, { color: "#3f8a3a" });

  return kit.root;
}
```