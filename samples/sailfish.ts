// Indo-Pacific sailfish (Istiophorus platypterus), 1.8 m from bill tip to tail tips.
// A swimming rest pose flattened straight: the body chain runs level from the neck to the tail fork, the sail is
// raised to full height and every fin is spread. The sail is extruded in one piece per spine bone, split on its
// fin rays so it bends with the body; the pectoral, pelvic, anal, second dorsal and lunate caudal fins, and the
// peduncle keels, are extrudes too. The eyes (orbit, iris, lens) and the gill covers are turned lathe profiles.
import { CylinderGeometry, SphereGeometry } from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { DEG, rng, vec } from "../src/math";
import type { V3 } from "../src/math";
import type { OutlinePoint } from "../src/outline";
import type { Part } from "../src/parts";
import { catmull, polyline } from "../src/path";
import type { Joint } from "../src/skeleton";

export const meta = {
  name: "Sailfish",
  description:
    "A 1.8 m sailfish in a straight swimming rest pose: a towering spotted sail on fin rays that bends with the spine, a spear bill over a separate lower jaw, barred countershaded flanks, ribbon pelvic fins and a lunate forked tail.",
};

const DORSAL = "#10214a";
const MIDBLUE = "#2a66c8";
const FLANK = "#7394bd";
const BAR = "#c4def7";
const BELLY = "#e6ebf0";
const JAW = "#a9b7c8";
const SAIL = "#2150a8";
const RAY = "#0c1a3d";
const SPOT = "#08112b";
const FIN = "#172b5c";
const BILL = "#161d2e";
const BILL_UNDER = "#4a5670";
const ORBIT = "#223050";
const IRIS = "#cdb46a";
const LENS = "#06080d";
const GLINT = "#f4f8ff";
const OPERCLE = "#8faac8";
const GILL = "#0b1328";

/** Piecewise cosine interpolation through `[x, y]` keys sorted by x. */
function curve(keys: readonly (readonly [number, number])[]) {
  return (x: number) => {
    if (x <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [x1, y1] = keys[i];
      if (x <= x1) {
        const [x0, y0] = keys[i - 1];
        const u = (1 - Math.cos((Math.PI * (x - x0)) / (x1 - x0))) / 2;
        return y0 + (y1 - y0) * u;
      }
    }
    return keys[keys.length - 1][1];
  };
}

export default function build() {
  const b = createBuilder({ name: "sailfish" });
  const random = rng(11);

  // ---------------------------------------------------------------- Skeleton
  // The spine axis runs level at Y0; z = 0.36 is the neck, the bill reaches z = 0.93, the tail tips z = -0.8.
  const Y0 = 0.3;
  const NECK_Z = 0.36;
  const TAIL_END_Z = -0.66;
  const jointZ = [NECK_Z, 0.2, 0.03, -0.15, -0.31, -0.46, -0.56];
  const root = b.joint("root", { at: [0, Y0, NECK_Z], role: "spine", group: "body" });
  const spine = b.chain("spine", polyline([...jointZ, TAIL_END_Z].map((z): V3 => [0, Y0, z])), {
    parent: root,
    names: ["spine1", "spine2", "spine3", "tail1", "tail2", "tail3", "caudal"],
    role: "spine",
    group: "body",
  });
  const [spine1, , , tail1, , tail3, caudal] = spine.joints;
  const head = b.joint("head", { parent: root, at: [0, Y0, NECK_Z], dir: [0, 0, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, Y0 - 0.036, 0.43],
    aim: [0, Y0 - 0.028, 0.68],
    role: "jaw",
    group: "jaw",
  });

  // ---------------------------------------------------------------- Body
  // Half height and half width along z, from the neck to the tail fork; a slightly deeper belly up front.
  const halfH = curve([
    [TAIL_END_Z, 0.026],
    [-0.6, 0.03],
    [-0.52, 0.036],
    [-0.42, 0.055],
    [-0.3, 0.08],
    [-0.15, 0.103],
    [0.0, 0.116],
    [0.12, 0.118],
    [0.26, 0.106],
    [NECK_Z, 0.086],
  ]);
  const halfW = curve([
    [TAIL_END_Z, 0.017],
    [-0.6, 0.02],
    [-0.52, 0.022],
    [-0.42, 0.03],
    [-0.3, 0.041],
    [-0.15, 0.052],
    [0.0, 0.06],
    [0.12, 0.062],
    [0.26, 0.058],
    [NECK_Z, 0.05],
  ]);
  const sag = curve([
    [-0.3, 0],
    [0.0, -0.008],
    [0.2, -0.008],
    [NECK_Z, -0.004],
  ]);
  const bodyLength = NECK_Z - TAIL_END_Z;
  const zAt = (t: number) => NECK_Z - t * bodyLength;
  const tAt = (z: number) => (NECK_Z - z) / bodyLength;
  const dorsalY = (z: number) => Y0 + sag(z) + halfH(z);

  // Vertical flank bars: pale bands between the dark back and the silver belly.
  const bands: [number, string][] = [];
  const BARS = 16;
  for (let i = 0; i < BARS; i++) {
    const z = 0.26 - (i / (BARS - 1)) * 0.66;
    bands.push([tAt(z + 0.007), FLANK], [tAt(z - 0.007), BAR]);
  }
  bands.push([1, FLANK]);
  const countershade: [number, number, string][] = [
    [-66, 66, DORSAL],
    [66, 84, MIDBLUE],
    [-84, -66, MIDBLUE],
    [124, 236, BELLY],
  ];
  const bodyTube = b.sweep(spine, (t) => [halfW(zAt(t)), halfH(zAt(t))], {
    shift: (t) => [0, sag(zAt(t))],
    bands,
    sectors: countershade,
    sides: 16,
    group: "body",
  });

  // ---------------------------------------------------------------- Head
  const headLoft = b.loft(
    [
      { at: [0, Y0 - 0.004, 0.28], w: 0.104, h: 0.172 },
      { at: [0, Y0 - 0.002, 0.36], w: 0.096, h: 0.156 },
      { at: [0, Y0 + 0.002, 0.44], w: 0.072, h: 0.104 },
      { at: [0, Y0 + 0.002, 0.51], w: 0.05, h: 0.066 },
      { at: [0, Y0 - 0.002, 0.58], w: 0.032, h: 0.038 },
      { at: [0, Y0 - 0.006, 0.61], w: 0.026, h: 0.028 },
    ],
    { bone: head, color: FLANK, sectors: countershade, sides: 16, group: "head" },
  );
  const headSurface = b.surface([headLoft, bodyTube]);

  // The bill: a long round spear off the upper jaw, dark above.
  b.sweep(
    [
      [0, Y0 - 0.006, 0.57],
      [0, Y0 - 0.01, 0.97],
    ],
    (t) => 0.014 * (1 - t) ** 0.8 + 0.0015,
    {
      bone: head,
      color: BILL,
      sectors: [[115, 245, BILL_UNDER]],
      caps: { start: "flat", end: "point" },
      group: "head",
    },
  );

  // Lower jaw: its own bone, a flattened wedge ending short of the snout.
  b.sweep([jaw, [0, Y0 - 0.028, 0.68]], (t) => [0.024 * (1 - t) + 0.003, 0.014 * (1 - t) + 0.003], {
    bone: jaw,
    color: JAW,
    bands: [
      [0.82, JAW],
      [1, BILL],
    ],
    caps: { start: "round", end: "point" },
    group: "jaw",
  });

  for (const s of [1, -1]) {
    // Mouth gape line along the upper jaw, and a nostril pair ahead of the eye.
    b.rod([s * 0.028, Y0 - 0.03, 0.44], [s * 0.012, Y0 - 0.021, 0.6], 0.0022, {
      bone: head,
      color: GILL,
      group: "head",
    });
    const nostril = headSurface.ray([s * 0.3, Y0 + 0.012, 0.525], [-s, 0, 0]);
    if (nostril) b.stick(new SphereGeometry(0.0035, 8, 6), GILL, nostril, { embed: 0.6, bone: head, group: "head" });

    // Eye: a turned orbit collar, a gold iris disc and a black lens dome, with a catchlight.
    const eyeHit = headSurface.ray([s * 0.3, Y0 + 0.012, 0.475], [-s, 0, 0]);
    if (!eyeHit) throw new Error("sailfish: eye ray missed the head");
    const gaze = eyeHit.n;
    b.lathe(
      [
        [0.017, -0.01],
        [0.025, -0.01],
        [0.025, 0.0],
        [0.021, 0.005],
        [0.017, 0.003],
      ],
      { at: eyeHit, axis: gaze, bone: head, smoothing: 1, color: ORBIT, group: "head" },
    );
    b.lathe(
      [
        [0, -0.008],
        [0.019, -0.008],
        [0.019, 0.002],
        [0.012, 0.004],
        [0, 0.004],
      ],
      { at: eyeHit, axis: gaze, bone: head, color: IRIS, group: "head" },
    );
    const lens = b.lathe(
      [
        [0, 0],
        [0.0105, 0],
        [0.0098, 0.004],
        [0.006, 0.0075],
        [0, 0.0085],
      ],
      { at: eyeHit, axis: gaze, bone: head, smoothing: 2, color: LENS, group: "head" },
    );
    b.part(new SphereGeometry(0.0022, 8, 6), GLINT, {
      bone: head,
      at: lens.local([0.003, 0.0075, 0.003]),
    });

    // Gill cover: a turned spherical cap that curves nearly like the cheek, so only an oval plate rises out of
    // it, and the dark gill slit draped round its back edge.
    const coverHit = headSurface.ray([s * 0.3, Y0 - 0.01, 0.35], [-s, 0, 0]);
    if (!coverHit) throw new Error("sailfish: gill cover ray missed the head");
    const CAP_R = 0.12;
    const cap: OutlinePoint[] = [
      [0, -0.03],
      [0.06, -0.03],
    ];
    for (let i = 0; i <= 6; i++) {
      const r = 0.06 * (1 - i / 6);
      cap.push([r, Math.sqrt(CAP_R * CAP_R - r * r) - CAP_R + 0.004]);
    }
    b.lathe(cap, { at: coverHit, axis: coverHit.n, bone: head, color: OPERCLE, group: "head" });
    // Each slit point is cast in from the side, so it lands on the outermost skin where head and body overlap.
    const slit = Array.from({ length: 9 }, (_, i) => {
      const phi = (-80 + (160 * i) / 8) * DEG;
      const [z, y] = [coverHit.at.z - 0.05 * Math.cos(phi), coverHit.at.y + 0.062 * Math.sin(phi)];
      return headSurface.ray([s * 0.3, y, z], [-s, 0, 0]);
    }).filter((hit) => hit !== null);
    b.sweep(catmull(slit), 0.003, { bone: head, color: GILL, group: "head" });
  }

  // ---------------------------------------------------------------- Sail
  // One extrude per spine bone, each cut along a fin ray, so a bend opens the sail between rays like a fan.
  const SAIL_FRONT = 0.31;
  const SAIL_BACK = -0.41;
  const pieces: { joint: (typeof spine.joints)[number]; from: number; to: number; gaps: number }[] = [
    { joint: spine.joints[0], from: SAIL_FRONT, to: 0.2, gaps: 3 },
    { joint: spine.joints[1], from: 0.2, to: 0.03, gaps: 5 },
    { joint: spine.joints[2], from: 0.03, to: -0.15, gaps: 5 },
    { joint: spine.joints[3], from: -0.15, to: -0.31, gaps: 5 },
    { joint: spine.joints[4], from: -0.31, to: SAIL_BACK, gaps: 3 },
  ];
  const rayHeight = curve([
    [0, 0.2],
    [0.05, 0.29],
    [0.14, 0.335],
    [0.3, 0.34],
    [0.5, 0.3],
    [0.68, 0.23],
    [0.82, 0.15],
    [0.92, 0.09],
    [1, 0.05],
  ]);
  const BURY = 0.026;
  // The sail thins from 12 mm at its root to 3.5 mm at the ray tips (heights above the spine axis).
  const sailThickness = (v: number) => 0.012 + (0.0035 - 0.012) * Math.min(1, Math.max(0, (v - 0.07) / 0.4));
  type Ray = { z: number; base: [number, number]; foot: [number, number]; tip: [number, number]; h: number };
  const ray = (z: number): Ray => {
    const s = (SAIL_FRONT - z) / (SAIL_FRONT - SAIL_BACK);
    const h = rayHeight(s);
    const r = 0.22 + 0.3 * s; // rear rays lean back further
    const y = dorsalY(z);
    return { z, h, base: [z, y], foot: [z + r * BURY, y - BURY], tip: [z - r * h, y + h] };
  };

  type Piece = { sail: Part; rays: Ray[]; dips: number[]; toLocal: (p: [number, number]) => [number, number] };
  const built: Piece[] = [];
  for (const [pi, piece] of pieces.entries()) {
    const jz = jointZ[pi];
    const rays = Array.from({ length: piece.gaps + 1 }, (_, i) =>
      ray(piece.from + ((piece.to - piece.from) * i) / piece.gaps),
    );
    const toLocal = ([z, y]: [number, number]): [number, number] => [z - jz, y - Y0];
    const outline: OutlinePoint[] = [[...toLocal(rays[0].foot), "sharp"]];
    const dips: number[] = [];
    rays.forEach((r, i) => {
      if (i > 0) {
        const prev = rays[i - 1];
        const dipY = (prev.tip[1] + r.tip[1]) / 2 - (0.012 + 0.07 * ((prev.h + r.h) / 2));
        dips.push(dipY);
        outline.push(toLocal([(prev.tip[0] + r.tip[0]) / 2, dipY]));
      }
      outline.push([...toLocal(r.tip), "sharp"]);
    });
    outline.push([...toLocal(rays[rays.length - 1].foot), "sharp"]);
    const vs = outline.map((p) => p[1]);
    const sail = b.extrude(outline, {
      at: piece.joint,
      bone: piece.joint,
      thickness: [sailThickness(Math.min(...vs)), sailThickness(Math.max(...vs))],
      bevel: 0.002,
      smoothing: 2,
      color: SAIL,
      group: "sail",
      name: `sail${pi + 1}`,
    });
    built.push({ sail, rays, dips, toLocal });

    // Fin rays as half-sunk ribs on both faces; the leading ray is a heavier spine.
    for (const [ri, r] of rays.entries()) {
      if (ri === rays.length - 1 && pi < pieces.length - 1) continue; // the next piece draws its leading ray
      const [u0, v0] = toLocal(r.base);
      const [ut, vt] = toLocal(r.tip);
      const [u1, v1] = [u0 + (ut - u0) * 0.92, v0 + (vt - v0) * 0.92];
      const lead = pi === 0 && ri === 0;
      for (const side of [1, -1])
        b.rod(
          sail.local([u0, v0 - 0.01, (side * sailThickness(v0 - 0.01)) / 2]),
          sail.local([u1, v1, (side * sailThickness(v1)) / 2]),
          lead ? [0.0045, 0.002] : [0.0026, 0.001],
          { bone: piece.joint, color: RAY, group: "sail" },
        );
    }

    // Dark spots scattered over each panel between rays, on both faces.
    for (let i = 1; i < rays.length; i++) {
      const [a, c] = [rays[i - 1], rays[i]];
      for (let k = 0; k < 2; k++) {
        const along = 0.25 + 0.5 * random();
        const up = 0.18 + 0.55 * random();
        const baseZ = a.base[0] + (c.base[0] - a.base[0]) * along;
        const tipZ = a.tip[0] + (c.tip[0] - a.tip[0]) * along;
        const baseY = a.base[1] + (c.base[1] - a.base[1]) * along;
        const tipY = a.tip[1] + (c.tip[1] - a.tip[1]) * along;
        const [u, v] = toLocal([baseZ + (tipZ - baseZ) * up, baseY + (tipY - baseY) * up]);
        const radius = 0.005 + 0.004 * random();
        for (const side of [1, -1])
          b.stick(
            new CylinderGeometry(radius, radius, 0.0016, 10),
            SPOT,
            frame(sail.moved([u, v, (side * sailThickness(v)) / 2]), sail.dir([0, 0, side])),
            { bone: piece.joint, group: "sail" },
          );
      }
    }
  }

  // Behind every cut ray, a thin smooth-skinned strip spans from inside one piece to inside the next. Hidden in
  // the rest pose, it stretches across the fan when the spine bends, so the sail never opens onto daylight.
  const STRIP_REACH = 0.026;
  for (let p = 0; p + 1 < built.length; p++) {
    const [front, rear] = [built[p], built[p + 1]];
    const cut = front.rays[front.rays.length - 1];
    const lean = (cut.base[0] - cut.tip[0]) / (cut.tip[1] - cut.base[1]);
    const topY = Math.min(front.dips[front.dips.length - 1], rear.dips[0]) - 0.007;
    const edge = (piece: Piece, dz: number) =>
      [cut.foot[1], topY].map((y) =>
        piece.sail.moved([...piece.toLocal([cut.base[0] - lean * (y - cut.base[1]) + dz, y]), 0]),
      );
    b.membrane(edge(front, STRIP_REACH), edge(rear, -STRIP_REACH), {
      thickness: 0.0024,
      color: SAIL,
      group: "sail",
      name: `sailHinge${p + 1}`,
    });
  }

  /** Fin rays as half-sunk ribs on both faces of an extruded fin, `[u0, v0, u1, v1]` in its outline plane. */
  const ribs = (
    fin: Part,
    bone: Joint,
    group: string,
    thicknessAt: (v: number) => number,
    lines: readonly number[][],
  ) => {
    for (const [u0, v0, u1, v1] of lines)
      for (const side of [1, -1])
        b.rod(
          fin.local([u0, v0, (side * thicknessAt(v0)) / 2]),
          fin.local([u1, v1, (side * thicknessAt(v1)) / 2]),
          [0.0018, 0.0008],
          { bone, color: RAY, group },
        );
  };

  // ---------------------------------------------------------------- Paired fins
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    // Pectoral: a falcate hydrofoil, thick along its leading edge and knife-thin at the trailing edge.
    const pectoral = b.joint(`pectoral${side}`, {
      parent: spine1,
      at: [s * 0.036, Y0 - 0.046, 0.3],
      dir: [s * 0.78, -0.32, -0.55],
      role: "hinge",
      group: `pectoral${side}`,
    });
    const pectoralFin = b.extrude(
      [
        [0, -0.034],
        [0, 0.03],
        [0.05, 0.033],
        [0.12, 0.02],
        [0.19, -0.012],
        [0.235, -0.042, "sharp"],
        [0.16, -0.03],
        [0.09, -0.032],
        [0.04, -0.044],
      ],
      {
        at: pectoral,
        bone: pectoral,
        x: pectoral,
        y: [0, 0.3, 1],
        thickness: [0.002, 0.012],
        bevel: 0.0025,
        smoothing: 2,
        color: FIN,
        group: `pectoral${side}`,
      },
    );
    ribs(pectoralFin, pectoral, `pectoral${side}`, (v) => 0.002 + (0.01 * (v + 0.044)) / 0.077, [
      [0.012, 0.022, 0.2, -0.022],
      [0.012, 0.004, 0.15, -0.024],
      [0.012, -0.016, 0.09, -0.027],
    ]);

    // Pelvic: long ribbon fins angled down and back until their tips rest on the floor.
    const pelvicTip: V3 = [s * 0.06, 0, 0.03];
    const pelvic = b.joint(`pelvic${side}`, {
      parent: spine1,
      at: [s * 0.016, Y0 - 0.1, 0.23],
      aim: pelvicTip,
      role: "hinge",
      group: `pelvic${side}`,
    });
    const reach = pelvic.at.distanceTo(vec(pelvicTip));
    b.extrude(
      [
        [0, -0.009],
        [0, 0.012],
        [0.05, 0.013],
        [reach * 0.7, 0.006],
        [reach, 0, "sharp"],
        [reach * 0.6, -0.004],
        [0.05, -0.01],
      ],
      {
        at: pelvic,
        bone: pelvic,
        x: pelvic,
        y: [s * 0.2, -0.6, 1],
        thickness: [0.003, 0.006],
        bevel: 0.0015,
        smoothing: 1,
        color: FIN,
        group: `pelvic${side}`,
      },
    );

    // Two lateral keels on each side of the caudal peduncle.
    for (const dy of [0.01, -0.01]) {
      const w = halfW(-0.6);
      b.extrude(
        [
          [-0.002, 0],
          [-0.03, w + 0.004],
          [-0.065, w + 0.008],
          [-0.095, w + 0.002],
          [-0.1, 0],
        ],
        {
          at: [0, Y0 + dy, jointZ[6]],
          bone: caudal,
          x: [0, 0, 1],
          y: [s, 0, 0],
          thickness: 0.006,
          bevel: 0.002,
          smoothing: 1,
          color: DORSAL,
          group: "tail",
        },
      );
    }
  }

  // ---------------------------------------------------------------- Median fins
  // First anal fin: falcate, pointing down and back behind the vent.
  b.extrude(
    [
      [0, -0.07],
      [-0.012, -0.12],
      [-0.035, -0.19, "sharp"],
      [-0.065, -0.14],
      [-0.1, -0.11],
      [-0.125, -0.07],
    ],
    {
      at: tail1,
      bone: tail1,
      thickness: [0.002, 0.009],
      bevel: 0.002,
      smoothing: 2,
      color: FIN,
      group: "tail",
    },
  );
  // Second dorsal and second anal fins: small matching blades just ahead of the peduncle keels.
  for (const d of [1, -1])
    b.extrude(
      [
        [-0.005, d * 0.022],
        [-0.02, d * 0.06],
        [-0.035, d * 0.08, "sharp"],
        [-0.045, d * 0.06],
        [-0.065, d * 0.022],
      ],
      {
        at: tail3,
        bone: tail3,
        thickness: d > 0 ? [0.007, 0.002] : [0.002, 0.007],
        bevel: 0.0015,
        smoothing: 1,
        color: FIN,
        group: "tail",
      },
    );

  // Caudal fin: a lunate, deeply forked tail in two lobes that each thin to a knife-edged tip.
  const upperLobe: OutlinePoint[] = [
    [-0.045, -0.006],
    [-0.045, 0.03],
    [-0.1, 0.1],
    [-0.17, 0.19],
    [-0.245, 0.265, "sharp"],
    [-0.2, 0.2],
    [-0.16, 0.12],
    [-0.14, 0.05],
    [-0.135, -0.006],
  ];
  const lowerLobe: OutlinePoint[] = [
    [-0.045, 0.006],
    [-0.135, 0.006],
    [-0.14, -0.05],
    [-0.16, -0.12],
    [-0.2, -0.195],
    [-0.235, -0.255, "sharp"],
    [-0.165, -0.18],
    [-0.1, -0.095],
    [-0.045, -0.028],
  ];
  const upper = b.extrude(upperLobe, {
    at: caudal,
    bone: caudal,
    thickness: [0.013, 0.002],
    bevel: 0.003,
    smoothing: 2,
    color: FIN,
    group: "tail",
    name: "caudalUpper",
  });
  ribs(upper, caudal, "tail", (v) => 0.013 - (0.011 * (v + 0.006)) / 0.271, [
    [-0.06, 0.02, -0.21, 0.22],
    [-0.075, 0.01, -0.172, 0.165],
    [-0.09, 0.005, -0.135, 0.085],
  ]);
  const lower = b.extrude(lowerLobe, {
    at: caudal,
    bone: caudal,
    thickness: [0.002, 0.012],
    bevel: 0.003,
    smoothing: 2,
    color: FIN,
    group: "tail",
    name: "caudalLower",
  });
  ribs(lower, caudal, "tail", (v) => 0.002 + (0.01 * (v + 0.255)) / 0.261, [
    [-0.06, -0.02, -0.2, -0.21],
    [-0.075, -0.01, -0.163, -0.155],
    [-0.09, -0.005, -0.13, -0.08],
  ]);

  return b.root;
}
