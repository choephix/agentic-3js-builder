import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Joint } from "../src/skeleton";
import { line } from "../src/frame";
import { offset, rng } from "../src/math";
import { catmull, polyline } from "../src/path";
import { limb } from "../src/ik";
import { countershade, grain, mottle, patches } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Grumpy Cyclops",
  description:
    "A grumpy one-eyed cyclops giant with a knobbly club: a storybook whimsical monster with a mossy green hide, a heavy scowling brow, a patched burlap loincloth, a bone bead necklace and a rope-wrapped club.",
  style: "whimsical",
  commit: "b816db2",
};

// Palette: mossy green hide, warm burlap, honey wood, cream ivory.
const SKIN = "#7cc49b";
const SKIN_DEEP = "#4f9c77";
const SKIN_LIGHT = "#b8e4c6";
const EYE_WHITE = "#fbf7ea";
const BROW = "#2c5a47";
const MOUTH = "#5b1f2e";
const LIP = "#c4625f";
const TUSK = "#f7eed6";
const BURLAP = "#caa05c";
const BURLAP_DEEP = "#9c6b37";
const ROPE = "#7a5632";
const WOOD = "#b07b45";
const WOOD_DEEP = "#7a4a22";
const METAL = "#b8bcc8";
const BONE = "#f3e8cf";
const AMBER = "#e8b85a";
const HAIR = "#2f6140";
const KNOT = "#5a3516";
const EAR_PINK = "#ec9e9a";

type V = [number, number, number];

// Piecewise smooth ramp over t in [0, 1], keys are [t, value].
function ramp(t: number, keys: [number, number][]): number {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    if (t <= t1) {
      const [t0, v0] = keys[i - 1];
      const u = (t - t0) / (t1 - t0);
      return v0 + (v1 - v0) * (u * u * (3 - 2 * u));
    }
  }
  return keys[keys.length - 1][1];
}

const along = (p: V, d: V, k: number): V => [p[0] + d[0] * k, p[1] + d[1] * k, p[2] + d[2] * k];

const TORSO_RX: [number, number][] = [
  [0, 0.36],
  [0.2, 0.44],
  [0.4, 0.52],
  [0.7, 0.46],
  [0.9, 0.5],
  [1, 0.44],
];
const TORSO_RY: [number, number][] = [
  [0, 0.3],
  [0.2, 0.36],
  [0.4, 0.44],
  [0.7, 0.38],
  [0.9, 0.34],
  [1, 0.3],
];

export default function build() {
  const b = createBuilder({ name: "grumpyCyclops" });
  const rand = rng(21);

  const skinPaint = countershade(mottle(SKIN, SKIN_DEEP, { size: 0.3, contrast: 0.5, seed: 4 }), SKIN_LIGHT, {
    level: 0.15,
  });
  const tuft = svg(
    `<svg viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round">
        <path d="M20 80 Q16 50 6 24"/>
        <path d="M22 80 Q24 46 34 20"/>
        <path d="M20 80 Q20 44 19 10"/>
        <path d="M18 80 Q12 56 12 36" stroke="#cfcfcf"/>
      </g>
    </svg>`,
    { size: 128 },
  );
  const eyeTex = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="e"><circle cx="50" cy="50" r="49"/></clipPath></defs>
      <g clip-path="url(#e)">
        <rect width="100" height="100" fill="#fbf7ea"/>
        <circle cx="52" cy="60" r="27" fill="#3f86d9"/>
        <circle cx="52" cy="60" r="27" fill="none" stroke="#2457a3" stroke-width="3"/>
        <circle cx="52" cy="60" r="11" fill="#14203a"/>
        <circle cx="45" cy="52" r="5" fill="#ffffff"/>
        <path d="M0 0 H100 V22 L50 40 L0 22 Z" fill="#4f9c77"/>
        <path d="M0 22 L50 40 L100 22" fill="none" stroke="#24453a" stroke-width="5"/>
      </g>
    </svg>`,
    { size: 256 },
  );
  const blush = svg(
    `<svg viewBox="0 0 40 30" xmlns="http://www.w3.org/2000/svg"><ellipse cx="20" cy="15" rx="17" ry="11" fill="#f48f8c"/></svg>`,
    { size: 64 },
  );

  // Skeleton: hips root, a spine that bulges forward at the belly, neck, head, jaw.
  const hips = b.joint("hips", { at: [0, 1.15, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.15, 0],
      [0, 1.45, 0.06],
      [0, 1.75, 0.1],
      [0, 2.02, 0.04],
      [0, 2.18, -0.02],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "spine4"], role: "spine" },
  );
  const chestJoint = spine.joints[3];

  const neck = b.chain(
    "neck",
    catmull([
      [0, 2.1, 0],
      [0, 2.27, 0.04],
      [0, 2.39, 0.06],
    ]),
    { parent: chestJoint, names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const neckTip = neck.joints[neck.joints.length - 1];
  const head = b.joint("head", { parent: neckTip, at: [0, 2.46, 0.04], aim: [0, 2.38, 0.6], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.1, up: -0.16 }),
    aim: head.local({ forward: 0.4, up: -0.18 }),
    role: "jaw",
  });

  // Torso: one tube over the spine, wider at the belly and shoulders.
  const torso = b.sweep(spine, (t) => [ramp(t, TORSO_RX), ramp(t, TORSO_RY)], { color: skinPaint });
  const torsoSurf = b.surface(torso);
  const frontAt = (y: number) => {
    const h = torsoSurf.ray([0, y, 2], [0, 0, -1]);
    if (!h) throw new Error(`no torso front at y=${y}`);
    return h;
  };

  // A scar across the chest and a belly button.
  const scar = torsoSurf.drape(
    [
      [-0.3, 1.8, 0.36],
      [-0.16, 1.74, 0.42],
      [-0.02, 1.72, 0.44],
    ],
    { lift: 0.005 },
  );
  b.sweep(scar, 0.008, { color: SKIN_DEEP });
  b.stick(new THREE.SphereGeometry(0.03, 8, 6), SKIN_DEEP, frontAt(1.6), { embed: 0.5 });
  // Back: warts and a few coarse tufts down the spine.
  for (const h of torsoSurf.scatter(16, { rng: rand, minDist: 0.12, filter: (h) => h.n.z < -0.4 }))
    b.stick(new THREE.SphereGeometry(0.03, 7, 5), SKIN_DEEP, h, { embed: 0.5 });
  b.cards(
    torsoSurf.scatter(18, { rng: rand, minDist: 0.1, filter: (h) => h.n.z < -0.6 && h.n.y > -0.2 }),
    tuft,
    { size: [0.06, 0.12], lean: 20, bend: 20, vary: 0.3, rng: rand, color: HAIR },
  );

  // Belt, buckle, and the patched burlap loincloth hanging from it.
  const belt = torsoSurf.loop(spine.joints[1], { lift: 0.03 });
  b.sweep(belt, 0.035, { color: ROPE });
  b.along(belt, 10, (at) => b.part(new THREE.SphereGeometry(0.013, 6, 4), BONE, { at, bone: spine.joints[1] }));
  b.stick(new THREE.TorusGeometry(0.055, 0.016, 6, 10), METAL, frontAt(1.45).moved([0, 0.05, 0]), { embed: 0.2 });
  const flapAt = frontAt(1.42).moved([0, 0.03, 0]);
  b.extrude(
    [
      [-0.25, 0.0],
      [0.25, 0.0],
      [0.27, -0.35],
      [0.24, -0.62],
      [0.1, -0.72],
      [0.0, -0.64, "sharp"],
      [-0.1, -0.72],
      [-0.24, -0.62],
      [-0.27, -0.35],
    ],
    {
      at: flapAt,
      x: [1, 0, 0],
      y: [0, 1, 0.25],
      thickness: 0.035,
      bevel: 0.008,
      smoothing: 1,
      color: patches(BURLAP, BURLAP_DEEP, { size: 0.12, gap: 0.012 }),
    },
  );

  // Bone bead necklace across the chest, with a tooth pendant at the middle.
  const cord = catmull([
    [-0.36, 2.14, 0.28],
    [-0.2, 1.98, 0.42],
    [0, 1.9, 0.46],
    [0.2, 1.98, 0.42],
    [0.36, 2.14, 0.28],
  ]);
  b.sweep(cord, 0.01, { color: ROPE });
  b.along(cord, 11, (at) => b.part(new THREE.SphereGeometry(0.03, 6, 5), BONE, { at, bone: chestJoint }));
  b.part(new THREE.SphereGeometry(0.045, 10, 8), AMBER, {
    bone: chestJoint,
    at: [0, 1.84, 0.49],
    scale: [0.8, 1.2, 0.7],
  });

  // Legs: a limb that plants each foot on the floor.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip: V = [s * 0.22, 1.15, 0];
    const ankle: V = [s * 0.24, 0.2, 0.02];
    const leg = b.chain(`leg${side}`, limb(hip, ankle, [0.5, 0.48], [[0, 0, 1]]), {
      parent: hips,
      names: [`thigh${side}`, `shin${side}`, `foot${side}`],
      role: "leg",
    });
    const footJ = leg.joints[leg.joints.length - 1];
    b.sweep(leg, [0.22, 0.17, 0.12], { color: skinPaint });
    b.part(new THREE.SphereGeometry(0.13, 14, 10), SKIN, {
      bone: footJ,
      at: [s * 0.24, 0.075, 0.1],
      scale: [1.0, 0.55, 1.45],
    });
    for (let i = 0; i < 3; i++) {
      b.part(new THREE.SphereGeometry(0.04, 8, 6), SKIN_LIGHT, {
        bone: footJ,
        at: [s * (0.24 + (i - 1) * 0.06), 0.045, 0.25],
        scale: [1, 0.9, 1],
      });
      b.part(new THREE.SphereGeometry(0.018, 6, 4), BONE, {
        bone: footJ,
        at: [s * (0.24 + (i - 1) * 0.06), 0.03, 0.285],
        scale: [1, 0.6, 1],
      });
    }
  }

  // Arms. Left hangs loose; right holds the club.
  const G: V = [-0.64, 1.25, 0.18];
  const CLUB: V = [-0.2, -0.83, 0.52];
  let rightHand: Joint | null = null;
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulder: V = [s * 0.46, 2.06, 0];
    const hand: V = s > 0 ? [0.6, 1.3, 0.18] : G;
    const arm = b.chain(`arm${side}`, limb(shoulder, hand, [0.46, 0.44], [[0, 0, -1]]), {
      parent: chestJoint,
      names: [`upperArm${side}`, `foreArm${side}`, `hand${side}`],
      role: "arm",
    });
    const handJ = arm.joints[arm.joints.length - 1];
    b.sweep(arm, [0.13, 0.11, 0.095], { color: skinPaint });
    b.part(new THREE.SphereGeometry(0.2, 14, 10), skinPaint, { bone: arm.joints[0], at: shoulder, scale: [1, 0.9, 1] });
    b.part(new THREE.SphereGeometry(0.1, 12, 9), SKIN, { bone: handJ, at: hand, scale: [1, 0.9, 1.1] });
    const gripAxis: V = s > 0 ? [0, 0, 1] : CLUB;
    b.ring(line(hand, along(hand, gripAxis, 0.12)), { count: 4, radius: 0.075 }, (f) =>
      b.part(new THREE.SphereGeometry(0.038, 8, 6), SKIN_LIGHT, { bone: handJ, at: f }),
    );
    if (s < 0) rightHand = handJ;
  }
  if (!rightHand) throw new Error("right hand joint missing");
  const handBone: Joint = rightHand;

  // The club: a wood handle, a knobbly bulb with nails, rope wraps. It rides the right hand.
  const H = along(G, CLUB, 1.2);
  const B = along(G, CLUB, -0.25);
  const clubWood = grain(WOOD, WOOD_DEEP, { size: 0.03, axis: CLUB });
  const handle = b.sweep(polyline([B, H]), [0.028, 0.046], { color: clubWood, bone: handBone });
  const bulb = b.lathe(
    [
      [0, -0.22],
      [0.1, -0.21],
      [0.17, -0.12],
      [0.2, 0],
      [0.18, 0.12],
      [0.12, 0.2],
      [0, 0.23],
    ],
    { at: H, axis: CLUB, smoothing: 1, color: clubWood, bone: handBone },
  );
  const bulbSurf = b.surface(bulb);
  for (const h of bulbSurf.scatter(12, { rng: rand, minDist: 0.075, filter: (h) => h.n.y > -0.5 }))
    b.spike(h, h, 0.055, 0.016, { color: METAL, bone: handBone });
  for (const h of bulbSurf.scatter(9, { rng: rand, minDist: 0.09 }))
    b.stick(new THREE.SphereGeometry(0.03, 8, 6), KNOT, h, { embed: 0.4, bone: handBone });
  const handleSurf = b.surface(handle);
  for (const k of [-0.2, 0.22])
    b.sweep(handleSurf.loop(along(G, CLUB, k), { dir: CLUB, lift: 0.008 }), 0.011, { color: ROPE, bone: handBone });

  // Head: a big round skull, cheeks, nose, ears, a heavy brow and one enormous eye.
  const skullPart = b.part(new THREE.SphereGeometry(0.34, 20, 14), skinPaint, {
    bone: head,
    at: head.at,
    scale: [1.04, 0.98, 0.96],
  });
  const skull = b.surface(skullPart);
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.12, 12, 9), skinPaint, {
      bone: head,
      at: head.local({ left: s * 0.2, up: -0.1, forward: 0.2 }),
      scale: [1, 0.85, 1],
    });
    b.part(new THREE.SphereGeometry(0.018, 6, 4), MOUTH, {
      bone: head,
      at: head.local({ left: s * 0.035, up: -0.085, forward: 0.37 }),
    });
    b.decal(skullPart, blush, {
      at: head.local({ left: s * 0.24, up: -0.07, forward: 0.26 }),
      dir: [s * 0.6, 0, 0.8],
      size: [0.13, 0.1],
      bone: head,
    });
    b.extrude(
      [
        [-0.07, 0.06],
        [0.03, 0.13],
        [0.1, 0.07],
        [0.09, -0.06],
        [0, -0.11],
        [-0.07, -0.05],
      ],
      {
        at: head.local({ left: s * 0.36, up: 0, forward: -0.02 }),
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.05,
        bevel: 0.012,
        detail: 0.6,
        smoothing: 2,
        color: SKIN_DEEP,
        bone: head,
      },
    );
    b.extrude(
      [
        [-0.04, 0.04],
        [0.02, 0.08],
        [0.06, 0.04],
        [0.05, -0.04],
        [0, -0.07],
        [-0.04, -0.03],
      ],
      {
        at: head.local({ left: s * 0.39, up: 0, forward: -0.02 }),
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.02,
        bevel: 0.005,
        detail: 0.6,
        smoothing: 2,
        color: EAR_PINK,
        bone: head,
      },
    );
  }

  // Warts: a cheek, the chin and the shoulder.
  for (const p of [
    head.local({ left: -0.24, up: -0.12, forward: 0.22 }),
    head.local({ left: 0.06, up: -0.26, forward: 0.2 }),
  ]) {
    const w = skull.nearest(p);
    b.stick(new THREE.SphereGeometry(0.022, 7, 5), SKIN_DEEP, w, { embed: 0.5, bone: head });
  }

  b.part(new THREE.SphereGeometry(0.07, 12, 9), SKIN, {
    bone: head,
    at: head.local({ forward: 0.31, up: -0.06 }),
    scale: [1, 0.85, 0.9],
  });

  // The one eye: an oversized white ball in a dark socket, with a decal iris under a scowling lid.
  const eyeC = head.local({ forward: 0.28, up: 0 });
  b.part(new THREE.SphereGeometry(0.17, 18, 12), SKIN_DEEP, {
    bone: head,
    at: head.local({ forward: 0.2, up: 0 }),
    scale: [1, 1, 0.6],
  });
  const eye = b.part(new THREE.SphereGeometry(0.15, 18, 12), EYE_WHITE, { bone: head, at: eyeC });
  b.decal(eye, eyeTex, { at: offset(eyeC, [0, 0, 1], 0.14), dir: [0, 0, 1], size: [0.3, 0.3], bone: head });

  // Heavy brow: a V that hugs the skull just above the eye.
  const browPts: [number, number, number][] = [
    [0.32, 0.25, 0.2],
    [0.2, 0.2, 0.3],
    [0, 0.165, 0.36],
    [-0.2, 0.2, 0.3],
    [-0.32, 0.25, 0.2],
  ];
  b.sweep(
    skull.drape(
      browPts.map(([x, y, z]) => head.local({ left: x, up: y, forward: z })),
      { lift: 0.025 },
    ),
    [0.035, 0.07, 0.078, 0.07, 0.035],
    { color: BROW },
  );

  // Mouth: a frown draped on the skull, a lower lip and chin on the jaw, two tusks.
  const mouthPts: [number, number, number][] = [
    [0.2, -0.2, 0.25],
    [0.1, -0.15, 0.31],
    [0, -0.13, 0.34],
    [-0.1, -0.15, 0.31],
    [-0.2, -0.2, 0.25],
  ];
  b.sweep(
    skull.drape(
      mouthPts.map(([x, y, z]) => head.local({ left: x, up: y, forward: z })),
      { lift: 0.006 },
    ),
    0.014,
    { color: MOUTH },
  );
  b.part(new THREE.SphereGeometry(0.085, 14, 10), LIP, {
    bone: jaw,
    at: jaw.local({ forward: 0.2, up: 0.02 }),
    scale: [1.25, 0.42, 0.7],
  });
  b.part(new THREE.SphereGeometry(0.13, 10, 8), SKIN, {
    bone: jaw,
    at: jaw.local({ forward: 0.1, up: -0.12 }),
    scale: [1.1, 0.8, 1.0],
  });
  for (const s of [1, -1])
    b.spike(jaw.local({ left: s * 0.11, forward: 0.2, up: -0.02 }), [s * 0.22, 1, 0.1], 0.1, 0.024, {
      color: TUSK,
      bone: jaw,
    });

  // Grumpy forehead creases and a shaggy tuft of hair.
  for (const dy of [0, 0.03]) {
    b.sweep(
      skull.drape(
        [
          head.local({ left: -0.16, up: 0.3 + dy, forward: 0.22 }),
          head.local({ left: 0, up: 0.32 + dy, forward: 0.27 }),
          head.local({ left: 0.16, up: 0.3 + dy, forward: 0.22 }),
        ],
        { lift: 0.006 },
      ),
      0.008,
      { color: SKIN_DEEP },
    );
  }
  const hairHits = skull.scatter(55, { rng: rand, minDist: 0.06, filter: (h) => h.n.y > 0.45 });
  b.cards(hairHits, tuft, { size: [0.08, 0.16], lean: 15, bend: 25, vary: 0.3, rng: rand, color: HAIR });

  return b.root;
}
