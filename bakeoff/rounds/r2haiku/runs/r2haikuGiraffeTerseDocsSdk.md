```ts
import * as THREE from "three";
import { createBuilder, catmull, limb, patches } from "agentic-3js-builder";

export const meta = {
  name: "giraffe",
  description: "A stylised giraffe in a rest pose: patched coat, dark mane, ossicones, tufted tail, four legs on hooves.",
};

const COAT = patches("#e8c98f", "#8a5526", { size: 0.32, seed: 4 });
const MANE = "#4a2d16";
const DARK = "#2a1a0e";
const HOOF = "#2a2119";
const HORN = "#b9a27a";

export default function build() {
  const b = createBuilder({ name: "giraffe" });

  // ---- Body skeleton -------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 2.6, -0.45], aim: [0, 2.6, -0.3], role: "spine" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.6, -0.3],
      [0, 2.62, 0.0],
      [0, 2.7, 0.3],
      [0, 2.85, 0.7],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );

  // ---- Neck and head ---------------------------------------------------------
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.85, 0.7],
      [0, 3.3, 0.95],
      [0, 3.75, 1.1],
      [0, 4.1, 1.2],
    ]),
    { parent: spine, names: ["neck1", "neck2", "neck3"], role: "neck" },
  );

  const head = b.joint("head", { parent: neck, at: [0, 4.1, 1.2], aim: [0, 3.9, 1.55], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.12, up: -0.07 }),
    aim: head.local({ forward: 0.4, up: -0.08 }),
    role: "jaw",
  });

  // ---- Torso and neck tubes ----------------------------------------------------
  b.sweep(spine, (t: number) => [0.28 - 0.04 * t, 0.38 - 0.06 * t], { color: COAT });
  b.sweep(neck, [0.2, 0.13], { color: COAT, sectors: [[-30, 30, MANE]] });

  // ---- Tail -------------------------------------------------------------------
  const tailPath = catmull([
    [0, 2.55, -0.42],
    [0, 2.45, -0.7],
    [0, 2.1, -0.9],
    [0, 1.6, -1.0],
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" });
  b.sweep(tail, [0.045, 0.015], { color: COAT });
  b.part(new THREE.SphereGeometry(0.06, 6, 4), DARK, { bone: tail.joints[2], at: [0, 1.6, -1.0] });

  // ---- Legs ---------------------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Foreleg: knee points forward.
    const frontPts = limb(
      [s * 0.22, 2.35, 0.55],
      [s * 0.24, 0.1, 0.6],
      [1.15, 1.15],
      [[0, 0, 1]],
    );
    const fl = b.chain(`hipF${side}`, frontPts, {
      parent: spine.joints[2],
      names: [`hipF${side}`, `kneeF${side}`, `ankleF${side}`],
      role: "leg",
    });
    b.sweep(fl, [0.11, 0.06], { color: COAT });
    b.part(new THREE.CylinderGeometry(0.085, 0.095, 0.13, 8), HOOF, {
      bone: fl.joints[2],
      at: [s * 0.24, 0.065, 0.6],
    });

    // Hindleg: hock points backward.
    const hindPts = limb(
      [s * 0.22, 2.35, -0.35],
      [s * 0.24, 0.1, -0.4],
      [1.15, 1.15],
      [[0, 0, -1]],
    );
    const hl = b.chain(`hipH${side}`, hindPts, {
      parent: spine.joints[0],
      names: [`hipH${side}`, `kneeH${side}`, `ankleH${side}`],
      role: "leg",
    });
    b.sweep(hl, [0.11, 0.06], { color: COAT });
    b.part(new THREE.CylinderGeometry(0.085, 0.095, 0.13, 8), HOOF, {
      bone: hl.joints[2],
      at: [s * 0.24, 0.065, -0.4],
    });
  }

  // ---- Head details -------------------------------------------------------------
  // Skull and muzzle
  b.frustumBox(
    head.local({ forward: -0.1, up: 0.02 }),
    head.local({ forward: 0.12, up: 0.02 }),
    [0.2, 0.2],
    [0.17, 0.17],
    { bone: head, color: COAT },
  );
  b.frustumBox(
    head.local({ forward: 0.12, up: 0.0 }),
    head.local({ forward: 0.4, up: -0.06 }),
    [0.17, 0.15],
    [0.13, 0.12],
    { bone: head, color: COAT },
  );
  // Lower jaw, rides its own joint so it can open
  b.frustumBox(
    jaw.local({ forward: 0.0, up: 0.0 }),
    jaw.local({ forward: 0.28, up: 0.0 }),
    [0.13, 0.06],
    [0.1, 0.05],
    { bone: jaw, color: COAT },
  );
  // Nose
  b.part(new THREE.SphereGeometry(0.06, 6, 4), DARK, {
    bone: head,
    at: head.local({ forward: 0.4, up: -0.03 }),
  });

  for (const s of [1, -1]) {
    // Eyes
    b.part(new THREE.SphereGeometry(0.035, 6, 4), DARK, {
      bone: head,
      at: head.local({ left: s * 0.085, up: 0.06, forward: 0.0 }),
    });
    // Ears
    b.capsule(
      head.local({ left: s * 0.1, up: 0.0, forward: -0.05 }),
      head.local({ left: s * 0.2, up: 0.02, forward: -0.08 }),
      0.03,
      { bone: head, color: COAT },
    );
    // Ossicones with dark knobs
    b.capsule(
      head.local({ left: s * 0.05, up: 0.12 }),
      head.local({ left: s * 0.05, up: 0.26 }),
      0.02,
      { bone: head, color: HORN },
    );
    b.part(new THREE.SphereGeometry(0.03, 6, 4), DARK, {
      bone: head,
      at: head.local({ left: s * 0.05, up: 0.27 }),
    });
  }

  return b.root;
}
```