// Tavern corner in the Blizzard/Warcraft style: chunky, heroic proportions, hand-painted oak, iron and brass with warm
// shadow sides, crisp highlight bands, worn paint, rivets and stencilled crates. Plain primitives: three upright oak
// barrels with one lying across their tops, two painted kegs with a brass tap and lever, pewter ale mugs with foam,
// three crates (one open, lid hinged up, straw inside), a plank floor and two plank walls making the corner.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { Builder } from "../src/builder";
import type { Joint } from "../src/skeleton";
import { frame } from "../src/frame";
import { rng } from "../src/math";
import { bezier } from "../src/path";
import { mix, noise, paint, resolve, smoothstep } from "../src/paint";
import type { Paint, Rgb } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Tavern Corner",
  description:
    "A tavern corner: three upright oak barrels with a barrel lying across their tops, two painted kegs with a brass tap and lever, pewter ale mugs with foam, and three crates (one open, lid hinged up, straw inside) on a plank floor against two plank walls.",
  style: "Blizzard/Warcraft",
  commit: "b816db2",
};

type P3 = [number, number, number];
type Ax = "x" | "y" | "z";
type Cask = { H: number; rEnd: number; rMid: number };
type Crate = { cx: number; y0: number; cz: number; w: number; h: number; d: number };

// Key light from above, front and the model's left (+X): the warm shadow side and the painted highlight band follow it.
const L = new THREE.Vector3(0.5, 0.8, 0.45).normalize();
const SHADOW: Rgb = [0.13, 0.05, 0.09];
const LIGHT: Rgb = [1, 0.95, 0.82];
const DARK_GAP: Rgb = [0.1, 0.05, 0.03];

const OAK: Rgb = [0.62, 0.37, 0.18];
const OAK_DEEP: Rgb = [0.4, 0.21, 0.1];
const CRATE: Rgb = [0.74, 0.47, 0.23];
const FLOOR_WOOD: Rgb = [0.5, 0.29, 0.14];
const WALL_WOOD: Rgb = [0.42, 0.24, 0.13];
const CRIMSON: Rgb = [0.7, 0.13, 0.1];
const BARE: Rgb = [0.84, 0.66, 0.42];
const PEWTER: Rgb = [0.7, 0.74, 0.82];
const IRON: Rgb = [0.34, 0.38, 0.45];
const BRASS: Rgb = [0.92, 0.6, 0.2];
const GOLD: Rgb = [1, 0.8, 0.32];
const FOAM: Rgb = [0.98, 0.94, 0.8];
const CREAM: Rgb = [0.97, 0.9, 0.7];
const RED: Rgb = [0.8, 0.14, 0.1];

const AX = { x: 0, y: 1, z: 2 } as const;
const AXIS: Record<Ax, P3> = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
// Two directions across each axis: rings round a barrel and the rivets on them.
const ACROSS: Record<Ax, [P3, P3]> = {
  x: [
    [0, 1, 0],
    [0, 0, 1],
  ],
  y: [
    [1, 0, 0],
    [0, 0, 1],
  ],
  z: [
    [1, 0, 0],
    [0, 1, 0],
  ],
};

const UPRIGHT: Cask = { H: 0.92, rEnd: 0.27, rMid: 0.34 };
const LYING: Cask = { H: 0.84, rEnd: 0.26, rMid: 0.31 };
const KEG: Cask = { H: 0.62, rEnd: 0.21, rMid: 0.265 };
const KEG_LYING: Cask = { H: 0.56, rEnd: 0.2, rMid: 0.255 };
const MUG = { h: 0.13, r0: 0.046, r1: 0.056 };

function scale(c: Rgb, k: number): Rgb {
  return [Math.min(1, c[0] * k), Math.min(1, c[1] * k), Math.min(1, c[2] * k)];
}

/** Painted tone: a warm shadow side, the lit side, and a hard-edged highlight band where the light catches. */
function tone(c: Rgb, n: THREE.Vector3, gloss = 0.5): Rgb {
  const d = n.dot(L);
  const lit = mix(mix(c, SHADOW, 0.55), c, smoothstep(-0.35, 0.3, d));
  return mix(lit, LIGHT, smoothstep(0.8, 0.84, d) * gloss * 0.6);
}

const hue = (c: Rgb, gloss = 0.5) => paint((_p, n) => tone(c, n, gloss));

/** Brushed-metal look: a strong, crisp highlight over a mottled base. */
const metal = (c: Rgb) => paint((p, n) => tone(scale(c, 0.8 + 0.3 * noise(p, 0.02, 2)), n, 1));

function hash(i: number, seed: number) {
  const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Planks laid side by side across one axis (a seam every `width` metres), grain running along another. */
function boards(base: Rgb, across: Ax, along: Ax, width: number, seed: number, gloss = 0.45) {
  return paint((p, n) => {
    const u = p.getComponent(AX[across]) / width;
    const k = Math.floor(u);
    const q = p.clone();
    q.setComponent(AX[along], p.getComponent(AX[along]) * 0.05);
    const streak = noise(q, 0.03, seed);
    const tint = 0.82 + 0.26 * hash(k, seed) + 0.14 * streak;
    const seam = smoothstep(0.008, 0.003, Math.min(u - k, k + 1 - u) * width);
    return tone(mix(scale(base, tint), DARK_GAP, seam * 0.9), n, gloss);
  });
}

/** Staves round a barrel: a dark seam every `360 / count` degrees, grain along the axis, dark chimes at both ends. */
function staves(base: Rgb, count: number, along: Ax, height: number, seed: number) {
  const per = 360 / count;
  return paint((p, n, s) => {
    const u = s[1] / per;
    const k = Math.floor(u);
    const seam = smoothstep(0.9, 0.35, Math.min(u - k, k + 1 - u) * per);
    const chime = Math.max(smoothstep(0.05, 0.025, s[0]), smoothstep(height - 0.05, height - 0.025, s[0]));
    const q = p.clone();
    q.setComponent(AX[along], p.getComponent(AX[along]) * 0.05);
    const tint = 0.84 + 0.24 * hash(k, seed) + 0.12 * noise(q, 0.03, seed);
    return tone(mix(scale(base, tint), DARK_GAP, Math.max(seam * 0.85, chime * 0.5)), n, 0.5);
  });
}

/** A painted keg: mottled crimson, chipped down to bare wood in patches, darker chimes at the ends. */
function painted(base: Rgb, seed: number, height: number) {
  return paint((p, n, s) => {
    const body = scale(base, 0.84 + 0.26 * noise(p, 0.2, seed));
    const chip = smoothstep(0.64, 0.7, noise(p, 0.045, seed + 3));
    const chime = Math.max(smoothstep(0.05, 0.025, s[0]), smoothstep(height - 0.05, height - 0.025, s[0]));
    return tone(mix(mix(body, BARE, chip * 0.7), DARK_GAP, chime * 0.5), n, 0.7);
  });
}

/** Crate face: planks, with a stencilled cream panel and red band on the front when one is asked for. */
function crateSkin(seed: number, front?: { x: number; y: number; w: number; h: number }) {
  const wood = boards(CRATE, "y", "x", 0.11, seed);
  if (!front) return wood;
  return paint((p, n) => {
    if (n.z > 0.8 && Math.abs(p.x - front.x) < front.w && Math.abs(p.y - front.y) < front.h) {
      const edge = Math.abs(p.x - front.x) > front.w * 0.92 || Math.abs(p.y - front.y) > front.h * 0.88;
      const stripe = Math.abs(p.y - front.y) < front.h * 0.2 ? RED : CREAM;
      return tone(edge ? DARK_GAP : stripe, n, 0.6);
    }
    return resolve(wood, p, n);
  });
}

/** Pewter ale mug: a gold band just under the foam and a dark foot. */
function pewterMug(h: number) {
  return paint((p, n, s) => {
    const rim = smoothstep(h - 0.026, h - 0.018, s[0]);
    const foot = smoothstep(0.026, 0.018, s[0]);
    const c = mix(mix(scale(PEWTER, 0.8 + 0.3 * noise(p, 0.03, 9)), GOLD, rim * 0.85), DARK_GAP, foot * 0.6);
    return tone(c, n, 1);
  });
}

const foam = paint((p, n) => tone(scale(FOAM, 0.9 + 0.12 * noise(p, 0.012, 5)), n, 0.3));
const mugBody = pewterMug(MUG.h);

/** Slate with chalk tally marks in columns, for the side wall. */
const slateTally = paint((p, n) => {
  const col = (p.z + 0.2) / 0.04;
  const bar = col - Math.floor(col) > 0.35 && col - Math.floor(col) < 0.5;
  const inside = p.y > 1.0 && p.y < 1.36 && p.z > -0.2 && p.z < 0.2;
  if (bar && inside) return tone(CREAM, n, 0.3);
  return tone(scale([0.16, 0.25, 0.2], 0.85 + 0.3 * noise(p, 0.06, 4)), n, 0.2);
});

/** Geometry already in model space, owned by one bone: placed at the origin so its vertices stay where they are. */
function put(b: Builder, bone: Joint, g: THREE.BufferGeometry, color: Paint) {
  return b.part(g, color, { bone, at: [0, 0, 0] });
}

/** One mesh from many small pieces of one paint. */
function merge(list: THREE.BufferGeometry[]) {
  const g = mergeGeometries(list);
  if (!g) throw new Error("tavernBarrelStack: geometries do not merge");
  return g;
}

const ball = (p: P3, r = 0.013) => new THREE.SphereGeometry(r, 6, 4).translate(p[0], p[1], p[2]);

/** Point on a circle of radius R in the plane spanned by e1 and e2, centred on c. */
function onRing(c: P3, e1: P3, e2: P3, R: number, a: number): P3 {
  const ca = Math.cos(a) * R;
  const sa = Math.sin(a) * R;
  return [c[0] + e1[0] * ca + e2[0] * sa, c[1] + e1[1] * ca + e2[1] * sa, c[2] + e1[2] * ca + e2[2] * sa];
}

/** Radius of a barrel's outline at height share u: a belly, pinched at both ends. */
function rAt(c: Cask, u: number) {
  return c.rEnd + (c.rMid - c.rEnd) * Math.pow(Math.sin(Math.PI * u), 0.6);
}

/** Half-profile of a barrel along its axis: chamfered ends and a full belly. */
function profile(c: Cask): [number, number][] {
  const pts: [number, number][] = [
    [0, 0],
    [c.rEnd - 0.035, 0],
    [c.rEnd, 0.03],
  ];
  for (let k = 1; k < 12; k++) pts.push([rAt(c, k / 12), (c.H * k) / 12]);
  pts.push([c.rEnd, c.H - 0.03], [c.rEnd - 0.035, c.H], [0, c.H]);
  return pts;
}

/** A barrel or keg from `at` (on its axis, at its start) along `axis`: staves, iron or brass hoops with rivets. */
function cask(
  b: Builder,
  bone: Joint,
  c: Cask,
  at: P3,
  axis: Ax,
  o: { body: Paint; band: Paint; rivet: Paint; hoops: number[]; bung?: number },
) {
  const dir = AXIS[axis];
  const [e1, e2] = ACROSS[axis];
  b.lathe(profile(c), { at, axis: dir, segments: 16, color: o.body, bone });
  const rings: THREE.BufferGeometry[] = [];
  const pins: THREE.BufferGeometry[] = [];
  for (const u of o.hoops) {
    const R = rAt(c, u) + 0.004;
    const centre: P3 = [at[0] + dir[0] * c.H * u, at[1] + dir[1] * c.H * u, at[2] + dir[2] * c.H * u];
    const ring = new THREE.TorusGeometry(R, 0.013, 6, 24);
    if (axis === "y") ring.rotateX(Math.PI / 2);
    if (axis === "x") ring.rotateY(Math.PI / 2);
    rings.push(ring.translate(centre[0], centre[1], centre[2]));
    for (let k = 0; k < 8; k++) pins.push(ball(onRing(centre, e1, e2, R + 0.002, (k / 8) * Math.PI * 2)));
  }
  put(b, bone, merge(rings), o.band);
  put(b, bone, merge(pins), o.rivet);
  if (o.bung !== undefined) {
    const y = at[1] + c.H * o.bung;
    const z = at[2] + rAt(c, o.bung) + 0.012;
    const plug = new THREE.CylinderGeometry(0.032, 0.032, 0.05, 8).rotateX(Math.PI / 2);
    put(b, bone, plug.translate(at[0], y, z), hue(OAK_DEEP, 0.6));
  }
}

/** Iron straps round a box (two bands of four) and four corner posts, in model space. */
function straps(c: Crate): THREE.BufferGeometry[] {
  const { cx, y0, cz, w, h, d } = c;
  const out: THREE.BufferGeometry[] = [];
  for (const f of [0.2, 0.84]) {
    const y = y0 + h * f;
    out.push(
      new THREE.BoxGeometry(w + 0.014, 0.046, 0.014).translate(cx, y, cz + d / 2 + 0.002),
      new THREE.BoxGeometry(w + 0.014, 0.046, 0.014).translate(cx, y, cz - d / 2 - 0.002),
      new THREE.BoxGeometry(0.014, 0.046, d + 0.014).translate(cx + w / 2 + 0.002, y, cz),
      new THREE.BoxGeometry(0.014, 0.046, d + 0.014).translate(cx - w / 2 - 0.002, y, cz),
    );
  }
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      out.push(new THREE.BoxGeometry(0.05, h + 0.012, 0.05).translate(cx + (sx * w) / 2, y0 + h / 2, cz + (sz * d) / 2));
  return out;
}

/** Brass rivets on the strap bands: two per face on each side of the crate. */
function strapRivets(c: Crate): THREE.BufferGeometry[] {
  const { cx, y0, cz, w, h, d } = c;
  const out: THREE.BufferGeometry[] = [];
  for (const f of [0.2, 0.84]) {
    const y = y0 + h * f;
    for (const s of [-1, 1]) {
      out.push(
        ball([cx + (s * w) / 3, y, cz + d / 2 + 0.012]),
        ball([cx + (s * w) / 3, y, cz - d / 2 - 0.012]),
        ball([cx + w / 2 + 0.012, y, cz + (s * d) / 3]),
        ball([cx - w / 2 - 0.012, y, cz + (s * d) / 3]),
      );
    }
  }
  return out;
}

/** A closed crate: planks, iron straps, brass rivets; optionally a stencilled front label and an iron carry handle. */
function solidCrate(b: Builder, bone: Joint, c: Crate, seed: number, label: boolean, handle: boolean) {
  const { cx, y0, cz, w, h, d } = c;
  const front = label ? { x: cx, y: y0 + h * 0.36, w: w * 0.3, h: h * 0.14 } : undefined;
  put(b, bone, new THREE.BoxGeometry(w, h, d).translate(cx, y0 + h / 2, cz), crateSkin(seed, front));
  put(b, bone, merge(straps(c)), metal(IRON));
  put(b, bone, merge(strapRivets(c)), metal(BRASS));
  if (handle) {
    const zf = cz + d / 2 + 0.004;
    const yh = y0 + h * 0.66;
    const path = bezier([cx - w * 0.17, yh, zf], [cx - w * 0.17, yh, zf + 0.13], [cx + w * 0.17, yh, zf + 0.13], [cx + w * 0.17, yh, zf]);
    b.sweep(path, 0.012, { color: metal(IRON), bone });
  }
}

/**
 * An open crate: four walls and a floor of planks, straps outside, a lid hinged at the back top edge, straw inside.
 * The lid is posed open after it is built.
 */
function openCrate(b: Builder, bone: Joint, c: Crate, seed: number, straw: THREE.Texture) {
  const { cx, y0, cz, w, h, d } = c;
  const t = 0.03;
  const skin = crateSkin(seed);
  put(
    b,
    bone,
    merge([
      new THREE.BoxGeometry(w, t, d).translate(cx, y0 + t / 2, cz),
      new THREE.BoxGeometry(w, h, t).translate(cx, y0 + h / 2, cz + d / 2 - t / 2),
      new THREE.BoxGeometry(w, h, t).translate(cx, y0 + h / 2, cz - d / 2 + t / 2),
      new THREE.BoxGeometry(t, h, d - 2 * t).translate(cx - w / 2 + t / 2, y0 + h / 2, cz),
      new THREE.BoxGeometry(t, h, d - 2 * t).translate(cx + w / 2 - t / 2, y0 + h / 2, cz),
    ]),
    skin,
  );
  put(b, bone, merge(straps(c)), metal(IRON));
  put(b, bone, merge(strapRivets(c)), metal(BRASS));
  // Hinge knuckle along the back top edge.
  const knuckle = new THREE.CylinderGeometry(0.012, 0.012, w * 0.8, 8).rotateZ(Math.PI / 2);
  put(b, bone, knuckle.translate(cx, y0 + h, cz - d / 2), metal(IRON));

  const lid = b.joint("lidCrate", { at: [cx, y0 + h, cz - d / 2], parent: bone, role: "hinge" });
  put(
    b,
    lid,
    new THREE.BoxGeometry(w + 0.01, 0.03, d + 0.01).translate(cx, y0 + h + 0.015, cz),
    boards(CRATE, "x", "z", 0.1, seed + 1),
  );
  put(
    b,
    lid,
    merge([
      new THREE.BoxGeometry(w + 0.02, 0.012, 0.05).translate(cx, y0 + h + 0.036, cz - d * 0.28),
      new THREE.BoxGeometry(w + 0.02, 0.012, 0.05).translate(cx, y0 + h + 0.036, cz + d * 0.28),
    ]),
    metal(IRON),
  );
  b.pose(lid, { axis: [1, 0, 0], deg: -105 });

  const r = rng(seed);
  const frames = [];
  for (let i = 0; i < 16; i++)
    frames.push(frame([cx + (r() - 0.5) * (w - 0.12), y0 + t + 0.005, cz + (r() - 0.5) * (d - 0.12)], [0, 1, 0]));
  b.cards(frames, straw, { size: [0.07, 0.18], lean: 14, bend: 14, vary: 0.25, rng: rng(seed + 2), bone });
}

/** A pewter ale mug: a lathed body, a foam dome, and a loop handle on the side facing `deg`; `lying` tips it onto its side along x. */
function mug(b: Builder, bone: Joint, x: number, y0: number, z: number, deg: number, lying = false) {
  const at: P3 = [x, y0, z];
  const dx = Math.sin((deg * Math.PI) / 180);
  const dz = Math.cos((deg * Math.PI) / 180);
  b.lathe(
    [
      [0, 0],
      [MUG.r0, 0],
      [MUG.r1, MUG.h],
      [0, MUG.h],
    ],
    { at, axis: lying ? AXIS.x : undefined, segments: 10, color: mugBody, bone },
  );
  b.lathe(
    [
      [0, MUG.h - 0.012],
      [MUG.r1 - 0.004, MUG.h - 0.012],
      [MUG.r1 + 0.003, MUG.h + 0.002],
      [MUG.r1 - 0.006, MUG.h + 0.02],
      [0, MUG.h + 0.03],
    ],
    { at, axis: lying ? AXIS.x : undefined, segments: 10, smoothing: 1, color: foam, bone },
  );
  const p = (k: number, yy: number): P3 => [x + dx * (MUG.r1 + k), y0 + yy, z + dz * (MUG.r1 + k)];
  if (lying) return;
  b.sweep(bezier(p(-0.006, 0.11), p(0.045, 0.125), p(0.045, 0.03), p(-0.006, 0.03)), 0.011, {
    color: metal(IRON),
    bone,
  });
}

export default function build() {
  const b = createBuilder({ name: "tavernBarrelStack", paintSize: 2048 });
  const base = b.joint("base", { at: [0, 0, 0] });
  const straw = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 64">
  <path d="M5 64 C 8 44 3 24 9 2" stroke="#e7bd5b" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M13 64 C 15 40 11 22 16 4" stroke="#c99535" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M21 64 C 18 46 25 24 22 8" stroke="#f1d37c" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M27 64 C 26 42 30 26 28 12" stroke="#b97f2a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
</svg>`,
    { size: 128 },
  );

  // Floor of planks and the two walls of the corner, with a skirting and two battens on the back wall.
  put(b, base, new THREE.BoxGeometry(2.7, 0.06, 2.0).translate(0, 0.03, 0), boards(FLOOR_WOOD, "z", "x", 0.2, 7));
  put(b, base, new THREE.BoxGeometry(2.6, 1.7, 0.06).translate(0, 0.91, -1.0), boards(WALL_WOOD, "x", "y", 0.17, 11));
  put(b, base, new THREE.BoxGeometry(0.06, 1.7, 2.0).translate(-1.3, 0.91, 0), boards(WALL_WOOD, "z", "y", 0.17, 12));
  put(
    b,
    base,
    merge([
      new THREE.BoxGeometry(2.6, 0.1, 0.03).translate(0, 0.11, -0.955),
      new THREE.BoxGeometry(2.6, 0.08, 0.03).translate(0, 0.6, -0.955),
      new THREE.BoxGeometry(2.6, 0.08, 0.03).translate(0, 1.35, -0.955),
    ]),
    boards(OAK_DEEP, "y", "x", 0.1, 3),
  );

  // Wall shelf with two brackets, above the open crate's corner.
  put(b, base, new THREE.BoxGeometry(0.62, 0.035, 0.22).translate(-0.85, 1.2025, -0.86), boards(OAK, "z", "x", 0.11, 21));
  put(
    b,
    base,
    merge([
      new THREE.BoxGeometry(0.035, 0.12, 0.2).translate(-1.1, 1.125, -0.86),
      new THREE.BoxGeometry(0.035, 0.12, 0.2).translate(-0.6, 1.125, -0.86),
    ]),
    hue(OAK_DEEP),
  );

  // Three upright oak barrels, two side by side, with one lying across their tops.
  const oakHoops = { band: metal(IRON), rivet: metal(BRASS) };
  cask(b, base, UPRIGHT, [0.2, 0.06, -0.42], "y", {
    body: staves(OAK, 16, "y", UPRIGHT.H, 31),
    ...oakHoops,
    hoops: [0.12, 0.5, 0.88],
    bung: 0.6,
  });
  cask(b, base, UPRIGHT, [0.9, 0.06, -0.42], "y", {
    body: staves(OAK, 16, "y", UPRIGHT.H, 32),
    ...oakHoops,
    hoops: [0.12, 0.5, 0.88],
    bung: 0.6,
  });
  cask(b, base, LYING, [0.13, 1.28, -0.42], "x", {
    body: staves(OAK, 16, "x", LYING.H, 33),
    ...oakHoops,
    hoops: [0.14, 0.5, 0.86],
  });

  // Two kegs: one upright with a brass tap and a lever, one lying on its side with a bung.
  cask(b, base, KEG, [0.8, 0.06, 0.4], "y", {
    body: painted(CRIMSON, 71, KEG.H),
    band: metal(BRASS),
    rivet: metal(IRON),
    hoops: [0.16, 0.5, 0.84],
  });
  cask(b, base, KEG_LYING, [-0.13, 0.315, 0.7], "x", {
    body: painted(CRIMSON, 72, KEG_LYING.H),
    band: metal(BRASS),
    rivet: metal(IRON),
    hoops: [0.2, 0.5, 0.8],
  });
  put(
    b,
    base,
    new THREE.CylinderGeometry(0.035, 0.035, 0.05, 8).translate(0.15, 0.575, 0.7),
    hue(OAK_DEEP, 0.6),
  );
  // Brass spigot on the upright keg's front, and a lever on a hinge at its tip.
  put(
    b,
    base,
    new THREE.CylinderGeometry(0.02, 0.024, 0.12, 8).rotateX(Math.PI / 2).translate(0.8, 0.18, 0.66),
    metal(BRASS),
  );
  const tap = b.joint("tapLever", { at: [0.8, 0.18, 0.735], parent: base, role: "hinge" });
  put(
    b,
    tap,
    merge([
      new THREE.BoxGeometry(0.028, 0.14, 0.03).translate(0.8, 0.25, 0.735),
      new THREE.SphereGeometry(0.022, 8, 6).translate(0.8, 0.33, 0.735),
    ]),
    metal(BRASS),
  );
  b.pose(tap, { axis: [0, 0, 1], deg: -35 });

  // Three crates: a labelled closed crate with a handle, an open crate with its lid hinged up, a labelled one behind.
  solidCrate(b, base, { cx: -0.52, y0: 0.06, cz: 0.32, w: 0.6, h: 0.5, d: 0.5 }, 41, true, true);
  openCrate(b, base, { cx: -1.04, y0: 0.06, cz: 0.4, w: 0.42, h: 0.44, d: 0.4 }, 51, straw);
  solidCrate(b, base, { cx: -0.55, y0: 0.56, cz: 0.3, w: 0.46, h: 0.42, d: 0.44 }, 61, true, false);

  // Ale mugs: on the shelf, on the top crate, on the upright keg and on the lying barrel.
  const mugs: [number, number, number, number][] = [
    [-1.0, 1.22, -0.86, 90],
    [-0.7, 1.22, -0.84, -60],
    [-0.62, 0.98, 0.42, 60],
    [-0.42, 0.98, 0.4, -40],
    [-0.5, 0.98, 0.18, 150],
    [0.8, 0.68, 0.4, -70],
    [0.55, 1.59, -0.42, 20],
  ];
  for (const [x, y, z, deg] of mugs) mug(b, base, x, y, z, deg);
  // A mug knocked over on the floor, foam end toward the front.
  mug(b, base, 0.62, MUG.r1 + 0.06, 0.85, 0, true);

  // Loose straw on the floor, lying flat.
  const flat = [
    [-0.1, 0.1],
    [0.32, 0.12],
    [-0.3, 0.78],
    [1.04, 0.2],
    [-0.62, -0.5],
  ];
  b.cards(
    flat.map(([x, z]) => frame([x, 0.0625, z], [0, 1, 0])),
    straw,
    { size: [0.09, 0.2], lean: 90, flow: (_f, i) => [Math.cos(i * 1.7), 0, Math.sin(i * 1.7)], vary: 0.2, rng: rng(77), bone: base },
  );

  // A tally board on the side wall: a slate in a dark oak frame, marked in chalk.
  put(b, base, new THREE.BoxGeometry(0.03, 0.46, 0.56).translate(-1.245, 1.2, 0), hue(OAK_DEEP));
  put(b, base, new THREE.BoxGeometry(0.012, 0.4, 0.5).translate(-1.231, 1.2, 0), slateTally);

  return b.root;
}
