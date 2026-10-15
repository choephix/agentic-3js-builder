import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { rng } from "../../../../src/math";
import { countershade, gradient, grain, mottle, paint } from "../../../../src/paint";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Gray Wolf",
  description: "A chunky, hand-painted gray wolf standing alert, with a studded leather collar and a fang charm.",
  style: "Blizzard/Warcraft",
  commit: "88fc1f0",
};

const DARK = "#3d4147";
const MID = "#6f757c";
const LIGHT = "#9ba1a7";
const CREAM = "#ddd6c4";
const TAN = "#b69a70";
const NOSE = "#16161a";
const LEATHER = "#6b3f22";
const GOLD = "#d9a82e";
const BONE = "#efe6cf";
const AMBER = "#ffb21e";
const PINK = "#b4676a";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "grayWolf" });
  const rand = rng(11);

  const coat = countershade(mottle(MID, LIGHT, { size: 0.07, contrast: 1.2, seed: 3 }), CREAM, { level: -0.15, soft: 0.5 });
  const back = paint((p, n, s) => (n.y > 0.35 && p.y > 0.6 ? mottle(DARK, MID, { size: 0.09, seed: 5 }) : coat));
  void back;
  const saddle = gradient(coat, DARK, [0, 0.62, 0.0], [0, 0.88, 0.0]);
  const legPaint = paint((p) => (p.y < 0.3 ? grain(TAN, "#8d7550", { size: 0.012 }) : p.y < 0.45 ? gradient(coat, TAN, [0, 0.45, 0], [0, 0.3, 0]) : coat));
  const muzzlePaint = mottle(CREAM, "#c4bba6", { size: 0.03, seed: 8 });
  const tailPaint = gradient(gradient(coat, DARK, [0, 0.55, -0.7], [0, 0.45, -0.9]), DARK, [0, 0.4, -0.9], [0, 0.34, -1.0]);

  // ---- torso
  b.loft(
    [
      { at: [0, 0.66, -0.45], w: 0.25, h: 0.32 },
      { at: [0, 0.66, -0.2], w: 0.28, h: 0.37 },
      { at: [0, 0.65, 0.05], w: 0.29, h: 0.4 },
      { at: [0, 0.64, 0.22], w: 0.31, h: 0.45 },
      { at: [0, 0.62, 0.36], w: 0.29, h: 0.4 },
    ],
    { color: saddle, sides: 10 },
  );
  // haunches and shoulders
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 8, 6), coat, { at: [s * 0.13, 0.6, -0.34], scale: [0.09, 0.15, 0.15] });
    b.part(new THREE.SphereGeometry(1, 8, 6), coat, { at: [s * 0.14, 0.6, 0.26], scale: [0.085, 0.16, 0.14] });
  }

  // ---- legs
  for (const s of [1, -1]) {
    // front
    b.capsule([s * 0.11, 0.56, 0.3], [s * 0.1, 0.13, 0.34], [0.075, 0.048], legPaint, { sides: 8 });
    b.capsule([s * 0.1, 0.05, 0.34], [s * 0.1, 0.05, 0.43], 0.055, legPaint, { sides: 8 });
    // hind
    b.capsule([s * 0.13, 0.66, -0.36], [s * 0.1, 0.34, -0.5], [0.11, 0.055], coat, { sides: 8 });
    b.capsule([s * 0.1, 0.36, -0.5], [s * 0.1, 0.1, -0.46], [0.045, 0.04], legPaint, { sides: 8 });
    b.capsule([s * 0.1, 0.05, -0.47], [s * 0.1, 0.05, -0.38], 0.055, legPaint, { sides: 8 });
    // claws and toe lines
    for (const [zc, zt] of [[0.45, 0.43], [-0.37, -0.39]]) {
      void zt;
      for (const dx of [-0.028, 0, 0.028]) {
        b.spike([s * 0.1 + dx, 0.025, zc + (zc > 0 ? 0.0 : 0.0)], [0, -0.35, zc > 0 ? 1 : 1], 0.05, 0.011, BONE, { sides: 5 });
        b.rod([s * 0.1 + dx * 0.9, 0.095, zc - 0.045], [s * 0.1 + dx * 0.9, 0.04, zc + 0.002], 0.004, "#5a4a34", { sides: 4 });
      }
    }
    // dewclaw and fur fringe on back of front legs
    for (let i = 0; i < 4; i++) {
      b.spike([s * 0.1, 0.5 - i * 0.07, 0.27], [0, -0.55, -0.8], 0.07, 0.022, i % 2 ? LIGHT : CREAM, { sides: 5 });
    }
    // hind hock tufts
    b.spike([s * 0.1, 0.4, -0.55], [0, -0.3, -1], 0.08, 0.025, MID, { sides: 5 });
    // leg bands (worn leather wraps)
    b.rod([s * 0.1, 0.25, 0.335], [s * 0.1, 0.27, 0.335], 0.055, LEATHER, { sides: 8 });
    b.rod([s * 0.1, 0.25, 0.335], [s * 0.1, 0.255, 0.335], 0.059, GOLD, { sides: 8 });
  }

  // ---- neck
  const nA: [number, number, number] = [0, 0.7, 0.3];
  const nB: [number, number, number] = [0, 0.86, 0.5];
  b.capsule(nA, nB, [0.15, 0.115], coat, { sides: 10 });

  // ruff around neck
  const nd = new THREE.Vector3(nB[0] - nA[0], nB[1] - nA[1], nB[2] - nA[2]).normalize();
  const uu = new THREE.Vector3(1, 0, 0);
  const vv = new THREE.Vector3().crossVectors(nd, uu).normalize();
  const nc = new THREE.Vector3(0, 0.74, 0.36);
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * Math.PI * 2;
    const out = uu.clone().multiplyScalar(Math.cos(a)).add(vv.clone().multiplyScalar(Math.sin(a)));
    const base = nc.clone().addScaledVector(out, 0.1).addScaledVector(nd, (rand() - 0.5) * 0.06);
    const dir = out.clone().multiplyScalar(0.5).add(new THREE.Vector3(0, -0.35, -0.6));
    b.spike(base, dir, 0.07 + rand() * 0.04, 0.026, i % 3 === 0 ? CREAM : i % 3 === 1 ? LIGHT : MID, { sides: 5 });
  }
  // chest ruff
  for (let i = 0; i < 14; i++) {
    const x = (i / 13 - 0.5) * 0.24;
    b.spike([x, 0.5 + rand() * 0.04, 0.38], [x * 1.5, -0.9, 0.3], 0.1 + rand() * 0.03, 0.03, CREAM, { sides: 5 });
  }
  // dorsal hackles
  for (let i = 0; i < 16; i++) {
    const z = 0.34 - i * 0.05;
    const x = (rand() - 0.5) * 0.04;
    b.spike([x, 0.8 + (z > 0 ? 0.04 : 0), z], [0, 0.55, -1], 0.09 + rand() * 0.03, 0.03, i % 2 ? DARK : MID, { sides: 5 });
  }
  // flank fur tufts
  for (const s of [1, -1]) {
    for (let i = 0; i < 6; i++) {
      b.spike([s * 0.14, 0.52 + (i % 2) * 0.06, 0.1 - i * 0.1], [s * 0.25, -0.5, -1], 0.08, 0.03, i % 2 ? LIGHT : CREAM, { sides: 5 });
    }
  }

  // ---- head
  const hc: [number, number, number] = [0, 0.91, 0.58];
  b.part(new THREE.SphereGeometry(1, 12, 9), coat, { at: hc, scale: [0.105, 0.095, 0.125] });
  // brow ridge
  for (const s of [1, -1]) {
    b.rod([s * 0.03, 0.965, 0.66], [s * 0.085, 0.95, 0.62], 0.016, DARK, { sides: 5 });
  }
  // muzzle
  b.capsule([0, 0.885, 0.65], [0, 0.86, 0.77], [0.062, 0.045], muzzlePaint, { sides: 8 });
  b.frustumBox([0, 0.82, 0.68], [0, 0.82, 0.78], [0.08, 0.025], [0.06, 0.02], CREAM);
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, { at: [0, 0.875, 0.83], scale: [0.032, 0.025, 0.026] });
  b.rod([0, 0.845, 0.81], [0, 0.82, 0.8], 0.004, NOSE, { sides: 4 });
  for (const s of [1, -1]) {
    // mouth line
    b.sweep(
      catmull([
        [s * 0.003, 0.845, 0.82],
        [s * 0.03, 0.833, 0.78],
        [s * 0.05, 0.84, 0.7],
        [s * 0.06, 0.855, 0.65],
      ]),
      0.0045,
      NOSE,
      { sides: 4, caps: "flat" },
    );
    // lip fang tips
    b.spike([s * 0.03, 0.835, 0.79], [0, -1, 0.1], 0.025, 0.007, BONE, { sides: 4 });
    // cheek fur
    for (let i = 0; i < 4; i++) {
      b.spike([s * 0.085, 0.89 - i * 0.012, 0.52 + i * 0.012], [s * 0.7, -0.35, -0.8], 0.06, 0.02, i % 2 ? CREAM : LIGHT, { sides: 5 });
    }
    // ears
    b.spike([s * 0.065, 0.975, 0.53], [s * 0.25, 1, -0.2], 0.14, 0.05, MID, { sides: 5 });
    b.spike([s * 0.065, 0.985, 0.545], [s * 0.25, 1, -0.2], 0.1, 0.03, PINK, { sides: 5 });
    b.spike([s * 0.07, 1.0, 0.52], [s * 0.25, 1, -0.2], 0.12, 0.045, DARK, { sides: 5, from: 0.5 });
    // eyes
    b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, { at: [s * 0.068, 0.93, 0.655], scale: [0.02, 0.016, 0.014], rotation: [0, 0, -s * 15] });
    glow(b.part(new THREE.SphereGeometry(1, 8, 6), AMBER, { at: [s * 0.07, 0.932, 0.664], scale: [0.013, 0.011, 0.008] }), 1.4);
    b.part(new THREE.SphereGeometry(1, 6, 4), NOSE, { at: [s * 0.0715, 0.932, 0.669], scale: [0.005, 0.008, 0.004] });
    // dark eye stripe
    b.rod([s * 0.072, 0.94, 0.665], [s * 0.095, 0.915, 0.6], 0.007, DARK, { sides: 4 });
  }
  // nose stripe on forehead
  b.rod([0, 0.995, 0.57], [0, 0.96, 0.66], 0.01, DARK, { sides: 4 });

  // ---- tail
  const tail = catmull([
    [0, 0.7, -0.44],
    [0, 0.66, -0.62],
    [0, 0.5, -0.82],
    [0, 0.34, -0.96],
  ]);
  b.sweep(tail, [0.06, 0.1, 0.1, 0.07, 0.025], tailPaint, { sides: 8, caps: "round" });
  for (let i = 0; i < 10; i++) {
    const t = 0.15 + i * 0.08;
    const p = tail.at(t);
    b.spike(p, [0, 0.4, -0.6], 0.07, 0.025, i % 2 ? DARK : MID, { sides: 5 });
    b.spike(p, [0.7, -0.2, -0.5], 0.07, 0.024, i % 2 ? MID : LIGHT, { sides: 5 });
    b.spike(p, [-0.7, -0.2, -0.5], 0.07, 0.024, i % 2 ? LIGHT : MID, { sides: 5 });
  }

  // ---- collar, rivets, charm
  b.part(new THREE.TorusGeometry(0.145, 0.016, 6, 16), LEATHER, { at: [0, 0.78, 0.41], dir: nd, axis: "z", scale: [1, 1, 1] });
  b.part(new THREE.TorusGeometry(0.145, 0.005, 4, 16), GOLD, { at: [0, 0.78, 0.41].map((v, i) => v + nd.getComponent(i) * 0.018), dir: nd, axis: "z" });
  const cc = new THREE.Vector3(0, 0.78, 0.41);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const out = uu.clone().multiplyScalar(Math.cos(a)).add(vv.clone().multiplyScalar(Math.sin(a)));
    const p = cc.clone().addScaledVector(out, 0.158);
    b.part(new THREE.SphereGeometry(0.01, 6, 4), GOLD, { at: p });
  }
  // fang charm hanging at front of collar
  const front = cc.clone().addScaledVector(vv.clone().multiplyScalar(-1), 0.16);
  const fa = front.clone();
  b.part(new THREE.TorusGeometry(0.012, 0.004, 4, 8), GOLD, { at: fa });
  b.spike([fa.x, fa.y - 0.01, fa.z + 0.012], [0, -1, 0.2], 0.075, 0.017, BONE, { sides: 6 });
  b.rod([fa.x, fa.y - 0.02, fa.z + 0.016], [fa.x, fa.y - 0.035, fa.z + 0.022], 0.019, LEATHER, { sides: 6 });

  return b.root;
}
