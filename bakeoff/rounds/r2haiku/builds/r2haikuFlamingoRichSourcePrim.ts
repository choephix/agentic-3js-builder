import * as THREE from "three";
import { catmull, createBuilder, gradient, polyline } from "../../../../src/index";

export const meta = {
  name: "Flamingo",
  description: "A candy-pink flamingo standing tall in shallow water, with coral wings, black flight tips, an S-neck and a bent two-tone beak.",
};

const CANDY = "#ffb3c7";
const NECK = "#ffa3bb";
const ROSE = "#e0708f";
const BEAK = "#ffd1dc";
const BLACK = "#161616";
const EYE = "#f5e46b";
const HEAD = "#ffbdd0";
const WATER = "#9adfee";

export default function flamingo() {
  const b = createBuilder({ name: "flamingo", detail: 1, paintSize: 1024 });

  // Body colour: candy pink underneath, deepening toward the back.
  const bodyPaint = gradient(CANDY, "#ff8ca2", [0, 0.7, 0], [0, 0.98, -0.05]);
  // Wings: candy pink at the shoulder, coral toward the tips.
  const wingPaint = gradient("#ff9fb8", "#ff5f4f", [0, 0.9, 0.12], [0, 0.85, -0.35]);

  // Shallow water pad the legs stand in (its underside sits just under the floor).
  b.part(new THREE.CylinderGeometry(0.42, 0.42, 0.016, b.segments(20)), WATER, {
    at: [0, -0.008, 0],
    bone: "pelvis",
    name: "water",
  });

  // Spine root: the body hangs from here.
  b.joint("pelvis", { at: [0, 0.82, 0], role: "spine" });

  // Body: a teardrop from a stretched sphere.
  b.part(new THREE.SphereGeometry(0.16, b.segments(14), b.segments(10)), bodyPaint, {
    at: [0, 0.82, 0],
    bone: "pelvis",
    scale: [0.9, 0.85, 1.35],
    name: "body",
  });

  // Tail stub.
  b.part(new THREE.SphereGeometry(0.07, b.segments(10), b.segments(8)), "#ff7a6b", {
    at: [0, 0.84, -0.2],
    bone: "pelvis",
    scale: [0.8, 0.5, 1],
    name: "tail",
  });

  // S-curved neck: a smooth spline of four bones, skinned as one tube.
  const neckPoints = [
    [0, 0.9, 0.08],
    [0, 1.0, 0.2],
    [0, 1.1, 0.2],
    [0, 1.17, 0.1],
    [0, 1.26, 0.12],
  ];
  const neck = b.chain("neck", catmull(neckPoints), { parent: "pelvis", role: "neck" });
  b.sweep(neck, (t) => 0.036 - 0.01 * Math.sin(Math.PI * t), { color: NECK, sides: 8, name: "neck" });

  // Head and eyes.
  b.joint("head", { parent: "neck4", at: [0, 1.28, 0.14], role: "head" });
  b.part(new THREE.SphereGeometry(0.05, b.segments(12), b.segments(10)), HEAD, {
    at: [0, 1.28, 0.14],
    bone: "head",
    scale: [1, 0.95, 1.1],
    name: "head",
  });

  // Bent beak: pale pink, black hooked tip, a hinged lower mandible.
  b.joint("jaw", { parent: "head", at: [0, 1.26, 0.18], dir: [0, -0.3, 1], role: "jaw" });
  b.capsule([0, 1.27, 0.17], [0, 1.245, 0.26], [0.02, 0.015], { color: BEAK, bone: "head", name: "beakUpper" });
  b.capsule([0, 1.245, 0.26], [0, 1.195, 0.31], [0.015, 0.009], { color: BLACK, bone: "head", name: "beakTip" });
  b.capsule([0, 1.255, 0.18], [0, 1.225, 0.25], [0.012, 0.009], { color: BEAK, bone: "jaw", name: "beakLower" });

  for (const side of [1, -1]) {
    const S = side > 0 ? "L" : "R";

    // Eyes: pale yellow with a black pupil on the outer face.
    b.part(new THREE.SphereGeometry(0.011, b.segments(8), b.segments(6)), EYE, {
      at: [side * 0.046, 1.29, 0.14],
      bone: "head",
      name: "eye" + S,
    });
    b.part(new THREE.SphereGeometry(0.0055, b.segments(6), b.segments(4)), BLACK, {
      at: [side * 0.055, 1.29, 0.15],
      bone: "head",
      name: "pupil" + S,
    });

    // Legs: thigh, shin and foot as one chain with a knobbly knee.
    const hip = [side * 0.07, 0.72, 0];
    const knee = [side * 0.09, 0.42, -0.05];
    const ankle = [side * 0.09, 0.14, 0.02];
    const toe = [side * 0.09, 0.006, 0.07];
    const leg = b.chain("leg" + S, polyline([hip, knee, ankle, toe]), {
      names: ["hip" + S, "knee" + S, "ankle" + S, "foot" + S],
      parent: "pelvis",
      role: "leg",
    });
    b.sweep(leg, (t) => 0.016 - 0.006 * t, { color: ROSE, sides: 6, name: "leg" + S });
    b.part(new THREE.SphereGeometry(0.022, b.segments(10), b.segments(8)), ROSE, {
      at: knee,
      bone: "knee" + S,
      name: "knee" + S,
    });

    // Webbed foot: a scalloped fan of three toes lying flat on the water.
    const fx = side * 0.09;
    const footOutline = [
      [0, -0.03],
      [-0.06, 0.04],
      [-0.03, 0.11],
      [0, 0.07],
      [0.03, 0.11],
      [0.06, 0.04],
    ].map(([dx, dz]) => [fx + side * dx, 0.006, dz]);
    b.slab(footOutline, { color: ROSE, thickness: 0.01, bone: "foot" + S, name: "foot" + S });

    // Wing: a flat coral sheet folded along the flank, with black flight feathers at the tip.
    b.joint("wing" + S, { parent: "pelvis", at: [side * 0.1, 0.9, 0.05], role: "wing" });
    const x = side * 0.15;
    const wingOutline = [
      [x, 0.92, 0.12],
      [x, 0.98, 0.02],
      [x, 0.96, -0.15],
      [x, 0.88, -0.44],
      [x, 0.82, -0.3],
      [x, 0.78, -0.1],
      [x, 0.8, 0.06],
    ];
    b.slab(wingOutline, { color: wingPaint, thickness: 0.03, bone: "wing" + S, name: "wing" + S });
    const flightTip = [
      [x, 0.915, -0.3],
      [x, 0.875, -0.44],
      [x, 0.835, -0.33],
    ];
    b.slab(flightTip, { color: BLACK, thickness: 0.036, bone: "wing" + S, name: "flight" + S });
  }

  return b.root;
}
