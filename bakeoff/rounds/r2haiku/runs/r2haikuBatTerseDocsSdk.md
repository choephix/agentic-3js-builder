```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  countershade,
  mottle,
  type OutlinePoint,
} from "agentic-3js-builder";

export const meta = {
  name: "bat",
  description: "A stylized standing bat with big ears, spread membrane wings, and glowing eyes.",
};

const FUR = countershade("#2a2233", "#6d5b78", { level: -0.25 });
const WING = mottle("#3a2a4f", "#5d4276", { size: 0.09, contrast: 0.6 });
const EAR = "#4a3758";
const DARK = "#1d1626";
const EYE = "#ffb830";
const BONE = "#efe6d2";
const PINK = "#c9677a";

const EAR_OUTLINE: OutlinePoint[] = [
  [-0.012, 0],
  [0.016, 0],
  [0.012, 0.05],
  [0.0, 0.08, "sharp"],
  [-0.014, 0.04],
];

export default function build() {
  const b = createBuilder({ name: "bat" });

  // Root and spine: hips at the base, spine chain running up into the head.
  const hips = b.joint("hips", { at: [0, 0.13, -0.02] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.13, -0.02],
      [0, 0.17, 0.0],
      [0, 0.22, 0.02],
      [0, 0.27, 0.05],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "head"], role: "spine" },
  );
  const head = spine.joints[3];
  const torso = b.sweep(spine, (t: number) => 0.024 + 0.016 * Math.sin(Math.PI * t), { color: FUR });

  // Head, snout and eyes.
  b.part(new THREE.SphereGeometry(0.04, 10, 8), FUR, {
    bone: head,
    at: head.local({ up: 0.01 }),
  });
  b.part(new THREE.BoxGeometry(0.03, 0.026, 0.03), FUR, {
    bone: head,
    at: head.local({ forward: 0.035, up: -0.006 }),
  });
  b.part(new THREE.ConeGeometry(0.008, 0.014, 4), PINK, {
    bone: head,
    at: head.local({ forward: 0.052, up: 0.0 }),
    dir: [0, 0, 1],
    axis: "y",
  });

  for (const s of [1, -1]) {
    b.extrude(EAR_OUTLINE, {
      at: head.local({ left: s * 0.022, up: 0.03 }),
      thickness: [0.008, 0.002],
      bevel: 0.002,
      color: EAR,
      bone: head,
    });
    b.part(new THREE.SphereGeometry(0.011, 6, 4), EYE, {
      bone: head,
      at: head.local({ left: s * 0.024, forward: 0.03, up: 0.012 }),
    });
  }

  // Jaw with two fangs.
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.02, up: -0.03 }),
    aim: head.local({ forward: 0.05, up: -0.04 }),
  });
  b.part(new THREE.BoxGeometry(0.02, 0.01, 0.03), DARK, {
    bone: jaw,
    at: jaw.local({ forward: 0.01 }),
  });
  for (const s of [1, -1]) {
    b.spike(jaw.local({ left: s * 0.008, forward: 0.025 }), [0, -1, 0], 0.012, 0.0028, {
      bone: jaw,
      color: BONE,
    });
  }

  // Tail.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.13, -0.03],
      [0, 0.1, -0.09],
      [0, 0.09, -0.13],
    ]),
    { parent: hips, names: ["tail1", "tail2"], role: "tail" },
  );
  b.sweep(tail, (t: number) => 0.012 - 0.005 * t, { color: FUR });

  // Wings and legs, mirrored.
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // Legs: knee bends forward, foot rests on the floor.
    const leg = b.chain(
      `leg${S}`,
      polyline([
        [s * 0.035, 0.12, -0.02],
        [s * 0.06, 0.06, 0.02],
        [s * 0.04, 0.01, -0.02],
      ]),
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" },
    );
    b.sweep(leg, (t: number) => 0.011 - 0.003 * t, { color: FUR });
    b.rod(leg.tip!, [s * 0.045, 0.007, 0.035], { radius: 0.006, color: DARK });

    // Arm: the leading edge of the wing.
    const arm = b.chain(
      `arm${S}`,
      polyline([
        [s * 0.035, 0.205, 0.0],
        [s * 0.13, 0.235, -0.03],
        [s * 0.25, 0.25, -0.04],
      ]),
      { parent: spine.joints[1], names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "wing" },
    );
    b.sweep(arm, (t: number) => 0.011 - 0.005 * t, { color: FUR });

    // Finger bones, each fanning from the wrist.
    const tips: [number, number, number][] = [
      [0.44, 0.23, 0.02],
      [0.49, 0.21, -0.14],
      [0.42, 0.19, -0.3],
    ];
    const fingers = tips.map((tp, i) => {
      const f = b.chain(
        `digit${S}${i}`,
        polyline([
          [s * 0.25, 0.25, -0.04],
          [s * tp[0], tp[1], tp[2]],
        ]),
        { parent: arm, names: [`digit${S}${i}`], role: "digit" },
      );
      b.sweep(f, 0.0045, { color: FUR });
      return f;
    });

    // Membrane skins between the arm, fingers and flank.
    const flank = polyline([
      [s * 0.03, 0.2, 0.0],
      [s * 0.04, 0.13, -0.06],
      [s * 0.045, 0.08, -0.12],
    ]);
    b.membrane(arm, fingers[0], { thickness: 0.01, color: WING, scallop: 0.12 });
    b.membrane(fingers[0], fingers[1], { thickness: 0.01, color: WING, scallop: 0.12 });
    b.membrane(fingers[1], fingers[2], { thickness: 0.01, color: WING, scallop: 0.12 });
    b.membrane(fingers[2], flank, { thickness: 0.01, color: WING, bone: spine.joints[0] });
  }

  return b.root;
}
```