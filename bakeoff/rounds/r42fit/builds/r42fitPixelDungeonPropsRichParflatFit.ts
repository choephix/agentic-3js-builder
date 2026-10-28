import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Dungeon Prop Set",
  "description": "A pixel-art group of dungeon props: an iron-banded treasure chest, two wall torches on posts, stacked barrels, a bone pile with skull and a spike trap."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  woodDark: "#4a2c17",
  woodMid: "#7a4a26",
  woodLight: "#a86a38",
  iron: "#3a3d4a",
  ironLight: "#7c8190",
  gold: "#f2c230",
  goldDark: "#b07d12",
  boneWhite: "#e8e2cc",
  boneShade: "#b5ab8c",
  stone: "#5b5e66",
  stoneDark: "#383a42",
  spikeSteel: "#c9d0dc",
  blood: "#8c1c1c",
  flameOrange: "#ff8a1c",
  flameYellow: "#ffd84a",
  flameRed: "#e0401a",
  ember: "#ff5a1a",
  eyeGlow: "#ff3030",
  rope: "#b99a5c",
  black: "#14121a",
};
const M = {
  chestBase: [0.1, 0, 0.6] as [number, number, number],
  chestHinge: [0.1, 0.55, 0.2] as [number, number, number],
  barrelCluster: [1.4, 0, -0.7] as [number, number, number],
  bonePile: [1.5, 0, 0.9] as [number, number, number],
  trapCenter: [-1.3, 0, 0.9] as [number, number, number],
  torchL: [-1.6, 0, -1.2] as [number, number, number],
  torchR: [0.2, 0, -1.2] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chest
  (() => {
function buildChest({ b, J, P, M }: Ctx) {
  const T = 0.0625;
  const R = rng(11);
  const [cx, , cz] = M.chestBase; // 0.1, 0.6
  const hingeY = M.chestHinge[1];
  const hingeZ = M.chestHinge[2];
  const W = 1.0, D = 0.8;
  const baseH = 0.5;

  const box = (w: number, h: number, d: number, color: string, at: number[], bone?: any) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: at as any, ...(bone ? { bone } : {}) });

  // ---- body ----
  box(W, baseH, D, P.woodMid, [cx, baseH / 2, cz]);
  // plank seams on front and back
  for (let i = 1; i < 4; i++) {
    const y = i * 0.125;
    for (const s of [1, -1]) box(W + 0.01, 0.014, 0.014, P.woodDark, [cx, y, cz + s * (D / 2 + 0.002)]);
  }
  // side seams
  for (let i = 1; i < 4; i++)
    for (const s of [1, -1]) box(0.014, 0.014, D + 0.01, P.woodDark, [cx + s * (W / 2 + 0.002), i * 0.125, cz]);
  // highlight pixels
  for (let i = 0; i < 14; i++) {
    const x = cx - W / 2 + 0.1 + R() * (W - 0.2);
    const y = 0.04 + R() * 0.42;
    box(T * 0.6, T * 0.4, 0.01, P.woodLight, [x, y, cz + D / 2 + 0.004]);
  }
  // floor-level feet / base trim
  box(W + 0.06, 0.06, D + 0.06, P.woodDark, [cx, 0.03, cz]);
  // inner dark cavity top and treasure heap
  box(W - 0.12, 0.02, D - 0.12, P.black, [cx, baseH + 0.002, cz]);
  const heapMat = [P.gold, P.goldDark, P.gold, P.flameRed, P.gold];
  for (let i = 0; i < 34; i++) {
    const x = cx + (R() - 0.5) * (W - 0.2);
    const z = cz + (R() - 0.5) * (D - 0.2);
    const edge = Math.max(Math.abs(x - cx) / (W / 2), Math.abs(z - cz) / (D / 2));
    const h = 0.03 + (1 - edge) * 0.08 * (0.5 + R());
    const s = 0.05 + R() * 0.04;
    const col = heapMat[Math.floor(R() * heapMat.length)];
    const p = box(s, s * 0.5, s, col, [x, baseH + h, z]);
    p.mesh.rotation.y = R() * 1.5;
  }
  // gems
  for (const [gx, gz] of [[-0.25, 0.05], [0.2, -0.12]]) box(0.07, 0.07, 0.07, P.flameRed, [cx + gx, baseH + 0.15, cz + gz]);

  // body bands
  for (const x of [-0.3, 0.3]) {
    box(0.12, baseH + 0.01, D + 0.03, P.iron, [cx + x, baseH / 2, cz]);
    for (const s of [1, -1]) {
      box(0.012, baseH, 0.012, P.ironLight, [cx + x - 0.05, baseH / 2, cz + s * (D / 2 + 0.018)]);
      for (const y of [0.08, 0.42]) box(0.04, 0.04, 0.02, P.ironLight, [cx + x, y, cz + s * (D / 2 + 0.02)]);
    }
  }
  // corner brackets
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      box(0.09, baseH + 0.01, 0.09, P.iron, [cx + sx * (W / 2 - 0.01), baseH / 2, cz + sz * (D / 2 - 0.01)]);
      box(0.03, 0.03, 0.03, P.ironLight, [cx + sx * (W / 2 + 0.035), 0.44, cz + sz * (D / 2 + 0.035)]);
    }

  // ---- lid (hinged at back edge, open ~20deg) ----
  const hz = hingeZ;
  const lid = new THREE.Group();
  lid.position.set(cx, hingeY, hz);
  // positive rotation about X raises front edge? front is +Z: rotate -20deg lifts +Z up
  lid.rotation.x = -THREE.MathUtils.degToRad(20);
  b.root.add(lid);
  const matCache: Record<string, any> = {};
  const matFor = (color: string) =>
    (matCache[color] ??= (b.part(new THREE.BoxGeometry(0.001, 0.001, 0.001), color, { at: [cx, 0.25, cz] }) as any).mesh.material);
  const L = (w: number, h: number, d: number, color: string, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), matFor(color));
    m.position.set(x, y, z);
    lid.add(m);
    return m;
  };
  // lid local: origin at hinge, front toward +z (D = 0.8, hinge at back edge z=cz-D/2+... approx)
  const front = D; // lid depth extends forward from hinge
  const lz = front / 2;
  // blocky arch: three stepped layers
  L(W, 0.1, D, P.woodMid, 0, 0.05, lz);
  L(W, 0.1, D - 0.2, P.woodMid, 0, 0.15, lz);
  L(W, 0.08, D - 0.4, P.woodMid, 0, 0.24, lz);
  L(W + 0.02, 0.05, D + 0.02, P.woodDark, 0, 0.0, lz);
  // plank seams on lid sides
  for (const s of [1, -1]) {
    L(0.014, 0.012, D, P.woodLight, s * (W / 2 + 0.002), 0.1, lz);
    L(0.014, 0.012, D - 0.2, P.woodDark, s * (W / 2 + 0.002), 0.15, lz);
  }
  for (let i = 0; i < 8; i++)
    L(T * 0.6, 0.012, T * 0.4, P.woodLight, -W / 2 + 0.1 + R() * (W - 0.2), 0.27, lz - 0.1 + R() * 0.2);
  // lid bands
  for (const x of [-0.3, 0.3]) {
    L(0.12, 0.11, D + 0.03, P.iron, x, 0.055, lz);
    L(0.12, 0.11, D - 0.17, P.iron, x, 0.155, lz);
    L(0.12, 0.09, D - 0.37, P.iron, x, 0.245, lz);
    L(0.012, 0.012, D - 0.4, P.ironLight, x - 0.05, 0.295, lz);
    L(0.04, 0.04, 0.03, P.ironLight, x, 0.08, D + 0.02);
  }
  // front lid corner brackets
  for (const s of [1, -1]) L(0.09, 0.11, 0.09, P.iron, s * (W / 2 - 0.01), 0.055, D - 0.02);
  // lock plate on lid front lip
  L(0.16, 0.14, 0.03, P.gold, 0, 0.0, D + 0.03);
  L(0.16, 0.03, 0.035, P.goldDark, 0, -0.065, D + 0.03);
  L(0.04, 0.06, 0.04, P.black, 0, 0.0, D + 0.05);
  L(0.02, 0.05, 0.04, P.black, 0, -0.05, D + 0.05);
  // hinge knuckles at back
  for (const x of [-0.3, 0, 0.3]) L(0.09, 0.07, 0.07, P.iron, x, 0.0, -0.02);
}
    return buildChest;
  })(),
  // torches
  (() => {
function buildTorches({ b, P, M }: any) {
  const T = 0.0625;
  const r = rng(11);
  const K = 0.74;
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });
  const gbox = (w: number, h: number, d: number, color: string, x: number, y: number, z: number) =>
    glow(box(w, h * K, d, color, x, y, z), 1.4);
  // scaled-height box above the base: y and h compress about the floor
  const sbox = (w: number, h: number, d: number, color: string, x: number, y: number, z: number) =>
    box(w, h * K, d, color, x, y * K, z);

  const build = (cx: number, cz: number) => {
    for (const c of [0, 1, 2]) {
      const y = T * 2 * c + T;
      const off = c % 2 ? T : 0;
      box(0.5, T * 2, 0.5, c % 2 ? P.stone : P.stoneDark, cx, y, cz);
      box(0.51, T * 0.5, 0.51, P.stoneDark, cx, T * 2 * c + T * 2 - T * 0.25, cz);
      for (const s of [-1, 1]) {
        box(T * 0.4, T * 1.8, 0.51, P.stoneDark, cx + s * 0.06 + off * 0.5 - 0.03, y, cz);
        box(0.51, T * 1.8, T * 0.4, P.stoneDark, cx, y, cz + s * 0.06 + off * 0.5 - 0.03);
      }
      box(T, T * 0.6, 0.02, P.ironLight, cx - 0.15 + off, y + 0.02, cz + 0.255);
    }
    box(0.4, T, 0.4, P.stone, cx, T * 6 + T / 2, cz);
    box(0.36, T * 0.4, 0.36, P.ironLight, cx, T * 7 + 0.01, cz);

    const poleBottom = T * 7;
    const poleTop = 1.2;
    const pb = poleBottom * K;
    const pt = poleTop * K;
    box(T * 2, pt - pb, T * 2, P.woodMid, cx, (pb + pt) / 2, cz);
    for (const sx of [-1, 1]) {
      box(T * 0.4, pt - pb, T * 0.4, P.woodDark, cx + sx * T, (pb + pt) / 2, cz + T);
      box(T * 0.4, (pt - pb) * 0.6, T * 0.4, P.woodLight, cx + sx * T * 0.5, (pb + pt) / 2 + 0.07, cz + T + 0.001);
    }
    for (let i = 0; i < 5; i++) sbox(T * 2 + 0.02, T * 0.6, T * 2 + 0.02, P.woodDark, cx, 0.6 + i * 0.12, cz);
    sbox(T * 3, T, T * 3, P.iron, cx, 1.18, cz);
    sbox(T * 3.2, T * 0.4, T * 3.2, P.ironLight, cx, 1.18 + T * 0.6, cz);
    sbox(T * 4, T, T * 4, P.iron, cx, 1.28, cz);
    for (const s of [-1, 1]) {
      sbox(T * 0.6, T * 2, T * 4.4, P.iron, cx + s * T * 2.2, 1.34, cz);
      sbox(T * 4.4, T * 2, T * 0.6, P.iron, cx, 1.34, cz + s * T * 2.2);
      sbox(T * 0.3, T * 0.4, T * 4.4, P.ironLight, cx + s * T * 2.2, 1.43, cz);
    }
    for (const s of [-1, 1]) sbox(T * 0.5, T * 0.5, T * 0.5, P.ironLight, cx + s * T * 1.2, 1.28, cz + T * 2.1);
    sbox(T * 0.6, 0.2, T * 0.6, P.iron, cx, 1.05, cz + T * 1.05);
    for (let i = 0; i < 4; i++)
      sbox(T * 2 + 0.03, T * 0.5, T * 2 + 0.03, i % 2 ? P.rope : P.woodLight, cx, 1.02 - i * T * 0.6, cz);
    sbox(T * 0.6, T * 2, T * 0.6, P.rope, cx + T * 0.8, 0.88, cz + T * 1.2);

    const fy = 1.42 * K;
    const g = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
      gbox(w, h, d, c, x, fy + y * K, z);
    g(T * 3, T * 2, T * 3, P.flameRed, cx, 0, cz);
    g(T * 3.6, T * 2, T * 3.6, P.flameRed, cx, T * 1.2, cz);
    g(T * 2.6, T * 3, T * 2.6, P.flameOrange, cx, T * 2.8, cz);
    g(T * 1.6, T * 3, T * 1.6, P.flameYellow, cx, T * 3.4, cz);
    g(T * 1.8, T * 2, T * 1.8, P.flameOrange, cx, T * 4.8, cz);
    g(T * 1, T * 1.5, T * 1, P.flameYellow, cx, T * 5.2, cz);
    g(T * 0.8, T * 1.5, T * 0.8, P.flameRed, cx + T * 0.2, T * 6.4, cz);
    g(T * 1.2, T * 2, T * 1.2, P.flameOrange, cx + T * 2.2, T * 1.8, cz);
    g(T * 1.2, T * 2, T * 1.2, P.flameOrange, cx - T * 2.2, T * 1.4, cz + T);
    g(T * 1, T * 1.4, T * 1, P.flameRed, cx, T * 2, cz + T * 2.2);
    for (let i = 0; i < 6; i++) {
      const a = r() * Math.PI * 2;
      const d = T * (1.5 + r() * 2);
      g(T * 0.5, T * 0.5, T * 0.5, P.ember, cx + Math.cos(a) * d, T * (4 + r() * 5), cz + Math.sin(a) * d);
    }
  };

  build(M.torchL[0], M.torchL[2]);
  build(M.torchR[0], M.torchR[2]);
}
    return buildTorches;
  })(),
  // barrels
  (() => {
function buildBarrels({ b, J, P, M }: Ctx) {
  const T = 0.0625;
  const r = rng(11);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, ry = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: [0, ry, 0] });
  const cyl = (rt: number, rb: number, h: number, c: string, x: number, y: number, z: number, rot: [number, number, number] = [0, 0, 0], seg = 8) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z], rotation: rot });

  // upright barrel: 8-sided staves, bulge ring, hoops, lid
  const upright = (x: number, z: number, open: boolean, ry: number) => {
    const H = 0.88;
    cyl(0.34, 0.31, H * 0.5, P.woodMid, x, H * 0.25, z, [0, ry, 0]);
    cyl(0.31, 0.34, H * 0.5, P.woodMid, x, H * 0.75, z, [0, ry, 0]);
    cyl(0.365, 0.365, 0.1, P.woodLight, x, H * 0.5, z, [0, ry, 0]);
    // seam lines (dark staves)
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + ry * Math.PI / 180 + Math.PI / 8;
      const rr = 0.345;
      b.part(new THREE.BoxGeometry(0.025, H * 0.9, 0.025), P.woodDark, {
        at: [x + Math.sin(a) * rr, H * 0.5, z + Math.cos(a) * rr],
        rotation: [0, (a * 180) / Math.PI, 0],
      });
    }
    // hoops
    for (const [hy, rad] of [[0.1, 0.325], [0.27, 0.352], [0.61, 0.352], [0.78, 0.325]] as number[][]) {
      cyl(rad + 0.02, rad + 0.02, 0.05, P.iron, x, hy, z, [0, ry, 0]);
      cyl(rad + 0.022, rad + 0.022, 0.012, P.ironLight, x, hy + 0.02, z, [0, ry, 0]);
    }
    // lid
    cyl(0.31, 0.31, 0.04, P.woodLight, x, H + 0.0, z, [0, ry, 0]);
    cyl(0.27, 0.27, 0.03, P.woodMid, x, H + 0.03, z, [0, ry, 0]);
    if (open) {
      cyl(0.25, 0.25, 0.03, P.black, x, H + 0.05, z, [0, ry, 0]);
      // ajar lid leaning
      b.part(new THREE.BoxGeometry(0.4, 0.04, 0.3), P.woodLight, { at: [x + 0.12, H + 0.1, z + 0.08], rotation: [0, 20, 14] });
      box(0.3, 0.02, 0.2, P.woodDark, x + 0.12, H + 0.125, z + 0.08, 20);
    } else {
      box(T, T * 0.7, T, P.woodDark, x + 0.1, H + 0.065, z - 0.05);
      box(T * 0.5, T * 0.3, T * 0.5, P.woodLight, x + 0.1, H + 0.1, z - 0.05);
      for (let i = 0; i < 4; i++) box(0.02, 0.012, 0.2, P.woodDark, x - 0.12 + i * 0.08, H + 0.048, z, 0);
    }
    // highlight pixels
    for (let i = 0; i < 4; i++) box(T * 0.5, T * 0.5, 0.012, P.woodLight, x - 0.12 + r() * 0.2, 0.2 + r() * 0.5, z + 0.34);
  };
  upright(1.25, -0.5, false, 0);
  upright(1.7, -0.95, true, 22);

  // barrel lying on side, axis along x, round end face toward +z? axis along z so end faces front
  const lx = 1.35, lz = -0.95, ly = 0.34 + 0.0;
  const rotz: [number, number, number] = [90, 0, 0];
  cyl(0.34, 0.31, 0.45, P.woodMid, lx, ly + 0.0, lz + 0.22, rotz);
  cyl(0.31, 0.34, 0.45, P.woodMid, lx, ly, lz - 0.23, rotz);
  cyl(0.37, 0.37, 0.1, P.woodLight, lx, ly, lz, rotz);
  for (const dz of [-0.38, -0.2, 0.2, 0.38]) {
    cyl(0.365, 0.365, 0.05, P.iron, lx, ly, lz + dz, rotz);
    cyl(0.368, 0.368, 0.012, P.ironLight, lx, ly, lz + dz + 0.02, rotz);
  }
  // end face
  cyl(0.3, 0.3, 0.03, P.woodLight, lx, ly, lz + 0.45, rotz);
  cyl(0.24, 0.24, 0.03, P.woodMid, lx, ly, lz + 0.47, rotz);
  box(0.03, 0.4, 0.03, P.woodDark, lx, ly, lz + 0.49);
  box(0.4, 0.03, 0.03, P.woodDark, lx, ly, lz + 0.49);
  box(T * 0.7, T * 0.7, 0.03, P.black, lx + 0.12, ly + 0.1, lz + 0.5);
  // chocks
  box(0.12, 0.06, 0.6, P.woodDark, lx - 0.3, 0.03, lz);
  box(0.12, 0.06, 0.6, P.woodDark, lx + 0.3, 0.03, lz);

  // stain and chips
  b.part(new THREE.BoxGeometry(0.4, 0.01, 0.25), P.black, { at: [1.55, 0.005, -0.25], rotation: [0, 10, 0] });
  b.part(new THREE.BoxGeometry(0.24, 0.012, 0.14), P.woodDark, { at: [1.6, 0.007, -0.27], rotation: [0, 10, 0] });
  for (let i = 0; i < 6; i++)
    box(T * 0.5, T * 0.35, T * 0.5, i % 2 ? P.woodMid : P.woodLight, 1.0 + r() * 0.9, 0.02, -0.25 + r() * 0.12, r() * 90);
}
    return buildBarrels;
  })(),
  // bones
  (() => {
function buildBones({ b, P, M }: any) {
  const T = 0.0625;
  const [cx, , cz] = M.bonePile;
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, ry = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [cx + x, y, cz + z], rotation: [0, ry, 0] });

  // blood stains on the floor
  box(0.3, 0.01, 0.22, P.blood, -0.15, 0.005, 0.2, 20);
  box(0.16, 0.01, 0.12, P.blood, 0.3, 0.005, -0.25, -15);
  box(0.1, 0.01, 0.1, P.blood, -0.3, 0.005, -0.2, 40);

  // low bone floor bed
  box(0.6, 0.06, 0.5, P.boneShade, 0, 0.03, 0, 10);

  // femurs: shaft, shade underside, knob ends
  const femur = (x: number, z: number, y: number, ry: number, len: number) => {
    const g = (lx: number, ly: number, lz: number, w: number, h: number, d: number, c: string) =>
      b.part(new THREE.BoxGeometry(w, h, d), c, { at: [cx + x, y, cz + z], rotation: [0, ry, 0] }) &&
      null;
    void g;
    const s = Math.sin((ry * Math.PI) / 180), c = Math.cos((ry * Math.PI) / 180);
    const at = (u: number, v: number, w: number) => [cx + x + u * c + w * s, y + v, cz + z - u * s + w * c];
    b.part(new THREE.BoxGeometry(len, T, T), P.boneWhite, { at: at(0, 0, 0), rotation: [0, ry, 0] });
    b.part(new THREE.BoxGeometry(len, T * 0.4, T * 0.9), P.boneShade, { at: at(0, -T * 0.4, 0), rotation: [0, ry, 0] });
    for (const e of [-1, 1])
      for (const k of [-1, 1])
        b.part(new THREE.BoxGeometry(T, T * 1.1, T * 0.9), P.boneWhite, {
          at: at((e * len) / 2, 0, k * T * 0.5),
          rotation: [0, ry, 0],
        });
  };
  femur(-0.25, 0.28, T * 0.6 + 0.06, 25, 0.5);
  femur(0.25, 0.3, T * 0.6 + 0.06, -35, 0.45);
  femur(-0.05, -0.16, T * 0.6 + 0.06, 80, 0.4);
  femur(0.3, -0.05, T * 0.6 + 0.13, 5, 0.4);

  // rib cage arc
  for (let i = 0; i < 4; i++) {
    const z = -0.25 + i * 0.13;
    const pts = [
      [-0.2, 0.06], [-0.22, 0.14], [-0.15, 0.22], [0, 0.26], [0.15, 0.22], [0.22, 0.14], [0.2, 0.06],
    ];
    pts.forEach(([x, y], k) => {
      box(T * 0.7, T * 0.75, T * 0.5, k % 2 ? P.boneWhite : P.boneShade, x - 0.3 + 0.05, y + 0.06, z - 0.05 + 0.4 * 0);
    });
  }
  // spine
  for (let i = 0; i < 5; i++) box(T * 0.7, T * 0.6, T * 0.7, i % 2 ? P.boneWhite : P.boneShade, -0.25 + 0.0, 0.34 + 0.0, -0.3 + i * 0.1 + 0 * i);
  // loose vertebrae
  for (let i = 0; i < 4; i++)
    box(T * 0.6, T * 0.5, T * 0.6, P.boneWhite, -0.35 + R() * 0.7, 0.025 + 0.06, 0.35 - R() * 0.8, R() * 90);

  // skull on top
  const sx = 0.0, sy = 0.4, sz = 0.0;
  box(0.25, 0.19, 0.22, P.boneWhite, sx, sy, sz);
  box(0.25, 0.04, 0.22, P.boneShade, sx, sy - 0.1, sz);
  box(0.06, 0.08, 0.2, P.boneWhite, sx, sy + 0.12, sz);
  for (const s of [-1, 1]) {
    box(0.07, 0.07, 0.03, P.black, sx + s * 0.06, sy + 0.01, sz + 0.115);
    glow(box(0.025, 0.025, 0.012, P.eyeGlow, sx + s * 0.06, sy + 0.01, sz + 0.135), 1.5);
    box(0.02, 0.02, 0.02, P.boneShade, sx + s * 0.12, sy + 0.05, sz + 0.05);
  }
  box(0.04, 0.05, 0.03, P.black, sx, sy - 0.05, sz + 0.115);
  // jaw
  box(0.2, 0.05, 0.19, P.boneShade, sx, sy - 0.14, sz - 0.01);
  for (let i = 0; i < 5; i++) {
    box(0.025, 0.03, 0.02, P.boneWhite, sx - 0.08 + i * 0.04, sy - 0.1, sz + 0.1);
    box(0.025, 0.03, 0.02, P.boneWhite, sx - 0.08 + i * 0.04, sy - 0.115, sz + 0.09);
  }
  // crack on cranium
  box(0.012, 0.07, 0.01, P.black, sx + 0.05, sy + 0.08, sz + 0.115);
}
    return buildBones;
  })(),
  // spikeTrap
  (() => {
function buildSpikeTrap({ b, P, M }: Ctx) {
  const T = 0.0625;
  const [cx, , cz] = M.trapCenter;
  const r = rng(11);
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [cx + x, y + h / 2, cz + z] });

  // Outer plate: 1.2 x 1.2, height 0.125
  const W = 1.2;
  const H = 2 * T;
  box(W, H, W, P.stoneDark, 0, 0, 0);
  // Stone frame tiles (checker of two tones on top)
  const edge = 0.25;
  const inner = W - 2 * edge;
  const top = H;
  const tiles = 6;
  const tw = W / tiles;
  for (let i = 0; i < tiles; i++)
    for (let j = 0; j < tiles; j++) {
      const x = -W / 2 + tw * (i + 0.5);
      const z = -W / 2 + tw * (j + 0.5);
      if (Math.abs(x) < inner / 2 && Math.abs(z) < inner / 2) continue;
      b.part(new THREE.BoxGeometry(tw - 0.012, 0.02, tw - 0.012), (i + j) % 2 ? P.stone : "#4a4d55", {
        at: [cx + x, top + 0.01, cz + z],
      });
    }
  // Dark pit
  box(inner, 0.02, inner, P.black, 0, top, 0);
  // Pit walls rim
  const rim = 0.04;
  box(inner + 0.08, 0.05, rim, P.stoneDark, 0, top, inner / 2 + 0.02);
  box(inner + 0.08, 0.05, rim, P.stoneDark, 0, top, -inner / 2 - 0.02);
  box(rim, 0.05, inner, P.stoneDark, inner / 2 + 0.02, top, 0);
  box(rim, 0.05, inner, P.stoneDark, -inner / 2 - 0.02, top, 0);

  // 4x4 spikes
  const pitch = inner / 4;
  const bloody = new Set([2, 5, 9, 14]);
  let n = 0;
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++, n++) {
      const x = -inner / 2 + pitch * (i + 0.5);
      const z = -inner / 2 + pitch * (j + 0.5);
      const h = (2 + Math.floor(r() * 4)) * T; // 0.125..0.3125
      const base = top + 0.02;
      const w = T * 0.9;
      b.part(new THREE.BoxGeometry(w, 0.04, w), P.stoneDark, { at: [cx + x, base + 0.02, cz + z] });
      b.part(new THREE.BoxGeometry(w * 0.7, h, w * 0.7), P.spikeSteel, { at: [cx + x, base + 0.04 + h / 2, cz + z] });
      const tipH = T * 0.6;
      b.part(new THREE.BoxGeometry(w * 0.4, tipH, w * 0.4), bloody.has(n) ? P.blood : P.ironLight, {
        at: [cx + x, base + 0.04 + h + tipH / 2, cz + z],
      });
      // highlight pixel
      b.part(new THREE.BoxGeometry(0.012, h * 0.8, 0.012), P.ironLight, {
        at: [cx + x + w * 0.2, base + 0.04 + h / 2, cz + z + w * 0.36],
      });
    }

  // Pressure tile with rune, in front corner of the frame
  const px = -0.4, pz = W / 2 - 0.12;
  b.part(new THREE.BoxGeometry(0.2, 0.03, 0.14), P.stoneDark, { at: [cx + px, top + 0.03, cz + pz] });
  b.part(new THREE.BoxGeometry(0.17, 0.02, 0.11), "#6b6f78", { at: [cx + px, top + 0.045, cz + pz] });
  const rune: [number, number, number, number][] = [
    [0, 0, 0.015, 0.07], [-0.03, 0.02, 0.05, 0.015], [0.03, -0.02, 0.05, 0.015], [0, -0.035, 0.05, 0.012],
  ];
  for (const [rx, rz, w, d] of rune)
    b.part(new THREE.BoxGeometry(w, 0.01, d), P.black, { at: [cx + px + rx, top + 0.06, cz + pz + rz] });

  // Cracks
  const cracks: [number, number, number, number][] = [
    [0.45, 0.45, 0.14, 0.02], [0.52, 0.38, 0.02, 0.1], [-0.5, -0.45, 0.12, 0.02],
    [-0.45, -0.52, 0.02, 0.09], [0.45, -0.2, 0.02, 0.12],
  ];
  for (const [x, z, w, d] of cracks)
    b.part(new THREE.BoxGeometry(w, 0.008, d), P.black, { at: [cx + x, top + 0.024, cz + z] });

  // Corner studs
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      b.part(new THREE.BoxGeometry(0.06, 0.04, 0.06), P.ironLight, {
        at: [cx + sx * (W / 2 - 0.07), top + 0.02, cz + sz * (W / 2 - 0.07)],
      });

  // Blood pool drip on a frame tile
  glow; // kit imported for consistency
  box(0.12, 0.012, 0.09, P.blood, 0.48, top, -0.45);

  // Stone chips on the floor around
  const chips: [number, number, number][] = [
    [0.58, 0.5, 0.06], [0.56, 0.38, 0.04], [-0.57, 0.3, 0.05], [-0.56, -0.58, 0.04],
  ];
  for (const [x, z, s] of chips)
    b.part(new THREE.BoxGeometry(s, s * 0.7, s), r() > 0.5 ? P.stone : P.stoneDark, {
      at: [cx + x, (s * 0.7) / 2, cz + z],
      rotation: [0, r() * 90, 0],
    });
}
    return buildSpikeTrap;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "dungeonProps" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
