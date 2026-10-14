import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

type V = [number, number, number];

const add = (a: V, c: V): V => [a[0] + c[0], a[1] + c[1], a[2] + c[2]];
const sc = (a: V, s: number): V => [a[0] * s, a[1] * s, a[2] * s];
const len = (a: V): number => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V): V => sc(a, 1 / len(a));

export const meta = {
  name: "telescope",
  description:
    "A stylised refractor telescope on a three-leg wooden tripod and an alt-az fork mount, about 1.4 m tall.",
};

export default function build() {
  const b = createBuilder({ name: "telescope" });
  const base = b.joint("base", { at: [0, 0, 0] });

  // Colours
  const WHITE = "#f4f1ea";
  const NAVY = "#1f3a5f";
  const DARK = "#2f3640";
  const WOOD = "#9a6b3f";
  const BRASS = "#c9a24a";
  const GLASS = "#5aa0d6";

  // Cylinder from a to c, radius rA at a and rB at c. Its +Y axis runs a -> c.
  const cyl = (a: V, c: V, rA: number, rB: number, color: string, seg = 16) => {
    const d = add(c, sc(a, -1));
    const l = len(d);
    const dir = norm(d);
    const mid = sc(add(a, c), 0.5);
    b.part(new THREE.CylinderGeometry(rB, rA, l, seg), color, { at: mid, dir });
  };

  const sphere = (p: V, r: number, color: string, seg = 12) => {
    b.part(new THREE.SphereGeometry(r, seg, Math.max(6, seg - 4)), color, { at: p });
  };

  const box = (p: V, size: V, color: string) => {
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at: p });
  };

  // ---- Tripod ----
  const hub: V = [0, 0.92, 0];
  const legR = 0.45;
  for (const deg of [0, 120, 240]) {
    const a = (deg * Math.PI) / 180;
    const foot: V = [legR * Math.sin(a), 0, legR * Math.cos(a)];
    cyl([0, 0.9, 0], foot, 0.026, 0.018, WOOD);
    // rubber shoe, centre raised so it sits on the floor
    sphere([foot[0], 0.018, foot[2]], 0.024, DARK, 10);
    // leg-to-hub brace knob
    sphere([sc(foot, 0.5)[0], 0.5, sc(foot, 0.5)[2]], 0.02, BRASS, 8);
  }
  cyl([0, 0.86, 0], [0, 0.94, 0], 0.13, 0.13, DARK, 20); // hub plate
  sphere(hub, 0.05, BRASS, 12); // hub cap

  // ---- Alt-az mount ----
  cyl([0, 0.94, 0], [0, 1.0, 0], 0.04, 0.04, DARK, 12); // pillar
  box([0, 1.02, 0], [0.26, 0.07, 0.18], DARK); // head
  box([0.15, 1.0, 0], [0.05, 0.06, 0.06], BRASS); // drive knob
  box([-0.15, 1.0, 0], [0.05, 0.06, 0.06], BRASS);
  box([-0.12, 1.135, 0], [0.04, 0.27, 0.1], DARK); // fork arm L
  box([0.12, 1.135, 0], [0.04, 0.27, 0.1], DARK); // fork arm R
  cyl([-0.16, 1.25, 0], [-0.12, 1.25, 0], 0.035, 0.035, BRASS, 14); // axle L
  cyl([0.12, 1.25, 0], [0.16, 1.25, 0], 0.035, 0.035, BRASS, 14); // axle R

  // ---- Optical tube ----
  const tilt = (25 * Math.PI) / 180;
  const dir: V = [0, Math.sin(tilt), Math.cos(tilt)];
  const up: V = [0, Math.cos(tilt), -Math.sin(tilt)];
  const C: V = [0, 1.25, 0];
  const at = (t: number): V => add(C, sc(dir, t));
  const above = (t: number, h: number): V => add(at(t), sc(up, h));

  // main tube
  cyl(at(-0.38), at(0.38), 0.085, 0.085, WHITE, 20);
  // rear collar and eyepiece
  cyl(at(-0.46), at(-0.38), 0.095, 0.095, DARK, 20);
  cyl(at(-0.46), at(-0.6), 0.035, 0.03, BRASS, 14);
  sphere(at(-0.6), 0.03, DARK, 10);
  // focuser knob on the rear
  cyl(above(-0.3, 0.085), above(-0.3, 0.14), 0.03, 0.03, BRASS, 12);
  // brass rings on the tube
  cyl(at(-0.12), at(-0.1), 0.09, 0.09, BRASS, 20);
  cyl(at(-0.02), at(0.0), 0.09, 0.09, BRASS, 20);
  // dew shield and objective
  cyl(at(0.2), at(0.5), 0.1, 0.1, NAVY, 20);
  cyl(at(0.5), at(0.508), 0.095, 0.095, GLASS, 20);

  // ---- Finder scope on two brackets ----
  const finderC = above(0, 0.13);
  cyl(above(-0.12, 0.08), above(-0.12, 0.13), 0.012, 0.012, BRASS, 8);
  cyl(above(0.12, 0.08), above(0.12, 0.13), 0.012, 0.012, BRASS, 8);
  cyl(add(finderC, sc(dir, -0.22)), add(finderC, sc(dir, 0.22)), 0.03, 0.03, DARK, 14);
  cyl(add(finderC, sc(dir, 0.22)), add(finderC, sc(dir, 0.24)), 0.034, 0.034, BRASS, 14);

  return b.root;
}
