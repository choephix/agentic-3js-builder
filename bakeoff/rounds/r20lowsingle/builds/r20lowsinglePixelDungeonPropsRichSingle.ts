import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { Builder, OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import type { Joint } from "../../../../src/skeleton";
import { glow } from "../../../../kits/glow";
import { bayer, cellPaint, pick, pixelArt, pixelTexture, tileBox } from "../../../../kits/pixel";

export const meta = {
  name: "Dungeon Props",
  description:
    "Pixel-art dungeon prop group on a flagstone floor: iron-bound treasure chest with coins, two wall torches on a mossy brick wall, hanging shackles, barrels (one open with toxic goo), a spike trap with pressure plate and a fallen skeleton with scattered bones.",
  style: "pixel art",
  commit: "88fc1f0",
};

type V = [number, number, number];
const TEXEL = 0.02;
const F = 0.06; // floor top

const STONE = ["#1d1e26", "#2f313c", "#454856", "#5d6070", "#7a7d8c", "#9a9dac"];
const FLOOR = ["#16161d", "#232530", "#343746", "#464a5c", "#5a5e72"];
const WOODR = ["#2a170d", "#3f2412", "#5a3519", "#7a4a22", "#9a6430"];
const IRON = ["#1c1f27", "#2d323d", "#454c5b", "#6a7285", "#939cb0"];
const GOLD = "#f2c83c";
const GOLD2 = "#b8862a";
const BONE = "#e8e0c8";
const BONE2 = "#c9bf9f";
const BONE3 = "#8d826a";
const DARK = "#0d0b10";
const BLOOD = "#8c1c1c";

const vv = (a: V) => new THREE.Vector3(a[0], a[1], a[2]);

class Bag {
  private m = new Map<string, THREE.BufferGeometry[]>();

  addQ(color: string, geo: THREE.BufferGeometry, at: THREE.Vector3, q: THREE.Quaternion, scale: V = [1, 1, 1]) {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    g.applyMatrix4(new THREE.Matrix4().compose(at, q, vv(scale)));
    const list = this.m.get(color) ?? [];
    list.push(g);
    this.m.set(color, list);
  }

  add(color: string, geo: THREE.BufferGeometry, at: V, rot: V = [0, 0, 0], scale: V = [1, 1, 1]) {
    this.addQ(color, geo, vv(at), new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2])), scale);
  }

  box(color: string, size: V, at: V, rot: V = [0, 0, 0]) {
    this.add(color, new THREE.BoxGeometry(size[0], size[1], size[2]), at, rot);
  }

  rod(color: string, a: V, b: V, r: number, seg = 5, knob = false) {
    const A = vv(a);
    const B = vv(b);
    const d = B.clone().sub(A);
    const len = d.length();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    this.addQ(color, new THREE.CylinderGeometry(r, r, len, seg, 1), A.clone().add(B).multiplyScalar(0.5), q);
    if (knob)
      for (const p of [A, B]) this.add(color, new THREE.SphereGeometry(r * 1.5, 5, 4), [p.x, p.y, p.z]);
  }

  torus(color: string, radius: number, tube: number, at: V, axis: V, scale: V = [1, 1, 1], arc = Math.PI * 2) {
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), vv(axis).normalize());
    this.addQ(color, new THREE.TorusGeometry(radius, tube, 4, 8, arc), vv(at), q, scale);
  }

  flush(b: Builder, bone: Joint) {
    for (const [color, list] of this.m) {
      const merged = mergeGeometries(list, false);
      if (merged) b.part(merged, color, { bone, at: [0, 0, 0], flat: true });
    }
    this.m.clear();
  }
}

function stoneTile(seed: number, ramp: readonly string[], w = 40, h = 32) {
  const r = rng(seed);
  return pixelTexture(w, h, (g) => {
    g.fill((x, y, gw, gh) => {
      let v = 0.42 + 0.3 * r() + 0.12 * Math.sin(x * 0.4 + y * 0.9);
      if (y < 2) v += 0.25;
      if (x < 1) v += 0.15;
      if (y > gh - 3) v -= 0.25;
      if (x > gw - 2) v -= 0.18;
      return pick(ramp, v, bayer(x, y));
    });
    for (let c = 0; c < 3; c++) {
      let x = Math.floor(r() * w);
      let y = Math.floor(r() * 10);
      const n = 8 + Math.floor(r() * 10);
      for (let k = 0; k < n; k++) {
        g.set(x, y, ramp[0]);
        x += Math.floor(r() * 3) - 1;
        y += 1;
      }
    }
    for (let k = 0; k < 16; k++) g.set(Math.floor(r() * w), Math.floor(r() * h), ramp[ramp.length - 1]);
  });
}

function planksTile(seed: number, ramp: readonly string[], rowH = 6, w = 40, h = 30) {
  const r = rng(seed);
  return pixelTexture(w, h, (g) => {
    g.fill((x, y) => {
      const row = Math.floor(y / rowH);
      const ry = y % rowH;
      if (ry === 0) return ramp[0];
      if (ry === 1) return ramp[ramp.length - 2];
      if (ry >= 2 && x === (row * 13 + 7) % w) return ramp[0];
      const streak = 0.5 + 0.18 * Math.sin((x + row * 9) * 0.55) + 0.2 * (r() - 0.5);
      return pick(ramp, streak - (ry >= rowH - 1 ? 0.15 : 0), bayer(x, y));
    });
    for (let row = 0; row < h / rowH; row++) {
      g.set(2, row * rowH + 3, "#a9b0c0");
      g.set(w - 3, row * rowH + 3, "#a9b0c0");
    }
  });
}

const FLAME = pixelArt(
  [
    "....y...",
    "...yy...",
    "...yy.y.",
    "..yyyyy.",
    "..yoooy.",
    ".yyooooy",
    ".yoowooy",
    ".yoowwoy",
    ".yorwwor",
    ".orrwwro",
    ".orrrrro",
    "..orrro.",
  ],
  { y: "#ffe27a", o: "#ff9a1f", r: "#e2441a", w: "#fff6c9" },
);

const KEYHOLE = pixelArt(
  ["GGGGGG", "GggggG", "GgkkgG", "GgkkgG", "GggkgG", "GggkgG", "GggggG", "gggggg"],
  { G: GOLD, g: GOLD2, k: "#150f0a" },
);

const PLATE = pixelTexture(12, 12, (g) => {
  g.fill((x, y, w, h) => {
    if (x === 0 || y === 0) return "#8c909b";
    if (x === w - 1 || y === h - 1) return "#3c3f49";
    return pick(["#4a4d57", "#5a5e6b", "#6b6f7a"], 0.4 + 0.3 * ((x * 7 + y * 3) % 5) / 5, bayer(x, y));
  });
  g.stamp(3, 2, [".wwww.", "wwwwww", "wkwwkw", "wkwwkw", ".wwww.", ".wkkw.", ".w..w."], { w: "#e6e0cc", k: "#14121a" });
  g.set(1, 1, BLOOD);
  g.set(10, 10, BLOOD);
});

const SOOT = pixelTexture(10, 14, (g) => {
  const r = rng(77);
  g.fill((x, y) => {
    const dx = (x - 4.5) / (2.5 + (14 - y) * 0.2);
    const dy = (y - 8) / 6.5;
    if (dx * dx + dy * dy + 0.4 * (r() - 0.5) < 0.9) return r() < 0.5 ? "#1d1c22" : "#2b2a31";
    return "";
  });
});

function web(mirror: boolean) {
  return pixelTexture(14, 14, (g) => {
    const put = (x: number, y: number) => g.set(mirror ? 13 - x : x, y, "#d4d8e2");
    for (let a = 0; a <= 4; a++) {
      const th = ((a / 4) * Math.PI) / 2;
      for (let t = 0; t < 14; t += 0.5) put(Math.round(t * Math.cos(th)), Math.round(t * Math.sin(th)));
    }
    for (const rr of [4, 7, 10, 13])
      for (let a = 0; a <= 24; a++) {
        const th = ((a / 24) * Math.PI) / 2;
        put(Math.round(rr * Math.cos(th)), Math.round(rr * Math.sin(th)));
      }
  });
}

export default function build() {
  const b = createBuilder({ name: "pixelDungeonProps" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const bag = new Bag();
  const lidBag = new Bag();
  const rf = rng(11);

  // ---------- paints ----------
  const barrelPaint = cellPaint(
    TEXEL * 0.8,
    (c) => {
      const deg = c.s[1];
      const k = Math.floor(deg / 36);
      const f = (deg % 36) / 36;
      if (f < 0.07) return WOODR[0];
      const shade = 0.3 + 0.4 * ((k * 0.618) % 1) + 0.12 * (c.random(3) - 0.5);
      return c.pick(WOODR, shade);
    },
    { dither: true },
  );
  const ironPaint = cellPaint(
    TEXEL * 0.75,
    (c) => (c.random(5) < 0.08 ? "#7a3f1f" : c.pick(IRON, 0.5 + 0.35 * (c.random(1) - 0.5) + 0.25 * c.n.y)),
    { dither: true },
  );
  const lidPlank = cellPaint(
    TEXEL * 0.8,
    (c) => {
      const q = c.at.x / 0.075;
      const f = q - Math.floor(q);
      if (f < 0.1) return WOODR[0];
      return c.pick(WOODR, 0.3 + 0.4 * ((Math.floor(q) * 0.37) % 1) + 0.1 * (c.random(2) - 0.5));
    },
    { dither: true },
  );

  // ---------- floor ----------
  const floorTiles = [stoneTile(1, FLOOR), stoneTile(2, FLOOR), stoneTile(3, FLOOR)];
  b.part(new THREE.BoxGeometry(2.6, 0.04, 2.0), "#15121a", { bone: root, at: [0, 0.02, 0] });
  const cw = 2.6 / 6;
  const cd = 2.0 / 5;
  for (let i = 0; i < 6; i++)
    for (let j = 0; j < 5; j++) {
      const hh = 0.052 + 0.014 * rf();
      const tile = floorTiles[(i + j * 2) % 3];
      b.part(tileBox([cw - 0.014, hh, cd - 0.014], tile, TEXEL, { rand: rf, step: 1 }), "#ffffff", {
        texture: tile,
        bone: root,
        at: [-1.3 + cw * (i + 0.5), hh / 2, -1.0 + cd * (j + 0.5)],
      });
    }

  // ---------- back wall ----------
  const stoneTiles = [stoneTile(5, STONE), stoneTile(6, STONE), stoneTile(7, STONE)];
  const rw = rng(23);
  b.part(new THREE.BoxGeometry(2.6, 1.4, 0.18), "#0e0d13", { bone: root, at: [0, F + 0.7, -0.91] });
  for (let k = 0; k < 7; k++) {
    let x = -1.3;
    let first = true;
    while (x < 1.29) {
      let len = first && k % 2 ? 0.22 : 0.34 + 0.22 * rw();
      if (1.3 - (x + len) < 0.2) len = 1.3 - x;
      first = false;
      const broken = k === 6 && rw() < 0.4;
      const hh = broken ? 0.1 + 0.07 * rw() : 0.19;
      const skip = k === 6 && rw() < 0.12;
      const tile = stoneTiles[Math.floor(rw() * 3)];
      if (!skip)
        b.part(tileBox([len - 0.012, hh, 0.22], tile, TEXEL, { rand: rw, step: 1 }), "#ffffff", {
          texture: tile,
          bone: root,
          at: [x + len / 2, F + 0.2 * k + hh / 2 + 0.003, -0.89],
        });
      x += len;
    }
  }
  // rubble and moss
  for (let i = 0; i < 12; i++) {
    const s = 0.04 + 0.05 * rw();
    bag.box(STONE[2 + (i % 3)], [s, s * 0.7, s], [-1.2 + 2.4 * rw(), F + s * 0.3, -0.7 - 0.06 * rw()], [rw(), rw() * 3, rw()]);
  }
  for (let i = 0; i < 16; i++) {
    const x = -1.25 + 2.5 * rw();
    const w = 0.06 + 0.08 * rw();
    bag.box(i % 2 ? "#4d7a2a" : "#6a9a35", [w, 0.012, w * 0.8], [x, F + 0.006, -0.74 + 0.1 * rw()]);
    if (i % 2) bag.box("#4d7a2a", [w, 0.04 + 0.05 * rw(), 0.012], [x, F + 0.03, -0.776]);
  }

  // soot, cobwebs
  for (const tx of [-0.55, 0.85])
    b.part(new THREE.PlaneGeometry(0.22, 0.3), "#ffffff", {
      texture: SOOT,
      bone: root,
      at: [tx, F + 1.22, -0.775],
      dir: [0, 0, 1],
      axis: "z",
    });
  b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", {
    texture: web(false),
    bone: root,
    at: [-1.15, F + 1.22, -0.774],
    dir: [0, 0, 1],
    axis: "z",
  });
  b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", {
    texture: web(true),
    bone: root,
    at: [1.15, F + 1.22, -0.774],
    dir: [0, 0, 1],
    axis: "z",
  });

  // ---------- torches ----------
  const sr = rng(41);
  function torch(tx: number) {
    const P0: V = [tx, F + 0.78, -0.72];
    const P1: V = [tx, F + 1.06, -0.62];
    const P2: V = [tx, F + 1.17, -0.585];
    const dir: V = [0, 0.28, 0.1];
    bag.box(IRON[2], [0.1, 0.18, 0.02], [tx, F + 0.84, -0.768]);
    bag.box(IRON[4], [0.07, 0.02, 0.012], [tx, F + 0.9, -0.756]);
    bag.box(IRON[4], [0.07, 0.02, 0.012], [tx, F + 0.78, -0.756]);
    bag.rod(IRON[2], [tx, F + 0.84, -0.768], [tx, F + 0.892, -0.676], 0.012);
    bag.torus(IRON[3], 0.034, 0.008, [tx, F + 0.892, -0.676], dir);
    bag.rod("#6b4423", P0, P1, 0.022, 6);
    bag.rod("#2a1a14", P1, P2, 0.04, 6);
    bag.rod("#b08a4a", [tx, F + 1.09, -0.607], [tx, F + 1.115, -0.598], 0.043, 6);
    bag.torus(IRON[3], 0.042, 0.008, P1, dir);
    const meshes = b.cards([frame([tx, F + 1.19, -0.575], [0, 1, 0])], FLAME, {
      size: [0.22, 0.3],
      cross: true,
      flow: [0, 0, 1],
      sink: 0.02,
      bone: root,
    });
    glow(meshes, 1.3);
    for (let i = 0; i < 4; i++)
      glow(
        b.part(new THREE.BoxGeometry(0.012, 0.012, 0.012), i % 2 ? "#ffd24a" : "#ff8a2a", {
          bone: root,
          at: [tx + (sr() - 0.5) * 0.16, F + 1.46 + 0.07 * i, -0.575 + (sr() - 0.5) * 0.06],
        }),
        1.2,
      );
  }
  torch(-0.55);
  torch(0.85);

  // hanging chains and shackles
  bag.box(IRON[2], [0.3, 0.05, 0.02], [0.15, F + 1.27, -0.768]);
  for (const dx of [-0.08, 0.08]) {
    bag.box(IRON[3], [0.04, 0.04, 0.025], [0.15 + dx, F + 1.25, -0.762]);
    for (let i = 0; i < 7; i++)
      bag.add(IRON[3], new THREE.TorusGeometry(0.014, 0.0045, 4, 6), [0.15 + dx, F + 1.22 - 0.03 * i, -0.755], [0, i % 2 ? Math.PI / 2 : 0, 0], [1, 1.4, 1]);
    bag.torus(IRON[2], 0.045, 0.01, [0.15 + dx, F + 0.96, -0.74], [0, 0, 1]);
    bag.box(IRON[2], [0.03, 0.03, 0.03], [0.15 + dx, F + 1.0, -0.745]);
  }

  // ---------- chest ----------
  const CX = -0.72;
  const CZ = -0.38;
  const CY = F + 0.32;
  const lid = b.joint("lid", { parent: root, at: [CX, CY, CZ - 0.21], role: "hinge" });
  const woodT = planksTile(5, WOODR);
  const rc = rng(31);
  b.part(tileBox([0.7, 0.28, 0.42], woodT, TEXEL, { rand: rc, step: [1, 6] }), "#ffffff", {
    texture: woodT,
    bone: root,
    at: [CX, F + 0.18, CZ],
  });
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      bag.box(IRON[2], [0.06, 0.29, 0.06], [CX + sx * 0.33, F + 0.18, CZ + sz * 0.19]);
      bag.box(WOODR[1], [0.07, 0.05, 0.07], [CX + sx * 0.3, F + 0.025, CZ + sz * 0.17]);
    }
  for (const dx of [-0.2, 0.2]) {
    bag.box(IRON[2], [0.07, 0.29, 0.44], [CX + dx, F + 0.18, CZ]);
    for (const y of [F + 0.08, F + 0.18, F + 0.28])
      bag.add(IRON[4], new THREE.SphereGeometry(0.009, 4, 3), [CX + dx, y, CZ + 0.224]);
  }
  bag.box(IRON[1], [0.72, 0.02, 0.44], [CX, F + 0.045, CZ]);
  bag.box(GOLD2, [0.085, 0.09, 0.032], [CX, F + 0.27, CZ + 0.225]);
  b.part(new THREE.PlaneGeometry(0.07, 0.093), "#ffffff", {
    texture: KEYHOLE,
    bone: root,
    at: [CX, F + 0.27, CZ + 0.2415],
    dir: [0, 0, 1],
    axis: "z",
  });
  // lid
  const lidGeo = new THREE.CylinderGeometry(0.21, 0.21, 0.72, 8, 1, false, 0, Math.PI);
  lidGeo.rotateZ(Math.PI / 2);
  b.part(lidGeo, lidPlank, { bone: lid, at: [CX, CY, CZ] });
  for (const dx of [-0.2, 0.2]) {
    const band = new THREE.CylinderGeometry(0.222, 0.222, 0.07, 8, 1, false, 0, Math.PI);
    band.rotateZ(Math.PI / 2);
    lidBag.add(IRON[2], band, [CX + dx, CY, CZ]);
    for (const phi of [0.25, 0.7, 1.15, 1.58, 2.0, 2.45, 2.9])
      lidBag.add(IRON[4], new THREE.SphereGeometry(0.009, 4, 3), [CX + dx, CY + 0.224 * Math.sin(phi), CZ + 0.224 * Math.cos(phi)]);
  }
  for (const sz of [-1, 1]) lidBag.box(IRON[1], [0.73, 0.025, 0.02], [CX, CY + 0.012, CZ + sz * 0.21]);
  lidBag.box(IRON[3], [0.06, 0.1, 0.02], [CX, CY - 0.02, CZ + 0.222]);
  lidBag.box(GOLD, [0.03, 0.03, 0.01], [CX, CY + 0.215, CZ + 0.02]);
  // coins, gems, key
  for (let i = 0; i < 12; i++)
    bag.add(i % 3 ? GOLD : GOLD2, new THREE.CylinderGeometry(0.022, 0.022, 0.006, 8), [CX - 0.25 + rf() * 0.5, F + 0.006, CZ + 0.28 + rf() * 0.28], [(rf() - 0.5) * 0.4, rf() * 3, 0]);
  for (let i = 0; i < 4; i++)
    bag.add(i % 2 ? GOLD : GOLD2, new THREE.CylinderGeometry(0.022, 0.022, 0.006, 8), [CX + 0.38, F + 0.004 + 0.006 * i, CZ + 0.3], [0, i * 0.7, 0]);
  bag.add("#d0304a", new THREE.OctahedronGeometry(0.02), [CX - 0.15, F + 0.02, CZ + 0.34], [0.2, 0.5, 0]);
  bag.add("#3a6ee8", new THREE.OctahedronGeometry(0.016), [CX + 0.1, F + 0.016, CZ + 0.4], [0.1, 0.9, 0.2]);
  bag.rod(GOLD, [CX + 0.52, F + 0.01, CZ + 0.5], [CX + 0.66, F + 0.01, CZ + 0.5], 0.005);
  bag.torus(GOLD, 0.02, 0.005, [CX + 0.5, F + 0.012, CZ + 0.5], [0, 1, 0]);
  bag.box(GOLD, [0.012, 0.008, 0.02], [CX + 0.64, F + 0.01, CZ + 0.51]);

  // ---------- barrels ----------
  const H = 0.62;
  const rAt = (y: number) => 0.185 + 0.055 * Math.sin((Math.PI * y) / H);
  function makeBarrel(base: V, axis: V, k: number, open: boolean) {
    const ys = [0, 0.1, 0.22, 0.31, 0.4, 0.52, 0.62];
    const out: OutlinePoint[] = [[0, 0]];
    for (const y of ys) out.push([rAt(y) * k, y * k]);
    if (open) out.push([(rAt(H) - 0.025) * k, H * k], [(rAt(H) - 0.035) * k, (H - 0.12) * k], [0, (H - 0.12) * k]);
    else out.push([0, H * k]);
    b.lathe(out, { at: base, axis, segments: 10, color: barrelPaint, bone: root });
    for (const hy of [0.06, 0.19, 0.43, 0.57]) {
      const r0 = (rAt(hy) - 0.01) * k;
      const r1 = (rAt(hy) + 0.012) * k;
      b.lathe(
        [
          [r0, (hy - 0.022) * k],
          [r1, (hy - 0.022) * k],
          [r1, (hy + 0.022) * k],
          [r0, (hy + 0.022) * k],
        ],
        { at: base, axis, segments: 10, color: ironPaint, bone: root },
      );
    }
    const ax = vv(axis).normalize();
    const along = (d: number): V => {
      const p = vv(base).addScaledVector(ax, d);
      return [p.x, p.y, p.z];
    };
    if (!open) {
      b.part(new THREE.CylinderGeometry((rAt(H) - 0.012) * k, (rAt(H) - 0.012) * k, 0.02 * k, 10), lidPlank, {
        bone: root,
        at: along(H * k + 0.006),
        dir: axis,
      });
    } else {
      glow(
        b.part(new THREE.CylinderGeometry(0.15 * k, 0.15 * k, 0.01, 10), "#6bd04a", {
          bone: root,
          at: along((H - 0.07) * k),
          dir: axis,
        }),
        0.8,
      );
      for (let i = 0; i < 4; i++) {
        const a = i * 1.7;
        const p = vv(base).addScaledVector(ax, (H - 0.062) * k);
        glow(
          b.part(new THREE.SphereGeometry(0.014 + 0.004 * (i % 2), 5, 4), "#b6f27a", {
            bone: root,
            at: [p.x + Math.cos(a) * 0.07 * (i % 3 + 1) * 0.5, p.y + 0.004, p.z + Math.sin(a) * 0.07 * (i % 3 + 1) * 0.5],
          }),
          1,
        );
      }
    }
  }
  makeBarrel([0.98, F, -0.45], [0, 1, 0], 1, false);
  makeBarrel([0.98, F + 0.64, -0.45], [0, 1, 0], 0.58, false);
  makeBarrel([0.8, F, 0.2], [0, 1, 0], 1, true);
  makeBarrel([0.67, F + 0.216, 0.72], [1, 0, 0], 0.9, false);
  // goo drips and chocks
  bag.box("#6bd04a", [0.025, 0.2, 0.01], [0.8 + 0.2, F + 0.45, 0.2 + 0.0]);
  bag.box("#4d9a35", [0.2, 0.006, 0.16], [0.8, F + 0.003, 0.2 + 0.35]);
  for (const dz of [-0.14, 0.14]) bag.box(WOODR[1], [0.05, 0.05, 0.1], [0.65, F + 0.025, 0.72 + dz]);

  // ---------- spike trap ----------
  const TX = 0.15;
  const TZ = 0.25;
  b.part(new THREE.BoxGeometry(0.66, 0.02, 0.66), DARK, { bone: root, at: [TX, F + 0.0, TZ] });
  bag.box(IRON[2], [0.78, 0.05, 0.07], [TX, F + 0.02, TZ - 0.355]);
  bag.box(IRON[2], [0.78, 0.05, 0.07], [TX, F + 0.02, TZ + 0.355]);
  bag.box(IRON[2], [0.07, 0.05, 0.64], [TX - 0.355, F + 0.02, TZ]);
  bag.box(IRON[2], [0.07, 0.05, 0.64], [TX + 0.355, F + 0.02, TZ]);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) bag.add(IRON[4], new THREE.SphereGeometry(0.014, 5, 4), [TX + sx * 0.355, F + 0.045, TZ + sz * 0.355]);
  const rs = rng(53);
  for (let i = -2; i <= 2; i++)
    for (let j = -2; j <= 2; j++) {
      const x = TX + i * 0.11;
      const z = TZ + j * 0.11;
      const h = 0.13 + 0.08 * rs() + (i === 0 && j === 0 ? 0.04 : 0);
      bag.box(IRON[1], [0.06, 0.02, 0.06], [x, F + 0.02, z]);
      bag.add("#aeb6c6", new THREE.ConeGeometry(0.022, h, 4), [x, F + 0.03 + h / 2, z], [0, Math.PI / 4, 0]);
      bag.add(rs() < 0.4 ? BLOOD : "#e6ebf5", new THREE.ConeGeometry(0.0072, h * 0.3, 4), [x, F + 0.03 + h * 0.85 - 0.002, z], [0, Math.PI / 4, 0]);
    }
  for (let i = 0; i < 6; i++)
    bag.box(BLOOD, [0.03 + 0.04 * rs(), 0.004, 0.03 + 0.04 * rs()], [TX - 0.28 + 0.56 * rs(), F + 0.013, TZ - 0.28 + 0.56 * rs()]);
  // pressure plate
  const plateTile = stoneTile(9, STONE, 32, 32);
  b.part(tileBox([0.34, 0.02, 0.34], plateTile, TEXEL, { rand: rs, step: 1 }), "#ffffff", {
    texture: plateTile,
    bone: root,
    at: [TX, F + 0.01, 0.82],
  });
  b.part(new THREE.PlaneGeometry(0.28, 0.28), "#ffffff", {
    texture: PLATE,
    bone: root,
    at: [TX, F + 0.0215, 0.82],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, -1],
  });

  // ---------- bones ----------
  const yb = F + 0.014;
  const SZ = 0.45;
  const bone = (a: V, c: V, r = 0.011) => bag.rod(BONE, a, c, r, 5, true);
  function skull(x: number, z: number, rot: number) {
    const s = [Math.cos(rot), Math.sin(rot)];
    bag.add(BONE, new THREE.SphereGeometry(0.055, 7, 5), [x, F + 0.05, z], [0, 0, 0], [1, 0.9, 1.1]);
    bag.box(BONE2, [0.07, 0.022, 0.05], [x + 0.065 * s[0], F + 0.03, z + 0.065 * s[1]], [0, -rot, 0]);
    for (const e of [-1, 1])
      bag.box(DARK, [0.02, 0.012, 0.02], [x + 0.012 * s[0] - e * 0.022 * s[1], F + 0.098, z + 0.012 * s[1] + e * 0.022 * s[0]], [0, -rot, 0]);
    bag.box(DARK, [0.012, 0.012, 0.014], [x + 0.03 * s[0], F + 0.09, z + 0.03 * s[1]], [0, -rot, 0]);
    for (let t = -2; t <= 2; t++)
      bag.box(BONE, [0.008, 0.012, 0.008], [x + 0.095 * s[0] - t * 0.012 * s[1], F + 0.043, z + 0.095 * s[1] + t * 0.012 * s[0]]);
  }
  skull(-1.08, SZ, 0);
  skull(-1.2, -0.72, 2.2);
  for (let i = 0; i < 8; i++) bag.add(BONE2, new THREE.SphereGeometry(0.016, 5, 4), [-0.99 + 0.045 * i, F + 0.016, SZ]);
  for (let i = 0; i < 5; i++)
    bag.add(BONE, new THREE.TorusGeometry(0.075 - 0.005 * i, 0.009, 4, 8, Math.PI), [-0.93 + 0.05 * i, F + 0.008, SZ], [0, Math.PI / 2, 0], [1, 0.8, 1]);
  bag.box("#6b2230", [0.2, 0.012, 0.14], [-0.82, F + 0.08, SZ + 0.01], [0.15, 0.2, 0.1]);
  bag.box(BONE2, [0.05, 0.022, 0.12], [-0.62, F + 0.014, SZ]);
  for (const e of [-1, 1]) bag.add(BONE, new THREE.SphereGeometry(0.024, 5, 4), [-0.6, F + 0.02, SZ + e * 0.065]);
  // arms
  bone([-0.92, yb, SZ + 0.09], [-0.8, yb, SZ + 0.17]);
  bone([-0.8, yb, SZ + 0.17], [-0.68, yb, SZ + 0.15]);
  bone([-0.92, yb, SZ - 0.09], [-0.88, yb, SZ - 0.2]);
  bone([-0.88, yb, SZ - 0.2], [-0.84, yb, SZ - 0.33]);
  for (let f = 0; f < 4; f++) {
    bag.rod(BONE2, [-0.68, yb, SZ + 0.15], [-0.62, yb, SZ + 0.12 + 0.02 * f], 0.004);
    bag.rod(BONE2, [-0.84, yb, SZ - 0.33], [-0.83 - 0.01 * f, yb, SZ - 0.4 - 0.005 * f + 0.0], 0.004);
  }
  // legs
  bone([-0.6, yb, SZ + 0.065], [-0.36, yb, SZ + 0.1], 0.014);
  bone([-0.36, yb, SZ + 0.1], [-0.2, yb, SZ + 0.02], 0.012);
  bone([-0.6, yb, SZ - 0.065], [-0.4, yb, SZ - 0.03], 0.014);
  bone([-0.4, yb, SZ - 0.03], [-0.26, yb, SZ + 0.08], 0.012);
  for (let f = 0; f < 3; f++) bag.rod(BONE2, [-0.2, yb, SZ + 0.02], [-0.14, yb, SZ + 0.0 + 0.02 * f], 0.004);
  // scattered
  bone([0.36, yb, -0.52], [0.52, yb, -0.4], 0.012);
  bone([0.36, yb + 0.012, -0.4], [0.5, yb + 0.012, -0.56], 0.012);
  for (let i = 0; i < 7; i++) {
    const x = -1.25 + 0.2 * rs();
    const z = 0.7 + 0.2 * rs();
    const a = rs() * 6;
    bag.rod(i % 2 ? BONE : BONE2, [x, yb, z], [x + 0.1 * Math.cos(a), yb, z + 0.1 * Math.sin(a)], 0.009, 5, true);
  }
  bag.add(BONE, new THREE.TorusGeometry(0.06, 0.009, 4, 8, Math.PI), [-1.1, F + 0.008, 0.85], [0, 0.5, 0], [1, 0.8, 1]);
  // fallen torch
  bag.rod("#6b4423", [-0.15, F + 0.03, -0.62], [0.2, F + 0.03, -0.32], 0.03, 6);
  bag.rod("#1a100c", [0.2, F + 0.035, -0.32], [0.3, F + 0.035, -0.255], 0.042, 6);
  glow(b.part(new THREE.BoxGeometry(0.014, 0.014, 0.014), "#ff7a2a", { bone: root, at: [0.32, F + 0.07, -0.25] }), 1.2);
  glow(b.part(new THREE.BoxGeometry(0.01, 0.01, 0.01), "#ffd24a", { bone: root, at: [0.28, F + 0.08, -0.27] }), 1.2);

  bag.flush(b, root);
  lidBag.flush(b, lid);
  return b.root;
}
