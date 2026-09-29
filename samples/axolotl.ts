// Leucistic axolotl, 27 cm, sprawled flat in a rigging rest pose. One smooth-skinned tube runs from the base of the
// skull through the trunk to the tail tip, with body and tail sectors split at the hips; a broad flat head has a
// separate lower jaw closed in the axolotl smile. The tail fin is one membrane sheet from its dorsal to its ventral
// outline, skinned along the tail chain so it ripples joint by joint; a low dorsal ridge carries it forward over the
// back. Three gill stalks on each side are two-joint sprouts off the back of the head, fringed on both sides with
// extruded petal filaments that ride each stalk's joints. Thin legs come from `limb`, splayed out to the sides,
// ending in one-joint toes tipped with turned (lathe) toe pads. Lathes also make the eye sockets, nostrils and the
// cloaca.
import { SphereGeometry, Vector3 } from "three";
import { createBuilder } from "../src/builder";
import { limb } from "../src/ik";
import { offset } from "../src/math";
import type { V3 } from "../src/math";
import type { OutlinePoint } from "../src/outline";
import { bezier, catmull } from "../src/path";

export const meta = {
  name: "Axolotl",
  description:
    "A 27 cm leucistic axolotl: pink skin, three crimson feathery gill stalks per side, a finned tail that ripples along its joints and splayed little toes.",
  builtBy: "Claude Opus 5.5",
};

const SKIN = "#f5c6c6";
const BACK = "#eeb3b7";
const BELLY = "#fbe4de";
const FIN = "#f6c4c6";
const FIN_EDGE = "#e8939d";
const GILL = "#cf3f5a";
const FRINGE = "#ec5f78";
const FRINGE_LIGHT = "#f47d93";
const MOUTH = "#d9838e";
const TOE = "#e8959f";
const EYE = "#16111a";
const GLINT = "#6d5a78";
const GROOVE = "#e9a5ac";

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
  const b = createBuilder({ name: "axolotl" });

  // ---------------------------------------------------------------- trunk and tail
  // One continuous centreline runs from the base of the skull through the hips to the tail tip. The tail and trunk
  // keep their original sectors by sweeping the same path in two ranges, with no cap at their shared ring.
  const stations = [
    { at: [0, 0.019, -0.046], w: 0.024, h: 0.024 },
    { at: [0, 0.019, -0.03], w: 0.029, h: 0.026 },
    { at: [0, 0.019, -0.005], w: 0.032, h: 0.027 },
    { at: [0, 0.019, 0.02], w: 0.032, h: 0.026 },
    { at: [0, 0.019, 0.038], w: 0.029, h: 0.024 },
    { at: [0, 0.019, 0.053], w: 0.027, h: 0.022 },
  ] as const;
  const curve = catmull(stations.map((s) => s.at));
  const hipsT = curve.knots[1];
  const hips = b.joint("hips", { at: stations[1].at, role: "spine", group: "body" });
  const spine = b.chain("spine", curve.slice(hipsT, 1), {
    parent: hips,
    count: 4,
    names: ["spine1", "spine2", "chest", "neck"],
    role: "spine",
    group: "body",
  });
  const tailPath = catmull([
    [0, 0.019, -0.03],
    [0, 0.0195, -0.06],
    [0, 0.0205, -0.095],
    [0, 0.021, -0.125],
    [0, 0.0205, -0.152],
  ]);
  const tail = b.chain("tail", tailPath, { parent: hips, count: 8, role: "tail", group: "tail" });
  const wholePath = curve.slice(1, hipsT).concat(tailPath);
  const tailT = curve.slice(1, hipsT).length / wholePath.length;
  const bodyWidth = stations.map((s, i) => [curve.knots[i], s.w / 2] as const);
  const bodyHeight = stations.map((s, i) => [curve.knots[i], s.h / 2] as const);
  const tailRx: [number, number][] = [
    [0, 0.0125],
    [0.25, 0.0085],
    [0.5, 0.0055],
    [0.75, 0.0034],
    [1, 0.0014],
  ];
  const tailRy: [number, number][] = [
    [0, 0.0125],
    [0.25, 0.011],
    [0.5, 0.0085],
    [0.75, 0.006],
    [1, 0.0028],
  ];
  const tailTube = b.sweep(
    wholePath,
    (t) => {
      const tailLocalT = (t - tailT) / (1 - tailT);
      return [interp(tailRx, tailLocalT), interp(tailRy, tailLocalT)];
    },
    {
      bone: [spine, hips, tail],
      from: tailT,
      color: SKIN,
      sectors: [
        [-45, 45, BACK],
        [135, 225, BELLY],
      ],
      sides: 10,
      caps: { start: "none", end: "round" },
      group: "tail",
    },
  );
  const body = b.sweep(
    wholePath,
    (t) => {
      const bodyLocalT = t / tailT;
      const bodyT = hipsT + (1 - bodyLocalT) * (1 - hipsT);
      return [interp(bodyWidth, bodyT), interp(bodyHeight, bodyT)];
    },
    {
      bone: [spine, hips, tail],
      to: tailT,
      color: SKIN,
      sectors: [
        [-55, 55, BACK],
        [125, 235, BELLY],
      ],
      shift: (t) => {
        const bodyLocalT = t / tailT;
        return [0, -0.0015 * Math.sin(Math.PI * (hipsT + (1 - bodyLocalT) * (1 - hipsT)))];
      },
      sides: 12,
      caps: { start: "round", end: "none" },
      group: "body",
    },
  );

  // Tail fin: one sheet from the dorsal outline to the ventral one, through the tail, meeting in a point past the
  // tip. It follows the tail chain nearest to each cell, so it ripples with every tail joint.
  const tip = offset(tail.at(1).at, tail.at(1).axis, 0.012);
  const finSamples = 14;
  const dorsalH: [number, number][] = [
    [0, 0.003],
    [0.25, 0.0078],
    [0.55, 0.0095],
    [0.8, 0.0078],
    [1, 0.0042],
  ];
  const ventralH: [number, number][] = [
    [0, -0.001],
    [0.14, 0],
    [0.35, 0.0055],
    [0.65, 0.0072],
    [1, 0.004],
  ];
  const finEdge = (angle: number, heights: [number, number][], sign: number, inset: number) => {
    const pts: Vector3[] = [];
    for (let i = 0; i <= finSamples; i++) {
      const t = (i / finSamples) * 0.97;
      const tailSourceT = tailT + t * (1 - tailT);
      const p = tailTube.at(tailSourceT, angle, -0.0006).at;
      pts.push(p.add(new Vector3(0, sign * (interp(heights, t) - inset), 0)));
    }
    pts.push(offset(tip, tail.at(1).axis, -inset));
    return catmull(pts);
  };
  const dorsal = finEdge(0, dorsalH, 1, 0);
  const ventral = finEdge(180, ventralH, -1, 0);
  b.membrane(dorsal, ventral, { thickness: 0.0012, color: FIN, bone: tail, rows: 4, group: "tail", name: "tailFin" });
  // A deeper pink rim along both fin edges, skinned the same way as the fin so it never parts from it.
  for (const [edge, heights, sign] of [
    [dorsal, dorsalH, 1],
    [ventral, ventralH, -1],
  ] as const)
    b.membrane(edge, finEdge(sign > 0 ? 0 : 180, heights, sign, 0.0013), {
      thickness: 0.0017,
      color: FIN_EDGE,
      bone: tail,
      rows: 1,
      group: "tail",
      name: sign > 0 ? "tailFinRimTop" : "tailFinRimBottom",
    });

  // Dorsal ridge: the fin's low start over the back, from the shoulders to the hips.
  const ridgeBase: Vector3[] = [];
  const ridgeTop: Vector3[] = [];
  for (let i = 0; i <= 8; i++) {
    const z = 0.022 - (i / 8) * 0.06;
    const curveT = (z - stations[0].at[2]) / (stations[5].at[2] - stations[0].at[2]);
    const bodySourceT = (1 - (curveT - hipsT) / (1 - hipsT)) * tailT;
    const p = body.at(bodySourceT, 0, -0.0006).at;
    ridgeBase.push(p.clone());
    ridgeTop.push(p.add(new Vector3(0, 0.0032 * Math.pow(i / 8, 1.3), 0)));
  }
  b.membrane(catmull(ridgeBase), catmull(ridgeTop), {
    thickness: 0.0012,
    color: FIN,
    bone: spine,
    rows: 1,
    cols: 10,
    group: "body",
    name: "dorsalRidge",
  });

  // ---------------------------------------------------------------- head
  const skull = b.joint("head", {
    parent: spine.joints[3],
    at: curve.at(1),
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });
  const head = b.region({ at: skull });
  // Head-local (+Z forward, +Y up): z, centre y, full width, full height. Broad and flat, widest just ahead of the
  // gills, with a wide rounded snout.
  const upperKeys = [
    [-0.006, 0.002, 0.03, 0.021],
    [0.006, 0.003, 0.041, 0.021],
    [0.02, 0.002, 0.043, 0.019],
    [0.032, 0.0005, 0.038, 0.016],
    [0.041, -0.001, 0.029, 0.012],
  ] as const;
  const upper = b.loft(
    upperKeys.map(([z, y, w, h]) => ({ at: head.p([0, y, z]), w, h })),
    {
      bone: skull,
      color: SKIN,
      sectors: [
        [-60, 60, BACK],
        [150, 210, MOUTH],
      ],
      sides: 12,
      group: "head",
    },
  );
  const jaw = head.joint("jaw", {
    parent: skull,
    at: [0, -0.004, -0.002],
    aim: [0, -0.006, 0.04],
    role: "jaw",
    group: "jaw",
  });
  const lowerKeys = [
    [-0.004, -0.0065, 0.028, 0.012],
    [0.01, -0.0075, 0.037, 0.011],
    [0.025, -0.0075, 0.036, 0.01],
    [0.036, -0.0065, 0.028, 0.008],
  ] as const;
  b.loft(
    lowerKeys.map(([z, y, w, h]) => ({ at: head.p([0, y, z]), w, h })),
    {
      bone: jaw,
      color: SKIN,
      sectors: [
        [-45, 45, MOUTH],
        [120, 240, BELLY],
      ],
      sides: 10,
      group: "jaw",
    },
  );
  const headSkin = b.surface(upper);

  // The smile: a lip line draped along each side of the upper head where it meets the jaw.
  for (const s of [1, -1]) {
    const lip = headSkin.drape(
      catmull([
        head.p([s * 0.012, -0.004, 0.045]),
        head.p([s * 0.02, -0.004, 0.03]),
        head.p([s * 0.022, -0.003, 0.014]),
        head.p([s * 0.02, -0.0015, 0.004]),
      ]),
      { lift: 0.0002 },
    );
    b.sweep(lip, 0.0005, { bone: skull, color: MOUTH, sides: 6, group: "head" });
  }

  // Eyes: small, dark and lidless, set wide on top of the head, each in a turned pink socket ring.
  for (const s of [1, -1]) {
    const hit = headSkin.ray(head.p([s * 0.05, 0.012, 0.027]), head.d([-s, -0.35, 0]));
    if (!hit) continue;
    const gaze = hit.n.clone();
    const eye = offset(hit.at, gaze, -0.0006);
    b.part(new SphereGeometry(0.0022, 8, 5), EYE, { bone: skull, at: eye, group: "head" });
    b.part(new SphereGeometry(0.0006, 4, 3), GLINT, {
      bone: skull,
      at: offset(offset(eye, gaze, 0.0019), [0, 1, 0.4], 0.0008),
      group: "head",
    });
    b.lathe(
      [
        [0.0021, -0.0008],
        [0.0031, -0.0008],
        [0.0033, 0.0002],
        [0.0026, 0.0009],
        [0.0021, 0.0004],
      ],
      { at: hit, axis: gaze, segments: 8, color: SKIN, bone: skull, group: "head" },
    );
    // Nostrils near the front of the snout.
    const nose = headSkin.ray(head.p([s * 0.008, 0.03, 0.037]), head.d([0, -1, 0]));
    if (nose)
      b.lathe(
        [
          [0, -0.0003, "sharp"],
          [0.0007, -0.0003],
          [0.0005, 0.0003],
          [0, 0.00035, "sharp"],
        ],
        { at: nose, axis: nose, segments: 6, color: MOUTH, bone: skull, group: "head" },
      );
  }

  // ---------------------------------------------------------------- gills
  // Three stalks per side from the back corner of the head: the upper one rises and sweeps back, the lower one
  // splays out and down. Each stalk is fringed on both edges with petal filaments that ride its joints.
  const gills = [
    { y: 0.007, z: 0.0, dir: [0.45, 0.8, -0.5] as [number, number, number], len: 0.04 },
    { y: 0.001, z: -0.002, dir: [0.85, 0.3, -0.55] as [number, number, number], len: 0.037 },
    { y: -0.005, z: -0.001, dir: [0.85, -0.25, -0.5] as [number, number, number], len: 0.031 },
  ];
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    gills.forEach((g, gi) => {
      const root = headSkin.ray(head.p([s * 0.05, g.y, g.z]), head.d([-s, 0, 0]));
      if (!root) return;
      const d = new Vector3(s * g.dir[0], g.dir[1], g.dir[2]).normalize();
      const p0 = root.at.clone();
      const p1 = offset(p0, d, g.len * 0.55);
      const p2 = offset(offset(p0, d, g.len), [0, 0, -1], g.len * 0.25);
      const { chain } = b.sprout(`gill${side}${gi + 1}`, root, bezier(p0, p1, p2), [0.0026, 0.001], {
        count: 2,
        names: [`gill${side}${gi + 1}a`, `gill${side}${gi + 1}b`],
        role: "tentacle",
        color: GILL,
        sides: 6,
        group: `gills${side}`,
      });
      if (!chain) return;
      // Filaments: both edges of the stalk in one feather plane that faces out to the side.
      const count = 12;
      for (let i = 0; i < count; i++) {
        const t = 0.16 + (i / (count - 1)) * 0.8;
        const f = chain.at(t);
        const T = f.axis.clone();
        const N = new Vector3(s, 0.15, 0).addScaledVector(T, -T.dot(new Vector3(s, 0.15, 0))).normalize();
        const U = T.clone().cross(N).normalize();
        const L = 0.011 * (1 - 0.45 * t) + 0.0015;
        for (const row of [1, -1]) {
          const fluff = (i % 2 === 0 ? 1 : -1) * row * 0.45;
          const dir = U.clone().multiplyScalar(row).addScaledVector(T, 0.55).addScaledVector(N, fluff).normalize();
          const y = T.clone().addScaledVector(dir, -T.dot(dir)).normalize();
          const w = 0.0013;
          b.extrude(
            [
              [0, -w / 2, "sharp"],
              [0.45 * L, -w / 2],
              [L, 0],
              [0.45 * L, w / 2],
              [0, w / 2, "sharp"],
            ],
            {
              at: f,
              x: dir,
              y,
              thickness: 0.0006,
              smoothing: 1,
              color: i % 2 === 0 ? FRINGE : FRINGE_LIGHT,
              group: `gills${side}`,
            },
          );
        }
      }
    });
  }

  // ---------------------------------------------------------------- legs
  // Thin legs splayed straight out to the sides, knees and elbows raised, hands and feet flat on the floor with
  // fanned toes.
  const toeR = 0.0011;
  const pad: OutlinePoint[] = [
    [0, 0, "sharp"],
    [0.0014, 0],
    [0.0016, 0.001],
    [0.001, 0.0021],
    [0, 0.0024, "sharp"],
  ];
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const legs = [
      {
        key: "F",
        parent: spine.joints[2],
        root: [s * 0.011, 0.016, 0.034] as V3,
        wrist: [s * 0.036, 0.0042, 0.043] as V3,
        lengths: [0.016, 0.0145],
        bend: [s * 0.2, 1, -0.3] as V3,
        palm: [s * 0.55, -0.3, 0.75] as V3,
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
        toes: [0.0065, 0.008, 0.0078, 0.006],
        spread: [-48, -16, 16, 48],
      },
      {
        key: "H",
        parent: hips,
        root: [s * 0.012, 0.015, -0.028] as V3,
        wrist: [s * 0.039, 0.0042, -0.034] as V3,
        lengths: [0.017, 0.0155],
        bend: [s * 0.2, 1, 0.3] as V3,
        palm: [s * 0.75, -0.3, 0.45] as V3,
        names: [`hip${side}`, `knee${side}`, `ankle${side}`],
        toes: [0.006, 0.008, 0.0088, 0.008, 0.0062],
        spread: [-58, -29, 0, 29, 58],
      },
    ];
    for (const leg of legs) {
      const points = limb(leg.root, leg.wrist, leg.lengths, [leg.bend]);
      const w = points[points.length - 1];
      const palmDir = new Vector3(...leg.palm).normalize();
      const palmEnd = offset(w, palmDir, 0.0065);
      const group = `leg${leg.key}${side}`;
      const chain = b.chain(`leg${leg.key}${side}`, [...points, palmEnd], {
        parent: leg.parent,
        names: leg.names,
        role: "leg",
        contact: [palmEnd.x, 0, palmEnd.z],
        group,
      });
      const ts = chain.ts;
      const rx: [number, number][] = [
        [0, 0.0048],
        [ts[1], 0.0031],
        [ts[2], 0.0026],
        [1, 0.0036],
      ];
      const ry: [number, number][] = [
        [0, 0.0048],
        [ts[1], 0.003],
        [ts[2], 0.0024],
        [1, 0.0016],
      ];
      b.sweep(chain, (t) => [interp(rx, t), interp(ry, t)], { color: SKIN, sides: 7, group });

      // Toes: one-joint chains fanned around the hand's heading, lying on the floor, tipped with a turned pad.
      const fwd = palmDir.clone().setY(0).normalize();
      leg.toes.forEach((len, i) => {
        const dir = fwd.clone().applyAxisAngle(new Vector3(0, 1, 0), (s * leg.spread[i] * Math.PI) / 180);
        const base = offset(palmEnd, dir, -0.0015);
        base.y = toeR + 0.0004;
        const end = offset(base, dir, len);
        end.y = toeR;
        const toeName = `${leg.key === "F" ? "finger" : "toe"}${side}${i + 1}`;
        const toe = b.chain(toeName, [base, end], {
          parent: chain.joints[2],
          names: [toeName],
          role: "digit",
          group,
        });
        b.sweep(toe, [toeR * 1.1, toeR * 0.85], { color: SKIN, sides: 5, group });
        b.lathe(pad, {
          at: [end.x, 0, end.z],
          segments: 6,
          color: TOE,
          bone: toe.joints[0],
          group,
        });
      });
    }
  }

  // ---------------------------------------------------------------- skin details
  // Costal grooves: shallow vertical creases down each flank between the legs.
  const trunk = b.surface(body);
  for (const s of [1, -1])
    for (let i = 0; i < 9; i++) {
      const z = 0.026 - i * 0.0063;
      const groove = trunk.drape(
        catmull([
          [s * 0.02, 0.026, z],
          [s * 0.022, 0.019, z],
          [s * 0.02, 0.011, z],
        ]),
        { lift: 0.0001 },
      );
      b.sweep(groove, 0.00045, { color: GROOVE, sides: 6, group: "body" });
    }

  // Cloaca: a small turned mound under the base of the tail.
  const vent = b.surface([body, tailTube]).ray([0, -0.02, -0.042], [0, 1, 0]);
  if (vent)
    b.lathe(
      [
        [0, -0.001, "sharp"],
        [0.0034, -0.001],
        [0.0026, 0.0008],
        [0, 0.0014, "sharp"],
      ],
      { at: vent, axis: vent, segments: 8, color: GROOVE, group: "body" },
    );

  return b.root;
}
