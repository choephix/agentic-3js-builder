// Alebrije jaguar: an Oaxacan copal-wood carving, about 1.25 m from nose to the tip of its curled tail. A stocky jaguar
// with eagle wings, a lizard's coiled tail and two little horns, carved in chunky 12-sided and 8-sided knife-cut
// facets and then painted over every centimetre in clashing folk-art enamels. The painting follows the anatomy: zigzag
// chevrons cross the back, fish scales cover the belly and tail, rosettes and a mandala flower fill the flanks, the legs
// wear bands of dots, zigzags and dashes, and every wing feather carries its own eye, chevron, dot or scallop pattern.
// All of it is paint (patterns in meters, baked into the atlas) or SVG: the eyes, the whisker cards, the petal ruff round
// the neck and around the tail tip, the mandala medallions on the shoulders and the forehead.
// Skeleton: hips, three spine joints, two neck joints, head and jaw; four legs of four joints; per wing a shoulder,
// elbow and wrist with three primary-feather digits, three secondary groups; and an eleven-joint tail chain.
import { CylinderGeometry, SphereGeometry, Vector3 } from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { aim, DEG, lerp, offset, rng } from "../src/math";
import type { V3 } from "../src/math";
import type { OutlinePoint } from "../src/outline";
import { mix, noise, paint, resolve, smoothstep } from "../src/paint";
import type { Paint, Rgb, SurfaceCoords } from "../src/paint";
import { catmull, spiral } from "../src/path";
import { svg } from "../src/texture";

export const meta = {
  name: "Alebrije Jaguar",
  description:
    "An Oaxacan alebrije: a 1.25 m painted copal-wood jaguar with eagle wings on feather-group joints, a coiled lizard tail, little striped horns and an openable jaw, carved in knife-cut facets and covered in dense folk-art patterns.",
};

// ------------------------------------------------------------------------------------------------- Palette
const ORANGE = "#f28a16";
const SUN = "#ffc81e";
const MAG = "#d1127a";
const PINK = "#ff6bad";
const TURQ = "#10b3ab";
const SKY = "#3bb9f0";
const BLUE = "#2050d4";
const NAVY = "#241c6e";
const GREEN = "#1fa24a";
const LIME = "#a6d62a";
const RED = "#dc2424";
const PURPLE = "#7c2dbd";
const WHITE = "#fff3da";
const BLACK = "#1a1015";
const WOOD = "#c99a5f";

type C = string | Rgb;
type Pal = readonly [string, string, string];

// ------------------------------------------------------------------------------------------------- Pattern kit
const AA = 0.0016;
const cover = (d: number, r: number) => smoothstep(r + AA, r - AA, d);
const stroke = (d: number, w: number) => cover(Math.abs(d), w / 2);
const over = (base: C, top: C, a: number): C => (a <= 0.001 ? base : a >= 0.999 ? top : mix(base, top, a));
const fract = (x: number) => x - Math.floor(x);
const tri = (x: number) => 1 - Math.abs(2 * fract(x) - 1);
const hash = (a: number, b: number, seed = 0) => fract(Math.sin(a * 127.1 + b * 311.7 + seed * 74.7) * 43758.5453);
const pick = <T>(list: readonly T[], i: number): T => list[((Math.floor(i) % list.length) + list.length) % list.length];

/** Staggered dot lattice: distance to the nearest centre, and its cell. */
function dots(u: number, v: number, pitch: number) {
  const rowH = pitch * 0.866;
  const row = Math.round(v / rowH);
  const shift = (row & 1) * pitch * 0.5;
  const col = Math.round((u - shift) / pitch);
  return { d: Math.hypot(u - (col * pitch + shift), v - row * rowH), id: hash(col, row), col, row };
}

/** A zigzag line `w` wide, `amp` high, one zig per `period`, running along u at v = 0. */
function zigzag(u: number, v: number, period: number, amp: number, w: number) {
  const y = amp * (tri(u / period) * 2 - 1);
  return stroke((v - y) / Math.hypot(1, (4 * amp) / period), w);
}

/** Overlapping fish scales, rows stacked in y: the top-most scale at (x, y), its distance from centre and its row. */
function fishScale(x: number, y: number, size: number) {
  const R = size * 0.53;
  const h = size * 0.5;
  const row0 = Math.floor(y / h);
  for (let r = row0 + 2; r >= row0 - 1; r--) {
    const shift = (r & 1) * size * 0.5;
    const col = Math.round((x - shift) / size);
    const d = Math.hypot(x - (col * size + shift), y - r * h);
    if (d < R) return { d, R, row: r, id: hash(col, r, 5), col };
  }
  return { d: R, R, row: row0, id: 0, col: 0 };
}

/** A carved flower: scalloped petals, inner petals, a dotted ring, a core. `cols` = petal, inner, ring, core, centre. */
function rosette(du: number, dv: number, R: number, petals: number, cols: readonly C[]): C | null {
  const r = Math.hypot(du, dv);
  if (r > R) return null;
  const pet = Math.abs(Math.cos((petals * Math.atan2(dv, du)) / 2));
  const ro = R * (0.6 + 0.4 * Math.sqrt(pet));
  if (r > ro) return null;
  if (r > ro - 0.0045) return BLACK;
  if (r > 0.53 * R) {
    const ri = R * (0.4 + 0.3 * Math.sqrt(pet));
    let c: C = cols[0];
    c = over(c, cols[1], cover(r, ri) * smoothstep(0.53 * R, 0.56 * R, r));
    return over(c, BLACK, stroke(r - ri, 0.004) * smoothstep(0.53 * R, 0.56 * R, r));
  }
  if (r > 0.49 * R) return BLACK;
  if (r > 0.3 * R) {
    const a = Math.atan2(dv, du);
    const k = Math.round((a * 8) / (2 * Math.PI));
    const da = a - (k * 2 * Math.PI) / 8;
    const d = Math.hypot(r * Math.cos(da) - 0.4 * R, r * Math.sin(da));
    return over(cols[2], WHITE, cover(d, 0.055 * R));
  }
  if (r > 0.26 * R) return BLACK;
  return over(cols[3], cols[4], cover(r, 0.11 * R));
}

/** A lattice of ringed jaguar spots: black ring, coloured middle, white pip. Returns colour and coverage. */
function ringSpots(u: number, v: number, pitch: number, R: number, seed: number, inner: readonly C[]) {
  const rowH = pitch * 0.866;
  const row = Math.round(v / rowH);
  const shift = (row & 1) * pitch * 0.5;
  const col = Math.round((u - shift) / pitch);
  const j = pitch * 0.16;
  const cx = col * pitch + shift + (hash(col, row, seed) - 0.5) * j;
  const cy = row * rowH + (hash(col, row, seed + 1) - 0.5) * j;
  const d = Math.hypot(u - cx, v - cy);
  const id = hash(col, row, seed + 2);
  let c: C = BLACK;
  c = over(c, pick(inner, id * inner.length), cover(d, R * 0.62));
  c = over(c, WHITE, cover(d, R * 0.2));
  return { c, a: cover(d, R) };
}

/** Wrap a pattern with a faint copal grain: the wood shows through the enamel here and there. */
function carve(fn: (p: Vector3, n: Vector3, s: SurfaceCoords) => C) {
  return paint((p, n, s) => {
    const c = resolve(fn(p, n, s), p, n);
    const g = noise(new Vector3(p.x * 2.4 + p.z * 0.5, p.y * 0.5, p.z * 2.4), 0.02, 5);
    return mix(c, "#3a1b0c", 0.11 * smoothstep(0.56, 0.8, g));
  });
}

// ------------------------------------------------------------------------------------------------- Paints
const BACK_COLS = [MAG, SUN, TURQ, RED, LIME, PINK, BLUE, ORANGE];
const BELLY_COLS = [TURQ, SKY, WHITE, LIME];
const LEG_COLS = [TURQ, MAG, SUN, BLUE, GREEN, PINK];
const TAIL_COLS = [GREEN, TURQ, LIME, BLUE, MAG, SUN];
const HAUNCH: readonly [number, number] = [-0.2, 0.485];

/** The barrel: chevrons across the back, rosettes and a mandala on the flank, fish scales on the belly. */
const bodyPaint = carve((p, n) => {
  const ax = Math.abs(p.x);
  const u = p.z + (noise(p, 0.07, 3) - 0.5) * 0.01;
  if (n.y > 0.55) {
    const k = (u + 1.15 * ax) / 0.055;
    const f = fract(k);
    const along = (u * 1.15 - ax) / 1.52;
    let c: C = pick(BACK_COLS, k);
    const pip = Math.hypot(((f - 0.5) * 0.055) / 1.52, (fract(along / 0.03) - 0.5) * 0.03);
    c = over(c, WHITE, cover(pip, 0.0062));
    return over(c, BLACK, smoothstep(0.0034 + AA, 0.0034 - AA, (Math.min(f, 1 - f) * 0.055) / 1.52));
  }
  if (n.y < -0.55) {
    const sc = fishScale(p.x, -p.z, 0.05);
    let c: C = pick(BELLY_COLS, sc.id * 4);
    c = over(c, BLACK, smoothstep(0.0042 + AA, 0.0042 - AA, sc.R - sc.d));
    return over(c, pick([MAG, BLUE, RED, PURPLE], sc.id * 4), cover(sc.d, 0.0065));
  }
  const flower = rosette(u - HAUNCH[0], p.y - HAUNCH[1], 0.088, 11, [MAG, SUN, TURQ, RED, SUN]);
  if (flower) return flower;
  let c: C = ORANGE;
  c = over(c, SUN, cover(dots(u, p.y, 0.026).d, 0.0052));
  if (Math.hypot(u - HAUNCH[0], p.y - HAUNCH[1]) > 0.135) {
    const sp = ringSpots(u, p.y, 0.118, 0.04, 2, [MAG, TURQ, BLUE, GREEN, PINK]);
    c = over(c, sp.c, sp.a);
  }
  // Scalloped border where the flank meets the belly, dotted one under the back stripes.
  c = over(c, BLACK, zigzag(u, p.y - 0.352, 0.04, 0.009, 0.007));
  c = over(c, WHITE, cover(dots(u, p.y - 0.585, 0.02).d, 0.0045) * smoothstep(0.6, 0.55, n.y));
  return c;
});

/** Legs: rings of dots, zigzags, dashes and scales every few centimetres, and a flower on the outer thigh / shoulder. */
const CIRC = 0.36;
const legPaint = carve((p, n, s) => {
  // The round top cap of a leg has no length coordinate: continue the bands down over the dome from the hip.
  const cap = s[0] < 0.002;
  const hipZ = p.z < 0 ? -0.25 : 0.14;
  const hipX = p.z < 0 ? 0.18 : 0.17;
  const u = cap ? (p.z < 0 ? 0.44 : 0.42) - p.y : s[0] * 0.62;
  const angle = (Math.atan2(p.z - hipZ, Math.abs(p.x) - hipX) / (2 * Math.PI) + 1) % 1;
  const v = (cap ? angle : (((s[1] % 360) + 360) % 360) / 360) * CIRC;
  const outward = n.x * (p.x >= 0 ? 1 : -1) > 0.35;
  if (outward && u < 0.2 && p.y > 0.2) {
    const cz = p.z < 0 ? -0.19 : 0.17;
    const cy = p.z < 0 ? 0.36 : 0.34;
    const flower = rosette(p.z - cz, p.y - cy, 0.072, 9, [SUN, MAG, BLUE, GREEN, WHITE]);
    if (flower) return flower;
  }
  const k = Math.floor(u / 0.052);
  const f = fract(u / 0.052);
  const mid = (k + 0.5) * 0.052;
  let c: C = pick(LEG_COLS, k);
  switch (((k % 4) + 4) % 4) {
    case 0:
      c = over(c, BLACK, cover(dots(v, u, CIRC / 16).d, 0.0058));
      break;
    case 1:
      c = over(c, BLACK, zigzag(v, u - mid, CIRC / 9, 0.011, 0.0065));
      c = over(c, WHITE, zigzag(v, u - mid + 0.014, CIRC / 9, 0.011, 0.0035));
      break;
    case 2:
      c = over(c, WHITE, stroke(fract(v / (CIRC / 18)) - 0.5, 0.3) * cover(Math.abs(u - mid), 0.017));
      break;
    default: {
      const sc = fishScale(v, -u, CIRC / 8);
      c = over(c, pick([SUN, WHITE, PINK, LIME], sc.id * 4), cover(sc.d, 0.0095));
      c = over(c, BLACK, smoothstep(0.0038 + AA, 0.0038 - AA, sc.R - sc.d));
    }
  }
  const edge = Math.min(f, 1 - f) * 0.052;
  return over(c, BLACK, smoothstep(0.0034 + AA, 0.0034 - AA, edge));
});

/** Paws: a dotted dome with dark toe grooves. */
const pawPaint = carve((p, n) => {
  if (n.y < -0.7) return WOOD;
  let c: C = MAG;
  c = over(c, SUN, cover(dots(p.x, p.z, 0.02).d, 0.0058) * smoothstep(0.1, 0.4, n.y));
  c = over(c, WHITE, stroke(fract(p.y / 0.02) - 0.5, 0.15) * smoothstep(0.4, 0.1, n.y));
  return c;
});

/** The head: ringed spots on the cranium, black brow stripes, a white dotted muzzle, zigzag cheeks, a red palate. */
const HEAD_AT = new Vector3(0, 0.63, 0.36);
const headPaint = carve((p, n) => {
  const ax = Math.abs(p.x);
  const hz = p.z - HEAD_AT.z;
  const hy = p.y - HEAD_AT.y;
  if (n.y < -0.5) return over(RED, WHITE, stroke(fract(hz / 0.03) - 0.5, 0.16));
  const top = n.y > 0.5;
  const u = top ? p.x : p.z;
  const v = top ? p.z : p.y;
  let c: C = SUN;
  if (hz > 0.17) {
    c = over(WHITE, BLACK, cover(dots(u, v, 0.02).d, 0.0046));
    c = over(c, MAG, cover(dots(u + 0.01, v + 0.017, 0.04).d, 0.0055));
  } else {
    const sp = ringSpots(u, v, 0.052, 0.021, 4, [MAG, TURQ, ORANGE, BLUE]);
    c = over(c, sp.c, sp.a);
  }
  if (top && hz > 0.03 && hz < 0.21) {
    c = over(c, BLACK, Math.max(stroke(ax - 0.04, 0.013), stroke(ax - 0.088, 0.011)));
    c = over(c, TURQ, stroke(ax - 0.064, 0.008));
  }
  if (!top && hz < 0.17 && hz > 0.0) {
    c = over(c, BLACK, zigzag(hz, hy + 0.062, 0.03, 0.009, 0.008));
    c = over(c, TURQ, zigzag(hz + 0.015, hy + 0.082, 0.03, 0.009, 0.007));
  }
  return c;
});

const jawPaint = carve((p, n) => {
  const ax = Math.abs(p.x);
  const hz = p.z - HEAD_AT.z;
  if (n.y > 0.5) return over(PINK, RED, stroke(ax, 0.008) + stroke(fract(hz / 0.028) - 0.5, 0.12) * 0.6);
  let c: C = MAG;
  c = over(c, SUN, cover(dots(hz, p.y, 0.024).d, 0.0058));
  c = over(c, TURQ, zigzag(hz, p.y - (HEAD_AT.y - 0.135), 0.03, 0.007, 0.006) * smoothstep(0.2, -0.2, n.y));
  return c;
});

const earPaint = carve((_p, _n, s) => {
  const r = Math.hypot(s[0] / 0.04, (s[1] - 0.03) / 0.055);
  let c: C = MAG;
  c = over(c, BLACK, stroke(r - 0.95, 0.09));
  c = over(c, SUN, cover(r, 0.82));
  c = over(c, BLACK, stroke(r - 0.6, 0.08));
  c = over(c, TURQ, cover(r, 0.5));
  return over(c, WHITE, cover(Math.hypot(s[0] / 0.04, (s[1] - 0.03) / 0.055), 0.14));
});

/** Wing bone: green with a spiral of dots and cross bands. */
const armPaint = carve((p, _n, s) => {
  if (s[0] < 0.004 || s[0] > 0.996) return over(MAG, SUN, cover(dots(p.x + p.z, p.y + p.z, 0.02).d, 0.005));
  const u = s[0] * 0.6;
  const v = (((s[1] % 360) + 360) % 360) / 360;
  let c: C = pick([GREEN, MAG, TURQ], u / 0.06);
  c = over(c, WHITE, cover(dots(v * 0.24, u, 0.024).d, 0.0055));
  return over(c, BLACK, smoothstep(0.0034 + AA, 0.0034 - AA, Math.min(fract(u / 0.06), 1 - fract(u / 0.06)) * 0.06));
});

/** Tail: a fish-scale skin whose scales shrink toward the tip, each row a different enamel, a pip in every scale. */
const TAIL_SIZE = 0.04;
function tailPaintFor(length: number, radius: (t: number) => number) {
  return carve((_p, _n, s) => {
    const t = s[0];
    const around = Math.max(3, Math.round((2 * Math.PI * radius(t)) / TAIL_SIZE));
    const x = ((((s[1] % 360) + 360) % 360) / 360) * around * TAIL_SIZE;
    const sc = fishScale(x, -t * length, TAIL_SIZE);
    let c: C = pick(TAIL_COLS, sc.row + sc.col * 0.5);
    c = over(c, pick([WHITE, SUN, PINK], sc.id * 3), cover(sc.d, 0.0065));
    c = over(c, BLACK, smoothstep(0.004 + AA, 0.004 - AA, sc.R - sc.d));
    return t > 0.94 ? over(c, MAG, smoothstep(0.94, 0.97, t)) : c;
  });
}

// ------------------------------------------------------------------------------------------------- Feathers
/** Half width of a feather along its length, 0..1 of `w`. */
const HW: ReadonlyArray<readonly [number, number]> = [
  [0, 0.5],
  [0.3, 0.95],
  [0.65, 1],
  [0.9, 0.72],
  [1, 0],
];
function halfWidthAt(f: number) {
  for (let i = 1; i < HW.length; i++)
    if (f <= HW[i][0]) {
      const [f0, w0] = HW[i - 1];
      const [f1, w1] = HW[i];
      return w0 + ((w1 - w0) * (f - f0)) / (f1 - f0);
    }
  return 0;
}

function mirrored(right: readonly OutlinePoint[], centre: readonly OutlinePoint[]): OutlinePoint[] {
  const left = [...right].reverse().map((p): OutlinePoint => (p.length === 3 ? [-p[0], p[1], "sharp"] : [-p[0], p[1]]));
  return [...right, ...centre, ...left];
}

/** A chunky carved feather, drawn up its shaft, round-tipped; `w` is the half width. */
const featherOutline = (len: number, w: number) =>
  mirrored(
    [
      [0.5 * w, 0, "sharp"],
      [0.95 * w, 0.3 * len],
      [w, 0.65 * len],
      [0.72 * w, 0.9 * len],
    ],
    [[0, len]],
  );

type Kind = "eye" | "chevron" | "dots" | "scallop";
const featherPaints = new Map<string, Paint>();
function featherPaint(kind: Kind, len: number, w: number, pal: Pal, normal: Vector3) {
  const key = `${kind}|${len}|${w}|${pal.join()}|${normal.x.toFixed(3)}`;
  const known = featherPaints.get(key);
  if (known) return known;
  const made = carve((_p, n, s) => {
    if (Math.abs(n.dot(normal)) < 0.4) return pal[2];
    const x = Math.abs(s[0]);
    const y = s[1];
    const f = y / len;
    const hw = Math.max(halfWidthAt(Math.min(Math.max(f, 0), 1)) * w, 0.001);
    let c: C = pal[0];
    if (kind === "eye") {
      if (f > 0.84) c = pal[2];
      c = over(c, BLACK, stroke(f - 0.84, 0.007 / len));
      c = over(c, pal[2], zigzag(s[0], y - 0.14 * len, 0.03, 0.008, 0.007) * (f < 0.3 ? 1 : 0));
      const rE = Math.min(hw * 0.72, 0.042);
      const d = Math.hypot(s[0], y - 0.58 * len);
      c = over(c, BLACK, cover(d, rE));
      c = over(c, pal[1], cover(d, rE * 0.84));
      c = over(c, WHITE, cover(d, rE * 0.6));
      c = over(c, BLACK, cover(d, rE * 0.34));
      if (f < 0.85) c = over(c, BLACK, stroke(s[0], 0.004) * (d > rE ? 1 : 0));
    } else if (kind === "chevron") {
      const k = (y + 1.3 * x) / 0.048;
      c = pick([pal[0], pal[1], pal[2]], k);
      const per = (Math.min(fract(k), 1 - fract(k)) * 0.048) / 1.64;
      c = over(
        c,
        WHITE,
        cover(Math.hypot((fract(k) - 0.5) * 0.029, (fract((1.3 * y - x) / 0.06) - 0.5) * 0.04), 0.0055),
      );
      c = over(c, BLACK, smoothstep(0.003 + AA, 0.003 - AA, per));
      if (f > 0.88) c = over(pal[2], BLACK, stroke(f - 0.88, 0.006 / len));
    } else if (kind === "dots") {
      const dd = dots(s[0], y, 0.026);
      c = over(c, dd.id > 0.5 ? pal[1] : WHITE, cover(dd.d, 0.0068));
      c = over(c, BLACK, cover(dd.d, 0.0026));
      if (f > 0.82) c = over(pal[2], BLACK, stroke(f - 0.82, 0.006 / len));
      c = over(c, BLACK, stroke(s[0], 0.004) * (f > 0.05 && f < 0.82 ? 0.7 : 0));
    } else {
      const d = Math.hypot(s[0] / Math.max(hw, 0.01), (y - 0.52 * len) / (0.46 * len));
      c = over(c, BLACK, stroke(d - 0.7, 0.09));
      c = over(c, pal[1], cover(d, 0.62));
      c = over(c, BLACK, stroke(d - 0.36, 0.08));
      c = over(c, pal[2], cover(d, 0.3));
      c = over(c, WHITE, cover(d, 0.1));
    }
    const edge = Math.min(hw - x, (len - y) * 0.9);
    return over(c, BLACK, smoothstep(0.0075 + AA, 0.0075 - AA, edge));
  });
  featherPaints.set(key, made);
  return made;
}

const PALS: readonly Pal[] = [
  [ORANGE, TURQ, MAG],
  [SKY, SUN, RED],
  [MAG, SUN, BLUE],
  [GREEN, PINK, NAVY],
  [PURPLE, LIME, ORANGE],
  [RED, SKY, SUN],
  [TURQ, MAG, SUN],
  [BLUE, ORANGE, LIME],
];

// ------------------------------------------------------------------------------------------------- Drawings
const INK = "#1a1015";

/** The eye as a lat-long map for a dome that looks out: black pupil at the pole, a rayed gold iris, red rim, white, ring. */
const EYE = svg(
  `<svg viewBox="0 0 128 64">
    <rect width="128" height="64" fill="${INK}"/>
    <rect y="0" width="128" height="9" fill="#08060a"/>
    <rect y="9" width="128" height="13" fill="#ffc81e"/>
    <g fill="#f28a16">${Array.from({ length: 16 }, (_, i) => `<rect x="${i * 8 + 2}" y="9" width="3" height="13"/>`).join("")}</g>
    <rect y="22" width="128" height="4" fill="${INK}"/>
    <rect y="26" width="128" height="6" fill="#dc2424"/>
    <rect y="32" width="128" height="10" fill="#fff3da"/>
    <rect y="42" width="128" height="5" fill="${INK}"/>
    <rect y="47" width="128" height="5" fill="#10b3ab"/>
    <rect y="52" width="128" height="12" fill="${INK}"/>
  </svg>`,
  { size: 256 },
);

/** Three whiskers fanning from the root (bottom centre). */
const WHISKERS = svg(
  `<svg viewBox="0 0 32 64">
    <g fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round">
      <path d="M16 63 C14 40 8 22 3 6"/>
      <path d="M16 63 C16 42 16 24 16 3"/>
      <path d="M16 63 C18 40 24 22 29 6"/>
    </g>
  </svg>`,
  { size: 256 },
);

/** A petal: black outline, a lighter lens, a rib and three pips. */
const petal = (a: string, b: string, c: string) =>
  svg(
    `<svg viewBox="0 0 40 80">
      <path d="M20 79 C3 60 1 30 20 2 C39 30 37 60 20 79Z" fill="${a}" stroke="${INK}" stroke-width="3.4"/>
      <path d="M20 70 C10 56 9 34 20 14 C31 34 30 56 20 70Z" fill="${b}" stroke="${INK}" stroke-width="1.8"/>
      <path d="M20 68 L20 22" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>
      <g fill="${c}" stroke="${INK}" stroke-width="1"><circle cx="20" cy="32" r="3.2"/><circle cx="20" cy="45" r="3.2"/><circle cx="20" cy="58" r="3.2"/></g>
    </svg>`,
    { size: 192 },
  );

/** A round medallion: twelve petals, a dotted ring, a core. */
const mandala = (bg: string, a: string, b: string, core: string) =>
  svg(
    `<svg viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="98" fill="${bg}" stroke="${INK}" stroke-width="6"/>
      ${Array.from({ length: 12 }, (_, i) => `<g transform="rotate(${i * 30} 100 100)"><path d="M100 96 C80 68 86 30 100 16 C114 30 120 68 100 96Z" fill="${i % 2 ? a : b}" stroke="${INK}" stroke-width="4"/><circle cx="100" cy="44" r="5" fill="#fff3da" stroke="${INK}" stroke-width="1.5"/></g>`).join("")}
      <circle cx="100" cy="100" r="46" fill="${INK}"/>
      <circle cx="100" cy="100" r="41" fill="${a}"/>
      ${Array.from({ length: 16 }, (_, i) => `<circle cx="${100 + 32 * Math.cos((i * Math.PI) / 8)}" cy="${100 + 32 * Math.sin((i * Math.PI) / 8)}" r="4.2" fill="#fff3da" stroke="${INK}" stroke-width="1.4"/>`).join("")}
      <circle cx="100" cy="100" r="21" fill="${INK}"/>
      <circle cx="100" cy="100" r="17" fill="${core}"/>
      <circle cx="100" cy="100" r="7" fill="#fff3da" stroke="${INK}" stroke-width="2"/>
    </svg>`,
    { size: 512 },
  );

const SIDES = [
  [1, "L"],
  [-1, "R"],
] as const;

/** Piecewise smooth radius through `[t, r]` keys sorted by t. */
function radiusKeys(keys: ReadonlyArray<readonly [number, number]>) {
  return (t: number) => {
    let i = 1;
    while (i < keys.length - 1 && keys[i][0] < t) i++;
    const [t0, r0] = keys[i - 1];
    const [t1, r1] = keys[i];
    const k = Math.min(Math.max((t - t0) / (t1 - t0), 0), 1);
    return r0 + (r1 - r0) * k * k * (3 - 2 * k);
  };
}

export default function build() {
  const b = createBuilder({ name: "alebrijeJaguar", paintSize: 2048 });

  // ------------------------------------------------------------------ Body: rump to neck top in one faceted loft
  const stations = [
    { at: [0, 0.47, -0.38], w: 0.14, h: 0.18 },
    { at: [0, 0.47, -0.26], w: 0.31, h: 0.34 },
    { at: [0, 0.45, -0.08], w: 0.3, h: 0.31 },
    { at: [0, 0.47, 0.12], w: 0.35, h: 0.37 },
    { at: [0, 0.53, 0.24], w: 0.29, h: 0.31 },
    { at: [0, 0.6, 0.31], w: 0.22, h: 0.24 },
    { at: [HEAD_AT.x, HEAD_AT.y, HEAD_AT.z], w: 0.19, h: 0.21 },
  ] as const;
  const curve = catmull(stations.map((s) => s.at));
  const hipsT = curve.knots[1];
  const chestT = curve.knots[4];
  const hips = b.joint("hips", { at: stations[1].at, role: "spine", group: "body" });
  const spine = b.chain("spine", curve.slice(hipsT, chestT), {
    parent: hips,
    count: 3,
    names: ["spine1", "spine2", "chest"],
    role: "spine",
    group: "body",
  });
  const chest = spine.joints[2];
  const neck = b.chain("neck", curve.slice(chestT, 1), {
    parent: chest,
    count: 2,
    names: ["neck1", "neck2"],
    role: "neck",
    group: "neck",
  });
  const body = b.loft(stations, {
    bone: [hips, spine, neck],
    color: bodyPaint,
    sides: 12,
    smooth: false,
    group: "body",
  });

  // Carved triangles down the back, behind the wings.
  const crest = [MAG, SUN, TURQ, RED, LIME];
  const backFrom = curve.closestT([0, 0.47, -0.31]);
  const backTo = curve.closestT([0, 0.46, -0.04]);
  let ci = 0;
  b.along(
    body,
    6,
    (at) => b.spike(at, at, 0.055, 0.024, { color: crest[ci++ % crest.length], sides: 5, group: "body" }),
    { from: backFrom, to: backTo },
  );

  // Mandala medallions on both flanks between the legs (a flat facet of the barrel).
  const shoulderSkin = b.surface(body);
  for (const [s, side] of SIDES) {
    const hit = shoulderSkin.ray([s * 0.5, 0.45, -0.025], [-s, 0, 0]);
    if (!hit) throw new Error("alebrijeJaguar: no flank under the shoulder medallion");
    const seat = frame(offset(hit, hit, 0.003), hit);
    b.stick(new CylinderGeometry(0.047, 0.047, 0.001, 20), WOOD, seat, { embed: 0.5, bone: chest, group: "body" });
    const disc = frame(offset(hit, hit, 0.0045), hit);
    b.stick(new CylinderGeometry(0.046, 0.046, 0.001, 20), "#ffffff", disc, {
      embed: 0,
      bone: chest,
      texture: side === "L" ? mandala(TURQ, MAG, SUN, RED) : mandala(MAG, TURQ, SUN, BLUE),
      group: "body",
    });
  }

  // ------------------------------------------------------------------ Head
  const headDir: V3 = [0, -0.1, 1];
  const skull = b.joint("head", { parent: neck.joints[1], at: neck.at(1), dir: headDir, role: "head", group: "head" });
  const head = b.region({ at: skull, quat: aim(headDir, [0, 1, 0], "z") });
  const cranium = b.loft(
    [
      { at: head.p([0, 0, -0.05]), w: 0.22, h: 0.22 },
      { at: head.p([0, 0.005, 0.05]), w: 0.3, h: 0.25 },
      { at: head.p([0, 0.005, 0.14]), w: 0.27, h: 0.2 },
      { at: head.p([0, -0.02, 0.21]), w: 0.19, h: 0.13 },
      { at: head.p([0, -0.03, 0.26]), w: 0.15, h: 0.1 },
    ],
    { bone: skull, color: headPaint, sides: 8, smooth: false, group: "head" },
  );
  const jaw = head.joint("jaw", {
    parent: skull,
    at: [0, -0.07, 0.0],
    aim: [0, -0.115, 0.26],
    role: "jaw",
    group: "jaw",
  });
  b.loft(
    [
      { at: head.p([0, -0.105, -0.005]), w: 0.16, h: 0.06 },
      { at: head.p([0, -0.135, 0.06]), w: 0.2, h: 0.05 },
      { at: head.p([0, -0.125, 0.14]), w: 0.15, h: 0.05 },
      { at: head.p([0, -0.11, 0.22]), w: 0.11, h: 0.045 },
    ],
    { bone: jaw, color: jawPaint, sides: 8, smooth: false, group: "jaw" },
  );
  // A tongue laid on the jaw, and the fangs: two big canines each way and a row of small teeth.
  b.extrude(
    [
      [-0.034, 0],
      [0.034, 0],
      [0.03, 0.12],
      [0, 0.155],
      [-0.03, 0.12],
    ],
    {
      at: head.p([0, -0.104, 0.05]),
      x: head.d([1, 0, 0]),
      y: head.d([0, 0, 1]),
      thickness: 0.012,
      smoothing: 1,
      bone: jaw,
      color: PINK,
      group: "jaw",
      name: "tongue",
    },
  );
  for (const s of [1, -1]) {
    b.spike(head.p([s * 0.055, -0.078, 0.205]), head.d([0, -1, -0.15]), 0.062, 0.017, {
      bone: skull,
      color: WHITE,
      sides: 6,
      group: "head",
      name: "fang",
    });
    b.spike(head.p([s * 0.048, -0.088, 0.195]), head.d([0, 1, 0.1]), 0.05, 0.015, {
      bone: jaw,
      color: WHITE,
      sides: 6,
      group: "jaw",
      name: "fang",
    });
  }
  for (const dx of [-0.05, -0.025, 0, 0.025, 0.05]) {
    b.spike(head.p([dx, -0.072, 0.253 - Math.abs(dx) * 0.4]), head.d([0, -1, 0]), 0.022, 0.0085, {
      bone: skull,
      color: WHITE,
      sides: 5,
      group: "head",
    });
    b.spike(head.p([dx * 0.8, -0.088, 0.232 - Math.abs(dx) * 0.4]), head.d([0, 1, 0]), 0.018, 0.0078, {
      bone: jaw,
      color: WHITE,
      sides: 5,
      group: "jaw",
    });
  }
  // A big folk-art nose and a starburst on the forehead.
  b.part(new SphereGeometry(0.034, 6, 4), MAG, {
    bone: skull,
    at: head.p([0, -0.002, 0.265]),
    scale: [1.2, 0.75, 0.85],
    group: "head",
    name: "nose",
  });
  b.part(new SphereGeometry(0.009, 5, 4), BLACK, { bone: skull, at: head.p([0.017, -0.012, 0.293]), group: "head" });
  b.part(new SphereGeometry(0.009, 5, 4), BLACK, { bone: skull, at: head.p([-0.017, -0.012, 0.293]), group: "head" });
  const face = b.surface(cranium);
  const brow = face.ray(head.p([0, 0.4, 0.09]), head.d([0, -1, 0]));
  if (brow) {
    b.stick(new CylinderGeometry(0.03, 0.03, 0.001, 16), "#ffffff", frame(offset(brow, brow, 0.003), brow), {
      embed: 0,
      bone: skull,
      texture: mandala(RED, SUN, PINK, TURQ),
      group: "head",
    });
  }

  for (const [s, side] of SIDES) {
    // Eyes: a dark ring, a big drawn dome, a glint.
    const socket = face.ray(head.p([s * 0.4, 0.045, 0.14]), head.d([-s, 0, 0]));
    if (!socket) throw new Error("alebrijeJaguar: no skull under the eye");
    const gaze = head.d([s * 0.8, 0.05, 0.6]).normalize();
    b.lathe(
      [
        [0.028, -0.004],
        [0.046, -0.004],
        [0.046, 0.004],
        [0.036, 0.012],
        [0.028, 0.008],
      ],
      {
        at: socket,
        axis: gaze,
        bone: skull,
        segments: 8,
        color: TURQ,
        group: "head",
        name: `eyeRing${side}`,
      },
    );
    const R = 0.031;
    const eye = b.part(new SphereGeometry(R, 12, 5, 0, Math.PI * 2, 1e-4, Math.PI / 2), "#ffffff", {
      bone: skull,
      at: offset(socket, gaze, -0.4 * R),
      dir: gaze,
      texture: EYE,
      group: "head",
      name: `eye${side}`,
    });
    b.part(new SphereGeometry(0.005, 5, 4), "#ffffff", {
      bone: skull,
      at: eye.local([0.008, R * 0.98, 0.006]),
      group: "head",
    });
    // Heavy carved brow, striped.
    b.extrude(
      [
        [-0.08, -0.03, "sharp"],
        [0.075, -0.03, "sharp"],
        [0.065, 0.006],
        [0.02, 0.032],
        [-0.04, 0.03],
      ],
      {
        at: offset(offset(socket, head.d([0, 1, 0]), 0.036), head.d([-s, 0, 0]), 0.012),
        x: head.d([0, 0, 1]),
        y: head.d([s, -0.25, 0]),
        thickness: 0.026,
        bevel: 0.007,
        detail: 0.5,
        smoothing: 1,
        bone: skull,
        color: carve((_p, _n, c) => over(SUN, BLACK, stroke(fract(c[0] / 0.03) - 0.5, 0.36))),
        group: "head",
        name: `brow${side}`,
      },
    );
    // Ears: rounded, banded in concentric colours.
    b.extrude(
      [
        [-0.042, 0, "sharp"],
        [0.042, 0, "sharp"],
        [0.048, 0.04],
        [0.03, 0.075],
        [0, 0.088],
        [-0.03, 0.075],
        [-0.048, 0.04],
      ],
      {
        at: head.p([s * 0.11, 0.105, -0.005]),
        x: head.d([s, 0.1, 0.25]),
        y: head.d([s * 0.35, 1, -0.3]),
        thickness: [0.03, 0.014],
        bevel: 0.006,
        detail: 0.5,
        smoothing: 1,
        bone: skull,
        color: earPaint,
        group: "head",
        name: `ear${side}`,
      },
    );
    // Little curled horns with red and white bands.
    const root = head.p([s * 0.065, 0.105, 0.03]);
    const horn = catmull([
      root,
      head.p([s * 0.085, 0.16, 0.025]),
      head.p([s * 0.078, 0.215, -0.01]),
      head.p([s * 0.052, 0.238, -0.065]),
      head.p([s * 0.03, 0.222, -0.11]),
    ]);
    b.sweep(horn, [0.032, 0.017, 0.006], {
      bone: skull,
      bands: [
        [0.15, RED],
        [0.3, WHITE],
        [0.45, RED],
        [0.6, WHITE],
        [0.75, RED],
        [0.9, WHITE],
        [1, BLACK],
      ],
      sides: 6,
      caps: { start: "flat", end: "point" },
      smooth: false,
      group: "head",
      name: `horn${side}`,
    });
  }

  // Whiskers: cards laid flat, two fans each side.
  for (const [s] of SIDES)
    for (const tilt of [0.22, -0.2])
      b.cards([frame(head.p([s * 0.07, -0.028 + tilt * 0.05, 0.205]), head.d([s, tilt, -0.35]))], WHISKERS, {
        size: [0.11, 0.17],
        flow: [0, 1, 0],
        bone: skull,
        sink: 0.05,
        group: "head",
        name: "whiskers",
      });

  // A ruff of petal cards round the neck, lying back over the shoulders.
  const petals = [petal(MAG, SUN, TURQ), petal(TURQ, PINK, SUN), petal(ORANGE, BLUE, WHITE), petal(GREEN, SUN, RED)];
  const ruffFrames = [];
  const neckStart = curve.knots[5];
  for (const [row, t] of [neckStart - 0.01, neckStart + 0.55 * (1 - neckStart)].entries())
    for (let i = 0; i < 14; i++) ruffFrames.push(body.at(t, ((i + row * 0.5) / 14) * 360));
  b.cards(ruffFrames, petals, {
    size: [0.065, 0.14],
    lean: 62,
    bend: 20,
    flow: [0, -0.3, -1],
    vary: 0.15,
    spin: 8,
    rng: rng(3),
    group: "neck",
    name: "ruff",
  });

  // ------------------------------------------------------------------ Legs
  for (const [s, side] of SIDES) {
    // Fore leg: shoulder, elbow, wrist, paw. Straight and stout.
    const front: [number, number, number][] = [
      [s * 0.17, 0.42, 0.14],
      [s * 0.185, 0.25, 0.11],
      [s * 0.185, 0.11, 0.17],
      [s * 0.185, 0.05, 0.22],
      [s * 0.185, 0.05, 0.34],
    ];
    // Hind leg: hip, knee forward, hock back, paw.
    const hind: [number, number, number][] = [
      [s * 0.18, 0.44, -0.25],
      [s * 0.2, 0.27, -0.12],
      [s * 0.19, 0.13, -0.33],
      [s * 0.19, 0.05, -0.27],
      [s * 0.19, 0.05, -0.14],
    ];
    for (const isFront of [true, false]) {
      const pts = isFront ? front : hind;
      const g = `leg${isFront ? "F" : "H"}${side}`;
      const names = isFront
        ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `frontPaw${side}`]
        : [`hip${side}`, `knee${side}`, `hock${side}`, `hindPaw${side}`];
      const leg = b.chain(g, pts, {
        parent: isFront ? chest : hips,
        names,
        role: "leg",
        contact: [pts[4][0], 0, pts[4][2]],
        group: g,
      });
      const [, t1, t2, t3] = leg.ts;
      const radius = isFront
        ? radiusKeys([
            [0, 0.09],
            [t1, 0.072],
            [t2, 0.06],
            [t3, 0.058],
          ])
        : radiusKeys([
            [0, 0.118],
            [t1, 0.092],
            [t2, 0.062],
            [t3, 0.058],
          ]);
      b.sweep(leg, radius, {
        to: t3,
        color: legPaint,
        sides: 7,
        smooth: false,
        caps: { start: "round", end: "flat" },
        group: g,
      });
      const paw = leg.joints[3];
      const heel = leg.at(t3).at;
      const tip = leg.at(1).at;
      const mz = (heel.z + tip.z) / 2;
      const pr = isFront ? 0.085 : 0.09;
      b.lathe(
        [
          [0, 0],
          [pr, 0],
          [pr * 1.02, 0.02],
          [pr * 0.85, 0.05],
          [pr * 0.45, 0.07],
          [0, 0.073],
        ],
        {
          at: [heel.x, 0, mz],
          bone: paw,
          segments: 8,
          smoothing: 1,
          color: pawPaint,
          group: g,
          name: `paw${side}`,
        },
      );
      // Three toes and their claws on the front of the paw.
      const zt = tip.z + 0.012;
      [
        [-0.04, -0.006, TURQ],
        [0, 0.008, SUN],
        [0.04, -0.006, PINK],
      ].forEach(([dx, dz, col]) => {
        b.part(new SphereGeometry(0.032, 6, 4), col as string, {
          bone: paw,
          at: [heel.x + (dx as number), 0.029, zt + (dz as number)],
          scale: [1, 0.9, 1.15],
          group: g,
          name: "toe",
        });
        b.spike([heel.x + (dx as number), 0.024, zt + (dz as number) + 0.03], [0, -0.35, 1], 0.036, 0.0105, {
          bone: paw,
          color: WHITE,
          sides: 5,
          group: g,
          name: "claw",
        });
      });
    }
  }

  // ------------------------------------------------------------------ Tail: a lizard's coil rising behind the rump
  const spiralStart: V3 = [0, 0.47, -0.43];
  const coil = spiral([0, 0.6, -0.43], spiralStart, [1, 0, 0], { turns: 1.25, r1: 0.042, pitch: 0 });
  const tailPath = catmull([[0, 0.49, -0.3], [0, 0.475, -0.38], spiralStart]).concat(coil);
  const tail = b.chain("tail", tailPath, { parent: hips, count: 11, role: "tail", group: "tail" });
  const tailRadius = (t: number) => 0.021 + 0.062 * (1 - t) ** 1.1;
  const tailTube = b.sweep(tail, tailRadius, {
    color: tailPaintFor(tailPath.length, tailRadius),
    sides: 8,
    smooth: false,
    caps: { start: "round", end: "round" },
    group: "tail",
  });
  let ti = 0;
  b.along(
    tailTube,
    13,
    (at) =>
      b.spike(at, at, 0.06 * (1 - at.t) + 0.022, 0.016 + 0.014 * (1 - at.t), {
        color: crest[ti++ % crest.length],
        sides: 5,
        group: "tail",
      }),
    { from: 0.06, to: 0.94 },
  );
  // A flower of petals at the tail tip.
  const tip = b.ring(tail.at(0.985), { count: 7, radius: 0.008, tilt: 40 }, () => undefined);
  b.cards(tip.items, petals, {
    size: [0.05, 0.085],
    lean: 25,
    vary: 0.12,
    rng: rng(9),
    group: "tail",
    name: "tailFlower",
  });

  // ------------------------------------------------------------------ Wings
  const DIHEDRAL = 22 * DEG;
  const PITCH = 28 * DEG;
  const remigeDeg = [104, 96, 88, 26]; // feather direction at u = 0..3: degrees from the span toward the back
  const outs = [0, 0.2, 0.4, 0.55];
  const zs = [0.08, 0.03, 0.11, 0.07];
  for (const [s, side] of SIDES) {
    const g = `wing${side}`;
    const span = new Vector3(s * Math.cos(DIHEDRAL), Math.sin(DIHEDRAL), 0);
    const back = new Vector3(0, Math.sin(PITCH), -Math.cos(PITCH));
    const normal = new Vector3().crossVectors(span, back).multiplyScalar(s).normalize();
    const keys = outs.map((o, i) => new Vector3(s * 0.12, 0.65, 0).addScaledVector(span, o).setZ(zs[i]));
    const arm = b.chain(g, keys, {
      parent: chest,
      up: normal,
      names: [`wingShoulder${side}`, `wingElbow${side}`, `wingWrist${side}`],
      role: "wing",
      group: g,
    });
    b.sweep(arm, [0.046, 0.027], { color: armPaint, sides: 6, smooth: false, group: g });

    const segment = (u: number) => Math.min(2, Math.floor(u));
    const along = (u: number) => lerp(keys[segment(u)], keys[segment(u) + 1], u - segment(u));
    const degAt = (u: number) => {
      const i = segment(u);
      return remigeDeg[i] + (remigeDeg[i + 1] - remigeDeg[i]) * (u - i);
    };
    const toward = (deg: number) =>
      span
        .clone()
        .multiplyScalar(Math.cos(deg * DEG))
        .addScaledVector(back, Math.sin(deg * DEG));
    const feather = (
      u: number,
      behind: number,
      lift: number,
      len: number,
      w: number,
      kind: Kind,
      pal: Pal,
      thickness: readonly [number, number],
      bone: (typeof arm.joints)[number],
    ) => {
      const y = toward(degAt(u));
      return b.extrude(featherOutline(len, w), {
        at: along(u).addScaledVector(back, behind).addScaledVector(normal, lift),
        x: new Vector3().crossVectors(y, normal),
        y,
        thickness,
        bevel: 0.003,
        detail: 0.34,
        smoothing: 1,
        bone,
        color: featherPaint(kind, len, w, pal, normal),
        group: g,
      });
    };

    // Primaries: eight big eyed feathers on three digit joints.
    const PRIM = [0.3, 0.32, 0.34, 0.36, 0.36, 0.34, 0.3, 0.25];
    const primTh = [0.014, 0.007] as const;
    const wrist = arm.joints[2];
    for (let k = 0; k < 3; k++) {
      const members = k < 2 ? [3 * k, 3 * k + 1, 3 * k + 2] : [6, 7];
      const midU = 2.02 + (members[Math.floor(members.length / 2)] / 7) * 0.96;
      const root = along(midU);
      const digit = b.chain(`primaries${k + 1}${side}`, [root, offset(root, toward(degAt(midU)), PRIM[members[0]])], {
        parent: wrist,
        up: normal,
        names: [`primaries${k + 1}${side}`],
        role: "digit",
        group: g,
      }).joints[0];
      for (const i of members)
        feather(
          2.02 + (i / 7) * 0.96,
          0,
          0.009 * (i % 2),
          PRIM[i],
          0.05,
          "eye",
          PALS[(i + (s > 0 ? 0 : 3)) % PALS.length],
          primTh,
          digit,
        );
    }
    // Secondaries along the forearm: chevrons, in three groups on digit joints under the elbow.
    for (let k = 0; k < 3; k++) {
      const members = k < 2 ? [3 * k, 3 * k + 1, 3 * k + 2] : [6, 7];
      const midU = 1.06 + (members[Math.floor(members.length / 2)] / 7) * 0.9;
      const root = along(midU);
      const digit = b.chain(`secondaries${k + 1}${side}`, [root, offset(root, toward(degAt(midU)), 0.3)], {
        parent: arm.joints[1],
        up: normal,
        names: [`secondaries${k + 1}${side}`],
        role: "digit",
        group: g,
      }).joints[0];
      for (const i of members) {
        const len = 0.3 - 0.02 * Math.cos((i / 7) * Math.PI);
        feather(
          1.06 + (i / 7) * 0.9,
          0,
          0.016 + 0.009 * (i % 2),
          len,
          0.05,
          "chevron",
          PALS[(i + 2 + (s > 0 ? 0 : 5)) % PALS.length],
          primTh,
          digit,
        );
      }
    }
    // Tertials along the humerus: dotted.
    for (let i = 0; i < 4; i++)
      feather(
        0.15 + i * 0.22,
        0,
        0.03 + 0.009 * (i % 2),
        0.24 + 0.03 * i,
        0.048,
        "dots",
        PALS[(i + 4) % PALS.length],
        primTh,
        arm.joints[0],
      );
    // Coverts: two rows of small scalloped feathers over the roots and the arm.
    for (let i = 0; i < 13; i++) {
      const u = 0.25 + (i / 12) * 2.55;
      feather(
        u,
        0.035,
        0.05 + 0.008 * (i % 2),
        u > 2 ? 0.15 : 0.17,
        0.042,
        "scallop",
        PALS[(i + 1) % PALS.length],
        primTh,
        arm.joints[segment(u)],
      );
    }
    for (let i = 0; i < 11; i++) {
      const u = 0.15 + (i / 10) * 2.4;
      feather(
        u,
        -0.01,
        0.068 + 0.008 * (i % 2),
        0.1,
        0.036,
        "scallop",
        PALS[(i + 5) % PALS.length],
        primTh,
        arm.joints[segment(u)],
      );
    }
  }

  // Rest pose: the jaw a little open so the two jaws read apart.
  b.pose(jaw, { axis: [1, 0, 0], deg: 12 });
  return b.root;
}
