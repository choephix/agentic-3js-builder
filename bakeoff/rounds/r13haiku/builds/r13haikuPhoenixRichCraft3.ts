import * as THREE from "three";
import { bezier, catmull, createBuilder, frame, rng, svg } from "../../../../src/index";
import { animeEye, cel, furEdge, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "phoenix",
  description: "A phoenix with flame plumage and wings spread, cel-shaded in a Genshin-style finish.",
};

type V3 = [number, number, number];

const WHITE = "#ffffff";
const DOWN = new THREE.Vector3(0, -1, 0);

// ---------------------------------------------------------------------------------------------------------------
// Palette. Cel paints: a lit tone and a hue-shifted shadow tone, picked against the key light.

const RED = cel("#e8492c");
const CROWN = cel("#ffc84a", "#d9781f");
const HEAD = cel("#ff7340", "#c63a2c");
const BREAST = cel("#ffe8a6", "#f2a25c");
const BELLY = cel("#ffd27a", "#e5843e");
const GOLD = cel("#ffc23e", "#c9741f");
const ARM = cel("#ffb53a", "#d4621f");

// Warm red back, pale gold belly with a zig-zag edge and an ink line; a cream breast cap on the front.
const UNDER = furEdge(RED, BELLY, {
  axis: [0, 1, 0],
  level: -0.32,
  teeth: 0.2,
  period: 0.035,
  along: [1, 0, 0],
  ink: INK,
  inkWidth: 0.1,
});
const BODY = furEdge(BREAST, UNDER, {
  axis: [0, 0, 1],
  level: 0.5,
  teeth: 0.16,
  period: 0.04,
  along: [0, 1, 0],
  ink: INK,
  inkWidth: 0.05,
});
// A gold crown on the top of the head over red skin.
const HEAD_PAINT = furEdge(CROWN, HEAD, {
  axis: [0, 1, 0],
  level: 0.42,
  teeth: 0.1,
  period: 0.03,
  along: [1, 0, 0],
  ink: INK,
  inkWidth: 0.06,
});

// ---------------------------------------------------------------------------------------------------------------
// Drawings

const EYE = animeEye({ iris: "#ffa21f", irisLight: "#ffe27a", irisDark: "#b8320f", blush: false });

// Wing flame: a flame feather, red root to pale gold tip, inked outline, bright core and barbs.
const FLAME_WING = svg(
  `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="fw" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0" stop-color="#b8201f"/><stop offset="0.45" stop-color="#ff6a1f"/>
    <stop offset="0.8" stop-color="#ffb93a"/><stop offset="1" stop-color="#fff2a6"/>
  </linearGradient></defs>
  <path d="M32 124C14 112 6 84 10 56C13 34 26 18 32 4C40 22 54 40 55 66C56 92 48 112 32 124Z"
        fill="url(#fw)" stroke="#22112f" stroke-width="3" stroke-linejoin="round"/>
  <path d="M32 116C22 100 20 80 26 62C29 52 31 44 32 34C36 50 44 66 43 84C42 100 38 110 32 116Z"
        fill="#fff6c2" opacity="0.85"/>
  <path d="M32 112L22 84M32 104L40 78M32 92L24 68M32 84L42 60" stroke="#22112f" stroke-width="2"
        stroke-linecap="round" fill="none" opacity="0.35"/>
</svg>`,
  { size: 256 },
);

// Tail flame: a crimson base curling into gold, with a hot swirl down its middle.
const FLAME_TAIL = svg(
  `<svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="tf" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0" stop-color="#8c1a2a"/><stop offset="0.4" stop-color="#e63b1e"/>
    <stop offset="0.75" stop-color="#ff9a2a"/><stop offset="1" stop-color="#ffe36a"/>
  </linearGradient></defs>
  <path d="M32 124C10 108 8 82 18 58C26 38 20 22 36 4C34 26 52 40 54 66C57 96 48 116 32 124Z"
        fill="url(#tf)" stroke="#22112f" stroke-width="3" stroke-linejoin="round"/>
  <path d="M30 116C20 98 22 76 32 60C40 46 36 32 42 18C48 36 46 56 44 72C42 96 38 110 30 116Z"
        fill="#fff4c0" opacity="0.8"/>
  <path d="M26 96C34 86 40 72 36 58" stroke="#fff6d0" stroke-width="3" stroke-linecap="round" fill="none"/>
</svg>`,
  { size: 256 },
);

// Crest tuft: a narrow double-lobed flame.
const CREST = svg(
  `<svg viewBox="0 0 40 96" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="cr" x1="0" y1="1" x2="0" y2="0">
    <stop offset="0" stop-color="#c8301f"/><stop offset="0.55" stop-color="#ff7a2a"/>
    <stop offset="1" stop-color="#ffd24a"/>
  </linearGradient></defs>
  <path d="M20 92C6 80 4 56 10 40C12 30 8 20 14 4C20 18 22 26 24 34C28 22 30 12 34 2C36 22 36 46 34 62C32 80 30 88 20 92Z"
        fill="url(#cr)" stroke="#22112f" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M20 84C14 74 14 56 20 44C24 56 26 70 20 84Z" fill="#fff0b0" opacity="0.8"/>
</svg>`,
  { size: 192 },
);

// Ember: a soft glowing core with a four-point spark.
const EMBER = svg(
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="em" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#ffffff"/><stop offset="0.35" stop-color="#ffe27a"/>
    <stop offset="0.7" stop-color="#ff8a2a" stop-opacity="0.6"/><stop offset="1" stop-color="#ff5a1a" stop-opacity="0"/>
  </radialGradient></defs>
  <circle cx="32" cy="32" r="30" fill="url(#em)"/>
  <path d="M32 6L36 28L58 32L36 36L32 58L28 36L6 32L28 28Z" fill="#fff6c8"/>
</svg>`,
  { size: 128 },
);

// Chest emblem: a sun of gold rays round a flame sigil on a deep red disc.
const pt = (r: number, a: number) => `${(50 + r * Math.cos(a)).toFixed(2)} ${(50 + r * Math.sin(a)).toFixed(2)}`;
const RAYS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2;
  return `<path d="M50 50L${pt(47, a - 0.16)}L${pt(47, a + 0.16)}Z" fill="#ffb93a" stroke="#22112f" stroke-width="2" stroke-linejoin="round"/>`;
}).join("");
const EMBLEM = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="48" fill="#8e1a24" stroke="#22112f" stroke-width="3"/>
  ${RAYS}
  <circle cx="50" cy="50" r="30" fill="#8e1a24" stroke="#ffd36a" stroke-width="3"/>
  <path d="M50 30C58 40 66 46 66 56C66 66 58 72 50 72C42 72 34 66 34 56C34 46 42 40 50 30Z"
        fill="#ffe27a" stroke="#22112f" stroke-width="2.5"/>
  <path d="M50 42C54 50 56 54 56 58C56 63 53 66 50 66C47 66 44 63 44 58C44 54 46 50 50 42Z" fill="#ff6a1f"/>
</svg>`,
  { size: 256 },
);

// ---------------------------------------------------------------------------------------------------------------
// Proportions. Metres, +Y up, facing +Z. HEAD_C is the head's centre.

const HEAD_C: V3 = [0, 1.72, 0.5];
const W0: V3 = [0.2, 1.46, 0.12]; // shoulder (left wing; the right mirrors it)
const W1: V3 = [0.62, 1.8, 0.04]; // elbow
const W2: V3 = [1.0, 2.0, -0.1]; // wrist
const W3: V3 = [1.36, 1.84, -0.26]; // wing tip

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  const rand = rng(21);

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton: hips, spine, neck, head and jaw, tail, legs, then wings.

  const hips = b.joint("hips", { at: [0, 1.0, -0.06], role: "spine" });
  const spine = b.chain("spine", catmull([[0, 1.03, -0.02], [0, 1.18, 0.1], [0, 1.32, 0.24]]), {
    parent: hips,
    names: ["spine1", "spine2"],
    role: "spine",
  });
  const neck = b.chain("neck", catmull([[0, 1.32, 0.24], [0, 1.5, 0.37], [0, 1.66, 0.45]]), {
    parent: spine.joints[1],
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: neck.joints[1], at: HEAD_C, aim: [0, 1.78, 0.62], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.66, 0.6], aim: [0, 1.56, 0.84], role: "jaw" });
  b.pose(jaw, { axis: [1, 0, 0], deg: 7 }); // beak parted, as if about to sing

  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.0, -0.2],
      [0, 0.96, -0.5],
      [0, 0.74, -0.82],
      [0, 0.44, -1.08],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Body: a loft over hips, spine and neck, a neck tube, and the head.

  const body = b.loft(
    [
      { at: [0, 0.98, -0.16], w: 0.26, h: 0.3 },
      { at: [0, 1.04, -0.02], w: 0.38, h: 0.4 },
      { at: [0, 1.16, 0.1], w: 0.46, h: 0.5 },
      { at: [0, 1.3, 0.22], w: 0.42, h: 0.46 },
      { at: [0, 1.4, 0.32], w: 0.3, h: 0.3 },
    ],
    { bone: [hips, spine, neck], color: BODY },
  );
  b.sweep(neck, [0.13, 0.1], { color: RED });

  // Head: a chunky sphere, a little long in front.
  const headPart = b.part(new THREE.SphereGeometry(0.19, 20, 14), HEAD_PAINT, {
    bone: head,
    at: HEAD_C,
    scale: [0.94, 1, 1.06],
  });

  // Big anime eyes conformed to the skull. Azimuth 90 is +X (the creature's left), so s > 0 is the left eye.
  const headSkin = b.surface(headPart);
  for (const s of [1, -1]) {
    const hit = headSkin.around(HEAD_C).at(s * 34, 8);
    if (hit) b.decal(headPart, EYE, { at: hit, size: [0.1, 0.137], mirror: s > 0 });
  }

  // Golden beak: the upper half on the head, the lower half on the jaw.
  b.sweep(
    bezier([0, 1.7, 0.6], [0, 1.7, 0.74], [0, 1.65, 0.86]),
    [0.068, 0.006],
    { bone: head, color: GOLD, caps: { end: "point" } },
  );
  b.sweep(
    bezier([0, 1.66, 0.6], [0, 1.65, 0.7], [0, 1.6, 0.8]),
    [0.05, 0.006],
    { bone: jaw, color: GOLD, caps: { end: "point" } },
  );

  // Crest: a row of flame tufts over the crown, a shorter row in front, and two cheek plumes.
  const crestBack = [-0.12, -0.06, 0, 0.06, 0.12].map((x) =>
    frame([x, 1.88 - Math.abs(x) * 0.25, 0.44 - Math.abs(x) * 0.12], [0, 1, 0]),
  );
  glow(
    b.cards(crestBack, CREST, {
      size: [0.13, 0.3],
      lean: 22,
      bend: 26,
      flow: [0, 0.2, -1],
      vary: 0.18,
      rng: rand,
      color: WHITE,
      bone: head,
    }),
    0.8,
  );
  const crestFront = [-0.05, 0, 0.05].map((x) => frame([x, 1.92, 0.5], [0, 1, 0]));
  glow(
    b.cards(crestFront, CREST, { size: [0.1, 0.22], lean: 30, bend: 20, flow: [0, 0.3, -1], color: WHITE, bone: head }),
    0.8,
  );
  for (const s of [1, -1]) {
    const cheek = [0, 1].map((i) => frame([s * 0.19, 1.66 - i * 0.07, 0.46 - i * 0.04], [s, 0, 0]));
    b.cards(cheek, CREST, { size: [0.1, 0.26], lean: 25, bend: 18, flow: [0, -1, -0.4], color: WHITE, bone: head });
  }

  // Ruff: flame feathers round the base of the neck, flaring up and back.
  const ruff = b.ring(neck.at(0.1), { count: 12, radius: 0.13 }).items;
  b.cards(ruff, CREST, {
    size: [0.1, 0.22],
    lean: 35,
    bend: 15,
    flow: [0, 0.7, -0.5],
    vary: 0.2,
    rng: rand,
    color: WHITE,
  });

  // -------------------------------------------------------------------------------------------------------------
  // Tail: a core tube, then rings of flame feathers fanning out along it.

  b.sweep(tail, (t) => 0.085 * (1 - t) + 0.025, { color: RED });
  const tailRings = [
    { t: 0.16, n: 10, r: 0.1 },
    { t: 0.45, n: 9, r: 0.07 },
    { t: 0.74, n: 8, r: 0.05 },
    { t: 0.96, n: 7, r: 0.03 },
  ];
  const tailFrames = tailRings.flatMap(({ t, n, r }) => b.ring(tail.at(t), { count: n, radius: r }).items);
  glow(
    b.cards(tailFrames, FLAME_TAIL, {
      size: [0.2, 0.46],
      lean: 16,
      bend: 24,
      flow: [0, -0.35, -1],
      vary: 0.22,
      spin: 12,
      rng: rand,
      color: WHITE,
    }),
    0.9,
  );

  // -------------------------------------------------------------------------------------------------------------
  // Legs: golden digitigrade legs with three forward toes and talons.

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${L}`,
      catmull([
        [s * 0.14, 0.99, -0.04],
        [s * 0.18, 0.54, 0.12],
        [s * 0.14, 0.16, -0.1],
        [s * 0.14, 0.03, 0.06],
      ]),
      { parent: hips, names: [`hip${L}`, `knee${L}`, `ankle${L}`, `foot${L}`], role: "leg" },
    );
    b.sweep(leg, [0.052, 0.03], { color: GOLD });
    const foot = leg.tip ?? leg.joints[leg.joints.length - 1];
    const ball: V3 = [s * 0.14, 0.024, 0.06];
    const toes: V3[] = [
      [s * 0.14, 0.024, 0.22],
      [s * 0.24, 0.024, 0.16],
      [s * 0.05, 0.024, 0.15],
    ];
    for (const toe of toes) {
      b.capsule(ball, toe, 0.024, { color: GOLD, bone: foot });
      b.spike(toe, [0, -0.25, 1], 0.05, 0.012, { color: INK, bone: foot });
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Wings, spread. Each wing: a leading arm, then rows of flame feathers. Cards lie in the wing plane, facing
  // the viewer, and each row's flow follows the wing with its own downward or upward sweep.

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const mirror = (p: V3): V3 => [p[0] * s, p[1], p[2]];
    const wing = b.chain(
      `wing${L}`,
      catmull([mirror(W0), mirror(W1), mirror(W2), mirror(W3)]),
      {
        parent: neck.joints[0],
        names: [`wing${L}1`, `wing${L}2`, `wing${L}3`, `wing${L}Tip`],
        role: "wing",
      },
    );
    b.sweep(wing, [0.05, 0.016], { color: ARM });

    // A row of feathers at the given points of the wing. `lift` > 0 sweeps a feather back and down the wing,
    // < 0 sweeps it up. Each card gets its own depth step so overlapping cards never share a plane.
    const row = (
      ts: number[],
      lift: number,
      z0: number,
      texture: THREE.Texture,
      size: [number, number],
      glowing = 0,
    ) => {
      const cps = ts.map((t) => wing.at(t));
      const frames = cps.map((cp, i) =>
        frame(cp.at.clone().add(new THREE.Vector3(0, 0, z0 + i * 0.006)), [0, 0, 1]),
      );
      const flows = cps.map((cp) => cp.tangent.clone().normalize().addScaledVector(DOWN, lift));
      const meshes = b.cards(frames, texture, {
        size,
        lean: 90,
        bend: 12,
        vary: 0.12,
        rng: rand,
        color: WHITE,
        flow: (_f, i) => flows[i],
      });
      return glowing > 0 ? glow(meshes, glowing) : meshes;
    };

    // Coverts over the arm, secondaries behind them, primaries at the tip (glowing), and rising wisps at the elbow.
    row([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9], 0.2, 0, FLAME_WING, [0.2, 0.34]);
    row([0.3, 0.42, 0.54, 0.66, 0.78, 0.9], 0.55, 0.03, FLAME_WING, [0.2, 0.46]);
    row([0.6, 0.72, 0.84, 0.95, 1.0], 0.9, 0.06, FLAME_WING, [0.17, 0.42], 1.1);
    row([0.2, 0.36, 0.52], -0.7, 0.09, FLAME_WING, [0.14, 0.3], 0.8);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Chest emblem, and drifting embers round the wings. The embers keep the body and head clear.

  const bodySkin = b.surface(body);
  const chest = bodySkin.around([0, 1.26, 0.1]).at(0, 10);
  if (chest) b.decal(body, EMBLEM, { at: chest, size: [0.2, 0.2] });

  const sparks: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 34; i++) {
    const x = (rand() * 2 - 1) * 1.7;
    const y = 0.5 + rand() * 2.1;
    const z = (rand() * 2 - 1) * 0.7 - 0.15;
    if (Math.abs(x) < 0.55 && y < 2.05) continue;
    if (Math.hypot(x, y - HEAD_C[1], z - HEAD_C[2]) < 0.45) continue;
    sparks.push(frame([x, y, z], [0, 0, 1]));
  }
  glow(b.cards(sparks, EMBER, { size: 0.08, lean: 0, vary: 0.45, rng: rand, color: WHITE }), 2.2);

  return b.root;
}
