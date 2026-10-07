```ts
import * as THREE from "three";
import { createBuilder, catmull, countershade, scales } from "agentic-3js-builder";

// Palette
const OLIVE = "#6b7a2e";
const CARAMEL = "#b98a4e";
const DARK_BROWN = "#3d2a17";
const BELLY = "#f1e3a0";
const CREAM = "#efe2b8";
const HEAD_GREEN = "#5f7535";
const HEAD_GREEN_2 = "#7d8a4a";
const FLIP = "#4d5c2c";
const EYE = "#1d1409";
const BEAK = "#4a4330";
const REM_DARK = "#33302b";
const REM_PALE = "#d8cfb0";

export const meta = {
  name: "Green sea turtle",
  description:
    "A green sea turtle gliding with spread flippers, heart-shaped olive and caramel shell, pale belly plate, and a remora riding beneath.",
};

export default function build() {
  const b = createBuilder({ name: "green-sea-turtle" });

  // Skeleton: root at the shell centre, swimming well above the floor.
  const hips = b.joint("hips", { at: [0, 0.45, 0], role: "spine" });

  // Neck and head, reaching forward out of the shell.
  const neck = b.chain("neck", catmull([[0, 0.42, 0.3], [0, 0.45, 0.45], [0, 0.47, 0.6]]), {
    parent: hips,
    names: ["neckA", "neckB"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck, at: [0, 0.47, 0.6], aim: [0, 0.48, 0.78], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.1, up: -0.03 }),
    aim: head.local({ forward: 0.2, up: -0.045 }),
    role: "jaw",
  });

  const shellPaint = scales([OLIVE, CARAMEL], DARK_BROWN, { size: 0.14, width: 0.22, seed: 5 });
  const headPaint = scales([HEAD_GREEN, HEAD_GREEN_2], CREAM, { size: 0.04, seed: 2 });
  const flipPaint = countershade(FLIP, CREAM, { level: 0 });

  // Shell: a heart-leaning dome, wide at the shoulders, tapering to the rear.
  b.loft(
    [
      { at: [0, 0.5, 0.42], w: 0.5, h: 0.14 },
      { at: [0, 0.49, 0.26], w: 0.8, h: 0.26 },
      { at: [0, 0.47, 0.0], w: 0.84, h: 0.32 },
      { at: [0, 0.46, -0.24], w: 0.72, h: 0.28 },
      { at: [0, 0.46, -0.4], w: 0.44, h: 0.17 },
      { at: [0, 0.45, -0.48], w: 0.14, h: 0.07 },
    ],
    { bone: hips, color: shellPaint },
  );

  // Pale yellow belly plate, slung under the shell.
  b.loft(
    [
      { at: [0, 0.33, 0.3], w: 0.46, h: 0.05 },
      { at: [0, 0.31, 0.0], w: 0.66, h: 0.06 },
      { at: [0, 0.32, -0.3], w: 0.46, h: 0.05 },
      { at: [0, 0.33, -0.42], w: 0.14, h: 0.04 },
    ],
    { bone: hips, color: BELLY },
  );

  // Neck, then the head with cream-edged scales.
  b.sweep(neck, [0.1, 0.075], { color: headPaint });
  b.part(new THREE.SphereGeometry(0.11, 16, 12), headPaint, {
    bone: head,
    at: head.local({ forward: 0.04 }),
    scale: [0.95, 0.9, 1.1],
  });

  // Gentle beak: upper on the head, lower on the jaw.
  b.capsule(head.local({ forward: 0.08, up: 0.0 }), head.local({ forward: 0.2, up: -0.01 }), [0.045, 0.03], {
    bone: head,
    color: BEAK,
  });
  b.capsule(head.local({ forward: 0.1, up: -0.03 }), head.local({ forward: 0.19, up: -0.045 }), [0.03, 0.02], {
    bone: jaw,
    color: BEAK,
  });

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // Dark, wise eyes with a small highlight.
    b.part(new THREE.SphereGeometry(0.026, 8, 6), EYE, {
      bone: head,
      at: head.local({ left: s * 0.075, up: 0.035, forward: 0.1 }),
    });
    b.part(new THREE.SphereGeometry(0.007, 6, 4), CREAM, {
      bone: head,
      at: head.local({ left: s * 0.082, up: 0.045, forward: 0.12 }),
    });

    // Long front flipper, spread wide and flattened.
    const fl = b.chain(
      `flipper${S}`,
      catmull([
        [s * 0.3, 0.44, 0.22],
        [s * 0.55, 0.43, 0.14],
        [s * 0.8, 0.41, 0.02],
        [s * 1.02, 0.39, -0.12],
      ]),
      { parent: hips, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `flipTip${S}`], role: "arm" },
    );
    b.sweep(fl, (t) => [0.1 * (1 - t) + 0.03, 0.03 * (1 - t) + 0.012], { color: flipPaint });

    // Short rear flipper.
    const hf = b.chain(
      `hind${S}`,
      catmull([
        [s * 0.22, 0.36, -0.3],
        [s * 0.3, 0.35, -0.4],
        [s * 0.26, 0.35, -0.52],
      ]),
      { parent: hips, names: [`hipHind${S}`, `kneeHind${S}`, `footHind${S}`], role: "leg" },
    );
    b.sweep(hf, (t) => [0.07 * (1 - t) + 0.03, 0.02 + 0.005 * (1 - t)], { color: flipPaint });
  }

  // Short tail stub.
  b.capsule([0, 0.4, -0.46], [0, 0.37, -0.6], [0.03, 0.015], { bone: hips, color: HEAD_GREEN });

  // Remora riding beneath the plastron.
  b.sweep(
    catmull([
      [0, 0.22, 0.2],
      [0, 0.2, 0.0],
      [0, 0.195, -0.2],
      [0, 0.2, -0.36],
    ]),
    [0.04, 0.012],
    { bone: hips, color: countershade(REM_DARK, REM_PALE, { level: -0.2 }) },
  );

  // Oval sucker disc on the remora's head.
  const sucker = Array.from({ length: 10 }, (_, i): [number, number] => {
    const a = (i / 10) * Math.PI * 2;
    return [Math.cos(a) * 0.035, Math.sin(a) * 0.09];
  });
  b.extrude(sucker, {
    at: [0, 0.25, 0.22],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.008,
    color: REM_DARK,
    bone: hips,
  });

  // Remora's forked-looking tail fin, standing vertically.
  b.extrude(
    [
      [0, 0],
      [-0.06, 0.05],
      [-0.1, 0],
      [-0.06, -0.05],
    ],
    {
      at: [0, 0.2, -0.36],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.006,
      color: REM_DARK,
      bone: hips,
    },
  );

  return b.root;
}
```