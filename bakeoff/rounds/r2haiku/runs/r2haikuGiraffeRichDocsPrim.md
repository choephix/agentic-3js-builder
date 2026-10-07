```ts
import * as THREE from "three";
import { createBuilder, catmull, limb, patches, gradient } from "agentic-3js-builder";

const CHESTNUT = "#8c4a22";
const CREAM = "#f4e7c9";
const MANE = "#4a2c18";
const DARK = "#1b120c";
const LASH = "#120c08";
const HOOF = "#2a2019";
const OSSICONE = "#6b4a2e";
const TONGUE = "#3e1a24";

// Chestnut patches split by bright cream lines.
const BODY = patches(CREAM, CHESTNUT, { size: 0.3, gap: 0.04, seed: 11 });

const EAR: [number, number][] = [
  [0, 0],
  [0.1, 0.05],
  [0.22, 0.05],
  [0.28, -0.01],
  [0.2, -0.05],
  [0.06, -0.05],
];

export const meta = {
  name: "Reticulated giraffe calf",
  description: "A young reticulated giraffe with chestnut patches outlined in cream, a stiff mane, fuzzy ossicones and a long dark tongue.",
};

export default function build() {
  const b = createBuilder({ name: "giraffe" });

  // Skeleton: root at the rump, spine up to the withers, neck up to the head.
  const hips = b.joint("hips", { at: [0, 1.85, -0.7], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 1.85, -0.7], [0, 1.9, -0.25], [0, 1.97, 0.15], [0, 2.02, 0.4]]), {
    parent: hips,
    names: ["back1", "back2", "withers"],
    role: "spine",
  });
  const neck = b.chain("neck", catmull([[0, 2.02, 0.4], [0, 2.3, 0.55], [0, 2.6, 0.72], [0, 2.92, 0.86]]), {
    parent: spine.joints[2],
    names: ["neck1", "neck2", "neck3"],
    role: "neck",
  });
  const head = b.joint("head", {
    parent: neck.joints[2],
    at: [0, 2.92, 0.86],
    aim: [0, 2.95, 1.3],
    role: "head",
  });
  const tail = b.chain("tail", catmull([[0, 1.85, -0.72], [0, 1.7, -0.86], [0, 1.45, -0.92]]), {
    parent: hips,
    names: ["tail1", "tail2"],
    role: "tail",
  });

  // Body barrel and neck, skinned smoothly along their chains.
  b.sweep(spine, (t) => [0.19 + 0.06 * Math.sin(Math.PI * t), 0.25 + 0.05 * Math.sin(Math.PI * t)], { color: BODY });
  const neckTube = b.sweep(neck, [0.16, 0.1], { color: BODY });

  // Short stiff mane down the top of the neck.
  b.along(neckTube, 14, (at) => b.spike(at, at, 0.085, 0.02, { color: MANE }));

  // Tail with a dark tuft.
  b.sweep(tail, [0.03, 0.012], { color: BODY });
  b.part(new THREE.SphereGeometry(0.04, 6, 4), DARK, { bone: tail.joints[1], at: [0, 1.4, -0.93] });

  // Head: skull, pale muzzle, tongue peeking out.
  b.part(new THREE.BoxGeometry(0.2, 0.22, 0.28), BODY, { bone: head, at: [0, 2.95, 0.98] });
  b.part(new THREE.BoxGeometry(0.13, 0.12, 0.16), CREAM, { bone: head, at: [0, 2.9, 1.14] });
  b.capsule([0, 2.86, 1.2], [0, 2.8, 1.38], [0.018, 0.011], { color: TONGUE, bone: head });

  for (const s of [1, -1]) {
    // Big leaf ears sticking out sideways.
    b.extrude(EAR, {
      at: [s * 0.1, 3.0, 0.9],
      x: [s, 0, 0],
      y: [0, 0, -1],
      thickness: 0.022,
      bevel: 0.006,
      smoothing: 1,
      color: BODY,
      bone: head,
    });

    // Eye with a ring of long lashes on its upper lid.
    const eye = b.part(new THREE.SphereGeometry(0.035, 8, 6), DARK, {
      bone: head,
      at: [s * 0.105, 3.02, 1.02],
      dir: [s, 0, 0],
    });
    b.ring(eye, { count: 7, radius: 0.03, fromDeg: -75, toDeg: 75, tilt: 35 }, (lash) =>
      b.spike(lash, lash, 0.05, 0.006, { color: LASH }),
    );

    // Fuzzy ossicone with a black tuft on top.
    const base: [number, number, number] = [s * 0.05, 3.05, 0.9];
    const tip: [number, number, number] = [s * 0.06, 3.2, 0.86];
    b.capsule(base, tip, [0.024, 0.017], { color: OSSICONE, bone: head });
    const offsets: [number, number, number][] = [
      [0, 0.02, 0],
      [0.02, 0.0, 0.012],
      [-0.02, 0.0, 0.012],
      [0, 0.0, -0.02],
    ];
    for (const [dx, dy, dz] of offsets) {
      b.part(new THREE.SphereGeometry(0.028, 6, 4), DARK, {
        bone: head,
        at: [tip[0] + dx, tip[1] + dy, tip[2] + dz],
      });
    }
  }

  // Slender legs: patched above, fading to cream toward the hooves.
  const leg = (
    name: string,
    parent: typeof hips,
    top: [number, number, number],
    foot: [number, number, number],
    bends: number[][],
    names: string[],
  ) => {
    const pts = limb(top, foot, [0.6, 0.6, 0.5], bends);
    const chain = b.chain(name, pts, { parent, names, role: "leg" });
    const x = top[0];
    const z = top[2];
    b.sweep(chain, [0.075, 0.034], {
      color: gradient(BODY, CREAM, [x, 0.9, z], [x, 0.35, z]),
    });
    b.part(new THREE.CylinderGeometry(0.055, 0.065, 0.1, 7), HOOF, {
      bone: chain.tip!,
      at: [foot[0], 0.05, foot[2]],
    });
  };

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    leg(
      `front${side}`,
      spine.joints[2],
      [s * 0.14, 1.7, 0.25],
      [s * 0.17, 0.05, 0.36],
      [
        [0, 0, 1],
        [0, 0, 1],
      ],
      [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hoof${side}`],
    );
    leg(
      `hind${side}`,
      hips,
      [s * 0.14, 1.7, -0.5],
      [s * 0.17, 0.05, -0.58],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
      [`hip${side}`, `knee${side}`, `hock${side}`, `hoofHind${side}`],
    );
  }

  return b.root;
}
```