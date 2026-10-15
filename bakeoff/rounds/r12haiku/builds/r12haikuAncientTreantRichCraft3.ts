import * as THREE from "three";
import type { Builder, ColorInput, Joint, Paint, Part } from "../../../../src/index";
import {
  bezier,
  catmull,
  createBuilder,
  frame,
  grain,
  limb,
  mix,
  noise,
  patches,
  paint,
  resolve,
  rng,
  smoothstep,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Ancient Treant",
  description:
    "A walking tree guardian: a moss-cloaked trunk with a carved face and glowing amber eyes, root legs, branch arms and a leafy crown.",
};

// Metres, +Y up, the face looks down +Z. The trunk's face sits near z = 0.5 at the head.

// ---------------------------------------------------------------------------------------------------------------
// Palette

const BARK_D = "#2a1b0e";
const BARK_M = "#4e341f";
const BARK_L = "#7b5430";
const ROOT_C = "#5b3f25";
const EARTH = "#4a3520";
const MOSS = "#8cbc3e";
const MOSS_D = "#3b6c20";
const LEAF_D = "#2b6321";
const LEAF_M = "#5ea334";
const LEAF_L = "#c6e36c";
const AMBER = "#ffbf3a";
const SAP = "#ffd84d";
const CYAN = "#8fe9ff";

const clamp = (x: number) => Math.min(Math.max(x, 0), 1);

// ---------------------------------------------------------------------------------------------------------------
// Paints

/** Form light: warm on top, cool and a little darker underneath, so every surface reads its own shape. */
function form(c: ColorInput, amount = 1): Paint {
  return paint((p, n) => {
    const [r, g, bl] = resolve(c, p, n);
    const up = smoothstep(-0.35, 0.75, n.y);
    const k = 0.8 + 0.28 * up * amount - 0.12 * (1 - up) * amount;
    return [clamp(r * k * (1 + 0.05 * up * amount)), clamp(g * k), clamp(bl * (k + 0.07 * (1 - up) * amount))];
  });
}

// Bark: vertical grain, chunky plates separated by dark cracks, moss on upward faces.
const grained = grain(BARK_D, BARK_M, { size: 0.05, axis: "y", seed: 3 });
const plated = patches(BARK_D, [BARK_M, BARK_L, grained], { size: 0.2, gap: 0.08, seed: 5 });
const barkPaint = paint((p, n) => {
  const cover = smoothstep(0.25, 0.8, n.y) + (noise(p, 0.12, 11) - 0.5) * 0.9;
  return mix(resolve(plated, p, n), cover > 0.95 ? MOSS : MOSS_D, smoothstep(0.55, 0.85, cover));
});
const WOOD = form(barkPaint);

// Roots: dark wood that goes to earth where it meets the ground.
const ROOTP = form(paint((p) => (p.y < 0.12 ? mix(ROOT_C, EARTH, 0.6) : ROOT_C)));

// Leaves: mottled greens lightening into bright tips.
const LEAVES = form(
  paint((p) => {
    const v = noise(p, 0.1, 21);
    return mix(mix(LEAF_D, LEAF_M, smoothstep(0.3, 0.6, v)), LEAF_L, smoothstep(0.7, 0.9, v));
  }),
);

// ---------------------------------------------------------------------------------------------------------------
// Drawings

const EYE = svg(
  `<svg viewBox="0 0 64 40" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="g" cx="0.5" cy="0.45" r="0.55">
    <stop offset="0" stop-color="#f4ffc8"/><stop offset="0.35" stop-color="#9cff5e"/><stop offset="1" stop-color="#2f9a2a"/>
  </radialGradient></defs>
  <path d="M1 20 Q32 -6 63 20 Q32 46 1 20Z" fill="#21150a"/>
  <path d="M7 20 Q32 3 57 20 Q32 37 7 20Z" fill="url(#g)"/>
  <ellipse cx="32" cy="20" rx="3.6" ry="11" fill="#06100a"/>
  <path d="M7 20 Q32 3 57 20" stroke="#0f0a05" stroke-width="3" fill="none"/>
</svg>`,
  { size: 256 },
);

const MOUTH = svg(
  `<svg viewBox="0 0 80 32" xmlns="http://www.w3.org/2000/svg">
  <path d="M4 6 Q40 2 76 6 Q68 28 40 29 Q12 28 4 6Z" fill="#150c05"/>
  <path d="M14 6 L19 15 L24 6Z M31 5 L36 14 L41 5Z M48 6 L53 15 L58 6Z" fill="#e0c48e"/>
</svg>`,
  { size: 256 },
);

const RUNE = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="29" fill="none" stroke="#14280c" stroke-width="5"/>
  <circle cx="32" cy="32" r="29" fill="none" stroke="#a6ff6a" stroke-width="2.4"/>
  <path d="M32 11 L45 26 L32 41 L19 26Z M32 41 L32 55 M21 49 L43 49 M26 22 L32 16 L38 22" fill="none" stroke="#c9ffa6" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/>
</svg>`,
  { size: 192 },
);

const MOSS_STRANDS = svg(
  `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
  <path d="M6 0 C8 20 2 38 3 60 L12 60 C12 38 10 20 9 0Z" fill="#2c5219"/>
  <path d="M17 0 C19 18 14 40 17 60 L25 60 C23 40 26 18 24 0Z" fill="#4f8a2a"/>
  <path d="M29 0 C31 22 27 38 28 54 L35 54 C34 38 35 22 34 0Z" fill="#86b53a"/>
</svg>`,
  { size: 128 },
);

function leafTex(light: string, dark: string, vein: string) {
  return svg(
    `<svg viewBox="0 0 40 64" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${dark}"/>
  </linearGradient></defs>
  <path d="M20 2 C37 18 39 44 20 62 C1 44 3 18 20 2Z" fill="url(#g)" stroke="#143010" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M20 8 L20 58 M20 22 L11 15 M20 22 L29 15 M20 38 L10 30 M20 38 L30 30" stroke="${vein}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
</svg>`,
    { size: 160 },
  );
}
const LEAF_A = leafTex("#d4f08a", "#3f8a2a", "#22501a");
const LEAF_B = leafTex("#a8dc5a", "#2f7024", "#1d4515");
const LEAF_C = leafTex("#eef79a", "#5aa03a", "#2c6020");

// ---------------------------------------------------------------------------------------------------------------
// Shapes

/** The trunk as a loft: a root flare, a broad chest, a narrow neck and a wide skull. Widths and heights in metres. */
const TRUNK = [
  { at: [0, 1.0, 0], w: 1.15, h: 0.85 },
  { at: [0, 1.45, 0], w: 0.92, h: 0.78 },
  { at: [0, 2.1, 0.02], w: 0.86, h: 0.74 },
  { at: [0, 2.7, 0.04], w: 0.98, h: 0.8 },
  { at: [0, 3.2, 0.05], w: 0.84, h: 0.72 },
  { at: [0, 3.6, 0.06], w: 0.72, h: 0.66 },
  { at: [0, 3.95, 0.09], w: 0.98, h: 0.9 },
  { at: [0, 4.3, 0.08], w: 0.86, h: 0.76 },
  { at: [0, 4.55, 0.05], w: 0.5, h: 0.42 },
];

type Surf = ReturnType<Builder["surface"]>;

/** The first surface point straight in front of the body at (x, y), looking back along -Z. */
function front(surf: Surf, x: number, y: number) {
  const hit = surf.ray([x, y, 3], [0, 0, -1]);
  if (!hit) throw new Error(`treant: no surface at x ${x}, y ${y}`);
  return hit;
}

/** A leg: a chain from the hip to the ankle, a trunk-thick shin, a heel knob and five root toes on the ground. */
function buildLeg(b: Builder, hips: Joint, s: 1 | -1, wood: Paint, root: Paint) {
  const side = s > 0 ? "L" : "R";
  const pts = limb([s * 0.4, 1.32, 0], [s * 0.5, 0.12, 0.2], [0.9, 0.85], [[0, 0, 1]]);
  const leg = b.chain(`leg${side}`, pts, {
    parent: hips,
    names: [`hip${side}`, `knee${side}`, `ankle${side}`],
    role: "leg",
    contact: [s * 0.5, 0, 0.2],
  });
  b.sweep(leg, (t) => 0.2 - 0.07 * t, { color: wood });
  const ankle = leg.tip ?? leg.joints[leg.joints.length - 1];
  b.part(new THREE.DodecahedronGeometry(0.12, 0), wood, {
    bone: ankle,
    at: ankle.local({ back: 0.02, down: 0.04 }),
    flat: true,
    scale: [1.1, 0.8, 1.25],
  });
  for (let k = 0; k < 5; k++) {
    const a = (k - 2) / 2;
    const toe = catmull([
      ankle.local({ down: 0.05, left: s * a * 0.03 }),
      ankle.local({ forward: 0.2, down: 0.075, left: s * a * 0.2 }),
      ankle.local({ forward: 0.42 + 0.05 * Math.abs(a), down: 0.095, left: s * a * 0.36 }),
    ]);
    b.sweep(toe, [0.06, 0.025], { bone: ankle, color: root, caps: { start: "round", end: "round" } });
  }
}

// ---------------------------------------------------------------------------------------------------------------
// The guardian

export default function build() {
  const b = createBuilder({ name: "ancient-treant" });

  // Skeleton: hips, a spine up to the neck, and the head on top of it.
  const hips = b.joint("hips", { at: [0, 1.45, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.45, 0],
      [0, 2.2, 0.02],
      [0, 2.9, 0.04],
      [0, 3.5, 0.06],
    ]),
    { parent: hips, names: ["spineLo", "spineHi", "neck"], role: "spine" },
  );
  const head = b.joint("head", { parent: spine, at: [0, 3.6, 0.06], aim: [0, 4.3, 0.12], role: "head" });

  // Body: one loft through the root flare, chest, neck and skull, bending with the spine and head.
  const trunk = b.loft(TRUNK, { bone: [hips, spine, head], color: WOOD });
  const body = b.surface(trunk);

  // Roots that spread from the base and grip the ground at the back.
  const rootSpots: [number, number][] = [
    [0.75, -0.1],
    [-0.75, -0.15],
    [0.2, -0.8],
    [-0.35, -0.7],
  ];
  for (const [x, z] of rootSpots) {
    b.sweep(
      catmull([
        [x * 0.8, 1.15, z * 0.8],
        [x * 1.1, 0.5, z * 1.1],
        [x * 1.35, 0.07, z * 1.35],
      ]),
      [0.13, 0.07],
      { bone: hips, color: ROOTP, caps: { start: "round", end: "round" } },
    );
  }

  // Legs.
  for (const s of [1, -1] as const) buildLeg(b, hips, s, WOOD, ROOTP);

  // Arms: long branches from the chest, with knuckled hands and twig fingers.
  for (const s of [1, -1] as const) {
    const side = s > 0 ? "L" : "R";
    const pts = limb([s * 0.5, 3.15, 0.02], [s * 1.0, 1.72, 0.4], [0.95, 0.85], [[s * 0.35, 0, -1]]);
    const arm = b.chain(`arm${side}`, pts, {
      parent: spine,
      names: [`shoulder${side}`, `elbow${side}`, `hand${side}`],
      role: "arm",
    });
    const shoulder = arm.joints[0];
    const elbow = arm.joints[1];
    const hand = arm.tip ?? arm.joints[2];
    b.sweep(arm, (t) => 0.14 - 0.06 * t, { color: WOOD });
    b.part(new THREE.IcosahedronGeometry(0.2, 1), WOOD, {
      bone: shoulder,
      at: pts[0],
      flat: true,
      scale: [1, 0.9, 1.1],
    });
    b.part(new THREE.DodecahedronGeometry(0.1, 0), WOOD, { bone: elbow, at: pts[1], flat: true });
    b.part(new THREE.IcosahedronGeometry(0.26, 1), LEAVES, {
      bone: shoulder,
      at: [s * 0.8, 3.42, -0.05],
      flat: true,
      scale: [1, 0.75, 1],
    });

    b.part(new THREE.DodecahedronGeometry(0.14, 0), WOOD, {
      bone: hand,
      at: hand.local({ down: 0.03 }),
      flat: true,
      scale: [1.25, 0.8, 1.1],
    });
    for (let k = 0; k < 4; k++) {
      const x = (k - 1.5) * 0.045;
      b.sweep(
        bezier(
          hand.local({ down: 0.02, left: s * x }),
          hand.local({ down: 0.14, forward: 0.03, left: s * x * 1.3 }),
          hand.local({ down: 0.25, forward: 0.07, left: s * x * 1.8 }),
        ),
        [0.042, 0.012],
        { bone: hand, color: WOOD, caps: { start: "round", end: "point" } },
      );
    }
    b.sweep(
      bezier(
        hand.local({ down: 0.02, left: s * 0.08 }),
        hand.local({ down: 0.08, left: s * 0.2, forward: 0.03 }),
        hand.local({ down: 0.16, left: s * 0.26, forward: 0.08 }),
      ),
      [0.045, 0.014],
      { bone: hand, color: WOOD, caps: { start: "round", end: "point" } },
    );
  }

  // Branches and the leafy crown. Every crown piece is collected so leaves can grow over all of it.
  const canopy: Part[] = [];
  for (const s of [1, -1] as const) {
    b.sweep(
      catmull([
        [0, 4.45, 0],
        [s * 0.3, 4.9, -0.05],
        [s * 0.8, 5.15, -0.1],
        [s * 1.2, 5.25, -0.15],
      ]),
      [0.12, 0.035],
      { bone: head, color: WOOD, caps: { start: "round", end: "point" } },
    );
    canopy.push(b.part(new THREE.IcosahedronGeometry(0.34, 1), LEAVES, {
      bone: head,
      at: [s * 1.25, 5.3, -0.15],
      flat: true,
    }));
  }
  b.sweep(
    catmull([
      [0, 4.45, 0],
      [0.05, 5.1, 0.05],
      [0.1, 5.5, 0.05],
    ]),
    [0.11, 0.03],
    { bone: head, color: WOOD, caps: { start: "round", end: "point" } },
  );
  canopy.push(
    b.part(new THREE.IcosahedronGeometry(0.9, 1), LEAVES, {
      bone: head,
      at: [0, 5.0, -0.1],
      scale: [1.05, 0.8, 1.0],
      flat: true,
    }),
    b.part(new THREE.IcosahedronGeometry(0.5, 1), LEAVES, { bone: head, at: [-0.6, 4.7, 0.15], flat: true }),
    b.part(new THREE.IcosahedronGeometry(0.5, 1), LEAVES, { bone: head, at: [0.6, 4.7, 0.15], flat: true }),
    b.part(new THREE.IcosahedronGeometry(0.45, 1), LEAVES, { bone: head, at: [0.05, 5.55, 0.02], flat: true }),
  );
  const crownSurf = b.surface(canopy);

  // Leaf cards over the crown, three drawings picked at random, some crossed for depth.
  const leafHits = crownSurf.scatter(170, {
    rng: rng(4),
    minDist: 0.095,
    filter: (h) => h.n.y > -0.3,
  });
  b.cards(leafHits, [LEAF_A, LEAF_B, LEAF_C], {
    size: [0.2, 0.3],
    lean: 40,
    flow: [0, 1, 0.25],
    vary: 0.3,
    rng: rng(9),
    cross: true,
  });

  // Glowing seed pods hung in the crown.
  for (const [x, z] of [
    [0.25, 0.3],
    [-0.4, 0.1],
    [0.05, -0.35],
  ]) {
    const hit = crownSurf.ray([x, 9, z], [0, -1, 0]);
    if (hit) glow(b.stick(new THREE.IcosahedronGeometry(0.05, 0), AMBER, hit, { flat: true, embed: 0.4 }), 1.6);
  }

  // The face: heavy angled brows, two glowing eyes, a carved mouth with wooden teeth and a nose knot.
  for (const s of [1, -1] as const) {
    glow(b.decal(body, EYE, { at: front(body, s * 0.21, 3.98), dir: [0, 0, 1], size: [0.24, 0.15] }), 1.6);
    const brow = body.drape(bezier([s * 0.42, 4.28, 0.6], [s * 0.22, 4.36, 0.6], [s * 0.05, 4.14, 0.6]), {
      lift: 0.02,
    });
    b.sweep(brow, [0.045, 0.03], { color: BARK_D });
  }
  b.decal(body, MOUTH, { at: front(body, 0, 3.6), dir: [0, 0, 1], size: [0.34, 0.14] });
  b.stick(new THREE.DodecahedronGeometry(0.075, 0), BARK_M, front(body, 0, 3.8), {
    flat: true,
    embed: 0.35,
    scale: [0.9, 1.1, 0.6],
  });

  // Carved rune on the chest, glowing green.
  glow(b.decal(body, RUNE, { at: front(body, 0, 2.55), dir: [0, 0, 1], size: [0.22, 0.22] }), 1.3);

  // A vein of sap running down the front of the trunk, glowing amber.
  const vein = body.drape(bezier([0.3, 3.0, 1], [0.36, 2.4, 1], [0.26, 1.85, 1]), { lift: 0.012 });
  glow(b.sweep(vein, [0.014, 0.008], { color: SAP }), 1.2);

  // Glowing mushrooms on each flank.
  for (const s of [1, -1] as const) {
    const hit = body.ray([s * 2, 2.25, 0], [-s, 0, 0]);
    if (!hit) continue;
    glow(
      b.lathe(
        [
          [0, 0],
          [0.03, 0],
          [0.03, 0.04],
          [0.11, 0.06],
          [0.1, 0.085],
          [0, 0.1],
        ],
        { at: hit, axis: hit.axis, smoothing: 1, color: CYAN },
      ),
      1.4,
    );
  }

  // Bark knots scattered over the trunk, away from the face.
  const knots = body.scatter(38, {
    rng: rng(12),
    minDist: 0.15,
    filter: (h) => h.at.y > 1.35 && (h.at.y < 3.1 || h.at.y > 4.35),
  });
  knots.forEach((h, i) => {
    const geo =
      i % 3 === 0
        ? new THREE.IcosahedronGeometry(0.06, 0)
        : i % 3 === 1
          ? new THREE.DodecahedronGeometry(0.05, 0)
          : new THREE.OctahedronGeometry(0.045, 0);
    b.stick(geo, BARK_D, h, { embed: 0.4, flat: true });
  });

  // A beard of hanging moss under the carved mouth.
  const beard = body.scatter(30, {
    rng: rng(21),
    minDist: 0.075,
    filter: (h) => h.n.z > 0.4 && h.at.y > 3.22 && h.at.y < 3.6,
  });
  b.cards(
    beard.map((h) => frame(h, [0, 1, 0])),
    MOSS_STRANDS,
    { size: [0.1, 0.32], lean: 180, flow: [0, 0, 1], vary: 0.25, rng: rng(22) },
  );

  return b.root;
}
