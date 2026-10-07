import * as THREE from "three";
import { createBuilder, catmull, limb, paint } from "../../../../src/index";

const AMBER = "#c98a2e";
const SHIELD = "#a8661f";
const BAND = "#5a2e10";
const STINGER = "#3b1c0b";
const BLACK = "#0c0a08";

export const meta = {
  name: "desert scorpion",
  description: "Amber armoured desert scorpion with a high-arched segmented tail, crab pincers, eight legs and a cluster of black eyes.",
};

export default function build() {
  const b = createBuilder({ name: "scorpion" });

  // Skeleton: root body, segmented body spine, arched tail, pincer arms, legs.
  const hips = b.joint("hips", { at: [0, 0.07, 0] });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.07, 0.1],
      [0, 0.076, 0.03],
      [0, 0.07, -0.05],
      [0, 0.064, -0.12],
    ]),
    { parent: hips, names: ["chest", "waist", "rear"], role: "spine" },
  );

  // Glossy amber shell with a darker band at every segment joint and a darker shield over the head.
  const armour = paint((_p, n, s) => {
    if (s[0] < 0.3) return n.y > 0.45 ? SHIELD : AMBER;
    return (s[0] * 3) % 1 < 0.14 ? BAND : AMBER;
  });

  const body = b.sweep(spine, (t) => [0.05 - 0.018 * t, 0.034 - 0.008 * t], { color: armour });

  // Head shield plate sitting on top of the prosoma.
  b.extrude(
    [
      [-0.022, -0.03],
      [0.022, -0.03],
      [0.026, 0.014],
      [0, 0.04, "sharp"],
      [-0.026, 0.014],
    ],
    {
      at: [0, 0.1, 0.03],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: [0.01, 0.005],
      bevel: 0.002,
      smoothing: 1,
      color: SHIELD,
    },
  );

  // Cluster of tiny black eyes seated on the shield, placed on the body surface.
  const skin = b.surface(body);
  const eyePoints = [
    [-0.02, 0.1, 0.1],
    [0.02, 0.1, 0.1],
    [-0.035, 0.09, 0.08],
    [0.035, 0.09, 0.08],
    [-0.008, 0.108, 0.11],
    [0.008, 0.108, 0.11],
  ];
  for (const p of eyePoints) {
    b.stick(new THREE.SphereGeometry(0.008, 6, 4), BLACK, skin.nearest(p), { embed: 0.3 });
  }

  // Segmented tail arching high over the back, ending in a bulbous dark stinger.
  const tailPaint = paint((_p, _n, s) => ((s[0] * 6) % 1 < 0.16 ? BAND : AMBER));
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.07, -0.12],
      [0, 0.1, -0.2],
      [0, 0.2, -0.25],
      [0, 0.31, -0.22],
      [0, 0.37, -0.13],
      [0, 0.37, -0.05],
      [0, 0.33, 0.0],
    ]),
    { parent: spine, role: "tail", count: 6 },
  );
  b.sweep(tail, (t) => 0.02 - 0.007 * t, { color: tailPaint });

  const bulbAt = tail.at(0.93);
  b.part(new THREE.SphereGeometry(0.024, 10, 8), STINGER, { at: bulbAt });
  const tipAt = tail.at(0.96);
  b.spike(tipAt, tipAt, 0.05, 0.009, { color: BLACK });

  // Crab-like pincers held forward, mirrored for each side.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const m = (p: number[]) => [s * p[0], p[1], p[2]];

    const arm = b.chain(
      `arm${side}`,
      catmull([
        m([0.03, 0.072, 0.085]),
        m([0.07, 0.066, 0.13]),
        m([0.1, 0.06, 0.2]),
        m([0.11, 0.05, 0.245]),
      ]),
      {
        parent: hips,
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
        role: "arm",
      },
    );
    const hand = arm.joints[arm.joints.length - 1];

    b.sweep(arm, (t) => 0.011 - 0.003 * t, { color: armour });

    b.part(new THREE.SphereGeometry(0.026, 8, 6), AMBER, {
      at: m([0.112, 0.05, 0.23]),
      bone: hand,
      scale: [1.2, 0.8, 1.5],
    });

    // Fixed finger and open movable finger, rigid on the hand.
    b.sweep(
      catmull([
        m([0.094, 0.046, 0.245]),
        m([0.1, 0.046, 0.285]),
        m([0.106, 0.046, 0.31]),
      ]),
      [0.009, 0.003],
      { bone: hand, color: AMBER },
    );
    b.sweep(
      catmull([
        m([0.128, 0.046, 0.245]),
        m([0.13, 0.046, 0.285]),
        m([0.122, 0.046, 0.31]),
      ]),
      [0.009, 0.003],
      { bone: hand, color: AMBER },
    );
  }

  // Eight thin legs, four per side, banded at each joint.
  const legPaint = paint((_p, _n, s) => ((s[0] * 3) % 1 < 0.14 ? BAND : AMBER));
  const legZ = [0.05, 0.0, -0.05, -0.1];
  const footZ = [0.02, 0.0, -0.02, -0.04];

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (let i = 0; i < 4; i++) {
      const k = i + 1;
      const root = [s * 0.03, 0.066, legZ[i]];
      const foot = [s * 0.13, 0.004, legZ[i] + footZ[i]];
      const pts = limb(root, foot, [0.05, 0.055, 0.045], [
        [s * 0.6, 0.8, 0],
        [s * 0.6, 0.6, 0],
      ]);
      const leg = b.chain(`leg${side}${k}`, pts, {
        parent: hips,
        names: [`hip${side}${k}`, `knee${side}${k}`, `ankle${side}${k}`, `foot${side}${k}`],
        role: "leg",
      });
      b.sweep(leg, [0.0055, 0.0025], { color: legPaint });
    }
  }

  return b.root;
}
