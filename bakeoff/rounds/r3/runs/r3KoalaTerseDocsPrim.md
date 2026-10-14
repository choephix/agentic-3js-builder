```ts
import * as THREE from "three";
import { createBuilder, countershade, mottle } from "agentic-3js-builder";

export const meta = {
  name: "Koala",
  description: "A seated, stylized koala with big fluffy ears, a large dark nose, and a rigged skeleton in rest pose.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "koala" });

  const GREY = "#8b8e94";
  const LIGHT = "#a3a6ab";
  const DARK = "#4d5056";
  const CREAM = "#eee8da";
  const NOSE = "#1b181a";
  const CLAW = "#d8d0bd";
  const EAR_IN = "#f1e4dc";
  const coat = countershade(mottle(GREY, LIGHT, { size: 0.07, seed: 3 }), CREAM, { level: -0.6 });
  const headCoat = mottle(GREY, LIGHT, { size: 0.06, seed: 5 });

  // ---- Spine / body ----
  const hips = b.joint("hips", { at: [0, 0.15, -0.04], role: "spine" });
  const spine = b.chain(
    "spine",
    [
      [0, 0.15, -0.04],
      [0, 0.32, 0.0],
      [0, 0.46, 0.06],
      [0, 0.57, 0.1],
    ],
    { parent: hips, role: "spine" },
  );
  b.sweep(spine, [0.165, 0.2, 0.17, 0.11], { color: coat, sides: 10 });
  // cream chest patch
  b.part(new THREE.SphereGeometry(0.14, 10, 8), CREAM, {
    at: [0, 0.38, 0.07],
    scale: [0.95, 1.5, 0.9],
    bone: spine.joints[1],
  });

  // ---- Head ----
  const head = b.joint("head", {
    parent: spine.joints[2],
    at: [0, 0.62, 0.1],
    aim: [0, 0.72, 0.13],
    role: "head",
  });
  b.part(new THREE.SphereGeometry(0.14, 14, 10), headCoat, {
    at: [0, 0.7, 0.11],
    scale: [1.2, 0.95, 1],
    bone: head,
  });
  // cheek fluff
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.055, 8, 6), CREAM, { at: [s * 0.12, 0.65, 0.15], scale: [1, 0.9, 1], bone: head });
    b.part(new THREE.SphereGeometry(0.018, 6, 5), NOSE, { at: [s * 0.065, 0.73, 0.232], bone: head });
  }
  // muzzle + nose
  b.part(new THREE.SphereGeometry(0.06, 8, 6), LIGHT, { at: [0, 0.665, 0.215], scale: [1.1, 0.8, 1], bone: head });
  b.part(new THREE.SphereGeometry(0.042, 8, 6), NOSE, { at: [0, 0.69, 0.265], scale: [1.25, 1.0, 0.8], bone: head });

  // jaw (separate lower jaw)
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.62, 0.14],
    aim: [0, 0.6, 0.27],
    role: "jaw",
  });
  b.part(new THREE.SphereGeometry(0.06, 8, 6), CREAM, { at: [0, 0.6, 0.2], scale: [1.2, 0.5, 1.1], bone: jaw });

  // ears
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const ear = b.joint(`ear${S}`, {
      parent: head,
      at: [s * 0.12, 0.78, 0.08],
      dir: [s, 1, 0],
      role: "hinge",
    });
    b.part(new THREE.SphereGeometry(0.088, 10, 8), GREY, {
      at: [s * 0.155, 0.81, 0.07],
      scale: [1, 1, 0.5],
      rotation: [0, s * 25, 0],
      bone: ear,
    });
    b.part(new THREE.SphereGeometry(0.07, 8, 6), EAR_IN, {
      at: [s * 0.157, 0.81, 0.088],
      scale: [0.95, 0.95, 0.4],
      rotation: [0, s * 25, 0],
      bone: ear,
    });
    // fringe tufts
    for (let k = 0; k < 3; k++) {
      const a = -0.6 + k * 0.6;
      b.part(new THREE.SphereGeometry(0.026, 6, 4), CREAM, {
        at: [s * (0.155 + Math.sin(a) * 0.07), 0.81 + Math.cos(a) * 0.07, 0.085],
        bone: ear,
      });
    }
  }

  // ---- Arms ----
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const W: [number, number, number] = [s * 0.38, 0.27, 0.2];
    const arm = b.chain(
      `arm${S}`,
      [
        [s * 0.16, 0.5, 0.06],
        [s * 0.29, 0.4, 0.14],
        W,
      ],
      { parent: spine.joints[2], names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "arm" },
    );
    b.sweep(arm, [0.058, 0.048, 0.04], { color: GREY, sides: 8 });
    b.part(new THREE.SphereGeometry(0.045, 8, 6), DARK, { at: [W[0], W[1] - 0.02, W[2] + 0.01], bone: arm.tip! });
    for (let i = 0; i < 3; i++) {
      const base: [number, number, number] = [W[0], W[1] - 0.025, W[2] + (i - 1) * 0.03];
      const mid: [number, number, number] = [W[0] + s * 0.005, W[1] - 0.075, W[2] + (i - 1) * 0.04 + 0.01];
      const tip: [number, number, number] = [W[0] + s * 0.01, W[1] - 0.12, W[2] + (i - 1) * 0.05 + 0.025];
      const f = b.chain(`finger${S}${i}`, [base, mid, tip], {
        parent: arm.tip!,
        names: [`fing${S}${i}a`, `fing${S}${i}b`, `fing${S}${i}c`],
        role: "digit",
      });
      b.sweep(f, [0.016, 0.012], { color: DARK, sides: 6 });
      b.spike(tip, [0, -0.3, 0.2], 0.035, 0.011, { color: CLAW, bone: f.tip!, sides: 6 });
    }
  }

  // ---- Legs ----
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${S}`,
      [
        [s * 0.15, 0.17, 0.02],
        [s * 0.22, 0.105, 0.2],
        [s * 0.2, 0.05, 0.3],
      ],
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg", contact: [s * 0.2, 0, 0.36] },
    );
    b.sweep(leg, [0.08, 0.063, 0.045], { color: GREY, sides: 8 });
    b.part(new THREE.SphereGeometry(0.05, 8, 6), DARK, {
      at: [s * 0.2, 0.03, 0.35],
      scale: [1, 0.6, 1.5],
      bone: leg.tip!,
    });
    for (let i = 0; i < 3; i++) {
      const x = s * 0.2 + (i - 1) * 0.032;
      b.capsule([x, 0.02, 0.38], [x, 0.02, 0.43], 0.016, { color: DARK, bone: leg.tip!, sides: 6 });
      b.spike([x, 0.02, 0.43], [0, 0, 1], 0.03, 0.011, { color: CLAW, bone: leg.tip!, sides: 6 });
    }
  }

  return b.root;
}
```