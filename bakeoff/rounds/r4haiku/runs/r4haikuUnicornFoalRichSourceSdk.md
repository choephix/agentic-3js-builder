```ts
import * as THREE from "three";
import { catmull, createBuilder, mix, noise, paint, smoothstep, spiral } from "agentic-3js-builder";

export const meta = {
  name: "Unicorn foal",
  description:
    "A newborn unicorn foal on long wobbly legs: a pearly white coat with a lilac shimmer, a short pastel mane and tail, a spiralled gold horn, big dark eyes with long lashes, silver hooves and a daisy chain round its neck.",
};

const PEARL = "#fffdff";
const LILAC = "#dccaf7";
const PINK = "#ffb3d1";
const MINT = "#b5f0d8";
const LAVENDER = "#cbb6f7";
const TUFTS = [PINK, MINT, LAVENDER];
const SILVER = "#cdd3de";
const EYE = "#1f1838";
const LASH = "#2b1f45";
const CHEEK = "#ffb3cf";
const NOSE = "#f9bfd2";
const INNER_EAR = "#ffb0cc";
const DAISY = "#fffdf8";
const DAISY_PINK = "#ffd0e6";
const DAISY_CENTRE = "#ffcf40";
const STEM = "#9fdcb8";

/** Pearly white with a soft lilac shimmer in patches, and a touch of lilac on the underside. */
const coat = paint((p, n) => {
  const shimmer = smoothstep(0.42, 0.8, noise(p, 0.12, 7));
  const underside = smoothstep(0.2, -0.7, n.y);
  return mix(PEARL, LILAC, Math.min(1, 0.55 * shimmer + 0.35 * underside));
});

/** Gold banded round the tube, so the spiral horn reads as twisted. */
const gold = paint((_p, _n, s) => {
  const band = s[0] * 14 + s[1] / 360;
  return band - Math.floor(band) < 0.5 ? "#ffd766" : "#c98d24";
});

/** A ten-petalled daisy outline, `radius` at the petal tips. */
const daisy = (radius: number) =>
  Array.from({ length: 40 }, (_, k) => {
    const a = (k / 40) * Math.PI * 2;
    const r = radius * (0.5 + 0.5 * Math.abs(Math.cos(5 * a)) ** 0.6);
    return [r * Math.cos(a), r * Math.sin(a)] as const;
  });

/** A silver hoof: a short flat-bottomed cup standing on the floor. */
const HOOF = [
  [0, 0],
  [0.026, 0],
  [0.028, 0.012],
  [0.026, 0.03],
  [0, 0.03],
];

export default function unicornFoal() {
  const b = createBuilder({ name: "unicorn-foal", detail: 1, paintSize: 1024 });
  let tuft = 0;
  const nextTuft = () => TUFTS[tuft++ % TUFTS.length];

  // Skeleton: pelvis -> spine -> withers -> neck -> head -> jaw. Legs hang off the spine, the tail off the rump.
  const pelvis = b.joint("pelvis", { at: [0, 0.66, -0.2], dir: [0, 0, 1] });

  // Body: a loft along a spine chain, so the barrel bends with the spine joints.
  const torso = [
    { at: [0, 0.645, -0.34], w: 0.2, h: 0.22 },
    { at: [0, 0.66, -0.16], w: 0.27, h: 0.27 },
    { at: [0, 0.66, 0.02], w: 0.28, h: 0.28 },
    { at: [0, 0.65, 0.2], w: 0.26, h: 0.27 },
    { at: [0, 0.68, 0.3], w: 0.18, h: 0.22 },
  ];
  const spine = b.chain("spine", catmull(torso.map((s) => s.at)), {
    parent: pelvis,
    count: 3,
    names: ["spine1", "spine2", "spine3", "withers"],
    role: "spine",
  });
  b.loft(torso, { color: coat, bone: spine, sides: 10, name: "torso" });

  // Neck: a tube bending at its two joints, ending at the head joint.
  const neck = b.chain("neck", catmull([[0, 0.68, 0.3], [0, 0.8, 0.37], [0, 0.9, 0.42]]), {
    parent: "withers",
    names: ["neck1", "neck2"],
    role: "neck",
  });
  b.sweep(neck, [0.075, 0.056], { color: coat, sides: 10, name: "neck" });
  const head = b.joint("head", { parent: "neck2", at: [0, 0.9, 0.42], dir: [0, 0.45, 0.9], role: "head" });

  // Head: a rounded skull narrowing to a soft muzzle.
  const skull = b.loft(
    [
      { at: [0, 0.91, 0.43], w: 0.15, h: 0.15 },
      { at: [0, 0.935, 0.52], w: 0.15, h: 0.16 },
      { at: [0, 0.915, 0.61], w: 0.11, h: 0.11 },
      { at: [0, 0.9, 0.68], w: 0.085, h: 0.09 },
    ],
    { color: coat, bone: head, sides: 12, name: "head" },
  );

  // Lower jaw on its own joint, opened a little at rest.
  const jaw = b.joint("jaw", { parent: "head", at: [0, 0.86, 0.5], dir: [0, 0, 1], up: [0, 1, 0], role: "jaw" });
  b.loft(
    [
      { at: [0, 0.855, 0.5], w: 0.09, h: 0.06 },
      { at: [0, 0.848, 0.6], w: 0.075, h: 0.05 },
      { at: [0, 0.84, 0.67], w: 0.05, h: 0.04 },
    ],
    { color: coat, bone: jaw, sides: 10, name: "jaw" },
  );
  b.pose(jaw, { axis: [1, 0, 0], deg: 7 });

  // Spiralled gold horn rising from the forehead.
  b.sweep(
    spiral([0, 1, 0.5], [0.016, 1, 0.5], [0, 1, 0], { turns: 2.5, r1: 0.005, pitch: 0.06 }),
    (t) => 0.012 - 0.008 * t,
    { color: gold, bone: head, sides: 8, caps: { start: "round", end: "point" }, name: "horn" },
  );

  // Ears: a white triangle with a pink inner, set on the back of the skull.
  for (const side of [1, -1]) {
    b.slab(
      [
        [side * 0.03, 0.98, 0.42],
        [side * 0.06, 0.98, 0.46],
        [side * 0.06, 1.075, 0.41],
      ],
      { color: coat, thickness: 0.012, bone: head, name: "ear" },
    );
    b.slab(
      [
        [side * 0.034, 0.985, 0.425],
        [side * 0.056, 0.985, 0.452],
        [side * 0.057, 1.05, 0.416],
      ],
      { color: INNER_EAR, thickness: 0.016, bone: head, name: "earInner" },
    );
  }

  // Short forelock falling over the forehead.
  for (const x of [-0.014, 0, 0.014]) {
    b.capsule([x, 0.99, 0.55], [x * 1.3, 0.975, 0.645], [0.018, 0.007], {
      color: nextTuft(),
      bone: head,
      name: "forelock",
    });
  }

  // Big dark eyes seated on the skull, with a white shine and long lashes; rosy cheeks.
  const face = b.surface(skull);
  for (const side of [1, -1]) {
    const eye = b.stick(
      new THREE.SphereGeometry(0.032, b.segments(12), b.segments(8)),
      EYE,
      face.nearest([side * 0.12, 0.945, 0.5]),
      { embed: 0.4, name: "eye" },
    );
    const shine = b
      .surface(eye)
      .nearest(eye.local(side > 0 ? { left: 0.03, up: 0.016, forward: 0.014 } : { right: 0.03, up: 0.016, forward: 0.014 }));
    b.stick(new THREE.SphereGeometry(0.009, 6, 4), "#ffffff", shine, { embed: 0.3, name: "eyeShine" });
    for (const f of [-0.014, -0.005, 0.005, 0.014]) {
      b.spike(eye.local({ up: 0.03, forward: f }), [side * (0.42 + 2 * f), 1, 0.1], 0.05, 0.0025, {
        color: LASH,
        bone: head,
        name: "lash",
      });
    }
    b.stick(new THREE.SphereGeometry(0.022, 8, 6), CHEEK, face.nearest([side * 0.12, 0.9, 0.57]), {
      embed: 0.6,
      name: "cheek",
    });
  }

  // Soft pink muzzle.
  b.stick(new THREE.SphereGeometry(0.03, 10, 7), NOSE, face.nearest([0, 0.9, 0.86]), {
    embed: 0.5,
    name: "muzzle",
  });

  // Legs: wobbly four-joint chains, each with a silver hoof on its tip joint.
  const leg = (side: "L" | "R", kind: "F" | "H", pts: number[][], parent: string, radius: number[]) => {
    const mirror = (p: number[]) => (side === "L" ? p : [-p[0], p[1], p[2]]);
    const parts = kind === "F" ? ["shoulder", "knee", "fetlock", "hoof"] : ["hip", "knee", "hock", "hoof"];
    const names = parts.map((j) => `${j}${kind}${side}`);
    const chain = b.chain(kind === "F" ? `foreleg${side}` : `hindleg${side}`, pts.map(mirror), {
      parent,
      names,
      role: "leg",
    });
    b.sweep(chain, radius, { color: coat, sides: 8, name: `leg${kind}${side}` });
    const foot = mirror(pts[pts.length - 1]);
    b.lathe(HOOF, {
      color: SILVER,
      at: [foot[0], 0, foot[2]],
      bone: names[names.length - 1],
      segments: 8,
      name: "hoof",
    });
  };
  for (const side of ["L", "R"] as const) {
    leg(
      side,
      "F",
      [
        [0.085, 0.6, 0.2],
        [0.09, 0.36, 0.22],
        [0.1, 0.13, 0.25],
        [0.11, 0.03, 0.26],
      ],
      "spine3",
      [0.056, 0.04, 0.026, 0.024],
    );
    leg(
      side,
      "H",
      [
        [0.1, 0.6, -0.22],
        [0.1, 0.4, -0.2],
        [0.105, 0.2, -0.3],
        [0.115, 0.03, -0.24],
      ],
      "spine2",
      [0.058, 0.042, 0.03, 0.024],
    );
  }

  // Tail: a thin coat tube with pastel tufts round it.
  const tail = b.chain("tail", catmull([[0, 0.66, -0.36], [0, 0.7, -0.44], [0, 0.64, -0.5], [0, 0.5, -0.52]]), {
    parent: "spine1",
    names: ["tail1", "tail2", "tail3", "tailTip"],
    role: "tail",
  });
  b.sweep(tail, [0.03, 0.01], { color: coat, sides: 8, name: "tail" });
  b.along(tail, 8, (at) => {
    for (let j = 0; j < 3; j++) {
      const angle = (j / 3) * Math.PI * 2 + at.t * 9;
      const out = at.normal.multiplyScalar(Math.cos(angle)).addScaledVector(at.binormal, Math.sin(angle));
      const base = at.at.addScaledVector(out, 0.012);
      const tip = base.clone().addScaledVector(at.tangent, 0.05).addScaledVector(out, 0.03);
      b.capsule(base, tip, [0.024, 0.008], { color: nextTuft(), bone: tail.jointAt(at.t), name: "tuftTail" });
    }
  });

  // Mane: short pastel tufts along the crest of the neck, combed back toward the withers.
  b.along(neck, 8, (at) => {
    for (const side of [1, -1]) {
      const base = at.local({ up: 0.05, left: side * 0.012 });
      const tip = base.clone().addScaledVector(at.tangent, -0.06).add(new THREE.Vector3(side * 0.012, 0.03, 0));
      b.capsule(base, tip, [0.022, 0.008], { color: nextTuft(), bone: neck.jointAt(at.t), name: "mane" });
    }
  });

  // Daisy chain: a green stem looped round the neck, with a daisy strung every tenth of its length.
  const garland = catmull([
    [0.09, 0.82, 0.36],
    [0.075, 0.72, 0.44],
    [0, 0.62, 0.5],
    [-0.075, 0.72, 0.44],
    [-0.09, 0.82, 0.36],
  ]);
  b.sweep(garland, 0.0035, { color: STEM, bone: "neck1", sides: 6, name: "daisyStem" });
  const outline = daisy(0.022);
  for (let i = 0; i < 10; i++) {
    const t = 0.05 + i * 0.1;
    const p = garland.at(t);
    // The flower faces outward from the neck; its x runs along the stem.
    const n = new THREE.Vector3(p.x, 0, p.z - 0.37).normalize();
    const tangent = garland.tangentAt(t);
    const x = tangent.clone().addScaledVector(n, -tangent.dot(n)).normalize();
    const y = new THREE.Vector3().crossVectors(n, x);
    b.extrude(outline, {
      color: i % 3 === 2 ? DAISY_PINK : DAISY,
      at: p,
      x: x.toArray(),
      y: y.toArray(),
      thickness: 0.006,
      bone: "neck1",
      name: "daisy",
    });
    b.part(new THREE.SphereGeometry(0.008, 8, 6), DAISY_CENTRE, {
      at: p.clone().addScaledVector(n, 0.005),
      bone: "neck1",
      name: "daisyCentre",
    });
  }

  return b.root;
}
```