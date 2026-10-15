// Desert oasis diorama: a faceted sand island with a turquoise pond, five leaning palms, a stepped round tent,
// a goat-hair ridge tent, a merchant canopy, a camp fire and three camels. Low-poly facets, whimsical proportions.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { aim, DEG, rng } from "../../../../src/math";
import type { FrameInput } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { countershade, mix, mottle, noise, paint, smoothstep, stripes } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Desert Oasis Diorama",
  description:
    "A round sand island with a turquoise pond, leaning palms with card fronds, a stepped striped tent, a goat-hair ridge tent, a merchant canopy with tea, a camp fire and three whimsical camels.",
  style: "low-poly whimsical mix",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette (flat colours; paints and textures carry their own colours)
const WET = "#c9a057";
const STONE = "#b59a7c";
const STONE_D = "#8f7a62";
const STONE_L = "#cdb597";
const TRUNK_D = "#7a4b30";
const COCONUT = "#5e3a22";
const DATE = "#e0802a";
const RIB = "#7a9a3e";
const STALK = "#8a6a3a";
const RED = "#d8483a";
const CREAM = "#f7e8c4";
const GOLD = "#f2b632";
const TEAL = "#2bb3a8";
const NAVY = "#2b3f78";
const ORANGE = "#f08a2c";
const PURPLE = "#8a4fb0";
const WOOD = "#8b5a34";
const WOOD_L = "#b5824f";
const ROPE = "#d8c08a";
const DARK = "#2b2220";
const BRASS = "#d9a53a";
const CAMEL_D = "#a8703a";
const CAMEL_L = "#e3b676";
const CAMEL = "#c99556";
const HOOF = "#5e4130";
const BLACK = "#1d1816";
const WHITE = "#fffaf0";
const PINK = "#ff7aa8";
const RING = "#c4f3ee";
const LILY = "#4cb860";
const CACTUS = "#5aa85a";
const FIRE = "#ff8a2a";
const EMBER = "#ffd24a";
const IRON = "#3b3a40";
const TEAGLASS = "#7fe0c8";
const CLAY = "#c4623b";
const CLAY_D = "#8f3f26";
const LIZARD = "#8fbf3a";
const REED = "#5fa54a";
const CATTAIL = "#6b3f22";
const SOUP = "#d6b25a";
const STEAM = "#ece8e2";
const TEXW = "#ffffff";
const LANTERN = "#ffd27a";

const EARTH_A = "#9c6a3f";
const EARTH_B = "#7d5030";
const EARTH_C = "#b58352";

const GY = 0.16; // sand surface height
const Yv = new THREE.Vector3(0, 1, 0);

type V = [number, number, number];
type Fill = string | Paint;
type Opt = { rot?: V; s?: number | V };

/** A local frame in model space: position `o`, orientation `q`; +Z forward, +Y up, +X left. */
class Rig {
  constructor(
    readonly o: THREE.Vector3,
    readonly q: THREE.Quaternion,
  ) {}

  static at(x: number, y: number, z: number, yawDeg = 0) {
    return new Rig(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromAxisAngle(Yv, yawDeg * DEG));
  }

  p(x: number, y: number, z: number) {
    return new THREE.Vector3(x, y, z).applyQuaternion(this.q).add(this.o);
  }

  d(x: number, y: number, z: number) {
    return new THREE.Vector3(x, y, z).applyQuaternion(this.q);
  }

  local(p: THREE.Vector3) {
    return p.clone().sub(this.o).applyQuaternion(this.q.clone().invert());
  }

  localDir(n: THREE.Vector3) {
    return n.clone().applyQuaternion(this.q.clone().invert());
  }

  rot(r: V = [0, 0, 0]) {
    return this.q.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0] * DEG, r[1] * DEG, r[2] * DEG)));
  }

  /** A child frame at local `at` whose +Z points along local `dir`. */
  sub(at: V, dir: V) {
    return new Rig(this.p(at[0], at[1], at[2]), this.q.clone().multiply(aim(dir, undefined, "z")));
  }
}

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (rt: number, rb: number, h: number, seg = 8) => new THREE.CylinderGeometry(rt, rb, h, seg, 1);
const ball = (r: number, ws = 6, hs = 4) => new THREE.SphereGeometry(r, ws, hs);
const cone = (r: number, h: number, seg = 6) => new THREE.ConeGeometry(r, h, seg, 1);
const tor = (r: number, t: number, rs = 4, ts = 8) => new THREE.TorusGeometry(r, t, rs, ts);
const ico = () => new THREE.IcosahedronGeometry(1, 0);

const sc = (s?: number | V) =>
  s === undefined
    ? new THREE.Vector3(1, 1, 1)
    : typeof s === "number"
      ? new THREE.Vector3(s, s, s)
      : new THREE.Vector3(s[0], s[1], s[2]);

// ---------------------------------------------------------------------------------------------------------------
// Paints

const sandPaint = paint((p) => {
  const n1 = noise(p, 0.4, 3);
  const ripple = Math.sin((p.x * 0.6 + p.z * 0.8) * 42 + n1 * 9);
  const c = mix("#ecc47c", "#f6dc9c", smoothstep(0.3, 0.8, n1));
  return mix(c, "#d4a65c", smoothstep(0.55, 1, ripple) * 0.45);
});

const rockPaint = paint((p, n) => {
  if (n.y > 0.7) return sandPaint;
  const k = Math.floor(p.y * 30 + noise(p, 0.2, 6) * 2.4);
  const m = ((k % 3) + 3) % 3;
  return m === 0 ? EARTH_A : m === 1 ? EARTH_B : EARTH_C;
});

const PX = 0.05;
const PZ = 0.15;
const PRX = 0.5;
const PRZ = 0.36;

const waterPaint = paint((p) => {
  const d = Math.hypot((p.x - PX) / PRX, (p.z - PZ) / PRZ);
  const deep = smoothstep(1, 0.15, d);
  let c = mix("#6fe0d8", "#2a95b0", deep);
  const sparkle = noise(p, 0.1, 4);
  if (sparkle > 0.7) c = mix(c, "#ffffff", 0.45);
  return mix(c, "#e9fbf6", smoothstep(0.86, 0.98, d));
});

const bandPaint = (g: Rig, axis: "x" | "z", size: number, a: string, c: string) =>
  paint((p) => {
    const l = g.local(p);
    const k = Math.floor((axis === "x" ? l.x : l.z) / size);
    return ((k % 2) + 2) % 2 === 0 ? a : c;
  });

const wallPaint = (g: Rig, wh: number, base: string, motif: string, trim: string, trim2: string) =>
  paint((p, _n, s) => {
    const ly = p.y - g.o.y;
    if (ly < 0.024) return trim;
    if (ly > wh - 0.022) return trim2;
    const fu = (s[0] * 8) % 1;
    const v = (ly - 0.024) / (wh - 0.046);
    const dd = Math.abs(fu - 0.5) * 2 * 0.95 + Math.abs(v - 0.5) * 1.5;
    if (dd < 0.5) return motif;
    if (dd < 0.62) return trim;
    return base;
  });

const roofPaint = (g: Rig, wh: number, a: string, c: string, hem: string, tip: string) =>
  paint((p) => {
    const l = g.local(p);
    const ly = p.y - g.o.y;
    if (ly < wh + 0.03) return hem;
    if (ly > wh + 0.37) return tip;
    const k = Math.floor((Math.atan2(l.x, l.z) + Math.PI) / (Math.PI / 4) + 0.5);
    return ((k % 2) + 2) % 2 === 0 ? a : c;
  });

const coatPaint = (a: string, b2: string, seed: number) =>
  countershade(mottle(a, b2, { size: 0.1, contrast: 0.5, seed }), "#ecd0a0", { level: -0.35 });

// ---------------------------------------------------------------------------------------------------------------

type Palm = { at: (t: number) => THREE.Vector3 };
type CamelOpt = {
  coat: Paint;
  kneel?: boolean;
  humps?: number;
  pose: "proud" | "drink";
  blanket?: { z: number; d: number };
  load?: boolean;
  reins?: boolean;
};

export default function build() {
  const b = createBuilder({ name: "desertOasis" });
  const base = b.joint("base", { at: [0, 0, 0] });
  const W = Rig.at(0, 0, 0);
  const rand = rng(7);

  // ---- helpers ---------------------------------------------------------------------------------------------
  const bag = new Map<string, THREE.BufferGeometry[]>();
  const pushGeo = (color: string, geo: THREE.BufferGeometry, m: THREE.Matrix4) => {
    const out = geo.index ? geo.toNonIndexed() : geo.clone();
    out.applyMatrix4(m);
    const list = bag.get(color);
    if (list) list.push(out);
    else bag.set(color, [out]);
  };
  const decW = (
    color: string,
    geo: THREE.BufferGeometry,
    pos: THREE.Vector3,
    q = new THREE.Quaternion(),
    s = new THREE.Vector3(1, 1, 1),
  ) => pushGeo(color, geo, new THREE.Matrix4().compose(pos, q, s));
  const dec = (color: string, geo: THREE.BufferGeometry, g: Rig, at: V, o: Opt = {}) =>
    decW(color, geo, g.p(at[0], at[1], at[2]), g.rot(o.rot), sc(o.s));
  const link = (color: string, a: THREE.Vector3, c: THREE.Vector3, r: number, seg = 5, r2 = r) => {
    const dir = c.clone().sub(a);
    const geo = new THREE.CylinderGeometry(r2, r, dir.length(), seg, 1);
    decW(color, geo, a.clone().add(c).multiplyScalar(0.5), aim(dir, undefined, "y"));
  };
  const put = (geo: THREE.BufferGeometry, color: Fill, g: Rig, at: V, o: Opt & { tex?: THREE.Texture } = {}) =>
    b.part(geo, color, {
      at: g.p(at[0], at[1], at[2]),
      quat: g.rot(o.rot),
      scale: sc(o.s),
      flat: true,
      texture: o.tex,
    });

  // ---- textures --------------------------------------------------------------------------------------------
  const LEAF = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 48"><path d="M8 47 L2 33 L3 15 L8 1 Z" fill="#74c957"/><path d="M8 47 L8 1 L13 15 L14 33 Z" fill="#3f9a48"/><path d="M8 46 L8 4" stroke="#2b7a38" stroke-width="1.4"/></svg>`,
    { size: 128 },
  );
  const GRASS = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><polygon points="3,32 6,9 10,32" fill="#6cb84a"/><polygon points="9,32 15,2 20,32" fill="#8bd05a"/><polygon points="17,32 24,10 27,32" fill="#5aa043"/><polygon points="22,32 29,17 31,32" fill="#74c057"/><polygon points="12,32 11,16 16,32" fill="#4f9a3e"/></svg>`,
    { size: 128 },
  );
  const FUR = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 32"><polygon points="1,32 4,9 8,0 12,11 15,32" fill="#d9a860"/><polygon points="6,32 8,10 10,32" fill="#b98440"/></svg>`,
    { size: 96 },
  );
  const RUG = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40"><rect width="64" height="40" fill="#b8352f"/><rect x="3" y="3" width="58" height="34" fill="none" stroke="#f2d28b" stroke-width="2"/><rect x="7" y="7" width="50" height="26" fill="#2b3f78"/><polygon points="32,8 48,20 32,32 16,20" fill="#f2b632"/><polygon points="32,13 41,20 32,27 23,20" fill="#b8352f"/><polygon points="32,17 36,20 32,23 28,20" fill="#f7e8c4"/><polygon points="12,20 15,16 18,20 15,24" fill="#2bb3a8"/><polygon points="46,20 49,16 52,20 49,24" fill="#2bb3a8"/><rect x="0" y="0" width="64" height="2" fill="#f7e8c4"/><rect x="0" y="38" width="64" height="2" fill="#f7e8c4"/></svg>`,
    { size: 256 },
  );
  const BLANKET = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#2bb3a8"/><rect y="0" width="32" height="5" fill="#d8483a"/><rect y="27" width="32" height="5" fill="#d8483a"/><rect y="5" width="32" height="2" fill="#f2b632"/><rect y="25" width="32" height="2" fill="#f2b632"/><polygon points="0,16 8,9 16,16 8,23" fill="#f7e8c4"/><polygon points="16,16 24,9 32,16 24,23" fill="#f7e8c4"/><polygon points="4,16 8,12 12,16 8,20" fill="#d8483a"/><polygon points="20,16 24,12 28,16 24,20" fill="#d8483a"/></svg>`,
    { size: 128 },
  );
  const ICON_PALM = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="#f7e8c4"/><rect x="14.5" y="14" width="3" height="12" fill="#7a4b30"/><polygon points="16,14 5,13 11,8" fill="#3fa04a"/><polygon points="16,14 27,13 21,8" fill="#3fa04a"/><polygon points="16,14 12,5 20,5" fill="#4fb855"/><rect x="6" y="26" width="20" height="2" fill="#38b8c8"/></svg>`,
    { size: 128 },
  );
  const ICON_TENT = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="#f7e8c4"/><polygon points="16,5 28,25 4,25" fill="#d8483a"/><polygon points="16,13 21,25 11,25" fill="#2b2220"/><rect x="15" y="3" width="2" height="4" fill="#7a4b30"/></svg>`,
    { size: 128 },
  );

  // ---- island base ------------------------------------------------------------------------------------------
  const baseProfile: OutlinePoint[] = [
    [0, 0],
    [1.28, 0],
    [1.4, 0.07],
    [1.42, 0.13],
    [1.34, GY],
    [0, GY],
  ];
  b.lathe(baseProfile, { at: [0, 0, 0], segments: 10, color: rockPaint, name: "island" });

  const dune = (x: number, z: number, rx: number, rz: number, h: number, yaw: number) =>
    put(new THREE.SphereGeometry(1, 10, 4, 0, Math.PI * 2, 0, Math.PI / 2), sandPaint, W, [x, GY - 0.005, z], {
      s: [rx, h, rz],
      rot: [0, yaw, 0],
    });
  dune(-1.0, -0.5, 0.25, 0.3, 0.13, 20);
  dune(1.12, -0.2, 0.18, 0.3, 0.14, -10);
  dune(0.4, -1.05, 0.3, 0.2, 0.11, 35);
  dune(-0.15, 1.12, 0.3, 0.16, 0.08, -15);

  // ---- pond -------------------------------------------------------------------------------------------------
  put(cyl(1, 1, 0.01, 10), WET, W, [PX, GY + 0.003, PZ], { s: [PRX + 0.07, 1, PRZ + 0.07] });
  put(cyl(1, 1, 0.012, 10), waterPaint, W, [PX, GY + 0.006, PZ], { s: [PRX, 1, PRZ] });
  for (const [rx, rz, rr] of [
    [0.22, 0.12, 0.09],
    [0.22, 0.12, 0.15],
    [-0.12, 0.25, 0.07],
    [0.3, -0.05, 0.06],
  ]) {
    dec(RING, tor(rr, 0.004, 3, 10), W, [rx, GY + 0.0135, rz], { rot: [90, 0, 0], s: [1, 1, 0.5] });
  }

  // rim stones
  const rimStones = [STONE, STONE_D, STONE_L];
  for (let k = 0; k < 18; k++) {
    const a = (k / 18) * Math.PI * 2 + 0.1;
    const sx = PX + (PRX + 0.045) * Math.sin(a);
    const sz = PZ + (PRZ + 0.045) * Math.cos(a);
    if (sz > 0.3 && Math.abs(sx + 0.05) < 0.2) continue;
    const r = 0.03 + rand() * 0.03;
    dec(rimStones[k % 3], ico(), W, [sx, GY + 0.008, sz], {
      s: [r * 1.2, r * 0.75, r],
      rot: [rand() * 30, rand() * 360, rand() * 30],
    });
  }

  // lily pads and flowers
  for (const [lx, lz, flower] of [
    [-0.2, 0.28, true],
    [0.3, 0.05, false],
    [0.15, 0.34, true],
    [-0.1, 0.0, false],
    [0.34, 0.28, false],
  ] as Array<[number, number, boolean]>) {
    dec(LILY, cyl(0.06, 0.06, 0.006, 8), W, [lx, GY + 0.015, lz], { rot: [0, rand() * 90, 0] });
    if (flower) {
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * 360;
        dec(PINK, cone(0.012, 0.04, 4), W, [lx + 0.014 * Math.sin(a * DEG), GY + 0.035, lz + 0.014 * Math.cos(a * DEG)], {
          rot: [Math.cos(a * DEG) * 30, 0, -Math.sin(a * DEG) * 30],
        });
      }
      dec(GOLD, ball(0.01, 5, 3), W, [lx, GY + 0.026, lz]);
    }
  }

  // whimsical jumping fish
  const fish = Rig.at(0.22, GY + 0.11, 0.12, 40).sub([0, 0, 0], [0, 0.5, 0.85]);
  dec(ORANGE, ball(0.035, 7, 5), fish, [0, 0, 0], { s: [0.55, 0.75, 1.7] });
  dec(CREAM, ball(0.03, 6, 4), fish, [0, -0.014, 0.01], { s: [0.5, 0.5, 1.5] });
  dec(ORANGE, cone(0.035, 0.05, 4), fish, [0, 0, -0.085], { rot: [90, 0, 0], s: [0.15, 1, 1] });
  dec(RED, cone(0.016, 0.035, 4), fish, [0, 0.03, -0.01], { rot: [-20, 0, 0], s: [0.2, 1, 1] });
  dec(BLACK, ball(0.008, 4, 3), fish, [0.02, 0.008, 0.05]);
  dec(BLACK, ball(0.008, 4, 3), fish, [-0.02, 0.008, 0.05]);
  dec(WHITE, ball(0.003, 3, 3), fish, [0.025, 0.012, 0.056]);
  dec(WHITE, ball(0.003, 3, 3), fish, [-0.015, 0.012, 0.056]);
  for (const [dx, dy, dz] of [
    [0.06, 0.04, 0.0],
    [-0.07, 0.07, 0.04],
    [0.04, 0.0, -0.05],
    [-0.05, -0.03, -0.04],
  ]) {
    dec(RING, ball(0.007, 4, 3), W, [0.22 + dx, GY + 0.09 + dy, 0.12 + dz]);
  }

  // ---- palms ------------------------------------------------------------------------------------------------
  const leafBuckets = [0, 1, 2, 3].map(() => ({ fr: [] as FrameInput[], flow: [] as THREE.Vector3[] }));
  const palm = (x: number, z: number, h: number, lx: number, lz: number, seed: number, young: boolean): Palm => {
    const r = rng(seed);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 5; i++) {
      const t = i / 5;
      const bow = Math.sin(t * Math.PI) * 0.03 * h;
      pts.push(new THREE.Vector3(x + lx * t * t + bow, GY - 0.02 + (h + 0.02) * t, z + lz * t * t));
    }
    const path = catmull(pts);
    const gk = 0.55 + 0.45 * h;
    b.sweep(path, [0.085 * gk, 0.058 * gk, 0.046 * gk, 0.04 * gk, 0.038 * gk, 0.046 * gk], {
      color: stripes("#a8714a", TRUNK_D, { size: 0.055, axis: "y", width: 0.3, wobble: 0.25, seed }),
      sides: 7,
      smooth: false,
      caps: { start: "flat", end: "round" },
    });
    const top = pts[5].clone();
    const crown = Rig.at(top.x, top.y, top.z, 0);
    put(ball(0.075 * gk, 6, 4), TRUNK_D, crown, [0, 0.01, 0], { s: [1, 0.8, 1] });
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * 2 * Math.PI + r();
      dec(COCONUT, ball(0.032 * gk + 0.004, 6, 4), crown, [0.058 * gk * Math.sin(a), -0.03, 0.058 * gk * Math.cos(a)]);
    }
    if (!young) {
      for (const a of [1.0, 4.2]) {
        const sx = 0.07 * Math.sin(a);
        const sz = 0.07 * Math.cos(a);
        link(STALK, crown.p(sx, 0.0, sz), crown.p(sx * 1.3, -0.1, sz * 1.3), 0.004, 4);
        for (let k = 0; k < 5; k++) {
          const a2 = (k / 5) * 2 * Math.PI;
          dec(DATE, ball(0.014, 5, 3), crown, [sx * 1.3 + 0.015 * Math.sin(a2), -0.12 - (k % 2) * 0.02, sz * 1.3 + 0.015 * Math.cos(a2)]);
        }
      }
    }
    const n = young ? 8 : 11;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 2 * Math.PI + (r() - 0.5) * 0.3;
      const d = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
      const long = i % 2 === 0;
      const L = (young ? 0.3 : 0.5) * (long ? 1 : 0.72) * (0.9 + 0.2 * r());
      const p0 = top.clone().add(new THREE.Vector3(0, 0.015, 0));
      const p1 = p0.clone().addScaledVector(d, 0.3 * L).addScaledVector(Yv, 0.3 * L * (long ? 1 : 1.6));
      const p2 = p0.clone().addScaledVector(d, 0.72 * L).addScaledVector(Yv, 0.38 * L * (long ? 1 : 1.7));
      const p3 = p0.clone().addScaledVector(d, L).addScaledVector(Yv, (long ? -0.14 : 0.2) * L);
      const fp = bezier(p0, p1, p2, p3);
      b.sweep(fp, [0.012 * gk, 0.003], {
        color: RIB,
        section: { ngon: 4 },
        caps: { start: "flat", end: "point" },
      });
      const side = new THREE.Vector3(-d.z, 0, d.x);
      for (let j = 0; j < 13; j++) {
        const t = 0.08 + (0.9 * j) / 12;
        const pt = fp.at(t).clone();
        const T = fp.tangentAt(t).clone();
        for (const s of [1, -1]) {
          const out = side.clone().multiplyScalar(s).addScaledVector(Yv, -0.15).normalize();
          const bucket = leafBuckets[(young ? 2 : 0) + (t > 0.62 ? 1 : 0)];
          bucket.fr.push(frame(pt, out));
          bucket.flow.push(T);
        }
      }
    }
    return { at: (t: number) => path.at(t).clone() };
  };
  const palm1 = palm(-0.62, -0.12, 1.05, 0.14, 0.06, 11, false);
  palm(0.68, -0.05, 0.95, -0.12, 0.1, 12, false);
  palm(0.12, -0.52, 0.78, 0.05, 0.12, 13, false);
  palm(0.5, 0.78, 0.5, -0.03, -0.02, 14, true);
  palm(-0.38, 0.72, 0.42, 0.03, -0.04, 15, true);

  // ---- tents ------------------------------------------------------------------------------------------------
  const ARCH: OutlinePoint[] = [
    [-0.065, 0],
    [0.065, 0],
    [0.065, 0.07],
    [0.03, 0.112],
    [0, 0.125, "sharp"],
    [-0.03, 0.112],
    [-0.065, 0.07],
  ];
  const FLAP: OutlinePoint[] = [
    [0, 0],
    [0.07, 0],
    [0.05, 0.07],
    [0, 0.14],
  ];
  const FLAG: OutlinePoint[] = [
    [0, 0],
    [0.14, 0.012],
    [0.1, 0.035],
    [0.14, 0.058],
    [0, 0.07],
  ];

  const barrel = (g: Rig, x: number, z: number) => {
    dec(WOOD, cyl(0.05, 0.05, 0.09, 8), g, [x, 0.045, z]);
    dec(DARK, tor(0.051, 0.004, 3, 8), g, [x, 0.02, z], { rot: [90, 0, 0] });
    dec(DARK, tor(0.051, 0.004, 3, 8), g, [x, 0.07, z], { rot: [90, 0, 0] });
    dec(WOOD_L, cyl(0.042, 0.042, 0.004, 8), g, [x, 0.092, z]);
  };
  const crate = (g: Rig, x: number, y: number, z: number, yaw: number) => {
    dec(WOOD_L, box(0.08, 0.07, 0.08), g, [x, y + 0.035, z], { rot: [0, yaw, 0] });
    dec(DARK, box(0.084, 0.008, 0.084), g, [x, y + 0.012, z], { rot: [0, yaw, 0] });
    dec(DARK, box(0.084, 0.008, 0.084), g, [x, y + 0.058, z], { rot: [0, yaw, 0] });
  };
  const sack = (g: Rig, x: number, z: number, ty: number) => {
    dec(ROPE, ball(0.05, 6, 4), g, [x, 0.045, z], { s: [1, 1.1, 0.9], rot: [0, ty, 0] });
    dec(ROPE, cyl(0.014, 0.022, 0.016, 5), g, [x, 0.098, z]);
    dec(CLAY_D, tor(0.02, 0.004, 3, 6), g, [x, 0.09, z], { rot: [90, 0, 0] });
  };
  const amphora = (g: Rig, x: number, z: number) => {
    const prof: OutlinePoint[] = [
      [0, 0],
      [0.035, 0],
      [0.06, 0.045],
      [0.062, 0.09],
      [0.045, 0.14],
      [0.03, 0.165],
      [0.04, 0.18],
      [0.04, 0.19],
      [0, 0.19],
    ];
    b.lathe(prof, { at: g.p(x, 0, z), segments: 8, color: CLAY });
    dec(CLAY_D, tor(0.025, 0.005, 4, 6), g, [x + 0.058, 0.15, z], { rot: [0, 90, 0] });
    dec(CLAY_D, tor(0.025, 0.005, 4, 6), g, [x - 0.058, 0.15, z], { rot: [0, 90, 0] });
    dec(CLAY_D, tor(0.062, 0.005, 3, 8), g, [x, 0.09, z], { rot: [90, 0, 0] });
  };
  const bunting: Array<[THREE.Vector3, THREE.Vector3]> = [];

  const roundTent = (g: Rig, R: number, wh: number, cA: string, cB: string, trim: string, trim2: string, motif: string) => {
    const ap = R * Math.cos(Math.PI / 8);
    const th0 = -Math.PI / 8;
    put(new THREE.CylinderGeometry(R, R, wh, 8, 1, false, th0), wallPaint(g, wh, cB, motif, trim, trim2), g, [0, wh / 2, 0]);
    put(
      new THREE.CylinderGeometry(R * 0.52, R + 0.05, 0.12, 8, 1, false, th0),
      roofPaint(g, wh, cA, cB, trim, trim2),
      g,
      [0, wh + 0.06, 0],
    );
    put(
      new THREE.CylinderGeometry(0.025, R * 0.55, 0.2, 8, 1, false, th0),
      roofPaint(g, wh, cA, cB, trim, trim2),
      g,
      [0, wh + 0.22, 0],
    );
    dec(GOLD, new THREE.CylinderGeometry(R * 0.575, R * 0.575, 0.022, 8, 1, false, th0), g, [0, wh + 0.125, 0]);
    // door and tied-back flaps
    b.extrude(ARCH, { at: g.p(0, 0, ap + 0.004), x: g.d(1, 0, 0), thickness: 0.01, color: DARK });
    for (const s of [1, -1]) {
      b.extrude(FLAP, { at: g.p(s * 0.065, 0, ap + 0.012), x: g.d(s, 0, 0), thickness: 0.012, color: RED });
      dec(GOLD, ball(0.008, 4, 3), g, [s * 0.1, 0.035, ap + 0.022]);
    }
    dec(WOOD, box(0.012, 0.13, 0.014), g, [0.075, 0.065, ap + 0.01]);
    dec(WOOD, box(0.012, 0.13, 0.014), g, [-0.075, 0.065, ap + 0.01]);
    put(box(0.16, 0.006, 0.1), TEXW, g, [0, 0.003, ap + 0.07], { tex: RUG });
    // eave valance
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * 2 * Math.PI;
      const rr = R + 0.045;
      dec(k % 2 === 0 ? TEAL : GOLD, cyl(0.03, 0, 0.05, 3), g, [Math.sin(a) * rr, wh - 0.02, Math.cos(a) * rr], {
        rot: [0, (a / DEG) + 180, 0],
      });
    }
    // crossed poles, finial and pennant
    dec(WOOD, cyl(0.006, 0.006, 0.26, 5), g, [0, wh + 0.4, 0], { rot: [0, 0, 28] });
    dec(WOOD, cyl(0.006, 0.006, 0.26, 5), g, [0, wh + 0.4, 0], { rot: [0, 0, -28] });
    dec(WOOD, cyl(0.005, 0.007, 0.1, 5), g, [0, wh + 0.37, 0]);
    dec(BRASS, ball(0.022, 6, 4), g, [0, wh + 0.43, 0]);
    dec(BRASS, cone(0.012, 0.04, 5), g, [0, wh + 0.47, 0]);
    b.extrude(FLAG, { at: g.p(0, wh + 0.33, 0), x: g.d(0.8, 0, 0.6), thickness: 0.006, color: RED });
    // guy ropes and stakes
    for (let k = 0; k < 6; k++) {
      const a = (50 + k * 52) * DEG;
      link(ROPE, g.p(Math.sin(a) * (R + 0.05), wh, Math.cos(a) * (R + 0.05)), g.p(Math.sin(a) * (R + 0.26), 0.01, Math.cos(a) * (R + 0.26)), 0.004, 4);
      dec(WOOD, cone(0.012, 0.05, 4), g, [Math.sin(a) * (R + 0.26), 0.02, Math.cos(a) * (R + 0.26)], { rot: [0, 0, 0] });
    }
    // hanging lantern beside the door
    link(ROPE, g.p(0.16, wh - 0.01, ap + 0.04), g.p(0.16, wh - 0.06, ap + 0.04), 0.003, 4);
    dec(BRASS, cone(0.016, 0.014, 5), g, [0.16, wh - 0.06, ap + 0.04]);
    glow(put(box(0.026, 0.034, 0.026), LANTERN, g, [0.16, wh - 0.087, ap + 0.04]), 1.4);
    dec(BRASS, box(0.03, 0.006, 0.03), g, [0.16, wh - 0.108, ap + 0.04]);
    return { top: g.p(0, wh + 0.45, 0), ap };
  };

  const t1 = Rig.at(-0.62, GY, -0.82, 33);
  const t1info = roundTent(t1, 0.34, 0.15, "#d8483a", "#f7e8c4", "#2bb3a8", "#f2b632", "#2bb3a8");
  barrel(t1, -0.34, 0.3);
  crate(t1, -0.3, 0, 0.44, 15);
  crate(t1, -0.3, 0.07, 0.44, -10);
  sack(t1, 0.4, 0.28, 20);
  sack(t1, 0.49, 0.2, -30);
  amphora(t1, 0.3, 0.46);

  // goat-hair ridge tent
  const t2 = Rig.at(0.62, GY, -0.72, -33);
  const t2Paint = paint((p, n) => {
    const l = t2.local(p);
    const ln = t2.localDir(n);
    if (ln.z > 0.8) {
      const hw = 0.17 * (1 - l.y / 0.27);
      if (l.y < 0.27 && Math.abs(l.x) < hw && l.y > 0.0) return "#2a1b14";
      return "#6b5446";
    }
    if (ln.z < -0.8) return "#6b5446";
    const k = Math.floor((l.z + 0.26) / 0.065);
    const m = ((k % 6) + 6) % 6;
    return m === 1 ? "#6b5446" : m === 3 ? "#f2d9a6" : m === 4 ? "#d8483a" : "#4a3a30";
  });
  const PROFILE: OutlinePoint[] = [
    [-0.3, 0],
    [0.3, 0],
    [0.3, 0.04],
    [0.05, 0.3],
    [-0.05, 0.3],
    [-0.3, 0.04],
  ];
  b.extrude(PROFILE, { at: t2.p(0, 0, 0), x: t2.d(1, 0, 0), thickness: 0.52, color: t2Paint, name: "ridgeTent" });
  for (const s of [1, -1]) {
    link(WOOD, t2.p(s * 0.2, 0, 0.27), t2.p(s * 0.18, 0.16, 0.27), 0.009, 5);
    link(WOOD, t2.p(s * 0.23, 0, 0.5), t2.p(s * 0.23, 0.2, 0.5), 0.011, 6, 0.008);
    dec(BRASS, ball(0.014, 5, 3), t2, [s * 0.23, 0.205, 0.5]);
    dec(BRASS, ball(0.01, 5, 3), t2, [s * 0.05, 0.31, -0.26]);
    dec(BRASS, ball(0.01, 5, 3), t2, [s * 0.05, 0.31, 0.26]);
  }
  link(WOOD, t2.p(0, 0.3, -0.3), t2.p(0, 0.3, 0.3), 0.01, 5);
  put(box(0.5, 0.01, 0.26), bandPaint(t2, "x", 0.07, "#2bb3a8", "#f7e8c4"), t2, [0, 0.25, 0.38], { rot: [22.6, 0, 0] });
  for (let k = 0; k < 9; k++) {
    dec(k % 2 === 0 ? RED : GOLD, cyl(0.03, 0, 0.045, 3), t2, [-0.25 + k * 0.0625, 0.172, 0.505], { rot: [0, -60, 0] });
  }
  put(box(0.3, 0.006, 0.2), TEXW, t2, [0, 0.003, 0.4], { tex: RUG });
  for (const [sx, sz, ex, ez] of [
    [0.3, 0.2, 0.52, 0.3],
    [0.3, -0.2, 0.52, -0.3],
    [-0.3, 0.2, -0.52, 0.3],
    [-0.3, -0.2, -0.52, -0.3],
  ]) {
    link(ROPE, t2.p(sx, 0.04, sz), t2.p(ex, 0.01, ez), 0.004, 4);
    dec(WOOD, cone(0.012, 0.05, 4), t2, [ex, 0.02, ez]);
  }
  barrel(t2, 0.42, 0.34);
  crate(t2, -0.42, 0, 0.3, 25);
  sack(t2, -0.42, 0.42, 0);
  sack(t2, 0.48, -0.1, 40);
  // pennant on the ridge pole
  b.extrude(FLAG, { at: t2.p(0, 0.3, -0.3), x: t2.d(0, 0, -1), thickness: 0.006, color: GOLD });
  // dove on the ridge
  const dv = new Rig(t2.p(0, 0.33, -0.1), t2.q);
  dec(WHITE, ball(0.03, 6, 4), dv, [0, 0.02, 0], { s: [1, 0.9, 1.3] });
  dec(WHITE, ball(0.018, 5, 4), dv, [0, 0.055, 0.03]);
  dec(ORANGE, cone(0.005, 0.02, 4), dv, [0, 0.05, 0.058], { rot: [90, 0, 0] });
  dec(WHITE, cone(0.012, 0.05, 4), dv, [0, 0.02, -0.06], { rot: [-90, 0, 0], s: [1.8, 1, 0.6] });
  dec(CREAM, ball(0.02, 5, 3), dv, [0.026, 0.025, -0.005], { s: [0.3, 0.7, 1.3] });
  dec(CREAM, ball(0.02, 5, 3), dv, [-0.026, 0.025, -0.005], { s: [0.3, 0.7, 1.3] });
  dec(BLACK, ball(0.004, 3, 3), dv, [0.012, 0.06, 0.04]);
  dec(BLACK, ball(0.004, 3, 3), dv, [-0.012, 0.06, 0.04]);
  link(ORANGE, dv.p(0.012, 0.0, 0.0), dv.p(0.012, -0.02, 0.0), 0.003, 3);
  link(ORANGE, dv.p(-0.012, 0.0, 0.0), dv.p(-0.012, -0.02, 0.0), 0.003, 3);

  // bunting from the round tent's finial to the first palm
  bunting.push([t1info.top, palm1.at(0.62)]);
  for (const [a, c] of bunting) {
    const m = a.clone().add(c).multiplyScalar(0.5).add(new THREE.Vector3(0, -0.14, 0));
    const bp = bezier(a, m, c);
    b.sweep(bp, 0.003, { color: ROPE, sides: 4 });
    const flagColors = [RED, GOLD, TEAL, ORANGE, PURPLE];
    for (let k = 0; k < 10; k++) {
      const t = 0.07 + (k / 9) * 0.86;
      const pos = bp.at(t).clone();
      const T = bp.tangentAt(t);
      const yaw = Math.atan2(T.x, T.z) / DEG + 30;
      decW(
        flagColors[k % 5],
        cyl(0.032, 0, 0.065, 3),
        pos.add(new THREE.Vector3(0, -0.03, 0)),
        new THREE.Quaternion().setFromAxisAngle(Yv, yaw * DEG),
      );
    }
  }

  // ---- merchant canopy --------------------------------------------------------------------------------------
  const cp = Rig.at(-0.85, GY, 0.38, 100);
  put(box(0.46, 0.01, 0.34), TEXW, cp, [0, 0.005, 0.0], { tex: RUG });
  for (const [px, pz, ph] of [
    [0.24, -0.2, 0.34],
    [-0.24, -0.2, 0.34],
    [0.24, 0.2, 0.26],
    [-0.24, 0.2, 0.26],
  ]) {
    link(WOOD, cp.p(px, 0, pz), cp.p(px, ph, pz), 0.014, 6, 0.011);
    dec(BRASS, ball(0.016, 5, 3), cp, [px, ph + 0.008, pz]);
  }
  put(box(0.54, 0.012, 0.46), bandPaint(cp, "x", 0.07, "#f7e8c4", "#d8483a"), cp, [0, 0.3, 0], { rot: [11.3, 0, 0] });
  for (let k = 0; k < 9; k++) {
    dec(k % 2 === 0 ? TEAL : GOLD, cyl(0.03, 0, 0.04, 3), cp, [-0.24 + k * 0.06, 0.235, 0.226], { rot: [0, -60, 0] });
  }
  dec(NAVY, box(0.1, 0.04, 0.1), cp, [-0.13, 0.025, -0.08], { rot: [0, 20, 0] });
  dec(ORANGE, box(0.1, 0.04, 0.1), cp, [-0.02, 0.025, -0.11], { rot: [0, -15, 0] });
  dec(PURPLE, box(0.09, 0.04, 0.09), cp, [-0.14, 0.025, 0.04], { rot: [0, 40, 0] });
  for (const [cx, cz] of [
    [-0.18, -0.13],
    [-0.08, -0.03],
  ]) {
    dec(GOLD, ball(0.008, 4, 3), cp, [cx, 0.02, cz]);
  }
  // low brass table with tea
  put(cyl(0.1, 0.1, 0.012, 10), BRASS, cp, [0.08, 0.08, 0.03]);
  dec(WOOD, cyl(0.02, 0.04, 0.07, 6), cp, [0.08, 0.04, 0.03]);
  dec(BRASS, ball(0.03, 7, 5), cp, [0.08, 0.12, 0.03], { s: [1, 0.9, 1] });
  dec(BRASS, cone(0.02, 0.025, 6), cp, [0.08, 0.15, 0.03]);
  dec(BRASS, ball(0.007, 4, 3), cp, [0.08, 0.17, 0.03]);
  dec(BRASS, cone(0.008, 0.045, 5), cp, [0.115, 0.13, 0.03], { rot: [0, 0, -65] });
  dec(BRASS, tor(0.014, 0.004, 3, 6), cp, [0.045, 0.12, 0.03], { rot: [0, 90, 0] });
  for (let k = 0; k < 3; k++) {
    const a = k * 2.1 + 0.4;
    dec(TEAGLASS, cyl(0.013, 0.01, 0.03, 6), cp, [0.08 + 0.065 * Math.sin(a), 0.101, 0.03 + 0.065 * Math.cos(a)]);
    dec(GOLD, cyl(0.0135, 0.0135, 0.004, 6), cp, [0.08 + 0.065 * Math.sin(a), 0.115, 0.03 + 0.065 * Math.cos(a)]);
  }
  link(ROPE, cp.p(-0.24, 0.25, 0.2), cp.p(-0.24, 0.2, 0.2), 0.003, 4);
  dec(BRASS, cone(0.018, 0.014, 5), cp, [-0.24, 0.198, 0.2]);
  glow(put(box(0.03, 0.04, 0.03), LANTERN, cp, [-0.24, 0.172, 0.2]), 1.4);
  dec(BRASS, box(0.034, 0.006, 0.034), cp, [-0.24, 0.15, 0.2]);
  amphora(cp, 0.34, -0.12);
  sack(cp, 0.34, 0.1, 10);
  barrel(cp, -0.34, -0.18);

  // ---- camp fire --------------------------------------------------------------------------------------------
  const cf = Rig.at(-0.28, GY, -0.3, 0);
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * 2 * Math.PI;
    dec(k % 2 === 0 ? STONE_D : STONE, ico(), cf, [Math.sin(a) * 0.11, 0.02, Math.cos(a) * 0.11], {
      s: [0.035, 0.028, 0.032],
      rot: [0, k * 40, 0],
    });
  }
  for (let k = 0; k < 3; k++) {
    dec(WOOD, cyl(0.016, 0.016, 0.15, 6), cf, [0, 0.03 + k * 0.012, 0], { rot: [0, k * 60, 80] });
  }
  dec(DARK, ball(0.07, 6, 3), cf, [0, 0.005, 0], { s: [1, 0.2, 1] });
  glow(put(cone(0.045, 0.14, 5), FIRE, cf, [0, 0.1, 0]), 1.5);
  glow(put(cone(0.03, 0.1, 5), EMBER, cf, [0.012, 0.08, 0.008]), 1.5);
  glow(put(cone(0.02, 0.07, 4), EMBER, cf, [-0.025, 0.06, -0.02]), 1.5);
  for (const a of [0.5, 2.6, 4.7]) {
    link(WOOD, cf.p(Math.sin(a) * 0.17, 0, Math.cos(a) * 0.17), cf.p(0, 0.31, 0), 0.007, 5, 0.006);
  }
  link(IRON, cf.p(0, 0.31, 0), cf.p(0, 0.225, 0), 0.003, 4);
  put(new THREE.SphereGeometry(0.052, 8, 5, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), IRON, cf, [0, 0.225, 0], { s: [1, 0.8, 1] });
  dec(IRON, tor(0.052, 0.005, 4, 8), cf, [0, 0.225, 0], { rot: [90, 0, 0] });
  dec(SOUP, cyl(0.048, 0.048, 0.004, 8), cf, [0, 0.222, 0]);
  for (let k = 0; k < 3; k++) {
    dec(STEAM, ball(0.012 + k * 0.004, 5, 3), cf, [0.01 * k, 0.25 + k * 0.045, 0.006 * k]);
  }
  for (const [lx, lz, ly] of [
    [0.22, 0.12, 25],
    [-0.2, 0.18, -20],
  ]) {
    dec(WOOD, cyl(0.04, 0.04, 0.17, 7), cf, [lx, 0.04, lz], { rot: [0, ly, 90] });
    dec(WOOD_L, cyl(0.034, 0.034, 0.004, 7), cf, [lx + Math.cos(ly * DEG) * 0.086, 0.04, lz - Math.sin(ly * DEG) * 0.086], {
      rot: [0, ly, 90],
    });
  }

  // ---- signpost ---------------------------------------------------------------------------------------------
  const sg = Rig.at(-0.36, GY, 0.42, 0);
  link(WOOD, sg.p(0, -0.01, 0), sg.p(0, 0.32, 0), 0.014, 6, 0.011);
  dec(BRASS, ball(0.018, 5, 3), sg, [0, 0.335, 0]);
  const ARROW: OutlinePoint[] = [
    [0, -0.025],
    [0.12, -0.025],
    [0.155, 0],
    [0.12, 0.025],
    [0, 0.025],
  ];
  for (const [yaw, h, tex] of [
    [110, 0.27, ICON_PALM],
    [-160, 0.21, ICON_TENT],
  ] as Array<[number, number, THREE.Texture]>) {
    const pl = Rig.at(sg.o.x, GY + h, sg.o.z, yaw);
    b.extrude(ARROW, { at: pl.p(0, 0, 0.012), x: pl.d(0, 0, 1), thickness: 0.01, color: WOOD_L });
    for (const s of [1, -1]) {
      put(new THREE.PlaneGeometry(0.04, 0.04), TEXW, pl, [s * 0.0055, 0, 0.05], { rot: [0, s * 90, 0], tex });
    }
  }

  // ---- cacti ------------------------------------------------------------------------------------------------
  const cactus = (x: number, z: number, h: number, flip: number) => {
    b.sweep(
      catmull([new THREE.Vector3(x, GY - 0.01, z), new THREE.Vector3(x, GY + h * 0.5, z), new THREE.Vector3(x + 0.005, GY + h, z)]),
      [0.048, 0.046, 0.04],
      { color: CACTUS, sides: 6, smooth: false },
    );
    const y0 = GY + h * 0.45;
    for (const s of [1, -1]) {
      const sx = s * flip;
      const y1 = y0 + (s > 0 ? 0 : 0.06);
      b.sweep(
        catmull([
          new THREE.Vector3(x + sx * 0.03, y1, z),
          new THREE.Vector3(x + sx * 0.09, y1 + 0.01, z),
          new THREE.Vector3(x + sx * 0.115, y1 + 0.08, z),
          new THREE.Vector3(x + sx * 0.115, y1 + 0.16, z),
        ]),
        [0.028, 0.027, 0.024],
        { color: CACTUS, sides: 6, smooth: false },
      );
      dec(PINK, ball(0.014, 5, 3), W, [x + sx * 0.115, y1 + 0.2, z]);
    }
    dec(PINK, ball(0.016, 5, 3), W, [x, GY + h + 0.035, z]);
    dec(GOLD, ball(0.007, 4, 3), W, [x + 0.01, GY + h + 0.05, z]);
    for (let k = 0; k < 14; k++) {
      const a = k * 1.9;
      const yy = GY + 0.05 + (k / 14) * h * 0.9;
      dec(WHITE, cone(0.003, 0.016, 3), W, [x + 0.047 * Math.sin(a), yy, z + 0.047 * Math.cos(a)], {
        rot: [Math.cos(a) * 80, 0, -Math.sin(a) * 80],
      });
    }
  };
  cactus(1.15, 0.12, 0.32, 1);
  cactus(-1.12, -0.2, 0.22, -1);
  put(ball(0.07, 8, 5), CACTUS, W, [0.95, GY + 0.04, -0.02], { s: [1, 0.9, 1] });
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * 2 * Math.PI;
    dec(GOLD, ball(0.008, 4, 3), W, [0.95 + 0.03 * Math.sin(a), GY + 0.1, -0.02 + 0.03 * Math.cos(a)]);
  }

  // ---- rocks and lizard -------------------------------------------------------------------------------------
  const rockPaintA = mottle(STONE, STONE_D, { size: 0.12, contrast: 0.8, seed: 5 });
  for (const [rx, rz, sx, sy, sz, yaw] of [
    [0.9, 0.0, 0.1, 0.07, 0.08, 20],
    [1.0, -0.06, 0.06, 0.05, 0.05, -30],
    [-1.1, 0.0, 0.09, 0.06, 0.07, 50],
    [-0.38, -0.52, 0.07, 0.05, 0.06, 10],
    [0.3, 1.0, 0.07, 0.045, 0.06, 70],
  ]) {
    put(ico(), rockPaintA, W, [rx, GY + sy * 0.4, rz], { s: [sx, sy, sz], rot: [0, yaw, 0] });
  }
  const lz = Rig.at(0.9, GY + 0.082, 0.0, 130);
  dec(LIZARD, ball(0.014, 5, 4), lz, [0, 0, 0], { s: [0.8, 0.6, 1.8] });
  dec(LIZARD, ball(0.011, 5, 4), lz, [0, 0.002, 0.03]);
  dec(LIZARD, cone(0.007, 0.05, 4), lz, [0, -0.002, -0.05], { rot: [-90, 0, 0] });
  dec(BLACK, ball(0.003, 3, 3), lz, [0.006, 0.008, 0.036]);
  dec(BLACK, ball(0.003, 3, 3), lz, [-0.006, 0.008, 0.036]);
  for (const [sx, sz2] of [
    [1, 0.014],
    [-1, 0.014],
    [1, -0.016],
    [-1, -0.016],
  ]) {
    dec(LIZARD, box(0.016, 0.004, 0.006), lz, [sx * 0.016, -0.008, sz2], { rot: [0, sx * 30, 0] });
  }

  // ---- reeds and cattails -----------------------------------------------------------------------------------
  for (const a of [-1.1, -0.8, -0.55, 2.4]) {
    const rx = PX + (PRX + 0.1) * Math.sin(a);
    const rz = PZ + (PRZ + 0.1) * Math.cos(a);
    for (let k = 0; k < 3; k++) {
      const ox = rx + (k - 1) * 0.025;
      const oz = rz + (k % 2) * 0.02;
      const hh = 0.22 + k * 0.05;
      link(REED, new THREE.Vector3(ox, GY, oz), new THREE.Vector3(ox + 0.01, GY + hh, oz), 0.004, 4);
      dec(CATTAIL, cyl(0.01, 0.01, 0.05, 5), W, [ox + 0.01, GY + hh - 0.02, oz]);
      dec(CATTAIL, cone(0.01, 0.02, 5), W, [ox + 0.01, GY + hh + 0.015, oz]);
    }
  }

  // ---- footprints -------------------------------------------------------------------------------------------
  for (let k = 0; k < 8; k++) {
    const t = k / 7;
    const fx = 0.86 + (0.56 - 0.86) * t;
    const fz = 0.5 + (0.34 - 0.5) * t;
    const side = k % 2 === 0 ? 1 : -1;
    dec(WET, cyl(0.016, 0.016, 0.004, 6), W, [fx + side * 0.02, GY + 0.002, fz + side * 0.008], { s: [1, 1, 1.3], rot: [0, -70, 0] });
  }

  // ---- camels -----------------------------------------------------------------------------------------------
  const furFrames: FrameInput[] = [];
  const camel = (g: Rig, o: CamelOpt) => {
    const by = o.kneel ? 0.085 : 0.2;
    const kn = o.kneel === true;
    b.loft(
      [
        { at: g.p(0, by + 0.005, -0.2), w: 0.11, h: 0.13 },
        { at: g.p(0, by + 0.005, -0.12), w: 0.15, h: 0.16 },
        { at: g.p(0, by - 0.005, 0.0), w: 0.15, h: 0.15 },
        { at: g.p(0, by + 0.005, 0.1), w: 0.15, h: 0.16 },
        { at: g.p(0, by + 0.01, 0.18), w: 0.11, h: 0.13 },
      ],
      { color: o.coat, sides: 8, smooth: false },
    );
    if ((o.humps ?? 1) === 1) {
      put(ball(0.075, 7, 5), o.coat, g, [0, by + 0.115, -0.04], { s: [1, 1.15, 1.35] });
      furFrames.push(frame(g.p(0, by + 0.2, -0.04), g.d(0, 1, 0.3)));
      furFrames.push(frame(g.p(0.02, by + 0.19, -0.07), g.d(0, 1, -0.2)));
    } else {
      for (const hz of [-0.09, 0.055]) {
        put(ball(0.068, 7, 5), o.coat, g, [0, by + 0.105, hz], { s: [0.95, 1.1, 1.0] });
        furFrames.push(frame(g.p(0, by + 0.18, hz), g.d(0, 1, 0.2)));
        furFrames.push(frame(g.p(0.015, by + 0.17, hz - 0.03), g.d(0, 1, -0.2)));
      }
    }
    // neck and head
    const drink = o.pose === "drink";
    const neckPts = drink
      ? [g.p(0, by + 0.06, 0.13), g.p(0, by + 0.08, 0.24), g.p(0, by - 0.03, 0.34), g.p(0, by - 0.13, 0.38)]
      : [g.p(0, by + 0.06, 0.13), g.p(0, by + 0.12, 0.21), g.p(0, by + 0.24, 0.25), g.p(0, by + 0.31, 0.29)];
    const neckPath = catmull(neckPts);
    const neck = b.sweep(neckPath, [0.05, 0.04, 0.034, 0.036], { color: o.coat, sides: 7, smooth: false });
    for (const t of [0.2, 0.35, 0.5, 0.65, 0.8]) {
      furFrames.push(neck.at(t, 180));
      furFrames.push(neck.at(t, 145));
      furFrames.push(neck.at(t, 215));
    }
    const hp: V = drink ? [0, by - 0.145, 0.405] : [0, by + 0.335, 0.325];
    const hdir: V = drink ? [0, -0.5, 0.87] : [0, -0.05, 1];
    const hg = g.sub(hp, hdir);
    put(ball(0.04, 7, 5), o.coat, hg, [0, 0, 0], { s: [1, 1.05, 1.3] });
    put(ball(0.03, 6, 4), o.coat, hg, [0, -0.012, 0.07], { s: [0.95, 0.9, 1.5] });
    dec(CAMEL, ball(0.02, 5, 4), hg, [0, -0.017, 0.115], { s: [1.1, 0.9, 0.9] });
    dec(CAMEL_L, ball(0.024, 6, 4), hg, [0, -0.037, 0.06], { s: [0.9, 0.55, 1.9] });
    dec(DARK, box(0.03, 0.003, 0.06), hg, [0, -0.027, 0.085]);
    for (const s of [1, -1]) {
      dec(BLACK, ball(0.005, 4, 3), hg, [s * 0.011, -0.008, 0.127]);
      dec(BLACK, ball(0.015, 6, 4), hg, [s * 0.036, 0.014, 0.025]);
      dec(WHITE, ball(0.005, 4, 3), hg, [s * 0.042, 0.023, 0.036]);
      dec(CAMEL_D, ball(0.016, 5, 3), hg, [s * 0.034, 0.03, 0.02], { s: [1, 0.6, 1.3] });
      dec(BLACK, cone(0.002, 0.018, 3), hg, [s * 0.04, 0.034, 0.038], { rot: [-40, 0, -s * 40] });
      dec(BLACK, cone(0.002, 0.018, 3), hg, [s * 0.043, 0.03, 0.032], { rot: [-20, 0, -s * 60] });
      dec(CAMEL_D, cone(0.013, 0.04, 5), hg, [s * 0.03, 0.05, -0.035], { rot: [-15, 0, -s * 35] });
      dec(PINK, cone(0.007, 0.028, 4), hg, [s * 0.031, 0.05, -0.028], { rot: [-15, 0, -s * 35] });
    }
    dec(CAMEL_D, cone(0.012, 0.03, 5), hg, [0, 0.045, 0.0], { rot: [30, 0, 0] });
    dec(RED, tor(0.031, 0.004, 4, 8), hg, [0, -0.012, 0.07], { s: [0.95, 0.9, 1] });
    dec(RED, tor(0.044, 0.003, 4, 8), hg, [0, 0.0, -0.015], { s: [0.9, 1, 1] });
    dec(BRASS, ball(0.007, 4, 3), hg, [0, -0.04, 0.07]);
    // bell on a collar
    const bt = 0.45;
    const pc = neckPath.at(bt).clone();
    const tq = aim(neckPath.tangentAt(bt), undefined, "z");
    decW(RED, tor(0.043, 0.005, 4, 8), pc, tq);
    decW(BRASS, ball(0.017, 6, 4), pc.clone().add(new THREE.Vector3(0, -0.052, 0)));
    decW(BLACK, ball(0.004, 3, 3), pc.clone().add(new THREE.Vector3(0, -0.066, 0)));
    // legs
    for (const s of [1, -1]) {
      const front = kn
        ? [g.p(s * 0.058, 0.09, 0.1), g.p(s * 0.062, 0.03, 0.14), g.p(s * 0.062, 0.022, 0.08), g.p(s * 0.062, 0.022, 0.03)]
        : [g.p(s * 0.055, by + 0.02, 0.1), g.p(s * 0.058, 0.075, 0.115), g.p(s * 0.058, 0.04, 0.112), g.p(s * 0.058, 0.014, 0.118)];
      b.sweep(catmull(front), [0.042, 0.03, 0.022, 0.02], { color: o.coat, sides: 6, smooth: false, caps: { start: "round", end: "flat" } });
      const hind = kn
        ? [g.p(s * 0.065, 0.09, -0.12), g.p(s * 0.085, 0.03, -0.19), g.p(s * 0.085, 0.022, -0.11)]
        : [g.p(s * 0.062, by + 0.03, -0.13), g.p(s * 0.065, by - 0.06, -0.085), g.p(s * 0.062, 0.06, -0.145), g.p(s * 0.06, 0.014, -0.135)];
      b.sweep(catmull(hind), kn ? [0.05, 0.025, 0.02] : [0.05, 0.032, 0.022, 0.02], {
        color: o.coat,
        sides: 6,
        smooth: false,
        caps: { start: "round", end: "flat" },
      });
      if (kn) {
        dec(HOOF, cyl(0.024, 0.026, 0.012, 6), g, [s * 0.062, 0.012, 0.025], { s: [1, 1, 1.3] });
        dec(HOOF, cyl(0.024, 0.026, 0.012, 6), g, [s * 0.085, 0.012, -0.105], { s: [1, 1, 1.3] });
        dec(CAMEL_D, ball(0.016, 5, 3), g, [s * 0.062, 0.035, 0.16]);
      } else {
        dec(HOOF, cyl(0.026, 0.028, 0.016, 6), g, [s * 0.058, 0.008, 0.12], { s: [1, 1, 1.25] });
        dec(HOOF, cyl(0.026, 0.028, 0.016, 6), g, [s * 0.06, 0.008, -0.135], { s: [1, 1, 1.25] });
        dec(CAMEL_D, ball(0.016, 5, 3), g, [s * 0.058, 0.07, 0.135]);
      }
    }
    // tail
    const tail = [g.p(0, by + 0.06, -0.19), g.p(0, by + 0.03, -0.255), g.p(0, by - 0.04, -0.268), g.p(0, by - (kn ? 0.05 : 0.11), -0.262)];
    b.sweep(catmull(tail), [0.016, 0.011, 0.008, 0.006], { color: o.coat, sides: 5, smooth: false });
    dec(CAMEL_D, ball(0.015, 5, 4), g, [0, by - (kn ? 0.05 : 0.11) - 0.012, -0.262], { s: [1, 1.8, 1] });
    // blanket and tassels
    if (o.blanket) {
      const { z, d } = o.blanket;
      put(box(0.17, 0.012, d), TEXW, g, [0, by + 0.087, z], { tex: BLANKET });
      for (const s of [1, -1]) {
        put(box(0.012, 0.1, d), TEXW, g, [s * 0.0795, by + 0.035, z], { tex: BLANKET });
        for (const e of [1, -1]) {
          dec(GOLD, cone(0.008, 0.025, 4), g, [s * 0.0795, by - 0.028, z + e * d * 0.42], { rot: [180, 0, 0] });
        }
      }
    }
    if (o.load) {
      for (const [s, col] of [
        [1, TEAL],
        [-1, ORANGE],
      ] as Array<[number, string]>) {
        dec(col, ball(0.06, 7, 5), g, [s * 0.125, by - 0.02, -0.01], { s: [0.6, 1, 0.8] });
        dec(ROPE, tor(0.044, 0.004, 3, 8), g, [s * 0.125, by - 0.02, -0.01], { rot: [0, 0, 90], s: [1, 1.1, 1] });
        dec(CLAY_D, ball(0.012, 4, 3), g, [s * 0.125, by + 0.045, -0.01]);
      }
      put(
        cyl(0.035, 0.035, 0.2, 8),
        paint((_p, _n, s) => (Math.floor(s[1] * 10) % 2 === 0 ? "#c0392b" : "#f2d28b")),
        g,
        [0, by + 0.115, 0.115],
        { rot: [0, 0, 90] },
      );
      for (const s of [1, -1]) dec(ROPE, tor(0.038, 0.004, 3, 8), g, [s * 0.06, by + 0.115, 0.115], { rot: [0, 90, 0] });
    }
    if (o.reins) {
      for (const s of [1, -1]) {
        b.sweep(catmull([hg.p(s * 0.034, -0.02, 0.07), g.p(s * 0.065, by + 0.16, 0.22), g.p(s * 0.06, by + 0.1, 0.09)]), 0.003, {
          color: RED,
          sides: 4,
        });
      }
    }
  };

  camel(Rig.at(0.95, GY, 0.4, -80), {
    coat: coatPaint("#c99556", "#b07a3e", 21),
    pose: "proud",
    blanket: { z: 0.1, d: 0.12 },
    load: true,
    reins: true,
  });
  camel(Rig.at(0.05, GY, -1.0, 15), {
    coat: coatPaint("#a8723f", "#8a5a30", 22),
    kneel: true,
    humps: 2,
    pose: "proud",
    blanket: { z: -0.02, d: 0.07 },
  });
  camel(Rig.at(-0.05, GY, 0.9, 180), {
    coat: coatPaint("#dcb070", "#c4954f", 23),
    pose: "drink",
    blanket: { z: 0.1, d: 0.12 },
  });

  // ---- cards and merged details -----------------------------------------------------------------------------
  const leafSizes: Array<[number, number]> = [
    [0.075, 0.24],
    [0.05, 0.15],
    [0.05, 0.15],
    [0.035, 0.1],
  ];
  leafBuckets.forEach((bucket, idx) => {
    if (!bucket.fr.length) return;
    b.cards(bucket.fr, LEAF, {
      size: leafSizes[idx],
      lean: 60,
      flow: (_f, i) => bucket.flow[i],
      vary: 0.2,
      rng: rng(40 + idx),
      spin: 8,
    });
  });
  b.cards(furFrames, FUR, { size: [0.04, 0.06], lean: 40, vary: 0.3, rng: rng(5), spin: 25 });

  const tufts: FrameInput[] = [];
  const grassRand = rng(21);
  for (let k = 0; k < 18; k++) {
    const a = (k / 18) * 2 * Math.PI + grassRand() * 0.2;
    const gx = PX + (PRX + 0.1 + 0.08 * grassRand()) * Math.sin(a);
    const gz = PZ + (PRZ + 0.1 + 0.08 * grassRand()) * Math.cos(a);
    if (gz > 0.4 && Math.abs(gx + 0.05) < 0.28) continue;
    tufts.push(frame(new THREE.Vector3(gx, GY, gz), [0, 1, 0]));
  }
  for (const [gx, gz] of [
    [-0.55, -0.05],
    [-0.68, -0.18],
    [0.72, 0.05],
    [0.6, -0.12],
    [0.05, -0.55],
    [0.2, -0.45],
    [0.48, 0.72],
    [0.55, 0.82],
    [-0.4, 0.66],
    [-0.32, 0.76],
  ]) {
    tufts.push(frame(new THREE.Vector3(gx, GY, gz), [0, 1, 0]));
  }
  b.cards(tufts, GRASS, { size: [0.1, 0.11], lean: 8, bend: 25, cross: true, vary: 0.3, rng: rng(22), spin: 90 });

  bag.forEach((geos, color) => {
    const merged = mergeGeometries(geos);
    if (!merged) return;
    b.part(merged, color, { bone: base, at: [0, 0, 0], flat: true, name: `deco${color.slice(1)}` });
  });

  return b.root;
}
