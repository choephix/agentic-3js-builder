import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { gradient, mix, mottle, paint, stripes } from "../../../../src/paint";

export const meta = {
  name: "African Bush Elephant",
  description: "Low-poly adult African bush elephant with huge fan ears, curved ivory tusks and a ringed trunk.",
  style: "low-poly",
  commit: "88fc1f0",
};

const HIDE_A = "#8d8883";
const HIDE_B = "#6d6965";
const DUST = "#9a7556";
const DARK = "#4b4845";
const NAIL = "#d8cdb4";
const IVORY = "#efe6cc";
const EYE = "#2a1a12";
const PINK = "#b99590";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "africanElephant" });

  const base = mottle(HIDE_A, HIDE_B, { size: 0.45, contrast: 0.8, seed: 5 });
  const wrinkled = stripes(base, "#5f5b57", { size: 0.22, axis: "z", width: 0.18, wobble: 0.5, seed: 3 });
  const SKIN = gradient(wrinkled, DUST, [0, 1.1, 0], [0, 0.1, 0]);
  const LEG = gradient(
    stripes(base, "#5f5b57", { size: 0.2, axis: "y", width: 0.14, wobble: 0.5, seed: 8 }),
    DUST,
    [0, 1.2, 0],
    [0, 0.1, 0],
  );

  // Body
  const spine = catmull([
    [0, 2.35, -2.05],
    [0, 2.5, -0.9],
    [0, 2.65, 0.4],
    [0, 2.6, 1.35],
  ]);
  b.sweep(spine, (t) => [0.78 + 0.22 * Math.sin(Math.PI * Math.min(1, t * 1.1)), 0.85 + 0.25 * Math.sin(Math.PI * Math.min(1, t * 1.1))], {
    color: SKIN,
    sides: 10,
    caps: "round",
  });
  // Shoulder and haunch masses, back ridge
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { at: [s * 0.55, 2.2, 0.95], scale: [0.5, 0.95, 0.75] });
    b.part(new THREE.SphereGeometry(1, 8, 6), SKIN, { at: [s * 0.62, 2.15, -1.4], scale: [0.5, 0.95, 0.8] });
  }
  b.part(new THREE.SphereGeometry(1, 7, 5), SKIN, { at: [0, 3.2, 0.75], scale: [0.5, 0.3, 0.7] });
  b.part(new THREE.SphereGeometry(1, 7, 5), SKIN, { at: [0, 3.05, -0.9], scale: [0.45, 0.25, 0.9] });

  // Legs
  for (const s of [1, -1]) {
    for (const [z, nails, r0] of [
      [0.95, 4, 0.4],
      [-1.4, 3, 0.42],
    ] as const) {
      const x = s * 0.62;
      b.rod([x, 2.3, z], [x, 0.18, z], [r0, 0.3], LEG, { section: { ngon: 7 } });
      b.part(new THREE.SphereGeometry(1, 6, 4), LEG, { at: [x, 0.95, z + 0.06], scale: [0.36, 0.2, 0.34] });
      b.rod([x, 0.2, z], [x, 0, z], [0.36, 0.38], DARK, { sides: 8 });
      for (let i = 0; i < nails; i++) {
        const f = (i - (nails - 1) / 2) * 0.17;
        b.part(new THREE.BoxGeometry(0.11, 0.1, 0.07), NAIL, {
          at: [x + f, 0.07, z + 0.36 - Math.abs(f) * 0.25],
        });
      }
    }
  }

  // Head
  const headPos: [number, number, number] = [0, 2.5, 1.95];
  b.part(new THREE.SphereGeometry(1, 9, 7), SKIN, { at: headPos, scale: [0.58, 0.68, 0.64] });
  b.part(new THREE.SphereGeometry(1, 7, 5), SKIN, { at: [0, 3.1, 1.75], scale: [0.4, 0.3, 0.42] }); // forehead dome
  b.part(new THREE.SphereGeometry(1, 7, 5), SKIN, { at: [0, 2.0, 2.2], scale: [0.34, 0.28, 0.3] }); // chin
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 6, 4), SKIN, { at: [s * 0.45, 2.15, 2.25], scale: [0.2, 0.25, 0.22] }); // cheek
    b.part(new THREE.SphereGeometry(1, 6, 4), EYE, { at: [s * 0.52, 2.65, 2.1], scale: [0.045, 0.05, 0.05] });
    b.part(new THREE.SphereGeometry(1, 6, 4), "#f1e8d8", { at: [s * 0.545, 2.67, 2.12], scale: [0.012, 0.016, 0.016] });
    b.part(new THREE.SphereGeometry(1, 6, 4), HIDE_B, { at: [s * 0.5, 2.73, 2.08], scale: [0.1, 0.045, 0.09] }); // brow
    // Ears
    const dir: [number, number, number] = [s * 0.9, 0, -0.45];
    const earShape = paint((_p, _n, c) => {
      const u = (c[0] - 0.5) / 0.38;
      const v = (c[1] + 0.2) / 0.6;
      if (u * u + v * v < 1) return mix(PINK, HIDE_A, Math.min(1, (u * u + v * v) * 0.8));
      return SKIN;
    });
    b.extrude(
      [
        [0, 0.45],
        [0.25, 0.58],
        [0.7, 0.38],
        [0.98, -0.1],
        [0.92, -0.6],
        [0.62, -0.98],
        [0.3, -0.85],
        [0.05, -0.4],
      ],
      { at: [s * 0.46, 2.95, 1.72], x: dir, thickness: 0.05, bevel: 0.015, smoothing: 1, color: earShape },
    );
  }

  // Trunk
  const trunkPath = catmull([
    [0, 2.4, 2.45],
    [0, 1.95, 2.7],
    [0, 1.3, 2.85],
    [0, 0.65, 2.8],
    [0, 0.2, 2.95],
    [0, 0.12, 3.25],
  ]);
  b.sweep(trunkPath, [0.3, 0.085], {
    color: paint((_p, _n, c) => (Math.floor(c[0] * 34) % 2 ? mix(HIDE_A, "#5f5b57", 0.55) : (SKIN as THREE.Color | typeof SKIN))),
    sides: 8,
    caps: "round",
  });
  for (const s of [1, -1]) {
    b.spike([s * 0.035, 0.1, 3.3], [0, 0, 1], 0.1, 0.03, NAIL, { sides: 5 });
  }
  b.part(new THREE.SphereGeometry(1, 6, 4), DARK, { at: [0, 0.1, 3.38], scale: [0.09, 0.05, 0.05] });

  // Tusks
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.3, 2.1, 2.2],
        [s * 0.46, 1.8, 2.55],
        [s * 0.5, 1.45, 3.05],
        [s * 0.42, 1.3, 3.55],
        [s * 0.34, 1.45, 3.85],
      ]),
      [0.11, 0.015],
      { color: IVORY, sides: 6, caps: "point" },
    );
    b.rod([s * 0.31, 2.08, 2.22], [s * 0.38, 1.95, 2.38], 0.125, "#7d6a52", { sides: 6 });
  }

  // Tail
  b.sweep(
    catmull([
      [0, 2.75, -2.1],
      [0, 2.3, -2.4],
      [0, 1.6, -2.45],
      [0, 1.0, -2.4],
    ]),
    [0.07, 0.03],
    { color: SKIN, sides: 6, caps: "round" },
  );
  b.spike([0, 1.05, -2.4], [0, -1, 0], 0.4, 0.09, DARK, { sides: 6 });
  b.spike([0.04, 1.0, -2.4], [0.2, -1, -0.1], 0.36, 0.05, DARK, { sides: 5 });
  b.spike([-0.04, 1.0, -2.4], [-0.2, -1, -0.1], 0.36, 0.05, DARK, { sides: 5 });

  return b.root;
}
