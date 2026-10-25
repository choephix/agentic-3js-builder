```ts
import * as THREE from "three";
import { createBuilder, svg, countershade, stripes, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "hoverTech",
  description: "Militarized pickup converted to hover thrusters, low-poly cyberpunk.",
};

export default function build() {
  const b = createBuilder({ name: "hoverTech" });
  const chassis = b.joint("chassis", { at: [0, 0.75, 0] });
  const BODY = countershade("#3b4350", "#1c2028");
  const TRIM = "#15171c";
  const OLIVE = stripes("#4a5240", "#383e30", { size: 0.25, axis: "x" });
  const CYAN = "#37f2ff";
  const MAG = "#ff2fa8";
  const STEEL = "#7b8494";

  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r: number, h: number, s = 10) => new THREE.CylinderGeometry(r, r, h, s);
  const P = (g: THREE.BufferGeometry, c: any, at: number[], o: any = {}) =>
    b.part(g, c, { bone: chassis, at, ...o });

  // hull and underbody
  P(box(1.9, 0.35, 5.2), TRIM, [0, 0.0, 0]);
  P(box(2.0, 0.4, 5.0), BODY, [0, 0.4, 0]);
  // hood wedge
  b.frustumBox([0, 0.72, 1.0], [0, 0.78, 2.6], [1.9, 0.3], [1.7, 0.18], { bone: chassis, color: OLIVE });
  // cab
  P(box(1.9, 0.75, 1.5), BODY, [0, 1.0, 0.1]);
  b.frustumBox([0, 1.35, 0.1], [0, 1.45, 0.1], [1.7, 1.3], [1.7, 1.3], { bone: chassis, color: TRIM });
  // glass
  const glass = P(box(1.75, 0.5, 0.05), "#143a48", [0, 1.15, 0.88], { rotation: [-25, 0, 0] });
  glow(glass, 0.6);
  for (const s of [1, -1]) P(box(0.05, 0.45, 1.1), "#143a48", [s * 0.96, 1.15, 0.1]);
  // bed with plates
  P(box(1.95, 0.5, 2.1), OLIVE, [0, 0.75, -1.5]);
  for (const s of [1, -1]) {
    P(box(0.08, 0.6, 2.1), TRIM, [s * 1.0, 0.95, -1.5]);
    P(box(0.06, 0.45, 0.8), STEEL, [s * 1.06, 0.9, -1.5]);
  }
  P(box(1.95, 0.6, 0.08), TRIM, [0, 0.95, -2.55]);
  // roof light bar and antenna
  P(box(1.2, 0.1, 0.18), TRIM, [0, 1.8, 0.7]);
  for (let i = 0; i < 4; i++) glow(P(box(0.2, 0.08, 0.1), CYAN, [-0.45 + i * 0.3, 1.82, 0.78]), 1.6);
  P(cyl(0.012, 1.2, 5), STEEL, [0.8, 2.3, -0.5]);
  // turret
  P(cyl(0.3, 0.2, 8), TRIM, [0, 1.4, -1.0]);
  P(box(0.5, 0.3, 0.7), STEEL, [0, 1.65, -1.0]);
  P(cyl(0.05, 1.4, 6), TRIM, [0, 1.65, -0.1], { dir: [0, 0, 1] });
  // grille and headlights
  P(box(1.0, 0.3, 0.08), TRIM, [0, 0.75, 2.62]);
  for (const s of [1, -1]) {
    glow(P(box(0.4, 0.1, 0.06), CYAN, [s * 0.7, 0.8, 2.6]), 2);
  }
  // front bumper with ram
  P(box(2.2, 0.25, 0.3), STEEL, [0, 0.35, 2.55]);
  // hover thrusters at wheel positions
  const nozzle = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#ffffff"/><circle cx="32" cy="32" r="18" fill="#37f2ff"/><circle cx="32" cy="32" r="8" fill="#ffffff"/></svg>`,
    { size: 128 },
  );
  for (const sx of [1, -1])
    for (const z of [1.55, -1.55]) {
      const pod = P(cyl(0.5, 0.35, 12), TRIM, [sx * 1.15, 0.3, z]);
      P(new THREE.TorusGeometry(0.5, 0.06, 5, 12), STEEL, [sx * 1.15, 0.15, z], { rotation: [90, 0, 0] });
      for (const a of [0, 1, 2, 3]) {
        const an = (a * Math.PI) / 2;
        P(box(0.06, 0.2, 0.6), STEEL, [sx * 1.15 + Math.cos(an) * 0.0, 0.32, z], { rotation: [0, a * 45, 0] });
      }
      const disc = b.part(new THREE.CircleGeometry(0.44, 12), "#ffffff", {
        bone: chassis,
        at: [sx * 1.15, 0.11, z],
        dir: [0, -1, 0],
        axis: "z",
        texture: nozzle,
      });
      glow(disc, 2);
      P(box(0.1, 0.1, 0.5), STEEL, [sx * 0.95, 0.5, z]);
      void pod;
    }
  // neon underglow and flank strips
  for (const s of [1, -1]) {
    glow(P(box(0.05, 0.05, 4.4), MAG, [s * 1.02, 0.55, 0]), 1.8);
    glow(P(box(0.05, 0.05, 4.0), CYAN, [s * 0.8, 0.0, 0]), 1.5);
  }
  // rear thrusters
  for (const s of [1, -1]) {
    P(cyl(0.22, 0.4, 8), TRIM, [s * 0.5, 0.6, -2.7], { dir: [0, 0, 1] });
    glow(P(cyl(0.16, 0.05, 8), CYAN, [s * 0.5, 0.6, -2.92], { dir: [0, 0, 1] }), 2.2);
  }
  // mirrors
  for (const s of [1, -1]) {
    P(box(0.05, 0.05, 0.2), TRIM, [s * 1.05, 1.2, 0.7]);
    P(box(0.05, 0.2, 0.15), STEEL, [s * 1.15, 1.2, 0.7]);
  }
  // unit number decal
  const decal = svg(
    `<svg viewBox="0 0 64 32"><rect width="64" height="32" fill="#111"/><text x="32" y="25" text-anchor="middle" font-size="24" font-family="monospace" font-weight="bold" fill="#ff2fa8">07</text></svg>`,
    { size: 128 },
  );
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.6, 0.3), "#ffffff", {
      bone: chassis,
      at: [s * 1.11, 0.92, -1.5],
      dir: [s, 0, 0],
      axis: "z",
      texture: decal,
    });
  // shift so lowest point is ~0
  b.root.position.y = 0;
  const r = rng(1);
  void r;
  return b.root;
}
```