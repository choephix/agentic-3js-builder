```ts
import * as THREE from "three";
import { createBuilder, catmull, limb, mottle, spots, stripes } from "agentic-3js-builder";

export const meta = {
  name: "crab",
  description: "A stylised crab: a domed red carapace, raised pincer claws, eye stalks and eight jointed walking legs.",
};

const SHELL = spots("#d9482b", "#7a1f10", { size: 0.05, amount: 0.35, seed: 4 });
const UNDER = "#f2a16b";
const LEG = stripes("#e8662f", "#f7d6a8", { size: 0.06 });
const CLAW = mottle("#e0553a", "#f09a6a", { size: 0.08, seed: 2 });
const SPINE = "#f3c9a0";
const DARK = "#1b1210";
const EYE = "#fbf7ef";

export default function build() {
  const b = createBuilder({ name: "crab" });

  // Body skeleton: one root joint for the carapace.
  const body = b.joint("body", { at: [0, 0.09, 0], role: "spine" });

  // Carapace: a flattened, widest-at-the-back dome.
  const carapace = b.loft(
    [
      { at: [0, 0.095, 0.11], w: 0.14, h: 0.045 },
      { at: [0, 0.1, 0.05], w: 0.28, h: 0.08 },
      { at: [0, 0.1, -0.03], w: 0.32, h: 0.1 },
      { at: [0, 0.095, -0.11], w: 0.26, h: 0.09 },
      { at: [0, 0.09, -0.17], w: 0.14, h: 0.06 },
    ],
    { bone: body, color: SHELL },
  );

  // Tucked abdomen under the rear of the shell.
  b.loft(
    [
      { at: [0, 0.06, -0.16], w: 0.16, h: 0.05 },
      { at: [0, 0.05, -0.22], w: 0.1, h: 0.04 },
      { at: [0, 0.045, -0.26], w: 0.04, h: 0.03 },
    ],
    { bone: body, color: UNDER },
  );

  // Small stylised spines pricked onto the shell surface.
  const shell = b.surface(carapace);
  const spinePoints: [number, number, number][] = [
    [0.1, 0.16, 0.0],
    [-0.1, 0.16, 0.0],
    [0.13, 0.15, -0.08],
    [-0.13, 0.15, -0.08],
    [0.0, 0.16, -0.14],
    [0.0, 0.16, 0.06],
  ];
  for (const p of spinePoints) {
    const hit = shell.nearest(p);
    b.stick(new THREE.ConeGeometry(0.014, 0.045, 6), SPINE, hit, { embed: 0.3 });
  }

  // Mouth block at the front of the carapace.
  b.part(new THREE.BoxGeometry(0.07, 0.025, 0.03), DARK, {
    bone: body,
    at: body.local({ forward: 0.11, up: -0.02 }),
  });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Eye stalk: a three-span chain whose tip joint carries the eye.
    const stalk = b.chain(
      `stalk${side}`,
      catmull([
        [s * 0.07, 0.14, 0.1],
        [s * 0.075, 0.18, 0.12],
        [s * 0.07, 0.22, 0.15],
      ]),
      { parent: body, names: [`stalkBase${side}`, `stalkMid${side}`, `eye${side}`], role: "neck" },
    );
    b.sweep(stalk, (t) => 0.014 - 0.006 * t, { color: SHELL });
    const eyeTip = stalk.tip!;
    b.part(new THREE.SphereGeometry(0.032, 10, 8), EYE, { frame: eyeTip });
    b.part(new THREE.SphereGeometry(0.016, 8, 6), DARK, {
      bone: eyeTip,
      at: eyeTip.local({ forward: 0.03 }),
    });

    // Cheliped arm: shoulder, elbow, wrist (tip joint).
    const arm = b.chain(
      `arm${side}`,
      catmull([
        [s * 0.1, 0.12, 0.08],
        [s * 0.22, 0.14, 0.2],
        [s * 0.27, 0.12, 0.36],
      ]),
      { parent: body, names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm" },
    );
    b.sweep(arm, (t) => 0.035 - 0.012 * t, { color: SHELL });
    const wrist = arm.tip!;

    // Palm: an ellipsoid on the wrist.
    b.part(new THREE.SphereGeometry(0.06, 10, 8), CLAW, {
      frame: wrist,
      at: wrist.local([0, 0.03, 0]),
      scale: [1, 1.1, 0.8],
    });

    // Fixed pincer finger.
    const fixed = catmull([
      wrist.local([-s * 0.03, 0.04, 0.0]),
      wrist.local([-s * 0.04, 0.1, 0.01]),
      wrist.local([-s * 0.03, 0.15, 0.0]),
      wrist.local([-s * 0.005, 0.16, -0.005]),
    ]);
    b.sweep(fixed, [0.016, 0.006], { bone: wrist, color: CLAW });

    // Movable pincer finger on its own joint, so it can open and close.
    const pinch = b.joint(`pinch${side}`, {
      parent: wrist,
      at: wrist.local([s * 0.035, 0.03, 0]),
    });
    const movable = catmull([
      wrist.local([s * 0.035, 0.03, 0]),
      wrist.local([s * 0.045, 0.1, 0.01]),
      wrist.local([s * 0.03, 0.15, 0.0]),
      wrist.local([s * 0.01, 0.165, -0.005]),
    ]);
    b.sweep(movable, [0.016, 0.006], { bone: pinch, color: CLAW });

    // Four walking legs per side, IK-planted on the floor.
    const legs = [
      { z: 0.03, fx: 0.36, fz: 0.07 },
      { z: -0.04, fx: 0.4, fz: -0.02 },
      { z: -0.11, fx: 0.38, fz: -0.12 },
      { z: -0.18, fx: 0.31, fz: -0.2 },
    ];
    legs.forEach((leg, i) => {
      const hip: [number, number, number] = [s * 0.11, 0.09, leg.z];
      const target: [number, number, number] = [s * leg.fx, 0.012, leg.fz];
      const pts = limb(hip, target, [0.17, 0.17, 0.12], [
        [0, 1, 0],
        [0, 1, 0],
      ]);
      const walker = b.chain(`leg${side}${i}`, pts, {
        parent: body,
        names: [`hip${side}${i}`, `knee${side}${i}`, `ankle${side}${i}`, `foot${side}${i}`],
        role: "leg",
      });
      b.sweep(walker, (t) => 0.024 - 0.014 * t, { color: LEG });
    });
  }

  return b.root;
}
```