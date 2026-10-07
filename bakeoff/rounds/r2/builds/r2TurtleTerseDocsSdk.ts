import * as THREE from "three";
import { createBuilder, patches, countershade, mottle } from "../../../../src/index";

export const meta = {
  name: "Green Sea Turtle",
  description: "A stylized green sea turtle with a scuted carapace, paddle flippers and a jointed beak, rigged in a neutral swimming rest pose.",
};

const CREAM = "#e9dcae";
const SKIN = "#66773e";
const DARK = "#2a2314";
const BEAK = "#b9a46a";

export default function build() {
  const b = createBuilder({ name: "seaTurtle" });

  const root = b.joint("root", { at: [0, 0.2, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    [
      [0, 0.2, -0.45],
      [0, 0.2, 0],
      [0, 0.2, 0.4],
    ],
    { parent: root, role: "spine" },
  );
  const front = spine.joints[spine.joints.length - 1];
  const back = spine.joints[0];

  // Shells
  const shellPaint = patches("#463a1c", "#85703a", { size: 0.17, gap: 0.02, seed: 4 });
  const shell = b.loft(
    [
      { at: [0, 0.17, -0.56], w: 0.14, h: 0.1 },
      { at: [0, 0.2, -0.4], w: 0.5, h: 0.22 },
      { at: [0, 0.22, -0.1], w: 0.74, h: 0.3 },
      { at: [0, 0.22, 0.2], w: 0.72, h: 0.3 },
      { at: [0, 0.2, 0.42], w: 0.5, h: 0.22 },
      { at: [0, 0.18, 0.53], w: 0.2, h: 0.1 },
    ],
    { bone: spine, color: shellPaint, detail: 1.2 },
  );
  b.loft(
    [
      { at: [0, 0.065, -0.5], w: 0.15, h: 0.13 },
      { at: [0, 0.065, -0.3], w: 0.5, h: 0.13 },
      { at: [0, 0.065, 0], w: 0.6, h: 0.13 },
      { at: [0, 0.065, 0.3], w: 0.5, h: 0.13 },
      { at: [0, 0.065, 0.45], w: 0.2, h: 0.13 },
    ],
    { bone: spine, color: CREAM },
  );
  // Central keel scutes
  b.along(shell, 5, (at) => b.spike(at, at, 0.04, 0.05, { color: "#5b4a24", sides: 5 } as any));

  // Neck and head
  const neck = b.chain(
    "neck",
    [
      [0, 0.2, 0.4],
      [0, 0.23, 0.52],
      [0, 0.26, 0.64],
    ],
    { parent: front, names: ["neck1", "neck2", "head"], role: "neck" },
  );
  const head = neck.tip!;
  b.sweep(neck, [0.085, 0.065], {
    color: mottle(SKIN, "#556632", { size: 0.05 }),
    sectors: [[125, 235, CREAM]],
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.245, 0.66],
    dir: [0, 0, 1],
    role: "jaw",
  });
  b.part(new THREE.SphereGeometry(1, 10, 8), SKIN, {
    bone: head,
    at: [0, 0.265, 0.7],
    scale: [0.075, 0.062, 0.09],
  });
  b.frustumBox([0, 0.262, 0.74], [0, 0.25, 0.82], [0.1, 0.05], [0.06, 0.035], { bone: head, color: BEAK });
  b.frustumBox([0, 0.232, 0.7], [0, 0.236, 0.8], [0.085, 0.025], [0.05, 0.02], { bone: jaw, color: CREAM });
  // hooked beak tip
  b.spike([0, 0.255, 0.815], [0, -1, 0.3], 0.025, 0.02, { bone: head, color: BEAK });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.02, 8, 6), DARK, { bone: head, at: [s * 0.062, 0.285, 0.725] });
    b.part(new THREE.SphereGeometry(0.006, 5, 4), "#ffffff", { bone: head, at: [s * 0.075, 0.292, 0.738] });
    // brow scale
    b.part(new THREE.SphereGeometry(0.03, 6, 4), "#7a6a3a", {
      bone: head,
      at: [s * 0.05, 0.305, 0.7],
      scale: [1, 0.5, 1.5],
    });
  }

  // Flippers
  const flipPaint = countershade("#566a36", CREAM, { level: 0 });
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const fl = b.chain(
      `flipperF${side}`,
      [
        [s * 0.3, 0.15, 0.28],
        [s * 0.62, 0.13, 0.2],
        [s * 1.0, 0.12, 0.0],
      ],
      { parent: front, names: [`shoulder${side}`, `elbow${side}`, `hand${side}`], role: "arm" },
    );
    b.sweep(fl, (t) => [0.11 * (1 - 0.75 * t) + 0.015 + 0.05 * Math.sin(t * Math.PI), 0.024 * (1 - 0.6 * t) + 0.006], {
      color: flipPaint,
    });
    b.spike(fl.tip!.at, [s * 0.5, 0, -0.5], 0.05, 0.014, { bone: fl.tip!, color: CREAM });

    const hl = b.chain(
      `flipperH${side}`,
      [
        [s * 0.2, 0.12, -0.4],
        [s * 0.34, 0.1, -0.58],
        [s * 0.5, 0.09, -0.78],
      ],
      { parent: back, names: [`hip${side}`, `knee${side}`, `foot${side}`], role: "leg" },
    );
    b.sweep(hl, (t) => [0.07 * (1 - 0.6 * t) + 0.015 + 0.03 * Math.sin(t * Math.PI), 0.02 * (1 - 0.5 * t) + 0.006], {
      color: flipPaint,
    });
  }

  // Tail
  const tail = b.chain(
    "tail",
    [
      [0, 0.12, -0.5],
      [0, 0.1, -0.7],
    ],
    { parent: back, names: ["tail1", "tail2"], role: "tail" },
  );
  b.sweep(tail, [0.04, 0.01], { color: SKIN, caps: { start: "round", end: "point" } });

  return b.root;
}
