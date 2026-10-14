```ts
import * as THREE from "three";
import { catmull, countershade, createBuilder, mottle, paint, stripes } from "agentic-3js-builder";

export const meta = {
  name: "Fennec fox kit",
  description:
    "A fennec fox kit standing alert on a sand dune at dusk: huge peach-lined ears, a cream-to-gold coat, a black-tipped plume of tail and a woven collar with a brass bell.",
};

const CREAM = "#f4e3c7";
const PEACH = "#f2bf9a";
const EAR_OUTER = "#ead4b0";
const DARK = "#1d1816";
const BRASS = "#c9a23e";

// Ear plate in its own plane: x = across the ear, y = up the ear. Sharp tip, smoothed sides.
const EAR = [
  [-0.045, -0.03],
  [-0.052, 0.04],
  [-0.042, 0.13],
  [-0.012, 0.19],
  [0, 0.205, "sharp"],
  [0.014, 0.19],
  [0.042, 0.13],
  [0.052, 0.04],
  [0.045, -0.03],
];

export default function fennecKit() {
  const b = createBuilder({ name: "fennec-kit", paintSize: 1024 });
  const sphere = (r: number, w = 12, h = 8) => new THREE.SphereGeometry(r, b.segments(w), b.segments(h));

  // Paints: a mottled sandy-gold back fading to cream belly, a black-tipped tail, peach-lined ears.
  const coat = countershade(mottle("#d89d58", "#c68548", { size: 0.05, seed: 3 }), CREAM, {
    level: 0.05,
    soft: 0.4,
  });
  const tail = paint((p) => (p.z < -0.31 ? DARK : coat));
  const ear = paint((_p, n) => (n.z > 0.1 ? PEACH : EAR_OUTER));
  const sand = mottle("#e8c891", "#d2a666", { size: 0.1, seed: 9 });
  const leather = stripes("#6e4125", "#9b5f35", { size: 0.012, axis: [0, 1, 0], width: 0.45, wobble: 0.3 });
  const paw = "#f0dcbc";

  // Root: hips. Everything hangs from it.
  b.joint("hips", { at: [0, 0.27, -0.1], dir: [0, 0, 1] });

  // The dune: a low sand mound on the floor, plus two ripples out beyond it.
  b.lathe(
    [
      [0, 0],
      [0.3, 0],
      [0.4, 0.02],
      [0.36, 0.06],
      [0.26, 0.1],
      [0.14, 0.122],
      [0.06, 0.13],
      [0, 0.132],
    ],
    { name: "dune", color: sand, at: [0, 0, 0], axis: [0, 1, 0], segments: 20, bone: "hips" },
  );
  b.lathe(
    [
      [0, 0],
      [0.12, 0],
      [0.09, 0.02],
      [0, 0.03],
    ],
    { name: "ripple", color: sand, at: [0.52, 0, 0.18], segments: 12, bone: "hips" },
  );
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.07, 0.016],
      [0, 0.024],
    ],
    { name: "ripple", color: sand, at: [-0.5, 0, -0.3], segments: 12, bone: "hips" },
  );

  // Spine, neck (ending in the head joint) and the four legs.
  b.chain("spine", catmull([[0, 0.27, -0.08], [0, 0.3, 0.02], [0, 0.335, 0.12]]), {
    parent: "hips",
    names: ["spine1", "chest"],
    role: "spine",
  });
  const neck = b.chain("neck", catmull([[0, 0.335, 0.12], [0, 0.375, 0.19], [0, 0.405, 0.25]]), {
    parent: "chest",
    names: ["neck1", "neck2", "head"],
    role: "neck",
  });
  const frontL = b.chain("armL", catmull([[0.045, 0.3, 0.06], [0.045, 0.2, 0.075], [0.045, 0.13, 0.07]]), {
    parent: "chest",
    names: ["shoulderL", "elbowL", "wristL"],
    role: "arm",
  });
  const frontR = b.chain("armR", catmull([[-0.045, 0.3, 0.06], [-0.045, 0.2, 0.075], [-0.045, 0.13, 0.07]]), {
    parent: "chest",
    names: ["shoulderR", "elbowR", "wristR"],
    role: "arm",
  });
  const hindL = b.chain("legL", catmull([[0.05, 0.28, -0.1], [0.05, 0.19, -0.12], [0.05, 0.13, -0.09]]), {
    parent: "hips",
    names: ["hipL", "kneeL", "ankleL"],
    role: "leg",
  });
  const hindR = b.chain("legR", catmull([[-0.05, 0.28, -0.1], [-0.05, 0.19, -0.12], [-0.05, 0.13, -0.09]]), {
    parent: "hips",
    names: ["hipR", "kneeR", "ankleR"],
    role: "leg",
  });
  const tailChain = b.chain("tail", catmull([[0, 0.28, -0.11], [0, 0.3, -0.22], [0, 0.32, -0.32], [0, 0.36, -0.38]]), {
    parent: "hips",
    names: ["tail1", "tail2", "tail3", "tail4"],
    role: "tail",
  });

  // Body: a tapered torso along the spine, a haunch and a shoulder mass.
  b.sweep(b.chain("spineBody", catmull([[0, 0.27, -0.08], [0, 0.3, 0.02], [0, 0.335, 0.12]]), {
    parent: "hips",
    names: ["spineB1", "chestB"],
  }), (t) => [0.058 + 0.008 * t, 0.05 + 0.006 * t], { color: coat, name: "torso" });
  b.part(sphere(0.052, 12, 8), coat, { at: [0, 0.265, -0.1], bone: "hips", scale: [0.95, 1, 1.1], name: "haunch" });
  b.part(sphere(0.05, 12, 8), coat, { at: [0, 0.31, 0.06], bone: "chest", scale: [1.05, 0.9, 1.15], name: "shoulders" });

  // Legs, tapering, with oversized paws that have not grown into yet.
  b.sweep(frontL, (t) => 0.024 - 0.006 * t, { color: coat, name: "armL" });
  b.sweep(frontR, (t) => 0.024 - 0.006 * t, { color: coat, name: "armR" });
  b.sweep(hindL, (t) => 0.026 - 0.007 * t, { color: coat, name: "legL" });
  b.sweep(hindR, (t) => 0.026 - 0.007 * t, { color: coat, name: "legR" });
  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    b.part(sphere(0.036, 10, 7), paw, {
      at: [s * 0.045, 0.125, 0.09],
      bone: `wrist${side}`,
      scale: [1, 0.55, 1.5],
      name: `pawFront${side}`,
    });
    b.part(sphere(0.038, 10, 7), paw, {
      at: [s * 0.05, 0.125, -0.07],
      bone: `ankle${side}`,
      scale: [1, 0.55, 1.5],
      name: `pawHind${side}`,
    });
  }

  // Tail: fluffy, widest near the middle, black at the tip.
  b.sweep(tailChain, (t) => 0.022 + 0.026 * Math.sin(Math.PI * (0.1 + 0.85 * t)), {
    color: tail,
    name: "tail",
  });

  // Head: a wedge from skull to nose, with a separate lower jaw hinged at the back.
  const head = b.loft(
    [
      { at: [0, 0.41, 0.17], w: 0.1, h: 0.1 },
      { at: [0, 0.418, 0.25], w: 0.12, h: 0.11 },
      { at: [0, 0.4, 0.31], w: 0.07, h: 0.065 },
      { at: [0, 0.405, 0.355], w: 0.03, h: 0.03 },
    ],
    { color: coat, bone: "head", name: "head" },
  );
  b.joint("jaw", { parent: "head", at: [0, 0.388, 0.27], dir: [0, 0, 1], role: "jaw" });
  b.loft(
    [
      { at: [0, 0.388, 0.27], w: 0.07, h: 0.05 },
      { at: [0, 0.38, 0.33], w: 0.035, h: 0.03 },
    ],
    { color: CREAM, bone: "jaw", name: "jaw" },
  );

  // Ears: big satin cut-outs on their own joints, peach on the front, cream behind.
  for (const side of ["L", "R"] as const) {
    const s = side === "L" ? 1 : -1;
    const base = b.joint(`ear${side}`, { parent: "head", at: [s * 0.045, 0.47, 0.2], dir: [0, 1, -0.35] });
    b.extrude(EAR, {
      name: `ear${side}`,
      color: ear,
      at: base,
      x: [1, 0, 0],
      y: [0, 1, -0.35],
      thickness: 0.012,
      smoothing: 1,
      bone: `ear${side}`,
    });
  }

  // Eyes and nose seated on the real head surface, with a white sparkle on each eye.
  const face = b.surface(head);
  for (const s of [1, -1]) {
    const side = s === 1 ? "L" : "R";
    const hit = face.nearest([s * 0.05, 0.43, 0.27]);
    b.stick(sphere(0.02, 12, 8), "#140d0a", hit, { embed: 0.35, name: `eye${side}` });
    const centre = hit.at.addScaledVector(hit.n, 0.006);
    const dir = hit.n
      .clone()
      .multiplyScalar(0.8)
      .add(new THREE.Vector3(0, 0.4, 0.4))
      .normalize();
    b.part(sphere(0.0045, 8, 6), "#ffffff", {
      at: centre.addScaledVector(dir, 0.016),
      bone: "head",
      name: `sparkle${side}`,
    });
  }
  const nose = face.nearest([0, 0.405, 0.36]);
  b.stick(sphere(0.017, 10, 7), "#231815", nose, { embed: 0.3, name: "nose" });

  // Woven leather collar around the neck, with a brass bell at the front.
  const centre = new THREE.Vector3(0, 0.355, 0.16);
  const d = new THREE.Vector3(0, 0.5, 0.87).normalize();
  const e1 = new THREE.Vector3(1, 0, 0);
  const e2 = new THREE.Vector3().crossVectors(d, e1).normalize();
  const ring = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return centre
      .clone()
      .addScaledVector(e1, 0.05 * Math.cos(a))
      .addScaledVector(e2, 0.05 * Math.sin(a))
      .toArray();
  });
  b.sweep(catmull(ring, { closed: true }), 0.011, { color: leather, bone: "neck1", name: "collar" });
  let front = 0;
  ring.forEach((p, i) => {
    if (p[2] > ring[front][2]) front = i;
  });
  const bell = ring[front];
  b.part(sphere(0.011, 10, 8), BRASS, {
    at: [bell[0], bell[1] - 0.014, bell[2] + 0.004],
    bone: "neck1",
    name: "bell",
  });

  // Keep the neck tube in its own material (visible above the collar).
  b.sweep(neck, 0.034, { color: coat, name: "neck" });

  return b.root;
}
```