```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

type P3 = [number, number, number];

export const meta = {
  name: "Brass explorer's telescope",
  description:
    "A polished brass refractor with leather-wrapped sections, engraved rings, a finder scope and rubber eyepiece, on a mahogany tripod with brass fittings and a tray holding a rolled star chart.",
};

const BRASS = "#c9a227";
const BRASS_DARK = "#8a6d1c";
const BRASS_WARM = "#b08a2a";
const LEATHER = "#5b3a1e";
const MAHOGANY = "#5a2412";
const RUBBER = "#141414";
const LENS = "#1d3550";
const PAPER = "#efe2bf";
const RIBBON = "#8b1e1e";

export default function build() {
  const b = createBuilder({ name: "explorer_telescope" });
  b.joint("mount", { at: [0, 1, 0] });

  // Tube axis: tilted 35 degrees up toward +Z. Pivot sits on the axle at y = 1.15.
  // V(s, h): point s metres along the tube from the pivot, h metres up across it.
  const V = (s: number, h = 0): P3 => [
    0,
    1.15 + 0.5736 * s + 0.8192 * h,
    0.8192 * s - 0.5736 * h,
  ];

  // Cylinder between two points, tapering from r0 at p to r1 at q.
  const seg3 = (p: P3, q: P3, r0: number, r1: number, color: string) => {
    const m: P3 = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2];
    const L = Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]);
    b.part(new THREE.CylinderGeometry(r1, r0, L, 12), color, { at: m, aim: q });
  };

  // Cylinder along the tube between tube positions s0 and s1.
  const seg = (s0: number, s1: number, r0: number, r1: number, color: string) =>
    b.part(new THREE.CylinderGeometry(r1, r0, s1 - s0, 14), color, {
      at: V((s0 + s1) / 2),
      aim: V(s1),
    });

  // Turned profile growing from tube position s toward sign (+1 forward, -1 back).
  const lat = (s: number, sign: number, prof: [number, number][], color: string) =>
    b.part(
      new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 14),
      color,
      { at: V(s), aim: V(s + sign) },
    );

  // Thin ring around the tube at position s.
  const ring = (s: number, R: number, t: number, color: string) =>
    b.part(new THREE.TorusGeometry(R, t, 6, 18).rotateX(Math.PI / 2), color, {
      at: V(s),
      aim: V(s + 1),
    });

  // ---- Main brass tube ----
  seg(-0.3, 0.55, 0.05, 0.05, BRASS);

  // Leather wraps
  seg(-0.2, -0.14, 0.054, 0.054, LEATHER);
  seg(0.0, 0.06, 0.054, 0.054, LEATHER);
  seg(0.2, 0.26, 0.054, 0.054, LEATHER);

  // Engraved rings
  ring(0.36, 0.0545, 0.0035, BRASS_DARK);
  ring(0.4, 0.0545, 0.0035, BRASS_DARK);
  ring(0.44, 0.0545, 0.0035, BRASS_DARK);

  // Focus collar and knob near the eyepiece end
  ring(-0.27, 0.06, 0.012, BRASS_DARK);
  b.part(new THREE.SphereGeometry(0.02, 10, 8), BRASS_DARK, { at: V(-0.27, 0.07) });

  // Objective bell flare and lens cap
  lat(
    0.52,
    1,
    [
      [0.05, 0],
      [0.062, 0.03],
      [0.07, 0.07],
      [0.072, 0.08],
    ],
    BRASS,
  );
  seg3(V(0.59), V(0.6), 0.06, 0.06, LENS);

  // ---- Eyepiece ----
  seg(-0.3, -0.4, 0.032, 0.032, BRASS_WARM);
  lat(
    -0.4,
    -1,
    [
      [0.034, 0],
      [0.042, 0.02],
      [0.042, 0.035],
      [0.03, 0.05],
      [0.02, 0.05],
    ],
    RUBBER,
  );

  // ---- Finder scope on top of the tube ----
  seg3(V(-0.2, 0.11), V(0.25, 0.11), 0.028, 0.028, BRASS_WARM);
  seg3(V(0.25, 0.11), V(0.26, 0.11), 0.026, 0.026, LENS);
  seg3(V(-0.2, 0.11), V(-0.27, 0.11), 0.02, 0.024, RUBBER);
  seg3(V(-0.1, 0.04), V(-0.1, 0.11), 0.011, 0.011, BRASS);
  seg3(V(0.2, 0.04), V(0.2, 0.11), 0.011, 0.011, BRASS);

  // ---- Yoke and head ----
  const H: P3 = [0, 0.93, 0];
  b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.05, 16), MAHOGANY, { at: H });
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 16), BRASS, { at: [0, 0.975, 0] });
  b.part(new THREE.BoxGeometry(0.22, 0.025, 0.08), BRASS, { at: [0, 1.0, 0] });
  b.part(new THREE.BoxGeometry(0.02, 0.15, 0.1), BRASS, { at: [-0.1, 1.08, 0] });
  b.part(new THREE.BoxGeometry(0.02, 0.15, 0.1), BRASS, { at: [0.1, 1.08, 0] });
  seg3([-0.12, 1.15, 0], [0.12, 1.15, 0], 0.02, 0.02, BRASS);
  b.part(new THREE.SphereGeometry(0.025, 10, 8), BRASS, { at: [-0.13, 1.15, 0] });
  b.part(new THREE.SphereGeometry(0.025, 10, 8), BRASS, { at: [0.13, 1.15, 0] });

  // ---- Tripod legs, collars and feet ----
  const feet: P3[] = [
    [0, 0, 0.55],
    [0.476, 0, -0.275],
    [-0.476, 0, -0.275],
  ];
  const along = (p: P3, q: P3, t: number): P3 => [
    p[0] + (q[0] - p[0]) * t,
    p[1] + (q[1] - p[1]) * t,
    p[2] + (q[2] - p[2]) * t,
  ];

  for (const F of feet) {
    seg3(H, F, 0.032, 0.02, MAHOGANY);
    seg3(along(H, F, 0.45), along(H, F, 0.48), 0.036, 0.036, BRASS);
    b.part(new THREE.CylinderGeometry(0.024, 0.026, 0.04, 10), RUBBER, {
      at: [F[0], 0.02, F[2]],
    });
  }

  // ---- Little tray with a rolled star chart, on the floor ----
  const cx = 0.42;
  const cz = 0.22;
  b.part(new THREE.BoxGeometry(0.32, 0.03, 0.24), MAHOGANY, { at: [cx, 0.015, cz] });
  b.part(new THREE.BoxGeometry(0.34, 0.02, 0.015), BRASS, { at: [cx, 0.04, cz - 0.12] });
  b.part(new THREE.BoxGeometry(0.34, 0.02, 0.015), BRASS, { at: [cx, 0.04, cz + 0.12] });
  b.part(new THREE.BoxGeometry(0.015, 0.02, 0.25), BRASS, { at: [cx - 0.16, 0.04, cz] });
  b.part(new THREE.BoxGeometry(0.015, 0.02, 0.25), BRASS, { at: [cx + 0.16, 0.04, cz] });

  const chartY = 0.056;
  b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.26, 12), PAPER, {
    at: [cx, chartY, cz],
    aim: [cx + 1, chartY, cz],
  });
  b.part(new THREE.BoxGeometry(0.012, 0.054, 0.054), RIBBON, {
    at: [cx + 0.04, chartY, cz],
  });
  seg3([cx - 0.13, chartY, cz], [cx - 0.12, chartY, cz], 0.03, 0.03, BRASS);
  seg3([cx + 0.12, chartY, cz], [cx + 0.13, chartY, cz], 0.03, 0.03, BRASS);

  return b.root;
}
```