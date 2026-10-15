import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { DEG, rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { noise, paint, stripes } from "../../../../src/paint";
import { interpolate } from "../../../../src/sweep";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Desert Oasis",
  description:
    "A tiny desert island of layered sandstone with a turquoise oasis pond, three faceted palms, a striped sultan tent and a ridge tent, two grown camels and a calf, a campfire with a pot, market goods, bunting, a swinging sign and lanterns.",
  style: "low-poly whimsical mix",
  commit: "88fc1f0",
};

type V = [number, number, number];

const GY = 0.2; // top of the sand plate: everything stands here

const C = {
  sand: "#f1d08c",
  sandD: "#dfb06a",
  sandL: "#f9e4ad",
  grass: "#6cae4a",
  grassD: "#3f8a3f",
  grassL: "#a6d85c",
  water: "#2fc4c9",
  waterD: "#1b97b0",
  waterL: "#a4f3ea",
  stone: "#a58b78",
  stoneD: "#7d6556",
  stoneL: "#c9b3a0",
  trunk: "#a3703f",
  trunkD: "#6e4626",
  frond: "#3fae4c",
  frondD: "#2b8a47",
  frondL: "#8bd85e",
  frondDry: "#b8a248",
  date: "#e0772b",
  coco: "#6b4526",
  coat: "#dba461",
  coatD: "#b9783d",
  coatL: "#f3d9a2",
  hoof: "#4a3326",
  dark: "#2a1f2b",
  white: "#fffaf0",
  red: "#d9473d",
  teal: "#1fa6a0",
  tealD: "#17807c",
  gold: "#f4bb3d",
  cream: "#fff0d0",
  indigo: "#3b4a9c",
  orange: "#f08a32",
  pink: "#ff8fb8",
  purple: "#8a4fa6",
  wood: "#8a5a33",
  woodD: "#5f3c22",
  rope: "#cfae72",
  wicker: "#c99a52",
  wickerD: "#a67a3a",
  ember: "#ff7a2a",
  flame: "#ffd24a",
  smoke: "#e3dedb",
  cactus: "#5fae62",
  cactusD: "#3f8c52",
  melon: "#4fa24a",
  jar: "#c8653b",
};

/** A scaled, yawed local frame: camels, tents and props are authored in their own units and placed with this. */
class Loc {
  private readonly cs: number;
  private readonly sn: number;
  constructor(
    readonly x: number,
    readonly z: number,
    readonly yaw = 0,
    readonly k = 1,
    readonly y = GY,
  ) {
    this.cs = Math.cos(yaw * DEG);
    this.sn = Math.sin(yaw * DEG);
  }
  p(q: readonly number[]): V {
    return [
      this.x + (q[0] * this.cs + q[2] * this.sn) * this.k,
      this.y + q[1] * this.k,
      this.z + (-q[0] * this.sn + q[2] * this.cs) * this.k,
    ];
  }
  d(q: readonly number[]): V {
    return [q[0] * this.cs + q[2] * this.sn, q[1], -q[0] * this.sn + q[2] * this.cs];
  }
  inv(p: THREE.Vector3): V {
    const dx = p.x - this.x;
    const dz = p.z - this.z;
    return [(dx * this.cs - dz * this.sn) / this.k, (p.y - this.y) / this.k, (dx * this.sn + dz * this.cs) / this.k];
  }
  quat(rot: readonly number[] = [0, 0, 0]) {
    const yaw = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, this.yaw * DEG, 0));
    const local = new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG));
    return yaw.multiply(local);
  }
}

export default function build() {
  const b = createBuilder({ name: "desertOasis", paintSize: 2048 });
  const base = b.joint("base", { at: [0, 0, 0], dir: [0, 1, 0] });

  // ---------------------------------------------------------------- geometry shorthands
  const sph = (r: number, w = 7, h = 5) => new THREE.SphereGeometry(r, w, h);
  const cyl = (rt: number, rb: number, h: number, seg = 8) => new THREE.CylinderGeometry(rt, rb, h, seg);
  const box = (x: number, y: number, z: number) => new THREE.BoxGeometry(x, y, z);
  const cone = (r: number, h: number, seg = 6) => new THREE.ConeGeometry(r, h, seg);
  const ico = (r: number) => new THREE.IcosahedronGeometry(r, 0);
  const tri = (w: number, h: number, t = 0.008) => {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0);
    s.lineTo(w / 2, 0);
    s.lineTo(0, -h);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false });
    g.translate(0, 0, -t / 2);
    return g;
  };

  /** Many small static pieces of one colour on the base bone, merged at the end into one part each. */
  const buckets = new Map<string, THREE.BufferGeometry[]>();
  const put = (color: string, geo: THREE.BufferGeometry, at: readonly number[], q?: THREE.Quaternion, s: number | V = 1) => {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    g.clearGroups();
    const sc = typeof s === "number" ? new THREE.Vector3(s, s, s) : new THREE.Vector3(s[0], s[1], s[2]);
    g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(at[0], at[1], at[2]), q ?? new THREE.Quaternion(), sc));
    const list = buckets.get(color) ?? [];
    list.push(g);
    buckets.set(color, list);
  };
  const flush = () => {
    for (const [color, list] of buckets) {
      const merged = mergeGeometries(list);
      if (merged) b.part(merged, color, { bone: base, at: [0, 0, 0], flat: true, name: `bits.${color}` });
    }
  };

  /** A flat-shaded primitive placed in a Loc's frame; sizes scale with the Loc. */
  const obj = (
    geo: THREE.BufferGeometry,
    color: string | ReturnType<typeof paint>,
    L: Loc,
    pos: readonly number[],
    o: { s?: number | V; rot?: readonly number[]; bone?: ReturnType<typeof b.joint>; name?: string } = {},
  ) => {
    const s = o.s ?? 1;
    const sc: V = typeof s === "number" ? [s * L.k, s * L.k, s * L.k] : [s[0] * L.k, s[1] * L.k, s[2] * L.k];
    return b.part(geo, color, { at: L.p(pos), quat: L.quat(o.rot), scale: sc, flat: true, bone: o.bone, name: o.name });
  };

  /** A plan-view outline [x, z] drawn flat: extrude's y axis runs toward -z so the slab's thickness points up. */
  const plan = (pts: ReadonlyArray<readonly [number, number]>): OutlinePoint[] =>
    pts.map(([x, z]) => [x, -z] as [number, number]);
  const slab = (
    pts: ReadonlyArray<readonly [number, number]>,
    y0: number,
    th: number,
    color: string | ReturnType<typeof paint>,
    at: [number, number] = [0, 0],
    bevel = 0,
    name?: string,
  ) =>
    b.extrude(plan(pts), {
      at: [at[0], y0 + th / 2, at[1]],
      x: [1, 0, 0],
      y: [0, 0, -1],
      thickness: th,
      bevel,
      color,
      bone: base,
      name,
    });
  const blobPts = (rx: number, rz: number, n: number, ph: number, wob: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      const r = 1 + wob * Math.sin(3 * a + ph) + wob * 0.7 * Math.cos(5 * a + ph * 1.7);
      return [rx * r * Math.cos(a), rz * r * Math.sin(a)] as [number, number];
    });

  // ---------------------------------------------------------------- paints
  const sandPaint = paint((p) => {
    const w = Math.sin((p.x * 0.55 + p.z) * 30 + noise(p, 0.6, 5) * 7);
    if (w > 0.84) return C.sandD;
    return noise(p, 0.45, 2) > 0.62 ? C.sandL : C.sand;
  });
  const rockPaint = (a: string, bb: string, c: string, seed: number) =>
    paint((p, n) => {
      if (n.y > 0.6) return c;
      const v = noise(p, 0.22, seed);
      const band = Math.sin(p.y * 90 + v * 6);
      return band > 0.55 ? a : bb;
    });

  // ---------------------------------------------------------------- the island plate: three stacked sandstone layers
  const BX = 1.6;
  const BZ = 1.35;
  slab(blobPts(BX * 0.9, BZ * 0.9, 16, 0.0, 0.05), 0, 0.075, rockPaint("#8d5a3a", "#a56b43", "#b57a4a", 1), [0, 0], 0.006, "plate.low");
  slab(blobPts(BX * 0.95, BZ * 0.95, 16, 1.3, 0.05), 0.075, 0.07, rockPaint("#b57a4a", "#c98d58", "#d7a269", 2), [0, 0], 0.006, "plate.mid");
  slab(
    blobPts(BX, BZ, 16, 2.7, 0.05),
    0.145,
    0.055,
    paint((p, n) => (n.y > 0.5 ? sandPaint : noise(p, 0.3, 4) > 0.5 ? "#e8c47c" : "#dcb36d")),
    [0, 0],
    0.008,
    "plate.top",
  );

  // ---------------------------------------------------------------- dunes (faceted hemispheres tucked into the rim)
  const dune = (x: number, z: number, rx: number, ry: number, rz: number, yaw: number) => {
    const L = new Loc(x, z, yaw);
    b.part(new THREE.SphereGeometry(1, 9, 4, 0, Math.PI * 2, 0, Math.PI / 2), sandPaint, {
      at: [x, GY - 0.01, z],
      quat: L.quat(),
      scale: [rx, ry, rz],
      flat: true,
      bone: base,
      name: "dune",
    });
  };
  dune(-1.38, -0.12, 0.24, 0.2, 0.5, 10);
  dune(1.42, 0.12, 0.2, 0.17, 0.46, -8);
  dune(-1.0, 0.95, 0.4, 0.13, 0.22, 25);
  dune(0.3, -1.12, 0.45, 0.14, 0.17, 5);

  // pebbles and tufts of dry grass on the sand
  const rnd = rng(11);
  for (let i = 0; i < 22; i++) {
    const a = rnd() * Math.PI * 2;
    const r = 0.5 + rnd() * 0.85;
    const x = Math.cos(a) * r * 1.2;
    const z = Math.sin(a) * r * 0.95;
    if (Math.hypot((x + 0.1) / 1.0, (z - 0.12) / 0.7) < 1.25) continue;
    put(i % 3 ? C.stone : C.stoneL, ico(0.012 + rnd() * 0.018), [x, GY + 0.004, z], new THREE.Quaternion().setFromEuler(new THREE.Euler(rnd() * 3, rnd() * 3, 0)), [1, 0.7, 1]);
  }

  // ---------------------------------------------------------------- the oasis pond
  const PCX = -0.1;
  const PCZ = 0.12;
  const PX = 0.5;
  const PZ = 0.34;
  const pondR = (a: number) => 1 + 0.1 * Math.sin(3 * a + 0.7) + 0.07 * Math.cos(2 * a);
  const pondPts = (scale: number) =>
    Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2;
      return [PX * scale * pondR(a) * Math.cos(a), PZ * scale * pondR(a) * Math.sin(a)] as [number, number];
    });
  const grassPaint = paint((p) => {
    const v = noise(p, 0.22, 8);
    if (v > 0.66) return C.grassL;
    return v < 0.34 ? C.grassD : C.grass;
  });
  slab(pondPts(1.55), GY, 0.022, grassPaint, [PCX, PCZ], 0.005, "pond.grass");
  slab(pondPts(1.2), GY + 0.022, 0.012, paint((p) => (noise(p, 0.18, 3) > 0.5 ? "#c9a266" : "#b98f56")), [PCX, PCZ], 0, "pond.rim");
  const waterPaint = paint((p, n, s) => {
    if (n.y < 0.5) return C.waterD;
    const u = s[0] / PX;
    const v = -s[1] / PZ;
    const a = Math.atan2(v, u);
    const e = Math.hypot(u, v) / pondR(a);
    if (e > 0.86) return C.waterL;
    if (Math.sin(e * 16 + noise(p, 0.3, 3) * 5) > 0.86) return C.waterL;
    if (noise(p, 0.28, 9) > 0.7) return C.water;
    return e > 0.5 ? C.water : C.waterD;
  });
  slab(pondPts(1), GY + 0.034, 0.012, waterPaint, [PCX, PCZ], 0.003, "pond.water");
  const WY = GY + 0.046; // water surface

  // sparkles
  const sparkle = (x: number, z: number, s: number) => {
    const sh = new THREE.Shape();
    sh.moveTo(0, s);
    sh.lineTo(s * 0.25, s * 0.25);
    sh.lineTo(s, 0);
    sh.lineTo(s * 0.25, -s * 0.25);
    sh.lineTo(0, -s);
    sh.lineTo(-s * 0.25, -s * 0.25);
    sh.lineTo(-s, 0);
    sh.lineTo(-s * 0.25, s * 0.25);
    sh.closePath();
    const g = new THREE.ShapeGeometry(sh);
    g.rotateX(-Math.PI / 2);
    put(C.white, g, [x, WY + 0.0015, z]);
  };
  sparkle(-0.3, 0.02, 0.03);
  sparkle(0.12, 0.3, 0.022);
  sparkle(0.2, 0.0, 0.017);
  sparkle(-0.42, 0.22, 0.02);

  // lily pads with lotus flowers
  const pad = (x: number, z: number, r: number, rot: number, flower: boolean) => {
    const pts: Array<[number, number]> = [[0, 0]];
    for (let i = 0; i < 8; i++) {
      const a = 0.45 + (i / 7) * (Math.PI * 2 - 0.9);
      pts.push([Math.cos(a + rot) * r, Math.sin(a + rot) * r]);
    }
    b.extrude(plan(pts), {
      at: [x, WY + 0.004, z],
      x: [1, 0, 0],
      y: [0, 0, -1],
      thickness: 0.006,
      color: C.grassD,
      bone: base,
      name: "lilypad",
    });
    if (!flower) return;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.8, a, 0, "YXZ"));
      put(i % 2 ? C.pink : "#ffc4da", cone(0.02, 0.07, 4), [x + Math.sin(a) * 0.025, WY + 0.04, z + Math.cos(a) * 0.025], q);
    }
    put(C.gold, sph(0.016, 6, 4), [x, WY + 0.03, z]);
  };
  pad(-0.28, 0.2, 0.085, 0.3, true);
  pad(0.1, 0.34, 0.07, 2.2, false);
  pad(-0.02, 0.06, 0.06, 4.0, true);
  pad(0.22, 0.14, 0.055, 1.0, false);
  pad(-0.4, 0.04, 0.05, 5.0, false);

  // stones around the water
  const rr = rng(23);
  for (let i = 0; i < 17; i++) {
    const a = (i / 17) * Math.PI * 2 + rr() * 0.12;
    const m = 1.17 + rr() * 0.07;
    const x = PCX + PX * m * pondR(a) * Math.cos(a);
    const z = PCZ + PZ * m * pondR(a) * Math.sin(a);
    const s = 0.04 + rr() * 0.05;
    put(i % 3 === 0 ? C.stoneL : i % 3 === 1 ? C.stone : C.stoneD, ico(s), [x, GY + 0.03 + s * 0.15, z], new THREE.Quaternion().setFromEuler(new THREE.Euler(rr() * 3, rr() * 3, rr() * 3)), [1.1, 0.7, 1]);
  }

  // reeds with cattails
  const reeds = (cx: number, cz: number, n: number, seed: number) => {
    const r = rng(seed);
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2;
      const d = 0.03 + r() * 0.07;
      const x = cx + Math.cos(a) * d;
      const z = cz + Math.sin(a) * d;
      const h = 0.22 + r() * 0.16;
      const lean = 0.05 + r() * 0.05;
      const tip: V = [x + Math.cos(a) * lean, GY + 0.025 + h, z + Math.sin(a) * lean];
      b.sweep([[x, GY + 0.02, z], tip], [0.008, 0.002], { sides: 4, color: i % 2 ? C.grassL : C.grass, caps: "point", bone: base, name: "reed" });
      if (i % 2 === 0) b.capsule([tip[0] - Math.cos(a) * 0.012, tip[1] - 0.045, tip[2] - Math.sin(a) * 0.012], [tip[0] - Math.cos(a) * 0.005, tip[1] - 0.005, tip[2] - Math.sin(a) * 0.005], 0.014, C.coco, { sides: 5, bone: base, name: "cattail" });
    }
  };
  reeds(-0.62, 0.0, 6, 5);
  reeds(0.42, 0.4, 5, 6);
  reeds(-0.45, 0.5, 4, 7);

  // grass tufts and little flowers around the pond
  const rg = rng(31);
  for (let i = 0; i < 20; i++) {
    const a = rg() * Math.PI * 2;
    const m = 1.3 + rg() * 0.28;
    const x = PCX + PX * m * pondR(a) * Math.cos(a);
    const z = PCZ + PZ * m * pondR(a) * Math.sin(a);
    for (let j = 0; j < 3; j++) {
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler((rg() - 0.5) * 0.6, rg() * 3, (rg() - 0.5) * 0.6));
      put(j === 1 ? C.grassL : C.grass, cone(0.012, 0.06 + rg() * 0.04, 3), [x + (j - 1) * 0.014, GY + 0.05, z + (rg() - 0.5) * 0.02], q);
    }
    if (i % 4 === 0) {
      put(C.grassD, cyl(0.003, 0.003, 0.05, 4), [x + 0.03, GY + 0.047, z], undefined);
      put(i % 8 === 0 ? C.pink : C.gold, sph(0.016, 5, 3), [x + 0.03, GY + 0.077, z]);
    }
  }

  // ---------------------------------------------------------------- palms
  /** Palm fronds: each frond is two arched segments, each a V-folded pair of serrated leaf halves. */
  const frondOutline = (len: number, w0: number, w1: number, n: number): OutlinePoint[] => {
    const step = len / n;
    const pts: Array<[number, number]> = [[0, 0]];
    for (let j = 0; j < n; j++) {
      const ww = w0 + (w1 - w0) * (n === 1 ? 0 : j / (n - 1));
      pts.push([j * step, 0.012]);
      pts.push([j * step + step * 0.96, ww]);
    }
    pts.push([len, 0]);
    return pts;
  };
  const frondPaint = (a: string, bb: string) =>
    paint((p, _n, s) => {
      if (s[1] < 0.02) return C.frondL;
      return noise(p, 0.1, 4) > 0.55 ? a : bb;
    });
  const frond = (top: V, az: number, len: number, pitches: [number, number], widths: [[number, number], [number, number]], colors: [string, string]) => {
    const pos = new THREE.Vector3(...top);
    const h = new THREE.Vector3(Math.sin(az), 0, Math.cos(az));
    const t = new THREE.Vector3(Math.cos(az), 0, -Math.sin(az));
    const paintLeaf = frondPaint(colors[0], colors[1]);
    pitches.forEach((pitch, si) => {
      const a = pitch * DEG;
      const d = h.clone().multiplyScalar(Math.cos(a)).add(new THREE.Vector3(0, Math.sin(a), 0));
      const u = d.clone().cross(t).normalize();
      const r = 28 * DEG;
      const yl = t.clone().multiplyScalar(Math.cos(r)).addScaledVector(u, -Math.sin(r));
      const yr = t.clone().multiplyScalar(-Math.cos(r)).addScaledVector(u, -Math.sin(r));
      const seg = len / pitches.length;
      const outline = frondOutline(seg, widths[si][0], widths[si][1], 5);
      for (const y of [yl, yr]) b.extrude(outline, { at: pos.toArray(), x: d.toArray(), y: y.toArray(), thickness: 0.01, color: paintLeaf, bone: base, name: "frond" });
      pos.addScaledVector(d, seg);
    });
  };

  const palm = (x: number, z: number, h: number, lx: number, lz: number, seed: number, nf: number) => {
    const R = rng(seed);
    const hs = Math.max(0.55, h / 1.5);
    const pts = [
      [x, GY - 0.02, z],
      [x + lx * 0.12, GY + h * 0.3, z + lz * 0.12],
      [x + lx * 0.5, GY + h * 0.65, z + lz * 0.5],
      [x + lx, GY + h, z + lz],
    ];
    const path = catmull(pts);
    b.sweep(path, [0.115 * hs, 0.075 * hs, 0.058 * hs, 0.052 * hs, 0.05 * hs], {
      sides: 7,
      smooth: false,
      caps: "flat",
      bone: base,
      name: "trunk",
      color: paint((_p, _n, s) => {
        const v = (s[0] * h) / 0.07 + (Math.floor(s[1] / 51) % 2) * 0.5;
        const f = v - Math.floor(v);
        return f < 0.2 ? C.trunkD : f > 0.85 ? "#b98650" : C.trunk;
      }),
    });
    const top: V = [x + lx, GY + h, z + lz];
    b.part(sph(0.075 * hs, 7, 5), C.trunkD, { at: [top[0], top[1] - 0.005, top[2]], scale: [1, 0.8, 1], flat: true, bone: base, name: "crownKnob" });
    for (let i = 0; i < nf; i++) {
      const az = (i / nf) * Math.PI * 2 + R() * 0.4;
      const upright = i % 3 === 0;
      const p1 = upright ? 48 + R() * 12 : 20 + R() * 14;
      const p2 = upright ? 0 + R() * 12 : -(22 + R() * 22);
      frond([top[0], top[1] + 0.012, top[2]], az, 0.72 * hs + 0.1, [p1, p2], [[0.04 * hs + 0.012, 0.1 * hs + 0.012], [0.1 * hs + 0.012, 0.03 * hs + 0.006]], i % 2 ? [C.frond, C.frondD] : [C.frondD, C.frond]);
    }
    // two dry hanging fronds
    for (let i = 0; i < 2; i++) {
      const az = R() * Math.PI * 2;
      frond([top[0], top[1] - 0.01, top[2]], az, 0.5 * hs + 0.08, [-35, -62], [[0.035 * hs + 0.01, 0.07 * hs + 0.01], [0.07 * hs + 0.01, 0.02 * hs + 0.004]], [C.frondDry, "#8f7d34"]);
    }
    // coconuts and a bunch of dates under the crown
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + R();
      put(C.coco, sph(0.034 * hs + 0.008, 6, 4), [top[0] + Math.sin(a) * 0.075 * hs, top[1] - 0.06 * hs, top[2] + Math.cos(a) * 0.075 * hs]);
    }
    const a0 = R() * 6;
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      put(C.date, sph(0.017 * hs + 0.005, 5, 3), [top[0] + Math.sin(a0) * 0.08 * hs + Math.sin(a) * 0.022, top[1] - 0.08 * hs - 0.015 * (i % 3), top[2] + Math.cos(a0) * 0.08 * hs + Math.cos(a) * 0.022]);
    }
    return path;
  };
  const palm1 = palm(0.28, -0.42, 1.5, -0.15, 0.3, 41, 9);
  const palm2 = palm(-0.9, -0.2, 1.22, 0.2, 0.1, 42, 8);
  palm(1.08, 0.25, 0.8, -0.1, 0.1, 43, 7);
  // baby palms / shrubs
  const shrub = (x: number, z: number, s: number, seed: number) => {
    const R = rng(seed);
    for (let i = 0; i < 6; i++) {
      const az = (i / 6) * Math.PI * 2 + R();
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.9, az, 0, "YXZ"));
      put(i % 2 ? C.frond : C.frondD, cone(0.03 * s, 0.22 * s, 4), [x + Math.sin(az) * 0.05 * s, GY + 0.09 * s, z + Math.cos(az) * 0.05 * s], q, [1, 1, 0.45]);
    }
    put(C.frondL, cone(0.02 * s, 0.2 * s, 4), [x, GY + 0.1 * s, z], undefined, [1, 1, 0.45]);
  };
  shrub(-0.55, 0.62, 1.1, 51);
  shrub(0.8, -0.05, 0.9, 52);
  shrub(-1.25, 0.45, 0.8, 53);

  // ---------------------------------------------------------------- camels
  type CamelSpec = { x: number; z: number; yaw: number; k: number; kneel?: boolean; baby?: boolean; turn?: number; rug: [string, string, string]; baskets?: boolean; load?: boolean };
  const camel = (o: CamelSpec) => {
    const k = o.k;
    const L = new Loc(o.x, o.z, o.yaw, k);
    const kneel = !!o.kneel;
    const yC = kneel ? 0.21 : 0.44;
    const hs = o.baby ? 1.28 : 1;
    const turn = o.turn ?? 0;
    const P = (x: number, y: number, z: number) => L.p([x, y, z]);
    const coat = paint((p, n) => {
      if (n.y < -0.35) return C.coatL;
      const v = noise(p, 0.12, 21);
      return v > 0.6 ? "#e8b573" : v < 0.3 ? "#cf9250" : C.coat;
    });

    // body: one faceted tube with the hump grown into it
    const bodyPath = catmull([P(0, yC + 0.01, -0.38), P(0, yC, -0.15), P(0, yC, 0.1), P(0, yC + 0.02, 0.34)]);
    const TS = [0, 0.2, 0.4, 0.6, 0.8, 1];
    const RX = [0.075, 0.125, 0.15, 0.15, 0.135, 0.1];
    const RY = [0.085, 0.14, 0.16, 0.16, 0.15, 0.12];
    const bump = (t: number) => 0.14 * Math.exp(-(((t - 0.42) / 0.13) ** 2));
    const bodyR = (t: number, extra = 0): [number, number] => [(interpolate(TS, RX, t) + 0.15 * bump(t) + extra) * k, (interpolate(TS, RY, t) + 0.5 * bump(t) + extra) * k];
    const bodyShift = (t: number): [number, number] => [0, 0.5 * bump(t) * k];
    b.sweep(bodyPath, (t) => bodyR(t), { shift: bodyShift, sides: 8, smooth: false, color: coat, bone: base, name: "camelBody" });

    // saddle rug: a slightly fatter copy of the barrel with a woven diamond paint
    const t0 = 0.27;
    const t1 = 0.6;
    const z0 = L.inv(bodyPath.at(t0).clone())[2];
    const z1 = L.inv(bodyPath.at(t1).clone())[2];
    const rugPaint = paint((p, n) => {
      if (n.y < -0.4) return C.coatL;
      const q = L.inv(p);
      const z = q[2];
      if (z < z0 + 0.018 || z > z1 - 0.018) return C.gold;
      const a = Math.atan2(q[0], q[1] - yC);
      if (Math.abs(a) > 1.95) return C.indigo;
      const fu = ((((a * 0.17) / 0.06) % 1) + 1) % 1;
      const fv = ((((z / 0.06) % 1) + 1) % 1);
      const dia = Math.abs(fu - 0.5) + Math.abs(fv - 0.5);
      if (dia < 0.2) return o.rug[2];
      return dia < 0.36 ? o.rug[0] : o.rug[1];
    });
    if (!o.baby) b.sweep(bodyPath, (t) => bodyR(t, 0.016), { shift: bodyShift, from: t0, to: t1, sides: 8, smooth: false, caps: "flat", color: rugPaint, bone: base, name: "camelRug" });
    // rug tassels along the lower edge
    if (!o.baby)
      for (const s of [1, -1])
        for (let i = 0; i < 6; i++) {
          const t = t0 + 0.02 + ((t1 - t0 - 0.04) * i) / 5;
          const c = bodyPath.at(t);
          const [rx, ry] = bodyR(t, 0.016);
          const [, sy] = bodyShift(t);
          const a = (118 * DEG);
          const ox = Math.sin(a) * rx * s;
          const oy = Math.cos(a) * ry + sy;
          const d = L.d([s * 0.05, 0, 0]);
          const pt: V = [c.x + ox * L.d([1, 0, 0])[0] + 0 * d[0], c.y + oy, c.z + ox * L.d([1, 0, 0])[2]];
          b.spike(pt, [0, -1, 0], 0.05 * k, 0.012 * k, { color: i % 2 ? C.red : C.gold, bone: base, name: "tassel" });
        }

    // legs
    const legPaint = paint((p, n) => (n.y < -0.35 ? C.coatL : noise(p, 0.1, 22) > 0.62 ? "#e8b573" : C.coat));
    for (const s of [1, -1]) {
      const x = 0.115 * s;
      for (const front of [true, false]) {
        const z = front ? 0.2 : -0.25;
        let pts: V[];
        if (!kneel) {
          pts = front
            ? [P(x, yC - 0.02, z), P(x, 0.24, z + 0.01), P(x, 0.15, z + 0.005), P(x, 0.04, z + 0.015)]
            : [P(x, yC, z + 0.02), P(x, 0.25, z - 0.01), P(x, 0.14, z - 0.05), P(x, 0.04, z - 0.02)];
        } else {
          pts = front
            ? [P(x, yC, z), P(x, 0.065, z + 0.09), P(x, 0.04, z - 0.07)]
            : [P(x, yC, z + 0.03), P(x, 0.065, z + 0.15), P(x, 0.04, z - 0.1)];
        }
        const rad = pts.length === 4 ? [0.07 * k, 0.05 * k, 0.04 * k, 0.03 * k] : [0.065 * k, 0.045 * k, 0.03 * k];
        b.sweep(catmull(pts), rad, { sides: 6, smooth: false, color: legPaint, bone: base, name: "camelLeg" });
        const end = pts[pts.length - 1];
        b.part(cyl(0.042 * k, 0.048 * k, 0.03 * k, 8), C.hoof, { at: [end[0], GY + 0.015 * k, end[2]], flat: true, bone: base, name: "pad" });
        // two little toe nubs
        for (const dx of [-1, 1]) b.part(sph(0.016 * k, 5, 3), C.hoof, { at: L.p([x + dx * 0.02, 0.014, (kneel ? (front ? z - 0.07 : z - 0.1) : z + 0.015 + (front ? 0 : 0.035)) + 0.04]), flat: true, bone: base, name: "toe" });
        // knee pad
        if (front && !kneel) b.part(sph(0.038 * k, 6, 4), C.coatD, { at: P(x * 1.05, 0.15, z + 0.04), scale: [0.8, 1, 0.8], flat: true, bone: base, name: "kneePad" });
        if (kneel && front) b.part(sph(0.042 * k, 6, 4), C.coatD, { at: P(x, 0.07, z + 0.09), flat: true, bone: base, name: "kneePad" });
      }
    }
    if (kneel) b.part(sph(0.1 * k, 7, 4), C.coatD, { at: P(0, 0.1, 0.28), scale: [1, 0.5, 1.1], quat: L.quat(), flat: true, bone: base, name: "chestPad" });

    // neck (S curve) and head
    const nl = kneel ? 0.12 : 0;
    const tn = Math.sin(turn * DEG);
    const n3 = [0.09 * tn, yC + 0.38 + nl, 0.46] as const;
    const neckPts = [P(0, yC - 0.02, 0.3), P(0.01 * tn, yC + 0.1 + nl * 0.3, 0.4), P(0.04 * tn, yC + 0.26 + nl * 0.7, 0.42), P(n3[0], n3[1], n3[2])];
    const neckPath = catmull(neckPts);
    const neckR = [0.1 * k, 0.078 * k, 0.062 * k, 0.054 * k];
    b.sweep(neckPath, neckR, { sides: 7, smooth: false, color: coat, bone: base, name: "camelNeck" });
    // shaggy mane along the back of the neck
    for (let i = 0; i < 7; i++) {
      const t = 0.12 + i * 0.12;
      const c = neckPath.at(t);
      const dir = neckPath.tangentAt(t);
      const back = new THREE.Vector3(...L.d([0, 0, -1]));
      const r = interpolate([0, 0.33, 0.66, 1], neckR, t);
      const root = c.clone().addScaledVector(back, r * 0.8);
      b.spike([root.x, root.y, root.z], [back.x * 0.6 - dir.x * 0.2, 0.55, back.z * 0.6 - dir.z * 0.2], 0.07 * k, 0.02 * k, { color: i % 2 ? C.coatD : "#c98f4d", bone: base, name: "mane" });
    }
    // bell collar
    {
      const t = 0.3;
      const c = neckPath.at(t);
      const tg = neckPath.tangentAt(t).normalize();
      const ref = Math.abs(tg.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
      const u = new THREE.Vector3().crossVectors(tg, ref).normalize();
      const v = new THREE.Vector3().crossVectors(tg, u).normalize();
      const r = interpolate([0, 0.33, 0.66, 1], neckR, t) * 1.17;
      const ring: V[] = [];
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const pt = c.clone().addScaledVector(u, Math.cos(a) * r).addScaledVector(v, Math.sin(a) * r);
        ring.push([pt.x, pt.y, pt.z]);
      }
      b.sweep(catmull(ring, { closed: true }), 0.012 * k, { sides: 4, color: o.rug[0], bone: base, name: "collar" });
      // bell hangs at the front of the ring (the point whose forward component is largest)
      let bi = 0;
      let best = -9;
      ring.forEach((pt, i) => {
        const f = L.inv(new THREE.Vector3(...pt))[2] - L.inv(new THREE.Vector3(...pt))[1] * 0.2;
        if (f > best) {
          best = f;
          bi = i;
        }
      });
      const bp = ring[bi];
      b.part(sph(0.026 * k, 6, 4), C.gold, { at: [bp[0], bp[1] - 0.03 * k, bp[2]], flat: true, bone: base, name: "bell" });
      b.part(sph(0.007 * k, 4, 3), C.dark, { at: [bp[0], bp[1] - 0.052 * k, bp[2]], flat: true, bone: base, name: "bellClapper" });
    }

    // head, in a frame turned about the neck tip
    const H = new Loc(n3[0], n3[2], turn, 1, n3[1]);
    const hp = (x: number, y: number, z: number): V => L.p(H.p([x * hs, y * hs, z * hs]));
    const hd = (x: number, y: number, z: number): V => L.d(H.d([x, y, z]));
    const w = (v: number) => v * hs * k;
    const headYaw = o.yaw + turn;
    const hq = (rot: readonly number[] = [0, 0, 0]) => {
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, headYaw * DEG, 0));
      return q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG)));
    };
    b.loft(
      [
        { at: hp(0, 0.01, -0.01), w: w(0.13), h: w(0.13) },
        { at: hp(0, -0.015, 0.08), w: w(0.105), h: w(0.1) },
        { at: hp(0, -0.04, 0.17), w: w(0.085), h: w(0.085) },
      ],
      { sides: 6, smooth: false, color: coat, bone: base, name: "camelHead" },
    );
    b.loft(
      [
        { at: hp(0, -0.06, 0.05), w: w(0.07), h: w(0.04) },
        { at: hp(0, -0.082, 0.13), w: w(0.07), h: w(0.04) },
        { at: hp(0, -0.09, 0.19), w: w(0.075), h: w(0.045) },
      ],
      { sides: 6, smooth: false, color: C.coatL, bone: base, name: "camelJaw" },
    );
    b.part(sph(w(0.05), 7, 5), C.coatL, { at: hp(0, -0.045, 0.19), quat: hq(), flat: true, bone: base, name: "muzzle" });
    b.part(box(w(0.02), w(0.022), w(0.01)), C.white, { at: hp(0.012, -0.108, 0.215), quat: hq(), bone: base, name: "tooth" });
    for (const s of [1, -1]) {
      b.part(sph(w(0.012), 5, 3), C.dark, { at: hp(s * 0.026, -0.03, 0.235), scale: [1, 0.8, 1.4], quat: hq(), flat: true, bone: base, name: "nostril" });
      // eye: white, iris, pupil, brow and lashes
      b.part(sph(w(0.03), 7, 5), C.white, { at: hp(s * 0.061, 0.03, 0.045), quat: hq(), flat: true, bone: base, name: "eye" });
      b.part(sph(w(0.02), 6, 4), "#7a4a1e", { at: hp(s * 0.078, 0.03, 0.058), quat: hq(), flat: true, bone: base, name: "iris" });
      b.part(sph(w(0.011), 5, 3), C.dark, { at: hp(s * 0.089, 0.031, 0.065), quat: hq(), flat: true, bone: base, name: "pupil" });
      b.part(sph(w(0.004), 4, 3), C.white, { at: hp(s * 0.093, 0.04, 0.068), quat: hq(), bone: base, name: "glint" });
      b.part(cone(w(0.03), w(0.026), 5), C.coatD, { at: hp(s * 0.058, 0.058, 0.045), rotation: [0, 0, 0], quat: hq([0, 0, -s * 40]), scale: [1.1, 0.6, 1], flat: true, bone: base, name: "brow" });
      for (let i = 0; i < 3; i++) {
        const a = -0.5 + i * 0.5;
        b.spike(hp(s * (0.066 + 0.006 * i), 0.052 - 0.005 * Math.abs(a), 0.04 + a * 0.03), hd(s * 0.8, 0.9, a * 0.6 + 0.3), 0.034 * hs * k, 0.004 * hs * k, { color: C.dark, bone: base, name: "lash" });
      }
      // ears
      b.spike(hp(s * 0.05, 0.062, -0.02), hd(s * 0.55, 1, -0.3), 0.075 * hs * k, 0.026 * hs * k, { color: C.coatD, bone: base, name: "ear" });
      b.spike(hp(s * 0.052, 0.065, -0.012), hd(s * 0.55, 1, -0.3), 0.05 * hs * k, 0.014 * hs * k, { color: C.pink, bone: base, name: "earInner" });
    }
    // forelock tuft and bridle
    for (let i = 0; i < 4; i++) b.spike(hp((i - 1.5) * 0.016, 0.062, 0.015 + (i % 2) * 0.02), hd((i - 1.5) * 0.2, 1, 0.5), 0.05 * hs * k, 0.014 * hs * k, { color: i % 2 ? C.coatD : "#c98f4d", bone: base, name: "forelock" });
    {
      const ring: V[] = [];
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ring.push(hp(Math.cos(a) * 0.058, -0.04 + Math.sin(a) * 0.056, 0.13));
      }
      b.sweep(catmull(ring, { closed: true }), w(0.007), { sides: 4, color: o.rug[0], bone: base, name: "bridle" });
      for (const s of [1, -1]) b.rod(hp(s * 0.058, -0.04, 0.13), hp(s * 0.058, 0.04, 0.0), w(0.005), o.rug[0], { sides: 4, bone: base, name: "cheekStrap" });
      b.part(sph(w(0.014), 5, 3), C.gold, { at: hp(0.062, -0.045, 0.13), flat: true, bone: base, name: "buckle" });
      b.part(sph(w(0.016), 5, 3), o.rug[2], { at: hp(0, 0.075, 0.025), flat: true, bone: base, name: "frontlet" });
    }

    // tail with a tuft
    const tail = catmull([P(0, yC + 0.06, -0.4), P(0, yC, -0.5), P(0, yC - 0.1, -0.52), P(0, yC - 0.19, -0.5)]);
    b.sweep(tail, [0.025 * k, 0.018 * k, 0.014 * k, 0.012 * k], { sides: 5, smooth: false, color: coat, bone: base, name: "camelTail" });
    for (let i = 0; i < 3; i++) b.spike(P((i - 1) * 0.012, yC - 0.18, -0.5), L.d([(i - 1) * 0.3, -1, -0.1]), 0.07 * k, 0.02 * k, { color: C.coatD, bone: base, name: "tailTuft" });

    // hump tufts
    {
      const c = bodyPath.at(0.42);
      const top = c.y + (interpolate(TS, RY, 0.42) + bump(0.42)) * k;
      for (let i = 0; i < 4; i++) b.spike([c.x + (i - 1.5) * 0.012 * k, top - 0.01 * k, c.z + (i % 2) * 0.014 * k], [0, 1, 0.25 * (i - 1.5)], 0.045 * k, 0.014 * k, { color: i % 2 ? C.coatD : "#c98f4d", bone: base, name: "humpTuft" });
    }

    // baskets slung either side
    if (o.baskets) {
      for (const s of [1, -1]) {
        const at = P(s * 0.22, yC - 0.07, -0.07);
        b.lathe(
          [
            [0, 0],
            [0.055, 0],
            [0.075, 0.12],
            [0.065, 0.12],
            [0.05, 0.015],
            [0, 0.015],
          ],
          { at, segments: 8, color: stripes(C.wicker, C.wickerD, { size: 0.035, axis: "y", wobble: 0, width: 0.5 }), bone: base, name: "basket" },
        );
        // contents
        for (let i = 0; i < 3; i++) b.part(sph(0.03 * k, 6, 4), i === 1 ? C.orange : C.melon, { at: P(s * 0.22 + (i - 1) * 0.026, yC - 0.07 + 0.125, -0.07 + (i % 2) * 0.02 - 0.01), flat: true, bone: base, name: "fruit" });
        // rope to the rug
        b.rod(P(s * 0.2, yC + 0.04, -0.07), P(s * 0.12, yC + 0.17, -0.07), 0.006 * k, C.rope, { sides: 4, bone: base, name: "basketRope" });
      }
    }
    if (o.load) {
      // a rolled carpet and a sack lashed across the back
      b.part(cyl(0.045 * k, 0.045 * k, 0.3 * k, 8), stripes(C.red, C.cream, { size: 0.04, axis: [0, 1, 0], wobble: 0.1, width: 0.5 }), { at: P(0, yC + 0.25, 0.2), dir: L.d([1, 0, 0]), flat: true, bone: base, name: "rolledCarpet" });
      b.part(cyl(0.025 * k, 0.025 * k, 0.001, 8), C.gold, { at: P(0.151, yC + 0.25, 0.2), dir: L.d([1, 0, 0]), bone: base, name: "carpetEnd" });
      b.part(sph(0.075 * k, 7, 5), C.cream, { at: P(0, yC + 0.2, -0.12), scale: [1, 0.9, 1.1], quat: L.quat(), flat: true, bone: base, name: "sack" });
      b.part(cone(0.03 * k, 0.05 * k, 5), C.cream, { at: P(0, yC + 0.29, -0.12), flat: true, bone: base, name: "sackTie" });
      b.sweep(catmull([P(0.12, yC + 0.08, 0.2), P(0, yC + 0.3, 0.2), P(-0.12, yC + 0.08, 0.2)]), 0.006 * k, { sides: 4, color: C.rope, bone: base, name: "lash" });
    }
  };
  camel({ x: 0.9, z: 0.5, yaw: -110, k: 0.7, rug: [C.red, C.cream, C.orange], baskets: true });
  camel({ x: 0.62, z: 0.92, yaw: -125, k: 0.42, baby: true, rug: [C.teal, C.cream, C.gold] });
  camel({ x: 0.1, z: -0.85, yaw: 20, k: 0.7, kneel: true, turn: 25, rug: [C.teal, C.cream, C.red], load: true });

  // hoof prints leading from the big camel to the water
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const x = 0.68 - t * 0.45 + (i % 2 ? 0.015 : -0.015);
    const z = 0.46 - t * 0.25 + (i % 2 ? -0.025 : 0.025);
    put(C.sandD, cyl(0.022, 0.022, 0.004, 6), [x, GY + 0.002, z], undefined, [1, 1, 1.4]);
  }

  // ---------------------------------------------------------------- sultan tent (round, striped)
  const T1 = new Loc(-0.6, -0.68, 45, 0.85);
  const T1c = (a: number) => Math.round(((a % 360) + 360) % 360 / 45) % 8;
  const tent1Paint = paint((_p, n, s) => {
    const k = T1c(s[1]);
    const edge = Math.abs(s[1] / 45 - 0.5 - Math.round(s[1] / 45 - 0.5));
    if (n.y > 0.25) {
      if (edge < 0.035 && s[0] > 0.31) return C.gold;
      return k % 2 ? C.cream : C.red;
    }
    if (n.y < -0.25) return C.tealD;
    if (s[0] > 0.215 && s[0] < 0.255) return C.gold;
    if (s[0] > 0.185 && s[0] < 0.2) return k % 2 ? C.red : C.cream;
    if (s[0] < 0.035) return C.tealD;
    return k % 2 ? C.cream : C.teal;
  });
  b.lathe(
    [
      [0, 0],
      [0.36, 0],
      [0.36, 0.26],
      [0.47, 0.3],
      [0.04, 0.74],
      [0, 0.76],
    ],
    { at: [T1.x, GY, T1.z], segments: 8, spin: 22.5, color: tent1Paint, bone: base, name: "tent1" },
  );
  // scalloped valance around the eave
  for (let f = 0; f < 8; f++)
    for (let j = -1; j <= 1; j++) {
      const c = f * 45;
      const pos = T1.p([Math.sin(c * DEG) * 0.434 + Math.cos(c * DEG) * j * 0.12, 0.3, Math.cos(c * DEG) * 0.434 - Math.sin(c * DEG) * j * 0.12]);
      put((f + j + 3) % 2 ? C.gold : C.red, tri(0.115 * T1.k, 0.1 * T1.k, 0.008), pos, T1.quat([0, c, 0]));
    }
  // doorway
  const arch = (w: number, h: number): Array<[number, number]> => [
    [-w, 0],
    [w, 0],
    [w, h * 0.65],
    [w * 0.7, h * 0.88],
    [0, h],
    [-w * 0.7, h * 0.88],
    [-w, h * 0.65],
  ];
  const door1: V = T1.p([0, 0, 0.3335]);
  b.extrude(arch(0.1, 0.225), { at: [door1[0], GY, door1[2]], x: T1.d([1, 0, 0]), y: [0, 1, 0], thickness: 0.01, color: C.gold, bone: base, name: "doorTrim" });
  const doorIn = T1.p([0, 0, 0.3395]);
  b.extrude(arch(0.085, 0.205), { at: [doorIn[0], GY, doorIn[2]], x: T1.d([1, 0, 0]), y: [0, 1, 0], thickness: 0.01, color: C.dark, bone: base, name: "doorway" });
  // a glowing lantern inside the doorway
  glow(b.part(sph(0.025 * T1.k, 6, 4), C.flame, { at: T1.p([0.0, 0.12, 0.27]), flat: true, bone: base, name: "doorGlow" }), 1.4);
  // door flaps on hinge joints, tied open
  for (const s of [1, -1]) {
    const hinge: V = T1.p([s * 0.1, 0, 0.343]);
    const flap = b.joint(s > 0 ? "tentFlapL" : "tentFlapR", { parent: base, at: hinge, dir: [0, 1, 0], role: "hinge" });
    b.extrude(
      [
        [0, 0],
        [0.1, 0],
        [0.1, 0.2],
        [0.05, 0.215],
        [0, 0.205],
      ],
      {
        at: hinge,
        x: T1.d([-s, 0, 0]),
        y: [0, 1, 0],
        thickness: 0.012,
        color: paint((_p, _n, st) => (Math.floor(st[0] / 0.025) % 2 ? C.cream : C.red)),
        bone: flap,
        name: "tentFlap",
      },
    );
    b.part(sph(0.012 * T1.k, 5, 3), C.gold, { at: T1.p([s * 0.12, 0.15, 0.35]), flat: true, bone: flap, name: "flapTie" });
    b.pose(flap, { axis: [0, 1, 0], deg: s * 68 });
  }
  // rug and cushions in front of the door
  const rugGeo = () => box(0.34, 0.012, 0.22);
  obj(rugGeo(), paint((p) => {
    const q = T1.inv(p);
    const fu = ((q[0] / 0.05) % 1 + 1) % 1;
    const fv = (((q[2] - 0.53) / 0.05) % 1 + 1) % 1;
    const edge = Math.abs(q[0]) > 0.15 || Math.abs(q[2] - 0.64) > 0.095;
    if (edge) return C.gold;
    return Math.abs(fu - 0.5) + Math.abs(fv - 0.5) < 0.38 ? C.teal : C.indigo;
  }), T1, [0, 0.006, 0.64], { name: "doorRug" });
  obj(sph(0.06, 6, 4), C.red, T1, [-0.12, 0.04, 0.58], { s: [1, 0.55, 1], name: "cushion" });
  obj(sph(0.055, 6, 4), C.purple, T1, [0.1, 0.04, 0.6], { s: [1, 0.55, 1], rot: [0, 30, 0], name: "cushion" });
  obj(sph(0.012, 5, 3), C.gold, T1, [-0.12, 0.075, 0.58], { name: "cushionButton" });
  // finial pole, ball and a swallow-tail pennant on a hinge
  b.rod(T1.p([0, 0.74, 0]), T1.p([0, 0.95, 0]), 0.009, C.wood, { sides: 5, bone: base, name: "tentPole" });
  b.part(sph(0.026, 6, 4), C.gold, { at: T1.p([0, 0.965, 0]), flat: true, bone: base, name: "finial" });
  const pennant = b.joint("pennant", { parent: base, at: T1.p([0, 0.92, 0]), dir: T1.d([0, 0.2, 1]), role: "hinge" });
  b.extrude(
    [
      [0, 0.02],
      [0.2, 0.02],
      [0.15, -0.015],
      [0.2, -0.05],
      [0, -0.045],
    ],
    { at: T1.p([0, 0.92, 0]), x: T1.d([0.7, 0, 0.7]), y: [0, 1, 0], thickness: 0.008, color: C.red, bone: pennant, name: "pennant" },
  );
  b.pose(pennant, { axis: [0, 1, 0], deg: 18 });
  // guy ropes and pegs
  for (const a of [100, 150, 210, 260]) {
    const eave = T1.p([Math.sin(a * DEG) * 0.46, 0.3, Math.cos(a * DEG) * 0.46]);
    const peg = T1.p([Math.sin(a * DEG) * 0.75, 0.012, Math.cos(a * DEG) * 0.75]);
    b.rod(eave, peg, 0.004, C.rope, { sides: 4, bone: base, name: "guyRope" });
    b.spike([peg[0], peg[1] + 0.07, peg[2]], [0, -1, 0.3], 0.085, 0.011, { color: C.wood, bone: base, name: "peg" });
  }

  // ---------------------------------------------------------------- ridge tent / trader's stall
  const T2 = new Loc(0.85, -0.48, -40, 0.9);
  const stripe2 = (a: string, bb: string) => paint((p) => (Math.floor((T2.inv(p)[2] + 1) / 0.11) % 2 ? a : bb));
  const ang = Math.atan2(0.38, 0.36) / DEG;
  const plen = Math.hypot(0.38, 0.36);
  for (const s of [1, -1]) {
    obj(box(plen, 0.016, 0.84), stripe2(C.orange, C.cream), T2, [s * 0.18, 0.31, 0], { rot: [0, 0, s * ang], name: "roofPanel" });
    // lower walls
    obj(box(0.016, 0.13, 0.84), stripe2(C.cream, C.orange), T2, [s * 0.36, 0.065, 0], { name: "tentWall" });
    // valance triangles along the eave
    for (let i = 0; i < 12; i++) {
      const z = -0.38 + i * (0.76 / 11);
      put(i % 2 ? C.red : C.gold, tri(0.07 * T2.k, 0.06 * T2.k, 0.008), T2.p([s * 0.372, 0.125, z]), T2.quat([0, s * 90, 0]));
    }
    // gold ridge trims and a stitched patch
    obj(box(0.02, 0.01, 0.86), C.gold, T2, [s * 0.012, 0.5, 0], { name: "ridgeTrim" });
  }
  obj(box(0.2, 0.012, 0.15), C.teal, T2, [0.11, 0.37, -0.12], { rot: [0, 0, -ang], name: "patch" });
  obj(box(0.15, 0.012, 0.12), C.indigo, T2, [-0.2, 0.25, 0.14], { rot: [0, 0, ang], name: "patch" });
  // back gable
  b.extrude(
    [
      [-0.36, 0.12],
      [0.36, 0.12],
      [0, 0.5],
    ],
    { at: T2.p([0, 0, -0.42]), x: T2.d([1, 0, 0]), y: [0, 1, 0], thickness: 0.016, color: C.tealD, bone: base, name: "backGable" },
  );
  b.extrude(
    [
      [-0.36, 0],
      [0.36, 0],
      [0.36, 0.13],
      [-0.36, 0.13],
    ],
    { at: T2.p([0, 0, -0.42]), x: T2.d([1, 0, 0]), y: [0, 1, 0], thickness: 0.016, color: C.tealD, bone: base, name: "backWall" },
  );
  // dark interior seen through the front, and a rug inside
  b.extrude(
    [
      [-0.34, 0.01],
      [0.34, 0.01],
      [0.34, 0.12],
      [0, 0.47],
      [-0.34, 0.12],
    ],
    { at: T2.p([0, 0, -0.39]), x: T2.d([1, 0, 0]), y: [0, 1, 0], thickness: 0.006, color: "#3d2b3a", bone: base, name: "interior" },
  );
  obj(box(0.4, 0.01, 0.6), paint((p) => {
    const q = T2.inv(p);
    const fu = ((q[0] / 0.06) % 1 + 1) % 1;
    const fv = ((q[2] / 0.06) % 1 + 1) % 1;
    return Math.abs(fu - 0.5) + Math.abs(fv - 0.5) < 0.36 ? C.red : C.gold;
  }), T2, [0, 0.01, -0.05], { name: "innerRug" });
  obj(sph(0.06, 6, 4), C.pink, T2, [-0.13, 0.05, -0.2], { s: [1, 0.6, 1], name: "cushion" });
  // front tie-back curtains
  for (const s of [1, -1])
    b.extrude(
      [
        [s * 0.02, 0.49],
        [s * 0.37, 0.12],
        [s * 0.37, 0],
        [s * 0.25, 0],
        [s * 0.15, 0.22],
        [s * 0.07, 0.4],
      ],
      { at: T2.p([0, 0, 0.42]), x: T2.d([1, 0, 0]), y: [0, 1, 0], thickness: 0.014, color: paint((_p, _n, st) => (Math.floor(st[1] / 0.045) % 2 ? C.cream : C.red)), bone: base, name: "curtain" },
    );
  for (const s of [1, -1]) {
    obj(sph(0.016, 5, 3), C.gold, T2, [s * 0.16, 0.2, 0.43], { name: "curtainTie" });
    b.spike(T2.p([s * 0.16, 0.19, 0.44]), [0, -1, 0], 0.05, 0.012, { color: C.gold, bone: base, name: "curtainTassel" });
  }
  // ridge beam poking out, front posts, gold finials
  b.rod(T2.p([0, 0.5, -0.52]), T2.p([0, 0.5, 0.56]), 0.013, C.woodD, { sides: 5, bone: base, name: "ridgeBeam" });
  for (const z of [-0.52, 0.56]) b.part(sph(0.026, 6, 4), C.gold, { at: T2.p([0, 0.5, z]), flat: true, bone: base, name: "ridgeBall" });
  for (const s of [1, -1]) b.rod(T2.p([0, 0.5, 0.46]), T2.p([s * 0.4, 0, 0.46]), 0.01, C.wood, { sides: 5, bone: base, name: "frontPost" });
  // swinging lantern from the front of the ridge beam
  const lamp = b.joint("lantern", { parent: base, at: T2.p([0, 0.5, 0.56]), dir: [0, -1, 0], role: "hinge" });
  b.rod(T2.p([0, 0.5, 0.56]), T2.p([0, 0.4, 0.56]), 0.004, C.rope, { sides: 4, bone: lamp, name: "lampCord" });
  b.part(cyl(0.03, 0.022, 0.016, 6), C.gold, { at: T2.p([0, 0.4, 0.56]), flat: true, bone: lamp, name: "lampCap" });
  glow(b.part(cyl(0.026, 0.026, 0.07, 6), C.flame, { at: T2.p([0, 0.355, 0.56]), flat: true, bone: lamp, name: "lampGlass" }), 1.6);
  b.part(cyl(0.032, 0.032, 0.012, 6), C.gold, { at: T2.p([0, 0.316, 0.56]), flat: true, bone: lamp, name: "lampBase" });
  b.pose(lamp, { axis: T2.d([1, 0, 0]), deg: 8 });
  // pegs
  for (const [lx, lz] of [[-0.6, -0.45], [0.6, -0.45], [-0.6, 0.45], [0.6, 0.45]]) {
    const eave = T2.p([Math.sign(lx) * 0.372, 0.12, lz > 0 ? 0.38 : -0.38]);
    const peg = T2.p([lx, 0.012, lz]);
    b.rod(eave, peg, 0.004, C.rope, { sides: 4, bone: base, name: "guyRope" });
    b.spike([peg[0], peg[1] + 0.07, peg[2]], [0, -1, 0.3], 0.085, 0.011, { color: C.wood, bone: base, name: "peg" });
  }

  // a little bird perched on the back ridge finial
  {
    const bp = T2.p([0, 0.575, -0.52]);
    b.part(sph(0.03, 7, 5), C.indigo, { at: bp, scale: [0.9, 0.9, 1.15], quat: T2.quat(), flat: true, bone: base, name: "birdBody" });
    b.part(sph(0.02, 6, 4), C.indigo, { at: T2.p([0, 0.6, -0.48]), flat: true, bone: base, name: "birdHead" });
    b.part(cone(0.008, 0.026, 4), C.orange, { at: T2.p([0, 0.597, -0.45]), quat: T2.quat([90, 0, 0]), flat: true, bone: base, name: "birdBeak" });
    b.spike(T2.p([0, 0.575, -0.56]), T2.d([0, 0.3, -1]), 0.05, 0.012, { color: C.teal, bone: base, name: "birdTail" });
    b.part(sph(0.005, 4, 3), C.dark, { at: T2.p([0.013, 0.605, -0.466]), flat: true, bone: base, name: "birdEye" });
    b.part(sph(0.005, 4, 3), C.dark, { at: T2.p([-0.013, 0.605, -0.466]), flat: true, bone: base, name: "birdEye" });
  }

  // ---------------------------------------------------------------- campfire with a cooking pot
  const F = new Loc(-1.05, 0.5, 0, 1);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    put(i % 2 ? C.stone : C.stoneD, ico(0.04), F.p([Math.sin(a) * 0.14, 0.02, Math.cos(a) * 0.14]), new THREE.Quaternion().setFromEuler(new THREE.Euler(i, i * 2, 0)), [1.1, 0.8, 1]);
  }
  put(C.coco, cyl(0.02, 0.02, 0.2, 6), F.p([0, 0.03, 0]), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0.5, Math.PI / 2 - 0.2)));
  put(C.woodD, cyl(0.02, 0.02, 0.2, 6), F.p([0, 0.045, 0]), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 2.1, Math.PI / 2 - 0.2)));
  put(C.coco, cyl(0.02, 0.02, 0.2, 6), F.p([0, 0.03, 0]), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 3.6, Math.PI / 2 - 0.2)));
  glow(b.part(cone(0.06, 0.2, 5), C.ember, { at: F.p([0, 0.13, 0]), flat: true, bone: base, name: "flameOuter" }), 1.4);
  glow(b.part(cone(0.04, 0.16, 5), C.flame, { at: F.p([0.01, 0.12, 0.01]), flat: true, bone: base, name: "flameInner" }), 1.8);
  glow(b.part(cone(0.025, 0.1, 4), C.white, { at: F.p([0, 0.1, 0]), flat: true, bone: base, name: "flameCore" }), 1.8);
  for (let i = 0; i < 3; i++) {
    const a = i * 2.1;
    glow(b.part(cone(0.02, 0.09, 4), C.ember, { at: F.p([Math.sin(a) * 0.045, 0.09, Math.cos(a) * 0.045]), rotation: [Math.cos(a) * 20, 0, -Math.sin(a) * 20], flat: true, bone: base, name: "flameLick" }), 1.4);
  }
  // smoke puffs, rising
  [
    [0.0, 0.38, 0.0, 0.05],
    [0.03, 0.5, 0.02, 0.065],
    [0.07, 0.65, 0.05, 0.08],
  ].forEach(([x, y, z, r]) => put(C.smoke, ico(r), F.p([x, y, z]), new THREE.Quaternion().setFromEuler(new THREE.Euler(y * 5, y * 3, 0))));
  // tripod and pot
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.4;
    b.rod(F.p([Math.sin(a) * 0.19, 0, Math.cos(a) * 0.19]), F.p([0, 0.44, 0]), 0.009, C.wood, { sides: 5, bone: base, name: "tripodLeg" });
  }
  b.rod(F.p([0, 0.44, 0]), F.p([0, 0.34, 0]), 0.003, C.dark, { sides: 4, bone: base, name: "potChain" });
  b.lathe(
    [
      [0, 0],
      [0.05, 0.005],
      [0.085, 0.045],
      [0.09, 0.085],
      [0.075, 0.1],
      [0.07, 0.095],
      [0.082, 0.085],
      [0.078, 0.048],
      [0.045, 0.012],
      [0, 0.012],
    ],
    { at: F.p([0, 0.25, 0]), segments: 8, color: C.dark, bone: base, name: "pot" },
  );
  b.part(cyl(0.07, 0.07, 0.006, 8), C.orange, { at: F.p([0, 0.335, 0]), flat: true, bone: base, name: "stew" });
  // log seat with a cushion, and a mug
  b.part(cyl(0.05, 0.05, 0.26, 7), C.coco, { at: F.p([-0.24, 0.05, 0.2]), rotation: [0, 0, 90], quat: undefined, flat: true, bone: base, name: "logSeat" });
  b.part(cyl(0.032, 0.032, 0.012, 7), C.trunk, { at: F.p([-0.375, 0.05, 0.2]), rotation: [0, 0, 90], flat: true, bone: base, name: "logEnd" });
  obj(sph(0.07, 6, 4), C.purple, F, [-0.24, 0.1, 0.2], { s: [1.3, 0.4, 0.9], name: "seatCushion" });
  b.part(cyl(0.015, 0.012, 0.03, 6), C.white, { at: F.p([0.2, 0.02, -0.1]), flat: true, bone: base, name: "mug" });

  // ---------------------------------------------------------------- market goods by the ridge tent
  const M = new Loc(0.68, -0.02, -25, 1);
  const crate = (x: number, z: number, yaw: number, s: number) => {
    const L = new Loc(M.p([x, 0, z])[0], M.p([x, 0, z])[2], M.yaw + yaw, s);
    const wood = paint((p) => (Math.abs(((L.inv(p)[1] + 1) % 0.1) - 0.05) < 0.004 ? C.woodD : noise(p, 0.05, 6) > 0.55 ? "#9a6a3c" : C.wood));
    obj(box(0.15, 0.12, 0.12), wood, L, [0, 0.06, 0], { name: "crate" });
    for (const dx of [-0.07, 0.07]) obj(box(0.016, 0.125, 0.126), C.woodD, L, [dx, 0.06, 0], { name: "crateBand" });
    return L;
  };
  const cr1 = crate(0, 0, 0, 1);
  crate(-0.01, 0.0, 12, 0.8);
  obj(box(0.15, 0.12, 0.12), "#9a6a3c", cr1, [0, 0.18, 0], { s: 0.8, name: "crateTop" });
  for (let i = 0; i < 5; i++) obj(sph(0.028, 6, 4), i % 2 ? C.orange : C.melon, cr1, [(i - 2) * 0.03, 0.255 + (i % 2) * 0.012, (i % 3 - 1) * 0.02], { name: "fruit" });
  // jars
  const jar = (x: number, z: number, s: number, c: string) =>
    b.lathe(
      [
        [0, 0],
        [0.05 * s, 0],
        [0.075 * s, 0.06 * s],
        [0.07 * s, 0.12 * s],
        [0.03 * s, 0.16 * s],
        [0.035 * s, 0.185 * s],
        [0.045 * s, 0.19 * s],
        [0.03 * s, 0.195 * s],
        [0, 0.19 * s],
      ],
      {
        at: M.p([x, 0, z]),
        segments: 8,
        color: paint((p) => {
          const y = (p.y - GY) / s;
          if (y > 0.07 && y < 0.09) return C.cream;
          if (y > 0.1 && y < 0.115) return C.indigo;
          return c;
        }),
        bone: base,
        name: "jar",
      },
    );
  jar(0.2, 0.0, 1.0, C.jar);
  jar(0.3, 0.1, 0.8, C.teal);
  jar(0.16, 0.14, 0.7, C.jar);
  // basket of dates
  b.lathe(
    [
      [0, 0],
      [0.07, 0],
      [0.095, 0.075],
      [0.085, 0.075],
      [0.062, 0.012],
      [0, 0.012],
    ],
    { at: M.p([-0.22, 0, 0.12]), segments: 8, color: stripes(C.wicker, C.wickerD, { size: 0.03, axis: "y", wobble: 0, width: 0.5 }), bone: base, name: "dateBasket" },
  );
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    put(C.date, sph(0.024, 5, 3), M.p([-0.22 + Math.sin(a) * 0.045, 0.085, 0.12 + Math.cos(a) * 0.045]));
  }
  put(C.date, sph(0.026, 5, 3), M.p([-0.22, 0.095, 0.12]));
  // melons
  for (const [x, z, c] of [[-0.35, 0.02, C.melon], [-0.31, -0.06, C.grassD]] as Array<[number, number, string]>)
    b.part(sph(0.045, 8, 6), stripes(c, C.grassL, { size: 0.03, axis: "y", wobble: 0.1, width: 0.45 }), { at: M.p([x, 0.045, z]), flat: true, bone: base, name: "melon" });

  // ---------------------------------------------------------------- bunting between the sultan tent and the left palm
  const bunting = (a: V, bb: V, sag: number, n: number) => {
    const pts: V[] = [];
    for (let i = 0; i <= 6; i++) {
      const t = i / 6;
      pts.push([a[0] + (bb[0] - a[0]) * t, a[1] + (bb[1] - a[1]) * t - sag * 4 * t * (1 - t), a[2] + (bb[2] - a[2]) * t]);
    }
    const path = catmull(pts);
    b.sweep(path, 0.004, { sides: 4, color: C.rope, bone: base, name: "buntingRope" });
    const yaw = Math.atan2(bb[0] - a[0], bb[2] - a[2]) + Math.PI / 2;
    const cols = [C.red, C.gold, C.teal, C.pink, C.orange, C.indigo];
    for (let i = 0; i < n; i++) {
      const t = (i + 0.7) / (n + 0.4);
      const p = path.at(t);
      put(cols[i % cols.length], tri(0.06, 0.075, 0.006), [p.x, p.y - 0.004, p.z], new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0)));
    }
  };
  const p2 = palm2.at(0.82);
  bunting(T1.p([0, 0.92, 0]), [p2.x, p2.y, p2.z], 0.12, 8);
  const p1 = palm1.at(0.6);
  bunting(T2.p([0, 0.5, -0.52]), [p1.x, p1.y, p1.z], 0.1, 5);

  // ---------------------------------------------------------------- cactus with a flower
  {
    const cx = -1.28;
    const cz = -0.5;
    const rib = paint((_p, _n, s) => (Math.floor(s[1] / 45) % 2 ? C.cactusD : C.cactus));
    b.sweep([[cx, GY - 0.01, cz], [cx, GY + 0.32, cz]], [0.06, 0.05], { sides: 8, smooth: false, color: rib, bone: base, name: "cactus" });
    b.sweep(catmull([[cx, GY + 0.16, cz], [cx + 0.11, GY + 0.17, cz], [cx + 0.14, GY + 0.3, cz]]), 0.035, { sides: 6, smooth: false, color: rib, bone: base, name: "cactusArm" });
    b.sweep(catmull([[cx, GY + 0.1, cz], [cx - 0.1, GY + 0.12, cz + 0.01], [cx - 0.12, GY + 0.22, cz + 0.01]]), 0.03, { sides: 6, smooth: false, color: rib, bone: base, name: "cactusArm" });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      put(C.pink, cone(0.016, 0.045, 4), [cx + Math.sin(a) * 0.016, GY + 0.35, cz + Math.cos(a) * 0.016], new THREE.Quaternion().setFromEuler(new THREE.Euler(0.5, a, 0, "YXZ")));
    }
    put(C.gold, sph(0.012, 5, 3), [cx, GY + 0.35, cz]);
    for (let i = 0; i < 10; i++) {
      const a = i * 2.2;
      put(C.cream, cone(0.004, 0.025, 3), [cx + Math.sin(a) * 0.058, GY + 0.04 + i * 0.026, cz + Math.cos(a) * 0.058], new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.cos(a) * 1.4, 0, -Math.sin(a) * 1.4)));
    }
  }

  // ---------------------------------------------------------------- hanging signpost: OASIS
  {
    const sx = 0.38;
    const sz = 0.74;
    const SY = GY + 0.022;
    b.sweep([[sx, SY - 0.02, sz], [sx, SY + 0.5, sz]], [0.022, 0.018], { sides: 5, smooth: false, color: C.wood, bone: base, name: "signPost" });
    b.rod([sx, SY + 0.46, sz], [sx - 0.3, SY + 0.46, sz], 0.014, C.wood, { sides: 5, bone: base, name: "signArm" });
    b.part(sph(0.02, 6, 4), C.gold, { at: [sx, SY + 0.52, sz], flat: true, bone: base, name: "signKnob" });
    const pivot = b.joint("sign", { parent: base, at: [sx - 0.15, SY + 0.46, sz], dir: [0, -1, 0], role: "hinge" });
    for (const dx of [-0.11, 0.11]) b.rod([sx - 0.15 + dx, SY + 0.455, sz], [sx - 0.15 + dx, SY + 0.37, sz], 0.004, C.rope, { sides: 4, bone: pivot, name: "signRope" });
    b.part(box(0.32, 0.12, 0.02), C.wood, { at: [sx - 0.15, SY + 0.31, sz], flat: true, bone: pivot, name: "signBoard" });
    const tex = svg(
      `<svg viewBox="0 0 160 64" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="156" height="60" rx="6" fill="#fff0d0" stroke="#6b3a1e" stroke-width="4"/>
        <polygon points="14,50 22,40 30,50" fill="#2fc4c9"/>
        <polygon points="22,50 30,44 38,50" fill="#1b97b0"/>
        <polygon points="132,52 134,28 138,28 140,52" fill="#a3703f"/>
        <polygon points="136,30 122,24 126,32" fill="#3fae4c"/>
        <polygon points="136,30 150,24 146,32" fill="#3fae4c"/>
        <polygon points="136,30 130,18 138,20" fill="#2b8a47"/>
        <text x="78" y="43" font-size="30" font-family="Georgia, serif" font-weight="bold" text-anchor="middle" fill="#6b3a1e">OASIS</text>
      </svg>`,
      { size: 320 },
    );
    b.part(new THREE.PlaneGeometry(0.3, 0.1), C.white, { at: [sx - 0.15, SY + 0.31, sz + 0.0115], dir: [0, 0, 1], axis: "z", texture: tex, bone: pivot, name: "signFace" });
    b.part(new THREE.PlaneGeometry(0.3, 0.1), C.white, { at: [sx - 0.15, SY + 0.31, sz - 0.0115], dir: [0, 0, -1], axis: "z", texture: tex, bone: pivot, name: "signBack" });
    b.pose(pivot, { axis: [0, 0, 1], deg: 7 });
  }

  flush();
  return b.root;
}
