import * as THREE from "three";
import { createBuilder, countershade, mottle, stripes } from "../../../../src/index";

export const meta = {
  name: "Crab",
  description: "A stylised beach crab: a domed red carapace, a tucked abdomen, eight jointed walking legs, two claws and two eyes on stalks.",
};

export default function crab() {
  const b = createBuilder({ name: "crab", detail: 1 });

  // Paints: one colour field each, baked onto the surface.
  const shellPaint = mottle("#b93a2a", "#e8772e", { size: 0.09, seed: 3 });
  const legPaint = stripes("#e8772e", "#f6e3c4", { size: 0.035, width: 0.4, seed: 2 });
  const clawPaint = mottle("#a8342a", "#d35400", { size: 0.05, seed: 5 });
  const bellyPaint = countershade("#e59866", "#f8c471", { level: 0, soft: 0.3 });
  const shellDark = "#7b241c";
  const bumpColor = "#f5cba7";

  // Body root: the carapace's centre sits 7 cm up.
  b.joint("body", { at: [0, 0.07, 0] });

  // Carapace: a domed shell, narrow at the front and back, wide over the middle.
  const shell = b.loft(
    [
      { at: [0, 0.075, -0.07], w: 0.13, h: 0.05 },
      { at: [0, 0.075, -0.01], w: 0.22, h: 0.08 },
      { at: [0, 0.07, 0.05], w: 0.23, h: 0.09 },
      { at: [0, 0.065, 0.1], w: 0.17, h: 0.07 },
    ],
    { color: shellPaint, bone: "body", name: "carapace" },
  );

  // Tucked abdomen underneath the shell.
  b.loft(
    [
      { at: [0, 0.045, -0.1], w: 0.07, h: 0.035 },
      { at: [0, 0.045, -0.04], w: 0.1, h: 0.045 },
      { at: [0, 0.045, 0.0], w: 0.12, h: 0.04 },
    ],
    { color: bellyPaint, bone: "body", name: "abdomen" },
  );

  // Surface details on the carapace: a few bumps and front spikes, seated on the real shell.
  const top = b.surface(shell);
  for (const p of [
    [0.0, 0.13, -0.02],
    [0.06, 0.12, 0.0],
    [-0.06, 0.12, 0.0],
    [0.1, 0.1, 0.04],
    [-0.1, 0.1, 0.04],
    [0.0, 0.125, 0.06],
  ] as const) {
    b.stick(new THREE.SphereGeometry(0.012, b.segments(8), b.segments(6)), bumpColor, top.nearest(p), { embed: 0.3 });
  }
  for (const p of [
    [0.05, 0.13, 0.1],
    [-0.05, 0.13, 0.1],
  ] as const) {
    b.spike(top.nearest(p), top.nearest(p), 0.02, 0.005, { color: shellDark });
  }

  for (const [s, k] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    // Eyes on stalks.
    const stalk = b.joint(`eyeStalk${k}`, {
      parent: "body",
      at: [s * 0.04, 0.1, 0.1],
      aim: [s * 0.05, 0.165, 0.14],
    });
    const tip: [number, number, number] = [s * 0.05, 0.165, 0.14];
    b.rod(stalk, tip, 0.008, { color: "#a8342a" });
    b.part(new THREE.SphereGeometry(0.02, b.segments(10), b.segments(8)), "#f4f1e8", {
      at: tip,
      bone: stalk,
    });
    b.part(new THREE.SphereGeometry(0.01, b.segments(8), b.segments(6)), "#101010", {
      at: [s * 0.05, 0.165, 0.158],
      bone: stalk,
    });

    // Walking legs: four per side, each a three-joint chain ending in a foot on the floor.
    for (let i = 0; i < 4; i++) {
      const hipZ = [0.04, 0.0, -0.05, -0.1][i];
      const kneeX = [0.17, 0.19, 0.18, 0.15][i];
      const leg = b.chain(
        `leg${i}${k}`,
        [
          [s * 0.09, 0.07, hipZ],
          [s * kneeX, 0.13, hipZ + 0.02],
          [s * 0.25, 0.05, hipZ - 0.01],
          [s * 0.28, 0.0, hipZ - 0.05],
        ],
        {
          parent: "body",
          role: "leg",
          names: [`hip${i}${k}`, `knee${i}${k}`, `ankle${i}${k}`, `foot${i}${k}`],
        },
      );
      b.sweep(leg, { radius: (t: number) => 0.013 - 0.007 * t, color: legPaint });
    }

    // Front claw arm: shoulder, elbow, wrist, hand (the hand is the tip joint).
    const arm = b.chain(
      `arm${k}`,
      [
        [s * 0.09, 0.09, 0.1],
        [s * 0.15, 0.13, 0.17],
        [s * 0.16, 0.1, 0.24],
        [s * 0.17, 0.075, 0.3],
      ],
      {
        parent: "body",
        role: "arm",
        names: [`shoulder${k}`, `elbow${k}`, `wrist${k}`, `hand${k}`],
      },
    );
    b.sweep(arm, { radius: (t: number) => 0.02 - 0.008 * t, color: clawPaint });

    // The pincers: an upper and a lower finger, pointed, rigid on the hand.
    b.sweep(
      [
        [s * 0.17, 0.08, 0.3],
        [s * 0.175, 0.095, 0.36],
        [s * 0.2, 0.085, 0.42],
      ],
      {
        radius: (t: number) => 0.026 - 0.02 * t,
        color: clawPaint,
        caps: { start: "round", end: "point" },
        bone: `hand${k}`,
      },
    );
    b.sweep(
      [
        [s * 0.17, 0.07, 0.3],
        [s * 0.175, 0.06, 0.36],
        [s * 0.2, 0.07, 0.41],
      ],
      {
        radius: (t: number) => 0.022 - 0.017 * t,
        color: clawPaint,
        caps: { start: "round", end: "point" },
        bone: `hand${k}`,
      },
    );
  }

  return b.root;
}
