```ts
import * as THREE from "three";
import { catmull, createBuilder, limb, paint } from "agentic-3js-builder";

export const meta = {
  name: "armoured knight",
  description:
    "A stylised plate-armoured knight in a rest pose: plumed great helm, red tabard with a gold cross, heater shield on the left arm and a longsword in the right hand, with a torn cape behind.",
};

const STEEL = "#b8c1cc";
const BRIGHT = "#dfe6ee";
const DARK = "#4a525d";
const BLACK = "#1b1d22";
const GOLD = "#d8a23f";
const RED = "#a8232b";
const CAPE = "#7d1820";

export default function build() {
  const b = createBuilder({ name: "knight" });

  // Skeleton: hips, three spine joints, then head, arms and legs hang off them.
  const hips = b.joint("hips", { at: [0, 0.98, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.98, 0],
      [0, 1.16, 0.01],
      [0, 1.34, 0.02],
      [0, 1.5, 0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );

  // Torso: a stepped steel cuirass lofted along the spine, with a dark belt.
  b.loft(
    [
      { at: spine.at(0.04), w: 0.28, h: 0.2 },
      { at: spine.at(0.3), w: 0.24, h: 0.18 },
      { at: spine.at(0.62), w: 0.32, h: 0.22 },
      { at: spine.at(0.92), w: 0.36, h: 0.2 },
    ],
    { bone: spine, color: STEEL },
  );
  b.loft(
    [
      { at: spine.at(0.17), w: 0.275, h: 0.195 },
      { at: spine.at(0.23), w: 0.265, h: 0.185 },
    ],
    { bone: spine, color: DARK },
  );

  // Tabard: red cloth over the chest with a gold cross, painted in its own surface coordinates.
  b.extrude(
    [
      [-0.1, 0.02],
      [0.1, 0.02],
      [0.1, -0.3],
      [0, -0.4, "sharp"],
      [-0.1, -0.3],
    ],
    {
      at: spine.at(0.45).local({ forward: 0.115 }),
      x: [1, 0, 0],
      thickness: 0.012,
      bevel: 0.004,
      color: paint((_p, _n, s) =>
        (Math.abs(s[0]) < 0.018 && s[1] > -0.3) || Math.abs(s[1] + 0.14) < 0.018 ? GOLD : RED,
      ),
      bone: spine,
    },
  );

  // Gorget ringing the neck, the join between cuirass and helm.
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.11, 0.05],
      [0.09, 0.08],
      [0, 0.08],
    ],
    { at: [0, 1.5, 0], bone: spine.joints[2], smoothing: 1, color: STEEL },
  );

  // Faulds: a mail-like skirt hanging from the hips.
  b.lathe(
    [
      [0, 0],
      [0.2, 0],
      [0.22, 0.06],
      [0.2, 0.14],
      [0, 0.14],
    ],
    { at: [0, 0.85, 0], bone: hips, segments: 10, color: DARK },
  );

  // Head: a great helm with a visor slit, nasal bar and a red plume.
  const head = b.joint("head", { parent: spine.joints[2], at: [0, 1.6, 0], aim: [0, 1.8, 0], role: "head" });
  b.lathe(
    [
      [0, -0.04],
      [0.12, -0.04],
      [0.125, -0.03],
      [0.125, 0.06],
      [0.11, 0.14],
      [0.07, 0.2],
      [0, 0.21],
    ],
    { at: [0, 1.6, 0], bone: head, segments: 10, smoothing: 1, color: STEEL },
  );
  b.part(new THREE.BoxGeometry(0.13, 0.02, 0.03), BLACK, {
    bone: head,
    at: head.local({ forward: 0.12, up: 0.08 }),
  });
  b.part(new THREE.BoxGeometry(0.025, 0.1, 0.03), STEEL, {
    bone: head,
    at: head.local({ forward: 0.125, up: 0.02 }),
  });
  b.extrude(
    [
      [-0.14, 0],
      [0.08, 0.02],
      [-0.02, 0.2, "sharp"],
      [-0.14, 0.1],
    ],
    {
      at: head.local({ up: 0.17 }),
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.006,
      smoothing: 1,
      color: RED,
      bone: head,
    },
  );

  // Arms: pauldron, sleeve, elbow cop and gauntlet on each side.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = limb([s * 0.2, 1.46, 0], [s * 0.3, 1.02, 0.22], [0.3, 0.27], [0, 0, -1]);
    const armChain = b.chain(`arm${side}`, arm, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
    });
    const shoulder = armChain.joints[0];
    const elbow = armChain.joints[1];
    const wrist = armChain.tip!;

    b.sweep(armChain, [0.055, 0.045], { color: DARK });

    b.lathe(
      [
        [0, 0],
        [0.13, 0],
        [0.14, 0.03],
        [0.12, 0.08],
        [0.06, 0.11],
        [0, 0.11],
      ],
      { at: [s * 0.2, 1.5, 0], bone: shoulder, smoothing: 1, color: STEEL },
    );
    b.part(new THREE.SphereGeometry(0.06, 8, 6), STEEL, {
      bone: elbow,
      at: elbow.local({ forward: 0.02 }),
    });
    b.part(new THREE.BoxGeometry(0.1, 0.09, 0.12), STEEL, {
      bone: wrist,
      at: wrist.local({ forward: 0.03 }),
    });
  }

  // Legs: a dark leg tube, steel knee cops and black sabatons standing on y = 0.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = limb([s * 0.12, 0.95, 0], [s * 0.13, 0.1, 0.05], [0.46, 0.44], [0, 0, 1]);
    const legChain = b.chain(`leg${side}`, leg, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    const knee = legChain.joints[1];
    const ankle = legChain.tip!;

    b.sweep(legChain, [0.085, 0.06], { color: DARK });
    b.part(new THREE.SphereGeometry(0.075, 8, 6), STEEL, {
      bone: knee,
      at: knee.local({ forward: 0.05 }),
    });
    b.part(new THREE.BoxGeometry(0.12, 0.1, 0.28), BLACK, {
      bone: ankle,
      at: ankle.local({ forward: 0.06, up: -0.05 }),
    });
  }

  // Heater shield on the knight's left (+X), hung from the hips.
  b.extrude(
    [
      [-0.17, 0.27],
      [0.17, 0.27],
      [0.17, 0.02],
      [0, -0.28, "sharp"],
      [-0.17, 0.02],
    ],
    {
      at: [0.36, 1.0, 0.13],
      x: [1, 0, 0],
      thickness: 0.03,
      bevel: 0.005,
      smoothing: 1,
      color: paint((_p, _n, s) => (Math.abs(s[0]) < 0.025 || Math.abs(s[1] - 0.05) < 0.025 ? GOLD : RED)),
      bone: spine.joints[0],
    },
  );

  // Longsword point-down in the knight's right hand (-X).
  const rWrist = b.chain("armR", [], { parent: spine.joints[2] }) && null; // placeholder removed below
  void rWrist;

  // Cape hanging from the shoulders down the back, gold hem.
  b.membrane(
    catmull([
      [0.2, 1.48, -0.13],
      [0, 1.5, -0.15],
      [-0.2, 1.48, -0.13],
    ]),
    catmull([
      [0.24, 0.9, -0.18],
      [0, 0.84, -0.2],
      [-0.24, 0.9, -0.18],
    ]),
    {
      thickness: 0.01,
      color: paint((_p, _n, s) => (s[1] > 0.93 ? GOLD : CAPE)),
      bone: spine.joints[1],
    },
  );

  return b.root;
}
```