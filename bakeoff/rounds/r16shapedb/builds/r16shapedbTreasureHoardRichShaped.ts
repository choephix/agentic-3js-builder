import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { frame } from "../../../../src/frame";
import { aim, rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { grain, mottle, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel, INK } from "../../../../kits/toon";

export const meta = {
  name: "Hextech Treasure Hoard",
  description:
    "A League of Legends style dragon hoard: an open winged-crest chest brimming with coins, a jewelled crown on a tasselled velvet cushion, gilded goblets, gold ingots, glowing hextech crystals and gems.",
  style: "League of Legends",
};

type P = [number, number, number];
const TAU = Math.PI * 2;

const C = {
  gold: "#f4b830",
  goldHi: "#ffe27a",
  goldMid: "#e0982a",
  goldDk: "#a65a1c",
  goldDeep: "#5e2e16",
  pale: "#fff2b0",
  silver: "#d3dcf0",
  silverDk: "#7384b4",
  navy: "#222c5c",
  navyHi: "#3a4a8c",
  crim: "#b21e3e",
  crimDk: "#5c0f2c",
  crimHi: "#e2486a",
  pearl: "#fff4e8",
  ruby: "#ff3f70",
  sapphire: "#2ca8ff",
  emerald: "#2fe39c",
  amethyst: "#a65dff",
  citrine: "#ffd94c",
  hex: "#5ff3ff",
  pink: "#ff6bd6",
  woodHi: "#9a5236",
  wood: "#6a3326",
  woodDk: "#3a1a22",
};

/** A frame in model space: position + orientation, composable, for placing parts relative to a group. */
class Xf {
  readonly q: THREE.Quaternion;
  readonly pos: THREE.Vector3;
  constructor(pos: P, rot: P = [0, 0, 0], parent?: Xf) {
    const lq = new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2], "YXZ"));
    const lp = new THREE.Vector3(pos[0], pos[1], pos[2]);
    if (parent) {
      this.q = parent.q.clone().multiply(lq);
      this.pos = parent.p([lp.x, lp.y, lp.z]);
    } else {
      this.q = lq;
      this.pos = lp;
    }
  }
  static along(pos: THREE.Vector3, dir: THREE.Vector3) {
    const f = new Xf([pos.x, pos.y, pos.z]);
    (f as { q: THREE.Quaternion }).q = aim(dir);
    return f;
  }
  p(v: P) {
    return new THREE.Vector3(v[0], v[1], v[2]).applyQuaternion(this.q).add(this.pos);
  }
  d(v: P) {
    return new THREE.Vector3(v[0], v[1], v[2]).applyQuaternion(this.q);
  }
}

const eq = (x: number, y: number, z: number) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z, "YXZ"));
const lathePts = (pts: [number, number][]) => pts.map(([x, y]) => new THREE.Vector2(x, y));
const lathe = (pts: [number, number][], seg: number) => new THREE.LatheGeometry(lathePts(pts), seg);
const scaled = (pts: [number, number][], s: number) => pts.map(([x, y]) => [x * s, y * s] as [number, number]);

/** A brilliant-cut gem, unit radius: tip at y=0, table at y=0.95. */
const gemGeo = (seg = 8) =>
  lathe(
    [
      [0, 0],
      [1, 0.55],
      [0.64, 0.95],
      [0, 0.95],
    ],
    seg,
  );
/** A hex crystal: taper at the base, flat shaft, pointed tip. Unit radius, unit height. */
const crystalGeo = () =>
  lathe(
    [
      [0, 0],
      [0.82, 0.06],
      [1, 0.14],
      [1, 0.72],
      [0, 1],
    ],
    6,
  );

const archShape = (depth: number, height: number) => {
  const s = new THREE.Shape();
  s.moveTo(depth / 2, 0);
  for (let i = 1; i <= 8; i++) {
    const a = (i / 8) * Math.PI;
    s.lineTo(Math.cos(a) * (depth / 2), Math.sin(a) * height);
  }
  s.lineTo(depth / 2, 0);
  return s;
};
/** A barrel-lid arch: axis along x, flat face at y=0, hinge edge at z=0. */
const archGeo = (width: number, depth: number, height: number, centre: number) => {
  const g = new THREE.ExtrudeGeometry(archShape(depth, height), { depth: width, bevelEnabled: false });
  g.translate(0, 0, -width / 2);
  g.rotateY(-Math.PI / 2);
  g.translate(0, 0, centre);
  return g;
};

export default function build() {
  const b = createBuilder({ name: "treasureHoard", detail: 1 });
  const root = b.joint("hoardRoot", { at: [0, 0, 0] });
  const rand = rng(90417);
  const WORLD = new Xf([0, 0, 0]);

  // ------------------------------------------------------------------ paints
  const GOLD = cel(mottle(C.gold, C.goldHi, { size: 0.09, seed: 3, contrast: 0.7 }), "#c4601f");
  const GOLD_OLD = cel(mottle(C.goldMid, C.gold, { size: 0.1, seed: 8 }), "#9a4a1e");
  const SILVER = cel(mottle(C.silver, "#ffffff", { size: 0.08, seed: 5, contrast: 0.6 }), "#6f80bb");
  const NAVY = cel(mottle(C.navy, C.navyHi, { size: 0.06, seed: 2 }), "#141a3d");
  const CHEST_YAW = 0.22;
  const woodX = new THREE.Vector3(Math.cos(CHEST_YAW), 0, -Math.sin(CHEST_YAW));
  const woodGrain = grain(C.woodHi, C.wood, { size: 0.02, axis: woodX, seed: 4 });
  const PLANK = cel(
    paint((p, n) => {
      if (Math.abs(n.y) < 0.6) {
        const f = (((p.y - 0.07) / 0.1) % 1 + 1) % 1;
        if (f < 0.06) return C.woodDk;
      }
      return woodGrain;
    }),
    "#2c1020",
  );
  const ARCH_WOOD = cel(grain(C.woodHi, C.wood, { size: 0.02, axis: woodX, seed: 6 }), "#2c1020");
  const velvet = (base: string, line: string, size: number) =>
    cel(
      paint((p, n) => {
        const ax = Math.abs(n.x);
        const ay = Math.abs(n.y);
        const az = Math.abs(n.z);
        const [u, v] = ay >= ax && ay >= az ? [p.x, p.z] : ax >= az ? [p.z, p.y] : [p.x, p.y];
        const a = (((u + v) / size) % 1 + 1) % 1;
        const c = (((u - v) / size) % 1 + 1) % 1;
        const e = 0.07;
        if (a < e || a > 1 - e || c < e || c > 1 - e) return line;
        return base;
      }),
      C.crimDk,
    );
  const VELVET = velvet(C.crim, C.crimHi, 0.1);
  const MOUND = C.goldDk;

  // ---------------------------------------------------------------- textures
  const coinFace = svg(
    `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="49" fill="${C.goldDeep}"/>
      <circle cx="50" cy="50" r="45" fill="${C.gold}"/>
      <circle cx="50" cy="50" r="39" fill="none" stroke="${C.goldDk}" stroke-width="3.5" stroke-dasharray="5 4"/>
      <circle cx="50" cy="50" r="32" fill="${C.goldHi}" stroke="${C.goldDk}" stroke-width="3"/>
      <polygon points="50,21 75,35.5 75,64.5 50,79 25,64.5 25,35.5" fill="${C.goldMid}" stroke="${C.goldDeep}" stroke-width="3.5" stroke-linejoin="round"/>
      <polygon points="50,33 60,50 50,67 40,50" fill="${C.pale}" stroke="${C.goldDeep}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="50" cy="50" r="5" fill="${C.sapphire}" stroke="${C.goldDeep}" stroke-width="2"/>
      <path d="M17 38 A35 35 0 0 1 40 15" stroke="#fff8d0" stroke-width="5" fill="none" stroke-linecap="round"/>
    </svg>`,
    { size: 256 },
  );

  const wing = (mirror: boolean) => `<g transform="${mirror ? "translate(240 0) scale(-1 1)" : ""}">
      <path d="M108 70 C84 40 44 26 6 34 C22 44 30 52 32 58 C20 58 12 62 4 68 C24 72 36 76 46 84 C36 86 28 92 22 100 C52 102 82 98 108 90 Z" fill="${C.gold}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M102 74 C78 52 46 44 20 44 M100 80 C72 66 48 62 32 64 M102 86 C78 80 54 80 36 84" stroke="${C.goldDk}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M98 66 C78 46 52 36 24 36" stroke="${C.pale}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    </g>`;
  const emblem = svg(
    `<svg viewBox="0 0 240 150">
      ${wing(false)}${wing(true)}
      <path d="M94 26 H146 V78 Q146 108 120 126 Q94 108 94 78 Z" fill="${C.navy}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M101 33 H139 V77 Q139 100 120 114 Q101 100 101 77 Z" fill="none" stroke="${C.gold}" stroke-width="4"/>
      <polygon points="120,34 126,48 120,60 114,48" fill="${C.pale}"/>
      <circle cx="120" cy="82" r="17" fill="${C.goldDk}" stroke="${INK}" stroke-width="3"/>
    </svg>`,
    { size: 512 },
  );

  let glyphs = "";
  for (let i = 0; i < 20; i++) {
    const x = 20 + i * 40;
    glyphs += `<path d="M${x} 11 L${x + 10} 6 L${x + 20} 11 L${x + 20} 29 L${x + 10} 34 L${x} 29Z" fill="none" stroke="${C.goldDeep}" stroke-width="3"/>`;
    const k = i % 4;
    glyphs +=
      k === 0
        ? `<path d="M${x + 10} 12 V28 M${x + 5} 18 L${x + 10} 13 L${x + 15} 18" stroke="${C.goldDeep}" stroke-width="3" fill="none"/>`
        : k === 1
          ? `<path d="M${x + 5} 14 L${x + 15} 26 M${x + 15} 14 L${x + 5} 26" stroke="${C.goldDeep}" stroke-width="3" fill="none"/>`
          : k === 2
            ? `<circle cx="${x + 10}" cy="20" r="4.5" fill="${C.goldDeep}"/>`
            : `<path d="M${x + 5} 24 L${x + 10} 14 L${x + 15} 24Z" fill="${C.goldDeep}"/>`;
    glyphs += `<rect x="${x + 26}" y="18" width="6" height="4" fill="${C.goldDk}" transform="rotate(45 ${x + 29} 20)"/>`;
  }
  const runeBand = svg(
    `<svg viewBox="0 0 800 40">
      <rect width="800" height="40" fill="${C.goldMid}"/>
      <rect width="800" height="4" fill="${C.goldDeep}"/><rect y="36" width="800" height="4" fill="${C.goldDeep}"/>
      <rect y="4" width="800" height="3" fill="${C.pale}"/>
      ${glyphs}
    </svg>`,
    { size: 1024 },
  );

  const sparkle = svg(
    `<svg viewBox="0 0 64 64">
      <path d="M32 0 C34 22 42 30 64 32 C42 34 34 42 32 64 C30 42 22 34 0 32 C22 30 30 22 32 0Z" fill="#9ff6ff"/>
      <path d="M32 9 C33.5 24 40 30.5 55 32 C40 33.5 33.5 40 32 55 C30.5 40 24 33.5 9 32 C24 30.5 30.5 24 32 9Z" fill="#ffffff"/>
    </svg>`,
    { size: 128 },
  );

  let strands = "";
  for (let i = 0; i < 7; i++) {
    const x2 = 3 + i * 4.33;
    strands += `<path d="M16 24 Q${(16 + x2) / 2} 54 ${x2} 93" stroke="${INK}" stroke-width="8" stroke-linecap="round" fill="none"/>`;
  }
  for (let i = 0; i < 7; i++) {
    const x2 = 3 + i * 4.33;
    strands += `<path d="M16 24 Q${(16 + x2) / 2} 54 ${x2} 93" stroke="${i % 2 ? C.crimHi : C.gold}" stroke-width="5" stroke-linecap="round" fill="none"/>`;
  }
  const tassel = svg(
    `<svg viewBox="0 0 32 96">
      ${strands}
      <circle cx="16" cy="9" r="7" fill="${C.gold}" stroke="${INK}" stroke-width="2.5"/>
      <rect x="11" y="14" width="10" height="9" fill="${C.goldMid}" stroke="${INK}" stroke-width="2.2"/>
      <rect x="9" y="30" width="14" height="6" rx="2" fill="${C.gold}" stroke="${INK}" stroke-width="2.2"/>
    </svg>`,
    { size: 192 },
  );

  const hexLock = svg(
    `<svg viewBox="0 0 100 100">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8ffff"/><stop offset="0.5" stop-color="${C.hex}"/><stop offset="1" stop-color="#1b7fe0"/></linearGradient></defs>
      <polygon points="50,3 91,26.5 91,73.5 50,97 9,73.5 9,26.5" fill="${C.goldDeep}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="50,15 81,33 81,67 50,85 19,67 19,33" fill="url(#g)"/>
      <path d="M50 24 L70 36 M50 24 L30 36 M50 24 V76 M30 64 L50 76 L70 64" stroke="#ffffff" stroke-width="3.5" fill="none" stroke-linejoin="round" stroke-linecap="round" opacity="0.9"/>
      <polygon points="30,38 44,30 44,40 33,46" fill="#ffffff" opacity="0.8"/>
    </svg>`,
    { size: 192 },
  );

  // ------------------------------------------------------------------ helpers
  type PutOpts = {
    f?: Xf;
    rot?: P;
    dir?: THREE.Vector3;
    scale?: number | P;
    name?: string;
    group?: string;
    glow?: number;
    texture?: THREE.Texture;
  };
  const put = (geo: THREE.BufferGeometry, fill: Fill, at: P | THREE.Vector3, o: PutOpts = {}) => {
    const f = o.f ?? WORLD;
    const pos = at instanceof THREE.Vector3 ? at.clone() : f.p(at);
    const q = o.dir ? aim(o.dir) : f.q.clone().multiply(eq(...(o.rot ?? [0, 0, 0])));
    const part = b.part(geo, fill, {
      bone: root,
      at: pos,
      quat: q,
      scale: o.scale,
      flat: true,
      name: o.name,
      group: o.group,
      texture: o.texture,
    });
    if (o.glow) glow(part, o.glow);
    return part;
  };
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, seg = 8, open = false) =>
    new THREE.CylinderGeometry(rt, rb, h, seg, 1, open);
  const sph = (r: number, ws = 6, hs = 4) => new THREE.SphereGeometry(r, ws, hs);

  type Batch = { add: (key: string, geo: THREE.BufferGeometry, m: THREE.Matrix4) => void; flush: (name: string, g?: number) => void };
  const makeBatch = (): Batch => {
    const map = new Map<string, THREE.BufferGeometry[]>();
    return {
      add(key, geo, m) {
        const g = geo.clone();
        g.applyMatrix4(m);
        const ni = g.index ? g.toNonIndexed() : g;
        const list = map.get(key) ?? [];
        list.push(ni);
        map.set(key, list);
      },
      flush(name, strength) {
        for (const [key, list] of map) {
          const merged = mergeGeometries(list);
          if (!merged) continue;
          const part = b.part(merged, key, { bone: root, at: [0, 0, 0], flat: true, name: `${name}${key.slice(1)}` });
          if (strength) glow(part, strength);
        }
      },
    };
  };
  const mat = (at: THREE.Vector3, q: THREE.Quaternion, s: number | THREE.Vector3 = 1) =>
    new THREE.Matrix4().compose(at, q, typeof s === "number" ? new THREE.Vector3(s, s, s) : s);
  const matF = (f: Xf, at: P, rot: P = [0, 0, 0], s: number | THREE.Vector3 = 1) =>
    mat(f.p(at), f.q.clone().multiply(eq(...rot)), s);

  const coinBatch = makeBatch();
  const trimBatch = makeBatch();
  const gemBatch = makeBatch();
  const crystalBatch = makeBatch();
  const sparkles: THREE.Vector3[] = [];

  const gemAt = (pos: THREE.Vector3, size: number, color: string, q: THREE.Quaternion, seg = 8) =>
    gemBatch.add(color, gemGeo(seg), mat(pos, q, size));
  const coinGeo = cyl(0.068, 0.068, 0.013, 8);
  const stackGeo = cyl(0.07, 0.07, 0.0135, 12);
  const pearlGeo = sph(0.012, 6, 4);

  // ------------------------------------------------------- the coin mounds
  const CF = new Xf([-0.3, 0, -0.3], [0, CHEST_YAW, 0]);
  const W = 1.0;
  const D = 0.62;
  const Y0 = 0.07;
  const BH = 0.4;
  const RIM = Y0 + BH;

  type Lump = { c: THREE.Vector3; r: THREE.Vector3; q: THREE.Quaternion; ground: boolean };
  const L = (c: P, r: P, ground = true, q = new THREE.Quaternion()): Lump => ({
    c: new THREE.Vector3(...c),
    r: new THREE.Vector3(...r),
    q,
    ground,
  });
  const lumps: Lump[] = [
    { ...L([0, 0, 0], [0.43, 0.17, 0.24], false, CF.q), c: CF.p([0, 0.47, 0]) },
    { ...L([0, 0, 0], [0.2, 0.2, 0.2], false, CF.q), c: CF.p([0.33, 0.27, 0.4]) },
    L([-0.05, -0.02, 0.5], [0.62, 0.2, 0.34]),
    L([-0.65, -0.02, 0.6], [0.38, 0.15, 0.3]),
    L([0.82, -0.02, 0.12], [0.48, 0.34, 0.44]),
    L([-1.05, -0.02, -0.05], [0.42, 0.28, 0.42]),
    L([-0.95, -0.02, -0.7], [0.4, 0.3, 0.28]),
    L([0.3, -0.02, -0.72], [0.45, 0.22, 0.28]),
  ];
  const heightAt = (x: number, z: number) => {
    let h = 0;
    for (const l of lumps) {
      if (!l.ground) continue;
      const dx = (x - l.c.x) / l.r.x;
      const dz = (z - l.c.z) / l.r.z;
      const k = 1 - dx * dx - dz * dz;
      if (k > 0) h = Math.max(h, l.c.y + l.r.y * Math.sqrt(k));
    }
    return h + 0.02;
  };
  const moundParts = lumps.map((l, i) =>
    b.part(new THREE.SphereGeometry(1, 12, 8), MOUND, {
      bone: root,
      at: l.c,
      quat: l.q,
      scale: l.r,
      flat: true,
      name: `mound${i}`,
      group: "coins",
    }),
  );
  const skin = b.surface(moundParts);
  const invChest = CF.q.clone().invert();
  const inChest = (p: THREE.Vector3) => {
    const l = p.clone().sub(CF.pos).applyQuaternion(invChest);
    return Math.abs(l.x) < W / 2 + 0.04 && Math.abs(l.z) < D / 2 + 0.04 && l.y < RIM + 0.01;
  };

  const coinColors = [C.gold, C.gold, C.goldHi, C.goldMid, C.goldMid, C.goldDk, C.pale, C.gold, C.goldHi, C.silver];
  const coinHits = skin.scatter(560, {
    rng: rng(11),
    minDist: 0.07,
    filter: (h) => h.n.y > 0.1 && h.at.y > 0.03 && !inChest(h.at),
  });
  const Yaxis = new THREE.Vector3(0, 1, 0);
  for (const h of coinHits) {
    const n = h.n.clone().normalize();
    const pos = h.at.clone().addScaledVector(n, 0.004);
    const perp = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).cross(n);
    if (perp.lengthSq() < 1e-6) perp.set(1, 0, 0);
    perp.normalize();
    const q = new THREE.Quaternion()
      .setFromAxisAngle(perp, rand() * 0.9 - 0.2)
      .multiply(aim(n))
      .multiply(new THREE.Quaternion().setFromAxisAngle(Yaxis, rand() * TAU));
    const k = rand() < 0.04 ? C.silver : coinColors[Math.floor(rand() * coinColors.length)];
    coinBatch.add(k, coinGeo, mat(pos, q, 0.85 + rand() * 0.4));
  }

  // ------------------------------------------------------------- the chest
  const G = "chest";
  put(box(W, BH, D), PLANK, [0, Y0 + BH / 2, 0], { f: CF, name: "chestBody", group: G });
  put(box(W - 0.08, 0.012, D - 0.08), VELVET, [0, RIM - 0.006, 0], { f: CF, name: "chestLining", group: G });
  // base and rim trims
  put(box(W + 0.05, 0.07, D + 0.05), GOLD_OLD, [0, Y0 + 0.035, 0], { f: CF, name: "baseTrim", group: G });
  for (const sz of [1, -1]) {
    put(box(W + 0.05, 0.06, 0.05), GOLD, [0, RIM - 0.03, sz * (D / 2 + 0.0)], { f: CF, name: "rimFB", group: G });
  }
  for (const sx of [1, -1]) {
    put(box(0.05, 0.06, D), GOLD, [sx * W / 2, RIM - 0.03, 0], { f: CF, name: "rimSide", group: G });
  }
  // corner posts, caps and feet
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      put(box(0.075, BH + 0.03, 0.075), GOLD, [sx * (W / 2 + 0.005), Y0 + BH / 2 + 0.01, sz * (D / 2 + 0.005)], {
        f: CF,
        name: "post",
        group: G,
      });
      put(cyl(0.001, 0.058, 0.06, 4), GOLD, [sx * (W / 2 + 0.005), RIM + 0.055, sz * (D / 2 + 0.005)], {
        f: CF,
        rot: [0, Math.PI / 4, 0],
        name: "postCap",
        group: G,
      });
      put(cyl(0.055, 0.042, 0.07, 6), GOLD_OLD, [sx * (W / 2 - 0.04), 0.035, sz * (D / 2 - 0.04)], {
        f: CF,
        name: "foot",
        group: G,
      });
    }
  // straps with studs, front and back
  for (const sz of [1, -1])
    for (const sx of [1, -1]) {
      put(box(0.09, BH - 0.01, 0.016), NAVY, [sx * 0.28, Y0 + BH / 2, sz * (D / 2 + 0.008)], {
        f: CF,
        name: "strap",
        group: G,
      });
      for (let i = 0; i < 5; i++)
        trimBatch.add(
          C.gold,
          sph(0.014, 6, 4),
          matF(CF, [sx * 0.28, Y0 + 0.06 + i * 0.075, sz * (D / 2 + 0.017)], [0, 0, 0], new THREE.Vector3(1, 1, 0.6)),
        );
    }
  // side handles
  for (const sx of [1, -1]) {
    put(new THREE.TorusGeometry(0.045, 0.011, 5, 10), GOLD, [sx * (W / 2 + 0.03), 0.3, 0], {
      f: CF,
      rot: [0, Math.PI / 2, 0],
      name: "handle",
      group: G,
    });
    put(box(0.03, 0.05, 0.05), GOLD_OLD, [sx * (W / 2 + 0.022), 0.34, 0], { f: CF, name: "handlePlate", group: G });
  }
  // winged crest on the front
  put(new THREE.PlaneGeometry(0.5, 0.31), "#ffffff", [0, 0.27, D / 2 + 0.019], {
    f: CF,
    texture: emblem,
    name: "crest",
    group: G,
  });
  glow(
    put(new THREE.PlaneGeometry(0.075, 0.075), "#ffffff", [0, 0.27 + 0.005, D / 2 + 0.0215], {
      f: CF,
      texture: hexLock,
      name: "hexLock",
      group: G,
    }),
    1.2,
  );
  sparkles.push(CF.p([0, 0.28, D / 2 + 0.06]));
  // rune band under the rim, front
  put(new THREE.PlaneGeometry(0.76, 0.038), "#ffffff", [0, RIM - 0.072, D / 2 + 0.026], {
    f: CF,
    texture: runeBand,
    name: "runeBand",
    group: G,
  });

  // lid, swung open
  const LF = new Xf([0, RIM, -D / 2], [-1.75, 0, 0], CF);
  put(archGeo(W - 0.04, D, 0.26, D / 2), ARCH_WOOD, [0, 0, 0], { f: LF, name: "lidArch", group: G });
  for (const x of [-0.47, -0.16, 0.16, 0.47])
    put(archGeo(0.07, D + 0.04, 0.285, D / 2), GOLD, [x, -0.002, 0], { f: LF, name: "lidRib", group: G });
  put(box(W - 0.05, 0.014, D - 0.04), VELVET, [0, -0.006, D / 2], { f: LF, name: "lidLining", group: G });
  for (const z of [0.0175, D - 0.0175])
    put(box(W, 0.02, 0.035), GOLD, [0, -0.008, z], { f: LF, name: "lidBorder", group: G });
  for (const x of [-1, 1])
    put(box(0.035, 0.02, D), GOLD, [x * (W / 2 - 0.0175), -0.008, D / 2], { f: LF, name: "lidBorder", group: G });
  put(new THREE.CircleGeometry(0.15, 20), "#ffffff", [0, -0.0165, D / 2], {
    f: LF,
    rot: [Math.PI / 2, 0, 0],
    texture: coinFace,
    name: "lidMedallion",
    group: G,
  });
  for (let ix = -2; ix <= 2; ix++)
    for (let iz = 0; iz < 3; iz++) {
      if (Math.abs(ix) <= 1 && iz === 1) continue;
      trimBatch.add(C.gold, sph(0.013, 6, 4), matF(LF, [ix * 0.19, -0.019, 0.09 + iz * 0.22]));
    }
  put(box(W + 0.05, 0.05, 0.045), GOLD, [0, 0.015, D + 0.005], { f: LF, name: "lidLip", group: G });
  put(box(W + 0.05, 0.05, 0.045), GOLD, [0, 0.015, -0.005], { f: LF, name: "lidLipBack", group: G });
  for (const sx of [-1, 1]) {
    put(cyl(0.028, 0.028, 0.14, 8), GOLD_OLD, [sx * 0.3, 0.0, -0.012], {
      f: LF,
      rot: [0, 0, Math.PI / 2],
      name: "hinge",
      group: G,
    });
  }
  gemAt(LF.p([0, 0.018, D + 0.03]), 0.05, C.ruby, aim(LF.d([0, 0, 1])), 8);
  sparkles.push(LF.p([0, 0.02, D + 0.08]));

  // ------------------------------------------------------ cushion and crown
  const CuF = new Xf([0.82, 0.3, 0.12], [-0.1, 0.3, 0.12]);
  const cushionOutline: OutlinePoint[] = [
    [-0.18, -0.2],
    [0.18, -0.2],
    [0.25, -0.13],
    [0.25, 0.13],
    [0.18, 0.2],
    [-0.18, 0.2],
    [-0.25, 0.13],
    [-0.25, -0.13],
  ];
  b.extrude(cushionOutline, {
    at: CuF.p([0, 0, 0]),
    x: CuF.d([1, 0, 0]),
    y: CuF.d([0, 0, -1]),
    thickness: 0.12,
    bevel: 0.04,
    smoothing: 1,
    color: VELVET,
    bone: root,
    name: "cushion",
    group: "crown",
  });
  b.sweep(
    catmull(
      cushionOutline.map(([x, y]) => CuF.p([x * 1.03, 0, -y * 1.03])),
      { closed: true },
    ),
    0.011,
    { color: GOLD, bone: root, sides: 6, name: "cushionCord", group: "crown" },
  );
  const tasselFrames = [];
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      const corner = CuF.p([sx * 0.255, -0.01, sz * 0.205]);
      put(sph(0.024, 6, 5), GOLD, corner, { name: "tasselKnot", group: "crown" });
      tasselFrames.push(frame(corner.clone().add(new THREE.Vector3(0, -0.01, 0)), [0, 1, 0]));
    }
  b.cards(tasselFrames, tassel, { size: [0.055, 0.14], lean: 180, flow: [0, 0, 1], cross: true, bone: root, sink: 0 });

  const KF = new Xf([0, 0.062, 0], [0, 0.55, 0], CuF);
  const CG = "crown";
  put(new THREE.SphereGeometry(0.155, 10, 6, 0, TAU, 0, Math.PI / 2), VELVET, [0, 0.05, 0], {
    f: KF,
    scale: [1, 0.85, 1],
    name: "crownCap",
    group: CG,
  });
  put(
    lathe(
      [
        [0.158, 0],
        [0.182, 0],
        [0.195, 0.018],
        [0.195, 0.085],
        [0.18, 0.108],
        [0.158, 0.1],
        [0.158, 0],
      ],
      12,
    ),
    GOLD,
    [0, 0, 0],
    { f: KF, name: "crownBand", group: CG },
  );
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * TAU;
    trimBatch.add(C.pearl, pearlGeo, matF(KF, [Math.sin(a) * 0.197, 0.098, Math.cos(a) * 0.197]));
    trimBatch.add(C.pearl, pearlGeo, matF(KF, [Math.sin(a) * 0.195, 0.014, Math.cos(a) * 0.195]));
  }
  const spikeShape: [number, number][] = [
    [-0.036, 0],
    [0.036, 0],
    [0.038, 0.05],
    [0.024, 0.1],
    [0.03, 0.135],
    [0, 0.2],
    [-0.03, 0.135],
    [-0.024, 0.1],
    [-0.038, 0.05],
  ];
  const up = KF.d([0, 1, 0]);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    const tall = i % 2 === 0;
    const s = tall ? 1 : 0.62;
    const outline: OutlinePoint[] = spikeShape.map(([x, y], k) =>
      k === 5 ? ([x * s, y * s, "sharp"] as const) : ([x * s, y * s] as const),
    );
    b.extrude(outline, {
      at: KF.p([Math.sin(a) * 0.178, 0.09, Math.cos(a) * 0.178]),
      x: KF.d([Math.cos(a), 0, -Math.sin(a)]),
      y: up,
      thickness: 0.024,
      bevel: 0.005,
      color: GOLD,
      bone: root,
      name: "crownSpike",
      group: CG,
    });
    const r = Math.sin(a) * 0.178;
    const z = Math.cos(a) * 0.178;
    trimBatch.add(C.pearl, sph(tall ? 0.02 : 0.016, 6, 5), matF(KF, [r, 0.09 + 0.2 * s + 0.008, z]));
    // jewel on the band under each spike
    const radial = KF.d([Math.sin(a), 0, Math.cos(a)]);
    put(cyl(0.036, 0.036, 0.012, 8), GOLD_OLD, [Math.sin(a) * 0.192, 0.052, Math.cos(a) * 0.192], {
      f: KF,
      dir: radial,
      name: "bezel",
      group: CG,
    });
    gemAt(KF.p([Math.sin(a) * 0.198, 0.052, Math.cos(a) * 0.198]), 0.027, tall ? C.ruby : C.sapphire, aim(radial), 8);
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU;
    const R = 0.172;
    b.sweep(
      catmull([
        KF.p([Math.sin(a) * R, 0.095, Math.cos(a) * R]),
        KF.p([Math.sin(a) * R * 0.85, 0.21, Math.cos(a) * R * 0.85]),
        KF.p([Math.sin(a) * R * 0.45, 0.295, Math.cos(a) * R * 0.45]),
        KF.p([0, 0.34, 0]),
      ]),
      0.011,
      { color: GOLD, bone: root, sides: 6, name: "crownArch", group: CG },
    );
  }
  put(sph(0.034, 7, 5), GOLD, [0, 0.345, 0], { f: KF, name: "crownOrb", group: CG });
  crystalBatch.add(
    C.hex,
    crystalGeo(),
    matF(KF, [0, 0.358, 0], [0, 0, 0], new THREE.Vector3(0.028, 0.085, 0.028)),
  );
  sparkles.push(KF.p([0, 0.45, 0]));

  // ---------------------------------------------------------------- goblets
  const GOBLET: [number, number][] = [
    [0, 0],
    [0.075, 0],
    [0.082, 0.012],
    [0.062, 0.03],
    [0.024, 0.06],
    [0.017, 0.1],
    [0.034, 0.122],
    [0.017, 0.146],
    [0.022, 0.19],
    [0.052, 0.212],
    [0.085, 0.27],
    [0.101, 0.36],
    [0.092, 0.364],
    [0.08, 0.3],
    [0.04, 0.25],
    [0, 0.24],
  ];
  const goblet = (f: Xf, s: number, fill: Fill, o: { liquid?: boolean; handles?: boolean; gems?: string[] }) => {
    const axis = f.d([0, 1, 0]);
    b.lathe(scaled(GOBLET, s) as OutlinePoint[], {
      at: f.p([0, 0, 0]),
      axis,
      segments: 10,
      color: fill,
      bone: root,
      name: "goblet",
      group: "goblets",
    });
    put(cyl(0.097 * s, 0.0925 * s, 0.03 * s, 16, true), "#ffffff", [0, 0.305 * s, 0], {
      f,
      texture: runeBand,
      name: "gobletBand",
      group: "goblets",
    });
    const colors = o.gems ?? [C.ruby, C.sapphire, C.emerald];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      gemAt(f.p([Math.sin(a) * 0.04 * s, 0.122 * s, Math.cos(a) * 0.04 * s]), 0.012 * s, colors[i % colors.length], aim(f.d([Math.sin(a), 0, Math.cos(a)])), 6);
    }
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU;
      trimBatch.add(C.pearl, pearlGeo, matF(f, [Math.sin(a) * 0.082 * s, 0.014 * s, Math.cos(a) * 0.082 * s], [0, 0, 0], s));
    }
    if (o.liquid)
      put(cyl(0.077 * s, 0.077 * s, 0.006, 10), C.hex, [0, 0.318 * s, 0], { f, glow: 1.1, name: "elixir", group: "goblets" });
    if (o.handles)
      for (const sx of [1, -1]) {
        b.sweep(
          bezier(
            f.p([sx * 0.092 * s, 0.33 * s, 0]),
            f.p([sx * 0.2 * s, 0.38 * s, 0]),
            f.p([sx * 0.2 * s, 0.17 * s, 0]),
            f.p([sx * 0.045 * s, 0.2 * s, 0]),
          ),
          0.012 * s,
          { color: GOLD, bone: root, sides: 6, name: "gobletHandle", group: "goblets" },
        );
      }
  };
  const standAt = (x: number, z: number, tilt: P = [0, 0, 0]) => new Xf([x, heightAt(x, z) - 0.015, z], tilt);

  const g1 = standAt(-1.0, 0.12, [0.06, 0.4, -0.08]);
  goblet(g1, 1.05, GOLD, { gems: [C.ruby, C.emerald, C.amethyst] });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU + 0.3;
    gemAt(
      g1.p([Math.sin(a) * 0.035, 0.355 + (i % 2) * 0.02, Math.cos(a) * 0.035]),
      0.032,
      [C.ruby, C.sapphire, C.emerald, C.citrine, C.amethyst, C.ruby][i],
      eq(rand() * 1.4 - 0.7, rand() * TAU, rand() * 1.4 - 0.7),
    );
  }
  sparkles.push(g1.p([0, 0.46, 0]));

  const g2 = standAt(1.22, 0.5, [-0.03, 0.9, 0.05]);
  goblet(g2, 1.35, SILVER, { handles: true, gems: [C.sapphire, C.citrine, C.hex] });

  const g4 = standAt(-0.62, 0.68, [0.05, 0.1, 0.06]);
  goblet(g4, 0.8, GOLD, { liquid: true, gems: [C.emerald, C.ruby, C.sapphire] });
  sparkles.push(g4.p([0, 0.32, 0]));

  // the toppled goblet, coins spilling out of it
  const lyingDir = new THREE.Vector3(0.3, 0.07, 0.95).normalize();
  const g3 = Xf.along(new THREE.Vector3(0.1, 0.1, 0.92), lyingDir);
  goblet(g3, 1.0, GOLD, { gems: [C.ruby, C.citrine, C.sapphire] });
  const mouth = g3.p([0, 0.364, 0]);
  const sideV = new THREE.Vector3(lyingDir.z, 0, -lyingDir.x).normalize();
  for (let i = 0; i < 22; i++) {
    const t = i / 21;
    const along = 0.05 + t * 0.5 + rand() * 0.05;
    const lateral = (rand() - 0.5) * (0.08 + t * 0.42);
    const p = mouth.clone().addScaledVector(lyingDir, along).addScaledVector(sideV, lateral);
    p.y = 0.0075 + (i % 5 === 0 ? 0.012 : 0);
    const q = eq(i % 6 === 0 ? 0.25 : 0, rand() * TAU, i % 7 === 0 ? 0.3 : 0);
    coinBatch.add(coinColors[i % coinColors.length], coinGeo, mat(p, q, 0.95));
  }
  for (let i = 0; i < 3; i++) {
    const p = mouth.clone().addScaledVector(lyingDir, 0.015 + i * 0.01).add(new THREE.Vector3(0, 0.0, (i - 1) * 0.0));
    p.y = 0.09 + (i - 1) * 0.02;
    coinBatch.add(C.goldHi, coinGeo, mat(p, aim(lyingDir).multiply(eq(0.5 + i * 0.2, 0, 0)), 1.0));
  }

  // ----------------------------------------------------------- coin props
  const heroCoin = (pos: P, r: number, rot: P) => {
    const f = new Xf(pos, rot);
    put(cyl(r, r, 0.022, 14), C.goldMid, [0, 0, 0], { f, name: "heroCoin", group: "coins" });
    for (const s of [1, -1]) {
      put(new THREE.TorusGeometry(r - 0.006, 0.008, 4, 14), C.goldHi, [0, s * 0.011, 0], {
        f,
        rot: [Math.PI / 2, 0, 0],
        name: "heroRim",
        group: "coins",
      });
      put(new THREE.CircleGeometry(r * 0.92, 20), "#ffffff", [0, s * 0.0125, 0], {
        f,
        rot: [(-s * Math.PI) / 2, 0, 0],
        texture: coinFace,
        name: "heroFace",
        group: "coins",
      });
    }
  };
  heroCoin([-0.45, 0.125, 1.04], 0.125, [Math.PI / 2 - 0.3, -0.3, 0]);
  heroCoin([0.55, 0.11, 1.22], 0.11, [Math.PI / 2 - 0.35, 0.5, 0]);
  heroCoin([-0.85, 0.1, 0.98], 0.1, [Math.PI / 2 - 0.25, -0.6, 0]);
  for (const [x, z, r, rot] of [
    [-0.45, 0.58, 0.1, [0.15, 0.4, 0.05]],
    [-1.1, -0.2, 0.09, [-0.2, 1.0, 0.2]],
    [0.3, -0.62, 0.1, [0.2, 0.2, -0.1]],
    [0.72, -0.2, 0.09, [-0.1, 0.8, 0.1]],
  ] as [number, number, number, P][])
    heroCoin([x, heightAt(x, z) + 0.01, z], r, rot);

  const stack = (x: number, z: number, count: number, yaw: number) => {
    const base = heightAt(x, z) - 0.012;
    const colors = [C.gold, C.goldMid, C.goldHi];
    for (let i = 0; i < count; i++) {
      const p = new THREE.Vector3(x + (rand() - 0.5) * 0.008, base + 0.007 + i * 0.0145, z + (rand() - 0.5) * 0.008);
      coinBatch.add(colors[i % 3], stackGeo, mat(p, eq(0, yaw + rand() * 1.2, 0)));
    }
    const top = new THREE.Vector3(x, base + 0.0145 * count + 0.0003, z);
    put(new THREE.CircleGeometry(0.064, 16), "#ffffff", top, {
      rot: [-Math.PI / 2, yaw, 0],
      texture: coinFace,
      name: "stackFace",
      group: "coins",
    });
  };
  stack(0.72, 1.0, 9, 0.2);
  stack(0.92, 0.88, 6, 0.9);
  stack(0.86, 1.14, 3, 0.4);
  stack(-0.98, 0.78, 7, 0.1);
  stack(-0.82, 0.96, 4, 0.7);

  // ---------------------------------------------------------------- ingots
  const IF = new Xf([1.12, 0, -0.62], [0, 0.5, 0]);
  const ingot = cyl(0.06, 0.075, 0.055, 4);
  ingot.rotateY(Math.PI / 4);
  for (const [x, y, z, yaw] of [
    [0, 0.0265, -0.115, 0.03],
    [0, 0.0265, 0, -0.04],
    [0, 0.0265, 0.115, 0.06],
    [0, 0.0815, -0.0575, 0.05],
    [0, 0.0815, 0.0575, -0.03],
    [0, 0.1365, 0, 0.02],
  ] as [number, number, number, number][]) {
    put(ingot, GOLD, [x, y, z], { f: IF, rot: [0, yaw, 0], scale: [2.1, 1, 1], name: "ingot", group: "ingots" });
  }
  put(new THREE.PlaneGeometry(0.1, 0.1), "#ffffff", [0, 0.1648, 0], {
    f: IF,
    rot: [-Math.PI / 2, 0, 0],
    texture: coinFace,
    scale: 0.8,
    name: "ingotStamp",
    group: "ingots",
  });
  put(ingot, GOLD_OLD, [0.0, 0.041, 0.3], { f: IF, rot: [0.0, 0.7, -0.5], scale: [2.1, 1, 1], name: "ingotLoose", group: "ingots" });

  // ---------------------------------------------------------- hextech cluster
  const cx = -0.92;
  const cz = -0.7;
  const CCF = new Xf([cx, heightAt(cx, cz) - 0.02, cz]);
  const shards: [number, number, string, P, P][] = [
    [0.07, 0.46, C.hex, [0, 0, 0], [0.15, 0, -0.1]],
    [0.055, 0.34, C.pink, [0.1, 0, 0.05], [-0.3, 0, 0.35]],
    [0.05, 0.3, C.hex, [-0.09, 0, 0.07], [0.4, 0, 0.2]],
    [0.04, 0.22, C.hex, [0.05, 0, -0.1], [-0.2, 0, -0.5]],
    [0.035, 0.17, C.pink, [-0.04, 0, -0.04], [0.6, 0, -0.2]],
  ];
  for (const [r, h, col, off, rot] of shards) {
    crystalBatch.add(col, crystalGeo(), matF(CCF, off, rot, new THREE.Vector3(r, h, r)));
    const top = new THREE.Vector3(0, h * 0.95, 0).applyQuaternion(CCF.q.clone().multiply(eq(...rot))).add(CCF.p(off));
    if (h > 0.25) sparkles.push(top.clone().add(new THREE.Vector3(0, 0.05, 0)));
  }
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU + 0.4;
    const base = CCF.p([Math.sin(a) * 0.12, 0.02, Math.cos(a) * 0.12]);
    put(cyl(0.001, 0.028, 0.2, 5), GOLD, base, {
      dir: new THREE.Vector3(Math.sin(a) * 0.35, 1, Math.cos(a) * 0.35),
      name: "claw",
      group: "crystal",
    });
  }
  put(new THREE.TorusGeometry(0.12, 0.022, 5, 12), GOLD_OLD, [0, 0.06, 0], {
    f: CCF,
    rot: [Math.PI / 2, 0, 0],
    name: "crystalRing",
    group: "crystal",
  });

  // ------------------------------------------------------------------ gems
  const heroGems: [number, number, number, string][] = [
    [0.2, 0.6, 0.085, C.ruby],
    [-0.28, 0.34, 0.075, C.sapphire],
    [-0.9, 0.42, 0.07, C.emerald],
    [0.62, 0.5, 0.07, C.amethyst],
    [-1.2, 0.3, 0.065, C.citrine],
    [0.98, 0.34, 0.07, C.hex],
    [0.1, 0.9, 0.06, C.pink],
  ];
  for (const [x, z, s, col] of heroGems) {
    const p = new THREE.Vector3(x, heightAt(x, z) + s * 0.25, z);
    gemAt(p, s, col, eq(rand() * 0.5 - 0.25, rand() * TAU, rand() * 0.5 - 0.25));
    if (s > 0.065) sparkles.push(p.clone().add(new THREE.Vector3(0, s * 0.9, 0)));
  }
  for (const [lx, ly, lz, s, col] of [
    [-0.2, 0.64, 0.0, 0.075, C.sapphire],
    [0.15, 0.645, 0.03, 0.09, C.ruby],
    [0.05, 0.6, -0.1, 0.065, C.emerald],
    [-0.35, 0.58, 0.08, 0.05, C.citrine],
  ] as [number, number, number, number, string][]) {
    const p = CF.p([lx, ly, lz]);
    gemAt(p, s, col, eq(rand() * 0.6 - 0.3, rand() * TAU, rand() * 0.6 - 0.3));
    if (s > 0.07) sparkles.push(p.clone().add(new THREE.Vector3(0, s, 0)));
  }
  const gemColors = [C.ruby, C.sapphire, C.emerald, C.amethyst, C.citrine, C.hex, C.pink];
  const gemHits = skin.scatter(34, {
    rng: rng(21),
    minDist: 0.2,
    filter: (h) => h.n.y > 0.3 && h.at.y > 0.08 && !inChest(h.at),
  });
  gemHits.forEach((h, i) => {
    const n = h.n.clone().normalize();
    const q = new THREE.Quaternion()
      .setFromAxisAngle(new THREE.Vector3(1, 0, 0), rand() * 0.8 - 0.4)
      .multiply(aim(n))
      .multiply(new THREE.Quaternion().setFromAxisAngle(Yaxis, rand() * TAU));
    gemAt(h.at.clone().addScaledVector(n, 0.012), 0.026 + rand() * 0.016, gemColors[i % gemColors.length], q, 6);
  });

  // pearl necklace with a ruby pendant draped over the front-left coins
  const nk = catmull(
    (
      [
        [-0.78, 0.46],
        [-0.64, 0.64],
        [-0.46, 0.74],
        [-0.28, 0.72],
        [-0.14, 0.62],
        [-0.08, 0.48],
      ] as [number, number][]
    ).map(([x, z]) => new THREE.Vector3(x, heightAt(x, z) + 0.012, z)),
  );
  for (let i = 0; i <= 28; i++)
    trimBatch.add(C.pearl, sph(0.017, 6, 4), mat(nk.at(i / 28), new THREE.Quaternion()));
  const pend = nk.at(0.5);
  put(cyl(0.001, 0.034, 0.055, 6), GOLD, pend.clone().add(new THREE.Vector3(0, 0.02, 0)), {
    dir: new THREE.Vector3(0, 1, 0.1),
    name: "pendantSetting",
    group: "gems",
  });
  gemAt(pend.clone().add(new THREE.Vector3(0, 0.035, 0)), 0.04, C.ruby, eq(0.2, 0.5, 0));

  // --------------------------------------------------------------- finishing
  coinBatch.flush("coins");
  trimBatch.flush("studs");
  gemBatch.flush("gems", 0.45);
  crystalBatch.flush("hextech", 1.4);

  // glints on the brightest jewels
  const glintFrames = sparkles.map((p) => frame(p.clone().add(new THREE.Vector3(0, -0.05, 0)), [0, 1, 0]));
  glow(
    b.cards(glintFrames, sparkle, {
      size: [0.13, 0.13],
      cross: true,
      vary: 0.35,
      spin: 20,
      rng: rng(5),
      color: "#ffffff",
      bone: root,
      sink: 0,
    }),
    1.3,
  );

  return b.root;
}
