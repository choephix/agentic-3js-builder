import * as THREE from "three";
import { arc, catmull, createBuilder, limb, paint, rng, spiral } from "../../../../src/index";

export const meta = {
  name: "Panther chameleon on a twig",
  description:
    "A panther chameleon walking along a twig: turquoise head, lime body with a white flank line and red bars, a sunset-orange tail coiled round the twig, turret eyes, a ridged casque and mitten feet.",
};

// Palette
const TURQ = "#1fc2b4";
const CASQUE = "#20b8a9";
const EYE = "#1fb3a6";
const GOLD = "#f4b93a";
const PUPIL = "#16110d";
const WHITE = "#f4f7ea";
const RED = "#e2352c";
const CREST = "#f0871f";
const LEG = "#7cc44a";
const FOOT = "#a2d64c";
const CLAW = "#f3ecd4";
const JAW = "#c9e35c";
const TWIG = "#7b5a3b";
const STONE = "#5e5249";
const LEAF = "#5fb83a";

// Body colour ramp, from u = 0 (head) to u = 1 (tail tip).
const RAMP: [number, string][] = [
  [0, TURQ],
  [0.2, "#5ccd86"],
  [0.4, "#9ed43e"],
  [0.55, "#c4d63c"],
  [0.75, "#f2a22e"],
  [1, "#f2581e"],
];

function hexRgb(h: string): number[] {
  return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
}

function rgbHex(c: number[]): string {
  return (
    "#" +
    c
      .map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

function mixHex(a: string, b: string, t: number): string {
  const A = hexRgb(a);
  const B = hexRgb(b);
  return rgbHex(A.map((v, i) => v + (B[i] - v) * t));
}

function ramp(u: number): string {
  for (let i = 1; i < RAMP.length; i++) {
    const [u1, c1] = RAMP[i];
    if (u <= u1) {
      const [u0, c0] = RAMP[i - 1];
      return mixHex(c0, c1, (u - u0) / (u1 - u0));
    }
  }
  return RAMP[RAMP.length - 1][1];
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const fract = (x: number) => x - Math.floor(x);
const unit = (v: number[]): number[] => {
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
};
const pushAlong = (p: number[], d: number[], k: number): number[] => [
  p[0] + d[0] * k,
  p[1] + d[1] * k,
  p[2] + d[2] * k,
];

export default function build() {
  const b = createBuilder({ name: "panther_chameleon" });
  const rand = rng(7);

  // Body colour: turquoise at the head, lime through the flank, sunset orange at the tail.
  // A white flank line and red bars sit on the body only.
  const bodyPaint = paint((p, _n, s) => {
    let c = ramp(clamp01((0.22 - p.z) / 0.5));
    if (p.z > -0.13 && p.z < 0.17) {
      const rad = (s[1] * Math.PI) / 180;
      const side = Math.abs(Math.sin(rad));
      if (side > 0.975) return WHITE;
      if (side > 0.5 && fract(p.z * 15 + p.y * 1.5) < 0.3) return RED;
      if (Math.cos(rad) < -0.45) c = mixHex(c, "#eef59a", 0.45);
    }
    return c;
  });

  // Root joint at the hips.
  const hips = b.joint("hips", { at: [0, 0.4, -0.04], dir: [0, 0, 1], role: "spine" });

  // Scenery: a stone base, a post and a twig along Z (lowest point y = 0).
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.11, 0.014],
      [0.095, 0.03],
      [0, 0.032],
    ],
    { at: [0, 0, 0], color: STONE, smoothing: 1, bone: hips },
  );
  b.sweep(
    [
      [0, 0.02, 0],
      [0, 0.3, 0],
    ],
    [0.024, 0.016],
    { color: TWIG, bone: hips },
  );
  b.sweep(
    [
      [0, 0.3, -0.6],
      [0, 0.3, 0.6],
    ],
    [0.012, 0.009],
    { color: TWIG, bone: hips },
  );
  b.sweep(
    [
      [0, 0.3, 0.42],
      [0.03, 0.335, 0.45],
      [0.06, 0.37, 0.48],
    ],
    [0.0065, 0.0045],
    { color: TWIG, bone: hips },
  );
  b.extrude(
    [
      [0, 0],
      [0.05, 0.03],
      [0.12, 0, "sharp"],
      [0.05, -0.03],
    ],
    {
      at: [0.06, 0.37, 0.48],
      x: [0, 0, 1],
      y: [1, 0, 0],
      thickness: 0.004,
      smoothing: 2,
      color: LEAF,
      bone: hips,
    },
  );

  // Body: a spine chain from the hips to the neck, skinned as one tube.
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.4, -0.04],
      [0, 0.415, 0.03],
      [0, 0.425, 0.11],
      [0, 0.44, 0.18],
    ]),
    { parent: hips, names: ["torso", "chest", "back", "neck"], role: "spine" },
  );
  const neck = spine.tip!;
  const bodyR = (t: number): [number, number] => {
    const k = Math.sin(Math.PI * clamp01(0.1 + 0.8 * t));
    return [0.03 + 0.013 * k, 0.04 + 0.011 * k];
  };
  const body = b.sweep(spine, bodyR, { color: bodyPaint });

  // Dorsal crest: a row of small spikes along the back.
  b.along(
    body,
    9,
    (at) => {
      b.spike(at, at, 0.012 + 0.006 * rand(), 0.0055, { color: CREST });
    },
    { from: 0.1, to: 0.9 },
  );

  // Tail: leaves the vent, drops onto the twig and coils round it tightly.
  const coilCentre = [0, 0.3, -0.27];
  const coilTop = [0, 0.322, -0.27];
  const tailPath = catmull([
    [0, 0.4, -0.04],
    [0, 0.39, -0.12],
    [0, 0.36, -0.19],
    coilTop,
  ]).concat(spiral(coilCentre, coilTop, [0, 0, -1], { turns: 1.25, r1: 0.021, pitch: 0.016 }));
  const tail = b.chain("tail", tailPath, { parent: hips, count: 14, role: "tail" });
  b.sweep(tail, (t: number) => 0.021 - 0.0125 * t, { color: bodyPaint });

  // Legs: a walking pose with the feet staggered along the twig.
  const legs = [
    { name: "FL", root: [0.034, 0.4, 0.13], foot: [0.014, 0.318, 0.165], bend: [1, 0, -0.4] },
    { name: "FR", root: [-0.034, 0.4, 0.13], foot: [-0.014, 0.318, 0.115], bend: [-1, 0, -0.4] },
    { name: "HL", root: [0.034, 0.4, -0.01], foot: [0.014, 0.318, -0.045], bend: [1, 0, 0.4] },
    { name: "HR", root: [-0.034, 0.4, -0.01], foot: [-0.014, 0.318, 0.0], bend: [-1, 0, 0.4] },
  ];
  for (const L of legs) {
    const pts = limb(L.root, L.foot, [0.052, 0.05], [L.bend]);
    const leg = b.chain(`leg${L.name}`, pts, {
      parent: hips,
      names: [`shoulder${L.name}`, `elbow${L.name}`, `wrist${L.name}`],
      role: "leg",
    });
    const wrist = leg.tip!;
    b.sweep(leg, (t: number) => 0.0145 - 0.0055 * t, { color: LEG });

    // Mitten foot: a palm on the twig top, with two toe groups clasping the twig.
    b.part(new THREE.SphereGeometry(0.012, 7, 5).scale(1.35, 0.7, 1.5), FOOT, {
      bone: wrist,
      at: L.foot,
      flat: true,
    });
    const R = 0.0185;
    const zF = L.foot[2];
    const toeGroups = [
      { a0: 30, sw: 120, dz: [-0.006, 0.006] },
      { a0: 200, sw: 120, dz: [-0.011, 0, 0.011] },
    ];
    for (const g of toeGroups) {
      for (const dz of g.dz) {
        const cz = zF + dz;
        const a0 = (g.a0 * Math.PI) / 180;
        const a1 = ((g.a0 + g.sw) * Math.PI) / 180;
        b.sweep(
          arc([0, 0.3, cz], [R * Math.cos(a0), 0.3 + R * Math.sin(a0), cz], [0, 0, 1], g.sw),
          0.0042,
          { color: FOOT, bone: wrist },
        );
        b.spike(
          [R * Math.cos(a1), 0.3 + R * Math.sin(a1), cz],
          [-Math.sin(a1), Math.cos(a1), 0],
          0.008,
          0.0022,
          { color: CLAW, bone: wrist },
        );
      }
    }
  }

  // Head: a long skull tube on the neck, with a separate lower jaw.
  const head = b.joint("head", {
    parent: neck,
    at: [0, 0.462, 0.205],
    dir: [0, -0.12, 1],
    role: "head",
  });
  const headPath = catmull([
    [0, 0.462, 0.205],
    [0, 0.466, 0.25],
    [0, 0.455, 0.296],
    [0, 0.44, 0.33],
  ]);
  const headR = (t: number): [number, number] => {
    const k = t < 0.4 ? 0.04 + 0.01 * (t / 0.4) : 0.05 - 0.034 * ((t - 0.4) / 0.6);
    return [k, k * 0.92];
  };
  b.sweep(headPath, headR, { bone: head, color: bodyPaint });

  const jaw = b.joint("jaw", { parent: head, at: [0, 0.434, 0.25], dir: [0, -0.1, 1], role: "jaw" });
  b.sweep(
    catmull([
      [0, 0.434, 0.25],
      [0, 0.424, 0.3],
      [0, 0.414, 0.326],
    ]),
    [0.009, 0.006],
    { bone: jaw, color: JAW },
  );

  // Casque: a side-profile crest on the midline, with a row of ridge spikes along its top.
  const casque = b.extrude(
    [
      [-0.12, -0.03],
      [-0.1, 0.02],
      [-0.06, 0.04],
      [-0.02, 0.055],
      [0.02, 0.05],
      [0.045, 0.02],
      [0.035, -0.03],
    ],
    {
      at: [0, 0.478, 0.23],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: [0.05, 0.018],
      bevel: 0.006,
      smoothing: 1,
      color: CASQUE,
      bone: head,
    },
  );
  for (const [u, v] of [
    [-0.09, 0.03],
    [-0.06, 0.046],
    [-0.03, 0.055],
    [0.0, 0.055],
    [0.024, 0.046],
  ]) {
    b.spike(casque.local([u, v, 0]), [0, 1, -0.35], 0.022, 0.0065, { color: CREST, bone: head });
  }

  // Turret eyes: one looks forward and to the left, the other back and to the right.
  const eyes = [
    { name: "eyeL", base: [0.043, 0.478, 0.258], dir: unit([0.62, 0.12, 0.78]) },
    { name: "eyeR", base: [-0.043, 0.478, 0.252], dir: unit([-0.8, 0.15, -0.45]) },
  ];
  for (const e of eyes) {
    const eye = b.joint(e.name, { parent: head, at: e.base, dir: e.dir });
    b.lathe(
      [
        [0, 0],
        [0.03, 0],
        [0.031, 0.012],
        [0.024, 0.028],
        [0.012, 0.036],
        [0, 0.038],
      ],
      { at: e.base, axis: e.dir, bone: eye, color: EYE, smoothing: 1 },
    );
    b.part(new THREE.CylinderGeometry(0.0135, 0.0135, 0.003, 12), GOLD, {
      bone: eye,
      at: pushAlong(e.base, e.dir, 0.0375),
      dir: e.dir,
      flat: true,
    });
    b.part(new THREE.CylinderGeometry(0.0065, 0.0065, 0.002, 10), PUPIL, {
      bone: eye,
      at: pushAlong(e.base, e.dir, 0.0405),
      dir: e.dir,
      flat: true,
    });
  }

  return b.root;
}
