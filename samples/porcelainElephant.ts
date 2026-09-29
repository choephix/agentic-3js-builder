// Blue-and-white porcelain elephant: a 2.8 m (at the shoulder) Asian elephant in glazed white porcelain painted in
// cobalt blue only, Ming / Delft style, dressed for a procession. Trunk raised, ears flared, a saddle cloth over the
// back and a headdress on the brow.
// Everything blue is brushwork in six densities of one pigment (pale wash to deep cobalt). The paints follow the body:
// a key-fret border and scalloped hem round the saddle cloth, diaper lattice in its field, rolling waves (seigaiha)
// round the feet and along the belly, key-fret and lotus scroll on the trunk, radial ribs and a border on the ears,
// dot-and-line borders on every ruyi lappet of the cloud collar and on the frontlet. The drawn motifs are `svg()`:
// a dragon chasing the flaming pearl on each flank of the cloth, peony sprays on the thighs, cheeks and ears, a
// medallion on the brow and one on the rump, hem tassels and the tail tuft.
// Skeleton: hips, three spine joints, two neck joints, head, jaw; ears with a hinge each; an eight-joint trunk; four
// legs of four joints; a five-joint tail.
import { CircleGeometry, SphereGeometry, TorusGeometry, Vector3 } from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import type { V3 } from "../src/math";
import { mix, noise, paint, smoothstep } from "../src/paint";
import type { Rgb } from "../src/paint";
import { bezier, catmull } from "../src/path";
import type { Hit } from "../src/surface";
import type { Sweep, SweepPoint } from "../src/sweep";
import { svg } from "../src/texture";

export const meta = {
  name: "Porcelain Elephant",
  description:
    "A 2.8 m blue-and-white porcelain Asian elephant in a ceremonial saddle cloth and headdress: cobalt brushwork on white glaze, with dragons on the cloth, peonies, key-fret borders, waves round the feet and a ruyi cloud collar, on a rigged skeleton with raised trunk, ears and jaw.",
};

// ------------------------------------------------------------------------------------------------- Palette
// One pigment, six densities: glaze, pale wash, light, medium, dark, deep cobalt.
const GLAZE = "#f5f8fb";
const SHADE = "#dfe8f2";
const B1 = "#cfdcf1";
const B2 = "#94b2e2";
const B3 = "#4f7bca";
const B4 = "#244aa3";
const B5 = "#0f2a72";
const RAMP = [GLAZE, B1, B2, B3, B4, B5] as const;

type C = string | Rgb;
type P2 = [number, number];

// ------------------------------------------------------------------------------------------------- Pattern kit
const AA = 0.0022;
const cover = (d: number, r: number) => smoothstep(r + AA, r - AA, d);
const stroke = (d: number, w: number) => cover(Math.abs(d), w / 2);
const fract = (x: number) => x - Math.floor(x);
const hash = (a: number, b: number, seed = 0) => fract(Math.sin(a * 127.1 + b * 311.7 + seed * 74.7) * 43758.5453);
const over = (base: C, top: C, a: number): C => (a <= 0.002 ? base : a >= 0.998 ? top : mix(base, top, a));

function tone(d: number): Rgb {
  const x = Math.min(Math.max(d, 0), 1) * 5;
  const i = Math.min(4, Math.floor(x));
  return mix(RAMP[i], RAMP[i + 1], x - i);
}

/** Cobalt laid over `base` where `a` says, at density `d` (0 glaze .. 1 deep), a little uneven like a loaded brush. */
function ink(base: C, a: number, d: number, p: Vector3): C {
  if (a <= 0.003) return base;
  const dens = d * (0.86 + 0.28 * noise(p, 0.05, 11));
  return over(base, tone(dens), a);
}

/** The white glaze: a faint cool shade on the undersides. */
function glaze(p: Vector3, n: Vector3): C {
  return mix(GLAZE, SHADE, Math.min(1, 0.85 * smoothstep(0.25, -0.9, n.y) + 0.25 * noise(p, 0.7, 2)));
}

/** Soft pools of wash and a few long flowing folds, the way the potter's brush suggests hide. */
function skinWash(base: C, p: Vector3, seed: number, strength = 1): C {
  const pool = smoothstep(0.5, 0.78, noise(p, 0.5, seed));
  const c = ink(base, pool * 0.6 * strength, 0.14, p);
  const k = noise(p, 0.9, seed + 5) * 5;
  const fold = Math.min(fract(k), 1 - fract(k));
  return ink(c, smoothstep(0.05, 0.02, fold) * 0.7 * strength, 0.3, p);
}

function segDist(x: number, y: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(x - ax - t * dx, y - ay - t * dy);
}

/** Signed distance to a closed polygon's edge: positive inside. */
function polyDist(x: number, y: number, pts: readonly P2[]) {
  let d = 1e9;
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [ax, ay] = pts[j];
    const [bx, by] = pts[i];
    d = Math.min(d, segDist(x, y, ax, ay, bx, by));
    if (ay > y !== by > y && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) inside = !inside;
  }
  return inside ? d : -d;
}

/** Cut every unsharp corner a quarter of the way along its edges, `rounds` times (what extrude's smoothing does). */
function chaikin(points: readonly (readonly [number, number, "sharp"?])[], rounds: number): P2[] {
  let cur = points.map((q) => ({ x: q[0], y: q[1], sharp: q[2] === "sharp" }));
  for (let r = 0; r < rounds; r++) {
    const next: typeof cur = [];
    cur.forEach((q, i) => {
      if (q.sharp) return next.push(q);
      const a = cur[(i + cur.length - 1) % cur.length];
      const c = cur[(i + 1) % cur.length];
      next.push({ x: q.x + (a.x - q.x) * 0.25, y: q.y + (a.y - q.y) * 0.25, sharp: false });
      next.push({ x: q.x + (c.x - q.x) * 0.25, y: q.y + (c.y - q.y) * 0.25, sharp: false });
    });
    cur = next;
  }
  return cur.map((q) => [q.x, q.y] as P2);
}

/** A symmetric outline: `half` runs down the right side from the top centre; the left is its mirror. */
function symmetric(half: readonly (readonly [number, number, "sharp"?])[]) {
  const right = half.map((q) => q);
  const left = [...half]
    .slice(1, half.length - 1)
    .reverse()
    .map((q) => (q[2] ? ([-q[0], q[1], "sharp"] as const) : ([-q[0], q[1]] as const)));
  return [...right, ...left];
}

/** Staggered dot lattice: distance to the nearest centre. */
function dots(u: number, v: number, pitch: number) {
  const rowH = pitch * 0.866;
  const row = Math.round(v / rowH);
  const col = Math.round((u - (row & 1) * pitch * 0.5) / pitch);
  return Math.hypot(u - (col * pitch + (row & 1) * pitch * 0.5), v - row * rowH);
}

/** Interlocking rings (a diaper lattice): distance to the nearest ring line. */
function lattice(u: number, v: number, pitch: number, radius: number) {
  const rowH = pitch * 0.5;
  const row0 = Math.round(v / rowH);
  let best = 1e9;
  let centre = 1e9;
  for (let r = row0 - 1; r <= row0 + 1; r++) {
    const col = Math.round((u - (r & 1) * pitch * 0.5) / pitch);
    for (let c = col - 1; c <= col + 1; c++) {
      const d = Math.hypot(u - (c * pitch + (r & 1) * pitch * 0.5), v - r * rowH);
      best = Math.min(best, Math.abs(d - radius));
      centre = Math.min(centre, d);
    }
  }
  return { ring: best, centre };
}

/** Meander (leiwen) border: u along the band, v across it, `unit` = one stroke width; the band is 5 units high. */
const FRET: ReadonlyArray<readonly [number, number, number, number]> = [
  [0, 0.5, 6, 0.5],
  [0.5, 0.5, 0.5, 4.5],
  [0.5, 4.5, 6.5, 4.5],
  [4.5, 4.5, 4.5, 2.2],
  [4.5, 2.2, 2.5, 2.2],
  [2.5, 2.2, 2.5, 3.4],
];
function fret(u: number, v: number, unit: number) {
  const y = v / unit;
  if (y < -0.6 || y > 5.6) return 0;
  const x = fract(u / (6 * unit)) * 6;
  let d = 1e9;
  for (const [ax, ay, bx, by] of FRET)
    d = Math.min(d, segDist(x, y, ax, ay, bx, by), segDist(x + 6, y, ax, ay, bx, by));
  return cover(d * unit, 0.42 * unit);
}

/** Rolling waves: overlapping concentric arcs; returns line coverage and the fill density of the ring under the point. */
function seigaiha(x: number, y: number, size: number) {
  const R = size * 0.5;
  const h = size * 0.5;
  const row0 = Math.floor(y / h);
  for (let r = row0 - 1; r <= row0 + 2; r++) {
    const col = Math.round((x - (r & 1) * size * 0.5) / size);
    const d = Math.hypot(x - (col * size + (r & 1) * size * 0.5), y - r * h);
    if (d < R) {
      const rr = d / R;
      const k = Math.min(3, Math.floor(rr * 4));
      const lines = Math.max(
        stroke((rr - 0.25) * R, 0.005),
        stroke((rr - 0.5) * R, 0.006),
        stroke((rr - 0.75) * R, 0.0065),
        stroke((rr - 1) * R + 0.004, 0.011),
      );
      return { line: lines, fill: k === 0 ? 0.42 : k === 2 ? 0.2 : 0, id: hash(col, r) };
    }
  }
  return { line: 0, fill: 0, id: 0 };
}

/** A running lotus scroll: a wavy stem with alternate leaves and buds; `u` along, `v` across from the centre line. */
function scroll(u: number, v: number, period: number, amp: number, w: number) {
  const y = amp * Math.sin((2 * Math.PI * u) / period);
  const stem = stroke(v - y, w);
  const half = period / 2;
  const k = Math.floor(u / half);
  const sign = k & 1 ? 1 : -1;
  const uu = u - (k + 0.5) * half;
  const lh = Math.hypot(uu / (half * 0.42), (v - y - sign * amp * 0.75) / (amp * 0.45));
  const leaf = cover(lh, 1);
  const rim = leaf * (1 - cover(lh, 0.66));
  const bud = cover(Math.hypot(uu - half * 0.05, v - y + sign * amp * 0.5), w * 0.9);
  return { stem, leaf, rim, bud };
}

// ------------------------------------------------------------------------------------------------- Body layout
const CY = 2.0;
const BODY = [
  { at: [0, CY, -1.55], w: 0.7, h: 1.05 },
  { at: [0, CY, -1.3], w: 1.16, h: 1.52 },
  { at: [0, CY, -0.75], w: 1.4, h: 1.68 },
  { at: [0, CY, 0.0], w: 1.5, h: 1.7 },
  { at: [0, CY + 0.02, 0.7], w: 1.4, h: 1.68 },
  { at: [0, CY + 0.06, 1.15], w: 1.16, h: 1.56 },
  { at: [0, CY + 0.12, 1.5], w: 0.85, h: 1.3 },
] as const;

/** Half width, half height and centre height of the barrel at z, by linear blend of the stations. */
function barrel(z: number) {
  let i = 0;
  while (i < BODY.length - 2 && z > BODY[i + 1].at[2]) i++;
  const a = BODY[i];
  const c = BODY[i + 1];
  const t = Math.min(1, Math.max(0, (z - a.at[2]) / (c.at[2] - a.at[2])));
  return {
    a: (a.w + (c.w - a.w) * t) / 2,
    b: (a.h + (c.h - a.h) * t) / 2,
    cy: a.at[1] + (c.at[1] - a.at[1]) * t,
  };
}

// The saddle cloth: paint on the barrel, laid out in meters from the ridge (v) and along the body (u = z).
const CLOTH_U0 = -1.14;
const CLOTH_U1 = 0.72;
const SCALLOPS = 8;
const SCALLOP = (CLOTH_U1 - CLOTH_U0) / SCALLOPS;
const M_PER_DEG = 0.0135;
const hemV = (u: number) => 1.52 + 0.07 * Math.sqrt(Math.max(0, 1 - (2 * fract((u - CLOTH_U0) / SCALLOP) - 1) ** 2));

const bodyPaint = paint((p, n, s) => {
  const deg = ((s[1] % 360) + 360) % 360;
  const dd = deg > 180 ? 360 - deg : deg;
  const v = dd * M_PER_DEG;
  const u = p.z;
  const eHem = hemV(u) - v;
  const eEnd = Math.min(u - CLOTH_U0, CLOTH_U1 - u);
  const e = Math.min(eHem, eEnd);
  let c: C = glaze(p, n);
  if (e > 0) {
    const along = eHem <= eEnd ? u : v;
    c = ink(c, stroke(e - 0.006, 0.012), 1, p); // hem line
    const dotBand = smoothstep(0.011, 0.014, e) * smoothstep(0.052, 0.048, e);
    c = ink(c, dotBand * (1 - cover(dots(along, e, 0.024), 0.0048)), 0.3, p);
    c = ink(c, stroke(e - 0.056, 0.009), 0.85, p);
    c = ink(c, fret(along, e - 0.066, 0.0165) * smoothstep(0.062, 0.066, e) * smoothstep(0.152, 0.146, e), 0.8, p);
    c = ink(c, stroke(e - 0.162, 0.008), 0.85, p);
    c = ink(c, stroke(e - 0.175, 0.004), 0.5, p);
    if (e > 0.19) {
      const lat = lattice(along, e, 0.11, 0.058);
      c = ink(c, stroke(lat.ring, 0.0065), 0.42, p);
      c = ink(c, cover(lat.centre, 0.007), 0.55, p);
    }
    return c;
  }
  // Bare porcelain: washed hide, and rolling waves along the belly.
  c = skinWash(c, p, 3);
  const rear = smoothstep(-1.372, -1.362, u) * smoothstep(-1.278, -1.288, u);
  if (rear > 0) {
    c = over(c, GLAZE, rear);
    c = ink(c, rear * fret(deg * M_PER_DEG, u + 1.36, 0.015577), 0.85, p);
    c = ink(c, stroke(u + 1.375, 0.008) + stroke(u + 1.262, 0.008), 0.9, p);
  }
  const wv = smoothstep(126, 140, dd);
  if (wv > 0) {
    const w = seigaiha(u, -(dd - 126) * M_PER_DEG, 0.17);
    const dens = 0.9 - 0.55 * smoothstep(128, 150, dd);
    c = over(c, GLAZE, wv);
    c = ink(c, wv * Math.max(w.line, w.fill > 0 ? 0.55 : 0), Math.max(w.line > 0.5 ? dens : 0, w.fill * 1.2), p);
    c = ink(c, wv * stroke(v - 126 * M_PER_DEG - 0.012, 0.011), 0.85, p);
  }
  return c;
});

// ------------------------------------------------------------------------------------------------- Limb paints
const legR = (t: number) => 0.38 - 0.09 * smoothstep(0, 0.85, t) + 0.02 * smoothstep(0.85, 1, t);
const wrapX = (deg: number, r: number, size: number) => {
  const around = Math.max(3, Math.round((2 * Math.PI * r) / size));
  return ((((deg % 360) + 360) % 360) / 360) * around * size;
};

const legPaint = paint((p, n, s) => {
  const y = p.y;
  let c: C = glaze(p, n);
  if (y < 0.63) {
    const x = wrapX(s[1], legR(s[0]), 0.16);
    const w = seigaiha(x, -y, 0.16);
    const dens = 0.95 - 0.55 * smoothstep(0.1, 0.6, y);
    c = ink(c, Math.max(w.line, w.fill > 0 ? 0.5 : 0), Math.max(w.line > 0.5 ? dens : 0, w.fill), p);
    return c;
  }
  c = ink(c, stroke(y - 0.635, 0.012), 0.95, p);
  c = ink(c, stroke(y - 0.652, 0.005), 0.5, p);
  const x = wrapX(s[1], legR(s[0]), 0.099);
  c = ink(c, fret(x, y - 0.672, 0.0165) * smoothstep(0.668, 0.672, y) * smoothstep(0.762, 0.756, y), 0.85, p);
  c = ink(c, stroke(y - 0.782, 0.005), 0.5, p);
  c = ink(c, stroke(y - 0.796, 0.011), 0.9, p);
  if (y > 0.83) {
    c = skinWash(c, p, 8, 0.8);
    const ring = lattice(wrapX(s[1], legR(s[0]), 0.09), y, 0.09, 0.022);
    c = ink(c, stroke(ring.ring, 0.0055) * smoothstep(0.83, 0.9, y) * 0.9, 0.38, p);
    c = ink(c, cover(ring.centre, 0.005) * smoothstep(0.83, 0.9, y), 0.5, p);
  }
  return c;
});

const footPaint = paint((p, n, s) => {
  let c: C = glaze(p, n);
  const rim = n.y > 0.5 ? 0 : 1;
  c = ink(c, smoothstep(0.075, 0.09, p.y) * rim, 0.9, p);
  const groove = Math.abs(fract(wrapX(s[1], 0.32, 0.2) / 0.2) - 0.5);
  return over(c, GLAZE, smoothstep(0.03, 0.02, groove) * smoothstep(0.08, 0.09, p.y) * rim);
});

const TRUNK_POINTS: V3[] = [
  [0, 2.2, 2.15],
  [0, 2.15, 2.55],
  [0, 2.45, 2.9],
  [0, 2.95, 3.0],
  [0, 3.4, 2.88],
  [0, 3.75, 2.62],
  [0, 3.9, 2.34],
  [0, 3.82, 2.12],
];
const TRUNK_LEN = catmull(TRUNK_POINTS).length;
const trunkR = (t: number) => 0.06 + 0.2 * Math.pow(1 - t, 1.2);
const trunkPaint = paint((p, n, s) => {
  const t = s[0];
  const a = t * TRUNK_LEN;
  const r = trunkR(t);
  const deg = ((s[1] % 360) + 360) % 360;
  let c: C = glaze(p, n);
  const wob = 0.006 * Math.sin((deg * Math.PI) / 60);
  const rg = Math.min(fract((a + wob) / 0.07), 1 - fract((a + wob) / 0.07)) * 0.07;
  c = ink(c, cover(rg, 0.0032) * 0.8, 0.28 + 0.2 * noise(p, 0.2, 6), p);
  const x = wrapX(deg, r, 0.066);
  const band = (t0: number, t1: number) => smoothstep(t0, t0 + 0.006, t) * smoothstep(t1, t1 - 0.006, t);
  // Collars: a dark dotted band at the root and below the tip, a fret band at mid-trunk, scrolls between, a dipped tip.
  const b1 = band(0.045, 0.115);
  const b2 = band(0.5, 0.585);
  const b3 = band(0.71, 0.76);
  c = over(c, GLAZE, Math.max(b1, b3));
  c = ink(c, Math.max(b1, b3) * (1 - cover(dots(x, a, 0.036), 0.009)), 0.85, p);
  c = over(c, GLAZE, b2);
  c = ink(c, b2 * fret(x, a - 0.5 * TRUNK_LEN - 0.005, 0.0165), 0.85, p);
  for (const edge of [0.045, 0.115, 0.5, 0.585, 0.71, 0.76])
    c = ink(c, stroke(a - edge * TRUNK_LEN + (edge % 0.1 > 0.05 ? -0.006 : 0.006), 0.007), 0.9, p);
  const zone = smoothstep(0.13, 0.15, t) * smoothstep(0.87, 0.85, t) * (1 - band(0.49, 0.6)) * (1 - band(0.7, 0.77));
  if (zone > 0) {
    const arc = (2 * Math.PI * r) / 360;
    for (const centre of [0, 90, 180, 270]) {
      const vv = (((((deg - centre + 180) % 360) + 360) % 360) - 180) * arc;
      if (Math.abs(vv) > r * 0.78) continue;
      const amp = r * 0.28;
      const sc = scroll(a, vv, 0.3, amp, 0.006 + 0.03 * r);
      c = over(c, GLAZE, zone * sc.leaf * 0.95);
      c = ink(c, zone * Math.max(sc.stem, sc.bud, sc.rim), 0.8, p);
      c = ink(c, zone * sc.leaf * (1 - sc.rim) * 0.5, 0.3, p);
    }
  }
  return ink(c, smoothstep(0.86, 0.95, t), 0.78 + 0.2 * smoothstep(0.93, 1, t), p);
});

const tailPaint = paint((p, n, s) => {
  const t = s[0];
  const k = fract(t * 6);
  const c = ink(glaze(p, n), cover(Math.min(k, 1 - k) / 6, 0.009), 0.6, p);
  return ink(c, smoothstep(0.88, 0.95, t), 0.85, p);
});

const tuskPaint = paint((p, n, s) => {
  const t = s[0];
  let c: C = glaze(p, n);
  c = ink(c, smoothstep(0.1, 0.08, t), 0.9, p);
  c = ink(c, stroke(t - 0.115, 0.02), 0.6, p);
  c = ink(c, stroke(t - 0.3, 0.03), 0.85, p);
  return ink(c, stroke(t - 0.34, 0.012), 0.5, p);
});

/** A spiral cloud head: `x`, `y` from its centre; one arm winding out to radius `R`. */
function swirl(x: number, y: number, R: number, turn: number) {
  const r = Math.hypot(x, y);
  if (r > R) return 0;
  const arm = fract(r / (R * 0.32) - (turn * Math.atan2(y, x)) / (2 * Math.PI));
  return cover(Math.min(arm, 1 - arm) * R * 0.32, R * 0.05) * smoothstep(R, R * 0.9, r);
}

const headPaint = paint((p, n) => {
  let c: C = glaze(p, n);
  c = skinWash(c, p, 12);
  // Trunk-root wrinkles ring the muzzle.
  if (p.z > 1.95) {
    const rg = Math.min(fract(p.z / 0.06), 1 - fract(p.z / 0.06)) * 0.06;
    c = ink(c, cover(rg, 0.004) * smoothstep(1.95, 2.02, p.z), 0.45, p);
  }
  // A ruyi cloud swirl on each cheek.
  const side = Math.sign(p.x);
  if (Math.abs(n.x) > 0.35) {
    const sw = swirl(p.z - 2.0, p.y - 2.1, 0.14, side);
    c = ink(c, sw, 0.7, p);
  }
  return c;
});

const jawPaint = paint((p, n) => {
  let c: C = glaze(p, n);
  c = ink(c, cover(dots(p.x, p.z, 0.05), 0.008), 0.55, p);
  return ink(c, stroke(p.z - 1.78, 0.012), 0.7, p);
});

const cushionPaint = paint((p, n) => {
  const top = n.y > 0.4;
  const lat = lattice(top ? p.x : p.z, top ? p.z : p.y * 1.2, 0.16, 0.09);
  let c: C = ink(glaze(p, n), stroke(lat.ring, 0.007), 0.75, p);
  c = ink(c, cover(lat.centre, 0.009), 0.85, p);
  return ink(c, Math.abs(n.y) < 0.2 && Math.abs(n.z) > 0.9 ? 0.9 : 0, 0.8, p);
});
/** A rope of deep-blue and white twists. */
const ropePaint = (length: number) =>
  paint((p, n, s) => {
    const k = fract((s[0] * length) / 0.09 + s[1] / 360);
    return ink(glaze(p, n), smoothstep(0.62, 0.55, k) + 0.15, 0.85, p);
  });

const beadPaint = (length: number, pitch: number) =>
  paint((p, n, s) => {
    const k = fract((s[0] * length) / pitch);
    return ink(glaze(p, n), smoothstep(0.72, 0.62, k), 0.8, p);
  });

/** A plate with a ruyi / arch outline: border lines and dot band following its edge, lattice or vein inside. */
function plaquePaint(poly: readonly P2[], options: { field: "cloud" | "vein" | "lattice"; band?: number }) {
  const band = options.band ?? 0.036;
  return paint((p, n, s) => {
    const d = polyDist(s[0], s[1], poly);
    let c: C = glaze(p, n);
    if (Math.abs(n.z) < 0.5 && Math.abs(n.y) < 0.5 && Math.abs(n.x) < 0.5) return c;
    c = ink(c, cover(d, 0.012) * 1, 0.95, p);
    const dotBand = smoothstep(0.012, 0.016, d) * smoothstep(band + 0.008, band + 0.004, d);
    c = ink(c, dotBand * (1 - cover(dots(s[0], s[1], 0.022), 0.0046)), 0.32, p);
    c = ink(c, stroke(d - band - 0.008, 0.008), 0.85, p);
    if (options.field === "cloud") {
      const rx = s[0];
      const ry = s[1] - 0.17;
      const r = Math.hypot(rx, ry);
      const arm = fract(r / 0.022 - Math.atan2(ry, rx) / (2 * Math.PI));
      c = ink(
        c,
        cover(Math.min(arm, 1 - arm) * 0.022, 0.0032) *
          smoothstep(0.08, 0.07, r) *
          smoothstep(band + 0.03, band + 0.05, d),
        0.7,
        p,
      );
      c = ink(c, stroke(d - band - 0.04, 0.005), 0.5, p);
    } else if (options.field === "vein") {
      c = ink(c, stroke(s[0], 0.011) * smoothstep(band + 0.02, band + 0.03, d), 0.6, p);
      c = ink(c, stroke(d - band - 0.03, 0.004), 0.4, p);
    } else {
      const lat = lattice(s[0], s[1], 0.075, 0.04);
      c = ink(c, stroke(lat.ring, 0.005) * smoothstep(band + 0.02, band + 0.04, d), 0.42, p);
    }
    return c;
  });
}

// ------------------------------------------------------------------------------------------------- Outlines
const LAPPET = chaikin(
  symmetric([
    [0, 0, "sharp"],
    [0.155, 0, "sharp"],
    [0.16, 0.13],
    [0.14, 0.26],
    [0.095, 0.33],
    [0.045, 0.335],
    [0, 0.44, "sharp"],
  ]),
  1,
);
const ARCH = chaikin(
  symmetric([
    [0, 0, "sharp"],
    [0.1, 0, "sharp"],
    [0.19, 0.16],
    [0.245, 0.34],
    [0.21, 0.52],
    [0.11, 0.63],
    [0, 0.72, "sharp"],
  ]),
  1,
);
const PETAL = chaikin(
  symmetric([
    [0, 0, "sharp"],
    [0.05, 0.05],
    [0.1, 0.18],
    [0.06, 0.32],
    [0, 0.42, "sharp"],
  ]),
  1,
);
const EAR = chaikin(
  [
    [0, 0.2, "sharp"],
    [0.18, 0.36],
    [0.44, 0.4],
    [0.68, 0.32],
    [0.86, 0.13],
    [0.93, -0.12],
    [0.87, -0.38],
    [0.7, -0.61],
    [0.5, -0.77],
    [0.3, -0.75],
    [0.14, -0.58],
    [0.04, -0.36],
    [0, -0.14, "sharp"],
  ],
  2,
);

const lappetPaint = plaquePaint(LAPPET, { field: "cloud" });
const archPaint = plaquePaint(ARCH, { field: "lattice", band: 0.04 });
const petalPaint = plaquePaint(PETAL, { field: "vein", band: 0.02 });

const earPaint = paint((p, n, s) => {
  const [x, y] = s;
  const d = polyDist(x, y, EAR);
  let c: C = glaze(p, n);
  if (Math.abs(n.y) > 0.6 || d < 0.006) return ink(c, 1, 0.85, p);
  if (d < 0) return c;
  c = ink(c, cover(d, 0.013), 0.95, p);
  const dotBand = smoothstep(0.013, 0.017, d) * smoothstep(0.075, 0.07, d);
  c = ink(c, dotBand * (1 - cover(dots(x, y, 0.034), 0.0078)), 0.45, p);
  c = ink(c, stroke(d - 0.08, 0.009), 0.85, p);
  c = ink(c, stroke(d - 0.095, 0.004), 0.5, p);
  // Ribs fan out from the root of the ear, denser toward the rim.
  const ang = Math.atan2(y + 0.05, x + 0.02);
  const rib = Math.abs(fract(ang / 0.13) - 0.5);
  const rad = Math.hypot(x, y);
  c = ink(
    c,
    smoothstep(0.1, 0.04, rib) * smoothstep(0.1, 0.16, d) * smoothstep(0.05, 0.25, rad) * 0.85,
    0.18 + 0.4 * smoothstep(0.1, 0.4, rad),
    p,
  );
  return c;
});

// ------------------------------------------------------------------------------------------------- Drawings (SVG)
const D0 = "#0f2a72";
const D1 = "#1d3f94";
const D2 = "#3f6bc2";
const D3 = "#86a8de";
const D4 = "#bfd2ef";
const D5 = "#e4edf9";
const W = "#f7f9fc";
const f1 = (n: number) => n.toFixed(1);

function crSample(pts: readonly P2[], per = 8): P2[] {
  const q = [pts[0], ...pts, pts[pts.length - 1]];
  const out: P2[] = [];
  for (let i = 1; i < q.length - 2; i++)
    for (let k = 0; k < per; k++) {
      const t = k / per;
      const [p0, p1, p2, p3] = [q[i - 1], q[i], q[i + 1], q[i + 2]];
      const at = (a: 0 | 1) =>
        0.5 *
        (2 * p1[a] +
          (-p0[a] + p2[a]) * t +
          (2 * p0[a] - 5 * p1[a] + 4 * p2[a] - p3[a]) * t * t +
          (-p0[a] + 3 * p1[a] - 3 * p2[a] + p3[a]) * t * t * t);
      out.push([at(0), at(1)]);
    }
  out.push(pts[pts.length - 1]);
  return out;
}

/** Unit normals of a sampled line, dorsal side = (ty, -tx). */
function normals(pts: readonly P2[]): P2[] {
  return pts.map((_p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const c = pts[Math.min(pts.length - 1, i + 1)];
    const tx = c[0] - a[0];
    const ty = c[1] - a[1];
    const l = Math.hypot(tx, ty) || 1;
    return [ty / l, -tx / l];
  });
}

/** A polygon along `pts` between offsets `o0` and `o1` (fractions of radius `r(i)`, dorsal positive). */
function ribbon(pts: readonly P2[], nrm: readonly P2[], r: (i: number) => number, o0: number, o1: number) {
  const top = pts.map((p, i) => `${f1(p[0] + nrm[i][0] * r(i) * o1)} ${f1(p[1] + nrm[i][1] * r(i) * o1)}`);
  const bottom = pts.map((p, i) => `${f1(p[0] + nrm[i][0] * r(i) * o0)} ${f1(p[1] + nrm[i][1] * r(i) * o0)}`).reverse();
  return `M${top.join(" L")} L${bottom.join(" L")} Z`;
}

/** A tapered brush stroke along a line: width `w0` at the start, `w1` at the end, swelling in the middle by `belly`. */
function brush(pts: readonly P2[], w0: number, w1: number, fill: string, belly = 0.4) {
  const nrm = normals(pts);
  const r = (i: number) => {
    const t = i / (pts.length - 1);
    return (w0 + (w1 - w0) * t) * (1 + belly * Math.sin(Math.PI * t)) * 0.5;
  };
  return `<path d="${ribbon(pts, nrm, r, -1, 1)}" fill="${fill}"/>`;
}

function petalPath(len: number, w: number) {
  return `M0 0 C${f1(-0.55 * w)} ${f1(-0.25 * len)} ${f1(-0.62 * w)} ${f1(-0.8 * len)} ${f1(-0.28 * w)} ${f1(-len)} Q${f1(-0.1 * w)} ${f1(-1.07 * len)} 0 ${f1(-0.95 * len)} Q${f1(0.1 * w)} ${f1(-1.07 * len)} ${f1(0.28 * w)} ${f1(-len)} C${f1(0.62 * w)} ${f1(-0.8 * len)} ${f1(0.55 * w)} ${f1(-0.25 * len)} 0 0Z`;
}

/** A peony: four rings of scalloped petals shading from pale rim to dark heart, veined, with a stamen centre. */
function peony(cx: number, cy: number, R: number, rot = 0) {
  const rings = [
    { n: 8, len: R, w: R * 0.66, fill: D5, mid: D4, off: 0 },
    { n: 7, len: R * 0.76, w: R * 0.54, fill: D4, mid: D3, off: 0.5 },
    { n: 6, len: R * 0.52, w: R * 0.42, fill: D3, mid: D2, off: 0.2 },
    { n: 5, len: R * 0.3, w: R * 0.3, fill: D2, mid: D1, off: 0.7 },
  ];
  let g = `<g transform="translate(${f1(cx)} ${f1(cy)}) rotate(${f1(rot)})">`;
  for (const ring of rings)
    for (let k = 0; k < ring.n; k++) {
      const a = ((k + ring.off) / ring.n) * 360;
      g += `<g transform="rotate(${f1(a)})"><path d="${petalPath(ring.len, ring.w)}" fill="${ring.fill}" stroke="${D1}" stroke-width="${f1(R * 0.04)}" stroke-linejoin="round"/>`;
      g += `<path d="${petalPath(ring.len * 0.62, ring.w * 0.66)}" fill="${ring.mid}" opacity="0.75"/>`;
      g += `<path d="M0 ${f1(-ring.len * 0.1)} Q${f1(ring.w * 0.05)} ${f1(-ring.len * 0.5)} 0 ${f1(-ring.len * 0.78)}" fill="none" stroke="${D1}" stroke-width="${f1(R * 0.022)}" stroke-linecap="round"/></g>`;
    }
  g += `<circle r="${f1(R * 0.17)}" fill="${D0}"/>`;
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2;
    g += `<circle cx="${f1(Math.cos(a) * R * 0.24)}" cy="${f1(Math.sin(a) * R * 0.24)}" r="${f1(R * 0.04)}" fill="${D0}"/>`;
  }
  return `${g}<circle r="${f1(R * 0.07)}" fill="${D4}"/></g>`;
}

/** A three-lobed peony leaf pointing up from its stem end, each lobe split into a dark and a light half. */
function leaf(x: number, y: number, len: number, angle: number) {
  const lobe = (l: number, w: number, a: number) => {
    const half = (s: number) =>
      `M0 0 C${f1(s * w * 0.95)} ${f1(-l * 0.22)} ${f1(s * w * 0.8)} ${f1(-l * 0.7)} 0 ${f1(-l)}Z`;
    return `<g transform="rotate(${f1(a)})"><path d="${half(-1)}" fill="${D2}" stroke="${D0}" stroke-width="1" stroke-linejoin="round"/><path d="${half(1)}" fill="${D3}" stroke="${D0}" stroke-width="1" stroke-linejoin="round"/><path d="M0 -${f1(l * 0.08)} L0 -${f1(l * 0.85)}" stroke="${D5}" stroke-width="0.9" stroke-linecap="round"/></g>`;
  };
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(angle)})">${lobe(len * 0.72, len * 0.26, -52)}${lobe(len * 0.72, len * 0.26, 52)}${lobe(len, len * 0.34, 0)}</g>`;
}

const PEONY_SPRAY = svg(
  `<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
    <path d="M60 140 C58 120 66 104 60 80" fill="none" stroke="${D1}" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M62 112 C78 106 92 100 100 88" fill="none" stroke="${D1}" stroke-width="2.4" stroke-linecap="round"/>
    ${leaf(60, 112, 40, -62)}${leaf(60, 100, 38, 58)}${leaf(60, 60, 44, -100)}${leaf(60, 60, 44, 100)}${leaf(60, 58, 46, -150)}${leaf(60, 58, 46, 150)}${leaf(60, 60, 42, -20)}${leaf(60, 60, 42, 30)}
    ${leaf(100, 88, 24, 36)}${leaf(100, 88, 22, 110)}
    ${peony(60, 52, 36, 12)}
    ${peony(100, 84, 13, -20)}
    <circle cx="20" cy="112" r="2.6" fill="${D2}"/><circle cx="14" cy="98" r="1.8" fill="${D3}"/><circle cx="102" cy="126" r="2.2" fill="${D2}"/>
  </svg>`,
  { size: 384 },
);

function cloud(cx: number, cy: number, s: number, flip = 1) {
  const spiral = (r0: number, r1: number, turns: number, sgn: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 28; i++) {
      const t = i / 28;
      const a = t * turns * Math.PI * 2;
      const r = r0 + (r1 - r0) * (1 - t);
      pts.push(`${f1(Math.cos(a) * r * sgn)},${f1(Math.sin(a) * r)}`);
    }
    return pts.join(" ");
  };
  return `<g transform="translate(${f1(cx)} ${f1(cy)}) scale(${f1(s * flip)} ${f1(s)})" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="${spiral(1.5, 9, 1.6, 1)}" stroke="${D2}" stroke-width="2.4"/>
    <path d="M9 -1 C16 -6 24 -4 26 1 C29 -6 38 -4 39 2 C41 -3 46 -1 47 3" stroke="${D2}" stroke-width="2.2"/>
    <path d="M-8 10 C0 15 12 15 20 10 C28 14 34 12 38 8" stroke="${D3}" stroke-width="1.8"/>
    <polyline points="${spiral(1, 5, 1.3, -1)
      .split(" ")
      .map((q) => q.replace(/^(-?[\d.]+),/, (_m, x) => `${f1(parseFloat(x) + 22)},`))
      .join(" ")}" stroke="${D3}" stroke-width="1.8" transform="translate(0 4)"/>
  </g>`;
}

function dragonSvg() {
  const spine = crSample(
    [
      [70, 62],
      [92, 44],
      [122, 38],
      [150, 52],
      [160, 78],
      [148, 102],
      [122, 110],
      [98, 104],
      [80, 116],
      [62, 126],
    ],
    7,
  );
  const nrm = normals(spine);
  const N = spine.length - 1;
  const r = (i: number) => 1 + 8.6 * (1 - 0.9 * Math.pow(i / N, 1.25)) * (1 + 0.15 * Math.sin((i / N) * 9));
  let g = "";
  // pearl in the middle of the coil, with flame tongues
  g += `<g transform="translate(112 74)">`;
  for (let k = 0; k < 8; k++)
    g += `<g transform="rotate(${k * 45})"><path d="M0 -10 C-2.5 -14 -1 -18 1.5 -22 C3 -18 5 -14 0 -10Z" fill="${D3}" stroke="${D1}" stroke-width="0.8"/></g>`;
  g += `<circle r="10" fill="${D5}" stroke="${D0}" stroke-width="1.5"/><path d="M-5.5 -2.5 A6.5 6.5 0 0 1 2.5 -6.5" fill="none" stroke="${D2}" stroke-width="2" stroke-linecap="round"/><circle cx="-2.5" cy="-3.5" r="2" fill="${W}"/></g>`;
  g += cloud(16, 118, 0.9) + cloud(176, 130, 0.7, -1) + cloud(96, 16, 0.8) + cloud(24, 70, 0.55);
  // flame tail
  const tail = spine.slice(-1)[0];
  for (const [dx, dy] of [
    [-16, 8],
    [-6, 16],
    [-24, -2],
    [4, 20],
  ] as const) {
    const cp: P2[] = [
      [tail[0], tail[1]],
      [tail[0] + dx * 0.5 + 2, tail[1] + dy * 0.4 - 6],
      [tail[0] + dx, tail[1] + dy],
    ];
    g += brush(crSample(cp, 6), 5, 0.5, D3, 0.2).replace("/>", ` stroke="${D1}" stroke-width="0.7"/>`);
  }
  // legs
  for (const [i, sgn] of [
    [Math.round(N * 0.24), 1],
    [Math.round(N * 0.34), -1],
    [Math.round(N * 0.66), 1],
    [Math.round(N * 0.76), -1],
  ] as const) {
    const p = spine[i];
    const nn = nrm[i];
    const t: P2 = [-nn[1], nn[0]];
    const base: P2 = [p[0] - nn[0] * r(i) * 0.8, p[1] - nn[1] * r(i) * 0.8];
    const knee: P2 = [base[0] - nn[0] * 6 + t[0] * 4 * sgn, base[1] - nn[1] * 6 + t[1] * 4 * sgn];
    const paw: P2 = [knee[0] - nn[0] * 4.5 - t[0] * 2 * sgn, knee[1] - nn[1] * 4.5 - t[1] * 2 * sgn];
    g += brush(crSample([base, knee, paw], 5), 5.2, 3.2, D2, 0.1).replace("/>", ` stroke="${D0}" stroke-width="1"/>`);
    for (const k of [-1, 0, 1]) {
      const tip: P2 = [paw[0] - nn[0] * 4 + t[0] * k * 3, paw[1] - nn[1] * 4 + t[1] * k * 3];
      g += `<path d="M${f1(paw[0])} ${f1(paw[1])} Q${f1(tip[0] + t[0] * k)} ${f1(tip[1] + t[1] * k)} ${f1(tip[0] - nn[0] * 1.2 + t[0] * k * 1.5)} ${f1(tip[1] - nn[1] * 1.2 + t[1] * k * 1.5)}" fill="none" stroke="${D0}" stroke-width="1.6" stroke-linecap="round"/>`;
    }
  }
  // dorsal spines
  for (let i = Math.round(N * 0.1); i < N * 0.92; i += 3) {
    const p = spine[i];
    const nn = nrm[i];
    const tx = spine[Math.min(N, i + 1)][0] - spine[Math.max(0, i - 1)][0];
    const ty = spine[Math.min(N, i + 1)][1] - spine[Math.max(0, i - 1)][1];
    const l = Math.hypot(tx, ty) || 1;
    const rr = r(i);
    const a: P2 = [p[0] + nn[0] * rr * 0.9 - (tx / l) * 2.2, p[1] + nn[1] * rr * 0.9 - (ty / l) * 2.2];
    const c: P2 = [p[0] + nn[0] * rr * 0.9 + (tx / l) * 2.2, p[1] + nn[1] * rr * 0.9 + (ty / l) * 2.2];
    const tip: P2 = [p[0] + nn[0] * (rr + 6.5) + (tx / l) * 2.5, p[1] + nn[1] * (rr + 6.5) + (ty / l) * 2.5];
    g += `<path d="M${f1(a[0])} ${f1(a[1])} L${f1(tip[0])} ${f1(tip[1])} L${f1(c[0])} ${f1(c[1])}Z" fill="${D1}" stroke="${D0}" stroke-width="0.6" stroke-linejoin="round"/>`;
  }
  // the body: dark outline, mid-blue back, pale belly plates, scale chevrons
  g += `<path d="${ribbon(spine, nrm, (i) => r(i) + 1.1, -1, 1)}" fill="${D0}"/>`;
  g += `<path d="${ribbon(spine, nrm, r, -1, 1)}" fill="${D2}"/>`;
  g += `<path d="${ribbon(spine, nrm, r, -0.95, -0.3)}" fill="${D5}"/>`;
  for (let i = 1; i < N; i += 2) {
    const p = spine[i];
    const nn = nrm[i];
    const rr = r(i);
    g += `<path d="M${f1(p[0] - nn[0] * rr * 0.95)} ${f1(p[1] - nn[1] * rr * 0.95)} L${f1(p[0] - nn[0] * rr * 0.3)} ${f1(p[1] - nn[1] * rr * 0.3)}" stroke="${D2}" stroke-width="0.8"/>`;
  }
  for (let i = 2; i < N; i += 2) {
    const p = spine[i];
    const nn = nrm[i];
    const rr = r(i);
    const t: P2 = [-nn[1], nn[0]];
    const c = 1.9 + rr * 0.11;
    g += `<path d="M${f1(p[0] + nn[0] * rr * 0.62 - t[0] * c)} ${f1(p[1] + nn[1] * rr * 0.62 - t[1] * c)} Q${f1(p[0] + nn[0] * rr * 0.12)} ${f1(p[1] + nn[1] * rr * 0.12)} ${f1(p[0] + nn[0] * rr * 0.62 + t[0] * c)} ${f1(p[1] + nn[1] * rr * 0.62 + t[1] * c)}" fill="none" stroke="${D4}" stroke-width="1.1" stroke-linecap="round"/>`;
  }
  // mane: two flame ribbons streaming back along the neck
  for (const [dy, w] of [
    [-12, 6],
    [-6, 5],
  ] as const) {
    const st: P2 = [72, 62 + dy];
    g += brush(
      crSample([st, [st[0] + 16, st[1] - 14], [st[0] + 34, st[1] - 16], [st[0] + 50, st[1] - 8]], 6),
      w,
      0.6,
      D1,
      0.3,
    );
  }
  // head, facing left
  g += `<g transform="translate(70 62)" stroke-linejoin="round" stroke-linecap="round">
    <path d="M6 9 C-8 10 -22 9 -37 9 C-45 9 -47 15 -39 17.5 C-26 20 -10 19 3 17Z" fill="${D2}" stroke="${D0}" stroke-width="1.5"/>
    <path d="M-8 4 C-22 3 -34 3 -40 4.5 C-41 7 -39 9 -37 9 C-22 9 -8 9 6 9Z" fill="${D0}"/>
    <path d="M-10 8 C-20 5 -28 7 -34 8 C-28 10 -18 10 -10 8Z" fill="${D3}"/>
    <path d="M-28 9 l1.6 -4 l1.6 4z M-16 9 l1.6 -4 l1.6 4z" fill="${W}"/>
    <path d="M8 4 C8 -4 8 -8 4 -12 C-2 -18 -12 -18 -18 -12 C-26 -10 -36 -10 -43 -5 C-48 -2 -46 4 -40 4.5 C-30 3 -18 3 -8 4Z" fill="${D2}" stroke="${D0}" stroke-width="1.5"/>
    <path d="M-14 3.5 l2 4.5 l2 -4.5z M-22 3.5 l2 4.5 l2 -4.5z M-30 3.5 l2 4.5 l2 -4.5z M-37 4 l1.8 4 l1.8 -4z" fill="${W}" stroke="${D0}" stroke-width="0.5"/>
    <path d="M-30 -8 C-24 -6 -22 -3 -24 0" fill="none" stroke="${D4}" stroke-width="1.6"/>
    <circle cx="-41" cy="-2.5" r="1.5" fill="${D0}"/>
    <path d="M-22 -12 Q-15 -17 -8 -11" fill="none" stroke="${D0}" stroke-width="2.8"/>
    <path d="M-19 -7 Q-14 -11 -9 -7 Q-14 -4 -19 -7Z" fill="${W}" stroke="${D0}" stroke-width="1"/>
    <circle cx="-13.5" cy="-7" r="2" fill="${D0}"/>
    ${brush(
      crSample(
        [
          [2, -13],
          [8, -24],
          [20, -30],
          [34, -27],
        ],
        6,
      ),
      4.8,
      0.8,
      D0,
      0.2,
    )}
    ${brush(
      crSample(
        [
          [14, -27],
          [18, -34],
          [24, -40],
        ],
        5,
      ),
      3,
      0.5,
      D0,
      0.1,
    )}
    ${brush(
      crSample(
        [
          [-3, -14],
          [0, -26],
          [8, -33],
        ],
        5,
      ),
      3.6,
      0.6,
      D1,
      0.2,
    )}
    <path d="M-44 1 C-58 4 -64 16 -60 30" fill="none" stroke="${D1}" stroke-width="1.4"/>
    <path d="M-45 -3 C-62 -5 -68 -16 -64 -28" fill="none" stroke="${D1}" stroke-width="1.4"/>
    <path d="M-30 18 C-32 26 -28 30 -24 32 C-22 26 -22 21 -20 18Z" fill="${D3}" stroke="${D0}" stroke-width="0.9"/>
  </g>`;
  return `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">${g}</svg>`;
}
const DRAGON = svg(dragonSvg(), { size: 640 });

/** The brow medallion: a bead ring, lotus petals and a peony on a wash ground. */
function medallionSvg() {
  let g = `<circle cx="50" cy="50" r="49" fill="${W}"/><circle cx="50" cy="50" r="47.5" fill="none" stroke="${D0}" stroke-width="2.4"/>`;
  for (let k = 0; k < 28; k++) {
    const a = (k / 28) * Math.PI * 2;
    g += `<circle cx="${f1(50 + Math.cos(a) * 43.5)}" cy="${f1(50 + Math.sin(a) * 43.5)}" r="2.1" fill="${D1}"/>`;
  }
  g += `<circle cx="50" cy="50" r="39.5" fill="none" stroke="${D1}" stroke-width="1.6"/><circle cx="50" cy="50" r="38" fill="${D5}"/>`;
  for (let k = 0; k < 12; k++)
    g += `<g transform="translate(50 50) rotate(${k * 30})"><g transform="translate(0 -22)"><path d="${petalPath(16, 11)}" fill="${W}" stroke="${D1}" stroke-width="1.2" stroke-linejoin="round"/></g></g>`;
  g += `<circle cx="50" cy="50" r="21" fill="${W}" stroke="${D0}" stroke-width="1.8"/>${peony(50, 50, 18, 8)}`;
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${g}</svg>`;
}
const MEDALLION = svg(medallionSvg(), { size: 384 });

/** A hem tassel: knob at the bottom (where it hangs from), fringe streaming up (hangs down when placed). */
const TASSEL = svg(
  `<svg viewBox="0 0 24 64" xmlns="http://www.w3.org/2000/svg">
    ${Array.from({ length: 13 }, (_, k) => `<path d="M${f1(2.5 + k * 1.6)} ${f1(1 + (k % 3) * 2.5)} Q${f1(3.5 + k * 1.5)} 24 ${f1(6.5 + k * 0.92)} 42" fill="none" stroke="${k % 3 === 1 ? D3 : k % 3 === 2 ? D2 : D1}" stroke-width="${k % 2 ? 0.9 : 1.2}" stroke-linecap="round"/>`).join("")}
    <path d="M5 40 L19 40 L17 47 L7 47Z" fill="${D1}"/>
    <path d="M7 43.5 L17 43.5" stroke="${D5}" stroke-width="0.9"/>
    <circle cx="12" cy="54" r="7.4" fill="${D2}" stroke="${D0}" stroke-width="1.4"/>
    <path d="M7 51 L17 57 M7 57 L17 51" stroke="${D5}" stroke-width="1"/>
    <rect x="9.5" y="60" width="5" height="4" fill="${D0}"/>
  </svg>`,
  { size: 192 },
);

/** The tail tuft: brush strokes fanning from the root (bottom) to the ends. */
const TUFT = svg(
  `<svg viewBox="0 0 40 90" xmlns="http://www.w3.org/2000/svg">
    ${Array.from({ length: 15 }, (_, k) => {
      const t = (k - 7) / 7;
      return `<path d="M20 90 C${f1(20 + t * 3)} 62 ${f1(20 + t * 14)} 36 ${f1(20 + t * 17 + Math.sin(k * 2.3) * 2)} ${f1(3 + (k % 4) * 3)}" fill="none" stroke="${k % 3 === 0 ? D1 : k % 3 === 1 ? D2 : D3}" stroke-width="${k % 2 ? 1 : 1.5}" stroke-linecap="round"/>`;
    }).join("")}
  </svg>`,
  { size: 192 },
);

// ------------------------------------------------------------------------------------------------- Build
export default function build() {
  const b = createBuilder({ name: "porcelainElephant", paintSize: 2048 });
  const random = rng(31);

  // ---- Skeleton, body and neck
  const hips = b.joint("hips", { at: [0, CY, -0.85], role: "spine", group: "body" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, CY, -0.85],
      [0, CY, -0.2],
      [0, CY + 0.02, 0.4],
      [0, CY + 0.06, 0.95],
    ]),
    { parent: hips, count: 3, names: ["spine1", "spine2", "chest"], role: "spine", group: "body" },
  );
  const neckCurve = catmull([
    [0, CY + 0.06, 0.95],
    [0, CY + 0.14, 1.25],
    [0, CY + 0.24, 1.5],
  ]);
  const neck = b.chain("neck", neckCurve, {
    parent: spine.joints[2],
    count: 2,
    names: ["neck1", "neck2"],
    role: "neck",
    group: "body",
  });
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: neckCurve.at(1),
    dir: [0, -0.05, 1],
    role: "head",
    group: "head",
  });

  const bodyPath = catmull(BODY.map((st) => st.at));
  const body = b.loft(BODY, {
    bone: [hips, spine, neck],
    color: bodyPaint,
    sides: 14,
    caps: { start: "round", end: "round" },
    group: "body",
    name: "barrel",
  });
  const skin = b.surface(body);
  const tOfZ = (z: number) => bodyPath.closestT([0, barrel(z).cy, z]);

  // ---- Head
  const skull = b.loft(
    [
      { at: [0, 2.45, 1.2], w: 0.98, h: 1.28 },
      { at: [0, 2.52, 1.58], w: 1.06, h: 1.28 },
      { at: [0, 2.36, 2.0], w: 0.84, h: 1.02 },
      { at: [0, 2.2, 2.28], w: 0.52, h: 0.7 },
    ],
    { bone: head, color: headPaint, sides: 14, group: "head", name: "skull" },
  );
  for (const s of [1, -1])
    b.part(new SphereGeometry(0.31, b.segments(12), b.segments(8)), headPaint, {
      bone: head,
      at: [s * 0.23, 2.9, 1.55],
      scale: [1, 0.82, 1.1],
      group: "head",
      name: "dome",
    });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.02, 1.8], aim: [0, 1.92, 2.2], role: "jaw", group: "jaw" });
  b.frustumBox([0, 2.0, 1.82], [0, 1.92, 2.22], [0.56, 0.22], [0.34, 0.16], {
    bone: jaw,
    color: jawPaint,
    group: "jaw",
    name: "jaw",
  });

  // Eyes: cobalt dabs in a ring of paint.
  const skullSkin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skullSkin.around([0, 2.42, 1.92]).at(s * 84, 4);
    if (hit) {
      b.stick(new SphereGeometry(0.075, 7, 5), GLAZE, hit, { embed: 0.55, group: "head", name: "eyeWhite" });
      b.stick(new SphereGeometry(0.055, 6, 4), B5, hit.moved([0, 0.065, 0]), {
        embed: 0.3,
        group: "head",
        name: "eye",
      });
    }
  }
  // Peony sprays on the cheeks.
  for (const s of [1, -1]) {
    const hit = skullSkin.ray([s * 2, 2.06, 1.66], [-s, 0, 0]);
    if (hit)
      b.cards([hit], PEONY_SPRAY, {
        size: [0.26, 0.3],
        lean: 90,
        flow: [0, 1, 0],
        bend: 30,
        mirror: true,
        sink: 0,
        bone: head,
        group: "head",
        name: "cheekPeony",
      });
  }

  // ---- Trunk, raised: a chain that rises from the brow in an S and curls its tip back.
  const trunk = b.chain("trunk", catmull(TRUNK_POINTS), {
    parent: head,
    count: 8,
    names: ["trunk1", "trunk2", "trunk3", "trunk4", "trunk5", "trunk6", "trunk7", "trunk8"],
    role: "tentacle",
    group: "trunk",
  });
  b.sweep(trunk, trunkR, {
    color: trunkPaint,
    sides: 12,
    caps: { start: "flat", end: "round" },
    group: "trunk",
    name: "trunk",
  });

  // Tusks: short, curved, with cobalt bands.
  for (const s of [1, -1])
    b.sweep(bezier([s * 0.28, 1.98, 2.12], [s * 0.42, 1.8, 2.46], [s * 0.4, 2.12, 2.9]), [0.085, 0.014], {
      bone: head,
      color: tuskPaint,
      sides: 8,
      caps: { start: "flat", end: "point" },
      group: "head",
      name: "tusk",
    });

  // ---- Ears
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const ear = b.joint(`ear${side}`, {
      parent: head,
      at: [s * 0.46, 2.8, 1.45],
      dir: [s * 0.55, -0.1, -0.83],
      role: "hinge",
      group: `ear${side}`,
    });
    const part = b.extrude(EAR, {
      at: ear,
      x: [s * 0.57, 0, -0.82],
      y: [0, 1, 0],
      thickness: [0.03, 0.02],
      bevel: 0.007,
      detail: 0.34,
      color: earPaint,
      bone: ear,
      group: `ear${side}`,
      name: "ear",
    });
    const outward = new Vector3(s * 0.82, 0, 0.57);
    b.cards([frame(part.local([0.5, -0.32, 0]).addScaledVector(outward, 0.017), outward)], PEONY_SPRAY, {
      size: [0.46, 0.54],
      lean: 90,
      flow: [0, 1, 0],
      mirror: true,
      sink: 0,
      bone: ear,
      group: `ear${side}`,
      name: "earPeony",
    });
  }

  // ---- Legs
  const legs: Record<string, Sweep> = {};
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    for (const [name, z, parent, joints, hipY] of [
      ["front", 0.85, spine.joints[2], [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `frontFoot${side}`], 1.75],
      ["hind", -0.85, hips, [`hip${side}`, `knee${side}`, `ankle${side}`, `hindFoot${side}`], 1.8],
    ] as const) {
      const x = s * 0.48;
      const chain = b.chain(
        `${name}Leg${side}`,
        catmull([
          [x, hipY, z],
          [x, 1.08, z + (name === "hind" ? 0.1 : 0.02)],
          [x, 0.55, z + 0.03],
          [x, 0.26, z + 0.02],
          [x, 0.17, z + 0.05],
        ]),
        { parent, names: [...joints], role: "leg", contact: [x, 0, z + 0.05], group: `${name}Leg${side}` },
      );
      legs[`${name}${side}`] = b.sweep(chain, legR, {
        color: legPaint,
        sides: 12,
        caps: { start: "round", end: "flat" },
        group: `${name}Leg${side}`,
        name: "leg",
      });
      const foot = chain.joints[3];
      b.lathe(
        [
          [0, 0],
          [0.32, 0],
          [0.35, 0.05],
          [0.335, 0.12],
          [0.3, 0.185],
          [0, 0.185],
        ],
        { at: [x, 0, z + 0.05], bone: foot, color: footPaint, segments: 12, group: `${name}Leg${side}`, name: "foot" },
      );
      for (let k = 0; k < 4; k++) {
        const a = (k - 1.5) * 0.42;
        b.part(new SphereGeometry(0.085, 6, 4), B2, {
          bone: foot,
          at: [x + Math.sin(a) * 0.325, 0.08, z + 0.05 + Math.cos(a) * 0.325],
          dir: [Math.sin(a), 0, Math.cos(a)],
          scale: [1, 0.62, 0.55],
          group: `${name}Leg${side}`,
          name: "toenail",
        });
      }
      b.part(new TorusGeometry(0.315, 0.03, 5, 14), B4, {
        bone: chain.joints[2],
        at: [x, 0.64, z + 0.03],
        dir: [0, 1, 0],
        axis: "z",
        group: `${name}Leg${side}`,
        name: "anklet",
      });
    }
  }

  // ---- Tail: a rope with a tuft.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 2.05, -1.5],
      [0, 1.86, -1.72],
      [0, 1.5, -1.78],
      [0, 1.2, -1.78],
      [0, 1.0, -1.76],
      [0, 0.92, -1.75],
    ]),
    { parent: hips, count: 5, names: ["tail1", "tail2", "tail3", "tail4", "tail5"], role: "tail", group: "tail" },
  );
  b.sweep(tail, (t) => 0.075 - 0.038 * t, { color: tailPaint, sides: 8, group: "tail", name: "tail" });
  b.cards(
    [0, 1, 2, 3].map(() => frame(tail.at(0.985), [0, 1, 0])),
    TUFT,
    {
      size: [0.34, 0.6],
      lean: 165,
      flow: (_f, i) => [Math.cos(i * 1.57), 0, Math.sin(i * 1.57)],
      bend: 10,
      cross: true,
      vary: 0.1,
      rng: random,
      sink: 0.05,
      group: "tail",
      name: "tuft",
    },
  );

  // A medallion on the rump, above the tail, faces backward.
  const rump = skin.ray([0, 2.42, -3], [0, 0, 1]);
  if (rump) {
    const n = rump.axis.clone().normalize();
    b.part(new CircleGeometry(0.27, 20), "#ffffff", {
      bone: hips,
      at: rump.at.clone().addScaledVector(n, 0.014),
      dir: n,
      axis: "z",
      up: [0, 1, 0],
      texture: MEDALLION,
      group: "body",
      name: "rumpMedallion",
    });
  }

  // ---- Saddle cloth: hem tassels and the dragon panels
  const tassels: SweepPoint[] = [];
  for (const s of [1, -1]) {
    for (let k = 0; k < SCALLOPS; k++) {
      const u = CLOTH_U0 + SCALLOP * (k + 0.5);
      tassels.push(body.at(tOfZ(u), s > 0 ? 360 - hemV(u) / M_PER_DEG : hemV(u) / M_PER_DEG, 0.004));
    }
  }
  b.cards(tassels, TASSEL, {
    size: [0.11, 0.3],
    lean: 90,
    flow: [0, -1, 0],
    bend: 22,
    sink: 0,
    group: "cloth",
    name: "tassel",
  });
  for (const s of [1, -1]) {
    const z = -0.08;
    const bar = barrel(z);
    const hit = skin.ray([s * 2, bar.cy - 0.1, z], [-s, 0, 0]);
    if (hit)
      b.cards([hit], DRAGON, {
        size: [1.08, 0.81],
        lean: 90,
        flow: [0, 1, 0],
        bend: 60,
        mirror: s > 0,
        sink: 0,
        group: "cloth",
        name: "dragon",
      });
  }

  // Peony sprays on the legs.
  for (const key of Object.keys(legs)) {
    const s = key.endsWith("L") ? 1 : -1;
    const leg = legs[key];
    const cz = key.startsWith("front") ? 0.87 : -0.78;
    const hit = b.surface(leg).ray([s * 2, 1.05, cz], [-s, 0, 0]);
    if (hit)
      b.cards([hit], PEONY_SPRAY, {
        size: [0.26, 0.3],
        lean: 90,
        flow: [0, 1, 0],
        mirror: s > 0,
        sink: 0,
        group: "legs",
        name: "legPeony",
      });
  }

  // ---- Saddle cushion and the harness ropes
  b.loft(
    [
      { at: [0, 2.86, -0.62], w: 0.8, h: 0.3 },
      { at: [0, 2.9, -0.2], w: 1.1, h: 0.34 },
      { at: [0, 2.9, 0.3], w: 1.1, h: 0.34 },
      { at: [0, 2.86, 0.62], w: 0.8, h: 0.3 },
    ],
    { bone: [spine], color: cushionPaint, sides: 10, group: "cloth", name: "cushion" },
  );
  for (const z of [-0.75, 0.6]) {
    const bar = barrel(z);
    const ring: V3[] = Array.from({ length: 16 }, (_, k) => {
      const a = (k / 16) * Math.PI * 2;
      return [Math.sin(a) * bar.a * 1.05, bar.cy + Math.cos(a) * bar.b * 1.05, z] as const;
    });
    const loop = skin.drape(catmull(ring, { closed: true }), { lift: 0.02 });
    b.sweep(loop, 0.032, {
      bone: z < 0 ? spine.joints[0] : spine.joints[2],
      color: ropePaint(loop.length),
      sides: 6,
      group: "cloth",
      name: "girth",
    });
  }

  // ---- Headdress: the ruyi cloud collar of lappets over the shoulders, a frontlet with a medallion, a lotus crest.
  const cz = 1.08;
  const centre = new Vector3(0, barrel(cz).cy, cz);
  const ringHits: Hit[] = [];
  let travelled = 0;
  let last: Vector3 | null = null;
  for (let phi = 0; phi <= 136; phi += 2) {
    for (const s of phi === 0 ? [1] : [1, -1]) {
      const hit = skin.ray(
        [centre.x + s * Math.sin(phi * 0.01745) * 2, centre.y + Math.cos(phi * 0.01745) * 2, cz],
        [-s * Math.sin(phi * 0.01745), -Math.cos(phi * 0.01745), 0],
      );
      if (!hit) continue;
      if (s === 1) {
        travelled += last ? hit.at.distanceTo(last) : 0;
        last = hit.at.clone();
        if (phi === 0 || travelled >= 0.29) {
          travelled = 0;
          ringHits.push(hit);
          const mirrorHit = phi
            ? skin.ray(
                [-Math.sin(phi * 0.01745) * 2, centre.y + Math.cos(phi * 0.01745) * 2, cz],
                [Math.sin(phi * 0.01745), -Math.cos(phi * 0.01745), 0],
              )
            : null;
          if (mirrorHit) ringHits.push(mirrorHit);
        }
      }
    }
  }
  for (const hit of ringHits) {
    const n = hit.axis.clone().normalize();
    const yDir = new Vector3(0, 0, -1);
    const xDir = new Vector3().crossVectors(yDir, n).normalize();
    b.extrude(LAPPET, {
      at: hit.at.clone().addScaledVector(n, -0.008),
      x: xDir,
      y: yDir,
      thickness: 0.026,
      bevel: 0.006,
      detail: 0.34,
      color: lappetPaint,
      bone: hit.bone ?? undefined,
      group: "collar",
      name: "lappet",
    });
  }
  const collarLine = catmull(
    ringHits
      .slice()
      .sort((p, q) => Math.atan2(p.at.x, p.at.y - centre.y) - Math.atan2(q.at.x, q.at.y - centre.y))
      .map((h) => h.at.clone().addScaledVector(h.axis, 0.012)),
  );
  b.sweep(collarLine, 0.034, {
    bone: spine.joints[2],
    color: beadPaint(collarLine.length, 0.07),
    sides: 6,
    group: "collar",
    name: "collarBeads",
  });

  // Frontlet plate, medallion and crest on the brow.
  const brow = skullSkin.around([0, 2.34, 1.7]).at(0, 44);
  if (brow) {
    const n = brow.axis.clone().normalize();
    const yDir = new Vector3(0, 1, -0.2).addScaledVector(n, -new Vector3(0, 1, -0.2).dot(n)).normalize();
    b.extrude(ARCH, {
      at: brow.at.clone().addScaledVector(yDir, -0.34).addScaledVector(n, -0.01),
      x: [1, 0, 0],
      y: yDir,
      thickness: 0.03,
      bevel: 0.007,
      detail: 0.34,
      color: archPaint,
      bone: head,
      group: "headdress",
      name: "frontlet",
    });
    const med = brow.at.clone().addScaledVector(yDir, 0.06).addScaledVector(n, 0.02);
    b.part(new CircleGeometry(0.19, 20), "#ffffff", {
      bone: head,
      at: med,
      dir: n,
      axis: "z",
      up: yDir,
      texture: MEDALLION,
      group: "headdress",
      name: "medallion",
    });
  }
  const crown = skullSkin.around([0, 2.4, 1.5]).at(0, 82);
  if (crown)
    for (let k = -2; k <= 2; k++) {
      const a = k * 0.42;
      b.extrude(PETAL, {
        at: crown.at.clone().add(new Vector3(0, -0.03, 0.02)),
        x: [Math.cos(a), -Math.sin(a), 0],
        y: [Math.sin(a), Math.cos(a), 0],
        thickness: 0.025,
        bevel: 0.005,
        detail: 0.34,
        color: petalPaint,
        bone: head,
        group: "headdress",
        name: "crest",
      });
    }
  for (const s of [1, -1]) {
    b.cards([frame([s * 0.5, 2.36, 1.5], [0, 1, 0])], TASSEL, {
      size: [0.13, 0.34],
      lean: 172,
      flow: [s, 0, 0],
      sink: 0,
      bone: head,
      group: "headdress",
      name: "earTassel",
    });
  }

  b.pose(jaw, { axis: [1, 0, 0], deg: 6 });
  return b.root;
}
