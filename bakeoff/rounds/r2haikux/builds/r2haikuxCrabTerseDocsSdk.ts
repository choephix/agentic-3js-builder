import * as THREE from "three";
import { countershade, createBuilder, limb, mottle, rng } from "../../../../src/index";

const CORAL = "#e2572e";
const DEEP = "#9f2f17";
const CREAM = "#f4e2b8";
const INK = "#1c1718";
const WHITE = "#f8f3e9";

export const meta = {
  name: "Crab",
  description: "A stylised shore crab: mottled coral carapace, banded walking legs, pincers with black tips and eyes on stalks.",
};

export default function build() {
  const b = createBuilder({ name: "crab" });

  // Root joint: the carapace.
  const body = b.joint("body", { at: [0, 0.1, 0], role: "spine" });

  // Carapace: a flattened loft, widest just behind the claws.
  const SHELL = countershade(mottle(CORAL, DEEP, { size: 0.07, contrast: 0.6, seed: 4 }), CREAM, { level: -0.35 });
  const shell = b.loft(
    [
      { at: [0, 0.095, -0.1], w: 0.12, h: 0.06 },
      { at: [0, 0.1, -0.04], w: 0.19, h: 0.08 },
      { at: [0, 0.105, 0.02], w: 0.22, h: 0.085 },
      { at: [0, 0.1, 0.07], w: 0.2, h: 0.075 },
      { at: [0, 0.09, 0.105], w: 0.12, h: 0.06 },
    ],
    { bone: body, color: SHELL },
  );
  const carapace = b.surface(shell);

  // Pale tucked abdomen flap at the rear, visible from behind.
  b.loft(
    [
      { at: [0, 0.08, -0.08], w: 0.1, h: 0.035 },
      { at: [0, 0.068, -0.13], w: 0.07, h: 0.03 },
      { at: [0, 0.056, -0.155], w: 0.03, h: 0.02 },
    ],
    { bone: body, color: CREAM },
  );

  // Mouthparts at the front underside.
  b.capsule([-0.035, 0.078, 0.11], [0.035, 0.078, 0.11], 0.012, { bone: body, color: CREAM });

  // Lateral carapace spines, one row per side.
  for (const s of [1, -1]) {
    for (const [az, el, len] of [
      [60, 15, 0.04],
      [95, 10, 0.045],
      [120, 5, 0.035],
    ]) {
      const hit = carapace.around().at(s * az, el);
      if (hit) b.spike(hit, hit, len, 0.013, { color: CREAM });
    }
  }

  // Small tubercles scattered over the top of the shell.
  const bumps = rng(11);
  for (const h of carapace.scatter(18, { rng: bumps, minDist: 0.04, filter: (h) => h.n.y > 0.4 })) {
    b.stick(new THREE.SphereGeometry(0.011, 6, 4), DEEP, h, { embed: 0.45 });
  }

  // Eyes on stalks.
  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";
    const stalk = b.chain(
      `stalk${tag}`,
      [
        [s * 0.05, 0.12, 0.07],
        [s * 0.062, 0.19, 0.095],
        [s * 0.068, 0.236, 0.12],
      ],
      { parent: body, names: [`stalk${tag}1`, `stalk${tag}2`], role: "neck" },
    );
    b.sweep(stalk, [0.016, 0.013], { color: CORAL });

    const eye = b.part(new THREE.SphereGeometry(0.03, 10, 8), WHITE, {
      bone: stalk.joints[1],
      at: [s * 0.07, 0.25, 0.14],
    });
    const pupil = b.surface(eye).around().at(s * 20, 10);
    if (pupil) b.stick(new THREE.SphereGeometry(0.014, 8, 6), INK, pupil, { embed: 0.3 });
  }

  // Walking legs: four pairs, fore to rear, each planted on the floor.
  const LEGS = [
    { name: "Fore", hip: [0.1, 0.105, 0.03], foot: [0.29, 0.009, 0.04] },
    { name: "Mid", hip: [0.105, 0.1, -0.03], foot: [0.31, 0.009, -0.03] },
    { name: "Hind", hip: [0.09, 0.095, -0.08], foot: [0.29, 0.009, -0.11] },
    { name: "Rear", hip: [0.062, 0.09, -0.11], foot: [0.23, 0.009, -0.18] },
  ];
  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";
    for (const leg of LEGS) {
      const id = `${leg.name}${tag}`;
      const root = [s * leg.hip[0], leg.hip[1], leg.hip[2]];
      const foot = [s * leg.foot[0], leg.foot[1], leg.foot[2]];
      // Knees arch up and out; the foot lands exactly on the floor.
      const pts = limb(root, foot, [0.11, 0.1, 0.09], [
        [s * 0.4, 1, 0],
        [s * 0.4, 1, 0],
      ]);
      const chain = b.chain(`leg${id}`, pts, {
        parent: body,
        names: [`hip${id}`, `knee${id}`, `ankle${id}`, `foot${id}`],
        role: "leg",
      });
      b.sweep(chain, [0.02, 0.009], {
        color: CORAL,
        bands: [
          [0.84, CORAL],
          [1, INK],
        ],
      });
      for (const j of [chain.joints[1], chain.joints[2]]) {
        b.part(new THREE.SphereGeometry(0.021, 8, 6), DEEP, { bone: j, at: j.at });
      }
    }
  }

  // Pincered claws held forward.
  for (const s of [1, -1]) {
    const tag = s > 0 ? "L" : "R";
    const arm = b.chain(
      `arm${tag}`,
      [
        [s * 0.1, 0.11, 0.08],
        [s * 0.17, 0.14, 0.13],
        [s * 0.18, 0.12, 0.2],
        [s * 0.16, 0.1, 0.26],
      ],
      { parent: body, names: [`shoulder${tag}`, `elbow${tag}`, `wrist${tag}`, `hand${tag}`], role: "arm" },
    );
    b.sweep(arm, [0.026, 0.018], { color: CORAL });
    for (const j of [arm.joints[1], arm.joints[2]]) {
      b.part(new THREE.SphereGeometry(0.022, 8, 6), DEEP, { bone: j, at: j.at });
    }

    // Palm, riding the hand joint at the arm's tip.
    const hand = arm.joints[3];
    b.loft(
      [
        { at: [s * 0.155, 0.1, 0.25], w: 0.065, h: 0.065 },
        { at: [s * 0.16, 0.11, 0.31], w: 0.13, h: 0.1 },
        { at: [s * 0.155, 0.11, 0.37], w: 0.1, h: 0.085 },
      ],
      { bone: hand, color: CORAL },
    );

    // Movable finger, upper.
    const pincerUp = b.chain(
      `pincerUp${tag}`,
      [
        [s * 0.155, 0.14, 0.33],
        [s * 0.155, 0.137, 0.4],
        [s * 0.15, 0.122, 0.45],
      ],
      { parent: hand, names: [`pincerUp${tag}1`, `pincerUp${tag}2`], role: "digit" },
    );
    b.sweep(pincerUp, [0.022, 0.006], {
      color: CORAL,
      caps: { end: "point" },
      bands: [
        [0.7, CORAL],
        [1, INK],
      ],
    });

    // Fixed finger, lower.
    const pincerLo = b.chain(
      `pincerLo${tag}`,
      [
        [s * 0.155, 0.075, 0.33],
        [s * 0.155, 0.078, 0.4],
        [s * 0.15, 0.094, 0.45],
      ],
      { parent: hand, names: [`pincerLo${tag}1`, `pincerLo${tag}2`], role: "digit" },
    );
    b.sweep(pincerLo, [0.022, 0.006], {
      color: CORAL,
      caps: { end: "point" },
      bands: [
        [0.7, CORAL],
        [1, INK],
      ],
    });
  }

  return b.root;
}
