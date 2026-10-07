import * as THREE from "three";
import { createBuilder, mix, mottle, paint, rng, smoothstep } from "../../../../src/index";

export const meta = {
  name: "Emperor penguin and chick",
  description:
    "An emperor penguin parent with a blue-black back and head, white belly, golden neck and ear patches, a long slender bill with an orange-pink stripe, stubby flippers and big black feet, and a fluffy grey chick peeking out between its feet.",
};

const BLUE = "#18203a";
const SHEEN = "#34477c";
const WHITE = "#f4f6f8";
const GOLD = "#f2b230";
const BLACK = "#121318";
const BILL = "#1d1e24";
const PINK = "#f47d5e";
const DOWN = "#8e98a4";
const DOWN_LIGHT = "#cbd2da";
const TUFT = "#a9b2bd";

/** Webbed foot on the ground: x is lateral, y is forward, origin at the ankle. */
const FOOT: number[][] = [
  [-0.065, -0.07],
  [0.065, -0.07],
  [0.08, 0.02],
  [0.085, 0.11],
  [0.04, 0.1],
  [0, 0.19],
  [-0.04, 0.1],
  [-0.085, 0.11],
  [-0.08, 0.02],
];

/** Stubby flipper: x forward, y down from the shoulder. */
const FLIPPER: number[][] = [
  [-0.035, 0],
  [0.035, 0],
  [0.042, 0.09],
  [0.03, 0.18],
  [0, 0.22],
  [-0.03, 0.18],
  [-0.042, 0.09],
];

/** Head: distance from the axis, height from the head centre. */
const HEAD: number[][] = [
  [0, -0.095],
  [0.05, -0.092],
  [0.085, -0.06],
  [0.1, -0.01],
  [0.1, 0.03],
  [0.085, 0.075],
  [0.05, 0.102],
  [0, 0.11],
];

/** Chick body: distance from the axis, height from the chick centre. */
const CHICK: number[][] = [
  [0, -0.094],
  [0.052, -0.09],
  [0.085, -0.062],
  [0.097, -0.012],
  [0.095, 0.04],
  [0.076, 0.08],
  [0.04, 0.1],
  [0, 0.108],
];

/** Back blue-black with a sheen, white front, golden collar up the neck and round the sides. */
const plumage = paint((p, n) => {
  const belly = smoothstep(0.05, 0.5, n.z) * (1 - smoothstep(0.6, 0.72, p.y));
  const collar = smoothstep(0.6, 0.8, p.y) * smoothstep(0.1, 0.5, Math.max(n.z, Math.abs(n.x)));
  const back = mix(BLUE, SHEEN, smoothstep(0.4, 1, n.y) * 0.6);
  return mix(mix(back, WHITE, belly), GOLD, collar);
});

/** Blue-black head with a golden ear patch on each side. */
const headPaint = paint((p, n) => {
  const ex = (Math.abs(p.x) - 0.085) / 0.042;
  const ey = (p.y - 0.972) / 0.05;
  const ez = p.z / 0.055;
  const ear = 1 - smoothstep(0.85, 1, Math.hypot(ex, ey, ez));
  return mix(mix(BLUE, SHEEN, smoothstep(0.4, 1, n.y) * 0.6), GOLD, ear);
});

/** Dark flipper with a white leading edge. */
const flipperPaint = paint((_p, n) => mix(BLUE, WHITE, smoothstep(0.3, 0.8, n.z)));

/** Bill: black, with an orange-pink stripe along each side following the mandible's centreline. */
const billPaint = (centre: (z: number) => number) =>
  paint((p, n) =>
    mix(BILL, PINK, smoothstep(0.0045, 0.003, Math.abs(p.y - centre(p.z))) * smoothstep(0.5, 0.8, Math.abs(n.x))),
  );
const upperLine = (z: number) => 0.972 - (0.006 * (z - 0.1)) / 0.17;
const lowerLine = (z: number) => 0.944 + (0.011 * (z - 0.1)) / 0.15;

export default function emperorAndChick() {
  const b = createBuilder({ name: "emperor-penguin-and-chick", detail: 1, paintSize: 2048 });

  // Skeleton in its rest pose: hips at the root, spine up to the chest, head on top, the lower bill on the jaw,
  // legs down to the feet, flippers held slightly out, and the chick on the hips.
  const hips = b.joint("hips", { at: [0, 0.36, 0] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.42, 0],
      [0, 0.61, 0],
      [0, 0.8, 0.015],
    ],
    { parent: hips, role: "spine", names: ["spine1", "spine2", "chest"] },
  );
  const headJoint = b.joint("head", {
    parent: "chest",
    at: [0, 0.98, 0.03],
    dir: [0, 1, -0.08],
    up: [0, 0, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: headJoint,
    at: [0, 0.944, 0.1],
    dir: [0, 0, 1],
    up: [0, 1, 0],
    role: "jaw",
  });

  const legL = b.chain(
    "legL",
    [
      [0.08, 0.34, 0],
      [0.13, 0.17, 0.01],
      [0.16, 0.03, 0.03],
    ],
    { parent: hips, role: "leg", names: ["hipL", "kneeL", "ankleL"] },
  );
  const legR = b.chain(
    "legR",
    [
      [-0.08, 0.34, 0],
      [-0.13, 0.17, 0.01],
      [-0.16, 0.03, 0.03],
    ],
    { parent: hips, role: "leg", names: ["hipR", "kneeR", "ankleR"] },
  );
  b.sweep(legL, 0.022, { color: BLACK, name: "legL" });
  b.sweep(legR, 0.022, { color: BLACK, name: "legR" });

  // Big black webbed feet lying flat on the ground.
  b.extrude(FOOT, {
    color: BLACK,
    at: [0.16, 0.013, 0.03],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.026,
    bevel: 0.006,
    bone: "ankleL",
    name: "footL",
  });
  b.extrude(FOOT, {
    color: BLACK,
    at: [-0.16, 0.013, 0.03],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.026,
    bevel: 0.006,
    bone: "ankleR",
    name: "footR",
  });

  // Stubby flippers, angled slightly out from the body.
  b.chain("wingL", [
    [0.15, 0.72, 0],
    [0.2034, 0.5066, 0],
  ], { parent: "spine2", role: "wing", names: ["wingL1", "wingLtip"] });
  b.chain("wingR", [
    [-0.15, 0.72, 0],
    [-0.2034, 0.5066, 0],
  ], { parent: "spine2", role: "wing", names: ["wingR1", "wingRtip"] });
  b.extrude(FLIPPER, {
    color: flipperPaint,
    at: [0.15, 0.72, 0],
    x: [0, 0, 1],
    y: [0.25, -1, 0],
    thickness: [0.034, 0.012],
    bevel: 0.006,
    smoothing: 1,
    bone: "wingL1",
    name: "flipperL",
  });
  b.extrude(FLIPPER, {
    color: flipperPaint,
    at: [-0.15, 0.72, 0],
    x: [0, 0, 1],
    y: [-0.25, -1, 0],
    thickness: [0.034, 0.012],
    bevel: 0.006,
    smoothing: 1,
    bone: "wingR1",
    name: "flipperR",
  });

  // Body: a loft through stations up the spine. Each station gives the width (side to side) and the depth
  // (front to back) of the body at that height; the chest sits a little forward for a proud stance.
  b.loft(
    [
      { at: [0, 0.14, 0], w: 0.1, h: 0.1 },
      { at: [0, 0.26, 0], w: 0.26, h: 0.22 },
      { at: [0, 0.4, 0], w: 0.33, h: 0.27 },
      { at: [0, 0.56, 0], w: 0.35, h: 0.29 },
      { at: [0, 0.74, 0.015], w: 0.33, h: 0.27 },
      { at: [0, 0.88, 0.03], w: 0.24, h: 0.21 },
      { at: [0, 0.97, 0.03], w: 0.16, h: 0.15 },
    ],
    { color: plumage, bone: spine, sides: 12, name: "body" },
  );

  // Head, with a black eye on each side and a small white glint.
  const headPart = b.lathe(HEAD, {
    color: headPaint,
    at: [0, 0.98, 0.03],
    bone: headJoint,
    segments: 12,
    name: "head",
  });
  const headSurface = b.surface(headPart);
  for (const side of [1, -1]) {
    const eye = headSurface.nearest([side * 0.078, 0.99, 0.09]);
    const name = side > 0 ? "eyeL" : "eyeR";
    b.stick(new THREE.SphereGeometry(0.013, 10, 8), BLACK, eye, { embed: 0.3, bone: headJoint, name });
    const glint = eye.at.clone().addScaledVector(eye.n, 0.0142).add(new THREE.Vector3(0, 0.005, 0.005));
    b.part(new THREE.SphereGeometry(0.0045, 6, 5), "#ffffff", {
      at: glint,
      bone: headJoint,
      name: `${name}Glint`,
    });
  }

  // Long slender bill: upper mandible on the head, lower mandible on the jaw, meeting along the mouth line.
  b.frustumBox([0, 0.972, 0.1], [0, 0.966, 0.27], [0.034, 0.032], [0.012, 0.012], {
    color: billPaint(upperLine),
    bone: headJoint,
    name: "billUpper",
  });
  b.frustumBox([0, 0.944, 0.1], [0, 0.955, 0.25], [0.026, 0.024], [0.01, 0.01], {
    color: billPaint(lowerLine),
    bone: jaw,
    name: "billLower",
  });

  // The chick: a grey egg-shaped body resting on the ground between the feet, its front peeking out under the belly.
  b.joint("chick", { parent: hips, at: [0, 0.094, 0.12] });
  const chickBody = b.lathe(CHICK, {
    color: mottle(DOWN, DOWN_LIGHT, { size: 0.05, seed: 5 }),
    at: [0, 0.094, 0.12],
    bone: "chick",
    segments: 12,
    name: "chickBody",
  });

  // Fluff: short tufts scattered over the chick's upper body, leaning a little.
  const random = rng(11);
  const chickSurface = b.surface(chickBody);
  const hairs = chickSurface.scatter(48, {
    rng: random,
    minDist: 0.03,
    filter: (hit) => hit.n.y > -0.35,
  });
  for (const hit of hairs) {
    const lean = new THREE.Vector3((random() - 0.5) * 0.6, (random() - 0.5) * 0.3 - 0.15, (random() - 0.5) * 0.6);
    const dir = hit.n.add(lean).normalize();
    b.spike(hit.moved([0, -0.006, 0]), dir, 0.03 + random() * 0.015, 0.014, {
      color: random() < 0.5 ? DOWN : TUFT,
      bone: "chick",
    });
  }
  for (const side of [1, -1]) {
    const eye = chickSurface.nearest([side * 0.036, 0.125, 0.2]);
    b.stick(new THREE.SphereGeometry(0.0075, 8, 6), BLACK, eye, {
      embed: 0.3,
      bone: "chick",
      name: side > 0 ? "chickEyeL" : "chickEyeR",
    });
  }
  b.spike([0, 0.13, 0.2], [0, -0.1, 1], 0.026, 0.011, { color: BILL, bone: "chick", name: "chickBill" });

  // Glossy finish: a lower roughness than the SDK's matte default on every standard material.
  const root = b.root;
  root.traverse((node) => {
    const material = (node as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
    if (material?.isMeshStandardMaterial) material.roughness = 0.4;
  });
  return root;
}
