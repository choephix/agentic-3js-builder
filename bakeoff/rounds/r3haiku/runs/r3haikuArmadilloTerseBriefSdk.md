```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "armadillo",
  description:
    "A stylised banded armadillo in rest pose: a tan shell of nine armoured bands, a shield-plate head, a tapered snout, stout legs with claws, and a long tail.",
};

const SHELL = "#a77b52";
const BAND = "#7a5636";
const BELLY = "#ead7b4";
const DARK = "#1e1714";
const CLAW = "#efe6cf";
const EAR = "#8f6742";

function ellipsoid(rx: number, ry: number, rz: number, seg = 18): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(1, seg, Math.round(seg * 0.7));
  g.scale(rx, ry, rz);
  return g;
}

export default function build() {
  const b = createBuilder({ name: "armadillo" });

  // ---- Skeleton -----------------------------------------------------------
  const pelvis = b.joint("pelvis", { at: [0, 0.27, 0.08] });
  const chest = b.joint("chest", { at: [0, 0.31, 0.3], parent: pelvis });
  const neck = b.joint("neck", { at: [0, 0.34, 0.4], parent: chest });
  const head = b.joint("head", { at: [0, 0.36, 0.46], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.31, 0.5], parent: head });

  const tail1 = b.joint("tail1", { at: [0, 0.25, -0.32], parent: pelvis });
  const tail2 = b.joint("tail2", { at: [0, 0.22, -0.45], parent: tail1 });

  // ---- Body and shell ------------------------------------------------------
  b.part(ellipsoid(0.17, 0.15, 0.3), SHELL, { at: [0, 0.27, 0.08], bone: pelvis });

  // Soft, paler underside.
  b.part(ellipsoid(0.14, 0.08, 0.26, 14), BELLY, { at: [0, 0.2, 0.1], bone: pelvis });

  // Nine armoured bands wrapping the back, following the body's taper.
  for (let i = 0; i < 9; i++) {
    const z = -0.2 + i * 0.07;
    const dz = z - 0.08;
    const f = Math.sqrt(1 - (dz / 0.3) ** 2);
    if (f < 0.3) continue;
    const pts: number[][] = [];
    for (let k = 0; k <= 16; k++) {
      const t = (-0.15 + (1.3 * k) / 16) * Math.PI;
      pts.push([0.186 * f * Math.cos(t), 0.27 + 0.166 * f * Math.sin(t), z]);
    }
    b.sweep(pts, 0.011, { color: BAND });
  }

  // ---- Neck and head -------------------------------------------------------
  b.sweep(
    [
      [0, 0.3, 0.26],
      [0, 0.34, 0.4],
    ],
    0.085,
    { color: SHELL },
  );

  b.part(ellipsoid(0.11, 0.1, 0.12), SHELL, { at: [0, 0.36, 0.46], bone: head });

  // Shield plate over the head.
  b.part(ellipsoid(0.12, 0.04, 0.11, 14), BAND, { at: [0, 0.42, 0.45], bone: head });

  // Tapered snout, narrow end forward.
  b.part(new THREE.CylinderGeometry(0.035, 0.06, 0.14, 10), SHELL, {
    at: [0, 0.33, 0.55],
    aim: [0, 0, 1],
    bone: head,
  });

  // Nose.
  b.part(new THREE.SphereGeometry(0.025, 8, 6), DARK, { at: [0, 0.335, 0.635], bone: head });

  // Eyes.
  for (const side of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.013, 8, 6), DARK, {
      at: [side * 0.065, 0.39, 0.53],
      bone: head,
    });
  }

  // Ears.
  for (const side of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.025, 0.06, 8), EAR, {
      at: [side * 0.07, 0.44, 0.42],
      aim: [side * 0.2, 1, -0.3],
      bone: head,
    });
  }

  // Lower jaw.
  b.part(new THREE.BoxGeometry(0.08, 0.02, 0.1), BELLY, { at: [0, 0.3, 0.53], bone: jaw });

  // ---- Legs ----------------------------------------------------------------
  function leg(side: number, z: number, front: boolean) {
    const s = side > 0 ? "L" : "R";
    const pre = front ? "front" : "hind";
    const x = side * 0.12;
    const kx = x + side * 0.012;

    const hip = b.joint(`${pre}Hip${s}`, { at: [x, 0.26, z], parent: pelvis });
    const knee = b.joint(`${pre}Knee${s}`, { at: [kx, 0.14, z + 0.02], parent: hip });
    const ankle = b.joint(`${pre}Ankle${s}`, { at: [kx, 0.04, z + 0.04], parent: knee });

    b.sweep(
      [
        [x, 0.26, z],
        [kx, 0.14, z + 0.02],
      ],
      0.045,
      { color: SHELL },
    );
    b.sweep(
      [
        [kx, 0.14, z + 0.02],
        [kx, 0.045, z + 0.04],
      ],
      0.035,
      { color: SHELL },
    );

    // Foot.
    b.part(new THREE.BoxGeometry(0.1, 0.035, 0.13), SHELL, {
      at: [kx, 0.024, z + 0.07],
      bone: ankle,
    });

    // Three claws per foot, angled forward and down.
    for (const dx of [-0.03, 0, 0.03]) {
      b.part(new THREE.ConeGeometry(0.011, 0.045, 6), CLAW, {
        at: [kx + dx, 0.02, z + 0.135],
        aim: [0, -0.35, 1],
        bone: ankle,
      });
    }
  }

  leg(1, 0.2, true);
  leg(-1, 0.2, true);
  leg(1, -0.12, false);
  leg(-1, -0.12, false);

  // ---- Tail ----------------------------------------------------------------
  b.sweep(
    [
      [0, 0.27, -0.2],
      [0, 0.25, -0.32],
      [0, 0.22, -0.45],
      [0, 0.2, -0.56],
    ],
    0.035,
    { color: SHELL },
  );
  // Tail tip.
  b.part(new THREE.SphereGeometry(0.03, 8, 6), BAND, { at: [0, 0.2, -0.57], bone: tail2 });

  return b.root;
}
```