import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Joint } from "../../../../src/skeleton";
import { catmull } from "../../../../src/path";
import { limb } from "../../../../src/ik";
import { paint } from "../../../../src/paint";
import { animeEye, cel, furEdge, zigzag } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Phoenix",
  description:
    "A towering flame phoenix with wings spread wide: layered cel-shaded feathers fading crimson to gold, gold filigree guards and ruby gems, glowing flame tongues on the plume tips, a long fanned tail and curled talons.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

const GOLD = "#e9b232";
const RUBY = "#e0102f";
const CLAW = "#2a1e2c";
const TARSUS = "#7a4326";
const BEAK = "#f5bf3a";
const CRIM_D = "#7a0f26";
const CRIM = "#b0152a";
const RED = "#e3301f";
const ORANGE = "#ff6a1a";
const AMBER = "#ffa91f";
const GOLDY = "#ffd23f";
const CREAM = "#fff0a8";

type Cols = [string, string, string];
const P_BACK: Cols = [CRIM_D, CRIM, ORANGE];
const P_MID: Cols = [CRIM, RED, AMBER];
const P_FRONT: Cols = [RED, ORANGE, GOLDY];
const P_TIP: Cols = [ORANGE, AMBER, GOLDY];
const P_CHEST: Cols = [GOLDY, AMBER, ORANGE];

const GOLD_P = cel(GOLD, "#a56a14");

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const FRONT = V(0, 0, 1);

  // ---------------------------------------------------------------- skeleton
  const hips = b.joint("hips", { at: [0, 1.3, -0.2], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.3, -0.2],
      [0, 1.62, -0.06],
      [0, 1.98, 0.1],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.98, 0.1],
      [0, 2.2, 0.2],
      [0, 2.4, 0.32],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2", "neck3"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[2], at: [0, 2.4, 0.32], dir: [0, 0.15, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.38, 0.42], aim: [0, 2.36, 0.62], role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.3, -0.28],
      [0, 1.05, -0.45],
      [0, 0.75, -0.58],
      [0, 0.45, -0.66],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3", "tail4"], role: "tail" },
  );

  // ---------------------------------------------------------------- helpers
  const yFor = (d: THREE.Vector3, side: number) => {
    const y = V(-d.y, d.x, 0).multiplyScalar(side);
    if (y.lengthSq() < 1e-6) y.set(side, 0, 0);
    return y.normalize();
  };

  const feather = (o: {
    at: THREE.Vector3;
    d: THREE.Vector3;
    side: number;
    len: number;
    wid: number;
    cols: Cols;
    bone: Joint;
    curl?: number;
  }) => {
    const d = o.d.clone().normalize();
    const y = yFor(d, o.side);
    const L = o.len;
    const w = o.wid;
    const c = o.curl ?? 0.5;
    const [ca, cb, cc] = o.cols;
    const outline: OutlinePoint[] = [
      [0, -0.12 * w],
      [0.3 * L, -0.5 * w],
      [0.72 * L, -0.38 * w],
      [L, c * w, "sharp"],
      [0.66 * L, 0.52 * w],
      [0.3 * L, 0.46 * w],
      [0, 0.12 * w],
    ];
    const fill = cel(
      paint((_p, _n, s) => {
        const t = s[0] / L;
        if (t > 0.1 && t < 0.9 && Math.abs(s[1] - c * w * t * t * t) < 0.006) return t < 0.5 ? cb : cc;
        const k = t + 0.07 * zigzag(s[1] / (w * 0.7));
        return k < 0.36 ? ca : k < 0.7 ? cb : cc;
      }),
    );
    return b.extrude(outline, { at: o.at, x: d, y, thickness: 0.012, smoothing: 1, color: fill, bone: o.bone });
  };

  const flame = (at: THREE.Vector3, d: THREE.Vector3, side: number, len: number, bone: Joint, col: string) => {
    const x = d.clone().normalize();
    const y = yFor(x, side);
    const L = len;
    const w = len * 0.22;
    const outline: OutlinePoint[] = [
      [0, -0.5 * w],
      [0.4 * L, -0.7 * w],
      [0.65 * L, -0.25 * w],
      [L, 0.4 * w, "sharp"],
      [0.62 * L, 0.2 * w],
      [0.35 * L, 0.55 * w],
      [0, 0.5 * w],
    ];
    glow(b.extrude(outline, { at, x, y, thickness: 0.01, color: col, bone }), 1.2);
  };

  const gem = (at: THREE.Vector3, x: THREE.Vector3, y: THREE.Vector3, k: number, bone: Joint) => {
    const n = x.clone().cross(y).normalize();
    if (n.dot(FRONT) < 0) n.negate();
    b.extrude(
      [
        [-0.07 * k, 0],
        [0, 0.11 * k],
        [0.07 * k, 0],
        [0, -0.11 * k],
      ],
      { at, x, y, thickness: 0.025 * k, bevel: 0.006 * k, color: GOLD_P, bone },
    );
    glow(
      b.part(new THREE.OctahedronGeometry(0.05 * k), RUBY, {
        at: at.clone().addScaledVector(n, 0.016 * k),
        dir: n,
        axis: "z",
        up: y,
        scale: [0.8, 1.25, 0.45],
        bone,
        flat: true,
      }),
    );
  };

  // ---------------------------------------------------------------- body
  const chestPaint = cel(
    furEdge(AMBER, RED, { axis: [0, 0, 1], level: 0.3, teeth: 0.3, period: 0.05, along: [1, 0, 0] }),
  );
  const body = b.loft(
    [
      { at: [0, 1.22, -0.32], w: 0.3, h: 0.3 },
      { at: [0, 1.42, -0.2], w: 0.52, h: 0.5 },
      { at: [0, 1.72, -0.02], w: 0.62, h: 0.6 },
      { at: [0, 2.0, 0.13], w: 0.5, h: 0.48 },
    ],
    { bone: spine, color: chestPaint, name: "body" },
  );
  b.sweep(neck, [0.17, 0.13, 0.1], { color: chestPaint, name: "neckTube" });
  const skin = b.surface(body);

  // chest feather scales
  const rows: Array<[number, number[]]> = [
    [2.02, [-0.14, 0, 0.14]],
    [1.88, [-0.2, -0.1, 0, 0.1, 0.2]],
    [1.74, [-0.22, -0.11, 0, 0.11, 0.22]],
    [1.6, [-0.2, -0.1, 0, 0.1, 0.2]],
    [1.46, [-0.15, 0, 0.15]],
  ];
  for (const [y, xs] of rows)
    for (const x of xs) {
      const hit = skin.ray([x, y, 1.5], [0, 0, -1]);
      if (!hit) continue;
      feather({
        at: hit.at.clone(),
        d: V(x * 0.8, -1, 0.25),
        side: x >= 0 ? 1 : -1,
        len: 0.2,
        wid: 0.11,
        cols: P_CHEST,
        bone: spine.joints[1],
        curl: 0.2,
      });
    }

  // gold collar and chest gem
  b.sweep(
    skin.drape(
      catmull([
        [-0.3, 2.06, 0.08],
        [-0.2, 1.98, 0.25],
        [0, 1.86, 0.33],
        [0.2, 1.98, 0.25],
        [0.3, 2.06, 0.08],
      ]),
      { lift: 0.025 },
    ),
    0.022,
    { color: GOLD_P, name: "collar" },
  );
  const chestHit = skin.ray([0, 1.9, 1.5], [0, 0, -1]);
  if (chestHit) {
    const n = chestHit.n;
    gem(chestHit.at.clone().addScaledVector(n, 0.03), V(1, 0, 0), V(0, n.z, -n.y), 1.1, spine.joints[1]);
  }

  // neck ruff
  for (let a = 0; a < 10; a++) {
    const ang = (a / 10) * Math.PI * 2;
    feather({
      at: V(0.16 * Math.sin(ang), 2.06, 0.14 + 0.14 * Math.cos(ang)),
      d: V(Math.sin(ang) * 0.6, -0.75, Math.cos(ang) * 0.6),
      side: Math.sin(ang) >= 0 ? 1 : -1,
      len: 0.2,
      wid: 0.1,
      cols: a % 2 ? P_FRONT : P_TIP,
      bone: neck.joints[0],
      curl: 0.3,
    });
  }

  // ---------------------------------------------------------------- head
  const faceP = cel(
    furEdge(ORANGE, GOLDY, { axis: [0, 1, 0], level: -0.1, teeth: 0.2, period: 0.03, along: [1, 0, 0] }),
  );
  const HEAD_C = V(0, 2.45, 0.4);
  const skull = b.part(new THREE.SphereGeometry(1, 10, 8), faceP, {
    bone: head,
    at: HEAD_C,
    scale: [0.13, 0.12, 0.14],
    name: "skull",
  });
  const hskin = b.surface(skull);
  const EYE = animeEye({ iris: "#ff9a1c", blush: false });
  for (const s of [1, -1]) {
    const hit = hskin.around(HEAD_C).at(s * 50, 4);
    if (hit) b.decal(hskin, EYE, { at: hit, size: [0.062, 0.085], mirror: s > 0, name: `eye${s > 0 ? "L" : "R"}` });
  }
  b.sweep(
    catmull([
      [0, 2.45, 0.48],
      [0, 2.46, 0.58],
      [0, 2.43, 0.67],
      [0, 2.37, 0.71],
    ]),
    (t) => [0.05 * (1 - t * 0.85) + 0.004, 0.045 * (1 - t * 0.85) + 0.004],
    { color: cel(BEAK), bone: head, caps: { start: "flat", end: "point" }, name: "beakUpper" },
  );
  b.sweep(
    catmull([
      [0, 2.405, 0.46],
      [0, 2.4, 0.56],
      [0, 2.395, 0.63],
    ]),
    (t) => [0.04 * (1 - t * 0.8) + 0.004, 0.03 * (1 - t * 0.8) + 0.004],
    { color: cel("#d99a22"), bone: jaw, caps: { start: "flat", end: "point" }, name: "beakLower" },
  );
  for (const s of [1, -1])
    b.part(new THREE.SphereGeometry(0.01, 5, 4), CLAW, { bone: head, at: [s * 0.02, 2.475, 0.56] });
  const fh = hskin.around(HEAD_C).at(0, 52);
  if (fh) {
    const n = fh.n;
    gem(fh.at.clone().addScaledVector(n, 0.004), V(1, 0, 0), V(0, n.z, -n.y), 0.3, head);
  }
  // crest
  const crestLen = [0.3, 0.38, 0.46, 0.38, 0.3];
  for (let k = 0; k < 5; k++)
    feather({
      at: V((k - 2) * 0.036, 2.54, 0.38),
      d: V((k - 2) * 0.18, 0.9, -0.45),
      side: k < 2 ? -1 : 1,
      len: crestLen[k],
      wid: 0.09,
      cols: k % 2 ? P_FRONT : P_TIP,
      bone: head,
      curl: 0.6,
    });
  for (const s of [1, -1]) {
    feather({
      at: V(s * 0.04, 2.5, 0.3),
      d: V(s * 0.25, 0.25, -1),
      side: s,
      len: 0.55,
      wid: 0.1,
      cols: [RED, ORANGE, AMBER],
      bone: head,
      curl: 0.5,
    });
    feather({
      at: V(s * 0.11, 2.41, 0.36),
      d: V(s * 0.8, -0.15, -0.6),
      side: s,
      len: 0.15,
      wid: 0.06,
      cols: P_TIP,
      bone: head,
      curl: 0.4,
    });
  }

  // ---------------------------------------------------------------- wings
  const wing = (s: number) => {
    const side = s > 0 ? "L" : "R";
    const P = [V(s * 0.26, 1.92, 0), V(s * 0.66, 2.08, -0.12), V(s * 1.02, 2.34, -0.05), V(s * 1.26, 2.62, 0.02)];
    const arm = b.chain(`wing${side}`, catmull(P), {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
      role: "wing",
    });
    const [sh, el, wr, hd] = arm.joints;
    const bones = [sh, el, wr];
    b.sweep(arm, [0.085, 0.07, 0.06, 0.04], { color: cel(CRIM), name: `arm${side}` });
    const along = (u: number) => {
      const k = Math.min(2, Math.floor(u * 3));
      return P[k].clone().lerp(P[k + 1], u * 3 - k);
    };
    const kOf = (u: number) => Math.min(2, Math.floor(u * 3));
    const layers: Array<{ cols: Cols; lk: number; z: number; da: number }> = [
      { cols: P_BACK, lk: 1, z: -0.03, da: 0 },
      { cols: P_MID, lk: 0.82, z: 0, da: 1.5 },
      { cols: P_FRONT, lk: 0.62, z: 0.03, da: 3 },
    ];

    // primaries
    const lenP = [0.62, 0.72, 0.82, 0.9, 0.96, 0.98, 0.96, 0.9, 0.8];
    for (let i = 0; i < 9; i++) {
      const u = i / 8;
      const root = P[2].clone().lerp(P[3], u * 0.85);
      const bone = i >= 5 ? hd : wr;
      layers.forEach((ly, li) => {
        const th = ((-12 + 92 * u + ly.da) * Math.PI) / 180;
        const d = V(s * Math.cos(th), Math.sin(th), -0.1);
        const curl = th > 0.78 ? -0.55 : 0.5;
        const L = lenP[i] * ly.lk;
        const wid = 0.17 * (1 - 0.1 * li);
        const at = root.clone().add(V(0, 0, ly.z));
        feather({ at, d, side: s, len: L, wid, cols: li === 0 && i >= 7 ? P_TIP : ly.cols, bone, curl });
        if (li === 0 && i >= 4) {
          const dn = d.clone().normalize();
          const tip = at.clone().addScaledVector(dn, L * 0.97).addScaledVector(yFor(dn, s), curl * wid * 0.9);
          flame(tip, dn, s, 0.26, bone, AMBER);
          flame(tip.clone().add(V(0, 0, 0.012)), dn, s, 0.15, bone, CREAM);
        }
      });
    }

    // secondaries
    const lenS = [0.55, 0.62, 0.7, 0.76, 0.82, 0.86, 0.88, 0.88, 0.86, 0.82];
    for (let j = 0; j < 10; j++) {
      const u = j / 9;
      const root = along(u * 0.66);
      const bone = bones[kOf(u * 0.66)];
      layers.forEach((ly, li) => {
        const th = ((-78 + 70 * u + ly.da) * Math.PI) / 180;
        const d = V(s * Math.cos(th), Math.sin(th), -0.1);
        feather({
          at: root.clone().add(V(0, 0, ly.z)),
          d,
          side: s,
          len: lenS[j] * ly.lk,
          wid: 0.17 * (1 - 0.1 * li),
          cols: ly.cols,
          bone,
          curl: 0.5,
        });
      });
    }

    // coverts
    for (let i = 0; i < 12; i++) {
      const u = (i / 11) * 0.95;
      const bone = bones[kOf(u)];
      const th = ((-30 + 55 * u) * Math.PI) / 180;
      const d = V(s * Math.cos(th), Math.sin(th), -0.05);
      const r1 = along(u).add(V(0, 0, 0.05));
      feather({ at: r1, d, side: s, len: 0.32 - 0.1 * u, wid: 0.11, cols: P_FRONT, bone, curl: 0.4 });
      const u2 = Math.min(0.97, u + 0.04);
      feather({
        at: along(u2).add(V(0, 0.01, 0.075)),
        d,
        side: s,
        len: 0.19,
        wid: 0.085,
        cols: P_TIP,
        bone: bones[kOf(u2)],
        curl: 0.4,
      });
    }

    // gold guards with rubies
    for (let i = 0; i < 3; i++) {
      const dir = P[i + 1].clone().sub(P[i]);
      const len = dir.length();
      const d = dir.clone().normalize();
      const y = yFor(d, s);
      const k = len / 0.42;
      const at = P[i].clone().addScaledVector(y, 0.02).add(V(0, 0, 0.095));
      const guard: OutlinePoint[] = [
        [0, -0.03 * k],
        [0.1 * k, 0.05 * k],
        [0.24 * k, 0.04 * k],
        [0.34 * k, -0.005 * k, "sharp"],
        [0.18 * k, -0.05 * k],
      ];
      b.extrude(guard, { at, x: d, y, thickness: 0.022, bevel: 0.005, color: GOLD_P, bone: bones[i] });
      gem(at.clone().addScaledVector(d, 0.17 * k).add(V(0, 0, 0.02)), d, y, 0.7, bones[i]);
    }
  };
  wing(1);
  wing(-1);

  // ---------------------------------------------------------------- legs
  const thighP = cel(P_MID[1]);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const pts = limb([s * 0.17, 1.2, -0.04], [s * 0.19, 0.66, 0.1], [0.32, 0.3], [[0, 0, 1]]);
    const leg = b.chain(`leg${side}`, catmull(pts), {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `ankle${side}`],
      role: "leg",
    });
    b.sweep(leg, [0.1, 0.085, 0.05, 0.03, 0.028], {
      bands: [
        [0.52, thighP],
        [1, cel(TARSUS)],
      ],
      name: `leg${side}`,
    });
    const ankle = leg.joints[2];
    const A = pts[2].clone();
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      feather({
        at: pts[0].clone().lerp(pts[1], 0.45).add(V(0.07 * Math.cos(a), 0, 0.07 * Math.sin(a))),
        d: V(s * 0.15 + Math.cos(a) * 0.3, -1, Math.sin(a) * 0.3),
        side: s,
        len: 0.24,
        wid: 0.1,
        cols: P_MID,
        bone: leg.joints[0],
        curl: 0.3,
      });
    }
    b.part(new THREE.TorusGeometry(0.045, 0.014, 5, 10), GOLD_P, {
      at: A.clone().lerp(pts[1], 0.12),
      dir: pts[2].clone().sub(pts[1]),
      axis: "z",
      bone: ankle,
    });
    glow(
      b.part(new THREE.OctahedronGeometry(0.03), RUBY, {
        at: A.clone().lerp(pts[1], 0.12).add(V(0, 0, 0.05)),
        scale: [0.8, 1.2, 0.6],
        bone: ankle,
        flat: true,
      }),
    );
    const toes: Array<{ d: THREE.Vector3; len: number }> = [
      { d: V(-0.32, -0.5, 0.85), len: 0.2 },
      { d: V(0, -0.5, 0.85), len: 0.22 },
      { d: V(0.32, -0.5, 0.85), len: 0.2 },
      { d: V(0, -0.35, -0.9), len: 0.13 },
    ];
    toes.forEach((t, k) => {
      const d = t.d.clone().normalize();
      const tp = catmull([
        A.clone(),
        A.clone().addScaledVector(d, t.len * 0.5).add(V(0, -0.015, 0)),
        A.clone().addScaledVector(d, t.len).add(V(0, -0.05, 0)),
      ]);
      const toe = b.chain(`toe${k}${side}`, tp, {
        parent: ankle,
        names: [`toe${k}${side}a`, `toe${k}${side}b`],
        role: "digit",
      });
      b.sweep(toe, [0.028, 0.02, 0.014], { color: cel(TARSUS), name: `toe${k}${side}` });
      b.spike(tp.at(1), d.clone().add(V(0, -0.7, 0.1)), 0.08, 0.016, { color: CLAW, bone: toe.joints[1] });
    });
  }

  // ---------------------------------------------------------------- tail
  b.sweep(tail, [0.11, 0.07, 0.04, 0.02], { color: cel(CRIM), name: "tailCore" });
  const tailBase = V(0, 1.28, -0.3);
  const tailLayers: Array<{ cols: Cols; lk: number; z: number }> = [
    { cols: P_BACK, lk: 1, z: -0.03 },
    { cols: P_MID, lk: 0.8, z: 0 },
    { cols: P_FRONT, lk: 0.6, z: 0.03 },
  ];
  const phis = [-40, -30, -20, -10, 0, 10, 20, 30, 40];
  for (const phi of phis) {
    const r = (phi * Math.PI) / 180;
    const d = V(Math.sin(r), -Math.cos(r), -0.3).normalize();
    const side = phi < 0 ? -1 : 1;
    const baseLen = 1.25 - (0.4 * Math.abs(phi)) / 40;
    tailLayers.forEach((ly, li) => {
      const L = baseLen * ly.lk;
      const at = tailBase.clone().add(V(Math.sin(r) * 0.06, 0, ly.z));
      feather({ at, d, side, len: L, wid: 0.2 * (1 - 0.1 * li), cols: ly.cols, bone: tail.joints[0], curl: 0.6 });
      if (li === 0 && Math.abs(phi) <= 20 && phi % 20 === 0) {
        const y = yFor(d, side);
        flame(at.clone().addScaledVector(d, L * 0.96), d, side, 0.28, tail.joints[0], AMBER);
        gem(at.clone().addScaledVector(d, 0.58 * L).addScaledVector(y, 0.02).add(V(0, 0, 0.07)), d, y, 0.8, tail.joints[0]);
      }
    });
  }
  for (const s of [1, -1]) {
    const streamers = [
      { ang: 58, len: 1.0, cols: P_FRONT },
      { ang: 76, len: 0.8, cols: P_TIP },
    ];
    for (const st of streamers) {
      const a = (st.ang * Math.PI) / 180;
      const d = V(s * Math.sin(a), -Math.cos(a), -0.25).normalize();
      const at = tailBase.clone().add(V(s * 0.08, 0, 0.04));
      feather({ at, d, side: s, len: st.len, wid: 0.2, cols: st.cols, bone: tail.joints[0], curl: 0.95 });
      flame(at.clone().addScaledVector(d, st.len * 0.95), d, s, 0.26, tail.joints[0], AMBER);
    }
  }

  // ---------------------------------------------------------------- ground
  const root = b.root;
  const box = new THREE.Box3().setFromObject(root, true);
  root.position.y -= box.min.y + 0.02;
  return root;
}
