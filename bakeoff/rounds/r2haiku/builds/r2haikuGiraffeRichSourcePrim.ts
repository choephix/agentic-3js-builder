import * as THREE from "three";
import { createBuilder, gradient, patches } from "../../../../src/index";

export const meta = {
  name: "Young reticulated giraffe",
  description:
    "A young reticulated giraffe: chestnut patches outlined in cream, a stiff brown mane, fuzzy ossicones with black tufts, big ears, long lashes and a dark tongue peeking out.",
};

export default function giraffe() {
  const b = createBuilder({ name: "giraffe", paintSize: 1024 });

  const cream = "#f4e6bf";
  const creamMuzzle = "#e9dcb4";
  const dark = "#1a120e";

  // Reticulated coat: chestnut patches with bright cream lines between them.
  const coat = patches(cream, ["#9c4f23", "#a65a2a", "#8c4520"], { size: 0.32, gap: 0.085, seed: 4 });
  // Legs: cream below the knee, fading into the patterned coat above.
  const legPaint = gradient("#efe0b8", coat, [0, 0.5, 0], [0, 1.05, 0]);

  // Root: the hips.
  b.joint("root", { at: [0, 1.7, 0] });

  // Body: a loft through stations from rump to chest.
  b.loft(
    [
      { at: [0, 1.75, -0.72], w: 0.5, h: 0.55 },
      { at: [0, 1.8, -0.2], w: 0.66, h: 0.72 },
      { at: [0, 1.8, 0.3], w: 0.58, h: 0.66 },
      { at: [0, 1.7, 0.62], w: 0.42, h: 0.5 },
    ],
    { color: coat, bone: "root", name: "body" },
  );

  // Tail with a dark switch.
  b.rod([0, 1.8, -0.72], [0, 1.38, -0.9], [0.022, 0.012], { color: "#e8d9b0", bone: "root", name: "tail" });
  b.part(new THREE.SphereGeometry(0.045, 7, 6), "#2a1c10", { at: [0, 1.34, -0.92], bone: "root" });

  // Neck: a chain ending in the head joint, skinned as one smooth tube.
  const neck = b.chain("neck", [[0, 1.9, 0.55], [0, 2.4, 0.86], [0, 2.84, 1.0]], {
    parent: "root",
    role: "neck",
    names: ["neck1", "neck2", "head"],
  });
  b.sweep(neck, {
    radius: (t: number) => [0.15 - 0.04 * t, 0.14 - 0.03 * t] as const,
    color: coat,
    name: "neck",
  });

  // Stiff brown mane down the back of the neck.
  b.along(neck, 11, (p) => {
    b.spike(p.moved({ up: 0.04, back: 0.12 }), [0, 0.4, -0.9], 0.085, 0.012, { color: "#3f2612" });
  });

  // Head: skull, muzzle, and a separate lower jaw for the open mouth.
  b.part(new THREE.BoxGeometry(0.2, 0.2, 0.3), coat, { at: [0, 2.98, 1.1], bone: "head", name: "skull" });
  b.part(new THREE.SphereGeometry(0.1, 10, 8), creamMuzzle, {
    at: [0, 2.92, 1.36],
    scale: [0.85, 0.85, 1.35],
    bone: "head",
    name: "muzzle",
  });

  b.joint("jaw", { parent: "head", at: [0, 2.86, 1.2], dir: [0, 0, 1], role: "jaw" });
  b.part(new THREE.BoxGeometry(0.12, 0.05, 0.24), creamMuzzle, { at: [0, 2.83, 1.24], bone: "jaw", name: "jaw" });
  b.rod([0, 2.82, 1.34], [0, 2.76, 1.58], [0.02, 0.01], { color: "#3d1a22", bone: "jaw", name: "tongue" });

  // Ossicones: fuzzy horn-like knobs with black tufts.
  for (const sign of [1, -1]) {
    b.capsule([sign * 0.06, 3.06, 1.05], [sign * 0.07, 3.22, 1.02], 0.022, {
      color: "#6b4a2b",
      bone: "head",
      name: "ossicone",
    });
    b.part(new THREE.SphereGeometry(0.035, 6, 5), "#1b1310", {
      at: [sign * 0.07, 3.23, 1.02],
      bone: "head",
      name: "tuft",
    });
  }

  // Big ears, flat and pointed, sweeping out and back.
  for (const sign of [1, -1]) {
    b.slab(
      [
        [sign * 0.1, 3.06, 1.16],
        [sign * 0.3, 3.1, 0.98],
        [sign * 0.1, 2.96, 1.02],
      ],
      { color: coat, thickness: 0.02, bone: "head", name: "ear" },
    );
  }

  // Eyes with a highlight and long lashes.
  for (const sign of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 8, 6), dark, { at: [sign * 0.1, 3.02, 1.14], bone: "head", name: "eye" });
    b.part(new THREE.SphereGeometry(0.008, 4, 3), "#ffffff", {
      at: [sign * 0.118, 3.035, 1.155],
      bone: "head",
      name: "glint",
    });
    for (const z of [1.11, 1.15, 1.19]) {
      b.part(new THREE.BoxGeometry(0.008, 0.04, 0.006), "#120b08", {
        at: [sign * 0.11, 3.06, z],
        rotation: [0, 0, -sign * 20],
        bone: "head",
        name: "lash",
      });
    }
  }

  // Slender legs: four chains from hip to hoof, cream fading to patterned coat.
  const legs: Array<[string, number, number]> = [
    ["foreL", 0.2, 0.35],
    ["foreR", -0.2, 0.35],
    ["hindL", 0.2, -0.5],
    ["hindR", -0.2, -0.5],
  ];
  for (const [name, x, z] of legs) {
    const leg = b.chain(
      name,
      [
        [x, 1.62, z],
        [x, 0.95, z + (z > 0 ? 0.03 : -0.05)],
        [x, 0.36, z],
        [x, 0.03, z + 0.04],
      ],
      {
        parent: "root",
        role: "leg",
        names: [`${name}Hip`, `${name}Knee`, `${name}Ankle`, `${name}Hoof`],
      },
    );
    b.sweep(leg, { radius: [0.095, 0.075, 0.05, 0.042], color: legPaint, name: `${name}Leg` });
    b.part(new THREE.CylinderGeometry(0.05, 0.056, 0.05, 8), "#2b1d12", {
      at: [x, 0.025, z + 0.035],
      bone: leg.joints[3],
      name: `${name}Hoof`,
    });
  }

  return b.root;
}
