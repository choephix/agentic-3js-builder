import * as THREE from "three";
import { createBuilder, catmull, scales } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "Green sea turtle",
  description:
    "A green sea turtle gliding through the water, with a heart-shaped olive and caramel shell, a pale belly plate, long front flippers, short rear flippers and a remora riding beneath.",
};

const OLIVE = "#5d6b2c";
const CARAMEL = "#b9803f";
const DARKBROWN = "#3e2616";
const CREAM = "#f2e8c4";
const SKIN = "#6f7d3b";
const FLIPPER = "#4e5a2b";
const PALE = "#efe08a";
const DARK = "#120e0b";
const BEAK = "#d8c27e";
const REMORA = "#3a3c3a";
const DISC = "#252725";

// Heart-shaped carapace outline, seen from above: notch at the front (+Z), point at the back.
const HEART: OutlinePoint[] = [
  [0, -0.5, "sharp"],
  [0.26, -0.22],
  [0.46, 0.04],
  [0.42, 0.3],
  [0.24, 0.42],
  [0.08, 0.36],
  [0, 0.22, "sharp"],
  [-0.08, 0.36],
  [-0.24, 0.42],
  [-0.42, 0.3],
  [-0.46, 0.04],
  [-0.26, -0.22],
];

// Smaller oval belly plate.
const PLASTRON: OutlinePoint[] = [
  [0.25, -0.3],
  [0.3, 0],
  [0.22, 0.25],
  [0, 0.3],
  [-0.22, 0.25],
  [-0.3, 0],
  [-0.25, -0.3],
  [0, -0.4],
];

export default function build() {
  const b = createBuilder({ name: "green sea turtle" });

  // Paints: olive and caramel plates traced in dark brown.
  const shellPaint = scales([OLIVE, CARAMEL], DARKBROWN, { size: 0.16 });
  const headPaint = scales(OLIVE, CREAM, { size: 0.05 });

  // Skeleton root at the middle of the shell.
  const hips = b.joint("hips", { at: [0, 0.66, 0] });

  // Carapace: heart-shaped plate with rounded rims, plus a low dome above it.
  b.extrude(HEART, {
    at: [0, 0.7, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.12,
    bevel: 0.04,
    smoothing: 1,
    color: shellPaint,
    bone: hips,
    name: "carapace",
  });
  b.part(new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), shellPaint, {
    bone: hips,
    at: [0, 0.7, 0],
    scale: [0.36, 0.17, 0.42],
    name: "carapaceDome",
  });

  // Pale yellow belly plate hanging under the shell.
  b.extrude(PLASTRON, {
    at: [0, 0.63, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.03,
    bevel: 0.01,
    smoothing: 1,
    color: PALE,
    bone: hips,
    name: "plastron",
  });

  // Neck chain: four points, so three spans plus a tip joint that carries the head.
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.66, 0.25],
      [0, 0.64, 0.4],
      [0, 0.62, 0.52],
      [0, 0.6, 0.6],
    ]),
    { parent: hips, names: ["neck1", "neck2", "neck3", "head"], role: "neck" },
  );
  const head = neck.tip ?? neck.joints[neck.joints.length - 1];
  b.sweep(neck, (t: number) => 0.07 - 0.01 * t, { color: SKIN, name: "neck" });

  // Blunt head with cream-edged scales.
  b.part(new THREE.SphereGeometry(0.1, 14, 10), headPaint, {
    bone: head,
    at: head.local({ forward: 0.02 }),
    scale: [1.0, 0.85, 1.2],
    name: "head",
  });

  // Gentle beak.
  b.part(new THREE.SphereGeometry(0.04, 8, 6), BEAK, {
    bone: head,
    at: head.local({ forward: 0.11, up: -0.02 }),
    scale: [1.3, 0.55, 1.0],
    name: "beak",
  });

  // Dark wise eyes with a small highlight.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.024, 8, 6), DARK, {
      bone: head,
      at: head.local({ left: s * 0.085, up: 0.03, forward: 0.06 }),
      name: `eye${s > 0 ? "L" : "R"}`,
    });
    b.part(new THREE.SphereGeometry(0.008, 5, 4), CREAM, {
      bone: head,
      at: head.local({ left: s * 0.092, up: 0.04, forward: 0.075 }),
      name: `eyeGlint${s > 0 ? "L" : "R"}`,
    });
  }

  // Long front flippers spread wide, and short rear flippers.
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    const front = b.chain(
      `shoulder${S}`,
      catmull([
        [0.18 * s, 0.64, 0.2],
        [0.45 * s, 0.62, 0.24],
        [0.75 * s, 0.6, 0.1],
        [0.92 * s, 0.58, -0.12],
      ]),
      {
        parent: hips,
        names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `finger${S}`],
        up: [0, 1, 0],
        role: "arm",
      },
    );
    b.sweep(front, (t: number) => [0.12 - 0.08 * t, 0.014], { color: FLIPPER, name: `frontFlipper${S}` });

    const rear = b.chain(
      `hip${S}`,
      catmull([
        [0.2 * s, 0.6, -0.18],
        [0.34 * s, 0.6, -0.34],
        [0.3 * s, 0.6, -0.46],
      ]),
      {
        parent: hips,
        names: [`hip${S}`, `knee${S}`, `foot${S}`],
        up: [0, 1, 0],
        role: "leg",
      },
    );
    b.sweep(rear, (t: number) => [0.07 - 0.03 * t, 0.012], { color: FLIPPER, name: `rearFlipper${S}` });
  }

  // Stubby tail.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.6, -0.4],
      [0, 0.59, -0.55],
      [0, 0.58, -0.66],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tailTip"], role: "tail" },
  );
  b.sweep(tail, (t: number) => 0.035 * (1 - t) + 0.01, { color: SKIN, name: "tail" });

  // Remora riding under the shell: slim body, sucking disc on top, forked tail.
  b.sweep(
    catmull([
      [0, 0.57, 0.22],
      [0, 0.57, 0],
      [0, 0.57, -0.3],
    ]),
    (t: number) => 0.045 - 0.03 * t,
    { bone: hips, color: REMORA, name: "remoraBody" },
  );
  b.part(new THREE.CylinderGeometry(0.05, 0.045, 0.01, 10), DISC, {
    bone: hips,
    at: [0, 0.61, 0.18],
    name: "remoraDisc",
  });
  b.extrude(
    [
      [-0.02, 0],
      [0, 0.06],
      [0.02, 0],
      [0, -0.06],
    ],
    {
      at: [0, 0.57, -0.3],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.008,
      color: REMORA,
      bone: hips,
      name: "remoraTail",
    },
  );

  return b.root;
}
