import * as THREE from "three";
import { createBuilder, frame, mottle, paint, rng, smoothstep, svg } from "../../../../src/index";

export const meta = {
  name: "Emperor penguin and chick",
  description:
    "An adult emperor penguin with glossy blue-black back, white front, golden ear and neck patch, long beak and big black feet, with a fluffy grey chick between its feet.",
};

type Rgb3 = readonly [number, number, number];

const BLACK: Rgb3 = [0.035, 0.05, 0.09];
const WHITE: Rgb3 = [0.95, 0.96, 0.98];
const GOLD: Rgb3 = [0.95, 0.72, 0.22];
const FEET = "#15171c";
const WING = "#0b1020";
const EYE = "#050608";
const PEACH: Rgb3 = [1.0, 0.55, 0.38];
const DARK: Rgb3 = [0.08, 0.09, 0.11];

/** Linear blend of two sRGB colours. */
const mixc = (a: Rgb3, b: Rgb3, t: number): [number, number, number] => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

/** Back and head blue-black, white chest, golden patch on the neck and ear. */
const plumage = paint((p, n) => {
  const chest = smoothstep(0.1, 0.5, n.z) * smoothstep(0.98, 0.72, p.y);
  let c = mixc(BLACK, WHITE, chest);
  const ear = Math.hypot((Math.abs(p.x) - 0.1) / 0.08, (p.y - 0.97) / 0.075, (p.z - 0.03) / 0.1);
  c = mixc(c, GOLD, smoothstep(1.1, 0.8, ear));
  return c;
});

/** Beak: dark horn with an orange-pink stripe along its top. */
const beak = paint((_p, _n, s) => {
  const top = Math.min(s[1], 360 - s[1]) < 40 && s[0] > 0.08 ? 1 : 0;
  return top ? PEACH : DARK;
});

/** Chick fluff: soft mottled grey. */
const fluff = mottle("#8e949e", "#c9ced6", { size: 0.05, seed: 4 });

/** A grey tuft drawing, used on cards for the chick's down. */
const tuft = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
     <path d="M50 4 C62 22 80 30 90 55 C96 80 74 96 50 96 C26 96 4 80 10 55 C18 30 38 22 50 4Z" fill="#d4d8df"/>
   </svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "emperor-penguin-chick", detail: 1, paintSize: 1024 });

  // Skeleton: hips at the root, a spine, neck and head, a jaw, flippers at the shoulders, and the chick's own bone.
  b.joint("hips", { at: [0, 0.4, 0] });
  b.joint("spine", { parent: "hips", at: [0, 0.62, 0] });
  b.joint("neck", { parent: "spine", at: [0, 0.9, 0.02] });
  b.joint("head", { parent: "neck", at: [0, 1.04, 0.02], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 1.0, 0.08], role: "jaw", dir: [0, 0, 1] });
  b.joint("wingL", { parent: "spine", at: [0.2, 0.8, 0], role: "wing" });
  b.joint("wingR", { parent: "spine", at: [-0.2, 0.8, 0], role: "wing" });
  b.joint("chick", { parent: "hips", at: [0, 0, 0.27] });

  // Body: a faceted egg of revolution, its colour set by the plumage paint.
  b.lathe(
    [
      [0, 0],
      [0.13, 0.01],
      [0.19, 0.14],
      [0.22, 0.36],
      [0.22, 0.56],
      [0.2, 0.74],
      [0.15, 0.88],
      [0.08, 0.94],
      [0, 0.95],
    ],
    { color: plumage, at: [0, 0, 0], bone: "hips", segments: 14, smoothing: 0, name: "body" },
  );

  // Head, a slightly larger sphere with the plumage paint.
  b.part(new THREE.SphereGeometry(0.115, b.segments(12), b.segments(9)), plumage, {
    bone: "head",
    name: "head",
  });

  // Eyes.
  for (const sx of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.018, b.segments(8), b.segments(6)), EYE, {
      at: [sx * 0.065, 1.07, 0.11],
      bone: "head",
      name: "eye",
    });
  }

  // Beak: a long slender upper mandible with a stripe, and an orange-pink lower jaw.
  b.capsule([0, 1.035, 0.1], [0, 1.0, 0.3], [0.028, 0.01], { color: beak, bone: "head", name: "beakUpper" });
  b.capsule([0, 1.0, 0.1], [0, 0.99, 0.27], [0.02, 0.006], {
    color: "#f58f6a",
    bone: "jaw",
    name: "beakLower",
  });

  // Flippers: flat blades held slightly out from the shoulders.
  const flipper = [
    [0.18, 0.86],
    [0.24, 0.74],
    [0.28, 0.56],
    [0.3, 0.44],
    [0.27, 0.42],
    [0.22, 0.55],
    [0.18, 0.72],
  ];
  b.slab(
    flipper.map(([x, y]) => [x, y, 0]),
    { color: WING, thickness: 0.03, bone: "wingL", name: "flipperL" },
  );
  b.slab(
    flipper.map(([x, y]) => [-x, y, 0]),
    { color: WING, thickness: 0.03, bone: "wingR", name: "flipperR" },
  );

  // Big webbed black feet, toes forward.
  const foot = [
    [-0.09, -0.05],
    [0.09, -0.05],
    [0.12, 0.03],
    [0.1, 0.12],
    [0.05, 0.08],
    [0, 0.17],
    [-0.05, 0.08],
    [-0.1, 0.12],
    [-0.12, 0.03],
  ] as const;
  b.extrude(foot, {
    color: FEET,
    at: [0.1, 0.015, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.03,
    bone: "hips",
    name: "footL",
  });
  b.extrude(foot, {
    color: FEET,
    at: [-0.1, 0.015, 0],
    x: [-1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.03,
    bone: "hips",
    name: "footR",
  });

  // The chick, peeking out between the feet: a fluffy grey body and head with a tiny beak.
  b.part(new THREE.SphereGeometry(0.1, b.segments(12), b.segments(9)), fluff, {
    at: [0, 0.1, 0.27],
    bone: "chick",
    name: "chickBody",
  });
  b.part(new THREE.SphereGeometry(0.08, b.segments(12), b.segments(9)), fluff, {
    at: [0, 0.22, 0.29],
    bone: "chick",
    name: "chickHead",
  });
  for (const sx of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.013, b.segments(6), b.segments(5)), EYE, {
      at: [sx * 0.03, 0.235, 0.355],
      bone: "chick",
      name: "chickEye",
    });
  }
  b.capsule([0, 0.22, 0.36], [0, 0.2, 0.41], [0.012, 0.004], {
    color: "#f2a03d",
    bone: "chick",
    name: "chickBeak",
  });

  // Chick down: small tufts of grey cards pushed out from its body.
  const random = rng(7);
  const tufts = Array.from({ length: 16 }, () => {
    const d = new THREE.Vector3(random() * 2 - 1, random() * 1.2 - 0.2, random() * 2 - 1).normalize();
    const at = [d.x * 0.095, 0.1 + d.y * 0.095, 0.27 + d.z * 0.095];
    return frame(at, [d.x, d.y, d.z]);
  });
  b.cards(tufts, tuft, { size: 0.07, lean: 25, color: "#ffffff", bone: "chick", vary: 0.25, rng: rng(9) });

  return b.root;
}
