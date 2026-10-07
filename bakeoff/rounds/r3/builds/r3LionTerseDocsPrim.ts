import * as THREE from "three";
import { createBuilder, rng, limb, catmull, countershade } from "../../../../src/index";

export const meta = {
  name: "Lion",
  description: "A stylized adult male lion with a full mane, rigged skeleton, jaw and tufted tail.",
};

const TAWNY = "#c89a58";
const CREAM = "#e8d3a2";
const DARK = "#2a1a10";
const NOSE = "#3a2424";
const AMBER = "#e0a21c";
const WHITE = "#f4efe2";
const MANES = ["#6b3a16", "#4e2a10", "#8a5322", "#3d2010"];

export default function build() {
  const b = createBuilder({ name: "lion" });
  const hips = b.joint("hips", { at: [0, 1.0, -0.6], dir: [0, 0.05, 1], role: "spine" });

  // spine
  const spine = b.chain(
    "spine",
    catmull([[0, 1.0, -0.6], [0, 1.03, -0.15], [0, 1.08, 0.3], [0, 1.1, 0.6]]),
    { parent: hips, count: 3, role: "spine" },
  );
  // neck
  const neck = b.chain(
    "neck",
    catmull([[0, 1.1, 0.6], [0, 1.2, 0.8], [0, 1.28, 1.0]]),
    { parent: spine.joints[2], count: 2, role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: neck.at(1).at,
    dir: [0, -0.1, 1],
    role: "head",
  });
  const H = head.at.clone();
  const P = (x: number, y: number, z: number): [number, number, number] => [H.x + x, H.y + y, H.z + z];
  const jaw = b.joint("jaw", {
    parent: head,
    at: P(0, -0.07, 0.15),
    aim: P(0, -0.09, 0.38),
    role: "jaw",
  });

  // body
  const coat = countershade(TAWNY, CREAM, { level: -0.25, soft: 0.3 });
  b.sweep(
    catmull([[0, 1.0, -0.66], [0, 1.03, -0.15], [0, 1.08, 0.3], [0, 1.1, 0.62]]),
    (t) => {
      const r = [0.22, 0.26, 0.29, 0.3][Math.min(3, Math.floor(t * 3.99))];
      return [r * 0.95, r * 1.05];
    },
    { bone: spine, color: coat, sides: 10 },
  );
  b.sweep(neck, [0.2, 0.17], { color: TAWNY, sides: 8 });

  // legs
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // front
    const fs: [number, number, number] = [s * 0.2, 0.96, 0.5];
    const fpts = limb(fs, [s * 0.2, 0.085, 0.55], [0.45, 0.45], [[0, 0, -1]]);
    const fleg = b.chain(`legF${side}`, fpts, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "leg",
      contact: [s * 0.2, 0, 0.58],
    });
    b.sweep(fleg, [0.115, 0.07], { color: coat, sides: 8 });
    const fw = fleg.at(1).at;
    b.part(new THREE.SphereGeometry(0.1, 8, 6), TAWNY, {
      bone: fleg.tip ?? undefined,
      at: [s * 0.2, 0.065, fw.z + 0.04],
      scale: [0.9, 0.65, 1.35],
    });
    for (const k of [-1, 0, 1])
      b.part(new THREE.SphereGeometry(0.018, 5, 4), CREAM, {
        bone: fleg.tip ?? undefined,
        at: [s * 0.2 + k * 0.04, 0.03, fw.z + 0.17],
      });
    // hind
    const hs: [number, number, number] = [s * 0.2, 0.98, -0.55];
    const hpts = limb(hs, [s * 0.2, 0.085, -0.72], [0.46, 0.4, 0.3], [[0, 0, 1], [0, 0, -1]]);
    const hleg = b.chain(`legH${side}`, hpts, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `ankle${side}`],
      role: "leg",
      contact: [s * 0.2, 0, -0.65],
    });
    b.sweep(hleg, [0.1, 0.075, 0.055, 0.055], { color: coat, sides: 8 });
    b.part(new THREE.SphereGeometry(0.2, 9, 7), TAWNY, {
      bone: hleg.joints[0],
      at: [s * 0.22, 0.93, -0.5],
      scale: [0.8, 1.25, 1.1],
    });
    b.part(new THREE.SphereGeometry(0.1, 8, 6), TAWNY, {
      bone: hleg.tip ?? undefined,
      at: [s * 0.2, 0.065, -0.66],
      scale: [0.9, 0.65, 1.4],
    });
  }

  // tail
  const tail = b.chain(
    "tail",
    catmull([[0, 1.0, -0.66], [0, 0.92, -1.0], [0, 0.72, -1.3], [0, 0.55, -1.42], [0, 0.48, -1.5]]),
    { parent: hips, count: 5, role: "tail" },
  );
  b.sweep(tail, [0.05, 0.03], { color: coat, sides: 6 });
  const te = tail.at(1);
  b.part(new THREE.SphereGeometry(0.07, 7, 5), DARK, {
    bone: tail.joints[tail.joints.length - 1],
    at: [te.at.x, te.at.y - 0.02, te.at.z - 0.04],
    scale: [0.9, 1.5, 1.2],
  });

  // head
  b.part(new THREE.SphereGeometry(0.17, 9, 7), TAWNY, { bone: head, at: P(0, 0, 0.1), scale: [1, 0.88, 1.1] });
  b.part(new THREE.BoxGeometry(0.17, 0.11, 0.18), CREAM, { bone: head, at: P(0, -0.04, 0.27) });
  b.part(new THREE.BoxGeometry(0.19, 0.04, 0.12), TAWNY, { bone: head, at: P(0, 0.04, 0.22), rotation: [-12, 0, 0] });
  b.part(new THREE.BoxGeometry(0.07, 0.045, 0.03), NOSE, { bone: head, at: P(0, 0.0, 0.37) });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.045, 6, 5), CREAM, { bone: head, at: P(s * 0.04, -0.07, 0.32), scale: [1, 0.8, 1.1] });
    b.part(new THREE.SphereGeometry(0.026, 7, 5), AMBER, { bone: head, at: P(s * 0.08, 0.05, 0.2) });
    b.part(new THREE.SphereGeometry(0.012, 5, 4), DARK, { bone: head, at: P(s * 0.088, 0.05, 0.222) });
    b.part(new THREE.BoxGeometry(0.06, 0.018, 0.05), "#8a5a2c", { bone: head, at: P(s * 0.08, 0.085, 0.2), rotation: [0, 0, -s * 15] });
    b.part(new THREE.SphereGeometry(0.06, 7, 5), TAWNY, { bone: head, at: P(s * 0.13, 0.15, 0.0), scale: [0.5, 1, 1] });
    b.part(new THREE.SphereGeometry(0.04, 6, 5), "#3a2018", { bone: head, at: P(s * 0.13, 0.15, 0.02), scale: [0.4, 0.8, 0.8] });
    b.part(new THREE.ConeGeometry(0.014, 0.05, 5), WHITE, { bone: head, at: P(s * 0.05, -0.1, 0.35), dir: [0, -1, 0] });
    b.part(new THREE.ConeGeometry(0.012, 0.04, 5), WHITE, { bone: jaw, at: P(s * 0.045, -0.095, 0.35), dir: [0, 1, 0] });
    for (const k of [0, 1, 2])
      b.part(new THREE.SphereGeometry(0.007, 4, 3), DARK, { bone: head, at: P(s * (0.06 + k * 0.015), -0.025 - k * 0.012, 0.33) });
  }
  b.part(new THREE.BoxGeometry(0.12, 0.035, 0.2), CREAM, { bone: jaw, at: P(0, -0.1, 0.27) });

  // mane
  const r = rng(11);
  for (let i = 0; i < 90; i++) {
    const a = r() * Math.PI * 2;
    const rad = 0.2 + r() * 0.12;
    const z = -0.45 + r() * 0.5;
    const down = z < -0.15 ? 0.1 + r() * 0.12 : 0.02;
    let y = H.y - down + Math.cos(a) * rad * 0.95 - 0.04;
    y = Math.max(y, 0.88);
    const g = new THREE.IcosahedronGeometry(0.1 + r() * 0.04, 0);
    b.part(g, MANES[Math.floor(r() * MANES.length)], {
      bone: i % 2 ? head : neck.joints[1],
      at: [Math.sin(a) * rad * 1.15, y, H.z + z],
      scale: [1, 1.1, 1.5],
      rotation: [r() * 60, r() * 60, r() * 60],
      flat: true,
    });
  }
  // chest/belly mane fringe
  for (let i = 0; i < 12; i++) {
    const x = (i / 11 - 0.5) * 0.4;
    b.part(new THREE.IcosahedronGeometry(0.09, 0), MANES[i % 3], {
      bone: spine.joints[2],
      at: [x, 0.84 + (i % 2) * 0.04, 0.62 + (i % 3) * 0.04],
      scale: [0.9, 1.2, 1.2],
      rotation: [i * 20, i * 33, 0],
      flat: true,
    });
  }

  return b.root;
}
