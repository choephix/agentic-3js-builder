```ts
import * as THREE from "three";
import {
  catmull,
  countershade,
  createBuilder,
  interpolate,
  mottle,
  polyline,
  spiral,
  stripes,
} from "agentic-3js-builder";

type P = [number, number, number];

/** `p` moved `s` metres along `d`. */
const step = (p: P, d: P, s: number): P => [p[0] + d[0] * s, p[1] + d[1] * s, p[2] + d[2] * s];

/** `d` as a unit vector. */
const unit = (d: P): P => {
  const n = Math.hypot(d[0], d[1], d[2]);
  return [d[0] / n, d[1] / n, d[2] / n];
};

const GREEN = "#2a9a3e";
const LIME = "#7ccc3c";
const BELLY = "#d7e35c";
const TEAL = "#17aea4";
const GOLD = "#ffd23f";
const CREST = "#f29a2e";
const BARK = "#7a5230";
const LEAF = "#2e7d3b";
const TOE = "#23703a";
const TONGUE = "#ff7a96";
const PUPIL = "#1b1410";

export const meta = {
  name: "Chameleon",
  description:
    "A chameleon gripping a branch: a laterally flattened body in banded green, a casque, turret eyes, a curled prehensile tail and zygodactyl feet.",
};

export default function chameleon(): THREE.Object3D {
  const b = createBuilder({ name: "chameleon", detail: 1 });

  // One paint for the animal: green mottle, lime belly, teal bars ringing the body along z.
  const skin = stripes(
    countershade(mottle(GREEN, LIME, { size: 0.03, seed: 4 }), BELLY, { level: -0.15, soft: 0.45 }),
    TEAL,
    { size: 0.045, axis: "z", width: 0.3, wobble: 0.4, seed: 7 },
  );

  // Branch on the floor, with two leaves.
  const root = b.joint("root", { at: [0, 0, 0] });
  b.rod([0, 0.024, -0.36], [0, 0.024, 0.36], [0.026, 0.02], {
    color: BARK,
    bone: root,
    caps: "round",
    name: "branch",
  });
  const leaf: number[][] = [
    [0, 0],
    [0.02, 0.018],
    [0.06, 0.026],
    [0.1, 0.016],
    [0.13, 0],
    [0.1, -0.014],
    [0.06, -0.022],
    [0.02, -0.016],
  ];
  b.extrude(leaf, {
    color: LEAF,
    at: [0, 0.05, -0.26],
    x: [1, 0.4, 0],
    thickness: 0.004,
    bevel: 0.0015,
    smoothing: 1,
    bone: root,
    group: "leaf",
  });
  b.extrude(leaf, {
    color: LEAF,
    at: [0, 0.05, 0.3],
    x: [-1, 0.35, 0],
    thickness: 0.004,
    bevel: 0.0015,
    smoothing: 1,
    bone: root,
    group: "leaf",
  });

  // Spine: hips to neck, one joint per quarter of its arc.
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.15, -0.075],
      [0, 0.162, 0],
      [0, 0.158, 0.055],
      [0, 0.15, 0.1],
    ]),
    {
      parent: root,
      count: 4,
      up: [0, 1, 0],
      role: "spine",
      names: ["hips", "back", "midback", "chest", "neck"],
    },
  );

  // Body: deeper than it is wide (laterally compressed), tapering at the hips and the neck.
  const K = [0, 0.3, 0.7, 1];
  const body = b.sweep(spine, {
    radius: (t): [number, number] => [
      interpolate(K, [0.022, 0.03, 0.027, 0.02], t),
      interpolate(K, [0.034, 0.047, 0.043, 0.032], t),
    ],
    color: skin,
    sides: 10,
    name: "body",
  });

  // Head: a blunt, tall snout on the neck.
  const head = b.joint("head", { parent: "neck", at: [0, 0.165, 0.145], role: "head" });
  b.loft(
    [
      { at: [0, 0.156, 0.092], w: 0.042, h: 0.052 },
      { at: [0, 0.166, 0.14], w: 0.05, h: 0.062 },
      { at: [0, 0.16, 0.182], w: 0.042, h: 0.054 },
      { at: [0, 0.15, 0.208], w: 0.03, h: 0.04 },
    ],
    { color: skin, bone: head, sides: 10, name: "head" },
  );

  // Casque: a flat crest along the top of the head, sloping back and up.
  b.extrude(
    [
      [-0.03, -0.03],
      [-0.036, 0.022],
      [-0.02, 0.034],
      [0.012, 0.024],
      [0.04, -0.03],
    ],
    {
      color: skin,
      at: [0, 0.185, 0.118],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.016,
      bevel: 0.005,
      smoothing: 1,
      bone: head,
      name: "casque",
    },
  );

  // Turret eyes: a gold dome, a teal lid collar and a dark pupil, each on its own joint.
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const at: P = [s * 0.02, 0.175, 0.155];
    const dir: P = [s, 0, 0];
    const eye = b.joint(`eye${L}`, { parent: head, at, dir });
    b.lathe(
      [
        [0.013, -0.004],
        [0.0145, 0],
        [0.0135, 0.008],
        [0.0095, 0.0155],
        [0, 0.019],
      ],
      { color: GOLD, at, axis: dir, bone: eye, name: `eye${L}` },
    );
    b.lathe(
      [
        [0.0125, -0.002],
        [0.0158, -0.002],
        [0.0158, 0.004],
        [0.0125, 0.004],
      ],
      { color: TEAL, at, axis: dir, bone: eye, name: `lid${L}` },
    );
    b.lathe(
      [
        [0, 0.0158],
        [0.0047, 0.0158],
        [0.0047, 0.0195],
        [0, 0.0195],
      ],
      { color: PUPIL, at, axis: dir, bone: eye, name: `pupil${L}` },
    );
  }

  // Lower jaw on its own hinge, and a tongue that rides it.
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.15, 0.168], role: "jaw" });
  b.loft(
    [
      { at: [0, 0.152, 0.164], w: 0.034, h: 0.024 },
      { at: [0, 0.147, 0.2], w: 0.026, h: 0.018 },
      { at: [0, 0.142, 0.226], w: 0.014, h: 0.014 },
    ],
    { color: skin, bone: jaw, sides: 8, name: "jawLow" },
  );
  b.sweep(
    polyline([
      [0, 0.15, 0.19],
      [0, 0.146, 0.232],
      [0, 0.14, 0.268],
    ]),
    {
      radius: (t): number => interpolate([0, 0.7, 1], [0.0045, 0.0055, 0.0095], t),
      color: TONGUE,
      bone: jaw,
      caps: "round",
      name: "tongue",
    },
  );

  // Prehensile tail: back from the hips, then a coil that curls up and over.
  const tail = b.chain(
    "tail",
    polyline([
      [0, 0.146, -0.09],
      [0, 0.14, -0.17],
    ]).concat(spiral([0, 0.17, -0.17], [0, 0.14, -0.17], [1, 0, 0], { turns: 0.75, r1: 0.015 })),
    { parent: "hips", count: 7, role: "tail" },
  );
  b.sweep(tail, {
    radius: (t): number => 0.0125 - 0.0075 * t,
    color: skin,
    sides: 8,
    name: "tail",
  });

  // Four toes per foot, two forward and two back, lying along the branch's sides.
  const digits = (joint: string, tip: P, s: number) => {
    const toes: P[] = [
      [-0.25, -0.35, 0.9],
      [-0.1, -0.45, 0.88],
      [-0.25, -0.35, -0.9],
      [-0.1, -0.45, -0.88],
    ];
    for (const d of toes)
      b.rod(tip, step(tip, unit([s * d[0], d[1], d[2]]), 0.018), [0.0042, 0.0022], {
        color: TOE,
        bone: joint,
        caps: "round",
        group: "toe",
      });
  };

  // Legs, mirrored: front ones from the chest, back ones from the hips, each gripping the branch.
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const m = (p: P): P => [s * p[0], p[1], p[2]];

    const frontHand = m([0.028, 0.04, 0.044]);
    const front = b.chain(
      `legF${L}`,
      [m([0.018, 0.142, 0.045]), m([0.06, 0.106, 0.06]), m([0.05, 0.068, 0.052]), frontHand],
      {
        parent: "chest",
        names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `hand${L}`],
        role: "leg",
      },
    );
    b.sweep(front, {
      radius: (t): number => interpolate([0, 0.5, 1], [0.0125, 0.0095, 0.0068], t),
      color: skin,
      sides: 8,
      name: `armF${L}`,
    });
    digits(`hand${L}`, frontHand, s);

    const hindFoot = m([0.028, 0.04, -0.058]);
    const hind = b.chain(
      `legH${L}`,
      [m([0.018, 0.142, -0.058]), m([0.058, 0.104, -0.04]), m([0.052, 0.07, -0.056]), hindFoot],
      {
        parent: "hips",
        names: [`hip${L}`, `knee${L}`, `ankle${L}`, `foot${L}`],
        role: "leg",
      },
    );
    b.sweep(hind, {
      radius: (t): number => interpolate([0, 0.5, 1], [0.0135, 0.0105, 0.0072], t),
      color: skin,
      sides: 8,
      name: `legH${L}`,
    });
    digits(`foot${L}`, hindFoot, s);
  }

  // Dorsal crest: small spikes along the back, seated on the built surface.
  for (const t of [0.06, 0.15, 0.24, 0.33, 0.42, 0.51, 0.6, 0.69, 0.78]) {
    const base = body.at(t, 0, -0.002);
    b.spike(base, base, 0.012 + 0.012 * Math.sin(Math.PI * t), 0.0065, {
      color: CREST,
      group: "crest",
    });
  }

  // Pose the jaw open a little, so the tongue shows.
  b.pose(jaw, { axis: [1, 0, 0], deg: 10 });

  return b.root;
}
```