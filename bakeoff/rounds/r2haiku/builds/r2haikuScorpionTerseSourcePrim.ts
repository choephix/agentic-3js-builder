import * as THREE from "three";
import { createBuilder, catmull, gradient, mottle, polyline, stripes } from "../../../../src/index";

export const meta = {
  name: "Scorpion",
  description: "A stylised desert scorpion: domed prosoma, banded mesosoma, raised legs, pedipalp pincers and a curled, stinger-tipped tail.",
};

const SIDES = [
  [1, "L"],
  [-1, "R"],
] as const;

export default function scorpion() {
  const b = createBuilder({ name: "scorpion", detail: 1, paintSize: 1024 });

  // Paints: a mottled carapace, banded segments, striped legs, a dark pincer and a graded tail.
  const shell = mottle("#6b4424", "#8f6234", { size: 0.03, seed: 3 });
  const bands = stripes("#8f6234", "#2e1a0c", { size: 0.014, width: 0.4, seed: 5 });
  const legPaint = stripes("#6b4424", "#2a160a", { size: 0.02, width: 0.3, axis: "y", seed: 9 });
  const claw = mottle("#7a4a26", "#4a2a14", { size: 0.02, seed: 11 });
  const tail = gradient("#9a6a33", "#4a2a12", [0, 0.06, -0.1], [0, 0.23, -0.07]);
  const stinger = "#7a2410";
  const eye = "#0a0a0a";

  // Root bone: the body, facing forward.
  const body = b.joint("body", { at: [0, 0.05, 0], dir: [0, 0, 1] });

  // Prosoma: the domed front shield.
  b.part(new THREE.SphereGeometry(1, 16, 12), shell, {
    at: [0, 0.052, 0.04],
    scale: [0.042, 0.03, 0.05],
    bone: body,
    name: "prosoma",
  });

  // Mesosoma: the segmented middle, tapering back toward the tail.
  b.sweep(
    catmull([
      [0, 0.052, 0.0],
      [0, 0.05, -0.05],
      [0, 0.047, -0.1],
    ]),
    {
      radius: (t) => [0.03 - 0.008 * t, 0.026 - 0.008 * t],
      color: bands,
      sides: 10,
      bone: body,
      name: "mesosoma",
    },
  );

  // Median and lateral eyes.
  const eyeGeo = new THREE.SphereGeometry(1, 8, 6);
  for (const x of [-0.01, 0.01]) {
    b.part(eyeGeo, eye, { at: [x, 0.078, 0.065], scale: 0.009, bone: body, name: "eyeMedian" });
  }
  for (const sd of [1, -1]) {
    b.part(eyeGeo, eye, { at: [sd * 0.03, 0.074, 0.05], scale: 0.006, bone: body, name: "eyeLateral" });
  }

  // Tail: a curled metasoma with five joints, the last one the telson.
  const tailChain = b.chain(
    "tail",
    catmull([
      [0, 0.06, -0.1],
      [0, 0.095, -0.155],
      [0, 0.16, -0.175],
      [0, 0.215, -0.14],
      [0, 0.235, -0.07],
    ]),
    { parent: body, role: "tail", names: ["tail1", "tail2", "tail3", "tail4", "telson"] },
  );
  b.sweep(tailChain, {
    radius: (t) => 0.02 - 0.011 * t,
    color: tail,
    sides: 8,
    name: "tail",
  });

  // Stinger: a cone off the telson, pointing along its tip.
  const tip = tailChain.at(1);
  b.spike(tip, tip.tangent, 0.035, 0.009, { color: stinger, sides: 8, name: "stinger" });

  // Legs: four pairs, splayed and raised at the knee, each ending on the floor.
  const legZ = [0.05, 0.015, -0.02, -0.055];
  for (const [sd, S] of SIDES) {
    legZ.forEach((z, i) => {
      const n = i + 1;
      const chain = b.chain(
        `leg${S}${n}`,
        polyline([
          [sd * 0.035, 0.05, z],
          [sd * 0.09, 0.08, z + 0.01],
          [sd * 0.12, 0.03, z - 0.01],
          [sd * 0.14, 0.004, z - 0.03],
        ]),
        {
          parent: body,
          role: "leg",
          names: [`hip${S}${n}`, `knee${S}${n}`, `ankle${S}${n}`, `foot${S}${n}`],
        },
      );
      b.sweep(chain, {
        radius: (t) => 0.0055 - 0.0025 * t,
        color: legPaint,
        sides: 6,
        name: `leg${S}${n}`,
      });
    });
  }

  // Pedipalps: jointed arms ending in a pincer.
  for (const [sd, S] of SIDES) {
    const arm = b.chain(
      `arm${S}`,
      polyline([
        [sd * 0.03, 0.06, 0.07],
        [sd * 0.068, 0.062, 0.115],
        [sd * 0.075, 0.05, 0.165],
        [sd * 0.068, 0.046, 0.2],
      ]),
      { parent: body, role: "arm", names: [`upperArm${S}`, `foreArm${S}`, `wrist${S}`, `hand${S}`] },
    );
    b.sweep(arm, {
      radius: (t) => 0.011 - 0.004 * t,
      color: claw,
      sides: 8,
      name: `arm${S}`,
    });

    const hand = arm.joints[3];
    const hx = sd * 0.068;
    const hy = 0.046;
    const hz = 0.2;
    b.part(new THREE.SphereGeometry(1, 12, 8), claw, {
      at: [hx, hy, hz],
      scale: [0.016, 0.014, 0.02],
      bone: hand,
      name: `palm${S}`,
    });
    // Fixed finger and movable finger, both forward, slightly apart.
    b.capsule(
      [hx + sd * 0.012, hy, hz + 0.01],
      [hx + sd * 0.016, hy - 0.002, hz + 0.06],
      [0.0075, 0.003],
      { color: claw, sides: 6, bone: hand, name: `fingerFixed${S}` },
    );
    b.capsule(
      [hx - sd * 0.01, hy, hz + 0.01],
      [hx - sd * 0.004, hy - 0.002, hz + 0.055],
      [0.0065, 0.0025],
      { color: claw, sides: 6, bone: hand, name: `fingerMoving${S}` },
    );
  }

  return b.root;
}
