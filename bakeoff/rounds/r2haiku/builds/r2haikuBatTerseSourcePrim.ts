import * as THREE from "three";
import { countershade, createBuilder, mottle } from "../../../../src/index";

export const meta = {
  name: "Bat",
  description:
    "A stylised bat in a standing rest pose with its wings spread: countershaded fur, amber eyes, big ears and a scalloped maroon wing membrane over four rigged fingers.",
};

type V = [number, number, number];

export default function bat() {
  const b = createBuilder({ name: "bat", detail: 1, paintSize: 1024 });

  const fur = countershade("#2c201c", "#7d6150", { level: 0.1, soft: 0.4 });
  const dark = "#1f1518";
  const wingSkin = mottle("#6a3446", "#3d1f2c", { size: 0.08, seed: 3, contrast: 1.2 });
  const earColor = "#3a2a25";

  // Spine and head.
  const hips = b.joint("hips", { at: [0, 0.14, 0] });
  const chest = b.joint("chest", { parent: hips, at: [0, 0.23, 0.01], dir: [0, 1, 0.1] });
  const neck = b.joint("neck", { parent: chest, at: [0, 0.31, 0.03], dir: [0, 1, 0.3] });
  const head = b.joint("head", { parent: neck, at: [0, 0.36, 0.05] });

  // Torso and head: faceted, countershaded.
  b.capsule(hips, chest, [0.05, 0.062], { color: fur, name: "torso" });
  b.part(new THREE.SphereGeometry(0.05, b.segments(12), b.segments(9)), fur, {
    bone: head,
    flat: true,
    name: "skull",
  });
  b.part(new THREE.SphereGeometry(0.022, b.segments(8), b.segments(6)), fur, {
    bone: head,
    at: head.local([0, -0.012, 0.045]),
    name: "snout",
  });
  b.slab(
    [
      head.local([0, -0.004, 0.06]),
      head.local([-0.008, 0.012, 0.062]),
      head.local([0, 0.02, 0.06]),
      head.local([0.008, 0.012, 0.062]),
    ],
    { color: dark, thickness: 0.004, bone: head, name: "noseLeaf" },
  );

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // Ears: tall, pointed, thin.
    b.slab(
      [
        head.local([s * 0.02, 0.03, 0.02]),
        head.local([s * 0.04, 0.115, -0.005]),
        head.local([s * 0.055, 0.035, -0.025]),
      ],
      { color: earColor, thickness: 0.005, bone: head, name: `ear${S}` },
    );

    // Amber eyes with dark pupils.
    b.part(new THREE.SphereGeometry(0.012, b.segments(8), b.segments(6)), "#ffb000", {
      bone: head,
      at: head.local([s * 0.024, 0.012, 0.036]),
      name: `eye${S}`,
    });
    b.part(new THREE.SphereGeometry(0.006, b.segments(6), b.segments(4)), dark, {
      bone: head,
      at: head.local([s * 0.026, 0.013, 0.046]),
      name: `pupil${S}`,
    });

    // Hind legs: hip, knee pointing back, ankle, and a small foot resting on the floor.
    const hip = b.joint(`hip${S}`, { parent: hips, at: [s * 0.035, 0.12, 0] });
    const knee = b.joint(`knee${S}`, { parent: hip, at: [s * 0.05, 0.06, -0.03] });
    const ankle = b.joint(`ankle${S}`, { parent: knee, at: [s * 0.04, 0.025, 0.02] });
    b.capsule(hip, knee, 0.012, { color: dark, name: `thigh${S}` });
    b.capsule(knee, ankle, 0.009, { color: dark, name: `shin${S}` });
    b.rod(ankle, [s * 0.05, 0.006, 0.04], 0.006, { color: dark, name: `foot${S}` });

    // Arm: shoulder, elbow, wrist, with the wrist as the chain's tip joint.
    const P = (x: number, y: number, z: number): V => [s * x, y, z];
    const arm = b.chain(
      `arm${S}`,
      [P(0.05, 0.27, 0.04), P(0.18, 0.32, 0.02), P(0.36, 0.33, -0.02)],
      { parent: "chest", names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "wing" },
    );
    const wrist = arm.tip!;

    // Four fingers fanning out from the wrist.
    const tips: V[] = [P(0.58, 0.31, 0.03), P(0.52, 0.28, -0.09), P(0.42, 0.26, -0.18), P(0.29, 0.24, -0.25)];
    tips.forEach((tip, i) => {
      b.rod(wrist, tip, [0.008, 0.003], { color: dark, name: `finger${S}${i + 1}` });
    });

    // Wing membrane: a scalloped outline from the shoulder, along the arm and fingers, down to the ankle.
    b.slab(
      [
        P(0.05, 0.28, 0.04),
        P(0.18, 0.33, 0.02),
        P(0.36, 0.34, -0.02),
        tips[0],
        P(0.52, 0.29, -0.03),
        tips[1],
        P(0.44, 0.25, -0.12),
        tips[2],
        P(0.35, 0.24, -0.19),
        tips[3],
        P(0.2, 0.2, -0.22),
        P(0.08, 0.16, -0.2),
      ],
      { color: wingSkin, thickness: 0.004, bone: chest, name: `wing${S}` },
    );
  }

  // Short tail and the membrane stretched between the legs.
  b.rod(hips, [0, 0.12, -0.16], [0.012, 0.004], { color: dark, name: "tail" });
  b.slab(
    [
      [0.05, 0.03, 0],
      [0, 0.13, -0.16],
      [-0.05, 0.03, 0],
      [0, 0.1, -0.03],
    ],
    { color: wingSkin, thickness: 0.004, bone: hips, name: "tailMembrane" },
  );

  return b.root;
}
