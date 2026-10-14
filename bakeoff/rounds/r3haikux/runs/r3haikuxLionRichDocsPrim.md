```ts
import * as THREE from "three";
import { catmull, countershade, createBuilder, frame, limb, rng, svg } from "agentic-3js-builder";

export const meta = {
  name: "Lion",
  description:
    "A proud old lion resting with his head held high: a huge shaggy mane fading from golden blond at the face to dark chocolate at the edges, a tawny body with a cream belly and muzzle, amber eyes, a broad black nose, a scar across one brow, big padded paws and a long tail ending in a dark tuft.",
};

type V3 = [number, number, number];
type Frames = ReturnType<typeof frame>[];

const TAWNY = "#b9783d";
const TAWNY_DEEP = "#8c5627";
const TOE = "#6a3f20";
const CREAM = "#f2e2bc";
const NOSE = "#1c1411";
const TUFT = "#3a2416";
// mane colour by distance from the face: golden blond to dark chocolate
const MANE = ["#f4d580", "#eabb62", "#d99d4a", "#b97d3d", "#93592f", "#6c4023", "#46281a"];

// one mane hair: a tapered blade with its root on the bottom edge (greys take the card colour)
const STRAND_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 96">
<path d="M16 96C5 78 3 42 16 0C29 42 27 78 16 96Z" fill="#ffffff"/>
<path d="M16 88Q14.5 50 16 16" fill="none" stroke="#b5b5b5" stroke-width="2" stroke-linecap="round"/>
</svg>`;

// a brush of hairs for the tail tip
const TUFT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 96">
<path d="M24 96C9 84 4 56 7 30L12 36L13 10L19 26L24 2L29 26L35 10L36 36L41 30C44 56 39 84 24 96Z" fill="#ffffff"/>
<path d="M24 90L24 40" fill="none" stroke="#b0b0b0" stroke-width="2"/>
</svg>`;

const EYE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<circle cx="32" cy="32" r="31" fill="#2b1b10"/>
<circle cx="32" cy="32" r="26" fill="#e39a2a"/>
<circle cx="32" cy="32" r="18" fill="#f6c456"/>
<circle cx="32" cy="32" r="10.5" fill="#140d08"/>
<ellipse cx="38" cy="25" rx="4" ry="3" fill="#fff6dc"/>
</svg>`;

const SCAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 24">
<path d="M4 6L14 10L20 8L29 15L37 13L45 19L60 18" fill="none" stroke="#6e2b26" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M4 6L14 10L20 8L29 15L37 13L45 19L60 18" fill="none" stroke="#d99c8c" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const ell = (r: number, sx: number, sy: number, sz: number, seg = 12) =>
  new THREE.SphereGeometry(r, seg, Math.round(seg * 0.7)).scale(sx, sy, sz);
const norm = (v: V3): V3 => {
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
};
const comb = (a: V3, ka: number, c: V3, kc: number): V3 => [
  a[0] * ka + c[0] * kc,
  a[1] * ka + c[1] * kc,
  a[2] * ka + c[2] * kc,
];
const cross = (a: V3, c: V3): V3 => [
  a[1] * c[2] - a[2] * c[1],
  a[2] * c[0] - a[0] * c[2],
  a[0] * c[1] - a[1] * c[0],
];

export default function build() {
  const b = createBuilder({ name: "lion" });
  const jit = rng(7);

  // Key points in model space: +Y up, faces +Z, left is +X, metres.
  const H: V3 = [0, 1.0, 0.8]; // head centre
  const hp = (dx: number, dy: number, dz: number): V3 => [H[0] + dx, H[1] + dy, H[2] + dz];
  const NC: V3 = [0, 0.86, 0.63]; // neck centre
  const F: V3 = hp(0, 0.02, 0.12); // the face: the golden end of the mane

  const strand = svg(STRAND_SVG, { size: 256 });
  const tuftTex = svg(TUFT_SVG, { size: 256 });
  const eyeTex = svg(EYE_SVG, { size: 256 });
  const scarTex = svg(SCAR_SVG, { size: 256 });

  // ---- skeleton
  const hips = b.joint("hips", { at: [0, 0.5, -0.62], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.5, -0.5],
      [0, 0.52, -0.2],
      [0, 0.55, 0.05],
      [0, 0.58, 0.25],
      [0, 0.6, 0.38],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "spine4"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.6, 0.38],
      [0, 0.8, 0.56],
      [0, 0.92, 0.7],
      H,
    ]),
    { parent: spine, names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck, at: H, dir: [0, 0.22, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: hp(0, -0.07, 0.05), role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.52, -0.86],
      [0, 0.46, -1.1],
      [0, 0.32, -1.33],
      [0, 0.17, -1.5],
      [0, 0.1, -1.62],
      [0, 0.12, -1.72],
    ]),
    { parent: hips, role: "tail" },
  );

  // ---- body: a loft along the spine, tawny back and cream belly
  const bodyPaint = countershade(TAWNY, CREAM);
  b.loft(
    [
      { at: [0, 0.5, -0.9], w: 0.34, h: 0.4 },
      { at: [0, 0.5, -0.6], w: 0.46, h: 0.46 },
      { at: [0, 0.52, -0.25], w: 0.42, h: 0.4 },
      { at: [0, 0.54, 0.02], w: 0.4, h: 0.38 },
      { at: [0, 0.57, 0.25], w: 0.5, h: 0.5 },
      { at: [0, 0.6, 0.4], w: 0.42, h: 0.42 },
    ],
    { bone: [hips, spine], color: bodyPaint },
  );
  b.sweep(neck, (t: number) => 0.12 - 0.03 * t, { color: bodyPaint });
  b.sweep(tail, (t: number) => 0.052 - 0.024 * t, { color: TAWNY });

  // ---- legs: forelegs planted forward, hind legs folded under the haunch
  for (const s of [1, -1]) {
    const sd = s > 0 ? "L" : "R";

    const fore = limb([s * 0.2, 0.5, 0.3], [s * 0.2, 0.1, 0.66], [0.3, 0.28], [[0, 0, -1]]);
    const arm = b.chain(`fore${sd}`, catmull(fore), {
      parent: spine,
      names: [`shoulder${sd}`, `elbow${sd}`, `paw${sd}`],
      role: "leg",
    });
    b.sweep(arm, (t: number) => 0.085 - 0.022 * t, { color: TAWNY });
    b.part(ell(0.12, 0.8, 1.0, 0.95, 12), TAWNY, { at: [s * 0.2, 0.56, 0.3], bone: arm.joints[0] });
    // dark elbow fringe
    b.cards(
      [-1, 0, 1].map((k) => frame(fore[1], [k * 0.25, -0.3, -1])),
      strand,
      { size: [0.05, 0.09], lean: 25, color: TUFT, bone: arm.joints[1], sink: 0.2 },
    );
    // big padded paw, resting flat, with four toes
    b.part(ell(0.1, 1.12, 0.58, 1.38, 12), TAWNY_DEEP, { at: [s * 0.2, 0.058, 0.72], bone: arm.joints[2] });
    for (const x of [-0.048, -0.016, 0.016, 0.048]) {
      b.part(ell(0.024, 1, 0.8, 0.9, 8), TOE, { at: [s * 0.2 + x, 0.03, 0.83], bone: arm.joints[2] });
    }

    const hind = limb([s * 0.2, 0.5, -0.5], [s * 0.2, 0.1, -0.62], [0.3, 0.27], [[0, 0, 1]]);
    const leg = b.chain(`hind${sd}`, catmull(hind), {
      parent: hips,
      names: [`hip${sd}`, `knee${sd}`, `hock${sd}`],
      role: "leg",
    });
    b.sweep(leg, (t: number) => 0.13 - 0.065 * t, { color: TAWNY });
    b.part(ell(0.19, 0.85, 1.0, 1.05, 12), TAWNY, { at: [s * 0.2, 0.48, -0.5], bone: leg.joints[0] });
    b.part(ell(0.1, 1.1, 0.6, 1.4, 12), TAWNY_DEEP, { at: [s * 0.2, 0.06, -0.5], bone: leg.joints[2] });
    for (const x of [-0.048, -0.016, 0.016, 0.048]) {
      b.part(ell(0.024, 1, 0.8, 0.9, 8), TOE, { at: [s * 0.2 + x, 0.03, -0.38], bone: leg.joints[2] });
    }
  }

  // ---- tail with a dark tuft
  const TIP: V3 = [0, 0.12, -1.72];
  const tdir = norm([0, 0.2, -1]);
  const p1: V3 = [1, 0, 0];
  const p2 = norm(cross(tdir, p1));
  const tuftFrames: Frames = [];
  for (let k = 0; k < 14; k++) {
    const a = (k / 14) * Math.PI * 2;
    const rad = comb(p1, Math.cos(a), p2, Math.sin(a));
    tuftFrames.push(frame(comb(TIP, 1, rad, 0.02), norm(comb(tdir, 0.85, rad, 0.55))));
  }
  b.cards(tuftFrames, tuftTex, {
    size: [0.075, 0.15],
    lean: 0,
    bend: 15,
    color: TUFT,
    bone: tail.joints[4],
    sink: 0.15,
  });
  b.part(ell(0.04, 1, 1, 1.15, 10), TUFT, { at: TIP, bone: tail.joints[4] });

  // ---- head
  const skull = b.part(ell(0.13, 0.96, 0.98, 1.0, 16), TAWNY, { at: H, bone: head });
  const muzzle = b.part(ell(0.07, 1.15, 0.85, 1.3, 12), CREAM, { at: hp(0, -0.045, 0.1), bone: head });
  b.part(ell(0.035, 1.7, 0.75, 0.8, 10), NOSE, { at: hp(0, 0.005, 0.2), bone: head });
  b.part(ell(0.045, 1.2, 0.7, 1.15, 10), CREAM, { at: hp(0, -0.072, 0.12), bone: jaw });
  for (const s of [1, -1]) {
    b.part(ell(0.032, 1, 0.95, 0.5, 8), TAWNY_DEEP, { at: hp(s * 0.085, 0.09, -0.04), bone: head });
  }

  // amber eyes and the scar across the left brow, both as drawings on the skull
  const skullSurf = b.surface(skull);
  for (const s of [1, -1]) {
    b.decal(skull, eyeTex, { at: skullSurf.nearest(hp(s * 0.072, 0.02, 0.115)), size: [0.068, 0.068] });
  }
  b.decal(skull, scarTex, { at: skullSurf.nearest(hp(0.078, 0.066, 0.1)), size: [0.072, 0.027] });

  // whisker spots and the mouth line, on the muzzle
  const muzzleSurf = b.surface(muzzle);
  for (const s of [1, -1]) {
    for (const o of [
      [0.05, -0.012, 0.07],
      [0.058, -0.03, 0.05],
      [0.04, -0.036, 0.08],
    ]) {
      const hit = muzzleSurf.nearest(hp(s * o[0], -0.045 + o[1], 0.1 + o[2]));
      b.stick(new THREE.SphereGeometry(0.0075, 6, 4), NOSE, hit, { embed: 0.4 });
    }
    const lip = catmull([
      muzzleSurf.nearest(hp(0, -0.01, 0.2)).at,
      muzzleSurf.nearest(hp(s * 0.03, -0.04, 0.19)).at,
      muzzleSurf.nearest(hp(s * 0.07, -0.05, 0.14)).at,
    ]);
    b.sweep(lip, 0.0045, { color: NOSE });
  }

  // ---- mane: shaggy cards over the head and neck, coloured by distance from the face
  const headBins: Frames[] = MANE.map(() => []);
  const neckBins: Frames[] = MANE.map(() => []);
  const grow = (out: Frames[], centre: V3, count: number, r0: number, keep: (d: V3) => boolean) => {
    for (let i = 0; i < count; i++) {
      const y = 1 - (2 * (i + 0.5)) / count;
      const rr = Math.sqrt(1 - y * y);
      const a = i * GOLDEN;
      const d: V3 = [Math.cos(a) * rr, y, Math.sin(a) * rr];
      if (!keep(d)) continue;
      const rad = r0 * (0.9 + 0.2 * jit());
      const at: V3 = [centre[0] + d[0] * rad, centre[1] + d[1] * rad, centre[2] + d[2] * rad];
      const dist = Math.hypot(at[0] - F[0], at[1] - F[1], at[2] - F[2]);
      const t = (dist - 0.1) / 0.22 + (jit() - 0.5) * 0.25;
      const k = Math.min(MANE.length - 1, Math.max(0, Math.round(t * (MANE.length - 1))));
      out[k].push(frame(at, d));
    }
  };
  // the ruff around the head, with the face left open
  grow(headBins, H, 520, 0.13, (d) => d[2] < 0.5 && d[1] > -0.8);
  // the mane falling over the back and sides of the neck
  grow(neckBins, NC, 200, 0.11, (d) => d[2] < 0.1 && d[1] < 0.55 && d[1] > -0.9);

  MANE.forEach((col, k) => {
    if (headBins[k].length) {
      b.cards(headBins[k], strand, {
        size: [0.065, 0.17 + 0.014 * k],
        lean: 38,
        bend: 20,
        cross: true,
        vary: 0.25,
        rng: rng(40 + k),
        color: col,
        bone: head,
        sink: 0.12,
      });
    }
    if (neckBins[k].length) {
      b.cards(neckBins[k], strand, {
        size: [0.065, 0.16 + 0.014 * k],
        lean: 38,
        bend: 20,
        cross: true,
        vary: 0.25,
        rng: rng(80 + k),
        color: col,
        bone: neck.joints[1],
        sink: 0.12,
      });
    }
  });

  return b.root;
}
```