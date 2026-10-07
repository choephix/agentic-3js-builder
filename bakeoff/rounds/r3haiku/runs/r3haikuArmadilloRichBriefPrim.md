```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Nine-banded armadillo",
  description:
    "A trotting nine-banded armadillo: overlapping banded shell, pointed snout, tall ears, beady eyes, clawed feet, tapering armoured tail and a sprinkle of pale hairs.",
};

const BODY = "#c9a48e";
const BAND_A = "#b48f7c";
const BAND_B = "#9f7762";
const HEAD = "#bd9a86";
const EAR = "#a97f6c";
const PALE = "#efe6da";
const DARK = "#1f1816";
const CLAW = "#3d2f2b";

export default function build() {
  const b = createBuilder({ name: "nine-banded armadillo" });
  const r = rng(7);

  // ---- Skeleton -----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.2, -0.14] });
  const spine = b.joint("spine", { at: [0, 0.21, 0.02], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.22, 0.18], parent: spine });
  const head = b.joint("head", { at: [0, 0.2, 0.27], parent: neck });

  // Tapering armoured tail as one chain off the hips.
  const tailPts = [
    [0, 0.19, -0.12],
    [0, 0.18, -0.25],
    [0, 0.165, -0.38],
    [0, 0.15, -0.5],
    [0, 0.135, -0.6],
  ];
  const tail = b.chain("tail", tailPts, { role: "tail", parent: hips });

  // ---- Body and nine-banded shell ----------------------------------------
  b.part(new THREE.SphereGeometry(1, 14, 10), BODY, {
    at: [0, 0.2, 0.02],
    bone: spine,
    scale: [0.16, 0.11, 0.2],
  });

  for (let i = 0; i < 9; i++) {
    const z = -0.16 + i * 0.043;
    b.part(new THREE.SphereGeometry(1, 14, 6), i % 2 ? BAND_B : BAND_A, {
      at: [0, 0.2, z],
      bone: spine,
      scale: [0.165, 0.1, 0.03],
    });
  }

  // Pale head shield, snout and nose.
  b.part(new THREE.SphereGeometry(1, 12, 8), HEAD, {
    at: [0, 0.21, 0.3],
    bone: head,
    scale: [0.075, 0.07, 0.08],
  });
  b.part(new THREE.ConeGeometry(0.04, 0.13, 8), HEAD, {
    at: [0, 0.2, 0.38],
    bone: head,
    dir: [0, 0, 1],
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), CLAW, {
    at: [0, 0.2, 0.445],
    bone: head,
    scale: [0.012, 0.012, 0.012],
  });

  // Tall leathery ears.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 10, 8), EAR, {
      at: [s * 0.055, 0.29, 0.28],
      bone: head,
      scale: [0.022, 0.065, 0.03],
    });
  }

  // Small beady eyes.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), DARK, {
      at: [s * 0.052, 0.235, 0.345],
      bone: head,
      scale: [0.011, 0.011, 0.011],
    });
  }

  // ---- Legs ---------------------------------------------------------------
  function seg(a: number[], c: number[], radius: number, bone: any) {
    const d = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const len = Math.hypot(d[0], d[1], d[2]);
    const m = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
    const u = [d[0] / len, d[1] / len, d[2] / len];
    b.part(new THREE.CylinderGeometry(radius, radius, len, 7), BAND_A, {
      at: m,
      bone,
      dir: u,
    });
  }

  function leg(tag: string, parent: any, p0: number[], p1: number[], p2: number[]) {
    const up = b.joint(`up${tag}`, { at: p0, parent });
    const lo = b.joint(`lo${tag}`, { at: p1, parent: up });
    const ft = b.joint(`ft${tag}`, { at: p2, parent: lo });
    seg(p0, p1, 0.03, up);
    seg(p1, p2, 0.022, lo);

    // Sturdy foot with two forward claws.
    b.part(new THREE.SphereGeometry(1, 8, 6), BAND_A, {
      at: [p2[0], p2[1] + 0.008, p2[2] + 0.012],
      bone: ft,
      scale: [0.028, 0.016, 0.038],
    });
    for (const dx of [-0.012, 0.012]) {
      b.part(new THREE.ConeGeometry(0.007, 0.035, 6), CLAW, {
        at: [p2[0] + dx, p2[1] + 0.006, p2[2] + 0.04],
        bone: ft,
        dir: [0, -0.25, 1],
      });
    }
    return ft;
  }

  // Trotting stance: diagonal pairs swung forward and back.
  leg("FL", spine, [0.1, 0.2, 0.12], [0.1, 0.11, 0.13], [0.1, 0.025, 0.16]);
  leg("FR", spine, [-0.1, 0.2, 0.12], [-0.1, 0.11, 0.1], [-0.1, 0.025, 0.08]);
  leg("BL", hips, [0.1, 0.2, -0.12], [0.1, 0.11, -0.08], [0.1, 0.025, -0.1]);
  leg("BR", hips, [-0.1, 0.2, -0.12], [-0.1, 0.11, -0.16], [-0.1, 0.025, -0.18]);

  // ---- Tail banding -------------------------------------------------------
  for (let i = 0; i < 9; i++) {
    const t = 0.05 + i * 0.1;
    const rad = 0.04 * (1 - t) + 0.01;
    b.part(new THREE.CylinderGeometry(rad * 0.92, rad, 0.035, 8), i % 2 ? BAND_B : BODY, {
      frame: tail.at(t),
    });
  }
  b.part(new THREE.ConeGeometry(0.012, 0.06, 6), BAND_B, {
    at: [0, 0.133, -0.63],
    dir: [0, -0.1, -1],
  });

  // ---- Coarse pale hairs poking between the bands -------------------------
  for (let i = 0; i < 18; i++) {
    const x = (r() - 0.5) * 0.24;
    const z = -0.16 + r() * 0.36;
    const y = 0.2 + 0.11 * Math.sqrt(Math.max(0, 1 - (x / 0.16) ** 2));
    b.part(new THREE.ConeGeometry(0.0045, 0.04, 5), PALE, {
      at: [x, y + 0.012, z],
      bone: spine,
      dir: [x * 1.5, 1, r() * 0.4 - 0.2],
    });
  }

  return b.root;
}
```