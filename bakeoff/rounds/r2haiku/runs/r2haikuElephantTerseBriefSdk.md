```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "elephant",
  description:
    "A standing African bush elephant in a blocky, primitive-built rest pose: barrel body, column legs, fan ears, ivory tusks and a curling trunk.",
};

const GREY = "#858892";
const DARK = "#6c6f78";
const EAR = "#9a9ca6";
const PINK = "#d39c9c";
const IVORY = "#efe5cc";
const EYE = "#1d1d22";

// A flat fan-shaped ear outline, extruded to a thin plate and turned to lie in the YZ plane.
function earGeometry(rx: number, ry: number, depth: number, side: number) {
  const shape = new THREE.Shape();
  shape.absellipse(0, 0, rx, ry, 0, Math.PI * 2, false, 0);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
    curveSegments: 10,
  });
  geo.rotateY(side > 0 ? Math.PI / 2 : -Math.PI / 2);
  return geo;
}

export default function build() {
  const b = createBuilder({ name: "elephant" });

  // ---- Skeleton -----------------------------------------------------------
  const pelvis = b.joint("pelvis", { at: [0, 2.3, -1.4] });
  const neck = b.joint("neck", { at: [0, 2.6, 1.6], parent: pelvis });
  const head = b.joint("head", { at: [0, 2.85, 2.2], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 2.35, 2.5], parent: head });

  // Four column legs: hip -> knee -> ankle, each a named joint chain.
  const legs = [
    { n: "FL", x: 0.5, z: 1.15 },
    { n: "FR", x: -0.5, z: 1.15 },
    { n: "BL", x: 0.5, z: -1.0 },
    { n: "BR", x: -0.5, z: -1.0 },
  ].map(({ n, x, z }) => {
    const hip = b.joint(`hip${n}`, { at: [x, 2.2, z], parent: pelvis });
    const knee = b.joint(`knee${n}`, { at: [x, 1.2, z], parent: hip });
    const ankle = b.joint(`ankle${n}`, { at: [x, 0.4, z + 0.03], parent: knee });
    return { x, z, hip, knee, ankle };
  });

  // ---- Body ---------------------------------------------------------------
  // Barrel torso: one stretched sphere, the simplest read for an elephant.
  b.part(new THREE.SphereGeometry(1, 18, 12), GREY, {
    at: [0, 2.3, 0.1],
    bone: pelvis,
    scale: [0.82, 0.78, 1.55],
  });

  // Legs: tapered columns with flat padded feet and toenails.
  for (const { x, z, hip, knee, ankle } of legs) {
    b.part(new THREE.CylinderGeometry(0.3, 0.24, 1.0, 10), DARK, {
      at: [x, 1.7, z],
      bone: hip,
    });
    b.part(new THREE.CylinderGeometry(0.24, 0.17, 0.8, 10), DARK, {
      at: [x, 0.8, z],
      bone: knee,
    });
    b.part(new THREE.CylinderGeometry(0.3, 0.34, 0.3, 12), DARK, {
      at: [x, 0.15, z + 0.04],
      bone: ankle,
    });
    for (const d of [-0.15, 0, 0.15]) {
      b.part(new THREE.SphereGeometry(0.05, 6, 5), IVORY, {
        at: [x + d, 0.06, z + 0.36],
        bone: ankle,
      });
    }
  }

  // ---- Head ---------------------------------------------------------------
  b.part(new THREE.SphereGeometry(1, 16, 12), GREY, {
    at: [0, 2.8, 2.2],
    bone: head,
    scale: [0.62, 0.66, 0.72],
  });
  // Domed brow gives the head its characteristic silhouette.
  b.part(new THREE.SphereGeometry(1, 12, 9), GREY, {
    at: [0, 3.05, 2.0],
    bone: head,
    scale: [0.5, 0.4, 0.5],
  });
  // Lower jaw, a separate piece so it can open.
  b.part(new THREE.SphereGeometry(1, 10, 7), DARK, {
    at: [0, 2.3, 2.6],
    bone: jaw,
    scale: [0.4, 0.12, 0.5],
  });

  for (const s of [1, -1]) {
    // Eyes: small and dark, set into the front of the head.
    b.part(new THREE.SphereGeometry(0.055, 8, 6), EYE, {
      at: [s * 0.5, 2.9, 2.62],
      bone: head,
    });

    // Ears: a grey fan plate with a pink inner face.
    b.part(earGeometry(0.55, 0.62, 0.05, s), EAR, {
      at: [s * 0.6, 2.85, 2.0],
      bone: head,
    });
    b.part(earGeometry(0.42, 0.48, 0.02, s), PINK, {
      at: [s * 0.65, 2.85, 2.0],
      bone: head,
    });

    // Tusks: long ivory cones, sloping forward and slightly down and out.
    const tusk = new THREE.CylinderGeometry(0.02, 0.07, 1.1, 10);
    tusk.rotateX(Math.PI / 2 + 0.3);
    tusk.rotateY(s * 0.15);
    b.part(tusk, IVORY, {
      at: [s * 0.2, 2.26, 3.42],
      bone: head,
    });
  }

  // ---- Trunk --------------------------------------------------------------
  // Four tapering runs that curl down and up at the tip.
  b.sweep(
    [
      [0, 2.45, 2.9],
      [0, 1.95, 3.1],
      [0, 1.5, 3.22],
    ],
    0.24,
    { color: GREY },
  );
  b.sweep(
    [
      [0, 1.5, 3.22],
      [0, 1.0, 3.25],
    ],
    0.18,
    { color: GREY },
  );
  b.sweep(
    [
      [0, 1.0, 3.25],
      [0, 0.65, 3.3],
    ],
    0.14,
    { color: GREY },
  );
  b.sweep(
    [
      [0, 0.65, 3.3],
      [0.05, 0.4, 3.35],
      [0.1, 0.3, 3.5],
    ],
    0.11,
    { color: GREY },
  );

  // ---- Tail ---------------------------------------------------------------
  b.sweep(
    [
      [0, 2.3, -1.55],
      [0, 2.0, -1.95],
      [0, 1.5, -2.15],
      [0, 1.0, -2.2],
    ],
    0.05,
    { color: DARK },
  );
  b.part(new THREE.SphereGeometry(0.1, 8, 6), DARK, {
    at: [0, 0.95, -2.2],
    bone: pelvis,
  });

  return b.root;
}
```