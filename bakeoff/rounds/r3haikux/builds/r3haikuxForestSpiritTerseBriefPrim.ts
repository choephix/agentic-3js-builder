import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

type V = [number, number, number];
type Prof = [number, number][];
type Builder = ReturnType<typeof createBuilder>;
type Joint = ReturnType<Builder["joint"]>;

export const meta = {
  name: "Forest spirit",
  description:
    "A tall bark-and-moss woodland guardian: an antler crown in leaf, a leaf skirt and collar, toadstool shoulders, a spiral vine, a glowing heart and glowing eyes.",
};

// Lathe profiles as [radius, height] pairs with rising heights, relative to the body centre.
const TORSO: Prof = [
  [0.0, -0.44],
  [0.15, -0.42],
  [0.2, -0.26],
  [0.13, -0.08],
  [0.14, 0.04],
  [0.19, 0.2],
  [0.23, 0.33],
  [0.17, 0.42],
  [0.0, 0.44],
];

const HEAD: Prof = [
  [0.0, -0.2],
  [0.1, -0.18],
  [0.15, -0.11],
  [0.165, -0.02],
  [0.165, 0.07],
  [0.14, 0.15],
  [0.08, 0.2],
  [0.0, 0.22],
];

const dist = (a: V, c: V) => Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
const mix = (a: V, c: V, t: number): V => [
  a[0] + (c[0] - a[0]) * t,
  a[1] + (c[1] - a[1]) * t,
  a[2] + (c[2] - a[2]) * t,
];

// radius of a lathe profile at height y
function radiusAt(prof: Prof, y: number): number {
  for (let i = 0; i < prof.length - 1; i++) {
    const [r0, y0] = prof[i];
    const [r1, y1] = prof[i + 1];
    if (y >= y0 && y <= y1) return r0 + ((y - y0) / (y1 - y0)) * (r1 - r0);
  }
  return 0;
}

// A point on a lathed body centred at c. y is relative height, theta is the angle round
// the body (0 = front, +Z; +X is the spirit's left), lift pushes the point outward.
function onLathe(c: V, prof: Prof, y: number, theta: number, lift = 0): V {
  const R = radiusAt(prof, y) + lift;
  return [c[0] + R * Math.sin(theta), c[1] + y, c[2] + R * Math.cos(theta)];
}

export default function build() {
  const b = createBuilder({ name: "forest-spirit" });

  // palette
  const BARK = "#6b4a2d";
  const BARK_DARK = "#3a2818";
  const BARK_LIGHT = "#8c6640";
  const FACE = "#d6c9a2";
  const ANTLER = "#e8dcb9";
  const MOSS = "#4f7d37";
  const MOSS_LIGHT = "#86b257";
  const LEAF = "#3b8246";
  const LEAF_LIGHT = "#a2d46a";
  const GLOW = "#8ff7e0";
  const EMBER = "#ffd65c";
  const CAP = "#c4402c";
  const CAP_SPOT = "#f6efdc";
  const STEM = "#ece3cc";
  const DARK = "#1b130c";

  const T: V = [0, 1.36, 0]; // torso centre
  const HC: V = [0, 1.96, 0.03]; // head centre

  // ---- placement helpers: each piece is one primitive on one bone

  // tapered tube from a (radius r0) to c (radius r1)
  const bar = (a: V, c: V, r0: number, r1: number, color: string, bone: Joint) => {
    b.part(new THREE.CylinderGeometry(r1, r0, dist(a, c), 6, 1), color, {
      at: mix(a, c, 0.5),
      aim: c,
      bone,
    });
  };

  // flattened leaf or frond running from a to c
  const leaf = (a: V, c: V, w: number, color: string, bone: Joint) => {
    const g = new THREE.SphereGeometry(1, 8, 6);
    g.scale(w, dist(a, c) / 2, w * 0.35);
    b.part(g, color, { at: mix(a, c, 0.5), aim: c, bone });
  };

  // soft blob (knuckle, moss clump, eye, knot) centred on p
  const blob = (p: V, rx: number, ry: number, rz: number, color: string, bone: Joint) => {
    const g = new THREE.SphereGeometry(1, 10, 8);
    g.scale(rx, ry, rz);
    b.part(g, color, { at: p, bone });
  };

  // ring wrapped round a limb, its axis running from p toward c
  const hoop = (p: V, c: V, R: number, tube: number, color: string, bone: Joint) => {
    const g = new THREE.TorusGeometry(R, tube, 4, 10);
    g.rotateX(Math.PI / 2);
    b.part(g, color, { at: p, aim: c, bone });
  };

  // toadstool: stem, domed cap, cap spots; k sets its size
  const shroom = (p: V, k: number, bone: Joint) => {
    b.part(new THREE.CylinderGeometry(0.012 * k, 0.017 * k, 0.05 * k, 6), STEM, {
      at: [p[0], p[1] + 0.025 * k, p[2]],
      bone,
    });
    const profile: Prof = [
      [0, 0],
      [0.036, 0],
      [0.046, 0.012],
      [0.04, 0.024],
      [0.024, 0.034],
      [0, 0.04],
    ];
    const cap = new THREE.LatheGeometry(
      profile.map(([r, y]) => new THREE.Vector2(r * k, y * k)),
      8,
    );
    b.part(cap, CAP, { at: [p[0], p[1] + 0.05 * k, p[2]], bone });
    for (let i = 0; i < 4; i++) {
      const a = i * 1.57 + 0.5;
      blob(
        [p[0] + Math.cos(a) * 0.026 * k, p[1] + 0.082 * k, p[2] + Math.sin(a) * 0.026 * k],
        0.009 * k,
        0.009 * k,
        0.009 * k,
        CAP_SPOT,
        bone,
      );
    }
  };

  // ---- spine, neck and head
  const hips = b.joint("hips", { at: [0, 1.0, 0] });
  const spine = b.joint("spine", { at: [0, 1.24, 0], parent: hips });
  const chest = b.joint("chest", { at: [0, 1.48, 0], parent: spine });
  const neck = b.joint("neck", { at: [0, 1.7, 0.02], parent: chest });
  const head = b.joint("head", { at: HC, parent: neck });
  const jaw = b.joint("jaw", { at: [0, 1.84, -0.02], parent: head });

  // ---- torso: bark pillar, belt, spiral vine, knots, glowing heart
  b.part(
    new THREE.LatheGeometry(TORSO.map(([r, y]) => new THREE.Vector2(r, y)), 8),
    BARK,
    { at: T, bone: spine },
  );
  const belt = new THREE.TorusGeometry(radiusAt(TORSO, -0.1) + 0.012, 0.014, 4, 12);
  belt.rotateX(Math.PI / 2);
  b.part(belt, BARK_DARK, { at: [0, 1.26, 0], bone: spine });

  const vine: V[] = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    vine.push(onLathe(T, TORSO, -0.4 + 0.8 * t, 0.4 + t * Math.PI * 4.4, 0.014));
  }
  b.sweep(vine, 0.012, { color: LEAF });

  const knots: [number, number][] = [
    [-0.3, -0.75],
    [-0.14, 0.95],
    [0.06, -1.5],
    [0.24, 1.0],
    [-0.02, 2.2],
    [0.3, -2.3],
  ];
  for (const [y, th] of knots) {
    blob(onLathe(T, TORSO, y, th, 0.004), 0.03, 0.024, 0.014, BARK_DARK, spine);
  }

  const gem = onLathe(T, TORSO, 0.14, 0, 0);
  b.part(new THREE.TorusGeometry(0.052, 0.014, 5, 10), BARK_DARK, { at: gem, bone: spine });
  blob(onLathe(T, TORSO, 0.14, 0, 0.01), 0.04, 0.04, 0.03, GLOW, spine);

  // toadstools on the shoulders
  shroom(onLathe(T, TORSO, 0.34, 0.85), 1.0, spine);
  shroom(onLathe(T, TORSO, 0.3, 1.3), 0.7, spine);
  shroom(onLathe(T, TORSO, 0.36, -1.7), 0.8, spine);

  // ---- neck and leaf collar
  bar([0, 1.6, 0], [0, 1.84, 0.03], 0.07, 0.06, BARK, neck);
  for (let k = 0; k < 7; k++) {
    const th = (k / 7) * Math.PI * 2 + 0.3;
    leaf(
      [0.08 * Math.sin(th), 1.76, 0.08 * Math.cos(th)],
      [0.25 * Math.sin(th), 1.79, 0.25 * Math.cos(th)],
      0.034,
      k % 2 ? LEAF : MOSS,
      neck,
    );
  }

  // ---- head: pale bark face, nose, jaw, moss beard
  b.part(
    new THREE.LatheGeometry(HEAD.map(([r, y]) => new THREE.Vector2(r, y)), 10),
    FACE,
    { at: HC, bone: head },
  );
  bar(onLathe(HC, HEAD, -0.02, 0), onLathe(HC, HEAD, -0.06, 0, 0.05), 0.02, 0.005, BARK_DARK, head);

  blob([0, 1.83, 0.09], 0.075, 0.035, 0.085, FACE, jaw);
  blob([0, 1.85, 0.178], 0.036, 0.009, 0.016, DARK, jaw);
  for (const x of [-0.05, 0, 0.05]) {
    leaf([x, 1.82, 0.13], [x * 1.3, 1.74, 0.19], 0.02, MOSS, jaw);
  }

  // ---- both sides: arms, legs, brow, eyes, ears, antlers
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const P = (x: number, y: number, z: number): V => [x * s, y, z];
    const Q = (y: number, theta: number, lift = 0): V => onLathe(HC, HEAD, y, theta * s, lift);

    // joints
    const shoulder = b.joint(`shoulder${S}`, { at: P(0.16, 1.6, 0), parent: chest });
    const elbow = b.joint(`elbow${S}`, { at: P(0.5, 1.5, 0.02), parent: shoulder });
    const wrist = b.joint(`wrist${S}`, { at: P(0.78, 1.42, 0.05), parent: elbow });
    const index = b.joint(`index${S}`, { at: P(0.84, 1.43, 0.13), parent: wrist });
    const middle = b.joint(`middle${S}`, { at: P(0.86, 1.43, 0.06), parent: wrist });
    const ring = b.joint(`ring${S}`, { at: P(0.85, 1.42, -0.01), parent: wrist });
    const thumb = b.joint(`thumb${S}`, { at: P(0.8, 1.45, 0.16), parent: wrist });
    const hip = b.joint(`hip${S}`, { at: P(0.12, 0.98, 0), parent: hips });
    const knee = b.joint(`knee${S}`, { at: P(0.13, 0.52, 0.03), parent: hip });
    const ankle = b.joint(`ankle${S}`, { at: P(0.13, 0.1, 0), parent: knee });
    const toe = b.joint(`toe${S}`, { at: P(0.13, 0.04, 0.12), parent: ankle });

    // arm: bark limb, moss wrap, leaf sprigs, twig fingers with leaf tips
    const sh = P(0.16, 1.6, 0);
    const el = P(0.5, 1.5, 0.02);
    const wr = P(0.78, 1.42, 0.05);
    blob(sh, 0.062, 0.062, 0.062, BARK_LIGHT, shoulder);
    bar(sh, el, 0.05, 0.04, BARK, shoulder);
    blob(el, 0.042, 0.042, 0.042, BARK_LIGHT, elbow);
    bar(el, wr, 0.04, 0.028, BARK, elbow);
    hoop(mix(el, wr, 0.6), wr, 0.042, 0.011, MOSS_LIGHT, elbow);
    leaf(P(0.6, 1.47, 0.03), P(0.64, 1.6, 0.1), 0.036, LEAF, elbow);
    leaf(P(0.64, 1.45, 0.02), P(0.72, 1.52, -0.05), 0.03, LEAF_LIGHT, elbow);
    blob(P(0.8, 1.43, 0.06), 0.055, 0.028, 0.068, BARK_LIGHT, wrist);
    bar(P(0.84, 1.43, 0.13), P(0.98, 1.47, 0.19), 0.02, 0.007, ANTLER, index);
    blob(P(0.98, 1.47, 0.19), 0.022, 0.022, 0.022, LEAF_LIGHT, index);
    bar(P(0.86, 1.43, 0.06), P(1.02, 1.44, 0.07), 0.021, 0.007, ANTLER, middle);
    blob(P(1.02, 1.44, 0.07), 0.022, 0.022, 0.022, LEAF, middle);
    bar(P(0.85, 1.42, -0.01), P(0.99, 1.4, -0.06), 0.02, 0.007, ANTLER, ring);
    blob(P(0.99, 1.4, -0.06), 0.02, 0.02, 0.02, LEAF_LIGHT, ring);
    bar(P(0.8, 1.45, 0.16), P(0.86, 1.56, 0.22), 0.022, 0.009, ANTLER, thumb);
    blob(P(0.86, 1.56, 0.22), 0.02, 0.02, 0.02, LEAF, thumb);

    // leg: bark stilt, knee knob, moss wrap, root foot and root toes
    const hp = P(0.12, 0.98, 0);
    const kn = P(0.13, 0.52, 0.03);
    const an = P(0.13, 0.1, 0);
    bar(hp, kn, 0.075, 0.055, BARK, hip);
    blob(kn, 0.06, 0.06, 0.06, BARK_LIGHT, knee);
    bar(kn, an, 0.05, 0.036, BARK, knee);
    hoop(mix(kn, an, 0.4), an, 0.052, 0.012, MOSS, knee);
    blob(P(0.13, 0.05, 0.06), 0.05, 0.05, 0.11, BARK_DARK, ankle);
    for (const dx of [-0.04, 0, 0.04]) {
      bar(P(0.13 + dx, 0.04, 0.12), P(0.13 + dx * 1.7, 0.0, 0.2), 0.02, 0.007, BARK_DARK, toe);
    }

    // head: brow ridge, eye sockets with glowing eyes, cheek veins, leaf ears
    blob(Q(0.065, 0.3), 0.045, 0.013, 0.02, BARK_DARK, head);
    blob(Q(0.01, 0.4, 0.006), 0.034, 0.026, 0.02, DARK, head);
    blob(Q(0.01, 0.4, 0.016), 0.017, 0.017, 0.012, GLOW, head);
    bar(Q(-0.04, 0.55, 0.004), Q(0.03, 0.9, 0.004), 0.007, 0.005, MOSS_LIGHT, head);
    leaf(P(0.14, 1.98, -0.02), P(0.3, 2.02, -0.06), 0.03, LEAF, head);

    // antlers: a branching crown, leafed at the tips
    const b0 = P(0.08, 2.12, -0.01);
    const b1 = P(0.14, 2.3, -0.03);
    const b2 = P(0.2, 2.46, -0.06);
    const t1 = P(0.25, 2.58, -0.1);
    const a0 = P(0.18, 2.24, 0.12);
    const a1 = P(0.32, 2.38, 0.0);
    bar(b0, b1, 0.03, 0.024, ANTLER, head);
    bar(b1, b2, 0.024, 0.017, ANTLER, head);
    bar(b2, t1, 0.017, 0.008, ANTLER, head);
    bar(b1, a1, 0.018, 0.008, ANTLER, head);
    bar(b0, a0, 0.02, 0.008, ANTLER, head);
    leaf(t1, P(0.29, 2.7, -0.14), 0.045, LEAF_LIGHT, head);
    leaf(a1, P(0.42, 2.46, 0.02), 0.04, LEAF, head);
    leaf(a0, P(0.25, 2.3, 0.22), 0.035, MOSS_LIGHT, head);
    leaf(mix(b1, b2, 0.5), P(0.23, 2.42, 0.06), 0.03, MOSS, head);
  }

  // ---- leaf skirt hanging from the hips
  for (let k = 0; k < 9; k++) {
    const th = (k / 9) * Math.PI * 2 + 0.2;
    const top: V = [0.15 * Math.sin(th), 1.0, 0.15 * Math.cos(th)];
    const tip: V = [0.3 * Math.sin(th), 0.7, 0.3 * Math.cos(th)];
    leaf(top, tip, 0.05, [MOSS, LEAF, LEAF_LIGHT][k % 3], hips);
  }

  // ---- fireflies drifting round her
  const sparks: V[] = [
    [0.42, 1.9, 0.22],
    [-0.46, 2.15, 0.12],
    [0.52, 1.2, 0.3],
    [-0.38, 1.34, 0.36],
    [0.28, 2.5, -0.18],
    [-0.3, 0.66, 0.38],
    [0.1, 2.42, 0.3],
    [-0.56, 0.9, -0.1],
  ];
  for (const p of sparks) blob(p, 0.017, 0.017, 0.017, EMBER, hips);

  // ---- a mossy hummock and toadstools at her feet
  blob([0.34, 0.04, 0.16], 0.16, 0.05, 0.12, MOSS, hips);
  leaf([0.28, 0.07, 0.12], [0.3, 0.16, 0.1], 0.03, LEAF_LIGHT, hips);
  leaf([0.38, 0.07, 0.22], [0.42, 0.14, 0.26], 0.025, LEAF, hips);
  shroom([-0.34, 0, 0.12], 1.2, hips);
  shroom([-0.3, 0, 0.26], 0.8, hips);
  shroom([-0.44, 0, 0.2], 0.6, hips);

  return b.root;
}
