```ts
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder, countershade, polyline, rng } from "agentic-3js-builder";

export const meta = {
  name: "Autumn Walk Hedgehog",
  description:
    "A plump hedgehog with chestnut, cream-tipped spines, a fawn pointed snout, black nose, beady eyes, pink paws and a red maple leaf stuck on its back.",
};

const FAWN = "#d9b88c";
const CREAM = "#f1e2c4";
const PINK = "#f0a0a8";
const PINK2 = "#d97f8c";
const BLACK = "#15110f";
const CH1 = "#6a3f22";
const CH2 = "#8a5329";
const LEAF = "#c8281e";
const VEIN = "#7d1410";

export default function build() {
  const b = createBuilder({ name: "hedgehog" });
  const rand = rng(11);

  // ---------- skeleton ----------
  const C = new THREE.Vector3(0, 0.09, -0.02);
  const RAD = new THREE.Vector3(0.105, 0.08, 0.135);
  const hips = b.joint("hips", { at: [C.x, C.y, C.z], dir: [0, 0, 1], role: "spine" });
  const neck = b.joint("neck", { parent: hips, at: [0, 0.085, 0.07], aim: [0, 0.08, 0.11], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.08, 0.1], aim: [0, 0.075, 0.2], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.052, 0.15], aim: [0, 0.048, 0.22], role: "jaw" });
  const tailBase = b.joint("tail1", { parent: hips, at: [0, 0.06, -0.14], dir: [0, -0.2, -1], role: "tail" });

  // ---------- body ----------
  const coat = countershade(CH1, CREAM, { level: -0.15, soft: 0.3 });
  b.part(new THREE.SphereGeometry(1, 16, 12), coat, {
    at: [C.x, C.y, C.z],
    scale: [RAD.x, RAD.y, RAD.z],
    bone: hips,
  });
  b.part(new THREE.SphereGeometry(0.02, 6, 4), FAWN, { at: [0, 0.058, -0.15], scale: [1, 0.9, 1.2], bone: tailBase });

  // ---------- spines ----------
  const dark: THREE.BufferGeometry[] = [];
  const light: THREE.BufferGeometry[] = [];
  const tips: THREE.BufferGeometry[] = [];
  const N = 950;
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < N; i++) {
    const y = 1 - (2 * (i + 0.5)) / N;
    const rr = Math.sqrt(1 - y * y);
    const phi = i * 2.399963 + rand() * 0.4;
    const d = new THREE.Vector3(Math.cos(phi) * rr, y, Math.sin(phi) * rr);
    if (d.y < 0.02) continue;
    if (d.z > 0.55 && d.y < 0.5) continue; // face opening
    const pt = new THREE.Vector3(d.x * RAD.x, d.y * RAD.y, d.z * RAD.z).add(C);
    const n = new THREE.Vector3(d.x / RAD.x, d.y / RAD.y, d.z / RAD.z).normalize();
    const dir = n.clone().add(new THREE.Vector3((rand() - 0.5) * 0.25, 0.1, -0.45)).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(up, dir);
    const L = 0.055 + rand() * 0.02;
    const base = pt.clone().addScaledVector(dir, -0.012);
    const m1 = new THREE.Matrix4().compose(base.clone().addScaledVector(dir, L / 2), q, new THREE.Vector3(1, L, 1));
    const m2 = new THREE.Matrix4().compose(base.clone().addScaledVector(dir, L * 0.8), q, new THREE.Vector3(1, L * 0.4, 1));
    const g1 = new THREE.ConeGeometry(0.0115, 1, 5, 1, true).applyMatrix4(m1);
    const g2 = new THREE.ConeGeometry(0.0046, 1, 5, 1, true).applyMatrix4(m2);
    (rand() < 0.5 ? dark : light).push(g1);
    tips.push(g2);
  }
  b.part(mergeGeometries(dark)!, CH1, { bone: hips, at: [0, 0, 0], flat: true });
  b.part(mergeGeometries(light)!, CH2, { bone: hips, at: [0, 0, 0], flat: true });
  b.part(mergeGeometries(tips)!, CREAM, { bone: hips, at: [0, 0, 0], flat: true });

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(1, 12, 8), FAWN, {
    at: [0, 0.08, 0.125],
    scale: [0.05, 0.047, 0.055],
    bone: head,
  });
  // upper jaw / snout
  b.part(new THREE.ConeGeometry(0.036, 0.085, 8), FAWN, {
    at: [0, 0.066, 0.185],
    dir: [0, -0.1, 1],
    bone: head,
  });
  b.part(new THREE.SphereGeometry(0.0145, 8, 6), BLACK, {
    at: [0, 0.058, 0.228],
    scale: [1, 0.85, 0.9],
    bone: head,
  });
  b.part(new THREE.SphereGeometry(0.004, 5, 4), "#ffffff", { at: [0.004, 0.064, 0.236], bone: head });
  // lower jaw
  b.part(new THREE.ConeGeometry(0.024, 0.07, 7), CREAM, {
    at: [0, 0.046, 0.185],
    dir: [0, -0.05, 1],
    bone: jaw,
  });
  // cheeks
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.02, 7, 5), CREAM, {
      at: [s * 0.03, 0.062, 0.15],
      bone: head,
    });
    // eyes
    b.part(new THREE.SphereGeometry(0.0115, 8, 6), BLACK, { at: [s * 0.032, 0.09, 0.158], bone: head });
    b.part(new THREE.SphereGeometry(0.0035, 5, 4), "#ffffff", { at: [s * 0.035, 0.095, 0.167], bone: head });
    // brow tuft
    b.part(new THREE.SphereGeometry(0.012, 6, 4), CH2, { at: [s * 0.03, 0.105, 0.145], scale: [1, 0.6, 1.3], bone: head });
    // ears
    const ear = b.joint(`ear${s > 0 ? "L" : "R"}`, {
      parent: head,
      at: [s * 0.04, 0.11, 0.095],
      dir: [s * 0.5, 1, 0],
      role: "hinge",
    });
    b.part(new THREE.SphereGeometry(0.016, 8, 6), FAWN, {
      at: [s * 0.043, 0.115, 0.095],
      scale: [0.7, 1, 1],
      bone: ear,
    });
    b.part(new THREE.SphereGeometry(0.01, 6, 4), PINK, {
      at: [s * 0.049, 0.114, 0.101],
      scale: [0.5, 0.9, 0.9],
      bone: ear,
    });
  }

  // ---------- legs ----------
  const legs: [string, number, number][] = [
    ["FL", 1, 0.07],
    ["FR", -1, 0.07],
    ["BL", 1, -0.1],
    ["BR", -1, -0.1],
  ];
  for (const [n, s, z] of legs) {
    const pts = [
      [s * 0.065, 0.05, z],
      [s * 0.072, 0.03, z + 0.008],
      [s * 0.074, 0.014, z + 0.02],
    ];
    const chain = b.chain(`leg${n}`, polyline(pts), {
      parent: hips,
      names: [`hip${n}`, `knee${n}`, `ankle${n}`],
      role: "leg",
      contact: [s * 0.074, 0, z + 0.03],
    });
    b.sweep(chain, [0.019, 0.013], { color: FAWN });
    const foot = chain.tip!;
    b.part(new THREE.SphereGeometry(0.0165, 8, 6), PINK, {
      at: [s * 0.074, 0.0105, z + 0.034],
      scale: [1, 0.62, 1.35],
      bone: foot,
    });
    for (let k = -1; k <= 1; k++) {
      b.part(new THREE.SphereGeometry(0.0062, 5, 4), PINK2, {
        at: [s * 0.074 + k * 0.011, 0.0065, z + 0.056 - Math.abs(k) * 0.004],
        bone: foot,
      });
    }
  }

  // ---------- maple leaf ----------
  const R = 0.058;
  const outline: [number, number][] = [];
  const M = 50;
  for (let i = 0; i < M; i++) {
    const th = (i / M) * Math.PI * 2;
    const r = R * (0.5 + 0.5 * Math.pow(Math.abs(Math.cos(2.5 * th)), 0.9)) * (i % 2 ? 0.93 : 1);
    outline.push([r * Math.sin(th), r * Math.cos(th)]);
  }
  const Nrm = new THREE.Vector3(0.22, 1, -0.2).normalize();
  const yv = new THREE.Vector3().crossVectors(Nrm, new THREE.Vector3(1, 0, 0)).normalize();
  const xv = new THREE.Vector3().crossVectors(yv, Nrm).normalize();
  const leaf = b.extrude(outline, {
    at: [0.012, 0.212, -0.05],
    x: xv.toArray() as [number, number, number],
    y: yv.toArray() as [number, number, number],
    thickness: 0.004,
    bevel: 0.001,
    color: LEAF,
    bone: hips,
  });
  for (let k = 0; k < 5; k++) {
    const a = (k * 72 * Math.PI) / 180;
    b.rod(
      leaf.local([0, 0, 0.0025]),
      leaf.local([Math.sin(a) * R * 0.92, Math.cos(a) * R * 0.92, 0.0025]),
      0.0016,
      { color: VEIN, bone: hips },
    );
  }
  b.rod(leaf.local([0, 0, 0]), leaf.local([0, -R * 1.3, 0]), 0.0022, { color: VEIN, bone: hips });

  return b.root;
}
```