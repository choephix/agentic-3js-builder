import * as THREE from "three";
import { createBuilder, rng, catmull, mottle, stripes } from "../../../../src/index";

export const meta = {
  name: "Japanese Garden",
  description:
    "A stylized karesansui and pond garden: raked gravel with boulders, arched red bridge over a koi pond, stone lantern, cloud-pruned pine, maple, bamboo grove, stepping stones and a shishi-odoshi.",
};

export default function build() {
  const b = createBuilder({ name: "japaneseGarden" });
  const root = b.joint("garden", { at: [0, 0, 0] });
  const r = rng(11);

  const add = (geo: THREE.BufferGeometry, color: any, x: number, y: number, z: number, o: any = {}) =>
    b.part(geo, color, { bone: root, at: [x, y, z], flat: true, ...o });

  const STONE = ["#9a9a92", "#868680", "#a8a79d"];
  const BARK = "#5a3d2b";
  const RED = "#c8321f";
  const WOOD = "#7a5232";
  const BAMBOO = "#7aa84a";
  const BAMBOO_D = "#4f7a30";

  // ---------- ground ----------
  add(new THREE.BoxGeometry(8, 0.12, 8), mottle("#5f8a3c", "#729c48", { size: 0.5, seed: 3 }), 0, 0.04, 0, { flat: false });
  for (const s of [1, -1]) {
    add(new THREE.BoxGeometry(0.12, 0.2, 8.2), "#4a3322", s * 4.02, 0.08, 0);
    add(new THREE.BoxGeometry(8.2, 0.2, 0.12), "#4a3322", 0, 0.08, s * 4.02);
  }

  // raked gravel
  add(new THREE.BoxGeometry(2.7, 0.04, 2.8), stripes("#ece6d5", "#cdc6b2", { size: 0.12, axis: "x", seed: 2 }), -2.3, 0.1, 2.2, { flat: false });

  // boulders in the gravel with moss caps
  const boulders: [number, number, number][] = [
    [-2.6, 2.0, 0.42],
    [-2.05, 2.35, 0.28],
    [-3.0, 2.5, 0.22],
  ];
  boulders.forEach(([x, z, s], i) => {
    add(new THREE.IcosahedronGeometry(s, 0), STONE[i % 3], x, 0.12 + s * 0.4, z, { scale: [1, 0.8, 0.9], rotation: [0, i * 50, 0] });
    add(new THREE.SphereGeometry(s * 0.6, 7, 4), "#5d8f3a", x, 0.12 + s * 0.8, z, { scale: [1, 0.4, 0.9] });
  });
  // rake ripples around boulders
  for (const [x, z, s] of boulders.slice(0, 1)) {
    for (let k = 1; k <= 2; k++) {
      add(new THREE.TorusGeometry(s + 0.25 * k, 0.015, 4, 20), "#d8d1bd", x, 0.125, z, { rotation: [90, 0, 0], scale: [1, 1, 1] });
    }
  }

  // ---------- pond ----------
  add(new THREE.CylinderGeometry(1, 1, 0.02, 14), "#b9ad8c", 2, 0.105, -0.25, { scale: [1.85, 1, 1.55] });
  add(new THREE.CylinderGeometry(1, 1, 0.02, 14), "#3f7f93", 2, 0.12, -0.25, { scale: [1.65, 1, 1.35] });
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    if (Math.abs(Math.sin(a)) < 0.2) continue;
    const s = 0.14 + r() * 0.1;
    add(new THREE.IcosahedronGeometry(s, 0), STONE[i % 3], 2 + Math.cos(a) * 1.78, 0.12 + s * 0.35, -0.25 + Math.sin(a) * 1.5, {
      scale: [1, 0.7, 1],
      rotation: [0, r() * 180, 0],
    });
  }
  // lily pads
  const pads: [number, number][] = [[1.4, 0.4], [2.3, 0.7], [2.8, -0.9], [1.6, -1.0]];
  pads.forEach(([x, z], i) => {
    add(new THREE.CylinderGeometry(0.16, 0.16, 0.012, 8), "#3f8a46", x, 0.135, z, { rotation: [0, i * 30, 0] });
    if (i % 2 === 0) add(new THREE.ConeGeometry(0.06, 0.07, 6), "#f2a0c0", x, 0.17, z);
  });
  // koi
  const koi: [number, number, number, string][] = [
    [1.5, -0.6, 0.6, "#ec6a2c"],
    [2.6, 0.2, 2.5, "#f5efe6"],
    [2.0, -0.9, 4.2, "#f2a23a"],
  ];
  for (const [x, z, a, c] of koi) {
    const dx = Math.cos(a), dz = Math.sin(a);
    b.capsule([x, 0.14, z], [x + dx * 0.22, 0.14, z + dz * 0.22], [0.04, 0.03], { color: c, bone: root });
    b.spike([x, 0.14, z], [-dx, 0, -dz], 0.14, 0.04, { color: c, bone: root });
    add(new THREE.SphereGeometry(0.018, 5, 3), "#2a2a2a", x + dx * 0.3, 0.17, z + dz * 0.3);
  }

  // ---------- arched bridge ----------
  const deck = catmull([
    [0.3, 0.2, -0.25],
    [1.1, 0.5, -0.25],
    [2.0, 0.62, -0.25],
    [2.9, 0.5, -0.25],
    [3.7, 0.2, -0.25],
  ]);
  b.sweep(deck, (_t: number) => [0.3, 0.04], { section: "box", color: RED, caps: "flat", bone: root });
  for (const s of [1, -1]) {
    const railPts = [0.3, 1.1, 2.0, 2.9, 3.7].map((x, i) => [x, [0.2, 0.5, 0.62, 0.5, 0.2][i] + 0.34, -0.25 + s * 0.3]);
    b.sweep(catmull(railPts), 0.025, { color: RED, bone: root });
    b.along(deck, 6, (at: any) => {
      const p = at.at;
      b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6), RED, { bone: root, at: [p.x, p.y + 0.2, p.z + s * 0.3] });
      b.part(new THREE.SphereGeometry(0.045, 6, 4), "#e8c24a", { bone: root, at: [p.x, p.y + 0.43, p.z + s * 0.3] });
    });
  }

  // ---------- stepping stones ----------
  const steps: [number, number][] = [[-0.3, 3.7], [-0.1, 3.0], [-0.35, 2.3], [-0.05, 1.6], [-0.3, 0.9], [0.0, 0.3]];
  steps.forEach(([x, z], i) => {
    add(new THREE.CylinderGeometry(0.24, 0.27, 0.07, 7), STONE[i % 3], x, 0.115, z, { rotation: [0, i * 23, 0], scale: [1, 1, 0.85] });
  });

  // ---------- stone lantern ----------
  const lx = -1.2, lz = -1.0, LS = "#a2a198";
  add(new THREE.CylinderGeometry(0.28, 0.33, 0.1, 6), LS, lx, 0.17, lz);
  add(new THREE.CylinderGeometry(0.09, 0.11, 0.55, 6), LS, lx, 0.5, lz);
  add(new THREE.CylinderGeometry(0.2, 0.14, 0.1, 6), LS, lx, 0.82, lz);
  add(new THREE.CylinderGeometry(0.34, 0.3, 0.07, 6), LS, lx, 0.9, lz);
  add(new THREE.BoxGeometry(0.28, 0.28, 0.28), LS, lx, 1.08, lz);
  for (const s of [1, -1]) {
    add(new THREE.BoxGeometry(0.12, 0.14, 0.02), "#ffd45a", lx, 1.08, lz + s * 0.14);
    add(new THREE.BoxGeometry(0.02, 0.14, 0.12), "#ffd45a", lx + s * 0.14, 1.08, lz);
  }
  add(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 6), LS, lx, 1.25, lz);
  add(new THREE.ConeGeometry(0.52, 0.3, 6), "#7d7c74", lx, 1.42, lz);
  add(new THREE.SphereGeometry(0.07, 6, 4), LS, lx, 1.62, lz);
  add(new THREE.SphereGeometry(0.28, 8, 5), "#5d8f3a", lx + 0.35, 0.1, lz + 0.3, { scale: [1, 0.4, 1] });

  // ---------- pine ----------
  const pineTrunk = catmull([
    [-2.8, 0, -2.4],
    [-2.75, 0.7, -2.5],
    [-2.5, 1.4, -2.45],
    [-2.6, 2.1, -2.5],
  ]);
  b.sweep(pineTrunk, [0.17, 0.06], { color: BARK, caps: "flat", bone: root, sides: 7 });
  const pads2: [number, number, number, number, string][] = [
    [-2.1, 1.45, -2.3, 0.6, "#2f5d34"],
    [-3.4, 1.2, -2.6, 0.55, "#386b3b"],
    [-2.6, 2.25, -2.5, 0.7, "#2f5d34"],
    [-3.0, 1.8, -2.2, 0.5, "#386b3b"],
    [-2.3, 1.9, -2.9, 0.45, "#2f5d34"],
  ];
  for (const [x, y, z, s, c] of pads2) {
    b.rod([-2.7, Math.max(0.6, y - 0.35), -2.5], [x, y - 0.08, z], 0.035, { color: BARK, bone: root });
    add(new THREE.SphereGeometry(s, 8, 4), c, x, y, z, { scale: [1.1, 0.38, 1] });
    add(new THREE.SphereGeometry(s * 0.6, 7, 4), "#3f7540", x, y + 0.12, z, { scale: [1, 0.4, 1] });
  }

  // ---------- maple ----------
  const mapleTrunk = catmull([
    [3.0, 0, -3.0],
    [3.1, 0.6, -3.05],
    [2.95, 1.2, -3.0],
  ]);
  b.sweep(mapleTrunk, [0.14, 0.07], { color: "#4b3526", caps: "flat", bone: root, sides: 7 });
  b.rod([3.05, 0.9, -3.03], [3.7, 1.5, -3.0], 0.04, { color: "#4b3526", bone: root });
  b.rod([3.0, 1.0, -3.02], [2.4, 1.6, -3.1], 0.04, { color: "#4b3526", bone: root });
  const reds = ["#d2321f", "#e0561f", "#c1281f", "#eb7a24"];
  for (let i = 0; i < 16; i++) {
    const a = r() * Math.PI * 2, d = r() * 0.8;
    const s = 0.28 + r() * 0.2;
    add(new THREE.IcosahedronGeometry(s, 0), reds[i % 4], 3.0 + Math.cos(a) * d, 1.7 + r() * 0.7, -3.0 + Math.sin(a) * d, { rotation: [r() * 90, r() * 90, 0] });
  }
  for (let i = 0; i < 28; i++) {
    const x = 1.8 + r() * 2.4, z = -4 + r() * 2.2;
    add(new THREE.CircleGeometry(0.045, 5), reds[i % 4], x, 0.125, z, { rotation: [-90, 0, r() * 360], flat: false });
  }

  // ---------- bamboo grove ----------
  for (let i = 0; i < 10; i++) {
    const x = -0.9 + i * 0.28 + (r() - 0.5) * 0.1;
    const z = -3.65 + (r() - 0.5) * 0.4;
    const h = 2.8 + r() * 0.8;
    add(new THREE.CylinderGeometry(0.035, 0.045, h, 6), BAMBOO, x, 0.1 + h / 2, z);
    for (let k = 1; k * 0.55 < h; k++) add(new THREE.CylinderGeometry(0.052, 0.052, 0.025, 6), BAMBOO_D, x, 0.1 + k * 0.55, z);
    for (let k = 0; k < 4; k++) {
      const a = k * 90 + r() * 40;
      add(new THREE.ConeGeometry(0.06, 0.4, 4), "#5d9a3a", x + Math.cos(a) * 0.15, h - 0.05 - r() * 0.3, z + Math.sin(a) * 0.15, {
        scale: [1, 1, 0.3],
        rotation: [Math.sin(a) * 70, 0, -Math.cos(a) * 70],
      });
    }
  }

  // ---------- bamboo fence ----------
  for (let i = 0; i <= 10; i++) {
    add(new THREE.CylinderGeometry(0.035, 0.035, 0.8, 6), BAMBOO, -3.9, 0.45, -3.5 + i * 0.7);
  }
  for (const y of [0.35, 0.65]) b.rod([-3.9, y, -3.5], [-3.9, y, 3.5], 0.03, { color: BAMBOO_D, bone: root });

  // ---------- shishi-odoshi ----------
  for (const s of [1, -1]) add(new THREE.BoxGeometry(0.07, 0.8, 0.07), WOOD, 3.4, 0.5, 1.4 + s * 0.15);
  b.rod([3.4, 0.62, 1.1], [3.4, 0.62, 1.7], 0.03, { color: WOOD, bone: root });
  b.rod([3.4, 0.62, 1.1], [3.4, 0.45, 1.65], 0.055, { color: BAMBOO, bone: root });
  b.rod([3.4, 0.62, 1.1], [3.4, 0.68, 1.02], 0.0, { color: BAMBOO, bone: root });
  add(new THREE.CylinderGeometry(0.2, 0.17, 0.2, 8), "#8d8a82", 3.4, 0.2, 1.1);
  add(new THREE.CylinderGeometry(0.15, 0.15, 0.02, 8), "#3f7f93", 3.4, 0.31, 1.1);

  // moss and small shrubs
  const mounds: [number, number, number][] = [[0.9, 1.8, 0.35], [3.0, 2.9, 0.4], [-0.6, -2.2, 0.3], [-3.4, 0.2, 0.35]];
  mounds.forEach(([x, z, s], i) => {
    add(new THREE.SphereGeometry(s, 8, 5), i % 2 ? "#4f8a3a" : "#6a9f44", x, 0.1, z, { scale: [1.2, 0.55, 1] });
    if (i % 2 === 0) add(new THREE.SphereGeometry(s * 0.35, 6, 4), "#f0a8c8", x + 0.1, 0.2 + s * 0.3, z);
  });

  return b.root;
}
