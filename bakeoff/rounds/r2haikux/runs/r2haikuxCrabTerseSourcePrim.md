```ts
import * as THREE from "three";
import { countershade, createBuilder, mix, paint, spots } from "agentic-3js-builder";
import type { Builder, Fill, Joint } from "agentic-3js-builder";

export const meta = {
  name: "crab",
  description:
    "A stylised red-orange shore crab: a domed, speckled shell on eight jointed walking legs with cream knuckles, " +
    "two raised claws with black-tipped pincers, and eyes on stalks.",
};

const SHELL = "#c9472c";
const SHELL_DEEP = "#7a2317";
const SPECK = "#5a1a11";
const CREAM = "#f4dda8";
const PALE = "#e6c088";
const INK = "#15100e";
const GLINT = "#fff6dc";
const LEG_TOP = "#d55b33";
const LEG_TIP = "#7a2a1a";

type V = [number, number, number];

/** Walking legs drawn for the crab's left (+X); each is hip, knee, ankle, tip. The right side is mirrored. */
const WALKERS: Array<[V, V, V, V]> = [
  [
    [0.085, 0.1, 0.035],
    [0.15, 0.14, 0.06],
    [0.21, 0.07, 0.1],
    [0.225, 0, 0.13],
  ],
  [
    [0.085, 0.1, 0],
    [0.16, 0.135, 0],
    [0.23, 0.06, -0.01],
    [0.25, 0, 0],
  ],
  [
    [0.07, 0.1, -0.035],
    [0.15, 0.13, -0.07],
    [0.22, 0.06, -0.09],
    [0.24, 0, -0.1],
  ],
  [
    [0.03, 0.1, -0.07],
    [0.11, 0.13, -0.13],
    [0.17, 0.06, -0.15],
    [0.19, 0, -0.17],
  ],
];

/** Lateral carapace spines: base x, y, z, then direction (x is mirrored per side). */
const SPINES: Array<[number, number, number, number, number, number]> = [
  [0.07, 0.116, 0.04, 0.9, 0.4, 0.3],
  [0.074, 0.114, 0, 1.0, 0.3, 0.05],
  [0.066, 0.112, -0.04, 0.8, 0.3, -0.35],
];

/** Claw outlines in the horizontal plane, metres: fixed finger on the outer edge. */
const FIXED_FINGER: [number, number][] = [
  [-0.011, 0],
  [0.011, 0],
  [0.005, 0.07],
  [0, 0.09],
  [-0.005, 0.07],
];

/** Moving finger, drawn from its hinge, closing on the fixed finger. */
const MOVING_FINGER: [number, number][] = [
  [-0.01, 0],
  [0.01, 0],
  [0.02, 0.09],
];

export default function crab() {
  const b: Builder = createBuilder({ name: "crab", paintSize: 1024 });
  const seg = (n: number) => b.segments(n);
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // Shell: red with dark speckles, shading to a deeper belly.
  const shell = countershade(spots(SHELL, SPECK, { size: 0.035, amount: 0.3, seed: 4 }), SHELL_DEEP, {
    level: 0,
    soft: 0.4,
  });
  // Legs fade from the body colour to dark tips along their reach.
  const leg = paint((p) => mix(LEG_TOP, LEG_TIP, Math.min(1, Math.abs(p.x) / 0.22)));

  /** A tapering tube from a to c, rigid on `bone`. */
  const tube = (a: THREE.Vector3, c: THREE.Vector3, r0: number, r1: number, bone: Joint, color: Fill) =>
    b.part(new THREE.CylinderGeometry(r1, r0, a.distanceTo(c), 7), color, {
      at: a.clone().lerp(c, 0.5),
      dir: c.clone().sub(a),
      bone,
    });

  /** A ball at `at`, rigid on `bone`. */
  const ball = (at: THREE.Vector3, r: number, color: Fill, bone: Joint) =>
    b.part(new THREE.SphereGeometry(r, seg(8), seg(6)), color, { at, bone });

  // Body: the root bone sits at the middle of the shell.
  const body = b.joint("body", { at: [0, 0.1, 0] });
  b.part(new THREE.SphereGeometry(1, seg(14), seg(9)), shell, {
    at: [0, 0.1, 0],
    scale: [0.1, 0.035, 0.075],
    bone: body,
    name: "carapace",
  });
  b.spike([0, 0.104, 0.06], [0, 0.35, 1], 0.04, 0.011, { color: SHELL_DEEP, bone: body, name: "rostrum" });
  b.part(new THREE.SphereGeometry(1, seg(8), seg(6)), CREAM, {
    at: [0, 0.082, 0.072],
    scale: [0.03, 0.012, 0.02],
    bone: body,
    name: "mouth",
  });
  b.slab(
    [
      [-0.04, 0.058, -0.01],
      [0.04, 0.058, -0.01],
      [0.028, 0.058, -0.075],
      [-0.028, 0.058, -0.075],
    ],
    { color: PALE, thickness: 0.005, bone: body, name: "abdomen" },
  );

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const at = (x: number, y: number, z: number) => v(s * x, y, z);

    for (const [x, y, z, dx, dy, dz] of SPINES)
      b.spike(at(x, y, z), [s * dx, dy, dz], 0.026, 0.009, { color: SHELL_DEEP, bone: body });

    // Eyes on stalks, with a glint.
    const base = at(0.028, 0.105, 0.055);
    const top = at(0.034, 0.15, 0.072);
    const stalk = b.joint(`eyeStalk${side}`, { parent: body, at: base, aim: top });
    tube(base, top, 0.0065, 0.0045, stalk, SHELL);
    ball(top, 0.018, INK, stalk);
    ball(top.clone().add(v(s * 0.005, 0.0065, 0.0119)), 0.0045, GLINT, stalk);

    // Four walking legs: hip, knee, ankle, foot, with cream knuckles.
    WALKERS.forEach(([hip, knee, ankle, tip], i) => {
      const tag = `${side}${i + 1}`;
      const [a, k, n, f] = [hip, knee, ankle, tip].map(([x, y, z]) => at(x, y, z));
      const chain = b.chain(`leg${tag}`, [a, k, n, f], {
        parent: body,
        role: "leg",
        names: [`hip${tag}`, `knee${tag}`, `ankle${tag}`, `foot${tag}`],
      });
      const [hipJ, kneeJ, ankleJ] = chain.joints;
      tube(a, k, 0.011, 0.009, hipJ, leg);
      ball(k, 0.0105, CREAM, kneeJ);
      tube(k, n, 0.009, 0.0075, kneeJ, leg);
      ball(n, 0.008, CREAM, ankleJ);
      tube(n, f, 0.0075, 0.004, ankleJ, leg);
    });

    // Raised cheliped: an arm chain ending in a palm, a fixed finger and a hinged moving finger.
    const shoulder = at(0.07, 0.105, 0.06);
    const elbow = at(0.105, 0.1, 0.125);
    const wrist = at(0.1, 0.095, 0.19);
    const hand = at(0.095, 0.09, 0.225);
    const arm = b.chain(`arm${side}`, [shoulder, elbow, wrist, hand], {
      parent: body,
      role: "arm",
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
    });
    const [shoulderJ, elbowJ, wristJ, handJ] = arm.joints;
    tube(shoulder, elbow, 0.016, 0.013, shoulderJ, SHELL);
    ball(elbow, 0.014, SHELL, elbowJ);
    tube(elbow, wrist, 0.013, 0.011, elbowJ, SHELL);
    ball(wrist, 0.0125, SHELL, wristJ);
    tube(wrist, hand, 0.011, 0.013, wristJ, SHELL);
    b.part(new THREE.SphereGeometry(1, seg(8), seg(6)), shell, {
      at: hand,
      scale: [0.042, 0.034, 0.048],
      bone: handJ,
      name: `palm${side}`,
    });

    b.extrude(FIXED_FINGER, {
      color: SHELL,
      at: hand.clone().add(v(s * 0.012, 0, 0.02)),
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: 0.016,
      bevel: 0.004,
      bone: handJ,
      name: `fingerFixed${side}`,
    });
    const pivot = hand.clone().add(v(-s * 0.008, 0, 0.02));
    const pincer = b.joint(`pincer${side}`, {
      parent: handJ,
      at: pivot,
      dir: [0, 0, 1],
      up: [1, 0, 0],
      role: "jaw",
    });
    b.extrude(MOVING_FINGER, {
      color: SHELL,
      at: pivot,
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: 0.014,
      bevel: 0.003,
      bone: pincer,
      name: `fingerMoving${side}`,
    });
    ball(hand.clone().add(v(s * 0.012, 0, 0.1)), 0.011, INK, pincer);
  }

  return b.root;
}
```