// Dungeon props in pixel art: iron-bound chest, two caged torches, two barrels, scattered bones and a spike trap.
// Every surface shows hard square texels of one size (TEXEL): pixel tiles on boxes, cell paints on turned shapes,
// skin-sheet boxes on the skull, staircase flames. Small repeated bits (studs, bars, coins) are merged per colour.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { Joint } from "../../../../src/skeleton";
import { aim, DEG, rng } from "../../../../src/math";
import { noise } from "../../../../src/paint";
import {
  bayer,
  cellPaint,
  pick,
  pixelTexture,
  skinBox,
  skinLayout,
  snapColor,
  stepped,
  tileBox,
} from "../../../../kits/pixel";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dungeon Props",
  description:
    "A pixel-art dungeon prop group: iron-bound treasure chest with a hinged lid, two caged torches with stepped pixel flames, an upright and a lying barrel, a skull and scattered bones, and a spiked floor trap.",
  style: "pixel art",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette and shared bits

const TEXEL = 0.0125; // metres per texel for every tile, paint and skin box
const snap = (list: string[]) => list.map((c) => snapColor(c, 32));

const WOOD = snap(["#24130c", "#44250f", "#6b3d1e", "#8c5428", "#b0733a"]);
const REDWOOD = snap(["#22100f", "#431a17", "#6a2a22", "#8e3c2d", "#b05a3c"]);
const IRON = snap(["#14141a", "#26262e", "#3a3a46", "#555566", "#7a7a8c"]);
const BONE = snap(["#8a7a62", "#b5a588", "#d8cba8", "#efe5c8"]);
const STONE = snap(["#221f28", "#38343f", "#4c4754", "#686270", "#847d8a"]);
const DIRT = snap(["#2e231d", "#4a392d", "#614b3a", "#7a604a"]);

const IRON_D = "#26262e";
const IRON_M = "#3a3a46";
const IRON_L = "#555566";
const WOOD_D = "#44250f";
const WOOD_M = "#6b3d1e";
const BONE_L = "#d8cba8";
const BONE_M = "#b5a588";
const GOLD = "#e8b830";
const GOLD_D = "#a8761a";
const STONE_M = "#4c4754";
const FIRE_RED = "#d8340e";
const FIRE_ORANGE = "#ff8a1c";
const FIRE_YELLOW = "#ffd23a";
const FIRE_WHITE = "#fff2a8";
const COAL = "#ff6a18";
const WHITE = "#ffffff";

type P = [number, number, number];
const hash = (i: number, s: number) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const arr = (v: THREE.Vector3): P => [v.x, v.y, v.z];
const yawQ = (deg: number) => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), deg * DEG);

// ---------------------------------------------------------------------------------------------------------------
// Pixel tiles

/** Horizontal plank courses `plankH` pixels tall: seam, highlight, grain dashes, butt joints with nails. */
function planksTile(w: number, h: number, plankH: number, ramp: string[], seed: number) {
  const r = rng(seed);
  return pixelTexture(w, h, (g) => {
    const rows = Math.ceil(h / plankH);
    for (let row = 0; row < rows; row++) {
      const y0 = row * plankH;
      const base = 0.35 + 0.4 * r();
      const joint = Math.floor(r() * w);
      for (let y = 0; y < plankH; y++)
        for (let x = 0; x < w; x++) {
          let v = base - (0.08 * y) / plankH;
          if (y === 0) v = 0;
          else if (y === 1) v = Math.min(1, base + 0.28);
          else if (y === plankH - 1) v -= 0.16;
          if ((x - joint + w) % w === 0) v = 0;
          if (r() < 0.05) v -= 0.18;
          g.set(x, y0 + y, pick(ramp, v + 0.1 * (r() - 0.5), bayer(x, y0 + y)));
        }
      for (let k = 0; k < Math.floor(w / 4); k++) {
        const sx = Math.floor(r() * w);
        const sy = y0 + 2 + Math.floor(r() * (plankH - 3));
        const len = 3 + Math.floor(r() * 5);
        for (let i = 0; i < len; i++) g.set(sx + i, sy, ramp[Math.max(0, Math.floor(base * (ramp.length - 1)) - 1)]);
      }
      g.set(joint + 2, y0 + 2, IRON[3]);
      g.set(joint + 2, y0 + plankH - 2, IRON[1]);
    }
  });
}

/** Riveted-looking dark metal with edge highlight, speckle and a few scratches. */
const IRONTILE = pixelTexture(16, 16, (g) => {
  const r = rng(21);
  g.fill((x, y) => {
    let v = 0.42 + 0.1 * (r() - 0.5);
    if (y === 0) v = 0.74;
    if (y === 15) v = 0.14;
    if (x === 0) v = 0.62;
    if (x === 15) v = 0.2;
    if (r() < 0.07) v -= 0.18;
    if (r() < 0.03) v += 0.22;
    return pick(IRON, v, bayer(x, y));
  });
  for (let k = 0; k < 3; k++) {
    const sx = 2 + Math.floor(r() * 10);
    const sy = 2 + Math.floor(r() * 10);
    for (let i = 0; i < 3; i++) g.set(sx + i, sy + i, IRON[4]);
  }
});

/** Staggered stone bricks, 6 pixels tall. */
const STONETILE = pixelTexture(32, 18, (g) => {
  const r = rng(31);
  for (let row = 0; row < 3; row++) {
    const off = (row % 2) * 8;
    for (let y = 0; y < 6; y++)
      for (let x = 0; x < 32; x++) {
        const lx = (x + off) % 16;
        const bi = Math.floor((x + off) / 16);
        let v = 0.38 + 0.25 * hash(bi + row * 7, 5) + 0.12 * (r() - 0.5);
        if (y === 5 || lx === 0) v = 0.03;
        else {
          if (y === 0) v += 0.22;
          if (lx === 1) v += 0.1;
          if (y === 4) v -= 0.1;
          if (r() < 0.06) v -= 0.15;
        }
        g.set(x, row * 6 + y, pick(STONE, v, bayer(x, row * 6 + y)));
      }
  }
});

/** 3 x 3 worn flagstones in dirt tones, with cracks. */
const FLAGTILE = pixelTexture(56, 56, (g) => {
  const r = rng(41);
  g.fill((x, y) => {
    const fx = Math.floor(x / 19);
    const fy = Math.floor(y / 19);
    const lx = x % 19;
    const ly = y % 19;
    if (lx === 0 || ly === 0) return DIRT[0];
    let v = 0.3 + 0.35 * hash(fx * 3 + fy, 9) + 0.2 * (r() - 0.5);
    if (lx === 1 || ly === 1) v += 0.18;
    if (lx === 18 || ly === 18) v -= 0.14;
    return pick(DIRT, v, bayer(x, y));
  });
  for (let k = 0; k < 7; k++) {
    let cx = Math.floor(r() * 54);
    let cy = Math.floor(r() * 54);
    const len = 4 + Math.floor(r() * 6);
    for (let i = 0; i < len; i++) {
      g.set(cx, cy, DIRT[0]);
      cx += r() < 0.5 ? 1 : 0;
      cy += r() < 0.5 ? 1 : 0;
    }
  }
});

/** Small speckled bone for shafts. */
const BONETILE = pixelTexture(8, 8, (g) => {
  const r = rng(51);
  g.fill((x, y) => pick(BONE, 0.78 - 0.05 * y + 0.2 * (r() - 0.5), bayer(x, y)));
  g.set(2, 3, BONE[0]);
  g.set(5, 6, BONE[0]);
});

/** Lock plate with a keyhole: 9 x 11 pixels. */
const LOCK = pixelTexture(9, 11, (g) =>
  g.stamp(
    0,
    0,
    [
      "hhhhhhhhh",
      "hrmmmmmrd",
      "hmmmmmmmd",
      "hmmmkmmmd",
      "hmmkkkmmd",
      "hmmmkmmmd",
      "hmmmkmmmd",
      "hmmkkkmmd",
      "hmmmmmmmd",
      "hrmmmmmrd",
      "ddddddddd",
    ],
    { h: "#7a7a8c", m: "#555566", d: "#26262e", k: "#0d0d12", r: "#a0a0b4" },
  ),
);

// Skull skin sheet: cranium, face and jaw boxes.
const SKULL = skinLayout({ cranium: [10, 8, 10], face: [6, 5, 6], jaw: [5, 3, 5] }, 64);
const SKULLSHEET = pixelTexture(SKULL.size[0], SKULL.size[1], (g) => {
  const r = rng(8);
  for (const faces of Object.values(SKULL.faces))
    for (const rect of Object.values(faces))
      g.fill((x, y, _w, h) => pick(BONE, 0.84 - (0.3 * y) / h + 0.12 * (r() - 0.5), bayer(x, y)), rect);
  const pal = { k: "#1a1410", d: "#5a4a3a", l: "#efe5c8" };
  const cf = SKULL.faces.cranium.pz;
  for (let x = 0; x < 10; x++) g.set(cf[0] + x, cf[1] + 2, BONE[1]);
  g.stamp(cf[0], cf[1] + 3, [".kkk..kkk.", ".kdk..kdk.", "..k....k.."], pal);
  const top = SKULL.faces.cranium.py;
  for (const [x, y] of [
    [4, 1],
    [4, 2],
    [5, 3],
    [5, 4],
    [6, 5],
    [6, 6],
  ])
    g.set(top[0] + x, top[1] + y, pal.d);
  const ff = SKULL.faces.face.pz;
  g.stamp(ff[0], ff[1] + 1, ["..kk..", "..kk.."], pal);
  g.stamp(ff[0], ff[1] + 4, ["lkllkl"], pal);
  const jf = SKULL.faces.jaw.pz;
  g.stamp(jf[0], jf[1], ["lklkl"], pal);
});

// ---------------------------------------------------------------------------------------------------------------
// Paints

const ironPaint = cellPaint(TEXEL, (c) => {
  let v = 0.4 + 0.22 * c.n.y + 0.16 * (noise(c.at, 0.08, 4) - 0.5);
  if (c.random(2) < 0.05) v -= 0.2;
  if (c.random(3) < 0.03) v += 0.25;
  return c.pick(IRON, v);
});

/** Staves round a turned axis (and planked ends): base point, axis a, side axes u and v. */
function woodPaint(
  base: THREE.Vector3,
  a: THREE.Vector3,
  u: THREE.Vector3,
  v: THREE.Vector3,
  H: number,
  capR: number,
  ramp: string[],
  seed: number,
) {
  return cellPaint(TEXEL, (c) => {
    const rel = c.at.clone().sub(base);
    const ax = rel.dot(a);
    const ru = rel.dot(u);
    const rv = rel.dot(v);
    const cap = Math.abs(c.n.dot(a)) > 0.7;
    let val: number;
    if (cap) {
      const q = ru / 0.075 + 8;
      const idx = Math.floor(q);
      const f = q - idx;
      val = 0.3 + 0.4 * hash(idx, seed);
      if (f < 0.1) val = 0;
      else if (f < 0.2) val += 0.18;
      if (Math.hypot(ru, rv) > capR - 0.03) val = 0.14 + 0.1 * hash(idx + 40, seed);
    } else {
      const deg = Math.atan2(rv, ru) / DEG + 180;
      const idx = Math.floor(deg / 30);
      const f = (deg - idx * 30) / 30;
      val = 0.3 + 0.42 * hash(idx, seed);
      if (f < 0.09) val = 0;
      else if (f < 0.18) val += 0.2;
      val -= 0.18 * Math.pow(Math.abs((2 * ax) / H - 1), 3);
    }
    if (c.random(1) < 0.08) val -= 0.18;
    if (c.random(2) < 0.04) val += 0.14;
    return c.pick(ramp, val);
  });
}

/** Planks following the angle round a lid arch lying along x. */
function lidPaint(center: THREE.Vector3) {
  return cellPaint(TEXEL, (c) => {
    const rel = c.at.clone().sub(center);
    const deg = Math.atan2(rel.y, rel.z) / DEG;
    const idx = Math.floor(Math.max(0, Math.min(179.9, deg)) / 30);
    const f = (Math.max(0, Math.min(179.9, deg)) - idx * 30) / 30;
    let val = 0.3 + 0.42 * hash(idx, 14);
    if (f < 0.09) val = 0;
    else if (f < 0.18) val += 0.2;
    if (c.random(1) < 0.08) val -= 0.18;
    if (c.random(2) < 0.04) val += 0.14;
    return c.pick(WOOD, val);
  });
}

function spikePaint(base: number, h: number, bloody: boolean) {
  return cellPaint(TEXEL * 0.8, (c) => {
    const k = (c.at.y - base) / h;
    if (bloody && k > 0.55 && c.random(9) < 0.6 + 0.6 * (k - 0.55)) return c.random(10) < 0.5 ? "#7a1a1a" : "#521010";
    const v = 0.5 + 0.28 * c.n.x + 0.16 * c.n.z + 0.1 * k + 0.1 * (c.random(4) - 0.5);
    return c.pick(IRON, v);
  });
}

// ---------------------------------------------------------------------------------------------------------------
// Build

export default function build() {
  const b = createBuilder({ name: "pixelDungeonProps", paintSize: 2048 });
  const root = b.joint("root", { at: [0, 0, 0] });

  // Chest geometry anchors.
  const CX = 0;
  const CZ = -0.25;
  const lid = b.joint("chestLid", { parent: root, at: [CX, 0.32, CZ - 0.25], dir: [0, 0, 1], role: "hinge" });

  // ---- merge bins: many small flat-colour pieces become one part per bone and colour
  type Bin = { bone: Joint; color: string; geos: THREE.BufferGeometry[] };
  const bins = new Map<string, Bin>();
  const addGeo = (bone: Joint, color: string, geo: THREE.BufferGeometry, at: P, q?: THREE.Quaternion) => {
    if (q) geo.applyQuaternion(q);
    geo.translate(at[0], at[1], at[2]);
    const key = bone.name + color;
    let e = bins.get(key);
    if (!e) {
      e = { bone, color, geos: [] };
      bins.set(key, e);
    }
    e.geos.push(geo);
  };
  const box = (bone: Joint, color: string, size: P, at: P, q?: THREE.Quaternion) =>
    addGeo(bone, color, new THREE.BoxGeometry(size[0], size[1], size[2]), at, q);
  const bar = (bone: Joint, color: string, a: P, c: P, thick: number) => {
    const d = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    const len = d.length();
    addGeo(bone, color, new THREE.BoxGeometry(thick, len, thick), [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2], aim(d));
  };
  const stud = (bone: Joint, color: string, at: P, dir: P, s = 1) => {
    const d = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();
    addGeo(bone, color, new THREE.ConeGeometry(0.018 * s, 0.024 * s, 4), [at[0] + d.x * 0.004, at[1] + d.y * 0.004, at[2] + d.z * 0.004], aim(d));
  };
  const part = (geo: THREE.BufferGeometry, color: string, opts: Record<string, unknown> = {}) =>
    b.part(geo, color, { bone: root, ...opts });

  // =============================================================================================================
  // Chest
  {
    const PLANKS = planksTile(72, 30, 6, WOOD, 3);
    const X = (x: number, y: number, z: number): P => [CX + x, y, CZ + z];
    // body wood
    part(tileBox([0.84, 0.26, 0.5], PLANKS, TEXEL, { rand: rng(5), step: [1, 6] }), WHITE, {
      texture: PLANKS,
      at: X(0, 0.19, 0),
      name: "chestBody",
    });
    // plinth and top band
    part(tileBox([0.9, 0.06, 0.54], IRONTILE, TEXEL), WHITE, { texture: IRONTILE, at: X(0, 0.03, 0), name: "chestPlinth" });
    part(tileBox([0.88, 0.04, 0.53], IRONTILE, TEXEL), WHITE, { texture: IRONTILE, at: X(0, 0.30, 0), name: "chestBand" });
    // body straps and corner posts
    for (const s of [1, -1]) {
      part(tileBox([0.08, 0.26, 0.53], IRONTILE, TEXEL), WHITE, { texture: IRONTILE, at: X(s * 0.24, 0.19, 0), name: "chestStrap" });
      for (const t of [1, -1]) {
        part(tileBox([0.09, 0.3, 0.09], IRONTILE, TEXEL), WHITE, {
          texture: IRONTILE,
          at: X(s * 0.405, 0.21, t * 0.215),
          name: "chestPost",
        });
        stud(root, IRON_L, X(s * 0.405 + s * 0.045, 0.26, t * 0.215), [s, 0, 0]);
        stud(root, IRON_L, X(s * 0.405, 0.26, t * 0.215 + t * 0.045), [0, 0, t]);
        stud(root, IRON_L, X(s * 0.405, 0.1, t * 0.215 + t * 0.045), [0, 0, t]);
        stud(root, IRON_L, X(s * 0.405, 0.36, t * 0.215), [0, 1, 0]);
        stud(root, IRON_L, X(s * 0.24, 0.1, t * 0.268), [0, 0, t]);
        stud(root, IRON_L, X(s * 0.24, 0.26, t * 0.268), [0, 0, t]);
      }
    }
    // lock plate
    box(root, IRON_L, [0.1125, 0.1375, 0.03], X(0, 0.2, 0.268));
    part(new THREE.PlaneGeometry(0.1125, 0.1375), WHITE, {
      at: X(0, 0.2, 0.2835),
      dir: [0, 0, 1],
      axis: "z",
      texture: LOCK,
      name: "chestLock",
    });

    // lid: wooden arch with planks painted by angle, iron arch bands, rim, hasp
    const arc = (rz: number, ry: number, base: number, from: number, to: number, steps = 8): [number, number][] =>
      Array.from({ length: steps + 1 }, (_, k) => {
        const th = (from + ((to - from) * k) / steps) * DEG;
        return [rz * Math.cos(th), base + ry * Math.sin(th)];
      });
    const lidCenter = new THREE.Vector3(CX, 0.36, CZ);
    b.extrude([[-0.25, 0], [0.25, 0], ...arc(0.25, 0.21, 0.04, 0, 180)], {
      at: [CX, 0.32, CZ],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.84,
      color: lidPaint(lidCenter),
      bone: lid,
      name: "chestLid",
    });
    const strapOutline = [
      [0.265, 0],
      ...arc(0.265, 0.225, 0.04, 0, 180),
      [-0.265, 0],
      [-0.235, 0],
      ...arc(0.235, 0.195, 0.04, 180, 0),
      [0.235, 0],
    ] as [number, number][];
    for (const s of [1, -1]) {
      b.extrude(strapOutline, {
        at: [CX + s * 0.24, 0.32, CZ],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.08,
        color: ironPaint,
        bone: lid,
        name: "lidStrap",
      });
      for (const deg of [20, 55, 90, 125, 160]) {
        const th = deg * DEG;
        const n: P = [0, Math.sin(th) / 0.225, Math.cos(th) / 0.265];
        stud(lid, IRON_L, X(s * 0.24, 0.36 + 0.225 * Math.sin(th), 0.265 * Math.cos(th)), n);
      }
    }
    part(tileBox([0.88, 0.03, 0.53], IRONTILE, TEXEL), WHITE, { texture: IRONTILE, bone: lid, at: X(0, 0.335, 0), name: "lidRim" });
    box(lid, IRON_L, [0.07, 0.12, 0.025], X(0, 0.375, 0.268));
    stud(lid, IRON_M, X(0, 0.4, 0.282), [0, 0, 1], 0.8);
    // hinge knuckles at the back
    for (const s of [1, -1]) box(lid, IRON_D, [0.05, 0.04, 0.04], X(s * 0.33, 0.33, -0.26));
  }

  // =============================================================================================================
  // Barrels
  const barrel = (o: {
    base: THREE.Vector3;
    axis: THREE.Vector3;
    R: number;
    H: number;
    ramp: string[];
    seed: number;
    bothLips: boolean;
    name: string;
  }) => {
    const a = o.axis.clone().normalize();
    const u = Math.abs(a.y) > 0.9 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0);
    const v = a.clone().cross(u).normalize();
    const rad = (t: number) => o.R * (0.84 + 0.16 * (1 - (2 * t - 1) ** 2));
    const capR = rad(0);
    const wood = woodPaint(o.base, a, u, v, o.H, capR, o.ramp, o.seed);
    const profile: [number, number][] = [[0, 0]];
    for (let k = 0; k <= 8; k++) profile.push([rad(k / 8), (k / 8) * o.H]);
    profile.push([0, o.H]);
    b.lathe(profile, { at: arr(o.base), axis: arr(a), segments: 12, color: wood, bone: root, name: o.name + "Body" });
    // chime lips
    const lip = (y0: number) => {
      const rout = capR * 0.97;
      b.lathe(
        [
          [rout - 0.045, 0],
          [rout, 0],
          [rout, 0.015],
          [rout - 0.045, 0.015],
        ],
        { at: arr(o.base.clone().addScaledVector(a, y0)), axis: arr(a), segments: 12, color: wood, bone: root, name: o.name + "Lip" },
      );
    };
    lip(o.H);
    if (o.bothLips) lip(-0.015);
    // iron hoops with studs
    for (const t of [0.1, 0.28, 0.72, 0.9]) {
      const yc = t * o.H;
      const y0 = yc - 0.03;
      const y1 = yc + 0.03;
      const rmin = Math.min(rad(y0 / o.H), rad(y1 / o.H)) - 0.015;
      const rmax = Math.max(rad(y0 / o.H), rad(y1 / o.H)) + 0.022;
      b.lathe(
        [
          [rmin, y0],
          [rmax, y0],
          [rmax, y1],
          [rmin, y1],
        ],
        { at: arr(o.base), axis: arr(a), segments: 12, color: ironPaint, bone: root, name: o.name + "Hoop" },
      );
      for (let k = 0; k < 12; k++) {
        const th = k * 30 * DEG;
        const radial = u.clone().multiplyScalar(Math.cos(th)).addScaledVector(v, Math.sin(th));
        const pos = o.base.clone().addScaledVector(a, yc).addScaledVector(radial, rmax * 0.96);
        stud(root, IRON_L, arr(pos), arr(radial));
      }
    }
    return { a, u, v };
  };

  {
    const R = 0.31;
    const H = 0.88;
    barrel({ base: new THREE.Vector3(-1.0, 0, 0.3), axis: new THREE.Vector3(0, 1, 0), R, H, ramp: WOOD, seed: 2, bothLips: false, name: "barrelA" });
    box(root, WOOD_M, [0.06, 0.035, 0.06], [-1.0, H + 0.0325, 0.3]);
    box(root, WOOD_D, [0.04, 0.012, 0.04], [-1.0, H + 0.06, 0.3]);

    // lying barrel on two chocks
    const a = new THREE.Vector3(0.42, 0, 0.91).normalize();
    const Rl = 0.25;
    const Hl = 0.62;
    const centre = new THREE.Vector3(-0.15, Rl * 0.975 + 0.07, 0.62);
    const base = centre.clone().addScaledVector(a, -Hl / 2);
    barrel({ base, axis: a, R: Rl, H: Hl, ramp: REDWOOD, seed: 7, bothLips: true, name: "barrelB" });
    const yaw = Math.atan2(a.x, a.z) / DEG;
    for (const s of [1, -1]) {
      const p = centre.clone().addScaledVector(a, s * 0.2);
      box(root, WOOD_D, [0.24, 0.09, 0.07], [p.x, 0.045, p.z], yawQ(yaw));
      box(root, WOOD_M, [0.24, 0.02, 0.07], [p.x, 0.08, p.z], yawQ(yaw));
    }
  }

  // =============================================================================================================
  // Torches
  const flame = (x: number, y: number, z: number, mirror: boolean) => {
    const sgn = (rows: [number, number][]) => (mirror ? rows.map(([p, q]): [number, number] => [-q, -p]) : rows);
    const OUT = sgn([[-3, 3], [-4, 4], [-4, 4], [-4, 3], [-3, 4], [-3, 3], [-3, 3], [-2, 3], [-2, 2], [-2, 2], [-1, 2], [-1, 1], [-1, 1], [0, 1]]);
    const MID = sgn([[-2, 2], [-3, 3], [-3, 3], [-3, 2], [-2, 3], [-2, 2], [-2, 2], [-1, 2], [-1, 1], [-1, 1], [0, 1]]);
    const INN = sgn([[-1, 1], [-2, 2], [-2, 2], [-1, 2], [-1, 1], [-1, 1], [0, 1]]);
    const layers: [[number, number][], string, number, number][] = [
      [OUT, FIRE_RED, 0.08, 0],
      [MID, FIRE_ORANGE, 0.09, 0.02],
      [INN, FIRE_YELLOW, 0.1, 0.03],
    ];
    for (const [rows, color, thick, lift] of layers) {
      const outline = stepped(rows, 0.02, { rows: true });
      for (const dirX of [[1, 0, 0], [0, 0, 1]] as P[])
        glow(b.extrude(outline, { at: [x, y + lift, z], x: dirX, y: [0, 1, 0], thickness: thick, color, bone: root, name: "flame" }));
    }
    // white-hot core
    glow(
      b.extrude(stepped([[-1, 1], [-1, 1], [0, 1]].map(([p, q]) => (mirror ? [-q, -p] : [p, q])) as [number, number][], 0.02, { rows: true }), {
        at: [x, y + 0.04, z],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.11,
        color: FIRE_WHITE,
        bone: root,
        name: "flameCore",
      }),
    );
  };

  const torch = (x: number, z: number, top: number, mirror: boolean, seed: number) => {
    const bb = top - 0.22;
    // tripod
    for (let k = 0; k < 3; k++) {
      const ang = (90 + 120 * k + seed * 7) * DEG;
      const dx = Math.cos(ang);
      const dz = Math.sin(ang);
      const foot: P = [x + dx * 0.24, 0.03, z + dz * 0.24];
      bar(root, IRON_M, foot, [x + dx * 0.03, 0.32, z + dz * 0.03], 0.048);
      box(root, IRON_D, [0.08, 0.06, 0.08], [foot[0], 0.03, foot[2]], yawQ(ang / DEG));
      stud(root, IRON_L, [foot[0], 0.06, foot[2]], [0, 1, 0]);
    }
    // column
    const colTop = bb + 0.03;
    part(tileBox([0.07, colTop - 0.28, 0.07], IRONTILE, TEXEL), WHITE, { texture: IRONTILE, at: [x, (0.28 + colTop) / 2, z], name: "torchColumn" });
    for (const [y, w] of [[0.3, 0.12], [0.62, 0.1], [bb - 0.025, 0.11]] as [number, number][]) {
      box(root, IRON_D, [w, 0.05, w], [x, y, z]);
      box(root, IRON_L, [w - 0.02, 0.012, w - 0.02], [x, y + 0.03, z]);
    }
    box(root, IRON_M, [0.09, 0.09, 0.09], [x, 0.46, z], yawQ(45));
    box(root, IRON_M, [0.085, 0.085, 0.085], [x, 0.78, z], yawQ(45));
    // cup
    b.lathe(
      [[0, 0], [0.045, 0], [0.075, 0.03], [0.115, 0.085], [0.125, 0.1], [0.108, 0.1], [0.07, 0.06], [0, 0.05]],
      { at: [x, bb, z], segments: 8, color: ironPaint, bone: root, name: "torchCup" },
    );
    // cage bars and rings
    for (let k = 0; k < 8; k++) {
      const th = k * 45 * DEG + 22.5 * DEG;
      const c = Math.cos(th);
      const s = Math.sin(th);
      bar(root, IRON_M, [x + c * 0.118, bb + 0.09, z + s * 0.118], [x + c * 0.145, top, z + s * 0.145], 0.022);
    }
    b.lathe([[0.108, 0], [0.138, 0], [0.138, 0.032], [0.108, 0.032]], { at: [x, bb + 0.085, z], segments: 8, color: ironPaint, bone: root, name: "torchRing" });
    b.lathe([[0.128, 0], [0.16, 0], [0.16, 0.034], [0.128, 0.034]], { at: [x, top - 0.034, z], segments: 8, color: ironPaint, bone: root, name: "torchRing" });
    for (let k = 0; k < 8; k++) {
      const th = k * 45 * DEG;
      stud(root, IRON_L, [x + Math.cos(th) * 0.154, top - 0.017, z + Math.sin(th) * 0.154], [Math.cos(th), 0, Math.sin(th)], 0.8);
    }
    // billets and coals inside
    for (let k = 0; k < 3; k++) {
      const th = (k * 120 + seed * 40) * DEG;
      box(root, WOOD_D, [0.05, 0.13, 0.05], [x + Math.cos(th) * 0.045, bb + 0.115, z + Math.sin(th) * 0.045], yawQ(k * 30));
    }
    glow(part(new THREE.BoxGeometry(0.15, 0.03, 0.15), COAL, { at: [x, bb + 0.085, z], name: "coals" }), 1.2);
    flame(x, bb + 0.1, z, mirror);
    // embers
    const er = rng(60 + seed);
    const embers: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 4; k++)
      embers.push(new THREE.BoxGeometry(0.018, 0.018, 0.018).translate(x + (er() - 0.5) * 0.18, top + 0.2 + k * 0.045 + er() * 0.04, z + (er() - 0.5) * 0.18));
    const mergedEmbers = mergeGeometries(embers);
    if (mergedEmbers) glow(part(mergedEmbers, FIRE_YELLOW, { at: [0, 0, 0], name: "embers" }), 1.3);
  };
  torch(-0.95, -0.45, 1.1, false, 0);
  torch(0.95, -0.5, 1.18, true, 1);

  // =============================================================================================================
  // Spike trap
  {
    const TX = 0.95;
    const TZ = 0.62;
    const STEP = 0.226;
    const R = rng(77);
    const frameBox = (size: P, at: P) =>
      part(tileBox(size, STONETILE, TEXEL, { rand: R, step: [1, 6] }), WHITE, { texture: STONETILE, at, name: "trapFrame" });
    for (const s of [1, -1]) {
      frameBox([0.62, 0.14, 0.14], [TX, 0.07, TZ + s * 0.41]);
      frameBox([0.14, 0.14, 0.62], [TX + s * 0.41, 0.07, TZ]);
      for (const t of [1, -1]) {
        const cxp = TX + s * 0.395;
        const czp = TZ + t * 0.395;
        part(tileBox([0.17, 0.2, 0.17], IRONTILE, TEXEL), WHITE, { texture: IRONTILE, at: [cxp, 0.1, czp], name: "trapCorner" });
        stud(root, IRON_L, [cxp, 0.2, czp], [0, 1, 0], 1.2);
        stud(root, IRON_L, [cxp + s * 0.085, 0.13, czp], [s, 0, 0]);
        stud(root, IRON_L, [cxp, 0.13, czp + t * 0.085], [0, 0, t]);
      }
    }
    part(tileBox([0.68, 0.06, 0.68], FLAGTILE, TEXEL), WHITE, { texture: FLAGTILE, at: [TX, 0.03, TZ], name: "trapFloor" });
    const heights = [0.26, 0.3, 0.24, 0.28, 0.34, 0.25, 0.3, 0.23, 0.28];
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) {
        const k = i * 3 + j;
        const px = TX + (i - 1) * STEP;
        const pz = TZ + (j - 1) * STEP;
        const h = heights[k];
        box(root, IRON_M, [0.12, 0.03, 0.12], [px, 0.075, pz], yawQ(0));
        box(root, IRON_L, [0.12, 0.008, 0.12], [px, 0.094, pz]);
        const geo = new THREE.ConeGeometry(0.052, h, 4);
        geo.rotateY(Math.PI / 4);
        part(geo, IRON_M, { at: [px, 0.09 + h / 2, pz], name: "trapSpike" }).mesh.userData.tag = "spike";
        // repaint with a painted version: replace by painted spike below
      }
    // painted spikes replace flat ones' look: overlay slim painted pyramids slightly larger than the flat cones
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) {
        const k = i * 3 + j;
        const px = TX + (i - 1) * STEP;
        const pz = TZ + (j - 1) * STEP;
        const h = heights[k];
        const geo = new THREE.ConeGeometry(0.054, h + 0.004, 4);
        geo.rotateY(Math.PI / 4);
        part(geo, spikePaint(0.09, h, k % 3 === 1 || k === 4), { at: [px, 0.09 + h / 2, pz], name: "trapSpikePaint" });
      }
  }

  // =============================================================================================================
  // Skull
  {
    const SX = -0.95;
    const SZ = 1.05;
    const yaw = 25;
    const at = (x: number, y: number, z: number): P => {
      const v = new THREE.Vector3(x, 0, z).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw * DEG);
      return [SX + v.x, y, SZ + v.z];
    };
    part(skinBox(SKULLSHEET, SKULL.faces.cranium, 0.016), WHITE, { texture: SKULLSHEET, at: at(0, 0.12, 0), rotation: [0, yaw, 0], name: "skullCranium" });
    part(skinBox(SKULLSHEET, SKULL.faces.face, 0.016), WHITE, { texture: SKULLSHEET, at: at(0, 0.08, 0.1), rotation: [0, yaw, 0], name: "skullFace" });
    part(skinBox(SKULLSHEET, SKULL.faces.jaw, 0.016), WHITE, { texture: SKULLSHEET, at: at(0, 0.026, 0.095), rotation: [0, yaw, 0], name: "skullJaw" });
    // cheekbones and back of the skull
    for (const s of [1, -1]) box(root, BONE_M, [0.03, 0.03, 0.05], at(s * 0.068, 0.09, 0.1), yawQ(yaw));
    box(root, BONE_L, [0.1, 0.06, 0.03], at(0, 0.1, -0.09), yawQ(yaw));
  }

  // =============================================================================================================
  // Bones
  {
    const longBone = (cx: number, cz: number, yaw: number, len: number) => {
      const d: P = [Math.sin(yaw * DEG), 0, Math.cos(yaw * DEG)];
      const perp: P = [d[2], 0, -d[0]];
      part(tileBox([0.032, len - 0.02, 0.032], BONETILE, 0.008), WHITE, { texture: BONETILE, at: [cx, 0.016, cz], dir: d, name: "boneShaft" });
      for (const e of [1, -1]) {
        const ex = cx + (d[0] * e * len) / 2;
        const ez = cz + (d[2] * e * len) / 2;
        for (const s of [1, -1]) box(root, BONE_L, [0.044, 0.04, 0.044], [ex + perp[0] * s * 0.017 - d[0] * e * 0.01, 0.02, ez + perp[2] * s * 0.017 - d[2] * e * 0.01], yawQ(yaw));
        box(root, BONE_M, [0.04, 0.034, 0.034], [ex - d[0] * e * 0.026, 0.017, ez - d[2] * e * 0.026], yawQ(yaw));
      }
    };
    longBone(-0.62, 1.12, 20, 0.34);
    longBone(-0.75, 1.36, -35, 0.3);
    longBone(-0.38, 1.04, 80, 0.26);
    longBone(-1.25, 1.25, 60, 0.24);

    // ribs: arcs of boxes on the floor
    const rib = (cx: number, cz: number, a0: number, r: number) => {
      const pts: P[] = [];
      for (let k = 0; k <= 4; k++) {
        const th = (a0 + k * 24) * DEG;
        pts.push([cx + r * Math.cos(th), 0.014, cz + r * Math.sin(th)]);
      }
      for (let k = 0; k < 4; k++) bar(root, k % 2 ? BONE_M : BONE_L, pts[k], pts[k + 1], 0.028 - k * 0.002);
    };
    rib(-0.52, 1.38, 200, 0.14);
    rib(-0.44, 1.3, 220, 0.13);
    rib(-1.1, 1.38, 20, 0.15);

    // vertebrae and shards
    const vr = rng(90);
    for (const [x, z] of [[-1.15, 0.95], [-1.08, 0.88], [-1.2, 0.86]] as [number, number][]) {
      box(root, BONE_L, [0.045, 0.03, 0.045], [x, 0.015, z], yawQ(vr() * 90));
      box(root, BONE_M, [0.02, 0.034, 0.02], [x, 0.017, z + 0.03], yawQ(vr() * 90));
    }
    for (let k = 0; k < 5; k++) box(root, k % 2 ? BONE_M : BONE_L, [0.03, 0.014, 0.055], [-0.85 + vr() * 0.7, 0.007, 0.95 + vr() * 0.5], yawQ(vr() * 180));
  }

  // =============================================================================================================
  // Spilled coins and rubble
  {
    const stacks: [number, number, number][] = [[0.12, 0.18, 4], [0.2, 0.26, 2], [0.04, 0.3, 3]];
    for (const [x, z, n] of stacks)
      for (let k = 0; k < n; k++)
        addGeo(root, k % 2 ? GOLD_D : GOLD, new THREE.CylinderGeometry(0.03, 0.03, 0.008, 8), [x + (k % 2) * 0.004, 0.004 + k * 0.008, z]);
    for (const [x, z, t] of [[0.3, 0.2, 0.3], [-0.08, 0.34, -0.2], [0.26, 0.36, 0.5], [0.0, 0.16, 0.1]] as [number, number, number][]) {
      const g = new THREE.CylinderGeometry(0.03, 0.03, 0.008, 8);
      g.rotateX(t);
      addGeo(root, GOLD, g, [x, 0.012, z]);
    }
    const rr = rng(123);
    const spots: [number, number][] = [[-0.5, -0.1], [0.55, 0.0], [-0.3, 1.35], [0.2, 1.2], [1.5, 0.3], [-1.45, -0.1], [0.5, -0.75]];
    for (const [x, z] of spots) {
      const s = 0.04 + rr() * 0.05;
      box(root, STONE_M, [s * 1.2, s * 0.6, s], [x, s * 0.28, z], yawQ(rr() * 90));
      if (rr() < 0.6) box(root, IRON_L, [s * 0.6, s * 0.4, s * 0.6], [x + s, s * 0.18, z + s * 0.5], yawQ(rr() * 90));
    }
  }

  // ---- flush merged bins
  for (const e of bins.values()) {
    const merged = mergeGeometries(e.geos);
    if (!merged) throw new Error(`merge failed for ${e.bone.name} ${e.color}`);
    b.part(merged, e.color, { bone: e.bone, at: [0, 0, 0], name: `merged${e.color}` });
  }

  return b.root;
}
