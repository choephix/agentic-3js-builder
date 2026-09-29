// JRPG cockatrice: a random-encounter monster from a 1994 16-bit RPG, built in 3D. One texel size (1.2 cm) runs
// through the whole model. Every surface is a five-step ramp (outline, shadow, base, light, highlight) quantised into
// hard square cells: gold and orange feather scallops with a dark outline under every feather tip, brick-laid teal
// scales on the serpent tail, legs and wing bones, a violet wing membrane with an outlined rim, and a comb and
// wattles whose paint is drawn from their own outline (dark border, lit top edge, shaded bottom edge, pebbled
// inside). Eyes, ear lobes and nostrils are 5x5..7x7 `svg()` pixel decals; feathers are 8x11..10x52 pixel sprites
// with their own outlines on cards (chest puff, neck hackle, wing feathers on joints, arched tail plumes).
import { PlaneGeometry, Vector3 } from "three";
import type { Texture } from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { rng } from "../src/math";
import { paint } from "../src/paint";
import { bezier, catmull, polyline } from "../src/path";
import { svg } from "../src/texture";
import type { Chain, Joint } from "../src/skeleton";
import type { Surface } from "../src/surface";

export const meta = {
  name: "JRPG cockatrice",
  description:
    "A 16-bit SNES JRPG monster sprite in 3D: rooster head with a huge outlined comb, wattles and an openable beak, dragon wings with feather joints, puffed chest feathers, a scaly serpent tail and clawed legs. Five-step ramps, hard cells, pixel decals.",
  builtBy: "Claude Sonnet 5.5",
};

type V3 = [number, number, number];
type Ramp = readonly [string, string, string, string, string];

// ---------------------------------------------------------------------------------------------------------------
// Palette: each ramp runs outline, shadow, base, light, highlight.

const GOLD: Ramp = ["#3b1a08", "#8a3f0c", "#d9821a", "#ffc23a", "#fff3a6"];
const ORANGE: Ramp = ["#3a0a10", "#7a1424", "#c8321e", "#f26a26", "#ffb04a"];
const CREAM: Ramp = ["#3b2210", "#a06a3c", "#d8a870", "#f4d9a0", "#fff6d8"];
const TEAL: Ramp = ["#0a1f2a", "#12525a", "#1f8f86", "#4ed0a0", "#c2fbd0"];
const PLATE: Ramp = ["#1e2a10", "#5a6a20", "#a0b040", "#d8e070", "#fbffb0"];
const VIOLET: Ramp = ["#1a0b33", "#3d1f78", "#6a38c0", "#a06af0", "#e2c4ff"];
const RED: Ramp = ["#3a0616", "#8f1030", "#dc1e3c", "#ff5a54", "#ffc4a8"];
const SKINRED: Ramp = ["#3a0a12", "#8a1a2a", "#c93a3a", "#ee6a5a", "#ffb8a0"];
const BEAK: Ramp = ["#3d2008", "#b86a10", "#f0a820", "#ffd84a", "#fff7b0"];
const MOUTH: Ramp = ["#1a0610", "#4a0f24", "#7a1a34", "#a83050", "#d8607a"];
const BONE: Ramp = ["#2a2018", "#7a6a50", "#c8b890", "#f0e6c8", "#ffffff"];
const INK = "#1a0f24";

// ---------------------------------------------------------------------------------------------------------------
// Cells and shading

const CELL = 0.012;
const LIGHT = new Vector3(-0.4, 0.8, 0.45).normalize();
/** The baked shading step of a face: 1 shadow, 2 base, 3 light. */
const tone = (n: Vector3) => {
  const d = n.dot(LIGHT);
  return d > 0.5 ? 3 : d > -0.15 ? 2 : 1;
};
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const mod = (a: number, n: number) => ((a % n) + n) % n;

const cellHash = (x: number, y: number, seed: number) => {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(seed, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

/** The two cell axes of the face `n` points at, and the cell they fall in. */
function cellOf(p: Vector3, n: Vector3) {
  const ax = Math.abs(n.x);
  const ay = Math.abs(n.y);
  const az = Math.abs(n.z);
  const [u, v] = ay >= ax && ay >= az ? [p.x, p.z] : ax >= az ? [p.z, p.y] : [p.x, p.y];
  return [Math.floor(u / CELL), Math.floor(v / CELL)] as const;
}

/** A ramp colour at a step, clamped to the lit part of the ramp. */
const step = (ramp: Ramp, k: number) => ramp[clamp(Math.round(k), 1, 4)];

/** Feather scallops, 5 x 4 cells, rows offset by half a feather: outline under each tip, lit tip, shaded top. */
function featherCell(iu: number, iv: number, ramp: Ramp, base: number, seed: number) {
  const row = Math.floor(iv / 4);
  const ly = mod(iv, 4);
  const shifted = iu + (row & 1) * 2;
  const lx = mod(shifted, 5);
  const shift = cellHash(row, Math.floor(shifted / 5), seed) < 0.1 ? 1 : 0;
  const b = clamp(base + shift, 1, 3);
  if ((ly === 0 && lx > 0 && lx < 4) || (ly === 1 && (lx === 0 || lx === 4))) return ramp[0];
  if (ly === 0) return step(ramp, b - 1);
  if (ly === 1) return step(ramp, b + 1);
  if (ly === 2) return step(ramp, b + (lx === 1 ? 1 : 0));
  return step(ramp, b - 1);
}

/** Plumage: gold flanks and chest, orange back, cream belly, all in feather scallops. */
const PLUMAGE = paint((p, n) => {
  const [iu, iv] = cellOf(p, n);
  const jit = cellHash(iu, iv, 3) - 0.5;
  const q = new Vector3(
    (Math.floor(p.x / CELL) + 0.5) * CELL,
    (Math.floor(p.y / CELL) + 0.5) * CELL,
    (Math.floor(p.z / CELL) + 0.5) * CELL,
  );
  let ramp = GOLD;
  if (n.y < -0.35 + jit * 0.3) ramp = CREAM;
  else if (n.y > 0.55 + jit * 0.25 && q.z < 0.2) ramp = ORANGE;
  return featherCell(iu, iv, ramp, tone(n), 5);
});

/** A simply shaded ramp in hard cells (claws, spars); `pick` may swap the ramp per face. */
const shaded = (ramp: Ramp, pick?: (n: Vector3) => Ramp | null) =>
  paint((p, n) => {
    const [iu, iv] = cellOf(p, n);
    const r = pick?.(n) ?? ramp;
    const k = tone(n);
    return step(r, k + (cellHash(iu, iv, 8) < 0.1 ? 1 : 0));
  });

const CLAW = shaded(BONE);
const BEAK_UP = shaded(BEAK, (n) => (n.y < -0.55 ? MOUTH : null));
const BEAK_LO = shaded(BEAK, (n) => (n.y > 0.55 ? MOUTH : null));

/** Brick-laid scales round a tube: rows of `H` cells, `W` cells per scale, an outline round every scale. */
function scales(len: number, radius: (t: number) => number, ramp: Ramp, belly: Ramp | null, flip: boolean) {
  const W = 4;
  const H = 3;
  return paint((_p, n, s) => {
    const iv = Math.floor((s[0] * len) / CELL);
    const row = Math.floor(iv / H);
    const ly0 = mod(iv, H);
    const ly = flip ? H - 1 - ly0 : ly0;
    const k = tone(n);
    const deg = mod(s[1], 360);
    if (belly && deg > 110 && deg < 250) {
      const bly = mod(iv, 2);
      const edge = flip ? bly === 1 : bly === 0;
      return edge ? belly[0] : step(belly, k + (cellHash(row, 0, 4) < 0.2 ? 1 : 0));
    }
    const cols = Math.max(3, Math.round((2 * Math.PI * radius(s[0])) / (W * CELL)));
    const px = Math.floor((deg / 360) * cols * W) + (row & 1) * 2;
    const lx = mod(px, W);
    const shift = cellHash(row, Math.floor(px / W), 6) < 0.18 ? 1 : 0;
    if (ly === 0 || lx === 0) return ramp[0];
    if (lx === 1 && ly === H - 1) return step(ramp, k + 2);
    if (lx === W - 1 && ly === 1) return step(ramp, k - 1);
    return step(ramp, k + shift);
  });
}

/** Boundary distance and outward direction of a 2D polygon from a point; `inside` by even-odd. */
function boundary(poly: readonly (readonly [number, number])[], x: number, y: number) {
  let best = Infinity;
  let bx = 0;
  let by = 0;
  let inside = false;
  for (let i = 0; i < poly.length; i++) {
    const [ax, ay] = poly[i];
    const [cx, cy] = poly[(i + 1) % poly.length];
    if (ay > y !== cy > y && x < ax + ((y - ay) / (cy - ay)) * (cx - ax)) inside = !inside;
    const ex = cx - ax;
    const ey = cy - ay;
    const t = clamp(((x - ax) * ex + (y - ay) * ey) / (ex * ex + ey * ey), 0, 1);
    const qx = ax + ex * t;
    const qy = ay + ey * t;
    const d = Math.hypot(x - qx, y - qy);
    if (d < best) {
      best = d;
      bx = qx;
      by = qy;
    }
  }
  return { d: best, ox: best > 1e-6 ? (bx - x) / best : 0, oy: best > 1e-6 ? (by - y) / best : 0, inside };
}

/** A paint for an extruded plate: dark border, lit top edge, shaded bottom edge, pebbles inside; `lateral` is the thickness axis, so side walls are shaded ramp colours, not outline. */
function sprite(poly: readonly (readonly [number, number])[], ramp: Ramp, pebbles: boolean, lateral: Vector3) {
  const cell = 0.008;
  return paint((_p, n, s) => {
    if (Math.abs(n.dot(lateral)) < 0.6) return step(ramp, tone(n));
    const iu = Math.floor(s[0] / cell);
    const iv = Math.floor(s[1] / cell);
    const cx = (iu + 0.5) * cell;
    const cy = (iv + 0.5) * cell;
    const { d, ox, oy, inside } = boundary(poly, cx, cy);
    if (!inside || d < cell * 0.95) return ramp[0];
    const k = tone(n);
    const lit = ox * 0.45 + oy * 0.85;
    if (d < cell * 1.9 && lit > 0.4) return ramp[4];
    if (d < cell * 1.9 && lit < -0.4) return ramp[1];
    if (pebbles && cellHash(iu >> 1, iv >> 1, 2) < 0.14) {
      const sub = (iu & 1) + (iv & 1) * 2;
      if (sub === 2) return step(ramp, k + 2);
      if (sub === 1) return step(ramp, k - 1);
    }
    return ramp[k + 1 > 3 ? 3 : Math.max(2, k + 1)];
  });
}

/** The violet wing membrane: outlined rim, lit inner rim, darker near the bones, a vein, sparkles. */
function wingSkin(alongLen: number, acrossLen: number) {
  const nu = Math.max(4, Math.round(alongLen / CELL));
  const nv = Math.max(4, Math.round(acrossLen / CELL));
  return paint((_p, n, s) => {
    if (Math.abs(n.y) < 0.5) return VIOLET[0];
    const iu = Math.floor(s[0] * nu);
    const iv = Math.floor(s[1] * nv);
    if (iu <= 0 || iu >= nu - 1 || iv <= 0 || iv >= nv - 1) return VIOLET[0];
    const k = n.y > 0 ? 3 : 2;
    if (iu === nu - 2 || iv === 1 || iv === nv - 2) return step(VIOLET, k + 1);
    if (iv === Math.floor(nv / 2) && iu > 2) return step(VIOLET, k - 1);
    const edge = Math.min(iv, nv - 1 - iv) / (nv / 2);
    const t = cellHash(iu, iv, 3);
    if (t < 0.02) return VIOLET[4];
    return step(VIOLET, k - (edge < 0.3 + (t - 0.5) * 0.2 ? 1 : 0));
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Pixel textures

/** A pixel picture as an `svg()` drawing: one rect per horizontal run, rasterised 1:1. `at` returns a colour or null. */
function pixels(w: number, h: number, at: (x: number, y: number) => string | null) {
  const rects: string[] = [];
  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      const c = at(x, y);
      let n = 1;
      while (x + n < w && at(x + n, y) === c) n++;
      if (c) rects.push(`<rect x="${x}" y="${y}" width="${n}" height="1" fill="${c}"/>`);
      x += n;
    }
  }
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${rects.join("")}</svg>`,
    { size: Math.max(w, h), pixelated: true },
  );
}

/** A picture from rows of characters, one palette colour each; "." is clear. */
const fromRows = (rows: string[], pal: Record<string, string>) =>
  pixels(rows[0].length, rows.length, (x, y) => pal[rows[y][x]] ?? null);

/** A feather sprite, tip at the top, root at the bottom: outlined lancet, rib, barbs, an optional coloured tip. */
function feather(
  w: number,
  h: number,
  ramp: Ramp,
  halfWidth: (v: number) => number,
  tip?: { ramp: Ramp; frac: number },
) {
  const inside = (x: number, y: number) => {
    if (y < 0 || y >= h || x < 0 || x >= w) return false;
    return Math.abs(x + 0.5 - w / 2) <= (halfWidth(y / (h - 1)) * w) / 2;
  };
  return pixels(w, h, (x, y) => {
    if (!inside(x, y)) return null;
    const v = y / (h - 1);
    const r = tip && v < tip.frac ? tip.ramp : ramp;
    if (!inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1)) return r[0];
    const cx = x + 0.5 - w / 2;
    let k = cx < 0 ? 3 : 2;
    if (Math.abs(cx) < 0.6) k = cx < 0 ? 4 : 1;
    else if ((y + Math.round(Math.abs(cx) * 1.3)) % 4 === 0) k -= 1;
    return r[clamp(k, 1, 4)];
  });
}

const lancet = (v: number) => Math.min(1, 0.25 + 1.6 * Math.sqrt(v)) * (1 - (0.5 * Math.max(0, v - 0.6)) / 0.4);
const broad = (v: number) => Math.min(1, 0.4 + 2 * Math.sqrt(v)) * (1 - 0.15 * v);
const sickle = (v: number) =>
  Math.min(1, 0.3 + 2.2 * Math.sqrt(v)) * (0.55 + 0.45 * Math.sin(Math.min(1, v * 1.4) * Math.PI * 0.6 + 0.6));

/** A 7x7 slit-pupil eye, dark outline, orange ring, yellow iris, one white glint. */
const EYE = fromRows([".kkkkk.", "kooyook", "kowPyok", "koyPyok", "koyPyok", "kooyook", ".kkkkk."], {
  k: INK,
  o: "#e86a10",
  y: "#ffd23a",
  w: "#ffffff",
  P: "#1a0610",
});
/** A white ear lobe. */
const LOBE = fromRows(["..kkk..", ".kcccck", "kcwwccs", "kcwccss", "kccccss", ".ksssk.", "..kkk.."], {
  k: INK,
  c: "#e8dcd0",
  w: "#ffffff",
  s: "#a89ab0",
});
/** A nostril: a dark pit with a lit lip. */
const NOSTRIL = fromRows(["kkk", "kpk", ".ll"], { k: "#5a2a08", p: "#1a0610", l: "#ffe070" });

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "jrpgCockatrice", paintSize: 2048 });
  const random = rng(17);

  // ------------------------------------------------------------------ spine, neck and tail: one faceted tube
  const tailPts: V3[] = [
    [0, 0.46, -2.15],
    [0, 0.3, -2.0],
    [0, 0.22, -1.75],
    [0, 0.24, -1.45],
    [0, 0.33, -1.15],
    [0, 0.45, -0.82],
    [0, 0.56, -0.5],
  ];
  const hipsPt: V3 = [0, 0.62, -0.2];
  const torsoPts: V3[] = [
    [0, 0.66, -0.02],
    [0, 0.73, 0.12],
    [0, 0.82, 0.22],
  ];
  const neckPts: V3[] = [
    [0, 0.92, 0.31],
    [0, 1.03, 0.38],
    [0, 1.09, 0.44],
    [0, 1.13, 0.51],
  ];
  const stations = [...tailPts, hipsPt, ...torsoPts, ...neckPts];
  const radii: [number, number][] = [
    [0.016, 0.016],
    [0.026, 0.026],
    [0.038, 0.038],
    [0.05, 0.05],
    [0.064, 0.064],
    [0.08, 0.08],
    [0.098, 0.098],
    [0.135, 0.125],
    [0.21, 0.205],
    [0.235, 0.235],
    [0.175, 0.185],
    [0.125, 0.125],
    [0.1, 0.1],
    [0.088, 0.088],
    [0.08, 0.08],
  ];
  const curve = catmull(stations);
  const keyTs = stations.map((p) => curve.closestT(p));
  const radius = (t: number): [number, number] => {
    let i = 0;
    while (i < keyTs.length - 2 && t > keyTs[i + 1]) i++;
    const f = clamp((t - keyTs[i]) / (keyTs[i + 1] - keyTs[i]), 0, 1);
    return [radii[i][0] + (radii[i + 1][0] - radii[i][0]) * f, radii[i][1] + (radii[i + 1][1] - radii[i][1]) * f];
  };
  const hipsT = keyTs[7];
  const neckT = keyTs[10];

  const hips = b.joint("hips", { at: hipsPt, role: "spine", group: "body" });
  const spine = b.chain("spine", curve.slice(hipsT, neckT), {
    parent: hips,
    count: 3,
    names: ["spine1", "spine2", "spine3"],
    role: "spine",
    group: "body",
  });
  const neck = b.chain("neck", curve.slice(neckT, 1), {
    parent: spine.joints[2],
    count: 4,
    names: ["neck1", "neck2", "neck3", "neck4"],
    role: "neck",
    group: "neck",
  });
  const tail = b.chain("tail", curve.slice(hipsT, 0), {
    parent: hips,
    count: 8,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tail6", "tail7", "tail8"],
    role: "tail",
    group: "tail",
  });

  const tailScales = scales(curve.length, (t) => radius(t)[0], TEAL, PLATE, false);
  const BODY = paint((_p, _n, s) => (s[0] < hipsT ? tailScales : PLUMAGE));
  const body = b.sweep(curve, (t) => radius(t), {
    bone: [tail, hips, spine, neck],
    color: BODY,
    section: { ngon: 8 },
    caps: { start: "point", end: "round" },
    group: "body",
  });
  // A dorsal ridge of bone spikes down the serpent tail.
  b.along(body, 9, (at) => b.spike(at, at, 0.08, 0.022, { color: CLAW, sides: 4 }), { from: 0.05, to: hipsT - 0.03 });

  // Tail tip: a red spade on the last joint.
  const tailTip = tail.at(1);
  const tailDir = tail.joints[7].dir([0, 1, 0]);
  const spadeShape: [number, number][] = [
    [0, 0.016],
    [0.035, 0.032],
    [0.03, 0.078],
    [0.15, 0],
    [0.03, -0.078],
    [0.035, -0.032],
    [0, -0.016],
  ];
  b.extrude(spadeShape, {
    at: tailTip.at.clone().addScaledVector(tailDir, -0.02),
    x: tailDir,
    y: [1, 0, 0],
    thickness: 0.026,
    color: sprite(spadeShape, RED, false, new Vector3(0, 1, 0)),
    bone: tail.joints[7],
    group: "tail",
    name: "spade",
  });

  // ------------------------------------------------------------------ head, beak and jaw
  const headDir: V3 = [0, -0.06, 1];
  const head = b.joint("head", { parent: neck.joints[3], at: curve.at(1), dir: headDir, role: "head", group: "head" });
  /** A point in the head: `f` forward, `u` up, `x` toward the creature's left. */
  const H = (f: number, u: number, x = 0) => head.local([-x, f, u]);
  const headOrigin = head.at.clone();
  const headFwd = new Vector3(...head.dir([0, 1, 0]).toArray()).normalize();
  const sideways = new Vector3(...head.dir([1, 0, 0]).toArray()).normalize();

  const HEAD = paint((p, n) => {
    const [iu, iv] = cellOf(p, n);
    const q = new Vector3(
      (Math.floor(p.x / CELL) + 0.5) * CELL,
      (Math.floor(p.y / CELL) + 0.5) * CELL,
      (Math.floor(p.z / CELL) + 0.5) * CELL,
    );
    const f = q.sub(headOrigin).dot(headFwd);
    const k = tone(n);
    if (f > 0.035 + (cellHash(iu, iv, 4) - 0.5) * 0.03) return step(SKINRED, k + (cellHash(iu, iv, 7) < 0.1 ? 1 : 0));
    return featherCell(iu, iv, n.y > 0.5 ? ORANGE : GOLD, k, 12);
  });
  const skull = b.sweep([H(-0.085, 0.01), H(0.12, -0.005)], [0.06, 0.09, 0.08, 0.052], {
    bone: head,
    color: HEAD,
    section: { ngon: 6 },
    caps: "round",
    group: "head",
    name: "skull",
  });

  // Upper beak: a hooked box tube tapering to a point; the palate is dark red.
  const upperPath = bezier(H(0.07, 0.0), H(0.2, 0.018), H(0.3, -0.05));
  const upper = b.sweep(upperPath, (t) => [0.052 * (1 - t) + 0.004, 0.05 * (1 - t) + 0.004], {
    bone: head,
    color: BEAK_UP,
    section: "box",
    caps: { start: "flat", end: "point" },
    group: "head",
    name: "upperBeak",
  });
  const jaw = b.joint("jaw", { parent: head, at: H(0.03, -0.035), aim: H(0.26, -0.06), role: "jaw", group: "jaw" });
  const lowerPath = bezier(H(0.03, -0.035), H(0.15, -0.045), H(0.26, -0.062));
  b.sweep(lowerPath, (t) => [0.042 * (1 - t) + 0.004, 0.03 * (1 - t) + 0.004], {
    bone: jaw,
    color: BEAK_LO,
    section: "box",
    caps: { start: "flat", end: "point" },
    group: "jaw",
    name: "lowerBeak",
  });
  b.pose(jaw, { axis: [1, 0, 0], deg: 9 });

  // Decals laid on the skull: an eye and an ear lobe each side, nostrils on the beak.
  const skullSkin = b.surface(skull);
  const beakSkin = b.surface(upper);
  const decal = (surface: Surface, from: Vector3, toward: Vector3, tex: Texture, size: number, name: string) => {
    const hit = surface.ray(from, toward.clone().sub(from).normalize());
    if (!hit) return;
    b.part(new PlaneGeometry(size, size), "#ffffff", {
      texture: tex,
      bone: head,
      at: hit.at.clone().addScaledVector(hit.n, 0.003),
      dir: hit.n,
      axis: "z",
      up: [0, 1, 0],
      group: "head",
      name,
    });
  };
  for (const s of [1, -1]) {
    decal(skullSkin, H(0.05, 0.025, s * 0.25), H(0.05, 0.025, 0), EYE, 0.058, "eye");
    decal(skullSkin, H(-0.03, -0.005, s * 0.25), H(-0.03, -0.005, 0), LOBE, 0.05, "earLobe");
    decal(beakSkin, H(0.115, 0.15, s * 0.02), H(0.115, 0.0, s * 0.02), NOSTRIL, 0.022, "nostril");
  }

  // ------------------------------------------------------------------ comb (two joints) and wattles
  const combLobes = (valleyX: number[], valleyY: number[], heights: number[]) => {
    const top: [number, number][] = [];
    for (let i = 0; i < heights.length; i++) {
      top.push([valleyX[i], valleyY[i]]);
      for (let k = 1; k <= 5; k++) {
        const u = k / 6;
        top.push([
          valleyX[i] + (valleyX[i + 1] - valleyX[i]) * u,
          valleyY[i] + (valleyY[i + 1] - valleyY[i]) * u + heights[i] * Math.sqrt(1 - (2 * u - 1) ** 2),
        ]);
      }
    }
    top.push([valleyX[heights.length], valleyY[heights.length]]);
    return top;
  };
  const vx = [0.115, 0.06, 0.005, -0.05, -0.1, -0.15];
  const vy = [0.02, 0.05, 0.08, 0.08, 0.05, 0.0];
  const lh = [0.075, 0.12, 0.145, 0.115, 0.07];
  const combTop = combLobes(vx, vy, lh);
  const combFront = [[vx[0], -0.03] as [number, number], ...combTop.slice(0, 13)].concat([[vx[2], -0.03]]);
  const combRear = [[vx[2], -0.03] as [number, number], ...combTop.slice(12)].concat([[vx[5], -0.03]]);
  const comb1 = b.joint("comb1", { parent: head, at: H(0.04, 0.05), dir: head.dir([0, 1, 0.5]), group: "comb" });
  const comb2 = b.joint("comb2", { parent: comb1, at: H(-0.05, 0.06), dir: head.dir([0, -1, 0.25]), group: "comb" });
  for (const [outline, bone, name] of [
    [combFront, comb1, "combFront"],
    [combRear, comb2, "combRear"],
  ] as const) {
    b.extrude(outline, {
      at: H(0, 0.055),
      x: head.dir([0, 1, 0]),
      y: head.dir([0, 0, 1]),
      thickness: [0.075, 0.04],
      color: sprite(outline, RED, true, sideways),
      bone,
      group: "comb",
      name,
    });
  }

  const wattle1: [number, number][] = [
    [-0.04, 0.0],
    [0.045, 0.0],
    [0.052, -0.04],
    [0.04, -0.085],
    [0.0, -0.11],
    [-0.033, -0.078],
    [-0.046, -0.04],
  ];
  const wattle2: [number, number][] = [
    [-0.032, 0.012],
    [0.04, 0.012],
    [0.04, -0.04],
    [0.02, -0.09],
    [0.0, -0.125],
    [-0.02, -0.09],
    [-0.04, -0.04],
  ];
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const base = H(0.075, -0.05, s * 0.028);
    const w = b.chain(
      `wattle${side}`,
      [base, base.clone().add(new Vector3(0, -0.06, -0.008)), base.clone().add(new Vector3(0, -0.135, -0.02))],
      {
        parent: head,
        names: [`wattle${side}1`, `wattle${side}2`],
        group: "comb",
      },
    );
    b.extrude(wattle1, {
      at: w.joints[0],
      x: head.dir([0, 1, 0]),
      y: [0, 1, 0],
      thickness: 0.026,
      color: sprite(wattle1, RED, true, sideways),
      bone: w.joints[0],
      group: "comb",
      name: "wattle",
    });
    b.extrude(wattle2, {
      at: w.joints[1],
      x: head.dir([0, 1, 0]),
      y: [0, 1, 0],
      thickness: 0.016,
      color: sprite(wattle2, RED, true, sideways),
      bone: w.joints[1],
      group: "comb",
      name: "wattleTip",
    });
  }

  // ------------------------------------------------------------------ feather sprites and cards
  const chestGold = feather(8, 11, GOLD, lancet);
  const chestGold2 = feather(8, 11, GOLD, lancet, { ramp: ORANGE, frac: 0.3 });
  const backOrange = feather(8, 11, ORANGE, lancet);
  const hackle = feather(6, 16, GOLD, lancet, { ramp: ORANGE, frac: 0.28 });
  const crown = feather(6, 12, ORANGE, lancet);
  const wingFeather = feather(10, 34, GOLD, broad, { ramp: TEAL, frac: 0.24 });
  const plume = feather(10, 52, ORANGE, sickle, { ramp: GOLD, frac: 0.14 });

  const skin = b.surface(body);
  b.cards(
    skin.scatter(260, {
      rng: random,
      minDist: 0.05,
      filter: (h) => h.at.z > 0.02 && h.at.y > 0.55 && h.at.y < 0.98 && h.n.y < 0.5,
    }),
    [chestGold, chestGold2],
    {
      size: [0.11, 0.12],
      lean: 68,
      flow: [0, -1, -0.45],
      bend: 22,
      vary: 0.15,
      spin: 10,
      rng: random,
      name: "chestFeathers",
    },
  );
  b.cards(
    skin.scatter(120, {
      rng: random,
      minDist: 0.06,
      filter: (h) => h.n.y > 0.5 && h.at.z > -0.3 && h.at.z < 0.2 && h.at.y > 0.7,
    }),
    backOrange,
    {
      size: [0.1, 0.13],
      lean: 62,
      flow: [0, -0.4, -1],
      bend: 20,
      vary: 0.2,
      spin: 12,
      rng: random,
      name: "backFeathers",
    },
  );
  b.cards(
    skin.scatter(140, {
      rng: random,
      minDist: 0.045,
      filter: (h) => h.at.y > 0.86 && h.at.z > 0.26 && h.at.y < 1.06,
    }),
    hackle,
    { size: [0.07, 0.16], lean: 60, flow: [0, -1, -0.15], bend: 25, vary: 0.2, spin: 15, rng: random, name: "hackle" },
  );
  b.cards(
    skin.scatter(70, {
      rng: random,
      minDist: 0.05,
      filter: (h) => h.at.z < -0.1 && h.at.z > -0.36 && h.n.y > -0.3 && h.at.y > 0.55,
    }),
    chestGold,
    {
      size: [0.1, 0.14],
      lean: 72,
      flow: [0, -0.15, -1],
      bend: 20,
      vary: 0.2,
      spin: 10,
      rng: random,
      name: "rumpFringe",
    },
  );
  b.cards(
    skullSkin.scatter(7, {
      rng: random,
      minDist: 0.04,
      filter: (h) => h.n.y > 0.35 && h.at.clone().sub(headOrigin).dot(headFwd) < 0.0,
    }),
    crown,
    { size: [0.045, 0.1], lean: 40, flow: [0, -0.3, -1], bend: 20, rng: random, name: "crown" },
  );

  // Tail plumes: five arched sickle feathers, one joint each, fanned over the rump.
  for (let i = 0; i < 5; i++) {
    const yaw = ((i - 2) * 20 * Math.PI) / 180;
    const pitch = (66 * Math.PI) / 180;
    const dir: V3 = [Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)];
    const base: V3 = [(i - 2) * 0.03, 0.74, -0.3];
    const j = b.joint(`plume${i + 1}`, { parent: hips, at: base, dir, role: "fan", group: "plumes" });
    b.cards([frame(base, dir)], plume, {
      size: [0.15, 0.82],
      flow: [0, -1, -0.25],
      lean: 0,
      bend: 105,
      cross: true,
      bone: j,
      sink: 0.05,
      name: "plume",
    });
  }

  // ------------------------------------------------------------------ legs: feathered thigh, scaly shin, three toes and a hind toe
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const toeR = 0.03;
    const pts = limb(
      [s * 0.13, 0.52, -0.08],
      [s * 0.15, toeR, 0.26],
      [0.2, 0.22, 0.22, 0.17],
      [
        [0, 0, 1],
        [0, 0, -1],
        [0, 0, 1],
      ],
      { sole: [0, 0, 1] },
    );
    const leg = b.chain(`leg${side}`, pts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `toeMid${side}`],
      role: "leg",
      contact: [s * 0.15, 0, 0.18],
      group: `leg${side}`,
    });
    const keys = [
      [leg.ts[0], 0.1],
      [(leg.ts[0] + leg.ts[1]) / 2, 0.115],
      [leg.ts[1], 0.075],
      [leg.ts[2], 0.055],
      [leg.ts[3], 0.032],
      [1, 0.026],
    ] as const;
    const legR = (t: number) => {
      let i = 0;
      while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
      const f = clamp((t - keys[i][0]) / (keys[i + 1][0] - keys[i][0]), 0, 1);
      return keys[i][1] + (keys[i + 1][1] - keys[i][1]) * f;
    };
    const shinScales = scales(leg.length, legR, TEAL, null, true);
    const legTube = b.sweep(leg, (t) => legR(t), {
      color: paint((p) => (p.y < 0.36 ? shinScales : PLUMAGE)),
      section: { ngon: 6 },
      caps: { start: "flat", end: "flat" },
      group: `leg${side}`,
    });
    // Feather trousers on the thigh.
    b.cards(
      b.surface(legTube).scatter(26, { rng: random, minDist: 0.04, filter: (h) => h.at.y > 0.36 && h.n.y < 0.6 }),
      [chestGold, chestGold2],
      {
        size: [0.08, 0.1],
        lean: 62,
        flow: [0, -1, -0.1],
        bend: 15,
        vary: 0.15,
        spin: 10,
        rng: random,
        name: "trousers",
      },
    );

    const ball = pts[3];
    const tip = pts[4];
    const ankle = leg.joints[3];
    const toeTip = b.chain(`toeMidTip${side}`, [tip, tip.clone().add(new Vector3(0, 0, 0.07))], {
      parent: ankle,
      names: [`toeMidTip${side}`],
      group: `leg${side}`,
    });
    b.sweep(toeTip, [0.03, 0.022], {
      color: shinScales,
      section: { ngon: 5 },
      caps: { start: "flat", end: "flat" },
      group: `leg${side}`,
    });
    b.spike(toeTip.at(1), [0, -0.08, 1], 0.06, 0.02, {
      color: CLAW,
      sides: 4,
      bone: toeTip.joints[0],
      group: `leg${side}`,
      name: "claw",
    });

    const toes = [
      { name: "In", yaw: -s * 36, len: 0.15 },
      { name: "Out", yaw: s * 36, len: 0.15 },
    ] as const;
    for (const toe of toes) {
      const a = (toe.yaw * Math.PI) / 180;
      const d = new Vector3(Math.sin(a), 0, Math.cos(a));
      const p1 = ball.clone().addScaledVector(d, toe.len * 0.5);
      const p2 = ball.clone().addScaledVector(d, toe.len);
      const chain = b.chain(`toe${toe.name}${side}`, [ball, p1, p2], {
        parent: ankle,
        names: [`toe${toe.name}${side}1`, `toe${toe.name}${side}2`],
        role: "digit",
        group: `leg${side}`,
      });
      b.sweep(chain, [0.03, 0.02], {
        color: shinScales,
        section: { ngon: 5 },
        caps: { start: "flat", end: "flat" },
        detail: 0.6,
        group: `leg${side}`,
      });
      b.spike(p2, [d.x, -0.08, d.z], 0.055, 0.019, {
        color: CLAW,
        sides: 4,
        bone: chain.joints[1],
        group: `leg${side}`,
        name: "claw",
      });
    }
    const hallux = b.chain(`hallux${side}`, [ball, ball.clone().add(new Vector3(-s * 0.015, 0, -0.1))], {
      parent: ankle,
      names: [`hallux${side}`],
      role: "digit",
      group: `leg${side}`,
    });
    b.sweep(hallux, [0.028, 0.019], {
      color: shinScales,
      section: { ngon: 5 },
      caps: { start: "flat", end: "flat" },
      detail: 0.6,
      group: `leg${side}`,
    });
    b.spike(hallux.at(1), [0, -0.06, -1], 0.05, 0.018, {
      color: CLAW,
      sides: 4,
      bone: hallux.joints[0],
      group: `leg${side}`,
      name: "claw",
    });
  }

  // ------------------------------------------------------------------ dragon wings
  const chest = spine.joints[2];
  const finger = (a: V3, tip: V3, bow: number): V3[] =>
    [0, 1 / 3, 2 / 3, 1].map(
      (t): V3 => [
        a[0] + (tip[0] - a[0]) * t,
        a[1] + (tip[1] - a[1]) * t + bow * Math.sin(Math.PI * t),
        a[2] + (tip[2] - a[2]) * t - bow * 0.6 * Math.sin(Math.PI * t),
      ],
    );
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const group = `wing${side}`;
    const S: V3 = [s * 0.2, 0.88, 0.1];
    const E: V3 = [s * 0.62, 0.97, -0.1];
    const W: V3 = [s * 1.02, 1.08, 0.08];
    const arm = b.chain(`arm${side}`, [S, E], {
      parent: chest,
      names: [`shoulder${side}`],
      role: "wing",
      group,
    });
    const forearm = b.chain(`forearm${side}`, [E, W], {
      parent: arm.joints[0],
      names: [`elbow${side}`],
      role: "wing",
      group,
    });
    const wrist = b.joint(`wrist${side}`, {
      parent: forearm.joints[0],
      at: W,
      dir: [s * 0.8, 0.2, 0.3],
      role: "wing",
      group,
    });
    const armScales = scales(1.1, () => 0.045, TEAL, null, false);
    b.sweep(arm, [0.058, 0.048], { color: armScales, section: { ngon: 6 }, group });
    b.sweep(forearm, [0.048, 0.034], { color: armScales, section: { ngon: 6 }, group });
    b.spike(W, [s * 0.2, 0.9, 0.5], 0.13, 0.026, { color: CLAW, sides: 4, bone: wrist, group, name: "thumbClaw" });

    const tips: V3[] = [
      [s * 1.75, 1.34, 0.22],
      [s * 1.62, 1.16, -0.32],
      [s * 1.25, 0.96, -0.66],
    ];
    const fingers: Chain[] = tips.map((tip, i) => {
      const f = b.chain(`finger${i + 1}${side}`, catmull(finger(W, tip, 0.06)), {
        parent: wrist,
        count: 3,
        names: [1, 2, 3].map((k) => `finger${i + 1}${side}${k}`),
        role: "digit",
        group,
      });
      const fs = scales(f.length, () => 0.02, TEAL, null, false);
      b.sweep(f, [0.03, 0.009], { color: fs, section: { ngon: 5 }, caps: { start: "round", end: "point" }, group });
      return f;
    });
    const span = (a: Chain, c: Chain) => a.at(0.6).at.distanceTo(c.at(0.6).at);
    for (let i = 0; i < 2; i++) {
      b.membrane(fingers[i], fingers[i + 1], {
        thickness: 0.014,
        color: wingSkin((fingers[i].length + fingers[i + 1].length) / 2, span(fingers[i], fingers[i + 1])),
        scallop: 0.16,
        group,
        name: "wingMembrane",
      });
    }
    const trailing = catmull([W, [s * 0.62, 0.95, -0.14], [s * 0.3, 0.8, -0.2], [s * 0.2, 0.7, -0.3]]);
    b.membrane(fingers[2], trailing, {
      thickness: 0.014,
      color: wingSkin(fingers[2].length, 0.6),
      scallop: 0.1,
      bone: arm,
      group,
      name: "wingMembrane",
    });

    // Six wing feathers, one joint each, laid back over the inner wing from the arm.
    const armLine = polyline([S, E, W]);
    for (let k = 0; k < 6; k++) {
      const u = 0.12 + k * 0.16;
      const base = armLine.at(u);
      const yaw = ((8 + 26 * u) * Math.PI) / 180;
      const dir: V3 = [s * Math.sin(yaw), 0, -Math.cos(yaw)];
      const parent: Joint = u < 0.5 ? arm.joints[0] : forearm.joints[0];
      const j = b.joint(`feather${side}${k + 1}`, { parent, at: base, dir, role: "fan", group });
      b.cards([frame([base.x, base.y + 0.035, base.z], [0, 1, 0])], wingFeather, {
        size: [0.13, 0.36 + 0.05 * Math.sin(u * 3)],
        flow: dir,
        lean: 90,
        bone: j,
        sink: 0,
        mirror: s < 0,
        name: "wingFeather",
      });
    }
  }

  return b.root;
}
