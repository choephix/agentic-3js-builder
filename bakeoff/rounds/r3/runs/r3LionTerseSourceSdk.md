```ts
import * as THREE from "three";
import { createBuilder, countershade, mottle, line } from "agentic-3js-builder";

export const meta = {
  name: "Lion",
  description:
    "A standing male lion in a rigged rest pose: spine, neck, jaw, four legs and a tufted tail, with a spiky layered mane.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "lion" });

  const TAN = "#c99a5b";
  const CREAM = "#ecd6a6";
  const MANE_D = "#5e3414";
  const MANE_M = "#8a5428";
  const DARK = "#3a2218";
  const coat = countershade(TAN, CREAM, { level: -0.15, soft: 0.4 });
  const maneP = mottle(MANE_D, MANE_M, { size: 0.12, seed: 3 });

  const sph = () => new THREE.SphereGeometry(1, 8, 6);
  const ell = (at: number[], sc: number[], color: any, bone: string, rotation?: number[]) =>
    b.part(sph(), color, { at, scale: sc, bone, rotation });

  // ---- skeleton ----
  b.joint("root", { at: [0, 0.84, -0.78], dir: [0, 0, 1] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.84, -0.78],
      [0, 0.88, -0.2],
      [0, 0.9, 0.3],
      [0, 0.92, 0.62],
    ],
    { parent: "root", role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 0.92, 0.62],
      [0, 1.0, 0.82],
      [0, 1.05, 0.98],
    ],
    { parent: spine, role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 1.05, 0.98], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: head, at: [0, 0.99, 1.12], dir: [0, 0, 1], role: "jaw" });
  const tail = b.chain(
    "tail",
    [
      [0, 0.86, -0.88],
      [0, 0.8, -1.25],
      [0, 0.62, -1.55],
      [0, 0.42, -1.7],
      [0, 0.3, -1.72],
    ],
    { parent: "root", role: "tail" },
  );

  // ---- body ----
  b.sweep(spine, {
    radius: (t: number) => [0.2 + 0.06 * t, 0.27 + 0.05 * t] as [number, number],
    color: coat,
  });
  b.sweep(neck, { radius: [0.2, 0.18, 0.17], color: coat });
  b.sweep(tail, { radius: [0.055, 0.045, 0.04, 0.035, 0.035], color: coat });
  // tail tuft
  ell([0, 0.27, -1.74], [0.07, 0.12, 0.08], MANE_D, "tail4");
  ell([0, 0.2, -1.74], [0.05, 0.1, 0.06], DARK, "tail4");

  // ---- mane ----
  b.capsule([0, 0.95, 0.55], [0, 1.03, 0.9], 0.31, { color: maneP, bone: "neck1" });
  b.capsule([0, 0.72, 0.5], [0, 0.76, 0.8], 0.17, { color: MANE_M, bone: "neck1" });
  const spikeG = () => new THREE.ConeGeometry(0.08, 0.3, 5);
  b.ring(line([0, 1.03, 0.9], [0, 1.03, 1.9]), { count: 16, radius: 0.28, tilt: -35 }, (item) =>
    b.stick(spikeG(), MANE_M, item, { bone: "neck2" }),
  );
  b.ring(line([0, 1.0, 0.72], [0, 1.0, 1.72]), { count: 18, radius: 0.36, tilt: -40 }, (item) =>
    b.stick(new THREE.ConeGeometry(0.1, 0.36, 5), MANE_D, item, { bone: "neck1" }),
  );
  b.ring(line([0, 0.95, 0.52], [0, 0.95, 1.52]), { count: 16, radius: 0.34, tilt: -45 }, (item) =>
    b.stick(new THREE.ConeGeometry(0.1, 0.34, 5), MANE_D, item, { bone: "spine3" }),
  );

  // ---- head ----
  b.part(new THREE.BoxGeometry(0.3, 0.27, 0.3), coat, { at: [0, 1.06, 1.14], bone: "head" });
  b.part(new THREE.BoxGeometry(0.17, 0.12, 0.2), CREAM, { at: [0, 1.0, 1.33], bone: "head" });
  b.part(new THREE.BoxGeometry(0.1, 0.1, 0.16), TAN, { at: [0, 1.1, 1.32], bone: "head" });
  b.part(new THREE.BoxGeometry(0.09, 0.05, 0.04), "#4a2a2a", { at: [0, 1.04, 1.44], bone: "head" });
  b.part(new THREE.BoxGeometry(0.32, 0.04, 0.1), MANE_M, { at: [0, 1.17, 1.22], bone: "head" });
  // jaw
  b.part(new THREE.BoxGeometry(0.14, 0.04, 0.24), CREAM, { at: [0, 0.935, 1.3], bone: "jaw" });
  b.part(new THREE.BoxGeometry(0.12, 0.05, 0.05), CREAM, { at: [0, 0.94, 1.42], bone: "jaw" });
  // teeth
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.018, 0.07, 5), "#fff8e8", { at: [0.05 * s, 0.93, 1.41], rotation: [180, 0, 0], bone: "head" });
    b.part(new THREE.ConeGeometry(0.014, 0.05, 5), "#fff8e8", { at: [0.045 * s, 0.97, 1.4], bone: "jaw" });
    // eyes
    ell([0.1 * s, 1.11, 1.25], [0.032, 0.03, 0.03], "#e0a020", "head");
    ell([0.1 * s, 1.11, 1.278], [0.012, 0.022, 0.01], "#111111", "head");
    // ears
    ell([0.13 * s, 1.23, 1.06], [0.07, 0.07, 0.035], TAN, "head");
    ell([0.13 * s, 1.23, 1.085], [0.04, 0.04, 0.015], "#c98a7a", "head");
    // whisker pads
    ell([0.05 * s, 0.99, 1.4], [0.045, 0.035, 0.04], "#f6e8c8", "head");
  }

  // ---- legs ----
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    const front = b.chain(
      `frontLeg${sd}`,
      [
        [0.19 * s, 0.8, 0.5],
        [0.19 * s, 0.5, 0.46],
        [0.19 * s, 0.14, 0.5],
        [0.19 * s, 0.05, 0.6],
      ],
      { parent: "spine3", names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`, `paw${sd}`], role: "leg" },
    );
    b.sweep(front, { radius: [0.11, 0.085, 0.06, 0.055], color: coat });
    ell([0.2 * s, 0.78, 0.48], [0.13, 0.22, 0.2], coat, `shoulder${sd}`);
    ell([0.19 * s, 0.045, 0.57], [0.08, 0.045, 0.12], CREAM, `paw${sd}`);
    for (const k of [-1, 0, 1])
      ell([(0.19 + 0.04 * k) * s, 0.03, 0.67], [0.03, 0.028, 0.035], CREAM, `paw${sd}`);

    const hind = b.chain(
      `hindLeg${sd}`,
      [
        [0.19 * s, 0.8, -0.68],
        [0.2 * s, 0.46, -0.48],
        [0.18 * s, 0.24, -0.78],
        [0.18 * s, 0.05, -0.66],
      ],
      { parent: "root", names: [`hip${sd}`, `knee${sd}`, `hock${sd}`, `paw${sd}H`], role: "leg" },
    );
    b.sweep(hind, { radius: [0.14, 0.09, 0.055, 0.055], color: coat });
    ell([0.23 * s, 0.68, -0.62], [0.15, 0.25, 0.27], coat, `hip${sd}`);
    ell([0.18 * s, 0.045, -0.6], [0.08, 0.045, 0.12], CREAM, `paw${sd}H`);
    for (const k of [-1, 0, 1])
      ell([(0.18 + 0.04 * k) * s, 0.03, -0.5], [0.03, 0.028, 0.035], CREAM, `paw${sd}H`);
  }

  // belly tuft / spine ridge detail
  ell([0, 0.58, 0.0], [0.12, 0.05, 0.3], CREAM, "spine2");

  return b.root;
}
```