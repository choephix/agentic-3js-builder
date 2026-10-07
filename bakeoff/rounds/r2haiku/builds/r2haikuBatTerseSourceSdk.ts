import * as THREE from "three";
import { createBuilder, gradient, mottle } from "../../../../src/index";

export const meta = {
  name: "Bat",
  description: "A stylised fruit bat standing on its feet with its wings half spread.",
};

type V = [number, number, number];

export default function bat() {
  const b = createBuilder({ name: "bat", detail: 1, paintSize: 1024 });

  const fur = mottle("#5a4268", "#33263f", { size: 0.04, seed: 4 });
  const belly = "#b8957a";
  const dark = "#1d1420";
  const eyeWhite = "#f4efff";
  const earInner = "#d28e97";

  // Spine: hips (root) → chest → neck → head.
  b.joint("hips", { at: [0, 0.072, 0] });
  b.joint("chest", { parent: "hips", at: [0, 0.098, 0.008], aim: [0, 0.128, 0.016] });
  b.joint("neck", { parent: "chest", at: [0, 0.128, 0.016], aim: [0, 0.15, 0.034] });
  b.joint("head", { parent: "neck", at: [0, 0.15, 0.034], aim: [0, 0.172, 0.05] });

  // Body: a rounded torso with a lighter belly sector.
  b.loft(
    [
      { at: [0, 0.06, 0], w: 0.05, h: 0.056 },
      { at: [0, 0.092, 0.004], w: 0.062, h: 0.07 },
      { at: [0, 0.122, 0.01], w: 0.05, h: 0.05 },
    ],
    { color: fur, bone: ["hips", "chest"], sectors: [[130, 230, belly]], name: "torso" },
  );
  b.capsule([0, 0.11, 0.01], [0, 0.158, 0.04], 0.016, { color: fur, bone: "neck", name: "neck" });

  // Head: a round skull, a soft muzzle and a dark nose.
  b.part(new THREE.SphereGeometry(0.03, b.segments(14), b.segments(10)), fur, {
    at: [0, 0.178, 0.058],
    bone: "head",
    scale: [1, 0.95, 1.05],
    name: "skull",
  });
  b.part(new THREE.SphereGeometry(0.014, b.segments(10), b.segments(7)), belly, {
    at: [0, 0.166, 0.084],
    bone: "head",
    scale: [1.1, 0.9, 1],
    name: "muzzle",
  });
  b.part(new THREE.SphereGeometry(0.0055, b.segments(8), b.segments(6)), dark, {
    at: [0, 0.172, 0.097],
    bone: "head",
    name: "nose",
  });

  for (const [s, L] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const P = (x: number, y: number, z: number): V => [s * x, y, z];

    // Ears: flat plates standing up from the crown, with a pink inner plate.
    const ear = [
      [0.018, 0.188, 0.042],
      [0.018, 0.246, 0.036],
      [0.018, 0.24, 0.06],
      [0.018, 0.19, 0.064],
    ].map(([x, y, z]) => P(x, y, z));
    const inner = [
      [0.0205, 0.193, 0.046],
      [0.0205, 0.236, 0.04],
      [0.0205, 0.232, 0.056],
      [0.0205, 0.195, 0.058],
    ].map(([x, y, z]) => P(x, y, z));
    b.slab(ear, { color: fur, thickness: 0.004, bone: "head", name: `ear${L}` });
    b.slab(inner, { color: earInner, thickness: 0.0015, bone: "head", name: `earInner${L}` });

    // Eyes: big dark eyes with a small highlight.
    b.part(new THREE.SphereGeometry(0.0075, b.segments(10), b.segments(7)), dark, {
      at: P(0.0125, 0.183, 0.08),
      bone: "head",
      name: `eye${L}`,
    });
    b.part(new THREE.SphereGeometry(0.0022, b.segments(6), b.segments(4)), eyeWhite, {
      at: P(0.0155, 0.186, 0.0865),
      bone: "head",
      name: `glint${L}`,
    });

    // Legs: knees forward, feet flat on the floor with little claws.
    const ankle = P(0.03, 0.01, 0.012);
    const leg = b.chain(`leg${L}`, [P(0.026, 0.072, 0), P(0.04, 0.03, 0.03), ankle], {
      parent: "hips",
      names: [`hip${L}`, `knee${L}`, `ankle${L}`],
      role: "leg",
    });
    b.sweep(leg, [0.0068, 0.0045, 0.0034], { color: fur, name: `leg${L}` });
    for (const [x, z] of [
      [0.024, 0.034],
      [0.03, 0.036],
      [0.036, 0.032],
    ]) {
      b.rod(ankle, P(x, 0.0022, z), 0.0022, { color: dark, bone: `ankle${L}`, name: `claw${L}` });
    }

    // Wing arm: shoulder → elbow → wrist, the leading edge of the wing.
    const arm = b.chain(
      `arm${L}`,
      [P(0.022, 0.118, 0.006), P(0.1, 0.15, -0.004), P(0.2, 0.166, -0.006)],
      {
        parent: "chest",
        names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`],
        role: "wing",
      },
    );
    b.sweep(arm, [0.0065, 0.0042, 0.0028], { color: "#2a1f33", name: `arm${L}` });

    // Four fingers fanning out from the wrist, each bending at two knuckles.
    const digits: Array<[number, number, number, number, number, number]> = [
      [0.268, 0.172, 0.004, 0.34, 0.166, 0.016],
      [0.25, 0.173, -0.002, 0.318, 0.163, -0.034],
      [0.232, 0.171, -0.006, 0.272, 0.156, -0.066],
      [0.214, 0.168, -0.01, 0.222, 0.146, -0.09],
    ];
    const fingers = digits.map(([kx, ky, kz, tx, ty, tz], i) => {
      const finger = b.chain(`finger${L}${i}`, [arm.tip!.at, P(kx, ky, kz), P(tx, ty, tz)], {
        parent: arm,
        names: [`f${L}${i}a`, `f${L}${i}b`, `f${L}${i}c`],
      });
      b.sweep(finger, [0.0036, 0.0018], { color: "#2a1f33", name: `finger${L}${i}` });
      return finger;
    });

    // Membranes: a sail from arm to leg, and a fan from the wrist between the fingers.
    const wingSkin = gradient("#4a2f63", "#1c1430", P(0.12, 0.16, 0), P(0.34, 0.16, -0.04));
    b.membrane(arm, leg, {
      color: wingSkin,
      thickness: 0.0015,
      rows: 3,
      name: `sail${L}`,
    });
    const armToWrist = arm.path.slice(1, 0);
    b.membrane(armToWrist, fingers[0], {
      color: wingSkin,
      thickness: 0.0015,
      bone: arm,
      scallop: 0.1,
      name: `wingFront${L}`,
    });
    for (let i = 0; i < fingers.length - 1; i++) {
      b.membrane(fingers[i], fingers[i + 1], {
        color: wingSkin,
        thickness: 0.0015,
        scallop: 0.12,
        name: `wing${L}${i}`,
      });
    }
  }

  return b.root;
}
