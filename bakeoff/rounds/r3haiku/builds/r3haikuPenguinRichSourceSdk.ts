import * as THREE from "three";
import { catmull, createBuilder, mix, paint, smoothstep } from "../../../../src/index";

export const meta = {
  name: "Emperor penguin parent with chick",
  description: "An emperor penguin standing proud over a fluffy grey chick peeking out between its feet.",
};

const PLUMAGE_DARK = "#17213b";
const PLUMAGE_WHITE = "#f3f5f7";
const GOLD = "#e7b13e";
const INK = "#121317";
const BEAK = "#1c1e25";
const STRIPE = "#f2897a";
const CHICK = "#9ca3ab";
const CHICK_FOOT = "#ef9a3a";

/** Blue-black back and head, white belly, gold ear and throat patches, painted over the body's own surface. */
const plumage = paint((p, n) => {
  const front = smoothstep(0.1, 0.5, n.z);
  const belly = front * smoothstep(0.78, 0.5, p.y);
  const base = mix(PLUMAGE_DARK, PLUMAGE_WHITE, belly);
  const earL = smoothstep(0.075, 0.055, Math.hypot(Math.abs(p.x) - 0.1, p.y - 0.93, p.z - 0.03));
  const throat = smoothstep(0.07, 0.05, Math.hypot(p.x, p.y - 0.84, p.z - 0.09));
  return mix(base, GOLD, Math.max(earL, throat));
});

/** Thick outline of a three-toed foot, drawn in the ground plane (x across, y forward). */
const FOOT: [number, number][] = [
  [-0.045, -0.05],
  [0.045, -0.05],
  [0.055, 0.0],
  [0.05, 0.07],
  [0.02, 0.13],
  [0.0, 0.09],
  [-0.02, 0.13],
  [-0.05, 0.07],
  [-0.055, 0.0],
];

/** Flipper plate in the plane of the body's side; x is mirrored per side. */
const FLIPPER: [number, number][] = [
  [0.14, 0.8],
  [0.22, 0.72],
  [0.28, 0.56],
  [0.26, 0.42],
  [0.2, 0.46],
  [0.14, 0.62],
];

const b = createBuilder({ name: "emperor-penguin-chick", paintSize: 1024 });

// Root and body spine: hips at the bottom, a neck, a head and a skull tip.
b.joint("hips", { at: [0, 0.26, 0], dir: [0, 1, 0] });

const spine = b.chain(
  "spine",
  catmull([
    [0, 0.26, 0],
    [0, 0.5, 0.03],
    [0, 0.76, 0.05],
    [0, 1.0, 0.03],
  ]),
  { parent: "hips", names: ["torso", "neck", "head", "skull"], role: "spine" },
);

b.sweep(spine, [0.15, 0.2, 0.2, 0.17, 0.1, 0.11], {
  name: "body",
  color: plumage,
  sides: 12,
});

// Legs and big black feet, one per side (+X is the creature's left).
for (const s of [1, -1]) {
  const S = s > 0 ? "L" : "R";
  const x = 0.085 * s;
  const leg = b.chain(
    `leg${S}`,
    [
      [x, 0.28, 0],
      [x, 0.13, 0.01],
      [x, 0.03, 0.02],
    ],
    { parent: "hips", names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" },
  );
  b.sweep(leg, 0.03, { name: `leg${S}`, color: INK, sides: 8 });
  b.extrude(FOOT, {
    name: `foot${S}`,
    color: INK,
    at: [x, 0.012, 0.05],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.024,
    bevel: 0.006,
    bone: `ankle${S}`,
  });
}

// Short flippers held slightly out from the shoulders.
for (const s of [1, -1]) {
  const S = s > 0 ? "L" : "R";
  b.joint(`shoulder${S}`, {
    parent: "neck",
    at: [0.16 * s, 0.76, 0],
    dir: [0.25 * s, -1, 0],
  });
  const plate = FLIPPER.map(([u, y]) => [u * s, y, 0] as [number, number, number]);
  b.slab(plate, {
    name: `flipper${S}`,
    color: PLUMAGE_DARK,
    thickness: 0.035,
    bone: `shoulder${S}`,
  });
}

// Eyes on the skull.
for (const s of [1, -1]) {
  b.part(new THREE.SphereGeometry(0.013, b.segments(8), b.segments(6)), "#050505", {
    at: [0.088 * s, 0.99, 0.085],
    bone: "skull",
    name: `eye${s > 0 ? "L" : "R"}`,
  });
}

// Long slender beak: a black upper mandible, and a lower mandible on its own jaw joint with orange-pink stripes.
b.sweep(
  [
    [0, 0.99, 0.09],
    [0, 0.972, 0.3],
  ],
  [0.028, 0.01],
  { name: "beakUpper", color: BEAK, bone: "skull", caps: "round", sides: 8 },
);

b.joint("jaw", {
  parent: "skull",
  at: [0, 0.962, 0.075],
  dir: [0, -0.05, 1],
  role: "jaw",
});
b.sweep(
  [
    [0, 0.962, 0.075],
    [0, 0.952, 0.27],
  ],
  [0.022, 0.008],
  {
    name: "beakLower",
    color: BEAK,
    bone: "jaw",
    caps: "round",
    sides: 8,
    sectors: [
      [60, 120, STRIPE],
      [240, 300, STRIPE],
    ],
  },
);

// The fluffy grey chick, between the parent's feet and a little in front of them.
b.joint("chick", { parent: "hips", at: [0, 0.11, 0.22], dir: [0, 1, 0] });

b.part(new THREE.SphereGeometry(0.1, b.segments(12), b.segments(8)), CHICK, {
  at: [0, 0.11, 0.22],
  bone: "chick",
  name: "chickBody",
});
b.part(new THREE.SphereGeometry(0.075, b.segments(10), b.segments(8)), CHICK, {
  at: [0, 0.27, 0.25],
  bone: "chick",
  name: "chickHead",
});

// Down tufts over the body, spread on a golden-angle spiral so they look fluffy.
const TUFTS = 16;
for (let i = 0; i < TUFTS; i++) {
  const y = 1 - (2 * (i + 0.5)) / TUFTS;
  const ring = Math.sqrt(1 - y * y);
  const phi = i * 2.39996;
  const dir: [number, number, number] = [ring * Math.cos(phi), y, ring * Math.sin(phi)];
  const base: [number, number, number] = [
    0.11 * dir[0],
    0.11 + 0.1 * dir[1],
    0.22 + 0.1 * dir[2],
  ];
  b.spike(base, dir, 0.035, 0.018, { color: CHICK, bone: "chick", name: `tuft${i + 1}` });
}

// Tiny beak and eyes on the chick's head.
const chickBeak = new THREE.ConeGeometry(0.018, 0.04, 6);
chickBeak.rotateX(Math.PI / 2);
b.part(chickBeak, "#f0a040", { at: [0, 0.26, 0.325], bone: "chick", name: "chickBeak" });
for (const s of [1, -1]) {
  b.part(new THREE.SphereGeometry(0.012, b.segments(6), b.segments(5)), "#050505", {
    at: [0.03 * s, 0.28, 0.31],
    bone: "chick",
    name: `chickEye${s > 0 ? "L" : "R"}`,
  });
}

// Chick feet poking out under its belly.
for (const s of [1, -1]) {
  b.extrude(
    [
      [-0.015, -0.012],
      [0.015, -0.012],
      [0, 0.02],
    ],
    {
      name: `chickFoot${s > 0 ? "L" : "R"}`,
      color: CHICK_FOOT,
      at: [0.035 * s, 0.008, 0.19],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.016,
      bone: "chick",
    },
  );
}

export default function build() {
  return b.root;
}
