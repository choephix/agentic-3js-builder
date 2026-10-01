import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { Joint } from "../src/skeleton";
import type { Sweep } from "../src/sweep";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { arc, catmull } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Sleepy Sloth",
  description:
    "A fluffy, flat-shaded low-poly sloth dozing upside down from a leafy branch on two posts, claws hooked over the bark, in a nightcap with a pompom and a sprig of moss on its back.",
};

// ---- palette ---------------------------------------------------------------------------------------------------
const FUR = "#d9b692"; // caramel coat
const FUR_DARK = "#b98f6c"; // limbs and back stripe
const FUR_PALE = "#f4e6cf"; // face, chest
const MASK = "#7a5446"; // eye mask
const CLAW = "#fbeed3";
const NOSE = "#4a2f2c";
const CAP_PINK = "#ff9fc0";
const CAP_CREAM = "#fff6ee";
const BARK = "#9c7453";
const BARK_DARK = "#7d5a3d";
const WOOD = "#e3bd8c";
const FOOT = "#c59463";
const ROPE = "#9adfd0";
const ROPE_DARK = "#6cbfae";
const MOSS = "#7fd08e";
const MOSS_DARK = "#56b574";

// ---- drawings ----------------------------------------------------------------------------------------------------
// Face: eye mask, sleepy closed eyes, brows, blush and a little cat smile (viewBox 1 unit = 1 mm on the decal).
const FACE = svg(
  `<svg viewBox="0 0 230 130" xmlns="http://www.w3.org/2000/svg">
    <g id="side">
      <path d="M98 44 C86 35 58 38 40 56 C30 66 22 80 26 85 C32 90 44 83 58 83 C80 83 98 75 102 60 C104 53 102 48 98 44 Z" fill="${MASK}"/>
      <path d="M50 62 Q70 84 90 62" fill="none" stroke="#fff3e0" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M51 64 L41 60 M57 73 L48 79" fill="none" stroke="#fff3e0" stroke-width="4" stroke-linecap="round"/>
      <path d="M56 29 Q72 22 88 29" fill="none" stroke="#b58c74" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="42" cy="100" rx="16" ry="8.5" fill="#ff9fb3"/>
      <path d="M33 103 L38 95 M41 105 L46 97 M49 103 L53 96" fill="none" stroke="#ff7b98" stroke-width="2.6" stroke-linecap="round"/>
    </g>
    <use href="#side" transform="translate(230 0) scale(-1 1)"/>
    <path d="M96 100 Q105.5 111 115 101 Q124.5 111 134 100" fill="none" stroke="#5a3a33" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M84 98 Q86 110 97 110 M146 98 Q144 110 133 110" fill="none" stroke="#5a3a33" stroke-width="4.4" stroke-linecap="round"/>
  </svg>`,
  { size: 1024 },
);

// Fur tuft (grey: tinted by the card colour).
const TUFT = svg(
  `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0 C21 12 31 28 29 48 L3 48 C1 28 11 12 16 0 Z" fill="#ffffff"/>
    <path d="M16 12 C18 22 22 34 21 48 L13 48 C12 34 14 22 16 12 Z" fill="#dcdcdc"/>
  </svg>`,
  { size: 128 },
);

const LEAF = svg(
  `<svg viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 2 C34 14 38 34 20 58 C2 34 6 14 20 2 Z" fill="#6ec788"/>
    <path d="M20 2 C34 14 38 34 20 58 Z" fill="#8fdc9b"/>
    <path d="M20 10 L20 62" fill="none" stroke="#3f9f63" stroke-width="3" stroke-linecap="round"/>
    <path d="M20 26 L29 18 M20 36 L12 28 M20 44 L28 37" fill="none" stroke="#3f9f63" stroke-width="2.4" stroke-linecap="round"/>
  </svg>`,
  { size: 192 },
);

const FLOWER = svg(
  `<svg viewBox="0 0 48 64" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 64 L24 34" fill="none" stroke="#4da96a" stroke-width="4" stroke-linecap="round"/>
    <circle cx="24" cy="14" r="9" fill="#ffb3cb"/><circle cx="36" cy="22" r="9" fill="#ffb3cb"/>
    <circle cx="32" cy="36" r="9" fill="#ffb3cb"/><circle cx="16" cy="36" r="9" fill="#ffb3cb"/>
    <circle cx="12" cy="22" r="9" fill="#ffb3cb"/>
    <circle cx="24" cy="26" r="7.5" fill="#ffe27a"/>
  </svg>`,
  { size: 192 },
);

const GRASS = svg(
  `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 48 C8 30 10 18 8 6 C16 16 20 32 20 48 Z" fill="#7fd08e"/>
    <path d="M18 48 C18 28 22 12 26 0 C32 14 32 32 32 48 Z" fill="#62bb7c"/>
    <path d="M30 48 C32 34 38 22 44 14 C44 28 42 38 42 48 Z" fill="#8fdc9b"/>
  </svg>`,
  { size: 128 },
);

const Z_GLYPH = svg(
  `<svg viewBox="0 0 48 52" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 10 L39 10 L9 42 L39 42" fill="none" stroke="#b9a4ff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  { size: 192 },
);

const SPARKLE = svg(
  `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 2 L29 19 L46 24 L29 29 L24 46 L19 29 L2 24 L19 19 Z" fill="#ffe27a"/>
    <path d="M24 12 L26.5 21.5 L36 24 L26.5 26.5 L24 36 L21.5 26.5 L12 24 L21.5 21.5 Z" fill="#fff6c9"/>
  </svg>`,
  { size: 128 },
);

const STAR = svg(
  `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 3 L30 18 L46 19 L33 29 L38 45 L24 36 L10 45 L15 29 L2 19 L18 18 Z" fill="#ffd84d" stroke="#ffb935" stroke-width="3" stroke-linejoin="round"/>
  </svg>`,
  { size: 128 },
);

const MOSS_TUFT = svg(
  `<svg viewBox="0 0 48 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 40 C0 22 10 12 18 16 C20 4 34 4 34 16 C44 12 50 26 46 40 Z" fill="${MOSS}"/>
    <path d="M10 40 C8 30 14 24 20 26 C22 20 30 20 30 28 C36 26 40 32 38 40 Z" fill="${MOSS_DARK}"/>
  </svg>`,
  { size: 128 },
);

const WOOD_GRAIN = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" fill="${WOOD}"/>
    <path d="M8 0 C12 20 6 44 10 64 M22 0 C18 24 26 40 22 64 M36 0 C40 18 32 46 38 64 M50 0 C46 22 54 42 48 64 M60 0 C58 20 62 44 58 64" fill="none" stroke="#c9985f" stroke-width="2.6" stroke-linecap="round"/>
    <ellipse cx="30" cy="30" rx="3.5" ry="6" fill="#c9985f"/>
  </svg>`,
  { size: 192 },
);

const BARK_MARKS = svg(
  `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 14 C30 8 50 20 76 12 C92 8 104 14 116 10" fill="none" stroke="${BARK_DARK}" stroke-width="5" stroke-linecap="round"/>
    <path d="M14 34 C36 30 58 40 82 32 C96 28 108 34 116 30" fill="none" stroke="${BARK_DARK}" stroke-width="5" stroke-linecap="round"/>
    <path d="M6 50 C26 46 40 54 60 48" fill="none" stroke="${BARK_DARK}" stroke-width="4.5" stroke-linecap="round"/>
    <circle cx="92" cy="48" r="7" fill="${BARK_DARK}"/><circle cx="92" cy="48" r="3" fill="#b8916a"/>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "sleepySloth" });
  const rand = rng(11);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---- layout ---------------------------------------------------------------------------------------------------
  const BY = 0.74; // branch axis height (branch runs along z at x = 0)
  const BODY_Y = 0.48;
  const POSTS = [-0.48, 0.46];

  // ---- skeleton -------------------------------------------------------------------------------------------------
  const root = b.joint("root", { at: [0, BY, 0], dir: [0, 0, 1] });
  const spine = b.chain("spine", catmull([V(0, BODY_Y, -0.12), V(0, BODY_Y + 0.004, 0), V(0, BODY_Y + 0.01, 0.12)]), {
    parent: root,
    names: ["hips", "spine", "chest"],
    role: "spine",
  });
  const hips = spine.joints[0];
  const chest = spine.tip ?? spine.joints[spine.joints.length - 1];

  const neck = b.chain("neck", catmull([V(0, BODY_Y + 0.01, 0.12), V(0, 0.445, 0.17), V(0, 0.385, 0.21)]), {
    parent: chest,
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.385, 0.21], dir: [0, 0, 1], role: "head" });
  const H = 1.22; // the head is big: cute
  const hp = (right: number, fwd: number, up: number) => head.local([right * H, fwd * H, up * H]);
  const jaw = b.joint("jaw", { parent: head, at: hp(0, 0.05, -0.05), aim: hp(0, 0.15, -0.055), role: "jaw" });

  // ---- props: posts, branch, rope ---------------------------------------------------------------------------------
  // The branch bends away from the body at both ends (an S-shaped twig) so the posts stand clear of the face.
  const bx = (z: number) => (z < -0.28 ? -0.28 - z : z > 0.26 ? -(z - 0.26) : 0);
  const branch = b.sweep([V(0.27, BY, -0.55), V(0, BY, -0.28), V(0, BY, 0.26), V(-0.27, BY, 0.53)], [0.04, 0.043, 0.04, 0.042, 0.04, 0.043, 0.04], {
    bone: root,
    color: BARK,
    sides: 7,
    smooth: false,
    up: [0, 1, 0],
  });
  for (const [z, dx, dy] of [
    [-0.22, 1, 0.2],
    [0.21, -1, 0.2],
    [-0.1, -1, -0.3],
    [0.0, 1, -0.3],
    [0.12, 1, 0.3],
  ] as const)
    b.decal(branch, BARK_MARKS, { at: [0, BY, z], dir: [-dx, -dy, 0], up: [0, 0, 1], roll: -90, size: [0.09, 0.045], bone: root });
  for (const z of POSTS) {
    const px = bx(z);
    const phi = -Math.PI / 4; // branch yaw at both posts
    b.part(new THREE.CylinderGeometry(0.029, 0.036, BY - 0.015, 8, 1), "#ffffff", {
      at: [px, (BY - 0.015) / 2, z],
      bone: root,
      texture: WOOD_GRAIN,
      flat: true,
    });
    b.lathe(
      [
        [0, 0],
        [0.078, 0],
        [0.078, 0.014],
        [0.052, 0.034],
        [0.034, 0.044],
        [0, 0.044],
      ],
      { at: [px, 0, z], bone: root, segments: 8, color: FOOT },
    );
    for (const [k, along] of [
      [0, -0.014],
      [1, 0.014],
    ] as const) {
      const ring: THREE.Vector3[] = [];
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const r = 0.05;
        ring.push(
          V(
            px + along * Math.sin(phi) + r * Math.sin(a) * Math.cos(phi),
            BY + r * Math.cos(a),
            z + along * Math.cos(phi) - r * Math.sin(a) * Math.sin(phi),
          ),
        );
      }
      b.sweep(catmull(ring, { closed: true }), 0.008, {
        bone: root,
        sides: 5,
        smooth: false,
        color: k ? ROPE_DARK : ROPE,
      });
    }
  }

  // ---- body ------------------------------------------------------------------------------------------------------
  const body = b.sweep(
    spine,
    (t) => {
      const k = Math.sin(Math.PI * t);
      return [0.105 + 0.04 * k, 0.09 + 0.037 * k];
    },
    {
      sides: 8,
      smooth: false,
      caps: "round",
      color: FUR,
      sectors: [[125, 235, FUR_DARK]],
    },
  );
  // pale chest bib
  b.part(new THREE.SphereGeometry(1, 8, 6), FUR_PALE, {
    at: [0, BODY_Y + 0.01, 0.21],
    scale: [0.085, 0.085, 0.06],
    bone: chest,
    flat: true,
  });

  // tail nub
  const tail = b.chain("tail", catmull([V(0, BODY_Y + 0.005, -0.2), V(0, BODY_Y, -0.235), V(0, BODY_Y - 0.01, -0.26)]), {
    parent: hips,
    names: ["tail1", "tail2"],
    role: "tail",
  });
  b.sweep(tail, [0.045, 0.02], { sides: 6, smooth: false, color: FUR, caps: "round" });

  // neck
  b.sweep(neck, [0.075, 0.075], { sides: 8, smooth: false, color: FUR, caps: "round" });

  const SK = hp(0, 0.04, 0.03);
  const skull = b.part(new THREE.SphereGeometry(1, 10, 7), FUR, {
    at: SK,
    scale: [0.122 * H, 0.105 * H, 0.105 * H],
    bone: head,
    flat: true,
  });
  const faceplate = b.part(new THREE.SphereGeometry(1, 9, 7), FUR_PALE, {
    at: hp(0, 0.088, 0.0),
    scale: [0.1 * H, 0.088 * H, 0.058 * H],
    bone: head,
    flat: true,
  });
  const muzzle = b.part(new THREE.SphereGeometry(1, 8, 6), FUR_PALE, {
    at: hp(0, 0.128, -0.014),
    scale: [0.046 * H, 0.034 * H, 0.04 * H],
    bone: head,
    flat: true,
  });
  b.part(new THREE.SphereGeometry(1, 6, 5), NOSE, {
    at: hp(0, 0.163, 0.004),
    scale: [0.019 * H, 0.013 * H, 0.013 * H],
    bone: head,
    flat: true,
  });
  const chin = b.part(new THREE.SphereGeometry(1, 8, 6), FUR_PALE, {
    at: hp(0, 0.108, -0.066),
    scale: [0.05 * H, 0.03 * H, 0.036 * H],
    bone: jaw,
    flat: true,
  });
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(1, 6, 5), FUR, {
      at: hp(s * 0.118, 0.02, -0.01),
      scale: [0.022 * H, 0.022 * H, 0.026 * H],
      bone: head,
      flat: true,
    });
  b.decal([skull, faceplate, muzzle, chin], FACE, {
    at: [0, SK.y - 0.004, 0.42],
    dir: [0, 0, -1],
    size: [0.22 * H, 0.124 * H],
    segments: [22, 12],
    lift: 0.002,
  });

  // cheek fur
  const skullSkin = b.surface([skull]);
  b.cards(
    skullSkin.scatter(34, { rng: rand, minDist: 0.03, filter: (h) => h.n.z < 0.3 && h.n.y < 0.75 && h.at.y < SK.y + 0.06 }),
    TUFT,
    { size: [0.03, 0.045], lean: 65, bend: 20, flow: [0, -1, -0.2], vary: 0.25, rng: rand, color: FUR },
  );

  // ---- nightcap ---------------------------------------------------------------------------------------------------
  const CAP_Y = SK.y + 0.075;
  const brimPts: THREE.Vector3[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    brimPts.push(V(Math.sin(a) * 0.117, CAP_Y - 0.016 * Math.cos(a), SK.z + 0.008 + Math.cos(a) * 0.104));
  }
  b.sweep(catmull(brimPts, { closed: true }), 0.02, { bone: head, sides: 6, smooth: false, color: CAP_CREAM });
  const capChain = b.chain(
    "cap",
    catmull([
      V(0, CAP_Y, SK.z + 0.008),
      V(0, CAP_Y + 0.075, SK.z - 0.005),
      V(0.055, CAP_Y + 0.12, SK.z + 0.01),
      V(0.125, CAP_Y + 0.085, SK.z + 0.035),
      V(0.165, CAP_Y + 0.015, SK.z + 0.06),
    ]),
    { parent: head, names: ["cap1", "cap2", "cap3", "cap4"], role: "tail" },
  );
  const cap = b.sweep(capChain, [0.112, 0.1, 0.078, 0.052, 0.028, 0.0], {
    sides: 8,
    smooth: false,
    caps: { start: "flat", end: "point" },
    bands: [
      [0.14, CAP_PINK],
      [0.28, CAP_CREAM],
      [0.42, CAP_PINK],
      [0.56, CAP_CREAM],
      [0.7, CAP_PINK],
      [0.84, CAP_CREAM],
      [1, CAP_PINK],
    ],
  });
  const pompomAt = capChain.at(1).at;
  b.part(new THREE.IcosahedronGeometry(0.036, 1), CAP_CREAM, { at: pompomAt, bone: capChain.joints[3], flat: true });
  b.cards(
    [
      frame(pompomAt, [1, 0.3, 0]),
      frame(pompomAt, [-1, -0.2, 0.2]),
      frame(pompomAt, [0, -1, 0]),
      frame(pompomAt, [0.2, 0.4, 1]),
      frame(pompomAt, [0, 0.2, -1]),
    ],
    TUFT,
    { size: [0.028, 0.038], lean: 20, flow: [0, -1, 0], color: CAP_CREAM, sink: 0.6, bone: capChain.joints[3] },
  );
  for (const [t, deg] of [
    [0.3, 35],
    [0.48, -20],
    [0.66, 80],
  ] as const) {
    const at = cap.at(t, deg);
    b.decal(cap, STAR, { at, size: [0.034, 0.034], roll: t * 140 });
  }

  // ---- limbs: long arms and legs with claws hooked over the branch ----------------------------------------------------
  const RC = 0.058; // claw arc radius round the branch axis
  const limbFor = (s: 1 | -1, name: string, parent: Joint, root3: THREE.Vector3, zp: number, lens: [number, number], hint: [number, number, number], fur: string) => {
    const S = s > 0 ? "L" : "R";
    const zOff = s > 0 ? 0 : 0.014;
    const paw = V(s * 0.0557, BY - 0.039, zp + zOff);
    const pts = limb(root3, paw, lens, hint);
    const chain = b.chain(`${name}${S}`, pts, {
      parent,
      names: [`${name === "arm" ? "shoulder" : "hip"}${S}`, `${name === "arm" ? "elbow" : "knee"}${S}`, `${name === "arm" ? "wrist" : "ankle"}${S}`],
      role: name === "arm" ? "arm" : "leg",
    });
    const limbSweep = b.sweep(chain, (t) => 0.052 - 0.014 * t, { sides: 6, smooth: false, color: fur, caps: "round" });
    const tip = chain.tip ?? chain.joints[chain.joints.length - 1];
    b.part(new THREE.SphereGeometry(1, 7, 5), fur, {
      at: V(paw.x, paw.y, paw.z),
      scale: [0.04, 0.036, 0.046],
      bone: tip,
      flat: true,
    });
    [-1, 0, 1].forEach((k, i) => {
      const zc = paw.z + k * 0.028;
      const a0 = -14;
      const from = V(s * RC * Math.cos((a0 * Math.PI) / 180), BY + RC * Math.sin((a0 * Math.PI) / 180), zc);
      const claw = arc([0, BY, zc], from, [0, 0, s], 118);
      const digit = b.chain(`${name}${S}Digit${i + 1}`, claw, {
        parent: tip,
        count: 2,
        names: [`${name}${S}D${i + 1}a`, `${name}${S}D${i + 1}b`],
        role: "digit",
      });
      b.sweep(digit, [0.0125, 0.0], {
        sides: 4,
        detail: 0.6,
        smooth: false,
        caps: { start: "flat", end: "point" },
        bands: [
          [0.28, fur],
          [1, CLAW],
        ],
      });
    });
    return limbSweep;
  };

  const limbSweeps: Sweep[] = [];
  for (const s of [1, -1] as const) {
    limbSweeps.push(limbFor(s, "arm", chest, V(s * 0.095, BODY_Y + 0.03, 0.085), 0.085, [0.125, 0.115], [s, -0.5, -0.2], FUR_DARK));
    limbSweeps.push(limbFor(s, "leg", hips, V(s * 0.09, BODY_Y + 0.02, -0.105), -0.205, [0.135, 0.125], [s, -0.3, 0.15], FUR_DARK));
  }
  for (const sweep of limbSweeps)
    b.cards(
      b.surface(sweep).scatter(9, { rng: rand, minDist: 0.045, filter: (h) => h.n.y < 0.6 }),
      TUFT,
      { size: [0.028, 0.045], lean: 65, bend: 20, flow: [0, -1, 0], vary: 0.25, rng: rand, color: FUR },
    );

  // fur over the body
  b.cards(
    b.surface(body).scatter(90, { rng: rand, minDist: 0.045, filter: (h) => h.n.y < 0.75 && h.at.z > -0.2 }),
    TUFT,
    { size: [0.04, 0.06], lean: 65, bend: 22, flow: [0, -1, 0], vary: 0.3, rng: rand, color: FUR },
  );

  // ---- moss sprout on the back (the back faces the floor) ----------------------------------------------------------
  const backHit = b.surface(body).ray([0, 0.2, -0.03], [0, 1, 0]);
  if (backHit) {
    const base = backHit.at;
    const tipAt = V(base.x, base.y - 0.06, base.z - 0.06);
    b.sprout(
      "moss",
      backHit,
      catmull([base, V(base.x, base.y - 0.04, base.z), V(base.x, base.y - 0.068, base.z - 0.03), tipAt]),
      [0.011, 0.007],
      { count: 0, color: MOSS_DARK, sides: 5, smooth: false, caps: "round" },
    );
    const moss = spine.joints[1];
    for (const s of [1, -1])
      b.extrude(
        [
          [0, 0],
          [0.03, 0.012],
          [0.068, 0.0],
          [0.042, -0.02],
          [0.006, -0.018],
        ],
        { at: tipAt, x: [s, 0.3, 0], y: [0, 0.3, 1], thickness: 0.006, smoothing: 1, color: MOSS, bone: moss },
      );
    b.cards([frame(tipAt, [0, 1, 0.4])], FLOWER, { size: [0.045, 0.06], flow: [0, 0, 1], bone: moss, sink: 0.1, lean: 0 });
    b.cards(
      [0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return frame(V(base.x + Math.cos(a) * 0.05, base.y + 0.006, base.z + Math.sin(a) * 0.045), [0, 1, 0]);
      }),
      MOSS_TUFT,
      { size: [0.05, 0.04], lean: 180, flow: [0, 0, 1], sink: 0.5, bone: moss },
    );
  }

  // ---- leafy branch -----------------------------------------------------------------------------------------------
  const topOf = (z: number): [number, number, number] => [bx(z), BY + 0.03, z];
  const twigs: Array<[[number, number, number], [number, number, number]]> = [
    [topOf(-0.36), [0.12, BY + 0.15, -0.41]],
    [topOf(0.35), [-0.13, BY + 0.16, 0.4]],
  ];
  for (const [from, tip] of twigs)
    b.sweep(
      catmull([
        V(...from),
        V((from[0] + tip[0]) / 2 + 0.01, (from[1] + tip[1]) / 2, (from[2] + tip[2]) / 2),
        V(...tip),
      ]),
      [0.012, 0.006],
      { bone: root, sides: 5, smooth: false, color: BARK, caps: "round" },
    );
  const cluster = (at: [number, number, number], dirs: Array<[number, number, number]>) => dirs.map((d) => frame(at, d));
  const bigLeaves = [
    ...cluster(twigs[0][1], [[0.7, 1, 0.1], [-0.7, 1, -0.2], [0, 1, -0.7], [0.3, 1.3, 0.6]]),
    ...cluster(twigs[1][1], [[0.7, 1, 0.3], [-0.7, 1, -0.1], [0, 1, 0.7], [0.1, 1.3, -0.6]]),
    ...cluster([0.27, BY + 0.03, -0.55], [[0.6, 0.8, -1], [-0.5, 1, -0.6], [1, 0.7, -0.2], [0, 1.2, 0.3]]),
    ...cluster([-0.27, BY + 0.03, 0.53], [[-0.6, 0.8, 1], [0.5, 1, 0.6], [-1, 0.7, 0.2], [0, 1.2, -0.3]]),
  ];
  b.cards(bigLeaves, LEAF, {
    size: [0.06, 0.1],
    lean: 35,
    flow: [0, 0, 1],
    vary: 0.25,
    rng: rand,
    cross: true,
    bone: root,
    sink: 0.25,
  });
  const smallLeaves = [
    ...cluster(topOf(-0.46), [[0.8, 1, 0], [-0.8, 1, 0]]),
    ...cluster(topOf(0.46), [[0.8, 1, 0], [-0.8, 1, 0]]),
    ...cluster(topOf(0.25), [[-0.8, 1, 0.3]]),
    ...cluster(topOf(-0.27), [[0.8, 1, -0.3]]),
    ...cluster([(twigs[0][0][0] + twigs[0][1][0]) / 2, BY + 0.09, -0.385], [[-0.8, 0.6, 0.2], [0.8, 0.6, -0.1]]),
    ...cluster([(twigs[1][0][0] + twigs[1][1][0]) / 2, BY + 0.095, 0.375], [[-0.8, 0.6, 0.1], [0.8, 0.6, 0.3]]),
  ];
  b.cards(smallLeaves, LEAF, { size: [0.045, 0.075], lean: 50, flow: [0, 0, 1], vary: 0.2, rng: rand, cross: true, bone: root, sink: 0.25 });
  b.cards(
    [frame(twigs[0][1], [0.1, 1, 0.3]), frame(twigs[1][1], [-0.1, 1, -0.3]), frame(topOf(0.5), [0, 1, 0.3])],
    FLOWER,
    { size: [0.05, 0.07], flow: [0, 0, 1], bone: root, sink: 0.3, lean: 10 },
  );

  // grass at the feet of the posts
  for (const z of POSTS)
    b.cards(
      [0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2 + (z > 0 ? 0.3 : 0);
        return frame([bx(z) + Math.cos(a) * 0.085, 0, z + Math.sin(a) * 0.085], [0, 1, 0]);
      }),
      GRASS,
      { size: [0.05, 0.06], flow: [0, 0, 1], bone: root, cross: true, vary: 0.25, rng: rand, sink: 0 },
    );

  // sleepy Zs and sparkles
  b.cards(
    [
      frame([0.25, 0.6, 0.36], [0, 1, 0]),
      frame([0.3, 0.68, 0.37], [0, 1, 0]),
      frame([0.35, 0.78, 0.37], [0, 1, 0]),
    ],
    Z_GLYPH,
    { size: [0.05, 0.055], flow: [0, 0, 1], bone: root, sink: 0, lean: 0 },
  );
  b.cards(
    [frame([-0.13, 0.6, 0.36], [0, 1, 0]), frame([0.33, 0.48, 0.42], [0, 1, 0]), frame([0.14, 0.27, 0.42], [0, 1, 0])],
    SPARKLE,
    { size: 0.04, flow: [0, 0, 1], bone: root, sink: 0 },
  );

  return b.root;
}
