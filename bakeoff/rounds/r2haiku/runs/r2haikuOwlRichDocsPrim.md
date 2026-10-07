```ts
import * as THREE from "three";
import { createBuilder, catmull, countershade, limb, mottle, stripes } from "agentic-3js-builder";

const BROWN = "#6b4a2e";
const DARK = "#3a2a1c";
const BUFF = "#c9a46c";
const BUFF_LIGHT = "#e6d3a8";
const PALE = "#ece2c8";
const TAWNY = "#c98a48";
const BLACK = "#15110e";
const ORANGE = "#f08a1c";
const BEAK = "#8d949b";
const BARK = "#5b4431";
const BARK_DARK = "#3a2b1e";
const LEG = "#a9824f";

const ball = (u = 12, v = 9) => new THREE.SphereGeometry(1, u, v);

export const meta = {
  name: "great-horned-owl",
  description: "A great horned owl perched on a gnarled branch, bark-brown and buff barred plumage, ear tufts, tawny facial disc and orange eyes.",
};

export default function build() {
  const b = createBuilder({ name: "great-horned-owl" });

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.27, 0], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.3, 0], aim: [0, 0.4, 0] });
  const neck = b.joint("neck", { parent: chest, at: [0, 0.4, 0], aim: [0, 0.46, 0.02], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.46, 0.02], aim: [0, 0.52, 0.03], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.43, 0.1], role: "jaw" });

  // Gnarled perch: a tapered branch, two bark stumps and a twig
  const branch = catmull([
    [-0.7, 0.055, 0],
    [-0.35, 0.055, 0.02],
    [0, 0.055, 0],
    [0.35, 0.055, -0.02],
    [0.7, 0.055, 0],
  ]);
  b.sweep(branch, (t: number) => 0.05 + 0.006 * Math.sin(t * Math.PI), {
    bone: hips,
    color: mottle(BARK, BARK_DARK, { size: 0.06 }),
  });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.075, 0.095, 0.1, 7), BARK_DARK, {
      bone: hips,
      at: [s * 0.7, 0.05, 0],
    });
  }
  b.part(new THREE.SphereGeometry(0.022, 6, 4), BARK_DARK, { bone: hips, at: [0.22, 0.095, 0.02] });
  b.part(new THREE.SphereGeometry(0.018, 6, 4), BARK_DARK, { bone: hips, at: [-0.4, 0.095, -0.02] });
  b.sweep(
    catmull([
      [0.3, 0.07, 0],
      [0.36, 0.14, 0.04],
      [0.4, 0.2, 0.1],
    ]),
    [0.012, 0.003],
    { bone: hips, color: BARK },
  );

  // Body, belly, bib and tail
  b.part(ball(), countershade(mottle(BROWN, BUFF, { size: 0.05 }), BUFF, { level: -0.1 }), {
    bone: chest,
    at: [0, 0.31, 0],
    scale: [0.12, 0.15, 0.11],
  });
  b.part(ball(), stripes(BUFF_LIGHT, BUFF, { size: 0.025, axis: "y" }), {
    bone: chest,
    at: [0, 0.29, 0.08],
    scale: [0.085, 0.11, 0.035],
  });
  b.part(ball(), PALE, { bone: chest, at: [0, 0.385, 0.075], scale: [0.065, 0.035, 0.04] });
  b.part(ball(), stripes(BROWN, DARK, { size: 0.03, axis: "x" }), {
    bone: hips,
    at: [0, 0.2, -0.1],
    scale: [0.07, 0.09, 0.02],
  });

  // Wings folded along the flanks, with barring and primary tips
  for (const s of [1, -1]) {
    b.part(ball(), stripes(BROWN, DARK, { size: 0.03, axis: "y" }), {
      bone: chest,
      at: [s * 0.11, 0.3, -0.005],
      scale: [0.03, 0.16, 0.085],
    });
    b.part(ball(8, 6), stripes(DARK, BROWN, { size: 0.02, axis: "y" }), {
      bone: chest,
      at: [s * 0.11, 0.165, -0.03],
      scale: [0.028, 0.06, 0.07],
    });
  }

  // Head: mottled skull, tawny facial disc with black rim
  b.part(ball(), mottle(BROWN, BUFF, { size: 0.05 }), {
    bone: head,
    at: [0, 0.46, 0.02],
    scale: [0.1, 0.095, 0.095],
  });
  b.part(ball(), TAWNY, { bone: head, at: [0, 0.455, 0.1], scale: [0.088, 0.084, 0.03] });
  b.part(new THREE.TorusGeometry(0.086, 0.011, 5, 16), BLACK, { bone: head, at: [0, 0.455, 0.112] });

  // Ear tufts
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.024, 0.14, 6), DARK, {
      bone: head,
      at: [s * 0.058, 0.575, -0.005],
      dir: [s * 0.18, 1, -0.05],
    });
  }

  // Huge orange eyes with black lids and pupils
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.038, 10, 8), ORANGE, { bone: head, at: [s * 0.036, 0.475, 0.112] });
    b.part(new THREE.TorusGeometry(0.04, 0.008, 5, 12), BLACK, { bone: head, at: [s * 0.036, 0.475, 0.128] });
    b.part(new THREE.SphereGeometry(0.02, 8, 6), BLACK, { bone: head, at: [s * 0.036, 0.475, 0.148] });
  }

  // Hooked grey beak: upper hook on the head, lower mandible on the jaw
  b.part(new THREE.ConeGeometry(0.018, 0.05, 6), BEAK, {
    bone: head,
    at: [0, 0.44, 0.125],
    dir: [0, -0.6, 1],
  });
  b.part(new THREE.SphereGeometry(0.011, 6, 4), BEAK, { bone: head, at: [0, 0.42, 0.148] });
  b.part(new THREE.ConeGeometry(0.014, 0.035, 6), BEAK, {
    bone: jaw,
    at: [0, 0.425, 0.12],
    dir: [0, 0.2, 1],
  });

  // Feathered legs ending in black talons gripping the branch
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const hip = [s * 0.06, 0.27, 0];
    const ankle = [s * 0.06, 0.125, 0.025];
    const pts = limb(hip, ankle, [0.09, 0.08], [[0, 0, 1]]);
    const leg = b.chain(`leg${L}`, pts, {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `ankle${L}`],
      role: "leg",
    });
    b.sweep(leg, [0.04, 0.022], { color: LEG });

    const ank = leg.tip ?? leg.joints[leg.joints.length - 1];
    const toes: [number, number, number][] = [
      [s * 0.04, -0.025, 0.05],
      [0, -0.025, 0.065],
      [-s * 0.04, -0.025, 0.05],
      [0, -0.025, -0.04],
    ];
    for (const d of toes) {
      const tip: [number, number, number] = [ankle[0] + d[0], ankle[1] + d[1], ankle[2] + d[2]];
      b.rod(ankle, tip, 0.009, { color: BLACK, bone: ank });
      const n = Math.hypot(d[0], d[1] - 0.05, d[2]);
      b.spike(tip, [d[0] / n, (d[1] - 0.05) / n, d[2] / n], 0.02, 0.006, { color: BLACK, bone: ank });
    }
  }

  return b.root;
}
```