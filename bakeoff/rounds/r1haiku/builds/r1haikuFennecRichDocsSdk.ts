import * as THREE from "three";
import {
  createBuilder,
  catmull,
  countershade,
  gradient,
  limb,
  mottle,
  paint,
  stripes,
} from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

const CREAM = "#f4e2c6";
const GOLD = "#d9a060";
const GOLD_LEG = "#e6c08a";
const PEACH = "#f4c2a6";
const EAR_OUT = "#ecd0ae";
const BLACK = "#231b18";
const EYE = "#140e0c";
const NOSE = "#1e1614";
const TOE = "#e9d2b0";
const LEATHER = "#7a4a2e";
const LEATHER_D = "#4e2e1c";
const BRASS = "#d8b25a";
const SAND = "#e3c08a";
const SAND_D = "#c9a06a";
const WHITE = "#ffffff";

export const meta = {
  name: "fennec fox kit",
  description: "A fennec fox kit on a sand dune at dusk, with huge peach-lined ears, a fluffy tail and a brass bell collar.",
};

export default function build() {
  const b = createBuilder({ name: "fennec-kit" });

  // Skeleton: hips, spine (3 joints), head on the spine's last joint.
  const hips = b.joint("hips", { at: [0, 0.2, -0.12], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.2, -0.12],
      [0, 0.22, 0.02],
      [0, 0.25, 0.14],
      [0, 0.3, 0.22],
    ]),
    { parent: hips, count: 3, role: "spine" },
  );
  const head = b.joint("head", { parent: spine.joints[2], at: [0, 0.34, 0.27], role: "head" });

  // Body: one tube along the spine, cream belly fading to sandy gold back.
  const coat = countershade(GOLD, CREAM, { level: 0.1 });
  b.sweep(spine, (t: number) => 0.058 + 0.016 * Math.sin(Math.PI * t), { color: coat });

  // Head: a slightly flattened, faceted skull with cheek fluff and a thin muzzle.
  b.part(new THREE.SphereGeometry(0.06, 12, 8), coat, {
    bone: head,
    at: [0, 0.345, 0.28],
    scale: [1, 0.9, 1.1],
    flat: true,
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 8, 6), CREAM, {
      bone: head,
      at: [s * 0.035, 0.325, 0.3],
      scale: [0.8, 0.8, 1.1],
    });
  }
  b.sweep(
    catmull([
      [0, 0.325, 0.3],
      [0, 0.322, 0.34],
      [0, 0.33, 0.372],
    ]),
    (t: number) => 0.032 - 0.016 * t,
    { bone: head, color: CREAM },
  );
  b.part(new THREE.SphereGeometry(0.012, 6, 4), NOSE, { bone: head, at: [0, 0.335, 0.375] });

  // Big dark eyes with a small white sparkle each.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.022, 8, 6), EYE, {
      bone: head,
      at: [s * 0.04, 0.36, 0.31],
      scale: [0.9, 1.15, 0.6],
    });
    b.part(new THREE.SphereGeometry(0.0065, 5, 4), WHITE, {
      bone: head,
      at: [s * 0.047, 0.372, 0.33],
    });
  }

  // Enormous satin ears: gold-cream outside, pale peach lining inside.
  const earOutline: OutlinePoint[] = [
    [-0.045, 0, "sharp"],
    [0.045, 0, "sharp"],
    [0.04, 0.08],
    [0.02, 0.14],
    [0, 0.165, "sharp"],
    [-0.02, 0.14],
    [-0.04, 0.08],
  ];
  for (const s of [1, -1]) {
    const X: [number, number, number] = [0.7 * s, 0, -0.7];
    const Y: [number, number, number] = [0, 1, 0];
    const TH = new THREE.Vector3(...X).cross(new THREE.Vector3(...Y)).normalize();
    const earPaint = paint((_p, n) => (n.dot(TH) * s > 0.6 ? EAR_OUT : PEACH));
    b.extrude(earOutline, {
      at: [s * 0.03, 0.385, 0.24],
      x: X,
      y: Y,
      thickness: [0.012, 0.004],
      bevel: 0.003,
      smoothing: 2,
      color: earPaint,
      bone: head,
    });
  }

  // Tail: fluffy, sandy gold fading to a black tip.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.2, -0.12],
      [0, 0.19, -0.26],
      [0, 0.2, -0.37],
      [0, 0.27, -0.43],
    ]),
    { parent: hips, count: 3, role: "tail" },
  );
  b.sweep(tail, (t: number) => 0.04 + 0.028 * Math.sin(Math.PI * t), {
    color: gradient(GOLD, BLACK, tail.at(0.8).at, tail.at(1).at),
  });

  // Legs with oversized paws, sunk slightly into the dune.
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    const fore = limb([s * 0.045, 0.19, 0.12], [s * 0.05, 0.07, 0.13], [0.07, 0.07], [[0, 0, -1]]);
    const foreLeg = b.chain(`foreleg${L}`, fore, {
      parent: hips,
      role: "leg",
      names: [`shoulderF${L}`, `elbowF${L}`, `pawF${L}`],
    });
    b.sweep(foreLeg, (t: number) => 0.03 - 0.01 * t, { color: GOLD_LEG });
    if (foreLeg.tip) {
      b.part(new THREE.SphereGeometry(0.04, 8, 6), CREAM, {
        bone: foreLeg.tip,
        at: [s * 0.05, 0.068, 0.142],
        scale: [1, 0.6, 1.3],
      });
      for (const k of [-1, 0, 1]) {
        b.part(new THREE.SphereGeometry(0.011, 5, 4), TOE, {
          bone: foreLeg.tip,
          at: [s * 0.05 + k * 0.016, 0.05, 0.19],
        });
      }
    }

    const hind = limb([s * 0.05, 0.2, -0.12], [s * 0.06, 0.07, -0.13], [0.09, 0.09], [[0, 0, -1]]);
    const hindLeg = b.chain(`hindleg${L}`, hind, {
      parent: hips,
      role: "leg",
      names: [`hipH${L}`, `kneeH${L}`, `pawH${L}`],
    });
    b.sweep(hindLeg, (t: number) => 0.032 - 0.012 * t, { color: GOLD_LEG });
    if (hindLeg.tip) {
      b.part(new THREE.SphereGeometry(0.04, 8, 6), CREAM, {
        bone: hindLeg.tip,
        at: [s * 0.06, 0.068, -0.117],
        scale: [1, 0.6, 1.3],
      });
      for (const k of [-1, 0, 1]) {
        b.part(new THREE.SphereGeometry(0.011, 5, 4), TOE, {
          bone: hindLeg.tip,
          at: [s * 0.06 + k * 0.016, 0.05, -0.07],
        });
      }
    }
  }

  // Woven leather collar around the neck, with a small brass bell.
  const c: [number, number, number] = [0, 0.28, 0.2];
  const ring: [number, number, number][] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ring.push([c[0] + 0.07 * Math.sin(a), c[1], c[2] + 0.068 * Math.cos(a)]);
  }
  b.sweep(catmull(ring, { closed: true }), 0.014, {
    bone: spine.joints[2],
    color: stripes(LEATHER, LEATHER_D, { size: 0.012, axis: [1, 0, 1] }),
  });
  b.part(new THREE.SphereGeometry(0.018, 10, 8), BRASS, {
    bone: spine.joints[2],
    at: [0, 0.25, 0.28],
    scale: [1, 1.05, 1],
  });

  // The little sand dune: two faceted hemispheres resting on y = 0.
  const dune = mottle(SAND, SAND_D, { size: 0.12 });
  b.part(new THREE.SphereGeometry(0.25, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), dune, {
    bone: hips,
    at: [0, 0, 0.02],
    scale: [1, 0.28, 0.8],
  });
  b.part(new THREE.SphereGeometry(0.13, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), dune, {
    bone: hips,
    at: [0.14, 0, -0.12],
    scale: [1, 0.42, 1],
  });

  return b.root;
}
