import * as THREE from "three";
import { createBuilder, spots } from "../../../../src/index";

export const meta = {
  name: "crab",
  description: "A red shore crab: a domed shell with pale spots, stalked eyes, two pincers and four walking legs a side.",
};

const SHELL = "#c8452c";
const SHELL_DARK = "#8f2c1c";
const LEG = "#8a2d1d";
const CLAW = "#d9573a";
const PALE = "#f0d6a8";
const EYE = "#f4efe2";
const PUPIL = "#151515";
const SPIKE = "#e8a06a";

export default function build() {
  const b = createBuilder({ name: "crab" });

  // Body: root joint sits in the middle of the shell.
  const body = b.joint("body", { at: [0, 0.07, 0] });

  // Domed carapace: the top half of a sphere, squashed into a shell.
  const shell = b.part(
    new THREE.SphereGeometry(0.14, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    spots(SHELL, PALE, { size: 0.05, amount: 0.25 }),
    { bone: body, at: [0, 0.07, 0], scale: [1, 0.42, 0.78], flat: true },
  );

  // Tucked abdomen under the rear of the shell.
  b.part(new THREE.SphereGeometry(0.08, 12, 8), SHELL_DARK, {
    bone: body,
    at: [0, 0.045, -0.06],
    scale: [0.95, 0.45, 1.15],
    flat: true,
  });

  // Blunt rostrum at the front.
  b.part(new THREE.BoxGeometry(0.07, 0.035, 0.05), SHELL_DARK, {
    bone: body,
    at: [0, 0.06, 0.13],
    flat: true,
  });

  // Rim spikes on the shell, seated on the surface.
  const surf = b.surface(shell);
  for (const az of [-150, -110, -70, 70, 110, 150]) {
    const hit = surf.around([0, 0.07, 0]).at(az, 25);
    if (hit) b.stick(new THREE.ConeGeometry(0.012, 0.035, 6), SPIKE, hit);
  }
  const crown = surf.around([0, 0.07, 0]).at(0, 70);
  if (crown) b.stick(new THREE.ConeGeometry(0.014, 0.04, 6), SPIKE, crown);

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    // Eye stalks: a short curved chain ending in an eye joint.
    const stalk = b.chain(
      `stalk${L}`,
      [
        [s * 0.06, 0.09, 0.09],
        [s * 0.066, 0.17, 0.11],
        [s * 0.066, 0.235, 0.125],
      ],
      { parent: body, names: [`stalkBase${L}`, `stalkMid${L}`, `eye${L}`] },
    );
    b.sweep(stalk, [0.011, 0.009], { color: LEG });
    const eyeJoint = stalk.joints[stalk.joints.length - 1];
    const ex = s * 0.066;
    const ey = 0.245;
    const ez = 0.13;
    b.part(new THREE.SphereGeometry(0.03, 8, 6), EYE, {
      bone: eyeJoint,
      at: [ex, ey, ez],
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.015, 6, 4), PUPIL, {
      bone: eyeJoint,
      at: [ex, ey + 0.005, ez + 0.024],
    });

    // Four walking legs per side: hip, knee and foot on each chain.
    const legs = [
      { z: 0.035, k: [0.2, 0.09, 0.07], f: [0.32, 0.12] },
      { z: 0.0, k: [0.21, 0.085, 0.01], f: [0.34, 0.0] },
      { z: -0.04, k: [0.2, 0.085, -0.05], f: [0.32, -0.1] },
      { z: -0.08, k: [0.17, 0.09, -0.11], f: [0.25, -0.17] },
    ];
    legs.forEach((leg, i) => {
      const chain = b.chain(
        `leg${L}${i}`,
        [
          [s * 0.09, 0.06, leg.z],
          [s * leg.k[0], leg.k[1], leg.k[2]],
          [s * leg.f[0], 0.008, leg.f[1]],
        ],
        {
          parent: body,
          names: [`hip${L}${i}`, `knee${L}${i}`, `foot${L}${i}`],
          role: "leg",
        },
      );
      b.sweep(chain, [0.017, 0.008], { color: LEG });
      const foot = chain.joints[chain.joints.length - 1];
      b.part(new THREE.SphereGeometry(0.012, 6, 4), SHELL_DARK, {
        bone: foot,
        at: [s * leg.f[0], 0.008, leg.f[1]],
      });
    });

    // Pincer arm: shoulder, elbow and wrist on one chain.
    const arm = b.chain(
      `claw${L}`,
      [
        [s * 0.09, 0.07, 0.08],
        [s * 0.19, 0.085, 0.18],
        [s * 0.2, 0.1, 0.27],
      ],
      { parent: body, names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`], role: "arm" },
    );
    b.sweep(arm, [0.02, 0.014], { color: CLAW });
    const wrist = arm.joints[arm.joints.length - 1];

    // Palm.
    b.part(new THREE.BoxGeometry(0.075, 0.055, 0.07), CLAW, {
      bone: wrist,
      at: [s * 0.2, 0.1, 0.28],
      flat: true,
    });

    // Upper and lower pincer blades, drawn in the horizontal plane.
    b.extrude(
      [
        [-0.04, -0.03],
        [0.04, -0.03],
        [0.035, 0.06],
        [0.012, 0.15, "sharp"],
        [-0.012, 0.1],
        [-0.035, 0.05],
      ],
      {
        at: [s * 0.2, 0.13, 0.3],
        x: [s, 0, 0],
        y: [0, 0, 1],
        thickness: 0.022,
        bevel: 0.005,
        smoothing: 1,
        color: CLAW,
        bone: wrist,
      },
    );
    b.extrude(
      [
        [-0.04, -0.03],
        [0.04, -0.03],
        [0.03, 0.05],
        [0.008, 0.12, "sharp"],
        [-0.02, 0.07],
      ],
      {
        at: [s * 0.2, 0.085, 0.3],
        x: [s, 0, 0],
        y: [0, 0, 1],
        thickness: 0.022,
        bevel: 0.005,
        smoothing: 1,
        color: CLAW,
        bone: wrist,
      },
    );
  }

  return b.root;
}
