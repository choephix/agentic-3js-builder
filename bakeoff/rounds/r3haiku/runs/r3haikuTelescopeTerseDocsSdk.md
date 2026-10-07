```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "telescope",
  description: "A cream refractor telescope on a fork mount and three-leg wooden tripod, with brass trim, a dew shield, a diagonal eyepiece and a finder scope.",
};

const TUBE = "#f2efe6";
const SHIELD = "#20242c";
const TEAL = "#1d6b73";
const BRASS = "#d9a441";
const WOOD = "#b07a43";
const DARK = "#2b2f38";
const GLASS = "#8fd9ea";

// Offset a point along a direction by k metres.
const step = (base: number[], dir: number[], k: number): number[] =>
  base.map((v, i) => v + k * dir[i]);

const cyl = (r: number, h: number, seg = 16, open = false) =>
  new THREE.CylinderGeometry(r, r, h, seg, 1, open);

export default function build() {
  const b = createBuilder({ name: "telescope" });

  // Tube axis: 35 degrees above horizontal, pointing forward (+Z).
  const tilt = (35 * Math.PI) / 180;
  const d = [0, Math.sin(tilt), Math.cos(tilt)]; // along the tube, toward the front
  const u = [0, Math.cos(tilt), -Math.sin(tilt)]; // across the tube, up and back

  const M = [0, 0.85, 0]; // fork mount head
  const C = [0, 1.25, 0.05]; // tube centre, on the trunnion axis

  // Skeleton: mount (root) -> tube (altitude hinge).
  const mount = b.joint("mount", { at: M });
  const tube = b.joint("tube", { parent: mount, at: C, aim: step(C, d, 1), role: "hinge" });

  // ---- Main optical tube ----
  b.part(cyl(0.07, 1.0, 20), TUBE, { at: C, dir: d, bone: tube });
  // Rear cell and front lens cell
  b.part(cyl(0.074, 0.03, 20), DARK, { at: step(C, d, -0.5), dir: d, bone: tube });
  b.part(cyl(0.074, 0.03, 20), BRASS, { at: step(C, d, 0.3), dir: d, bone: tube });
  // Teal accent band
  b.part(cyl(0.0722, 0.08, 20), TEAL, { at: step(C, d, -0.1), dir: d, bone: tube });
  // Objective glass
  b.part(cyl(0.066, 0.01, 20), GLASS, { at: step(C, d, 0.5), dir: d, bone: tube });

  // Dew shield with a rim
  b.part(cyl(0.086, 0.16, 20, true), SHIELD, { at: step(C, d, 0.58), dir: d, bone: tube });
  b.part(new THREE.TorusGeometry(0.086, 0.008, 6, 20), SHIELD, {
    at: step(C, d, 0.66),
    dir: d,
    axis: "z",
    bone: tube,
  });

  // ---- Rear focuser, diagonal and eyepiece ----
  const fo = step(C, d, -0.42);
  b.part(cyl(0.04, 0.06, 12), DARK, { at: step(fo, u, 0.1), dir: u, bone: tube });
  b.part(cyl(0.024, 0.12, 12), BRASS, { at: step(fo, u, 0.2), dir: u, bone: tube });
  b.part(cyl(0.024, 0.22, 12), DARK, { at: step(fo, u, 0.25), dir: u, bone: tube });
  b.part(cyl(0.032, 0.04, 12), BRASS, { at: step(fo, u, 0.37), dir: u, bone: tube });
  // Focus knob on the side of the focuser
  b.part(new THREE.SphereGeometry(0.02, 8, 6), BRASS, {
    at: step(step(fo, u, 0.1), d, 0.05),
    bone: tube,
  });

  // ---- Finder scope on top of the tube ----
  const fc = step(step(C, d, -0.15), u, 0.13);
  b.part(cyl(0.035, 0.3, 14), SHIELD, { at: fc, dir: d, bone: tube });
  b.part(cyl(0.038, 0.02, 14), BRASS, { at: step(fc, d, 0.15), dir: d, bone: tube });
  b.part(cyl(0.038, 0.02, 14), DARK, { at: step(fc, d, -0.15), dir: d, bone: tube });
  // Two finder brackets: thin plates from tube top to finder body
  for (const k of [-0.25, -0.05]) {
    b.part(new THREE.BoxGeometry(0.05, 0.04, 0.05), TEAL, {
      at: step(step(C, d, k), u, 0.09),
      dir: d,
      axis: "z",
      bone: tube,
    });
  }

  // ---- Fork mount ----
  b.part(new THREE.BoxGeometry(0.28, 0.12, 0.2), TEAL, { at: M, bone: mount });
  b.part(cyl(0.07, 0.03, 16), BRASS, { at: [0, 0.79, 0], bone: mount });
  for (const s of [1, -1]) {
    // Fork arms reaching up to the trunnions
    b.rod([s * 0.1, 0.85, 0], [s * 0.11, C[1], C[2]], 0.026, { color: TEAL, bone: mount });
    // Trunnion axle and brass knob
    b.part(cyl(0.03, 0.05, 12), TEAL, { at: [s * 0.095, C[1], C[2]], dir: [s, 0, 0], bone: tube });
    b.part(new THREE.SphereGeometry(0.035, 8, 6), BRASS, { at: [s * 0.125, C[1], C[2]], bone: tube });
  }

  // ---- Tripod ----
  b.part(cyl(0.05, 0.12, 12), DARK, { at: [0, 0.76, 0], bone: mount });

  const legAngles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
  // Point on leg `a` at height y: legs splay from the hub to the feet.
  const legPoint = (a: number, y: number): number[] => {
    const r = 0.06 + (0.44 * (0.78 - y)) / 0.76;
    return [Math.sin(a) * r, y, Math.cos(a) * r];
  };

  for (const a of legAngles) {
    b.capsule(legPoint(a, 0.78), legPoint(a, 0.02), 0.018, { color: WOOD, bone: mount });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), DARK, { at: legPoint(a, 0.025), bone: mount });
  }
  // Cross braces joining the legs at mid-height
  for (let i = 0; i < 3; i++) {
    b.capsule(legPoint(legAngles[i], 0.3), legPoint(legAngles[(i + 1) % 3], 0.3), 0.012, {
      color: WOOD,
      bone: mount,
    });
  }

  return b.root;
}
```