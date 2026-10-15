import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { grain, mottle, paint, stripes } from "../../../../src/paint";

export const meta = {
  name: "African Bush Elephant",
  description: "Adult African bush elephant in faceted low-poly: big fanned ears, wrinkled trunk, curved ivory tusks, dusty legs.",
  style: "low-poly",
  commit: "88fc1f0",
};

const HIDE = "#8a8279";
const HIDE_DARK = "#665f58";
const DUST = "#a8957a";
const DUST_DARK = "#8c7a62";
const IVORY = "#efe4c4";
const NAIL = "#b9ad98";
const EAR = "#9a7f78";
const EAR_IN = "#c49a92";
const EYE = "#17120e";
const HAIR = "#2e2723";

export default function build() {
  const b = createBuilder({ name: "africanElephant" });

  // paints
  const coat = mottle(HIDE, "#7a726a", { size: 0.5, contrast: 0.8, seed: 3 });
  const folds = stripes(coat, HIDE_DARK, { size: 0.3, axis: "z", width: 0.14, wobble: 0.5, seed: 5 });
  const dust = mottle(DUST, DUST_DARK, { size: 0.3, seed: 8 });
  const bodyPaint = paint((p) => (p.y < 0.9 ? dust : p.y < 1.6 ? mottle(DUST_DARK, HIDE, { size: 0.4, seed: 9 }) : folds));
  const legPaint = paint((p) => (p.y < 0.8 ? dust : grain(HIDE, HIDE_DARK, { size: 0.07, axis: "y", seed: 4 })));

  // barrel body
  const bodyPath = [
    [0, 2.3, -1.55],
    [0, 2.38, -0.2],
    [0, 2.32, 1.15],
  ];
  b.sweep(bodyPath, (t): [number, number] => [0.72 + 0.2 * Math.sin(Math.PI * t), 0.82 + 0.17 * Math.sin(Math.PI * t)], bodyPaint, {
    sides: 8,
    smooth: false,
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), bodyPaint, { at: [s * 0.62, 2.3, 0.7], scale: [0.45, 0.7, 0.7] });
    b.part(new THREE.SphereGeometry(1, 8, 6), bodyPaint, { at: [s * 0.62, 2.35, -1.0], scale: [0.4, 0.75, 0.75] });
  }
  // backbone ridge
  b.rod([0, 3.2, -1.1], [0, 3.22, 0.7], [0.12, 0.1], HIDE_DARK, { sides: 6 });

  // legs
  const legs: Array<[number, number, number]> = [];
  for (const s of [1, -1]) {
    legs.push([s * 0.58, 0.62, 4]);
    legs.push([s * 0.55, -1.0, 4]);
  }
  for (const [x, z] of legs.map((l) => [l[0], l[1]])) {
    b.rod([x, 1.9, z], [x, 0.35, z], [0.44, 0.33], legPaint, { sides: 8, smooth: false });
    b.rod([x, 0.38, z], [x, 0, z], 0.37, legPaint, { sides: 8, smooth: false, caps: "flat" });
    for (const y of [1.0, 0.62]) {
      b.part(new THREE.TorusGeometry(0.38, 0.025, 4, 8), HIDE_DARK, { at: [x, y, z], rotation: [90, 0, 0], scale: [1, 1, 1] });
    }
    for (const k of [-1, 0, 1]) {
      b.part(new THREE.BoxGeometry(0.11, 0.1, 0.09), NAIL, { at: [x + k * 0.14, 0.06, z + 0.34 - Math.abs(k) * 0.03] });
    }
  }

  // head
  b.part(new THREE.SphereGeometry(1, 8, 6), coat, { at: [0, 2.7, 1.85], scale: [0.6, 0.75, 0.68] });
  b.part(new THREE.SphereGeometry(1, 8, 6), folds, { at: [0, 3.15, 1.75], scale: [0.5, 0.4, 0.42] });
  b.part(new THREE.SphereGeometry(1, 8, 6), coat, { at: [0, 2.1, 2.2], scale: [0.4, 0.4, 0.4] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 6, 4), HIDE_DARK, { at: [s * 0.5, 2.95, 2.1], scale: [0.14, 0.07, 0.14] });
    b.part(new THREE.SphereGeometry(1, 6, 4), EYE, { at: [s * 0.55, 2.85, 2.13], scale: [0.04, 0.05, 0.05] });
    b.part(new THREE.SphereGeometry(1, 6, 4), HIDE, { at: [s * 0.3, 2.35, 2.35], scale: [0.17, 0.2, 0.15] });
  }

  // trunk
  const trunkPath = catmull([
    [0, 2.45, 2.3],
    [0, 1.75, 2.75],
    [0, 1.0, 2.95],
    [0, 0.45, 3.2],
    [0, 0.22, 3.55],
  ]);
  const trunkLen = trunkPath.length;
  const rings = paint((_p, _n, s) => (Math.floor((s[0] * trunkLen) / 0.1) % 2 ? HIDE_DARK : coat));
  b.sweep(trunkPath, [0.3, 0.1], rings, { sides: 8, smooth: false, caps: "round" });
  for (const s of [1, -1]) {
    b.spike([s * 0.04, 0.2, 3.58], [0, 0.1, 1], 0.1, 0.045, HIDE_DARK, { sides: 5 });
  }

  // ears
  const earShape: OutlinePoint[] = [
    [0, 0.55],
    [0.45, 0.78],
    [0.95, 0.4],
    [1.12, -0.25],
    [0.8, -0.85],
    [0.35, -0.8],
    [0, -0.25],
  ];
  const earInner: OutlinePoint[] = earShape.map((p) => [p[0] * 0.75 + 0.08, p[1] * 0.75 - 0.03] as OutlinePoint);
  for (const s of [1, -1]) {
    const at: [number, number, number] = [s * 0.55, 3.0, 1.5];
    b.extrude(earShape, { at, x: [0, 0, -1], y: [s * 0.3, 1, 0], thickness: 0.07, bevel: 0.015, color: mottle(EAR, HIDE_DARK, { size: 0.3, seed: 12 }) });
    b.extrude(earInner, { at, x: [0, 0, -1], y: [s * 0.3, 1, 0], thickness: 0.085, color: EAR_IN });
  }

  // tusks
  for (const s of [1, -1]) {
    const tusk = catmull([
      [s * 0.3, 2.15, 2.2],
      [s * 0.42, 1.8, 2.75],
      [s * 0.46, 1.5, 3.3],
      [s * 0.42, 1.55, 3.8],
    ]);
    b.sweep(tusk, [0.11, 0.015], IVORY, { sides: 6, caps: "point" });
    b.rod([s * 0.3, 2.15, 2.2], [s * 0.34, 2.0, 2.4], 0.14, "#b9ad98", { sides: 6 });
  }

  // tail
  const tail = catmull([
    [0, 2.9, -2.0],
    [0, 2.2, -2.35],
    [0, 1.5, -2.35],
  ]);
  b.sweep(tail, [0.08, 0.045], HIDE_DARK, { sides: 6 });
  b.spike([0, 1.6, -2.35], [0, -1, 0], 0.4, 0.09, HAIR, { sides: 6 });

  return b.root;
}
