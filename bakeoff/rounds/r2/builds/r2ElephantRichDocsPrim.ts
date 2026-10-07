import * as THREE from "three";
import { createBuilder, rng, catmull, paint, mottle, stripes, gradient } from "../../../../src/index";

export const meta = {
  name: "Elephant Calf",
  description: "A gentle African elephant calf with dusty wrinkled skin, big pink-flushed ears, a curious trunk, baby tusks and a tufted tail.",
};

const SLATE = "#7d8289";
const SLATE_B = "#8b8586";
const WRINK = "#5f646c";
const DUST = "#a67a68";
const PINK = "#e8a3a0";
const PINK_B = "#d48a8e";
const IVORY = "#f0e6cf";
const NAIL = "#e9ddc8";
const HAIR = "#3b2a24";
const EYE = "#4a2a18";
const DARK = "#241a18";
const WHITE = "#ffffff";

export default function build() {
  const b = createBuilder({ name: "elephantCalf" });

  const skin = stripes(mottle(SLATE, SLATE_B, { size: 0.14, seed: 2 }), WRINK, {
    size: 0.05,
    axis: "y",
    width: 0.12,
    seed: 5,
  });
  const coat = gradient(skin, DUST, [0, 0.5, 0], [0, 0, 0]);

  // ---- skeleton ----
  const hips = b.joint("hips", { at: [0, 0.72, -0.22], role: "spine" });
  const spine = b.chain(
    "spine",
    [
      [0, 0.72, -0.22],
      [0, 0.74, 0],
      [0, 0.76, 0.2],
    ],
    { parent: hips, names: ["spine1", "spine2"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 0.78, 0.2],
      [0, 0.82, 0.42],
    ],
    { parent: spine.joints[1], names: ["neck"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[0], at: [0, 0.82, 0.42], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.66, 0.7], aim: [0, 0.62, 0.85], role: "jaw" });

  // ---- body ----
  b.sweep(spine, () => [0.27, 0.29], { color: coat });
  b.sweep(neck, 0.25, { color: coat });

  // ---- head ----
  b.part(new THREE.SphereGeometry(0.25, 14, 10), coat, {
    bone: head,
    at: [0, 0.84, 0.6],
    scale: [0.95, 1.05, 0.95],
  });
  const crown = b.part(new THREE.SphereGeometry(0.16, 12, 8), coat, {
    bone: head,
    at: [0, 0.98, 0.58],
    scale: [1.1, 0.9, 1],
  });
  // lower jaw
  b.part(new THREE.BoxGeometry(0.17, 0.07, 0.14), coat, { bone: jaw, at: [0, 0.61, 0.74] });
  // fuzzy head hair
  for (const hit of b.surface(crown).scatter(18, { rng: rng(3), minDist: 0.04, filter: (h) => h.n.y > 0.4 })) {
    b.stick(new THREE.ConeGeometry(0.01, 0.05, 4), HAIR, hit, { embed: 0.2, bone: head });
  }

  // ---- trunk ----
  const trunkPath = catmull([
    [0, 0.7, 0.8],
    [0, 0.52, 0.93],
    [0, 0.34, 1.0],
    [0, 0.22, 1.07],
    [0, 0.2, 1.2],
    [0, 0.27, 1.3],
  ]);
  const trunk = b.chain("trunk", trunkPath, { parent: head, count: 5, role: "tentacle" });
  b.sweep(trunk, (t) => 0.1 * (1 - t) + 0.03, { color: coat });
  const trunkEnd = trunk.joints[trunk.joints.length - 1];
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.011, 5, 4), DARK, { bone: trunkEnd, at: [s * 0.013, 0.295, 1.325] });
  }

  // ---- tusks ----
  for (const s of [1, -1]) {
    b.spike([s * 0.11, 0.64, 0.74], [s * 0.15, -0.5, 0.8], 0.14, 0.034, { color: IVORY, bone: head, sides: 6 });
  }

  // ---- eyes ----
  for (const s of [1, -1]) {
    const eye = b.part(new THREE.SphereGeometry(0.032, 8, 6), EYE, {
      bone: head,
      at: [s * 0.2, 0.86, 0.72],
      dir: [s * 0.75, 0.1, 0.65],
    });
    b.part(new THREE.SphereGeometry(0.009, 5, 4), WHITE, {
      bone: head,
      at: [s * 0.215, 0.872, 0.745],
    });
    b.ring(eye, { count: 5, radius: 0.03, fromDeg: -75, toDeg: 75, tilt: 40 }, (l) =>
      b.spike(l, l, 0.045, 0.004, { color: DARK, sides: 4 }),
    );
  }

  // ---- ears ----
  const earOutline: [number, number][] = [
    [0, 0.12],
    [0.1, 0.22],
    [0.25, 0.24],
    [0.36, 0.14],
    [0.41, -0.05],
    [0.35, -0.22],
    [0.22, -0.32],
    [0.1, -0.3],
    [0.02, -0.2],
    [0, -0.05],
  ];
  const earPaint = paint((_p, n, _s) => (n.z > 0.35 ? mottle(PINK, PINK_B, { size: 0.1, seed: 4 }) : coat));
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ear = b.joint(`ear${side}`, {
      parent: head,
      at: [s * 0.2, 0.92, 0.52],
      dir: [s, 0.2, -0.2],
      role: "hinge",
    });
    b.extrude(earOutline, {
      at: [s * 0.2, 0.92, 0.52],
      x: [s * 0.9, 0.15, -0.35],
      y: [0, 1, 0],
      thickness: 0.02,
      bevel: 0.006,
      smoothing: 2,
      color: earPaint,
      bone: ear,
    });
  }

  // ---- legs ----
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const x = s * 0.2;
    const defs = [
      { tag: "F", parent: spine.joints[1], pts: [[x, 0.62, 0.18], [x, 0.36, 0.2], [x, 0.1, 0.18]], nails: 4, z: 0.18 },
      { tag: "H", parent: hips, pts: [[x, 0.64, -0.22], [x, 0.38, -0.25], [x, 0.1, -0.22]], nails: 4, z: -0.22 },
    ];
    for (const d of defs) {
      const leg = b.chain(`leg${d.tag}${side}`, d.pts, {
        parent: d.parent,
        names: [`hip${d.tag}${side}`, `knee${d.tag}${side}`, `ankle${d.tag}${side}`],
        role: "leg",
        contact: [x, 0, d.z],
      });
      b.sweep(leg, (t) => 0.135 - 0.03 * t, { color: coat, caps: { start: "round", end: "flat" } });
      const tip = leg.tip!;
      b.part(new THREE.CylinderGeometry(0.115, 0.125, 0.1, 10), coat, {
        bone: tip,
        at: [x, 0.05, d.z],
        flat: true,
      });
      for (let i = 0; i < d.nails; i++) {
        const deg = -36 + (72 / (d.nails - 1)) * i;
        const r = THREE.MathUtils.degToRad(deg);
        b.part(new THREE.BoxGeometry(0.045, 0.04, 0.03), NAIL, {
          bone: tip,
          at: [x + Math.sin(r) * 0.12, 0.05, d.z + Math.cos(r) * 0.12],
          rotation: [0, deg, 0],
        });
      }
    }
  }

  // ---- tail ----
  const tail = b.chain(
    "tail",
    [
      [0, 0.8, -0.47],
      [0, 0.62, -0.55],
      [0, 0.42, -0.56],
    ],
    { parent: hips, names: ["tail1", "tail2"], role: "tail" },
  );
  b.sweep(tail, (t) => 0.03 - 0.016 * t, { color: coat });
  b.ring(tail.at(1), { count: 7, radius: 0.012, tilt: 30 }, (l) =>
    b.spike(l, l, 0.1, 0.012, { color: HAIR, sides: 4 }),
  );

  return b.root;
}
