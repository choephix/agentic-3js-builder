import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, frame } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Dragonbone Soul Scythe",
  "description": "A tall League of Legends style fantasy scythe: a vertebrae-segmented dragonbone haft, a dragon-skull crown, a huge curved bone blade and a floating soul-fire core, glowing teal."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  boneIvory: "#e9e0c8",
  boneShade: "#b9ab8a",
  boneDark: "#6e6049",
  leather: "#2c2433",
  gold: "#e0a93a",
  goldDark: "#8a5d1c",
  soulTeal: "#35f2d0",
  soulDeep: "#0f9a94",
  soulWhite: "#d9fff6",
  void: "#141a24",
  ember: "#ff7a3a",
};
const M = {
  buttTip: [0, 0, 0] as [number, number, number],
  gripBottom: [0, 0.2, 0] as [number, number, number],
  gripTop: [0, 1.55, 0] as [number, number, number],
  skullBase: [0, 1.6, 0] as [number, number, number],
  skullCenter: [0, 1.85, 0.05] as [number, number, number],
  orbCenter: [0, 2, -0.02] as [number, number, number],
  bladeRoot: [0.1, 2.15, -0.05] as [number, number, number],
  bladeTip: [1.45, 1.85, -0.05] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // haft
  (() => {
function buildHaft({ b, P }: any) {
  const R = rng(5);
  const IV = P.boneIvory, SH = P.boneShade, DK = P.boneDark, LE = P.leather;
  const GO = P.gold, GD = P.goldDark, TE = P.soulTeal;

  // lathe-like stacked part on the Y axis
  const cyl = (y: number, h: number, r0: number, r1: number, color: string, sides = 8) =>
    b.part(new THREE.CylinderGeometry(r1, r0, h, sides), color, { at: [0, y, 0], flat: true });
  const rune = (y: number, ang: number, r: number, hgt = 0.05) => {
    const x = Math.sin(ang) * r, z = Math.cos(ang) * r;
    const p = b.part(new THREE.BoxGeometry(0.014, hgt, 0.012), TE, { at: [x, y, z], rotation: [0, (ang * 180) / Math.PI, 0] });
    glow(p, 1.2);
  };

  // butt spike (tip touches y=0)
  b.part(new THREE.ConeGeometry(0.04, 0.18, 8), IV, { at: [0, 0.09, 0], rotation: [180, 0, 0], flat: true });
  cyl(0.2, 0.06, 0.04, 0.075, SH, 8);
  cyl(0.255, 0.04, 0.09, 0.09, GO, 8);
  cyl(0.3, 0.06, 0.1, 0.06, SH, 8);
  b.part(new THREE.TorusGeometry(0.09, 0.012, 5, 12), GD, { at: [0, 0.255, 0], rotation: [90, 0, 0] });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.part(new THREE.ConeGeometry(0.014, 0.07, 5), IV, {
      at: [Math.sin(a) * 0.1, 0.23, Math.cos(a) * 0.1], rotation: [Math.cos(a) * 150, 0, -Math.sin(a) * 150], flat: true });
  }

  // vertebra haft lower (0.33-0.85)
  const vert = (y0: number, y1: number, n: number, seed: number) => {
    const h = (y1 - y0) / n;
    for (let i = 0; i < n; i++) {
      const y = y0 + h * (i + 0.5);
      cyl(y, h * 0.62, 0.05, 0.05, i % 2 ? SH : IV);
      cyl(y + h * 0.4, h * 0.3, 0.07, 0.045, i % 2 ? IV : SH);
      cyl(y - h * 0.4, h * 0.3, 0.045, 0.07, i % 2 ? IV : SH);
      if (i % 2 === 0) rune(y, R() * 6.28 + seed, 0.052, 0.04);
    }
  };
  vert(0.33, 0.85, 6, 0);
  cyl(0.865, 0.03, 0.075, 0.075, GO);

  // leather grip
  cyl(1.12, 0.5, 0.058, 0.058, LE);
  for (let i = 0; i < 9; i++) {
    const y = 0.9 + i * 0.055;
    b.part(new THREE.TorusGeometry(0.06, 0.007, 4, 10), DK, { at: [0, y, 0], rotation: [90, 0, 0], flat: true });
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.02, 0.12, 0.008), GD, {
      at: [Math.sin(a) * 0.062, 1.12, Math.cos(a) * 0.062], rotation: [0, (a * 180) / Math.PI, 30] });
  }
  for (const y of [0.9, 1.12, 1.37]) {
    cyl(y + 0.0, 0.025, 0.07, 0.07, GO);
  }
  cyl(1.395, 0.02, 0.08, 0.08, GD);

  // upper vertebrae
  vert(1.4, 1.5, 2, 2);
  cyl(1.515, 0.03, 0.085, 0.085, GO);

  // collar flare near skull
  cyl(1.56, 0.07, 0.085, 0.11, SH);
  cyl(1.6, 0.025, 0.115, 0.115, GO);
  // gold ring detail
  b.part(new THREE.TorusGeometry(0.1, 0.01, 5, 12), GD, { at: [0, 1.545, 0], rotation: [90, 0, 0] });

  // rib-spur fins near grip
  for (const s of [1, -1]) for (const z of [1, -1]) {
    const x = s * 0.075, zz = z * 0.075;
    b.part(new THREE.ConeGeometry(0.02, 0.15, 5), IV, {
      at: [x, 1.46, zz], rotation: [z * -25, 0, s * -25], flat: true });
  }
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.018, 0.12, 5), SH, { at: [s * 0.11, 0.88, 0], rotation: [0, 0, s * -55], flat: true });
  }
  // glowing rune bands
  for (let i = 0; i < 4; i++) rune(0.47 + i * 0.12, i * 1.6, 0.055, 0.05);
  glow(b.part(new THREE.TorusGeometry(0.052, 0.005, 4, 10), TE, { at: [0, 0.865, 0], rotation: [90, 0, 0] }), 1);
}
    return buildHaft;
  })(),
  // skullCrown
  (() => {
function buildSkullCrown({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const bone = P.boneIvory, shade = P.boneShade, dark = P.boneDark, gold = P.gold, goldD = P.goldDark, teal = P.soulTeal;
  const Y = 1.86; // skull centre height

  const box = (w: number, h: number, d: number, c: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, rotation: rot });
  const cone = (r: number, l: number, c: string, at: number[], dir: number[], seg = 6) =>
    b.part(new THREE.ConeGeometry(r, l, seg), c, { at, dir });
  const cyl = (rt: number, rb: number, h: number, c: string, at: number[], seg = 8, dir?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at, dir });

  // gold collar
  cyl(0.1, 0.13, 0.08, gold, [0, 1.64, 0]);
  cyl(0.135, 0.135, 0.02, goldD, [0, 1.6, 0], 8);
  cyl(0.09, 0.1, 0.05, goldD, [0, 1.7, 0]);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.part(new THREE.BoxGeometry(0.03, 0.06, 0.012), shade, { at: [Math.sin(a) * 0.115, 1.645, Math.cos(a) * 0.115], rotation: [0, (a * 180) / Math.PI, 0] });
  }
  // neck block
  box(0.18, 0.12, 0.2, shade, [0, 1.76, -0.02]);

  // cranium
  box(0.3, 0.2, 0.28, bone, [0, Y, -0.07]);
  box(0.26, 0.06, 0.22, shade, [0, Y + 0.12, -0.08]);
  // snout upper
  box(0.2, 0.1, 0.3, bone, [0, Y - 0.02, 0.2]);
  box(0.15, 0.06, 0.1, bone, [0, Y - 0.04, 0.38]);
  box(0.12, 0.025, 0.28, shade, [0, Y + 0.035, 0.22]);
  // nose ridge
  box(0.05, 0.03, 0.28, dark, [0, Y + 0.055, 0.2]);
  // lower jaw, opened
  const jaw = new THREE.Group();
  box(0.17, 0.045, 0.3, shade, [0, Y - 0.14, 0.2], [14, 0, 0]);
  box(0.12, 0.04, 0.09, shade, [0, Y - 0.17, 0.37], [14, 0, 0]);
  for (const s of [1, -1]) box(0.03, 0.05, 0.22, bone, [s * 0.1, Y - 0.1, 0.07], [14, 0, 0]);
  void jaw;
  // gold jaw plate
  box(0.1, 0.012, 0.12, gold, [0, Y - 0.115, 0.04], [14, 0, 0]);
  // teeth
  for (let i = 0; i < 6; i++) {
    const z = 0.1 + i * 0.05;
    for (const s of [1, -1]) {
      cone(0.012, 0.045, P.soulWhite === undefined ? bone : "#f5efe0", [s * 0.09, Y - 0.085, z], [0, -1, 0], 4);
      cone(0.011, 0.04, "#f5efe0", [s * 0.075, Y - 0.115 + i * 0.0 - i * 0.012, z + 0.01], [0, 1, 0], 4);
    }
  }
  for (const s of [1, -1]) cone(0.02, 0.08, "#f5efe0", [s * 0.07, Y - 0.1, 0.34], [0, -1, 0.2], 5); // fangs

  // brow ridges and eyes
  for (const s of [1, -1]) {
    box(0.1, 0.04, 0.12, shade, [s * 0.1, Y + 0.08, 0.06], [0, s * -12, s * 12]);
    box(0.08, 0.02, 0.1, dark, [s * 0.1, Y + 0.105, 0.06], [0, s * -12, s * 12]);
    glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), teal, { at: [s * 0.13, Y + 0.025, 0.1], scale: [0.6, 0.9, 1.1] }), 1.6);
    glow(b.part(new THREE.SphereGeometry(0.012, 5, 4), P.soulWhite, { at: [s * 0.14, Y + 0.03, 0.112] }), 1.5);
    // nostrils
    glow(b.part(new THREE.SphereGeometry(0.014, 5, 4), teal, { at: [s * 0.04, Y - 0.025, 0.46], scale: [0.8, 1, 0.6] }), 1.5);
    // cheek spikes
    cone(0.03, 0.14, bone, [s * 0.2, Y - 0.07, -0.06], [s, -0.3, -0.6]);
    cone(0.022, 0.1, shade, [s * 0.19, Y - 0.1, 0.02], [s, -0.5, -0.1]);
    cone(0.018, 0.08, shade, [s * 0.18, Y - 0.12, -0.12], [s, -0.5, -0.7], 5);
    // gold cheek plate
    box(0.02, 0.09, 0.12, gold, [s * 0.158, Y - 0.01, -0.03]);
    box(0.012, 0.05, 0.07, goldD, [s * 0.17, Y - 0.01, -0.03]);
    // horns swept back
    const hp = b.sweep([[s * 0.12, Y + 0.1, -0.12], [s * 0.2, Y + 0.2, -0.22], [s * 0.26, Y + 0.28, -0.34]], [0.038, 0.006], { color: bone, sides: 6, caps: { end: "point" } });
    void hp;
    cyl(0.045, 0.05, 0.03, gold, [s * 0.12, Y + 0.1, -0.12], 6, [s * 0.5, 0.5, -0.6]);
    // frill spikes
    cone(0.02, 0.1, shade, [s * 0.1, Y + 0.12, -0.2], [s * 0.4, 0.4, -1]);
    // gold snout trim
    box(0.012, 0.03, 0.08, gold, [s * 0.1, Y - 0.01, 0.28]);
  }
  // crest spikes along the top
  for (let i = 0; i < 4; i++) cone(0.02 - i * 0.002, 0.09, i % 2 ? shade : bone, [0, Y + 0.17 - i * 0.02, -0.04 - i * 0.07], [0, 1, -0.8], 5);
  // crack
  box(0.012, 0.1, 0.012, dark, [0.04, Y + 0.14, -0.02], [0, 0, 25]);
  box(0.01, 0.06, 0.01, dark, [0.07, Y + 0.12, 0.0], [0, 0, -40]);
  box(0.01, 0.06, 0.01, dark, [0.02, Y + 0.13, -0.05], [30, 0, -10]);
  glow(box(0.006, 0.07, 0.006, teal, [0.045, Y + 0.145, -0.02], [0, 0, 25]), 1.2);
  // forehead gold gem plate
  box(0.07, 0.02, 0.08, gold, [0, Y + 0.095, 0.02]);
  glow(b.part(new THREE.OctahedronGeometry(0.02), teal, { at: [0, Y + 0.115, 0.02] }), 1.6);
  // rear gold band
  box(0.28, 0.04, 0.03, gold, [0, Y + 0.0, -0.215]);
  box(0.24, 0.02, 0.03, goldD, [0, Y - 0.05, -0.215]);

  // prongs cradling the orb at (0,2,-0.02)
  for (const s of [1, -1]) {
    b.sweep([[s * 0.06, Y + 0.12, -0.1], [s * 0.1, 2.0, -0.08], [s * 0.07, 2.12, -0.04]], [0.028, 0.006], { color: bone, sides: 6, caps: { end: "point" } });
    cyl(0.032, 0.032, 0.02, gold, [s * 0.075, Y + 0.14, -0.1], 6);
  }
  const bp = b.sweep([[0, Y + 0.12, -0.2], [0, 2.05, -0.17], [0, 2.14, -0.08]], [0.026, 0.006], { color: shade, sides: 6, caps: { end: "point" } });
  void bp;
  void R; void frame; void J; void M;
}
    return buildSkullCrown;
  })(),
  // bladeBone
  (() => {
function buildBladeBone({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const root = M.bladeRoot, tip = M.bladeTip;
  const Z = -0.05;
  // centreline: arc from root rising then sweeping down to tip
  const cx = (t: number) => root[0] + (tip[0] - root[0]) * t;
  const cy = (t: number) => root[1] + 0.3 * Math.sin(Math.PI * Math.min(1, t * 1.05) * 0.9) - (root[1] - tip[1] + 0.0) * Math.pow(t, 2.6) + 0.0;
  const pts: number[][] = [];
  const N = 14;
  for (let i = 0; i <= N; i++) { const t = i / N; pts.push([cx(t), cy(t), Z]); }
  const halfW = (t: number) => 0.2 * Math.pow(1 - t, 0.8) + 0.012;

  // blade plate: stacked extruded segments following curve
  for (let i = 0; i < N; i++) {
    const a = pts[i], c = pts[i + 1];
    const t0 = i / N, t1 = (i + 1) / N;
    const ax = a[0], ay = a[1], cxx = c[0], cyy = c[1];
    const outline: [number, number][] = [
      [ax, ay + halfW(t0) * 0.45],
      [cxx, cyy + halfW(t1) * 0.45],
      [cxx, cyy - halfW(t1)],
      [ax, ay - halfW(t0)],
    ];
    const col = i % 2 ? P.boneIvory : P.boneShade;
    b.extrude(outline, { at: [0, 0, Z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.035, color: col });
    // spine segment (upper edge)
    const spine: [number, number][] = [
      [ax, ay + halfW(t0) * 0.45],
      [cxx, cyy + halfW(t1) * 0.45],
      [cxx, cyy + halfW(t1) * 0.45 + 0.05 * (1 - t1) + 0.02],
      [ax, ay + halfW(t0) * 0.45 + 0.05 * (1 - t0) + 0.02],
    ];
    b.extrude(spine, { at: [0, 0, Z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.075, color: P.boneShade });
    // teal cutting edge strip
    const edge: [number, number][] = [
      [ax, ay - halfW(t0)],
      [cxx, cyy - halfW(t1)],
      [cxx, cyy - halfW(t1) - 0.014],
      [ax, ay - halfW(t0) - 0.014],
    ];
    glow(b.extrude(edge, { at: [0, 0, Z], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.02, color: P.soulTeal }), 1.4);
    // gold inlay line
    const m0 = ay - halfW(t0) * 0.2, m1 = cyy - halfW(t1) * 0.2;
    const inl: [number, number][] = [[ax, m0], [cxx, m1], [cxx, m1 - 0.008], [ax, m0 - 0.008]];
    b.extrude(inl, { at: [0, 0, Z + 0.0], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.042, color: P.gold });
    // serrated spike on spine
    if (i % 2 === 0 && i < N - 2) {
      const sx = (ax + cxx) / 2, sy = (ay + cyy) / 2 + halfW((t0 + t1) / 2) * 0.45 + 0.06;
      b.spike([sx, sy - 0.02, Z], [0.15, 1, 0], 0.1 * (1 - t0) + 0.04, 0.025, { color: P.boneIvory, sides: 6 });
    }
    // dark notches below the spine
    if (i % 3 === 1) {
      const nx = (ax + cxx) / 2, ny = (ay + cyy) / 2 + halfW((t0 + t1) / 2) * 0.2;
      for (const s of [1, -1])
        b.part(new THREE.BoxGeometry(0.012, 0.05, 0.004), P.boneDark, { at: [nx, ny, Z + s * 0.0185], rotation: [0, 0, -20] });
    }
    // rune slivers
    if (i % 3 === 2 && i < N - 2) {
      const rx = (ax + cxx) / 2, ry = (ay + cyy) / 2 + halfW((t0 + t1) / 2) * 0.1;
      glow(b.part(new THREE.BoxGeometry(0.012, 0.045, 0.004), P.soulTeal, { at: [rx, ry, Z + 0.0215] }), 1.3);
      glow(b.part(new THREE.BoxGeometry(0.035, 0.01, 0.004), P.soulTeal, { at: [rx, ry + 0.012, Z + 0.0215], rotation: [0, 0, 30] }), 1.3);
    }
  }
  // hooked tip
  b.spike([tip[0] - 0.03, tip[1] + 0.02, Z], [0.35, -1, 0], 0.16, 0.028, { color: P.boneIvory, sides: 6 });
  glow(b.spike([tip[0] - 0.04, tip[1] - 0.01, Z], [0.35, -1, 0], 0.1, 0.012, { color: P.soulTeal, sides: 6 }), 1.4);

  // root fittings: gold collar and bosses
  b.part(new THREE.BoxGeometry(0.1, 0.34, 0.1), P.gold, { at: [root[0] + 0.03, root[1] - 0.02, Z] });
  b.part(new THREE.BoxGeometry(0.115, 0.04, 0.115), P.goldDark, { at: [root[0] + 0.03, root[1] + 0.12, Z] });
  b.part(new THREE.BoxGeometry(0.115, 0.04, 0.115), P.goldDark, { at: [root[0] + 0.03, root[1] - 0.16, Z] });
  for (const s of [1, -1]) {
    glow(b.part(new THREE.SphereGeometry(0.025, 6, 4), P.soulTeal, { at: [root[0] + 0.06, root[1] - 0.02, Z + s * 0.055] }), 1.3);
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 8), P.gold, { at: [root[0] + 0.14, root[1] - 0.1, Z + s * 0.02], rotation: [90, 0, 0] });
  }
  // plate between root and blade
  b.extrude([[0, -0.15], [0.2, -0.12], [0.22, 0.12], [0, 0.14]], { at: [root[0] + 0.05, root[1], Z], x: [1, 0, 0], thickness: 0.06, color: P.boneIvory });
  // gold trim wing along inner blade
  void R; void frame;
}
    return buildBladeBone;
  })(),
  // soulFire
  (() => {
function buildSoulFire({ b, J, P, M }: any) {
  const R = rng(11);
  const O = M.orbCenter as number[];
  const g = (geo: THREE.BufferGeometry, color: string, at: number[], o: any = {}, s = 1) =>
    glow(b.part(geo, color, { at, flat: true, ...o }), s);

  // cores
  g(new THREE.IcosahedronGeometry(0.1, 1), P.soulTeal, O, {}, 1.4);
  g(new THREE.IcosahedronGeometry(0.06, 0), P.soulWhite, O, {}, 2);

  // halo rings
  const rings: [number, string, number[], number][] = [
    [0.15, P.gold, [75, 0, 20], 0.007],
    [0.185, P.soulDeep, [20, 30, 70], 0.006],
    [0.12, P.soulTeal, [100, 0, -30], 0.005],
  ];
  for (const [r, c, rot, t] of rings)
    g(new THREE.TorusGeometry(r, t, 5, 20), c, O, { rotation: rot }, 1.2);

  // orbiting shards
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const r = 0.21 + (i % 2) * 0.04;
    const h = Math.sin(i * 1.7) * 0.07;
    const at = [O[0] + Math.cos(a) * r, O[1] + h, O[2] + Math.sin(a) * r];
    g(new THREE.OctahedronGeometry(0.02 + (i % 3) * 0.005), i % 2 ? P.soulWhite : P.soulTeal, at,
      { rotation: [i * 40, i * 25, 10] }, 1.5);
  }

  // rising flame wisps (stacked cones)
  const flame = (x: number, z: number, h: number, w: number) => {
    const layers: [number, number, string][] = [
      [1, 1, P.soulDeep], [0.8, 0.72, P.soulTeal], [0.55, 0.45, P.soulWhite],
    ];
    layers.forEach(([hs, ws, c], k) => {
      g(new THREE.ConeGeometry(w * ws, h * hs, 6), c, [x, O[1] + 0.1 + (h * hs) / 2 + k * 0.004, z], {}, 1.3);
    });
  };
  flame(O[0], O[2], 0.3, 0.06);
  flame(O[0] + 0.07, O[2] + 0.03, 0.2, 0.04);
  flame(O[0] - 0.07, O[2] - 0.03, 0.22, 0.04);
  flame(O[0] + 0.02, O[2] - 0.08, 0.15, 0.03);
  flame(O[0] - 0.03, O[2] + 0.08, 0.14, 0.03);

  // ghost spirits drifting along the blade
  const ghost = (x: number, y: number, z: number, s: number, rotZ: number) => {
    g(new THREE.SphereGeometry(0.04 * s, 6, 5), P.soulWhite, [x, y, z], {}, 1.4);
    g(new THREE.ConeGeometry(0.04 * s, 0.14 * s, 6), P.soulTeal,
      [x - Math.cos(rotZ) * 0.07 * s, y - 0.07 * s * Math.sin(rotZ), z],
      { rotation: [0, 0, 90 + (rotZ * 180) / Math.PI] }, 1.2);
    g(new THREE.SphereGeometry(0.008 * s, 4, 3), P.void, [x + 0.015 * s, y + 0.008 * s, z + 0.033 * s]);
    g(new THREE.SphereGeometry(0.008 * s, 4, 3), P.void, [x + 0.015 * s, y + 0.008 * s, z - 0.033 * s]);
  };
  ghost(0.5, 2.25, -0.02, 1.1, 0.3);
  ghost(0.85, 2.18, -0.01, 0.9, 0.0);
  ghost(1.15, 2.0, -0.02, 0.75, -0.4);

  // wisps trailing from blade tip
  const tip = M.bladeTip as number[];
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    g(new THREE.ConeGeometry(0.03 * (1 - t * 0.6), 0.14 * (1 - t * 0.3), 5),
      i % 2 ? P.soulWhite : P.soulTeal,
      [1.2 - t * 0.04 + 0.0 * tip[0], 2.0 - t * 0.17, tip[2] + Math.sin(t * 5) * 0.03],
      { rotation: [0, 0, 160 + t * 20] }, 1.3);
  }
  // wisps along the blade root
  for (let i = 0; i < 4; i++)
    g(new THREE.ConeGeometry(0.025, 0.12, 5), P.soulTeal,
      [0.18 + i * 0.07, 2.28 - i * 0.02, -0.02 + (i % 2) * 0.05], { rotation: [0, 0, -80] }, 1.2);

  // ember sparks
  for (let i = 0; i < 22; i++) {
    const x = -0.25 + R() * 1.5;
    const y = 1.95 + R() * 0.6;
    const z = (R() - 0.5) * 0.5;
    g(new THREE.OctahedronGeometry(0.008 + R() * 0.008), i % 3 ? P.ember : P.gold, [x, y, z],
      { rotation: [R() * 90, R() * 90, 0] }, 1.6);
  }
}
    return buildSoulFire;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "dragonboneSoulScythe" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
