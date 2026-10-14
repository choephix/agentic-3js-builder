```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "hedgehog",
  description: "A stylised hedgehog: a spiny brown back, a cream face with a dark nose, and short stubby legs.",
};

const SPINE = "#6e4a2f";
const SPINE_TIP = "#2e1f15";
const BELLY = "#e6d2ad";
const FACE = "#eac9a0";
const EAR = "#d99f86";
const DARK = "#1f1612";
const WHITE = "#fbf7ef";
const FOOT = "#3b2a20";

export default function build() {
  const b = createBuilder({ name: "hedgehog" });
  const r = rng(7);

  // ---- Skeleton -------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.14, 0] });
  const head = b.joint("head", { at: [0, 0.17, 0.13], parent: hips });

  const legSpots = {
    legFL: [0.07, 0.07, 0.08],
    legFR: [-0.07, 0.07, 0.08],
    legBL: [0.07, 0.07, -0.12],
    legBR: [-0.07, 0.07, -0.12],
  } as const;
  const legJoints: Record<string, ReturnType<typeof b.joint>> = {};
  for (const [name, at] of Object.entries(legSpots)) {
    legJoints[name] = b.joint(name, { at: [...at], parent: hips });
  }

  // ---- Body: a rounded ovoid carrying the spines -----------------------
  const BODY_C: [number, number, number] = [0, 0.14, -0.02];
  const BODY_R: [number, number, number] = [0.12, 0.1, 0.15];
  const bodyPart = b.part(new THREE.SphereGeometry(1, 24, 16), BELLY, {
    at: BODY_C,
    bone: hips,
    scale: [BODY_R[0], BODY_R[1], BODY_R[2]],
  });

  // Spines: sample the body's ellipsoid on an outer shell, snap each sample
  // to the surface, and skip the face and belly.
  const skin = b.surface(bodyPart);
  const ROWS = 9;
  const COLS = 18;
  for (let i = 0; i < ROWS; i++) {
    const phi = 0.3 + (i * (2.2 - 0.3)) / (ROWS - 1);
    for (let j = 0; j < COLS; j++) {
      const theta = ((j + r() * 0.5) / COLS) * Math.PI * 2;
      const sp = Math.sin(phi);
      const sx = sp * Math.cos(theta);
      const sy = Math.cos(phi);
      const sz = sp * Math.sin(theta);
      // Keep the face clear: skip samples facing forward.
      if (sz > 0.42) continue;
      const shell = 1.6;
      const p: [number, number, number] = [
        BODY_C[0] + shell * BODY_R[0] * sx,
        BODY_C[1] + shell * BODY_R[1] * sy,
        BODY_C[2] + shell * BODY_R[2] * sz,
      ];
      const hit = skin.nearest(p);
      const len = 0.03 + r() * 0.012;
      b.spike(hit, hit, len, 0.0055);
    }
  }

  // Cream belly band peeking out below the spines.
  b.part(new THREE.SphereGeometry(1, 18, 10), BELLY, {
    at: [0, 0.1, 0.02],
    bone: hips,
    scale: [0.105, 0.05, 0.13],
  });

  // ---- Head -------------------------------------------------------------
  b.part(new THREE.SphereGeometry(1, 20, 14), FACE, {
    at: [0, 0.17, 0.13],
    bone: head,
    scale: [0.075, 0.07, 0.08],
  });

  // Snout tapering forward.
  b.part(new THREE.SphereGeometry(1, 16, 12), FACE, {
    at: [0, 0.158, 0.2],
    bone: head,
    scale: [0.045, 0.038, 0.055],
  });

  // Nose.
  b.part(new THREE.SphereGeometry(1, 12, 8), DARK, {
    at: [0, 0.163, 0.25],
    bone: head,
    scale: [0.014, 0.012, 0.012],
  });

  // Eyes with small highlights.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 12, 8), DARK, {
      at: [s * 0.034, 0.19, 0.205],
      bone: head,
      scale: [0.012, 0.014, 0.01],
    });
    b.part(new THREE.SphereGeometry(1, 8, 6), WHITE, {
      at: [s * 0.038, 0.196, 0.214],
      bone: head,
      scale: [0.004, 0.004, 0.004],
    });
  }

  // Ears: flattened, pinkish, set back on the top of the head.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 12, 8), EAR, {
      at: [s * 0.05, 0.228, 0.1],
      bone: head,
      scale: [0.024, 0.028, 0.008],
    });
  }

  // Dark mask across the top of the snout for a bit of character.
  b.part(new THREE.SphereGeometry(1, 14, 8), SPINE_TIP, {
    at: [0, 0.19, 0.16],
    bone: head,
    scale: [0.05, 0.02, 0.05],
  });

  // ---- Legs: short stubby cylinders with dark feet ----------------------
  for (const [name, at] of Object.entries(legSpots)) {
    const [x, , z] = at;
    b.part(new THREE.CylinderGeometry(0.018, 0.022, 0.07, 8), FOOT, {
      at: [x, 0.035, z],
      bone: legJoints[name],
    });
    b.part(new THREE.SphereGeometry(1, 12, 8), FOOT, {
      at: [x, 0.012, z + 0.012],
      bone: legJoints[name],
      scale: [0.03, 0.014, 0.04],
    });
  }

  return b.root;
}
```