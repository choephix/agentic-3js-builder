import * as THREE from "three";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { catmull } from "../src/path";
import { limb } from "../src/ik";
import { paint } from "../src/paint";
import { svg } from "../src/texture";
import { animeEye, cel, furEdge, INK } from "../kits/toon";
import { glow } from "../kits/glow";

export const meta = {
  name: "Clydesdale Draft Horse",
  description:
    "A chestnut Clydesdale in festival harness: cream feathered fetlocks and hooves, a teal-and-gold blanket with a filigree crest, a studded collar, a bridle with a glowing brow gem, coral tassels and a bow in the tail.",
  style: "Genshin Impact",
  commit: "b816db2",
};

type V3 = [number, number, number];
type Keys = [number, number][];

// Piecewise-linear profile over t in [0, 1].
const pw = (keys: Keys) => (t: number): number => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    if (t <= t1) {
      const [t0, v0] = keys[i - 1];
      return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
    }
  }
  return keys[keys.length - 1][1];
};
const pr = (kx: Keys, ky: Keys) => (t: number): [number, number] => [pw(kx)(t), pw(ky)(t)];

// Angle from the world-up side of a tube: 0 = top, 180 = underside.
const dTop = (deg: number): number => {
  const a = ((deg % 360) + 360) % 360;
  return Math.min(a, 360 - a);
};
const signedDeg = (deg: number): number => {
  const a = ((deg % 360) + 360) % 360;
  return a > 180 ? a - 360 : a;
};

const norm = (v: V3): V3 => {
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
};

// Head frame: POLL is the top of the skull; H_AX runs poll to nose (down and forward);
// H_UP is the dorsal (forehead) direction. Both lie in the sagittal plane.
const H_AX = norm([0, -0.66, 0.75]);
const H_UP = norm([0, 0.75, 0.66]);
const POLL: V3 = [0, 2.1, 0.95];
const hp = (d: number, u: number, x = 0): V3 => [
  x,
  POLL[1] + H_AX[1] * d + H_UP[1] * u,
  POLL[2] + H_AX[2] * d + H_UP[2] * u,
];

const BODY_PTS: V3[] = [
  [0, 1.4, -0.62],
  [0, 1.42, -0.3],
  [0, 1.41, 0],
  [0, 1.4, 0.3],
  [0, 1.34, 0.5],
];
const NECK_PTS: V3[] = [
  [0, 1.6, 0.26],
  [0, 1.84, 0.46],
  [0, 2.0, 0.72],
  POLL,
];
const HEAD_PTS: V3[] = [hp(0, 0), hp(0.16, 0), hp(0.32, -0.01), hp(0.48, -0.03), hp(0.62, -0.05)];
const TAIL_PTS: V3[] = [
  [0, 1.5, -0.84],
  [0, 1.36, -1.0],
  [0, 1.0, -1.1],
  [0, 0.62, -1.13],
  [0, 0.42, -1.1],
];

const HEAD_R = pr(
  [
    [0, 0.1],
    [0.26, 0.118],
    [0.52, 0.086],
    [0.77, 0.07],
    [1, 0.058],
  ],
  [
    [0, 0.11],
    [0.26, 0.122],
    [0.52, 0.086],
    [0.77, 0.07],
    [1, 0.06],
  ],
);

// Palette: chestnut coat with a cream belly, teal leather, gold filigree, coral tassels, cyan glow.
const CHESTNUT = "#c8703a";
const BELLY = "#f6c896";
const COAT = cel(furEdge(CHESTNUT, BELLY, { axis: [0, 1, 0], level: -0.3, teeth: 0.14, period: 0.04 }));
const LEATHER = cel("#1f6f86", "#17485e");
const GOLD = cel("#ffd766", "#c98a2e");
const CORAL = cel("#ff7a66", "#c4493f");
const HOOF = cel("#3a2740", "#241527");
const BLAZE = cel("#fff4df", "#f0d2b0");
const MUZZLE = cel("#f7b9a0", "#d98a7a");
const TAIL_HAIR = "#e8c98a";
const GEM = "#7ff3ff";

// Blanket: teal cloth with a gold lattice and gold border, nested inside the body paint.
const BLANKET = cel(
  paint((p, _n, s) => {
    const a = signedDeg(s[1]);
    if (Math.abs(a) > 50) return "#ffd766";
    const lattice = Math.sin(p.z * 44) * Math.sin(((a * Math.PI) / 180) * 0.42 * 44);
    return lattice > 0.55 ? "#ffd766" : "#1f6f86";
  }),
);

const BODY = paint((p, _n, s) => (p.z > -0.31 && p.z < 0.01 && dTop(s[1]) < 56 ? BLANKET : COAT));

const HEAD = paint((_p, _n, s) => {
  if (s[0] > 0.95) return MUZZLE;
  if (dTop(s[1]) < 22 && s[0] > 0.22 && s[0] < 0.85) return BLAZE;
  return COAT;
});

// SVG textures. Each drawing's bottom edge is its root; cards grow from there.
const FEATHER_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 100">
<path d="M20 100 C12 84 2 60 1 30 C8 38 10 22 14 12 C16 26 18 6 20 0 C22 6 24 26 26 12 C30 22 32 38 39 30 C38 60 28 84 20 100 Z" fill="#fff6e0"/>
<path d="M20 96 C17 72 14 50 12 26" stroke="#e6cf9e" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M20 96 C23 72 26 50 28 26" stroke="#e6cf9e" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M20 96 C20 70 20 44 20 16" stroke="#f3e2bf" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>`,
  { size: 128 },
);
const MANE_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 100">
<path d="M22 100 C8 80 30 60 16 36 C8 22 22 10 26 0 C36 14 44 32 36 54 C28 70 40 84 26 100 Z" fill="#fbe7b5"/>
<path d="M14 98 C10 80 20 66 14 44 C12 32 16 22 19 12" fill="#fbe7b5"/>
<path d="M22 98 C16 80 26 64 20 42 C17 30 22 20 24 10" stroke="#d9a66a" stroke-width="2.4" fill="none" stroke-linecap="round"/>
<path d="M30 96 C28 80 34 66 32 50" stroke="#fff6dc" stroke-width="2.2" fill="none" stroke-linecap="round"/>
</svg>`,
  { size: 128 },
);
const TASSEL_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 64">
<path d="M12 50 C6 40 4 24 2 4" stroke="#ff7a66" stroke-width="2.4" fill="none" stroke-linecap="round"/>
<path d="M12 50 C9 36 9 20 8 2" stroke="#ff9a6a" stroke-width="2.4" fill="none" stroke-linecap="round"/>
<path d="M12 50 C12 36 13 20 12 0" stroke="#ff7a66" stroke-width="2.4" fill="none" stroke-linecap="round"/>
<path d="M12 50 C15 36 15 20 16 2" stroke="#ff9a6a" stroke-width="2.4" fill="none" stroke-linecap="round"/>
<path d="M12 50 C18 40 20 24 22 4" stroke="#ff7a66" stroke-width="2.4" fill="none" stroke-linecap="round"/>
<rect x="9" y="48" width="6" height="14" rx="2" fill="#ffd766"/>
</svg>`,
  { size: 128 },
);
const RUNE_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<g fill="none" stroke="#7ff3ff" stroke-width="3.5" stroke-linecap="round">
<path d="M32 32 C32 20 44 18 46 28 C48 38 36 46 28 40 C20 34 22 20 34 14"/>
<path d="M10 52 C18 46 24 54 30 50"/>
</g>
<circle cx="32" cy="32" r="3.5" fill="#7ff3ff"/>
</svg>`,
  { size: 128 },
);
const FILIGREE_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60">
<g fill="none" stroke="#ffe27a" stroke-width="2.6" stroke-linecap="round">
<path d="M50 56 V10"/>
<path d="M50 50 C30 50 18 40 22 26 C25 14 40 14 40 26 C40 36 30 36 30 28"/>
<path d="M50 50 C70 50 82 40 78 26 C75 14 60 14 60 26 C60 36 70 36 70 28"/>
<path d="M4 54 C12 40 20 52 30 44"/>
<path d="M96 54 C88 40 80 52 70 44"/>
<circle cx="50" cy="12" r="5"/>
</g></svg>`,
  { size: 256 },
);

const EYE = animeEye({ iris: "#3fd0ff", irisLight: "#b8f1ff" });
const EAR: OutlinePoint[] = [
  [-0.036, 0],
  [0.036, 0],
  [0.046, 0.07],
  [0, 0.14, "sharp"],
  [-0.046, 0.07],
];
const PETAL: OutlinePoint[] = [
  [0, 0],
  [0.05, 0.06],
  [0.08, 0.16],
  [0, 0.2, "sharp"],
  [-0.08, 0.16],
  [-0.05, 0.06],
];
const MEDAL: OutlinePoint[] = [
  [0, 0],
  [0.075, 0],
  [0.08, 0.012],
  [0.062, 0.022],
  [0, 0.022],
];
const BELL: OutlinePoint[] = [
  [0, 0],
  [0.012, 0],
  [0.02, 0.012],
  [0.03, 0.04],
  [0.036, 0.055],
  [0, 0.055],
];

// A closed ring round the head at axis distance d, offset outward by pad.
function headRing(d: number, pad: number): V3[] {
  const c = hp(d, 0, 0);
  const [rx, ry] = HEAD_R(d / 0.62);
  const pts: V3[] = [];
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    const k = (ry + pad) * Math.sin(a);
    pts.push([(rx + pad) * Math.cos(a), c[1] + k * H_UP[1], c[2] + k * H_UP[2]]);
  }
  return pts;
}

export default function build() {
  const b = createBuilder({ name: "clydesdaleHorse" });

  // Spine: pelvis root, body chain from rump to chest, neck from the chest, head at the poll.
  const hips = b.joint("hips", { at: [0, 1.38, -0.5], role: "spine" });
  const body = b.chain("body", catmull(BODY_PTS), {
    parent: hips,
    names: ["bodyA", "bodyB", "bodyC", "bodyD", "chestTip"],
    role: "spine",
  });
  const bodySw = b.sweep(
    body,
    pr(
      [
        [0, 0.28],
        [0.3, 0.35],
        [0.6, 0.39],
        [0.85, 0.37],
        [1, 0.3],
      ],
      [
        [0, 0.33],
        [0.3, 0.4],
        [0.6, 0.43],
        [0.85, 0.42],
        [1, 0.36],
      ],
    ),
    { color: BODY, shift: [0, -0.03] },
  );
  const bodySurf = b.surface(bodySw);

  const neck = b.chain("neck", catmull(NECK_PTS), {
    parent: body.joints[3],
    names: ["neckA", "neckB", "neckC", "neckTip"],
    role: "neck",
  });
  const neckSw = b.sweep(
    neck,
    pr(
      [
        [0, 0.25],
        [0.5, 0.2],
        [1, 0.14],
      ],
      [
        [0, 0.27],
        [0.5, 0.22],
        [1, 0.15],
      ],
    ),
    { color: COAT },
  );
  const neckSurf = b.surface(neckSw);

  const head = b.joint("head", { parent: neck.tip!, at: POLL, aim: hp(0.62, -0.05), role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: hp(0.14, -0.1), aim: hp(0.56, -0.07), role: "jaw" });
  const headSw = b.sweep(catmull(HEAD_PTS), HEAD_R, { bone: head, color: HEAD });
  const headSurf = b.surface(headSw);
  b.sweep(
    catmull([hp(0.14, -0.1), hp(0.3, -0.12), hp(0.46, -0.1), hp(0.56, -0.07)]),
    pr(
      [
        [0, 0.05],
        [1, 0.035],
      ],
      [
        [0, 0.05],
        [1, 0.03],
      ],
    ),
    { bone: jaw, color: COAT },
  );

  // Ears, eyes and nostrils on the head.
  for (const s of [1, -1]) {
    b.extrude(EAR, { at: hp(0, 0.07, s * 0.05), x: H_AX, y: H_UP, thickness: 0.014, bevel: 0.004, color: COAT, bone: head });
  }
  for (const s of [1, -1]) {
    const hit = headSurf.nearest(hp(0.2, 0, s * 0.12));
    b.decal(headSurf, EYE, { at: hit, dir: [s * 0.6, 0, 0.8], size: [0.085, 0.12], mirror: s > 0 });
  }
  for (const s of [1, -1]) {
    b.stick(new THREE.SphereGeometry(0.014, 6, 4), INK, headSurf.nearest(hp(0.6, -0.04, s * 0.04)), { embed: 0.3 });
  }

  // Bridle: crown band with gold studs and cheek tassels, a noseband, and the glowing brow gem.
  const crown = catmull(headRing(0.1, 0.02), { closed: true });
  b.sweep(crown, 0.011, { color: LEATHER });
  const nose = catmull(headRing(0.46, 0.024), { closed: true });
  b.sweep(nose, 0.011, { color: LEATHER });
  for (let i = 0; i < 12; i++) {
    const hit = headSurf.nearest(crown.at(i / 12));
    if (i % 3 === 0) glow(b.stick(new THREE.OctahedronGeometry(0.012), GEM, hit, { embed: 0.3 }), 1);
    else b.stick(new THREE.SphereGeometry(0.008, 6, 4), GOLD, hit, { embed: 0.3 });
  }
  for (let i = 0; i < 8; i++) {
    b.stick(new THREE.SphereGeometry(0.008, 6, 4), GOLD, headSurf.nearest(nose.at(i / 8)), { embed: 0.3 });
  }
  b.cards(
    [0.25, 0.75].map((t) => frame(crown.at(t), [0, 1, 0])),
    TASSEL_TEX,
    { size: [0.04, 0.12], lean: 180, flow: [0, 0, 1], vary: 0.1, rng: rng(43) },
  );
  const brow = headSurf.nearest(hp(0.3, 0.12, 0));
  glow(b.stick(new THREE.OctahedronGeometry(0.03), GEM, brow), 1.4);

  // Mane: full cards along the crest of the neck, and a forelock over the poll.
  const maneFrames = [];
  for (let i = 0; i < 22; i++) {
    const t = 0.08 + (i / 22) * 0.9;
    for (const d of [-22, 0, 22]) maneFrames.push(neckSw.at(t, d));
  }
  b.cards(maneFrames, MANE_TEX, {
    size: [0.075, 0.22],
    lean: 50,
    flow: [0, -0.4, -1],
    bend: 15,
    vary: 0.25,
    rng: rng(21),
  });
  const forelock = [];
  for (const t of [0.05, 0.1, 0.15, 0.2]) for (const d of [-18, 0, 18]) forelock.push(headSw.at(t, d));
  b.cards(forelock, MANE_TEX, { size: [0.05, 0.1], lean: 55, flow: H_AX, bend: 10, vary: 0.2, rng: rng(22) });

  // Collar: teal padded collar round the base of the neck, with gold studs.
  const collar = neckSurf.loop(frame([0, 1.72, 0.4], [0, 0.67, 0.74]), { lift: 0.03 });
  const collarSw = b.sweep(collar, [0.055, 0.045], { color: LEATHER });
  const collarSurf = b.surface(collarSw);
  for (let i = 0; i < 16; i++) {
    b.stick(new THREE.SphereGeometry(0.011, 6, 4), GOLD, collarSurf.nearest(collar.at(i / 16)), { embed: 0.3 });
  }

  // Breast strap with a gold medallion, a hanging bell, tassels and the glowing centre gem.
  const strapP = bodySurf.drape(
    catmull([
      [0.2, 1.62, 0.42],
      [0.24, 1.44, 0.66],
      [0.14, 1.3, 0.82],
      [0, 1.24, 0.86],
      [-0.14, 1.3, 0.82],
      [-0.24, 1.44, 0.66],
      [-0.2, 1.62, 0.42],
    ]),
    { lift: 0.012 },
  );
  const strapSw = b.sweep(strapP, [0.03, 0.012], { color: LEATHER });
  const strapSurf = b.surface(strapSw);
  for (let i = 1; i < 9; i++) {
    b.stick(new THREE.SphereGeometry(0.012, 6, 4), GOLD, strapSurf.nearest(strapP.at(i / 9)), { embed: 0.3 });
  }
  const medH = bodySurf.nearest([0, 1.22, 0.8]);
  b.lathe(MEDAL, { at: medH, axis: [0, 0, 1], segments: 18, color: GOLD });
  glow(b.stick(new THREE.OctahedronGeometry(0.035), GEM, medH.moved([0, 0.03, 0])), 1.4);
  b.rod([0, 1.2, 0.86], [0, 1.13, 0.86], 0.008, { color: GOLD });
  b.lathe(BELL, { at: [0, 1.13, 0.86], axis: [0, -1, 0], segments: 12, color: GOLD });
  b.cards(
    [0.36, 0.64].map((t) => frame(strapP.at(t), [0, 1, 0])),
    TASSEL_TEX,
    { size: [0.05, 0.17], lean: 180, flow: [0, 0, 1], vary: 0.15, rng: rng(41) },
  );

  // Saddle blanket: gold trims on its rear and front edges, tassels on the rear edge, a filigree crest on top.
  const trimR = bodySurf.loop(body.joints[1], { lift: 0.02 });
  const trimF = bodySurf.loop(body.joints[2], { lift: 0.02 });
  const arcR = trimR.slice(0.84, 1).concat(trimR.slice(0, 0.16));
  const arcF = trimF.slice(0.84, 1).concat(trimF.slice(0, 0.16));
  b.sweep(arcR, 0.014, { color: GOLD });
  b.sweep(arcF, 0.014, { color: GOLD });
  b.cards(
    [0.1, 0.3, 0.5, 0.7, 0.9].map((u) => frame(arcR.at(u), [0, 1, 0])),
    TASSEL_TEX,
    { size: [0.045, 0.13], lean: 180, flow: [0, 0, 1], vary: 0.2, rng: rng(42) },
  );
  b.decal(bodySurf, FILIGREE_TEX, {
    at: bodySurf.nearest([0, 1.8, -0.15]),
    dir: [0, 1, 0],
    up: [0, 0, 1],
    size: [0.36, 0.22],
  });
  for (const s of [1, -1]) {
    glow(b.decal(bodySurf, RUNE_TEX, { at: bodySurf.nearest([s * 0.36, 1.3, -0.12]), dir: [s, 0, 0], size: [0.14, 0.14] }), 1);
  }

  // Girth strap round the barrel, behind the forelegs.
  const girth = bodySurf.loop(body.joints[3], { lift: 0.02 });
  const girthSw = b.sweep(girth, 0.026, { color: LEATHER });
  const girthSurf = b.surface(girthSw);
  for (let i = 0; i < 12; i++) {
    b.stick(new THREE.SphereGeometry(0.014, 6, 4), GOLD, girthSurf.nearest(girth.at(i / 12)), { embed: 0.3 });
  }

  // Tail: long flaxen hair with cards, and a coral bow at the root.
  const tail = b.chain("tail", catmull(TAIL_PTS), {
    parent: body.joints[0],
    names: ["tailA", "tailB", "tailC", "tailD", "tailTip"],
    role: "tail",
  });
  const tailSw = b.sweep(
    tail,
    pw([
      [0, 0.05],
      [0.35, 0.06],
      [0.75, 0.085],
      [1, 0.07],
    ]),
    { color: TAIL_HAIR },
  );
  const tailHits = b.surface(tailSw).scatter(170, { rng: rng(31), minDist: 0.025, filter: (h) => h.at.y > 0.5 });
  b.cards(tailHits, MANE_TEX, { size: [0.07, 0.32], lean: 30, flow: [0, -1, -0.1], bend: 22, vary: 0.25, rng: rng(32) });
  for (const s of [1, -1]) {
    b.extrude(PETAL, { at: [s * 0.02, 1.5, -0.86], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.025, bevel: 0.005, smoothing: 1, color: CORAL });
  }
  b.part(new THREE.SphereGeometry(0.03, 8, 6), GOLD, { at: [0, 1.5, -0.86] });

  // Legs: forelegs and hindlegs with cream feathering, gold fetlock cuffs and dark hooves.
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";

    const fPts = limb([s * 0.2, 1.3, 0.5], [s * 0.2, 0, 0.6], [0.48, 0.46, 0.27, 0.15], [
      [0, 0, -1],
      [0, 0, 1],
      [0, 0, -1],
    ]);
    const fore = b.chain(`fore${sd}`, fPts, {
      parent: body.joints[3],
      names: [`shoulder${sd}`, `elbow${sd}`, `knee${sd}`, `fetlock${sd}`, `hoof${sd}`],
      role: "leg",
    });
    const foreSw = b.sweep(
      fore,
      pw([
        [0, 0.16],
        [0.2, 0.14],
        [0.35, 0.12],
        [0.55, 0.085],
        [0.69, 0.078],
        [0.8, 0.072],
        [0.9, 0.066],
        [1, 0.064],
      ]),
      { color: COAT, caps: { start: "round", end: "none" } },
    );
    b.frustumBox(fPts[3], fPts[4], [0.15, 0.15], [0.18, 0.16], { bone: fore.tip!, color: HOOF });
    b.sweep(b.surface(foreSw).loop(fore.joints[2], { lift: 0.012 }), 0.013, { color: GOLD });
    b.cards(
      b.surface(foreSw).scatter(70, {
        rng: rng(s > 0 ? 51 : 52),
        minDist: 0.03,
        filter: (h) => h.at.y < 0.42 && h.at.y > 0.18 && h.n.y < 0.55,
      }),
      FEATHER_TEX,
      { size: [0.075, 0.14], lean: 62, flow: [0, -1, 0], bend: 20, vary: 0.25, rng: rng(s > 0 ? 53 : 54) },
    );

    const hPts = limb([s * 0.22, 1.27, -0.5], [s * 0.22, 0, -0.6], [0.46, 0.46, 0.27, 0.15], [
      [0, 0, 1],
      [0, 0, -1],
      [0, 0, 1],
    ]);
    const hind = b.chain(`hind${sd}`, hPts, {
      parent: body.joints[0],
      names: [`hip${sd}`, `stifle${sd}`, `hock${sd}`, `hfetlock${sd}`, `hhoof${sd}`],
      role: "leg",
    });
    const hindSw = b.sweep(
      hind,
      pw([
        [0, 0.18],
        [0.2, 0.16],
        [0.4, 0.12],
        [0.52, 0.09],
        [0.68, 0.078],
        [0.8, 0.074],
        [0.9, 0.066],
        [1, 0.064],
      ]),
      { color: COAT, caps: { start: "round", end: "none" } },
    );
    b.frustumBox(hPts[3], hPts[4], [0.15, 0.15], [0.18, 0.16], { bone: hind.tip!, color: HOOF });
    b.sweep(b.surface(hindSw).loop(hind.joints[2], { lift: 0.012 }), 0.013, { color: GOLD });
    b.cards(
      b.surface(hindSw).scatter(60, {
        rng: rng(s > 0 ? 61 : 62),
        minDist: 0.03,
        filter: (h) => h.at.y < 0.42 && h.at.y > 0.18 && h.n.y < 0.55,
      }),
      FEATHER_TEX,
      { size: [0.075, 0.14], lean: 62, flow: [0, -1, 0], bend: 20, vary: 0.25, rng: rng(s > 0 ? 63 : 64) },
    );
  }

  return b.root;
}
