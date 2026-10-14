import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Koala",
  description: "A stylized standing koala with big fluffy ears, a large black nose, and clawed limbs, rigged with jaw, ears, and limbs.",
};

export default function build() {
  const b = createBuilder({ name: "koala" });

  const hips = b.joint("hips", { at: [0, 0.27, -0.1] });
  const spine = b.joint("spine", { at: [0, 0.3, 0.08], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.4, 0.2], parent: spine });
  const head = b.joint("head", { at: [0, 0.47, 0.25], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.43, 0.34], parent: head });
  const earL = b.joint("earL", { at: [0.15, 0.58, 0.24], parent: head });
  const earR = b.joint("earR", { at: [-0.15, 0.58, 0.24], parent: head });

  const sides: [string, number][] = [["L", 1], ["R", -1]];
  const J: Record<string, any> = {};
  for (const [n, s] of sides) {
    J["shoulder" + n] = b.joint("shoulder" + n, { at: [0.13 * s, 0.32, 0.16], parent: spine });
    J["elbow" + n] = b.joint("elbow" + n, { at: [0.15 * s, 0.19, 0.17], parent: J["shoulder" + n] });
    J["hand" + n] = b.joint("hand" + n, { at: [0.15 * s, 0.05, 0.18], parent: J["elbow" + n] });
    J["hip" + n] = b.joint("hip" + n, { at: [0.14 * s, 0.25, -0.2], parent: hips });
    J["knee" + n] = b.joint("knee" + n, { at: [0.15 * s, 0.14, -0.14], parent: J["hip" + n] });
    J["foot" + n] = b.joint("foot" + n, { at: [0.15 * s, 0.04, -0.15], parent: J["knee" + n] });
  }

  const S = new THREE.SphereGeometry(1, 12, 9);
  const B = new THREE.BoxGeometry(1, 1, 1);
  const p = (g: THREE.BufferGeometry, color: string, at: number[], scale: number[], bone: any) =>
    b.part(g, color, { at, bone, scale } as any);

  const FUR = "#8d9097", DARK = "#6f737b", CREAM = "#e9e4d6", PINK = "#e8b3b8", BLACK = "#16161a";

  // body
  p(S, FUR, [0, 0.26, -0.05], [0.2, 0.21, 0.28], hips);
  p(S, CREAM, [0, 0.22, 0.06], [0.14, 0.15, 0.17], spine);
  p(S, DARK, [0, 0.33, -0.12], [0.17, 0.12, 0.2], hips);
  p(S, CREAM, [0, 0.2, -0.28], [0.1, 0.08, 0.06], hips); // rump patch
  p(S, FUR, [0, 0.38, 0.17], [0.13, 0.12, 0.1], neck);

  // head
  p(S, FUR, [0, 0.48, 0.27], [0.18, 0.15, 0.15], head);
  p(S, CREAM, [0, 0.44, 0.35], [0.1, 0.07, 0.07], head);
  p(S, FUR, [0, 0.54, 0.31], [0.13, 0.06, 0.08], head);
  // nose
  p(S, BLACK, [0, 0.5, 0.41], [0.05, 0.07, 0.04], head);
  p(S, "#3a3a42", [0.012, 0.525, 0.44], [0.012, 0.012, 0.006], head);
  // eyes
  for (const [n, s] of sides) {
    p(S, BLACK, [0.075 * s, 0.53, 0.37], [0.02, 0.024, 0.016], head);
    p(S, "#ffffff", [0.08 * s, 0.538, 0.385], [0.007, 0.007, 0.005], head);
    p(S, DARK, [0.075 * s, 0.56, 0.36], [0.03, 0.01, 0.015], head);
  }
  // jaw
  p(S, CREAM, [0, 0.415, 0.35], [0.065, 0.03, 0.065], jaw);
  p(B, PINK, [0, 0.435, 0.36], [0.08, 0.008, 0.08], jaw);

  // ears
  for (const [n, s] of sides) {
    const e = n === "L" ? earL : earR;
    p(S, FUR, [0.16 * s, 0.6, 0.24], [0.1, 0.1, 0.045], e);
    p(S, CREAM, [0.16 * s, 0.6, 0.265], [0.08, 0.08, 0.03], e);
    p(S, "#f4f0e6", [0.16 * s, 0.6, 0.285], [0.055, 0.055, 0.02], e);
    p(S, CREAM, [0.2 * s, 0.57, 0.26], [0.03, 0.04, 0.02], e);
  }

  // limbs
  for (const [n, s] of sides) {
    // arms
    p(S, FUR, [0.14 * s, 0.3, 0.16], [0.07, 0.09, 0.07], J["shoulder" + n]);
    p(S, FUR, [0.15 * s, 0.2, 0.17], [0.05, 0.12, 0.05], J["elbow" + n]);
    p(S, DARK, [0.15 * s, 0.06, 0.19], [0.055, 0.04, 0.07], J["hand" + n]);
    for (let i = -1; i <= 1; i++) {
      p(B, "#ece7da", [(0.15 + i * 0.022) * s, 0.015, 0.265], [0.012, 0.012, 0.035], J["hand" + n]);
    }
    // legs
    p(S, FUR, [0.15 * s, 0.24, -0.2], [0.09, 0.11, 0.12], J["hip" + n]);
    p(S, FUR, [0.15 * s, 0.13, -0.15], [0.05, 0.1, 0.055], J["knee" + n]);
    p(S, DARK, [0.15 * s, 0.035, -0.12], [0.06, 0.035, 0.09], J["foot" + n]);
    for (let i = -1; i <= 1; i++) {
      p(B, "#ece7da", [(0.15 + i * 0.024) * s, 0.015, -0.03], [0.013, 0.012, 0.035], J["foot" + n]);
    }
  }

  return b.root;
}
