import * as THREE from "three";
import { createBuilder, catmull, countershade, limb, mottle, polyline } from "../../../../src/index";

export const meta = {
  name: "bat",
  description: "A stylised fruit bat in rest pose: wings spread, perched on its feet, big ears and a fanged jaw.",
};

const FUR = "#2e2338";
const FUR_LIGHT = "#4d3d5c";
const WING = "#6b4a86";
const WING_DARK = "#3d2a52";
const BONE = "#1d1426";
const EAR = "#4a3660";
const EYE = "#ffc53a";
const DARK = "#120c18";
const FANG = "#fbf7ea";
const NOSE = "#8c5a72";

const mid = (a: number[], c: number[], k: number, lift = 0): number[] => [
  a[0] + (c[0] - a[0]) * k,
  a[1] + (c[1] - a[1]) * k + lift,
  a[2] + (c[2] - a[2]) * k,
];

export default function build() {
  const b = createBuilder({ name: "bat" });

  // Skeleton: hips, spine, head and jaw.
  const hips = b.joint("hips", { at: [0, 0.14, 0] });
  const spine = b.chain("spine", catmull([[0, 0.14, 0], [0, 0.158, 0.045], [0, 0.172, 0.09]]), {
    parent: hips,
    names: ["spine1", "spine2"],
    role: "spine",
  });
  const head = b.joint("head", { parent: spine, at: [0, 0.19, 0.12], dir: [0, 0.35, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: head.local({ forward: 0.035, up: -0.025 }), role: "jaw" });

  // Tail.
  const tail = b.chain("tail", polyline([[0, 0.13, -0.01], [0, 0.122, -0.09], [0, 0.118, -0.17]]), {
    parent: hips,
    names: ["tail1", "tail2"],
    role: "tail",
  });

  // Body and tail.
  b.sweep(spine, [0.036, 0.05], { color: countershade(FUR, FUR_LIGHT, { level: -0.2 }) });
  b.sweep(tail, [0.012, 0.005], { color: FUR });

  // Head, muzzle, nose.
  b.part(new THREE.SphereGeometry(0.046, 10, 8), FUR, {
    bone: head,
    at: head.local({ up: 0.012, forward: 0.006 }),
  });
  b.part(new THREE.BoxGeometry(0.036, 0.03, 0.04), FUR_LIGHT, {
    bone: head,
    at: head.local({ forward: 0.045, up: -0.005 }),
  });
  b.part(new THREE.BoxGeometry(0.02, 0.012, 0.012), NOSE, {
    bone: head,
    at: head.local({ forward: 0.068, up: 0.006 }),
  });

  // Lower jaw.
  b.part(new THREE.BoxGeometry(0.03, 0.012, 0.05), FUR, { bone: jaw });

  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";

    // Eyes and pupils.
    b.part(new THREE.SphereGeometry(0.011, 6, 4), EYE, {
      bone: head,
      at: head.local({ left: s * 0.024, up: 0.012, forward: 0.04 }),
    });
    b.part(new THREE.SphereGeometry(0.006, 5, 4), DARK, {
      bone: head,
      at: head.local({ left: s * 0.026, up: 0.012, forward: 0.05 }),
    });

    // Ear: a flat extruded drawing, tilted back.
    b.extrude(
      [
        [-0.022, 0],
        [-0.028, 0.05],
        [-0.012, 0.085],
        [0.004, 0.07],
        [0.02, 0.03],
        [0.022, 0],
      ],
      {
        at: head.local({ left: s * 0.02, up: 0.03, forward: -0.012 }),
        bone: head,
        x: [s, 0, 0],
        y: [0, 1, -0.35],
        thickness: 0.008,
        bevel: 0.002,
        smoothing: 1,
        color: EAR,
      },
    );

    // Fang pointing down from the jaw.
    b.spike(jaw.local({ left: s * 0.009, forward: 0.02 }), [0, -1, 0], 0.018, 0.0045, { color: FANG });

    // Arm: shoulder, elbow, wrist (the wrist is the arm's tip joint).
    const shoulder = [s * 0.045, 0.165, 0.05];
    const elbow = [s * 0.2, 0.19, 0.0];
    const wrist = [s * 0.37, 0.215, -0.05];
    const arm = b.chain(`arm${sd}`, polyline([shoulder, elbow, wrist]), {
      parent: spine,
      names: [`shoulder${sd}`, `elbow${sd}`, `wrist${sd}`],
      role: "arm",
    });
    b.sweep(arm, [0.011, 0.007], { color: BONE });

    // Thumb claw at the wrist.
    b.spike(arm, [s * 0.3, 0.7, 0.5], 0.03, 0.006, { color: FANG });

    // Four long finger bones fanning back from the wrist.
    const tips = [
      [s * 0.5, 0.23, 0.02],
      [s * 0.56, 0.21, -0.1],
      [s * 0.5, 0.19, -0.2],
      [s * 0.39, 0.17, -0.3],
    ];
    tips.forEach((tip, i) => {
      const m = mid(wrist, tip, 0.5, 0.012);
      const finger = b.chain(`finger${i + 1}${sd}`, polyline([wrist, m, tip]), {
        parent: arm,
        names: [`f${i + 1}${sd}1`, `f${i + 1}${sd}2`],
        role: "digit",
      });
      b.sweep(finger, [0.008, 0.003], { color: BONE });
    });

    // Wing membrane: leading edge from shoulder over the wrist to the first fingertip,
    // trailing edge from the body out through the fingertips.
    const lead = polyline([shoulder, elbow, wrist, tips[0]]);
    const trail = polyline([[s * 0.035, 0.16, 0.04], tips[3], tips[2], tips[1], tips[0]]);
    b.membrane(lead, trail, {
      color: mottle(WING, WING_DARK, { size: 0.1 }),
      thickness: 0.005,
      bone: arm,
      rows: 6,
      cols: 6,
    });

    // Leg: hip, knee bent backward, foot on the floor.
    const hip = [s * 0.035, 0.135, 0.0];
    const foot = [s * 0.05, 0.012, 0.035];
    const legPts = limb(hip, foot, [0.075, 0.065], [[0, 0, -1]]);
    const leg = b.chain(`leg${sd}`, legPts, {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `foot${sd}`],
      role: "leg",
    });
    b.sweep(leg, [0.012, 0.009], { color: FUR });

    // Foot pad and three small claws.
    b.part(new THREE.SphereGeometry(0.012, 6, 4), FUR, { bone: leg });
    const toes: number[][] = [
      [s * 0.5, -0.15, 0.7],
      [0, -0.15, 1],
      [-s * 0.5, -0.15, 0.7],
    ];
    for (const d of toes) {
      b.spike(leg, d, 0.025, 0.004, { color: FANG });
    }
  }

  return b.root;
}
