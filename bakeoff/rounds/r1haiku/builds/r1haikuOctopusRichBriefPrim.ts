import * as THREE from "three";
import { createBuilder, frame, rng } from "../../../../src/index";

export const meta = {
  name: "Reef Octopus",
  description:
    "A grumpy coral-and-rust reef octopus with golden bar-pupil eyes, eight curling cream-suckered arms, and one arm raising a brass shipwreck key.",
};

export default function build() {
  const b = createBuilder({ name: "reef-octopus" });
  const R = rng(11);

  const CORAL = "#d9573b";
  const RUST = "#9c3d22";
  const PALE = "#f2c3a0";
  const CREAM = "#f4ead2";
  const GOLD = "#f2b632";
  const BRASS = "#c8962e";
  const DARK = "#1a0f0c";

  // Skeleton root: the mantle sits on it.
  b.joint("body", { at: [0, 0.62, 0] });

  // Bulbous mantle head.
  const mantle = b.part(new THREE.SphereGeometry(1, 16, 12), CORAL, {
    at: [0, 0.62, 0],
    scale: [0.42, 0.5, 0.4],
  });

  // Rounded crown bulge on top of the head.
  b.part(new THREE.SphereGeometry(1, 10, 8), RUST, {
    at: [0, 0.98, -0.05],
    scale: [0.3, 0.16, 0.28],
  });

  // Bumps and paler mottling scattered over the mantle.
  const bumps = b.surface(mantle).scatter(90);
  for (const h of bumps) {
    const r = 0.018 + R() * 0.012;
    const col = R() < 0.5 ? RUST : PALE;
    b.stick(new THREE.SphereGeometry(r, 5,4), col, h);
  }

  // Golden eyes with bar-shaped pupils.
  for (const s of [1, -1]) {
    const ex = 0.16 * s;
    b.stick(new THREE.SphereGeometry(0.075, 10, 8), GOLD, frame([ex, 0.68, 0.34], [0, 0, 1]));
    b.stick(
      new THREE.BoxGeometry(0.09, 0.025, 0.02),
      DARK,
      frame([ex, 0.68, 0.34 + 0.07], [0, 0, 1]),
    );
  }

  // Grumpy brows, angled down toward the centre.
  for (const s of [1, -1]) {
    const brow = new THREE.BoxGeometry(0.15, 0.035, 0.05);
    brow.rotateZ(s * 0.35);
    b.stick(brow, RUST, frame([0.16 * s, 0.79, 0.36], [0, 0, 1]));
  }

  // Beak tucked under the arms.
  b.part(new THREE.ConeGeometry(0.035, 0.07, 6), DARK, {
    frame: frame([0, 0.2, 0.12], [0, -1, 0], [0, 0, 1]),
  });

  // Sucker shared by every arm.
  const sucker = new THREE.CylinderGeometry(0.02, 0.024, 0.014, 8);
  sucker.rotateX(Math.PI / 2);

  // Eight arms. Arm 0 rises forward and holds the key.
  const armPoints: number[][][] = [];
  for (let i = 0; i < 8; i++) {
    let pts: number[][];
    if (i === 0) {
      pts = [
        [0.3, 0.3, 0.05],
        [0.42, 0.42, 0.2],
        [0.45, 0.6, 0.4],
        [0.42, 0.8, 0.55],
        [0.38, 0.92, 0.62],
      ];
    } else {
      const az = (i * Math.PI) / 4 + 0.2;
      const sign = i % 2 ? 1 : -1;
      pts = [];
      for (let k = 0; k < 7; k++) {
        const t = k / 6;
        const r = 0.13 + 0.8 * t;
        const a = az + sign * t * 1.8;
        const x = Math.sin(a) * r;
        const z = Math.cos(a) * r;
        const y = Math.max(0.035, 0.3 - 0.26 * t + 0.06 * Math.sin(Math.PI * t));
        pts.push([x, y, z]);
      }
    }
    armPoints.push(pts);

    const arm = b.chain(`arm${i}`, pts, { role: "tentacle" });
    b.sweep(arm, { radius: 0.06, color: CORAL });
    b.along(arm, 14, (at) => {
      b.stick(sucker, CREAM, at);
    });
  }

  // The brass shipwreck key held up by arm 0.
  const tip = armPoints[0][4]; // [0.38, 0.92, 0.62]
  const keyZ = 0.66;
  b.part(new THREE.BoxGeometry(0.024, 0.2, 0.024), BRASS, {
    at: [tip[0], tip[1], keyZ],
  });
  b.part(new THREE.TorusGeometry(0.05, 0.013, 8, 14), BRASS, {
    at: [tip[0], tip[1] + 0.12, keyZ],
  });
  b.part(new THREE.BoxGeometry(0.04, 0.022, 0.024), BRASS, {
    at: [tip[0] + 0.02, tip[1] - 0.11, keyZ],
  });
  b.part(new THREE.BoxGeometry(0.03, 0.02, 0.024), BRASS, {
    at: [tip[0] + 0.015, tip[1] - 0.06, keyZ],
  });

  return b.root;
}
