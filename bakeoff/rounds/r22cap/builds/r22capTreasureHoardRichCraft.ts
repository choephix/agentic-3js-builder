import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { rng, DEG } from "../../../../src/math";
import { grain, mottle, scales } from "../../../../src/paint";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Treasure Hoard",
  description:
    "A dragon's hoard: open chest spilling glowing gold, a coin mound with hextech-bright gems, a jewelled crown, goblets, gold bars, a coin sack and a crystal cluster.",
  style: "League of Legends",
  commit: "88fc1f0",
};

type V = [number, number, number];

function xf(g: THREE.BufferGeometry, pos: V, rot: V = [0, 0, 0], scl: V = [1, 1, 1]): THREE.BufferGeometry {
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(pos[0], pos[1], pos[2]),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG)),
    new THREE.Vector3(scl[0], scl[1], scl[2]),
  );
  const c = g.index ? g.toNonIndexed() : g.clone();
  c.applyMatrix4(m);
  return c;
}

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "treasureHoard" });
  const R = rng(11);
  const rr = (a: number, c: number) => a + (c - a) * R();

  // palette
  const GOLD = cel("#ffc41f", "#d9620a");
  const GOLD_BRIGHT = cel("#ffe46b", "#f0a020");
  const WOOD = cel(grain("#6a2c6e", "#4a1c55", { size: 0.025, axis: "x", seed: 3 }), "#2c0f3a");
  const STEEL = cel("#7c93c4", "#3e4f8a");
  const CRIMSON = cel("#d8164a", "#7a0a3a");

  const CY = "#22d8ff";
  const MG = "#ff3fb8";
  const EM = "#3dff8c";
  const RB = "#ff2e4c";
  const VI = "#9a5cff";
  const GEMS = [CY, MG, EM, RB, VI, CY, MG];

  const gemGeo: Record<string, THREE.BufferGeometry[]> = {};
  const addGem = (col: string, g: THREE.BufferGeometry) => {
    (gemGeo[col] ??= []).push(g);
  };
  const ico = new THREE.IcosahedronGeometry(1, 0);
  const octa = new THREE.OctahedronGeometry(1, 0);

  // mound
  const CX = 0;
  const CZ = 0.22;
  const mh = (r: number) => Math.max(0, 0.27 * (1 - (r / 0.64) ** 2));
  const moundPts: Array<[number, number]> = [];
  for (let i = 0; i <= 7; i++) {
    const r = i * 0.09;
    moundPts.push([r, mh(r) - 0.012]);
  }
  moundPts.push([0.66, -0.01], [0, -0.01]);
  b.lathe(moundPts, {
    at: [CX, 0, CZ],
    segments: 14,
    color: scales(["#e8a21a", "#ffc83a", "#f4b02a"], "#a85a10", { size: 0.05 }),
  });

  // blocked zones [x,z,r]
  const crownAt: [number, number] = [0.2, 0.36];
  const blocked: Array<[number, number, number]> = [
    [crownAt[0], crownAt[1], 0.15],
    [-0.62, 0.5, 0.2],
    [0.62, 0.5, 0.14],
    [0.8, 0.3, 0.12],
    [-0.62, -0.2, 0.22],
  ];
  const isBlocked = (x: number, z: number) => blocked.some(([bx, bz, br]) => Math.hypot(x - bx, z - bz) < br);

  // coins
  const coinG = new THREE.CylinderGeometry(0.034, 0.034, 0.008, 8);
  const inG = new THREE.CylinderGeometry(0.024, 0.024, 0.0095, 8);
  const coinCols = ["#ffc12e", "#ffd95a", "#f09a1a"];
  const coinSets: THREE.BufferGeometry[][] = [[], [], []];
  const inSet: THREE.BufferGeometry[] = [];
  const dark: THREE.BufferGeometry[] = [];
  const addCoin = (pos: V, rot: V) => {
    const k = Math.floor(R() * 3);
    coinSets[k]!.push(xf(coinG, pos, rot));
    inSet.push(xf(inG, pos, rot));
  };
  for (let i = 0; i < 230; i++) {
    const a = rr(0, Math.PI * 2);
    const r = Math.sqrt(R()) * 0.6;
    const x = CX + r * Math.cos(a);
    const z = CZ + r * Math.sin(a);
    if (isBlocked(x, z) || z < -0.06) continue;
    const edge = r > 0.5 && R() < 0.35;
    addCoin([x, mh(r) + (edge ? 0.03 : 0.006), z], edge ? [rr(70, 100), rr(0, 360), 0] : [rr(-30, 30), rr(0, 360), rr(-30, 30)]);
  }
  // floor scatter
  for (let i = 0; i < 40; i++) {
    const a = rr(0, Math.PI * 2);
    const r = rr(0.6, 1.0);
    const x = CX + r * Math.cos(a) * 1.05;
    const z = CZ + r * Math.sin(a) * 0.9;
    if (isBlocked(x, z) || z < -0.1) continue;
    addCoin([x, 0.005, z], [rr(-8, 8), rr(0, 360), rr(-8, 8)]);
  }
  // coin stacks on floor
  const stacks: Array<[number, number, number]> = [
    [-0.25, 0.95, 9],
    [-0.12, 1.02, 5],
    [0.08, 1.0, 3],
    [0.3, 0.98, 6],
  ];
  for (const [sx, sz, n] of stacks)
    for (let i = 0; i < n; i++) addCoin([sx + rr(-0.004, 0.004), 0.005 + i * 0.0085, sz + rr(-0.004, 0.004)], [0, rr(0, 360), 0]);
  // coins spilling from chest down its front
  for (let i = 0; i < 26; i++) {
    const t = R();
    addCoin([rr(-0.2, 0.2), 0.012 + t * 0.012, rr(-0.06, 0.0) - 0.0 + t * 0.2], [rr(-12, 12), rr(0, 360), rr(-12, 12)]);
  }
  // coins heaped in chest
  for (let i = 0; i < 40; i++)
    addCoin([rr(-0.28, 0.28), 0.32 + rr(0, 0.05), rr(-0.46, -0.16)], [rr(-35, 35), rr(0, 360), rr(-35, 35)]);

  for (let k = 0; k < 3; k++) if (coinSets[k]!.length) b.part(mergeGeometries(coinSets[k]!), coinCols[k]!, { at: [0, 0, 0] });
  b.part(mergeGeometries(inSet), "#ffe89a", { at: [0, 0, 0] });
  void dark;

  // gems on the mound
  for (let i = 0; i < 30; i++) {
    const a = rr(0, Math.PI * 2);
    const r = Math.sqrt(R()) * 0.58;
    const x = CX + r * Math.cos(a);
    const z = CZ + r * Math.sin(a);
    if (isBlocked(x, z) || z < -0.04) continue;
    const s = rr(0.022, 0.042);
    const col = GEMS[i % GEMS.length]!;
    addGem(col, xf(R() < 0.5 ? ico : octa, [x, mh(r) + s * 0.8, z], [rr(-30, 30), rr(0, 360), rr(-30, 30)], [s, s * 1.35, s]));
  }
  // feature gems
  const feature: Array<[number, number, number, string, number]> = [
    [-0.28, 0.5, 0.06, CY, 0.07],
    [0.34, 0.62, 0.0, MG, 0.06],
    [-0.12, 0.12, 0.0, EM, 0.055],
    [0.48, 0.3, 0.0, RB, 0.05],
    [0.1, 0.75, 0.0, VI, 0.045],
  ];
  for (const [fx, fz, , col, s] of feature) {
    const r = Math.hypot(fx - CX, fz - CZ);
    addGem(col, xf(octa, [fx, mh(r) + s * 1.1, fz], [rr(-15, 15), rr(0, 360), rr(-15, 15)], [s, s * 1.5, s]));
  }

  // chest
  const CHZ = -0.3;
  const body = b.part(new THREE.BoxGeometry(0.72, 0.3, 0.42), WOOD, { at: [0, 0.15, CHZ] });
  void body;
  b.part(new THREE.BoxGeometry(0.76, 0.025, 0.46), STEEL, { at: [0, 0.3, CHZ] });
  b.part(new THREE.BoxGeometry(0.76, 0.03, 0.46), GOLD, { at: [0, 0.012, CHZ] });
  for (const s of [1, -1]) {
    for (const x of [-0.22, 0.22]) {
      b.part(new THREE.BoxGeometry(0.06, 0.29, 0.03), GOLD, { at: [x, 0.15, CHZ + 0.215] });
      b.part(new THREE.BoxGeometry(0.06, 0.03, 0.46), GOLD, { at: [x, 0.30, CHZ] });
    }
    b.part(new THREE.BoxGeometry(0.05, 0.05, 0.05), GOLD_BRIGHT, { at: [s * 0.37, 0.04, CHZ + 0.2] });
    b.part(new THREE.BoxGeometry(0.05, 0.05, 0.05), GOLD_BRIGHT, { at: [s * 0.37, 0.04, CHZ - 0.2] });
    b.part(new THREE.BoxGeometry(0.05, 0.05, 0.05), GOLD_BRIGHT, { at: [s * 0.37, 0.28, CHZ + 0.2] });
    b.part(new THREE.BoxGeometry(0.05, 0.05, 0.05), GOLD_BRIGHT, { at: [s * 0.37, 0.28, CHZ - 0.2] });
    // rivets on bands
    for (let k = 0; k < 4; k++)
      b.part(new THREE.SphereGeometry(0.007, 5, 4), GOLD_BRIGHT, { at: [s * 0.22, 0.05 + k * 0.07, CHZ + 0.233] });
  }
  // lock plate
  b.part(new THREE.BoxGeometry(0.1, 0.1, 0.03), GOLD_BRIGHT, { at: [0, 0.25, CHZ + 0.225] });
  addGem(CY, xf(octa, [0, 0.25, CHZ + 0.25], [0, 0, 0], [0.028, 0.04, 0.02]));
  // glowing heap inside chest
  glow(b.part(new THREE.SphereGeometry(1, 10, 6), "#ffcc3a", { at: [0, 0.3, CHZ], scale: [0.33, 0.07, 0.2] }), 1.1);

  // open lid
  const arch = (g: number): Array<[number, number]> => [
    [-g, -0.012],
    [0.43 + g, -0.012],
    [0.43 + g, 0.05],
    [0.37, 0.1 + g],
    [0.215, 0.13 + g],
    [0.06, 0.1 + g],
    [-g, 0.05],
  ];
  const pivot: V = [0, 0.31, CHZ - 0.21];
  const lx: V = [0, 0.94, -0.34];
  const ly: V = [0, -0.34, -0.94];
  b.extrude(arch(0), { at: pivot, x: lx, y: ly, thickness: 0.72, bevel: 0.006, color: WOOD });
  for (const x of [-0.22, 0.22])
    b.extrude(arch(0.012), { at: [x, pivot[1], pivot[2]], x: lx, y: ly, thickness: 0.06, color: GOLD });
  // inner lining (crimson) slab on the open lid face
  b.extrude(
    [
      [0.03, 0.0],
      [0.4, 0.0],
      [0.4, 0.012],
      [0.03, 0.012],
    ],
    { at: [0, pivot[1] + 0.005, pivot[2] + 0.002], x: lx, y: [0, 0.34, 0.94], thickness: 0.66, color: CRIMSON },
  );

  // crystal cluster
  const cr: Array<[number, number, number, number, number, number]> = [
    [-0.2, -0.78, 0.45, 0.05, -0.12, 0.08],
    [0.1, -0.82, 0.62, 0.06, 0.05, 0.05],
    [0.32, -0.74, 0.38, 0.045, 0.2, 0.1],
    [-0.42, -0.7, 0.3, 0.04, -0.3, 0.1],
    [0.5, -0.66, 0.26, 0.035, 0.3, 0.1],
    [0.0, -0.7, 0.34, 0.04, 0.0, 0.2],
  ];
  cr.forEach(([x, z, len, r, dx, dz], i) => {
    const col = i % 3 === 0 ? CY : i % 3 === 1 ? VI : MG;
    glow(b.spike([x, 0, z], [dx, 1, dz], len, r, col, { sides: 6, caps: "none" }));
  });

  // crown
  const [kx, kz] = crownAt;
  const ky = mh(Math.hypot(kx - CX, kz - CZ)) - 0.015;
  b.lathe(
    [
      [0.108, 0],
      [0.12, 0.004],
      [0.12, 0.066],
      [0.108, 0.07],
      [0.1, 0.07],
      [0.1, 0],
    ],
    { at: [kx, ky, kz], segments: 14, color: GOLD },
  );
  b.lathe(
    [
      [0, 0.03],
      [0.1, 0.03],
      [0.098, 0.08],
      [0.07, 0.12],
      [0, 0.14],
    ],
    { at: [kx, ky, kz], segments: 14, color: CRIMSON },
  );
  for (const y of [0.006, 0.064])
    b.part(new THREE.TorusGeometry(0.119, 0.006, 4, 14), GOLD_BRIGHT, { at: [kx, ky + y, kz], rotation: [90, 0, 0] });
  const pearls: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const tall = i % 2 === 0;
    const len = tall ? 0.12 : 0.075;
    const bx = kx + 0.112 * c;
    const bz = kz + 0.112 * s;
    b.spike([bx, ky + 0.06, bz], [c * 0.12, 1, s * 0.12], len, 0.028, GOLD, { sides: 4 });
    pearls.push(xf(new THREE.SphereGeometry(0.017, 6, 4), [bx + c * 0.01, ky + 0.06 + len + 0.012, bz + s * 0.01]));
    addGem(GEMS[i]!, xf(octa, [kx + 0.123 * c, ky + 0.037, kz + 0.123 * s], [0, -a / DEG + 90, 0], [0.018, 0.026, 0.01]));
  }
  b.part(mergeGeometries(pearls), "#fff0f6", { at: [0, 0, 0] });

  // goblets
  const goblet = (x: number, z: number, col: string) => {
    const at: V = [x, 0, z];
    b.lathe(
      [
        [0, 0],
        [0.06, 0],
        [0.06, 0.012],
        [0.02, 0.032],
        [0.014, 0.1],
        [0.035, 0.115],
        [0.05, 0.13],
        [0.075, 0.19],
        [0.075, 0.23],
        [0.066, 0.23],
        [0.06, 0.19],
        [0, 0.15],
      ],
      { at, segments: 10, color: GOLD },
    );
    b.part(new THREE.TorusGeometry(0.03, 0.007, 4, 8), GOLD_BRIGHT, { at: [x, 0.07, z], rotation: [90, 0, 0] });
    b.part(new THREE.TorusGeometry(0.076, 0.004, 4, 10), GOLD_BRIGHT, { at: [x, 0.228, z], rotation: [90, 0, 0] });
    b.part(new THREE.TorusGeometry(0.06, 0.005, 4, 10), GOLD_BRIGHT, { at: [x, 0.005, z], rotation: [90, 0, 0] });
    glow(b.part(new THREE.CylinderGeometry(0.062, 0.062, 0.004, 10), col, { at: [x, 0.213, z] }), 1.2);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      addGem(i % 2 ? col : CY, xf(ico, [x + 0.066 * Math.cos(a), 0.165, z + 0.066 * Math.sin(a)], [0, 0, 0], [0.009, 0.012, 0.009]));
    }
  };
  goblet(0.62, 0.5, MG);
  goblet(0.8, 0.3, VI);
  goblet(-0.6, 0.85, CY);

  // coin sack
  const SX = -0.62;
  const SZ = 0.5;
  b.lathe(
    [
      [0, 0],
      [0.1, 0.005],
      [0.14, 0.08],
      [0.11, 0.16],
      [0.04, 0.2],
      [0.06, 0.24],
      [0.08, 0.27],
      [0.045, 0.25],
      [0, 0.2],
    ],
    { at: [SX, 0, SZ], segments: 9, color: mottle("#c98a3c", "#9c6224", { size: 0.06, seed: 5 }) },
  );
  b.part(new THREE.TorusGeometry(0.05, 0.008, 4, 9), "#5a3412", { at: [SX, 0.2, SZ], rotation: [90, 0, 0] });
  for (let i = 0; i < 5; i++) addCoin([SX + 0.14 + rr(0, 0.12), 0.006 + (i > 2 ? 0.008 : 0), SZ + rr(-0.06, 0.1)], [rr(-6, 6), rr(0, 360), rr(-6, 6)]);
  b.part(mergeGeometries(coinSets[0]!.slice(-5)), coinCols[0]!, { at: [0, 0, 0] });

  // gold bars
  const barG = new THREE.BoxGeometry(0.16, 0.045, 0.07);
  const stamp = new THREE.BoxGeometry(0.06, 0.003, 0.03);
  const bars: V[] = [
    [-0.82, 0.0225, -0.12],
    [-0.62, 0.0225, -0.14],
    [-0.42, 0.0225, -0.1],
    [-0.72, 0.0675, -0.13],
    [-0.52, 0.0675, -0.12],
    [-0.62, 0.1125, -0.125],
  ];
  const barGeos: THREE.BufferGeometry[] = [];
  const stampGeos: THREE.BufferGeometry[] = [];
  bars.forEach((p, i) => {
    const rot: V = [0, i * 7 - 10, 0];
    barGeos.push(xf(barG, p, rot));
    stampGeos.push(xf(stamp, [p[0], p[1] + 0.0235, p[2]], rot));
  });
  b.part(mergeGeometries(barGeos), GOLD_BRIGHT, { at: [0, 0, 0] });
  b.part(mergeGeometries(stampGeos), "#c77a10", { at: [0, 0, 0] });

  // gem parts (glowing)
  for (const col of Object.keys(gemGeo)) glow(b.part(mergeGeometries(gemGeo[col]!), col, { at: [0, 0, 0] }), 1.3);

  return b.root;
}
