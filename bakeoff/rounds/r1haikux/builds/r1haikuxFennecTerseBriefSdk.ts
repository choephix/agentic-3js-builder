import * as THREE from "three";
import { createBuilder, frame } from "../../../../src/index";

type V3 = [number, number, number];
type Stops = [number, number][];

// Palette: sand coat, cream face, belly and inner ears, black nose and tail tip.
const SAND = "#e3b27c";
const CREAM = "#fbf0dc";
const DARK = "#2b1f1b";
const EYE = "#120c0a";

const LEG_X = 0.05;

/** Piecewise-linear radius along a chain, t in [0, 1]. */
function taper(stops: Stops): (t: number) => number {
  return (t) => {
    if (t <= stops[0][0]) return stops[0][1];
    for (let i = 1; i < stops.length; i++) {
      const [t1, r1] = stops[i];
      if (t <= t1) {
        const [t0, r0] = stops[i - 1];
        return r0 + ((r1 - r0) * (t - t0)) / (t1 - t0);
      }
    }
    return stops[stops.length - 1][1];
  };
}

function ball(r: number, seg = 10): THREE.SphereGeometry {
  return new THREE.SphereGeometry(r, seg, Math.max(6, seg - 2));
}

/** Ellipsoid with its axes on x, y, z. */
function blob(rx: number, ry: number, rz: number, seg = 10): THREE.SphereGeometry {
  const g = new THREE.SphereGeometry(1, seg, Math.max(6, seg - 2));
  g.scale(rx, ry, rz);
  return g;
}

const frontLeg = (x: number): V3[] => [
  [x, 0.205, 0.085],
  [x, 0.125, 0.092],
  [x, 0.05, 0.1],
  [x, 0.018, 0.12],
];

const hindLeg = (x: number): V3[] => [
  [x, 0.205, -0.12],
  [x, 0.125, -0.1],
  [x, 0.06, -0.155],
  [x, 0.018, -0.13],
];

export const meta = {
  name: "Fennec fox",
  description:
    "A sand-coloured fennec fox at rest: oversized ears, cream face and belly, black nose and a black-tipped tail.",
};

export default function build() {
  const b = createBuilder({ name: "fennec-fox" });

  // Skeleton. Everything hangs from the hips root.
  const hips = b.joint("hips", { at: [0, 0.205, -0.02] });
  const jaw = b.joint("jaw", { at: [0, 0.292, 0.3], parent: hips });
  b.joint("jawTip", { at: [0, 0.272, 0.41], parent: jaw });

  // Body: a tapered tube from rump to shoulders.
  const spine = b.chain(
    "spine",
    [
      [0, 0.205, -0.12],
      [0, 0.21, -0.04],
      [0, 0.215, 0.04],
      [0, 0.222, 0.11],
    ],
    { role: "spine", parent: hips },
  );
  b.sweep(spine, {
    radius: taper([
      [0, 0.05],
      [0.35, 0.06],
      [0.7, 0.066],
      [1, 0.062],
    ]),
    color: SAND,
  });

  // Neck: rises from the chest to the back of the skull.
  const neck = b.chain(
    "neck",
    [
      [0, 0.22, 0.1],
      [0, 0.27, 0.155],
      [0, 0.31, 0.205],
      [0, 0.33, 0.235],
    ],
    { role: "neck", parent: hips },
  );
  b.sweep(neck, {
    radius: taper([
      [0, 0.05],
      [0.4, 0.042],
      [1, 0.046],
    ]),
    color: SAND,
  });

  // Upper jaw and skull: one tube, fat at the cranium, narrowing to the nose.
  const head = b.chain(
    "head",
    [
      [0, 0.322, 0.205],
      [0, 0.338, 0.262],
      [0, 0.326, 0.318],
      [0, 0.306, 0.37],
      [0, 0.297, 0.415],
    ],
    { role: "head", parent: hips },
  );
  const skull = b.sweep(head, {
    radius: taper([
      [0, 0.05],
      [0.27, 0.062],
      [0.53, 0.05],
      [0.79, 0.03],
      [1, 0.016],
    ]),
    color: SAND,
  });
  const headSurf = b.surface(skull);

  // Lower jaw, cream, hinged at the jaw joint.
  b.sweep(
    [
      [0, 0.292, 0.3],
      [0, 0.283, 0.36],
      [0, 0.272, 0.41],
    ],
    {
      radius: taper([
        [0, 0.02],
        [0.5, 0.017],
        [1, 0.01],
      ]),
      color: CREAM,
      bone: jaw,
    },
  );

  // Cream throat and chest, running down from the neck.
  b.sweep(
    [
      [0, 0.2, 0.07],
      [0, 0.17, 0.12],
      [0, 0.15, 0.15],
    ],
    {
      radius: taper([
        [0, 0.048],
        [1, 0.022],
      ]),
      color: CREAM,
    },
  );

  // Legs. Each has a sand sweep, a cream paw and three small cream toes.
  const leg = (name: string, pts: V3[], radius: Stops, paw: V3) => {
    const c = b.chain(name, pts, { role: "leg", parent: hips });
    b.sweep(c, { radius: taper(radius), color: SAND });
    b.stick(blob(0.024, 0.014, 0.034), CREAM, frame(paw, [0, 1, 0]));
    for (const dx of [-0.011, 0, 0.011]) {
      b.stick(ball(0.008, 8), CREAM, frame([paw[0] + dx, 0.008, paw[2] + 0.03], [0, 0, 1]));
    }
  };

  const frontRadius: Stops = [
    [0, 0.028],
    [0.4, 0.02],
    [0.8, 0.014],
    [1, 0.014],
  ];
  const hindRadius: Stops = [
    [0, 0.04],
    [0.3, 0.024],
    [0.65, 0.016],
    [1, 0.014],
  ];

  leg("legFL", frontLeg(LEG_X), frontRadius, [LEG_X, 0.014, 0.13]);
  leg("legFR", frontLeg(-LEG_X), frontRadius, [-LEG_X, 0.014, 0.13]);
  leg("legRL", hindLeg(LEG_X), hindRadius, [LEG_X, 0.014, -0.12]);
  leg("legRR", hindLeg(-LEG_X), hindRadius, [-LEG_X, 0.014, -0.12]);

  // Bushy tail, carried low, with a dark tip.
  const tail = b.chain(
    "tail",
    [
      [0, 0.21, -0.12],
      [0, 0.225, -0.19],
      [0, 0.215, -0.27],
      [0, 0.18, -0.33],
      [0, 0.15, -0.37],
    ],
    { role: "tail", parent: hips },
  );
  b.sweep(tail, {
    radius: taper([
      [0, 0.034],
      [0.3, 0.05],
      [0.65, 0.046],
      [1, 0.03],
    ]),
    color: SAND,
  });
  b.stick(blob(0.034, 0.05, 0.034, 10), DARK, tail.at(0.92));

  // Ears: broad, thin, leaning outward, with cream inner faces.
  const TILT = 0.25;
  const cosT = Math.sqrt(1 - TILT * TILT);
  const EAR: number[][] = [
    [-0.032, 0],
    [0.032, 0],
    [0.024, 0.09],
    [0, 0.15],
    [-0.028, 0.08],
  ];
  const EAR_IN: number[][] = [
    [-0.02, 0.012],
    [0.02, 0.012],
    [0.015, 0.08],
    [0, 0.122],
    [-0.018, 0.065],
  ];
  for (const s of [1, -1]) {
    const ax: V3 = [cosT, -s * TILT, 0];
    const ay: V3 = [s * TILT, cosT, 0];
    b.extrude(EAR, { at: [s * 0.036, 0.36, 0.238], x: ax, y: ay, depth: 0.012, color: SAND });
    b.extrude(EAR_IN, { at: [s * 0.036, 0.36, 0.2465], x: ax, y: ay, depth: 0.006, color: CREAM });
  }

  // Face: dark eyes, cream cheeks, black nose, all seated on the skull.
  for (const s of [1, -1]) {
    b.stick(ball(0.013, 10), EYE, headSurf.nearest([s * 0.05, 0.337, 0.285]));
    b.stick(ball(0.021, 10), CREAM, headSurf.nearest([s * 0.04, 0.304, 0.35]));
  }
  b.stick(ball(0.019, 10), DARK, headSurf.nearest([0, 0.297, 0.44]));

  return b.root;
}
