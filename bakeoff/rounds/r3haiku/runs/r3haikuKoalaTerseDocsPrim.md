```ts
import * as THREE from "three";
import { createBuilder, limb, countershade, mottle } from "agentic-3js-builder";

export const meta = {
  name: "koala",
  description: "A chunky grey koala standing on four stubby limbs, with big round ears and a large black nose.",
};

const FUR = mottle("#8f979d", "#a9b0b5", { size: 0.14, contrast: 0.6, seed: 4 });
const COAT = countershade(FUR, "#e9e4d9", { level: -0.2 });
const CREAM = "#ebe6dc";
const EAR = "#cfc7bb";
const DARK = "#222124";
const WHITE = "#ffffff";

export default function build() {
  const b = createBuilder({ name: "koala" });

  // Skeleton: hips at the root, a spine that runs up into the neck, and a head.
  const hips = b.joint("hips", { at: [0, 0.4, -0.1], role: "spine" });
  const spine = b.chain(
    "spine",
    [
      [0, 0.4, -0.1],
      [0, 0.42, 0.02],
      [0, 0.5, 0.14],
      [0, 0.6, 0.26],
    ],
    { parent: hips, names: ["spine", "chest", "neck"], role: "spine" },
  );
  const chest = spine.joints[1];
  const neck = spine.joints[2];
  const head = b.joint("head", { parent: neck, at: [0, 0.66, 0.3], dir: [0, 0.25, 1], role: "head" });

  // Body: one tube that bends along the spine, fat at the rump and slimmer at the neck.
  b.sweep(spine, (t) => [0.2 - 0.07 * t, 0.2 - 0.08 * t], { color: COAT });

  // Head: a big round skull with a cream muzzle and a large dark nose.
  b.part(new THREE.SphereGeometry(0.13, 14, 10), COAT, { bone: head, flat: true });
  b.part(new THREE.SphereGeometry(0.075, 10, 8), CREAM, {
    bone: head,
    at: head.local({ forward: 0.09, up: -0.035 }),
    flat: true,
  });
  b.part(new THREE.SphereGeometry(0.034, 8, 6), DARK, {
    bone: head,
    at: head.local({ forward: 0.155, up: 0.02 }),
  });

  for (const s of [1, -1]) {
    // Eyes with a tiny catchlight.
    b.part(new THREE.SphereGeometry(0.022, 8, 6), DARK, {
      bone: head,
      at: head.local({ left: s * 0.055, up: 0.035, forward: 0.115 }),
    });
    b.part(new THREE.SphereGeometry(0.007, 6, 4), WHITE, {
      bone: head,
      at: head.local({ left: s * 0.06, up: 0.045, forward: 0.125 }),
    });

    // Big round ears, a fur outer disc with a cream inner disc.
    b.part(new THREE.CylinderGeometry(0.065, 0.065, 0.02, 12), COAT, {
      bone: head,
      at: head.local({ left: s * 0.12, up: 0.08, forward: -0.02 }),
      dir: [s, 0, 0],
    });
    b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.022, 10), EAR, {
      bone: head,
      at: head.local({ left: s * 0.13, up: 0.08, forward: -0.02 }),
      dir: [s, 0, 0],
    });

    const S = s === 1 ? "L" : "R";

    // Front arms: shoulder on the chest, elbow pointing back, paw on the floor.
    const arm = limb([s * 0.14, 0.36, 0.12], [s * 0.13, 0.04, 0.22], [0.2, 0.17], [[0, 0, -1]]);
    const armChain = b.chain("arm" + S, arm, {
      parent: chest,
      names: ["shoulder" + S, "elbow" + S, "paw" + S],
      role: "arm",
    });
    b.sweep(armChain, (t) => 0.065 - 0.012 * t, { color: COAT });
    const paw = armChain.tip ?? armChain.joints[armChain.joints.length - 1];
    b.part(new THREE.SphereGeometry(0.04, 10, 8), COAT, { bone: paw });
    for (const k of [-1, 0, 1]) {
      b.part(new THREE.ConeGeometry(0.007, 0.03, 5), DARK, {
        bone: paw,
        at: paw.local({ forward: 0.045, left: k * 0.018, up: -0.025 }),
        dir: [0, 0, 1],
      });
    }

    // Back legs: knee forward, foot planted on the floor.
    const hind = limb([s * 0.13, 0.3, -0.1], [s * 0.12, 0.04, 0.03], [0.2, 0.17], [[0, 0, 1]]);
    const legChain = b.chain("leg" + S, hind, {
      parent: spine.joints[0],
      names: ["hip" + S, "knee" + S, "foot" + S],
      role: "leg",
    });
    b.sweep(legChain, (t) => 0.065 - 0.012 * t, { color: COAT });
    const foot = legChain.tip ?? legChain.joints[legChain.joints.length - 1];
    b.part(new THREE.SphereGeometry(0.04, 10, 8), COAT, { bone: foot });
    for (const k of [-1, 0, 1]) {
      b.part(new THREE.ConeGeometry(0.007, 0.03, 5), DARK, {
        bone: foot,
        at: foot.local({ forward: 0.045, left: k * 0.018, up: -0.025 }),
        dir: [0, 0, 1],
      });
    }
  }

  // Tiny tail tucked at the rump.
  b.part(new THREE.SphereGeometry(0.045, 8, 6), COAT, {
    bone: hips,
    at: hips.local({ back: 0.24, up: 0.08 }),
  });

  return b.root;
}
```