```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Keel-billed Toucan",
  description:
    "A stylized low-poly keel-billed toucan showing off on a short mossy branch: rainbow beak with a cherry-red tip, glossy black body, lemon bib, lime eye rings, blue feet, scarlet undertail and a pink orchid in bloom.",
};

type V = [number, number, number];

// ---------- small vector helpers (plain tuples) ----------
const add = (a: V, c: V): V => [a[0] + c[0], a[1] + c[1], a[2] + c[2]];
const sub = (a: V, c: V): V => [a[0] - c[0], a[1] - c[1], a[2] - c[2]];
const mul = (a: V, k: number): V => [a[0] * k, a[1] * k, a[2] * k];
const len3 = (a: V) => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V): V => {
  const l = len3(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const cross = (a: V, c: V): V => [
  a[1] * c[2] - a[2] * c[1],
  a[2] * c[0] - a[0] * c[2],
  a[0] * c[1] - a[1] * c[0],
];
const lerpV = (a: V, c: V, t: number): V => [
  a[0] + (c[0] - a[0]) * t,
  a[1] + (c[1] - a[1]) * t,
  a[2] + (c[2] - a[2]) * t,
];
const rotX = (v: V, a: number): V => [
  v[0],
  v[1] * Math.cos(a) - v[2] * Math.sin(a),
  v[1] * Math.sin(a) + v[2] * Math.cos(a),
];

// deterministic PRNG
function makeRand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- geometry helpers (all built along +Z from z=0) ----------
function taper(w0: number, h0: number, w1: number, h1: number, len: number) {
  const g = new THREE.BoxGeometry(1, 1, 1);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const far = z > 0;
    p.setXYZ(i, x * (far ? w1 : w0), y * (far ? h1 : h0), (z + 0.5) * len);
  }
  g.computeVertexNormals();
  return g;
}
function rodGeo(r0: number, r1: number, len: number, seg = 6) {
  const g = new THREE.CylinderGeometry(r1, r0, len, seg);
  g.rotateX(Math.PI / 2);
  g.translate(0, 0, len / 2);
  return g;
}
function coneGeo(r: number, h: number, seg = 4) {
  const g = new THREE.ConeGeometry(r, h, seg);
  g.rotateX(Math.PI / 2);
  g.translate(0, 0, h / 2);
  return g;
}
function ell(r: V, ws = 10, hs = 8) {
  const g = new THREE.SphereGeometry(1, ws, hs);
  g.scale(r[0], r[1], r[2]);
  return g;
}
// orient geometry so its +Z goes along dir and +Y leans toward up
function orient(g: THREE.BufferGeometry, dir: V, up: V) {
  const z = new THREE.Vector3(...norm(dir));
  let x = new THREE.Vector3(...up).cross(z);
  if (x.lengthSq() < 1e-8) x = new THREE.Vector3(1, 0, 0).cross(z);
  x.normalize();
  const y = z.clone().cross(x);
  g.applyMatrix4(new THREE.Matrix4().makeBasis(x, y, z));
  return g;
}

export default function build() {
  const b = createBuilder({ name: "keel_billed_toucan" });
  const anyB = b as any;

  const J = (name: string, at: V, parent?: any, role?: string) => {
    const opts: any = { at };
    if (parent) opts.parent = parent;
    if (role) opts.role = role;
    try {
      return anyB.joint(name, opts);
    } catch (e) {
      delete opts.role;
      return anyB.joint(name, opts);
    }
  };
  const P = (geo: THREE.BufferGeometry, color: string, at: V, bone: any) =>
    anyB.part(geo, color, { at, bone });
  const seg = (
    a: V,
    c: V,
    make: (l: number) => THREE.BufferGeometry,
    color: string,
    bone: any,
    up: V = [0, 1, 0],
    extra = 0
  ) => {
    const d = sub(c, a);
    const l = len3(d) + extra;
    const g = make(l);
    orient(g, d, up);
    return P(g, color, a, bone);
  };

  // ---------- palette ----------
  const BLACK = "#121318";
  const BLACK2 = "#1a1c23";
  const SHEEN = "#222a3a";
  const SHEEN2 = "#2b3448";
  const NAPE = "#4a1b26";
  const YELLOW = "#ffe12e";
  const BIB_RED = "#e3262f";
  const SCARLET = "#ff2a2a";
  const LIME = "#8fdc2a";
  const LIME_DK = "#5e9e18";
  const SKY = "#3fb8ff";
  const ORANGE = "#ff8a1c";
  const CHERRY = "#d10f3a";
  const EYE_RING = "#a6f03c";
  const EYE = "#1a0f0a";
  const WHITE = "#ffffff";
  const FEET = "#2f7fff";
  const CLAW = "#1f2a44";
  const BARK = "#6e4a2f";
  const BARK_DK = "#4f321f";
  const WOOD = "#d0a46c";
  const RING = "#a57746";
  const MOSS = ["#5aa832", "#7cc242", "#3f8a2a"];
  const FROND = "#a6dc5c";
  const LEAF = "#2f8f4a";
  const LEAF_DK = "#1f6a36";
  const STEM = "#5c8a3a";
  const PETAL = "#ff5fae";
  const SEPAL = "#ff8cc6";
  const VEIN = "#d63384";
  const LIP = "#c2187a";
  const COLUMN = "#ffd23f";

  // ---------- skeleton ----------
  const root = J("root", [0, 0, 0]);
  const hips = J("hips", [0, 0.14, -0.01], root, "spine");
  const chest = J("chest", [0, 0.22, 0.01], hips, "spine");
  const neck = J("neck", [0, 0.28, 0.025], chest, "neck");
  const headPos: V = [0, 0.33, 0.035];
  const head = J("head", headPos, neck, "head");
  const jaw = J("jaw", [0, 0.31, 0.08], head, "jaw");

  const dT = norm([0, 0.62, -0.78]);
  const t1p: V = [0, 0.11, -0.07];
  const tail1 = J("tail1", t1p, hips, "tail");
  const tail2 = J("tail2", add(t1p, mul(dT, 0.1)), tail1, "tail");
  J("tail3", add(t1p, mul(dT, 0.2)), tail2, "tail");

  // ---------- branch (scenery on root) ----------
  const BR_Y = 0.032, BR_Z = 0.03, BR_R = 0.032, BR_L = 0.62;
  {
    const g = new THREE.CylinderGeometry(BR_R, BR_R + 0.002, BR_L, 7);
    g.rotateZ(Math.PI / 2);
    P(g, BARK, [0, BR_Y, BR_Z], root);
    for (const sx of [-1, 1]) {
      const cap = new THREE.CylinderGeometry(BR_R - 0.004, BR_R - 0.004, 0.006, 7);
      cap.rotateZ(Math.PI / 2);
      P(cap, WOOD, [sx * (BR_L / 2 + 0.001), BR_Y, BR_Z], root);
      const ring = new THREE.CylinderGeometry(BR_R * 0.5, BR_R * 0.5, 0.008, 7);
      ring.rotateZ(Math.PI / 2);
      P(ring, RING, [sx * (BR_L / 2 + 0.002), BR_Y, BR_Z], root);
      const core = new THREE.CylinderGeometry(BR_R * 0.18, BR_R * 0.18, 0.01, 5);
      core.rotateZ(Math.PI / 2);
      P(core, BARK_DK, [sx * (BR_L / 2 + 0.003), BR_Y, BR_Z], root);
    }
    // bark ridges
    const rand = makeRand(11);
    for (let i = 0; i < 10; i++) {
      const x = -0.27 + rand() * 0.54;
      const ang = -0.6 + rand() * 1.2 + (i % 2 ? Math.PI * 0.55 : -Math.PI * 0.1);
      const n: V = [0, Math.cos(ang), Math.sin(ang)];
      const p: V = [x, BR_Y + n[1] * BR_R, BR_Z + n[2] * BR_R];
      if (p[1] < 0.006) continue;
      const lg = 0.04 + rand() * 0.05;
      const ridge = taper(0.006, 0.004, 0.006, 0.004, lg);
      ridge.translate(0, 0, -lg / 2);
      orient(ridge, [1, 0, 0], n);
      P(ridge, BARK_DK, p, root);
    }
    // knots
    for (const [x, ang] of [[-0.14, 1.9], [0.24, 1.2]] as [number, number][]) {
      const n: V = [0, Math.cos(ang), Math.sin(ang)];
      P(ell([0.012, 0.012, 0.012], 6, 4), BARK_DK, [x, BR_Y + n[1] * BR_R, BR_Z + n[2] * BR_R], root);
    }
    // side twig with a leaf
    const tw0: V = [-0.2, 0.055, 0.03];
    const tw1: V = [-0.27, 0.13, 0.065];
    seg(tw0, tw1, (l) => rodGeo(0.011, 0.006, l, 5), BARK, root);
    P(ell([0.006, 0.006, 0.006], 5, 4), WOOD, tw1, root);
    const lf = ell([0.016, 0.003, 0.03], 8, 4);
    lf.translate(0, 0, 0.028);
    orient(lf, [-0.5, 0.4, 0.6], [0, 1, 0]);
    P(lf, LEAF, add(tw1, [0, -0.01, -0.005]), root);

    // moss clumps across the top
    const mr = makeRand(42);
    for (let i = 0; i < 34; i++) {
      const x = -0.29 + mr() * 0.58;
      const ang = (mr() - 0.5) * 2.3;
      const n: V = [0, Math.cos(ang), Math.sin(ang)];
      const p: V = [x, BR_Y + n[1] * BR_R, BR_Z + n[2] * BR_R];
      const sz = 0.012 + mr() * 0.016;
      const g = new THREE.IcosahedronGeometry(1, 0);
      g.scale(sz * (1.2 + mr() * 0.6), sz, sz * 0.45);
      orient(g, n, [1, 0, 0]);
      P(g, MOSS[i % 3], p, root);
      if (i % 3 === 0) {
        // little fronds poking out of the moss
        for (let k = 0; k < 3; k++) {
          const fd = norm(add(n, [(mr() - 0.5) * 1.2, 0, (mr() - 0.5) * 0.8]));
          const fg = coneGeo(0.0025, 0.014 + mr() * 0.01, 3);
          orient(fg, fd, [1, 0, 0]);
          P(fg, FROND, add(p, mul(n, sz * 0.3)), root);
        }
      }
    }
  }

  // ---------- orchid (scenery on root) ----------
  {
    const base: V = [0.2, 0.058, 0.045];
    // leaves
    for (const ld of [[0.7, 0.18, 0.7], [-0.45, 0.15, 0.9]] as V[]) {
      const g = ell([0.024, 0.004, 0.05], 8, 4);
      g.translate(0, 0, 0.046);
      orient(g, ld, [0, 1, 0]);
      P(g, LEAF, base, root);
      const rib = taper(0.003, 0.003, 0.001, 0.003, 0.08);
      orient(rib, ld, [0, 1, 0]);
      P(rib, LEAF_DK, add(base, [0, 0.003, 0]), root);
    }
    const s1: V = [0.205, 0.12, 0.06];
    const C: V = [0.225, 0.172, 0.105];
    seg(base, s1, (l) => rodGeo(0.0035, 0.003, l, 5), STEM, root);
    seg(s1, C, (l) => rodGeo(0.003, 0.0025, l, 5), STEM, root);
    // bud
    const budStem: V = [0.212, 0.15, 0.07];
    seg(budStem, [0.19, 0.165, 0.085], (l) => rodGeo(0.002, 0.0018, l, 4), STEM, root);
    P(ell([0.008, 0.011, 0.008], 7, 5), SEPAL, [0.188, 0.17, 0.087], root);

    const n = norm([0.25, 0.3, 1]);
    const r = norm(cross([0, 1, 0], n));
    const u = cross(n, r);
    const petal = (angDeg: number, len: number, w: number, color: string, cup = 0.15) => {
      const a = (angDeg * Math.PI) / 180;
      const d = norm(add(add(mul(r, Math.cos(a)), mul(u, Math.sin(a))), mul(n, cup)));
      const g = ell([w, 0.0025, len / 2], 8, 5);
      g.translate(0, 0, len * 0.45);
      orient(g, d, n);
      P(g, color, C, root);
      const vg = taper(0.0025, 0.002, 0.001, 0.002, len * 0.7);
      orient(vg, d, n);
      P(vg, VEIN, add(C, mul(n, 0.0025)), root);
    };
    petal(90, 0.042, 0.012, SEPAL);
    petal(215, 0.04, 0.011, SEPAL);
    petal(325, 0.04, 0.011, SEPAL);
    petal(15, 0.04, 0.022, PETAL, 0.2);
    petal(165, 0.04, 0.022, PETAL, 0.2);
    // lip
    const lipD = norm(add(mul(u, -1), mul(n, 0.5)));
    const lg = ell([0.012, 0.007, 0.014], 8, 5);
    lg.translate(0, 0, 0.012);
    orient(lg, lipD, n);
    P(lg, LIP, add(C, mul(n, 0.004)), root);
    P(ell([0.004, 0.004, 0.004], 6, 4), COLUMN, add(add(C, mul(n, 0.012)), mul(u, -0.012)), root);
    P(ell([0.006, 0.008, 0.006], 6, 5), COLUMN, add(C, mul(n, 0.006)), root);
    P(ell([0.003, 0.004, 0.003], 5, 4), WHITE, add(add(C, mul(n, 0.011)), mul(u, 0.003)), root);
  }

  // ---------- body ----------
  const bodyC: V = [0, 0.19, 0];
  const BA = 0.085, BB = 0.118, BC = 0.088, TILT = 0.35;
  {
    const g = ell([BA, BB, BC], 12, 9);
    g.rotateX(TILT);
    P(g, BLACK, bodyC, chest);
    // rump connecting to tail
    P(ell([0.058, 0.05, 0.06], 9, 7), BLACK, [0, 0.12, -0.05], hips);
    // scarlet undertail coverts
    const ut = ell([0.045, 0.03, 0.058], 9, 6);
    ut.rotateX(-0.5);
    P(ut, SCARLET, [0, 0.098, -0.07], hips);
    // breast & back scallops (feather layering)
    for (let row = 0; row < 4; row++) {
      for (let k = 0; k < 6; k++) {
        const th = -0.85 + row * 0.2;
        const ph = -0.85 + k * 0.34 + (row % 2) * 0.17;
        const local: V = [BA * Math.cos(th) * Math.sin(ph), BB * Math.sin(th), BC * Math.cos(th) * Math.cos(ph)];
        const nl: V = norm([local[0] / (BA * BA), local[1] / (BB * BB), local[2] / (BC * BC)]);
        const p = add(bodyC, rotX(local, TILT));
        const nn = rotX(nl, TILT);
        const sg = ell([0.014, 0.01, 0.004], 6, 4);
        orient(sg, nn, [0, 1, 0]);
        P(sg, row % 2 ? BLACK2 : SHEEN, add(p, mul(nn, 0.001)), chest);
      }
    }
    for (let row = 0; row < 3; row++) {
      for (let k = 0; k < 5; k++) {
        const th = 0.1 + row * 0.25;
        const ph = Math.PI - 0.7 + k * 0.35 + (row % 2) * 0.17;
        const local: V = [BA * Math.cos(th) * Math.sin(ph), BB * Math.sin(th), BC * Math.cos(th) * Math.cos(ph)];
        const nl: V = norm([local[0] / (BA * BA), local[1] / (BB * BB), local[2] / (BC * BC)]);
        const p = add(bodyC, rotX(local, TILT));
        const nn = rotX(nl, TILT);
        const sg = ell([0.016, 0.012, 0.004], 6, 4);
        orient(sg, nn, [0, 1, 0]);
        P(sg, SHEEN2, add(p, mul(nn, 0.001)), chest);
      }
    }
    // neck & head
    P(ell([0.06, 0.06, 0.06], 10, 8), BLACK, [0, 0.28, 0.025], neck);
    P(ell([0.064, 0.062, 0.066], 12, 9), BLACK, headPos, head);
    // maroon nape
    P(ell([0.045, 0.03, 0.02], 8, 6), NAPE, [0, 0.31, -0.03], neck);
    // lemon bib + red border
    const bib = ell([0.064, 0.072, 0.045], 12, 9);
    bib.rotateX(0.2);
    P(bib, YELLOW, [0, 0.272, 0.062], neck);
    const border = ell([0.062, 0.02, 0.04], 10, 6);
    P(border, BIB_RED, [0, 0.205, 0.072], chest);
    for (const s of [1, -1]) {
      P(ell([0.03, 0.032, 0.036], 8, 6), YELLOW, [s * 0.036, 0.31, 0.066], head);
    }
  }

  // ---------- beak ----------
  {
    const Uz = (t: number) => 0.075 + 0.2 * t;
    const Uy = (t: number) => 0.346 - 0.042 * t * t;
    const Uh = (t: number) => 0.054 * (1 - 0.76 * t);
    const Uw = (t: number) => 0.044 * (1 - 0.7 * t);
    const N = 4;
    const upCols = [LIME, LIME, LIME, CHERRY];
    for (let i = 0; i < N; i++) {
      const t0 = i / N, t1 = (i + 1) / N;
      const a: V = [0, Uy(t0), Uz(t0)];
      const c: V = [0, Uy(t1), Uz(t1)];
      seg(a, c, (l) => taper(Uw(t0), Uh(t0), Uw(t1), Uh(t1), l), upCols[i], head, [0, 1, 0], 0.004);
    }
    // ridge (keel) line along the top
    for (let i = 0; i < 3; i++) {
      const t0 = i / N, t1 = (i + 1) / N;
      const a: V = [0, Uy(t0) + Uh(t0) / 2, Uz(t0)];
      const c: V = [0, Uy(t1) + Uh(t1) / 2, Uz(t1)];
      seg(a, c, (l) => taper(0.008, 0.004, 0.006, 0.003, l), LIME_DK, head, [0, 1, 0], 0.004);
    }
    // orange flash on each side and sky stripe near the cutting edge
    for (const s of [1, -1]) {
      const t = 0.48;
      const o = ell([0.0035, Uh(t) * 0.32, 0.05], 8, 6);
      o.rotateX(0.18);
      P(o, ORANGE, [s * Uw(t) * 0.5, Uy(t) + 0.004, Uz(t)], head);
      const t2 = 0.4;
      const sk = ell([0.003, 0.004, 0.045], 6, 4);
      sk.rotateX(0.12);
      P(sk, SKY, [s * Uw(t2) * 0.5, Uy(t2) - Uh(t2) * 0.36, Uz(t2)], head);
    }
    // hooked tip
    const tipP: V = [0, Uy(1) - 0.002, Uz(1)];
    const hook = coneGeo(0.007, 0.016, 4);
    orient(hook, [0, -1, 0.55], [0, 0, 1]);
    P(hook, CHERRY, tipP, head);
    // serrations along the upper cutting edge
    for (let k = 0; k < 7; k++) {
      const t = 0.15 + k * 0.1;
      const sg = coneGeo(0.0035, 0.007, 3);
      orient(sg, [0, -1, 0.15], [0, 0, 1]);
      P(sg, LIME_DK, [0, Uy(t) - Uh(t) / 2 + 0.002, Uz(t)], head);
    }
    // black rim where beak meets face
    P(taper(0.05, 0.1, 0.05, 0.1, 0.008), BLACK2, [0, 0.326, 0.07], head);

    // lower jaw (separate, on jaw bone)
    const Lz = (t: number) => 0.075 + 0.185 * t;
    const Lh = (t: number) => 0.03 * (1 - 0.72 * t);
    const Lw = (t: number) => 0.04 * (1 - 0.7 * t);
    const Ly = (t: number) => {
      const tu = (Lz(t) - 0.075) / 0.2;
      return Uy(tu) - Uh(tu) / 2 - Lh(t) / 2 + 0.003;
    };
    const loCols = [LIME, SKY, SKY, CHERRY];
    for (let i = 0; i < N; i++) {
      const t0 = i / N, t1 = (i + 1) / N;
      const a: V = [0, Ly(t0), Lz(t0)];
      const c: V = [0, Ly(t1), Lz(t1)];
      seg(a, c, (l) => taper(Lw(t0), Lh(t0), Lw(t1), Lh(t1), l), loCols[i], jaw, [0, 1, 0], 0.004);
    }
    // dark gape line on lower jaw sides
    for (const s of [1, -1]) {
      const t = 0.3;
      const g = ell([0.002, 0.0025, 0.03], 5, 4);
      P(g, LIME_DK, [s * Lw(t) * 0.5, Ly(t) + Lh(t) * 0.25, Lz(t)], jaw);
    }
  }

  // ---------- eyes ----------
  for (const s of [1, -1]) {
    const ep: V = [s * 0.057, 0.352, 0.056];
    const ring = new THREE.CylinderGeometry(0.023, 0.025, 0.007, 9);
    ring.rotateZ(Math.PI / 2);
    P(ring, EYE_RING, ep, head);
    const ring2 = new THREE.CylinderGeometry(0.015, 0.015, 0.009, 9);
    ring2.rotateZ(Math.PI / 2);
    P(ring2, LIME_DK, add(ep, [s * 0.001, 0, 0]), head);
    P(ell([0.011, 0.011, 0.011], 8, 6), EYE, add(ep, [s * 0.004, 0, 0]), head);
    P(ell([0.0035, 0.0035, 0.0035], 5, 4), WHITE, add(ep, [s * 0.013, 0.004, 0.004]), head);
  }

  // ---------- legs & feet ----------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const hipP: V = [s * 0.032, 0.115, 0.02];
    const kneeP: V = [s * 0.034, 0.1, 0.032];
    const ankP: V = [s * 0.035, 0.068, BR_Z];
    const hip = J("hip" + L, hipP, hips, "leg");
    const knee = J("knee" + L, kneeP, hip, "leg");
    const ankle = J("ankle" + L, ankP, knee, "leg");
    const toeFp: V = [s * 0.035, 0.064, 0.048];
    const toeBp: V = [s * 0.035, 0.064, 0.012];
    const toeF = J("toeF" + L, toeFp, ankle, "digit");
    const toeB = J("toeB" + L, toeBp, ankle, "digit");

    P(ell([0.03, 0.034, 0.03], 8, 6), BLACK, hipP, hip);
    seg(kneeP, ankP, (l) => rodGeo(0.009, 0.008, l, 6), FEET, knee);
    P(ell([0.009, 0.008, 0.009], 6, 4), FEET, ankP, ankle);
    for (const dx of [-0.008, 0.008]) {
      const p1: V = [ankP[0] + dx * 0.6, 0.064, 0.048];
      const p2: V = [ankP[0] + dx, 0.046, 0.061];
      seg(ankP, p1, (l) => rodGeo(0.006, 0.0055, l, 5), FEET, toeF);
      seg(p1, p2, (l) => rodGeo(0.0055, 0.0045, l, 5), FEET, toeF);
      const cl = coneGeo(0.0035, 0.008, 4);
      orient(cl, [0, -1, -0.4], [0, 0, 1]);
      P(cl, CLAW, p2, toeF);
      const b1: V = [ankP[0] + dx * 0.6, 0.064, 0.012];
      const b2: V = [ankP[0] + dx, 0.046, 0.0];
      seg(ankP, b1, (l) => rodGeo(0.006, 0.0055, l, 5), FEET, toeB);
      seg(b1, b2, (l) => rodGeo(0.0055, 0.0045, l, 5), FEET, toeB);
      const cb = coneGeo(0.0035, 0.008, 4);
      orient(cb, [0, -1, 0.4], [0, 0, 1]);
      P(cb, CLAW, b2, toeB);
    }
  }

  // ---------- wings (spread, showing off) ----------
  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";
    const shP: V = [s * 0.075, 0.245, 0.0];
    const elP: V = [s * 0.165, 0.258, -0.025];
    const wrP: V = [s * 0.25, 0.252, -0.04];
    const tpP: V = [s * 0.37, 0.24, -0.065];
    const sh = J("shoulder" + L, shP, chest, "wing");
    const el = J("elbow" + L, elP, sh, "wing");
    const wr = J("wrist" + L, wrP, el, "wing");
    J("wingTip" + L, tpP, wr, "wing");
    const up: V = [0, s, 0];

    // leading edge
    seg(shP, elP, (l) => rodGeo(0.018, 0.013, l, 6), BLACK, sh);
    seg(elP, wrP, (l) => rodGeo(0.013, 0.01, l, 6), BLACK, el);
    seg(wrP, tpP, (l) => rodGeo(0.009, 0.005, l, 5), BLACK, wr);
    P(ell([0.012, 0.011, 0.012], 6, 5), BLACK, elP, el);
    P(ell([0.01, 0.009, 0.01], 6, 5), BLACK, wrP, wr);

    const along = (t: number): V => (t < 0.45 ? lerpV(shP, elP, t / 0.45) : lerpV(elP, wrP, (t - 0.45) / 0.55));

    // secondaries
    for (let k = 0; k < 8; k++) {
      const t = k / 7;
      const base = add(along(t), [0, -0.003, 0.008]);
      const d = norm([s * (0.2 + 0.3 * t), -0.12, -1]);
      const l = 0.09 + 0.035 * t;
      const g = taper(0.034, 0.006, 0.027, 0.005, l);
      orient(g, d, up);
      P(g, k % 2 ? BLACK : BLACK2, base, t < 0.45 ? sh : el);
      const sg = taper(0.003, 0.007, 0.002, 0.006, l * 0.8);
      orient(sg, d, up);
      P(sg, SHEEN, base, t < 0.45 ? sh : el);
    }
    // primaries
    for (let k = 0; k < 6; k++) {
      const f = k / 5;
      const base = lerpV(wrP, tpP, f * 0.85);
      const d = norm([s * (0.45 + 0.55 * f), -0.05, -(1 - 0.75 * f)]);
      const l = 0.12 + 0.045 * f;
      const g = taper(0.03, 0.006, 0.015, 0.005, l);
      orient(g, d, up);
      P(g, k % 2 ? BLACK2 : BLACK, base, wr);
      const sg = taper(0.003, 0.007, 0.002, 0.006, l * 0.85);
      orient(sg, d, up);
      P(sg, SHEEN, base, wr);
    }
    // greater coverts (navy sheen)
    for (let k = 0; k < 9; k++) {
      const t = k / 8;
      const base = add(along(t), [0, 0.007, 0.004]);
      const d = norm([s * (0.25 + 0.3 * t), -0.08, -1]);
      const g = taper(0.03, 0.006, 0.024, 0.005, 0.052);
      orient(g, d, up);
      P(g, SHEEN2, base, t < 0.45 ? sh : el);
    }
    // lesser coverts
    for (let k = 0; k < 6; k++) {
      const t = 0.05 + k * 0.17;
      const base = add(along(t), [0, 0.012, 0.008]);
      const d = norm([s * 0.35, -0.1, -1]);
      const g = taper(0.026, 0.006, 0.02, 0.005, 0.03);
      orient(g, d, up);
      P(g, SHEEN, base, t < 0.45 ? sh : el);
    }
    // primary coverts on the hand
    for (let k = 0; k < 4; k++) {
      const f = k / 3;
      const base = add(lerpV(wrP, tpP, f * 0.6), [0, 0.007, 0]);
      const d = norm([s * (0.5 + 0.4 * f), -0.05, -(1 - 0.6 * f)]);
      const g = taper(0.024, 0.006, 0.016, 0.005, 0.05);
      orient(g, d, up);
      P(g, SHEEN2, base, wr);
    }
  }

  // ---------- tail (cocked up) ----------
  {
    const side: V = [1, 0, 0];
    for (let i = 0; i < 5; i++) {
      const a = (i - 2) * 0.13;
      const d = norm(add(dT, mul(side, Math.sin(a))));
      const nrm = norm(cross(side, d));
      const Lt = 0.2 - Math.abs(i - 2) * 0.018;
      const base = add(t1p, [(i - 2) * 0.006, 0, 0]);
      const mid: V = add(base, mul(d, Lt / 2));
      const end: V = add(base, mul(d, Lt));
      const col = i % 2 ? BLACK2 : BLACK;
      seg(base, mid, (l) => taper(0.036, 0.008, 0.035, 0.008, l), col, tail1, nrm, 0.003);
      seg(mid, end, (l) => taper(0.035, 0.008, 0.028, 0.007, l), col, tail2, nrm);
      // rounded tip
      const tip = ell([0.015, 0.004, 0.012], 7, 4);
      orient(tip, d, nrm);
      P(tip, col, end, tail2);
      // shaft highlight
      seg(base, end, (l) => taper(0.003, 0.009, 0.002, 0.008, l * 0.9), SHEEN, tail1, nrm);
    }
    // upper tail coverts
    for (let i = 0; i < 3; i++) {
      const g = taper(0.04, 0.012, 0.03, 0.01, 0.06);
      const d = norm(add(dT, [(i - 1) * 0.15, 0, 0]));
      orient(g, d, norm(cross([1, 0, 0], dT)));
      P(g, SHEEN, add(t1p, [(i - 1) * 0.012, 0.012, 0.012]), tail1);
    }
  }

  return b.root;
}
```