```ts
import * as THREE from "three";
import { createBuilder, catmull, polyline, mottle, frame, offset } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "koala",
  description: "A sleepy koala hugging a eucalyptus branch, one paw raising a sprig of leaves to its mouth.",
};

// Palette: mottled ash-grey fur, cream chest and ear lining, black leathery nose, brown eyes.
const FUR = mottle("#8e9194", "#b2b4b6", { size: 0.16, contrast: 0.5 });
const BARK = mottle("#c4bbab", "#8c8276", { size: 0.09, contrast: 0.5 });
const CREAM = "#eee4cf";
const PAW = "#6b6f73";
const NOSE = "#1e1a18";
const EYE = "#4a2d1a";
const CLAW = "#24211f";
const LEAF_A = "#88b4a9";
const LEAF_B = "#5d8f88";
const STEM = "#7b8d6c";

// A lance-shaped eucalyptus leaf, drawn in metres along +x (length) and +y (width).
const LEAF: OutlinePoint[] = [
  [0, 0, "sharp"],
  [0.03, 0.013],
  [0.07, 0.009],
  [0.088, 0, "sharp"],
  [0.07, -0.008],
  [0.03, -0.012],
];

const ball = (w = 16, h = 12) => new THREE.SphereGeometry(1, w, h);
const lr = (s: number, d: number) => (s > 0 ? { left: d } : { right: d });

// Turns a leaf base and a growth direction into extrude placement.
function leafSpec(p: THREE.Vector3, d: THREE.Vector3) {
  const x = d.clone().normalize();
  const ref = Math.abs(x.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const y = ref.clone().addScaledVector(x, -ref.dot(x)).normalize();
  return { at: p, x, y };
}

export default function build() {
  const b = createBuilder({ name: "koala" });

  // ---- skeleton: hips, spine, neck, head, jaw, two arms, two legs ----
  const hips = b.joint("hips", { at: [0, 0.13, 0], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 0.13, 0], [0, 0.34, 0.02], [0, 0.48, 0.05]]), {
    parent: hips,
    names: ["spine1", "spine2", "neck"],
    role: "spine",
  });
  const chest = spine.joints[1];
  const head = b.joint("head", { parent: spine.tip!, at: [0, 0.6, 0.06], aim: [0, 0.8, 0.07], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.05, down: 0.08 }),
    aim: head.local({ forward: 0.16, down: 0.11 }),
    role: "jaw",
  });

  // ---- body: a round seated torso, a rump, and the cream chest ----
  b.part(ball(18, 12), FUR, { bone: hips, at: [0, 0.27, 0], scale: [0.2, 0.25, 0.19] });
  b.part(ball(14, 10), FUR, { bone: hips, at: [0, 0.15, -0.05], scale: [0.19, 0.15, 0.16] });
  b.part(ball(14, 10), CREAM, { bone: chest, at: [0, 0.29, 0.13], scale: [0.13, 0.15, 0.08] });

  // ---- legs: fat thigh, lower-leg tube, strong grey paw with three dark claws ----
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const leg = b.chain(`leg${k}`, polyline([[s * 0.14, 0.12, 0], [s * 0.17, 0.06, 0.13], [s * 0.13, 0.04, 0.25]]), {
      parent: hips,
      names: [`hip${k}`, `knee${k}`, `foot${k}`],
      role: "leg",
    });
    b.sweep(leg, [0.066, 0.046], { color: FUR });
    b.part(ball(), FUR, { bone: leg.joints[0], at: [s * 0.14, 0.09, 0.05], scale: [0.095, 0.09, 0.12] });
    const foot = leg.tip!;
    b.part(ball(), PAW, { bone: foot, at: [s * 0.13, 0.04, 0.27], scale: [0.066, 0.04, 0.082] });
    for (const c of [-1, 0, 1]) {
      const base = foot.local({ forward: 0.09, ...lr(s, c * 0.022), up: 0 });
      const tip = foot.local({ forward: 0.12, ...lr(s, c * 0.026), down: 0.01 });
      b.spike(base, tip, null, 0.007, { bone: foot, color: CLAW });
    }
  }

  // ---- arms: the left one wraps the branch, the right one holds the sprig to the mouth ----
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const pts =
      s > 0
        ? [[0.14, 0.38, 0.03], [0.3, 0.3, 0.1], [0.28, 0.36, 0.31], [0.13, 0.38, 0.34]]
        : [[-0.14, 0.38, 0.03], [-0.22, 0.3, 0.14], [-0.13, 0.44, 0.23], [-0.07, 0.5, 0.26]];
    const arm = b.chain(`arm${k}`, polyline(pts), {
      parent: chest,
      names: [`shoulder${k}`, `elbow${k}`, `wrist${k}`, `hand${k}`],
      role: "arm",
    });
    b.sweep(arm, [0.052, 0.038], { color: FUR });
    const hand = arm.tip!;
    b.part(ball(), PAW, { bone: hand, at: pts[3], scale: [0.05, 0.044, 0.05] });
    for (const c of [-1, 0, 1]) {
      const base = hand.local({ forward: 0.044, ...lr(s, c * 0.02), up: -0.005 });
      const tip = hand.local({ forward: 0.08, ...lr(s, c * 0.026), down: 0.02 });
      b.spike(base, tip, null, 0.0065, { bone: hand, color: CLAW });
    }

    if (s < 0) {
      // Sprig of eucalyptus: a thin stem from the paw, with leaves fanned round the mouth.
      const P0 = new THREE.Vector3(-0.07, 0.5, 0.26);
      const P1 = new THREE.Vector3(-0.04, 0.525, 0.25);
      const P2 = new THREE.Vector3(-0.005, 0.54, 0.235);
      b.sweep(polyline([P0, P1, P2]), [0.0065, 0.0045], { bone: hand, color: STEM });
      const sprig: [THREE.Vector3, [number, number, number]][] = [
        [P0.clone(), [-0.7, 0.5, 0.5]],
        [P0.clone().lerp(P1, 0.5), [-0.2, 0.9, 0.3]],
        [P1.clone(), [0.4, 0.8, 0.5]],
        [P1.clone(), [0.9, 0.2, 0.3]],
        [P2.clone(), [0.3, -0.4, 0.9]],
        [P2.clone(), [-0.5, -0.2, 0.9]],
      ];
      sprig.forEach(([p, d], i) => {
        b.extrude(LEAF, {
          ...leafSpec(p, new THREE.Vector3(...d)),
          thickness: 0.004,
          smoothing: 1,
          color: i % 2 ? LEAF_A : LEAF_B,
          bone: hand,
        });
      });
    }
  }

  // ---- head: fur ball, fluffy cream-lined ears, sleepy eyes, big nose, small mouth ----
  b.part(ball(18, 14), FUR, { bone: head, at: [0, 0.6, 0.06], scale: [0.158, 0.138, 0.138] });
  for (const s of [1, -1]) {
    const earAt = head.local({ ...lr(s, 0.12), up: 0.1, back: 0.01 });
    const out = new THREE.Vector3(s * 0.57, 0, 0.82).normalize();
    b.part(ball(), FUR, { bone: head, at: earAt, rotation: [0, s * 35, 0], scale: [0.072, 0.072, 0.02] });
    b.part(ball(12, 9), CREAM, {
      bone: head,
      at: offset(earAt, out, 0.018),
      rotation: [0, s * 35, 0],
      scale: [0.05, 0.05, 0.012],
    });
    b.ring(frame(head.moved(earAt), out), { count: 10, radius: 0.07 }, (item) => {
      b.part(ball(6, 4), FUR, { at: item, scale: [0.022, 0.022, 0.022] });
    });

    // Half-closed eye: a brown ball with a heavy fur lid covering its top half.
    const eye = head.local({ ...lr(s, 0.085), up: 0.05, forward: 0.12 });
    b.part(ball(12, 9), EYE, { bone: head, at: eye, scale: [0.024, 0.024, 0.024] });
    b.part(ball(), FUR, {
      bone: head,
      at: head.local({ ...lr(s, 0.085), up: 0.068, forward: 0.128 }),
      scale: [0.04, 0.02, 0.022],
    });
  }
  b.part(ball(14, 10), NOSE, { bone: head, at: head.local({ forward: 0.135, down: 0.02 }), scale: [0.068, 0.045, 0.048] });
  b.sweep(
    polyline([
      head.local({ left: 0.04, down: 0.068, forward: 0.11 }),
      head.local({ down: 0.075, forward: 0.124 }),
      head.local({ right: 0.04, down: 0.068, forward: 0.11 }),
    ]),
    0.0035,
    { bone: head, color: NOSE },
  );
  b.part(ball(12, 9), CREAM, { bone: jaw, at: head.local({ forward: 0.1, down: 0.1 }), scale: [0.038, 0.024, 0.03] });

  // ---- eucalyptus branch: pale bark, two knots, a twig, and leaves ----
  const branch = b.sweep(
    catmull([[0.26, 0.05, 0.34], [0.22, 0.25, 0.29], [0.19, 0.45, 0.25], [0.15, 0.7, 0.2], [0.11, 0.94, 0.18]]),
    [0.05, 0.024],
    { bone: hips, color: BARK },
  );
  for (const t of [0.3, 0.68]) {
    b.part(ball(10, 8), BARK, { bone: hips, at: branch.at(t), scale: [0.036, 0.03, 0.036] });
  }
  const twig = b.sweep(polyline([[0.15, 0.66, 0.21], [0.25, 0.78, 0.22], [0.33, 0.9, 0.2]]), [0.022, 0.008], {
    bone: hips,
    color: BARK,
  });

  // Hangs one leaf off the bark, drooping and turning with the twig.
  const hang = (p: THREE.Vector3, n: THREE.Vector3, tan: THREE.Vector3, t: number) => {
    const sgn = Math.sin(t * 41) > 0 ? 1 : -1;
    const d = n.multiplyScalar(0.8).addScaledVector(tan, sgn * 0.45).add(new THREE.Vector3(0, -0.35, 0));
    b.extrude(LEAF, {
      ...leafSpec(p, d),
      thickness: 0.0035,
      smoothing: 1,
      color: sgn > 0 ? LEAF_A : LEAF_B,
      bone: hips,
    });
  };
  b.along(branch, 9, (at) => hang(at.at.clone(), at.n.clone(), at.tangent.clone(), at.t), { from: 0.1, to: 0.95 });
  b.along(twig, 2, (at) => hang(at.at.clone(), at.n.clone(), at.tangent.clone(), at.t));

  // ---- rest pose: head nodding with sleepiness, jaw dropped mid-chew ----
  b.pose(head, { axis: [1, 0, 0], deg: 7 });
  b.pose(jaw, { axis: [1, 0, 0], deg: 12 });

  return b.root;
}
```