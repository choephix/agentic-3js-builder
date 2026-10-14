import * as THREE from "three";
import { createBuilder, countershade, spots } from "../../../../src/index";

export const meta = {
  name: "Frog",
  description: "A stylised green frog: wide head, gold eyes, countershaded skin, webbed hind feet.",
};

const b = createBuilder({ name: "frog" });

// Paints: a mottled green back over a pale belly.
const back = spots("#4f9b34", ["#2c5f22", "#8a7a28"], { size: 0.02, amount: 0.35, seed: 3 });
const skin = countershade(back, "#e9e2a4", { level: -0.15, soft: 0.45 });
const throat = "#e9e2a4";
const web = "#3b7d2a";
const iris = "#e0a51c";
const pupil = "#0d0d0d";
const mouthLine = "#1d3d18";

const sphere = (r = 1) => new THREE.SphereGeometry(r, b.segments(14), b.segments(10));

// Skeleton: body, head, jaw and eyes.
const body = b.joint("body", { at: [0, 0.035, 0], dir: [0, 0, 1] });
const head = b.joint("head", { parent: body, at: [0, 0.058, 0.035], dir: [0, 0.25, 1], role: "head" });
const jaw = b.joint("jaw", { parent: head, at: [0, 0.05, 0.035], dir: [0, 0, 1], role: "jaw" });
const eyeL = b.joint("eyeL", { parent: head, at: [0.026, 0.07, 0.045], dir: [0, 1, 0] });
const eyeR = b.joint("eyeR", { parent: head, at: [-0.026, 0.07, 0.045], dir: [0, 1, 0] });

// Body and head: squat, wide volumes.
b.part(sphere(), skin, { bone: body, at: [0, 0.034, 0], scale: [0.032, 0.024, 0.044] });
b.part(sphere(), skin, { bone: head, at: [0, 0.058, 0.035], scale: [0.03, 0.017, 0.028] });
b.part(sphere(), throat, { bone: jaw, at: [0, 0.05, 0.052], scale: [0.024, 0.007, 0.02] });
b.part(new THREE.BoxGeometry(1, 1, 1), mouthLine, {
  bone: head,
  at: [0, 0.053, 0.061],
  scale: [0.03, 0.002, 0.002],
});

// Eyes: gold irises on the head, with a dark pupil on the front of each.
for (const [eye, s] of [
  [eyeL, 1],
  [eyeR, -1],
] as const) {
  b.part(new THREE.SphereGeometry(0.012, b.segments(12), b.segments(8)), iris, { bone: eye });
  b.part(sphere(), pupil, {
    bone: eye,
    at: eye.local({ forward: 0.0105 }),
    scale: [0.0045, 0.0075, 0.0025],
  });
  void s;
}

function hindLeg(s: number) {
  const L = s > 0 ? "L" : "R";
  const leg = b.chain(
    "leg" + L,
    [
      [s * 0.03, 0.04, -0.01],
      [s * 0.07, 0.018, 0.0],
      [s * 0.05, 0.012, -0.05],
      [s * 0.03, 0.006, -0.08],
    ],
    {
      names: ["hip" + L, "knee" + L, "ankle" + L, "foot" + L],
      parent: body,
      role: "leg",
    },
  );
  // Smooth-skinned thigh, shin and foot bending at each joint.
  b.sweep(leg, [0.014, 0.009, 0.007, 0.006], { color: skin });
  // Knee bulge.
  b.part(sphere(0.0095), skin, { bone: leg.joints[1] });

  // Webbed foot: a thin fan of skin across the toes.
  const foot = leg.joints[3];
  const P = (x: number, z: number) => foot.local({ left: s * x, forward: z });
  b.slab([P(0.004, 0.01), P(0.022, -0.004), P(0.026, -0.03), P(0, -0.036), P(-0.008, -0.02)], {
    color: web,
    thickness: 0.002,
    bone: foot,
    name: "web" + L,
  });
  // Toe pads.
  for (const [x, z] of [
    [0.022, -0.004],
    [0.026, -0.03],
    [0, -0.036],
  ] as const)
    b.part(sphere(0.0028), skin, { bone: foot, at: P(x, z) });
}

function frontLeg(s: number) {
  const L = s > 0 ? "L" : "R";
  const arm = b.chain(
    "arm" + L,
    [
      [s * 0.03, 0.046, 0.03],
      [s * 0.042, 0.03, 0.058],
      [s * 0.04, 0.014, 0.078],
      [s * 0.036, 0.006, 0.092],
    ],
    {
      names: ["shoulder" + L, "elbow" + L, "wrist" + L, "hand" + L],
      parent: body,
      role: "arm",
    },
  );
  b.sweep(arm, [0.0085, 0.007, 0.0058, 0.0052], { color: skin });
  const hand = arm.joints[3];
  // Three round finger pads at the tip.
  for (const [x, z] of [
    [0.004, 0.004],
    [0, 0.005],
    [-0.004, 0.003],
  ] as const)
    b.part(sphere(0.0035), skin, { bone: hand, at: hand.local({ left: s * x, forward: z }) });
}

hindLeg(1);
hindLeg(-1);
frontLeg(1);
frontLeg(-1);

export default function frog() {
  return b.root;
}
