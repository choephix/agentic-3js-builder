import * as THREE from "three";
import { bezier, catmull, createBuilder, paint, rng } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

const FAWN = "#d9b185"; // body under the spines
const FACE = "#eccb9c"; // soft fawn face and head
const MUZZLE = "#f1dbb8"; // lower jaw
const CHESTNUT = "#8a4a2a"; // spine roots
const CREAM = "#f4e4c1"; // spine tips
const DARK = "#150e0a"; // eyes and nose
const WHITE = "#ffffff"; // catchlights
const PINK = "#f1a6ad"; // paws and toes
const EAR = "#e7a097";
const WHISKER = "#f6eedd";
const MAPLE = "#b8281f";
const VEIN = "#f2c58f";

// Maple leaf in metres: stem at the origin, counter-clockwise, five sharp lobe tips.
const LEAF: OutlinePoint[] = [
  [0.0023, 0.0],
  [0.0044, 0.03],
  [0.0383, 0.0179, "sharp"],
  [0.0174, 0.0478],
  [0.0476, 0.0723, "sharp"],
  [0.0094, 0.0648],
  [0.0, 0.105, "sharp"],
  [-0.0094, 0.0648],
  [-0.0476, 0.0723, "sharp"],
  [-0.0174, 0.0478],
  [-0.0383, 0.0179, "sharp"],
  [-0.0044, 0.03],
  [-0.0023, 0.0],
];

export const meta = {
  name: "hedgehog",
  description:
    "A plump autumn hedgehog: a dome of chestnut spines tipped in cream, a soft fawn face, and a red maple leaf stuck on its back.",
};

export default function build() {
  const b = createBuilder({ name: "hedgehog" });
  const R = rng(7);
  const SPINE = paint((_p, _n, s) => (s[0] > 0.6 ? CREAM : CHESTNUT));

  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.085, -0.03], aim: [0, 0.085, 0.02], role: "spine" });
  const head = b.joint("head", { parent: hips, at: [0, 0.08, 0.05], aim: [0, 0.072, 0.16], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.062, 0.08], aim: [0, 0.055, 0.15], role: "jaw" });

  // Body: a round loft from shoulders to a small rump
  const body = b.loft(
    [
      { at: [0, 0.088, 0.01], w: 0.1, h: 0.1 },
      { at: [0, 0.085, -0.03], w: 0.14, h: 0.12 },
      { at: [0, 0.082, -0.075], w: 0.13, h: 0.11 },
      { at: [0, 0.08, -0.108], w: 0.07, h: 0.07 },
      { at: [0, 0.079, -0.127], w: 0.025, h: 0.025 },
    ],
    { bone: hips, color: FAWN },
  );

  // Head: a soft fawn loft tapering to a pointed snout
  b.loft(
    [
      { at: [0, 0.082, 0.025], w: 0.092, h: 0.088 },
      { at: [0, 0.078, 0.09], w: 0.076, h: 0.072 },
      { at: [0, 0.073, 0.12], w: 0.05, h: 0.046 },
      { at: [0, 0.067, 0.14], w: 0.024, h: 0.02 },
      { at: [0, 0.064, 0.15], w: 0.01, h: 0.009 },
    ],
    { bone: head, color: FACE },
  );

  // Lower jaw, hinged at the back of the mouth
  b.loft(
    [
      { at: [0, 0.058, 0.08], w: 0.05, h: 0.03 },
      { at: [0, 0.052, 0.12], w: 0.03, h: 0.018 },
      { at: [0, 0.05, 0.146], w: 0.012, h: 0.009 },
    ],
    { bone: jaw, color: MUZZLE },
  );

  // Shiny black button nose with a catchlight
  b.part(new THREE.SphereGeometry(0.0125, 10, 7), DARK, {
    bone: head,
    at: [0, 0.066, 0.153],
    scale: [1.2, 0.85, 0.9],
  });
  b.part(new THREE.SphereGeometry(0.0023, 6, 4), WHITE, { bone: head, at: [0, 0.0752, 0.1575] });

  // Bright beady eyes with catchlights
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.0085, 10, 7), DARK, { bone: head, at: [s * 0.0275, 0.086, 0.105] });
    b.part(new THREE.SphereGeometry(0.0026, 6, 4), WHITE, { bone: head, at: [s * 0.0305, 0.0915, 0.1105] });
  }

  // Tiny round ears, flat discs set into the sides of the head
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.0035, 12), EAR, {
      bone: head,
      at: [s * 0.035, 0.1, 0.065],
      dir: [s * 0.9, 0.42, 0],
    });
  }

  // Twitchy whiskers fanning out from the snout
  for (const s of [1, -1]) {
    for (const k of [-1, 0, 1]) {
      const y = 0.07 + k * 0.006;
      b.sweep(
        bezier(
          [s * 0.019, y, 0.125],
          [s * 0.05, y + 0.003, 0.14],
          [s * 0.085, y + 0.001 + k * 0.006, 0.17],
        ),
        0.0007,
        { bone: head, color: WHISKER, sides: 5 },
      );
    }
  }

  // Legs: short fawn tubes that end in pink paws and toes on the floor
  const leg = (s: number, tag: string, z: number) => {
    const side = s > 0 ? "L" : "R";
    const x = s * 0.05;
    const limb = b.chain(
      `leg${tag}${side}`,
      catmull([
        [x, 0.07, z],
        [x * 1.1, 0.035, z + 0.012],
        [x * 1.12, 0.0108, z + 0.02],
      ]),
      { parent: hips, names: [`hip${tag}${side}`, `knee${tag}${side}`, `ankle${tag}${side}`], role: "leg" },
    );
    b.sweep(limb, [0.016, 0.012], { color: FAWN });
    const foot = limb.joints[limb.joints.length - 1];
    const fx = x * 1.12;
    const fz = z + 0.02;
    b.part(new THREE.SphereGeometry(0.018, 10, 7), PINK, {
      bone: foot,
      at: [fx, 0.0108, fz],
      scale: [1, 0.6, 1.25],
    });
    for (const k of [-1, 0, 1]) {
      b.part(new THREE.SphereGeometry(0.0048, 6, 4), PINK, {
        bone: foot,
        at: [fx + k * 0.0075, 0.0048, z + 0.037],
      });
    }
  };
  for (const s of [1, -1]) {
    leg(s, "F", 0.0);
    leg(s, "H", -0.075);
  }

  // Dome of spines: scattered over the back and flanks, each with a cream tip
  const up = new THREE.Vector3(0, 0.12, -1); // spines sweep backwards
  const spines = b.surface(body).scatter(480, {
    rng: R,
    minDist: 0.0085,
    filter: (h) => h.axis.y > -0.15 && h.at.z < 0.04 && h.at.z > -0.13,
  });
  for (const h of spines) {
    const dir = h.axis.clone().addScaledVector(up, 0.7).normalize();
    const len = 0.02 + R() * 0.012 + 0.006 * Math.max(0, h.axis.y);
    b.spike(h.moved([0, -0.003, 0]), dir, len, 0.0042, {
      sides: 5,
      color: SPINE,
      caps: { start: "flat", end: "point" },
    });
  }

  // The maple leaf, lying on the spines of the back with its stem pushed in
  const leaf = b.extrude(LEAF, {
    at: [0, 0.142, 0.0],
    x: [1, 0, 0],
    y: [0, 0.2, -0.98],
    thickness: 0.004,
    bevel: 0.0014,
    color: MAPLE,
    bone: hips,
  });
  const vein = (u: number, v: number) => leaf.local([u, v, 0.0028]);
  b.rod(vein(0, 0.008), vein(0, 0.092), 0.0009, { color: VEIN, bone: hips });
  for (const [u, v] of [
    [0.0383, 0.0179],
    [0.0476, 0.0723],
    [-0.0476, 0.0723],
    [-0.0383, 0.0179],
  ]) {
    b.rod(vein(0, 0.035), vein(u * 0.85, v * 0.92), 0.0007, { color: VEIN, bone: hips });
  }

  return b.root;
}
