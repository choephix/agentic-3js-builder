import * as THREE from "three";
import { createBuilder, catmull, limb, rng, stripes } from "../../../../src/index";

export const meta = {
  name: "Nine-banded armadillo",
  description: "A trotting nine-banded armadillo with a banded pink-tan shell, tall leathery ears, clawed feet and a tapering armoured tail.",
};

// Palette
const SHELL = "#c79f8e";
const SHELL_LIGHT = "#dcbdac";
const SEAM = "#8e6a5e";
const BELLY = "#e9d8c9";
const LEG = "#a9806f";
const EAR = "#a77b6c";
const CLAW = "#efe4d3";
const HAIR = "#f4ebdc";
const EYE = "#120d0c";
const NOSE = "#2a2120";

// Nine bands run across the mid-back, between the head shield and the pelvic shield.
const BANDS = 9;
const Z0 = -0.12;
const Z1 = 0.12;
const BAND = (Z1 - Z0) / BANDS;

// Shell cross-sections along the body: centre height, full width, full height.
const SHELL_STATIONS = [
  { z: -0.21, y: 0.2, w: 0.05, h: 0.07 },
  { z: -0.16, y: 0.2, w: 0.16, h: 0.13 },
  { z: -0.07, y: 0.205, w: 0.2, h: 0.15 },
  { z: 0.02, y: 0.21, w: 0.22, h: 0.155 },
  { z: 0.1, y: 0.215, w: 0.21, h: 0.15 },
  { z: 0.17, y: 0.22, w: 0.18, h: 0.13 },
];

function shellAt(z: number) {
  const S = SHELL_STATIONS;
  if (z <= S[0].z) return S[0];
  for (let i = 0; i < S.length - 1; i++) {
    const a = S[i];
    const c = S[i + 1];
    if (z <= c.z) {
      const t = (z - a.z) / (c.z - a.z);
      return {
        y: a.y + (c.y - a.y) * t,
        w: a.w + (c.w - a.w) * t,
        h: a.h + (c.h - a.h) * t,
      };
    }
  }
  return S[S.length - 1];
}

export default function build() {
  const b = createBuilder({ name: "armadillo" });

  // ---- Skeleton -----------------------------------------------------------

  // Body spine: hips (root), back, chest.
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.2, -0.14],
      [0, 0.21, -0.01],
      [0, 0.215, 0.09],
      [0, 0.22, 0.14],
    ]),
    { names: ["hips", "back", "chest"], role: "spine" },
  );
  const hips = spine.joints[0];
  const chest = spine.joints[2];

  // Short neck from the chest up to the head.
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.22, 0.14],
      [0, 0.235, 0.2],
      [0, 0.24, 0.245],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 0.24, 0.245],
    aim: [0, 0.215, 0.39],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.2, 0.3],
    aim: [0, 0.19, 0.4],
    role: "jaw",
  });

  // Long armoured tail from the hips, tapering to a point.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.2, -0.17],
      [0, 0.2, -0.27],
      [0, 0.18, -0.37],
      [0, 0.16, -0.45],
      [0, 0.15, -0.5],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // ---- Body ---------------------------------------------------------------

  // Banded shell: alternating plate tones along the body.
  const shellPaint = stripes(SHELL_LIGHT, SHELL, { size: BAND * 2, axis: "z" });
  const shell = b.loft(
    SHELL_STATIONS.map((s) => ({ at: [0, s.y, s.z], w: s.w, h: s.h })),
    { bone: spine, color: shellPaint },
  );
  const shellSurf = b.surface(shell);

  // Soft pale underside peeking out below the shell edge.
  b.loft(
    [
      { at: [0, 0.165, -0.19], w: 0.09, h: 0.08 },
      { at: [0, 0.16, -0.1], w: 0.13, h: 0.1 },
      { at: [0, 0.16, 0.02], w: 0.14, h: 0.1 },
      { at: [0, 0.165, 0.13], w: 0.12, h: 0.1 },
      { at: [0, 0.175, 0.19], w: 0.09, h: 0.08 },
    ],
    { bone: spine, color: BELLY },
  );

  // Overlapping band edges: a raised ridge at each band boundary.
  for (let i = 0; i <= BANDS; i++) {
    const z = Z0 + i * BAND;
    const sh = shellAt(z);
    const ridge: number[][] = [];
    for (let deg = -120; deg <= 120; deg += 20) {
      const a = (deg * Math.PI) / 180;
      ridge.push([
        Math.sin(a) * (sh.w / 2 + 0.005),
        sh.y + Math.cos(a) * (sh.h / 2 + 0.005),
        z,
      ]);
    }
    b.sweep(catmull(ridge), 0.0065, { color: SEAM });
  }

  // Coarse pale hairs poking out of the gaps between the bands.
  const rand = rng(11);
  for (let i = 1; i < BANDS; i++) {
    const z = Z0 + i * BAND;
    const sh = shellAt(z);
    for (const side of [1, -1]) {
      for (const deg of [50, 85, 118]) {
        const a = ((deg + (rand() - 0.5) * 14) * Math.PI) / 180;
        const p = [
          side * Math.sin(a) * (sh.w / 2),
          sh.y + Math.cos(a) * (sh.h / 2),
          z + (rand() - 0.5) * 0.006,
        ];
        const hit = shellSurf.nearest(p);
        b.spike(hit, hit, 0.04, 0.0032, { color: HAIR });
      }
    }
  }

  // ---- Head ---------------------------------------------------------------

  const headLoft = b.loft(
    [
      { at: [0, 0.235, 0.19], w: 0.13, h: 0.12 },
      { at: [0, 0.235, 0.26], w: 0.13, h: 0.12 },
      { at: [0, 0.225, 0.32], w: 0.1, h: 0.09 },
      { at: [0, 0.215, 0.36], w: 0.05, h: 0.05 },
      { at: [0, 0.21, 0.39], w: 0.02, h: 0.02 },
    ],
    { bone: head, color: SHELL },
  );

  // Separate lower jaw so the mouth can open.
  b.loft(
    [
      { at: [0, 0.2, 0.28], w: 0.08, h: 0.05 },
      { at: [0, 0.19, 0.34], w: 0.05, h: 0.035 },
      { at: [0, 0.188, 0.38], w: 0.015, h: 0.015 },
    ],
    { bone: jaw, color: BELLY },
  );

  // Tall leathery ears, one per side, standing up and leaning back.
  for (const side of [1, -1]) {
    b.extrude(
      [
        [-0.024, 0],
        [-0.032, 0.035],
        [-0.026, 0.07],
        [-0.01, 0.085],
        [0.012, 0.085],
        [0.028, 0.07],
        [0.032, 0.035],
        [0.024, 0],
      ],
      {
        at: [side * 0.045, 0.27, 0.215],
        x: [0, 0, 1],
        y: [side * 0.2, 1, -0.25],
        thickness: 0.008,
        bevel: 0.003,
        smoothing: 1,
        color: EAR,
        bone: head,
      },
    );
  }

  // Small beady eyes set into the sides of the skull.
  for (const side of [1, -1]) {
    const eyeHit = b.surface(headLoft).nearest([side * 0.06, 0.25, 0.28]);
    b.stick(new THREE.SphereGeometry(0.009, 8, 6), EYE, eyeHit, { embed: 0.35 });
  }

  // Nose at the tip of the snout.
  const noseHit = b.surface(headLoft).nearest([0, 0.21, 0.42]);
  b.stick(new THREE.SphereGeometry(0.011, 8, 6), NOSE, noseHit, { embed: 0.35 });

  // ---- Tail ---------------------------------------------------------------

  const tailPaint = stripes(SHELL, SEAM, { size: 0.03, axis: "z" });
  b.sweep(tail, [0.046, 0.004], {
    color: tailPaint,
    caps: { start: "round", end: "point" },
  });

  // ---- Legs and feet ------------------------------------------------------

  // Trot: front-left and hind-right step forward together, the other diagonal back.
  const legs = [
    {
      side: "FL",
      root: [0.08, 0.17, 0.13],
      foot: [0.085, 0.02, 0.2],
      names: ["shoulderFL", "elbowFL", "footFL"],
      front: true,
    },
    {
      side: "FR",
      root: [-0.08, 0.17, 0.13],
      foot: [-0.085, 0.02, 0.09],
      names: ["shoulderFR", "elbowFR", "footFR"],
      front: true,
    },
    {
      side: "HL",
      root: [0.08, 0.17, -0.12],
      foot: [0.085, 0.02, -0.2],
      names: ["hipHL", "kneeHL", "footHL"],
      front: false,
    },
    {
      side: "HR",
      root: [-0.08, 0.17, -0.12],
      foot: [-0.085, 0.02, -0.05],
      names: ["hipHR", "kneeHR", "footHR"],
      front: false,
    },
  ];

  for (const L of legs) {
    const parent = L.front ? chest : hips;
    // Front elbows point back, hind knees point forward.
    const pts = limb(L.root, L.foot, [0.095, 0.09], [L.front ? [0, 0, -1] : [0, 0, 1]]);
    const leg = b.chain(`leg${L.side}`, pts, { parent, names: L.names, role: "leg" });

    const r: [number, number] = L.front ? [0.03, 0.02] : [0.04, 0.021];
    b.sweep(leg, r, { color: LEG });

    // Sturdy foot pad lying flat on the floor, riding the foot joint.
    const foot = leg.tip!;
    const fx = L.foot[0];
    const fz = L.foot[2];
    const padW = L.front ? 0.05 : 0.042;
    b.frustumBox(
      [fx, 0.015, fz - 0.025],
      [fx, 0.015, fz + 0.025],
      [padW, 0.03],
      [padW * 0.8, 0.03],
      { bone: foot, color: LEG },
    );

    // Four ivory claws along the front of each foot.
    const gap = L.front ? 0.013 : 0.011;
    for (let k = 0; k < 4; k++) {
      const cx = fx + (k - 1.5) * gap;
      b.spike(
        [cx, 0.022, fz + 0.022],
        [0, -0.35, 1],
        L.front ? 0.04 : 0.024,
        L.front ? 0.0055 : 0.004,
        { color: CLAW, bone: foot },
      );
    }
  }

  return b.root;
}
