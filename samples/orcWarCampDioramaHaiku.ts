import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import { type Frame, frame } from "../src/frame";
import { DEG, rng } from "../src/math";
import { arc, polyline } from "../src/path";
import { cells, mix, noise, paint, type Paint, rgb, type Rgb, smoothstep, type SurfaceCoords } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Orc War Camp",
  description:
    "A stylised orc war camp on a round packed-earth diorama about 3 m across: a plank hut with a hide door flap, a lit window and skull finials, two war banners, two carved totem poles, a log palisade with skull stakes, a weapon rack, a campfire under a tripod cauldron, a chest, crates and a bone pile.",
  style: "Blizzard/Warcraft",
  commit: "b816db2",
};

type V3 = [number, number, number];
type Fill = string | Paint;
type Geo = THREE.BufferGeometry;
type Detail = (p: THREE.Vector3, n: THREE.Vector3, s: SurfaceCoords) => number;

const ROOT = "camp";
/** Top of the packed-earth base; everything stands on it. */
const GY = 0.16;
const FIRE: V3 = [0, GY, 0.1];
const HUT: V3 = [0.45, GY, -0.5];
const LIGHT = new THREE.Vector3(0.45, 0.75, 0.5).normalize();

const WOOD = "#8c5830";
const WOOD_DK = "#55301a";
const WOOD_LT = "#bd7e44";
const BARK = "#5b391f";
const HIDE = "#b48a5a";
const BURLAP = "#a88d5c";
const ROPE = "#8f7650";
const IRON = "#3b4048";
const IRON_LT = "#8d97a2";
const BONE = "#eee3ca";
const RED = "#b9241d";
const GOLD = "#e8b83e";
const BLACK = "#1e1a18";
const STONE = "#7f8182";
const GREEN = "#5f9a34";
const DIRT = "#8f643b";
const MUD = "#4b3323";

const BARREL: number[][] = [
  [0, 0],
  [0.13, 0],
  [0.15, 0.03],
  [0.175, 0.18],
  [0.19, 0.35],
  [0.175, 0.52],
  [0.155, 0.66],
  [0.14, 0.69],
  [0, 0.69],
];
const SACK: number[][] = [
  [0, 0],
  [0.13, 0],
  [0.17, 0.1],
  [0.16, 0.22],
  [0.09, 0.31],
  [0.05, 0.34],
  [0.07, 0.36],
  [0, 0.36],
];
const CAULDRON: number[][] = [
  [0, 0],
  [0.1, 0],
  [0.16, 0.05],
  [0.2, 0.14],
  [0.21, 0.22],
  [0.23, 0.27],
  [0.2, 0.3],
  [0.17, 0.27],
  [0.17, 0.24],
  [0, 0.24],
];
const SHIELD: number[][] = [
  [0, 0],
  [0.2, 0],
  [0.21, 0.02],
  [0.2, 0.035],
  [0, 0.035],
];
const BOSS: number[][] = [
  [0, 0.03],
  [0.07, 0.03],
  [0.08, 0.05],
  [0.06, 0.075],
  [0, 0.085],
];

/** Distance from (px, pz) to the segment a-b, in the ground plane. */
function segDist(px: number, pz: number, ax: number, az: number, bx: number, bz: number) {
  const dx = bx - ax;
  const dz = bz - az;
  const t = Math.min(1, Math.max(0, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz)));
  return Math.hypot(px - (ax + dx * t), pz - (az + dz * t));
}

/** Geometry placed in model space: scale, then rotate (X, Z, then Y, so a yaw turns the whole piece), then move. */
function place(g: Geo, at: V3 = [0, 0, 0], rot: V3 = [0, 0, 0], scale: V3 = [1, 1, 1]): Geo {
  g.scale(scale[0], scale[1], scale[2]);
  g.rotateX(rot[0] * DEG);
  g.rotateZ(rot[2] * DEG);
  g.rotateY(rot[1] * DEG);
  g.translate(at[0], at[1], at[2]);
  return g;
}
const boxG = (w: number, h: number, d: number, at: V3, rot?: V3) => place(new THREE.BoxGeometry(w, h, d), at, rot);
const cylG = (rt: number, rb: number, h: number, seg: number, at: V3, rot?: V3) =>
  place(new THREE.CylinderGeometry(rt, rb, h, seg), at, rot);
const sphG = (r: number, at: V3, scale?: V3) => place(new THREE.SphereGeometry(r, 8, 6), at, undefined, scale);
const coneG = (r: number, h: number, seg: number, at: V3, rot?: V3) => place(new THREE.ConeGeometry(r, h, seg), at, rot);
const torusG = (ring: number, tube: number, at: V3, rot?: V3) =>
  place(new THREE.TorusGeometry(ring, tube, 5, 12), at, rot);
const rockG = (r: number, at: V3, scale: V3, rot: V3) => place(new THREE.DodecahedronGeometry(r, 0), at, rot, scale);

function merged(geos: Geo[]): Geo {
  const m = mergeGeometries(geos.map((g) => (g.index ? g.toNonIndexed() : g)));
  if (!m) throw new Error("orcWarCamp: geometry could not be merged");
  return m;
}

/** A painted surface: a lit gradient (cool shadow to warm highlight) plus a per-texel detail in roughly -0.5..0.5. */
function shade(base: string, detail: Detail = () => 0): Paint {
  const [r, g, b] = rgb(base);
  const mid: Rgb = [r, g, b];
  const dark: Rgb = [r * 0.4, g * 0.34, b * 0.6 + 0.03];
  const light: Rgb = [Math.min(1, r * 1.12 + 0.1), Math.min(1, g * 1.1 + 0.09), Math.min(1, b * 1.05 + 0.05)];
  return paint((p, n, s) => {
    const t = Math.min(1, Math.max(0, 0.05 + 0.85 * smoothstep(-0.6, 0.6, n.dot(LIGHT)) + detail(p, n, s)));
    return t < 0.5 ? mix(dark, mid, t * 2) : mix(mid, light, (t - 0.5) * 2);
  });
}

const grainD = (seed: number, sc: V3 = [3, 22, 3], amount = 0.35): Detail => {
  const q = new THREE.Vector3();
  return (p) => {
    q.set(p.x * sc[0], p.y * sc[1], p.z * sc[2]);
    return (noise(q, 0.3, seed) - 0.5) * amount;
  };
};
const mottleD = (size: number, seed: number, amount = 0.35): Detail => (p) => (noise(p, size, seed) - 0.5) * amount;
const planksD = (axis: "x" | "y" | "z", width: number, seed: number): Detail => {
  const g = grainD(seed, [2, 2, 2], 0.2);
  return (p, n, s) => {
    const c = axis === "x" ? p.x : axis === "y" ? p.y : p.z;
    const k = Math.floor(c / width);
    const f = c / width - k;
    const seam = f < 0.06 ? -0.45 : 0;
    const shift = ((((k * 37 + seed) % 7) + 7) % 7) / 7 * 0.16 - 0.08;
    return seam + shift + g(p, n, s);
  };
};
const stoneD =
  (size: number, seed: number): Detail =>
  (p) => {
    const c = cells(p, size, seed);
    return (c.d2 - c.d1 < 0.1 ? -0.4 : 0) + (c.id - 0.5) * 0.3 + (noise(p, 0.05, seed + 3) - 0.5) * 0.3;
  };
const ringsD =
  (cx: number, cz: number, spacing: number): Detail =>
  (p) => {
    const d = Math.hypot(p.x - cx, p.z - cz) / spacing;
    return (d - Math.floor(d) < 0.12 ? -0.35 : 0) + (noise(p, 0.08, 21) - 0.5) * 0.25;
  };
const barrelD: Detail = (p, _n, s) => {
  const f = s[1] / 30;
  return (f - Math.floor(f) < 0.08 ? -0.4 : 0) + (noise(p, 0.1, 22) - 0.5) * 0.25;
};
const hideD: Detail = (p) => {
  const f = (p.x + p.y) / 0.035;
  return (f - Math.floor(f) < 0.12 ? -0.25 : 0) + (noise(p, 0.3, 14) - 0.5) * 0.3;
};
const thatchD: Detail = (p) => {
  const f = p.y / 0.075 + (p.x - 0.45) * 0.4;
  return (f - Math.floor(f) < 0.5 ? 0.08 : -0.2) + (noise(p, 0.05, 15) - 0.5) * 0.35;
};
const boneD: Detail = (p) => (noise(p, 0.03, 12) > 0.8 ? -0.25 : 0) + (noise(p, 0.15, 13) - 0.5) * 0.2;

const P = {
  wood: shade(WOOD, grainD(1)),
  woodDk: shade(WOOD_DK, grainD(2)),
  woodLt: shade(WOOD_LT, grainD(3)),
  bark: shade(BARK, grainD(4, [4, 14, 4], 0.5)),
  endLt: shade(WOOD_LT, grainD(5, [9, 9, 9], 0.5)),
  plankW: shade(WOOD, planksD("y", 0.1, 41)),
  plankD: shade(WOOD_DK, planksD("y", 0.09, 42)),
  crate: shade(WOOD_LT, planksD("y", 0.07, 43)),
  barrel: shade(WOOD, barrelD),
  iron: shade(IRON, mottleD(0.08, 5, 0.25)),
  ironLt: shade(IRON_LT, mottleD(0.1, 6, 0.2)),
  bone: shade(BONE, boneD),
  red: shade(RED, mottleD(0.2, 7, 0.3)),
  hide: shade(HIDE, hideD),
  burlap: shade(BURLAP, mottleD(0.04, 8, 0.4)),
  rope: shade(ROPE, grainD(10, [8, 8, 8], 0.4)),
  stone: shade(STONE, stoneD(0.16, 9)),
  thatch: shade("#8f6434", thatchD),
  stew: shade("#4f6b2a", (p) => (noise(p, 0.06, 16) - 0.5) * 0.6),
  green: shade("#3f8a3a", mottleD(0.2, 17, 0.3)),
};

/** Log sides bark, cut ends (s[0] at 0 or 1 on a sweep) light wood. */
const logP = paint((_p, _n, s) => (s[0] < 0.03 || s[0] > 0.97 ? P.endLt : P.bark));
/** Log ends on a cylinder standing along z: the faces that point along z. */
const logEndP = paint((_p, n) => (Math.abs(n.z) > 0.7 ? P.endLt : P.bark));

const gableP = paint((_p, _n, s) => {
  if (Math.abs(s[1] - 0.12) < 0.022 && Math.abs(s[0]) < 0.36) return P.red;
  if (Math.hypot(s[0], s[1] - 0.22) < 0.045) return P.bone;
  return P.plankW;
});

const earthSide = shade("#5a3f27", stoneD(0.12, 8));
const dirtP = shade(DIRT, mottleD(0.25, 4, 0.4));
const mudP = shade(MUD, mottleD(0.1, 5, 0.45));
const grassP = shade(GREEN, (p) => (noise(p, 0.2, 6) - 0.5) * 0.6 + (noise(p, 0.03, 7) - 0.5) * 0.25);
const grassDryP = shade("#8d9a3c", (p) => (noise(p, 0.2, 16) - 0.5) * 0.5);
const groundP = paint((p, n) => {
  if (n.y < 0.5) return earthSide;
  const r = Math.hypot(p.x, p.z);
  if (Math.hypot(p.x - FIRE[0], p.z - FIRE[2]) < 0.36) return mudP;
  const path = segDist(p.x, p.z, HUT[0], -0.1, FIRE[0], FIRE[2]);
  const wear = smoothstep(1.35, 0.9, r) * 0.7 + noise(p, 0.5, 9) * 0.55;
  if (wear > 0.7 || path < 0.11) return dirtP;
  return r > 1.15 ? grassDryP : grassP;
});

/** Banner cloth: red (or dark) field, gold border, a painted sigil on the centre. */
function bannerPaint(field: string, sigil: string): Paint {
  const cloth = shade(field, mottleD(0.05, 31, 0.2));
  const mark = shade(sigil);
  const trim = shade(GOLD);
  return paint((_p, _n, s) => {
    const [x, y] = s;
    if (Math.abs(x) > 0.19 || y < -0.76) return trim;
    const d = Math.hypot(x, y + 0.38);
    if (d > 0.1 && d < 0.13) return mark;
    if (d <= 0.1) return Math.hypot(x, y + 0.4) < 0.045 ? P.bone : cloth;
    return Math.hypot(Math.abs(x) - 0.1, y + 0.22) < 0.03 ? P.bone : cloth;
  });
}

/** Round shield: alternating wedges of two colours, a black band and an iron boss. */
function shieldPaint(c: V3, axis: V3, a: Paint, bb: Paint): Paint {
  const C = new THREE.Vector3(...c);
  const A = new THREE.Vector3(...axis).normalize();
  const q = new THREE.Vector3();
  return paint((p) => {
    q.copy(p).sub(C);
    q.addScaledVector(A, -q.dot(A));
    const d = q.length() / 0.2;
    if (d > 0.9 || d < 0.2) return P.iron;
    if (d > 0.78) return BLACK;
    const ang = Math.atan2(q.y, q.x + q.z);
    return Math.floor((ang + Math.PI) / (Math.PI / 4)) % 2 === 0 ? a : bb;
  });
}

const GRASS_A = `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 48 C12 34 5 22 2 6 C12 18 15 30 16 40 C17 28 22 14 30 2 C25 20 20 34 16 48Z" fill="#6aa83a"/>
  <path d="M16 48 C14 36 12 26 10 16 C15 26 17 36 17 48Z" fill="#3c7428"/>
</svg>`;
const GRASS_B = `<svg viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 48 C12 34 6 24 4 10 C12 20 15 32 16 42 C18 30 23 18 29 6 C25 22 20 36 16 48Z" fill="#b8974c"/>
  <path d="M16 48 C15 38 14 28 13 18 C16 28 17 38 17 48Z" fill="#7d6230"/>
</svg>`;

export default function build() {
  const b = createBuilder({ name: "orcWarCamp", paintSize: 2048 });
  const rnd = rng(7);

  // Static pieces with the same colour and bone merge into one part per group.
  const buckets = new Map<string, { group: string; color: Fill; bone: string; geos: Geo[] }>();
  const add = (group: string, color: Fill, geos: Geo | Geo[], bone = ROOT) => {
    const key = `${group}|${bone}|${typeof color === "string" ? color : `paint${color.id}`}`;
    const hit = buckets.get(key) ?? { group, color, bone, geos: [] };
    buckets.set(key, hit);
    hit.geos.push(...(Array.isArray(geos) ? geos : [geos]));
  };
  const solo = (group: string, color: Fill, geo: Geo, bone = ROOT) => b.part(geo, color, { bone, at: [0, 0, 0], group });
  const shield = (group: string, c: V3, axis: V3, a: Paint, bb: Paint) => {
    b.lathe(SHIELD, { at: c, axis, segments: 16, color: shieldPaint(c, axis, a, bb), bone: ROOT, group });
    b.lathe(BOSS, { at: c, axis, segments: 12, color: P.iron, bone: ROOT, group });
  };

  // Horned orc skull, built facing +Z and turned by yaw (degrees). Offsets are in skull units; s scales it.
  const skull = (group: string, x: number, y: number, z: number, s: number, yaw: number) => {
    const c = Math.cos(yaw * DEG);
    const sn = Math.sin(yaw * DEG);
    const at = (dx: number, dy: number, dz: number): V3 => [
      x + s * (dx * c + dz * sn),
      y + s * dy,
      z + s * (dz * c - dx * sn),
    ];
    const ry: V3 = [0, yaw, 0];
    const bone: Geo[] = [sphG(0.085 * s, at(0, 0, 0), [1, 0.92, 1.05])];
    bone.push(boxG(0.13 * s, 0.035 * s, 0.05 * s, at(0, 0.03, 0.075), ry));
    bone.push(boxG(0.11 * s, 0.05 * s, 0.085 * s, at(0, -0.07, 0.055), ry));
    for (const e of [-1, 1]) {
      bone.push(coneG(0.016 * s, 0.11 * s, 5, at(e * 0.05, -0.05, 0.11), [25, yaw, -e * 8]));
      bone.push(coneG(0.035 * s, 0.16 * s, 6, at(e * 0.09, 0.1, -0.02), [0, yaw, -e * 28]));
    }
    const dark: Geo[] = [];
    for (const e of [-1, 1]) dark.push(sphG(0.03 * s, at(e * 0.04, 0, 0.07)));
    dark.push(boxG(0.025 * s, 0.04 * s, 0.02 * s, at(0, -0.025, 0.09), ry));
    add(group, P.bone, bone);
    add(group, BLACK, dark);
  };

  // Joints: the static camp is the root; the door flap, chest lid are the only movers.
  b.joint(ROOT, { at: [0, 0, 0] });
  b.joint("doorFlap", { parent: ROOT, at: [0.45, GY + 0.62, -0.085], role: "hinge" });
  b.joint("chestLid", { parent: ROOT, at: [-0.46, GY + 0.2, -0.32], role: "hinge" });

  // ---- Base: packed earth with a stone rim and grass beyond the camp ----
  b.lathe([[0, 0], [1.38, 0], [1.46, 0.05], [1.5, 0.12], [1.46, GY], [0, GY]], {
    at: [0, 0, 0],
    segments: 28,
    color: groundP,
    bone: ROOT,
    name: "ground",
  });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + rnd() * 0.3;
    const r = 1.4 + rnd() * 0.06;
    add(
      "rim",
      P.stone,
      rockG(0.07 + rnd() * 0.05, [Math.sin(a) * r, GY + 0.01, Math.cos(a) * r], [1.25, 0.75, 1], [rnd() * 30, rnd() * 180, rnd() * 30]),
    );
  }

  // ---- Campfire: stone ring, logs, flames, embers, tripod and cauldron ----
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    add(
      "fire",
      P.stone,
      rockG(0.075, [FIRE[0] + Math.cos(a) * 0.27, GY + 0.03, FIRE[2] + Math.sin(a) * 0.27], [1.1, 0.8, 1], [0, a / DEG, 0]),
    );
  }
  const logs: [V3, V3][] = [
    [
      [-0.26, GY + 0.04, 0.02],
      [0.2, GY + 0.1, 0.2],
    ],
    [
      [-0.2, GY + 0.05, 0.22],
      [0.24, GY + 0.05, 0.0],
    ],
    [
      [0.04, GY + 0.05, -0.16],
      [-0.14, GY + 0.1, 0.36],
    ],
  ];
  logs.forEach((pts, i) => b.sweep(pts, 0.045, { color: logP, bone: ROOT, name: `log${i}` }));
  const flame = (x: number, y: number, z: number, r: number, h: number, rx: number, rz: number, col: string) =>
    glow(b.part(coneG(r, h, 6, [x, y, z], [rx, 0, rz]), col, { bone: ROOT, at: [0, 0, 0], group: "fire" }), 1.2);
  flame(0, GY + 0.22, FIRE[2], 0.16, 0.44, 0, 0, "#ff5a10");
  flame(0.1, GY + 0.18, FIRE[2] + 0.06, 0.12, 0.36, 0, -14, "#ff6a14");
  flame(-0.1, GY + 0.17, FIRE[2] - 0.04, 0.11, 0.34, 0, 16, "#ff6a14");
  flame(0.03, GY + 0.16, FIRE[2] - 0.12, 0.1, 0.3, 10, 0, "#ff8a20");
  flame(0, GY + 0.2, FIRE[2], 0.08, 0.34, 0, 0, "#ffd040");
  flame(0.06, GY + 0.15, FIRE[2] + 0.04, 0.05, 0.24, 0, -10, "#fff0a0");
  const embers: Geo[] = [];
  for (let i = 0; i < 8; i++) {
    const a = i * 0.8 + 0.3;
    const r = 0.13 + (i % 3) * 0.04;
    embers.push(sphG(0.014, [FIRE[0] + Math.cos(a) * r, GY + 0.02 + (i % 2) * 0.05, FIRE[2] + Math.sin(a) * r]));
  }
  glow(solo("fire", "#ffb23a", merged(embers)), 1.2);
  glow(solo("fire", "#ff6418", cylG(0.22, 0.22, 0.012, 12, [FIRE[0], GY + 0.012, FIRE[2]])), 0.8);

  const apex: V3 = [FIRE[0], GY + 1.7, FIRE[2]];
  for (let i = 0; i < 3; i++) {
    const a = i * ((Math.PI * 2) / 3);
    const foot: V3 = [FIRE[0] + Math.cos(a) * 0.46, GY + 0.01, FIRE[2] + Math.sin(a) * 0.46];
    b.rod(foot, apex, [0.028, 0.02], { color: P.woodDk, bone: ROOT, name: `tripodLeg${i}` });
  }
  add("tripod", P.rope, torusG(0.04, 0.014, [FIRE[0], GY + 1.6, FIRE[2]], [90, 0, 0]));
  b.rod(apex, [FIRE[0], GY + 0.86, FIRE[2]], 0.009, { color: P.iron, bone: ROOT, name: "chain" });
  b.lathe(CAULDRON, { at: [FIRE[0], GY + 0.45, FIRE[2]], segments: 14, color: P.iron, bone: ROOT, name: "cauldron" });
  add("cauldron", P.stew, cylG(0.165, 0.165, 0.02, 14, [FIRE[0], GY + 0.7, FIRE[2]]));
  add(
    "cauldron",
    P.iron,
    [-1, 1].map((s) => torusG(0.035, 0.012, [FIRE[0] + s * 0.23, GY + 0.6, FIRE[2]], [0, 90, 0])),
  );
  const rivets: Geo[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    rivets.push(sphG(0.011, [FIRE[0] + Math.cos(a) * 0.205, GY + 0.72, FIRE[2] + Math.sin(a) * 0.205]));
  }
  add("cauldron", P.ironLt, rivets);

  // ---- Seats: three log stumps, one with an axe ----
  const stumps: [number, number][] = [
    [-0.62, 0.22],
    [0.45, 0.5],
    [0.0, 0.7],
  ];
  stumps.forEach(([x, z], i) => {
    const top = shade(WOOD_LT, ringsD(x, z, 0.035));
    solo(`stump${i}`, paint((_p, n) => (n.y > 0.5 ? top : P.bark)), cylG(0.2, 0.22, 0.28, 12, [x, GY + 0.14, z]));
  });
  b.rod([0.45, GY + 0.22, 0.5], [0.45, GY + 0.86, 0.5], [0.02, 0.017], { color: P.woodLt, bone: ROOT, name: "axeHaft" });
  b.extrude(
    [
      [-0.02, 0.1],
      [0.08, 0.1],
      [0.14, 0.06],
      [0.16, -0.04, "sharp"],
      [0.1, -0.12],
      [0, -0.12],
      [-0.02, -0.05],
    ],
    { at: [0.45, GY + 0.8, 0.5], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.02, bevel: 0.004, color: P.ironLt, bone: ROOT, group: "axe" },
  );

  // ---- The hut: plank walls, hide door flap on a hinge, lit window, thatch roof, skull finials ----
  const hx = HUT[0];
  const hz = HUT[2];
  const wy = GY + 0.45;
  add("hut", P.plankW, [
    boxG(0.9, 0.9, 0.06, [hx, wy, hz - 0.37]),
    boxG(0.06, 0.9, 0.8, [0.87, wy, hz]),
    boxG(0.06, 0.9, 0.8, [0.03, wy, hz]),
    boxG(0.27, 0.9, 0.06, [0.765, wy, -0.13]),
    boxG(0.27, 0.9, 0.06, [0.135, wy, -0.13]),
    boxG(0.36, 0.28, 0.06, [0.45, GY + 0.76, -0.13]),
  ]);
  add("hut", P.plankD, boxG(0.84, 0.02, 0.74, [hx, GY + 0.01, hz]));
  add("hut", P.woodDk, [
    boxG(0.08, 1.0, 0.08, [0.0, GY + 0.5, -0.1]),
    boxG(0.08, 1.0, 0.08, [0.9, GY + 0.5, -0.1]),
    boxG(0.08, 1.0, 0.08, [0.0, GY + 0.5, -0.9]),
    boxG(0.08, 1.0, 0.08, [0.9, GY + 0.5, -0.9]),
  ]);
  for (const y of [GY + 0.3, GY + 0.66]) {
    add("hut", P.iron, [
      boxG(0.92, 0.03, 0.012, [hx, y, -0.906]),
      boxG(0.012, 0.03, 0.82, [-0.006, y, hz]),
      boxG(0.012, 0.03, 0.82, [0.906, y, hz]),
      boxG(0.27, 0.03, 0.012, [0.765, y, -0.094]),
      boxG(0.27, 0.03, 0.012, [0.135, y, -0.094]),
    ]);
    add(
      "hut",
      P.ironLt,
      [
        [0.1, y, -0.906],
        [0.8, y, -0.906],
        [-0.006, y, -0.8],
        [-0.006, y, -0.2],
        [0.906, y, -0.8],
        [0.906, y, -0.2],
        [0.66, y, -0.094],
        [0.88, y, -0.094],
        [0.02, y, -0.094],
        [0.25, y, -0.094],
      ].map((q) => sphG(0.012, q as V3)),
    );
  }
  b.extrude([[-0.45, 0], [0.45, 0], [0, 0.35, "sharp"]], {
    at: [hx, GY + 0.9, -0.13],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.06,
    color: gableP,
    bone: ROOT,
    name: "gableFront",
  });
  b.extrude([[-0.45, 0], [0.45, 0], [0, 0.35, "sharp"]], {
    at: [hx, GY + 0.9, -0.87],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.06,
    color: gableP,
    bone: ROOT,
    name: "gableBack",
  });
  add("hut", P.thatch, [
    boxG(0.66, 0.05, 1.0, [hx + 0.265, GY + 1.075, hz], [0, 0, -33.4]),
    boxG(0.66, 0.05, 1.0, [hx - 0.265, GY + 1.075, hz], [0, 0, 33.4]),
  ]);
  add("hut", P.woodDk, [
    boxG(0.07, 0.07, 1.02, [hx + 0.53, GY + 0.9, hz]),
    boxG(0.07, 0.07, 1.02, [hx - 0.53, GY + 0.9, hz]),
    boxG(0.08, 0.08, 1.04, [hx, GY + 1.25, hz]),
  ]);
  skull("hut", hx, GY + 1.36, -0.08, 0.9, 0);
  skull("hut", hx, GY + 1.36, -0.92, 0.9, 180);
  skull("hut", 0.78, GY + 0.74, -0.09, 0.5, 0);
  skull("hut", 0.12, GY + 0.74, -0.09, 0.5, 0);
  add("hut", P.hide, boxG(0.3, 0.46, 0.02, [hx - 0.05, GY + 0.45, -0.925]));
  skull("hut", hx - 0.3, GY + 0.8, -0.93, 0.5, 180);
  skull("hut", hx + 0.25, GY + 0.8, -0.93, 0.45, 180);
  // Warm interior seen through the door, a fur bed, and a lit window on the right wall.
  glow(solo("hut", "#ff9a2e", boxG(0.36, 0.5, 0.02, [hx, GY + 0.35, -0.82])), 1);
  add("hut", P.hide, boxG(0.4, 0.08, 0.26, [hx, GY + 0.08, -0.7]));
  glow(solo("hut", "#ffb347", boxG(0.014, 0.2, 0.14, [-0.008, GY + 0.6, -0.42])), 1.2);
  add("hut", P.woodDk, [
    boxG(0.016, 0.24, 0.02, [-0.008, GY + 0.6, -0.5]),
    boxG(0.016, 0.24, 0.02, [-0.008, GY + 0.6, -0.34]),
    boxG(0.016, 0.02, 0.2, [-0.008, GY + 0.71, -0.42]),
    boxG(0.016, 0.02, 0.2, [-0.008, GY + 0.49, -0.42]),
  ]);
  // The door flap: a hide hung from a bar on the lintel, swinging on the doorFlap hinge.
  add("doorFlap", P.hide, boxG(0.34, 0.6, 0.02, [0.45, GY + 0.32, -0.085]));
  add("doorFlap", P.woodDk, boxG(0.38, 0.03, 0.035, [0.45, GY + 0.62, -0.085]));
  add("doorFlap", P.bone, [boxG(0.02, 0.1, 0.012, [0.3, GY + 0.3, -0.07]), boxG(0.02, 0.1, 0.012, [0.6, GY + 0.3, -0.07])]);

  // Shields on the hut walls and the rack
  shield("hut", [0.906, GY + 0.5, -0.3], [1, 0, 0], P.red, P.bone);
  shield("hut", [-0.006, GY + 0.5, -0.8], [-1, 0, 0], P.bone, P.red);

  // ---- Totem poles ----
  const totem = (group: string, x: number, z: number, k: number, face: Paint = P.red) => {
    const Y = (h: number) => GY + h * k;
    add(group, P.stone, cylG(0.2, 0.22, 0.16, 9, [x, GY + 0.08, z]));
    add(group, P.wood, cylG(0.12, 0.13, Y(1.9) - GY - 0.16, 9, [x, (Y(1.9) + GY + 0.16) / 2, z]));
    add(group, P.rope, torusG(0.14, 0.022, [x, Y(0.3), z], [90, 0, 0]));
    add(group, face, boxG(0.36, 0.3 * k, 0.22, [x, Y(0.62), z + 0.08]));
    add(group, P.woodDk, boxG(0.07, 0.1 * k, 0.06, [x, Y(0.6), z + 0.23]));
    add(group, BLACK, boxG(0.22, 0.07 * k, 0.03, [x, Y(0.5), z + 0.21]));
    for (const i of [-1, 0, 1]) add(group, P.bone, boxG(0.04, 0.035 * k, 0.02, [x + i * 0.05, Y(0.535), z + 0.225]));
    add(group, P.iron, torusG(0.135, 0.02, [x, Y(0.92), z], [90, 0, 0]));
    add(group, P.woodLt, boxG(0.3, 0.24 * k, 0.2, [x, Y(1.15), z + 0.08]));
    add(group, P.bone, boxG(0.22, 0.14 * k, 0.03, [x, Y(1.15), z + 0.2]));
    add(group, P.woodDk, coneG(0.04, 0.08, 3, [x, Y(1.1), z + 0.23], [90, 0, 0]));
    add(group, P.rope, torusG(0.13, 0.02, [x, Y(1.45), z], [90, 0, 0]));
    add(group, P.woodDk, boxG(0.3, 0.05, 0.22, [x, Y(1.52), z + 0.04]));
    for (const s of [-1, 1]) {
      add(group, P.bone, sphG(0.05, [x + s * 0.085, Y(0.66), z + 0.2], [1, 1, 0.7]));
      add(group, BLACK, sphG(0.022, [x + s * 0.085, Y(0.66), z + 0.235]));
      add(group, BLACK, boxG(0.17, 0.035, 0.07, [x + s * 0.09, Y(0.74), z + 0.2], [0, 0, -s * 14]));
      add(group, P.bone, coneG(0.022, 0.12, 5, [x + s * 0.12, Y(0.5), z + 0.2], [15, 0, -s * 20]));
      add(group, P.hide, boxG(0.12, 0.42 * k, 0.012, [x + s * 0.17, Y(1.2), z + 0.07], [0, 0, s * 4]));
      add(group, BLACK, boxG(0.07, 0.05 * k, 0.02, [x + s * 0.055, Y(1.17), z + 0.22]));
    }
    skull(group, x, Y(1.6), z + 0.05, 0.95, 0);
  };
  totem("totemA", -0.98, 0.5, 1.0);
  totem("totemB", 0.98, 0.45, 0.82, P.green);

  // ---- War banners on poles ----
  const banner = (group: string, px: number, pz: number, field: string, sigil: string) => {
    add(group, P.woodDk, cylG(0.03, 0.035, 2.15, 8, [px, GY + 1.075, pz]));
    add(group, P.iron, coneG(0.035, 0.14, 6, [px, GY + 2.22, pz]));
    add(group, P.woodDk, cylG(0.018, 0.018, 0.6, 8, [px, GY + 2.0, pz], [0, 0, 90]));
    add(group, P.iron, [sphG(0.02, [px - 0.3, GY + 2.0, pz]), sphG(0.02, [px + 0.3, GY + 2.0, pz])]);
    b.extrude(
      [
        [-0.22, 0],
        [0.22, 0],
        [0.22, -0.8],
        [0, -0.66, "sharp"],
        [-0.22, -0.8],
      ],
      { at: [px, GY + 2.0, pz + 0.03], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, bevel: 0.003, color: bannerPaint(field, sigil), bone: ROOT, group },
    );
  };
  banner("bannerA", -0.62, -0.98, RED, BLACK);
  banner("bannerB", 1.12, 0.05, "#2b2320", RED);

  // ---- Log palisade behind the camp, with skulls and lashed rails ----
  for (let i = 0; i < 16; i++) {
    const deg = 105 + i * 10;
    const th = deg * DEG;
    const x = 1.42 * Math.sin(th);
    const z = 1.42 * Math.cos(th);
    const H = 1.0 + rnd() * 0.32;
    add("palisade", P.wood, cylG(0.034, 0.05, H, 6, [x, GY + H / 2, z]));
    if (i === 3 || i === 8 || i === 13) skull("palisade", x, GY + H + 0.04, z, 0.8, deg);
    else add("palisade", P.woodLt, coneG(0.04, 0.14, 6, [x, GY + H + 0.07, z]));
    if (i === 5 || i === 11) {
      b.extrude(
        [
          [0, 0.05],
          [0.2, 0.0],
          [0, -0.09],
        ],
        { at: [x, GY + H - 0.12, z], x: [Math.cos(th), 0, -Math.sin(th)], y: [0, 1, 0], thickness: 0.006, color: P.red, bone: ROOT, group: "palisade" },
      );
    }
  }
  for (const y of [0.5, 0.92]) {
    const pts: V3[] = [];
    for (let deg = 100; deg <= 260; deg += 8) {
      const th = deg * DEG;
      pts.push([1.41 * Math.sin(th), GY + y, 1.41 * Math.cos(th)]);
    }
    b.sweep(polyline(pts), 0.022, { color: P.woodDk, bone: ROOT, name: `rail${y}` });
  }

  // ---- Weapon rack with a shield and two spears ----
  const rx0 = -0.7;
  const rx1 = -1.12;
  const rz = -0.22;
  add("rack", P.woodDk, [
    cylG(0.03, 0.035, 1.2, 8, [rx0, GY + 0.6, rz]),
    cylG(0.03, 0.035, 1.2, 8, [rx1, GY + 0.6, rz]),
    cylG(0.022, 0.022, 0.45, 8, [(rx0 + rx1) / 2, GY + 1.0, rz], [0, 0, 90]),
  ]);
  shield("rack", [(rx0 + rx1) / 2, GY + 0.6, rz], [0, 0, 1], P.red, P.bone);
  b.rod([-0.91, GY + 1.0, rz], [-0.91, GY + 0.8, rz], 0.008, { color: P.rope, bone: ROOT, name: "shieldStrap" });
  const spears: [V3, V3][] = [
    [
      [-0.6, GY, -0.1],
      [-0.62, GY + 1.8, -0.14],
    ],
    [
      [-1.2, GY, -0.1],
      [-1.22, GY + 1.7, -0.14],
    ],
  ];
  for (const [foot, top] of spears) {
    b.rod(foot, top, [0.02, 0.014], { color: P.woodDk, bone: ROOT });
    b.spike(top, [top[0], top[1] + 0.2, top[2]], null, 0.03, { color: P.ironLt, bone: ROOT });
    add("rack", P.red, boxG(0.03, 0.14, 0.01, [top[0], top[1] - 0.22, top[2] + 0.02]));
  }

  // ---- Barrels, crates, a chest with a hinged lid, a sack and a woodpile ----
  const barrel = (group: string, x: number, z: number) => {
    b.lathe(BARREL, { at: [x, GY, z], segments: 14, smoothing: 1, color: P.barrel, bone: ROOT, group });
    add(
      group,
      P.iron,
      [
        [0.166, 0.1],
        [0.194, 0.35],
        [0.168, 0.6],
      ].map(([r, h]) => torusG(r, 0.013, [x, GY + h, z], [90, 0, 0])),
    );
  };
  barrel("barrelA", -0.84, -0.5);
  barrel("barrelB", -0.92, -0.9);
  add("barrelA", P.woodLt, cylG(0.145, 0.145, 0.025, 12, [-0.84, GY + 0.7, -0.5]));

  const crate = (group: string, x: number, y: number, z: number, s: number, rot: number) => {
    add(group, P.crate, boxG(s, s, s, [x, y, z], [0, rot, 0]));
    add(
      group,
      P.iron,
      [-1, 1].flatMap((dx) => [-1, 1].map((dz) => boxG(0.03, s + 0.01, 0.03, [x + (dx * s) / 2, y, z + (dz * s) / 2], [0, rot, 0]))),
    );
  };
  crate("crates", -0.42, GY + 0.14, -0.5, 0.28, 0);
  crate("crates", -0.4, GY + 0.42, -0.5, 0.26, 7);
  add("crates", P.rope, torusG(0.2, 0.012, [-0.4, GY + 0.56, -0.5], [90, 0, 0]));

  const cx = -0.46;
  const cz = -0.2;
  add("chest", P.wood, boxG(0.34, 0.2, 0.24, [cx, GY + 0.1, cz]));
  add("chest", BLACK, boxG(0.31, 0.01, 0.21, [cx, GY + 0.2, cz]));
  add("chest", P.iron, [
    boxG(0.03, 0.2, 0.01, [cx - 0.1, GY + 0.1, cz + 0.125]),
    boxG(0.03, 0.2, 0.01, [cx + 0.1, GY + 0.1, cz + 0.125]),
  ]);
  add("chest", GOLD, [boxG(0.05, 0.06, 0.014, [cx, GY + 0.13, cz + 0.127]), sphG(0.022, [cx - 0.07, GY + 0.215, cz - 0.03], [1, 0.4, 1]), sphG(0.022, [cx + 0.02, GY + 0.215, cz + 0.04], [1, 0.4, 1]), sphG(0.022, [cx + 0.09, GY + 0.215, cz - 0.05], [1, 0.4, 1])]);
  add("chest", P.wood, boxG(0.36, 0.045, 0.24, [cx, GY + 0.2 + 0.0225, cz]), "chestLid");
  add("chest", P.iron, [boxG(0.04, 0.05, 0.25, [cx - 0.1, GY + 0.225, cz]), boxG(0.04, 0.05, 0.25, [cx + 0.1, GY + 0.225, cz])], "chestLid");

  b.lathe(SACK, { at: [-0.2, GY, -0.88], segments: 12, smoothing: 1, color: P.burlap, bone: ROOT, group: "sack" });
  add("sack", P.rope, torusG(0.095, 0.014, [-0.2, GY + 0.3, -0.88], [90, 0, 0]));

  add(
    "woodpile",
    logEndP,
    [
      [1.03, GY + 0.05],
      [1.17, GY + 0.05],
      [1.1, GY + 0.14],
    ].map(([x, y]) => cylG(0.05, 0.05, 0.36, 7, [x, y, -0.62], [90, 0, 0])),
  );

  // ---- Bone pile with a ribcage, long bones and skulls ----
  for (let i = 0; i < 3; i++) {
    const z = 0.8 + i * 0.07;
    b.sweep(arc([0.7, GY + 0.03, z], [0.82, GY + 0.03, z], [0, 1, 0], 160), 0.011, { color: P.bone, bone: ROOT, name: `rib${i}` });
  }
  const longBones: [V3, V3][] = [
    [
      [0.58, GY + 0.03, 0.74],
      [0.9, GY + 0.03, 0.98],
    ],
    [
      [0.62, GY + 0.03, 1.0],
      [0.92, GY + 0.04, 0.8],
    ],
  ];
  for (const [p0, p1] of longBones) b.capsule(p0, p1, 0.017, { color: P.bone, bone: ROOT });
  skull("bones", 0.72, GY + 0.08, 0.9, 1.0, -25);
  skull("bones", 0.9, GY + 0.06, 0.66, 0.75, 60);
  b.lathe([[0, 0], [0.13, 0], [0.14, 0.02], [0.13, 0.1], [0.1, 0.16], [0, 0.17]], {
    at: [0.35, GY, 1.0],
    segments: 12,
    smoothing: 1,
    color: P.iron,
    bone: ROOT,
    group: "helmet",
  });
  add("helmet", P.bone, [
    coneG(0.035, 0.2, 6, [0.49, GY + 0.06, 1.0], [0, 0, -60]),
    coneG(0.035, 0.2, 6, [0.21, GY + 0.06, 1.0], [0, 0, 60]),
  ]);

  // ---- Grass tufts around the rim ----
  const tufts: Frame[] = [];
  for (let i = 0; i < 110; i++) {
    const a = rnd() * Math.PI * 2;
    const r = 0.95 + rnd() * 0.42;
    const at: V3 = [Math.sin(a) * r, GY, Math.cos(a) * r];
    if (Math.hypot(at[0] - FIRE[0], at[2] - FIRE[2]) > 0.4) tufts.push(frame(at, [0, 1, 0]));
  }
  const grassA = svg(GRASS_A, { size: 128 });
  const grassB = svg(GRASS_B, { size: 128 });
  b.cards(tufts, [grassA, grassB], { size: [0.12, 0.17], lean: 0, cross: true, vary: 0.3, rng: rng(11), bone: ROOT });

  // Flush the merged groups.
  for (const bk of buckets.values()) {
    b.part(merged(bk.geos), bk.color, { bone: bk.bone, at: [0, 0, 0], group: bk.group });
  }

  // Rest poses: the door flap swung in a little, the chest lid open.
  b.pose("doorFlap", { axis: [1, 0, 0], deg: 20 });
  b.pose("chestLid", { axis: [1, 0, 0], deg: -60 });

  return b.root;
}
