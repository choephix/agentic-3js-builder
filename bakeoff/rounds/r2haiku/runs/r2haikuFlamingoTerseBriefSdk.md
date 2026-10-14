I've built a standing greater flamingo in a stylised, blocky style: an S-curved neck, long bent legs, a two-part bill that can open, and folded wings. The palette is pink with black flight feathers and bill tip. I haven't run this against the SDK, so a few call signatures are inferred from the reference (the joint `parent` option, the `radius` argument to `sweep`, and the `aim` behaviour of `part`).

```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "flamingo",
  description: "Standing greater flamingo in stylised primitive form, rest pose with folded wings and a hinged bill.",
};

const PINK = "#f4a3bb";
const DEEP = "#e8577d";
const COVERT = "#f08aa8";
const LEG = "#e96f93";
const BLACK = "#1c1a1f";
const BILL = "#f2c7d3";
const EYE_WHITE = "#fff4e0";

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "flamingo" });
  const r = rng(11);

  // ---- Skeleton -----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.74, 0] });

  // Body: a teardrop, tail low at the back, breast raised at the front.
  const body = b.chain("body", [
    [0, 0.72, -0.2],
    [0, 0.8, -0.02],
    [0, 0.88, 0.12],
  ]);
  b.sweep(body, 0.14, { color: PINK });

  // Neck: a deep S-curve, thick at the base.
  const neck = b.chain("neck", [
    [0, 0.9, 0.12],
    [0, 1.06, 0.22],
    [0, 1.22, 0.14],
    [0, 1.32, 0.16],
  ]);
  b.sweep(neck, 0.05, { color: PINK });

  // Head and jaw joints.
  const head = b.joint("head", { at: [0, 1.36, 0.16], parent: hips });
  const jaw = b.joint("jaw", { at: [0, 1.33, 0.2], parent: head });

  // Head mass.
  b.part(new THREE.SphereGeometry(0.065, 12, 9), PINK, { at: [0, 1.37, 0.16], bone: head });

  // Upper bill: pale base, black hooked tip.
  b.part(new THREE.CylinderGeometry(0.02, 0.03, 0.14, 6), BILL, {
    at: [0, 1.33, 0.29],
    aim: [0, 1.25, 0.36],
    bone: head,
  });
  b.part(new THREE.CylinderGeometry(0.026, 0.02, 0.07, 6), BLACK, {
    at: [0, 1.25, 0.36],
    aim: [0, 1.22, 0.4],
    bone: head,
  });

  // Lower jaw, hinged, black-tipped.
  b.part(new THREE.CylinderGeometry(0.018, 0.026, 0.14, 6), BILL, {
    at: [0, 1.3, 0.27],
    aim: [0, 1.22, 0.33],
    bone: jaw,
  });
  b.part(new THREE.CylinderGeometry(0.02, 0.024, 0.06, 6), BLACK, {
    at: [0, 1.22, 0.33],
    aim: [0, 1.2, 0.36],
    bone: jaw,
  });

  // Eyes: white sockets with dark pupils.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.018, 8, 6), EYE_WHITE, {
      at: [s * 0.05, 1.38, 0.19],
      bone: head,
    });
    b.part(new THREE.SphereGeometry(0.009, 6, 5), BLACK, {
      at: [s * 0.058, 1.38, 0.195],
      bone: head,
    });
  }

  // ---- Legs ---------------------------------------------------------------
  for (const s of [1, -1]) {
    const x = s * 0.09;
    const leg = b.chain(s > 0 ? "legL" : "legR", [
      [x, 0.76, 0],
      [x, 0.42, -0.05],
      [x, 0.03, 0.03],
    ]);
    b.sweep(leg, 0.018, { color: LEG });

    // Webbed foot: a flat blade pointing forward.
    b.part(new THREE.BoxGeometry(0.05, 0.012, 0.12), LEG, {
      at: [x, 0.008, 0.07],
    });
    // Toe stubs.
    for (const t of [-0.02, 0.0, 0.02]) {
      b.part(new THREE.BoxGeometry(0.012, 0.012, 0.03), LEG, {
        at: [x + t, 0.008, 0.14],
      });
    }
  }

  // ---- Wings (folded along the flanks) -------------------------------------
  for (const s of [1, -1]) {
    const x = s * 0.15;
    // Pink coverts, layered.
    b.part(new THREE.BoxGeometry(0.03, 0.12, 0.28), COVERT, { at: [x, 0.82, -0.08] });
    b.part(new THREE.BoxGeometry(0.02, 0.09, 0.2), DEEP, {
      at: [x + s * 0.005, 0.8, -0.18],
    });
    // Black flight feathers at the tip.
    for (let i = 0; i < 3; i++) {
      const jitter = 0.9 + r() * 0.2;
      b.part(new THREE.BoxGeometry(0.018, 0.02, 0.14 * jitter), BLACK, {
        at: [x - s * 0.002, 0.78 - i * 0.01, -0.3 - i * 0.02],
      });
    }
  }

  // Short tail plume.
  b.part(new THREE.BoxGeometry(0.05, 0.05, 0.1), COVERT, { at: [0, 0.76, -0.27], bone: hips });

  return b.root;
}
```