import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, catmull, bezier } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  "name": "Dutch Windmill",
  "description": "A chunky, pastel Animal Crossing-style Dutch windmill: a tapering octagonal cream tower on a brick plinth, a teal shingled cap, four big cloth-and-lattice sails, a tail pole with winch, and a cosy porch door with flower boxes and flour sacks."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  plaster: "#f5ead0",
  plasterShade: "#e6d3ac",
  trimCream: "#fff8e6",
  brick: "#d2704f",
  brickDark: "#b0553c",
  stone: "#b9b2a2",
  stoneDark: "#8f897b",
  roofTeal: "#4f9d8f",
  roofTealLight: "#7cc4b0",
  roofTealDark: "#3a7a70",
  wood: "#9a6a3e",
  woodLight: "#c8935a",
  woodDark: "#6e4627",
  doorBlue: "#4a8fb0",
  sailCloth: "#fff3d6",
  sailRed: "#e6574a",
  glassBlue: "#8fd3e8",
  glowYellow: "#ffd873",
  ink: "#4a3426",
  metal: "#7a7f8c",
  gold: "#f2c14e",
  flowerPink: "#ff8fb1",
  leaf: "#6bbf59",
  sack: "#e9d8b0",
};
const M = {
  ground: [0, 0, 0] as [number, number, number],
  plinthTop: [0, 0.5, 0] as [number, number, number],
  towerTop: [0, 5, 0] as [number, number, number],
  capCurb: [0, 5.15, 0] as [number, number, number],
  capBack: [0, 5.5, -1.7] as [number, number, number],
  capFrontShaft: [0, 5.9, 2] as [number, number, number],
  hub: [0, 5.9, 2.1] as [number, number, number],
  sailPlane: [0, 5.9, 2.45] as [number, number, number],
  doorCenter: [1.56, 0.5, 1.56] as [number, number, number],
  doorHinge: [1.88, 0.5, 1.24] as [number, number, number],
  porchFloor: [2.19, 0.5, 2.19] as [number, number, number],
  porchRoof: [2.19, 2.5, 2.19] as [number, number, number],
  tailStake: [0, 0, -4.3] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // towerBody
  (() => {
function buildTowerBody({ b, J, P }: any) {
  const DEG = Math.PI / 180;
  const K = 1 / Math.cos(Math.PI / 8); // circumradius per apothem
  const apo = (y: number) => 2.2 - (y - 0.5) / 6; // tower apothem at height y
  const PHI = Math.atan(1 / 6); // wall lean
  const PHI_C = Math.atan(K / 6); // corner-edge lean

  // ---------- geometry collection: everything merges per colour, glow parts stay separate ----------
  const bag: Record<string, THREE.BufferGeometry[]> = {};
  const add = (c: string, g: THREE.BufferGeometry) => {
    (bag[c] ||= []).push(g);
    return g;
  };
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, seg = 8) => new THREE.CylinderGeometry(rt, rb, h, seg);
  const ball = (r: number, ws = 8, hs = 6) => new THREE.SphereGeometry(r, ws, hs);
  // octagonal frustum between y0..y1 with apothems a0 (bottom) and a1 (top), flat faces at the cardinals
  const fr = (c: string, y0: number, y1: number, a0: number, a1: number) =>
    add(c, cyl(a1 * K, a0 * K, y1 - y0).rotateY(Math.PI / 8).translate(0, (y0 + y1) / 2, 0));

  // place geometry in a frame facing azimuth az (0=+Z, 90=+X), at radius r, height y, local offset loc
  const xf = (g: THREE.BufferGeometry, az: number, y: number, r: number, loc: number[] = [0, 0, 0], tilt = 0) => {
    const qq = new THREE.Quaternion().setFromEuler(new THREE.Euler(-tilt, az * DEG, 0, "YXZ"));
    const pos = new THREE.Vector3(loc[0], loc[1], loc[2])
      .applyQuaternion(qq)
      .add(new THREE.Vector3(Math.sin(az * DEG) * r, y, Math.cos(az * DEG) * r));
    return g.applyMatrix4(new THREE.Matrix4().compose(pos, qq, new THREE.Vector3(1, 1, 1)));
  };
  // a frame lying on a tower face (leaning with the taper) at reference height y0
  const onFace = (az: number, y0: number) => (g: THREE.BufferGeometry, loc: number[], tilt = PHI) =>
    xf(g, az, y0, apo(y0), loc, tilt);

  const solo = (c: string, g: THREE.BufferGeometry, s: number) =>
    glow(b.part(g, c, { bone: J.mill, at: [0, 0, 0], flat: true }), s);

  // arched slab: width W, height H, depth d, facing local +Z
  const arch = (W: number, H: number, d: number) => {
    const rect = box(W, H - W / 2, d).translate(0, -W / 4, 0);
    const cap = new THREE.CylinderGeometry(W / 2, W / 2, d, 8, 1, false, Math.PI / 2, Math.PI)
      .rotateX(Math.PI / 2)
      .translate(0, H / 2 - W / 2, 0);
    return mergeGeometries([rect, cap])!;
  };

  // ---------- plinth ----------
  add(P.brick, cyl(2.5 * K, 2.5 * K, 0.42).rotateY(Math.PI / 8).translate(0, 0.21, 0));
  fr(P.brickDark, 0, 0.12, 2.56, 2.55); // base band
  fr(P.brickDark, 0.24, 0.28, 2.53, 2.53); // mid band
  fr(P.stoneDark, 0.38, 0.42, 2.55, 2.55); // shadow line under the course
  fr(P.stone, 0.42, 0.5, 2.6, 2.56); // stone cap course
  fr(P.stone, 0.5, 0.6, 2.28, 2.24); // stone footing at the tower foot
  fr(P.stoneDark, 0.6, 0.63, 2.22, 2.2);

  // brick joints on the plinth (two staggered rows per face)
  for (let k = 0; k < 8; k++) {
    const az = 45 * k;
    for (let row = 0; row < 2; row++) {
      const y = row === 0 ? 0.18 : 0.35;
      const h = row === 0 ? 0.1 : 0.12;
      for (let i = 0; i < 7; i++) {
        const lx = -0.9 + i * 0.3 + (row ? 0.15 : 0);
        if (Math.abs(lx) > 0.95) continue;
        add(P.brickDark, xf(box(0.025, h, 0.02), az, y, 2.5, [lx, 0, 0.005], 0));
      }
    }
  }
  // stone corner blocks
  for (let k = 0; k < 8; k++) {
    const az = 22.5 + 45 * k;
    add(P.stone, xf(box(0.34, 0.38, 0.2), az, 0.2, 2.5 * K - 0.03, [0, 0, 0], 0));
    add(P.stoneDark, xf(box(0.3, 0.04, 0.18), az, 0.41, 2.5 * K - 0.03, [0, 0, 0], 0));
  }
  // stone + brick patches
  const R = rng(5);
  for (const az of [0, 90, 135, 180, 225, 270, 315]) {
    for (let i = 0; i < 2; i++) {
      const lx = (i === 0 ? -1 : 1) * (0.25 + R() * 0.55);
      const stone = (az + i) % 2 === 0;
      const w = 0.3 + R() * 0.2;
      add(stone ? P.stone : P.brickDark, xf(box(w, 0.14, 0.045), az, 0.2, 2.5, [lx, 0.02, 0.015], 0));
      add(stone ? P.stoneDark : P.brick, xf(box(w * 0.4, 0.06, 0.05), az, 0.2, 2.5, [lx + w * 0.15, 0.0, 0.02], 0));
    }
  }
  // little hedges hugging the plinth
  const bush = (az: number, lx: number) => {
    const parts: [number, number[]][] = [
      [0.17, [0, 0.02, 0]],
      [0.13, [0.2, 0, 0.0]],
      [0.14, [-0.19, 0, 0.0]],
    ];
    for (const [r, o] of parts)
      add(P.leaf, xf(ball(r, 7, 5).scale(1.1, 0.85, 1), az, 0.14, 2.56, [lx + o[0], o[1], o[2]], 0));
    const dots: number[][] = [[0.06, 0.15, 0.08], [-0.1, 0.12, 0.1], [0.2, 0.1, 0.06], [-0.2, 0.1, 0.06], [0.02, 0.17, -0.02]];
    dots.forEach((d, i) =>
      add(i % 2 ? P.glowYellow : P.flowerPink, xf(ball(0.035, 5, 4), az, 0.14, 2.56, [lx + d[0], d[1], d[2]], 0)),
    );
  };
  bush(180, 0.7);
  bush(90, -0.75);
  bush(315, 0.6);

  // ---------- tapering tower ----------
  fr(P.plaster, 0.5, 5.0, 2.2, 1.45);
  // soft shade bands
  const shade = (y0: number, y1: number) => fr(P.plasterShade, y0, y1, apo(y0) + 0.014, apo(y1) + 0.014);
  shade(0.6, 0.98);
  shade(1.5, 1.66);
  shade(3.95, 4.12);
  // brick bands at 2.2 and 4.3, with a darker lip underneath
  for (const yb of [2.2, 4.3]) {
    fr(P.brick, yb - 0.06, yb + 0.06, apo(yb - 0.06) + 0.05, apo(yb + 0.06) + 0.05);
    fr(P.brickDark, yb - 0.1, yb - 0.06, apo(yb - 0.1) + 0.035, apo(yb - 0.06) + 0.035);
  }
  // quoins up all 8 corners
  for (let k = 0; k < 8; k++) {
    const az = 22.5 + 45 * k;
    let i = k;
    for (let y = 0.8; y < 4.8; y += 0.34, i++) {
      if (Math.abs(y - 2.2) < 0.2 || Math.abs(y - 4.3) < 0.2) continue;
      const wide = i % 2 === 0;
      add(wide ? P.brickDark : P.brick, xf(box(wide ? 0.32 : 0.24, 0.3, 0.17), az, y, apo(y) * K - 0.02, [0, 0, 0], PHI_C));
    }
  }

  // ---------- cornice, dentils, curb ----------
  fr(P.trimCream, 4.86, 5.0, 1.62, 1.62);
  fr(P.brick, 5.0, 5.15, 1.62, 1.55);
  fr(P.brickDark, 5.07, 5.09, 1.605, 1.6);
  for (let k = 0; k < 8; k++)
    for (let i = -2; i <= 2; i++)
      add(P.brickDark, xf(box(0.11, 0.09, 0.14), 45 * k, 4.81, 1.55, [i * 0.225, 0, 0], 0));

  // ---------- windows ----------
  const window_ = (az: number, y0: number, glass: string, gs: number) => {
    const W = 0.5;
    const H = 0.86;
    const F = onFace(az, y0);
    add(P.trimCream, F(arch(W + 0.22, H + 0.2, 0.1), [0, 0, 0.03]));
    solo(glass, F(arch(W, H, 0.05), [0, 0, 0.07]), gs);
    add(P.trimCream, F(box(0.04, H - 0.04, 0.03), [0, -0.02, 0.1]));
    add(P.trimCream, F(box(W, 0.04, 0.03), [0, -0.05, 0.1]));
    add(P.trimCream, F(box(W + 0.4, 0.1, 0.22), [0, -(H / 2 + 0.15), 0.1]));
    add(P.stoneDark, F(box(W + 0.3, 0.05, 0.16), [0, -(H / 2 + 0.22), 0.08]));
    add(P.brickDark, F(box(0.13, 0.12, 0.14), [0, H / 2 + 0.12, 0.04]));
    for (const s of [1, -1]) {
      const x = s * 0.48;
      add(P.wood, F(arch(0.22, H + 0.1, 0.05), [x, -0.02, 0.06]));
      add(P.woodLight, F(box(0.03, 0.55, 0.02), [x, -0.15, 0.095]));
      add(P.woodDark, F(box(0.2, 0.03, 0.02), [x, -0.12, 0.1]));
      add(P.woodDark, F(box(0.2, 0.03, 0.02), [x, -0.34, 0.1]));
      if (s > 0) {
        add(P.ink, F(ball(0.03, 6, 4).scale(1, 1, 0.4), [x + 0.022, 0.22, 0.09]));
        add(P.ink, F(ball(0.03, 6, 4).scale(1, 1, 0.4), [x - 0.022, 0.22, 0.09]));
        add(P.ink, F(box(0.052, 0.052, 0.02).rotateZ(Math.PI / 4), [x, 0.2, 0.09]));
      } else {
        add(P.ink, F(box(0.075, 0.075, 0.02).rotateZ(Math.PI / 4), [x, 0.22, 0.09]));
      }
    }
  };
  window_(90, 3.0, P.glowYellow, 0.9);
  window_(270, 3.0, P.glassBlue, 1);
  window_(135, 3.0, P.glassBlue, 1);
  window_(225, 3.0, P.glowYellow, 0.9);
  window_(315, 2.95, P.glassBlue, 1);

  // round window at 315
  {
    const F = onFace(315, 3.97);
    add(P.brickDark, F(cyl(0.34, 0.34, 0.06, 12).rotateX(Math.PI / 2), [0, 0, 0.0]));
    add(P.trimCream, F(cyl(0.3, 0.3, 0.1, 12).rotateX(Math.PI / 2), [0, 0, 0.03]));
    solo(P.glowYellow, F(cyl(0.2, 0.2, 0.05, 12).rotateX(Math.PI / 2), [0, 0, 0.07]), 0.9);
    add(P.trimCream, F(box(0.4, 0.035, 0.03), [0, 0, 0.1]));
    add(P.trimCream, F(box(0.035, 0.4, 0.03), [0, 0, 0.1]));
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      add(P.gold, F(ball(0.018, 5, 4), [Math.cos(a) * 0.255, Math.sin(a) * 0.255, 0.085]));
    }
  }

  // ---------- plaster patch on the plain front face ----------
  {
    const F = onFace(0, 2.8);
    add(P.plasterShade, F(box(0.86, 0.66, 0.02), [0, 0, 0.008]));
    add(P.brick, F(box(0.68, 0.48, 0.025), [0, 0, 0.02]));
    for (const ly of [-0.16, 0, 0.16]) add(P.brickDark, F(box(0.68, 0.02, 0.012), [0, ly, 0.035]));
    for (let r = 0; r < 4; r++)
      for (let i = 0; i < 3; i++) {
        const ly = -0.24 + r * 0.16 + 0.08 - 0.16;
        if (ly < -0.24 || ly > 0.24) continue;
        add(P.brickDark, F(box(0.02, 0.14, 0.012), [-0.22 + i * 0.22 + (r % 2 ? 0.11 : 0), ly + 0.08, 0.035]));
      }
    add(P.plaster, F(box(0.14, 0.09, 0.03), [0.37, 0.27, 0.025]));
    add(P.plaster, F(box(0.1, 0.07, 0.03), [-0.4, -0.3, 0.025]));
  }

  // ---------- back face: loft hatch, hoisting beam, pulley, rope, hook ----------
  {
    const F = onFace(180, 2.75);
    add(P.trimCream, F(arch(0.8, 0.98, 0.1), [0, 0, 0.03]));
    add(P.wood, F(arch(0.6, 0.82, 0.05), [0, -0.02, 0.09]));
    for (const x of [-0.15, 0.15]) add(P.woodDark, F(box(0.014, 0.66, 0.02), [x, -0.08, 0.12]));
    for (const ly of [-0.2, 0.1]) {
      add(P.woodDark, F(box(0.6, 0.07, 0.02), [0, ly, 0.125]));
      for (const x of [-0.25, 0.25]) add(P.gold, F(ball(0.02, 5, 4), [x, ly, 0.14]));
    }
    add(P.woodDark, F(box(0.09, 0.09, 0.02), [0.2, -0.1, 0.13]));
    add(P.gold, F(ball(0.035, 6, 4), [0.2, -0.1, 0.15]));
    add(P.trimCream, F(box(1.0, 0.08, 0.2), [0, -0.54, 0.1]));
    add(P.stoneDark, F(box(0.88, 0.05, 0.16), [0, -0.6, 0.08]));

    // hoisting beam (horizontal) at y 4.05
    const yb = 4.05;
    const T = (g: THREE.BufferGeometry, loc: number[]) => xf(g, 180, yb, apo(yb), loc, 0);
    add(P.woodLight, T(box(0.14, 0.14, 1.0), [0, 0, 0.45]));
    add(P.woodDark, T(box(0.18, 0.18, 0.06), [0, 0, 0.96]));
    add(P.metal, T(box(0.3, 0.3, 0.04), [0, -0.05, 0.0]));
    add(P.wood, T(box(0.08, 0.08, 0.85).rotateX(-0.6), [0, -0.31, 0.35]));
    for (const x of [-0.045, 0.045]) add(P.metal, T(box(0.025, 0.16, 0.025), [x, -0.14, 0.8]));
    add(P.metal, T(cyl(0.09, 0.09, 0.05, 10).rotateZ(Math.PI / 2), [0, -0.22, 0.8]));
    add(P.gold, T(cyl(0.03, 0.03, 0.08, 6).rotateZ(Math.PI / 2), [0, -0.22, 0.8]));
    add(P.sack, T(cyl(0.018, 0.018, 0.9, 5), [0, -0.67, 0.89]));
    add(P.sack, T(cyl(0.018, 0.018, 0.5, 5).rotateX(0.2), [0, -0.12, 0.62]));
    add(P.metal, T(box(0.08, 0.07, 0.08), [0, -1.14, 0.89]));
    add(P.metal, T(new THREE.TorusGeometry(0.055, 0.014, 5, 10, Math.PI * 1.5).rotateZ(Math.PI * 0.75), [0, -1.24, 0.89]));
  }

  // ---------- lantern on a bracket at face 270 ----------
  {
    const y = 1.95;
    const T = (g: THREE.BufferGeometry, loc: number[]) => xf(g, 270, y, apo(y), loc, 0);
    add(P.metal, T(box(0.16, 0.22, 0.04), [0, -0.03, 0.0]));
    add(P.metal, T(box(0.05, 0.05, 0.6), [0, 0, 0.28]));
    add(P.metal, T(box(0.04, 0.04, 0.52).rotateX(-0.69), [0, -0.19, 0.2]));
    add(P.gold, T(ball(0.035, 6, 4), [0, 0, 0.58]));
    for (const dy of [0.06, -0.12]) add(P.gold, T(ball(0.016, 5, 4), [0, dy, 0.02]));
    add(P.metal, T(cyl(0.01, 0.01, 0.1, 5), [0, -0.07, 0.52]));
    add(P.metal, T(new THREE.ConeGeometry(0.1, 0.1, 4).rotateY(Math.PI / 4), [0, -0.19, 0.52]));
    add(P.gold, T(ball(0.025, 5, 4), [0, -0.25, 0.52]));
    add(P.metal, T(box(0.13, 0.025, 0.13), [0, -0.235, 0.52]));
    solo(P.glowYellow, T(box(0.11, 0.15, 0.11), [0, -0.32, 0.52]), 1.4);
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) add(P.metal, T(box(0.016, 0.16, 0.016), [sx * 0.058, -0.32, 0.52 + sz * 0.058]));
    add(P.metal, T(box(0.13, 0.03, 0.13), [0, -0.41, 0.52]));
    add(P.gold, T(ball(0.022, 5, 4), [0, -0.44, 0.52]));
  }

  // ---------- flush merged geometry ----------
  for (const color of Object.keys(bag)) {
    const merged = mergeGeometries(bag[color]);
    if (merged) b.part(merged, color, { bone: J.mill, at: [0, 0, 0], flat: true });
  }
}
    return buildTowerBody;
  })(),
  // capRoof
  (() => {
function buildCapRoof({ b, J, P, M }: Ctx) {
  const bone = J.cap;
  const rand = rng(11);
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------------------------------------------------------------- dome shape
  const Y0 = 5.15; // eaves height
  const Z0 = -1.85; // tail end
  const Z1 = 2.0; // snout tip
  const cl = (x: number) => Math.min(1, Math.max(0, x));
  // half width / height of the boat section at z
  const W = (z: number) => {
    if (z > 0.4) return 1.75 - 0.95 * Math.pow(cl((z - 0.4) / 1.6), 1.5);
    if (z < -0.5) {
      const s = cl((-0.5 - z) / 1.35);
      return 1.75 - 1.1 * s * s;
    }
    return 1.75;
  };
  const H = (z: number) => {
    if (z > 0.4) return 1.8 - 0.35 * cl((z - 0.4) / 1.6);
    if (z < -0.5) return 1.8 - 0.8 * Math.pow(cl((-0.5 - z) / 1.35), 1.5);
    return 1.8;
  };
  const pt = (z: number, ph: number) => V(W(z) * Math.cos(ph), Y0 + H(z) * Math.sin(ph), z);
  const surf = (z: number, ph: number) => {
    const w = W(z);
    const h = H(z);
    const e = 0.01;
    const p = pt(z, ph);
    const t = V(
      (W(z + e) - W(z - e)) * Math.cos(ph),
      (H(z + e) - H(z - e)) * Math.sin(ph),
      2 * e,
    ).normalize();
    const s = V(-w * Math.sin(ph), h * Math.cos(ph), 0).normalize();
    const n = new THREE.Vector3().crossVectors(t, s).normalize();
    if (n.dot(V(p.x, p.y - Y0, 0)) < 0) n.negate();
    return { p, t, s, n };
  };

  const merged = (geos: THREE.BufferGeometry[], color: string, name: string) => {
    if (!geos.length) return;
    const g = mergeGeometries(geos);
    if (g) b.part(g, color, { bone, at: [0, 0, 0], flat: true, name });
  };
  const ball = (r: number, x: number, y: number, z: number) =>
    new THREE.SphereGeometry(r, 6, 4).translate(x, y, z);

  // ---------------------------------------------------------------- dome mesh
  const NZ = 16;
  const NP = 14;
  const grid: THREE.Vector3[][] = [];
  for (let i = 0; i <= NZ; i++) {
    const z = Z0 + ((Z1 - Z0) * i) / NZ;
    const row: THREE.Vector3[] = [];
    for (let j = 0; j <= NP; j++) row.push(pt(z, (Math.PI * j) / NP));
    grid.push(row);
  }
  const pos: number[] = [];
  const ref = V(0, 5.5, 0.05);
  const tri = (a: THREE.Vector3, bb: THREE.Vector3, c: THREE.Vector3) => {
    const n = new THREE.Vector3().subVectors(bb, a).cross(new THREE.Vector3().subVectors(c, a));
    const cen = a.clone().add(bb).add(c).multiplyScalar(1 / 3).sub(ref);
    if (n.dot(cen) < 0) [bb, c] = [c, bb];
    pos.push(a.x, a.y, a.z, bb.x, bb.y, bb.z, c.x, c.y, c.z);
  };
  for (let i = 0; i < NZ; i++) {
    for (let j = 0; j < NP; j++) {
      const a = grid[i][j];
      const bq = grid[i][j + 1];
      const c = grid[i + 1][j];
      const d = grid[i + 1][j + 1];
      tri(a, bq, c);
      tri(bq, d, c);
    }
    tri(grid[i][0], grid[i][NP], grid[i + 1][0]);
    tri(grid[i][NP], grid[i + 1][NP], grid[i + 1][0]);
  }
  for (const [idx, zc] of [[NZ, Z1], [0, Z0]] as [number, number][]) {
    const c = V(0, Y0, zc);
    for (let j = 0; j < NP; j++) tri(c, grid[idx][j], grid[idx][j + 1]);
  }
  const domeGeo = new THREE.BufferGeometry();
  domeGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  domeGeo.computeVertexNormals();
  b.part(domeGeo, P.roofTealDark, { bone, at: [0, 0, 0], flat: true, name: "dome" });

  // ---------------------------------------------------------------- cream ring on the curb
  const ct = Math.cos(Math.PI / 8);
  const ringGeo = new THREE.CylinderGeometry(1.7 / ct, 1.76 / ct, 0.12, 8, 1).rotateY(Math.PI / 8);
  b.part(ringGeo, P.trimCream, { bone, at: [0, Y0 + 0.06, 0], flat: true, name: "curbRing" });
  const ring2 = new THREE.CylinderGeometry(1.64 / ct, 1.64 / ct, 0.06, 8, 1).rotateY(Math.PI / 8);
  b.part(ring2, P.plasterShade, { bone, at: [0, Y0 + 0.01, 0], flat: true, name: "curbRingShade" });

  // ---------------------------------------------------------------- eaves rim
  {
    const pts: THREE.Vector3[] = [];
    const y = Y0 + 0.03;
    for (let i = 0; i <= NZ; i++) {
      const z = Z0 + ((Z1 - Z0) * i) / NZ;
      pts.push(V(W(z) + 0.02, y, z));
    }
    pts.push(V(0.45, y, Z1 + 0.02), V(0, y, Z1 + 0.03), V(-0.45, y, Z1 + 0.02));
    for (let i = NZ; i >= 0; i--) {
      const z = Z0 + ((Z1 - Z0) * i) / NZ;
      pts.push(V(-(W(z) + 0.02), y, z));
    }
    pts.push(V(-0.35, y, Z0 - 0.02), V(0, y, Z0 - 0.03), V(0.35, y, Z0 - 0.02));
    b.sweep(catmull(pts, { closed: true }), 0.05, { color: P.roofTealLight, bone, sides: 6 });
  }

  // ---------------------------------------------------------------- shingles
  const portPh = 0.62;
  const portZ = -0.05;
  const portCentres = [surf(portZ, portPh).p, surf(portZ, Math.PI - portPh).p];
  const plateGeo = (len: number, depth: number, thick: number, tilt: number) => {
    const g = new THREE.CylinderGeometry(1, 1, thick, 8, 1);
    g.scale(len / 2, 1, depth / 2);
    g.translate(0, 0, depth / 2);
    g.rotateX(-tilt);
    return g;
  };
  const buckets: THREE.BufferGeometry[][] = [[], [], []];
  const NC = 7;
  const dph = Math.PI / 2 / NC;
  for (let side = 0; side < 2; side++) {
    for (let k = 0; k < NC; k++) {
      const phc = (k + 0.5) * dph;
      const phUp = phc + dph / 2;
      const ph = side === 0 ? phUp : Math.PI - phUp;
      const sgn = side === 0 ? -1 : 1;
      let j = 0;
      for (let z = -1.55 + (k % 2) * 0.28; z <= 1.65; z += 0.56, j++) {
        const zz = z + (rand() - 0.5) * 0.03;
        const f = surf(zz, ph);
        if (portCentres.some((c) => c.distanceTo(f.p) < 0.55)) continue;
        const arc = dph * Math.hypot(W(zz) * Math.sin(phc), H(zz) * Math.cos(phc));
        const down = f.s.clone().multiplyScalar(sgn);
        down.addScaledVector(f.n, -down.dot(f.n)).normalize();
        const xd = new THREE.Vector3().crossVectors(f.n, down);
        const m = new THREE.Matrix4().makeBasis(xd, f.n, down);
        m.setPosition(f.p.clone().addScaledVector(f.n, 0.004));
        const g = plateGeo(0.58, arc * 1.55, 0.04, 0.12 + rand() * 0.04);
        g.applyMatrix4(m);
        buckets[[0, 1, 0, 2][(j + 2 * k + side) % 4]].push(g);
      }
    }
  }
  merged(buckets[0], P.roofTeal, "shinglesTeal");
  merged(buckets[1], P.roofTealLight, "shinglesLight");
  merged(buckets[2], P.roofTealDark, "shinglesDark");

  // ---------------------------------------------------------------- cream ribs over the shingles
  for (const z of [-1.1, 1.0]) {
    const pts: THREE.Vector3[] = [];
    for (let j = 0; j <= 16; j++) {
      const f = surf(z, (Math.PI * j) / 16);
      pts.push(f.p.clone().addScaledVector(f.n, 0.08));
    }
    b.sweep(catmull(pts), 0.04, { color: P.trimCream, bone, sides: 6 });
  }

  // ---------------------------------------------------------------- ridge beam, studs, finials
  const ridgeY = (z: number) => Y0 + H(z) + 0.02;
  {
    const zs = [-1.7, -1.2, -0.6, 0, 0.6, 1.2, 1.6, 1.9];
    b.sweep(catmull(zs.map((z) => V(0, ridgeY(z), z))), (_t: number) => [0.1, 0.05], {
      color: P.trimCream,
      bone,
      section: "box",
      caps: "flat",
    });
    const studs: THREE.BufferGeometry[] = [];
    for (let z = -1.4; z <= 1.6; z += 0.5) studs.push(ball(0.035, 0, ridgeY(z) + 0.055, z));
    merged(studs, P.gold, "ridgeStuds");
  }
  // front gold finial ball with crossed cream gable horns
  b.part(new THREE.SphereGeometry(0.1, 8, 6), P.gold, { bone, at: [0, ridgeY(1.9) + 0.06, 1.9], name: "finialBall" });
  for (const s of [1, -1]) {
    const base = V(s * 0.1, ridgeY(1.9) - 0.04, 1.97);
    const ang = -s * 30;
    const dir = V(-Math.sin((ang * Math.PI) / 180), Math.cos((ang * Math.PI) / 180), 0);
    b.part(new THREE.BoxGeometry(0.06, 0.5, 0.05), P.trimCream, {
      bone,
      at: base.clone().addScaledVector(dir, 0.22),
      rotation: [0, 0, ang],
      name: "gableHorn",
    });
    b.part(new THREE.SphereGeometry(0.04, 6, 4), P.gold, {
      bone,
      at: base.clone().addScaledVector(dir, 0.48),
      name: "gableHornTip",
    });
  }
  b.part(new THREE.SphereGeometry(0.08, 8, 6), P.trimCream, { bone, at: [0, ridgeY(-1.75) + 0.04, -1.75], name: "tailFinial" });

  // ---------------------------------------------------------------- weather vane
  {
    const vz = -0.2;
    const topY = ridgeY(vz) + 0.05;
    b.rod(V(0, topY - 0.02, vz), V(0, topY + 0.1, vz), 0.016, P.metal, { bone });
    const arrow: [number, number][] = [
      [0, 0.28],
      [0.08, 0.12],
      [0.025, 0.12],
      [0.025, -0.18],
      [0.08, -0.3],
      [0, -0.22],
      [-0.08, -0.3],
      [-0.025, -0.18],
      [-0.025, 0.12],
      [-0.08, 0.12],
    ];
    b.extrude(arrow, { at: V(0, topY + 0.07, vz), x: [1, 0, 0], y: [0, 0, 1], thickness: 0.018, color: P.metal, bone });
    b.part(new THREE.SphereGeometry(0.045, 8, 6), P.gold, { bone, at: [0, topY + 0.115, vz], name: "vaneBall" });
    const tips: THREE.BufferGeometry[] = [];
    b.rod(V(-0.15, topY + 0.03, vz), V(0.15, topY + 0.03, vz), 0.008, P.metal, { bone });
    b.rod(V(0, topY + 0.03, vz - 0.15), V(0, topY + 0.03, vz + 0.15), 0.008, P.metal, { bone });
    tips.push(ball(0.02, 0.15, topY + 0.03, vz), ball(0.02, -0.15, topY + 0.03, vz));
    tips.push(ball(0.02, 0, topY + 0.03, vz - 0.15), ball(0.02, 0, topY + 0.03, vz + 0.15));
    merged(tips, P.gold, "vaneTips");
  }

  // ---------------------------------------------------------------- front face-plate and shaft bearing
  {
    const fo: [number, number][] = [];
    for (let j = 0; j <= 12; j++) {
      const ph = (Math.PI * j) / 12;
      fo.push([0.84 * Math.cos(ph), 1.48 * Math.sin(ph)]);
    }
    b.extrude(fo, { at: V(0, Y0, 2.0), x: [1, 0, 0], y: [0, 1, 0], thickness: 0.12, bevel: 0.02, color: P.wood, bone });
    for (const x of [-0.6, -0.3, 0.3, 0.6]) {
      const h = 1.48 * Math.sqrt(1 - (x / 0.84) ** 2) - 0.06;
      b.part(new THREE.BoxGeometry(0.022, h, 0.012), P.woodDark, { bone, at: [x, Y0 + 0.02 + h / 2, 2.066], name: "plank" });
    }
    const hubY = 5.9;
    b.part(new THREE.TorusGeometry(0.31, 0.04, 5, 16), P.woodDark, { bone, at: [0, hubY, 2.07], name: "bearingCollar" });
    b.part(new THREE.CircleGeometry(0.17, 14), P.ink, { bone, at: [0, hubY, 2.068], dir: [0, 0, 1], axis: "z", name: "bearingHole" });
    b.part(new THREE.TorusGeometry(0.21, 0.045, 5, 16), P.metal, { bone, at: [0, hubY, 2.075], name: "bearingRim" });
    const bolts: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      bolts.push(ball(0.032, 0.4 * Math.cos(a), hubY + 0.4 * Math.sin(a), 2.075));
    }
    merged(bolts, P.gold, "bearingBolts");
    // nameplate
    b.part(new THREE.BoxGeometry(0.5, 0.14, 0.014), P.trimCream, { bone, at: [0, 5.36, 2.068], name: "plaque" });
    b.part(new THREE.BoxGeometry(0.34, 0.025, 0.016), P.ink, { bone, at: [0, 5.38, 2.074], name: "plaqueText" });
    b.part(new THREE.BoxGeometry(0.22, 0.02, 0.016), P.ink, { bone, at: [0, 5.33, 2.074], name: "plaqueText" });
  }

  // ---------------------------------------------------------------- bargeboard along the front gable
  {
    const pts: THREE.Vector3[] = [];
    const pearls: THREE.BufferGeometry[] = [];
    for (let j = 0; j <= 16; j++) {
      const f = surf(1.93, (Math.PI * j) / 16);
      const p = f.p.clone().addScaledVector(f.n, 0.05);
      pts.push(p);
      if (j % 2 === 0 && j > 0 && j < 16) {
        const q = f.p.clone().addScaledVector(f.n, 0.1);
        pearls.push(ball(0.07, q.x, q.y, 2.02));
      }
    }
    b.sweep(catmull(pts), 0.065, { color: P.trimCream, bone, sides: 6 });
    merged(pearls, P.flowerPink, "bargePearls");
  }

  // ---------------------------------------------------------------- porthole windows
  for (const s of [1, -1]) {
    const ph = s > 0 ? portPh : Math.PI - portPh;
    const f = surf(portZ, ph);
    const at = (d: number) => f.p.clone().addScaledVector(f.n, d);
    b.part(new THREE.CylinderGeometry(0.37, 0.4, 0.12, 10), P.roofTealDark, { bone, at: at(0.02), dir: f.n, name: "portBoss" });
    b.part(new THREE.TorusGeometry(0.29, 0.065, 6, 14), P.trimCream, { bone, at: at(0.1), dir: f.n, axis: "z", name: "portFrame" });
    glow(
      b.part(new THREE.CircleGeometry(0.26, 14), P.glowYellow, { bone, at: at(0.095), dir: f.n, axis: "z", name: "portGlass" }),
      1,
    );
    b.part(new THREE.BoxGeometry(0.54, 0.04, 0.015), P.trimCream, { bone, at: at(0.108), dir: f.n, axis: "z", name: "portMuntin" });
    b.part(new THREE.BoxGeometry(0.04, 0.54, 0.015), P.trimCream, { bone, at: at(0.108), dir: f.n, axis: "z", name: "portMuntin" });
    // small sill pegs
    const pegs: THREE.BufferGeometry[] = [];
    for (let i = -1; i <= 1; i += 2) {
      const q = at(0.12).addScaledVector(f.t, i * 0.38);
      pegs.push(ball(0.03, q.x, q.y, q.z));
    }
    merged(pegs, P.gold, "portPegs");
  }

  // ---------------------------------------------------------------- tail end: back plate and brackets
  {
    const bo: [number, number][] = [];
    for (let j = 0; j <= 10; j++) {
      const ph = (Math.PI * j) / 10;
      bo.push([0.66 * Math.cos(ph), 1.0 * Math.sin(ph)]);
    }
    b.extrude(bo, { at: V(0, Y0, Z0 - 0.01), x: [1, 0, 0], y: [0, 1, 0], thickness: 0.07, bevel: 0.015, color: P.woodLight, bone });
    for (const x of [-0.3, 0.3]) {
      b.part(new THREE.BoxGeometry(0.025, 0.8, 0.012), P.woodDark, { bone, at: [x * 0.0 + x * 1.0 + (x > 0 ? 0.2 : -0.2) * 0, 5.58, Z0 - 0.052], name: "backPlank" });
    }
    const bolts: THREE.BufferGeometry[] = [];
    for (const s of [1, -1]) {
      b.part(new THREE.BoxGeometry(0.16, 0.95, 0.06), P.wood, { bone, at: [s * 0.3, 5.5, -1.915], name: "bracketPost" });
      b.part(new THREE.BoxGeometry(0.24, 0.1, 0.2), P.woodDark, { bone, at: [s * 0.3, 5.0, -1.9], name: "bracketSaddle" });
      b.part(new THREE.BoxGeometry(0.2, 0.08, 0.1), P.woodDark, { bone, at: [s * 0.3, 5.95, -1.9], name: "bracketCap" });
      bolts.push(ball(0.03, s * 0.3, 5.75, -1.95), ball(0.03, s * 0.3, 5.25, -1.95));
    }
    b.part(new THREE.BoxGeometry(0.78, 0.1, 0.04), P.woodDark, { bone, at: [0, 5.5, -1.94], name: "bracketStrap" });
    bolts.push(ball(0.03, 0, 5.5, -1.97));
    merged(bolts, P.gold, "bracketBolts");
  }

  // ---------------------------------------------------------------- leaf-shaped clay accents
  {
    const LEAF: [number, number, "sharp"?][] = [
      [0, 0, "sharp"],
      [0.085, 0.12],
      [0.075, 0.27],
      [0, 0.4, "sharp"],
      [-0.075, 0.27],
      [-0.085, 0.12],
    ];
    const sprig = (z: number, ph: number, up: number) => {
      const f = surf(z, ph);
      for (let i = 0; i < 3; i++) {
        const a = up * (Math.PI / 2) + (i - 1) * 0.6;
        const yd = f.t.clone().multiplyScalar(Math.cos(a)).addScaledVector(f.s, Math.sin(a));
        yd.addScaledVector(f.n, -yd.dot(f.n)).normalize();
        const xd = new THREE.Vector3().crossVectors(yd, f.n);
        b.extrude(LEAF as any, {
          at: f.p.clone().addScaledVector(f.n, 0.075),
          x: xd,
          y: yd,
          thickness: 0.035,
          smoothing: 1,
          color: P.leaf,
          bone,
        });
      }
      b.part(new THREE.SphereGeometry(0.055, 6, 4), P.flowerPink, { bone, at: f.p.clone().addScaledVector(f.n, 0.11), name: "clayBud" });
      b.part(new THREE.SphereGeometry(0.025, 5, 4), P.gold, { bone, at: f.p.clone().addScaledVector(f.n, 0.15), name: "clayBudCore" });
    };
    // up-slope is +s on the +x side, -s on the -x side
    sprig(0.55, 1.05, 1);
    sprig(-0.65, 1.2, 1);
    sprig(0.55, Math.PI - 1.05, -1);
    sprig(-0.65, Math.PI - 1.2, -1);
  }
}
    return buildCapRoof;
  })(),
  // sails
  (() => {
function buildSails({ b, J, P, M }: Ctx) {
  const bone = J.rotor;
  const HUB_X = M.hub[0];
  const HUB_Y = M.hub[1];
  const PLANE_Z = M.sailPlane[2];
  const DEG = Math.PI / 180;
  const R_TIP = 4.6;
  const R_START = 1.0;
  const Z_AXIS = new THREE.Vector3(0, 0, 1);
  const Y_AXIS = new THREE.Vector3(0, 1, 0);

  // ---------- hub, shaft and boss (all on the rotor joint, axis +Z) ----------
  const cyl = (r: number, z0: number, z1: number, color: string, sides = 12, r1 = r) =>
    b.part(new THREE.CylinderGeometry(r1, r, z1 - z0, sides), color, {
      bone,
      at: [HUB_X, HUB_Y, (z0 + z1) / 2],
      dir: [0, 0, 1],
    });

  // shaft: from inside the cap nose out to the boss tip
  cyl(0.15, 1.65, 2.75, P.wood, 8);
  // metal collar where the shaft leaves the cap nose
  cyl(0.22, 2.03, 2.11, P.metal, 10);
  // back flange, drum, band, dome, gold nose
  cyl(0.52, 2.1, 2.28, P.woodDark, 12);
  cyl(0.42, 2.28, 2.6, P.wood, 12);
  cyl(0.445, 2.415, 2.465, P.metal, 12);
  b.part(new THREE.SphereGeometry(0.42, 12, 6), P.woodLight, {
    bone,
    at: [HUB_X, HUB_Y, 2.6],
    scale: [1, 1, 0.35],
  });
  b.part(new THREE.SphereGeometry(0.17, 8, 6), P.gold, {
    bone,
    at: [HUB_X, HUB_Y, 2.66],
    scale: [1, 1, 0.5],
  });
  // rivet ring on the flange
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    b.part(new THREE.SphereGeometry(0.036, 6, 4), P.gold, {
      bone,
      at: [HUB_X + Math.cos(a) * 0.47, HUB_Y + Math.sin(a) * 0.47, 2.285],
    });
  }

  // ---------- one sail, built once and rotated ----------
  function buildSail(thetaDeg: number, withPennant: boolean) {
    const th = thetaDeg * DEG;
    const phi = (thetaDeg - 90) * DEG;
    const dir = new THREE.Vector2(Math.cos(th), Math.sin(th));
    const xa = new THREE.Vector2(Math.cos(phi), Math.sin(phi));
    const qz = new THREE.Quaternion().setFromAxisAngle(Z_AXIS, phi);
    const pos = (r: number, v: number, w: number) =>
      new THREE.Vector3(HUB_X + dir.x * r + xa.x * v, HUB_Y + dir.y * r + xa.y * v, PLANE_Z + w);
    // box: x across (v), y along the arm (r), z depth
    const sbox = (
      across: number,
      along: number,
      depth: number,
      color: string,
      r: number,
      v: number,
      w: number,
      tiltDeg = 0,
    ) => {
      const q = qz.clone();
      if (tiltDeg) q.multiply(new THREE.Quaternion().setFromAxisAngle(Y_AXIS, tiltDeg * DEG));
      return b.part(new THREE.BoxGeometry(across, along, depth), color, { bone, at: pos(r, v, w), quat: q });
    };

    // thick stock along the axis, with a claw block at its root
    sbox(0.15, 4.5, 0.16, P.woodLight, 2.55, 0, 0);
    sbox(0.36, 0.5, 0.22, P.woodDark, 0.75, 0, 0);
    // side rails
    for (const s of [-1, 1]) sbox(0.08, R_TIP - R_START, 0.12, P.woodDark, (R_TIP + R_START) / 2, s * 0.55, 0);
    // leading half slat
    sbox(0.04, 3.4, 0.07, P.woodDark, 2.7, -0.28, 0);

    // cross bars every 0.4 m
    const barRs: number[] = [];
    for (let i = 0; i < 9; i++) barRs.push(R_START + 0.4 * i);
    for (const r of barRs) sbox(1.14, 0.07, 0.08, P.wood, r, 0, 0);

    // cloth panels on the trailing half, two boards per lattice cell, slightly angled
    for (let i = 0; i < 8; i++) {
      const r = R_START + 0.2 + 0.4 * i;
      const col = i % 2 === 0 ? P.sailCloth : P.plaster;
      sbox(0.21, 0.3, 0.03, col, r, 0.17, 0.0, 7);
      sbox(0.21, 0.3, 0.03, col, r, 0.405, 0.0, 7);
    }
    // rolled cloth edge along the rail
    b.part(new THREE.CylinderGeometry(0.03, 0.03, 3.3, 6), P.trimCream, {
      bone,
      at: pos(2.7, 0.5, 0.03),
      quat: qz,
    });
    // red stripe down the cloth
    sbox(0.055, 3.3, 0.02, P.sailRed, 2.7, 0.29, 0.03);

    // red tip cap and wood finial
    sbox(1.18, 0.2, 0.17, P.sailRed, R_TIP - 0.1, 0, 0);
    sbox(0.9, 0.04, 0.19, P.trimCream, R_TIP - 0.22, 0, 0);
    b.part(new THREE.ConeGeometry(0.09, 0.18, 8), P.woodLight, {
      bone,
      at: pos(R_TIP + 0.09, 0, 0),
      quat: qz,
    });

    // gold bolts at the bar crossings and on the claw (merged into one part)
    const bolts: THREE.BufferGeometry[] = [];
    const addBolt = (r: number, v: number, w: number) => {
      const p = pos(r, v, w);
      bolts.push(new THREE.SphereGeometry(0.038, 6, 4).translate(p.x, p.y, p.z));
    };
    for (const r of barRs) {
      addBolt(r, 0, 0.09);
      addBolt(r, -0.55, 0.065);
      addBolt(r, 0.55, 0.065);
    }
    addBolt(0.62, 0, 0.12);
    addBolt(0.88, 0, 0.12);
    const merged = mergeGeometries(bolts);
    if (merged) b.part(merged, P.gold, { bone, at: [0, 0, 0] });

    if (withPennant) {
      const mx = HUB_X - 0.5;
      const my = HUB_Y + R_TIP;
      b.part(new THREE.BoxGeometry(0.035, 0.2, 0.035), P.woodDark, { bone, at: [mx, my + 0.09, PLANE_Z] });
      b.extrude(
        [
          [0, 0],
          [0.42, 0.03],
          [0.32, 0.08],
          [0.42, 0.13],
          [0, 0.16],
        ],
        { at: [mx, my + 0.02, PLANE_Z], x: [-1, 0, 0], y: [0, 1, 0], thickness: 0.015, color: P.trimCream, bone },
      );
      b.part(new THREE.BoxGeometry(0.05, 0.15, 0.022), P.sailRed, { bone, at: [mx - 0.1, my + 0.1, PLANE_Z] });
    }
  }

  buildSail(90, true); // up
  buildSail(0, false); // left (+X)
  buildSail(270, false); // down
  buildSail(180, false); // right (-X)
}
    return buildSails;
  })(),
  // tailPole
  (() => {
function buildTailPole({ b, J, P, M }: Ctx) {
  const bone = J.cap;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const GOLD = P.gold;
  const LEAF2 = "#8ed36f";
  const X = V(1, 0, 0);

  // ---- pole geometry: from capBack down to a footing at the tail stake ----
  const A = V(M.capBack[0], M.capBack[1], M.capBack[2]);
  const B = V(M.tailStake[0], 0.22, M.tailStake[2]);
  const u = B.clone().sub(A).normalize();
  const nTop = V(0, -u.z, u.y); // upper (back/up) side of the pole
  const pole = (t: number) => A.clone().lerp(B, t);
  const rAt = (t: number) => 0.17 - 0.04 * t;
  const pt = (t: number, side = 0, up = 0) =>
    pole(t).addScaledVector(X, side).addScaledVector(nTop, up);

  // ---- small helpers ----
  const rod = (a: THREE.Vector3, c: THREE.Vector3, r: number, color: string, sides = 6) =>
    b.rod(a, c, r, color, { bone, sides });
  const cyl = (at: THREE.Vector3, dir: number[] | THREE.Vector3, r: number, len: number, color: string, seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { bone, at, dir, flat: true });
  const tor = (
    at: THREE.Vector3,
    dir: number[] | THREE.Vector3,
    R: number,
    tube: number,
    color: string,
    seg: [number, number] = [5, 14],
  ) => b.part(new THREE.TorusGeometry(R, tube, seg[0], seg[1]), color, { bone, at, dir, axis: "z", flat: true });
  const ball = (at: THREE.Vector3, r: number, color: string) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { bone, at, flat: true });

  // ---- main beam (tapered, round-ended) ----
  b.capsule(A, B, [0.17, 0.13], P.woodLight, { bone, sides: 8 });

  // iron bands with gold bolts
  for (const t of [0.1, 0.4, 0.86]) tor(pole(t), u, rAt(t) + 0.012, 0.028, P.metal, [4, 10]);
  for (const t of [0.1, 0.86]) ball(pt(t, 0, rAt(t) + 0.04), 0.03, GOLD);

  // pivot block where the pole meets the cap
  b.part(new THREE.BoxGeometry(0.46, 0.3, 0.46), P.woodDark, { bone, at: pole(0.0).addScaledVector(u, 0.12), dir: u });
  for (const s of [1, -1]) ball(pole(0.0).addScaledVector(u, 0.12).addScaledVector(X, s * 0.235), 0.035, GOLD);

  // ---- two A-frame braces near the cap ----
  const aframe = (tApex: number, fx: number, fy: number, fz: number) => {
    const legs: THREE.Vector3[][] = [];
    for (const s of [1, -1]) {
      const apex = pt(tApex, s * 0.09, 0.09);
      const foot = V(s * fx, fy, fz);
      rod(apex, foot, 0.06, P.wood, 6);
      legs.push([apex, foot]);
    }
    rod(legs[0][0].clone().lerp(legs[0][1], 0.55), legs[1][0].clone().lerp(legs[1][1], 0.55), 0.045, P.woodDark, 6);
    tor(pole(tApex), u, rAt(tApex) + 0.015, 0.03, P.metal, [4, 10]);
  };
  aframe(0.09, 0.45, 5.35, -1.55);
  aframe(0.21, 0.7, 5.25, -1.45);

  // ---- ladder lashed along the lower half ----
  const lt0 = 0.7;
  const lt1 = 0.95;
  const off = 0.16;
  const lw = 0.27;
  for (const s of [1, -1]) rod(pt(lt0, s * lw, off), pt(lt1, s * lw, off), 0.035, P.wood, 6);
  for (let i = 0; i < 5; i++) {
    const t = lt0 + 0.02 + ((lt1 - lt0 - 0.04) * i) / 4;
    rod(pt(t, -lw - 0.02, off), pt(t, lw + 0.02, off), 0.026, P.woodLight, 5);
  }

  // ---- winch ----
  const tw = 0.58;
  const C = pt(tw, 0, 0.72);
  rod(pt(tw, -0.5, 0.12), pt(tw, 0.5, 0.12), 0.055, P.woodDark, 6); // bracket across the pole
  for (const s of [1, -1]) {
    rod(pt(tw, s * 0.4, 0.12), pt(tw, s * 0.4, 0.74), 0.06, P.wood, 6); // posts
    rod(pt(tw + 0.07, s * 0.14, 0.12), pt(tw, s * 0.4, 0.5), 0.035, P.woodDark, 5); // struts
    cyl(C.clone().addScaledVector(X, s * 0.585), [1, 0, 0], 0.07, 0.06, GOLD, 6); // axle nuts
  }
  rod(C.clone().addScaledVector(X, -0.56), C.clone().addScaledVector(X, 0.56), 0.04, P.metal, 6); // axle
  cyl(C, [1, 0, 0], 0.13, 0.24, GOLD, 8); // hub
  for (const s of [1, -1]) tor(C.clone().addScaledVector(X, s * 0.075), [1, 0, 0], 0.46, 0.045, P.woodDark, [5, 16]);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const dy = Math.cos(a);
    const dz = Math.sin(a);
    const rim = C.clone().add(V(0, dy * 0.46, dz * 0.46));
    rod(C, rim, 0.035, P.wood, 6);
    cyl(rim, [1, 0, 0], 0.035, 0.44, P.woodLight, 6); // capstan handle
  }
  // drum and coiled rope
  cyl(C.clone().addScaledVector(X, -0.24), [1, 0, 0], 0.15, 0.24, P.woodDark, 8);
  for (const x of [-0.17, -0.24, -0.31]) tor(C.clone().addScaledVector(X, x), [1, 0, 0], 0.17, 0.035, P.sack, [5, 12]);
  // rope falling to the stake
  b.sweep(
    bezier(
      C.clone().add(V(-0.24, -0.17, 0)),
      V(-0.26, 1.9, -4.12),
      V(-0.12, 1.4, -4.5),
      V(-0.06, 0.9, -4.46),
    ),
    0.03,
    { bone, color: P.sack, sides: 6 },
  );

  // ---- footing, stake, ring, ground rope ----
  const stakeZ = -4.5;
  cyl(V(0, 0.07, -4.2), [0, 1, 0], 0.4, 0.14, P.stone, 8);
  for (const a of [30, 150, 255]) {
    const r = (a * Math.PI) / 180;
    b.part(new THREE.IcosahedronGeometry(0.1, 0), P.stoneDark, {
      bone,
      at: V(Math.cos(r) * 0.37, 0.06, -4.2 + Math.sin(r) * 0.37),
      scale: [1, 0.7, 1],
      flat: true,
    });
  }
  cyl(V(0, 0.48, stakeZ), [0, 1, 0], 0.085, 0.96, P.wood, 8);
  ball(V(0, 0.96, stakeZ), 0.1, P.woodLight);
  tor(V(0, 0.62, stakeZ), [0, 1, 0], 0.095, 0.02, P.metal, [4, 10]);
  rod(V(0.08, 0.66, stakeZ), V(0.12, 0.66, stakeZ), 0.02, P.metal, 5);
  tor(V(0.21, 0.66, stakeZ), [0, 0, 1], 0.1, 0.022, P.metal, [4, 12]); // metal ring
  for (const y of [0.78, 0.84, 0.9]) tor(V(0, y, stakeZ), [0, 1, 0], 0.105, 0.03, P.sack, [5, 10]);
  b.sweep(catmull([V(0.24, 0.57, stakeZ), V(0.38, 0.3, -4.3), V(0.5, 0.09, -3.95)]), 0.025, {
    bone,
    color: P.sack,
    sides: 6,
  });
  tor(V(0.5, 0.035, -3.75), [0, 1, 0], 0.2, 0.035, P.sack, [5, 12]);
  tor(V(0.58, 0.075, -3.7), [0, 1, 0], 0.15, 0.03, P.sack, [5, 12]);

  // ---- leafy sprigs at the stake base ----
  const R = rng(11);
  for (let i = 0; i < 6; i++) {
    const a = ((-100 + i * 40 + (R() - 0.5) * 12) * Math.PI) / 180;
    const d = V(Math.sin(a) * 0.55, 1, Math.cos(a) * 0.55).normalize();
    const base = V(Math.sin(a) * 0.15, 0.13, stakeZ + Math.cos(a) * 0.15);
    const h = 0.24 + R() * 0.12;
    b.part(new THREE.ConeGeometry(0.05, h, 5), i % 2 ? P.leaf : LEAF2, {
      bone,
      at: base.addScaledVector(d, h / 2 - 0.02),
      dir: d,
      flat: true,
    });
  }

  // ---- bunting swag between cap and pole ----
  const hook = V(0.72, 5.2, -1.56);
  const end = pt(0.4, 0.16, 0);
  const ctrl = hook.clone().lerp(end, 0.5).add(V(0.05, -0.85, 0));
  const string = bezier(hook, ctrl, end);
  b.sweep(string, 0.012, { bone, color: P.ink, sides: 5 });
  ball(hook, 0.04, P.metal);
  ball(end, 0.035, GOLD);
  for (let i = 0; i < 5; i++) {
    const p = string.at(0.12 + i * 0.19);
    const red = i % 2 === 0;
    b.extrude(
      [
        [-0.1, 0],
        [0.1, 0],
        [0, -0.28],
      ],
      { at: p, x: [0, 0, 1], thickness: 0.016, bone, color: red ? P.sailRed : P.sailCloth },
    );
    for (const s of [1, -1])
      b.extrude(
        [
          [-0.05, 0],
          [0.05, 0],
          [0, -0.13],
        ],
        {
          at: p.clone().add(V(s * 0.011, -0.03, 0)),
          x: [0, 0, 1],
          thickness: 0.008,
          bone,
          color: red ? P.sailCloth : P.sailRed,
        },
      );
  }
}
    return buildTailPole;
  })(),
  // porchDoor
  (() => {
function buildPorchDoor({ b, J, P, M }: Ctx) {
  const rand = rng(11);
  const S = Math.SQRT1_2;
  const DEG = Math.PI / 180;
  type T3 = [number, number, number];
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const AY = V(0, 1, 0);
  const AX = V(1, 0, 0);
  const qY = (d: number) => new THREE.Quaternion().setFromAxisAngle(AY, d * DEG);
  const qE = (r: T3) => new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0] * DEG, r[1] * DEG, r[2] * DEG, "XYZ"));

  // ---- Frames: porch frame (local x = along the face, y = up, z = outward from the face at azimuth 45) ----
  const LEAN = Math.atan(0.75 / 4.5); // the tower wall leans inward by this angle
  const COS = Math.cos(LEAN);
  const SIN = Math.sin(LEAN);
  const L = (u: number, y: number, w: number) => V(S * (w + u), y, S * (w - u));
  const Wp = (u: number, v: number, n: number) => L(u, 0.5 + v * COS + n * SIN, 2.2 - v * SIN + n * COS);
  const qBase = qY(45);
  const qWall = qBase.clone().multiply(new THREE.Quaternion().setFromAxisAngle(AX, -LEAN));

  // ---- Merged-part buckets (one part per bone + colour) ----
  type Bucket = { bone: any; color: string; geos: THREE.BufferGeometry[] };
  const buckets = new Map<string, Bucket>();

  class Fr {
    constructor(
      public o: THREE.Vector3,
      public q: THREE.Quaternion,
    ) {}
    sub(p: T3, yaw = 0) {
      const lp = V(p[0], p[1], p[2]).applyQuaternion(this.q);
      return new Fr(this.o.clone().add(lp), this.q.clone().multiply(qY(yaw)));
    }
    put(
      geo: THREE.BufferGeometry,
      color: string,
      p: T3 = [0, 0, 0],
      rot: T3 = [0, 0, 0],
      o: { bone?: any; solo?: boolean; scale?: T3 } = {},
    ) {
      const bone = o.bone ?? J.mill;
      if (o.scale) geo.scale(o.scale[0], o.scale[1], o.scale[2]);
      const q = this.q.clone().multiply(qE(rot));
      const pos = V(p[0], p[1], p[2]).applyQuaternion(this.q).add(this.o);
      if (o.solo) return b.part(geo, color, { bone, at: pos, quat: q, flat: true });
      geo.applyMatrix4(new THREE.Matrix4().compose(pos, q, V(1, 1, 1)));
      const key = `${bone.name}|${color}`;
      let bk = buckets.get(key);
      if (!bk) buckets.set(key, (bk = { bone, color, geos: [] }));
      bk.geos.push(geo);
      return null;
    }
  }

  const PF = new Fr(V(0, 0, 0), qBase);
  const WF = new Fr(L(0, 0.5, 2.2), qWall);

  const bx = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (rt: number, rb: number, h: number, s = 8) => new THREE.CylinderGeometry(rt, rb, h, s, 1);
  const sph = (r: number, ws = 8, hs = 6) => new THREE.SphereGeometry(r, ws, hs);
  const tor = (R: number, t: number, rs = 5, ts = 12) => new THREE.TorusGeometry(R, t, rs, ts);
  const cone = (r: number, h: number, s = 8) => new THREE.ConeGeometry(r, h, s);

  // =====================================================================
  // STONE STOOP: footing, slab, steps, mat
  // =====================================================================
  PF.put(bx(1.9, 0.51, 0.7), P.stone, [0, 0.245, 2.75]);
  PF.put(bx(1.96, 0.1, 0.74), P.stoneDark, [0, 0.04, 2.75]);
  // footing seams (front)
  for (const y of [0.17, 0.34]) PF.put(bx(1.9, 0.014, 0.02), P.stoneDark, [0, y, 3.1]);
  const rowsU: [number, number[]][] = [
    [0.085, [-0.5, 0.1, 0.65]],
    [0.255, [-0.2, 0.4, -0.75]],
    [0.42, [-0.6, 0, 0.55]],
  ];
  for (const [y, us] of rowsU) for (const u of us) PF.put(bx(0.014, 0.16, 0.02), P.stoneDark, [u, y, 3.1]);
  for (const s of [1, -1]) {
    for (const y of [0.17, 0.34]) PF.put(bx(0.02, 0.014, 0.7), P.stoneDark, [s * 0.95, y, 2.75]);
    PF.put(bx(0.02, 0.16, 0.014), P.stoneDark, [s * 0.95, 0.255, 2.7]);
    PF.put(bx(0.02, 0.16, 0.014), P.stoneDark, [s * 0.95, 0.085, 2.9]);
  }
  // slab
  PF.put(bx(2.0, 0.1, 1.03), P.stone, [0, 0.55, 2.665]);
  for (const w of [2.5, 2.85]) PF.put(bx(2.0, 0.012, 0.02), P.stoneDark, [0, 0.601, w]);
  PF.put(bx(0.02, 0.012, 0.35), P.stoneDark, [0.35, 0.601, 2.325]);
  PF.put(bx(0.02, 0.012, 0.35), P.stoneDark, [-0.35, 0.601, 2.675]);
  PF.put(bx(0.02, 0.012, 0.33), P.stoneDark, [0.35, 0.601, 3.015]);
  // steps (upper then lower), darker body with lighter treads
  PF.put(bx(1.44, 0.39, 0.35), P.stoneDark, [0, 0.185, 3.275]);
  PF.put(bx(1.5, 0.04, 0.39), P.stone, [0, 0.4, 3.28]);
  PF.put(bx(1.6, 0.19, 0.6), P.stoneDark, [0, 0.085, 3.4]);
  PF.put(bx(1.66, 0.04, 0.64), P.stone, [0, 0.2, 3.4]);
  // welcome mat
  PF.put(bx(0.7, 0.025, 0.42), P.doorBlue, [0, 0.6125, 2.62]);
  for (const d of [-0.15, 0.15]) PF.put(bx(0.58, 0.006, 0.03), P.trimCream, [0, 0.627, 2.62 + d]);
  for (const d of [-0.27, 0.27]) PF.put(bx(0.03, 0.006, 0.3), P.trimCream, [d, 0.627, 2.62]);
  PF.put(bx(0.4, 0.006, 0.1), P.sailRed, [0, 0.627, 2.62]);

  // little flower pot on the upper step
  {
    const pf = PF.sub([-0.55, 0.42, 3.3]);
    pf.put(cyl(0.1, 0.07, 0.14, 8), P.brick, [0, 0.07, 0]);
    pf.put(cyl(0.115, 0.115, 0.035, 8), P.brickDark, [0, 0.155, 0]);
    pf.put(sph(0.1, 7, 5), P.leaf, [0, 0.22, 0], [0, 0, 0], { scale: [1, 0.75, 1] });
    pf.put(sph(0.04, 6, 4), P.flowerPink, [0.04, 0.3, 0.02]);
    pf.put(sph(0.04, 6, 4), P.gold, [-0.05, 0.28, -0.02]);
    pf.put(sph(0.035, 6, 4), P.flowerPink, [0, 0.31, -0.05]);
  }

  // =====================================================================
  // POSTS, HEADER, BRACKETS, RAILS, FLOWER BOXES
  // =====================================================================
  for (const s of [1, -1]) {
    const x = s * 0.9;
    PF.put(bx(0.28, 0.1, 0.28), P.stoneDark, [x, 0.65, 3.0]);
    PF.put(bx(0.17, 1.4, 0.17), P.wood, [x, 1.4, 3.0]);
    PF.put(bx(0.22, 0.05, 0.22), P.woodLight, [x, 0.76, 3.0]);
    PF.put(bx(0.22, 0.05, 0.22), P.woodLight, [x, 1.95, 3.0]);
    PF.put(bx(0.07, 0.46, 0.09), P.woodLight, [s * 0.74, 1.87, 3.0], [0, 0, s * 44]);
    PF.put(sph(0.045, 6, 4), P.gold, [s * 0.9, 2.0, 3.095]);
    // side rails
    PF.put(bx(0.09, 0.08, 0.92), P.wood, [x, 1.1, 2.51]);
    PF.put(bx(0.07, 0.06, 0.92), P.wood, [x, 0.76, 2.51]);
    for (const w of [2.3, 2.5, 2.7, 2.88]) PF.put(cyl(0.03, 0.03, 0.34, 6), P.woodLight, [x, 0.93, w]);
    // flower box
    const fb = PF.sub([x, 1.14, 2.6]);
    fb.put(bx(0.22, 0.15, 0.6), P.wood, [0, 0.075, 0]);
    fb.put(bx(0.25, 0.03, 0.64), P.woodLight, [0, 0.15, 0]);
    fb.put(bx(0.19, 0.03, 0.54), P.woodDark, [0, 0.157, 0]);
    for (let j = 0; j < 5; j++) {
      const z = -0.22 + 0.11 * j;
      const xx = (rand() - 0.5) * 0.06;
      const pink = (j + (s > 0 ? 0 : 1)) % 2 === 0;
      fb.put(sph(0.065, 6, 4), P.leaf, [xx, 0.2, z], [0, 0, 0], { scale: [1, 0.8, 1] });
      fb.put(sph(0.045, 6, 4), pink ? P.flowerPink : P.gold, [xx, 0.26, z]);
      fb.put(sph(0.018, 5, 4), pink ? P.gold : P.trimCream, [xx, 0.295, z]);
      fb.put(cone(0.03, 0.09, 5), P.leaf, [xx + 0.08 * (j % 2 ? 1 : -1), 0.21, z + 0.03], [0, 0, (j % 2 ? -1 : 1) * 40]);
    }
  }
  // header beam with nameplate
  PF.put(bx(2.1, 0.16, 0.2), P.wood, [0, 2.1, 3.0]);
  PF.put(bx(2.14, 0.03, 0.22), P.woodLight, [0, 2.03, 3.0]);
  PF.put(bx(0.6, 0.17, 0.02), P.ink, [0, 2.1, 3.105]);
  PF.put(bx(0.55, 0.12, 0.02), P.woodLight, [0, 2.1, 3.115]);
  for (let i = 0; i < 6; i++)
    PF.put(bx(0.035, i % 2 ? 0.05 : 0.065, 0.01), P.ink, [-0.19 + 0.076 * i, 2.1, 3.128]);
  for (const s of [1, -1]) PF.put(sph(0.02, 5, 4), P.gold, [s * 0.25, 2.1, 3.125]);
  // vine climbing the left post
  for (let i = 0; i < 9; i++) {
    const a = i * 2.1;
    const y = 0.8 + i * 0.14;
    PF.put(sph(0.05, 5, 4), P.leaf, [0.9 + 0.1 * Math.cos(a), y, 3.0 + 0.1 * Math.sin(a)], [0, 0, 0], { scale: [1, 0.6, 1] });
    if (i % 3 === 1) PF.put(sph(0.032, 5, 4), P.flowerPink, [0.9 + 0.12 * Math.cos(a + 0.5), y + 0.04, 3.0 + 0.12 * Math.sin(a + 0.5)]);
  }

  // =====================================================================
  // LEAN-TO ROOF
  // =====================================================================
  const PHI = Math.atan(0.28);
  const PHI_D = PHI / DEG;
  const cP = Math.cos(PHI);
  const sP = Math.sin(PHI);
  const roofTop = (w: number) => 2.62 - 0.28 * (w - 1.8);
  const roofAt = (u: number, w: number, off: number): T3 => [u, roofTop(w) + off * cP, w + off * sP];
  const ROT: T3 = [PHI_D, 0, 0];

  PF.put(bx(2.1, 0.1, 1.61), P.roofTealDark, roofAt(0, 2.425, -0.05), ROT);
  for (const u of [-0.6, 0, 0.6]) PF.put(bx(0.07, 0.07, 1.5), P.woodLight, roofAt(u, 2.45, -0.13), ROT);
  for (let i = 0; i < 6; i++) {
    const s = 0.16 + 0.28 * i;
    const w = 3.2 - s * cP;
    const off = 0.03 + 0.008 * (5 - i);
    const us = i % 2 === 0 ? [-0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9] : [-0.75, -0.45, -0.15, 0.15, 0.45, 0.75];
    const pick = () => {
      const r = rand();
      return r < 0.4 ? P.roofTeal : r < 0.75 ? P.roofTealLight : P.roofTealDark;
    };
    for (const u of us) PF.put(bx(0.285, 0.045, 0.36), pick(), roofAt(u, w, off), ROT);
    if (i % 2 === 1)
      for (const sd of [-1, 1]) PF.put(bx(0.14, 0.045, 0.36), pick(), roofAt(sd * 0.975, w, off), ROT);
  }
  PF.put(bx(2.1, 0.07, 0.12), P.roofTealDark, roofAt(0, 1.74, 0.085), ROT);
  // fascia + scallops + bargeboards
  PF.put(bx(2.18, 0.18, 0.05), P.trimCream, [0, 2.21, 3.215]);
  for (let i = 0; i < 11; i++)
    PF.put(sph(0.045, 6, 4), P.trimCream, [-1.0 + 0.2 * i, 2.115, 3.215], [0, 0, 0], { scale: [1, 0.8, 0.7] });
  for (const s of [1, -1]) {
    PF.put(bx(0.05, 0.17, 1.65), P.trimCream, roofAt(s * 1.075, 2.425, 0.005), ROT);
    PF.put(sph(0.035, 5, 4), P.gold, [s * 1.075, 2.12, 3.2]);
  }

  // =====================================================================
  // DOOR FRAME (on the leaning wall): jambs, arch of blocks, keystone
  // =====================================================================
  const DHW = 0.43;
  const DH = 0.75;
  const DB = 0.1; // door bottom (wall v)
  const ARC_V = DB + DH;
  for (const s of [1, -1]) WF.put(bx(0.15, 0.8, 0.2), P.trimCream, [s * 0.495, 0.46, 0.05]);
  for (let k = 0; k < 9; k++) {
    const a = 10 + 20 * k;
    const R = 0.495;
    const cx = R * Math.cos(a * DEG);
    const cy = ARC_V + R * Math.sin(a * DEG);
    if (k === 4) {
      WF.put(bx(0.23, 0.26, 0.26), P.brick, [0, ARC_V + 0.55, 0.08]);
      WF.put(sph(0.032, 6, 4), P.gold, [0, ARC_V + 0.55, 0.215]);
    } else {
      WF.put(bx(0.19, 0.15, k % 2 ? 0.2 : 0.21), k % 2 ? P.plaster : P.trimCream, [cx, cy, 0.05], [0, 0, a - 90]);
    }
  }
  // tiny gold studs on the jamb faces
  for (const s of [1, -1]) for (const v of [0.25, 0.55]) WF.put(sph(0.022, 5, 4), P.gold, [s * 0.495, v, 0.155]);

  // =====================================================================
  // DOOR (doorHinge): arch slab, planks, straps, knob, round window
  // =====================================================================
  const arch = (hw: number, h: number, seg: number): [number, number][] => {
    const pts: [number, number][] = [
      [-hw, 0],
      [hw, 0],
    ];
    for (let i = 0; i <= seg; i++) {
      const a = (Math.PI * i) / seg;
      pts.push([hw * Math.cos(a), h + hw * Math.sin(a)]);
    }
    return pts;
  };
  const tDir: T3 = [S, 0, -S];
  const sDir: T3 = [-S * SIN, COS, -S * SIN];
  b.extrude(arch(DHW, DH, 8), {
    at: Wp(0, DB, 0.04),
    x: tDir,
    y: sDir,
    thickness: 0.08,
    bevel: 0.012,
    color: P.doorBlue,
    bone: J.doorHinge,
  });
  const D = { bone: J.doorHinge };
  // plank lines
  for (const u of [-0.287, -0.143, 0, 0.143, 0.287]) {
    const top = Math.abs(u) < 0.2 ? 0.84 : ARC_V + Math.sqrt(DHW * DHW - u * u) - 0.07;
    const lo = 0.14;
    WF.put(bx(0.014, top - lo, 0.012), P.woodDark, [u, (top + lo) / 2, 0.085], [0, 0, 0], D);
  }
  WF.put(bx(0.84, 0.1, 0.012), P.wood, [0, 0.17, 0.088], [0, 0, 0], D);
  // strap hinges
  for (const v of [0.38, 0.72]) {
    WF.put(bx(0.4, 0.07, 0.02), P.ink, [0.23, v, 0.095], [0, 0, 0], D);
    WF.put(cyl(0.032, 0.032, 0.11, 6), P.metal, [0.43, v, 0.1], [0, 0, 0], D);
    for (const u of [0.36, 0.22, 0.09]) WF.put(sph(0.016, 5, 4), P.gold, [u, v, 0.108], [0, 0, 0], D);
  }
  // knob
  WF.put(cyl(0.06, 0.06, 0.02, 8), P.gold, [-0.32, 0.55, 0.1], [90, 0, 0], D);
  WF.put(sph(0.045, 7, 5), P.gold, [-0.32, 0.55, 0.14], [0, 0, 0], D);
  WF.put(bx(0.03, 0.07, 0.014), P.ink, [-0.32, 0.47, 0.105], [0, 0, 0], D);
  // round door window
  WF.put(tor(0.13, 0.03, 5, 12), P.trimCream, [0, 1.0, 0.09], [0, 0, 0], D);
  WF.put(cyl(0.115, 0.115, 0.02, 12), P.glassBlue, [0, 1.0, 0.085], [90, 0, 0], D);
  WF.put(bx(0.23, 0.016, 0.012), P.trimCream, [0, 1.0, 0.1], [0, 0, 0], D);
  WF.put(bx(0.016, 0.23, 0.012), P.trimCream, [0, 1.0, 0.1], [0, 0, 0], D);

  // =====================================================================
  // GLOWING ROUND WINDOW ABOVE THE DOOR + NAMEPLATE-STYLE SILL
  // =====================================================================
  const VW = 1.82;
  WF.put(tor(0.14, 0.035, 5, 12), P.trimCream, [0, VW, 0.04]);
  glow(WF.put(cyl(0.12, 0.12, 0.03, 12), P.glowYellow, [0, VW, 0.02], [90, 0, 0], { solo: true })!, 1);
  WF.put(bx(0.24, 0.014, 0.01), P.trimCream, [0, VW, 0.045]);
  WF.put(bx(0.014, 0.24, 0.01), P.trimCream, [0, VW, 0.045]);
  WF.put(bx(0.36, 0.05, 0.1), P.trimCream, [0, VW - 0.185, 0.07]);
  for (const a of [45, 135, 225, 315])
    WF.put(sph(0.018, 5, 4), P.gold, [0.175 * Math.cos(a * DEG) * 0.95, VW + 0.175 * Math.sin(a * DEG) * 0.95, 0.075]);
  for (const s of [1, -1]) {
    WF.put(sph(0.04, 6, 4), P.flowerPink, [s * 0.1, VW - 0.23, 0.12]);
    WF.put(sph(0.03, 6, 4), P.leaf, [s * 0.17, VW - 0.225, 0.11]);
  }

  // =====================================================================
  // HANGING LANTERN
  // =====================================================================
  {
    const lf = PF.sub([-0.5, 0, 3.0]);
    lf.put(cyl(0.012, 0.012, 0.2, 5), P.metal, [0, 1.93, 0]);
    lf.put(tor(0.035, 0.01, 4, 8), P.metal, [0, 1.84, 0], [90, 0, 0]);
    lf.put(cone(0.13, 0.1, 8), P.metal, [0, 1.79, 0]);
    lf.put(cyl(0.12, 0.12, 0.025, 8), P.metal, [0, 1.735, 0]);
    glow(lf.put(bx(0.15, 0.2, 0.15), P.glowYellow, [0, 1.62, 0], [0, 0, 0], { solo: true })!, 1);
    glow(lf.put(sph(0.045, 6, 4), P.gold, [0, 1.62, 0], [0, 0, 0], { solo: true })!, 1.5);
    for (const sx of [1, -1])
      for (const sz of [1, -1]) lf.put(bx(0.025, 0.22, 0.025), P.metal, [sx * 0.08, 1.62, sz * 0.08]);
    lf.put(bx(0.19, 0.035, 0.19), P.metal, [0, 1.5, 0]);
    lf.put(cone(0.05, 0.06, 6), P.metal, [0, 1.46, 0], [180, 0, 0]);
  }

  // =====================================================================
  // PROPS: SACKS, BARREL
  // =====================================================================
  const sack = (fr: Fr, k: number) => {
    fr.put(sph(0.27 * k, 8, 6), P.sack, [0, 0.295 * k, 0], [0, 0, 0], { scale: [1, 1.1, 0.85] });
    fr.put(cyl(0.08 * k, 0.13 * k, 0.16 * k, 7), P.sack, [0, 0.61 * k, 0]);
    fr.put(tor(0.1 * k, 0.022 * k, 4, 8), P.sailRed, [0, 0.6 * k, 0], [90, 0, 0]);
    fr.put(cyl(0.15 * k, 0.08 * k, 0.1 * k, 7), P.sack, [0.01 * k, 0.72 * k, 0], [8, 0, 6]);
    fr.put(bx(0.2 * k, 0.16 * k, 0.012), P.trimCream, [0, 0.33 * k, 0.228 * k]);
    fr.put(bx(0.012 * k, 0.1 * k, 0.008), P.ink, [0, 0.335 * k, 0.236 * k]);
    for (const [y, sd] of [
      [0.31, 1],
      [0.31, -1],
      [0.345, 1],
      [0.345, -1],
      [0.38, 1],
      [0.38, -1],
    ] as [number, number][])
      fr.put(bx(0.05 * k, 0.012 * k, 0.008), P.ink, [sd * 0.028 * k, y * k, 0.236 * k], [0, 0, -sd * 35]);
    fr.put(bx(0.12 * k, 0.012 * k, 0.008), P.ink, [0, 0.26 * k, 0.236 * k]);
  };
  sack(PF.sub([-1.2, 0, 3.0], 25), 1);
  sack(PF.sub([-0.62, 0.6, 2.72], -12), 0.7);

  {
    const bf = PF.sub([1.3, 0, 2.85], 15);
    bf.put(cyl(0.28, 0.23, 0.3, 10), P.wood, [0, 0.15, 0]);
    bf.put(cyl(0.23, 0.28, 0.3, 10), P.woodLight, [0, 0.45, 0]);
    for (const [y, R] of [
      [0.07, 0.245],
      [0.19, 0.265],
      [0.41, 0.265],
      [0.53, 0.245],
    ] as [number, number][])
      bf.put(tor(R, 0.02, 4, 10), P.metal, [0, y, 0], [90, 0, 0]);
    bf.put(tor(0.215, 0.025, 4, 10), P.woodDark, [0, 0.6, 0], [90, 0, 0]);
    bf.put(cyl(0.21, 0.21, 0.02, 10), P.woodDark, [0, 0.58, 0]);
    for (let i = 0; i < 4; i++) {
      const a = i * 1.6 + 0.4;
      bf.put(sph(0.07, 6, 5), P.sailRed, [0.11 * Math.cos(a), 0.64, 0.11 * Math.sin(a)]);
    }
    bf.put(sph(0.07, 6, 5), P.brickDark, [0, 0.69, 0]);
    bf.put(cone(0.03, 0.06, 4), P.leaf, [0.03, 0.76, 0.0], [0, 0, -30]);
  }

  // =====================================================================
  // FLUSH MERGED PARTS
  // =====================================================================
  for (const bk of buckets.values()) {
    const merged = mergeGeometries(bk.geos, false);
    if (!merged) continue;
    b.part(merged, bk.color, { bone: bk.bone, at: [0, 0, 0], flat: true });
  }
}
    return buildPorchDoor;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "dutchWindmill" });
  const J: Record<string, Joint> = {};
  J["mill"] = b.joint("mill", { at: [0,0,0], dir: [0,1,0], role: "spine" });
  J["cap"] = b.joint("cap", { parent: J["mill"], at: [0,5,0], dir: [0,1,0], role: "hinge", group: "cap" });
  J["rotor"] = b.joint("rotor", { parent: J["cap"], at: [0,5.9,2.1], dir: [0,0,1], role: "hinge", group: "sails" });
  J["doorHinge"] = b.joint("doorHinge", { parent: J["mill"], at: [1.88,0.5,1.24], dir: [0,1,0], role: "hinge", group: "door" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
