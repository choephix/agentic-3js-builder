import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Lion",
  description:
    "A stylized adult male lion standing in a rest pose: a layered dark mane, a cream muzzle with a hinged lower jaw, four jointed legs and a tufted tail.",
};

type V = [number, number, number];

// Palette: golden coat, cream underside and muzzle, dark mane, amber eyes.
const GOLD = "#c98c46";
const CREAM = "#eed29a";
const MANE = "#6a3d18";
const MANE_DEEP = "#3b2010";
const PAW = "#6e4520";
const NOSE = "#2b1a13";
const MOUTH = "#4a1d17";
const AMBER = "#f2a52c";
const BLACK = "#120c08";
const IVORY = "#f7f1e1";
const EAR_IN = "#a8653a";

const DEG = Math.PI / 180;

// Primitives, scaled into shape where needed. Low segment counts keep them blocky.
const ellipsoid = (rx: number, ry: number, rz: number) => {
  const g = new THREE.SphereGeometry(1, 14, 10);
  g.scale(rx, ry, rz);
  return g;
};
const ball = (r: number) => new THREE.SphereGeometry(r, 12, 9);
const cone = (r: number, h: number) => new THREE.ConeGeometry(r, h, 6, 1);
const gem = (r: number) => new THREE.IcosahedronGeometry(r, 0);

const add = (p: V, d: V, t: number): V => [p[0] + d[0] * t, p[1] + d[1] * t, p[2] + d[2] * t];
const unit = (v: V): V => {
  const n = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / n, v[1] / n, v[2] / n];
};
const mirror = (p: V, s: number): V => [p[0] * s, p[1], p[2]];

export default function build() {
  const b = createBuilder({ name: "lion" });

  // ---------- skeleton ----------
  const H: V = [0, 1.18, 0.68]; // head centre
  const hips = b.joint("hips", { at: [0, 0.92, -0.6] });
  const spine = b.joint("spine", { at: [0, 0.92, -0.12], parent: hips });
  const chest = b.joint("chest", { at: [0, 0.94, 0.25], parent: spine });
  const neck = b.joint("neck", { at: [0, 1.04, 0.48], parent: chest });
  const head = b.joint("head", { at: H, parent: neck });
  const jaw = b.joint("jaw", { at: [0, 1.1, 0.78], parent: head });

  const tailAt: V[] = [
    [0, 0.92, -0.88],
    [0, 0.84, -1.04],
    [0, 0.62, -1.12],
    [0, 0.38, -1.13],
    [0, 0.16, -1.1],
  ];
  const tail: ReturnType<typeof b.joint>[] = [];
  tailAt.forEach((p, i) => {
    tail.push(b.joint(`tail${i + 1}`, { at: p, parent: i ? tail[i - 1] : hips }));
  });

  // ---------- legs (both sides) ----------
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    const P = (p: V): V => mirror(p, s);

    // foreleg: shoulder, elbow, wrist
    const shoulder = b.joint(`shoulder${k}`, { at: P([0.2, 0.9, 0.3]), parent: chest });
    const elbow = b.joint(`elbow${k}`, { at: P([0.22, 0.46, 0.33]), parent: shoulder });
    const wrist = b.joint(`wrist${k}`, { at: P([0.22, 0.1, 0.4]), parent: elbow });
    // hind leg: hip, stifle, hock
    const hip = b.joint(`hip${k}`, { at: P([0.22, 0.86, -0.56]), parent: hips });
    const knee = b.joint(`knee${k}`, { at: P([0.22, 0.46, -0.38]), parent: hip });
    const hock = b.joint(`hock${k}`, { at: P([0.22, 0.12, -0.6]), parent: knee });

    // foreleg
    b.part(ellipsoid(0.14, 0.18, 0.15), GOLD, { at: P([0.2, 0.84, 0.3]), bone: shoulder });
    b.sweep([P([0.2, 0.9, 0.3]), P([0.22, 0.46, 0.33])], 0.1, { color: GOLD });
    b.part(ball(0.09), GOLD, { at: P([0.22, 0.46, 0.33]), bone: elbow });
    b.sweep([P([0.22, 0.46, 0.33]), P([0.22, 0.1, 0.4])], 0.075, { color: GOLD });
    b.part(ellipsoid(0.085, 0.06, 0.11), PAW, { at: P([0.22, 0.06, 0.5]), bone: wrist });
    for (const dx of [-0.04, 0, 0.04]) {
      b.part(ellipsoid(0.028, 0.024, 0.03), PAW, { at: P([0.22 + dx, 0.026, 0.6]), bone: wrist });
      b.part(cone(0.011, 0.03), IVORY, { at: P([0.22 + dx, 0.026, 0.645]), dir: [0, 0, 1], bone: wrist });
    }

    // hind leg: thigh, stifle, hock
    b.part(ellipsoid(0.17, 0.22, 0.2), GOLD, { at: P([0.22, 0.8, -0.5]), bone: hip });
    b.sweep([P([0.22, 0.86, -0.56]), P([0.22, 0.46, -0.38])], 0.1, { color: GOLD });
    b.part(ball(0.09), GOLD, { at: P([0.22, 0.46, -0.38]), bone: knee });
    b.sweep([P([0.22, 0.46, -0.38]), P([0.22, 0.12, -0.6])], 0.075, { color: GOLD });
    b.part(ball(0.07), GOLD, { at: P([0.22, 0.12, -0.6]), bone: hock });
    b.part(ellipsoid(0.085, 0.06, 0.12), PAW, { at: P([0.22, 0.06, -0.54]), bone: hock });
  }

  // ---------- torso ----------
  b.part(ellipsoid(0.3, 0.27, 0.38), GOLD, { at: [0, 0.93, 0.24], bone: chest });
  b.part(ellipsoid(0.26, 0.24, 0.34), GOLD, { at: [0, 0.9, -0.2], bone: spine });
  b.part(ellipsoid(0.27, 0.27, 0.3), GOLD, { at: [0, 0.92, -0.6], bone: hips });
  b.part(ellipsoid(0.2, 0.08, 0.42), CREAM, { at: [0, 0.7, 0], bone: spine });

  // ---------- neck ----------
  b.sweep([[0, 0.94, 0.25], [0, 1.04, 0.48]], 0.17, { color: GOLD });
  b.sweep([[0, 1.04, 0.48], [0, 1.14, 0.62]], 0.16, { color: GOLD });
  b.part(ball(0.16), GOLD, { at: [0, 1.04, 0.48], bone: neck });

  // ---------- tail: tapering segments with a dark tuft ----------
  const tailR = [0.07, 0.06, 0.05, 0.045, 0.04];
  tailAt.forEach((p, i) => {
    b.part(ball(tailR[i]), GOLD, { at: p, bone: tail[i] });
    if (i < tailAt.length - 1) b.sweep([p, tailAt[i + 1]], tailR[i], { color: GOLD });
  });
  b.part(gem(0.09), MANE_DEEP, { at: [0, 0.14, -1.1], bone: tail[4] });

  // Seats a thin strut between two points, on a bone.
  const strut = (a: V, c: V, r: number, color: string, bone: typeof head) => {
    const len = Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    const d = unit([c[0] - a[0], c[1] - a[1], c[2] - a[2]]);
    const mid: V = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
    b.part(new THREE.CylinderGeometry(r, r, len, 5), color, { at: mid, dir: d, bone });
  };

  // ---------- head ----------
  b.part(ellipsoid(0.21, 0.2, 0.2), GOLD, { at: H, bone: head });
  b.part(ellipsoid(0.1, 0.09, 0.13), CREAM, { at: [0, 1.25, 0.86], bone: head }); // muzzle
  b.part(ellipsoid(0.05, 0.035, 0.04), NOSE, { at: [0, 1.28, 0.98], bone: head });
  for (const s of [1, -1]) {
    const P = (p: V): V => mirror(p, s);
    b.part(ellipsoid(0.065, 0.065, 0.035), GOLD, { at: P([0.15, 1.36, 0.66]), bone: head }); // ear
    b.part(ellipsoid(0.04, 0.04, 0.02), EAR_IN, { at: P([0.15, 1.36, 0.685]), bone: head });
    b.part(ellipsoid(0.055, 0.02, 0.035), MANE_DEEP, { at: P([0.1, 1.33, 0.79]), bone: head }); // brow
    b.part(ellipsoid(0.04, 0.034, 0.03), AMBER, { at: P([0.1, 1.23, 0.87]), bone: head }); // eye
    b.part(ellipsoid(0.017, 0.02, 0.012), BLACK, { at: P([0.1, 1.23, 0.895]), bone: head }); // pupil
    strut(P([0.1, 1.2, 0.86]), P([0.075, 1.16, 0.93]), 0.008, NOSE, head); // dark tear line
    b.part(cone(0.011, 0.04), IVORY, { at: P([0.05, 1.16, 0.95]), dir: [0, -1, 0], bone: head }); // upper fang
    b.part(ellipsoid(0.026, 0.02, 0.012), BLACK, { at: P([0.06, 1.22, 0.96]), bone: head }); // whisker pad
  }

  // ---------- jaw, hinged at the back of the mouth ----------
  b.part(ellipsoid(0.085, 0.05, 0.13), CREAM, { at: [0, 1.1, 0.89], bone: jaw });
  b.part(ellipsoid(0.065, 0.018, 0.075), MOUTH, { at: [0, 1.135, 0.93], bone: jaw });

  // ---------- mane: long outer ruff, short inner ruff, dark puffs (all on the head) ----------
  for (let k = 0; k < 16; k++) {
    const a = (11.25 + 22.5 * k) * DEG;
    const d = unit([Math.cos(a), Math.sin(a), -0.5]);
    const h = 0.26 + 0.05 * Math.sin(k * 1.7);
    b.part(cone(0.075, h), MANE, { at: add(H, d, 0.16 + h / 2), dir: d, bone: head });
  }
  for (let k = 0; k < 16; k++) {
    const a = 22.5 * k * DEG;
    const d = unit([Math.cos(a), Math.sin(a), -0.3]);
    const h = 0.18 + 0.03 * Math.cos(k * 2.1);
    b.part(cone(0.06, h), MANE_DEEP, { at: add(H, d, 0.17 + h / 2), dir: d, bone: head });
  }
  for (let k = 0; k < 12; k++) {
    const a = 30 * k * DEG;
    const d = unit([Math.cos(a), Math.sin(a), -0.35]);
    b.part(gem(0.095 + 0.012 * Math.sin(k * 2.3)), MANE_DEEP, { at: add(H, d, 0.26), bone: head });
  }

  return b.root;
}
