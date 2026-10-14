```ts
import * as THREE from "three";
import { catmull, createBuilder, mottle, paint } from "agentic-3js-builder";

export const meta = {
  name: "Red-eyed tree frog",
  description:
    "A red-eyed tree frog clinging to a leaf: lime skin, blue and cream flank stripes, cream belly, orange sticky toe pads and ruby eyes with black slit pupils.",
};

type Key = readonly [number, number, number];

/** A tube radius [x, y] keyed by source t: `[t, width, height]` keys, linear between. */
function profile(keys: readonly Key[]) {
  return (t: number): [number, number] => {
    for (let i = 1; i < keys.length; i++) {
      const [t1, w1, h1] = keys[i];
      if (t <= t1) {
        const [t0, w0, h0] = keys[i - 1];
        const f = (t - t0) / (t1 - t0);
        return [w0 + (w1 - w0) * f, h0 + (h1 - h0) * f];
      }
    }
    const [, w, h] = keys[keys.length - 1];
    return [w, h];
  };
}

const LIME = "#7ddc2e";
const ORANGE = "#ff8a1e";
const RUBY = "#c0102e";
const CREAM = "#f3ecc8";
const BLUE = "#3a7fd5";
const BLACK = "#0b0b0b";

export default function redEyedTreeFrog() {
  const b = createBuilder({ name: "red-eyed tree frog", detail: 1, paintSize: 1024 });

  // Skeleton: a root bone, a spine chain (pelvis, torso, chest, head tip), then the limbs.
  const body = b.joint("body", { at: [0, 0.036, 0], dir: [0, 0, 1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.034, -0.035],
      [0, 0.04, -0.005],
      [0, 0.04, 0.03],
      [0, 0.036, 0.068],
    ]),
    { parent: body, names: ["pelvis", "torso", "chest", "head"], role: "spine" },
  );

  // Dorsum lime with a blue flank band edged in cream, cream belly.
  const lime = mottle("#8be23a", "#66c81f", { size: 0.025, seed: 4, contrast: 0.8 });
  const skin = paint((p, n) => {
    if (n.y < -0.4) return CREAM;
    const side = Math.abs(p.x);
    if (side > 0.015 && p.y > 0.0305 && p.y < 0.0395) return BLUE;
    if (side > 0.015 && p.y > 0.0285 && p.y <= 0.0305) return CREAM;
    return lime;
  });

  b.sweep(
    spine,
    profile([
      [0, 0.016, 0.017],
      [0.2, 0.023, 0.022],
      [0.5, 0.026, 0.022],
      [0.78, 0.027, 0.021],
      [0.92, 0.023, 0.017],
      [1, 0.015, 0.013],
    ]),
    { name: "body", color: skin, sides: 10 },
  );

  // Lower jaw: a hinged cream lip under the snout.
  b.joint("jaw", { parent: "head", at: [0, 0.03, 0.06], dir: [0, 0, 1], role: "jaw" });
  b.capsule([-0.014, 0.029, 0.064], [0.014, 0.029, 0.064], 0.0022, {
    name: "lowerJaw",
    color: CREAM,
    bone: "jaw",
  });

  // Limbs, mirrored: s = +1 is the creature's left (+X).
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // Hind leg: hip, knee out, ankle back, foot on the leaf.
    const hind = b.chain(
      `hind${S}`,
      catmull([
        [s * 0.02, 0.031, -0.024],
        [s * 0.046, 0.024, -0.014],
        [s * 0.04, 0.0075, -0.03],
        [s * 0.03, 0.0032, -0.006],
      ]),
      { parent: "pelvis", names: [`hip${S}`, `knee${S}`, `ankle${S}`, `foot${S}`], role: "leg" },
    );
    b.sweep(hind, [0.0064, 0.0062, 0.0042, 0.0032], { name: `hind${S}`, color: LIME, sides: 6 });

    // Five sticky toes fanning across the leaf, each ending in an orange pad.
    const foot = new THREE.Vector3(s * 0.03, 0.0032, -0.006);
    for (let k = 0; k < 5; k++) {
      const a = -0.6 + (1.7 * k) / 4;
      const dir = new THREE.Vector3(s * Math.sin(a), 0, Math.cos(a));
      const tip = foot.clone().addScaledVector(dir, 0.012);
      b.rod(foot, tip, 0.0017, { color: ORANGE, bone: `foot${S}` });
      b.part(new THREE.SphereGeometry(0.0028, 6, 5), ORANGE, { at: tip, bone: `foot${S}` });
    }

    // Front arm: shoulder on the chest, elbow out, wrist down, hand on the leaf.
    const fore = b.chain(
      `fore${S}`,
      catmull([
        [s * 0.02, 0.032, 0.032],
        [s * 0.046, 0.022, 0.04],
        [s * 0.046, 0.0068, 0.034],
        [s * 0.056, 0.0032, 0.03],
      ]),
      { parent: "chest", names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`], role: "arm" },
    );
    b.sweep(fore, [0.0036, 0.0032, 0.0028, 0.0024], { name: `fore${S}`, color: LIME, sides: 6 });

    // Four fingers with round orange pads.
    const hand = new THREE.Vector3(s * 0.056, 0.0032, 0.03);
    for (let k = 0; k < 4; k++) {
      const a = -0.4 + (1.6 * k) / 3;
      const dir = new THREE.Vector3(s * Math.sin(a), 0, Math.cos(a));
      const tip = hand.clone().addScaledVector(dir, 0.008);
      b.rod(hand, tip, 0.0018, { color: ORANGE, bone: `hand${S}` });
      b.part(new THREE.SphereGeometry(0.0024, 6, 5), ORANGE, { at: tip, bone: `hand${S}` });
    }

    // Eye: enormous ruby sphere bulging from the top of the head, with a black slit pupil and a glint.
    const eyeR = 0.0118;
    const eye = new THREE.Vector3(s * 0.021, 0.05, 0.056);
    b.part(new THREE.SphereGeometry(eyeR, b.segments(16), b.segments(12)), RUBY, {
      at: eye,
      bone: "head",
      name: `eye${S}`,
    });
    const gaze = new THREE.Vector3(s * 0.35, 0.05, 1).normalize();
    const slit = new THREE.SphereGeometry(0.0055, b.segments(8), b.segments(6));
    slit.scale(0.42, 1.2, 0.45);
    b.part(slit, BLACK, {
      at: eye.clone().addScaledVector(gaze, eyeR + 0.0008),
      dir: gaze,
      axis: "z",
      bone: "head",
      name: `pupil${S}`,
    });
    const glint = eye.clone().addScaledVector(
      new THREE.Vector3(s * 0.35, 0.6, 1).normalize(),
      eyeR * 0.95,
    );
    b.part(new THREE.SphereGeometry(0.0021, 5, 4), CREAM, { at: glint, bone: "head", name: `glint${S}` });
  }

  // The leaf: a broad heart-shaped blade lying flat under the frog, midrib and veins painted on.
  const leafGreen = mottle("#3f9e2e", "#6cc23d", { size: 0.05, seed: 3 });
  const leaf = paint((p) => {
    if (Math.abs(p.x) < 0.0028) return "#d9f09a";
    const q = (p.z - 1.4 * Math.abs(p.x)) / 0.02;
    const f = q - Math.floor(q);
    if (Math.min(f, 1 - f) < 0.06 && Math.abs(p.x) > 0.003) return "#a9dd6a";
    return leafGreen;
  });
  b.extrude(
    [
      [0, -0.1, "sharp"],
      [0.035, -0.07],
      [0.058, -0.02],
      [0.06, 0.03],
      [0.04, 0.08],
      [0, 0.11, "sharp"],
      [-0.04, 0.08],
      [-0.06, 0.03],
      [-0.058, -0.02],
      [-0.035, -0.07],
    ],
    {
      name: "leaf",
      color: leaf,
      at: [0, 0.0008, 0],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.0016,
      smoothing: 1,
      bone: "body",
    },
  );

  return b.root;
}
```