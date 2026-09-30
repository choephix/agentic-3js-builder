// Secretary Bird · Kimi
// Sagittarius serpentarius — ~1.3 m tall, standing rest pose.
// Long legs: black feathered thighs over bare scaly lower legs, short toes
// planted on the floor. Grey body, black flight feathers on folded wings held
// slightly out, two long central tail feathers, a bare orange-red face, a
// hooked grey beak with a separate lower beak, and a fan of long black-tipped
// crest quills behind the head.

import { SphereGeometry, Vector3 } from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { countershade, paint, scales } from "../src/paint";
import { bezier, catmull } from "../src/path";

export const meta = {
  name: "Secretary Bird · Kimi",
  description:
    "A secretary bird (Sagittarius serpentarius) in standing rest pose: black-feathered thighs, bare scaly lower legs with short planted toes, grey body, black flight feathers on slightly-open wings, two long central tail feathers, an orange-red bare face, a hooked grey beak and a fan of black-tipped crest quills.",
  builtBy: "SecretaryBirdKimi (agent)",
};

const GREY = "#a7adb4"; // body blue-grey
const BELLY = "#d9dad3"; // pale belly and undertail
const WINGGREY = "#878e96"; // wing coverts
const SECONDARY = "#44484f"; // secondary flight feathers
const BLACK = "#222226"; // primaries, thighs, quill tips
const FACE = "#e05a34"; // bare orange-red face skin
const BEAK = "#7a8188"; // blue-grey beak
const BEAKDARK = "#3c4147"; // hooked beak tip
const LEGPALE = "#d3c9b4"; // bare lower leg
const LEGEDGE = "#8f8672"; // scale edges
const CLAW = "#2c2721";
const EYE = "#241c14";
const EYEHI = "#f2ede2";
const QUILL = "#5d6168"; // crest quill base
const TIPWHITE = "#dfdcd1"; // tail feather tips

const DEG = Math.PI / 180;

// Feather silhouette: length along +x, width along y, pointed tip.
const featherOutline = (L: number, w: number): OutlinePoint[] => [
  [0, -w * 0.28],
  [L * 0.18, -w * 0.5],
  [L * 0.72, -w * 0.44],
  [L, 0, "sharp"],
  [L * 0.72, w * 0.44],
  [L * 0.18, w * 0.5],
];

export default function build() {
  const b = createBuilder({ name: "secretaryBirdKimi" });

  const bodyPaint = countershade(GREY, BELLY, { level: -0.15 });
  const legPaint = scales(LEGPALE, LEGEDGE, { size: 0.02 });
  const tailPaint = (band0: number, band1: number) =>
    paint((_p, _n, s) => (s[0] > band1 ? TIPWHITE : s[0] > band0 ? BLACK : GREY));

  // ---------------------------------------------------------------------------
  // SKELETON
  // ---------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.62, -0.06], role: "spine", group: "body" });

  const stations = [
    { at: [0, 0.64, -0.28] as const, w: 0.2, h: 0.22 }, // rump
    { at: [0, 0.68, -0.12] as const, w: 0.27, h: 0.29 }, // rear flank
    { at: [0, 0.7, 0.04] as const, w: 0.29, h: 0.31 }, // belly
    { at: [0, 0.74, 0.18] as const, w: 0.26, h: 0.3 }, // chest
    { at: [0, 0.8, 0.28] as const, w: 0.17, h: 0.2 }, // neck base
  ] as const;

  const spine = b.chain("spine", catmull(stations.map((s) => s.at)), {
    parent: hips,
    names: ["spine1", "spine2", "spine3", "spine4", "chest"],
    role: "spine",
    group: "body",
  });
  const chest = spine.joints[4];

  b.loft(stations, { bone: spine, color: bodyPaint, group: "body" });

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.78, 0.24],
      [0, 0.93, 0.3],
      [0, 1.07, 0.315],
      [0, 1.165, 0.31],
    ]),
    { parent: chest, names: ["neck1", "neck2", "neck3"], role: "neck", group: "body" },
  );
  b.sweep(neck, [0.085, 0.068, 0.056, 0.05], { color: bodyPaint, group: "body" });

  const head = b.joint("head", {
    parent: neck.joints[2],
    at: [0, 1.165, 0.31],
    dir: [0, -0.08, 1],
    role: "head",
    group: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.155, 0.36],
    dir: [0, -0.2, 1],
    role: "jaw",
    group: "head",
  });

  // ---------------------------------------------------------------------------
  // HEAD: skull, bare face mask, eyes, hooked beak, lower beak, crest quills
  // ---------------------------------------------------------------------------
  b.part(new SphereGeometry(0.075, 14, 12), GREY, {
    bone: head,
    at: [0, 1.195, 0.325],
    scale: [0.88, 1.0, 1.12],
    group: "head",
    name: "skull",
  });
  // Bare orange-red skin wrapping the beak base and eyes.
  b.part(new SphereGeometry(0.06, 14, 12), FACE, {
    bone: head,
    at: [0, 1.185, 0.372],
    scale: [0.95, 1.05, 0.75],
    group: "head",
    name: "face",
  });
  for (const s of [1, -1] as const) {
    b.part(new SphereGeometry(0.016, 8, 6), EYE, {
      bone: head,
      at: [s * 0.05, 1.2, 0.382],
      group: "head",
      name: `eye${s > 0 ? "L" : "R"}`,
    });
    b.part(new SphereGeometry(0.005, 5, 4), EYEHI, {
      bone: head,
      at: [s * 0.054, 1.208, 0.393],
      group: "head",
      name: `eyeHi${s > 0 ? "L" : "R"}`,
    });
  }
  // Hooked upper beak with a dark tip.
  b.sweep(
    bezier(
      [0, 1.205, 0.385],
      [0, 1.21, 0.44],
      [0, 1.175, 0.475],
      [0, 1.125, 0.46],
    ),
    [0.027, 0.021, 0.011, 0.001],
    {
      bone: head,
      detail: 0.75,
      bands: [
        [0.6, BEAK],
        [1, BEAKDARK],
      ],
      group: "head",
      name: "beakUpper",
    },
  );
  // Separate lower beak on the jaw joint so the mouth can open.
  b.sweep(bezier([0, 1.158, 0.385], [0, 1.148, 0.43], [0, 1.128, 0.452]), [0.016, 0.009, 0.001], {
    bone: jaw,
    detail: 0.75,
    color: BEAK,
    group: "head",
    name: "beakLower",
  });

  // Crest: a fan of long quills behind the head, dark with black tips.
  const crestLine = frame([0, 1.205, 0.27], [0, 0.3, -1]);
  b.ring(
    crestLine,
    { count: 12, radius: 0.045, fromDeg: -80, toDeg: 80, tilt: 40, joints: 4, name: "crest", parent: head, role: "fan" },
    (q) => {
      b.sweep(bezier(q.at, q.local([0, 0.08, 0.04]), q.local([0, 0.15, 0.09])), [0.0055, 0.0012], {
        bands: [
          [0.62, QUILL],
          [1, BLACK],
        ],
        group: "head",
        name: "quill",
      });
    },
  );

  // ---------------------------------------------------------------------------
  // LEGS: feathered black thighs, bare scaly lower legs, short toes + claws
  // ---------------------------------------------------------------------------
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const hip = [s * 0.085, 0.6, 0.0] as const;
    const footTarget = [s * 0.1, 0.03, 0.1] as const;
    const pts = limb(hip, footTarget, [0.24, 0.26, 0.22], [
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
      role: "leg",
      contact: [s * 0.1, 0, 0.13],
      group: `leg${side}`,
    });
    // Black feathered thigh ("plus fours"), puffy over the top of the leg.
    b.sweep(leg, [0.052, 0.075, 0.042], { from: 0, to: 0.4, color: BLACK, group: `leg${side}`, name: `thigh${side}` });
    // Bare scaly lower leg down to the toes.
    b.sweep(leg, [0.03, 0.021, 0.017], { from: 0.36, color: legPaint, group: `leg${side}`, name: `shin${side}` });

    // Short toes: three forward, one back, each a digit chain with a claw.
    const footJ = leg.joints[3];
    const toeDefs: [number, number][] = [
      [-24, 0.1],
      [0, 0.115],
      [24, 0.1],
      [180, 0.06],
    ];
    toeDefs.forEach(([deg, len], i) => {
      const a = deg * s * DEG;
      const start = new Vector3(s * 0.1, 0.028, 0.1);
      const end = new Vector3(s * 0.1 + Math.sin(a) * len, 0.008, 0.1 + Math.cos(a) * len);
      const toe = b.chain(`toe${side}${i + 1}`, [start, end], {
        parent: footJ,
        names: [`toe${side}${i + 1}`],
        role: "digit",
        group: `leg${side}`,
      });
      b.sweep(toe, [0.013, 0.008], { color: legPaint, group: `leg${side}` });
      const clawDir = end.clone().sub(start).normalize().add(new Vector3(0, -0.7, 0)).normalize();
      b.spike(end, clawDir, 0.02, 0.0055, { color: CLAW, bone: toe.joints[0], group: `leg${side}` });
    });
  }

  // ---------------------------------------------------------------------------
  // WINGS: folded, held slightly out; grey coverts, black flight feathers
  // ---------------------------------------------------------------------------
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const shoulder = new Vector3(s * 0.12, 0.73, 0.13);
    const elbow = new Vector3(s * 0.17, 0.7, -0.05);
    const wrist = new Vector3(s * 0.19, 0.64, -0.22);
    const wing = b.chain(`wing${side}`, [shoulder, elbow, wrist], {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "wing",
      group: `wing${side}`,
    });
    // Coverts: a flattened tube along the folded wing.
    b.sweep(wing, (t) => [0.026 - 0.007 * t, 0.058 - 0.022 * t], {
      color: WINGGREY,
      group: `wing${side}`,
      name: `coverts${side}`,
    });
    // Secondaries: short dark feathers along the forearm.
    for (let i = 0; i < 4; i++) {
      const base = shoulder.clone().lerp(elbow, 0.3 + 0.2 * i);
      const tip = new Vector3(s * (0.18 + 0.012 * i), 0.62 - 0.015 * i, -0.22 - 0.035 * i);
      const d = tip.clone().sub(base);
      b.extrude(featherOutline(d.length(), 0.06), {
        at: base,
        x: d,
        y: [0, 1, 0],
        thickness: 0.007,
        bevel: 0.003,
        smoothing: 1,
        color: SECONDARY,
        bone: wing.joints[1],
        group: `wing${side}`,
        name: `secondary${side}${i}`,
      });
    }
    // Primaries: long black feathers fanning back and down past the body.
    for (let i = 0; i < 6; i++) {
      const base = elbow.clone().lerp(wrist, 0.2 + 0.16 * i);
      const tip = new Vector3(s * (0.215 + 0.022 * i), 0.6 - 0.02 * i, -0.34 - 0.03 * i);
      const d = tip.clone().sub(base);
      b.extrude(featherOutline(d.length(), 0.06), {
        at: base,
        x: d,
        y: [0, 1, 0],
        thickness: 0.007,
        bevel: 0.003,
        smoothing: 1,
        color: BLACK,
        bone: wing.joints[2],
        group: `wing${side}`,
        name: `primary${side}${i}`,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // TAIL: grey fan with black band and pale tips, two long central feathers
  // ---------------------------------------------------------------------------
  const tail = b.chain(
    "tail",
    [
      [0, 0.66, -0.24],
      [0, 0.685, -0.38],
      [0, 0.7, -0.46],
    ],
    { parent: hips, names: ["tail1", "tail2"], role: "tail", group: "tail" },
  );
  const tailBase = new Vector3(0, 0.7, -0.27);
  for (let j = 0; j < 6; j++) {
    const a = (-27 + j * 10.8) * DEG;
    const dir = new Vector3(Math.sin(a), 0.18, -Math.cos(a));
    const up = new Vector3(Math.cos(a), 0, Math.sin(a));
    b.extrude(featherOutline(0.3, 0.075), {
      at: tailBase,
      x: dir,
      y: up,
      thickness: 0.008,
      bevel: 0.003,
      smoothing: 1,
      color: tailPaint(0.19, 0.25),
      bone: tail.joints[0],
      group: "tail",
      name: `tail${j}`,
    });
  }
  // The two long central tail feathers.
  for (const a of [-5 * DEG, 5 * DEG]) {
    const dir = new Vector3(Math.sin(a), 0.26, -Math.cos(a));
    const up = new Vector3(Math.cos(a), 0, Math.sin(a));
    b.extrude(featherOutline(0.52, 0.06), {
      at: tailBase,
      x: dir,
      y: up,
      thickness: 0.007,
      bevel: 0.003,
      smoothing: 1,
      color: tailPaint(0.33, 0.44),
      bone: tail.joints[1],
      group: "tail",
      name: "tailLong",
    });
  }
  // Pale undertail coverts below the fan.
  for (const a of [-9 * DEG, 0, 9 * DEG]) {
    const dir = new Vector3(Math.sin(a), -0.35, -Math.cos(a));
    const up = new Vector3(Math.cos(a), 0, Math.sin(a));
    b.extrude(featherOutline(0.15, 0.05), {
      at: [0, 0.66, -0.25],
      x: dir,
      y: up,
      thickness: 0.006,
      bevel: 0.002,
      smoothing: 1,
      detail: 0.6,
      color: BELLY,
      bone: tail.joints[0],
      group: "tail",
      name: "undertail",
    });
  }

  return b.root;
}
