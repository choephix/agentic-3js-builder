```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

type V = [number, number, number];

export const meta = {
  name: "Fennec fox",
  description:
    "A desert fennec fox in rest pose: oversized ears, cream muzzle and socks, bushy tail with a black tip.",
};

const FUR = "#e6b47e";
const FUR_DARK = "#c4733b";
const CREAM = "#f8ead6";
const INK = "#1d140f";
const RIM = "#3b2417";
const WHITE = "#ffffff";

const halfway = (a: V, c: V): V => [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
const span = (a: V, c: V): number => Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]);

export default function build() {
  const b = createBuilder({ name: "fennec" });

  // Primitive helpers. Every position is in model space (metres, +Y up, faces +Z).
  const ball = (at: V, scale: V, color: string, seg: [number, number] = [12, 8]) =>
    b.part(new THREE.SphereGeometry(1, seg[0], seg[1]), color, { at, scale });

  const tube = (a: V, c: V, r: number, color: string) =>
    b.part(new THREE.CylinderGeometry(r, r, span(a, c), 8), color, {
      at: halfway(a, c),
      aim: c,
    });

  const cone = (base: V, tip: V, r: number, color: string) =>
    b.part(new THREE.ConeGeometry(r, span(base, tip), 10), color, {
      at: halfway(base, tip),
      aim: tip,
    });

  // ---- skeleton: rest pose, faces +Z, left is +X ----
  const hips = b.joint("hips", { at: [0, 0.165, -0.04] });
  const spine = b.joint("spine", { at: [0, 0.18, 0.04], parent: hips });
  const chest = b.joint("chest", { at: [0, 0.19, 0.11], parent: spine });
  const neck = b.joint("neck", { at: [0, 0.23, 0.15], parent: chest });
  const head = b.joint("head", { at: [0, 0.25, 0.18], parent: neck });
  b.joint("jaw", { at: [0, 0.232, 0.205], parent: head });
  b.joint("earL", { at: [0.03, 0.278, 0.155], parent: head });
  b.joint("earR", { at: [-0.03, 0.278, 0.155], parent: head });

  const tail1 = b.joint("tail1", { at: [0, 0.172, -0.15], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 0.166, -0.22], parent: tail1 });
  const tail3 = b.joint("tail3", { at: [0, 0.16, -0.28], parent: tail2 });
  b.joint("tail4", { at: [0, 0.155, -0.335], parent: tail3 });

  for (const side of [1, -1]) {
    const s = side > 0 ? "L" : "R";
    const shoulder = b.joint(`shoulder${s}`, { at: [0.05 * side, 0.16, 0.07], parent: chest });
    const elbow = b.joint(`elbow${s}`, { at: [0.052 * side, 0.1, 0.072], parent: shoulder });
    b.joint(`wrist${s}`, { at: [0.052 * side, 0.04, 0.08], parent: elbow });
    const hip = b.joint(`hip${s}`, { at: [0.058 * side, 0.15, -0.1], parent: hips });
    const knee = b.joint(`knee${s}`, { at: [0.06 * side, 0.085, -0.09], parent: hip });
    const ankle = b.joint(`ankle${s}`, { at: [0.06 * side, 0.04, -0.125], parent: knee });
    b.joint(`toe${s}`, { at: [0.06 * side, 0.016, -0.1], parent: ankle });
  }

  // ---- torso: sandy body, darker saddle, cream belly and chest bib ----
  ball([0, 0.165, -0.02], [0.06, 0.058, 0.135], FUR, [14, 10]);
  ball([0, 0.205, -0.035], [0.043, 0.026, 0.1], FUR_DARK);
  ball([0, 0.135, 0], [0.046, 0.03, 0.1], CREAM);
  ball([0, 0.178, 0.1], [0.04, 0.05, 0.04], CREAM);
  tube([0, 0.2, 0.12], [0, 0.235, 0.165], 0.036, FUR);

  // ---- head: wedge skull, cream lower face, pointed muzzle, black nose ----
  ball([0, 0.25, 0.185], [0.048, 0.046, 0.058], FUR, [14, 10]);
  ball([0, 0.236, 0.2], [0.034, 0.024, 0.045], CREAM);
  cone([0, 0.245, 0.21], [0, 0.24, 0.31], 0.03, FUR);
  ball([0, 0.226, 0.225], [0.024, 0.015, 0.035], CREAM);
  ball([0, 0.241, 0.309], [0.013, 0.012, 0.013], INK);

  for (const side of [1, -1]) {
    // Oversized ears: tan outside, cream inner cone pushed forward so it reads on the front.
    cone([0.03 * side, 0.278, 0.155], [0.05 * side, 0.38, 0.13], 0.03, FUR_DARK);
    cone([0.03 * side, 0.283, 0.175], [0.05 * side, 0.368, 0.14], 0.02, CREAM);

    // Large dark eyes with a brown rim and a catch-light.
    ball([0.026 * side, 0.262, 0.229], [0.0135, 0.0165, 0.006], RIM, [10, 8]);
    ball([0.026 * side, 0.262, 0.233], [0.0115, 0.0145, 0.0065], INK, [10, 8]);
    ball([0.03 * side, 0.268, 0.238], [0.0035, 0.0035, 0.0035], WHITE, [6, 4]);

    // Thin whiskers off the muzzle.
    tube([0.01 * side, 0.25, 0.27], [0.085 * side, 0.238, 0.3], 0.0013, INK);
    tube([0.008 * side, 0.243, 0.285], [0.075 * side, 0.24, 0.31], 0.0013, INK);
  }

  // ---- bushy tail, black tip ----
  ball([0, 0.175, -0.15], [0.042, 0.042, 0.05], FUR);
  ball([0, 0.17, -0.22], [0.05, 0.048, 0.06], FUR);
  ball([0, 0.163, -0.28], [0.052, 0.05, 0.06], FUR);
  ball([0, 0.157, -0.335], [0.046, 0.044, 0.045], INK);

  // ---- legs: fur above, cream socks below ----
  for (const side of [1, -1]) {
    // Fore leg
    tube([0.05 * side, 0.16, 0.07], [0.052 * side, 0.1, 0.072], 0.02, FUR);
    tube([0.052 * side, 0.1, 0.072], [0.052 * side, 0.04, 0.08], 0.013, CREAM);
    ball([0.052 * side, 0.016, 0.092], [0.024, 0.016, 0.036], CREAM, [8, 6]);

    // Hind leg: haunch, thigh, shin, hock-to-foot
    ball([0.055 * side, 0.155, -0.1], [0.036, 0.042, 0.05], FUR);
    tube([0.058 * side, 0.15, -0.1], [0.06 * side, 0.085, -0.09], 0.022, FUR);
    tube([0.06 * side, 0.085, -0.09], [0.06 * side, 0.04, -0.125], 0.013, CREAM);
    tube([0.06 * side, 0.04, -0.125], [0.06 * side, 0.016, -0.1], 0.012, CREAM);
  }

  return b.root;
}
```