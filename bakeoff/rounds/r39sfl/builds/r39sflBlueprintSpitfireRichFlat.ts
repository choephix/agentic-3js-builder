import * as THREE from "three";
import { createBuilder, catmull, polyline } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Spitfire Blueprint",
  description: "Supermarine Spitfire in cyanotype blueprint style: deep blue body with white linework, ribs and annotations.",
};

const BLUE = "#12408a";
const BLUE_D = "#0b2a63";
const BLUE_L = "#2a64b8";
const LINE = "#e8f2ff";
const LINE_D = "#9cc4f0";

export default function build() {
  const b = createBuilder({ name: "spitfire" });
  const body = b.joint("fuselage", { at: [0, 1.2, 0] });
  const prop = b.joint("prop", { parent: body, at: [0, 1.2, 2.55], dir: [0, 0, 1], role: "hinge" });

  // fuselage loft
  const st = [
    { at: [0, 1.2, 2.3], w: 0.5, h: 0.55 },
    { at: [0, 1.22, 1.5], w: 0.7, h: 0.75 },
    { at: [0, 1.25, 0.5], w: 0.72, h: 0.8 },
    { at: [0, 1.25, -0.5], w: 0.55, h: 0.65 },
    { at: [0, 1.3, -1.6], w: 0.3, h: 0.4 },
    { at: [0, 1.35, -2.6], w: 0.12, h: 0.2 },
  ];
  b.loft(st as any, { color: BLUE, bone: body });
  // belly lighter strip
  b.part(new THREE.BoxGeometry(0.5, 0.05, 2.2), BLUE_D, { bone: body, at: [0, 0.85, 0.3] });

  // spine line and panel lines
  b.sweep(polyline([[0, 1.62, 2.0], [0, 1.66, 0.5], [0, 1.58, -1.4], [0, 1.5, -2.5]]), 0.012, { color: LINE, bone: body });
  for (const z of [1.8, 1.0, 0.0, -0.8, -1.6]) {
    const r = 0.36 - Math.max(0, 0.08 * (1 - z)) - Math.max(0, -z) * 0.07;
    b.part(new THREE.TorusGeometry(Math.max(r, 0.1), 0.008, 4, 14), LINE_D, { bone: body, at: [0, 1.25, z], scale: [1, 1.1, 1] });
  }

  // nose cowling & spinner
  b.part(new THREE.CylinderGeometry(0.27, 0.34, 0.3, 12), BLUE_L, { bone: body, at: [0, 1.2, 2.35], dir: [0, 0, 1] });
  b.part(new THREE.ConeGeometry(0.17, 0.4, 10), LINE, { bone: prop, at: [0, 1.2, 2.75], dir: [0, 0, 1] });
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3 + 0.3;
    b.part(new THREE.BoxGeometry(0.12, 0.95, 0.02), LINE_D, {
      bone: prop,
      at: [Math.sin(a) * 0.5, 1.2 + Math.cos(a) * 0.5, 2.6],
      rotation: [0, 0, -a * 57.3],
    });
  }
  // exhaust stubs
  for (const s of [1, -1]) for (let i = 0; i < 6; i++)
    b.part(new THREE.CylinderGeometry(0.025, 0.03, 0.12, 6), LINE, { bone: body, at: [s * 0.36, 1.38, 1.3 - i * 0.1 + 0.4], dir: [s, 0.3, 0] });

  // canopy
  b.part(new THREE.SphereGeometry(0.34, 10, 8), LINE_D, { bone: body, at: [0, 1.66, 0.15], scale: [0.85, 0.8, 2.0] });
  b.part(new THREE.BoxGeometry(0.02, 0.4, 1.3), LINE, { bone: body, at: [0, 1.72, 0.15] });
  b.part(new THREE.BoxGeometry(0.45, 0.02, 0.02), LINE, { bone: body, at: [0, 1.7, 0.15] });

  // wings (elliptical)
  const wing = (s: number) => {
    const o = [[0, -0.2], [0.6, -0.15], [2.5, 0.0], [4.2, -0.45], [5.1, -0.9], [5.2, -1.1], [4.4, -0.85], [2.5, -1.05], [0, -1.55], [0, 0.9], [0.6, 0.95], [2.5, 0.6], [4.2, 0.0]];
    const shape: [number, number][] = [[0, 0.95], [1.5, 0.75], [3.5, 0.2], [5.0, -0.5], [5.2, -0.9], [4.4, -0.75], [2.5, -0.55], [0, -0.45]];
    b.extrude(shape, { at: [s * 0.3, 1.1, 0.2], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.07, bevel: 0.01, color: BLUE_L, bone: body });
    // ribs
    for (let i = 1; i <= 7; i++) {
      const x = 0.3 + i * 0.65;
      const zf = 0.95 - i * 0.2, zb = -0.45 - i * 0.07;
      b.part(new THREE.BoxGeometry(0.018, 0.02, zf - zb), LINE, { bone: body, at: [s * x, 1.15, 0.2 + (zf + zb) / 2 - 0.1] });
    }
    // spar
    b.rod([s * 0.4, 1.15, 0.5], [s * 5.0, 1.15, -0.3], 0.015, LINE, { bone: body });
    // roundel
    b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.01, 14), LINE_D, { bone: body, at: [s * 3.0, 1.15, 0.0] });
    b.part(new THREE.CylinderGeometry(0.16, 0.16, 0.015, 14), BLUE_D, { bone: body, at: [s * 3.0, 1.15, 0.0] });
    // gun barrels
    for (const gx of [1.5, 1.9]) b.rod([s * gx, 1.12, 0.7], [s * gx, 1.12, 1.15], 0.02, LINE, { bone: body });
    // landing gear
    b.rod([s * 1.3, 1.1, 0.4], [s * 1.45, 0.3, 0.55], 0.04, LINE_D, { bone: body });
    b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.14, 14), BLUE_D, { bone: body, at: [s * 1.45, 0.3, 0.55], dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.16, 8), LINE, { bone: body, at: [s * 1.45, 0.3, 0.55], dir: [1, 0, 0] });
    // tailplane
    b.extrude([[0, 0.5], [0.9, 0.2], [1.25, -0.1], [0.9, -0.3], [0, -0.35]], { at: [s * 0.1, 1.35, -2.1], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.04, color: BLUE_L, bone: body });
  };
  wing(1); wing(-1);

  // fin and rudder
  b.extrude([[0, 0], [0.9, 0], [0.55, 0.9], [0.2, 1.05], [-0.15, 0.5]], { at: [0, 1.38, -2.7], x: [0, 0, 1], thickness: 0.05, color: BLUE_L, bone: body });
  b.rod([0, 1.4, -2.35], [0, 2.3, -2.65], 0.012, LINE, { bone: body });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.07, 8), LINE, { bone: body, at: [0, 1.0, -2.55], dir: [1, 0, 0] });

  // blueprint grid base lines (dimension lines)
  b.rod([-5.3, 0.02, -3.0], [5.3, 0.02, -3.0], 0.01, LINE_D, { bone: body });
  b.rod([-5.3, 0.0, -3.1], [-5.3, 0.1, -2.9], 0.012, LINE, { bone: body });
  b.rod([5.3, 0.0, -3.1], [5.3, 0.1, -2.9], 0.012, LINE, { bone: body });
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), LINE, { bone: body, at: [0, 1.0, 2.0] }), 1);

  return b.root;
}
