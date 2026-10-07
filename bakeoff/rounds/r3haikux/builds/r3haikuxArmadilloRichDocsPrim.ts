import * as THREE from "three";
import {
  catmull,
  countershade,
  createBuilder,
  limb,
  paint,
  rng,
  scales,
  svg,
} from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "Nine-banded armadillo",
  description:
    "A trotting nine-banded armadillo: a banded shell over a pale belly, a pointed snout, tall leathery ears, clawed feet and a long tapering armoured tail, with coarse pale hairs between the bands.",
};

// Dusty pinkish-tan palette with darker seams and pale accents.
const SHELL = "#b48c7e";
const SHELL_LOW = "#a27b6e";
const SHELL_HI = "#c9a898";
const SEAM = "#66473f";
const SHIELD = "#ad8673";
const SHIELD_EDGE = "#7a5a50";
const BELLY = "#e4cbbf";
const LEG = "#9a7366";
const FOOT = "#8c6a5e";
const EAR = "#c7958e";
const JAW = "#a07a6e";
const NOSE = "#3a2a27";
const EYE = "#120d0c";
const CLAW = "#ece1d1";
const TAIL = "#a67c70";
const TAIL_RING = "#d2a998";
const HAIR = "#f3e8d6";

// Nine bands run across the mid-back, between a pelvic shield and a shoulder shield.
const BAND0 = -0.02;
const PITCH = 0.021;
const BAND1 = BAND0 + 9 * PITCH;

export default function build() {
  const b = createBuilder({ name: "nine-banded-armadillo" });

  // ---------- Skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.145, -0.1], role: "spine" });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.145, -0.1],
      [0, 0.15, 0.0],
      [0, 0.15, 0.11],
      [0, 0.145, 0.22],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.14, 0.2],
      [0, 0.16, 0.235],
      [0, 0.165, 0.26],
    ]),
    { parent: spine, names: ["neck1", "neck2"], role: "neck" },
  );

  const head = b.joint("head", {
    parent: neck,
    at: [0, 0.165, 0.26],
    aim: [0, 0.128, 0.42],
    role: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.13, 0.28],
    aim: [0, 0.118, 0.41],
    role: "jaw",
  });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.13, -0.12],
      [0, 0.118, -0.22],
      [0, 0.107, -0.31],
      [0, 0.097, -0.39],
      [0, 0.088, -0.46],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
      role: "tail",
    },
  );

  // ---------- Paint ----------
  const shieldPaint = scales(SHIELD, SHIELD_EDGE, { size: 0.022, seed: 4 });
  const bandPaint = paint((p) => {
    const k = (p.z - BAND0) / PITCH;
    const f = k - Math.floor(k);
    return f < 0.1 || f > 0.9 ? SEAM : SHELL_LOW;
  });
  const shellPaint = countershade(
    paint((p) => (p.z < BAND0 || p.z > BAND1 ? shieldPaint : bandPaint)),
    BELLY,
    { level: -0.2 },
  );
  const headPaint = scales(SHELL, SHIELD_EDGE, { size: 0.013, seed: 9 });

  // ---------- Body shell ----------
  const bulge = (t: number) => Math.sin(Math.PI * (0.1 + 0.8 * t));
  const shell = b.sweep(
    spine,
    (t: number) => [0.024 + 0.08 * bulge(t), 0.02 + 0.05 * bulge(t)],
    { sides: 10, color: shellPaint },
  );

  // Head: a tapering wedge ending in a pointed snout.
  const headTube = b.sweep(
    [
      [0, 0.165, 0.22],
      [0, 0.128, 0.42],
    ],
    (t: number) => [0.046 - 0.034 * t, 0.044 - 0.036 * t],
    {
      bone: head,
      color: headPaint,
      caps: { start: "round", end: "point" },
    },
  );

  // Lower jaw, separate so it can open.
  b.sweep(
    [
      [0, 0.13, 0.28],
      [0, 0.118, 0.41],
    ],
    [0.013, 0.004],
    { bone: jaw, color: JAW, caps: { start: "round", end: "point" } },
  );

  // ---------- Banded plates on the shell ----------
  const shellSurf = b.surface(shell);
  for (let k = 0; k < 9; k++) {
    const z = BAND0 + (k + 0.5) * PITCH;
    const band = shellSurf.loop([0, 0.148, z], { dir: [0, 0, 1], lift: 0 });
    b.along(band, 22, (at) => {
      const hit = shellSurf.nearest(at.at);
      if (hit.n.y > -0.25) {
        b.stick(new THREE.BoxGeometry(0.02, 0.007, PITCH * 0.86), SHELL_HI, hit, {
          embed: 0.25,
          flow: [0, 0, 1],
        });
      }
    });
  }

  // Coarse pale hairs poking out of the seams between the bands.
  const hairTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 48"><path d="M6 47 Q3 24 8 1" fill="none" stroke="${HAIR}" stroke-width="2.2" stroke-linecap="round"/></svg>`,
    { size: 256 },
  );
  const hairRand = rng(21);
  const hairs: ReturnType<typeof shellSurf.nearest>[] = [];
  for (let k = 1; k < 9; k++) {
    const z = BAND0 + k * PITCH;
    const seam = shellSurf.loop([0, 0.148, z], { dir: [0, 0, 1] });
    for (let i = 0; i < 6; i++) {
      const hit = shellSurf.nearest(seam.at(hairRand()));
      if (hit.n.y > -0.2) hairs.push(hit);
    }
  }
  b.cards(hairs, hairTex, {
    size: [0.012, 0.05],
    lean: 40,
    bend: 20,
    vary: 0.25,
    spin: 30,
    rng: hairRand,
  });

  // ---------- Head details ----------
  const headSurf = b.surface(headTube);
  for (const s of [1, -1]) {
    const eye = headSurf.nearest([s * 0.04, 0.16, 0.29]);
    b.stick(new THREE.SphereGeometry(0.0078, 6, 4), EYE, eye, { embed: 0.35 });
  }
  const nose = headSurf.nearest([0, 0.124, 0.44]);
  b.stick(new THREE.SphereGeometry(0.0105, 6, 4), NOSE, nose, { embed: 0.5 });

  // Tall leathery ears on the top-back of the skull.
  const earOutline: OutlinePoint[] = [
    [-0.024, 0],
    [0.024, 0],
    [0.03, 0.036],
    [0.012, 0.07],
    [-0.012, 0.07],
    [-0.03, 0.036],
  ];
  for (const s of [1, -1]) {
    b.extrude(earOutline, {
      at: head.local({ left: s * 0.022, up: 0.03, forward: -0.012 }),
      bone: head,
      x: [0, 0, 1],
      y: [0, 0.96, -0.29],
      thickness: 0.005,
      bevel: 0.002,
      smoothing: 2,
      color: EAR,
    });
  }

  // ---------- Legs and feet ----------
  const leg = (
    tag: string,
    hip: number[],
    foot: number[],
    bend: number[],
    lengths: number[],
    parent: typeof hips,
  ) => {
    const pts = limb(hip, foot, lengths, [bend]);
    const chain = b.chain(`leg${tag}`, pts, {
      parent,
      names: [`thigh${tag}`, `shin${tag}`, `foot${tag}`],
      role: "leg",
    });
    b.sweep(chain, (t: number) => 0.027 - 0.012 * t, { color: LEG });
    return chain.joints[chain.joints.length - 1];
  };

  const legs = [
    {
      tag: "FL",
      hip: [0.05, 0.11, 0.17],
      foot: [0.07, 0.012, 0.225],
      bend: [0, 0, -1],
      lengths: [0.07, 0.068],
      parent: spine.joints[2],
      front: true,
    },
    {
      tag: "FR",
      hip: [-0.05, 0.11, 0.17],
      foot: [-0.07, 0.012, 0.13],
      bend: [0, 0, -1],
      lengths: [0.07, 0.068],
      parent: spine.joints[2],
      front: true,
    },
    {
      tag: "HL",
      hip: [0.055, 0.11, -0.1],
      foot: [0.08, 0.012, -0.17],
      bend: [0, 0, 1],
      lengths: [0.078, 0.072],
      parent: hips,
      front: false,
    },
    {
      tag: "HR",
      hip: [-0.055, 0.11, -0.1],
      foot: [-0.08, 0.012, -0.02],
      bend: [0, 0, 1],
      lengths: [0.078, 0.072],
      parent: hips,
      front: false,
    },
  ];

  for (const L of legs) {
    const paw = leg(L.tag, L.hip, L.foot, L.bend, L.lengths, L.parent);

    // Sturdy block foot resting on the floor.
    const pad = L.front ? [0.04, 0.022, 0.05] : [0.044, 0.022, 0.056];
    b.part(new THREE.BoxGeometry(pad[0], pad[1], pad[2]), FOOT, {
      bone: paw,
      at: [L.foot[0], 0.012, L.foot[2] + 0.004],
    });

    // Claws: long and curved-looking on the front, shorter on the hind.
    const reach = L.front ? 0.027 : 0.031;
    const clawLen = L.front ? 0.03 : 0.025;
    const dir = L.front ? [0, -0.45, 1] : [0, -0.5, 1];
    const toes = L.front
      ? [-0.012, -0.004, 0.004, 0.012]
      : [-0.014, -0.005, 0.005, 0.014];
    for (const x of toes) {
      const base = paw.moved(paw.local({ forward: reach, left: x }));
      b.spike(base, dir, clawLen, 0.0036, { color: CLAW, bone: paw });
    }
  }

  // ---------- Armoured tail ----------
  const tailTube = b.sweep(tail, (t: number) => 0.022 * (1 - t) ** 1.1 + 0.003, {
    color: TAIL,
    caps: { start: "round", end: "point" },
  });
  const tailSurf = b.surface(tailTube);
  for (let i = 1; i <= 8; i++) {
    const ring = tailSurf.loop(tail.at(0.1 + i * 0.09), { lift: 0.0015 });
    b.sweep(ring, 0.003, { color: TAIL_RING });
  }

  return b.root;
}
