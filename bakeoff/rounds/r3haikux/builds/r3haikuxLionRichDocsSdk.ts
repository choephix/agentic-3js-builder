import * as THREE from "three";
import { catmull, countershade, createBuilder, mottle, paint, rng, svg } from "../../../../src/index";

export const meta = {
  name: "Lion",
  description:
    "A proud old lion resting in a sphinx pose with his head held high: tawny coat, cream belly and muzzle, golden-to-chocolate mane, amber eyes, a scarred brow and a dark tail tuft.",
};

type RGB = [number, number, number];
type V = { x: number; y: number; z: number };
type P3 = [number, number, number];

const hexRGB = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
const toHex = (c: RGB): string =>
  "#" + c.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0")).join("");
const mixc = (a: RGB, c: RGB, t: number): RGB => [
  a[0] + (c[0] - a[0]) * t,
  a[1] + (c[1] - a[1]) * t,
  a[2] + (c[2] - a[2]) * t,
];
const smooth = (a: number, b: number, x: number): number => {
  const u = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return u * u * (3 - 2 * u);
};

// ── Palette ────────────────────────────────────────────────
const TAWNY_H = "#c8893f";
const TAWNY_DEEP_H = "#9c5f2a";
const CREAM_H = "#f1e0b8";
const GOLD_H = "#f0cf7e";
const CHOCO_H = "#43251a";
const NOSE_H = "#150e0a";
const SCAR_H = "#9b5b53";
const TUFT_H = "#3b2317";
const EAR_H = "#6e4220";

const TAWNY = hexRGB(TAWNY_H);
const CREAM = hexRGB(CREAM_H);
const GOLD = hexRGB(GOLD_H);
const CHOCO = hexRGB(CHOCO_H);

// ── Paints ─────────────────────────────────────────────────
// Tawny coat, pale belly underneath.
const COAT = countershade(mottle(TAWNY_H, TAWNY_DEEP_H, { size: 0.45, contrast: 0.3, seed: 7 }), CREAM_H, {
  level: 0,
});
// Tawny skull fading to a cream muzzle and jaw.
const HEAD = paint((p) => mixc(TAWNY, CREAM, smooth(1.12, 1.18, p.z) * (1 - smooth(1.28, 1.34, p.y))));

// Mane: golden blond at the face, dark chocolate at the edges.
const FACE: V = { x: 0, y: 1.36, z: 1.06 };
const faceDist = (p: V) => Math.hypot(p.x - FACE.x, p.y - FACE.y, p.z - FACE.z);
const toneAt = (p: V) => smooth(0.22, 0.6, faceDist(p));
const MANE = paint((p) => mixc(GOLD, CHOCO, toneAt(p)));

// Cards take one tint per tone band, so the mane has a handful of materials.
const TONES = 6;
const toneIndex = (p: V) => Math.min(TONES - 1, Math.floor(toneAt(p) * TONES));
const toneHex = (k: number) => toHex(mixc(GOLD, CHOCO, (k + 0.5) / TONES));
function byTone<T extends { at: V }>(hits: T[]): T[][] {
  const groups: T[][] = Array.from({ length: TONES }, () => []);
  for (const h of hits) groups[toneIndex(h.at)].push(h);
  return groups;
}

// ── Drawings ───────────────────────────────────────────────
// One guard-hair strand: pointed at both ends, greys give it some shading.
const STRAND_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 100"><path d="M20 100C4 74 2 34 20 0C38 34 36 74 20 100Z" fill="#ffffff"/><path d="M18 90C12 70 12 42 18 16" fill="none" stroke="#b9b9b9" stroke-width="3" stroke-linecap="round"/><path d="M26 88C28 68 28 48 23 30" fill="none" stroke="#d6d6d6" stroke-width="2.6" stroke-linecap="round"/></svg>`;

// Amber eye with a dark rim, round pupil and a small highlight.
const EYE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 56"><path d="M0 28Q40-4 80 28Q40 60 0 28Z" fill="#1d1109"/><path d="M6 28Q40 6 74 28Q40 50 6 28Z" fill="#d98a14"/><circle cx="40" cy="28" r="10" fill="#eaa62c"/><circle cx="40" cy="28" r="5.5" fill="#0c0603"/><circle cx="36" cy="23" r="2.6" fill="#fff7e0"/></svg>`;

const pawGeo = () => new THREE.SphereGeometry(0.08, 12, 9).scale(1.1, 0.5, 1.4);

export default function build() {
  const b = createBuilder({ name: "lion" });
  const strand = svg(STRAND_SVG, { size: 128 });
  const eyeTex = svg(EYE_SVG, { size: 128 });

  // ── Skeleton ─────────────────────────────────────────────
  const hips = b.joint("hips", { at: [0, 0.67, -0.58], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.66, -0.45],
      [0, 0.76, -0.15],
      [0, 0.84, 0.12],
      [0, 0.9, 0.38],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.9, 0.38],
      [0, 1.04, 0.56],
      [0, 1.16, 0.73],
      [0, 1.24, 0.84],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[2], at: [0, 1.3, 0.9], dir: [0, 0.3, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.22, 0.98], role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.72, -0.66],
      [0, 0.7, -0.9],
      [0, 0.58, -1.06],
      [0, 0.38, -1.14],
      [0, 0.2, -1.12],
      [0, 0.1, -1.04],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"], role: "tail" },
  );

  // ── Body ─────────────────────────────────────────────────
  b.loft(
    [
      { at: [0, 0.72, -0.62], w: 0.4, h: 0.46 },
      { at: [0, 0.71, -0.35], w: 0.5, h: 0.5 },
      { at: [0, 0.73, -0.05], w: 0.52, h: 0.5 },
      { at: [0, 0.78, 0.22], w: 0.5, h: 0.48 },
      { at: [0, 0.84, 0.42], w: 0.42, h: 0.42 },
    ],
    { bone: [hips, spine], color: COAT },
  );
  b.sweep(neck, (t) => 0.15 - 0.03 * t, { color: COAT });

  // ── Head: skull, cream muzzle and a separate lower jaw ───
  const skull = b.loft(
    [
      { at: [0, 1.34, 0.93], w: 0.26, h: 0.24 },
      { at: [0, 1.35, 1.02], w: 0.25, h: 0.23 },
      { at: [0, 1.33, 1.12], w: 0.22, h: 0.19 },
      { at: [0, 1.3, 1.2], w: 0.17, h: 0.14 },
      { at: [0, 1.29, 1.26], w: 0.13, h: 0.11 },
    ],
    { bone: head, color: HEAD },
  );
  b.loft(
    [
      { at: [0, 1.2, 0.99], w: 0.19, h: 0.1 },
      { at: [0, 1.19, 1.1], w: 0.16, h: 0.09 },
      { at: [0, 1.19, 1.2], w: 0.12, h: 0.08 },
      { at: [0, 1.2, 1.25], w: 0.08, h: 0.06 },
    ],
    { bone: jaw, color: CREAM_H },
  );
  const headSurf = b.surface(skull);

  // Amber eyes, decals on the brow.
  for (const s of [1, -1]) {
    b.decal(skull, eyeTex, {
      at: headSurf.nearest([s * 0.07, 1.36, 1.14]),
      dir: [0, 0, 1],
      size: [0.08, 0.055],
    });
  }

  // Scar across the brow above the model's left eye.
  const scar = headSurf.drape(
    catmull([
      [0.05, 1.46, 1.1],
      [0.08, 1.44, 1.14],
      [0.1, 1.42, 1.17],
    ]),
    { lift: 0.003 },
  );
  b.sweep(scar, 0.0065, { color: SCAR_H });

  // Mouth line along the jaw seam.
  const mouth = headSurf.drape(
    catmull([
      [0, 1.27, 1.3],
      [0, 1.25, 1.27],
      [0, 1.235, 1.2],
    ]),
    { lift: 0.002 },
  );
  b.sweep(mouth, 0.0045, { color: NOSE_H });

  // Broad black nose.
  b.stick(new THREE.SphereGeometry(0.06, 14, 10).scale(1.5, 0.8, 0.9), NOSE_H, headSurf.nearest([0, 1.3, 1.3]), {
    embed: 0.2,
  });

  // Whisker spots on the muzzle.
  for (const s of [1, -1]) {
    for (const p of [
      [0.075, 1.25, 1.2],
      [0.086, 1.27, 1.16],
    ]) {
      b.stick(new THREE.SphereGeometry(0.02, 6, 5), NOSE_H, headSurf.nearest([s * p[0], p[1], p[2]]), {
        embed: 0.4,
      });
    }
  }

  // ── Mane: a partial shell round the head, open at the face ──
  const W = 0.66; // half-angle of the face opening, radians
  const maneGeo = new THREE.SphereGeometry(0.34, 18, 12, Math.PI / 2 + W, Math.PI * 2 - 2 * W, 0, Math.PI * 0.92);
  const mane = b.part(maneGeo, MANE, { bone: head, at: [0, 1.22, 0.84] });
  const maneSurf = b.surface(mane);

  // Ears poke through the top of the mane.
  const EARS: P3[] = [
    [0.12, 1.5, 0.98],
    [-0.12, 1.5, 0.98],
  ];
  for (const e of EARS) {
    b.stick(new THREE.SphereGeometry(0.05, 10, 8).scale(1.1, 0.95, 0.5), EAR_H, maneSurf.nearest(e), {
      embed: 0.25,
    });
  }
  const nearEar = (p: V) => EARS.some((e) => Math.hypot(p.x - e[0], p.y - e[1], p.z - e[2]) < 0.1);

  // Inner layer: short gold-to-chocolate guard hairs.
  const inner = byTone(
    maneSurf.scatter(260, { rng: rng(31), minDist: 0.038, filter: (h) => !nearEar(h.at) }),
  );
  inner.forEach((group, k) => {
    if (group.length)
      b.cards(group, strand, {
        size: [0.06, 0.15],
        lean: 30,
        bend: 20,
        vary: 0.2,
        rng: rng(100 + k),
        color: toneHex(k),
      });
  });

  // Outer layer: longer strands that sweep back and down.
  const outer = byTone(
    maneSurf.scatter(200, { rng: rng(32), minDist: 0.05, filter: (h) => !nearEar(h.at) }),
  );
  outer.forEach((group, k) => {
    if (group.length)
      b.cards(group, strand, {
        size: [0.09, 0.23],
        lean: 55,
        bend: 30,
        vary: 0.25,
        rng: rng(200 + k),
        color: toneHex(k),
      });
  });

  // Cheek ruff fills the gap beside the face.
  const cheek = byTone(
    headSurf.scatter(44, {
      rng: rng(9),
      minDist: 0.03,
      filter: (h) => h.at.z > 1.0 && Math.abs(h.n.x) > 0.5 && h.at.y > 1.26 && h.at.y < 1.44,
    }),
  );
  cheek.forEach((group, k) => {
    if (group.length)
      b.cards(group, strand, {
        size: [0.06, 0.13],
        lean: 45,
        bend: 20,
        vary: 0.2,
        rng: rng(300 + k),
        color: toneHex(k),
      });
  });

  // ── Legs and paws ────────────────────────────────────────
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const X = (x: number) => s * x;

    // Forelegs straight down, paws flat and forward.
    const fore = b.chain(
      `fore${L}`,
      catmull([
        [X(0.19), 0.86, 0.36],
        [X(0.2), 0.46, 0.3],
        [X(0.2), 0.14, 0.4],
        [X(0.2), 0.04, 0.6],
      ]),
      { parent: spine.joints[2], names: [`shoulder${L}`, `elbow${L}`, `wrist${L}`, `paw${L}`], role: "leg" },
    );
    b.sweep(fore, (t) => 0.095 - 0.04 * t, { color: COAT });
    b.part(pawGeo(), COAT, { bone: fore.tip!, at: [X(0.2), 0.04, 0.56] });

    // Hind legs folded: big haunch, knee forward, hock back, paw flat.
    const hind = b.chain(
      `hind${L}`,
      catmull([
        [X(0.24), 0.62, -0.45],
        [X(0.3), 0.24, -0.12],
        [X(0.25), 0.1, -0.52],
        [X(0.2), 0.05, -0.22],
      ]),
      { parent: hips, names: [`hip${L}`, `knee${L}`, `hock${L}`, `hindPaw${L}`], role: "leg" },
    );
    b.sweep(hind, (t) => (t < 0.4 ? 0.125 - 0.07 * (t / 0.4) : 0.055 - 0.01 * ((t - 0.4) / 0.6)), {
      color: COAT,
    });
    b.part(pawGeo(), COAT, { bone: hind.tip!, at: [X(0.2), 0.04, -0.27] });
    b.part(new THREE.SphereGeometry(0.16, 14, 10).scale(0.85, 1, 1.15), COAT, {
      bone: hips,
      at: [X(0.2), 0.66, -0.4],
    });
  }

  // ── Tail with a dark tuft ────────────────────────────────
  b.sweep(tail, (t) => 0.045 - 0.022 * t, { color: COAT });
  const tailTip = tail.tip!;
  b.part(new THREE.SphereGeometry(0.042, 10, 8).scale(1, 1.15, 1), TUFT_H, {
    bone: tailTip,
    at: [0, 0.1, -1.04],
  });
  const tuft = b.ring(tailTip, { count: 14, radius: 0.03, tilt: 20 });
  b.cards(tuft.items, strand, {
    size: [0.05, 0.13],
    lean: 35,
    bend: 20,
    vary: 0.25,
    rng: rng(51),
    color: TUFT_H,
  });

  return b.root;
}
