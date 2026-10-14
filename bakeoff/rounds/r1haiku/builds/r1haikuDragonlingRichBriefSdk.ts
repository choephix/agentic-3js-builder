import * as THREE from "three";
import { createBuilder, frame } from "../../../../src/index";

type V = [number, number, number];

export const meta = {
  name: "Baby dragon",
  description: "A teal baby dragon sitting proudly beside its broken speckled egg.",
};

const TEAL = "#2a9d8f";
const TEAL_LT = "#3fb3a1";
const TEAL_DK = "#1f7a70";
const BELLY = "#f2d98a";
const ORANGE = "#f28c28";
const HORN = "#eadcb4";
const AMBER = "#ffb000";
const PUPIL = "#1a1a1a";
const GLINT = "#fff7e0";
const WING = "#e9a23b";
const WING_BONE = "#c98a2e";
const CLAW = "#3b3b3b";
const TOOTH = "#fffaf0";
const EGG = "#f4ecd8";
const EGG_IN = "#efe2bf";
const SPECK = "#7a4a2a";
const SMOKE = "#e3e3e3";
const NOSTRIL = "#14302d";

const sub = (a: V, c: V): V => [a[0] - c[0], a[1] - c[1], a[2] - c[2]];
const lenOf = (a: V) => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V): V => {
  const l = lenOf(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const midOf = (a: V, c: V): V => [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
const lerp3 = (a: V, c: V, t: number): V => [
  a[0] + (c[0] - a[0]) * t,
  a[1] + (c[1] - a[1]) * t,
  a[2] + (c[2] - a[2]) * t,
];

export default function build() {
  const b = createBuilder({ name: "baby-dragon" });

  // ---------- helpers (geometry is canonical, placed by frames) ----------
  const put = (geo: THREE.BufferGeometry, color: string, at: V, dir: V = [0, 1, 0]) => {
    b.stick(geo, color, frame(at, unit(dir)));
  };
  const ell = (rx: number, ry: number, rz: number, color: string, at: V) =>
    put(new THREE.SphereGeometry(1, 14, 10).scale(rx, ry, rz), color, at);
  const knob = (at: V, r: number, color: string) =>
    put(new THREE.SphereGeometry(r, 10, 8), color, at);
  const seg = (a: V, c: V, r0: number, r1: number, color: string) => {
    const L = lenOf(sub(c, a));
    put(new THREE.CylinderGeometry(r1, r0, L, 10, 1), color, midOf(a, c), sub(c, a));
  };
  const cone = (r: number, h: number, color: string, at: V, dir: V) => {
    const g = new THREE.ConeGeometry(r, h, 8, 1);
    g.translate(0, h / 2, 0); // base sits at the anchor, tip along dir
    put(g, color, at, dir);
  };

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.12, -0.03] });
  const chest = b.joint("chest", { at: [0, 0.24, 0.03], parent: hips });
  const neck1 = b.joint("neck1", { at: [0, 0.31, 0.08], parent: chest });
  const neck2 = b.joint("neck2", { at: [0, 0.38, 0.14], parent: neck1 });
  const head = b.joint("head", { at: [0, 0.45, 0.17], parent: neck2 });
  const jaw = b.joint("jaw", { at: [0, 0.40, 0.13], parent: head });
  const tail1 = b.joint("tail1", { at: [0, 0.10, -0.10], parent: hips });
  const tail2 = b.joint("tail2", { at: [0, 0.08, -0.20], parent: tail1 });
  const tail3 = b.joint("tail3", { at: [0, 0.07, -0.29], parent: tail2 });

  const P = {
    neck1: [0, 0.31, 0.08] as V,
    neck2: [0, 0.38, 0.14] as V,
    head: [0, 0.45, 0.17] as V,
    tail1: [0, 0.10, -0.10] as V,
    tail2: [0, 0.08, -0.20] as V,
    tail3: [0, 0.07, -0.29] as V,
  };

  // ---------- body ----------
  ell(0.10, 0.09, 0.10, TEAL, [0, 0.13, -0.05]); // rump
  ell(0.10, 0.13, 0.12, TEAL, [0, 0.20, 0.0]); // torso
  ell(0.072, 0.10, 0.07, BELLY, [0, 0.18, 0.07]); // buttery belly
  ell(0.06, 0.05, 0.06, BELLY, [0, 0.12, 0.08]); // lower belly patch

  // scale texture on the back and flanks (flattened discs on the torso surface)
  const TR: V = [0.10, 0.13, 0.12];
  const TC: V = [0, 0.20, 0];
  for (let i = 0; i < 6; i++) {
    const th = 0.5 + i * 0.22;
    for (let j = 0; j < 10; j++) {
      const ph = (j * 2 * Math.PI) / 10 + (i % 2) * 0.3;
      const sx = Math.sin(th) * Math.cos(ph);
      const sy = Math.cos(th);
      const sz = Math.sin(th) * Math.sin(ph);
      const p: V = [TC[0] + TR[0] * sx, TC[1] + TR[1] * sy, TC[2] + TR[2] * sz];
      if (p[2] > 0.035 || p[1] < 0.1) continue;
      const nn = unit([sx / TR[0], sy / TR[1], sz / TR[2]]);
      const at: V = [p[0] + nn[0] * 0.004, p[1] + nn[1] * 0.004, p[2] + nn[2] * 0.004];
      put(
        new THREE.SphereGeometry(0.02, 6, 4).scale(1, 0.5, 1),
        (i + j) % 2 ? TEAL_LT : TEAL_DK,
        at,
        nn,
      );
    }
  }

  // orange spines down the back
  for (let k = 0; k < 7; k++) {
    const th = 0.25 + k * 0.2;
    const p: V = [0, 0.2 + 0.13 * Math.cos(th), -0.12 * Math.sin(th)];
    const n = unit([0, Math.cos(th) / 0.13, -Math.sin(th) / 0.12]);
    cone(0.012, 0.05, ORANGE, p, n);
  }

  // ---------- neck and head ----------
  knob(P.neck1, 0.055, TEAL);
  knob(P.neck2, 0.052, TEAL);
  seg(P.neck1, P.neck2, 0.056, 0.05, TEAL);
  seg(P.neck2, P.head, 0.05, 0.046, TEAL);
  for (const t of [0.2, 0.5, 0.8]) {
    const np = lerp3(P.neck1, P.neck2, t);
    const n = unit([0, 0.35, -0.94]);
    const base: V = [np[0] + n[0] * 0.05, np[1] + n[1] * 0.05, np[2] + n[2] * 0.05];
    cone(0.011, 0.045, ORANGE, base, n);
  }

  ell(0.095, 0.085, 0.10, TEAL, [0, 0.46, 0.19]); // skull
  ell(0.055, 0.045, 0.07, TEAL, [0, 0.445, 0.27]); // snout
  ell(0.04, 0.018, 0.09, BELLY, [0, 0.37, 0.25]); // lower jaw (open grin)

  for (const s of [1, -1]) {
    // stubby horns
    cone(0.018, 0.065, HORN, [s * 0.05, 0.52, 0.14], unit([s * 0.35, 1, -0.45]));
    // brow ridges
    ell(0.03, 0.02, 0.04, TEAL_DK, [s * 0.05, 0.515, 0.24]);
    // big amber eyes with slit pupils and a glint
    ell(0.03, 0.03, 0.03, AMBER, [s * 0.05, 0.47, 0.275]);
    ell(0.009, 0.018, 0.006, PUPIL, [s * 0.05, 0.47, 0.303]);
    knob([s * 0.058, 0.48, 0.305], 0.006, GLINT);
    // nostril
    ell(0.008, 0.006, 0.012, NOSTRIL, [s * 0.022, 0.455, 0.33]);
  }

  // toothy grin: upper teeth point down, lower teeth point up
  for (const x of [-0.03, -0.015, 0, 0.015, 0.03]) {
    cone(0.006, 0.02, TOOTH, [x, 0.405, 0.31], [0, -1, 0.05]);
    cone(0.005, 0.016, TOOTH, [x, 0.385, 0.31], [0, 1, 0.05]);
  }

  // smoke wisp curling out of the left nostril
  const smoke: [V, number][] = [
    [[0.03, 0.49, 0.35], 0.011],
    [[0.046, 0.53, 0.365], 0.015],
    [[0.04, 0.58, 0.37], 0.019],
    [[0.022, 0.63, 0.37], 0.023],
    [[0.035, 0.685, 0.36], 0.027],
  ];
  for (const [p, r] of smoke) knob(p, r, SMOKE);

  // ---------- tail with spade ----------
  knob(P.tail1, 0.05, TEAL);
  seg(P.tail1, P.tail2, 0.052, 0.045, TEAL);
  knob(P.tail2, 0.045, TEAL);
  seg(P.tail2, P.tail3, 0.045, 0.03, TEAL);
  knob(P.tail3, 0.03, TEAL);
  seg(P.tail3, [0, 0.082, -0.355], 0.03, 0.02, TEAL);
  cone(0.012, 0.05, ORANGE, [0, 0.15, -0.1], unit([0, 1, -0.3]));
  cone(0.011, 0.045, ORANGE, [0, 0.12, -0.2], unit([0, 1, -0.3]));

  // spade: flat diamond in the vertical plane of the tail (shape x = -z)
  const spadeShape = new THREE.Shape([
    new THREE.Vector2(0.35, 0.082),
    new THREE.Vector2(0.4, 0.128),
    new THREE.Vector2(0.45, 0.082),
    new THREE.Vector2(0.4, 0.036),
  ]);
  const spadeGeo = new THREE.ExtrudeGeometry(spadeShape, { depth: 0.014, bevelEnabled: false });
  spadeGeo.translate(0, 0, -0.007);
  spadeGeo.rotateY(Math.PI / 2);
  put(spadeGeo, ORANGE, [0, 0, 0]);

  // ---------- legs, arms, wings (mirrored) ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    // hind leg: haunch, folded shin, flat foot
    const hip = b.joint("hip" + side, { at: [s * 0.08, 0.10, 0.02], parent: hips });
    const knee = b.joint("knee" + side, { at: [s * 0.095, 0.05, 0.10], parent: hip });
    const ankle = b.joint("ankle" + side, { at: [s * 0.09, 0.03, 0.13], parent: knee });
    ell(0.05, 0.06, 0.07, TEAL, [s * 0.075, 0.11, 0.01]);
    knob([s * 0.08, 0.10, 0.02], 0.03, TEAL);
    seg([s * 0.08, 0.10, 0.02], [s * 0.095, 0.05, 0.10], 0.03, 0.026, TEAL);
    knob([s * 0.095, 0.05, 0.10], 0.026, TEAL);
    seg([s * 0.095, 0.05, 0.10], [s * 0.09, 0.03, 0.13], 0.026, 0.022, TEAL);
    knob([s * 0.09, 0.03, 0.13], 0.02, TEAL);
    ell(0.04, 0.022, 0.06, TEAL_DK, [s * 0.09, 0.022, 0.165]);
    for (const d of [-0.02, 0, 0.02]) {
      cone(0.007, 0.024, CLAW, [s * 0.09 + d, 0.02, 0.215], [0, -0.2, 1]);
    }

    // front arm: shoulder, elbow, wrist, hand with claws
    const sh = b.joint("shoulder" + side, { at: [s * 0.085, 0.27, 0.07], parent: chest });
    const elbow = b.joint("elbow" + side, { at: [s * 0.12, 0.20, 0.12], parent: sh });
    b.joint("wrist" + side, { at: [s * 0.13, 0.15, 0.16], parent: elbow });
    knob([s * 0.085, 0.27, 0.07], 0.03, TEAL);
    seg([s * 0.085, 0.27, 0.07], [s * 0.12, 0.20, 0.12], 0.024, 0.02, TEAL);
    knob([s * 0.12, 0.20, 0.12], 0.02, TEAL);
    seg([s * 0.12, 0.20, 0.12], [s * 0.13, 0.15, 0.16], 0.02, 0.017, TEAL);
    ell(0.03, 0.025, 0.035, TEAL_DK, [s * 0.13, 0.14, 0.185]);
    for (const d of [-0.012, 0, 0.012]) {
      cone(0.006, 0.026, CLAW, [s * 0.13 + d, 0.13, 0.2], [0, -0.25, 1]);
    }

    // wing: arm bone, finger rods, translucent amber membrane
    const wsh = b.joint("wingShoulder" + side, { at: [s * 0.07, 0.34, -0.06], parent: chest });
    b.joint("wingWrist" + side, { at: [s * 0.23, 0.48, -0.06], parent: wsh });
    const S: V = [s * 0.07, 0.34, -0.06];
    const W: V = [s * 0.23, 0.48, -0.06];
    const tips: V[] = [
      [s * 0.38, 0.42, -0.06],
      [s * 0.37, 0.32, -0.06],
      [s * 0.32, 0.23, -0.06],
    ];

    const memShape = new THREE.Shape(
      [
        [0.07, 0.36],
        [0.23, 0.48],
        [0.38, 0.42],
        [0.37, 0.32],
        [0.32, 0.23],
        [0.09, 0.17],
      ].map(([x, y]) => new THREE.Vector2(s * x, y)),
    );
    const memGeo = new THREE.ShapeGeometry(memShape);
    memGeo.translate(0, 0, -0.07);
    put(memGeo, WING, [0, 0, 0]);

    seg(S, W, 0.016, 0.012, WING_BONE);
    knob(W, 0.012, WING_BONE);
    for (const t of tips) {
      seg(W, t, 0.008, 0.005, WING_BONE);
      cone(0.005, 0.02, CLAW, t, unit(sub(t, W)));
    }
  }

  // ---------- speckled egg, broken open, with shards ----------
  const EC: V = [-0.25, 0.085, 0.08];
  put(
    new THREE.SphereGeometry(0.065, 20, 14, 0, Math.PI * 2, 0.9, Math.PI - 0.9).scale(1, 1.3, 1),
    EGG,
    EC,
  );
  const capG = new THREE.CircleGeometry(0.058, 18);
  capG.rotateX(-Math.PI / 2);
  put(capG, EGG_IN, [EC[0], 0.105, EC[2]]);

  for (let i = 0; i < 18; i++) {
    const th = 1.1 + (i % 6) * 0.22;
    const ph = i * 0.83;
    const sx = Math.sin(th) * Math.cos(ph);
    const sy = Math.cos(th);
    const sz = Math.sin(th) * Math.sin(ph);
    const p: V = [EC[0] + 0.065 * sx, EC[1] + 0.065 * 1.3 * sy, EC[2] + 0.065 * sz];
    knob(p, 0.008, SPECK);
  }

  const shards: V[] = [
    [-0.18, 0.006, 0.22],
    [-0.33, 0.006, 0.14],
    [-0.2, 0.006, -0.04],
  ];
  for (const sp of shards) {
    put(new THREE.SphereGeometry(0.022, 6, 4).scale(1.2, 0.35, 0.9), EGG, sp);
  }

  return b.root;
}
