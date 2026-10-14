import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "penguin",
  description: "A standing penguin: black back, white belly, orange beak and feet, black flippers.",
};

const BLACK = "#1c1f26";
const WHITE = "#f5f2ea";
const ORANGE = "#f2a023";
const EYE = "#ffffff";
const PUPIL = "#101114";

// Left (+X) or right (-X) offset as a words object for frame.local()
const side = (s: number, d: number) => (s > 0 ? { left: d } : { right: d });

export default function build() {
  const b = createBuilder({ name: "penguin" });

  // Root at the body's centre
  const hips = b.joint("hips", { at: [0, 0.42, 0], role: "spine" });

  // Egg-shaped body: lathed around the vertical axis, black back, white front
  const bodyProfile: OutlinePoint[] = [
    [0, -0.34],
    [0.1, -0.33],
    [0.16, -0.22],
    [0.18, -0.03],
    [0.165, 0.13],
    [0.12, 0.25],
    [0.05, 0.3],
    [0, 0.31],
  ];
  b.lathe(bodyProfile, {
    at: [0, 0.42, 0],
    bone: hips,
    segments: 18,
    smoothing: 1,
    color: (_p, n) => (n.z > 0.45 ? WHITE : BLACK),
  });

  // Head: a joint of its own so the eyes and beak ride it
  const head = b.joint("head", { parent: hips, at: [0, 0.6, 0], role: "head" });
  b.part(new THREE.SphereGeometry(0.125, 16, 12), (_p, n) =>
    Math.abs(n.x) > 0.7 && Math.abs(n.y) < 0.35 ? WHITE : BLACK,
    { bone: head, at: [0, 0.6, 0] },
  );

  // Eyes: white with a dark pupil, set on the front of the head
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 8, 6), EYE, {
      bone: head,
      at: head.local({ forward: 0.1, up: 0.03, ...side(s, 0.04) }),
    });
    b.part(new THREE.SphereGeometry(0.015, 6, 4), PUPIL, {
      bone: head,
      at: head.local({ forward: 0.128, up: 0.027, ...side(s, 0.042) }),
    });
  }

  // Upper beak: fixed to the skull
  b.part(new THREE.ConeGeometry(0.038, 0.1, 6), ORANGE, {
    bone: head,
    at: head.local({ forward: 0.15, up: -0.005 }),
    dir: [0, 0, 1],
  });

  // Lower jaw: its own joint, so the beak can open
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.07, up: -0.04 }),
    role: "jaw",
  });
  b.part(new THREE.ConeGeometry(0.03, 0.08, 6), ORANGE, {
    bone: jaw,
    at: jaw.local({ forward: 0.08, up: 0 }),
    dir: [0, 0, 1],
  });

  // Flippers and legs, mirrored
  const flipper: OutlinePoint[] = [
    [-0.035, 0.03],
    [0.035, 0.03],
    [0.05, -0.1],
    [0.03, -0.26],
    [0, -0.34, "sharp"],
    [-0.03, -0.26],
    [-0.05, -0.1],
  ];

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // Flipper hangs from a shoulder joint on the body's side
    const wing = b.joint(`wing${S}`, { parent: hips, at: [s * 0.17, 0.5, 0], role: "wing" });
    b.extrude(flipper, {
      at: [s * 0.17, 0.5, 0],
      thickness: [0.012, 0.03],
      bevel: 0.006,
      smoothing: 1,
      color: BLACK,
      bone: wing,
    });

    // Short stubby leg: hip, knee and ankle joints
    const leg = b.chain(
      `leg${S}`,
      catmull([
        [s * 0.1, 0.28, 0],
        [s * 0.1, 0.12, 0],
        [s * 0.1, 0.03, 0.03],
      ]),
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" },
    );
    b.sweep(leg, [0.028, 0.02], { color: ORANGE });

    // Flat webbed foot on the ankle
    b.part(new THREE.BoxGeometry(0.1, 0.024, 0.16), ORANGE, {
      bone: leg.joints[leg.joints.length - 1],
      at: [s * 0.1, 0.012, 0.05],
    });
  }

  // Small tail nub at the back
  b.part(new THREE.ConeGeometry(0.05, 0.1, 6), BLACK, {
    bone: hips,
    at: [0, 0.2, -0.17],
    dir: [0, -0.5, -1],
  });

  return b.root;
}
