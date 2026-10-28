import * as THREE from "three";
import { type Builder, createBuilder, frame, rng, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

type BasePartFn = (b: Builder) => void;
const PARTS: BasePartFn[] = [
  // ruins
  (() => {
function buildRuins(b: Builder) {
  const CREAM = "#e8dcc0", CREAM2 = "#d4c5a2", SHADE = "#b5a584", TEAL = "#2fb6b0", TEALD = "#1d7f86";
  const MOSS = "#6fae4a", MOSSD = "#4a8a3a", GOLD = "#e8b64a", RUNE = "#7ff5ee";
  const bone = "island";
  const Y0 = 1.5;
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, ry = 0, rz = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at: [x, y, z], rotation: [0, ry, rz] });
  const cyl = (rt: number, rb: number, h: number, c: string, x: number, y: number, z: number, seg = 8) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { bone, at: [x, y, z] });
  const glowMat = (c: string) => c;

  // plaza base ring (trim)
  cyl(0.85, 0.88, 0.04, CREAM2, 0, Y0 + 0.02, 0, 16);
  cyl(0.78, 0.78, 0.02, SHADE, 0, Y0 + 0.05, 0, 16);
  // inner teal ring inlay
  b.part(new THREE.TorusGeometry(0.55, 0.012, 4, 20), TEAL, { bone, at: [0, Y0 + 0.065, 0], rotation: [90, 0, 0] });

  // stairs toward the front
  for (let i = 0; i < 4; i++) {
    box(0.7 - i * 0.04, 0.05, 0.12, i % 2 ? CREAM2 : CREAM, 0, Y0 + 0.075 + i * 0.05, 0.6 - i * 0.11);
    box(0.7 - i * 0.04, 0.012, 0.125, TEAL, 0, Y0 + 0.1 + i * 0.05, 0.6 - i * 0.11);
  }
  // raised platform
  box(0.9, 0.06, 0.4, CREAM, 0, Y0 + 0.3, 0.05);
  box(0.9, 0.012, 0.42, TEAL, 0, Y0 + 0.335, 0.05);

  // arch gate at back
  const gz = -0.35;
  for (const s of [1, -1]) {
    box(0.16, 0.08, 0.16, CREAM2, s * 0.3, Y0 + 0.07, gz);
    box(0.11, 0.8, 0.11, CREAM, s * 0.3, Y0 + 0.5, gz);
    box(0.14, 0.05, 0.14, TEALD, s * 0.3, Y0 + 0.92, gz);
    box(0.13, 0.04, 0.13, TEAL, s * 0.3, Y0 + 0.28, gz);
    box(0.012, 0.5, 0.012, RUNE, s * 0.3, Y0 + 0.55, gz + 0.062);
    box(0.05, 0.012, 0.012, RUNE, s * 0.3, Y0 + 0.6, gz + 0.062);
    box(0.05, 0.012, 0.012, RUNE, s * 0.3, Y0 + 0.45, gz + 0.062);
    box(0.12, 0.03, 0.12, MOSS, s * 0.3, Y0 + 0.915 + 0.04, gz);
  }
  box(0.82, 0.1, 0.13, CREAM, 0, Y0 + 1.0, gz);
  box(0.5, 0.08, 0.14, CREAM2, 0, Y0 + 1.09, gz);
  box(0.2, 0.07, 0.14, CREAM, -0.05, Y0 + 1.16, gz);
  box(0.84, 0.02, 0.14, TEAL, 0, Y0 + 0.945, gz);
  b.part(new THREE.OctahedronGeometry(0.045), RUNE, { bone, at: [0, Y0 + 0.78, gz + 0.02] });
  b.part(new THREE.OctahedronGeometry(0.03), GOLD, { bone, at: [0, Y0 + 1.07, gz + 0.075] });
  box(0.3, 0.03, 0.16, MOSS, 0.1, Y0 + 1.07 + 0.03, gz);

  // broken pillars
  const pillars: [number, number, number][] = [[-0.62, 0.3, 0.7], [0.62, 0.15, 0.55], [-0.6, 0.45, -0.1], [0.6, 0.55, -0.1]];
  pillars.forEach(([x, z0, hh], i) => {
    const z = z0 === 0.3 ? 0.3 : z0;
    const px = x, pz = i === 0 ? 0.35 : i === 1 ? 0.3 : i === 2 ? -0.05 : -0.05;
    const h = hh;
    cyl(0.085, 0.095, 0.05, CREAM2, px, Y0 + 0.075, pz);
    cyl(0.065, 0.07, h, CREAM, px, Y0 + 0.1 + h / 2, pz, 8);
    cyl(0.075, 0.075, 0.025, TEAL, px, Y0 + 0.2, pz);
    cyl(0.075, 0.075, 0.02, GOLD, px, Y0 + 0.1 + h * 0.6, pz);
    // broken top
    b.part(new THREE.ConeGeometry(0.066, 0.06, 5), CREAM2, { bone, at: [px, Y0 + 0.1 + h + 0.025, pz], rotation: [180, i * 40, 0] });
    cyl(0.07, 0.07, 0.02, MOSS, px, Y0 + 0.095, pz, 7);
    void z;
  });

  // fallen blocks & drum segments
  box(0.2, 0.1, 0.12, CREAM2, 0.35, Y0 + 0.09, 0.45, 25);
  box(0.12, 0.08, 0.1, CREAM, -0.3, Y0 + 0.08, -0.6, -30);
  box(0.14, 0.07, 0.1, SHADE, 0.7, Y0 + 0.07, -0.55, 50);
  box(0.1, 0.06, 0.1, CREAM, -0.75, Y0 + 0.06, -0.35, 15);
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.28, 8), CREAM, { bone, at: [-0.25, Y0 + 0.14, 0.62], rotation: [0, 30, 90] });
  b.part(new THREE.CylinderGeometry(0.062, 0.062, 0.02, 8), TEAL, { bone, at: [-0.25 + 0.12, Y0 + 0.14, 0.62 - 0.07], rotation: [0, 30, 90] });
  box(0.1, 0.02, 0.08, MOSS, 0.35, Y0 + 0.145, 0.45, 25);

  // moss patches
  const mp: [number, number, number, number][] = [[-0.45, 0.2, 0.12, 0], [0.4, -0.3, 0.14, 1], [0.15, 0.55, 0.1, 0], [-0.7, 0.55, 0.11, 1], [0.7, 0.2, 0.1, 0]];
  mp.forEach(([x, z, r, k]) => cyl(r, r, 0.014, k ? MOSSD : MOSS, x, Y0 + 0.05, z, 7));

  // floating runes
  const runePos: [number, number, number][] = [[-0.15, Y0 + 0.62, 0.05], [0.15, Y0 + 0.75, 0.1], [0, Y0 + 0.55, 0.3]];
  runePos.forEach(([x, y, z], i) => {
    b.part(new THREE.OctahedronGeometry(0.04 + i * 0.005), glowMat(RUNE), { bone, at: [x, y, z], scale: [1, 1.5, 0.5] });
    b.part(new THREE.TorusGeometry(0.06, 0.006, 4, 12), TEAL, { bone, at: [x, y, z], rotation: [0, 0, i * 30] });
  });
  // central glowing rune on floor
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.01, 6), RUNE, { bone, at: [0, Y0 + 0.345, 0.05] });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.014, 6), TEALD, { bone, at: [0, Y0 + 0.347, 0.05] });
  void frame;
}
    return buildRuins;
  })(),
  // waterfall
  (() => {
function buildWaterfall(b: Builder) {
  const bone = "island";
  const X = 1.3, Z = 1.2;
  const add = (g: THREE.BufferGeometry, c: string, at: [number, number, number], rot?: [number, number, number], scale?: [number, number, number]) =>
    b.part(g, c, { bone, at, rotation: rot, scale, flat: true });

  const ROCK = "#7d7468", ROCK2 = "#645c52", WATER = "#4fc3e8", WATER2 = "#8fe0f5", FOAM = "#f4fbff", MIST = "#d6f1fa", DEEP = "#2f8fc4";

  // spillway rock edges
  add(new THREE.BoxGeometry(0.3, 0.22, 0.4), ROCK, [X - 0.36, 0.0, Z + 0.05], [0, 10, 0]);
  add(new THREE.BoxGeometry(0.3, 0.2, 0.4), ROCK2, [X + 0.36, -0.02, Z + 0.05], [0, -12, 0]);
  add(new THREE.BoxGeometry(0.5, 0.12, 0.3), ROCK2, [X, -0.12, Z + 0.3], [10, 0, 0]);

  // stream on top
  add(new THREE.BoxGeometry(0.32, 0.03, 0.9), DEEP, [X, 0.1, Z - 0.5]);
  add(new THREE.BoxGeometry(0.2, 0.02, 0.8), WATER2, [X, 0.12, Z - 0.5]);
  add(new THREE.BoxGeometry(0.4, 0.04, 0.2), WATER, [X, 0.1, Z - 0.02]);

  // lip foam
  for (let i = 0; i < 5; i++) add(new THREE.SphereGeometry(0.07, 6, 4), FOAM, [X - 0.16 + i * 0.08, 0.12, Z + 0.1 + (i % 2) * 0.05]);

  // water ribbon: stacked tapered segments
  const segs = 12, top = 0.05, bot = -2.4;
  for (let i = 0; i < segs; i++) {
    const t = i / segs;
    const y = top + (bot - top) * (t + 0.5 / segs);
    const w = 0.38 + t * 0.12;
    const z = Z + 0.3 + t * 0.2;
    add(new THREE.BoxGeometry(w, (top - bot) / segs + 0.01, 0.1), i % 2 ? WATER : DEEP, [X, y, z]);
    add(new THREE.BoxGeometry(w * 0.25, (top - bot) / segs * 0.8, 0.04), WATER2, [X + (i % 3 - 1) * 0.08, y, z + 0.06]);
  }

  // base foam and mist
  add(new THREE.CylinderGeometry(0.4, 0.45, 0.1, 8), FOAM, [X, -2.5, Z + 0.55]);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    add(new THREE.SphereGeometry(0.1, 6, 4), FOAM, [X + Math.cos(a) * 0.4, -2.45, Z + 0.55 + Math.sin(a) * 0.35]);
  }
  for (let i = 0; i < 7; i++) {
    const a = i * 2.1;
    add(new THREE.SphereGeometry(0.16 + (i % 3) * 0.04, 6, 4), MIST, [X + Math.cos(a) * 0.45, -2.2 + (i % 4) * 0.12, Z + 0.6 + Math.sin(a) * 0.35]);
  }

  // droplets
  for (let i = 0; i < 9; i++) {
    const side = i % 2 ? 1 : -1;
    add(new THREE.SphereGeometry(0.025, 5, 3), WATER2, [X + side * (0.28 + (i % 3) * 0.06), -0.3 - i * 0.24, Z + 0.4 + (i % 4) * 0.05]);
  }
}
    return buildWaterfall;
  })(),
  // trees
  (() => {
function buildTrees(b: Builder) {
  // The base source was not visible (the pitch showed a placeholder), so this is built to the stated
  // box and the plateau top at y = 1.5. All parts ride the "island" joint.
  const Y0 = 1.5;
  const bone = "island";
  const r = rng(11);
  const TRUNK = "#7a4e32", TRUNK_D = "#5c3822", PINK = "#f6a9c4", PINK_L = "#ffd0e0", PINK_D = "#e27fa6";
  const GREEN = "#6cc04a", GREEN_L = "#a4e06a", GREEN_D = "#3f9a3c";
  const FLOWERS = ["#ffffff", "#ffe27a", "#ff9ec0", "#b9a4ff"];

  const put = (geo: THREE.BufferGeometry, color: string, at: [number, number, number], scale?: [number, number, number], rot?: [number, number, number]) =>
    b.part(geo, color, { bone, at, scale, rotation: rot, flat: true });

  const blob = (x: number, y: number, z: number, rad: number, color: string, sy = 0.82) =>
    put(new THREE.IcosahedronGeometry(rad, 0), color, [x, y, z], [1, sy, 1], [r() * 60, r() * 360, 0]);

  function tree(x: number, z: number, h: number, rad: number, cols: string[], trunkR: number) {
    put(new THREE.CylinderGeometry(trunkR * 0.7, trunkR, h + 0.05, 6), TRUNK, [x, Y0 + h / 2 - 0.02, z]);
    // root flares
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      put(new THREE.ConeGeometry(trunkR * 0.45, trunkR * 2.2, 5), TRUNK_D,
        [x + Math.cos(a) * trunkR * 0.9, Y0 + trunkR * 0.7, z + Math.sin(a) * trunkR * 0.9],
        undefined, [Math.sin(a) * 35, 0, -Math.cos(a) * 35]);
    }
    // branch stubs
    put(new THREE.CylinderGeometry(trunkR * 0.25, trunkR * 0.4, h * 0.45, 5), TRUNK, [x + trunkR * 1.8, Y0 + h * 0.8, z], undefined, [0, 0, -50]);
    put(new THREE.CylinderGeometry(trunkR * 0.25, trunkR * 0.4, h * 0.4, 5), TRUNK, [x - trunkR * 1.6, Y0 + h * 0.75, z + 0.03], undefined, [0, 0, 50]);
    const cy = Y0 + h;
    blob(x, cy + rad * 0.35, z, rad, cols[0]);
    blob(x + rad * 0.55, cy + rad * 0.1, z + rad * 0.2, rad * 0.65, cols[1]);
    blob(x - rad * 0.55, cy + rad * 0.15, z - rad * 0.15, rad * 0.62, cols[1]);
    blob(x + rad * 0.1, cy + rad * 0.95, z - rad * 0.1, rad * 0.62, cols[2]);
    blob(x - rad * 0.2, cy + rad * 0.2, z + rad * 0.6, rad * 0.5, cols[2]);
    blob(x + rad * 0.25, cy + rad * 0.05, z - rad * 0.6, rad * 0.5, cols[0]);
  }

  // Hero blossom tree, left
  tree(-1.45, -0.35, 1.0, 0.62, [PINK, PINK_L, PINK_D], 0.15);
  // falling petals / pink ground patch
  for (let i = 0; i < 14; i++) {
    const a = r() * Math.PI * 2, d = 0.3 + r() * 0.6;
    put(new THREE.CircleGeometry(0.03 + r() * 0.02, 5), r() > 0.5 ? PINK_L : PINK,
      [-1.45 + Math.cos(a) * d, Y0 + 0.008, -0.35 + Math.sin(a) * d], undefined, [-90, 0, 0]);
  }

  // Smaller trees, back and left
  tree(-0.5, -1.2, 0.5, 0.34, [GREEN, GREEN_L, GREEN_D], 0.07);
  tree(0.4, -1.3, 0.45, 0.3, [PINK, PINK_L, PINK_D], 0.06);
  tree(-1.95, 0.7, 0.45, 0.3, [GREEN, GREEN_L, GREEN_D], 0.06);
  tree(1.3, -0.9, 0.4, 0.28, [GREEN_L, GREEN, GREEN_D], 0.055);

  // Bushes
  const bushes: [number, number, number, string[]][] = [
    [-0.9, -1.15, 0.18, [GREEN, GREEN_L]], [-1.9, -1.2, 0.2, [GREEN_D, GREEN]],
    [-2.0, 0.0, 0.16, [PINK, PINK_L]], [0.9, -1.4, 0.16, [GREEN, GREEN_L]],
    [-1.2, 1.1, 0.17, [GREEN, GREEN_D]], [1.6, -0.2, 0.15, [GREEN_L, GREEN]],
  ];
  for (const [x, z, s, c] of bushes) {
    blob(x, Y0 + s * 0.6, z, s, c[0], 0.75);
    blob(x + s * 0.8, Y0 + s * 0.4, z + s * 0.2, s * 0.7, c[1], 0.75);
    blob(x - s * 0.6, Y0 + s * 0.4, z - s * 0.3, s * 0.65, c[0], 0.75);
  }

  // Flowers
  for (let i = 0; i < 26; i++) {
    const x = -2.1 + r() * 3.7, z = -1.5 + r() * 2.2;
    if (Math.hypot(x + 1.45, z + 0.35) < 0.25) continue;
    const h = 0.07 + r() * 0.06;
    put(new THREE.CylinderGeometry(0.005, 0.006, h, 4), GREEN_D, [x, Y0 + h / 2 - 0.01, z]);
    const col = FLOWERS[Math.floor(r() * FLOWERS.length)];
    put(new THREE.OctahedronGeometry(0.03, 0), col, [x, Y0 + h + 0.01, z], [1, 0.6, 1]);
    put(new THREE.SphereGeometry(0.012, 5, 4), "#ffcf3a", [x, Y0 + h + 0.025, z]);
  }

  // Grass tufts
  for (let i = 0; i < 34; i++) {
    const x = -2.15 + r() * 3.9, z = -1.55 + r() * 3.0;
    const c = r() > 0.5 ? GREEN : GREEN_L;
    const h = 0.07 + r() * 0.06;
    put(new THREE.ConeGeometry(0.018, h, 4), c, [x, Y0 + h / 2 - 0.01, z], undefined, [r() * 14, 0, r() * 14]);
    put(new THREE.ConeGeometry(0.015, h * 0.8, 4), GREEN_D, [x + 0.025, Y0 + h * 0.4 - 0.01, z + 0.01], undefined, [0, 0, -18]);
  }
}
    return buildTrees;
  })(),
  // underside
  (() => {
function buildUnderside(b: Builder) {
  // The base source was not visible, so this assumes the rock cone narrows from about r=2 at y=0 to a tip near y=-3.2.
  const R = rng(11);
  const bone = "island";
  const coneR = (y: number) => Math.max(0.12, 2.0 * (1 + y / 3.3));
  const ROCK = ["#6b5f58", "#7d7068", "#554b47"];
  const CRY = ["#5fe3ff", "#9af0ff", "#7a8cff"];
  const ROOT = "#4a3626";
  const VINE = "#4f8a3a";
  const VINE2 = "#78b04a";

  // Hanging stalactites, tips pointing down, tops buried in the cone wall.
  const spike = (x: number, y: number, z: number, r: number, h: number, c: string) => {
    b.part(new THREE.ConeGeometry(r, h, 6), c, { bone, at: [x, y - h / 2, z], rotation: [180, 0, 0], flat: true });
  };
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2 + R() * 0.2;
    const y = -0.25 - R() * 1.5;
    const rad = coneR(y) * (0.7 + R() * 0.15);
    const h = 0.4 + R() * 0.7;
    spike(Math.sin(a) * rad, y, Math.cos(a) * rad, 0.07 + R() * 0.08, h, ROCK[i % 3]);
  }
  // Central tip spikes.
  spike(0, -2.6, 0, 0.22, 0.9, ROCK[2]);
  spike(0.18, -2.5, 0.1, 0.1, 0.7, ROCK[0]);
  spike(-0.15, -2.5, -0.1, 0.1, 0.6, ROCK[1]);

  // Glowing crystal clusters angled outward.
  const cluster = (a: number, y: number) => {
    const rad = coneR(y) * 0.86;
    const bx = Math.sin(a) * rad;
    const bz = Math.cos(a) * rad;
    for (let k = 0; k < 4; k++) {
      const len = 0.3 + R() * 0.35;
      const ox = (R() - 0.5) * 0.18;
      const oz = (R() - 0.5) * 0.18;
      const d: [number, number, number] = [Math.sin(a) * 0.8 + (R() - 0.5) * 0.7, -0.5 + R() * 0.3, Math.cos(a) * 0.8 + (R() - 0.5) * 0.7];
      const p = b.part(new THREE.ConeGeometry(0.07 + R() * 0.04, len, 5), CRY[k % 3], {
        bone,
        at: [bx + ox, y, bz + oz],
        dir: d,
        flat: true,
      });
      glow(p, 1.4);
    }
  };
  [0.5, 1.9, 3.3, 4.7, 5.8].forEach((a, i) => cluster(a, -0.9 - (i % 3) * 0.55));

  // Dangling roots and vines.
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.3;
    const y0 = -0.15 - R() * 0.3;
    const rad = coneR(y0) * 0.8;
    const x = Math.sin(a) * rad;
    const z = Math.cos(a) * rad;
    const len = 0.8 + R() * 1.0;
    const sx = (R() - 0.5) * 0.3;
    const sz = (R() - 0.5) * 0.3;
    b.sweep(
      catmull([
        [x, y0, z],
        [x + sx * 0.3, y0 - len * 0.35, z + sz * 0.3],
        [x + sx, y0 - len * 0.7, z + sz],
        [x + sx * 0.6, y0 - len, z + sz * 0.6],
      ]),
      [0.04, 0.008],
      { bone, color: i % 3 === 0 ? VINE : ROOT, sides: 5, caps: "point" } as any,
    );
    if (i % 2 === 0) {
      for (let k = 1; k <= 3; k++) {
        b.part(new THREE.SphereGeometry(0.05, 5, 4), k % 2 ? VINE2 : VINE, {
          bone,
          at: [x + sx * (0.25 * k), y0 - len * (0.22 * k), z + sz * (0.25 * k)],
          scale: [1.3, 0.5, 1],
          flat: true,
        });
      }
    }
  }

  // Floating fragments.
  const frags: [number, number, number, number][] = [
    [1.5, -2.5, 0.8, 0.2],
    [-1.4, -2.9, 0.6, 0.16],
    [0.3, -3.3, -1.4, 0.22],
    [-1.0, -2.3, -1.5, 0.13],
    [1.0, -3.2, 1.3, 0.12],
  ];
  frags.forEach(([x, y, z, s], i) => {
    b.part(new THREE.DodecahedronGeometry(s, 0), ROCK[i % 3], { bone, at: [x, y, z], rotation: [i * 20, i * 50, 10], flat: true });
    if (i % 2 === 0)
      glow(b.part(new THREE.OctahedronGeometry(s * 0.35, 0), CRY[i % 3], { bone, at: [x, y + s * 0.9, z], flat: true }), 1.3);
  });

  // Orbiting stone chain, two rings.
  for (let ring = 0; ring < 2; ring++) {
    const n = 14;
    const rr = ring ? 1.0 : 1.7;
    const yy = ring ? -3.0 : -2.0;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + ring * 0.2;
      const s = 0.035 + 0.03 * (0.5 + 0.5 * Math.sin(i * 2.3));
      b.part(new THREE.IcosahedronGeometry(s, 0), ROCK[i % 3], {
        bone,
        at: [Math.sin(a) * rr, yy + Math.sin(a * 2) * 0.1, Math.cos(a) * rr],
        flat: true,
      });
    }
  }
}
    return buildUnderside;
  })(),
  // rimDetails
  (() => {
function buildRimDetails(b: Builder) {
  const Y = 1.38;
  const R = 2.35;
  const bone = "island";
  const P = (g: THREE.BufferGeometry, c: string, at: [number, number, number], o: any = {}) =>
    b.part(g, c, { at, bone, ...o });
  const ang = (i: number, n: number) => (i / n) * Math.PI * 2;

  // grass fringe tufts around the rim
  const greens = ["#6fbf3a", "#8fd94a", "#58a62e"];
  const nT = 28;
  for (let i = 0; i < nT; i++) {
    const a = ang(i, nT);
    const r = R + 0.03 * Math.sin(i * 2.3);
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r;
    P(new THREE.ConeGeometry(0.07, 0.2 + 0.05 * (i % 3), 5), greens[i % 3], [x, Y + 0.08, z], {
      rotation: [Math.cos(a) * 18, 0, -Math.sin(a) * 18],
    });
  }

  // flowers
  const petals = ["#ffffff", "#ffd1e6", "#ffe066", "#bfa8ff"];
  for (let i = 0; i < 14; i++) {
    const a = ang(i, 14) + 0.2;
    const r = R - 0.15 - 0.1 * (i % 3);
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r;
    P(new THREE.CylinderGeometry(0.008, 0.008, 0.1, 4), "#3f8f2a", [x, Y + 0.05, z]);
    P(new THREE.SphereGeometry(0.04, 6, 4), petals[i % 4], [x, Y + 0.11, z]);
    P(new THREE.SphereGeometry(0.015, 5, 4), "#f5a623", [x, Y + 0.14, z]);
  }

  // stone fence posts with rails on the front-right arc
  const posts: [number, number][] = [];
  for (let i = 0; i < 7; i++) {
    const a = 0.5 + i * 0.22;
    const x = Math.sin(a) * (R - 0.08);
    const z = Math.cos(a) * (R - 0.08);
    posts.push([x, z]);
    P(new THREE.BoxGeometry(0.1, 0.24, 0.1), "#b9b2a3", [x, Y + 0.12, z], { rotation: [0, a * 57.3, 0] });
    P(new THREE.BoxGeometry(0.13, 0.04, 0.13), "#d6cfbf", [x, Y + 0.26, z], { rotation: [0, a * 57.3, 0] });
  }
  for (let i = 0; i < posts.length - 1; i++) {
    const [x0, z0] = posts[i];
    const [x1, z1] = posts[i + 1];
    b.rod([x0, Y + 0.18, z0], [x1, Y + 0.18, z1], 0.015, "#8a6a45", { bone });
  }

  // winding path of stepping stones from centre-ish to rim
  const stones = ["#d9c9a0", "#cdbb8c", "#e3d5b0"];
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const x = -1.9 + t * 1.2 + Math.sin(t * 6) * 0.25;
    const z = 1.6 - t * 2.2 + Math.cos(t * 5) * 0.12;
    P(new THREE.CylinderGeometry(0.11, 0.12, 0.03, 6), stones[i % 3], [x, Y + 0.012, z], { rotation: [0, i * 23, 0] });
  }

  // lanterns on posts
  for (const s of [1, -1]) {
    const a = s > 0 ? 2.4 : 4.0;
    const x = Math.sin(a) * (R - 0.1);
    const z = Math.cos(a) * (R - 0.1);
    P(new THREE.CylinderGeometry(0.025, 0.03, 0.4, 6), "#5b4632", [x, Y + 0.2, z]);
    P(new THREE.BoxGeometry(0.16, 0.03, 0.16), "#3d2f22", [x, Y + 0.42, z]);
    const g = P(new THREE.BoxGeometry(0.11, 0.12, 0.11), "#ffd36a", [x, Y + 0.49, z]);
    (g.mesh.material as THREE.MeshStandardMaterial).emissive = new THREE.Color("#ffb83a");
    P(new THREE.ConeGeometry(0.11, 0.08, 4), "#c0392b", [x, Y + 0.59, z], { rotation: [0, 45, 0] });
  }

  // tiny wooden bridge over a gap near the back
  const bx = -0.6;
  const bz = -2.2;
  for (let i = 0; i < 7; i++) {
    P(new THREE.BoxGeometry(0.07, 0.025, 0.22), i % 2 ? "#a8774a" : "#b9875a", [bx - 0.27 + i * 0.09, Y + 0.09 + 0.05 * Math.sin((i / 6) * Math.PI), bz]);
  }
  for (const s of [1, -1]) {
    b.rod([bx - 0.3, Y + 0.02, bz + s * 0.11], [bx + 0.3, Y + 0.02, bz + s * 0.11], 0.015, "#6b4a2b", { bone });
    P(new THREE.BoxGeometry(0.04, 0.14, 0.04), "#6b4a2b", [bx - 0.3, Y + 0.07, bz + s * 0.11]);
    P(new THREE.BoxGeometry(0.04, 0.14, 0.04), "#6b4a2b", [bx + 0.3, Y + 0.07, bz + s * 0.11]);
  }
}
    return buildRimDetails;
  })(),
];

export const BASE_PARTS = [
  {
    id: "ruins",
    builds: "Ruined temple on the island top: broken pillars, arch gate, stair steps, fallen blocks, glowing runes, moss patches and trim in a Genshin-style cream stone and teal palette",
    box: [
      [-0.9, 1.5, -0.9],
      [0.9, 3.1, 0.9],
    ],
    attaches: "Top of the grass plateau (y = 1.5) in the centre-back area, standing on the stone plaza disc",
    joints: ["island"],
    floor: false,
    budget: 260,
  },
  {
    id: "waterfall",
    builds: "Waterfall pouring over the front-right rim: water ribbon sweep, foam at lip and base, mist puffs, small stream on top, falling droplets, rocky spillway edge",
    box: [
      [0.4, -2.6, 0.3],
      [2.0, 1.6, 2.2],
    ],
    attaches: "Notch on the front-right rim of the plateau at about x=1.3, z=1.2, falling past the rock underside",
    joints: ["island"],
    floor: false,
    budget: 150,
  },
  {
    id: "trees",
    builds: "Stylized trees: chunky trunks with low-poly layered canopies of blossom pink and bright green, a large hero tree at the left, small bushes, flowers, grass tufts",
    box: [
      [-2.2, 1.5, -1.6],
      [1.8, 3.6, 1.8],
    ],
    attaches: "Grass plateau top surface (y = 1.5) around the ruins, mostly left and back",
    joints: ["island"],
    floor: false,
    budget: 220,
  },
  {
    id: "underside",
    builds: "Hanging rock details beneath the island: stalactite spikes, glowing crystal clusters, dangling roots, vines, floating small rock fragments and chains of tiny orbiting stones",
    box: [
      [-2.4, -3.6, -2.4],
      [2.4, 0.4, 2.4],
    ],
    attaches: "Underside of the rock cone and its lower tip below the island joint",
    joints: ["island"],
    floor: false,
    budget: 180,
  },
  {
    id: "rimDetails",
    builds: "Island rim trim: cliff edge grass fringe, small flowers, stone fence posts, a winding path, lanterns and a tiny wooden bridge",
    box: [
      [-2.6, 1.3, -2.6],
      [2.6, 1.9, 2.6],
    ],
    attaches: "Outer rim ring of the grass plateau top",
    joints: ["island"],
    floor: false,
    budget: 90,
  },
];

export default function build() {
  const b = createBuilder({ name: "model" });
  const island = b.joint("island", { at: [0, 1.5, 0] });

  const GRASS = "#7ccf4a";
  const GRASS_DARK = "#4fa83c";
  const SOIL = "#8a5a3a";
  const ROCK = "#9a8f86";
  const ROCK_DARK = "#6f6760";
  const PLAZA = "#d9cfb8";

  // Rock cone underside (lathe, tip at bottom)
  b.lathe(
    [
      [0, -3.4],
      [0.35, -3.0],
      [0.9, -2.2],
      [1.7, -1.2],
      [2.3, -0.3],
      [2.55, 0.6],
      [2.6, 1.2],
      [0, 1.2],
    ],
    { at: [0, 0, 0], bone: island, segments: 9, color: ROCK },
  );
  // Darker lower tip
  b.lathe(
    [
      [0, -3.45],
      [0.3, -3.0],
      [0.7, -2.3],
      [0.5, -2.0],
      [0, -2.0],
    ],
    { at: [0, 0, 0], bone: island, segments: 7, color: ROCK_DARK },
  );
  // Soil band
  b.lathe(
    [
      [0, 1.1],
      [2.62, 1.1],
      [2.68, 1.3],
      [2.65, 1.42],
      [0, 1.42],
    ],
    { at: [0, 0, 0], bone: island, segments: 12, color: SOIL },
  );
  // Grass plateau
  b.lathe(
    [
      [0, 1.4],
      [2.7, 1.4],
      [2.72, 1.5],
      [2.55, 1.56],
      [0, 1.56],
    ],
    { at: [0, 0, 0], bone: island, segments: 12, color: GRASS },
  );
  // Raised grassy mound in the back
  b.lathe(
    [
      [0, 1.5],
      [1.5, 1.5],
      [1.2, 1.62],
      [0, 1.7],
    ],
    { at: [-0.3, 0, -0.5], bone: island, segments: 10, color: GRASS_DARK },
  );
  // Stone plaza disc for ruins
  b.lathe(
    [
      [0, 1.6],
      [1.05, 1.6],
      [1.05, 1.72],
      [0, 1.72],
    ],
    { at: [0.1, 0, -0.2], bone: island, segments: 10, color: PLAZA },
  );
  // Rim rocks
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.3;
    b.part(new THREE.DodecahedronGeometry(0.22 + (i % 3) * 0.05, 0), ROCK, {
      bone: island,
      at: [Math.sin(a) * 2.6, 1.35, Math.cos(a) * 2.6],
      flat: true,
    });
  }

    for (const add of PARTS) add(b);
  return b.root;
}
