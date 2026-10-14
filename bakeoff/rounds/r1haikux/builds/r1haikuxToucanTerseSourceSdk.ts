import * as THREE from "three";
import { catmull, createBuilder, interpolate, paint } from "../../../../src/index";

export const meta = {
  name: "Toco toucan",
  description:
    "A standing toco toucan, stylised from primitives: black plumage, a white throat bib, a huge orange bill with a black tip, a blue eye ring and a red under-tail.",
};

const BLACK = "#141418";
const WHITE = "#f4f0e6";
const RED = "#e0462b";
const BLUE = "#3f9be8";
const IRIS = "#0d0d10";
const LEG = "#4f555d";
const TOE = "#2a2d33";

/** Which way the white throat and upper breast face: forward and down. */
const THROAT = new THREE.Vector3(0, -0.6, 0.8).normalize();

/** Plumage: a white bib under the head and up the front of the neck and chest; black elsewhere, red under the rump. */
function plumage(p: THREE.Vector3, n: THREE.Vector3): string {
  if (p.y > 0.225 && n.angleTo(THROAT) < 0.62) return WHITE;
  if (p.z < 0 && p.y < 0.175) return RED;
  return BLACK;
}

/** The eyes, one per side (left = +X): a blue ring round a black iris with a small glint. */
const EYES = [1, -1].map((s) => new THREE.Vector3(0.86 * s, 0.24, 0.45).normalize());
const GLINTS = EYES.map((e) => e.clone().add(new THREE.Vector3(0, 0.1, 0)).normalize());

const bodyPaint = paint(plumage);

const headPaint = paint((p, n) => {
  for (let i = 0; i < EYES.length; i++) {
    const a = n.angleTo(EYES[i]);
    if (a < 0.26) return a > 0.14 ? BLUE : n.angleTo(GLINTS[i]) < 0.04 ? WHITE : IRIS;
  }
  return plumage(p, n);
});

/** The bill: yellow at the root, orange down its length, black at the tip. */
const billPaint = paint((p) => {
  const t = (p.z - 0.15) / 0.2;
  if (t > 0.8) return BLACK;
  if (t < 0.3) return "#ffc21f";
  if (t < 0.55) return "#fba01c";
  return "#f2661c";
});

/** The tail: red on the underside near the base (s = [source t, clock degrees], belly at 180). */
const tailPaint = paint((_p, _n, s) => (s[1] > 110 && s[1] < 250 && s[0] < 0.4 ? RED : BLACK));

/** A section's half-width and half-height, interpolated over a path's knots. */
const ringRadius =
  (ts: readonly number[], across: readonly number[], upward: readonly number[]) =>
  (t: number): [number, number] => [interpolate(ts, across, t), interpolate(ts, upward, t)];

export default function toucan() {
  const b = createBuilder({ name: "toucan", detail: 1, paintSize: 1024 });

  // ---- Skeleton -------------------------------------------------------------
  const root = b.joint("root", { at: [0, 0, 0] });

  // Body: hips to chest, leaning forward about 45 degrees. The neck runs from the chest up to the head.
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.15, -0.03],
      [0, 0.2, 0.02],
      [0, 0.25, 0.065],
      [0, 0.28, 0.09],
    ]),
    { parent: root, names: ["hips", "spine", "chest"], up: [0, 1, 0], role: "spine" },
  );
  const [hips, , chest] = spine.joints;

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.28, 0.09],
      [0, 0.318, 0.12],
      [0, 0.35, 0.14],
    ]),
    { parent: chest, names: ["neck1", "neck2", "head"], up: [0, 1, 0], role: "neck" },
  );
  const head = neck.joints[2];

  // The bill: an upper and a lower mandible, each on its own joint, so the jaw can open.
  const upperJaw = b.joint("upperJaw", { parent: head, at: [0, 0.36, 0.15], dir: [0, -0.1, 1] });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.338, 0.15], dir: [0, -0.2, 1], role: "jaw" });

  // ---- Head and bill --------------------------------------------------------
  b.part(new THREE.SphereGeometry(0.043, b.segments(14), b.segments(10)), headPaint, {
    bone: head,
    at: [0, 0.35, 0.14],
    scale: [0.96, 0.98, 1.06],
    name: "head",
  });

  const upper = catmull([
    [0, 0.36, 0.15],
    [0, 0.357, 0.215],
    [0, 0.345, 0.285],
    [0, 0.327, 0.34],
    [0, 0.316, 0.36],
  ]);
  b.sweep(upper, ringRadius(upper.knots, [0.024, 0.025, 0.021, 0.013, 0.008], [0.03, 0.031, 0.026, 0.017, 0.01]), {
    color: billPaint,
    bone: upperJaw,
    up: [0, 1, 0],
    sides: 10,
    name: "billUpper",
    group: "bill",
  });

  const lower = catmull([
    [0, 0.338, 0.15],
    [0, 0.31, 0.215],
    [0, 0.298, 0.285],
    [0, 0.29, 0.325],
  ]);
  b.sweep(lower, ringRadius(lower.knots, [0.016, 0.017, 0.013, 0.007], [0.02, 0.018, 0.013, 0.007]), {
    color: billPaint,
    bone: jaw,
    up: [0, 1, 0],
    sides: 10,
    name: "billLower",
    group: "bill",
  });

  // ---- Body, neck and tail --------------------------------------------------
  b.sweep(spine, ringRadius(spine.ts, [0.04, 0.05, 0.044, 0.03], [0.05, 0.058, 0.048, 0.034]), {
    color: bodyPaint,
    sides: 12,
    name: "body",
    group: "body",
  });

  b.sweep(neck, ringRadius(neck.ts, [0.03, 0.026, 0.03], [0.032, 0.03, 0.03]), {
    color: bodyPaint,
    sides: 10,
    name: "neck",
    group: "neck",
  });

  // Tail: long, broad and thin from side to side, angled a little below the horizontal.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.14, -0.06],
      [0, 0.125, -0.11],
      [0, 0.105, -0.16],
      [0, 0.09, -0.215],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tailTip"], up: [0, 1, 0], role: "tail" },
  );
  b.sweep(tail, ringRadius(tail.ts, [0.02, 0.03, 0.033, 0.026], [0.011, 0.01, 0.008, 0.006]), {
    color: tailPaint,
    sides: 8,
    name: "tail",
    group: "tail",
  });

  // ---- Legs, feet, wings: one of each per side (left = +X) ------------------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // Leg: the hip sits inside the body, the knee bulges forward, the ankle stands above the toes.
    const leg = b.chain(
      `leg${side}`,
      catmull([
        [0.026 * s, 0.125, -0.005],
        [0.03 * s, 0.075, 0.012],
        [0.03 * s, 0.03, -0.01],
      ]),
      {
        parent: hips,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`],
        role: "leg",
        contact: [0.03 * s, 0, -0.01],
      },
    );
    b.sweep(leg, 0.0095, { color: LEG, sides: 6, name: `leg${side}`, group: `leg${side}` });

    // Zygodactyl foot: two toes forward, two back, each a short three-joint chain resting on the floor.
    const ankle = leg.joints[2];
    const heel = [0.03 * s, 0.03, -0.01];
    const toes = [
      { id: "fo", out: 0.012, fwd: 0.034 },
      { id: "fi", out: -0.006, fwd: 0.038 },
      { id: "bo", out: 0.01, fwd: -0.026 },
      { id: "bi", out: -0.004, fwd: -0.03 },
    ];
    for (const toe of toes) {
      const tip = [heel[0] + toe.out * s, 0.005, heel[2] + toe.fwd];
      const mid = [(heel[0] + tip[0]) / 2, 0.0165, (heel[2] + tip[2]) / 2];
      const name = `toe${side}${toe.id}`;
      const digit = b.chain(name, [heel, mid, tip], {
        parent: ankle,
        names: [`${name}1`, `${name}2`, `${name}3`],
        role: "digit",
      });
      b.sweep(digit, 0.0035, { color: TOE, sides: 6, name, group: `toe${side}` });
      b.spike(tip, [toe.out * s, -0.3, toe.fwd], 0.009, 0.0026, {
        color: BLACK,
        bone: digit.joints[2],
        sides: 6,
        group: `claw${side}`,
      });
    }

    // Wing: folded down the flank. A leading-edge chain with a membrane skin to a trailing edge.
    const wing = b.chain(
      `wing${side}`,
      catmull([
        [0.054 * s, 0.25, 0.06],
        [0.062 * s, 0.2, 0.0],
        [0.066 * s, 0.155, -0.065],
        [0.058 * s, 0.13, -0.12],
      ]),
      {
        parent: chest,
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `wingTip${side}`],
        role: "wing",
      },
    );
    b.membrane(
      wing,
      catmull([
        [0.054 * s, 0.222, 0.045],
        [0.062 * s, 0.168, -0.012],
        [0.066 * s, 0.128, -0.07],
        [0.056 * s, 0.112, -0.122],
      ]),
      { color: BLACK, thickness: 0.006, rows: 3, bone: wing, name: `wing${side}`, group: `wing${side}` },
    );

    // Flight feathers: three slim black cards fanning back from the wing tip.
    [
      [0, 0.06],
      [-0.011, 0.055],
      [-0.022, 0.048],
    ].forEach(([drop, length], i) => {
      b.slab(
        [
          [0.058 * s, 0.136 + drop, -0.1],
          [0.058 * s, 0.13 + drop, -0.1 - length],
          [0.058 * s, 0.12 + drop, -0.1 - length * 0.9],
          [0.058 * s, 0.116 + drop, -0.1],
        ],
        {
          color: BLACK,
          thickness: 0.002,
          bone: wing.joints[3],
          name: `primary${side}${i}`,
          group: `wing${side}`,
        },
      );
    });
  }

  return b.root;
}
