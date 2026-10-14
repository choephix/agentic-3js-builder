import * as THREE from "three";
import { countershade, createBuilder, limb, paint, rng } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "hedgehog",
  description:
    "A plump autumn hedgehog: a dome of chestnut spines tipped in cream, a soft fawn face, pink paws and a red maple leaf stuck on its back.",
};

type V3 = [number, number, number];

// Palette
const CHESTNUT = "#8a4a2b";
const CREAM = "#f3e2c0";
const DEEP = "#4a2816";
const BELLY = "#e4c496";
const FAWN = "#dbb688";
const SHADE = "#b98a5c";
const PINK = "#f29bb0";
const INNER_EAR = "#e8a1a0";
const BLACK = "#15100d";
const WHITE = "#fbf7ee";
const NOSE = "#1a1412";
const WHISKER = "#4a3626";
const LEAF = "#c8321f";
const VEIN = "#f6d27c";

// Maple leaf outline: drawn in leaf units (tip at y = 1), scaled to metres.
const LEAF_M = 0.06;
const leafPt = (x: number, y: number, sharp = false): OutlinePoint =>
  sharp ? [x * LEAF_M, y * LEAF_M, "sharp"] : [x * LEAF_M, y * LEAF_M];

const MAPLE: OutlinePoint[] = [
  leafPt(0, 0),
  leafPt(0.12, 0.16),
  leafPt(0.56, 0.08, true),
  leafPt(0.42, 0.38),
  leafPt(0.85, 0.52, true),
  leafPt(0.42, 0.58),
  leafPt(0.52, 0.76, true),
  leafPt(0.13, 0.72),
  leafPt(0, 1, true),
  leafPt(-0.13, 0.72),
  leafPt(-0.52, 0.76, true),
  leafPt(-0.42, 0.58),
  leafPt(-0.85, 0.52, true),
  leafPt(-0.42, 0.38),
  leafPt(-0.56, 0.08, true),
  leafPt(-0.12, 0.16),
];

export default function build() {
  const b = createBuilder({ name: "hedgehog" });

  // ---- Skeleton -----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.09, -0.02], role: "spine" });
  const spine = b.chain(
    "spine",
    [
      [0, 0.09, -0.02],
      [0, 0.092, 0.04],
      [0, 0.1, 0.085],
    ],
    { parent: hips, names: ["waist", "chest"], role: "spine" },
  );
  const head = b.joint("head", {
    parent: spine,
    at: [0, 0.112, 0.1],
    aim: [0, 0.1, 0.2],
    role: "head",
  });

  // ---- Body: a plump oval, dark beneath the spines, fawn underneath --------
  const body = b.loft(
    [
      { at: [0, 0.095, -0.1], w: 0.05, h: 0.06 },
      { at: [0, 0.092, -0.07], w: 0.12, h: 0.12 },
      { at: [0, 0.09, -0.02], w: 0.15, h: 0.14 },
      { at: [0, 0.09, 0.03], w: 0.14, h: 0.135 },
      { at: [0, 0.095, 0.07], w: 0.11, h: 0.11 },
      { at: [0, 0.105, 0.1], w: 0.085, h: 0.09 },
    ],
    { bone: spine, color: countershade(DEEP, BELLY, { level: 0 }) },
  );

  // ---- Head: soft fawn face, chestnut crown, pointed snout ----------------
  const face = b.loft(
    [
      { at: [0, 0.122, 0.1], w: 0.1, h: 0.1 },
      { at: [0, 0.118, 0.135], w: 0.095, h: 0.095 },
      { at: [0, 0.11, 0.165], w: 0.07, h: 0.065 },
      { at: [0, 0.1, 0.19], w: 0.035, h: 0.034 },
      { at: [0, 0.094, 0.205], w: 0.012, h: 0.012 },
    ],
    { bone: head, color: paint((_p, n) => (n.y > 0.45 ? CHESTNUT : FAWN)) },
  );
  const faceSurf = b.surface(face);

  // Bright beady eyes: a black bead with a white glint on its upper front.
  for (const s of [1, -1]) {
    const eye = faceSurf.nearest([s * 0.036, 0.13, 0.15]);
    b.part(new THREE.SphereGeometry(0.0115, 12, 9), BLACK, {
      at: eye.moved([0, 0.0035, 0]),
      bone: head,
    });
    b.part(new THREE.SphereGeometry(0.0033, 8, 6), WHITE, {
      at: eye.moved([s * 0.0068, 0.0112, 0]),
      bone: head,
    });
  }

  // Shiny black button nose at the snout tip.
  b.part(new THREE.SphereGeometry(0.0105, 12, 9).scale(1.25, 0.9, 1), NOSE, {
    at: [0, 0.095, 0.2],
    bone: head,
  });

  // Tiny round ears with pink insides, set on the sides of the skull.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.016, 12, 8).scale(0.3, 1, 1), SHADE, {
      at: [s * 0.045, 0.14, 0.11],
      bone: head,
    });
    b.part(new THREE.SphereGeometry(0.0095, 10, 7).scale(0.25, 1, 1), INNER_EAR, {
      at: [s * 0.0485, 0.14, 0.11],
      bone: head,
    });
  }

  // Twitchy whiskers around the snout.
  const whiskers: [V3, V3][] = [
    [
      [0.008, 0.1065, 0.18],
      [0.06, 0.112, 0.235],
    ],
    [
      [0.01, 0.1, 0.185],
      [0.066, 0.1, 0.24],
    ],
    [
      [0.008, 0.0935, 0.18],
      [0.055, 0.088, 0.23],
    ],
  ];
  for (const s of [1, -1])
    for (const [p, q] of whiskers)
      b.rod([s * p[0], p[1], p[2]], [s * q[0], q[1], q[2]], 0.0012, {
        color: WHISKER,
        bone: head,
      });

  // ---- Legs and little pink paws -----------------------------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Front leg: shoulder on the chest, elbow pointing back.
    const foreRoot: V3 = [s * 0.05, 0.085, 0.05];
    const forePaw: V3 = [s * 0.056, 0.0115, 0.075];
    const fore = b.chain(`fore${side}`, limb(foreRoot, forePaw, [0.042, 0.042], [[0, 0, -1]]), {
      parent: spine,
      names: [`foreShoulder${side}`, `foreElbow${side}`, `forePaw${side}`],
      role: "arm",
    });
    b.sweep(fore, (t) => 0.0135 - 0.004 * t, { color: SHADE });
    b.part(new THREE.SphereGeometry(0.016, 12, 8).scale(1.15, 0.7, 1.25), PINK, {
      at: forePaw,
      bone: fore,
    });
    for (const dx of [-0.0055, 0, 0.0055]) {
      b.part(new THREE.SphereGeometry(0.0045, 8, 6), PINK, {
        at: [forePaw[0] + dx, 0.0045, forePaw[2] + 0.016],
        bone: fore,
      });
    }

    // Hind leg: hip at the rump, knee forward.
    const hindRoot: V3 = [s * 0.06, 0.08, -0.07];
    const hindPaw: V3 = [s * 0.064, 0.0115, -0.01];
    const hind = b.chain(`hind${side}`, limb(hindRoot, hindPaw, [0.05, 0.05], [[0, 0, 1]]), {
      parent: hips,
      names: [`hindHip${side}`, `hindKnee${side}`, `hindPaw${side}`],
      role: "leg",
    });
    b.sweep(hind, (t) => 0.014 - 0.004 * t, { color: SHADE });
    b.part(new THREE.SphereGeometry(0.016, 12, 8).scale(1.15, 0.7, 1.25), PINK, {
      at: hindPaw,
      bone: hind,
    });
    for (const dx of [-0.0055, 0, 0.0055]) {
      b.part(new THREE.SphereGeometry(0.0045, 8, 6), PINK, {
        at: [hindPaw[0] + dx, 0.0045, hindPaw[2] + 0.016],
        bone: hind,
      });
    }
  }

  // ---- Spines: a dome of chestnut quills with cream tips -------------------
  const skin = b.surface(body);
  const spineFill = paint((_p, _n, s) => (s[0] > 0.7 ? CREAM : CHESTNUT));
  const spots = skin.scatter(420, {
    rng: rng(7),
    minDist: 0.015,
    filter: (h) => h.n.y > -0.3 && h.at.z < 0.09 && h.at.z > -0.12,
  });
  const lengths = rng(21);
  for (const h of spots) {
    // Tilted toward the back so the quills sweep over the body.
    b.spike(h, h.dir([0, 1, 0.5]), 0.03 + 0.012 * lengths(), 0.0078, { color: spineFill });
  }

  // ---- Red maple leaf, stuck among the spines ------------------------------
  const stem = skin.nearest([0.03, 0.22, -0.02]);
  const leafColor = paint((_p, _n, s) => (Math.abs(s[0]) < 0.0016 && s[1] > 0.005 ? VEIN : LEAF));
  const lean = -0.25;
  const xDir: V3 = [0.937 * Math.cos(lean), Math.sin(lean), -0.349 * Math.cos(lean)];
  const yDir: V3 = [-0.937 * Math.sin(lean), Math.cos(lean), 0.349 * Math.sin(lean)];
  b.extrude(MAPLE, {
    at: stem.moved([0, -0.003, 0]),
    x: xDir,
    y: yDir,
    thickness: 0.0022,
    color: leafColor,
  });

  return b.root;
}
