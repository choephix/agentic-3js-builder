```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

const GREEN = "#4f9d3a";
const DARK = "#2b5a22";
const BELLY = "#e9e1a6";
const GOLD = "#e2b325";
const BLACK = "#15150f";
const MOUTH = "#3a1d12";

// Ellipsoid centred on the origin; the caller places it with `at`.
function ell(rx: number, ry: number, rz: number, seg = 12): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(1, seg, 8);
  g.scale(rx, ry, rz);
  return g;
}

export const meta = {
  name: "frog",
  description: "A stylized green frog with bulging gold eyes, a pale belly, dark back spots and folded hind legs, sitting on the ground.",
};

export default function build() {
  const b = createBuilder({ name: "frog" });

  // Skeleton. Body centre sits so the underside rests on y = 0.
  const body = b.joint("body", { at: [0, 0.03, 0] });
  const head = b.joint("head", { at: [0, 0.036, 0.058], parent: body });
  const jaw = b.joint("jaw", { at: [0, 0.024, 0.07], parent: head });
  const eyeL = b.joint("eyeL", { at: [0.024, 0.06, 0.07], parent: head });
  const eyeR = b.joint("eyeR", { at: [-0.024, 0.06, 0.07], parent: head });

  // Torso and head.
  b.part(ell(0.042, 0.03, 0.055, 14), GREEN, { at: [0, 0.03, 0], bone: body });
  b.part(ell(0.03, 0.02, 0.04, 10), BELLY, { at: [0, 0.018, 0.0], bone: body });
  b.part(ell(0.036, 0.024, 0.03, 12), GREEN, { at: [0, 0.036, 0.058], bone: head });

  // Upper lip line and lower jaw as separate pieces.
  b.part(new THREE.BoxGeometry(0.05, 0.003, 0.01), MOUTH, { at: [0, 0.03, 0.086], bone: head });
  b.part(ell(0.03, 0.008, 0.03, 10), BELLY, { at: [0, 0.02, 0.07], bone: jaw });

  // Eyes: gold bulges with black pupils facing forward.
  for (const [x, joint] of [[0.024, eyeL], [-0.024, eyeR]] as const) {
    b.part(ell(0.011, 0.011, 0.011, 10), GOLD, { at: [x, 0.06, 0.07], bone: joint });
    b.part(ell(0.006, 0.006, 0.004, 8), BLACK, { at: [x, 0.061, 0.079], bone: joint });
  }

  // Dark spots on the back, flattened so they sit on the skin.
  const spots: [number, number, number][] = [
    [0.02, 0.056, -0.02],
    [-0.02, 0.056, -0.02],
    [0.0, 0.058, 0.02],
    [0.024, 0.048, -0.04],
    [-0.024, 0.048, -0.04],
  ];
  for (const p of spots) {
    b.part(ell(0.008, 0.003, 0.008, 8), DARK, { at: p, bone: body });
  }

  // Limbs, mirrored for left (+X) and right (-X).
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Front arm: shoulder, elbow, wrist.
    const arm = b.chain(`arm${side}`, [
      [0.03 * s, 0.04, 0.035],
      [0.055 * s, 0.02, 0.05],
      [0.06 * s, 0.008, 0.07],
    ]);
    b.sweep(arm, 0.008, { color: GREEN });

    // Three small fingers at the wrist.
    const fingerOffsets: [number, number][] = [
      [0.052, 0.086],
      [0.06, 0.088],
      [0.068, 0.084],
    ];
    for (const [fx, fz] of fingerOffsets) {
      b.part(ell(0.004, 0.004, 0.004, 6), DARK, { at: [fx * s, 0.004, fz] });
    }

    // Hind leg, folded: thigh out and forward, shin back, foot flat.
    const leg = b.chain(`leg${side}`, [
      [0.03 * s, 0.035, -0.02],
      [0.075 * s, 0.018, 0.01],
      [0.05 * s, 0.008, -0.045],
    ]);
    b.sweep(leg, 0.01, { color: GREEN });

    // Foot: flattened ellipsoid with toes.
    b.part(ell(0.012, 0.004, 0.03, 8), GREEN, { at: [0.05 * s, 0.005, -0.07] });
    const toeOffsets: [number, number][] = [
      [0.034, -0.1],
      [0.05, -0.104],
      [0.066, -0.1],
    ];
    for (const [tx, tz] of toeOffsets) {
      b.part(ell(0.004, 0.003, 0.004, 6), DARK, { at: [tx * s, 0.003, tz] });
    }
  }

  return b.root;
}
```