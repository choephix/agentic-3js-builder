```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

type V = [number, number, number];

const RED = "#9c3b23";
const RED_D = "#7a2b1a";
const ORANGE = "#e07a2c";
const CREAM = "#f1e2bf";
const DARK = "#2b1d17";
const EYE = "#fff7e6";
const BARN = "#d9d0ba";
const WEED = "#3e7a3a";
const WEED_L = "#5fa04a";

const add = (a: V, c: V, k = 1): V => [a[0] + c[0] * k, a[1] + c[1] * k, a[2] + c[2] * k];
const mid = (a: V, c: V): V => [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
const lerp = (a: V, c: V, t: number): V => [
  a[0] + (c[0] - a[0]) * t,
  a[1] + (c[1] - a[1]) * t,
  a[2] + (c[2] - a[2]) * t,
];

export const meta = {
  name: "Red rock crab",
  description: "A feisty red rock crab with a raised oversized claw, knobbly speckled shell, eyes on stalks, eight walking legs, a barnacle and a strand of seaweed.",
};

export default function build() {
  const b = createBuilder({ name: "red-rock-crab" });
  const R = rng(7);

  // Shell proportions (metres): rx 0.15, ry 0.06, rz 0.12
  const SHELL_C: V = [0, 0.1, 0];
  const RX = 0.15;
  const RY = 0.06;
  const RZ = 0.12;

  const body = b.joint("body", { at: SHELL_C });

  // Cylinder segment from a to c, aimed along its axis.
  function seg(a: V, c: V, r: number, color: string, bone: any, sides = 6) {
    const A = new THREE.Vector3(...a);
    const C = new THREE.Vector3(...c);
    const len = A.distanceTo(C);
    const m = mid(a, c);
    b.part(new THREE.CylinderGeometry(r, r, len, sides), color, {
      at: m,
      aim: c,
      bone,
    });
  }

  // ---- Shell ----
  b.part(new THREE.SphereGeometry(0.12, 28, 18), RED, {
    at: SHELL_C,
    bone: body,
    scale: [1.25, 0.5, 1.0],
  });

  // Speckles and knobs scattered over the shell top
  const barnPhi = 0.6;
  const barnTheta = Math.PI;
  const barnacleAt: V = [
    RX * 0 + 0,
    SHELL_C[1] + RY * Math.cos(barnPhi),
    RZ * Math.sin(barnPhi) * Math.sin(barnTheta) * -1 * -1 - 0.0 + -RZ * Math.sin(barnPhi),
  ];
  // barnacle sits on the back (-Z) of the shell
  const B: V = [0, SHELL_C[1] + RY * Math.cos(barnPhi), -RZ * Math.sin(barnPhi)];
  void barnacleAt;

  for (let i = 0; i < 60; i++) {
    const theta = R() * Math.PI * 2;
    const phi = 0.3 + R() * 1.0;
    const x = RX * Math.sin(phi) * Math.cos(theta);
    const y = RY * Math.cos(phi);
    const z = RZ * Math.sin(phi) * Math.sin(theta);
    const p: V = [x, SHELL_C[1] + y, z];
    // keep clear of the eye stalks at the front and the barnacle at the back
    const dB = Math.hypot(p[0] - B[0], p[1] - B[1], p[2] - B[2]);
    if (dB < 0.04) continue;
    if (p[2] > 0.06 && Math.abs(p[0]) < 0.07) continue;
    const r = 0.007 + R() * 0.006;
    const color = R() < 0.5 ? ORANGE : CREAM;
    b.part(new THREE.SphereGeometry(r, 8, 6), color, {
      at: p,
      bone: body,
      scale: [1, 0.7, 1],
    });
  }

  // ---- Barnacle on the back ----
  b.part(new THREE.CylinderGeometry(0.015, 0.02, 0.012, 8), BARN, {
    at: add(B, [0, 0.004, 0]),
    bone: body,
  });
  b.part(new THREE.CylinderGeometry(0.007, 0.007, 0.006, 6), DARK, {
    at: add(B, [0, 0.011, 0]),
    bone: body,
  });

  // ---- Seaweed strand rising from the barnacle ----
  const weedPath: V[] = [
    [B[0], B[1] + 0.004, B[2] - 0.004],
    [B[0] + 0.01, B[1] + 0.03, B[2] - 0.012],
    [B[0] - 0.01, B[1] + 0.06, B[2] - 0.022],
    [B[0] + 0.015, B[1] + 0.09, B[2] - 0.03],
    [B[0], B[1] + 0.12, B[2] - 0.04],
  ];
  b.sweep(weedPath, 0.005, { color: WEED });
  const leafSpots: [number, number][] = [
    [1, 0.5],
    [2, -1],
    [3, 0.5],
  ];
  for (const [idx, side] of leafSpots) {
    const p = weedPath[idx];
    b.part(new THREE.SphereGeometry(0.01, 8, 6), WEED_L, {
      at: [p[0] + 0.006 * side, p[1], p[2]],
      bone: body,
      scale: [0.5, 2.2, 0.25],
    });
  }

  // ---- Eyes on stalks ----
  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";
    const stalkBase: V = [s * 0.04, 0.14, 0.09];
    const eyePos: V = [s * 0.05, 0.2, 0.11];
    const stalk = b.joint(`stalk${tag}`, { at: stalkBase, parent: body });
    const eye = b.joint(`eye${tag}`, { at: eyePos, parent: stalk });
    seg(stalkBase, eyePos, 0.008, RED_D, stalk, 6);
    b.part(new THREE.SphereGeometry(0.022, 14, 10), EYE, { at: eyePos, bone: eye });
    b.part(new THREE.SphereGeometry(0.01, 8, 6), DARK, {
      at: add(eyePos, [0, 0, 0.02]),
      bone: eye,
    });
  }

  // ---- Walking legs: four pairs with pointed tips ----
  const zs = [0.05, 0.0, -0.05, -0.1];
  for (let i = 0; i < 4; i++) {
    for (const s of [1, -1]) {
      const tag = `${s > 0 ? "L" : "R"}${i + 1}`;
      const z = zs[i];
      const hipP: V = [s * 0.1, 0.1, z];
      const kneeP: V = [s * 0.2, 0.13, z + 0.01];
      const ankleP: V = [s * 0.26, 0.04, z - 0.03];
      const tipP: V = [s * 0.3, 0.005, z - 0.05];

      const hip = b.joint(`hip${tag}`, { at: hipP, parent: body });
      const knee = b.joint(`knee${tag}`, { at: kneeP, parent: hip });
      const ankle = b.joint(`ankle${tag}`, { at: ankleP, parent: knee });

      seg(hipP, kneeP, 0.012, RED_D, hip);
      seg(kneeP, ankleP, 0.01, RED_D, knee);
      seg(ankleP, tipP, 0.007, RED_D, ankle);
      b.part(new THREE.SphereGeometry(0.014, 8, 6), RED_D, { at: kneeP, bone: knee });
      b.part(new THREE.ConeGeometry(0.008, 0.03, 5), DARK, {
        at: mid(ankleP, tipP),
        aim: tipP,
        bone: ankle,
      });
    }
  }

  // ---- Claws ----
  function claw(s: number, k: number, shoulder: V, elbow: V, wrist: V, tag: string) {
    const sh = b.joint(`shoulder${tag}`, { at: shoulder, parent: body });
    const el = b.joint(`elbow${tag}`, { at: elbow, parent: sh });
    const wr = b.joint(`wrist${tag}`, { at: wrist, parent: el });

    seg(shoulder, elbow, 0.014 * k + 0.008, RED_D, sh);
    seg(elbow, wrist, 0.012 * k + 0.008, RED_D, el);
    b.part(new THREE.SphereGeometry(0.018 * k + 0.01, 10, 8), RED_D, { at: elbow, bone: el });

    // Palm
    b.part(new THREE.SphereGeometry(0.055 * k, 18, 12), RED, {
      at: wrist,
      bone: wr,
      scale: [1.1, 0.9, 1.05],
    });

    // Jaws: upper fixed, lower movable, both reaching forward
    const uBase: V = add(wrist, [s * 0.02 * k, 0.03 * k, 0.04 * k]);
    const uTip: V = add(wrist, [s * 0.03 * k, 0.05 * k, 0.17 * k]);
    const lBase: V = add(wrist, [s * 0.02 * k, -0.03 * k, 0.04 * k]);
    const lTip: V = add(wrist, [s * 0.0 * k, -0.02 * k, 0.15 * k]);

    const up = b.joint(`clawUp${tag}`, { at: uBase, parent: wr });
    const low = b.joint(`clawLow${tag}`, { at: lBase, parent: wr });

    seg(uBase, uTip, 0.013 * k, RED, up);
    seg(lBase, lTip, 0.012 * k, RED, low);

    // Dark pincer tips
    b.part(new THREE.SphereGeometry(0.014 * k, 8, 6), DARK, { at: uTip, bone: up });
    b.part(new THREE.SphereGeometry(0.013 * k, 8, 6), DARK, { at: lTip, bone: low });

    // Teeth along the inner edges
    for (const t of [0.35, 0.6, 0.85]) {
      const uc = add(lerp(uBase, uTip, t), [0, -0.011 * k, 0]);
      b.part(new THREE.ConeGeometry(0.006 * k, 0.018 * k, 5), CREAM, {
        at: uc,
        aim: add(uc, [0, -0.02 * k, 0]),
        bone: up,
      });
      const lc = add(lerp(lBase, lTip, t), [0, 0.011 * k, 0]);
      b.part(new THREE.ConeGeometry(0.006 * k, 0.018 * k, 5), CREAM, {
        at: lc,
        aim: add(lc, [0, 0.02 * k, 0]),
        bone: low,
      });
    }
  }

  // Oversized raised challenge claw (left, +X)
  claw(1, 1.0, [0.07, 0.12, 0.04], [0.14, 0.18, 0.1], [0.16, 0.27, 0.2], "L");
  // Smaller claw on the other side (right, -X)
  claw(-1, 0.55, [-0.07, 0.1, 0.03], [-0.1, 0.1, 0.09], [-0.12, 0.1, 0.16], "R");

  return b.root;
}
```