import * as THREE from "three";
import { catmull, countershade, createBuilder, limb, rng, stripes } from "../../../../src/index";

type V = [number, number, number];

const SHELL = "#c49a86";
const SHELL_DARK = "#97705f";
const BELLY = "#e3cbbd";
const LEG = "#b48d7b";
const EAR = "#d9a99a";
const CLAW = "#3d332e";
const EYE = "#1c1816";
const HAIR = "#f2eadf";

export const meta = {
  name: "Nine-banded armadillo",
  description:
    "A trotting nine-banded armadillo: a banded shell of overlapping plates, a pointed snout, tall leathery ears, beady eyes, clawed feet, a long tapering armoured tail and a sprinkle of pale coarse hairs.",
};

export default function build() {
  const b = createBuilder({ name: "armadillo" });

  // Skeleton: root at the hips, spine running nose-ward, tail trailing back.
  const hips = b.joint("hips", { at: [0, 0.28, -0.22] });

  const shell = countershade(stripes(SHELL, SHELL_DARK, { size: 0.04, axis: "z", seed: 3 }), BELLY, { level: -0.3 });

  const spine = b.chain("spine", catmull([[0, 0.28, -0.26], [0, 0.29, -0.06], [0, 0.3, 0.12]]), {
    parent: hips,
    names: ["spineRear", "spineFront"],
    role: "spine",
  });

  // Banded body: a domed tube that is wider at the middle than at the rump and shoulders.
  const body = b.sweep(
    spine,
    (t) => [0.13 + 0.03 * Math.sin(Math.PI * t), 0.12 + 0.025 * Math.sin(Math.PI * t)],
    { color: shell },
  );

  // Head: a banded capsule on a neck joint, with a pointed snout.
  const head = b.joint("head", { parent: spine.joints[1], at: [0, 0.32, 0.2], aim: [0, 0.3, 0.4] });
  b.capsule([0, 0.31, 0.14], [0, 0.32, 0.25], 0.075, { bone: head, color: shell });
  b.spike([0, 0.3, 0.22], [0, 0.27, 0.42], null, 0.06, { bone: head, color: EAR });

  // Tall, leathery ears standing up from the top of the head.
  const earOutline: [number, number][] = [
    [-0.03, 0],
    [0.03, 0],
    [0.035, 0.05],
    [0.02, 0.1],
    [0, 0.115],
    [-0.02, 0.1],
    [-0.035, 0.05],
  ];
  for (const s of [1, -1]) {
    b.extrude(earOutline, {
      at: head.local({ left: s * 0.035, up: 0.06, forward: -0.03 }),
      x: [s, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      smoothing: 1,
      color: EAR,
      bone: head,
    });
  }

  // Small beady eyes set on the sides of the head.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.014, 6, 4), EYE, {
      bone: head,
      at: head.local({ left: s * 0.07, up: 0.02, forward: 0 }),
    });
  }

  // Legs: a trot, with diagonal pairs (front-left with hind-right) forward.
  const leg = (tag: string, hip: V, foot: V, bend: V, parent: typeof hips) => {
    const pts = limb(hip, foot, [0.14, 0.13], [bend]);
    const ch = b.chain(`leg${tag}`, pts, {
      parent,
      names: [`hip${tag}`, `knee${tag}`, `foot${tag}`],
      role: "leg",
    });
    b.sweep(ch, (t) => 0.05 - 0.02 * t, { color: LEG });
    const ft = ch.tip ?? ch.joints[ch.joints.length - 1];
    b.part(new THREE.BoxGeometry(0.08, 0.05, 0.1), LEG, {
      bone: ft,
      at: [foot[0], 0.025, foot[2] + 0.01],
    });
    for (const dx of [-0.024, 0, 0.024]) {
      b.spike(
        [foot[0] + dx, 0.03, foot[2] + 0.04],
        [foot[0] + dx, 0.0, foot[2] + 0.085],
        null,
        0.008,
        { bone: ft, color: CLAW },
      );
    }
  };
  leg("FL", [0.1, 0.27, 0.12], [0.1, 0.025, 0.15], [0, 0, -1], spine.joints[1]);
  leg("FR", [-0.1, 0.27, 0.12], [-0.1, 0.025, 0.06], [0, 0, -1], spine.joints[1]);
  leg("HL", [0.09, 0.27, -0.2], [0.1, 0.025, -0.26], [0, 0, 1], hips);
  leg("HR", [-0.09, 0.27, -0.2], [-0.1, 0.025, -0.14], [0, 0, 1], hips);

  // Long armoured tail tapering to a point, banded like the shell.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.27, -0.24],
      [0, 0.24, -0.45],
      [0, 0.21, -0.66],
      [0, 0.2, -0.86],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  b.sweep(tail, (t) => 0.06 * (1 - t) + 0.012, { color: shell, caps: { end: "point" } });

  // Coarse pale hairs poking out between the bands.
  const hairs = b.surface(body).scatter(70, {
    rng: rng(11),
    minDist: 0.035,
    filter: (h) => h.n.y > -0.3,
  });
  for (const h of hairs) b.spike(h, h, 0.035, 0.0025, { color: HAIR });

  return b.root;
}
