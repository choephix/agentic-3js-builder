```ts
import * as THREE from "three";
import { createBuilder, bezier, catmull, limb, mottle } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

export const meta = {
  name: "elephant",
  description:
    "African elephant standing in a rest pose: barrel body on pillar legs, a long trunk, ivory tusks, fan ears and a tufted tail.",
};

const SKIN = mottle("#8f8983", "#746e68", { size: 0.35, contrast: 0.6, seed: 4 });
const SKIN_DARK = "#5f5852";
const IVORY = "#eee5cc";
const DARK = "#1d1b1a";
const NAIL = "#4a4541";
const INNER_EAR = "#b58d86";

// Ear fan drawn in (forward, up) metres, mirrored by the side it is placed on.
const EAR: OutlinePoint[] = [
  [-0.2, 0.42],
  [0.12, 0.48],
  [0.3, 0.3],
  [0.34, -0.02],
  [0.22, -0.3],
  [0.02, -0.44],
  [-0.14, -0.34],
  [-0.28, -0.08],
];
const EAR_INNER: OutlinePoint[] = [
  [-0.14, 0.3],
  [0.09, 0.34],
  [0.22, 0.22],
  [0.25, -0.01],
  [0.16, -0.22],
  [0.02, -0.32],
  [-0.1, -0.24],
  [-0.2, -0.06],
];

export default function build() {
  const b = createBuilder({ name: "elephant" });

  // Spine: the first joint is the hips root; chest is the front of the barrel.
  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.3, -1.1],
      [0, 2.35, -0.2],
      [0, 2.45, 0.6],
      [0, 2.5, 1.05],
    ]),
    { names: ["hips", "spineMid", "chest"], role: "spine" },
  );
  const hips = spine.joints[0];
  const chest = spine.joints[2];

  // Barrel body: one smooth loft along the spine.
  b.loft(
    [
      { at: [0, 2.3, -1.15], w: 0.85, h: 1.05 },
      { at: [0, 2.32, -0.5], w: 1.22, h: 1.42 },
      { at: [0, 2.38, 0.1], w: 1.36, h: 1.5 },
      { at: [0, 2.44, 0.6], w: 1.28, h: 1.45 },
      { at: [0, 2.5, 1.0], w: 0.96, h: 1.2 },
    ],
    { bone: spine, color: SKIN },
  );

  // Neck rising from the chest to the head.
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.5, 1.05],
      [0, 2.75, 1.25],
      [0, 2.95, 1.45],
    ]),
    { parent: chest, names: ["neckA", "neckB"], role: "neck" },
  );
  b.sweep(neck, [0.36, 0.3], { color: SKIN });

  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: [0, 2.95, 1.45],
    dir: [0, -0.15, 1],
    role: "head",
  });

  // Skull: a slightly elongated dome.
  b.part(new THREE.SphereGeometry(0.42, 14, 10), SKIN, {
    bone: head,
    at: head.local({ up: 0.02, forward: -0.02 }),
    scale: [1.0, 1.0, 1.1],
  });

  // Eyes, set into the side of the skull.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.034, 8, 6), DARK, {
      bone: head,
      at: head.local({ left: s * 0.25, up: 0.1, forward: 0.3 }),
    });
  }

  // Fan ears: a dark-skinned slab with a pink inner panel on the outer face.
  for (const s of [1, -1]) {
    b.extrude(EAR, {
      at: head.local({ left: s * 0.4, up: 0.05, forward: -0.02 }),
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.05,
      bevel: 0.01,
      smoothing: 1,
      color: SKIN,
      bone: head,
    });
    b.extrude(EAR_INNER, {
      at: head.local({ left: s * 0.44, up: 0.05, forward: -0.02 }),
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.012,
      color: INNER_EAR,
      bone: head,
    });
  }

  // Lower jaw on its own joint, so the mouth can open.
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.12, up: -0.3 }),
    dir: [0, 0, 1],
    role: "jaw",
  });
  b.part(new THREE.BoxGeometry(0.3, 0.12, 0.42), SKIN, {
    bone: jaw,
    at: jaw.local({ forward: 0.2, up: 0.0 }),
  });

  // Tusks: curved ivory sweeps that rise out of the upper jaw.
  for (const s of [1, -1]) {
    const tusk = bezier(
      head.local({ left: s * 0.14, up: -0.24, forward: 0.3 }),
      head.local({ left: s * 0.26, up: -0.52, forward: 0.72 }),
      head.local({ left: s * 0.3, up: -0.2, forward: 0.98 }),
    );
    b.sweep(tusk, [0.045, 0.01], {
      bone: head,
      color: IVORY,
      caps: { start: "round", end: "point" },
    });
  }

  // Trunk: a long tapering chain hanging from the front of the head, with a tip.
  const trunkRoot = head.local({ forward: 0.36, up: -0.2 });
  const trunk = b.chain(
    "trunk",
    catmull([trunkRoot, [0, 2.3, 2.05], [0, 1.7, 2.2], [0, 1.1, 2.05], [0, 0.6, 1.85]]),
    { parent: head, names: ["trunkA", "trunkB", "trunkC", "trunkD", "trunkTip"], role: "tentacle" },
  );
  b.sweep(trunk, (t: number) => 0.2 - 0.12 * t, { color: SKIN });
  const trunkTip = trunk.joints[trunk.joints.length - 1];
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 6, 4), SKIN, {
      bone: trunkTip,
      at: trunkTip.local({ left: s * 0.03, forward: 0.06 }),
    });
  }

  // Legs: two-bone IK from each hip or shoulder down to a planted foot.
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    const front = limb([s * 0.5, 1.95, 0.5], [s * 0.5, 0.22, 0.5], [1.0, 0.9], [[0, 0, 1]]);
    const legF = b.chain(`legF${L}`, front, {
      parent: chest,
      names: [`shoulderF${L}`, `elbowF${L}`, `footF${L}`],
      role: "leg",
    });
    b.sweep(legF, [0.3, 0.19], { color: SKIN });
    const footF = legF.joints[legF.joints.length - 1];
    b.part(new THREE.CylinderGeometry(0.25, 0.27, 0.22, 10), SKIN, {
      bone: footF,
      at: [s * 0.5, 0.11, 0.5],
    });
    for (const dx of [-0.13, -0.045, 0.045, 0.13]) {
      b.part(new THREE.SphereGeometry(0.05, 6, 4), NAIL, {
        bone: footF,
        at: [s * 0.5 + dx, 0.04, 0.5 + 0.24],
      });
    }

    const hind = limb([s * 0.5, 1.95, -0.9], [s * 0.5, 0.22, -0.85], [1.0, 0.9], [[0, 0, 1]]);
    const legH = b.chain(`legH${L}`, hind, {
      parent: hips,
      names: [`hipH${L}`, `kneeH${L}`, `footH${L}`],
      role: "leg",
    });
    b.sweep(legH, [0.3, 0.19], { color: SKIN });
    const footH = legH.joints[legH.joints.length - 1];
    b.part(new THREE.CylinderGeometry(0.25, 0.27, 0.22, 10), SKIN, {
      bone: footH,
      at: [s * 0.5, 0.11, -0.85],
    });
  }

  // Tail: a thin chain off the rump, finished with a dark tuft.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 2.28, -1.0],
      [0, 2.15, -1.4],
      [0, 1.8, -1.6],
      [0, 1.35, -1.55],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tailTip"], role: "tail" },
  );
  b.sweep(tail, (t: number) => 0.07 - 0.035 * t, { color: SKIN_DARK });
  const tailTip = tail.joints[tail.joints.length - 1];
  b.part(new THREE.SphereGeometry(0.06, 6, 4), DARK, { bone: tailTip, at: tailTip });

  return b.root;
}
```