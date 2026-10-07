import * as THREE from "three";
import { bezier, catmull, countershade, createBuilder, paint, rng } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

const CHESTNUT = "#7a4522";
const CHESTNUT_DARK = "#4a2814";
const CREAM = "#f3e4c8";
const FAWN = "#d8b07a";
const EAR = "#c9946a";
const INNER_EAR = "#e9a9a2";
const BLACK = "#16110e";
const WHITE = "#ffffff";
const PINK = "#eba3ad";
const LEAF = "#c3262e";
const VEIN = "#6e0f16";

export const meta = {
  name: "hedgehog",
  description: "A plump autumn hedgehog with a chestnut spine dome, cream tips and a red maple leaf on its back.",
};

export default function build() {
  const b = createBuilder({ name: "hedgehog" });
  const rnd = rng(11);

  // Skeleton: root on the floor, a three-joint spine running rump to neck.
  const root = b.joint("root", { at: [0, 0, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.085, -0.11],
      [0, 0.086, -0.03],
      [0, 0.09, 0],
      [0, 0.095, 0.03],
    ]),
    { parent: root, role: "spine", names: ["hips", "chest", "neck"] },
  );
  const chest = spine.joints[1];
  const neck = spine.joints[2];

  // Round body: a plump ball that tapers toward the rump and the face.
  const body = b.sweep(spine, (t: number) => 0.088 - 0.034 * Math.abs(t - 0.45) * 1.8, {
    color: countershade(CHESTNUT_DARK, FAWN, { level: 0 }),
    sides: 12,
  });

  // Fawn head with a pointed, twitchy snout.
  b.sweep(
    bezier(
      [0, 0.09, 0],
      [0, 0.13, 0.08],
      [0, 0.095, 0.15],
    ),
    [0.05, 0.015],
    { bone: neck, color: FAWN, sides: 10, caps: { end: "point" } },
  );

  // Shiny black button nose.
  b.part(new THREE.SphereGeometry(0.014, 8, 6).scale(1.2, 0.85, 1), BLACK, {
    bone: neck,
    at: [0, 0.097, 0.158],
  });

  for (const s of [1, -1]) {
    // Tiny round ears, flat discs facing out to the side.
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.005, 10), EAR, {
      bone: neck,
      at: [s * 0.03, 0.128, 0.06],
      dir: [s, 0, 0],
    });
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.006, 10), INNER_EAR, {
      bone: neck,
      at: [s * 0.033, 0.128, 0.06],
      dir: [s, 0, 0],
    });

    // Bright beady eyes with a small glint.
    b.part(new THREE.SphereGeometry(0.008, 8, 6), BLACK, {
      bone: neck,
      at: [s * 0.024, 0.116, 0.105],
    });
    b.part(new THREE.SphereGeometry(0.0028, 6, 4), WHITE, {
      bone: neck,
      at: [s * 0.029, 0.121, 0.11],
    });

    // Little pink paws peeking from under the belly.
    for (const z of [0.01, -0.09]) {
      b.part(new THREE.SphereGeometry(0.024, 8, 6).scale(1, 0.6, 1.25), PINK, {
        bone: z > 0 ? chest : spine.joints[0],
        at: [s * 0.035, 0.014, z],
      });
    }
  }

  // The dome of spines: chestnut shafts with cream tips, leaning back.
  const spineHits = b
    .surface(body)
    .scatter(240, {
      rng: rnd,
      minDist: 0.021,
      filter: (h) => h.n.y > -0.2 && h.at.z < 0.035,
    });
  for (const h of spineHits) {
    const len = 0.04 + 0.014 * rnd();
    b.spike(h, [h.n.x, h.n.y, h.n.z - 0.5], len, 0.0065, {
      sides: 5,
      color: CHESTNUT,
      bands: [
        [0.6, CHESTNUT],
        [1, CREAM],
      ],
    });
  }

  // A red maple leaf, five sharp lobes, resting on the spine tips.
  const outline: OutlinePoint[] = [];
  for (let i = 0; i < 5; i++) {
    const a = Math.PI / 2 + (i * 2 * Math.PI) / 5;
    outline.push([0.052 * Math.cos(a), 0.052 * Math.sin(a), "sharp"]);
    const v = a + Math.PI / 5;
    outline.push([0.028 * Math.cos(v), 0.028 * Math.sin(v)]);
  }
  b.extrude(outline, {
    at: [0, 0.222, -0.035],
    x: [1, 0, 0],
    y: [0, 0.3, 0.95],
    thickness: 0.004,
    bevel: 0.0015,
    smoothing: 1,
    bone: chest,
    name: "leaf",
    color: paint((_p, _n, s) => (Math.abs(s[0]) < 0.003 ? VEIN : LEAF)),
  });

  return b.root;
}
