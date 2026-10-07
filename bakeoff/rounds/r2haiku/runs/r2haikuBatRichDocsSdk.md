```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, polyline, bezier, countershade, mottle, svg, limb } from "agentic-3js-builder";

export const meta = {
  name: "fruit bat",
  description: "Golden-brown fruit bat, wings spread wide, pointed ears and a moist black nose, holding a half-eaten fig in its feet.",
};

const GOLD = "#c9913f";
const BROWN = "#8a5a2b";
const CREAM = "#eed3a0";
const WING = mottle("#3a353f", "#26222b", { size: 0.12, seed: 4 });
const FUR = countershade(mottle(GOLD, BROWN, { size: 0.06, seed: 2 }), CREAM, { level: -0.2 });
const BONE_DARK = "#4b4450";
const INNER = "#c98270";
const EYE = "#120c0a";
const WHITE = "#f5f2ea";
const NOSE = "#0d0909";
const CLAW = "#2a2320";
const FIG = "#5e2b4f";
const FLESH = "#e0607f";
const STEM = "#4f6b2e";

export default function build() {
  const b = createBuilder({ name: "fruit-bat" });
  const rand = rng(11);

  // Skeleton: hips on the ground, spine up to the head.
  const hips = b.joint("hips", { at: [0, 0.085, -0.03] });
  const spine = b.chain("spine", catmull([
    [0, 0.085, -0.03],
    [0, 0.14, 0.04],
    [0, 0.2, 0.1],
    [0, 0.25, 0.15],
  ]), { parent: hips, names: ["lumbar", "chest", "neck"], role: "spine" });
  const chest = spine.joints[1];
  const neck = spine.joints[2];
  const head = b.joint("head", { parent: neck, at: [0, 0.25, 0.15], aim: [0, 0.31, 0.24], role: "head" });

  // Body and head.
  const body = b.sweep(spine, [0.085, 0.082, 0.072, 0.06], { color: FUR });
  const headSweep = b.sweep(
    catmull([
      [0, 0.29, 0.13],
      [0, 0.31, 0.2],
      [0, 0.3, 0.28],
    ]),
    [0.07, 0.064, 0.03],
    { bone: head, color: FUR },
  );

  // Fur tufts scattered over the body.
  const tuft = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64"><path d="M16 64 Q4 34 16 0 Q28 34 16 64Z" fill="#dcdcdc"/></svg>`,
    { size: 128 },
  );
  const hits = b.surface(body).scatter(90, { rng: rand, minDist: 0.035, filter: (h) => h.n.y < 0.6 });
  b.cards(hits, tuft, { size: [0.03, 0.05], lean: 35, vary: 0.3, rng: rand, color: GOLD });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Pointed ears with a pink inner shell.
    const ear = b.extrude(
      [
        [-0.03, -0.02],
        [0.03, -0.02],
        [0.008, 0.09, "sharp"],
      ],
      {
        at: head.local({ left: s * 0.03, up: 0.1, forward: -0.02 }),
        x: [s, 0, 0],
        y: [0, 1, -0.25],
        thickness: 0.012,
        bevel: 0.003,
        smoothing: 1,
        color: FUR,
      },
    );
    b.extrude(
      [
        [-0.02, -0.01],
        [0.02, -0.01],
        [0.006, 0.065, "sharp"],
      ],
      {
        at: ear.local([0, 0, 0.0065]),
        x: [s, 0, 0],
        y: [0, 1, -0.25],
        thickness: 0.005,
        bevel: 0.002,
        smoothing: 1,
        color: INNER,
      },
    );

    // Big dark eyes with a glint, seated on the head.
    const eye = headSweep.at(0.45, -80 * s);
    b.stick(new THREE.SphereGeometry(0.024, 10, 8), EYE, eye, { embed: 0.35 });
    b.stick(new THREE.SphereGeometry(0.007, 6, 4), WHITE, eye.moved([0.008, 0.026, 0.012]), { embed: 0.3 });

    // Legs: hip on the body, ankles gripping the fig.
    const legPts = limb(
      [s * 0.05, 0.1, -0.02],
      [s * 0.045, 0.14, 0.2],
      [0.13, 0.12],
      [[s * 0.2, 1, 0.3]],
    );
    const leg = b.chain(`leg${side}`, legPts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    b.sweep(leg, [0.02, 0.012], { color: FUR });

    // Wing: shoulder, elbow, wrist, with a hooked thumb claw.
    const S = [s * 0.06, 0.18, 0.03];
    const E = [s * 0.2, 0.25, 0.0];
    const W = [s * 0.44, 0.32, -0.02];
    const W2 = [s * 0.47, 0.34, -0.03];
    const arm = b.chain(`arm${side}`, polyline([S, E, W, W2]), {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "wing",
    });
    const wrist = arm.joints[2];
    b.sweep(arm, [0.016, 0.009], { color: BONE_DARK });

    const tips = [
      [s * 0.66, 0.5, 0.14],
      [s * 0.82, 0.42, 0.02],
      [s * 0.76, 0.3, -0.12],
      [s * 0.56, 0.18, -0.22],
    ];
    const fingers = tips.map((tip, i) => {
      const f = b.chain(`finger${side}${i + 1}`, [W, tip], {
        parent: wrist,
        names: [`finger${side}${i + 1}`],
        role: "digit",
      });
      b.sweep(f, [0.008, 0.003], { color: BONE_DARK });
      return f;
    });

    // Leathery membrane between the fingers, arm and body.
    b.membrane([S, E, W], fingers[0], { color: WING, thickness: 0.012 });
    b.membrane(fingers[0], fingers[1], { color: WING, thickness: 0.012 });
    b.membrane(fingers[1], fingers[2], { color: WING, thickness: 0.012 });
    b.membrane(fingers[2], fingers[3], { color: WING, thickness: 0.012 });
    b.membrane(fingers[3], [W, [s * 0.26, 0.17, -0.12], [s * 0.1, 0.12, -0.08]], {
      color: WING,
      thickness: 0.012,
    });

    // Thumb with a small hooked claw.
    const T = [s * 0.46, 0.37, 0.05];
    b.rod(wrist, T, 0.006, { color: BONE_DARK });
    b.sweep(bezier(T, [s * 0.5, 0.39, 0.03], [s * 0.48, 0.36, 0.0]), [0.006, 0.0015], {
      color: CLAW,
      caps: { end: "point" },
    });
  }

  // Moist black nose on the snout tip.
  const nose = b.surface(headSweep).nearest([0, 0.3, 0.31]);
  b.stick(new THREE.SphereGeometry(0.022, 8, 6).scale(1.3, 0.85, 0.9), NOSE, nose, { embed: 0.35 });

  // Half-eaten fig held between the feet.
  const fig = b.lathe(
    [
      [0, -0.045],
      [0.035, -0.045],
      [0.045, -0.01],
      [0.04, 0.025],
      [0.022, 0.05],
      [0, 0.058],
    ],
    { at: [0, 0.15, 0.22], color: FIG, smoothing: 1 },
  );
  const bite = b.surface(fig).nearest([0, 0.18, 0.27]);
  b.stick(new THREE.CylinderGeometry(0.02, 0.024, 0.008, 8), FLESH, bite, { embed: 0.25 });
  b.rod([0, 0.2, 0.22], [0.005, 0.222, 0.22], 0.004, { color: STEM });

  return b.root;
}
```