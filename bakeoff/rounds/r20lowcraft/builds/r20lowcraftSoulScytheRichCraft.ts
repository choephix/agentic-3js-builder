import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { grain, mottle } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import type { Radius, SweepOptions } from "../../../../src/sweep";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A towering scythe whose staff is a dragon spine and whose blade is a giant curved rib, crowned by a snarling dragon skull; trapped souls drift in the crescent and runes burn along the blade. Stands on a rune plinth.",
  style: "League of Legends",
  commit: "88fc1f0",
};

const BONE = cel(grain("#efe3c4", "#d9c9a2", { size: 0.03, axis: "y" }));
const BLADE = cel(mottle("#f2e8cb", "#d4c49c", { size: 0.12, seed: 4 }));
const BONE2 = "#c4b289";
const TOOTH = "#fff6dc";
const DARK = "#2a2840";
const STONE = cel(mottle("#4a4a68", "#605f82", { size: 0.1, seed: 2 }));
const GOLD = "#e0a82e";
const LEATHER = "#3a2230";
const WRAP = "#7a2f4a";
const TEAL = "#3dffd0";
const VIOLET = "#9a6bff";

const RUNE = svg(
  `<svg viewBox="0 0 120 16">${Array.from({ length: 9 }, (_, i) => {
    const x = 6 + i * 12.5;
    const v = i % 3;
    const d =
      v === 0
        ? `M${x} 2 L${x} 14 M${x} 4 L${x + 6} 8 L${x} 12`
        : v === 1
          ? `M${x} 2 L${x + 6} 8 L${x} 14 M${x + 6} 2 L${x + 6} 14`
          : `M${x} 8 L${x + 7} 8 M${x + 3} 2 L${x + 3} 14 M${x} 2 L${x + 7} 14`;
    return `<path d="${d}" stroke="${TEAL}" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }).join("")}</svg>`,
  { size: 480 },
);

export default function build() {
  const b = createBuilder({ name: "soulScythe" });
  const root = b.joint("root", { at: [0, 0, 0] });

  const P = (geo: THREE.BufferGeometry, color: string | typeof BONE, at: number[], opts: Omit<PartOptions, "bone" | "at"> = {}) =>
    b.part(geo, color, { bone: root, at, ...opts });
  const S = (pts: number[][], r: Radius, color: string | typeof BONE, opts: SweepOptions = {}) =>
    b.sweep(catmull(pts), r, color, { bone: root, ...opts });
  const horn: SweepOptions = { caps: { start: "flat", end: "point" } };

  // ---- Plinth ----
  const plinth: OutlinePoint[] = [
    [0, 0],
    [0.42, 0],
    [0.42, 0.05],
    [0.36, 0.07],
    [0.36, 0.1],
    [0.28, 0.12],
    [0.28, 0.16],
    [0, 0.16],
  ];
  b.lathe(plinth, { at: [0, 0, 0], segments: 10, color: STONE, bone: root });
  glow(P(new THREE.TorusGeometry(0.32, 0.009, 4, 24), TEAL, [0, 0.113, 0], { rotation: [90, 0, 0] }));
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    glow(P(new THREE.ConeGeometry(0.022, 0.15, 5), TEAL, [0.33 * Math.cos(a), 0.19, 0.33 * Math.sin(a)], { flat: true }), 0.9);
    P(new THREE.BoxGeometry(0.05, 0.02, 0.05), GOLD, [0.395 * Math.cos(a), 0.045, 0.395 * Math.sin(a)], {
      rotation: [0, (-a * 180) / Math.PI, 0],
    });
  }

  // ---- Dragon claws hugging the base of the staff ----
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + (k * Math.PI) / 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    S(
      [
        [0.12 * c, 0.15, 0.12 * s],
        [0.21 * c, 0.3, 0.21 * s],
        [0.15 * c, 0.5, 0.15 * s],
        [0.06 * c, 0.64, 0.06 * s],
      ],
      [0.028, 0],
      BONE,
      horn,
    );
  }

  // ---- Staff: dragon spine ----
  S(
    [
      [0, 0.14, 0],
      [0, 0.8, 0],
      [0, 1.3, 0],
      [0, 1.8, 0],
    ],
    0.024,
    BONE,
  );
  const verts = [0.2, 0.28, 0.36, 0.44, 0.52, 0.6, 0.68, 1.3, 1.37, 1.44, 1.58, 1.65, 1.72];
  for (const y of verts) {
    P(new THREE.CylinderGeometry(0.037, 0.037, 0.04, 8), BONE, [0, y, 0], { flat: true });
    for (const s of [1, -1])
      b.spike([s * 0.03, y, 0], [s, 0.45, 0], 0.055, 0.009, BONE2, { bone: root });
  }

  // Grip wrap
  b.rod([0, 0.76, 0], [0, 1.24, 0], 0.031, LEATHER, { bone: root });
  for (let i = 0; i < 12; i++) P(new THREE.CylinderGeometry(0.035, 0.035, 0.014, 8), i % 3 === 0 ? GOLD : WRAP, [0, 0.79 + i * 0.038, 0], { flat: true });
  for (const y of [0.74, 1.26]) {
    P(new THREE.CylinderGeometry(0.046, 0.046, 0.04, 8), GOLD, [0, y, 0], { flat: true });
    P(new THREE.CylinderGeometry(0.052, 0.04, 0.012, 8), DARK, [0, y + (y < 1 ? -0.026 : 0.026), 0], { flat: true });
  }
  // Ferrule
  P(new THREE.CylinderGeometry(0.04, 0.05, 0.06, 8), GOLD, [0, 0.2, 0], { flat: true });

  // Soul gem in a gold bezel
  P(new THREE.CylinderGeometry(0.055, 0.055, 0.035, 8), GOLD, [0, 1.5, 0], { flat: true });
  glow(P(new THREE.OctahedronGeometry(0.04), TEAL, [0, 1.5, 0.038], { scale: [0.8, 1.5, 0.7] }), 1.4);
  for (const s of [1, -1]) b.spike([s * 0.05, 1.5, 0.02], [s, 0, 0.3], 0.05, 0.012, GOLD, { bone: root });

  // Hanging tassel
  b.rod([0.035, 1.3, 0.01], [0.09, 1.17, 0.03], 0.006, LEATHER, { bone: root });
  P(new THREE.SphereGeometry(0.026, 6, 4), BONE, [0.09, 1.15, 0.03], { flat: true });
  glow(P(new THREE.SphereGeometry(0.008, 4, 3), TEAL, [0.09, 1.15, 0.055]));
  for (let i = 0; i < 5; i++) {
    const dx = (i - 2) * 0.012;
    b.rod([0.09 + dx, 1.13, 0.03], [0.095 + dx * 1.8, 0.98 - (i % 2) * 0.04, 0.03 + (i - 2) * 0.004], [0.007, 0.002], i % 2 ? GOLD : WRAP, {
      bone: root,
    });
  }

  // ---- Gripping claws under the skull ----
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3 + 0.3;
    const c = Math.cos(a);
    const s = Math.sin(a);
    S(
      [
        [0.03 * c, 1.6, 0.03 * s],
        [0.075 * c, 1.65, 0.075 * s],
        [0.09 * c, 1.74, 0.09 * s],
      ],
      [0.017, 0],
      BONE,
      horn,
    );
  }
  P(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 8), GOLD, [0, 1.62, 0], { flat: true });

  // ---- Dragon skull ----
  P(new THREE.SphereGeometry(1, 8, 6), BONE, [0, 1.9, 0.03], { scale: [0.075, 0.065, 0.1], flat: true });
  b.frustumBox([0, 1.9, 0.1], [0, 1.88, 0.27], [0.09, 0.07], [0.055, 0.045], { color: BONE, bone: root });
  b.frustumBox([0, 1.848, 0.1], [0, 1.835, 0.25], [0.07, 0.022], [0.04, 0.018], { color: BONE2, bone: root });
  P(new THREE.BoxGeometry(0.012, 0.01, 0.01), DARK, [0.014, 1.9, 0.272]);
  P(new THREE.BoxGeometry(0.012, 0.01, 0.01), DARK, [-0.014, 1.9, 0.272]);
  for (let i = 0; i < 5; i++)
    for (const s of [1, -1]) {
      b.spike([s * (0.035 - i * 0.002), 1.855, 0.12 + i * 0.03], [0, -1, 0], 0.03, 0.006, TOOTH, { bone: root });
      b.spike([s * (0.03 - i * 0.002), 1.855, 0.12 + i * 0.03], [0, 1, 0], 0.022, 0.005, TOOTH, { bone: root });
    }
  for (const s of [1, -1]) {
    glow(P(new THREE.SphereGeometry(0.017, 6, 4), TEAL, [s * 0.055, 1.92, 0.085]), 1.6);
    P(new THREE.BoxGeometry(0.055, 0.012, 0.035), BONE2, [s * 0.05, 1.947, 0.085], { rotation: [0, 0, -s * 18] });
    S(
      [
        [s * 0.05, 1.95, -0.0],
        [s * 0.12, 2.05, -0.1],
        [s * 0.17, 2.1, -0.22],
        [s * 0.15, 2.06, -0.34],
      ],
      [0.024, 0],
      BONE,
      horn,
    );
    S(
      [
        [s * 0.07, 1.91, -0.02],
        [s * 0.16, 1.93, -0.12],
        [s * 0.21, 1.97, -0.2],
      ],
      [0.015, 0],
      BONE2,
      horn,
    );
  }
  for (let i = 0; i < 3; i++) b.spike([0, 1.955 - i * 0.004, -0.02 - i * 0.04], [0, 1, -0.5], 0.05 - i * 0.01, 0.012, BONE2, { bone: root });

  // ---- Blade: a giant curved dragon rib ----
  const AY = 1.8;
  const bladeOutline: OutlinePoint[] = [
    [-0.22, 0.0],
    [-0.08, 0.14],
    [0.3, 0.28],
    [0.7, 0.28],
    [1.0, 0.15],
    [1.25, -0.2, "sharp"],
    [1.02, -0.02],
    [0.75, 0.09],
    [0.4, 0.08],
    [0.12, -0.04],
    [-0.08, -0.05],
  ];
  b.extrude(bladeOutline, { at: [0, AY, 0], x: [1, 0, 0], thickness: 0.03, bevel: 0.008, color: BLADE, bone: root });

  const ridge = [
    [-0.14, 0.04],
    [0.0, 0.13],
    [0.3, 0.25],
    [0.7, 0.25],
    [0.98, 0.13],
    [1.17, -0.13],
  ].map(([x, y]) => [x, AY + y, 0]);
  S(ridge, [0.024, 0.004], BONE2);
  for (const [x, y] of [
    [0.0, 0.13],
    [0.3, 0.25],
    [0.7, 0.25],
    [0.98, 0.13],
  ])
    b.spike([x, AY + y + 0.005, 0], [-0.3, 1, 0], 0.09, 0.017, BONE, { bone: root });
  // Back spur (counterweight)
  b.spike([-0.2, AY + 0.0, 0], [-1, -0.2, 0], 0.12, 0.022, BONE, { bone: root });

  // Glowing edge
  glow(
    S(
      [
        [1.04, AY - 0.03, 0],
        [0.75, AY + 0.085, 0],
        [0.4, AY + 0.075, 0],
        [0.12, AY - 0.04, 0],
      ],
      0.011,
      TEAL,
    ),
    1.3,
  );
  glow(P(new THREE.OctahedronGeometry(0.03), TEAL, [1.2, AY - 0.17, 0], { scale: [0.6, 1.4, 0.6] }), 1.5);

  // Runes on both faces
  for (const z of [1, -1])
    glow(
      b.part(new THREE.PlaneGeometry(0.6, 0.08), "#ffffff", {
        bone: root,
        at: [0.5, AY + 0.15, z * 0.0165],
        dir: [0, 0, z],
        axis: "z",
        texture: RUNE,
      }),
      1.2,
    );
  // Rivets / bone studs where the rib meets the staff
  for (let i = 0; i < 4; i++)
    P(new THREE.SphereGeometry(0.012, 5, 4), GOLD, [-0.1 + i * 0.06, AY + 0.02 + i * 0.005, 0.02], { flat: true });

  // ---- Souls drifting in the crescent ----
  const souls: Array<[number, number, number, string]> = [
    [0.33, 1.6, 0.04, TEAL],
    [0.63, 1.5, 0.052, VIOLET],
    [0.92, 1.63, 0.036, TEAL],
  ];
  for (const [x, y, r, col] of souls) {
    glow(P(new THREE.IcosahedronGeometry(r, 1), col, [x, y, 0.0], { flat: true }), 1.5);
    glow(
      S(
        [
          [x, y, 0],
          [x + 0.04, y - 0.1, 0],
          [x - 0.02, y - 0.18, 0],
          [x + 0.03, y - 0.26, 0],
        ],
        [r * 0.7, 0],
        col,
        horn,
      ),
      0.9,
    );
    for (const s of [1, -1]) P(new THREE.SphereGeometry(r * 0.2, 4, 3), DARK, [x + s * r * 0.35, y + r * 0.2, 0.9 * r], { flat: true });
  }

  return b.root;
}
