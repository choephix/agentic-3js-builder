import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "forest-spirit",
  description:
    "A stylised forest spirit: a bark-bodied guardian with a birch-pale face, glowing teal eyes, a moss cap and beard, a branching crown hung with leaves, a leaf skirt, a mushroom on one shoulder and root feet.",
};

type V = [number, number, number];

const COL = {
  bark: "#6d4a2b",
  barkDark: "#3b2716",
  barkLight: "#97693c",
  birch: "#ebdcbc",
  moss: "#5f9e36",
  mossLight: "#94d051",
  mossDeep: "#2e5c27",
  leaf: "#7dcf4f",
  leafDeep: "#3d8b3b",
  leafGold: "#e6a43d",
  glow: "#8ff4de",
  mushroom: "#d8452d",
  cream: "#f5eedb",
  flower: "#f7d44c",
  mouth: "#24150c",
};
const LEAVES = [COL.leaf, COL.leafDeep, COL.leafGold, COL.mossLight];
const MOSSES = [COL.moss, COL.mossLight, COL.mossDeep];

/** Unit vector. */
const unit = (d: V): V => {
  const n = Math.hypot(d[0], d[1], d[2]);
  return [d[0] / n, d[1] / n, d[2] / n];
};
/** Point p moved t metres along direction d. */
const along = (p: V, d: V, t: number): V => {
  const u = unit(d);
  return [p[0] + u[0] * t, p[1] + u[1] * t, p[2] + u[2] * t];
};
/** Mirror across the body's centre plane (x -> -x when s = -1). */
const mirror = (p: V, s: number): V => [p[0] * s, p[1], p[2]];

/** Turn a geometry whose long axis is +Z so that axis points along d. */
function aimZ(g: THREE.BufferGeometry, d: V): THREE.BufferGeometry {
  const [x, y, z] = unit(d);
  g.rotateX(Math.asin(-y));
  g.rotateY(Math.atan2(x, z));
  return g;
}
/** Pointed leaf: a flattened octahedron with tips on its long axis. */
function leafGeo(half: number, wid: number, thick: number, d: V) {
  const g = new THREE.OctahedronGeometry(1, 0);
  g.scale(wid, thick, half);
  return aimZ(g, d);
}
/** Tapered twig or root: base at the start of d, tip at the end. */
function twigGeo(len: number, rBase: number, rTip: number, d: V) {
  const g = new THREE.CylinderGeometry(rTip, rBase, len, 5, 1, false);
  g.rotateX(Math.PI / 2);
  return aimZ(g, d);
}
/** Squashed ellipsoid centred on the origin. */
function blob(rx: number, ry: number, rz: number, seg = 8, rings = 6) {
  const g = new THREE.SphereGeometry(1, seg, rings);
  g.scale(rx, ry, rz);
  return g;
}

export default function build() {
  const b = createBuilder({ name: "forest-spirit" });
  const rnd = rng(7);
  const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(rnd() * xs.length) % xs.length];

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.98, 0] });
  const spine = b.joint("spine", { at: [0, 1.16, 0], parent: hips });
  const chest = b.joint("chest", { at: [0, 1.36, 0], parent: spine });
  const neck = b.joint("neck", { at: [0, 1.5, 0.02], parent: chest });
  const head = b.joint("head", { at: [0, 1.64, 0.03], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 1.6, -0.02], parent: head });

  const mkSide = (s: number, sfx: string) => {
    const hip = b.joint(`hip${sfx}`, { at: [0.11 * s, 0.97, 0], parent: hips });
    const knee = b.joint(`knee${sfx}`, { at: [0.12 * s, 0.5, 0.02], parent: hip });
    const ankle = b.joint(`ankle${sfx}`, { at: [0.12 * s, 0.07, 0], parent: knee });
    const shoulder = b.joint(`shoulder${sfx}`, { at: [0.19 * s, 1.47, 0], parent: chest });
    const elbow = b.joint(`elbow${sfx}`, { at: [0.38 * s, 1.25, 0.05], parent: shoulder });
    const wrist = b.joint(`wrist${sfx}`, { at: [0.5 * s, 1.05, 0.12], parent: elbow });
    return { s, hip, knee, ankle, shoulder, elbow, wrist };
  };
  const sides = [mkSide(1, "L"), mkSide(-1, "R")];

  // ---------- torso: stacked bark masses ----------
  b.part(blob(0.15, 0.1, 0.11), COL.barkDark, { at: [0, 0.99, 0], bone: hips });
  b.part(blob(0.14, 0.12, 0.11), COL.bark, { at: [0, 1.14, 0], bone: spine });
  const torso = b.part(blob(0.18, 0.19, 0.13, 10, 8), COL.bark, { at: [0, 1.31, 0], bone: chest });
  const shoulderBand = b.part(blob(0.24, 0.07, 0.13, 12, 5), COL.barkLight, { at: [0, 1.45, 0], bone: chest });
  const torsoS = b.surface(torso);
  const shoulderS = b.surface(shoulderBand);

  // bark knots and moss clumps spread over the chest on a golden-angle spiral
  for (let i = 0; i < 11; i++) {
    const a = i * 2.39996;
    const y = 1.16 + ((i * 0.37) % 1) * 0.32;
    const hit = torsoS.nearest([Math.sin(a) * 0.45, y, Math.cos(a) * 0.45]);
    if (i % 3 === 1) {
      b.stick(blob(0.013, 0.011, 0.013, 6, 4), COL.barkDark, hit);
    } else {
      const r = 0.026 + rnd() * 0.014;
      b.stick(blob(r, r * 0.7, r, 7, 5), pick(MOSSES), hit);
    }
  }

  // moss over both shoulders
  for (const { s } of sides) {
    for (const p of [[0.21, 1.58, 0.0], [0.17, 1.55, -0.08], [0.25, 1.45, 0.07]] as V[]) {
      const hit = shoulderS.nearest(mirror(p, s));
      const r = 0.024 + rnd() * 0.01;
      b.stick(blob(r, r * 0.7, r, 7, 5), pick(MOSSES), hit);
    }
  }

  // ---------- mushroom cluster on the left shoulder (+X) ----------
  b.part(new THREE.CylinderGeometry(0.016, 0.022, 0.05, 7), COL.cream, { at: [0.2, 1.5, 0.02], bone: chest });
  const capPart = b.part(
    new THREE.SphereGeometry(0.06, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2),
    COL.mushroom,
    { at: [0.2, 1.52, 0.02], bone: chest },
  );
  const capS = b.surface(capPart);
  for (let i = 0; i < 5; i++) {
    const a = i * 1.26;
    const hit = capS.nearest([0.2 + Math.cos(a) * 0.04, 1.62, 0.02 + Math.sin(a) * 0.04]);
    b.stick(blob(0.011, 0.008, 0.011, 6, 4), COL.cream, hit);
  }

  // ---------- a moss vine draped over the left shoulder and down the back ----------
  const vine: V[] = [
    [0.2, 1.5, -0.03],
    [0.22, 1.36, -0.08],
    [0.19, 1.2, -0.12],
    [0.14, 1.04, -0.12],
  ];
  b.sweep(vine, 0.011, { color: COL.mossDeep, bone: chest });
  vine.slice(1).forEach((p, i) => {
    const d: V = [0.7, -0.35 - i * 0.1, -0.6];
    b.part(leafGeo(0.05, 0.02, 0.005, d), pick(LEAVES), { at: along(p, d, 0.035), bone: chest });
  });

  // ---------- leaf skirt hanging from the hips ----------
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.13;
    const d: V = [Math.sin(a) * 0.62, -0.78, Math.cos(a) * 0.62];
    const base: V = [Math.sin(a) * 0.13, 1.06, Math.cos(a) * 0.13];
    b.part(leafGeo(0.13, 0.045, 0.008, d), LEAVES[i % LEAVES.length], { at: along(base, d, 0.13), bone: hips });
  }
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.5;
    const d: V = [Math.sin(a) * 0.3, -0.95, Math.cos(a) * 0.3];
    const base: V = [Math.sin(a) * 0.12, 1.02, Math.cos(a) * 0.12];
    b.part(leafGeo(0.1, 0.04, 0.008, d), LEAVES[(i + 2) % LEAVES.length], { at: along(base, d, 0.1), bone: hips });
  }

  // ---------- neck ----------
  b.sweep(
    [
      [0, 1.34, 0],
      [0, 1.45, 0.01],
      [0, 1.58, 0.02],
    ],
    0.05,
    { color: COL.bark, bone: neck },
  );

  // ---------- head: birch-pale face under a moss cap ----------
  const skull = b.part(blob(0.14, 0.155, 0.135, 10, 8), COL.birch, { at: [0, 1.7, 0], bone: head });
  const hairCap = b.part(blob(0.15, 0.085, 0.145, 10, 6), COL.mossDeep, { at: [0, 1.79, -0.02], bone: head });
  const faceS = b.surface(skull);
  const hairS = b.surface(hairCap);

  // glowing eyes, seated on the face
  for (const s of [1, -1]) {
    b.stick(blob(0.03, 0.03, 0.03, 10, 8), COL.glow, faceS.nearest([0.052 * s, 1.715, 0.15]));
  }
  // arched bark brows that follow the skull
  for (const s of [1, -1]) {
    const browPts: V[] = [
      [0.02, 1.76, 0.16],
      [0.07, 1.772, 0.145],
      [0.115, 1.75, 0.13],
    ];
    b.sweep(
      browPts.map((p) => faceS.nearest(mirror(p, s))),
      0.011,
      { color: COL.barkDark, bone: head },
    );
  }
  // bark knot nose
  b.stick(blob(0.022, 0.03, 0.026, 7, 5), COL.bark, faceS.nearest([0, 1.67, 0.16]));
  // upper mouth slit on the head; lower jaw hangs from the jaw joint
  b.part(new THREE.BoxGeometry(0.05, 0.012, 0.03), COL.mouth, {
    at: faceS.nearest([0, 1.618, 0.16]),
    bone: head,
  });
  b.part(blob(0.045, 0.024, 0.06, 9, 6), COL.birch, { at: [0, 1.58, 0.085], bone: jaw });

  // moss beard hanging from the jaw
  b.sweep(
    [
      [-0.035, 1.58, 0.12],
      [-0.04, 1.5, 0.135],
      [-0.045, 1.43, 0.13],
    ],
    0.012,
    { color: COL.moss, bone: jaw },
  );
  b.sweep(
    [
      [0, 1.575, 0.13],
      [0, 1.49, 0.15],
      [0.005, 1.4, 0.14],
    ],
    0.013,
    { color: COL.mossLight, bone: jaw },
  );
  b.sweep(
    [
      [0.035, 1.58, 0.12],
      [0.04, 1.5, 0.135],
      [0.045, 1.44, 0.13],
    ],
    0.012,
    { color: COL.moss, bone: jaw },
  );

  // moss clumps over the cap
  for (let i = 0; i < 8; i++) {
    const a = i * 2.39996 + 0.4;
    const hit = hairS.nearest([Math.sin(a) * 0.22, 1.9, -0.02 + Math.cos(a) * 0.22]);
    const r = 0.026 + rnd() * 0.012;
    b.stick(blob(r, r * 0.7, r, 7, 5), pick(MOSSES), hit);
  }
  // little yellow flowers in the moss
  for (const p of [[0.1, 1.9, 0.08], [-0.12, 1.87, 0.06], [0.02, 1.9, -0.1]] as V[]) {
    b.stick(blob(0.014, 0.014, 0.014, 6, 4), COL.flower, hairS.nearest(p));
  }
  // two moss strands falling down the back of the head
  for (const s of [1, -1]) {
    const top = hairS.nearest([s * 0.11, 1.84, -0.11]);
    const mid = faceS.nearest([s * 0.14, 1.7, -0.08]);
    const low = faceS.nearest([s * 0.12, 1.6, -0.1]);
    b.sweep([top, mid, low], 0.013, { color: COL.mossDeep, bone: head });
  }

  // ---------- branching crown in bark, hung with leaves ----------
  const tipDirs: V[] = [
    [0.6, 0.7, 0.25],
    [0.95, 0.15, -0.2],
    [0.35, 0.5, -0.8],
    [0.5, 0.2, 0.9],
  ];
  for (const s of [1, -1]) {
    const m = (pts: V[]) => pts.map((p) => mirror(p, s));
    b.sweep(m([[0.07, 1.8, 0], [0.12, 1.93, -0.02], [0.18, 2.0, -0.04]]), 0.024, { color: COL.bark, bone: head });
    b.sweep(m([[0.18, 2.0, -0.04], [0.24, 2.07, -0.06], [0.3, 2.11, -0.07]]), 0.016, { color: COL.bark, bone: head });
    b.sweep(m([[0.12, 1.93, -0.02], [0.19, 1.97, 0.05], [0.25, 2.02, 0.1]]), 0.013, { color: COL.bark, bone: head });
    b.sweep(m([[0.18, 2.0, -0.04], [0.215, 2.13, -0.02], [0.22, 2.22, 0]]), 0.012, { color: COL.bark, bone: head });

    // leaf clusters at each branch tip
    for (const tip of [[0.3, 2.11, -0.07], [0.25, 2.02, 0.1], [0.22, 2.22, 0]] as V[]) {
      for (const dir of tipDirs) {
        const t = mirror(tip, s);
        const d = mirror(dir, s);
        b.part(leafGeo(0.05, 0.022, 0.005, d), pick(LEAVES), { at: along(t, d, 0.04), bone: head });
      }
    }
    // flower buds at the forks
    for (const p of [[0.12, 1.93, -0.02], [0.19, 1.97, 0.05]] as V[]) {
      b.part(blob(0.013, 0.013, 0.013, 6, 4), COL.flower, { at: mirror(p, s), bone: head });
    }
  }

  // ---------- arms, hands, legs and root feet ----------
  for (const k of sides) {
    const { s, hip, knee, ankle, shoulder, elbow, wrist } = k;
    const P = (x: number, y: number, z: number): V => [x * s, y, z];

    // arm: shoulder -> elbow -> wrist, with a bark knob at the elbow
    b.sweep([P(0.19, 1.47, 0), P(0.29, 1.36, 0.02), P(0.38, 1.25, 0.05)], 0.05, {
      color: COL.bark,
      bone: shoulder,
    });
    b.part(blob(0.045, 0.045, 0.045, 8, 6), COL.barkDark, { at: P(0.38, 1.25, 0.05), bone: elbow });
    b.sweep([P(0.38, 1.25, 0.05), P(0.45, 1.15, 0.09), P(0.5, 1.05, 0.12)], 0.04, {
      color: COL.bark,
      bone: elbow,
    });

    // leaf hand: a leaf palm with four twig fingers
    const W = P(0.5, 1.05, 0.12);
    const palm = unit(P(0.8, -0.35, 0.2));
    b.part(leafGeo(0.055, 0.03, 0.012, palm), COL.leaf, { at: along(W, palm, 0.055), bone: wrist });
    const T = along(W, palm, 0.11);
    const fingers: [V, number][] = [
      [P(0.9, -0.5, 0.3), 0.085],
      [P(1.0, -0.15, -0.1), 0.1],
      [P(0.75, -0.8, -0.05), 0.075],
      [P(0.55, 0.15, 0.8), 0.07],
    ];
    for (const [d, len] of fingers) {
      b.part(twigGeo(len, 0.012, 0.005, d), COL.bark, { at: along(T, d, len / 2), bone: wrist });
    }

    // leg: thigh, moss knee pad, shin
    b.sweep([P(0.11, 0.97, 0), P(0.12, 0.73, 0.01), P(0.12, 0.5, 0.02)], 0.065, {
      color: COL.bark,
      bone: hip,
    });
    b.part(blob(0.07, 0.05, 0.065, 8, 6), COL.mossDeep, { at: P(0.12, 0.5, 0.02), bone: knee });
    b.sweep([P(0.12, 0.5, 0.02), P(0.12, 0.3, 0.01), P(0.12, 0.07, 0)], 0.05, {
      color: COL.bark,
      bone: knee,
    });

    // root foot: a squashed root mass, three root toes, two roots reaching into the soil
    b.part(blob(0.055, 0.04, 0.11, 8, 6), COL.barkDark, { at: P(0.12, 0.04, 0.06), bone: ankle });
    for (const ox of [-0.03, 0, 0.03]) {
      const base = P(0.12 + ox, 0.035, 0.13);
      const d = P(ox * 0.6, -0.3, 1);
      b.part(twigGeo(0.06, 0.014, 0.006, d), COL.bark, { at: along(base, d, 0.03), bone: ankle });
    }
    b.sweep([P(0.12, 0.03, 0.02), P(0.17, 0.018, 0.06), P(0.25, 0.012, 0.08)], 0.012, {
      color: COL.bark,
      bone: ankle,
    });
    b.sweep([P(0.12, 0.03, -0.02), P(0.18, 0.016, -0.05), P(0.26, 0.012, -0.07)], 0.012, {
      color: COL.bark,
      bone: ankle,
    });
  }

  return b.root;
}
