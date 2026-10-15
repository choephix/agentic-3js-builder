import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { grain, mottle, paint } from "../../../../src/paint";
import { rng } from "../../../../src/math";
import { svg } from "../../../../src/texture";
import { cel, INK, inkLines } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Treasure Hoard",
  description:
    "A dragon's hoard on a crimson rug: heaped gold coins, glowing gems, an open iron-banded chest, a spiked jewelled crown, three goblets, ingots, coin stacks and a cyan crystal cluster, cel-shaded with glowing magic accents.",
  style: "League of Legends",
  commit: "88fc1f0",
};

type P3 = [number, number, number];

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "treasureHoard" });
  const R = rng(11);
  const TAU = Math.PI * 2;

  // ---------- palette ----------
  const GOLD = cel("#ffc22e", "#c8741a");
  const GOLD_L = cel("#ffe27a", "#e0a030");
  const GOLD_D = cel("#d99a1c", "#8f4f10");
  const SILVER = cel("#dfe9ff", "#7d8fd0");
  const WOOD = cel(grain("#8a4a24", "#6a3419", { size: 0.025, axis: "x" }), "#43200f");
  const WOOD_D = cel("#4a2416", "#26110d");
  const VELVET = cel("#c01848", "#6a0f3c");
  const RUG = cel(mottle("#8e1b3d", "#a82a4c", { size: 0.08, seed: 3 }), "#4c0c2a");
  const IRON = cel("#5b6b8c", "#2c3558");
  const GEMC = ["#ff2a5a", "#2f8bff", "#2fe38d", "#b45cff", "#ffd23a", "#3de8ff"];

  // ---------- merge collectors ----------
  const tmpM = new THREE.Matrix4();
  const tmpQ = new THREE.Quaternion();
  const tmpE = new THREE.Euler();
  const place = (g: THREE.BufferGeometry, p: P3, r: P3, s: P3): THREE.BufferGeometry => {
    tmpE.set(r[0], r[1], r[2]);
    tmpQ.setFromEuler(tmpE);
    tmpM.compose(new THREE.Vector3(p[0], p[1], p[2]), tmpQ, new THREE.Vector3(s[0], s[1], s[2]));
    g.applyMatrix4(tmpM);
    return g;
  };
  const coinSets: THREE.BufferGeometry[][] = [[], [], []];
  const coin = (x: number, y: number, z: number, rx: number, ry: number, rz: number, i: number, s = 1) => {
    coinSets[i % 3].push(place(new THREE.CylinderGeometry(0.032 * s, 0.032 * s, 0.009, 8, 1), [x, y, z], [rx, ry, rz], [1, 1, 1]));
  };
  const gemSets: THREE.BufferGeometry[][] = GEMC.map(() => []);
  const gem = (ci: number, p: P3, s: number, ys = 1.3, rot = 0) => {
    const kind = (gemSets[ci].length + ci) % 3;
    const g = kind === 0 ? new THREE.OctahedronGeometry(1, 0) : kind === 1 ? new THREE.IcosahedronGeometry(1, 0) : new THREE.DodecahedronGeometry(1, 0);
    gemSets[ci].push(place(g, p, [0, rot, 0], [s, s * ys, s]));
  };
  const goldBits: THREE.BufferGeometry[] = [];
  const bit = (p: P3, r: number) => {
    goldBits.push(place(new THREE.SphereGeometry(r, 6, 4), p, [0, 0, 0], [1, 1, 1]));
  };

  // ---------- rug ----------
  b.lathe(
    [
      [0, 0],
      [1.02, 0],
      [1.02, 0.012],
      [0, 0.012],
    ],
    { at: [0, 0, 0], segments: 32, color: paint((p) => {
      const d = Math.hypot(p.x, p.z);
      if (d > 0.95 && d < 0.985) return "#ffc22e";
      if (d > 0.985) return "#6a0f3c";
      return RUG;
    }) },
  );
  const runeSvg = (() => {
    let s = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#ffc22e" stroke-width="1.2">`;
    s += `<circle cx="50" cy="50" r="47"/><circle cx="50" cy="50" r="38"/>`;
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * TAU;
      s += `<line x1="${50 + Math.cos(a) * 40}" y1="${50 + Math.sin(a) * 40}" x2="${50 + Math.cos(a) * 45.5}" y2="${50 + Math.sin(a) * 45.5}"/>`;
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      const a2 = ((i + 3) / 8) * TAU;
      s += `<line x1="${50 + Math.cos(a) * 36}" y1="${50 + Math.sin(a) * 36}" x2="${50 + Math.cos(a2) * 36}" y2="${50 + Math.sin(a2) * 36}"/>`;
    }
    return s + `</g></svg>`;
  })();
  b.part(new THREE.PlaneGeometry(1.86, 1.86), "#ffffff", { at: [0, 0.0135, 0], dir: [0, 1, 0], axis: "z", texture: svg(runeSvg, { size: 512 }) });

  // ---------- coin mound ----------
  const MC = [0.12, 0.18];
  const MR = 0.58;
  const hgt = (d: number) => 0.34 * Math.pow(Math.max(0, 1 - d / MR), 0.9);
  const moundPts: OutlinePoint[] = [
    [0, 0],
    [MR + 0.02, 0],
    ...[0.9, 0.75, 0.6, 0.45, 0.3, 0.15, 0].map((f): OutlinePoint => [f * MR, Math.max(0, hgt(f * MR) - 0.03)]),
  ];
  b.lathe(moundPts, { at: [MC[0], 0.012, MC[1]], segments: 14, color: GOLD_D });
  for (let i = 0; i < 520; i++) {
    const a = R() * TAU;
    const d = (MR - 0.02) * Math.sqrt(R());
    coin(MC[0] + Math.cos(a) * d, 0.012 + hgt(d) + 0.006, MC[1] + Math.sin(a) * d, (R() - 0.5) * 1.3, R() * Math.PI, (R() - 0.5) * 1.3, i);
  }
  for (let i = 0; i < 34; i++) {
    const a = R() * TAU;
    const d = 0.48 * Math.sqrt(R());
    gem(i % 6, [MC[0] + Math.cos(a) * d, 0.012 + hgt(d) + 0.016, MC[1] + Math.sin(a) * d], 0.016 + R() * 0.014, 1.3, R() * 3);
  }
  // floor spill
  for (let i = 0; i < 90; i++) {
    const a = R() * TAU;
    const d = 0.62 + R() * 0.33;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    if (z < -0.16 || Math.hypot(x - MC[0], z - MC[1]) < 0.62) continue;
    coin(x, 0.0175, z, (R() - 0.5) * 0.25, R() * 3, (R() - 0.5) * 0.25, i);
  }
  for (let i = 0; i < 14; i++) {
    const a = R() * TAU;
    const d = 0.65 + R() * 0.28;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    if (z < -0.16 || Math.hypot(x - MC[0], z - MC[1]) < 0.62) continue;
    gem(i % 6, [x, 0.03, z], 0.02 + R() * 0.01, 1.2, R() * 3);
  }
  // coin stacks
  for (const [sx, sz, n] of [
    [-0.15, 0.8, 9],
    [-0.05, 0.86, 6],
    [-0.27, 0.72, 4],
  ] as Array<[number, number, number]>) {
    for (let i = 0; i < n; i++) coin(sx + (R() - 0.5) * 0.006, 0.0165 + i * 0.0095, sz + (R() - 0.5) * 0.006, 0, R() * 3, 0, i);
  }

  // ---------- chest ----------
  const CX = -0.25;
  const CZ = -0.42;
  const HZ = CZ - 0.23;
  const lidP = (u: number, v: number, w: number): P3 => [CX + u, 0.312 + 0.94 * w - 0.342 * v, HZ - 0.342 * w - 0.94 * v];
  const LR: P3 = [-110, 0, 0];
  b.part(new THREE.BoxGeometry(0.76, 0.04, 0.5), WOOD_D, { at: [CX, 0.032, CZ] });
  b.part(new THREE.BoxGeometry(0.72, 0.28, 0.46), WOOD, { at: [CX, 0.172, CZ] });
  for (const sx of [1, -1]) {
    for (const sz of [1, -1]) b.part(new THREE.BoxGeometry(0.05, 0.32, 0.05), GOLD, { at: [CX + sx * 0.36, 0.172, CZ + sz * 0.23] });
    b.part(new THREE.BoxGeometry(0.06, 0.31, 0.47), GOLD, { at: [CX + sx * 0.22, 0.172, CZ] });
    for (const ry of [0.07, 0.27]) {
      bit([CX + sx * 0.22 - 0.015, ry + 0.012, CZ + 0.238], 0.008);
      bit([CX + sx * 0.22 + 0.015, ry + 0.012, CZ + 0.238], 0.008);
    }
  }
  b.part(new THREE.BoxGeometry(0.7, 0.006, 0.005), WOOD_D, { at: [CX, 0.1, CZ + 0.232] });
  b.part(new THREE.BoxGeometry(0.7, 0.006, 0.005), WOOD_D, { at: [CX, 0.2, CZ + 0.232] });
  b.part(new THREE.BoxGeometry(0.12, 0.13, 0.02), GOLD_L, { at: [CX, 0.23, CZ + 0.238] });
  b.part(new THREE.BoxGeometry(0.02, 0.045, 0.006), INK, { at: [CX, 0.21, CZ + 0.249] });
  gem(0, [CX, 0.265, CZ + 0.256], 0.022, 1.2);
  b.part(new THREE.BoxGeometry(0.72, 0.012, 0.46), WOOD, { at: [CX, 0.302, CZ] });
  b.part(new THREE.BoxGeometry(0.62, 0.016, 0.38), GOLD_D, { at: [CX, 0.31, CZ] });
  b.part(new THREE.SphereGeometry(1, 10, 6), GOLD, { at: [CX, 0.31, CZ], scale: [0.3, 0.1, 0.18] });
  for (let i = 0; i < 80; i++) {
    const a = R() * TAU;
    const rr = Math.sqrt(R());
    const ux = Math.cos(a) * rr;
    const uz = Math.sin(a) * rr;
    const y = 0.31 + 0.1 * Math.sqrt(Math.max(0, 1 - rr * rr)) + 0.004;
    coin(CX + ux * 0.29, y, CZ + uz * 0.17, (R() - 0.5) * 0.9, R() * 3, (R() - 0.5) * 0.9, i);
  }
  for (let i = 0; i < 8; i++) gem(i % 6, [CX + (R() - 0.5) * 0.4, 0.4, CZ + (R() - 0.5) * 0.2], 0.018 + R() * 0.01, 1.3, R() * 3);
  // lid
  b.part(new THREE.BoxGeometry(0.72, 0.04, 0.46), WOOD, { at: lidP(0, 0, 0.23), rotation: LR });
  b.part(new THREE.BoxGeometry(0.66, 0.008, 0.4), VELVET, { at: lidP(0, -0.024, 0.23), rotation: LR });
  b.part(new THREE.BoxGeometry(0.74, 0.05, 0.04), GOLD, { at: lidP(0, 0, 0.46), rotation: LR });
  b.part(new THREE.BoxGeometry(0.74, 0.05, 0.04), GOLD, { at: lidP(0, 0, 0.0), rotation: LR });
  for (const sx of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.06, 0.012, 0.47), GOLD, { at: lidP(sx * 0.22, 0.026, 0.23), rotation: LR });
    b.part(new THREE.BoxGeometry(0.05, 0.05, 0.05), IRON, { at: lidP(sx * 0.2, 0, 0.0), rotation: LR });
    for (const w of [0.08, 0.38]) bit(lidP(sx * 0.22, 0.036, w), 0.009);
  }
  gem(1, lidP(0, 0.045, 0.3), 0.03, 1.1);
  b.part(new THREE.BoxGeometry(0.14, 0.012, 0.1), GOLD_L, { at: lidP(0, 0.028, 0.3), rotation: LR });

  // ---------- crown ----------
  const CRX = MC[0];
  const CRZ = MC[1];
  const CRY = 0.012 + 0.3;
  b.lathe(
    [
      [0.1, 0],
      [0.118, 0],
      [0.126, 0.014],
      [0.12, 0.09],
      [0.098, 0.09],
      [0.098, 0.014],
    ],
    { at: [CRX, CRY, CRZ], segments: 16, color: inkLines(GOLD, { levels: [0.6, -0.6], axis: [0, 1, 0], ink: "#8a4a10", width: 0.05 }) },
  );
  b.lathe(
    [
      [0, 0.07],
      [0.1, 0.07],
      [0.096, 0.1],
      [0.07, 0.15],
      [0, 0.17],
    ],
    { at: [CRX, CRY, CRZ], segments: 12, color: VELVET },
  );
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    const x = CRX + Math.cos(a) * 0.118;
    const z = CRZ + Math.sin(a) * 0.118;
    const h = i % 2 ? 0.065 : 0.105;
    b.spike([x, CRY + 0.085, z], [0, 1, 0], h, 0.02, GOLD, { sides: 6 });
    gem((i * 2 + 1) % 6, [x, CRY + 0.085 + h + 0.008, z], 0.015);
    gem(i % 3 === 0 ? 0 : i % 3 === 1 ? 1 : 2, [CRX + Math.cos(a) * 0.126, CRY + 0.05, CRZ + Math.sin(a) * 0.126], 0.013, 1.5, a);
  }
  b.sweep(catmull([[CRX - 0.112, CRY + 0.09, CRZ], [CRX, CRY + 0.19, CRZ], [CRX + 0.112, CRY + 0.09, CRZ]]), 0.009, { color: GOLD_L, sides: 6 });
  b.sweep(catmull([[CRX, CRY + 0.09, CRZ - 0.112], [CRX, CRY + 0.19, CRZ], [CRX, CRY + 0.09, CRZ + 0.112]]), 0.009, { color: GOLD_L, sides: 6 });
  b.part(new THREE.SphereGeometry(0.02, 8, 6), GOLD_L, { at: [CRX, CRY + 0.2, CRZ] });
  gem(0, [CRX, CRY + 0.232, CRZ], 0.02, 1.6);

  // ---------- goblets ----------
  const goblet = (x: number, z: number, s: number, body: typeof GOLD, gi: number, liquid: string | null) => {
    const pts: Array<[number, number]> = [
      [0, 0], [0.05, 0], [0.052, 0.01], [0.04, 0.02], [0.018, 0.035], [0.014, 0.06], [0.026, 0.075], [0.014, 0.09],
      [0.03, 0.1], [0.05, 0.13], [0.062, 0.18], [0.064, 0.2], [0.056, 0.2], [0.05, 0.18], [0.036, 0.14], [0, 0.125],
    ];
    b.lathe(pts.map(([px, py]): OutlinePoint => [px * s, py * s]), { at: [x, 0.012, z], segments: 10, color: body });
    bit([x, 0.012 + 0.075 * s, z], 0.024 * s);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      gem(gi, [x + Math.cos(a) * 0.058 * s, 0.012 + 0.14 * s, z + Math.sin(a) * 0.058 * s], 0.009 * s, 1.2, a);
    }
    if (liquid) {
      glow(b.part(new THREE.CylinderGeometry(0.044 * s, 0.044 * s, 0.006, 10), liquid, { at: [x, 0.012 + 0.165 * s, z] }), 0.9);
    } else {
      for (let i = 0; i < 7; i++) {
        const a = R() * TAU;
        const d = 0.03 * s * Math.sqrt(R());
        gem(i % 3 === 0 ? 0 : i % 3 === 1 ? 4 : 2, [x + Math.cos(a) * d, 0.012 + 0.17 * s + R() * 0.015, z + Math.sin(a) * d], 0.013 * s, 1.2, a);
      }
    }
  };
  goblet(-0.62, 0.25, 1.15, GOLD, 0, null);
  goblet(-0.5, 0.68, 1.0, SILVER, 1, "#ff3b6b");
  goblet(0.8, 0.35, 1.45, GOLD_L, 3, "#5ad7ff");

  // ---------- ingots ----------
  const ingot = (x: number, y: number, z: number) => {
    b.frustumBox([x, y, z], [x, y + 0.045, z], [0.14, 0.07], [0.11, 0.05], { color: GOLD_L });
    b.part(new THREE.BoxGeometry(0.06, 0.004, 0.03), GOLD_D, { at: [x, y + 0.046, z] });
  };
  for (const dx of [-0.15, 0, 0.15]) ingot(0.58 + dx, 0.012, 0.66);
  for (const dx of [-0.075, 0.075]) ingot(0.58 + dx, 0.057, 0.66);
  ingot(0.58, 0.102, 0.66);

  // ---------- crystal cluster ----------
  const cluster: Array<[P3, number, number, string]> = [
    [[0, 1, 0], 0.55, 0.06, "#3de8ff"],
    [[0.35, 1, 0.1], 0.38, 0.045, "#7ad9ff"],
    [[-0.3, 1, 0.2], 0.32, 0.04, "#3de8ff"],
    [[0.15, 1, -0.35], 0.27, 0.035, "#7ad9ff"],
    [[0.1, 1, 0.45], 0.2, 0.03, "#3de8ff"],
  ];
  cluster.forEach(([d, len, r, col], i) => {
    const dir = new THREE.Vector3(...d).normalize();
    glow(b.spike([0.72 + (i % 3) * 0.045 - 0.04, 0.015, -0.38 + (i % 2) * 0.07], dir, len, r, col, { sides: 6 }), 1.2);
  });

  // ---------- flush merged parts ----------
  const flush = (arr: THREE.BufferGeometry[], color: string | ReturnType<typeof cel>, g?: number) => {
    if (!arr.length) return;
    const part = b.part(mergeGeometries(arr), color, { at: [0, 0, 0] });
    if (g) glow(part, g);
  };
  flush(coinSets[0], "#ffc828");
  flush(coinSets[1], "#ffe070");
  flush(coinSets[2], "#e8a010");
  flush(goldBits, "#ffd75a");
  gemSets.forEach((arr, i) => flush(arr, GEMC[i], 1.15));

  return b.root;
}
