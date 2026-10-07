import * as THREE from "three";
import { createBuilder, catmull, polyline } from "../../../../src/index";

export const meta = {
  name: "Emperor Penguin",
  description: "A stylized emperor penguin with a rigged body, head, jaw, flippers, legs, feet and tail.",
};

const DARK = "#1c2230";
const WHITE = "#f4f1ea";
const YEL = "#f2d26b";
const ORANGE = "#e8892b";
const BEAK = "#2a2a30";
const PATCH = "#f0a93a";
const BLACK = "#08080c";

export default function build() {
  const b = createBuilder({ name: "penguin" });

  const hips = b.joint("hips", { at: [0, 0.2, -0.06], role: "spine" });

  // ---- spine / body
  const spinePath = catmull([
    [0, 0.2, -0.06],
    [0, 0.4, -0.04],
    [0, 0.62, 0.0],
    [0, 0.8, 0.045],
  ]);
  const spine = b.chain("spine", spinePath, { parent: hips, count: 3, role: "spine" });
  b.sweep(spine, [0.1, 0.17, 0.2, 0.17, 0.1, 0.07], {
    color: DARK,
    sides: 10,
    sectors: [
      [105, 255, WHITE, 0, 0.78],
      [105, 255, YEL, 0.78, 1],
    ],
  });

  // ---- head
  const head = b.joint("head", {
    parent: spine.joints[2],
    at: [0, 0.8, 0.045],
    dir: [0, 1, 0.3],
    role: "head",
  });
  b.part(new THREE.SphereGeometry(0.082, 10, 8), DARK, {
    bone: head,
    at: [0, 0.89, 0.06],
    scale: [1, 1, 1.08],
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.882, 0.1],
    aim: [0, 0.875, 0.25],
    role: "jaw",
  });
  // upper beak
  b.frustumBox([0, 0.897, 0.11], [0, 0.878, 0.275], [0.05, 0.034], [0.012, 0.012], {
    bone: head,
    color: BEAK,
  });
  // lower beak
  b.frustumBox([0, 0.874, 0.105], [0, 0.865, 0.245], [0.044, 0.016], [0.01, 0.008], {
    bone: jaw,
    color: ORANGE,
  });

  for (const s of [1, -1]) {
    // ear patches
    b.part(new THREE.SphereGeometry(0.03, 8, 6), PATCH, {
      bone: head,
      at: [s * 0.062, 0.875, 0.03],
      scale: [0.5, 1.1, 1.3],
    });
    // eyes
    b.part(new THREE.SphereGeometry(0.019, 6, 5), WHITE, { bone: head, at: [s * 0.062, 0.907, 0.113] });
    b.part(new THREE.SphereGeometry(0.012, 6, 4), BLACK, { bone: head, at: [s * 0.072, 0.907, 0.12] });
  }

  // ---- flippers, legs, feet
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const armPath = catmull([
      [s * 0.17, 0.6, 0.0],
      [s * 0.32, 0.52, -0.02],
      [s * 0.5, 0.4, -0.05],
    ]);
    const arm = b.chain(`arm${side}`, armPath, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    b.sweep(arm, (t) => [0.02 + 0.04 * Math.sin(Math.PI * Math.min(1, t * 1.1 + 0.1)) * (1 - 0.3 * t), 0.011], {
      color: DARK,
      sectors: [[120, 240, WHITE]],
      sides: 8,
      caps: { start: "round", end: "point" },
    });

    // leg
    const leg = b.chain(
      `leg${side}`,
      polyline([
        [s * 0.07, 0.15, 0.0],
        [s * 0.075, 0.035, 0.02],
      ]),
      { parent: hips, names: [`hip${side}`, `ankle${side}`], role: "leg", contact: [s * 0.075, 0, 0.06] },
    );
    b.sweep(leg, 0.03, { color: ORANGE, sides: 6 });

    // webbed foot
    const foot = b.extrude(
      [
        [-0.025, -0.03],
        [0.025, -0.03],
        [0.065, 0.1, "sharp"],
        [0.03, 0.13],
        [0, 0.115],
        [-0.03, 0.13],
        [-0.065, 0.1, "sharp"],
      ],
      {
        at: [s * 0.075, 0.01, 0.0],
        x: [1, 0, 0],
        y: [0, 0, 1],
        thickness: 0.02,
        color: ORANGE,
        bone: leg.tip ?? leg.joints[leg.joints.length - 1],
      },
    );
    void foot;
    for (const k of [-0.05, 0, 0.05]) {
      b.spike([s * 0.075 + k, 0.012, 0.115 + (k === 0 ? 0.015 : 0)], [0, 0, 1], 0.03, 0.008, {
        color: BLACK,
        sides: 5,
        bone: leg.tip ?? leg.joints[leg.joints.length - 1],
      });
    }
  }

  // ---- tail
  const tail = b.chain(
    "tail",
    polyline([
      [0, 0.16, -0.15],
      [0, 0.1, -0.3],
    ]),
    { parent: hips, names: ["tail1", "tail2"], role: "tail" },
  );
  b.sweep(tail, (t) => [0.055 * (1 - 0.7 * t), 0.016], { color: DARK, caps: { start: "round", end: "point" }, sides: 6 });

  return b.root;
}
