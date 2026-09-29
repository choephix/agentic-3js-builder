// Giant oceanic manta ray (Mobula birostris), 4.6 m across the wings, 3.5 m from cephalic fins to tail tip.
// A gliding rest pose: the pectoral wings spread level, each a smooth lens-section sweep on a five-joint chain so it
// flaps and bends as one skin; the rolled cephalic fins curl forward off the head on two-joint chains. The body and
// whip tail are one continuous skin over the spine and tail chains, with the tail tapering to a fine tip. The lower
// jaw, pelvic fins and dorsal fin are extruded plates; the eyes, spiracles and the two hitchhiking remoras (body,
// sucking disc) are turned lathe profiles.
import { CylinderGeometry, SphereGeometry } from "three";
import { createBuilder } from "../src/builder";
import { offset, rng } from "../src/math";
import type { V3 } from "../src/math";
import type { Sweep } from "../src/sweep";
import { catmull, polyline } from "../src/path";

export const meta = {
  name: "Giant Manta Ray",
  builtBy: "Claude Opus 5.5",
  description:
    "A 4.6 m oceanic manta gliding with wings spread: black back with pale shoulder chevrons, rolled cephalic fins, a spotted white belly with gill slits, a whip tail and two remoras riding underneath.",
};

const BACK = "#272c35";
const SHOULDER = "#e3e6e2";
const SHOULDER_EDGE = "#9ea4a8";
const BELLY = "#eef0ec";
const MARGIN = "#4a515b";
const MOUTH = "#5a5f67";
const GAPE = "#0a0b0e";
const GILL = "#3a3f48";
const SPOT = "#23262c";
const CEPH_INNER = "#b9bdbf";
const EYE_RIM = "#2e3238";
const IRIS = "#6b5638";
const LENS = "#050608";
const GLINT = "#f2f6fa";
const CLASPER = "#c9cdcc";
const REMORA = "#6d6a63";
const REMORA_STRIPE = "#2f2d2a";
const DISC = "#b3aa98";

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
  const b = createBuilder({ name: "mantaRay" });
  const random = rng(23);

  // ---------------------------------------------------------------- Skeleton
  // The body axis runs level at Y0; z = 0.55 is the pectoral girdle, the snout z = 1.03, the tail tip z = -2.45.
  const Y0 = 0.252;
  const root = b.joint("root", { at: [0, Y0, 0.55], role: "spine", group: "body" });
  const spine = b.chain(
    "spine",
    polyline([
      [0, Y0, 0.55],
      [0, Y0, -0.35],
      [0, Y0, -0.95],
    ]),
    { parent: root, names: ["spine1", "spine2"], role: "spine", group: "body" },
  );
  const [spine1, spine2] = spine.joints;
  const tail = b.chain(
    "tail",
    catmull([
      [0, Y0, -0.95],
      [0, Y0 + 0.01, -1.6],
      [0, Y0 + 0.03, -2.45],
    ]),
    { parent: spine2, count: 6, names: (i) => `tail${i + 1}`, role: "tail", group: "tail" },
  );
  const head = b.joint("head", { parent: root, at: [0, Y0, 0.6], dir: [0, 0, 1], role: "head", group: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, Y0 - 0.06, 0.84], dir: [0, 0, 1], role: "jaw", group: "jaw" });

  // The body path continues through the tail tip so its ring at the tail root is shared by both sector palettes. The
  // three tail stations match the old whip-tail curve; the first body station keeps its fine circular base.
  const bodyStations = [
    { at: [0, Y0 + 0.03, -2.45], w: 0.006, h: 0.006 },
    { at: [0, Y0 + 0.01, -1.6], w: 0.036, h: 0.036 },
    { at: [0, Y0, -0.95], w: 0.078, h: 0.078 },
    { at: [0, Y0, -0.85], w: 0.2, h: 0.12 },
    { at: [0, Y0, -0.6], w: 0.52, h: 0.24 },
    { at: [0, Y0 + 0.01, -0.3], w: 0.86, h: 0.36 },
    { at: [0, Y0 + 0.01, 0.1], w: 1.02, h: 0.42 },
    { at: [0, Y0, 0.45], w: 0.98, h: 0.38 },
    { at: [0, Y0, 0.75], w: 0.8, h: 0.26 },
  ] as const;
  const bodyPath = catmull(bodyStations.map((station) => station.at));
  const tailT = bodyPath.closestT([0, Y0, -0.95]);
  const mergedBones = [tail, spine, root] as const;
  b.sweep(bodyPath, (u) => 0.036 * (u / tailT) ** 1.3 + 0.003, {
    bone: mergedBones,
    to: tailT,
    color: BACK,
    sectors: [[125, 235, MARGIN]],
    caps: { start: "round", end: "none" },
    sides: 12,
    group: "tail",
  });
  const body = b.loft(bodyStations, {
    bone: mergedBones,
    from: tailT,
    color: BACK,
    sectors: [[100, 260, BELLY]],
    caps: { start: "none", end: "round" },
    sides: 12,
    group: "body",
  });

  // Head: the broad flat snout, rigid on the head bone and buried in the body behind the eyes.
  const headLoft = b.loft(
    [
      { at: [0, Y0, 0.5], w: 0.74, h: 0.26 },
      { at: [0, Y0 + 0.005, 0.75], w: 0.84, h: 0.22 },
      { at: [0, Y0 + 0.012, 0.92], w: 0.8, h: 0.15 },
      { at: [0, Y0 + 0.02, 1.0], w: 0.74, h: 0.09 },
    ],
    { bone: head, color: BACK, sectors: [[110, 250, BELLY]], sides: 16, group: "head" },
  );
  const skin = b.surface([body, headLoft]);

  // Mouth: a dark gape under the snout, closed from below by the extruded lower-jaw plate.
  b.frustumBox([0, Y0 - 0.035, 0.86], [0, Y0 - 0.035, 1.03], [0.6, 0.05], [0.64, 0.05], {
    bone: head,
    color: GAPE,
    group: "head",
  });
  b.extrude(
    [
      [-0.29, 0],
      [0.29, 0],
      [0.31, 0.1],
      [0.28, 0.17],
      [0, 0.19],
      [-0.28, 0.17],
      [-0.31, 0.1],
    ],
    {
      at: jaw,
      bone: jaw,
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.05,
      bevel: 0.015,
      detail: 0.5,
      smoothing: 1,
      color: MOUTH,
      group: "jaw",
    },
  );
  b.pose(jaw, { axis: [1, 0, 0], deg: 9 });

  // Gill slits: five curved pairs draped on the white underside behind the mouth.
  for (const s of [1, -1])
    for (let i = 0; i < 5; i++) {
      const z = 0.58 - 0.085 * i;
      const x0 = 0.11 + 0.012 * i;
      const draft: V3[] = [
        [s * x0, Y0 - 0.4, z],
        [s * (x0 + 0.11), Y0 - 0.4, z + 0.018],
        [s * (x0 + 0.23), Y0 - 0.4, z - 0.004],
      ];
      b.sweep(skin.drape(catmull(draft), { lift: 0.003 }), 0.009, {
        bone: spine1,
        color: GILL,
        sides: 5,
        group: "body",
      });
    }

  // Belly spots between and behind the gills, each on its own patch of skin.
  for (const hit of skin.scatter(18, {
    rng: random,
    minDist: 0.07,
    filter: (h) => h.n.y < -0.8 && Math.abs(h.at.x) < 0.3 && h.at.z < 0.62 && h.at.z > -0.45,
  })) {
    const r = 0.018 + 0.022 * random();
    b.stick(new CylinderGeometry(r, r, 0.006, 8), SPOT, hit, { embed: 0.5, group: "body" });
  }

  // ---------------------------------------------------------------- Wings
  // Each pectoral wing is one smooth sweep over a five-joint chain: an elliptical lens section whose chord (rx)
  // shrinks from 1.6 m at the root to a swept-back falcate tip, thinning from 22 cm to 2 cm, the tip curling up.
  const halfChord = curve([
    [0, 0.8],
    [0.15, 0.64],
    [0.35, 0.46],
    [0.6, 0.27],
    [0.8, 0.13],
    [0.93, 0.055],
    [1, 0.02],
  ]);
  const halfThick = curve([
    [0, 0.11],
    [0.2, 0.075],
    [0.5, 0.045],
    [0.8, 0.025],
    [1, 0.012],
  ]);
  const wings: Sweep[] = [];
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const wing = b.chain(
      `wing${side}`,
      catmull([
        [s * 0.3, Y0, 0.0],
        [s * 0.9, Y0 + 0.01, 0.0],
        [s * 1.5, Y0 + 0.01, -0.12],
        [s * 1.95, Y0 + 0.03, -0.27],
        [s * 2.3, Y0 + 0.08, -0.5],
      ]),
      {
        parent: spine1,
        up: [0, 1, 0],
        count: 5,
        names: (i) => `wing${side}${i + 1}`,
        role: "wing",
        group: `wing${side}`,
      },
    );
    // Dorsal clock on this tube: +90 is the leading edge on the left wing and the trailing edge on the right.
    const clock = (a0: number, a1: number): [number, number] => (s > 0 ? [a0, a1] : [-a1, -a0]);
    const wingSweep = b.sweep(wing, (t) => [halfChord(t), halfThick(t)], {
      shift: (t) => [s * 0.05 * Math.sin(Math.PI * t), 0],
      color: BACK,
      sectors: [[...clock(94, 266), BELLY]],
      sides: 16,
      extend: [0.2, 0],
      group: `wing${side}`,
    });
    wings.push(wingSweep);

    // Shoulder chevron: a pale triangle behind a thin black leading edge, widest at the root and tapering out along
    // the front of the wing, fading to grey at its rear edge. Narrow strips between lines of the built skin, so each
    // hugs the curved surface. Edges are chord fractions (+1 = leading edge), turned into the polar clock angle.
    const STRIPS = 8;
    const edge = (k: number) =>
      Array.from({ length: 12 }, (_, i) => {
        const u = i / 11;
        const t = 0.04 + 0.38 * u;
        const front = 0.9 - 0.08 * u;
        const rear = -0.45 + 1.18 * u;
        const f = rear + ((front - rear) * k) / STRIPS;
        const deg = (Math.atan2(f * halfChord(t), halfThick(t) * Math.sqrt(1 - f * f)) * 180) / Math.PI;
        return wingSweep.at(t, s * deg, 0.004);
      });
    for (let k = 0; k < STRIPS; k++)
      b.membrane(edge(k), edge(k + 1), {
        thickness: 0.003,
        rows: 1,
        cols: 11,
        bone: wing,
        color: k === 0 ? SHOULDER_EDGE : SHOULDER,
        group: `wing${side}`,
      });

    // ---------------------------------------------------------------- Cephalic fins
    // Rolled into forward-pointing horns, pale on the inner face, with the spiral edge of the rolled lobe.
    const ceph = b.chain(
      `cephalic${side}`,
      catmull([
        [s * 0.34, Y0 - 0.01, 0.93],
        [s * 0.37, Y0 - 0.02, 1.12],
        [s * 0.365, Y0 - 0.035, 1.28],
        [s * 0.32, Y0 - 0.05, 1.36],
      ]),
      {
        parent: head,
        count: 2,
        names: [`cephalic${side}1`, `cephalic${side}2`],
        role: "hinge",
        group: `cephalic${side}`,
      },
    );
    const horn = b.sweep(ceph, (t) => [0.042 - 0.016 * t, 0.052 - 0.022 * t], {
      color: BACK,
      sectors: [[...clock(60, 200), CEPH_INNER]],
      sides: 16,
      group: `cephalic${side}`,
    });
    const seam = Array.from({ length: 15 }, (_, i) => {
      const t = 0.08 + (0.84 * i) / 14;
      return horn.at(t, s * (120 + 420 * t), 0.002).at.clone();
    });
    b.sweep(catmull(seam), 0.0055, { bone: ceph, color: GAPE, group: `cephalic${side}` });

    // ---------------------------------------------------------------- Eyes and spiracles
    const eyeHit = skin.ray([s * 1, Y0 + 0.03, 0.8], [-s, 0, 0]);
    if (!eyeHit) throw new Error("mantaRay: eye ray missed the head");
    const gaze = eyeHit.n;
    b.lathe(
      [
        [0.028, -0.02],
        [0.05, -0.02],
        [0.046, 0.008],
        [0.034, 0.018],
        [0.028, 0.012],
      ],
      { at: eyeHit, axis: gaze, bone: head, smoothing: 1, color: EYE_RIM, group: "head" },
    );
    b.lathe(
      [
        [0, -0.012],
        [0.03, -0.012],
        [0.03, 0.008],
        [0.02, 0.012],
        [0, 0.012],
      ],
      { at: eyeHit, axis: gaze, bone: head, color: IRIS, group: "head" },
    );
    const lens = b.lathe(
      [
        [0, 0],
        [0.017, 0],
        [0.015, 0.008],
        [0.009, 0.014],
        [0, 0.016],
      ],
      { at: eyeHit, axis: gaze, bone: head, color: LENS, group: "head" },
    );
    b.part(new SphereGeometry(0.004, 4, 3), GLINT, { bone: head, at: lens.local([0.005, 0.014, 0.005]) });

    const spiracle = skin.ray([s * 0.3, Y0 + 1, 0.62], [0, -1, 0]);
    if (spiracle)
      b.lathe(
        [
          [0.012, -0.01],
          [0.024, -0.01],
          [0.022, 0.006],
          [0.014, 0.004],
        ],
        { at: spiracle, axis: spiracle.n, bone: head, color: GAPE, group: "head" },
      );

    // ---------------------------------------------------------------- Pelvic fins and claspers
    b.extrude(
      [
        [0, 0],
        [0.12, 0.03],
        [0.2, 0.12],
        [0.19, 0.22, "sharp"],
        [0.1, 0.2],
        [0.02, 0.14],
      ],
      {
        at: [s * 0.08, Y0 - 0.03, -0.72],
        bone: spine2,
        x: [s, 0, 0],
        y: [0, 0, -1],
        thickness: 0.026,
        bevel: 0.008,
        detail: 0.5,
        smoothing: 1,
        color: BACK,
        group: "body",
      },
    );
    b.capsule([s * 0.07, Y0 - 0.05, -0.84], [s * 0.1, Y0 - 0.055, -1.14], [0.02, 0.013], {
      bone: spine2,
      color: CLASPER,
      group: "body",
    });
  }

  const tail1 = tail.joints[0];
  b.extrude(
    [
      [0.05, 0],
      [-0.02, 0.07],
      [-0.1, 0.12, "sharp"],
      [-0.09, 0.06],
      [-0.16, 0],
    ],
    {
      at: [0, Y0 + 0.02, -0.9],
      bone: tail1,
      thickness: [0.03, 0.006],
      bevel: 0.006,
      detail: 0.5,
      smoothing: 1,
      color: BACK,
      group: "tail",
    },
  );

  // ---------------------------------------------------------------- Remoras
  // Two sharksuckers stuck to the white underside, facing forward, each a turned spindle hanging from its disc.
  const riders: { at: [number, number]; len: number }[] = [
    { at: [0.18, -0.28], len: 0.36 },
    { at: [-0.62, -0.12], len: 0.3 },
  ];
  const underside = b.surface([body, ...wings]);
  for (const rider of riders) {
    const [x, z] = rider.at;
    const hit = underside.ray([x, Y0 - 1, z], [0, 1, 0]);
    if (!hit) throw new Error("mantaRay: remora ray missed the underside");
    const L = rider.len;
    const R = 0.11 * L;
    const DISC_H = 0.025 * L;
    const bone = hit.bone ?? spine1;
    const axisPoint = offset(hit, [0, -1, 0], R + DISC_H * 0.6);
    const tailEnd = offset(axisPoint, [0, 0, -1], L / 2);
    const fish = b.lathe(
      [
        [0, 0],
        [0.03 * L, 0.02 * L],
        [0.07 * L, 0.2 * L],
        [R, 0.55 * L],
        [0.09 * L, 0.85 * L],
        [0.05 * L, 0.97 * L],
        [0, L],
      ],
      { at: tailEnd, axis: [0, 0, 1], bone, smoothing: 1, color: REMORA, group: "remoras" },
    );
    // Dark lateral stripe, the forked tail and the long dorsal and anal fins.
    for (const s of [1, -1])
      b.capsule(fish.local([s * R * 0.92, 0.25 * L, 0]), fish.local([s * R * 0.72, 0.9 * L, 0]), 0.018 * L, {
        bone,
        color: REMORA_STRIPE,
        group: "remoras",
      });
    b.extrude(
      [
        [0.05 * L, 0],
        [-0.12 * L, 0.14 * L, "sharp"],
        [-0.07 * L, 0],
        [-0.12 * L, -0.14 * L, "sharp"],
      ],
      {
        at: tailEnd,
        bone,
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.012 * L,
        smoothing: 1,
        color: REMORA_STRIPE,
        group: "remoras",
      },
    );
    for (const d of [1, -1])
      b.extrude(
        [
          [0.08 * L, 0],
          [0.38 * L, 0],
          [0.3 * L, d * 0.06 * L],
          [0.12 * L, d * 0.05 * L],
        ],
        {
          at: offset(tailEnd, [0, d, 0], R * 0.7),
          bone,
          x: [0, 0, 1],
          y: [0, 1, 0],
          thickness: 0.01 * L,
          smoothing: 1,
          color: REMORA,
          group: "remoras",
        },
      );
    // The oval sucking disc on top of the head, pressed against the manta's skin.
    b.lathe(
      [
        [0, 0],
        [0.05 * L, 0],
        [0.055 * L, DISC_H * 0.6],
        [0.045 * L, DISC_H],
        [0, DISC_H],
      ],
      {
        at: fish.local([0, 0.78 * L, R * 0.9]),
        axis: [0, 1, 0],
        bone,
        segments: 12,
        color: DISC,
        group: "remoras",
      },
    );
  }

  return b.root;
}
