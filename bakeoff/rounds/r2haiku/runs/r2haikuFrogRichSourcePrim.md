```ts
import * as THREE from "three";
import { createBuilder, mottle, paint, stripes } from "agentic-3js-builder";

export const meta = {
  name: "Red-eyed tree frog",
  description:
    "A red-eyed tree frog clinging to a leaf: lime skin, blue and cream flanks, cream belly, orange sticky toe pads and enormous ruby eyes with black slit pupils.",
};

const LIME = "#8fd62c";
const CREAM = "#f4edc8";
const BLUE = "#2f6fd6";
const ORANGE = "#f28a1e";
const RUBY = "#b8142e";
const BLACK = "#0c0c0c";
const NOSTRIL = "#1f4214";
const VEIN = "#9ad65a";
const LEAF_DARK = "#3f9a2c";
const LEAF_LIGHT = "#6cb83a";

// Flanks: cream with blue stripes running front to back. Underside: cream. Back: lime.
const flank = stripes(CREAM, BLUE, { size: 0.012, axis: "z", width: 0.42, wobble: 0.35 });
const skin = paint((p, n) => {
  if (n.y < -0.35) return CREAM;
  if (Math.abs(p.x) > 0.0082 && n.y < 0.45) return flank;
  return LIME;
});

export default function redEyedTreeFrog() {
  const b = createBuilder({ name: "red-eyed-tree-frog" });
  const seg = (n: number) => b.segments(n);
  const sphere = (r: number, w: number, h: number) => new THREE.SphereGeometry(r, seg(w), seg(h));

  // Skeleton: body root, head, lower jaw, and a chain per leg.
  b.joint("body", { at: [0, 0.026, 0] });
  b.joint("head", { parent: "body", at: [0, 0.034, 0.024], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.0235, 0.027], role: "jaw" });

  for (const [S, s] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    const wrist: [number, number, number] = [s * 0.033, 0.0065, 0.0425];
    b.chain(
      `foreleg${S}`,
      [
        [s * 0.0135, 0.0285, 0.0135],
        [s * 0.0275, 0.0195, 0.0245],
        wrist,
      ],
      { parent: "body", names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "arm" },
    );
    b.chain(
      `hindleg${S}`,
      [
        [s * 0.0125, 0.0235, -0.0175],
        [s * 0.0335, 0.0125, 0.0005],
        [s * 0.0265, 0.0042, -0.0275],
      ],
      { parent: "body", names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" },
    );
  }

  // Leaf: a slab the frog clings to. Its lowest point sits at the floor.
  const leaf: Array<[number, number, number]> = [
    [0, 0.0008, -0.075],
    [0.03, 0.0008, -0.05],
    [0.048, 0.0008, -0.01],
    [0.05, 0.0008, 0.035],
    [0.03, 0.0008, 0.08],
    [0, 0.0008, 0.105],
    [-0.03, 0.0008, 0.08],
    [-0.05, 0.0008, 0.035],
    [-0.048, 0.0008, -0.01],
    [-0.03, 0.0008, -0.05],
  ];
  b.slab(leaf, {
    name: "leaf",
    color: mottle(LEAF_DARK, LEAF_LIGHT, { size: 0.03 }),
    thickness: 0.003,
    bone: "body",
  });
  b.rod([0, 0.0028, -0.072], [0, 0.0028, 0.1], 0.0012, { color: VEIN, bone: "body" });

  // Torso and head, one painted skin.
  b.part(sphere(0.0165, 16, 12), skin, {
    bone: "body",
    at: [0, 0.026, -0.002],
    scale: [1.05, 0.9, 1.35],
  });
  b.part(sphere(0.0155, 16, 12), skin, {
    bone: "head",
    at: [0, 0.034, 0.024],
    scale: [1.25, 0.85, 1.1],
  });

  // Lower jaw in cream, and two small nostrils.
  b.part(sphere(0.0105, 12, 8), CREAM, {
    bone: "jaw",
    at: [0, 0.0235, 0.027],
    scale: [1.25, 0.32, 1.15],
  });
  for (const s of [1, -1]) {
    b.part(sphere(0.0009, 6, 5), NOSTRIL, { bone: "head", at: [s * 0.0042, 0.0355, 0.0405] });
  }

  // Enormous ruby eyes with black vertical slit pupils and a small glint.
  for (const s of [1, -1]) {
    const ex = s * 0.0125;
    b.part(sphere(0.0105, 16, 12), RUBY, { bone: "head", at: [ex, 0.0415, 0.0245] });
    b.part(new THREE.BoxGeometry(0.0017, 0.0072, 0.0008), BLACK, {
      bone: "head",
      at: [ex, 0.0415, 0.0352],
    });
    b.part(sphere(0.002, 6, 5), "#ffffff", { bone: "head", at: [ex + s * 0.0035, 0.046, 0.032] });
  }

  // Limbs: thighs and forearms as tapered capsules, shins and upper arms likewise, all on their joints.
  // Toes and fingers are joints off the feet and wrists, each with an orange sticky pad.
  const digits = (
    S: string,
    s: number,
    prefix: string,
    parent: string,
    base: [number, number, number],
    offsets: number[][],
  ) => {
    offsets.forEach((o, i) => {
      const name = `${prefix}${S}${i + 1}`;
      const tip: [number, number, number] = [base[0] + s * o[0], base[1] + o[1], base[2] + o[2]];
      const knuckle: [number, number, number] = [
        base[0] + 0.3 * s * o[0],
        base[1] + 0.3 * o[1],
        base[2] + 0.3 * o[2],
      ];
      b.joint(name, { parent, at: knuckle, role: "digit" });
      b.capsule(knuckle, tip, [0.0021, 0.0016], { color: LIME, bone: name });
      b.part(sphere(0.0031, 10, 8), ORANGE, {
        bone: name,
        at: [tip[0], tip[1] + 0.0005, tip[2]],
        scale: [1, 0.6, 1],
      });
    });
  };

  const fingerOffsets = [
    [-0.011, -0.0025, 0.016],
    [-0.004, -0.0025, 0.022],
    [0.004, -0.0025, 0.022],
    [0.011, -0.0025, 0.016],
  ];
  const toeOffsets = [
    [0.014, -0.0013, -0.004],
    [0.011, -0.0013, -0.016],
    [0.003, -0.0013, -0.021],
    [-0.006, -0.0013, -0.019],
  ];

  for (const [S, s] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    const shoulder = [s * 0.0135, 0.0285, 0.0135] as const;
    const elbow = [s * 0.0275, 0.0195, 0.0245] as const;
    const wrist: [number, number, number] = [s * 0.033, 0.0065, 0.0425];
    const hip = [s * 0.0125, 0.0235, -0.0175] as const;
    const knee = [s * 0.0335, 0.0125, 0.0005] as const;
    const ankle: [number, number, number] = [s * 0.0265, 0.0042, -0.0275];

    // Front leg.
    b.capsule(shoulder, elbow, [0.0045, 0.0034], { color: LIME, bone: `shoulder${S}` });
    b.capsule(elbow, wrist, [0.0034, 0.0027], { color: LIME, bone: `elbow${S}` });
    digits(S, s, "finger", `wrist${S}`, wrist, fingerOffsets);

    // Hind leg, folded on the leaf.
    b.capsule(hip, knee, [0.0068, 0.0045], { color: LIME, bone: `hip${S}` });
    b.capsule(knee, ankle, [0.0045, 0.0032], { color: LIME, bone: `knee${S}` });
    digits(S, s, "toe", `ankle${S}`, ankle, toeOffsets);
  }

  return b.root;
}
```