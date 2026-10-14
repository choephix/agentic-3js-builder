import * as THREE from "three";
import { createBuilder, mottle, rng, svg } from "../../../../src/index";

export const meta = {
  name: "Fruit bat",
  description:
    "A fluffy golden-brown fruit bat with a fox-like face, big dark eyes, a black nose, pointed ears and " +
    "charcoal wings spread wide, clutching a half-eaten fig in its feet.",
};

type V = [number, number, number];

export default function fruitBat() {
  const b = createBuilder({ name: "fruitBat", detail: 1, paintSize: 1024 });

  const fur = mottle("#d39c4c", "#8c5a24", { size: 0.04, seed: 2, contrast: 1.2 });
  const WING = "#2c2a31";
  const BONE = "#3b2d26";
  const EAR = "#b8772c";
  const LEG = "#4d3626";
  const EYE = "#1b120c";
  const CREAM = "#e9cf9a";

  // Skeleton: body, head, then each side's legs, arms, fingers and thumb anchors.
  b.joint("pelvis", { at: [0, 0.2, 0], dir: [0, 1, 0] });
  b.joint("spine", { parent: "pelvis", at: [0, 0.3, 0], dir: [0, 1, 0.05] });
  b.joint("neck", { parent: "spine", at: [0, 0.39, 0.01], dir: [0, 1, 0.25] });
  b.joint("head", { parent: "neck", at: [0, 0.45, 0.03], dir: [0, 1, 0.2], role: "head" });

  const tuft = svg(
    `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">` +
      `<path d="M20 60 Q0 34 20 0 Q40 34 20 60Z" fill="#e7a84f"/>` +
      `<path d="M20 56 Q9 36 20 14 Q31 36 20 56Z" fill="#b8742c"/></svg>`,
  );

  for (const s of [1, -1] as const) {
    const L = s > 0 ? "L" : "R";
    const X = (x: number) => x * s;
    const hip: V = [X(0.045), 0.2, 0];
    const knee: V = [X(0.05), 0.1, 0.035];
    const ankle: V = [X(0.045), 0.03, -0.005];
    const toe: V = [X(0.045), 0.008, 0.06];

    // Leg: a three-joint chain with a digitigrade knee, and a small foot.
    const leg = b.chain(`leg${L}`, [hip, knee, ankle], {
      names: [`hip${L}`, `knee${L}`, `ankle${L}`],
      parent: "pelvis",
      role: "leg",
    });
    b.sweep(leg, 0.012, { color: LEG });
    b.capsule(ankle, toe, 0.008, { color: "#3a2a1e", bone: `ankle${L}` });

    // Arm: shoulder, elbow, wrist (the wrist is the chain's tip joint).
    const shoulder: V = [X(0.05), 0.4, 0.01];
    const elbow: V = [X(0.15), 0.43, -0.03];
    const wrist: V = [X(0.3), 0.42, 0.02];
    const arm = b.chain(`arm${L}`, [shoulder, elbow, wrist], {
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`],
      parent: "spine",
      role: "wing",
    });
    b.sweep(arm, (t: number) => 0.011 - 0.004 * t, { color: BONE });

    // Finger bones fanning out from the wrist, longest in front.
    const fingerPaths: Array<{ mid: V; tip: V }> = [
      { mid: [X(0.5), 0.48, 0.06], tip: [X(0.7), 0.44, 0.06] },
      { mid: [X(0.48), 0.42, 0.0], tip: [X(0.64), 0.4, -0.04] },
      { mid: [X(0.42), 0.38, -0.08], tip: [X(0.52), 0.34, -0.12] },
      { mid: [X(0.3), 0.34, -0.12], tip: [X(0.36), 0.3, -0.18] },
    ];
    const fingers = fingerPaths.map((f, k) => {
      const chain = b.chain(`digit${L}${k + 2}`, [wrist, f.mid, f.tip], {
        names: [`f${k + 2}${L}1`, `f${k + 2}${L}2`, `f${k + 2}${L}3`],
        parent: `wrist${L}`,
        role: "digit",
      });
      b.sweep(chain, 0.0042, { color: BONE });
      return chain;
    });

    // Hooked thumb claw at the wrist.
    const thumbTip: V = [X(0.34), 0.44, 0.08];
    b.rod(wrist, thumbTip, 0.008, { color: "#2b2620", bone: `wrist${L}` });
    b.spike(thumbTip, [X(0.25), 0.6, 0.6], 0.022, 0.006, { color: "#1d1a16", bone: `wrist${L}` });

    // Wing membrane: arm to body, leading edge, fan between fingers, trailing edge back to the ankle.
    b.membrane(arm, [[X(0.03), 0.36, 0], wrist], { color: WING, thickness: 0.005 });
    b.membrane(fingers[0], [wrist, elbow, shoulder], { color: WING, thickness: 0.005 });
    for (let k = 0; k < 3; k++) b.membrane(fingers[k], fingers[k + 1], { color: WING, thickness: 0.005 });
    b.membrane(fingers[3], [ankle, [X(0.18), 0.25, -0.16], fingerPaths[3].tip], {
      color: WING,
      thickness: 0.005,
    });
  }

  // Body: a golden fluffy torso, hips and head.
  b.part(new THREE.SphereGeometry(0.07, b.segments(16), b.segments(12)), fur, {
    at: [0, 0.28, 0],
    bone: "spine",
    scale: [1, 1.25, 0.95],
    name: "torso",
  });
  b.part(new THREE.SphereGeometry(0.05, b.segments(12), b.segments(10)), fur, {
    at: [0, 0.2, 0],
    bone: "pelvis",
    scale: [1.1, 0.9, 1],
    name: "hips",
  });
  b.capsule([0, 0.38, 0.01], [0, 0.45, 0.03], 0.03, { color: fur, bone: "neck", name: "neck" });
  b.part(new THREE.SphereGeometry(0.056, b.segments(16), b.segments(12)), fur, {
    at: [0, 0.45, 0.03],
    bone: "head",
    scale: [1, 0.95, 1.1],
    name: "head",
  });

  // Fur tufts: two rings of cards, one on the body and one on the neck ruff.
  const body = b.ring("spine", { count: 18, radius: 0.07 });
  b.cards(body.items, tuft, { size: [0.05, 0.07], lean: 35, flow: [0, -1, 0], vary: 0.2, spin: 20, rng: rng(3) });
  const ruff = b.ring("neck", { count: 12, radius: 0.045 });
  b.cards(ruff.items, tuft, { size: [0.04, 0.05], lean: 50, flow: [0, -1, 0.2], vary: 0.2, rng: rng(5) });

  // Face: muzzle, big dark eyes with highlights, a moist black nose, and pointed ears.
  b.part(new THREE.SphereGeometry(0.03, b.segments(12), b.segments(10)), CREAM, {
    at: [0, 0.428, 0.072],
    bone: "head",
    scale: [1, 0.9, 1.2],
    name: "muzzle",
  });
  b.part(new THREE.SphereGeometry(0.011, b.segments(8), b.segments(6)), "#141012", {
    at: [0, 0.438, 0.102],
    bone: "head",
    scale: [1.4, 0.8, 1],
    name: "nose",
  });
  b.part(new THREE.SphereGeometry(0.003, 6, 4), "#ffffff", {
    at: [0.004, 0.444, 0.112],
    bone: "head",
    name: "nose-moist",
  });
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const x = s * 0.024;
    b.part(new THREE.SphereGeometry(0.018, b.segments(12), b.segments(10)), EYE, {
      at: [x, 0.46, 0.072],
      bone: "head",
      name: `eye${side}`,
    });
    b.part(new THREE.SphereGeometry(0.005, 6, 4), "#ffffff", {
      at: [x + s * 0.004, 0.468, 0.084],
      bone: "head",
      name: `glint${side}`,
    });
    b.spike([s * 0.028, 0.48, 0.02], [s * 0.35, 1, -0.25], 0.06, 0.02, {
      color: EAR,
      bone: "head",
      name: `ear${side}`,
    });
  }

  // The half-eaten fig, held between the feet, with a pink bite.
  b.lathe(
    [
      [0, -0.035],
      [0.018, -0.034],
      [0.031, -0.018],
      [0.035, 0],
      [0.028, 0.02],
      [0.014, 0.032],
      [0, 0.035],
    ],
    { color: "#6b2a52", at: [0, 0.035, 0.09], bone: "pelvis", name: "fig" },
  );
  b.part(new THREE.SphereGeometry(0.013, b.segments(10), b.segments(8)), "#e98a9e", {
    at: [0.032, 0.044, 0.09],
    bone: "pelvis",
    name: "fig-bite",
  });

  return b.root;
}
