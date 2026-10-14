import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Autumn Hedgehog",
  description:
    "A plump hedgehog on an evening walk: chestnut spines with cream tips, fawn face, black button nose, pink paws and a red maple leaf on its back.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "hedgehog" });
  const R = rng(11);

  const FAWN = "#dfb888";
  const CREAM = "#f0dcb4";
  const PINK = "#e79a9a";
  const BLACK = "#14100e";

  // ---- skeleton ----
  b.joint("root", { at: [0, 0.085, 0], dir: [0, 0, 1] });
  b.joint("spine", { parent: "root", at: [0, 0.09, 0.0], dir: [0, 0, 1], role: "spine" });
  b.joint("head", { parent: "root", at: [0, 0.07, 0.1], dir: [0, 0, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.045, 0.14], dir: [0, 0, 1], role: "jaw" });
  b.joint("earL", { parent: "head", at: [0.042, 0.092, 0.115], dir: [0, 1, 0] });
  b.joint("earR", { parent: "head", at: [-0.042, 0.092, 0.115], dir: [0, 1, 0] });
  b.joint("tail1", { parent: "root", at: [0, 0.05, -0.115], dir: [0, -0.2, -1], role: "tail" });
  const legs: Array<[string, number, number]> = [
    ["FL", 0.05, 0.07],
    ["FR", -0.05, 0.07],
    ["HL", 0.05, -0.06],
    ["HR", -0.05, -0.06],
  ];
  for (const [n, x, z] of legs) {
    b.joint("hip" + n, { parent: "root", at: [x, 0.04, z], dir: [0, -1, 0], role: "leg" });
    b.joint("paw" + n, { parent: "hip" + n, at: [x, 0.014, z + 0.008], dir: [0, 0, 1], role: "leg" });
  }

  const sph = (r: number, s: [number, number, number], color: string, at: [number, number, number], bone: string, seg = 10) =>
    b.part(new THREE.SphereGeometry(r, seg, Math.max(6, seg - 3)), color, { at, bone, scale: s });

  // ---- body ----
  sph(1, [0.095, 0.07, 0.12], "#5a2f19", [0, 0.085, 0], "root", 14);
  sph(1, [0.075, 0.05, 0.1], CREAM, [0, 0.055, 0.01], "root", 10); // belly

  // ---- spines ----
  const cols = ["#7a4422", "#8a5228", "#5e3218", "#6d3b1f"];
  let placed = 0;
  for (let i = 0; i < 420 && placed < 250; i++) {
    const a = R() * Math.PI * 2;
    const y = -0.05 + 1.05 * R();
    const rxy = Math.sqrt(Math.max(0, 1 - y * y));
    const x = rxy * Math.sin(a);
    const z = rxy * Math.cos(a);
    if (z > 0.5 && y < 0.8) continue;
    if (z > 0.2 && y < 0.35) continue;
    placed++;
    const base = new THREE.Vector3(0.095 * x, 0.085 + 0.07 * y, 0.12 * z).multiplyScalar(1);
    base.y = 0.085 + 0.07 * y;
    const nrm = new THREE.Vector3(x / 0.095, y / 0.07, z / 0.12).normalize();
    const dir = nrm
      .clone()
      .add(new THREE.Vector3((R() - 0.5) * 0.3, 0.2, -0.5 + (R() - 0.5) * 0.3))
      .normalize();
    const len = 0.05 + R() * 0.02;
    const l1 = len * 0.65;
    const l2 = len * 0.35;
    const p1 = base.clone().addScaledVector(dir, -0.006 + l1 / 2);
    b.part(new THREE.CylinderGeometry(0.0045, 0.0075, l1, 4), cols[i % cols.length], { at: p1, dir, bone: "root" });
    const p2 = base.clone().addScaledVector(dir, -0.006 + l1 + l2 / 2);
    b.part(new THREE.ConeGeometry(0.0046, l2, 4), CREAM, { at: p2, dir, bone: "root" });
  }

  // ---- head ----
  sph(0.045, [1, 0.95, 1.05], FAWN, [0, 0.065, 0.125], "head", 12);
  // forehead spine fringe
  for (let k = 0; k < 7; k++) {
    const x = (k - 3) * 0.015;
    const dir = new THREE.Vector3(x * 4, 0.5, -0.6).normalize();
    const at = new THREE.Vector3(x, 0.105, 0.1);
    b.part(new THREE.CylinderGeometry(0.004, 0.0065, 0.022, 4), "#7a4422", { at, dir, bone: "head" });
    b.part(new THREE.ConeGeometry(0.0042, 0.012, 4), CREAM, { at: at.clone().addScaledVector(dir, 0.017), dir, bone: "head" });
  }
  // upper snout and lower jaw
  b.part(new THREE.ConeGeometry(0.032, 0.085, 8), FAWN, { at: [0, 0.062, 0.18], dir: [0, -0.18, 1], axis: "y", bone: "head" });
  b.part(new THREE.ConeGeometry(0.022, 0.06, 8), CREAM, { at: [0, 0.036, 0.165], dir: [0, 0.05, 1], bone: "jaw" });
  sph(0.012, [1, 0.85, 1], BLACK, [0, 0.052, 0.226], "head", 8); // nose
  sph(0.003, [1, 1, 1], "#ffffff", [0.003, 0.058, 0.234], "head", 5);
  // eyes
  for (const s of [1, -1]) {
    sph(0.0085, [1, 1, 1], BLACK, [0.03 * s, 0.078, 0.165], "head", 8);
    sph(0.0027, [1, 1, 1], "#ffffff", [0.032 * s, 0.082, 0.172], "head", 5);
    b.part(new THREE.BoxGeometry(0.016, 0.003, 0.01), "#9b7048", { at: [0.03 * s, 0.09, 0.163], rotation: [0, 0, -12 * s], bone: "head" });
  }
  // ears
  for (const s of [1, -1]) {
    const bone = s > 0 ? "earL" : "earR";
    sph(0.017, [0.8, 1, 0.55], FAWN, [0.044 * s, 0.098, 0.115], bone, 8);
    sph(0.011, [0.7, 0.8, 0.4], PINK, [0.044 * s, 0.098, 0.121], bone, 6);
  }
  // whisker fuzz cheeks
  for (const s of [1, -1]) sph(0.014, [1, 0.8, 1], CREAM, [0.027 * s, 0.05, 0.17], "head", 6);

  // ---- legs & paws ----
  for (const [n, x, z] of legs) {
    const s = x > 0 ? 1 : -1;
    b.part(new THREE.CylinderGeometry(0.014, 0.011, 0.04, 7), FAWN, { at: [x, 0.03, z], bone: "hip" + n });
    sph(0.014, [1.05, 0.55, 1.45], PINK, [x, 0.0075, z + 0.01], "paw" + n, 8);
    for (let t = -1; t <= 1; t++)
      sph(0.0055, [1, 0.8, 1], "#cf7f84", [x + t * 0.008 * s, 0.006, z + 0.027 - Math.abs(t) * 0.002], "paw" + n, 5);
  }

  // ---- tail ----
  b.part(new THREE.ConeGeometry(0.014, 0.035, 6), FAWN, { at: [0, 0.048, -0.13], dir: [0, -0.3, -1], bone: "tail1" });

  // ---- maple leaf ----
  const tips: Array<[number, number]> = [
    [-20, 0.026],
    [30, 0.038],
    [90, 0.048],
    [150, 0.038],
    [200, 0.026],
  ];
  const pts: Array<[number, number]> = [];
  const pol = (deg: number, r: number): [number, number] => [r * Math.cos((deg * Math.PI) / 180), r * Math.sin((deg * Math.PI) / 180)];
  tips.forEach(([a, r], i) => {
    pts.push(pol(a, r));
    if (i < tips.length - 1) pts.push(pol((a + tips[i + 1][0]) / 2, 0.018));
  });
  pts.push(pol(235, 0.016), pol(255, 0.011), pol(285, 0.011), pol(305, 0.016));
  const leaf = b.extrude(pts, {
    color: "#c9371d",
    at: [0.02, 0.19, -0.03],
    x: [1, 0, 0],
    y: [0.1, 0.25, -1],
    thickness: 0.003,
    bone: "root",
    name: "mapleLeaf",
  });
  const veinColor = "#8c1f12";
  b.rod(leaf.local([0, -0.04, 0.002]), leaf.local([0, 0.04, 0.002]), 0.0013, { color: veinColor, bone: "root" });
  for (const [a, r] of tips) {
    if (a === 90) continue;
    const [tx, ty] = pol(a, r * 0.85);
    b.rod(leaf.local([0, -0.005, 0.002]), leaf.local([tx, ty, 0.002]), 0.001, { color: veinColor, bone: "root" });
  }

  return b.root;
}
