import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { catmull } from "../../../../src/index";

// Palette
const BODY = "#f7a8c4"; // candy pink body
const COVERT = "#f2876f"; // coral wing coverts
const COVERT_DEEP = "#e8604f"; // deeper coral near the wing edge
const FLIGHT = "#141216"; // black flight feathers
const BEAK = "#f9cdd9"; // pale pink beak
const BEAK_TIP = "#15131a"; // black beak tip
const LEG = "#e0587e"; // rose legs
const EYE = "#f3e88f"; // pale yellow iris
const PUPIL = "#1a1417";

export const meta = {
  name: "flamingo",
  description: "A standing flamingo in shallow water, with an S-curved neck, bent bicoloured beak and coral-to-black wings.",
};

export default function build() {
  const b = createBuilder({ name: "flamingo" });
  const rand = rng(7);

  // Rod helper: a tapered cylinder from a to c, built along Z and aimed at c.
  const seg = (
    a: number[],
    c: number[],
    rA: number,
    rB: number,
    color: string,
    bone?: any,
  ) => {
    const A = new THREE.Vector3(a[0], a[1], a[2]);
    const C = new THREE.Vector3(c[0], c[1], c[2]);
    const len = A.distanceTo(C);
    const geo = new THREE.CylinderGeometry(rA, rB, len, 6, 1);
    geo.rotateX(Math.PI / 2);
    const m = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
    const opts: any = { at: m, aim: c };
    if (bone) opts.bone = bone;
    b.part(geo, color, opts);
  };

  // ---------- Skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.75, 0] });
  const spine = b.joint("spine", { at: [0, 0.92, 0.0], parent: hips });

  const hipL = b.joint("hipL", { at: [0.08, 0.75, 0.0], parent: hips });
  const kneeL = b.joint("kneeL", { at: [0.09, 0.4, 0.02], parent: hipL });
  const ankleL = b.joint("ankleL", { at: [0.09, 0.05, -0.02], parent: kneeL });
  const hipR = b.joint("hipR", { at: [-0.08, 0.75, 0.0], parent: hips });
  const kneeR = b.joint("kneeR", { at: [-0.09, 0.4, 0.02], parent: hipR });
  const ankleR = b.joint("ankleR", { at: [-0.09, 0.05, -0.02], parent: kneeR });

  // S-curved neck: base forward, bulge back, top forward again.
  const neckPath = catmull([
    [0, 1.02, 0.12],
    [0, 1.2, 0.24],
    [0, 1.36, 0.14],
    [0, 1.48, 0.2],
    [0, 1.54, 0.26],
  ]);
  const neck = b.chain("neck", neckPath, { role: "neck", parent: spine });
  b.sweep(neckPath, 0.036, { color: BODY });

  // ---------- Body ----------
  b.part(new THREE.SphereGeometry(1, 14, 10), BODY, {
    at: [0, 0.92, -0.02],
    scale: [0.17, 0.15, 0.3],
    bone: spine,
  });
  // Tail plume, pale and soft
  b.part(new THREE.SphereGeometry(1, 10, 8), COVERT, {
    at: [0, 0.94, -0.33],
    scale: [0.12, 0.08, 0.1],
    bone: spine,
  });
  // Breast blush, slightly deeper pink
  b.part(new THREE.SphereGeometry(1, 10, 8), "#f48fb2", {
    at: [0, 0.9, 0.12],
    scale: [0.12, 0.12, 0.1],
    bone: spine,
  });

  // ---------- Head ----------
  const headGeo = new THREE.SphereGeometry(0.068, 14, 10);
  b.part(headGeo, BODY, { at: [0, 1.55, 0.23], scale: [0.9, 1.0, 1.05] });

  // Eyes: pale yellow with a dark pupil, on both sides of the head
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.018, 10, 8), EYE, {
      at: [0.052 * s, 1.56, 0.25],
    });
    b.part(new THREE.SphereGeometry(0.009, 8, 6), PUPIL, {
      at: [0.06 * s, 1.56, 0.265],
    });
  }

  // Bent beak: pale pink upper and lower mandibles, black tips.
  // Upper mandible drops down and hooks.
  seg([0, 1.56, 0.29], [0, 1.47, 0.39], 0.022, 0.017, BEAK);
  seg([0, 1.47, 0.39], [0, 1.41, 0.43], 0.017, 0.012, BEAK_TIP);
  // Lower mandible, a little shorter and angled.
  seg([0, 1.52, 0.28], [0, 1.43, 0.36], 0.016, 0.013, BEAK);
  seg([0, 1.43, 0.36], [0, 1.39, 0.4], 0.013, 0.01, BEAK_TIP);

  // ---------- Wings ----------
  // Coral coverts over the wing, with a shape outline in the side plane.
  const coverts = [
    [0, 0.1],
    [0.25, 0.13],
    [0.45, 0.1],
    [0.5, 0.0],
    [0.35, -0.06],
    [0.1, -0.1],
    [-0.05, -0.02],
  ];
  // Flight feathers: black tips at the rear of the wing.
  const flight = [
    [0.36, 0.07],
    [0.62, 0.04],
    [0.72, -0.03],
    [0.6, -0.05],
    [0.36, -0.05],
  ];
  // Inner deeper coral band along the trailing edge.
  const deep = [
    [0.12, -0.06],
    [0.34, -0.06],
    [0.46, -0.02],
    [0.3, -0.1],
    [0.1, -0.1],
  ];

  for (const s of [1, -1]) {
    const x = 0.13 * s;
    b.extrude(coverts, { at: [x, 0.98, 0.1], x: [0, 0, -1], y: [0, 1, 0], depth: 0.025 } as any);
    b.extrude(deep, { at: [x + 0.002 * s, 0.98, 0.1], x: [0, 0, -1], y: [0, 1, 0], depth: 0.026 } as any);
    b.extrude(flight, { at: [x + 0.004 * s, 0.98, 0.1], x: [0, 0, -1], y: [0, 1, 0], depth: 0.028 } as any);
  }

  // ---------- Legs ----------
  const legs: Array<[any, any, any, any, number]> = [
    [hipL, kneeL, ankleL, [0.08, 0.75, 0.0], 1],
    [hipR, kneeR, ankleR, [-0.08, 0.75, 0.0], -1],
  ];
  for (const [hip, knee, ankle, hipPos, s] of legs) {
    const kneePos = s > 0 ? [0.09, 0.4, 0.02] : [-0.09, 0.4, 0.02];
    const anklePos = s > 0 ? [0.09, 0.05, -0.02] : [-0.09, 0.05, -0.02];

    // Thigh and shin, long and slender
    seg(hipPos, kneePos, 0.02, 0.016, LEG, hip);
    seg(kneePos, anklePos, 0.014, 0.011, LEG, knee);

    // Knobbly knee
    b.part(new THREE.SphereGeometry(0.022, 8, 6), LEG, {
      at: kneePos,
      scale: [1, 1, 1.1],
      bone: knee,
    });

    // Webbed foot: flattened pad and three toes fanning forward
    const fx = anklePos[0];
    b.part(new THREE.SphereGeometry(1, 10, 6), LEG, {
      at: [fx, 0.018, anklePos[2] + 0.05],
      scale: [0.075, 0.012, 0.065],
      bone: ankle,
    });
    for (const t of [-1, 0, 1]) {
      seg(
        [fx, 0.02, anklePos[2] + 0.01],
        [fx + t * 0.045, 0.012, anklePos[2] + 0.1],
        0.007,
        0.005,
        LEG,
        ankle,
      );
    }
    // Hind toe
    seg([fx, 0.02, anklePos[2] - 0.01], [fx, 0.012, anklePos[2] - 0.04], 0.006, 0.004, LEG, ankle);
  }

  // Keep the rng used so the build is deterministic and seeded.
  void rand();

  return b.root;
}
