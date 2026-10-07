```ts
import * as THREE from "three";
import { bezier, catmull, countershade, createBuilder, gradient, limb, spots } from "agentic-3js-builder";

export const meta = {
  name: "baby dragon",
  description: "A chubby green baby dragon: spotted coat, cream belly, big-eyed head, swept pink wings and a spade tail.",
};

const GREEN = "#6fc05c";
const GREEN_DARK = "#3f9150";
const BELLY = "#f8ebb4";
const HORN = "#fbf3dc";
const SPIKE = "#f4a13c";
const WING = "#f58fb4";
const WING_DEEP = "#b95ca0";
const WING_BONE = "#ffd166";
const EYE = "#fffdf7";
const IRIS = "#ffb22e";
const PUPIL = "#241f33";
const BLUSH = "#ff8fa6";
const NOSE = "#2b2236";

export default function build() {
  const b = createBuilder({ name: "baby-dragon" });

  // Coat: green with darker spots on the back, cream where the body faces down.
  const coat = countershade(spots(GREEN, GREEN_DARK, { size: 0.09, amount: 0.3, seed: 5 }), BELLY);

  // ---- Skeleton ------------------------------------------------------------
  // One curve runs from the tail tip, over the hips and chest, up the neck to
  // the base of the head. Body, neck and tail become one tube over it.
  const bodyPts: number[][] = [
    [0, 0.4, -0.62], // 0 tail tip
    [0, 0.34, -0.46], // 1
    [0, 0.33, -0.31], // 2
    [0, 0.35, -0.2], // 3
    [0, 0.38, -0.14], // 4 hips (root)
    [0, 0.41, 0.0], // 5
    [0, 0.44, 0.13], // 6 chest
    [0, 0.5, 0.22], // 7
    [0, 0.6, 0.3], // 8
    [0, 0.66, 0.36], // 9 base of the neck
  ];
  const body = catmull(bodyPts);
  const rootT = body.closestT(bodyPts[4]);
  const chestT = body.closestT(bodyPts[6]);

  const hips = b.joint("hips", { at: bodyPts[4], role: "spine" });
  const tail = b.chain("tail", body.slice(rootT, 0), { parent: hips, count: 5, role: "tail" });
  const spine = b.chain("spine", body.slice(rootT, chestT), { parent: hips, count: 2, role: "spine" });
  const neck = b.chain("neck", body.slice(chestT, 1), { parent: spine.joints[1], count: 3, role: "neck" });
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: [0, 0.7, 0.42],
    aim: [0, 0.8, 0.53],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.02, up: -0.075 }),
    aim: head.local({ forward: 0.2, up: -0.12 }),
    role: "jaw",
  });

  // ---- Body, neck and tail -------------------------------------------------
  // Cross-section (half-width, half-height) keyed at curve points, eased between.
  const keys = [
    { i: 0, rx: 0.022, ry: 0.022 },
    { i: 1, rx: 0.04, ry: 0.04 },
    { i: 2, rx: 0.058, ry: 0.058 },
    { i: 3, rx: 0.085, ry: 0.085 },
    { i: 4, rx: 0.13, ry: 0.12 },
    { i: 5, rx: 0.14, ry: 0.13 },
    { i: 6, rx: 0.15, ry: 0.14 },
    { i: 7, rx: 0.105, ry: 0.1 },
    { i: 8, rx: 0.085, ry: 0.085 },
    { i: 9, rx: 0.075, ry: 0.075 },
  ].map((k) => ({ t: body.closestT(bodyPts[k.i]), rx: k.rx, ry: k.ry }));

  const girth = (t: number): [number, number] => {
    let k = 0;
    while (k < keys.length - 2 && t > keys[k + 1].t) k++;
    const a = keys[k];
    const c = keys[k + 1];
    const u = Math.min(1, Math.max(0, (t - a.t) / (c.t - a.t)));
    const e = u * u * (3 - 2 * u);
    return [a.rx + (c.rx - a.rx) * e, a.ry + (c.ry - a.ry) * e];
  };

  const torso = b.sweep(body, girth, { bone: [tail, hips, spine, neck], color: coat, sides: 10 });

  // Dorsal spines, shrinking with the tube they sit on.
  b.along(
    torso,
    12,
    (at) => b.spike(at, at, 0.02 + 0.35 * at.radius, 0.004 + 0.12 * at.radius, { color: SPIKE }),
    { from: 0.1, to: 0.96 },
  );

  // Spade-shaped tail tip, standing in the side plane.
  const tailEnd = tail.joints[tail.joints.length - 1];
  b.extrude(
    [
      [0.012, 0],
      [-0.03, 0.042],
      [-0.1, 0, "sharp"],
      [-0.03, -0.042],
    ],
    {
      at: bodyPts[0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.016,
      bevel: 0.004,
      smoothing: 1,
      color: SPIKE,
      bone: tailEnd,
    },
  );

  // ---- Head ----------------------------------------------------------------
  b.part(new THREE.SphereGeometry(0.13, 14, 10), coat, { bone: head, scale: [1, 0.94, 1.06], flat: true });
  b.capsule(
    head.local({ forward: 0.08, up: -0.01 }),
    head.local({ forward: 0.22, up: -0.02 }),
    [0.072, 0.06],
    { bone: head, color: coat },
  );
  // Closed-mouth seam along the underside of the snout.
  b.capsule(
    head.local({ forward: 0.1, up: -0.085 }),
    head.local({ forward: 0.24, up: -0.075 }),
    0.009,
    { bone: head, color: NOSE },
  );
  // Lower jaw, hinged at the back of the mouth.
  b.capsule(jaw, head.local({ forward: 0.18, up: -0.1 }), [0.05, 0.04], { bone: jaw, color: BELLY });

  for (const s of [1, -1]) {
    // Big eyes: white ball, amber iris, dark pupil and a glint.
    b.part(new THREE.SphereGeometry(0.05, 12, 9), EYE, {
      bone: head,
      at: head.local({ left: s * 0.078, up: 0.035, forward: 0.1 }),
    });
    b.part(new THREE.SphereGeometry(0.034, 10, 8), IRIS, {
      bone: head,
      at: head.local({ left: s * 0.078, up: 0.035, forward: 0.13 }),
    });
    b.part(new THREE.SphereGeometry(0.02, 8, 6), PUPIL, {
      bone: head,
      at: head.local({ left: s * 0.078, up: 0.035, forward: 0.155 }),
    });
    b.part(new THREE.SphereGeometry(0.008, 6, 4), EYE, {
      bone: head,
      at: head.local({ left: s * 0.088, up: 0.05, forward: 0.166 }),
    });

    // Nostril and blush.
    b.part(new THREE.SphereGeometry(0.012, 6, 4), NOSE, {
      bone: head,
      at: head.local({ left: s * 0.024, up: 0.01, forward: 0.27 }),
    });
    b.part(new THREE.SphereGeometry(0.03, 8, 6), BLUSH, {
      bone: head,
      at: head.local({ left: s * 0.1, up: -0.035, forward: 0.09 }),
      scale: [1, 1, 0.4],
    });

    // Swept-back horns, eyebrow spikes and cheek frills.
    b.sweep(
      bezier(
        head.local({ left: s * 0.065, up: 0.1, forward: -0.04 }),
        head.local({ left: s * 0.1, up: 0.24, forward: -0.05 }),
        head.local({ left: s * 0.11, up: 0.2, forward: -0.17 }),
      ),
      [0.03, 0.005],
      { bone: head, color: HORN, sides: 7, caps: { start: "round", end: "point" } },
    );
    b.spike(head.local({ left: s * 0.05, up: 0.1, forward: 0.06 }), [s * 0.2, 0.85, 0.5], 0.035, 0.011, {
      bone: head,
      color: SPIKE,
    });
    b.spike(head.local({ left: s * 0.11, up: -0.04, forward: -0.04 }), [s * 0.8, -0.25, -1], 0.07, 0.016, {
      bone: head,
      color: SPIKE,
    });
  }

  // ---- Legs ----------------------------------------------------------------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    // Front leg: shoulder, elbow (bent back) and wrist; the paw is planted ahead.
    const frontPts = limb([s * 0.1, 0.36, 0.08], [s * 0.11, 0.07, 0.1], [0.17, 0.15], [[0, 0, -1]]);
    const foreleg = b.chain(`foreleg${L}`, frontPts, {
      parent: spine.joints[1],
      names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`],
      role: "arm",
    });
    b.sweep(foreleg, (t) => 0.056 - 0.016 * t, { color: coat, sides: 8 });
    const wrist = foreleg.tip!;
    b.part(new THREE.SphereGeometry(0.05, 10, 8), coat, {
      bone: wrist,
      at: [s * 0.11, 0.036, 0.14],
      scale: [1.05, 0.6, 1.35],
      flat: true,
    });
    for (const dx of [-0.02, 0, 0.02]) {
      b.spike([s * 0.11 + dx, 0.03, 0.2], [dx * 2, -0.35, 1], 0.03, 0.011, { bone: wrist, color: HORN });
    }

    // Hind leg: hip, knee (bent forward) and hock; a round paw.
    const hindPts = limb([s * 0.11, 0.36, -0.14], [s * 0.12, 0.07, -0.12], [0.17, 0.15], [[0, 0, 1]]);
    const hindleg = b.chain(`hindleg${L}`, hindPts, {
      parent: hips,
      names: [`hip${L}`, `knee${L}`, `ankle${L}`],
      role: "leg",
    });
    b.sweep(hindleg, (t) => 0.062 - 0.018 * t, { color: coat, sides: 8 });
    const ankle = hindleg.tip!;
    b.part(new THREE.SphereGeometry(0.055, 10, 8), coat, {
      bone: ankle,
      at: [s * 0.12, 0.036, -0.09],
      scale: [1.1, 0.6, 1.35],
      flat: true,
    });
    for (const dx of [-0.02, 0, 0.02]) {
      b.spike([s * 0.12 + dx, 0.03, -0.03], [dx * 2, -0.35, 1], 0.03, 0.011, { bone: ankle, color: HORN });
    }
  }

  // ---- Wings ---------------------------------------------------------------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const shoulder = [s * 0.1, 0.52, 0.06];
    const elbow = [s * 0.26, 0.7, 0.1];
    const wr = [s * 0.4, 0.76, -0.04];

    // Arm bone and three fingers fanning from the wrist.
    const wing = b.chain(`wingArm${L}`, [shoulder, elbow, wr], {
      parent: spine.joints[1],
      names: [`wingShoulder${L}`, `wingElbow${L}`, `wingWrist${L}`],
      role: "wing",
    });
    b.sweep(wing, [0.03, 0.02], { color: WING_BONE, sides: 6 });
    const wristJ = wing.tip!;

    const fingerA = b.chain(`wingFingerA${L}`, [wr, [s * 0.7, 0.93, 0.1]], { parent: wristJ, role: "digit" });
    const fingerB = b.chain(`wingFingerB${L}`, [wr, [s * 0.78, 0.8, -0.1]], { parent: wristJ, role: "digit" });
    const fingerC = b.chain(`wingFingerC${L}`, [wr, [s * 0.62, 0.66, -0.34]], { parent: wristJ, role: "digit" });
    for (const f of [fingerA, fingerB, fingerC]) {
      b.sweep(f, [0.016, 0.01], { color: WING_BONE, sides: 6 });
    }
    // Thumb claw at the wrist.
    b.spike(wr, [s * 0.2, 0.8, 0.5], 0.035, 0.01, { bone: wristJ, color: HORN });

    // Membrane: arm to first finger, between fingers, and back to the flank.
    const skin = gradient(WING, WING_DEEP, [s * 0.1, 0.6, 0], [s * 0.6, 0.85, 0]);
    b.membrane(wing, fingerA, { thickness: 0.012, color: skin });
    b.membrane(fingerA, fingerB, { thickness: 0.012, color: skin, scallop: 0.1 });
    b.membrane(fingerB, fingerC, { thickness: 0.012, color: skin, scallop: 0.12 });
    b.membrane(fingerC, [wr, [s * 0.18, 0.56, -0.12], [s * 0.1, 0.44, -0.14]], {
      thickness: 0.012,
      color: skin,
      scallop: 0.1,
    });
  }

  return b.root;
}
```