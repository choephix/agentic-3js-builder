// Veiled chameleon, a 0.5 m adult male, standing on four gripping feet. One continuous tapered tube runs from the
// tail tip through the hips and up the spine to a short neck; the prehensile tail rolls down into a tight ventral coil.
// The head's signature is the casque: an extruded side-view helmet, thick at its root and knife-thin at its crest, with
// a lighter inset core, ridged cranial crests and a sawtooth gular crest hanging under the chin. Serrated dorsal crest
// teeth are small extrudes seated on that continuous skin along the spine and tail.
// The conical eye turrets, the pupils' tiny apertures, the flank spots and the claws are lathes. Each foot splits
// into two opposed toe bundles (3 + 2 in front, 2 + 3 behind), each a two-joint chain ending in separate clawed toes.
import { SphereGeometry, Vector3 } from "three";
import { createBuilder } from "../src/builder";
import { limb } from "../src/ik";
import { aim, offset, rng } from "../src/math";
import type { V3 } from "../src/math";
import type { OutlinePoint } from "../src/outline";
import { bezier, catmull, spiral } from "../src/path";
import type { Sweep } from "../src/sweep";

export const meta = {
  name: "Veiled Chameleon",
  description:
    "A veiled chameleon on four gripping feet: a towering extruded casque, turned conical eye turrets, a serrated dorsal crest, banded flanks and a tightly curled prehensile tail.",
  builtBy: "Claude Opus 5.5",
};

const GREEN = "#3f9b3c";
const DEEP = "#2a6f35";
const LIME = "#9fcf45";
const YELLOW = "#f0c93a";
const ORANGE = "#e3862f";
const TEAL = "#2d9c93";
const BELLY = "#cfe39a";
const STRIPE = "#eef2cf";
const MOUTH = "#d9868c";
const TONGUE = "#e0707f";
const CREST = "#f4efcf";
const PUPIL = "#111512";
const CLAW = "#3a3128";

/** Piecewise-linear lookup through sorted `[x, y]` keys. */
function interp(keys: readonly (readonly [number, number])[], x: number) {
  if (x <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [x1, y1] = keys[i];
    if (x <= x1) {
      const [x0, y0] = keys[i - 1];
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
  }
  return keys[keys.length - 1][1];
}

export default function build() {
  const b = createBuilder({ name: "veiledChameleon" });
  const random = rng(23);
  // A small turned skin granule, for the casque and the legs.
  const granule: OutlinePoint[] = [
    [0, -0.0015, "sharp"],
    [0.003, -0.0015, "sharp"],
    [0.0026, 0.0008],
    [0, 0.0015, "sharp"],
  ];

  // ---------------------------------------------------------------- trunk, neck and tail
  // One continuous curve runs from the tail tip through the hips to the base of the skull. The body is deep and
  // narrow, highest over the middle of the back; the tail tapers through its ventral coil.
  const stations = [
    { at: [0, 0.142, -0.1], w: 0.036, h: 0.06 },
    { at: [0, 0.146, -0.075], w: 0.05, h: 0.088 },
    { at: [0, 0.144, -0.022], w: 0.06, h: 0.126 },
    { at: [0, 0.142, 0.032], w: 0.058, h: 0.12 },
    { at: [0, 0.146, 0.078], w: 0.046, h: 0.086 },
    { at: [0, 0.157, 0.108], w: 0.036, h: 0.058 },
    { at: [0, 0.166, 0.128], w: 0.032, h: 0.05 },
  ] as const;
  const curve = catmull(stations.map((s) => s.at));
  const hips = b.joint("hips", { at: stations[1].at, role: "spine", group: "body" });
  const spine = b.chain("spine", curve.slice(curve.knots[1], 1), {
    parent: hips,
    count: 4,
    names: ["spine1", "spine2", "chest", "neck"],
    role: "spine",
    group: "body",
  });
  const coilCentre: V3 = [0, 0.084, -0.19];
  const coilStart: V3 = [0, 0.136, -0.19];
  const tailPath = catmull([stations[1].at, [0, 0.144, -0.11], [0, 0.139, -0.155], coilStart]).concat(
    spiral(coilCentre, coilStart, [-1, 0, 0], { turns: 1.35, r1: 0.012 }),
  );
  const tail = b.chain("tail", tailPath, { parent: hips, count: 14, role: "tail", group: "tail" });
  const fullPath = tailPath.slice(1, 0).concat(curve.slice(curve.knots[1], 1));
  const tailT = tailPath.length / fullPath.length;
  const tailRx: [number, number][] = [
    [0, 0.022],
    [0.08, 0.017],
    [0.3, 0.012],
    [0.65, 0.008],
    [1, 0.0035],
  ];
  const tailRy: [number, number][] = [
    [0, 0.036],
    [0.08, 0.026],
    [0.3, 0.015],
    [0.65, 0.009],
    [1, 0.0035],
  ];
  const bars = [0.24, 0.44, 0.64];
  const bodyColor = (t: number) => {
    const bodyT = (t - tailT) / (1 - tailT);
    for (const c of bars) {
      const d = Math.abs(bodyT - c);
      if (d < 0.035) return YELLOW;
      if (d < 0.05) return ORANGE;
    }
    return GREEN;
  };
  const radiusAt = (t: number): [number, number] => {
    if (t <= tailT) {
      const u = 1 - t / tailT;
      return [interp(tailRx, u), interp(tailRy, u)];
    }
    const u = (t - tailT) / (1 - tailT);
    return [
      interp(
        stations.map((s, i) => [i / (stations.length - 1), s.w / 2]),
        u,
      ),
      interp(
        stations.map((s, i) => [i / (stations.length - 1), s.h / 2]),
        u,
      ),
    ];
  };
  const colorAt = (t: number) => {
    if (t < tailT) {
      const u = 1 - t / tailT;
      return u > 0.08 && u < 0.8 && ((u - 0.08) / 0.09) % 1 > 0.62 ? LIME : GREEN;
    }
    return bodyColor(t);
  };
  // One curve and one bone list, swept in two ranges: the tail keeps only its belly sector, the body its lateral
  // stripes. The rings at the cut coincide and share weights, so there is no seam.
  const bone = [tail, hips, spine];
  const tailTube = b.sweep(fullPath, radiusAt, {
    bone,
    from: 0,
    to: tailT,
    color: colorAt,
    sectors: [[135, 225, BELLY]],
    caps: { end: "none" },
    sides: 10,
    group: "tail",
  });
  const bodyTube = b.sweep(fullPath, radiusAt, {
    bone,
    from: tailT,
    to: 1,
    color: colorAt,
    sectors: [
      [120, 132, STRIPE],
      [132, 228, BELLY],
      [228, 240, STRIPE],
    ],
    caps: { start: "none" },
    sides: 12,
    group: "body",
  });

  // ---------------------------------------------------------------- head
  const headDir: V3 = [0, -0.12, 1];
  const skull = b.joint("head", {
    parent: spine.joints[3],
    at: curve.at(1),
    dir: headDir,
    role: "head",
    group: "head",
  });
  const head = b.region({ at: skull, quat: aim(headDir, [0, 1, 0], "z") });
  // Head-local (+Z forward, +Y up): z, centre y, full width, full height. Deep behind the eyes, tapering to a
  // blunt snout.
  const upperKeys = [
    [-0.012, 0.004, 0.034, 0.044],
    [0.014, 0.006, 0.04, 0.046],
    [0.038, 0.002, 0.034, 0.034],
    [0.058, -0.003, 0.024, 0.024],
    [0.072, -0.006, 0.015, 0.015],
  ] as const;
  b.loft(
    upperKeys.map(([z, y, w, h]) => ({ at: head.p([0, y, z]), w, h })),
    { bone: skull, color: GREEN, sectors: [[135, 225, MOUTH]], sides: 12, group: "head" },
  );
  const jaw = head.joint("jaw", {
    parent: skull,
    at: [0, -0.012, -0.004],
    aim: [0, -0.02, 0.07],
    role: "jaw",
    group: "jaw",
  });
  const lowerKeys = [
    [-0.006, -0.021, 0.032, 0.02],
    [0.028, -0.022, 0.03, 0.017],
    [0.056, -0.018, 0.019, 0.011],
    [0.068, -0.015, 0.012, 0.008],
  ] as const;
  b.loft(
    lowerKeys.map(([z, y, w, h]) => ({ at: head.p([0, y, z]), w, h })),
    {
      bone: jaw,
      color: GREEN,
      sectors: [
        [-45, 45, MOUTH],
        [130, 230, LIME],
      ],
      sides: 10,
      group: "jaw",
    },
  );
  // The tongue's sticky tip rests in the floor of the mouth.
  b.capsule(head.p([0, -0.018, 0.008]), head.p([0, -0.017, 0.046]), [0.005, 0.0035], {
    bone: jaw,
    color: TONGUE,
    group: "jaw",
  });

  // Gular crest: a row of pale sawteeth hanging under the chin and throat.
  const gular: OutlinePoint[] = [[0.062, -0.018, "sharp"]];
  for (let i = 0; i < 8; i++) {
    const z = 0.056 - i * 0.0085;
    gular.push([z, -0.0355 - 0.0006 * i, "sharp"], [z - 0.0045, -0.029, "sharp"]);
  }
  gular.push([-0.012, -0.03, "sharp"], [-0.012, -0.018, "sharp"]);
  b.extrude(gular, {
    at: head.p([0, 0, 0]),
    x: head.d([0, 0, 1]),
    y: head.d([0, 1, 0]),
    thickness: 0.004,
    bevel: 0.001,
    detail: 0.34,
    color: CREST,
    bone: jaw,
    group: "jaw",
  });

  // Casque: a side-view helmet rising behind the eyes, thick where it roots in the skull and knife-thin at the crest.
  const casqueLow = -0.012;
  const casqueHigh = 0.09;
  const casqueOutline: OutlinePoint[] = [
    [0.046, 0.008, "sharp"],
    [-0.034, casqueLow, "sharp"],
    [-0.044, 0.026],
    [-0.04, 0.066],
    [-0.022, casqueHigh],
    [-0.004, 0.08],
    [0.022, 0.05],
    [0.04, 0.024],
  ];
  const casqueT: [number, number] = [0.036, 0.005];
  const casque = b.extrude(casqueOutline, {
    at: head.p([0, 0, 0]),
    x: head.d([0, 0, 1]),
    y: head.d([0, 1, 0]),
    thickness: casqueT,
    bevel: 0.002,
    smoothing: 1,
    detail: 0.67,
    color: DEEP,
    bone: skull,
    group: "head",
  });
  const halfT = (v: number) =>
    (casqueT[0] + ((casqueT[1] - casqueT[0]) * (v - casqueLow)) / (casqueHigh - casqueLow)) / 2;
  // Inset core in the body green, standing a hair proud of both faces, framed by the dark rim.
  const e = 0.0012;
  const inner = casqueOutline.map(([u, v, sharp]): OutlinePoint => {
    const p: [number, number] = [-0.004 + (u + 0.004) * 0.8, casqueLow + (v - casqueLow) * 0.8];
    return sharp ? [...p, sharp] : p;
  });
  b.extrude(inner, {
    at: head.p([0, 0, 0]),
    x: head.d([0, 0, 1]),
    y: head.d([0, 1, 0]),
    thickness: [casqueT[0] + 2 * e, casqueT[0] + 0.8 * (casqueT[1] - casqueT[0]) + 2 * e],
    bevel: 0.0015,
    smoothing: 1,
    detail: 0.34,
    color: GREEN,
    bone: skull,
    group: "head",
  });
  // Cranial crests: pale ridges sweeping from above each eye up the casque's flank, drawn on its face.
  for (const s of [1, -1]) {
    const face = (u: number, v: number) => casque.local([u, v, s * (halfT(v) + e)]);
    b.sweep(
      catmull([face(0.03, 0.02), face(0.008, 0.036), face(-0.012, 0.058), face(-0.022, 0.078)]),
      [0.0022, 0.0012],
      {
        bone: skull,
        color: LIME,
        sides: 5,
        group: "head",
      },
    );
    // Turquoise granules scattered over the casque's flank behind the crest.
    for (const [u, v] of [
      [-0.004, 0.026],
      [-0.017, 0.028],
      [-0.029, 0.034],
      [-0.022, 0.045],
      [-0.031, 0.055],
      [-0.011, 0.04],
      [0.012, 0.016],
    ])
      b.lathe(granule, {
        at: face(u, v),
        axis: casque.dir([0, 0, s]),
        segments: 6,
        smoothing: 1,
        color: TEAL,
        bone: skull,
      });
  }

  // Eye turrets: a turned cone of scaly lid around a pinhole pupil, each on its own joint so the eyes swivel.
  const turret: OutlinePoint[] = [
    [0, -0.005, "sharp"],
    [0.0125, -0.005, "sharp"],
    [0.0132, 0.002],
    [0.0105, 0.009],
    [0.0045, 0.0135],
    [0.0028, 0.0138, "sharp"],
    [0, 0.0122, "sharp"],
  ];
  const band: OutlinePoint[] = [
    [0.0112, -0.002],
    [0.0138, -0.001],
    [0.0138, 0.004],
    [0.0112, 0.005],
  ];
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const gaze = head.d([s, 0.25, 0.35]).normalize();
    const base = head.p([s * 0.013, 0.01, 0.03]);
    const eye = b.joint(`eye${side}`, { parent: skull, at: base, dir: gaze, group: "head" });
    b.lathe(turret, { at: eye, axis: gaze, segments: 10, smoothing: 1, color: GREEN, bone: eye, group: "head" });
    b.lathe(band, { at: eye, axis: gaze, segments: 10, color: YELLOW, bone: eye, group: "head" });
    b.part(new SphereGeometry(0.0032, 6, 4), PUPIL, { bone: eye, at: offset(base, gaze, 0.0122), group: "head" });
    // Nostril on the snout's flank.
    b.part(new SphereGeometry(0.5, 5, 4), PUPIL, {
      bone: skull,
      at: head.p([s * 0.0075, 0.001, 0.069]),
      dir: head.d([s * 0.4, 0, 1]),
      axis: "z",
      scale: [0.0022, 0.0018, 0.003],
      group: "head",
    });
  }

  // ---------------------------------------------------------------- legs and gripping feet
  const claw: OutlinePoint[] = [
    [0, 0, "sharp"],
    [0.002, 0, "sharp"],
    [0.0014, 0.0048],
    [0, 0.009, "sharp"],
  ];
  const legTubes: Sweep[] = [];
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const legs = [
      {
        kind: "F",
        parent: spine.joints[2],
        root: [s * 0.02, 0.122, 0.072] as V3,
        wrist: [s * 0.056, 0.03, 0.098] as V3,
        bend: [s * 0.45, 0, -1] as V3,
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
        digit: "fingers",
        // Front feet: the three-toed bundle is the inner one.
        bundles: [
          { tag: "In", toes: 3, dir: [-s * 0.55, 0, 1] as V3 },
          { tag: "Out", toes: 2, dir: [s * 0.9, 0, -0.35] as V3 },
        ],
      },
      {
        kind: "H",
        parent: hips,
        root: [s * 0.02, 0.126, -0.07] as V3,
        wrist: [s * 0.06, 0.03, -0.094] as V3,
        bend: [s * 0.45, 0, 1] as V3,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`],
        digit: "toes",
        // Hind feet: the three-toed bundle is the outer one.
        bundles: [
          { tag: "In", toes: 2, dir: [-s * 0.45, 0, 1] as V3 },
          { tag: "Out", toes: 3, dir: [s * 0.9, 0, -0.45] as V3 },
        ],
      },
    ];
    for (const leg of legs) {
      const group = `leg${leg.kind}${side}`;
      const [root, elbow, wrist] = limb(leg.root, leg.wrist, [0.06, 0.058], [leg.bend]);
      const palm = new Vector3(wrist.x + s * 0.002, 0.016, wrist.z);
      const chain = b.chain(`leg${leg.kind}${side}`, [root, elbow, wrist, palm], {
        parent: leg.parent,
        names: leg.names,
        role: "leg",
        contact: [palm.x, 0, palm.z],
        group,
      });
      const [, t1, t2] = chain.ts;
      const rx: [number, number][] = [
        [0, 0.017],
        [t1, 0.0125],
        [t2, 0.009],
        [1, 0.0095],
      ];
      const ry: [number, number][] = [
        [0, 0.019],
        [t1, 0.013],
        [t2, 0.0092],
        [1, 0.0095],
      ];
      legTubes.push(
        b.sweep(chain, (t) => [interp(rx, t), interp(ry, t)], {
          color: GREEN,
          sectors: [[120, 240, LIME]],
          sides: 9,
          group,
        }),
      );
      // The male's tarsal spur on the back of each heel.
      if (leg.kind === "H")
        b.lathe(
          [
            [0, 0, "sharp"],
            [0.003, 0, "sharp"],
            [0.002, 0.004],
            [0, 0.008, "sharp"],
          ],
          {
            at: offset(wrist, [0, 0, -1], 0.006),
            axis: [0, -0.3, -1],
            segments: 6,
            color: CREST,
            bone: chain.joints[2],
            group,
          },
        );

      // Two opposed toe bundles per foot, each fused to near the tip, then separate clawed toes.
      for (const bundle of leg.bundles) {
        const d = new Vector3(...bundle.dir).normalize();
        const across = new Vector3(d.z, 0, -d.x);
        const mid = offset(offset(palm, d, 0.02), [0, -1, 0], 0.004);
        const end = offset(offset(palm, d, 0.035), [0, -1, 0], 0.0075);
        const name = `${leg.digit}${bundle.tag}${side}`;
        const digits = b.chain(name, bezier(palm, mid, end), {
          parent: chain.joints[2],
          count: 2,
          names: [`${name}1`, `${name}2`],
          role: "digit",
          group,
        });
        const fused = b.sweep(digits, (t) => [0.0082 + 0.0009 * bundle.toes - 0.0032 * t, 0.0072 - 0.0024 * t], {
          color: GREEN,
          sectors: [[120, 240, LIME]],
          sides: 7,
          group,
        });
        legTubes.push(fused);
        for (let i = 0; i < bundle.toes; i++) {
          const k = i - (bundle.toes - 1) / 2;
          const toeDir = d.clone().applyAxisAngle(new Vector3(0, 1, 0), k * 0.32);
          const from = offset(digits.at(0.7).at, across, k * 0.005);
          // Toe tips curl down so the claws just touch the floor.
          const tip = offset(from, toeDir, 0.014).setY(0.0053);
          b.capsule(from, tip, [0.0038, 0.003], { bone: digits.joints[1], color: GREEN, sides: 6, group });
          b.lathe(claw, {
            at: tip,
            axis: toeDir.clone().setY(-0.7),
            segments: 5,
            color: CLAW,
            bone: digits.joints[1],
            group,
          });
        }
      }
    }
  }

  // ---------------------------------------------------------------- dorsal crest
  // Backward-leaning sawteeth down the ridge of the back, largest over the shoulders, fading onto the tail. The
  // outline's +x runs toward the tail on the tail section and against the body section's tangent on the spine.
  const crestAt = (tube: Sweep, back: number, t: number, h: number, l: number, group: string) => {
    const p = tube.at(t, 0);
    b.extrude(
      [
        [-l * 0.6, -0.004, "sharp"],
        [l * 0.6, -0.004, "sharp"],
        [l * 0.7, 0.0, "sharp"],
        [l * 0.45, h, "sharp"],
        [-l * 0.45, 0.0, "sharp"],
      ],
      {
        at: p,
        x: p.tangent.clone().multiplyScalar(back),
        y: p.n,
        thickness: [0.003, 0.001],
        bevel: 0.0005,
        detail: 0.34,
        color: CREST,
        group,
      },
    );
  };
  for (let i = 0; i < 14; i++) {
    crestAt(tailTube, 1, (1 - (0.02 + i * 0.03)) * tailT, 0.0055 - i * 0.0005, 0.0065, "tail");
  }
  for (let i = 0; i < 12; i++) {
    const u = 0.15 + i * 0.065;
    const k = Math.sin(Math.PI * (0.15 + 0.8 * u));
    crestAt(bodyTube, -1, tailT + u * (1 - tailT), 0.004 + 0.006 * k, 0.006 + 0.002 * k, "body");
  }

  // ---------------------------------------------------------------- skin details
  // Turquoise and orange spots between the bars, and pale tubercles on the legs: each a small turned dome.
  const dome: OutlinePoint[] = [
    [0, -0.002, "sharp"],
    [0.0045, -0.002, "sharp"],
    [0.004, 0.0012],
    [0, 0.0022, "sharp"],
  ];
  const trunk = b.surface(bodyTube);
  for (const hit of trunk.scatter(34, {
    rng: random,
    minDist: 0.012,
    filter: (h) => Math.abs(h.n.y) < 0.55 && h.at.z > -0.07 && h.at.z < 0.085,
  }))
    b.lathe(dome, {
      at: hit,
      axis: hit,
      segments: 6,
      smoothing: 1,
      color: random() < 0.6 ? TEAL : ORANGE,
      group: "body",
    });
  for (const hit of b.surface(legTubes).scatter(22, { rng: random, minDist: 0.012, filter: (h) => h.n.y > 0.1 }))
    b.lathe(granule, { at: hit, axis: hit, segments: 6, smoothing: 1, color: LIME });

  // Rest pose: the jaw a little open.
  b.pose(jaw, { axis: head.d([1, 0, 0]), deg: 10 });
  return b.root;
}
