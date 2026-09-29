// Flower hedgehog: a 30 cm hedgehog whose back is a walking flowerbed, in a flat-colour, faceted low-poly style.
// Every colour is a solid fill: no paints, no gradients, no noise. The banded spines, leaf sprays, oak and ivy leaves,
// ferns, clover, daisies, poppies, lavender, berries and wheat are SVG drawings made of flat polygons (each leaf is a
// handful of light and dark facets), scattered as cards over a dark skin. On top of the cards stand faceted 3D sprigs
// (octahedron-petalled flowers, leafy shoots, berry clusters, clover trefoils) and chunky extruded leaves, and a
// ladybird sits on one of them. The rig has a five-bone spine that can curl, four three-bone legs with toed paws,
// a tail stub, a head with a separate hinged lower jaw, two hinged ears and a pair of bright eyes.
import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import type { Frame } from "../src/frame";
import { aim, DEG, rng } from "../src/math";
import type { OutlinePoint } from "../src/outline";
import { catmull } from "../src/path";
import type { Hit } from "../src/surface";
import { svg } from "../src/texture";

export const meta = {
  name: "Flower Hedgehog",
  description:
    "A 30 cm flat-colour low-poly hedgehog whose spines are mixed with leaves, daisies, poppies, berries and clover: banded quill cards, SVG-drawn foliage, faceted 3D flower sprigs and extruded leaves on a rig with a curling spine, four legs, jaw and ears.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette (every colour a flat fill)

const SKIN = "#3a281d";
const BELLY = "#e6cb9c";
const FACE = "#d8b07a";
const FACE_LIGHT = "#f0dcb2";
const CROWN = "#8b6746";
const MASK = "#4a3125";
const NOSE = "#241a17";
const NOSE_SHINE = "#8a7a72";
const IRIS = "#d4741c";
const PUPIL = "#120c0a";
const GLINT = "#ffffff";
const EAR_OUT = "#b98c5c";
const EAR_IN = "#f0b4a2";
const PAW = "#e2b593";
const CLAW = "#4a3a30";
const TONGUE = "#e2707c";
const WHISKER = "#f3ead6";
const STEM = "#4a7f36";
const STEM_DARK = "#356a2e";
const LEAF_RIB = "#c8e6a0";

type Pal = { l: [string, string]; d: [string, string]; vein: string; stem: string };
const FRESH: Pal = { l: ["#86c257", "#6fae48"], d: ["#4d9440", "#3d7d38"], vein: "#b4dc86", stem: "#4a7f36" };
const DEEP: Pal = { l: ["#4f9a5a", "#3f8650"], d: ["#2f6e46", "#25583a"], vein: "#7cc088", stem: "#2f5e3a" };
const LIME: Pal = { l: ["#c2d95a", "#a8c94a"], d: ["#78a83c", "#5f9034"], vein: "#e4f08c", stem: "#6a8f34" };
const BLUEISH: Pal = { l: ["#7fb8a0", "#68a58f"], d: ["#4a8577", "#3a6e66"], vein: "#b6e0cc", stem: "#3e7566" };
const AUTUMN: Pal = { l: ["#f0a244", "#e08a34"], d: ["#c56a28", "#a8541f"], vein: "#ffd078", stem: "#7a4a26" };
const RUSSET: Pal = { l: ["#d8683a", "#c4552f"], d: ["#a1402a", "#843222"], vein: "#f4a06a", stem: "#6e3a24" };
const OLIVE: Pal = { l: ["#a7b04a", "#8f9a3c"], d: ["#6e7a30", "#586428"], vein: "#d2d888", stem: "#5a6a2c" };

// ---------------------------------------------------------------------------------------------------------------
// SVG drawing helpers: polygons only

type P = [number, number];
type Profile = ReadonlyArray<readonly [number, number]>;
const num = (v: number) => v.toFixed(2);
const poly = (a: readonly P[], fill: string) =>
  `<polygon points="${a.map(([x, y]) => `${num(x)},${num(y)}`).join(" ")}" fill="${fill}"/>`;
const doc = (w: number, h: number, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${body}</svg>`;

/** A thin tapered strip from a to b, w0 wide at a and w1 at b. */
function sliver(a: P, b: P, w0: number, w1: number, fill: string) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = Math.hypot(dx, dy) || 1;
  const nx = -dy / l;
  const ny = dx / l;
  return poly(
    [
      [a[0] + (nx * w0) / 2, a[1] + (ny * w0) / 2],
      [b[0] + (nx * w1) / 2, b[1] + (ny * w1) / 2],
      [b[0] - (nx * w1) / 2, b[1] - (ny * w1) / 2],
      [a[0] - (nx * w0) / 2, a[1] - (ny * w0) / 2],
    ],
    fill,
  );
}

/** Local (u along, v across) to drawing coordinates: origin (x, y), direction `deg` clockwise from straight up. */
function frameAt(x: number, y: number, deg: number) {
  const a = deg * DEG;
  const dx = Math.sin(a);
  const dy = -Math.cos(a);
  return (u: number, v: number): P => [x + u * dx - v * dy, y + u * dy + v * dx];
}

const BLADE_PROFILE: Profile = [
  [0, 0],
  [0.16, 0.5],
  [0.4, 1],
  [0.72, 0.62],
  [1, 0],
];
const OAK_PROFILE: Profile = [
  [0, 0],
  [0.08, 0.34],
  [0.2, 0.3],
  [0.28, 0.72],
  [0.4, 0.52],
  [0.5, 1],
  [0.62, 0.6],
  [0.72, 0.78],
  [0.84, 0.36],
  [1, 0],
];
const IVY_PROFILE: Profile = [
  [0, 0],
  [0.05, 0.5],
  [0.2, 0.78],
  [0.3, 0.34],
  [0.5, 1],
  [0.62, 0.44],
  [0.84, 0.5],
  [1, 0],
];
const HEART_PROFILE: Profile = [
  [0, 0],
  [0.28, 0.72],
  [0.6, 1],
  [0.88, 0.72],
  [1, 0.2],
  [0.9, 0],
];
const PETAL_PROFILE: Profile = [
  [0, 0],
  [0.35, 0.85],
  [0.7, 1],
  [1, 0.5],
];
const KITE_PROFILE: Profile = [
  [0, 0],
  [0.45, 1],
  [1, 0],
];

/**
 * A leaf drawn as flat facets: a dark under-shape, then one quad per profile step on each side of the midrib, light
 * on one side and dark on the other, then a midrib and a vein at each notch.
 */
function leafSvg(
  at: (u: number, v: number) => P,
  L: number,
  W: number,
  profile: Profile,
  cols: [string, string, string, string],
  vein: string | null,
) {
  const outline: P[] = [];
  for (const sgn of [1, -1])
    for (const [u, v] of sgn > 0 ? profile : [...profile].reverse()) outline.push(at(u * L, (sgn * v * W) / 2));
  let s = poly(outline, cols[2]);
  for (const sgn of [1, -1])
    for (let i = 0; i < profile.length - 1; i++) {
      const [u0, v0] = profile[i];
      const [u1, v1] = profile[i + 1];
      s += poly(
        [at(u0 * L, 0), at(u0 * L, (sgn * v0 * W) / 2), at(u1 * L, (sgn * v1 * W) / 2), at(u1 * L, 0)],
        cols[(sgn > 0 ? 0 : 2) + (i % 2)],
      );
    }
  if (vein) {
    s += sliver(at(0, 0), at(0.94 * L, 0), Math.max(0.8, W * 0.07), 0.3, vein);
    for (const sgn of [1, -1])
      for (let i = 1; i < profile.length - 1; i++) {
        const [u, v] = profile[i];
        s += sliver(at(Math.max(0, u - 0.14) * L, 0), at(u * L, sgn * v * W * 0.42), 0.55, 0.2, vein);
      }
  }
  return s;
}

const palCols = (p: Pal): [string, string, string, string] => [p.l[0], p.l[1], p.d[0], p.d[1]];

/** A polygon ring around (cx, cy). */
function disc(cx: number, cy: number, r: number, sides: number, fill: string, rot = 0) {
  return poly(
    Array.from({ length: sides }, (_, i): P => {
      const a = rot * DEG + (i / sides) * Math.PI * 2;
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    }),
    fill,
  );
}

/** A curved blade of grass: light on one half, dark on the other. */
function blade(p0: P, p1: P, p2: P, w: number, light: string, dark: string) {
  const steps = 6;
  const c: P[] = [];
  const nrm: P[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0];
    const y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1];
    const dx = 2 * (1 - t) * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]);
    const dy = 2 * (1 - t) * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]);
    const l = Math.hypot(dx, dy) || 1;
    c.push([x, y]);
    nrm.push([-dy / l, dx / l]);
  }
  const width = (i: number) => w * (1 - i / steps) ** 0.8;
  const left = c.map(([x, y], i): P => [x + nrm[i][0] * width(i), y + nrm[i][1] * width(i)]);
  const right = c.map(([x, y], i): P => [x - nrm[i][0] * width(i), y - nrm[i][1] * width(i)]);
  return poly([...left, ...[...c].reverse()], light) + poly([...c, ...[...right].reverse()], dark);
}

// ---------------------------------------------------------------------------------------------------------------
// Textures

/** A fan of banded spines: cream base, dark band, cream band, dark point. */
function quillTuft(seed: number, dark: string, light: string, tip: string, count: number, spread: number) {
  const r = rng(seed);
  const order = Array.from({ length: count }, (_, i) => i).sort(
    (a, b) => Math.abs(b - (count - 1) / 2) - Math.abs(a - (count - 1) / 2),
  );
  let s = "";
  for (const i of order) {
    const ang = -spread + (2 * spread * i) / (count - 1) + (r() - 0.5) * 8;
    const len = 46 + r() * 14 - Math.abs(ang) * 0.3;
    const at = frameAt(28 + (r() - 0.5) * 3, 66, ang);
    const hw = (t: number) => 2.4 * (1 - 0.85 * t) + 0.15;
    const bands: [number, number, string][] = [
      [0, 0.3, light],
      [0.3, 0.5, dark],
      [0.5, 0.78, light],
      [0.78, 1, tip],
    ];
    for (const [t0, t1, c] of bands) {
      const tipBand = t1 === 1;
      s += tipBand
        ? poly([at(t0 * len, -hw(t0)), at(len, 0), at(t0 * len, hw(t0))], c)
        : poly([at(t0 * len, -hw(t0)), at(t1 * len, -hw(t1)), at(t1 * len, hw(t1)), at(t0 * len, hw(t0))], c);
      // the far half of each spine band in a darker facet
      s += tipBand
        ? poly([at(t0 * len, 0), at(len, 0), at(t0 * len, hw(t0))], darken(c, 0.78))
        : poly([at(t0 * len, 0), at(t1 * len, 0), at(t1 * len, hw(t1)), at(t0 * len, hw(t0))], darken(c, 0.78));
    }
  }
  return svg(doc(56, 64, s), { size: 256 });
}

type Attach = [x: number, y: number, deg: number, len: number, wid: number];

/** Leaves alternating up a stem, one terminal leaf. */
function leafSprig(seed: number, pal: Pal, profile: Profile, lens = 1) {
  const r = rng(seed);
  const stem: P[] = [
    [20, 66],
    [19, 48],
    [21, 30],
    [20, 8],
  ];
  let s = "";
  for (let i = 0; i < 3; i++) s += sliver(stem[i], stem[i + 1], 2.4 - i * 0.5, 2 - i * 0.5, pal.stem);
  const at: Attach[] = [
    [19.2, 54, -58, 19 * lens, 12],
    [19.6, 46, 56, 20 * lens, 12.5],
    [20.6, 36, -52, 17 * lens, 11],
    [20.8, 28, 50, 16 * lens, 10.5],
    [20.2, 18, -34, 12 * lens, 8],
    [20, 10, 4, 15 * lens, 9.5],
  ];
  for (const [x, y, deg, L, W] of at) {
    const d = deg + (r() - 0.5) * 12;
    s += leafSvg(frameAt(x, y, d), L, W, profile, palCols(pal), pal.vein);
  }
  return svg(doc(40, 64, s), { size: 256 });
}

/** Two oak leaves and an acorn. */
function oakSprig(seed: number, pal: Pal) {
  const r = rng(seed);
  let s = sliver([20, 66], [20, 36], 2.4, 1.8, pal.stem);
  s += sliver([20, 36], [10, 20], 1.8, 1.2, pal.stem);
  s += sliver([20, 36], [29, 24], 1.8, 1.2, pal.stem);
  s += leafSvg(frameAt(20, 40, 4), 30, 19, OAK_PROFILE, palCols(pal), pal.vein);
  s += leafSvg(frameAt(10, 21, -36 + r() * 6), 19, 12, OAK_PROFILE, palCols(pal), pal.vein);
  s += leafSvg(frameAt(29, 25, 38 + r() * 6), 17, 11, OAK_PROFILE, palCols(pal), pal.vein);
  // an acorn: a shaded cap over a two-tone nut, hanging off the stem
  s += sliver([29, 49], [21, 40], 1.4, 1.2, "#5e3d22");
  s += poly(
    [
      [25, 54],
      [33, 54],
      [32, 61],
      [29, 66],
      [26, 61],
    ],
    "#c99a55",
  );
  s += poly(
    [
      [29, 54],
      [33, 54],
      [32, 61],
      [29, 66],
    ],
    "#a97a3c",
  );
  s += poly(
    [
      [23.5, 54],
      [34.5, 54],
      [34, 50],
      [29, 47.5],
      [24, 50],
    ],
    "#5e3d22",
  );
  s += poly(
    [
      [23.5, 54],
      [29, 54],
      [29, 47.5],
      [24, 50],
    ],
    "#7a5230",
  );
  return svg(doc(40, 68, s), { size: 256 });
}

/** A fern frond: a curved rachis with diminishing leaflet pairs. */
function fern(seed: number, pal: Pal) {
  const r = rng(seed);
  let s = "";
  const pts: P[] = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    pts.push([20 + Math.sin(t * 2.2) * 3.2 - 1.5, 66 - t * 60]);
  }
  for (let i = 0; i < 10; i++) s += sliver(pts[i], pts[i + 1], 1.7 - i * 0.12, 1.5 - i * 0.12, pal.stem);
  for (let i = 1; i <= 10; i++) {
    const t = i / 10;
    const [x, y] = pts[i];
    const L = 5 + 12 * (1 - t) ** 0.7 * (t < 0.15 ? 0.6 + t * 2.6 : 1);
    for (const sgn of [-1, 1]) {
      const deg = sgn * (66 - t * 14 + (r() - 0.5) * 6);
      s += leafSvg(frameAt(x, y, deg), L, L * 0.38, KITE_PROFILE, palCols(pal), null);
    }
  }
  s += leafSvg(frameAt(pts[10][0], pts[10][1], 0), 6, 2.4, KITE_PROFILE, palCols(pal), null);
  return svg(doc(40, 66, s), { size: 256 });
}

/** A clover sprig: three heart leaflets with pale chevrons, and a second, smaller trefoil. */
function cloverSprig(seed: number, pal: Pal, mark: string) {
  const r = rng(seed);
  let s = sliver([20, 66], [19, 40], 2, 1.6, pal.stem);
  s += sliver([19.5, 52], [8, 30], 1.4, 1.1, pal.stem);
  const trefoil = (cx: number, cy: number, rot: number, L: number) => {
    for (const k of [0, 1, 2]) {
      const deg = rot + k * 120 + (r() - 0.5) * 10;
      const at = frameAt(cx, cy, deg);
      s += leafSvg(at, L, L * 0.86, HEART_PROFILE, palCols(pal), null);
      const a = at(L * 0.66, L * 0.86 * 0.22);
      const c = at(L * 0.4, 0);
      const b = at(L * 0.66, -L * 0.86 * 0.22);
      s += sliver(a, c, 1.3, 1.6, mark) + sliver(c, b, 1.6, 1.3, mark);
    }
  };
  trefoil(19, 34, 10, 13);
  trefoil(8, 27, -20, 9);
  return svg(doc(40, 66, s), { size: 256 });
}

/** Petals round a centre, light/dark halves, with a two-tone eye. */
function flowerHead(
  cx: number,
  cy: number,
  n: number,
  L: number,
  W: number,
  rot: number,
  profile: Profile,
  cols: [string, string, string, string],
  eyeOuter: string,
  eyeInner: string,
  eyeR: number,
) {
  let s = "";
  for (let k = 0; k < n; k++) s += leafSvg(frameAt(cx, cy, rot + (k * 360) / n), L, W, profile, cols, null);
  s += disc(cx, cy, eyeR, 8, eyeOuter, 22);
  s += disc(cx, cy, eyeR * 0.6, 6, eyeInner, 10);
  return s;
}

function daisy(seed: number, petals: [string, string], eye: [string, string]) {
  const r = rng(seed);
  let s = sliver([20, 68], [20, 32], 2.2, 1.8, STEM);
  s += leafSvg(frameAt(20, 56, -62), 14, 7, BLADE_PROFILE, palCols(FRESH), FRESH.vein);
  s += leafSvg(frameAt(20, 48, 60), 12, 6, BLADE_PROFILE, palCols(DEEP), DEEP.vein);
  s += flowerHead(
    20,
    21,
    12,
    15,
    8,
    r() * 30,
    KITE_PROFILE,
    [petals[0], petals[1], petals[1], "#c9c0d8"],
    eye[0],
    eye[1],
    5,
  );
  return svg(doc(40, 68, s), { size: 256 });
}

function roundBloom(seed: number, n: number, cols: [string, string, string, string], eye: [string, string]) {
  const r = rng(seed);
  let s = sliver([20, 68], [20, 30], 2.2, 1.8, STEM);
  s += leafSvg(frameAt(20, 54, -58), 14, 8, BLADE_PROFILE, palCols(FRESH), FRESH.vein);
  s += leafSvg(frameAt(20, 46, 62), 13, 7, BLADE_PROFILE, palCols(DEEP), DEEP.vein);
  s += flowerHead(20, 20, n, 15, 15, r() * 40, PETAL_PROFILE, cols, eye[0], eye[1], 4);
  return svg(doc(40, 68, s), { size: 256 });
}

function poppy(seed: number) {
  const r = rng(seed);
  let s = sliver([20, 68], [20, 34], 2, 1.6, STEM_DARK);
  s += leafSvg(frameAt(20, 54, -55), 15, 6, OAK_PROFILE, palCols(DEEP), DEEP.vein);
  const rot = r() * 30;
  for (const k of [0, 1, 2, 3])
    s += leafSvg(
      frameAt(20, 22, rot + k * 90),
      17,
      17,
      PETAL_PROFILE,
      ["#f0503c", "#e03b2c", "#c22a22", "#a81e1e"],
      null,
    );
  for (const k of [0, 1, 2, 3])
    s += leafSvg(
      frameAt(20, 22, rot + 45 + k * 90),
      11,
      11,
      PETAL_PROFILE,
      ["#ff6a50", "#f0503c", "#d63a2f", "#c22a22"],
      null,
    );
  s += disc(20, 22, 4.6, 8, "#2a2436", 10);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    s += disc(20 + Math.cos(a) * 6.4, 22 + Math.sin(a) * 6.4, 1, 4, "#2a2436", 45);
  }
  return svg(doc(40, 68, s), { size: 256 });
}

function lavender(seed: number) {
  const r = rng(seed);
  let s = sliver([20, 68], [20, 12], 2, 1.2, STEM_DARK);
  s += leafSvg(frameAt(20, 62, -32), 20, 3.4, KITE_PROFILE, palCols(BLUEISH), null);
  s += leafSvg(frameAt(20, 62, 30), 18, 3.2, KITE_PROFILE, palCols(BLUEISH), null);
  for (let i = 0; i < 9; i++) {
    const y = 52 - i * 4.4;
    const sz = 7.2 - i * 0.45;
    for (const sgn of [-1, 1])
      s += leafSvg(
        frameAt(20, y + (r() - 0.5), sgn * (48 + r() * 12)),
        sz * 1.3,
        sz,
        KITE_PROFILE,
        ["#b39be8", "#9a80d4", "#7a5fb8", "#6a4fa4"],
        null,
      );
  }
  s += leafSvg(frameAt(20, 12, 0), 8, 5, KITE_PROFILE, ["#b39be8", "#9a80d4", "#7a5fb8", "#6a4fa4"], null);
  return svg(doc(40, 68, s), { size: 256 });
}

function berrySprig(seed: number, base: string, hi: string, shade: string, pal: Pal) {
  const r = rng(seed);
  let s = sliver([20, 68], [17, 44], 2, 1.6, pal.stem) + sliver([17, 44], [22, 22], 1.6, 1.2, pal.stem);
  const berries: [number, number, number][] = [
    [6, 34, 4.6],
    [30, 38, 4.8],
    [31, 20, 4.4],
    [12, 18, 4.2],
    [22, 11, 4.4],
  ];
  const joins: P[] = [
    [17, 44],
    [17, 44],
    [21, 26],
    [21, 26],
    [22, 22],
  ];
  berries.forEach(([x, y], i) => (s += sliver(joins[i], [x, y], 1.2, 0.9, pal.stem)));
  s += leafSvg(frameAt(19, 56, -60), 15, 9, BLADE_PROFILE, palCols(pal), pal.vein);
  s += leafSvg(frameAt(19, 52, 58), 14, 8.5, BLADE_PROFILE, palCols(pal), pal.vein);
  for (const [x, y, rad] of berries) {
    const rot = r() * 40;
    s += disc(x, y, rad, 8, shade, rot);
    s += poly(
      Array.from({ length: 5 }, (_, i): P => {
        const a = (rot + 200 + i * 45) * DEG;
        return [x + Math.cos(a) * rad * 0.92, y + Math.sin(a) * rad * 0.92];
      }),
      base,
    );
    s += poly(
      [
        [x - rad * 0.55, y - rad * 0.3],
        [x - rad * 0.15, y - rad * 0.65],
        [x + rad * 0.05, y - rad * 0.3],
        [x - rad * 0.3, y - rad * 0.05],
      ],
      hi,
    );
    s += disc(x + rad * 0.15, y - rad * 0.78, rad * 0.24, 4, "#2c2a1a", 45);
  }
  return svg(doc(40, 68, s), { size: 256 });
}

function wheat(seed: number) {
  const r = rng(seed);
  let s = "";
  const greens: [P, P, P][] = [
    [
      [16, 68],
      [8, 44],
      [4, 22],
    ],
    [
      [22, 68],
      [30, 46],
      [34, 26],
    ],
    [
      [20, 68],
      [14, 50],
      [15, 30],
    ],
  ];
  for (const [a, b, c] of greens) s += blade(a, b, c, 2.2, "#8ec252", "#5b9a3c");
  // the ear: a stem and paired grains with awns
  s += sliver([20, 68], [21, 30], 1.6, 1.2, "#a8a34a");
  for (let i = 0; i < 8; i++) {
    const y = 30 - i * 3.3;
    for (const sgn of [-1, 1]) {
      const at = frameAt(21, y, sgn * 26);
      s += leafSvg(at, 8.5, 4.4, KITE_PROFILE, ["#f0cf6a", "#e0b44e", "#c8963a", "#b2822f"], null);
      s += sliver(at(8, 0), at(14 + r() * 2, 0), 0.7, 0.2, "#d6b25a");
    }
  }
  s += leafSvg(frameAt(21, 4, 0), 8, 4, KITE_PROFILE, ["#f0cf6a", "#e0b44e", "#c8963a", "#b2822f"], null);
  return svg(doc(40, 68, s), { size: 256 });
}

/** A colour multiplied toward black: the shaded facet of a flat-coloured shape. */
function darken(hex: string, k: number) {
  const c = new THREE.Color(hex).multiplyScalar(k);
  return `#${c.getHexString()}`;
}

// ---------------------------------------------------------------------------------------------------------------
// 3D faceted sprigs, gathered per colour so a whole sprig is a few parts

const OCTA = new THREE.OctahedronGeometry(1, 0);
const ICO = new THREE.IcosahedronGeometry(1, 0);
const Y = new THREE.Vector3(0, 1, 0);
const X = new THREE.Vector3(1, 0, 0);
const Z = new THREE.Vector3(0, 0, 1);
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

class Bag {
  private readonly m = new Map<string, number[]>();
  private out(c: string) {
    let a = this.m.get(c);
    if (!a) this.m.set(c, (a = []));
    return a;
  }
  tri(c: string, a: THREE.Vector3, b: THREE.Vector3, d: THREE.Vector3) {
    this.out(c).push(a.x, a.y, a.z, b.x, b.y, b.z, d.x, d.y, d.z);
  }
  /** Both faces, so the winding never matters for thin sheets and tubes. */
  both(c: string, a: THREE.Vector3, b: THREE.Vector3, d: THREE.Vector3) {
    this.tri(c, a, b, d);
    this.tri(c, a, d, b);
  }
  quad(c: string, a: THREE.Vector3, b: THREE.Vector3, d: THREE.Vector3, e: THREE.Vector3) {
    this.both(c, a, b, d);
    this.both(c, a, d, e);
  }
  /** A faceted tube (or cone when rb is 0). */
  tube(c: string, a: THREE.Vector3, b: THREE.Vector3, ra: number, rb: number, sides = 3) {
    const dir = b.clone().sub(a).normalize();
    const u = new THREE.Vector3().crossVectors(dir, Math.abs(dir.y) < 0.9 ? Y : X).normalize();
    const w = new THREE.Vector3().crossVectors(dir, u);
    const ring = (p: THREE.Vector3, r: number, i: number) => {
      const t = (i / sides) * Math.PI * 2;
      return p
        .clone()
        .addScaledVector(u, Math.cos(t) * r)
        .addScaledVector(w, Math.sin(t) * r);
    };
    for (let i = 0; i < sides; i++) {
      if (rb === 0) this.both(c, ring(a, ra, i), ring(a, ra, i + 1), b);
      else this.quad(c, ring(a, ra, i), ring(a, ra, i + 1), ring(b, rb, i + 1), ring(b, rb, i));
    }
  }
  /** A scaled, turned copy of an unindexed polyhedron. */
  solid(c: string, base: THREE.BufferGeometry, at: THREE.Vector3, scale: THREE.Vector3 | number, q?: THREE.Quaternion) {
    const s = typeof scale === "number" ? v3(scale, scale, scale) : scale;
    const pos = base.getAttribute("position");
    const o = this.out(c);
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).multiply(s);
      if (q) v.applyQuaternion(q);
      v.add(at);
      o.push(v.x, v.y, v.z);
    }
  }
  parts(): [string, THREE.BufferGeometry][] {
    return [...this.m].map(([c, a]) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(a, 3));
      g.computeVertexNormals();
      return [c, g];
    });
  }
}

type Prof3 = ReadonlyArray<readonly [number, number, number]>;
const BLADE3: Prof3 = [
  [0, 0, 0],
  [0.16, 0.5, 0.5],
  [0.4, 1, 1],
  [0.72, 0.62, 0.55],
  [1, 0, 0],
];
const HEART3: Prof3 = [
  [0, 0, 0],
  [0.28, 0.7, 0.4],
  [0.6, 1, 0.9],
  [0.88, 0.7, 0.6],
  [1, 0.2, 0.2],
  [0.9, 0, 0],
];

/** A faceted leaf, folded up along its midrib: one colour a side. Returns its surface function. */
function leaf3(
  bag: Bag,
  cA: string,
  cB: string,
  base: THREE.Vector3,
  dir: THREE.Vector3,
  len: number,
  wid: number,
  profile: Prof3 = BLADE3,
  droop = 0.18,
) {
  const d = dir.clone().normalize();
  const side = new THREE.Vector3().crossVectors(Y, d);
  if (side.lengthSq() < 1e-4) side.set(1, 0, 0);
  side.normalize();
  const n = new THREE.Vector3().crossVectors(d, side).normalize();
  if (n.y < 0) n.negate();
  const pt = (u: number, v: number, h: number) =>
    base
      .clone()
      .addScaledVector(d, u * len)
      .addScaledVector(side, (v * wid) / 2)
      .addScaledVector(n, h * wid * 0.07 - droop * len * u * u);
  for (const sgn of [1, -1])
    for (let i = 0; i < profile.length - 1; i++) {
      const [u0, v0, h0] = profile[i];
      const [u1, v1, h1] = profile[i + 1];
      bag.quad(sgn > 0 ? cA : cB, pt(u0, 0, 0), pt(u0, sgn * v0, h0), pt(u1, sgn * v1, h1), pt(u1, 0, 0));
    }
  return { pt, n, side };
}

const stemPts = (r: () => number, H: number, lean: number): THREE.Vector3[] => {
  const psi = r() * Math.PI * 2;
  const tip = v3(Math.cos(psi) * lean, H, Math.sin(psi) * lean);
  const mid = v3(tip.x * 0.25 + (r() - 0.5) * H * 0.12, H * 0.5, tip.z * 0.25 + (r() - 0.5) * H * 0.12);
  return [v3(0, 0, 0), mid, tip];
};
const stemBag = (bag: Bag, pts: THREE.Vector3[], colour: string, r0 = 0.0016) => {
  bag.tube(colour, pts[0], pts[1], r0, r0 * 0.85);
  bag.tube(colour, pts[1], pts[2], r0 * 0.85, r0 * 0.6);
};
const onStem = (pts: THREE.Vector3[], t: number) =>
  t < 0.5 ? pts[0].clone().lerp(pts[1], t * 2) : pts[1].clone().lerp(pts[2], (t - 0.5) * 2);

/** A stalked flower: octahedron petals in two tones round a faceted eye, with a pair of leaves on the stem. */
function flower3(
  r: () => number,
  o: { n: number; R: number; cols: [string, string]; eye: string; H: number; pal: Pal; tilt?: number; wide?: number },
) {
  const bag = new Bag();
  const pts = stemPts(r, o.H, o.H * 0.28 * (0.3 + r()));
  stemBag(bag, pts, STEM);
  const tip = pts[2];
  const tilt = (o.tilt ?? 24) * DEG;
  for (let k = 0; k < o.n; k++) {
    const q = new THREE.Quaternion()
      .setFromAxisAngle(Y, ((k + r() * 0.15) / o.n) * Math.PI * 2)
      .multiply(new THREE.Quaternion().setFromAxisAngle(Z, tilt));
    const len = o.R * (0.9 + r() * 0.2);
    const off = v3(len * 0.55, 0, 0).applyQuaternion(q);
    bag.solid(o.cols[k % 2], OCTA, tip.clone().add(off), v3(len * 0.5, o.R * 0.07, o.R * (o.wide ?? 0.32)), q);
  }
  bag.solid(o.eye, ICO, tip.clone().add(v3(0, o.R * 0.08, 0)), v3(o.R * 0.3, o.R * 0.22, o.R * 0.3));
  const a = r() * 6;
  for (const [t, sgn] of [
    [0.3, 1],
    [0.55, -1],
  ] as const)
    leaf3(
      bag,
      o.pal.l[0],
      o.pal.d[0],
      onStem(pts, t),
      v3(Math.cos(a) * sgn, 0.4, Math.sin(a) * sgn),
      o.H * 0.42,
      o.H * 0.24,
    );
  return bag;
}

/** A leafy shoot: a leaning stem with alternate two-tone leaves and a terminal leaf. */
function shoot3(r: () => number, pal: Pal, H: number, count: number, profile: Prof3 = BLADE3) {
  const bag = new Bag();
  const pts = stemPts(r, H, H * 0.3 * (0.3 + r()));
  stemBag(bag, pts, STEM, 0.0018);
  const psi = r() * Math.PI * 2;
  for (let i = 0; i < count; i++) {
    const t = 0.18 + (0.7 * i) / Math.max(1, count - 1);
    const a = psi + (i % 2 ? 1 : -1) * (1.2 + r() * 0.5);
    const len = H * (0.62 - 0.22 * t) * (0.85 + r() * 0.3);
    leaf3(
      bag,
      pal.l[0],
      pal.d[0],
      onStem(pts, t),
      v3(Math.cos(a), 0.3 + r() * 0.35, Math.sin(a)),
      len,
      len * 0.52,
      profile,
    );
  }
  const top = pts[2].clone().sub(pts[1]);
  leaf3(bag, pal.l[0], pal.d[0], pts[2], top.setY(top.y * 0.6 + H * 0.25), H * 0.42, H * 0.24, profile, 0.1);
  return bag;
}

/** A berry cluster on a branching stalk. */
function berries3(r: () => number, base: string, hi: string, pal: Pal, H: number, n = 4) {
  const bag = new Bag();
  const pts = stemPts(r, H, H * 0.22);
  stemBag(bag, pts, STEM);
  const psi = r() * 6;
  for (let i = 0; i < n; i++) {
    const a = psi + (i / n) * Math.PI * 2;
    const from = onStem(pts, 0.55 + 0.45 * (i / n));
    const to = from.clone().add(v3(Math.cos(a) * H * 0.26, H * (0.14 - i * 0.02), Math.sin(a) * H * 0.26));
    bag.tube(STEM, from, to, 0.0009, 0.0007);
    bag.solid(
      base,
      ICO,
      to.clone().add(v3(0, -0.003, 0)),
      v3(0.0058, 0.0054, 0.0058),
      new THREE.Quaternion().setFromAxisAngle(Y, r() * 3),
    );
    bag.solid(hi, OCTA, to.clone().add(v3(0.0018, 0.0006, 0.002)), 0.0016);
  }
  leaf3(bag, pal.l[0], pal.d[0], onStem(pts, 0.32), v3(Math.cos(psi + 3), 0.3, Math.sin(psi + 3)), H * 0.4, H * 0.22);
  return bag;
}

/** A clover on a stalk: three heart leaflets, two-tone, with pale chevrons. */
function clover3(r: () => number, pal: Pal, mark: string, H: number) {
  const bag = new Bag();
  const pts = stemPts(r, H, H * 0.22);
  stemBag(bag, pts, STEM);
  const tip = pts[2];
  const rot = r() * 6;
  for (let k = 0; k < 3; k++) {
    const a = rot + (k * Math.PI * 2) / 3;
    const dir = v3(Math.cos(a), 0.22, Math.sin(a));
    const L = 0.021;
    const { pt, n } = leaf3(bag, pal.l[0], pal.d[0], tip, dir, L, L * 0.86, HEART3, 0.12);
    const lift = n.clone().multiplyScalar(0.0007);
    const c = pt(0.4, 0, 0).add(lift);
    for (const sgn of [1, -1]) {
      const e = pt(0.66, sgn * 0.42, 0.5).add(lift);
      const w = new THREE.Vector3().crossVectors(e.clone().sub(c), n).normalize().multiplyScalar(0.00075);
      bag.quad(mark, c.clone().add(w), e.clone().add(w), e.clone().sub(w), c.clone().sub(w));
    }
  }
  return bag;
}

/** A ladybird: red faceted shell, black head and spots. */
function ladybird() {
  const bag = new Bag();
  bag.solid("#dd3a30", ICO, v3(0, 0.0032, 0), v3(0.0055, 0.0036, 0.0068));
  bag.solid(NOSE, ICO, v3(0, 0.0026, 0.0062), v3(0.0034, 0.0026, 0.0026));
  for (const [x, z] of [
    [0.0028, 0.0008],
    [-0.0028, 0.0008],
    [0.0022, -0.0036],
    [-0.0022, -0.0036],
    [0.0, -0.0006],
  ])
    bag.solid(NOSE, OCTA, v3(x, 0.0056 - Math.abs(x) * 0.5, z), v3(0.0011, 0.0006, 0.0011));
  bag.solid(GLINT, OCTA, v3(0.0012, 0.0031, 0.0075), 0.0007);
  bag.solid(GLINT, OCTA, v3(-0.0012, 0.0031, 0.0075), 0.0007);
  return bag;
}

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "flowerHedgehog" });
  const R = rng(23);

  /** Random unit direction in the surface plane at a normal. */
  const tangent = (n: THREE.Vector3) => {
    const t0 = new THREE.Vector3().crossVectors(Math.abs(n.y) < 0.9 ? Y : X, n).normalize();
    return t0.applyAxisAngle(n, R() * Math.PI * 2);
  };
  /** Sets a gathered sprig on a frame, stem foot just under the surface, turned about its normal. */
  const plant = (on: Frame, bag: Bag, sink = 0.004) => {
    const n = on.axis;
    const quat = aim(n, tangent(n));
    for (const [c, g] of bag.parts()) b.part(g, c, { frame: on, at: on.at.addScaledVector(n, -sink), quat });
  };
  const ico = () => new THREE.IcosahedronGeometry(1, 0);

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton and body: rump to chest on a curling spine

  const stations = [
    { at: [0, 0.064, -0.1], w: 0.05, h: 0.05 },
    { at: [0, 0.074, -0.081], w: 0.11, h: 0.092 },
    { at: [0, 0.079, -0.046], w: 0.156, h: 0.122 },
    { at: [0, 0.081, -0.005], w: 0.172, h: 0.13 },
    { at: [0, 0.079, 0.04], w: 0.16, h: 0.122 },
    { at: [0, 0.073, 0.076], w: 0.126, h: 0.1 },
    { at: [0, 0.067, 0.098], w: 0.086, h: 0.076 },
  ] as const;
  const curve = catmull(stations.map((s) => s.at));
  const hipsT = curve.knots[1];
  const hips = b.joint("hips", { at: stations[1].at, group: "body" });
  const spine = b.chain("spine", curve.slice(hipsT, 1), {
    parent: hips,
    count: 5,
    role: "spine",
    group: "body",
  });
  const body = b.loft(stations, {
    bone: [hips, spine],
    color: SKIN,
    sectors: [[100, 260, BELLY]],
    sides: 10,
    smooth: false,
    group: "body",
  });

  // A stub tail under the spines
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.062, -0.102],
      [0, 0.055, -0.114],
      [0, 0.047, -0.124],
    ]),
    { parent: hips, count: 2, role: "tail", group: "tail" },
  );
  b.sweep(tail, [0.012, 0.003], {
    color: FACE,
    sides: 5,
    smooth: false,
    caps: { start: "round", end: "point" },
    group: "tail",
  });

  // -------------------------------------------------------------------------------------------------------------
  // Legs: three bones each, short and splayed a little; paws with pads, four toes and dark claws

  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    for (const front of [true, false]) {
      const z0 = front ? 0.05 : -0.058;
      const zTip = front ? 0.079 : -0.042;
      const zAnk = front ? 0.062 : -0.068;
      const chain = b.chain(
        front ? `legF${side}` : `legH${side}`,
        [
          [s * 0.058, 0.052, z0],
          [s * 0.076, 0.03, z0 + (front ? 0.006 : -0.006)],
          [s * 0.07, 0.012, zAnk],
          [s * 0.07, 0.0085, zTip],
        ],
        {
          parent: front ? spine.joints[3] : hips,
          names: (front ? ["shoulder", "elbow", "wrist"] : ["hip", "knee", "ankle"]).map((n) => n + side),
          role: "leg",
          contact: [s * 0.07, 0, (zAnk + zTip) / 2],
          group: front ? `legF${side}` : `legH${side}`,
        },
      );
      b.sweep(chain, [0.02, 0.0075], {
        color: FACE,
        sides: 6,
        smooth: false,
        caps: { start: "round", end: "round" },
        group: chain.name,
      });
      const foot = chain.joints[2];
      const paw = new Bag();
      const padLen = front ? 0.0125 : 0.019;
      const zc = front ? zTip - 0.003 : zTip - padLen + 0.004;
      paw.solid(PAW, OCTA, v3(s * 0.07, 0.0055, zc), v3(0.0118, 0.0055, padLen));
      const zt = zc + padLen * 0.9;
      const fan = [-1.5, -0.5, 0.5, 1.5];
      const claws = new Bag();
      for (const k of fan) {
        const x = s * 0.07 + k * 0.0068;
        paw.solid(PAW, OCTA, v3(x, 0.0034, zt), v3(0.0036, 0.0034, 0.0054));
        claws.tube(CLAW, v3(x, 0.0026, zt + 0.0036), v3(x + k * 0.0011, 0.0006, zt + 0.0098), 0.0016, 0, 4);
      }
      for (const bag of [paw, claws])
        for (const [c, g] of bag.parts()) b.part(g, c, { bone: foot, at: [0, 0, 0], group: chain.name });
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Head on a region: +Z out of the snout, +Y up, +X left

  const headDir: [number, number, number] = [0, -0.2, 1];
  const skull = b.joint("head", {
    parent: spine.joints[4],
    at: [0, 0.066, 0.078],
    dir: headDir,
    role: "head",
    group: "head",
  });
  const head = b.region({ at: skull, quat: aim(headDir, [0, 1, 0], "z") });
  const cranium = b.loft(
    [
      { at: head.p([0, 0.006, -0.03]), w: 0.1, h: 0.09 },
      { at: head.p([0, 0.008, 0.0]), w: 0.105, h: 0.092 },
      { at: head.p([0, 0.004, 0.03]), w: 0.085, h: 0.078 },
      { at: head.p([0, -0.004, 0.055]), w: 0.056, h: 0.056 },
      { at: head.p([0, -0.012, 0.072]), w: 0.034, h: 0.036 },
      { at: head.p([0, -0.017, 0.082]), w: 0.022, h: 0.024 },
    ],
    {
      bone: skull,
      color: FACE,
      sectors: [
        [100, 260, FACE_LIGHT],
        [-50, 50, CROWN, 0, 0.5],
      ],
      sides: 8,
      smooth: false,
      caps: { start: "round", end: "flat" },
      group: "head",
    },
  );
  // nose: a dark faceted ball with a shine
  b.part(ico(), NOSE, { bone: skull, at: head.p([0, -0.0175, 0.087]), scale: [0.0112, 0.0092, 0.0105], group: "head" });
  b.part(new THREE.OctahedronGeometry(1, 0), NOSE_SHINE, {
    bone: skull,
    at: head.p([0.002, -0.011, 0.093]),
    scale: 0.0022,
    group: "head",
  });

  // Lower jaw on its own joint, a shorter chin under the snout
  const jaw = head.joint("jaw", {
    parent: skull,
    at: [0, -0.028, -0.002],
    aim: [0, -0.036, 0.06],
    role: "jaw",
    group: "jaw",
  });
  b.loft(
    [
      { at: head.p([0, -0.033, 0.0]), w: 0.06, h: 0.022 },
      { at: head.p([0, -0.038, 0.03]), w: 0.045, h: 0.018 },
      { at: head.p([0, -0.04, 0.056]), w: 0.03, h: 0.014 },
      { at: head.p([0, -0.038, 0.068]), w: 0.018, h: 0.012 },
    ],
    { bone: jaw, color: FACE_LIGHT, sides: 6, smooth: false, caps: { start: "flat", end: "round" }, group: "jaw" },
  );
  b.part(ico(), TONGUE, { bone: jaw, at: head.p([0, -0.03, 0.036]), scale: [0.0075, 0.003, 0.02], group: "jaw" });
  for (const s of [1, -1])
    for (const z of [0.05, 0.062])
      b.part(new THREE.ConeGeometry(0.0016, 0.005, 3), FACE_LIGHT, {
        bone: jaw,
        at: head.p([s * 0.0075, -0.0325, z]),
        dir: head.d([0, 1, 0]),
        group: "jaw",
      });

  // Eyes: dark mask patch, amber iris, black pupil, bright glint
  const faceSkin = b.surface(cranium);
  for (const s of [1, -1]) {
    const socket = faceSkin.ray(head.p([s * 0.1, 0.014, 0.03]), head.d([-s, 0, 0]));
    if (!socket) throw new Error("flowerHedgehog: no face under the eye");
    b.stick(ico(), MASK, socket, {
      bone: skull,
      embed: 0.35,
      scale: [0.0155, 0.0045, 0.021],
      spin: s * 20,
      group: "head",
    });
    const eye = b.part(ico(), IRIS, {
      bone: skull,
      at: socket.at,
      dir: socket.n,
      scale: [0.0125, 0.0095, 0.0125],
      group: "head",
    });
    b.part(ico(), PUPIL, {
      bone: skull,
      at: eye.local([0, 0.0045, 0.0004]),
      dir: socket.n,
      scale: [0.0085, 0.0065, 0.0085],
      group: "head",
    });
    b.part(new THREE.OctahedronGeometry(1, 0), GLINT, {
      bone: skull,
      at: eye.local([s * 0.003, 0.0098, 0.0042]),
      scale: 0.0033,
      group: "head",
    });
    b.part(new THREE.OctahedronGeometry(1, 0), GLINT, {
      bone: skull,
      at: eye.local([-s * 0.003, 0.0086, -0.0035]),
      scale: 0.0016,
      group: "head",
    });
  }

  // Whiskers
  for (const s of [1, -1])
    for (const [dy, dz, fan] of [
      [0.006, 0, 0.55],
      [0.0, -0.002, 0.85],
      [-0.006, -0.004, 1.15],
    ]) {
      const root = head.p([s * 0.013, -0.012 + dy * 0.5, 0.068 + dz]);
      const tip = head.p([s * (0.013 + 0.032 * fan), -0.012 + dy * 2.4, 0.068 + dz + 0.03 * (1.5 - fan)]);
      b.rod(root, tip, [0.0009, 0.0003], { bone: skull, color: WHISKER, sides: 3, group: "head" });
    }

  // Ears: round, tan outside and pink inside, each on a hinge joint
  for (const s of [1, -1]) {
    const outward = head.d([s * 0.55, 0.12, 0.8]).normalize();
    const upRaw = head.d([s * 0.35, 1, -0.15]);
    const up = upRaw.clone().addScaledVector(outward, -upRaw.dot(outward)).normalize();
    const across = new THREE.Vector3().crossVectors(outward, up);
    const ear = head.joint(`ear${s > 0 ? "L" : "R"}`, {
      parent: skull,
      at: [s * 0.043, 0.032, -0.006],
      dir: up,
      role: "hinge",
      group: "head",
    });
    const ringPts = (cx: number, ru: number, rv: number): OutlinePoint[] =>
      Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return [cx + ru * Math.cos(a), rv * Math.sin(a)] as const;
      });
    b.extrude(ringPts(0.02, 0.021, 0.02), {
      at: ear.at,
      x: up,
      y: across,
      thickness: 0.005,
      bevel: 0.0012,
      detail: 0.34,
      color: EAR_OUT,
      bone: ear,
      group: "head",
    });
    b.extrude(ringPts(0.0215, 0.0145, 0.013), {
      at: ear.at.clone().addScaledVector(outward, 0.0033),
      x: up,
      y: across,
      thickness: 0.003,
      detail: 0.34,
      color: EAR_IN,
      bone: ear,
      group: "head",
    });
  }

  // -------------------------------------------------------------------------------------------------------------
  // Textures

  const quillBrown = quillTuft(11, "#4a3324", "#e8d7ae", "#3a281d", 6, 30);
  const quillGrey = quillTuft(12, "#4d4340", "#d4c8b0", "#332a28", 5, 26);
  const quillWarm = quillTuft(13, "#7a4a2a", "#f0dcb0", "#5a3620", 6, 32);
  const quillPale = quillTuft(14, "#5e4630", "#f4e8c6", "#4a3324", 5, 28);
  const quills = [quillBrown, quillBrown, quillGrey, quillWarm, quillPale];

  const flora = [
    leafSprig(31, FRESH, BLADE_PROFILE),
    leafSprig(32, DEEP, BLADE_PROFILE),
    leafSprig(33, LIME, IVY_PROFILE, 0.9),
    leafSprig(34, OLIVE, BLADE_PROFILE, 1.05),
    leafSprig(35, AUTUMN, OAK_PROFILE, 0.95),
    oakSprig(36, DEEP),
    oakSprig(37, RUSSET),
    fern(38, FRESH),
    fern(39, BLUEISH),
    cloverSprig(40, FRESH, "#d8eeb0"),
    cloverSprig(41, DEEP, "#c6e6c0"),
    daisy(42, ["#ffffff", "#f1ecf8"], ["#f2c230", "#d99a1c"]),
    daisy(43, ["#ffd6e4", "#f4a8c6"], ["#f2c230", "#d99a1c"]),
    roundBloom(44, 5, ["#ffd94a", "#f4c22a", "#e0a81e", "#c8901a"], ["#a8c93a", "#6a8f34"]),
    roundBloom(45, 5, ["#f7a0c0", "#ea7aa4", "#d45a8c", "#b84278"], ["#ffe27a", "#f2c230"]),
    roundBloom(46, 6, ["#b9a2f0", "#9c82dc", "#7e62c0", "#664ca8"], ["#ffe27a", "#f2c230"]),
    roundBloom(47, 5, ["#ffb066", "#f58f3c", "#dc7428", "#bc5c1e"], ["#5a3620", "#3a281d"]),
    poppy(48),
    lavender(49),
    lavender(50),
    berrySprig(51, "#d63a2f", "#ff8672", "#a8241f", FRESH),
    berrySprig(52, "#6e3aa0", "#a98ad4", "#4a2478", DEEP),
    berrySprig(53, "#f08a3c", "#ffc086", "#c46a24", LIME),
    wheat(54),
    wheat(55),
  ];

  // -------------------------------------------------------------------------------------------------------------
  // The coat: banded spines everywhere, then leaves, flowers and berries growing out of them

  const skin = b.surface(body);
  const spineHits = skin.scatter(460, {
    rng: rng(3),
    minDist: 0.0115,
    filter: (h) => h.n.y > -0.12 && h.at.y > 0.07 && h.at.z < 0.09 && h.at.z > -0.09,
  });
  b.cards(spineHits, quills, {
    size: [0.05, 0.058],
    lean: 62,
    bend: 26,
    cross: true,
    vary: 0.25,
    spin: 16,
    rng: rng(4),
    flow: () => [(R() - 0.5) * 0.6, -0.3, -1],
    group: "spines",
  });
  // a skirt of short quills down the flanks, swept straight back so nothing dips toward the floor
  const skirtHits = skin.scatter(160, {
    rng: rng(12),
    minDist: 0.0125,
    filter: (h) => h.at.y > 0.03 && h.at.y <= 0.07 && h.n.y > -0.6 && h.at.z < 0.09 && h.at.z > -0.095,
  });
  b.cards(skirtHits, quills, {
    size: [0.042, 0.05],
    lean: 74,
    bend: 14,
    cross: true,
    vary: 0.2,
    spin: 12,
    rng: rng(13),
    flow: () => [0, 0, -1],
    group: "spines",
  });
  // a longer, more upright second layer along the spine
  const crest = skin.scatter(140, {
    rng: rng(5),
    minDist: 0.02,
    filter: (h) => h.n.y > 0.2 && h.at.z < 0.07 && h.at.z > -0.075,
  });
  b.cards(crest, [quillBrown, quillWarm, quillPale], {
    size: [0.058, 0.07],
    lean: 42,
    bend: 22,
    cross: true,
    vary: 0.2,
    spin: 20,
    rng: rng(6),
    flow: () => [(R() - 0.5) * 0.8, -0.2, -1],
    group: "spines",
  });
  // head crown: quills part sideways and back over the brow
  const headUp = head.d([0, 1, 0]).normalize();
  const headFwd = head.d([0, 0, 1]).normalize();
  const crownHits = b.surface(cranium).scatter(60, {
    rng: rng(7),
    minDist: 0.0105,
    filter: (h) => h.n.dot(headUp) > 0.25 && h.at.sub(skull.at).dot(headFwd) < 0.014,
  });
  b.cards(crownHits, [quillBrown, quillGrey, quillPale], {
    size: [0.036, 0.04],
    lean: 66,
    bend: 20,
    cross: true,
    vary: 0.2,
    spin: 14,
    rng: rng(8),
    flow: (f) => [Math.sign(f.at.x) * 0.7, -0.15, -0.5],
    group: "spines",
  });

  const floraHits = skin.scatter(200, {
    rng: rng(9),
    minDist: 0.0175,
    filter: (h) => h.n.y > 0.45 && h.at.z < 0.075 && h.at.z > -0.08,
  });
  b.cards(floraHits, flora, {
    size: [0.038, 0.06],
    lean: 30,
    bend: 20,
    cross: true,
    vary: 0.3,
    spin: 40,
    rng: rng(10),
    flow: () => [R() * 2 - 1, 0.1, R() * 2 - 1],
    group: "flora",
  });
  // leaves and blooms growing out of the flanks too, so the flowerbed wraps round
  const flankHits = skin.scatter(90, {
    rng: rng(15),
    minDist: 0.02,
    filter: (h) => h.n.y <= 0.45 && h.n.y > -0.05 && h.at.y > 0.06 && h.at.z < 0.07 && h.at.z > -0.085,
  });
  b.cards(flankHits, flora, {
    size: [0.03, 0.046],
    lean: 46,
    bend: 16,
    cross: true,
    vary: 0.3,
    spin: 30,
    rng: rng(16),
    flow: () => [(R() - 0.5) * 0.8, -0.3, -1],
    group: "flora",
  });
  // the rump: quills and a few sprigs fanned out of the tail end
  const rumpHits = skin.scatter(90, {
    rng: rng(17),
    minDist: 0.0115,
    filter: (h) => h.at.z <= -0.09 && h.at.y > 0.058,
  });
  b.cards(rumpHits, quills, {
    size: [0.044, 0.05],
    lean: 40,
    bend: 20,
    cross: true,
    vary: 0.2,
    spin: 14,
    rng: rng(18),
    flow: (f) => [f.at.x * 12, (f.at.y - 0.068) * 5, 0],
    group: "spines",
  });
  const rumpFlora = skin.scatter(14, {
    rng: rng(22),
    minDist: 0.022,
    filter: (h) => h.at.z <= -0.085 && h.at.y > 0.065,
  });
  b.cards(rumpFlora, flora, {
    size: [0.03, 0.044],
    lean: 40,
    bend: 16,
    cross: true,
    vary: 0.25,
    spin: 30,
    rng: rng(23),
    flow: (f) => [f.at.x * 12, (f.at.y - 0.068) * 5, 0],
    group: "flora",
  });
  // flowers and leaves on the head crown too, tucked between the ears
  const browHits = b.surface(cranium).scatter(10, {
    rng: rng(19),
    minDist: 0.022,
    filter: (h) => h.n.dot(headUp) > 0.5 && h.at.sub(skull.at).dot(headFwd) < 0.004,
  });
  b.cards(browHits, [flora[11], flora[12], flora[15], flora[13], flora[9], flora[0]], {
    size: [0.03, 0.046],
    lean: 24,
    bend: 16,
    cross: true,
    vary: 0.25,
    spin: 40,
    rng: rng(20),
    flow: () => [R() * 2 - 1, 0.2, R() * 2 - 1],
    group: "flora",
  });

  // 3D sprigs: faceted flowers, shoots, berries and clover standing over the cards
  const P_FLOWERS: { cols: [string, string]; eye: string; n: number; R: number; wide?: number }[] = [
    { cols: ["#ff7fa8", "#e85a8a"], eye: "#f2b420", n: 6, R: 0.011 },
    { cols: ["#b39be8", "#8e72d2"], eye: "#f2b420", n: 5, R: 0.012 },
    { cols: ["#ffffff", "#efe8f8"], eye: "#f2b420", n: 8, R: 0.012, wide: 0.24 },
    { cols: ["#ffd94a", "#f4bc1e"], eye: SKIN, n: 6, R: 0.011 },
    { cols: ["#ff5a44", "#dd3a30"], eye: NOSE, n: 5, R: 0.0135, wide: 0.42 },
    { cols: ["#ffab5c", "#f27f34"], eye: SKIN, n: 6, R: 0.011 },
  ];
  const BERRY_SETS = [
    ["#dd3a30", "#ff5a44"],
    ["#8e72d2", "#b39be8"],
    ["#f27f34", "#ffab5c"],
  ];
  const sprigHits = skin.scatter(78, {
    rng: rng(21),
    minDist: 0.0255,
    filter: (h) => h.n.y > 0.6 && h.at.z < 0.06 && h.at.z > -0.07,
  });
  let f = 0;
  let sh = 0;
  let bc = 0;
  sprigHits.forEach((hit, i) => {
    const kind = i % 7;
    if (kind <= 2 || kind === 5) {
      const fl = P_FLOWERS[f++ % P_FLOWERS.length];
      plant(hit, flower3(R, { ...fl, H: 0.042 + R() * 0.012, pal: f % 2 ? FRESH : DEEP }));
    } else if (kind === 3) {
      const pal = [FRESH, DEEP, LIME, AUTUMN][sh++ % 4];
      plant(hit, shoot3(R, pal, 0.04 + R() * 0.012, 5 + (i % 3)));
    } else if (kind === 4) {
      const set = BERRY_SETS[bc++ % 3];
      plant(hit, berries3(R, set[0], set[1], bc % 2 ? FRESH : DEEP, 0.04 + R() * 0.01, 4));
    } else plant(hit, clover3(R, i % 2 ? FRESH : LIME, LEAF_RIB, 0.04 + R() * 0.008));
  });

  // Chunky extruded leaves, tilted off the back, with a lighter midrib
  const LEAF_OUTLINES: OutlinePoint[][] = [
    [
      [0, 0],
      [0.007, 0.008],
      [0.017, 0.013],
      [0.03, 0.009],
      [0.042, 0, "sharp"],
      [0.03, -0.009],
      [0.017, -0.013],
      [0.007, -0.008],
    ],
    [
      [0, 0],
      [0.005, 0.005],
      [0.012, 0.008],
      [0.014, 0.014, "sharp"],
      [0.02, 0.009],
      [0.028, 0.013, "sharp"],
      [0.03, 0.006],
      [0.04, 0, "sharp"],
      [0.03, -0.006],
      [0.028, -0.013, "sharp"],
      [0.02, -0.009],
      [0.014, -0.014, "sharp"],
      [0.012, -0.008],
      [0.005, -0.005],
    ],
    [
      [0, 0],
      [0.008, 0.007],
      [0.02, 0.0095],
      [0.032, 0.006],
      [0.042, 0, "sharp"],
      [0.032, -0.006],
      [0.02, -0.0095],
      [0.008, -0.007],
    ],
  ];
  const BIG_LEAVES = [FRESH.d[0], DEEP.d[0], LIME.d[0], AUTUMN.d[0], FRESH.l[0]];
  const mantle = skin.scatter(15, {
    rng: rng(41),
    minDist: 0.038,
    filter: (h) => h.n.y > 0.65 && h.at.z < 0.06 && h.at.z > -0.06,
  });
  let ladybirdDone = false;
  mantle.forEach((hit: Hit, i) => {
    const n = hit.axis;
    const t = tangent(n);
    const a = (14 + R() * 20) * DEG;
    const x = t.clone().multiplyScalar(Math.cos(a)).addScaledVector(n, Math.sin(a));
    const y = new THREE.Vector3().crossVectors(n, t);
    const lift = 0.014 + R() * 0.012;
    const base = hit.moved([0, lift, 0]);
    b.rod(hit, base, [0.0016, 0.0012], { color: STEM_DARK, sides: 3, group: "flora" });
    const body1 = BIG_LEAVES[i % BIG_LEAVES.length];
    const scale = 0.8 + R() * 0.35;
    const outline = LEAF_OUTLINES[i % LEAF_OUTLINES.length].map(
      (p) => [p[0] * scale, p[1] * scale, ...(p.length > 2 ? (["sharp"] as const) : [])] as unknown as OutlinePoint,
    );
    const leafPart = b.extrude(outline, {
      at: base,
      x,
      y,
      thickness: 0.0026,
      bevel: 0.0007,
      detail: 0.34,
      color: body1,
      group: "flora",
    });
    const ribLen = 0.034 * scale;
    b.extrude(
      [
        [0.002, -0.0008],
        [ribLen, -0.0005],
        [ribLen, 0.0005],
        [0.002, 0.0008],
      ],
      { at: base, x, y, thickness: 0.0032, color: LEAF_RIB, group: "flora" },
    );
    if (!ladybirdDone && i === 3) {
      ladybirdDone = true;
      const thick = new THREE.Vector3().crossVectors(x, y);
      const up = thick.dot(n) >= 0 ? thick : thick.negate();
      plant(frame(leafPart.moved([0.024 * scale, 0.002, 0.0013]), up), ladybird(), 0);
    }
  });

  // Hinge the mouth a touch open so the pink tongue reads.
  b.pose(jaw, { axis: [1, 0, 0], deg: 9 });

  return b.root;
}
