```ts
import * as THREE from "three";
import { createBuilder, catmull, polyline, limb, countershade } from "agentic-3js-builder";

export const meta = {
  name: "Baby Dragon",
  description: "A stubby, big-headed baby dragon with small wings, a spade tail and horns, rigged in a rest pose.",
};

const GREEN = "#5fae5a";
const CREAM = "#f3dca6";
const ORANGE = "#e8743b";
const HORN = "#f2e6c8";
const DARK = "#1b1b24";
const EYE = "#ffd84a";
const SPIKE = "#d9553a";

export default function build() {
  const b = createBuilder({ name: "babyDragon" });
  const skin = countershade(GREEN, CREAM, { level: -0.25 });

  const hips = b.joint("hips", { at: [0, 0.32, -0.12], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([[0, 0.32, -0.12], [0, 0.34, 0.05], [0, 0.36, 0.2]]),
    { parent: hips, count: 2, role: "spine" },
  );
  const body = b.sweep(spine, [0.11, 0.15, 0.13], { color: skin });
  const chest = spine.joints[spine.joints.length - 1];

  // neck
  const neck = b.chain(
    "neck",
    catmull([[0, 0.36, 0.2], [0, 0.46, 0.27], [0, 0.55, 0.31]]),
    { parent: chest, count: 2, role: "neck" },
  );
  const neckTube = b.sweep(neck, [0.09, 0.065], { color: skin });

  // head
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: [0, 0.57, 0.32],
    dir: [0, 0.05, 1],
    role: "head",
  });
  b.part(new THREE.SphereGeometry(0.115, 10, 8), GREEN, {
    bone: head, at: head.local({ forward: 0.03, up: 0.02 }), scale: [1.05, 0.95, 1], flat: true,
  });
  b.frustumBox(
    head.local({ forward: 0.07, up: 0 }),
    head.local({ forward: 0.2, up: -0.005 }),
    [0.13, 0.075], [0.09, 0.06],
    { bone: head, color: GREEN },
  );
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.04, down: 0.05 }),
    aim: head.local({ forward: 0.2, down: 0.05 }),
    role: "jaw",
  });
  b.frustumBox(
    head.local({ forward: 0.05, down: 0.055 }),
    head.local({ forward: 0.19, down: 0.055 }),
    [0.105, 0.03], [0.075, 0.028],
    { bone: jaw, color: CREAM },
  );
  for (const s of [1, -1]) {
    // nostrils, fangs
    b.part(new THREE.SphereGeometry(0.012, 5, 4), DARK, {
      bone: head, at: head.local({ left: s * 0.025, forward: 0.2, up: 0.012 }),
    });
    b.spike(head.local({ left: s * 0.04, forward: 0.16, down: 0.035 }), [0, -1, 0], 0.025, 0.008, { bone: head, color: "#ffffff" });
    b.spike(jaw.local({ left: s * 0.03, forward: 0.12, up: 0.0 }), [0, 1, 0], 0.022, 0.007, { bone: jaw, color: "#ffffff" });
    // eyes
    b.part(new THREE.SphereGeometry(0.042, 8, 6), EYE, {
      bone: head, at: head.local({ left: s * 0.07, up: 0.06, forward: 0.07 }),
    });
    b.part(new THREE.SphereGeometry(0.022, 6, 5), DARK, {
      bone: head, at: head.local({ left: s * 0.092, up: 0.062, forward: 0.093 }), scale: [0.7, 1.3, 0.8],
    });
    // horns
    b.spike(head.local({ left: s * 0.05, up: 0.09, forward: -0.02 }), [s * 0.25, 0.8, -0.6], 0.14, 0.028, { bone: head, color: HORN, sides: 6 });
    // ear frills
    b.spike(head.local({ left: s * 0.1, up: 0.0, forward: -0.03 }), [s * 1, 0.2, -0.5], 0.09, 0.02, { bone: head, color: ORANGE, sides: 5 });
  }

  // tail
  const tail = b.chain(
    "tail",
    catmull([[0, 0.32, -0.12], [0, 0.3, -0.35], [0, 0.22, -0.6], [0, 0.15, -0.82]]),
    { parent: hips, count: 4, role: "tail" },
  );
  const tailTube = b.sweep(tail, [0.085, 0.012], { color: skin });
  const tailEnd = tail.joints[tail.joints.length - 1];
  b.extrude(
    [[0, 0], [0.06, 0.07, "sharp"], [0.14, 0, "sharp"], [0.06, -0.07, "sharp"]],
    { at: [0, 0.155, -0.83], x: [0, -0.2, -1], y: [0, 1, -0.2], thickness: 0.012, color: ORANGE, bone: tailEnd },
  );

  // back spikes
  b.along(tailTube, 6, (at) => b.spike(at, at, 0.06, 0.022, { color: SPIKE, sides: 5 }), { from: 0.05, to: 0.85 });
  b.along(body, 3, (at) => b.spike(at, at, 0.06, 0.025, { color: SPIKE, sides: 5 }), { from: 0.1, to: 0.9 });
  b.along(neckTube, 2, (at) => b.spike(at, at, 0.05, 0.02, { color: SPIKE, sides: 5 }), { from: 0.2, to: 0.8 });

  // legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const front = limb([s * 0.12, 0.3, 0.17], [s * 0.13, 0.03, 0.22], [0.14, 0.15], [[0, 0, -1]]);
    const fl = b.chain(`legF${side}`, front, {
      parent: spine.joints[1], names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "leg",
    });
    b.sweep(fl, [0.06, 0.04], { color: skin });
    const hind = limb([s * 0.13, 0.3, -0.14], [s * 0.14, 0.03, -0.1], [0.13, 0.13, 0.1], [[0, 0, 1], [0, 0, -1]]);
    const hl = b.chain(`legH${side}`, hind, {
      parent: hips, names: [`hip${side}`, `knee${side}`, `hock${side}`, `ankle${side}`], role: "leg",
    });
    b.sweep(hl, [0.075, 0.04], { color: skin });
    for (const [leg, x, z] of [[fl, s * 0.13, 0.22], [hl, s * 0.14, -0.1]] as const) {
      const tip = leg.tip!;
      b.part(new THREE.SphereGeometry(0.06, 8, 6), GREEN, {
        bone: tip, at: [x, 0.03, z + 0.03], scale: [1, 0.5, 1.3], flat: true,
      });
      for (let i = -1; i <= 1; i++) {
        b.spike([x + i * 0.03, 0.028, z + 0.07], [i * 0.15, -0.2, 1], 0.05, 0.013, { bone: tip, color: HORN, sides: 5 });
      }
    }

    // wings
    const arm = b.chain(
      `wing${side}`,
      catmull([[s * 0.09, 0.46, 0.08], [s * 0.22, 0.56, 0.02], [s * 0.33, 0.62, -0.03]]),
      { parent: spine.joints[1], names: [`wingShoulder${side}`, `wingElbow${side}`, `wingWrist${side}`], role: "wing" },
    );
    b.sweep(arm, [0.026, 0.016], { color: GREEN });
    const wrist = arm.tip!;
    const tips = [
      [s * 0.62, 0.72, -0.1],
      [s * 0.56, 0.56, -0.25],
      [s * 0.4, 0.42, -0.24],
    ];
    const fingers = tips.map((t, i) => {
      const f = b.chain(`finger${i + 1}${side}`, polyline([[s * 0.33, 0.62, -0.03], t]), {
        parent: wrist, names: [`finger${i + 1}${side}`], role: "digit",
      });
      b.sweep(f, [0.012, 0.004], { color: GREEN, caps: { end: "point" } });
      return f;
    });
    b.spike([s * 0.33, 0.62, -0.03], [s * 0.4, 0.3, 0.6], 0.07, 0.015, { bone: wrist, color: HORN });
    b.membrane(fingers[0], fingers[1], { color: ORANGE, thickness: 0.008, scallop: 0.15 });
    b.membrane(fingers[1], fingers[2], { color: ORANGE, thickness: 0.008, scallop: 0.15 });
    b.membrane(fingers[2], [[s * 0.33, 0.62, -0.03], [s * 0.1, 0.4, -0.1]], {
      color: ORANGE, thickness: 0.008, bone: spine.joints[0],
    });
  }

  // belly plates
  for (let i = 0; i < 4; i++) {
    const z = -0.05 + i * 0.07;
    b.part(new THREE.BoxGeometry(0.15, 0.015, 0.05), "#e6c987", {
      bone: spine.joints[i < 2 ? 0 : 1], at: [0, 0.205 - 0.003 * (i === 3 ? 1 : 0) + 0.005, z], flat: true,
    });
  }

  return b.root;
}
```