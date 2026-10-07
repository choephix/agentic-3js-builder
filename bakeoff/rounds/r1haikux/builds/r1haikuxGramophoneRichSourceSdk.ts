import * as THREE from "three";
import { catmull, createBuilder, grain, mix, mottle, noise, paint, smoothstep } from "../../../../src/index";
import type { Contour } from "../../../../src/index";

export const meta = {
  name: "Antique gramophone",
  description:
    "A walnut cabinet gramophone with a five-lobed brass morning-glory horn, a black record with a red label, " +
    "a silver tonearm, a side crank and brass claw feet.",
};

// ---------------------------------------------------------------- palette and layout (metres)

const WALNUT_DARK = "#4a2c18";
const WALNUT_LIGHT = "#7e5536";
const INLAY_PALE = "#efe4c6";
const INLAY_EYE = "#8e5c2c";
const PATINA = "#6f9276";
const RED_LABEL = "#a71e1f";
const GOLD = "#c9a24a";

/** The record's centre on the turntable (the cabinet top is at y = 0.27). */
const SPIN_X = 0;
const SPIN_Z = 0.03;

// ---------------------------------------------------------------- paints

/** Walnut grain, streaking along the cabinet's width. */
const grainWood = grain(WALNUT_DARK, WALNUT_LIGHT, { size: 0.016, axis: "x", seed: 7 });

/** Flower centres sit on a lattice this far apart; a staggered second lattice fills the gaps. */
const LATTICE = 0.058;
/** Petal reach of one five-petalled flower. */
const PETAL = 0.0185;

/** Nearest flower of the two lattices: `ratio` < 1 inside a petal, `d` the distance to its centre. */
function bloom(u: number, v: number) {
  let ratio = Infinity;
  let d = Infinity;
  for (const shift of [0, LATTICE / 2]) {
    const cu = Math.round((u - shift) / LATTICE) * LATTICE + shift;
    const cv = Math.round((v - shift) / LATTICE) * LATTICE + shift;
    const dist = Math.hypot(u - cu, v - cv);
    const reach = PETAL * (0.55 + 0.45 * Math.abs(Math.cos(2.5 * Math.atan2(v - cv, u - cu))));
    if (dist / reach < ratio) {
      ratio = dist / reach;
      d = dist;
    }
  }
  return { ratio, d };
}

/** Walnut with a pale floral inlay on every face; each face carries the flowers in its own plane. */
const walnut = paint((p, n) => {
  let u: number;
  let v: number;
  if (Math.abs(n.y) >= Math.abs(n.x) && Math.abs(n.y) >= Math.abs(n.z)) {
    u = p.x;
    v = p.z;
  } else if (Math.abs(n.z) >= Math.abs(n.x)) {
    u = p.x;
    v = p.y;
  } else {
    u = p.z;
    v = p.y;
  }
  let colour = grainWood.at(p, n);
  if (n.y > 0.7) {
    // A pale rule round the top, just inside its bevel.
    const rule = Math.abs(Math.max(Math.abs(p.x) - 0.188, Math.abs(p.z) - 0.178));
    colour = mix(colour, INLAY_PALE, smoothstep(0.0022, 0.0009, rule));
  }
  const { ratio, d } = bloom(u, v);
  colour = mix(colour, INLAY_PALE, smoothstep(1.08, 0.92, ratio));
  return mix(colour, INLAY_EYE, smoothstep(0.0055, 0.0035, d));
});

/** Warm brass, with a green verdigris patina in patches and on the undersides. */
const brass = paint((p, n) => {
  const tone = mix("#d9ae5a", "#97712f", smoothstep(0.42, 0.64, noise(p, 0.05, 3)));
  const patina = smoothstep(0.6, 0.74, noise(p, 0.035, 12)) * (0.35 + 0.35 * smoothstep(0.2, -0.6, n.y));
  return mix(tone, PATINA, patina);
});

/** Polished silver for the tonearm. */
const steel = mottle("#a9b0b9", "#dfe4ea", { size: 0.035, contrast: 1.2, seed: 4 });

/** Black shellac with fine concentric grooves. */
const vinyl = paint((p) => {
  const r = Math.hypot(p.x - SPIN_X, p.z - SPIN_Z);
  const groove = 0.5 + 0.5 * Math.sin((r / 0.0125) * 2 * Math.PI);
  return mix("#0d0d10", "#2c2c33", groove * 0.4 + smoothstep(0.128, 0.14, r) * 0.25);
});

/** The red label: a gold rim, a pale printed ring and a pale spindle hole. */
const label = paint((p) => {
  const r = Math.hypot(p.x - SPIN_X, p.z - SPIN_Z);
  if (r < 0.0065) return "#cfc7ad";
  if (r > 0.0405) return GOLD;
  if (r > 0.0255 && r < 0.0283) return "#f1e2b4";
  return RED_LABEL;
});

// ---------------------------------------------------------------- the horn

/** Radius at horn parameter t: a slim neck, then an exponential flare to a mouth about 28 cm across. */
const hornRadius = (t: number) => 0.012 + 0.02 * t + (0.25 * (Math.exp(4 * t) - 1)) / (Math.exp(4) - 1);

/** How far the mouth's lobes swing in and out: nothing on the neck, full flower at the mouth. */
const lobes = (t: number) => 0.2 * smoothstep(0.55, 1, t);

/** A five-lobed morning-glory section: a circle at the throat, a flower at the mouth. */
const bell: Contour = {
  sides: 40,
  smooth: true,
  knots: [],
  reach(t): [number, number, number, number] {
    const r = hornRadius(t) * (1 + lobes(t));
    return [r, r, r, r];
  },
  keys(t) {
    return [hornRadius(t)];
  },
  polygon(t, sides) {
    const R = hornRadius(t);
    const amp = lobes(t);
    return Array.from({ length: sides }, (_, k): [number, number] => {
      const a = (2 * Math.PI * k) / sides;
      const rho = R * (1 + amp * (2 * Math.abs(Math.cos(2.5 * a)) - 1));
      return [rho * Math.cos(a), rho * Math.sin(a)];
    });
  },
};

// ---------------------------------------------------------------- the gramophone

export default function gramophone() {
  const b = createBuilder({ name: "gramophone", paintSize: 1024 });

  // Skeleton: the cabinet is the root; the horn, turntable, tonearm and crank can move.
  b.joint("base", { at: [0, 0, 0] });
  b.joint("horn", { parent: "base", at: [0, 0.2, -0.165], dir: [0, 1, 0] });
  b.joint("turntable", { parent: "base", at: [0, 0.27, SPIN_Z], dir: [0, 1, 0] });
  b.joint("tonearm", { parent: "base", at: [0.15, 0.27, -0.1], dir: [0, 1, 0] });
  b.joint("crank", { parent: "base", at: [0.23, 0.14, 0], dir: [1, 0, 0] });

  // Cabinet: a rounded walnut box, with a moulded plinth and cornice and a raised front panel.
  const rect = (hx: number, hy: number): Array<[number, number]> => [
    [-hx, -hy],
    [hx, -hy],
    [hx, hy],
    [-hx, hy],
  ];
  b.extrude(rect(0.23, 0.21), {
    name: "cabinet",
    color: walnut,
    bone: "base",
    at: [0, 0.16, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.22,
    bevel: 0.022,
    smoothing: 2,
  });
  b.extrude(rect(0.25, 0.23), {
    name: "plinth",
    color: walnut,
    bone: "base",
    at: [0, 0.059, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.018,
    bevel: 0.005,
    smoothing: 2,
  });
  b.extrude(rect(0.238, 0.218), {
    name: "cornice",
    color: walnut,
    bone: "base",
    at: [0, 0.259, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.018,
    bevel: 0.005,
    smoothing: 2,
  });
  b.extrude(rect(0.185, 0.075), {
    name: "frontPanel",
    color: walnut,
    bone: "base",
    at: [0, 0.165, 0.21],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.016,
    bevel: 0.006,
    smoothing: 2,
  });

  // Brass rosettes on the front panel.
  for (const x of [-0.11, 0.11]) {
    for (const y of [0.115, 0.215]) {
      b.lathe(
        [
          [0, 0],
          [0.02, 0],
          [0.024, 0.003],
          [0.02, 0.007],
          [0.011, 0.012],
          [0, 0.0145],
        ],
        { name: "rosette", color: brass, at: [x, y, 0.212], axis: [0, 0, 1], bone: "base", segments: b.segments(14) },
      );
    }
  }

  // Claw-and-ball feet: a ball on the floor, three brass claws gripping it up into the plinth.
  const FEET: Array<[number, number]> = [
    [-0.19, -0.165],
    [0.19, -0.165],
    [-0.19, 0.165],
    [0.19, 0.165],
  ];
  FEET.forEach(([x, z], i) => {
    b.part(new THREE.SphereGeometry(0.022, b.segments(14), b.segments(10)), brass, {
      name: "foot",
      at: [x, 0.022, z],
      bone: "base",
    });
    for (let k = 0; k < 3; k++) {
      const phi = Math.PI / 4 + i * 0.5 + (k * 2 * Math.PI) / 3;
      const at = (r: number, y: number) => [x + Math.cos(phi) * r, y, z + Math.sin(phi) * r];
      b.sweep(
        catmull([at(0.014, 0.058), at(0.032, 0.04), at(0.031, 0.024), at(0.026, 0.006)]),
        [0.0046, 0.0038, 0.003, 0.0016],
        { name: "claw", color: brass, bone: "base" },
      );
    }
  });

  // Turntable: brass platter, black record with a red label, and a spindle.
  b.lathe(
    [
      [0, 0],
      [0.155, 0],
      [0.157, 0.005],
      [0.157, 0.009],
      [0.149, 0.012],
      [0, 0.012],
    ],
    { name: "platter", color: brass, at: [0, 0.27, SPIN_Z], bone: "turntable", segments: b.segments(40) },
  );
  b.part(new THREE.CylinderGeometry(0.142, 0.142, 0.004, b.segments(48)), vinyl, {
    name: "record",
    at: [0, 0.284, SPIN_Z],
    bone: "turntable",
  });
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.0016, b.segments(40)), label, {
    name: "label",
    at: [0, 0.2868, SPIN_Z],
    bone: "turntable",
  });
  b.part(new THREE.CylinderGeometry(0.0055, 0.0055, 0.026, 12), brass, {
    name: "spindle",
    at: [0, 0.295, SPIN_Z],
    bone: "turntable",
  });
  b.part(new THREE.SphereGeometry(0.0075, 12, 8), brass, {
    name: "spindleCap",
    at: [0, 0.309, SPIN_Z],
    bone: "turntable",
  });

  // The horn: a slim neck out of the back of the cabinet, bending forward into a flaring lobed bell.
  b.sweep(
    catmull([
      [0, 0.2, -0.165],
      [0, 0.31, -0.162],
      [0, 0.44, -0.118],
      [0, 0.55, -0.025],
      [0, 0.63, 0.085],
      [0, 0.7, 0.2],
    ]),
    bell,
    { name: "horn", color: brass, bone: "horn", caps: { start: "round", end: "none" } },
  );
  b.lathe(
    [
      [0, 0],
      [0.028, 0],
      [0.03, 0.005],
      [0.03, 0.009],
      [0.02, 0.014],
      [0.017, 0.022],
      [0, 0.024],
    ],
    { name: "collar", color: brass, at: [0, 0.27, -0.165], bone: "base", segments: b.segments(24) },
  );

  // Silver tonearm: a pivot post, a tapered arm curving onto the record, a headshell and a needle.
  b.part(new THREE.CylinderGeometry(0.011, 0.013, 0.05, b.segments(14)), steel, {
    name: "armPost",
    at: [0.15, 0.295, -0.1],
    bone: "tonearm",
  });
  b.sweep(
    catmull([
      [0.15, 0.318, -0.1],
      [0.14, 0.338, -0.046],
      [0.106, 0.326, 0.014],
      [0.086, 0.304, 0.062],
    ]),
    (t) => 0.0065 - 0.0025 * t,
    { name: "tonearm", color: steel, bone: "tonearm" },
  );
  b.part(new THREE.BoxGeometry(0.016, 0.01, 0.03), steel, {
    name: "headshell",
    at: [0.086, 0.304, 0.062],
    dir: [-0.02, -0.022, 0.048],
    axis: "z",
    bone: "tonearm",
  });
  b.spike([0.086, 0.301, 0.062], [0, -1, 0], 0.0148, 0.0013, {
    name: "needle",
    color: "#202025",
    bone: "tonearm",
  });

  // Wind-up crank on the side: a brass hub, a bent arm and a walnut knob.
  b.part(new THREE.CylinderGeometry(0.013, 0.013, 0.02, b.segments(14)), brass, {
    name: "crankHub",
    at: [0.238, 0.14, 0],
    dir: [1, 0, 0],
    bone: "crank",
  });
  b.sweep(
    [
      [0.248, 0.14, 0],
      [0.272, 0.14, 0],
      [0.282, 0.114, 0],
    ],
    0.0045,
    { name: "crankArm", color: brass, bone: "crank" },
  );
  b.part(new THREE.SphereGeometry(0.0135, b.segments(14), b.segments(10)), walnut, {
    name: "crankKnob",
    at: [0.283, 0.104, 0],
    bone: "crank",
  });

  const root = b.root;
  // The bell and the cabinet are single shells, and the open mouth shows the inside of the bell: draw both faces.
  root.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (mesh.isMesh) (mesh.material as THREE.Material).side = THREE.DoubleSide;
  });
  return root;
}
