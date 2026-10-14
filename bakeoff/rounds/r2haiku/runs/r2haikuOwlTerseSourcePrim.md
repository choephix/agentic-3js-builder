```ts
import * as THREE from "three";
import { countershade, createBuilder, grain, mottle, stripes } from "agentic-3js-builder";

export const meta = {
  name: "Owl",
  description: "A stylised tawny owl standing on the ground: round facial discs, big gold eyes, ear tufts, a hinged beak, folded wings, feathered legs with talons, and a square tail.",
};

export default function owl() {
  const b = createBuilder({ name: "owl", detail: 1, paintSize: 1024 });

  // Paints: a dark-backed, pale-bellied plumage with mottling, barred wings, streaky facial discs.
  const plumage = countershade("#6b4a2b", "#d9c39a", { level: -0.05, soft: 0.45 });
  const body = mottle(plumage, "#4a3320", { size: 0.035, contrast: 1.2 });
  const wing = stripes("#5e3f23", "#d2b07a", { size: 0.03, axis: "y", width: 0.35, seed: 4 });
  const face = grain("#eddcb6", "#c9a46e", { size: 0.02, axis: "y", seed: 2 });
  const tail = stripes("#4b3420", "#8c6a3c", { size: 0.025, axis: "x", width: 0.3, seed: 7 });

  const tuft = "#5b3f24";
  const beak = "#4f463c";
  const legs = "#d8b56e";
  const talon = "#2a2723";
  const gold = "#f2b533";
  const pupil = "#0c0a08";
  const rim = "#2e2116";

  // Skeleton: body on the ground, head above, jaw hinged under the beak, wings/legs/tail per side.
  b.joint("body", { at: [0, 0.12, 0] });
  b.joint("head", { parent: "body", at: [0, 0.36, 0] });
  b.joint("jaw", { parent: "head", at: [0, 0.338, 0.1], role: "jaw" });

  const sides = [
    { k: "L", s: 1 },
    { k: "R", s: -1 },
  ];
  const legChains: Record<string, ReturnType<typeof b.chain>> = {};
  for (const { k, s } of sides) {
    legChains[k] = b.chain(
      "leg" + k,
      [
        [s * 0.05, 0.14, 0],
        [s * 0.055, 0.03, 0.01],
      ],
      { parent: "body", names: ["hip" + k, "ankle" + k], role: "leg" },
    );
    b.chain(
      "wing" + k,
      [
        [s * 0.1, 0.3, 0],
        [s * 0.11, 0.19, -0.005],
        [s * 0.1, 0.07, -0.02],
      ],
      { parent: "body", names: ["wingShoulder" + k, "wingElbow" + k, "wingHand" + k], role: "wing" },
    );
  }
  b.chain(
    "tail",
    [
      [0, 0.16, -0.06],
      [0, 0.1, -0.15],
    ],
    { parent: "body", names: ["tailBase", "tailTip"], role: "tail" },
  );

  // Body: a stout egg of revolution.
  b.lathe(
    [
      [0, 0],
      [0.06, 0],
      [0.095, 0.04],
      [0.11, 0.1],
      [0.11, 0.16],
      [0.095, 0.21],
      [0.06, 0.235],
      [0, 0.245],
    ],
    { color: body, at: [0, 0.12, 0], axis: [0, 1, 0], segments: 14, bone: "body", name: "body" },
  );

  // Head: a big round ball with a flat-faced disc.
  b.part(new THREE.SphereGeometry(0.095, b.segments(16), b.segments(12)), body, {
    at: [0, 0.36, 0],
    bone: "head",
    scale: [1, 0.97, 0.9],
    name: "head",
  });
  b.part(new THREE.SphereGeometry(0.085, b.segments(16), b.segments(12)), face, {
    at: [0, 0.36, 0.065],
    bone: "head",
    scale: [1, 1, 0.42],
    name: "facialDisc",
  });

  // Eyes: gold globes, dark rims, pupils proud of the face.
  for (const { s } of sides) {
    const x = s * 0.034;
    b.part(new THREE.SphereGeometry(0.036, b.segments(14), b.segments(10)), gold, {
      at: [x, 0.372, 0.085],
      bone: "head",
      name: "eye",
    });
    b.part(new THREE.TorusGeometry(0.04, 0.008, b.segments(8), b.segments(18)), rim, {
      at: [x, 0.372, 0.1],
      bone: "head",
      name: "eyeRim",
    });
    b.part(new THREE.SphereGeometry(0.018, b.segments(10), b.segments(8)), pupil, {
      at: [x, 0.372, 0.117],
      bone: "head",
      name: "pupil",
    });
  }

  // Beak: an upper cone on the head and a lower mandible on the hinged jaw.
  b.spike([0, 0.363, 0.09], [0, 0.337, 0.135], null, 0.022, { color: beak, bone: "head", name: "beakUpper" });
  b.spike([0, 0.34, 0.09], [0, 0.329, 0.12], null, 0.013, { color: beak, bone: "jaw", name: "beakLower" });

  // Ear tufts: two raked spikes.
  for (const { s } of sides)
    b.spike([s * 0.05, 0.43, 0.02], [s * 0.07, 0.48, -0.02], null, 0.022, {
      color: tuft,
      bone: "head",
      name: "earTuft",
    });

  for (const { k, s } of sides) {
    // Wings: folded flat against the sides, barred.
    const outline = [
      [0.03, 0.33],
      [0.065, 0.3],
      [0.078, 0.22],
      [0.072, 0.14],
      [0.05, 0.07],
      [0.02, 0.03, "sharp"],
      [-0.01, 0.06],
      [-0.035, 0.13],
      [-0.038, 0.22],
      [-0.015, 0.3],
    ];
    b.extrude(outline, {
      color: wing,
      at: [s * 0.11, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.026,
      bevel: 0.008,
      smoothing: 1,
      bone: "wingElbow" + k,
      name: "wing" + k,
    });

    // Thigh feathers, then the legs and feet.
    b.part(new THREE.SphereGeometry(0.032, b.segments(12), b.segments(8)), body, {
      at: [s * 0.05, 0.15, 0.005],
      bone: "hip" + k,
      scale: [1, 0.8, 1],
      name: "thigh",
    });
    b.sweep(legChains[k], { radius: 0.016, color: legs, name: "leg" + k });

    const ankle = [s * 0.055, 0.03, 0.01];
    for (const dx of [-0.018, 0, 0.018]) {
      const toe = [s * 0.055 + dx, 0.011, 0.055];
      b.capsule(ankle, toe, 0.011, { color: legs, bone: "ankle" + k, name: "toe" + k });
      b.spike(toe, [toe[0], 0.002, 0.07], null, 0.007, { color: talon, bone: "ankle" + k, name: "talon" + k });
    }
    const back = [s * 0.055, 0.011, -0.025];
    b.capsule(ankle, back, 0.011, { color: legs, bone: "ankle" + k, name: "toeBack" + k });
    b.spike(back, [back[0], 0.002, -0.04], null, 0.007, { color: talon, bone: "ankle" + k, name: "talonBack" + k });
  }

  // Tail: a short square fan of feathers.
  b.sweep(
    b.chain("tailGuide", [], { parent: "body" }) as never,
    { radius: 0.02, color: tail },
  );

  return b.root;
}
```