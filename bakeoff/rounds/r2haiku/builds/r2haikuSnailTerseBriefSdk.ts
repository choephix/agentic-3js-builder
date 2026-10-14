import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "snail",
  description:
    "A stylised garden snail: a stepped striped spiral shell on a soft tan body, with a flat foot and two pairs of stalked tentacles.",
};

export default function build() {
  const b = createBuilder({ name: "snail" });
  const R = rng(7);

  // Skeleton: body root, head and neck, tentacle chains
  const body = b.joint("body", { at: [0, 0.05, 0] });
  const head = b.joint("head", { at: [0, 0.1, 0.22], parent: body });

  const BODY = "#d9c27a";
  const FOOT = "#c9ad62";
  const SHELL = "#8a5a2b";
  const BAND = "#e8d9a8";
  const DARK = "#2b1d12";
  const EYE = "#151515";

  // Foot: flattened sole under the body, bottom touching y = 0
  b.part(
    new THREE.SphereGeometry(1, 12, 8).scale(0.075, 0.03, 0.3),
    FOOT,
    { at: [0, 0.03, 0.0], bone: body },
  );

  // Soft mantle / body mass
  b.part(
    new THREE.SphereGeometry(1, 10, 8).scale(0.09, 0.09, 0.22),
    BODY,
    { at: [0, 0.1, 0.02], bone: body },
  );

  // Neck: a chain from body to head, swept into a tube
  const neck = b.chain(
    "neck",
    [
      [0, 0.09, 0.12],
      [0, 0.11, 0.18],
      [0, 0.11, 0.24],
    ],
    { role: "neck" },
  );
  b.sweep(neck, 0.065, { color: BODY });

  // Head: a blocky rounded mass with a darker snout tip
  b.part(
    new THREE.SphereGeometry(1, 10, 8).scale(0.075, 0.07, 0.09),
    BODY,
    { at: [0, 0.11, 0.25], bone: head },
  );
  b.part(
    new THREE.SphereGeometry(1, 8, 6).scale(0.05, 0.045, 0.04),
    FOOT,
    { at: [0, 0.095, 0.32], bone: head },
  );

  // Shell: stepped spiral of decreasing spheres along the coil axis (Z),
  // with a cream band on each whorl.
  const axisY = 0.29;
  const whorls: { z: number; r: number; col: string }[] = [
    { z: 0.0, r: 0.2, col: SHELL },
    { z: -0.07, r: 0.17, col: SHELL },
    { z: -0.13, r: 0.13, col: SHELL },
    { z: -0.18, r: 0.09, col: SHELL },
    { z: -0.22, r: 0.05, col: SHELL },
  ];
  whorls.forEach((w, i) => {
    b.part(
      new THREE.SphereGeometry(w.r, 14, 10).scale(1, 1, 0.75),
      w.col,
      { at: [0, axisY, w.z], bone: body },
    );
    if (i < 4) {
      // Cream band wrapping each whorl, lying across the coil axis
      b.part(
        new THREE.TorusGeometry(w.r * 0.97, 0.016, 6, 18),
        BAND,
        { at: [0, axisY, w.z + 0.02], bone: body },
      );
    }
  });

  // Shell top bumps: little stuck-on studs for readability
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + R() * 0.2;
    const y = axisY + Math.sin(a) * 0.19;
    const x = Math.cos(a) * 0.19;
    b.part(
      new THREE.SphereGeometry(0.018, 6, 5),
      DARK,
      { at: [x * 0.6, y * 0.6 + 0.2 * 0.4, -0.04], bone: body },
    );
  }

  // Upper tentacles (eye stalks), with eyes on their tips
  for (const side of [1, -1]) {
    const name = side > 0 ? "eyeStalkL" : "eyeStalkR";
    const x = 0.04 * side;
    const stalk = b.chain(
      name,
      [
        [x, 0.15, 0.3],
        [x * 1.2, 0.23, 0.31],
        [x * 1.3, 0.3, 0.3],
      ],
      { role: "tentacle" },
    );
    b.sweep(stalk, 0.017, { color: BODY });
    b.part(
      new THREE.SphereGeometry(0.02, 8, 6),
      EYE,
      { at: stalk.at(1), bone: head },
    );
  }

  // Lower tentacles: short, stubby feelers
  for (const side of [1, -1]) {
    const x = 0.055 * side;
    const feel = b.chain(
      side > 0 ? "feelL" : "feelR",
      [
        [x, 0.1, 0.3],
        [x * 1.2, 0.13, 0.33],
        [x * 1.25, 0.15, 0.34],
      ],
      { role: "tentacle" },
    );
    b.sweep(feel, 0.012, { color: BODY });
  }

  return b.root;
}
