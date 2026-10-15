import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { paint, mottle, mix, noise } from "../../../../src/paint";
import type { Rgb } from "../../../../src/paint";

export const meta = {
  name: "African Bush Elephant",
  description: "Adult African bush elephant, low-poly: faceted wrinkled grey hide, big fanned ears, curved ivory tusks, ringed trunk.",
  style: "low-poly",
  commit: "88fc1f0",
};

const GREY = "#8a8782";
const GREY_D = "#6f6c69";
const DUST = "#a58b6a";
const IVORY = "#ece2c8";
const NAIL = "#b9b0a0";
const EAR_IN = "#b58d86";
const EYE = "#3b2a1c";
const DARK = "#34302d";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "africanElephant" });

  // Hide: cloudy grey, wrinkle lines, dusty lower legs, lighter belly.
  const cloud = mottle(GREY, GREY_D, { size: 0.4, contrast: 0.8, seed: 3 });
  const hide = paint((p, n, s) => {
    const c = cloud.at(p, n, s) as Rgb;
    let out: Rgb = c;
    const w = Math.abs(Math.sin(p.z * 13 + noise(p, 0.6, 5) * 7));
    if (w > 0.9) out = mix(out, GREY_D, 0.6);
    if (n.y < -0.3) out = mix(out, "#9a9590", 0.4);
    const dust = Math.max(0, 1 - p.y / 0.9);
    return mix(out, DUST, dust * 0.7);
  });

  // Body
  const prof = (t: number) => 0.72 + 0.28 * Math.sin(Math.min(1, t * 1.3 + 0.1) * Math.PI * 0.95) ** 0.5;
  b.sweep(
    catmull([[0, 2.3, -1.7], [0, 2.3, -0.5], [0, 2.35, 0.6], [0, 2.4, 1.25]]),
    (t: number) => [0.82 * prof(t), 0.92 * prof(t)] as [number, number],
    { color: hide, sides: 8 },
  );
  // Shoulder and haunch masses
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.48, 7, 5), hide, { at: [s * 0.55, 2.0, 0.85], scale: [0.8, 1.2, 1.1] });
    b.part(new THREE.SphereGeometry(0.5, 7, 5), hide, { at: [s * 0.55, 2.05, -1.05], scale: [0.85, 1.2, 1.1] });
  }
  // Spine ridge
  b.part(new THREE.SphereGeometry(0.5, 7, 4), hide, { at: [0, 3.0, 0.4], scale: [0.8, 0.35, 2.4] });

  // Legs
  for (const [z, zt] of [[0.85, 0.9], [-1.0, -1.0]]) {
    for (const s of [1, -1]) {
      b.rod([s * 0.55, 2.0, z], [s * 0.55, 0, zt], [0.36, 0.3], { color: hide, sides: 8, caps: "flat" });
      b.rod([s * 0.55, 0.3, zt], [s * 0.55, 0.18, zt], [0.34, 0.34], { color: GREY_D, sides: 8, caps: "flat" });
      for (let i = 0; i < 4; i++) {
        const dx = (i - 1.5) * 0.14;
        b.part(new THREE.SphereGeometry(0.06, 5, 4), NAIL, { at: [s * 0.55 + dx, 0.07, zt + 0.27 - Math.abs(i - 1.5) * 0.03], scale: [1, 0.8, 1.2] });
      }
    }
  }

  // Head
  const hc: [number, number, number] = [0, 2.55, 1.75];
  const head = b.part(new THREE.SphereGeometry(0.52, 8, 6), hide, { at: hc, scale: [0.95, 1.1, 1.05] });
  b.part(new THREE.SphereGeometry(0.3, 6, 5), hide, { at: [0.24, 2.95, 1.65], scale: [1, 0.9, 1] });
  b.part(new THREE.SphereGeometry(0.3, 6, 5), hide, { at: [-0.24, 2.95, 1.65], scale: [1, 0.9, 1] });
  b.part(new THREE.SphereGeometry(0.28, 6, 5), hide, { at: [0, 2.15, 1.95], scale: [0.9, 0.8, 1] });
  void head;

  // Eyes with brows
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.05, 6, 4), EYE, { at: [s * 0.45, 2.66, 2.0] });
    b.part(new THREE.SphereGeometry(0.02, 4, 3), "#e0c58a", { at: [s * 0.485, 2.68, 2.02] });
    b.part(new THREE.SphereGeometry(0.09, 5, 4), GREY_D, { at: [s * 0.43, 2.76, 1.97], scale: [1, 0.5, 1.2] });
  }

  // Ears
  const earOutline: Array<[number, number]> = [
    [0, 0.4], [0.15, 0.58], [0.55, 0.52], [0.9, 0.1], [1.0, -0.4], [0.75, -0.85], [0.4, -0.78], [0.08, -0.3],
  ];
  const earPaint = paint((p, n, s) => {
    const base = cloud.at(p, n, s) as Rgb;
    const rim = Math.max(0, 1 - Math.hypot(s[0] - 0.5, s[1] + 0.1) / 0.9);
    return mix(mix(base, EAR_IN, 0.5 * rim), GREY_D, 0.1);
  });
  for (const s of [1, -1]) {
    b.extrude(earOutline, {
      at: [s * 0.55, 2.8, 1.5],
      x: [0, 0, -1],
      y: [s * 0.3, 1, 0],
      thickness: [0.06, 0.03],
      bevel: 0.01,
      color: earPaint,
    });
  }

  // Trunk with wrinkle rings
  const trunkPath = catmull([[0, 2.35, 1.95], [0, 1.9, 2.55], [0, 1.1, 2.95], [0, 0.5, 3.0], [0, 0.25, 3.35], [0, 0.45, 3.65]]);
  const L = trunkPath.length;
  const trunkPaint = paint((p, n, s) => {
    const base = cloud.at(p, n, s) as Rgb;
    const ring = Math.sin(s[0] * L * 38);
    return ring > 0.55 ? mix(base, GREY_D, 0.7) : mix(base, "#9b9791", s[1] > 140 ? 0.35 : 0);
  });
  b.sweep(trunkPath, [0.27, 0.08], { color: trunkPaint, sides: 8, caps: "round" });
  b.part(new THREE.SphereGeometry(0.05, 5, 4), DARK, { at: [0.035, 0.5, 3.72], scale: [1, 0.7, 1] });
  b.part(new THREE.SphereGeometry(0.05, 5, 4), DARK, { at: [-0.035, 0.5, 3.72], scale: [1, 0.7, 1] });

  // Tusks
  for (const s of [1, -1]) {
    b.sweep(
      catmull([[s * 0.3, 2.15, 1.95], [s * 0.42, 1.7, 2.35], [s * 0.46, 1.4, 2.9], [s * 0.4, 1.55, 3.45]]),
      [0.085, 0.015],
      { color: IVORY, sides: 6, caps: "point" },
    );
    b.rod([s * 0.31, 2.1, 1.97], [s * 0.35, 1.95, 2.1], [0.11, 0.1], { color: GREY_D, sides: 6, caps: "flat" });
  }

  // Tail
  b.sweep(catmull([[0, 2.35, -1.7], [0, 1.9, -2.1], [0, 1.2, -2.15]]), [0.07, 0.035], { color: hide, sides: 6, caps: "round" });
  b.spike([0, 1.25, -2.15], [0, -1, -0.05], 0.35, 0.09, { color: DARK, sides: 6, caps: "point" });

  return b.root;
}
