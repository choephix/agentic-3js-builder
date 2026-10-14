import * as THREE from "three";
import { catmull, createBuilder, gradient } from "../../../../src/index";

export const meta = {
  name: "Moon jellyfish",
  description:
    "A translucent pale-blue moon jellyfish with four pink horseshoe gonads, a frill of fine rim tentacles and four ruffled pearly oral arms, lit from within by a glowing core.",
};

const DEG = Math.PI / 180;
const Y0 = 0.5; // bell rim height; the arm tips reach down to the floor

export default function build() {
  const b = createBuilder({ name: "moon-jellyfish", detail: 1 });

  // Skeleton: one root bone for the bell, one chain per oral arm.
  const bell = b.joint("bell", { at: [0, Y0, 0] });

  // Bell: a hollow dome of revolution, pale blue, brighter toward the crown.
  const bellPaint = gradient("#e8f7ff", "#79b8f0", [0, Y0, 0], [0, Y0 + 0.12, 0]);
  b.lathe(
    [
      [0.13, 0],
      [0.125, 0.03],
      [0.105, 0.07],
      [0.07, 0.1],
      [0.03, 0.116],
      [0, 0.12],
      [0, 0.106],
      [0.03, 0.1],
      [0.065, 0.08],
      [0.095, 0.045],
      [0.112, 0.012],
      [0.115, 0],
    ],
    { color: bellPaint, at: [0, Y0, 0], axis: [0, 1, 0], segments: 16, bone: bell, name: "bell" },
  );

  // Inner glow: a pale core that reads as the light inside the lantern.
  b.part(new THREE.SphereGeometry(0.036, b.segments(8), b.segments(6)), "#fff4d4", {
    at: [0, Y0 + 0.025, 0],
    bone: bell,
    name: "glow",
  });

  // Four pink horseshoe gonads, flat on the bell's inner crown, arcs facing outward.
  const arc = Math.PI * 1.3;
  [0, 90, 180, 270].forEach((deg, i) => {
    const t = deg * DEG;
    const geometry = new THREE.TorusGeometry(0.036, 0.0095, b.segments(6), b.segments(14), arc);
    b.part(geometry, "#ff6fae", {
      at: [0.05 * Math.cos(t), Y0 + 0.035, 0.05 * Math.sin(t)],
      rotation: [90, 0, deg - (arc / 2) * (180 / Math.PI)],
      bone: bell,
      name: `gonad${i + 1}`,
    });
  });

  // Frill: fine translucent tentacles round the rim, varied in length.
  for (let i = 0; i < 44; i++) {
    const t = (i / 44) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const len = 0.03 + 0.014 * (((i * 7) % 5) / 4);
    b.capsule(
      [0.127 * c, Y0 - 0.004, 0.127 * s],
      [0.14 * c, Y0 - len, 0.14 * s],
      0.0022,
      { color: "#f1ecff", bone: bell, name: `frill${i + 1}` },
    );
  }

  // Four long ruffled oral arms in pearly white fading to lilac, each a chain swept into a frilled ribbon.
  const armColor = gradient("#fffaff", "#c7a6f6", [0, 0.48, 0], [0, 0.04, 0]);
  [45, 135, 225, 315].forEach((deg, i) => {
    const a = deg * DEG;
    const c = Math.cos(a);
    const s = Math.sin(a);
    // Point at radius r from the axis, height y, swayed sideways by w.
    const P = (r: number, y: number, w = 0): [number, number, number] => [r * c - w * s, y, r * s + w * c];
    const path = catmull([
      P(0.05, 0.49),
      P(0.09, 0.37, 0.012),
      P(0.13, 0.25, -0.02),
      P(0.11, 0.14, 0.02),
      P(0.14, 0.07, -0.03),
      P(0.12, 0.03, 0.02),
    ]);
    const arm = b.chain(`arm${i + 1}`, path, {
      parent: bell,
      count: 4,
      names: [1, 2, 3, 4].map((k) => `arm${i + 1}_${k}`),
      role: "tentacle",
    });
    b.sweep(
      arm,
      (t: number): [number, number] => [
        0.026 * (1 - 0.55 * t) + 0.006 * Math.sin(t * Math.PI * 8),
        0.007 * (1 - 0.4 * t),
      ],
      { color: armColor, name: `oralArm${i + 1}`, detail: 0.6 },
    );
  });

  return b.root;
}
