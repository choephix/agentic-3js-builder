import * as THREE from "three";
import { createBuilder, grain, mottle, paint, rng, svg } from "../../../../src/index";

export const meta = {
  name: "Forest spirit",
  description: "A tall, antlered woodland spirit: bark body, moss shoulders, a leafy crown and a hanging cloak of leaves.",
};

export default function forestSpirit() {
  const b = createBuilder({ name: "forest-spirit", detail: 1, paintSize: 1024 });
  const R = rng(7);

  // Paints: bark grain on the body, mossy mottle where the light falls from above.
  const bark = grain("#5a3d27", "#80593a", { size: 0.035, axis: "y", seed: 2 });
  const moss = mottle("#3d6d2b", "#74a640", { size: 0.12, seed: 5 });
  const skin = paint((p, n) => (n.y > 0.45 ? moss : bark));
  const antler = "#d4c8a8";
  const dark = "#2a1e15";
  const glow = "#d8fff2";
  const berry = "#c9483a";
  const shroom = "#ecdcb8";

  // Leaves, drawn as SVG and used as cut-out textures.
  const leafA = svg(
    `<svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 4 C92 42 96 112 50 156 C6 112 8 42 50 4Z" fill="#8fd35a"/>
      <path d="M50 14 L50 146" stroke="#2c5a22" stroke-width="5" fill="none"/>
      <path d="M50 50 L28 70 M50 80 L24 102 M50 50 L72 70 M50 80 L76 102" stroke="#3f7a2e" stroke-width="3" fill="none"/>
    </svg>`,
  );
  const leafB = svg(
    `<svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 2 C96 36 90 120 50 158 C10 120 4 36 50 2Z" fill="#c7e274"/>
      <path d="M50 12 L50 148" stroke="#5b7d25" stroke-width="4" fill="none"/>
      <path d="M50 60 L72 44 M50 92 L78 80" stroke="#6f9a2e" stroke-width="3" fill="none"/>
    </svg>`,
  );

  // Skeleton: spine and head.
  const hips = b.joint("hips", { at: [0, 0.98, 0], dir: [0, 1, 0], role: "spine" });
  const chest = b.joint("chest", { parent: hips, at: [0, 1.26, 0], dir: [0, 1, 0], role: "spine" });
  const neck = b.joint("neck", { parent: chest, at: [0, 1.5, 0], dir: [0, 1, 0], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.7, 0], dir: [0, 1, 0], role: "head" });

  // Torso: a smooth loft through stations, skinned across hips, chest and neck.
  b.loft(
    [
      { at: [0, 0.92, 0], w: 0.3, h: 0.22 },
      { at: [0, 1.1, 0], w: 0.26, h: 0.2 },
      { at: [0, 1.32, 0], w: 0.36, h: 0.26 },
      { at: [0, 1.5, 0], w: 0.3, h: 0.2 },
      { at: [0, 1.6, 0], w: 0.12, h: 0.11 },
    ],
    { color: skin, bone: [hips, chest, neck] },
  );

  // Head: a bark sphere with a carved brow, a knot of a nose and two glowing eyes.
  b.part(new THREE.SphereGeometry(0.13, b.segments(16), b.segments(12)), skin, {
    bone: head,
    at: [0, 1.72, 0],
    scale: [0.92, 1.05, 0.95],
  });
  b.part(new THREE.BoxGeometry(0.1, 0.018, 0.03), bark, { bone: head, at: [0, 1.79, 0.12] });
  b.part(new THREE.ConeGeometry(0.018, 0.05, b.segments(6)), bark, {
    bone: head,
    at: [0, 1.7, 0.135],
    aim: [0, 1.66, 0.17],
  });

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    // Eyes: dark sockets with a soft glow.
    b.part(new THREE.SphereGeometry(0.036, b.segments(8), b.segments(6)), dark, {
      bone: head,
      at: [s * 0.05, 1.73, 0.108],
      scale: [1, 1, 0.4],
    });
    b.part(new THREE.SphereGeometry(0.024, b.segments(8), b.segments(6)), glow, {
      bone: head,
      at: [s * 0.05, 1.73, 0.118],
    });

    // Antlers: a main tine and a branch, each one tube, with bud tips.
    b.sweep(
      [
        [s * 0.05, 1.8, 0.0],
        [s * 0.1, 1.96, -0.01],
        [s * 0.16, 2.12, -0.03],
        [s * 0.22, 2.2, -0.02],
      ],
      { radius: [0.026, 0.018, 0.009], color: antler, bone: head },
    );
    b.sweep(
      [
        [s * 0.1, 1.96, -0.01],
        [s * 0.22, 2.02, 0.03],
        [s * 0.29, 2.1, 0.07],
      ],
      { radius: [0.016, 0.007], color: antler, bone: head },
    );
    b.part(new THREE.SphereGeometry(0.03, b.segments(8), b.segments(6)), moss, {
      bone: head,
      at: [s * 0.22, 2.2, -0.02],
    });
    b.part(new THREE.SphereGeometry(0.026, b.segments(8), b.segments(6)), berry, {
      bone: head,
      at: [s * 0.29, 2.1, 0.07],
    });

    // Arm: a chain of shoulder, elbow and hand, with a tube along it.
    const arm = b.chain(
      `arm${L}`,
      [
        [s * 0.16, 1.46, 0],
        [s * 0.36, 1.24, 0.02],
        [s * 0.46, 1.0, 0.12],
      ],
      { parent: chest, names: [`shoulder${L}`, `elbow${L}`, `hand${L}`], role: "arm" },
    );
    b.sweep(arm, [0.058, 0.03], { color: skin });
    b.part(new THREE.SphereGeometry(0.05, b.segments(10), b.segments(8)), skin, {
      bone: `hand${L}`,
      scale: [1, 0.8, 0.7],
    });
    // Three twig fingers reaching for the ground.
    for (const tip of [
      [s * 0.5, 0.9, 0.16],
      [s * 0.47, 0.88, 0.2],
      [s * 0.42, 0.9, 0.18],
    ]) {
      b.rod([s * 0.45, 0.99, 0.1], tip, 0.016, { color: bark, bone: `hand${L}` });
    }

    // Leg: hip, knee, ankle, with a root foot.
    b.chain(
      `leg${L}`,
      [
        [s * 0.13, 0.95, 0],
        [s * 0.15, 0.5, 0.02],
        [s * 0.13, 0.1, 0.06],
      ],
      { parent: hips, names: [`hip${L}`, `knee${L}`, `ankle${L}`], role: "leg" },
    );
    b.sweep(
      [
        [s * 0.13, 0.95, 0],
        [s * 0.15, 0.5, 0.02],
        [s * 0.13, 0.1, 0.06],
      ],
      { radius: [0.085, 0.05], color: bark, bone: `hip${L}` },
    );
    b.part(new THREE.SphereGeometry(0.08, b.segments(10), b.segments(8)), bark, {
      bone: `ankle${L}`,
      at: [s * 0.13, 0.04, 0.07],
      scale: [0.85, 0.5, 1.5],
    });

    // Moss clump on each shoulder.
    b.part(new THREE.SphereGeometry(0.075, b.segments(10), b.segments(8)), moss, {
      bone: chest,
      at: [s * 0.2, 1.56, 0],
      scale: [1, 0.6, 1],
    });
  }

  // Mushrooms growing out of the bark.
  const mushroom = [
    [0, 0],
    [0.018, 0],
    [0.02, 0.02],
    [0.055, 0.03],
    [0.062, 0.042],
    [0, 0.046],
  ] as const;
  b.lathe(mushroom, { color: shroom, at: [0.2, 1.1, 0.12], axis: [0.8, 0.3, 0.5], segments: 8, bone: chest });
  b.lathe(mushroom, { color: berry, at: [-0.14, 0.95, 0.1], axis: [-0.6, 0.2, 0.8], segments: 8, bone: hips });

  // Crown of leaves sprouting from the head.
  b.cards(
    b.ring(head, { count: 16, radius: 0.15, tilt: 55 }).items,
    [leafA, leafB],
    { size: [0.12, 0.17], lean: 30, flow: [0, 1, 0], vary: 0.25, bend: 20, cross: true, rng: R },
  );

  // Skirt of leaves hanging from the hips.
  b.cards(
    b.ring(hips, { count: 12, radius: 0.2, tilt: -30 }).items,
    [leafA, leafB],
    { size: [0.13, 0.26], lean: 15, flow: [0, -1, 0], bend: 25, vary: 0.2, cross: true, rng: R },
  );

  // Cloak of leaves hanging down the back from the chest.
  b.cards(
    b.ring(chest, { count: 8, radius: 0.34, fromDeg: 120, toDeg: 240, tilt: -8 }).items,
    leafB,
    { size: [0.16, 0.36], lean: 70, flow: [0, -1, 0], bend: 18, vary: 0.2, rng: R },
  );

  return b.root;
}
