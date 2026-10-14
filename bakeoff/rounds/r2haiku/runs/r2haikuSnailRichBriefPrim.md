```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "garden-snail-adventurer",
  description:
    "A grey-green garden snail with a caramel, chocolate and cream spiral shell, eye stalks, feelers and a ladybird riding on top.",
};

export default function build() {
  const b = createBuilder({ name: "garden-snail-adventurer" });
  const rnd = rng(7);

  // Palette
  const BODY = "#8f9d88";
  const BODY_DARK = "#66745f";
  const SHINE = "#c9d6c2";
  const CARAMEL = "#c27a3a";
  const CHOCOLATE = "#5a3320";
  const CREAM = "#f1e3c4";
  const BLACK = "#161311";
  const WHITE = "#fbfbf5";
  const RED = "#d2321e";

  // Skeleton: body is the root, head, shell and ladybird hang off it.
  const body = b.joint("body", { at: [0, 0.02, 0] });
  const head = b.joint("head", { at: [0, 0.024, 0.09], parent: body });
  const shell = b.joint("shell", { at: [0, 0.075, -0.03], parent: body });
  const bug = b.joint("ladybird", { at: [0, 0.128, -0.02], parent: shell });

  // Soft body: one smooth tube from tail to head.
  const bodyPath = [
    [0, 0.02, -0.04],
    [0, 0.022, 0.0],
    [0, 0.024, 0.06],
    [0, 0.026, 0.09],
  ];
  b.sweep(bodyPath, 0.019, { color: BODY });

  // Rounded head cap.
  b.part(new THREE.SphereGeometry(0.02, 14, 10), BODY, {
    at: [0, 0.024, 0.09],
    bone: head,
  });

  // Pebbly skin: small bumps scattered over the visible flank and back.
  for (let i = 0; i < 140; i++) {
    const t = rnd();
    const z = -0.03 + 0.12 * t;
    const theta = -0.3 + rnd() * (Math.PI + 0.6);
    const r = 0.0195 + rnd() * 0.0006;
    const y = 0.022 + 0.004 * t + r * Math.sin(theta);
    const x = r * Math.cos(theta);
    const size = 0.0018 + rnd() * 0.0016;
    b.part(new THREE.SphereGeometry(size, 6, 4), rnd() < 0.5 ? BODY_DARK : BODY, {
      at: [x, y, z],
      bone: body,
    });
  }

  // Slimy highlight along the back.
  b.part(new THREE.SphereGeometry(0.007, 10, 6), SHINE, {
    at: [0, 0.04, 0.035],
    bone: body,
    scale: [0.5, 0.25, 2.2],
  });

  // Eye stalks: long, bending tubes with black eyes and a tiny glint.
  const stalkPaths = [
    [
      [0.009, 0.036, 0.1],
      [0.012, 0.06, 0.105],
      [0.014, 0.082, 0.1],
    ],
    [
      [-0.009, 0.036, 0.1],
      [-0.012, 0.06, 0.105],
      [-0.014, 0.082, 0.1],
    ],
  ];
  for (const path of stalkPaths) {
    b.sweep(path, 0.0042, { color: BODY });
    const tip = path[2];
    b.part(new THREE.SphereGeometry(0.0055, 12, 8), BLACK, {
      at: tip,
      bone: head,
    });
    b.part(new THREE.SphereGeometry(0.0013, 6, 4), WHITE, {
      at: [tip[0] + 0.002 * Math.sign(tip[0]), tip[1] + 0.0025, tip[2] + 0.0042],
      bone: head,
    });
  }

  // Short feelers below the stalks.
  const feelerPaths = [
    [
      [0.005, 0.03, 0.11],
      [0.008, 0.04, 0.128],
    ],
    [
      [-0.005, 0.03, 0.11],
      [-0.008, 0.04, 0.128],
    ],
  ];
  for (const path of feelerPaths) {
    b.sweep(path, 0.0028, { color: BODY });
  }

  // Spiral shell: a glossy caramel dome, banded with chocolate and cream rings.
  b.part(new THREE.SphereGeometry(0.045, 18, 12), CARAMEL, {
    at: [0, 0.075, -0.03],
    bone: shell,
    scale: [1, 1.05, 0.85],
  });

  const shellRadius = 0.045;
  const shellHalfHeight = 0.0473;
  const bands: Array<[number, string]> = [
    [-0.024, CHOCOLATE],
    [-0.008, CREAM],
    [0.008, CHOCOLATE],
    [0.024, CREAM],
  ];
  for (const [h, col] of bands) {
    const ringRadius = shellRadius * Math.sqrt(1 - (h / shellHalfHeight) ** 2);
    const torus = new THREE.TorusGeometry(ringRadius, 0.0045, 8, 30).rotateX(
      Math.PI / 2,
    );
    b.part(torus, col, { at: [0, 0.075 + h, -0.03], bone: shell });
  }

  // Spire at the top of the whorl.
  b.part(new THREE.ConeGeometry(0.012, 0.03, 10), CARAMEL, {
    at: [0, 0.115, -0.045],
    bone: shell,
  });
  b.part(new THREE.SphereGeometry(0.0045, 8, 6), CREAM, {
    at: [0, 0.13, -0.045],
    bone: shell,
  });

  // Ladybird perched on the shell.
  const bugCentre = [0, 0.128, -0.02];
  const bugRx = 0.011;
  const bugRy = 0.0079;
  const bugRz = 0.01265;
  b.part(new THREE.SphereGeometry(bugRx, 14, 10), RED, {
    at: bugCentre,
    bone: bug,
    scale: [1, bugRy / bugRx, bugRz / bugRx],
  });
  b.part(new THREE.SphereGeometry(0.0055, 10, 8), BLACK, {
    at: [0, 0.124, -0.0075],
    bone: bug,
  });
  // Two little antennae on the head.
  for (const s of [1, -1]) {
    b.sweep(
      [
        [s * 0.002, 0.13, -0.0075],
        [s * 0.005, 0.138, -0.004],
      ],
      0.0009,
      { color: BLACK },
    );
  }

  // Spots on the wing cases, placed on the ellipsoid surface.
  const spots: Array<[number, number]> = [
    [0.0045, -0.0035],
    [-0.0045, -0.0035],
    [0.0035, -0.0105],
    [-0.0035, -0.0105],
  ];
  for (const [dx, dz] of spots) {
    const nx = dx / bugRx;
    const nz = (dz - (-0.02 + bugCentre[2] - bugCentre[2])) / bugRz;
    const under = 1 - nx * nx - ((dz + 0.02) / bugRz) ** 2;
    const dy = bugRy * Math.sqrt(Math.max(under, 0.05));
    void nz;
    b.part(new THREE.SphereGeometry(0.0022, 8, 6), BLACK, {
      at: [dx, bugCentre[1] + dy - 0.0008, dz - 0.02 + 0.02],
      bone: bug,
    });
  }

  return b.root;
}
```