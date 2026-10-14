```ts
import * as THREE from "three";
import { createBuilder, catmull, gradient, limb, rng, svg } from "agentic-3js-builder";

export const meta = {
  name: "lion",
  description: "A proud old lion at rest with head held high, golden-to-chocolate mane, cream muzzle and belly, amber eyes, scarred brow and a dark-tufted tail.",
};

const TAWNY = "#c08a4b";
const CREAM = "#f0dcb0";
const GOLD = "#e8b75a";
const CHOC = "#4a2a17";
const AMBER = "#e39b1c";
const BLACK = "#15100c";
const DARK = "#2b1b10";
const PAD = "#5a3a22";

// One grey tuft drawing, tinted by each card's colour.
const TUFT = svg(
  `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
     <g fill="#ffffff">
       <path d="M14 80 Q8 40 16 4 Q20 30 22 80Z"/>
       <path d="M22 80 Q24 36 34 10 Q30 44 28 80Z"/>
       <path d="M6 80 Q2 50 4 30 Q12 50 12 80Z"/>
       <path d="M18 80 Q18 40 20 20 Q24 46 26 80Z"/>
     </g>
   </svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "lion" });

  // ---- Skeleton -----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.98, -0.65] });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.98, -0.65],
      [0, 1.02, -0.2],
      [0, 1.08, 0.1],
      [0, 1.12, 0.4],
    ]),
    { parent: hips, count: 4, names: ["spine1", "spine2", "spine3", "spine4"], role: "spine" },
  );
  const chest = spine.joints[spine.joints.length - 1];

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.12, 0.4],
      [0, 1.3, 0.58],
      [0, 1.46, 0.78],
    ]),
    { parent: chest, count: 2, names: ["neck1", "neck2"], role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: [0, 1.46, 0.78],
    dir: [0, 0.15, 1],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.06, up: -0.1 }),
    aim: head.local({ forward: 0.2, up: -0.12 }),
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.98, -0.66],
      [0, 0.95, -1.0],
      [0, 0.7, -1.35],
      [0, 0.35, -1.45],
      [0, 0.18, -1.42],
    ]),
    {
      parent: hips,
      count: 5,
      names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
      role: "tail",
    },
  );

  // ---- Body, neck, tail ---------------------------------------------------
  b.sweep(spine, [0.24, 0.29, 0.3, 0.26], {
    color: TAWNY,
    sectors: [[125, 235, CREAM]], // pale belly
  });
  b.sweep(neck, [0.17, 0.15, 0.14], { color: TAWNY });

  b.sweep(tail, [0.055, 0.045, 0.038, 0.032], { color: TAWNY });
  const tip = tail.joints[tail.joints.length - 1];
  b.part(new THREE.SphereGeometry(0.06, 8, 6).scale(1, 1.2, 1), CHOC, { bone: tip, at: tip.at });
  b.cards(b.ring(tip, { count: 10, radius: 0.05 }).items, TUFT, {
    size: [0.1, 0.2],
    lean: 20,
    color: CHOC,
    vary: 0.2,
    rng: rng(9),
  });

  // ---- Head ---------------------------------------------------------------
  b.part(new THREE.SphereGeometry(0.2, 14, 10).scale(0.9, 0.95, 1.05), TAWNY, {
    bone: head,
    at: head.local({ forward: 0.02, up: 0.02 }),
  });
  // Cream muzzle, broad black nose, cream lower jaw on the jaw joint.
  b.capsule(head.local({ forward: 0.08, up: -0.07 }), head.local({ forward: 0.2, up: -0.06 }), 0.07, {
    color: CREAM,
    bone: head,
  });
  b.part(new THREE.SphereGeometry(0.05, 10, 8).scale(1.4, 0.9, 0.7), BLACK, {
    bone: head,
    at: head.local({ forward: 0.2, up: 0.0 }),
  });
  b.capsule(jaw.local({ forward: 0.1, up: 0.03 }), jaw.local({ forward: 0.19, up: 0.02 }), 0.045, {
    color: CREAM,
    bone: jaw,
  });

  // Scar across the left eyebrow.
  b.capsule(
    head.local({ left: 0.05, up: 0.09, forward: 0.205 }),
    head.local({ left: 0.12, up: 0.085, forward: 0.185 }),
    0.007,
    { color: DARK, bone: head },
  );

  for (const s of [1, -1]) {
    // Amber eyes with dark pupils.
    b.part(new THREE.SphereGeometry(0.035, 10, 8).scale(1, 0.7, 0.6), AMBER, {
      bone: head,
      at: head.local({ left: s * 0.08, up: 0.04, forward: 0.19 }),
    });
    b.part(new THREE.SphereGeometry(0.016, 6, 5), BLACK, {
      bone: head,
      at: head.local({ left: s * 0.08, up: 0.04, forward: 0.205 }),
    });
    // Small rounded ears.
    b.part(new THREE.SphereGeometry(0.055, 8, 6), TAWNY, {
      bone: head,
      at: head.local({ left: s * 0.11, up: 0.17, forward: -0.02 }),
    });
  }

  // ---- Legs and paws ------------------------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Front leg: shoulder, elbow (bending back), paw.
    const shoulder: [number, number, number] = [s * 0.2, 0.98, 0.35];
    const frontPaw: [number, number, number] = [s * 0.22, 0.1, 0.5];
    const foreLimb = limb(shoulder, frontPaw, [0.47, 0.45], [[0, 0, -1]]);
    const fore = b.chain(`fore${side}`, foreLimb, {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `paw${side}`],
      role: "leg",
    });
    b.sweep(fore, [0.13, 0.085, 0.07], { color: TAWNY });
    const forePawJoint = fore.joints[fore.joints.length - 1];

    b.part(new THREE.SphereGeometry(0.085, 10, 7).scale(1.1, 0.55, 1.25), PAD, {
      bone: forePawJoint,
      at: [s * 0.22, 0.07, 0.52],
    });
    for (const dx of [-0.04, 0, 0.04]) {
      b.part(new THREE.SphereGeometry(0.028, 6, 5), DARK, {
        bone: forePawJoint,
        at: [s * 0.22 + dx, 0.05, 0.6],
      });
    }

    // Hind leg: hip, knee (forward), hock (back), paw.
    const hip: [number, number, number] = [s * 0.2, 0.98, -0.6];
    const hindPaw: [number, number, number] = [s * 0.22, 0.1, -0.4];
    const hindLimb = limb(hip, hindPaw, [0.42, 0.42, 0.16], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const hind = b.chain(`hind${side}`, hindLimb, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `hindPaw${side}`],
      role: "leg",
    });
    b.sweep(hind, [0.17, 0.11, 0.08, 0.06], { color: TAWNY });
    const hindPawJoint = hind.joints[hind.joints.length - 1];

    b.part(new THREE.SphereGeometry(0.09, 10, 7).scale(1.1, 0.55, 1.3), PAD, {
      bone: hindPawJoint,
      at: [s * 0.22, 0.07, -0.38],
    });
    for (const dx of [-0.04, 0, 0.04]) {
      b.part(new THREE.SphereGeometry(0.028, 6, 5), DARK, {
        bone: hindPawJoint,
        at: [s * 0.22 + dx, 0.05, -0.31],
      });
    }
  }

  // ---- Mane: shaggy tufts around the neck and head, gold at the face,
  // chocolate at the edges.
  const maneItems = [];
  for (const [t, radius] of [
    [0.2, 0.25],
    [0.5, 0.29],
    [0.8, 0.31],
  ] as const) {
    const ring = b.ring(neck.at(t), { count: 18, radius });
    maneItems.push(...ring.items);
  }
  b.cards(maneItems, TUFT, {
    size: [0.13, 0.3],
    lean: 35,
    bend: 20,
    vary: 0.25,
    rng: rng(5),
    color: gradient(CHOC, GOLD, [0, 1.3, 0.45], [0, 1.5, 0.95]),
  });

  return b.root;
}
```