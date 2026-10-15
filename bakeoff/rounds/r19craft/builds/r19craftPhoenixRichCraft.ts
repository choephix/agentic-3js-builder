// Ember phoenix: Genshin-style cel-shaded fire bird with spread flame wings, gold filigree jewellery and glowing
// pyro flame tongues. Skeleton first (spine, neck, head, jaw, wings, tail, legs, toes), then skins, feathers, cards.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { DEG, rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { paint, scales } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge, shadowOf, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Ember Phoenix",
  description:
    "A cel-shaded phoenix with flame plumage and wings spread wide, gold filigree jewellery, teal gems and glowing pyro flame tongues.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type Fill = string | Paint;

// Palette
const DEEP = "#8a1230";
const RED = "#d8222f";
const VERM = "#f2451f";
const ORANGE = "#ff8a1f";
const AMBER = "#ffb82e";
const GOLD = "#ffe066";
const CREAM = "#fff4cf";
const HOT = "#fffbe8";
const EDGE = "#6b1228";
const METAL = "#f0b020";
const METAL_D = "#b06a10";
const TEAL = "#2fe0d0";
const BEAK = "#ffc53a";
const BEAK_D = "#d8851a";
const CLAW = "#fff1c0";
const DARK = "#3a1020";

// Cel paints
const BODY = cel(
  furEdge(scales([RED, VERM], DEEP, { size: 0.045, width: 0.14 }), scales([GOLD, AMBER], "#e08a1c", { size: 0.04 }), {
    level: -0.1,
    teeth: 0.3,
    period: 0.045,
    along: [0, 0, 1],
    ink: EDGE,
    inkWidth: 0.05,
  }),
);
const HEAD = cel(
  paint((p) => {
    const front = p.z > 0.575 + 0.02 * zigzag(p.y / 0.03);
    const crown = p.y > 1.338 + 0.02 * zigzag(p.x / 0.03);
    if (crown) return RED;
    return front ? CREAM : ORANGE;
  }),
);
const JAWP = cel(CREAM);
const ARMP = cel(scales([RED, VERM], DEEP, { size: 0.045 }));
const LEGFUR = cel(scales([ORANGE, VERM], DEEP, { size: 0.05 }));
const TARSUS = cel(scales([METAL, AMBER], METAL_D, { size: 0.022, width: 0.16 }));

const featherPaint = (L: number, pal: readonly string[]) =>
  paint((_p, n, s) => {
    const u = s[0] / L;
    const e = Math.abs(s[1]);
    let c: string;
    if (e < 0.0032) c = METAL;
    else {
      const k = u + 0.08 * zigzag(e / (0.014 + L * 0.03));
      c = k < 0.3 ? pal[0] : k < 0.56 ? pal[1] : k < 0.8 ? pal[2] : pal[3];
      if (u > 0.35 && e < 0.011) c = pal[4];
    }
    return n.y < -0.25 ? shadowOf(c) : c;
  });

const ribbonPaint = (cuts: readonly number[], cols: readonly string[]) =>
  paint((_p, n, s) => {
    const k = s[0] + 0.05 * zigzag(s[1] / 40);
    let i = 0;
    while (i < cuts.length && k >= cuts[i]) i++;
    const c = cols[Math.min(i, cols.length - 1)];
    return n.y < -0.3 ? shadowOf(c) : c;
  });

const PAL_PRIM = [DEEP, RED, ORANGE, GOLD, CREAM];
const PAL_SEC = [RED, VERM, AMBER, CREAM, HOT];
const PAL_COV = [VERM, ORANGE, GOLD, CREAM, HOT];
const PAL_LEAD = [ORANGE, AMBER, GOLD, CREAM, HOT];

const featherOutline = (L: number, w: number): OutlinePoint[] => [
  [0, -0.3 * w],
  [0.12 * L, -0.8 * w],
  [0.45 * L, -w],
  [0.8 * L, -0.68 * w],
  [L, 0, "sharp"],
  [0.82 * L, 0.6 * w],
  [0.48 * L, 0.92 * w],
  [0.14 * L, 0.7 * w],
  [0, 0.28 * w],
];

const featherCard = (edge: string, a: string, c: string, d: string) =>
  svg(
    `<svg viewBox="0 0 40 80">
    <path d="M20 79 C6 66 2 44 12 24 C15 17 18 8 20 1 C22 8 25 17 28 24 C38 44 34 66 20 79Z" fill="${edge}"/>
    <path d="M20 74 C9 63 6 45 14 27 C17 20 19 12 20 6 C21 12 23 20 26 27 C34 45 31 63 20 74Z" fill="${a}"/>
    <path d="M20 70 C13 60 11 46 17 31 C18 26 19.5 20 20 14 C20.5 20 22 26 23 31 C29 46 27 60 20 70Z" fill="${c}"/>
    <path d="M20 64 C16 56 15 46 19 36 L20 30 L21 36 C25 46 24 56 20 64Z" fill="${d}"/>
  </svg>`,
    { size: 128 },
  );

const FLAME_PATH = "M20 99 C5 92 0 72 8 54 C12 44 14 38 12 28 C20 36 22 28 20 2 C28 18 32 30 36 46 C42 68 36 92 20 99Z";
const FLAME = svg(
  `<svg viewBox="0 0 40 100">
    <path d="${FLAME_PATH}" fill="#ff4d1a"/>
    <g transform="translate(20 99) scale(0.74) translate(-20 -99)"><path d="${FLAME_PATH}" fill="#ff9a1f"/></g>
    <g transform="translate(20 99) scale(0.5) translate(-20 -99)"><path d="${FLAME_PATH}" fill="#ffe066"/></g>
    <g transform="translate(20 99) scale(0.27) translate(-20 -99)"><path d="${FLAME_PATH}" fill="#fffbe8"/></g>
  </svg>`,
  { size: 192 },
);

const FILIGREE = svg(
  `<svg viewBox="0 0 64 80">
    <path d="M32 6 C40 20 50 28 46 44 C44 54 36 60 32 74 C28 60 20 54 18 44 C14 28 24 20 32 6Z" fill="none" stroke="#9a5208" stroke-width="3"/>
    <path d="M32 18 C37 28 42 34 40 44 C38 50 34 54 32 62 C30 54 26 50 24 44 C22 34 27 28 32 18Z" fill="none" stroke="#9a5208" stroke-width="2.4"/>
    <path d="M18 44 C8 40 6 30 10 22 M46 44 C56 40 58 30 54 22" fill="none" stroke="#9a5208" stroke-width="2.6" stroke-linecap="round"/>
    <circle cx="32" cy="40" r="6" fill="none" stroke="#9a5208" stroke-width="2.4"/>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  const random = rng(7);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const back = (psi: number, u: THREE.Vector3) => V(0, 0, -Math.cos(psi)).addScaledVector(u, Math.sin(psi));

  const FEATH_RED = featherCard(EDGE, RED, ORANGE, GOLD);
  const FEATH_ORG = featherCard(EDGE, VERM, AMBER, CREAM);
  const FEATH_GLD = featherCard("#d9791c", AMBER, GOLD, CREAM);

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 0.8, -0.1], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.8, -0.1],
      [0, 0.86, 0.1],
      [0, 0.94, 0.3],
    ]),
    { parent: hips, role: "spine" },
  );
  const chest = spine.joints[1];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.94, 0.3],
      [0, 1.07, 0.42],
      [0, 1.2, 0.5],
      [0, 1.3, 0.56],
    ]),
    { parent: spine, role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: [0, 1.3, 0.56], dir: [0, 0.12, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.02, down: 0.03 }),
    aim: head.local({ forward: 0.2, down: 0.04 }),
    role: "jaw",
  });
  const HC = V(0, 1.32, 0.605);

  // ---------------------------------------------------------------- body
  const body = b.loft(
    [
      { at: [0, 0.77, -0.3], w: 0.12, h: 0.14 },
      { at: [0, 0.8, -0.12], w: 0.28, h: 0.3 },
      { at: [0, 0.86, 0.1], w: 0.33, h: 0.36 },
      { at: [0, 0.95, 0.3], w: 0.32, h: 0.36 },
      { at: [0, 1.08, 0.42], w: 0.19, h: 0.22 },
      { at: [0, 1.2, 0.5], w: 0.13, h: 0.15 },
      { at: [0, 1.28, 0.55], w: 0.11, h: 0.12 },
    ],
    { bone: [hips, spine, neck], color: BODY },
  );
  const skinB = b.surface(body);

  // ---------------------------------------------------------------- head
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), HEAD, {
    bone: head,
    at: HC,
    scale: [0.085, 0.08, 0.1],
  });
  b.part(new THREE.SphereGeometry(1, 10, 8), JAWP, {
    bone: jaw,
    at: V(HC.x, HC.y - 0.04, HC.z + 0.0),
    scale: [0.055, 0.04, 0.08],
  });
  // beak
  b.sweep(
    bezier([0, 1.325, 0.655], [0, 1.345, 0.73], [0, 1.27, 0.8]),
    (t) => [0.03 * (1 - t) + 0.003, 0.034 * (1 - t) + 0.004] as [number, number],
    {
      bone: head,
      color: BEAK,
      bands: [
        [0.78, BEAK],
        [1, BEAK_D],
      ],
      caps: { start: "flat", end: "point" },
      sides: 6,
    },
  );
  b.sweep(
    bezier([0, 1.295, 0.62], [0, 1.29, 0.72], [0, 1.285, 0.77]),
    (t) => [0.026 * (1 - t) + 0.003, 0.02 * (1 - t) + 0.003] as [number, number],
    {
      bone: jaw,
      color: BEAK,
      bands: [
        [0.8, BEAK],
        [1, BEAK_D],
      ],
      caps: { start: "flat", end: "point" },
      sides: 6,
    },
  );
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(1, 6, 4), BEAK_D, {
      bone: head,
      at: V(s * 0.02, 1.338, 0.672),
      scale: [0.006, 0.006, 0.013],
    });

  // anime eyes
  const EYE = animeEye({ iris: "#2ad8c8", blush: false });
  const skull_s = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skull_s.around(HC).at(s * 52, 6);
    if (hit) b.decal(skull_s, EYE, { at: hit, size: [0.05, 0.068], mirror: s > 0 });
  }

  // gold circlet with teal gem
  const ringPts = Array.from({ length: 12 }, (_, k) => {
    const a = (k / 12) * Math.PI * 2;
    return V(HC.x + Math.sin(a) * 0.076, HC.y + 0.05, HC.z + Math.cos(a) * 0.088);
  });
  b.sweep(catmull(ringPts, { closed: true }), 0.0065, METAL, { bone: head, sides: 6 });
  glow(
    b.part(new THREE.OctahedronGeometry(1, 0), TEAL, {
      bone: head,
      at: V(HC.x, HC.y + 0.052, HC.z + 0.095),
      scale: [0.015, 0.024, 0.011],
    }),
    1.2,
  );
  const circletN = V(0, 1, 0);
  for (const s of [1, -1]) {
    const root = V(HC.x + s * 0.074, HC.y + 0.05, HC.z + 0.02);
    leaf(head, root, V(s * 0.55, 0.15, -0.8), circletN, 0.16, 0.026, featherPaint(0.16, PAL_LEAD), 0.008);
    leaf(
      head,
      root.clone().add(V(0, 0.004, 0.02)),
      V(s * 0.9, 0.3, -0.3),
      circletN,
      0.11,
      0.02,
      featherPaint(0.11, PAL_COV),
      0.008,
    );
  }

  // cheek tufts
  b.cards(
    skull_s.scatter(14, { rng: random, minDist: 0.03, filter: (h) => h.n.z < 0.35 && h.n.y < 0.6 }),
    FEATH_GLD,
    { size: [0.04, 0.09], lean: 70, bend: 20, flow: [0, -0.2, -1], vary: 0.25, rng: random },
  );

  // crest plumes
  const plumeP = ribbonPaint([0.3, 0.55, 0.8], [RED, ORANGE, AMBER, GOLD]);
  const plume = (pts: number[][], wmax: number) =>
    b.sweep(
      catmull(pts),
      (t) => [0.007, wmax * (Math.sin(Math.PI * Math.pow(t, 0.7)) * 0.85 + 0.12 * (1 - t))] as [number, number],
      { bone: head, color: plumeP, caps: { start: "flat", end: "point" }, sides: 6 },
    );
  const crestTips: THREE.Vector3[] = [];
  const crestC = [
    [0, 1.38, 0.56],
    [0, 1.55, 0.5],
    [0, 1.66, 0.34],
    [0, 1.66, 0.12],
    [0, 1.55, -0.05],
  ];
  plume(crestC, 0.07);
  crestTips.push(V(0, 1.55, -0.05));
  for (const s of [1, -1]) {
    const A = [
      [s * 0.045, 1.37, 0.55],
      [s * 0.1, 1.5, 0.46],
      [s * 0.17, 1.58, 0.3],
      [s * 0.24, 1.56, 0.12],
      [s * 0.3, 1.46, -0.04],
    ];
    const B = [
      [s * 0.07, 1.33, 0.5],
      [s * 0.17, 1.4, 0.38],
      [s * 0.3, 1.43, 0.2],
      [s * 0.42, 1.38, 0.02],
      [s * 0.5, 1.26, -0.15],
    ];
    plume(A, 0.055);
    plume(B, 0.045);
    crestTips.push(V(A[4][0], A[4][1], A[4][2]), V(B[4][0], B[4][1], B[4][2]));
  }

  // ---------------------------------------------------------------- chest ornament
  const front = skinB.ray([0, 1.0, 1.0], [0, 0, -1])!;
  const plateC = front.at.clone().addScaledVector(front.n, 0.012);
  const tan = V(0, front.n.z, -front.n.y).normalize();
  b.extrude(
    [
      [0, -0.08, "sharp"],
      [0.045, -0.035],
      [0.06, 0.015],
      [0.04, 0.06],
      [0.015, 0.07],
      [0, 0.085, "sharp"],
      [-0.015, 0.07],
      [-0.04, 0.06],
      [-0.06, 0.015],
      [-0.045, -0.035],
    ],
    { at: plateC, x: [1, 0, 0], y: tan, thickness: 0.012, bevel: 0.003, smoothing: 1, color: METAL, bone: chest },
  );
  b.part(new THREE.PlaneGeometry(0.1, 0.125), "#ffffff", {
    bone: chest,
    at: plateC.clone().addScaledVector(front.n, 0.0075),
    dir: front.n,
    axis: "z",
    texture: FILIGREE,
  });
  glow(
    b.part(new THREE.OctahedronGeometry(1, 0), TEAL, {
      bone: chest,
      at: plateC.clone().addScaledVector(front.n, 0.016).addScaledVector(tan, 0.005),
      scale: [0.016, 0.024, 0.011],
    }),
    1.2,
  );
  // tassel
  const tassTop = plateC.clone().addScaledVector(tan, -0.08).addScaledVector(front.n, 0.006);
  const tassBot = tassTop.clone().add(V(0, -0.13, 0));
  b.rod(tassTop, tassBot, 0.004, DEEP, { bone: chest });
  b.part(new THREE.SphereGeometry(0.016, 6, 5), METAL, { bone: chest, at: tassBot });
  b.spike(tassBot.clone().add(V(0, -0.1, 0)), [0, 1, 0], 0.1, 0.03, { color: RED, bone: chest });
  glow(b.part(new THREE.SphereGeometry(0.011, 6, 4), TEAL, { bone: chest, at: tassBot.clone().add(V(0, -0.11, 0)) }));

  // gold collar with beads
  const neckLoop = skinB.loop(neck.joints[1], { lift: 0.012 });
  b.sweep(neckLoop, 0.011, METAL, { sides: 6 });
  let bead = 0;
  b.along(neckLoop, 12, (at) => {
    if (bead++ % 3 === 0)
      glow(b.part(new THREE.OctahedronGeometry(0.02, 0), TEAL, { at, scale: [0.8, 1.2, 0.8] }), 1.1);
    else b.part(new THREE.SphereGeometry(0.014, 6, 4), METAL, { at });
  });

  // ---------------------------------------------------------------- feather cards on body
  const plateKeep = (p: THREE.Vector3) => p.distanceTo(plateC) > 0.1;
  b.cards(
    skinB.scatter(110, {
      rng: random,
      minDist: 0.045,
      filter: (h) => h.at.y < 1.06 && h.at.y > 0.72 && h.at.z > 0.0 && h.n.y > -0.55 && plateKeep(h.at),
    }),
    FEATH_GLD,
    { size: [0.075, 0.17], lean: 58, bend: 25, vary: 0.25, spin: 12, rng: random },
  );
  b.cards(
    skinB.scatter(80, { rng: random, minDist: 0.035, filter: (h) => h.at.y >= 1.06 && h.at.y < 1.27 && h.n.z > -0.3 }),
    [FEATH_ORG, FEATH_GLD],
    { size: [0.055, 0.12], lean: 55, bend: 25, vary: 0.25, spin: 10, rng: random },
  );
  b.cards(
    skinB.scatter(90, { rng: random, minDist: 0.045, filter: (h) => h.at.z < 0.05 && h.n.y > 0.2 }),
    [FEATH_RED, FEATH_ORG],
    { size: [0.08, 0.2], lean: 62, bend: 25, vary: 0.25, spin: 12, rng: random },
  );

  // ---------------------------------------------------------------- tail
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.78, -0.3],
      [0, 0.76, -0.5],
      [0, 0.72, -0.72],
    ]),
    { parent: hips, role: "tail" },
  );
  b.sweep(tail, [0.075, 0.03], { color: ARMP });
  b.lathe(
    [
      [0.06, -0.018],
      [0.085, -0.012],
      [0.085, 0.012],
      [0.06, 0.018],
    ],
    { at: V(0, 0.775, -0.37), axis: [0, -0.05, -1], color: METAL, bone: tail.joints[0], segments: 10 },
  );
  const streamP = ribbonPaint([0.22, 0.5, 0.72, 0.9], [DEEP, RED, ORANGE, AMBER, GOLD]);
  const tailTips: THREE.Vector3[] = [];
  for (let k = -3; k <= 3; k++) {
    const a = k * 0.2;
    const sp = Math.sin(a);
    const len = 1.0 + (3 - Math.abs(k)) * 0.22;
    const pts = [0, 0.33, 0.66, 1].map((u) => {
      const f = u * len;
      return [sp * f * (0.7 + 0.4 * u), 0.78 - 0.3 * Math.sin(Math.PI * 0.85 * u) + 0.1 * u * u, -0.3 - f * Math.cos(a)];
    });
    b.sweep(
      catmull(pts),
      (t) => [0.03 * (1 - t) + 0.062 * Math.sin(Math.PI * t), 0.009] as [number, number],
      { color: streamP, bone: tail.joints[0], caps: { start: "flat", end: "point" }, up: [0, 1, 0], sides: 6 },
    );
    tailTips.push(V(pts[3][0], pts[3][1], pts[3][2]));
  }

  // ---------------------------------------------------------------- legs
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const pts = limb(
      [s * 0.12, 0.7, -0.03],
      [s * 0.13, 0.1, 0.06],
      [0.27, 0.3, 0.24],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const leg = b.chain(`leg${S}`, pts, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `hock${S}`, `ankle${S}`],
      role: "leg",
    });
    const legS = b.sweep(
      leg,
      (t) => (t < 0.58 ? 0.1 - 0.065 * (t / 0.58) : 0.035 - 0.011 * ((t - 0.58) / 0.42)),
      {
        color: LEGFUR,
        bands: [
          [0.58, LEGFUR],
          [1, TARSUS],
        ],
      },
    );
    b.cards(
      b.surface(legS).scatter(30, { rng: random, minDist: 0.04, filter: (h) => h.at.y > 0.4 }),
      FEATH_ORG,
      { size: [0.07, 0.16], lean: 55, bend: 20, flow: [0, -1, -0.3], vary: 0.25, rng: random },
    );
    const ankle = pts[3];
    b.lathe(
      [
        [0.03, -0.012],
        [0.045, -0.008],
        [0.045, 0.008],
        [0.03, 0.012],
      ],
      {
        at: pts[2].clone().lerp(ankle, 0.5),
        axis: ankle.clone().sub(pts[2]).normalize(),
        color: METAL,
        bone: leg.joints[2],
        segments: 8,
      },
    );
    const toes = [
      { a: -0.4, len: 0.17 },
      { a: 0, len: 0.2 },
      { a: 0.4, len: 0.17 },
      { a: Math.PI, len: 0.1 },
    ];
    toes.forEach((toe, i) => {
      const dx = Math.sin(toe.a);
      const dz = Math.cos(toe.a);
      const pB = V(ankle.x + dx * toe.len * 0.5, 0.035, ankle.z + dz * toe.len * 0.5);
      const pC = V(ankle.x + dx * toe.len, 0.022, ankle.z + dz * toe.len);
      const chain = b.chain(`toe${i}${S}`, catmull([ankle, pB, pC]), { parent: leg, role: "digit" });
      b.sweep(chain, [0.024, 0.016], { color: TARSUS, sides: 6 });
      b.spike(pC, V(pC.x + dx * 0.05, -0.005, pC.z + dz * 0.05), null, 0.014, CLAW, {
        bone: chain.joints[chain.joints.length - 1],
        sides: 6,
      });
    });
  }

  // ---------------------------------------------------------------- wings
  const flameBig: THREE.Vector3[] = [];
  const flameSmall: THREE.Vector3[] = [];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const plane = (deg: number) => {
      const th = deg * DEG;
      return { u: V(s * Math.cos(th), Math.sin(th), 0), N: V(-s * Math.sin(th), Math.cos(th), 0) };
    };
    const P1 = plane(24);
    const P2 = plane(40);
    const S0 = V(s * 0.14, 1.0, 0.26);
    const elbowP = S0.clone().addScaledVector(P1.u, 0.5).add(V(0, 0, -0.16));
    const wristP = S0.clone().addScaledVector(P1.u, 1.0).add(V(0, 0, 0.06));
    const handP = wristP.clone().addScaledVector(P2.u, 0.3).add(V(0, 0, 0.03));
    const wing = b.chain(`wing${S}`, catmull([S0, elbowP, wristP, handP]), {
      parent: spine,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`],
      role: "wing",
    });
    const [shJ, elJ, wrJ] = wing.joints;
    b.sweep(wing, (t) => 0.07 - 0.04 * t, { color: ARMP });

    const mkFan = (name: string, parent: Joint, at: THREE.Vector3, dir: THREE.Vector3) =>
      b.joint(name, { parent, at, aim: at.clone().addScaledVector(dir, 0.3), role: "fan" });
    const primFan = [72, 55, 40].map((deg, g) => mkFan(`primary${g}${S}`, wrJ, wristP, back(deg * DEG, P2.u)));
    const secFan = [4, 14].map((deg, g) =>
      mkFan(
        `secondary${g}${S}`,
        elJ,
        g ? elbowP.clone().lerp(wristP, 0.5) : elbowP.clone(),
        back(deg * DEG, P1.u),
      ),
    );

    // primaries and their coverts
    const PL = [0.7, 0.82, 0.86, 0.84, 0.8, 0.76, 0.72, 0.68, 0.64, 0.6];
    PL.forEach((L, i) => {
      const dir = back((80 - i * 5) * DEG, P2.u);
      const root = handP.clone().lerp(wristP, i / 9).addScaledVector(P2.N, (i % 2) * 0.005);
      const bone = primFan[Math.floor((i * 3) / 10)];
      leaf(bone, root, dir, P2.N, L, 0.062, featherPaint(L, PAL_PRIM), 0.012);
      const cl = L * 0.42;
      leaf(
        bone,
        root.clone().addScaledVector(P2.N, 0.016).addScaledVector(dir, 0.03),
        dir,
        P2.N,
        cl,
        0.055,
        featherPaint(cl, PAL_COV),
        0.01,
      );
      flameBig.push(root.clone().addScaledVector(dir, L));
    });

    // secondaries, greater and median coverts
    for (let i = 0; i < 9; i++) {
      const t = (i + 0.5) / 9;
      const psi = (4 + t * 16) * DEG;
      const dir = back(psi, P1.u);
      const L = 0.56 - 0.06 * t;
      const root = elbowP.clone().lerp(wristP, t).addScaledVector(P1.N, (i % 2) * 0.005);
      const bone = secFan[t < 0.5 ? 0 : 1];
      leaf(bone, root, dir, P1.N, L, 0.07, featherPaint(L, PAL_SEC), 0.012);
      leaf(
        bone,
        root.clone().addScaledVector(P1.N, 0.016).addScaledVector(dir, 0.02),
        dir,
        P1.N,
        0.3,
        0.06,
        featherPaint(0.3, PAL_COV),
        0.01,
      );
      leaf(
        bone,
        root.clone().add(V(0, 0, 0.05)).addScaledVector(P1.N, 0.03),
        dir,
        P1.N,
        0.2,
        0.05,
        featherPaint(0.2, PAL_LEAD),
        0.01,
      );
      if (i % 2 === 0) flameSmall.push(root.clone().addScaledVector(dir, L));
    }

    // tertials
    for (let i = 0; i < 5; i++) {
      const t = (i + 0.5) / 5;
      const dir = back((-20 + t * 20) * DEG, P1.u);
      const L = 0.46 - 0.04 * t;
      const root = S0.clone().lerp(elbowP, t).addScaledVector(P1.N, (i % 2) * 0.005);
      leaf(shJ, root, dir, P1.N, L, 0.07, featherPaint(L, PAL_SEC), 0.012);
      leaf(
        shJ,
        root.clone().addScaledVector(P1.N, 0.016).addScaledVector(dir, 0.02),
        dir,
        P1.N,
        0.26,
        0.06,
        featherPaint(0.26, PAL_COV),
        0.01,
      );
    }

    // leading-edge feathers along the arm
    for (let m = 0; m < 14; m++) {
      const t = m / 13;
      const base = t < 0.5 ? S0.clone().lerp(elbowP, t * 2) : elbowP.clone().lerp(wristP, (t - 0.5) * 2);
      const root = base.add(V(0, 0, 0.045)).addScaledVector(P1.N, 0.05);
      leaf(t < 0.5 ? shJ : elJ, root, back(15 * DEG, P1.u), P1.N, 0.17, 0.035, featherPaint(0.17, PAL_LEAD), 0.009);
    }
    for (let m = 0; m < 5; m++) {
      const root = wristP.clone().lerp(handP, m / 4).add(V(0, 0, 0.03)).addScaledVector(P2.N, 0.03);
      leaf(wrJ, root, back(75 * DEG, P2.u), P2.N, 0.22, 0.04, featherPaint(0.22, PAL_LEAD), 0.009);
    }

    // wrist cuff, gem, thumb claw
    const handDir = handP.clone().sub(wristP).normalize();
    b.lathe(
      [
        [0.045, -0.03],
        [0.068, -0.022],
        [0.07, 0.02],
        [0.045, 0.03],
      ],
      { at: wristP, axis: handDir, color: METAL, bone: wrJ, segments: 10 },
    );
    glow(
      b.part(new THREE.OctahedronGeometry(1, 0), TEAL, {
        bone: wrJ,
        at: wristP.clone().addScaledVector(P1.N, 0.076),
        scale: [0.014, 0.014, 0.022],
      }),
      1.2,
    );
    b.spike(wristP.clone().add(V(0, 0, 0.03)), V(s * 0.3, 0.2, 0.9), 0.09, 0.015, METAL, { bone: wrJ, sides: 6 });
  }

  // flame tongues on wing tips, tail and crest
  glow(
    b.cards(
      [...flameBig, ...tailTips, ...crestTips].map((p) => frame(p, [0, 1, 0])),
      FLAME,
      { size: [0.12, 0.3], cross: true, vary: 0.3, rng: random, sink: 0.05 },
    ),
    1,
  );
  glow(
    b.cards(
      flameSmall.map((p) => frame(p, [0, 1, 0])),
      FLAME,
      { size: [0.08, 0.2], cross: true, vary: 0.3, rng: random, sink: 0.05 },
    ),
    1,
  );

  return b.root;

  // A flame feather: a flat leaf whose length runs along `dirIn` flattened into the wing plane `N`.
  function leaf(
    bone: Joint,
    root: THREE.Vector3,
    dirIn: THREE.Vector3,
    N: THREE.Vector3,
    L: number,
    w: number,
    color: Fill,
    thick = 0.011,
  ) {
    const d = dirIn.clone().addScaledVector(N, -dirIn.dot(N)).normalize();
    const y = N.clone().cross(d).normalize();
    return b.extrude(featherOutline(L, w), { at: root, x: d, y, thickness: thick, color, bone, smoothing: 1 });
  }
}
