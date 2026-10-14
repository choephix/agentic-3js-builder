```ts
import * as THREE from "three";
import { createBuilder, catmull, limb, patches } from "agentic-3js-builder";

export const meta = {
  name: "giraffe",
  description: "A standing giraffe in a rest pose: long neck, patched coat, ossicones, separate jaw.",
};

const CREAM = "#eed9a0";
const BROWN = "#7d4c24";
const MANE = "#4a2c17";
const BONE = "#e7dcc4";
const KNOB = "#3d2a1d";
const EYE = "#150e0a";
const HOOF = "#2b2118";
const TUFT = "#2e1f14";
const MUZZLE = "#d9c08a";

export default function build() {
  const b = createBuilder({ name: "giraffe" });

  // Coat: cream lines around brown blotches, shared by body, neck, head and legs.
  const coat = patches(CREAM, BROWN, { size: 0.32, gap: 0.045, seed: 7 });

  // Skeleton
  const hips = b.joint("hips", { at: [0, 2.6, -0.3] });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 2.5, -0.85],
      [0, 2.6, -0.3],
      [0, 2.62, 0.2],
      [0, 2.62, 0.45],
    ]),
    { parent: hips, role: "spine", names: ["spine1", "spine2", "spine3"] },
  );

  // Barrel body: wider over the ribs, tapering at tail and chest.
  b.sweep(spine, (t) => {
    const w = 0.25 + 0.06 * Math.sin(Math.PI * t);
    return [w, w * 0.92];
  }, { color: coat });

  // Long neck rising forward, with a short dark mane along the top.
  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.66, 0.4],
      [0, 3.2, 0.74],
      [0, 3.72, 0.98],
      [0, 4.2, 1.13],
      [0, 4.5, 1.2],
    ]),
    { parent: spine.joints[2], role: "neck", names: ["neck1", "neck2", "neck3", "neck4"] },
  );
  b.sweep(neck, (t) => 0.2 - 0.075 * t, {
    color: coat,
    sectors: [[-32, 32, MANE]],
  });

  // Head: a joint at the neck top, aimed forward and a little down.
  const head = b.joint("head", { at: neck.at(1), dir: [0, -0.15, 1], group: "head", role: "head" });
  const hp = (w: { forward?: number; up?: number; left?: number }) => head.moved(head.local(w));

  // Skull, muzzle and nose (geometry axes: x = right, y = forward, z = up).
  b.part(new THREE.BoxGeometry(0.19, 0.26, 0.2), coat, { frame: hp({ forward: 0.06, up: 0.03 }) });
  b.part(new THREE.BoxGeometry(0.15, 0.2, 0.15), coat, { frame: hp({ forward: 0.27, up: -0.01 }) });
  b.part(new THREE.BoxGeometry(0.12, 0.03, 0.12), MUZZLE, { frame: hp({ forward: 0.37, up: -0.01 }) });

  // Lower jaw on its own joint so it can open.
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.1, up: -0.07 }),
    aim: head.local({ forward: 0.4, up: -0.1 }),
    role: "jaw",
  });
  b.part(new THREE.BoxGeometry(0.11, 0.24, 0.07), MUZZLE, {
    frame: jaw.moved(jaw.local({ forward: 0.12, up: 0 })),
  });

  for (const s of [1, -1]) {
    // Ossicones: bone-coloured stalks with dark knobs.
    b.part(new THREE.CylinderGeometry(0.022, 0.03, 0.14, 6), BONE, {
      bone: head,
      at: head.local({ left: s * 0.055, up: 0.165, forward: -0.02 }),
    });
    b.part(new THREE.SphereGeometry(0.036, 6, 4), KNOB, {
      bone: head,
      at: head.local({ left: s * 0.055, up: 0.245, forward: -0.02 }),
    });

    // Ears stick out sideways.
    b.part(new THREE.BoxGeometry(0.13, 0.05, 0.07), coat, {
      frame: hp({ left: s * 0.13, up: 0.02, forward: -0.03 }),
    });

    // Large dark eyes set on the side of the skull.
    b.part(new THREE.SphereGeometry(0.032, 6, 4), EYE, {
      bone: head,
      at: head.local({ left: s * 0.1, up: 0.05, forward: 0 }),
    });
  }

  // Legs: IK from hip or shoulder to a hoof on the floor.
  const LEG_LENGTHS: [number, number, number] = [1.0, 1.0, 0.5];

  const leg = (
    s: number,
    side: string,
    root: [number, number, number],
    foot: [number, number, number],
    parent: typeof spine.joints[number],
    bends: [number, number, number][],
    names: [string, string, string, string],
  ) => {
    const pts = limb(root, foot, LEG_LENGTHS, bends);
    const chain = b.chain(`leg${side}`, pts, { parent, role: "leg", names });
    b.sweep(chain, (t) => 0.13 - 0.05 * t, { color: coat });
    b.part(new THREE.CylinderGeometry(0.1, 0.11, 0.13, 7), HOOF, {
      at: [foot[0], 0.065, foot[2]],
    });
    return s;
  };

  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";
    // Forelegs: elbow back, knee forward.
    leg(
      s,
      `F${sd}`,
      [s * 0.2, 2.45, 0.3],
      [s * 0.2, 0.08, 0.36],
      spine.joints[2],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
      [`shoulderF${sd}`, `kneeF${sd}`, `wristF${sd}`, `hoofF${sd}`],
    );
    // Hindlegs: knee forward, hock back.
    leg(
      s,
      `H${sd}`,
      [s * 0.2, 2.45, -0.6],
      [s * 0.2, 0.08, -0.66],
      spine.joints[0],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
      [`hipH${sd}`, `kneeH${sd}`, `hockH${sd}`, `hoofH${sd}`],
    );
  }

  // Tail: thin pale rope with a dark tuft.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 2.5, -0.85],
      [0, 2.3, -1.12],
      [0, 2.0, -1.28],
      [0, 1.7, -1.33],
    ]),
    { parent: hips, role: "tail", names: ["tail1", "tail2", "tail3"] },
  );
  b.sweep(tail, (t) => 0.045 - 0.015 * t, { color: CREAM });
  b.part(new THREE.SphereGeometry(0.075, 6, 5), TUFT, { frame: tail.at(1) });

  return b.root;
}
```