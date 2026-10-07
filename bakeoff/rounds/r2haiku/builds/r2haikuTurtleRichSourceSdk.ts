import * as THREE from "three";
import { createBuilder, scales } from "../../../../src/index";
import type { OutlineInput } from "../../../../src/index";

export const meta = {
  name: "Green sea turtle",
  description:
    "A green sea turtle gliding with a heart-shaped olive and caramel shell, a pale yellow plastron, a blunt scaled head with dark wise eyes, long front flippers and short rear flippers, and a remora riding under the shell.",
};

// Carapace outline in (x, z) metres: the notch at the front (+Z) is a sharp corner, the tail point at the back.
const HEART: Array<[number, number, boolean?]> = [
  [0, -0.5],
  [0.25, -0.38],
  [0.45, -0.12],
  [0.46, 0.18],
  [0.33, 0.38],
  [0.14, 0.42],
  [0, 0.3, true],
  [-0.14, 0.42],
  [-0.33, 0.38],
  [-0.46, 0.18],
  [-0.45, -0.12],
  [-0.25, -0.38],
];

function heart(k: number): OutlineInput {
  return HEART.map(([x, y, sharp]) => (sharp ? [x * k, y * k, "sharp"] : [x * k, y * k]));
}

// Plastron: a soft oval under the shell.
const plastron: OutlineInput = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2;
  return [0.33 * Math.cos(a), -0.02 + 0.44 * Math.sin(a)];
});

export default function greenSeaTurtle() {
  const b = createBuilder({ name: "green-sea-turtle", paintSize: 2048 });

  const shellPaint = scales(["#7b7a3c", "#b8803f"], "#4a2b16", { size: 0.13, width: 0.14, seed: 3 });
  const headPaint = scales(["#6b8a44", "#7b9a4e"], "#f1e6b5", { size: 0.035, width: 0.3, seed: 5 });
  const skin = "#5f7d3f";
  const flipperColor = "#4f6d3a";

  // Root bone: the shell.
  b.joint("shell", { at: [0, 0.2, 0], role: undefined });

  // Carapace: a tapered heart-shaped slab, thicker at the front, with a raised dome on top.
  const flat = { x: [1, 0, 0] as const, y: [0, 0, 1] as const };
  b.extrude(heart(1), {
    name: "carapace",
    color: shellPaint,
    at: [0, 0.2, 0],
    x: flat.x,
    y: flat.y,
    thickness: [0.07, 0.13],
    bevel: 0.035,
    smoothing: 2,
    bone: "shell",
  });
  b.extrude(heart(0.78), {
    name: "dome",
    color: shellPaint,
    at: [0, 0.25, 0],
    x: flat.x,
    y: flat.y,
    thickness: 0.09,
    bevel: 0.04,
    smoothing: 2,
    bone: "shell",
  });

  // Pale yellow belly plate under the shell.
  b.extrude(plastron, {
    name: "plastron",
    color: "#efe3a0",
    at: [0, 0.13, 0],
    x: flat.x,
    y: flat.y,
    thickness: 0.03,
    bevel: 0.01,
    smoothing: 1,
    bone: "shell",
  });

  // Neck and head.
  const neck = b.chain(
    "neck",
    [
      [0, 0.2, 0.36],
      [0, 0.25, 0.5],
      [0, 0.27, 0.62],
    ],
    { parent: "shell", names: ["neck1", "neck2"], role: "neck" },
  );
  b.sweep(neck, { radius: [0.085, 0.07], color: skin, name: "neck" });
  b.joint("head", { parent: "neck2", at: [0, 0.27, 0.62], role: "head" });

  // Blunt head with cream-edged scales.
  b.loft(
    [
      { at: [0, 0.27, 0.6], w: 0.15, h: 0.13 },
      { at: [0, 0.265, 0.72], w: 0.18, h: 0.15 },
      { at: [0, 0.255, 0.84], w: 0.15, h: 0.12 },
    ],
    { color: headPaint, bone: "head", name: "head" },
  );

  // Gentle beak.
  b.loft(
    [
      { at: [0, 0.27, 0.8], w: 0.12, h: 0.1 },
      { at: [0, 0.26, 0.9], w: 0.08, h: 0.07 },
    ],
    { color: "#d8c88a", bone: "head", name: "beak" },
  );

  // Dark wise eyes with a glint.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.022, 14, 10), "#120d08", {
      at: [s * 0.085, 0.29, 0.7],
      bone: "head",
      name: "eye",
    });
    b.part(new THREE.SphereGeometry(0.007, 8, 6), "#ffffff", {
      at: [s * 0.1, 0.3, 0.715],
      bone: "head",
      name: "glint",
    });
  }

  // Flippers, mirrored: long spread front flippers, short rear flippers.
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const m = (p: number[]) => [s * p[0], p[1], p[2]];

    const front = b.chain(
      `arm${S}`,
      [m([0.3, 0.17, 0.2]), m([0.62, 0.16, 0.14]), m([0.92, 0.15, -0.06])],
      { parent: "shell", names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "arm" },
    );
    b.sweep(front, {
      radius: (t: number): [number, number] => [0.1 - 0.04 * t, 0.018],
      color: flipperColor,
      name: `flipper${S}`,
    });

    const rear = b.chain(
      `leg${S}`,
      [m([0.22, 0.15, -0.28]), m([0.34, 0.14, -0.4]), m([0.44, 0.13, -0.5])],
      { parent: "shell", names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" },
    );
    b.sweep(rear, {
      radius: (t: number): [number, number] => [0.065 - 0.03 * t, 0.02],
      color: flipperColor,
      name: `rearFlipper${S}`,
    });
  }

  // Remora riding under the plastron: a dark slim body, a flat sucker disc, a small tail fin.
  const remora = "#3b3a36";
  b.capsule([0, 0.08, 0.12], [0, 0.08, -0.3], [0.03, 0.01], {
    color: remora,
    bone: "shell",
    name: "remora",
  });
  b.part(new THREE.SphereGeometry(0.05, 14, 8), "#2d2a26", {
    at: [0, 0.095, 0.1],
    scale: [1, 0.3, 1.6],
    bone: "shell",
    name: "suckerDisc",
  });
  b.slab(
    [
      [0, 0.08, -0.26],
      [0, 0.1, -0.37],
      [0, 0.06, -0.37],
    ],
    { color: remora, thickness: 0.006, bone: "shell", name: "remoraTail" },
  );

  return b.root;
}
