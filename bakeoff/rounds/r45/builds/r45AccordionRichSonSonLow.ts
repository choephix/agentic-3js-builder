import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng } from "../../../../src/index";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  "name": "Madreperla Piano Accordion",
  "description": "A 34-key Italian piano accordion lying on its back, in pearly celluloid (madreperla) with a black pleated bellows, a chrome and gold grille, and ruby and sapphire studs."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  pearlWhite: "#f6f1e7",
  pearlCream: "#ece3d0",
  pearlPink: "#efd9de",
  pearlBlue: "#d3e4ee",
  pearlMint: "#d7ebe0",
  pearlLilac: "#e0d8ee",
  pearlShade: "#c2b8a6",
  bellowsBlack: "#1b1a20",
  bellowsFold: "#2d2a34",
  keyBlack: "#151317",
  keyWhite: "#fbf8ef",
  keyEdge: "#d9d2c0",
  chrome: "#cfd6dc",
  chromeDark: "#8d97a1",
  gold: "#d9aa4a",
  goldBright: "#f2cf74",
  goldDark: "#9a6f26",
  feltRed: "#8e1c26",
  ruby: "#c01e3a",
  sapphire: "#3a6fd0",
  leather: "#3a2a22",
  leatherLight: "#5c4334",
  grilleDark: "#25222b",
};
const M = {
  floorY: [0, 0, 0] as [number, number, number],
  caseTopY: [0, 0.26, 0.19] as [number, number, number],
  trebleBellowsFace: [0, 0.13, 0.1] as [number, number, number],
  bassBellowsFace: [0, 0.13, -0.2] as [number, number, number],
  keyboardBed: [0, 0.13, 0.3] as [number, number, number],
  keyRailLow: [0, 0.045, 0.3] as [number, number, number],
  keyRailHigh: [0, 0.22, 0.3] as [number, number, number],
  grilleCenter: [-0.015, 0.26, 0.19] as [number, number, number],
  registerPanel: [0.2, 0.26, 0.19] as [number, number, number],
  bassDeckTop: [0, 0.26, -0.25] as [number, number, number],
  bassButtonBed: [0, 0.13, -0.3] as [number, number, number],
  bassStrapAnchor: [0.19, 0.13, -0.25] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // trebleCase
  (() => {
function buildTrebleCase({ b, P }: any) {
  const R = rng(11);
  const X0 = -0.23, X1 = 0.23, Y0 = 0, Y1 = 0.26, Z0 = 0.1, Z1 = 0.3;
  const cx = 0, cy = 0.13, cz = 0.2;
  const W = 0.46, H = 0.26, D = 0.2;

  const box = (w: number, h: number, d: number, x: number, y: number, z: number) =>
    new THREE.BoxGeometry(w, h, d).translate(x, y, z);
  const put = (list: THREE.BufferGeometry[], color: string) => {
    if (list.length) b.part(mergeGeometries(list)!, color, { at: [0, 0, 0] });
  };

  // base shell
  b.part(new THREE.BoxGeometry(W, H, D), P.pearlWhite, { at: [cx, cy, cz] });

  // mosaic tiles
  const mix: [string, number][] = [
    ["pearlWhite", 0.4], ["pearlCream", 0.2], ["pearlPink", 0.15],
    ["pearlBlue", 0.1], ["pearlMint", 0.08], ["pearlLilac", 0.07],
  ];
  const buckets: Record<string, THREE.BufferGeometry[]> = {};
  const pick = () => {
    let r = R(), a = 0;
    for (const [n, w] of mix) { a += w; if (r < a) return n; }
    return "pearlWhite";
  };
  const T = 0.0045, G = 0.001, S = T + G;
  const tile = (axis: "x" | "y" | "z", sign: number, u0: number, u1: number, v0: number, v1: number, fixed: number, skip?: (u: number, v: number) => boolean) => {
    for (let u = u0 + T / 2; u < u1 - T / 2 + 1e-6; u += S)
      for (let v = v0 + T / 2; v < v1 - T / 2 + 1e-6; v += S) {
        if (skip && skip(u, v)) continue;
        const n = pick();
        const t = 0.0012, f = fixed + sign * t / 2;
        let g: THREE.BufferGeometry;
        if (axis === "x") g = box(t, T, T, f, u, v);
        else if (axis === "y") g = box(T, t, T, u, f, v);
        else g = box(T, T, t, u, v, f);
        (buckets[n] ||= []).push(g);
      }
  };
  // end faces: u=y, v=z
  tile("x", 1, 0.005, 0.255, Z0 + 0.012, Z1 - 0.012, X1, (u, v) => Math.hypot(u - 0.13, v - 0.2) < 0.035);
  tile("x", -1, 0.005, 0.255, Z0 + 0.012, Z1 - 0.012, X0, (u, v) => Math.hypot(u - 0.13, v - 0.2) < 0.035);
  // top border: skip grille zone
  tile("y", 1, X0 + 0.012, X1 - 0.012, Z0 + 0.012, Z1 - 0.012, Y1, (u, v) => u > -0.2 && u < 0.165 && v > 0.115 && v < 0.285 && !(u > 0.17));
  // bottom
  tile("y", -1, X0 + 0.012, X1 - 0.012, Z0 + 0.012, Z1 - 0.012, Y0 + 0.0, (u, v) => Math.abs(u) < 0.19 && v > 0.13 && v < 0.27);
  // front wall: u=x, v=y
  tile("z", 1, X0 + 0.012, X1 - 0.012, 0.012, 0.248, Z1, (u, v) => u > -0.2 && u < 0.2 && v > 0.055 && v < 0.205);
  for (const [n, l] of Object.entries(buckets)) put(l, P[n]);

  // keyboard felt backing
  b.part(new THREE.BoxGeometry(0.39, 0.14, 0.002), P.keyBlack, { at: [0, 0.13, 0.3] });

  // rear mounting frame
  b.part(new THREE.BoxGeometry(0.44, 0.25, 0.003), P.pearlShade, { at: [0, 0.13, Z0 - 0.001] });
  const rim: THREE.BufferGeometry[] = [
    box(0.43, 0.004, 0.004, 0, 0.012, Z0 - 0.003), box(0.43, 0.004, 0.004, 0, 0.248, Z0 - 0.003),
    box(0.004, 0.24, 0.004, -0.2145, 0.13, Z0 - 0.003), box(0.004, 0.24, 0.004, 0.2145, 0.13, Z0 - 0.003),
  ];
  put(rim, P.bellowsFold);

  // chrome edge rods
  const rod = 0.0025, ch: THREE.BufferGeometry[] = [];
  for (const y of [Y0, Y1]) for (const z of [Z0, Z1]) ch.push(box(W, rod * 2, rod * 2, 0, y, z));
  for (const x of [X0, X1]) for (const z of [Z0, Z1]) ch.push(box(rod * 2, H, rod * 2, x, cy, z));
  for (const x of [X0, X1]) for (const y of [Y0, Y1]) ch.push(box(rod * 2, rod * 2, D, x, y, cz));
  put(ch, P.chrome);

  // gold corner caps
  const caps: THREE.BufferGeometry[] = [];
  for (const x of [X0, X1]) for (const y of [Y0, Y1]) for (const z of [Z0, Z1]) {
    caps.push(new THREE.BoxGeometry(0.012, 0.012, 0.012).rotateY(Math.PI / 4).translate(x, y, z));
  }
  put(caps, P.gold);

  // end studs
  const ringG: THREE.BufferGeometry[] = [], groove: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) {
    const x = s * X1, ey = 0.13, ez = 0.2;
    ringG.push(new THREE.TorusGeometry(0.009, 0.0018, 6, 12).rotateY(Math.PI / 2).translate(x + s * 0.002, ey, ez));
    groove.push(new THREE.TorusGeometry(0.03, 0.0008, 4, 20).rotateY(Math.PI / 2).translate(x + s * 0.0015, ey, ez));
    b.part(new THREE.SphereGeometry(0.005, 8, 6), s > 0 ? P.sapphire : P.ruby, { at: [x + s * 0.002, ey, ez] });
  }
  put(ringG, P.goldBright);
  put(groove, P.pearlShade);

  // escutcheon on -X face
  const ex = X0 - 0.0015;
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.002, 16).rotateZ(Math.PI / 2).scale(1, 1.0, 1.25), P.gold, { at: [ex, 0.13, 0.2] });
  b.part(new THREE.SphereGeometry(0.006, 8, 6), P.ruby, { at: [ex - 0.002, 0.13, 0.2] });
  const fl: THREE.BufferGeometry[] = [
    box(0.0012, 0.018, 0.0014, ex - 0.0015, 0.13 + 0.02, 0.2),
    box(0.0012, 0.0014, 0.014, ex - 0.0015, 0.13 + 0.026, 0.2),
    new THREE.BoxGeometry(0.0012, 0.0014, 0.01).rotateX(0.7).translate(ex - 0.0015, 0.13 - 0.02, 0.2 - 0.005),
    new THREE.BoxGeometry(0.0012, 0.0014, 0.01).rotateX(-0.7).translate(ex - 0.0015, 0.13 - 0.02, 0.2 + 0.005),
    box(0.0012, 0.016, 0.0014, ex - 0.0015, 0.13 - 0.02, 0.2),
  ];
  put(fl, P.goldDark);

  // bottom leather panel and feet
  b.part(new THREE.BoxGeometry(0.4, 0.002, 0.16), P.leatherLight, { at: [0, -0.0004 + 0.0012, cz] });
  const edge: THREE.BufferGeometry[] = [
    box(0.404, 0.003, 0.003, 0, 0.0025, 0.12), box(0.404, 0.003, 0.003, 0, 0.0025, 0.28),
    box(0.003, 0.003, 0.16, -0.2, 0.0025, cz), box(0.003, 0.003, 0.16, 0.2, 0.0025, cz),
  ];
  put(edge, P.chrome);
  const feet: THREE.BufferGeometry[] = [];
  for (const x of [-0.17, 0.17]) for (const z of [0.14, 0.26])
    feet.push(new THREE.SphereGeometry(0.011, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2).translate(x, 0, z).scale(1, 0.5, 1));
  put(feet, P.chromeDark);
}
    return buildTrebleCase;
  })(),
  // trebleTop
  (() => {
function buildTrebleTop({ b, P, M }: any) {
  const Y = 0.26;
  const R = rng(5);
  const groups: Record<string, THREE.BufferGeometry[]> = {};
  const add = (color: string, g: THREE.BufferGeometry, x: number, y: number, z: number, rot?: [number, number, number]) => {
    if (rot) g.rotateX(rot[0]), g.rotateY(rot[1]), g.rotateZ(rot[2]);
    g.translate(x, y, z);
    (groups[color] ||= []).push(g);
  };
  const box = (c: string, w: number, h: number, d: number, x: number, y: number, z: number, rot?: [number, number, number]) =>
    add(c, new THREE.BoxGeometry(w, h, d), x, y, z, rot);
  const cyl = (c: string, r: number, h: number, x: number, y: number, z: number, seg = 8) =>
    add(c, new THREE.CylinderGeometry(r, r, h, seg), x, y, z);
  const sph = (c: string, r: number, x: number, y: number, z: number) =>
    add(c, new THREE.SphereGeometry(r, 8, 6), x, y, z);

  // Grille frame
  const x0 = -0.19, x1 = 0.15, z0 = 0.12, z1 = 0.28;
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, W = x1 - x0, D = z1 - z0;
  box(P.grilleDark, W, 0.006, D, cx, Y + 0.003, cz);
  // frame rails
  box(P.chrome, W, 0.01, 0.006, cx, Y + 0.005, z0 + 0.003);
  box(P.chrome, W, 0.01, 0.006, cx, Y + 0.005, z1 - 0.003);
  box(P.chrome, 0.006, 0.01, D, x0 + 0.003, Y + 0.005, cz);
  box(P.chrome, 0.006, 0.01, D, x1 - 0.003, Y + 0.005, cz);
  // gold border line
  box(P.goldBright, W - 0.014, 0.002, 0.002, cx, Y + 0.0105, z0 + 0.008);
  box(P.goldBright, W - 0.014, 0.002, 0.002, cx, Y + 0.0105, z1 - 0.008);
  box(P.goldBright, 0.002, 0.002, D - 0.014, x0 + 0.008, Y + 0.0105, cz);
  box(P.goldBright, 0.002, 0.002, D - 0.014, x1 - 0.008, Y + 0.0105, cz);
  // rivets
  for (let i = 0; i <= 10; i++) {
    const x = x0 + 0.012 + ((W - 0.024) * i) / 10;
    sph(P.gold, 0.0022, x, Y + 0.011, z0 + 0.003);
    sph(P.gold, 0.0022, x, Y + 0.011, z1 - 0.003);
  }
  // 11 fanning ribs with curled tips
  for (let i = 0; i < 11; i++) {
    const t = i / 10;
    const sx = x0 + 0.03 + (W - 0.06) * t;
    const ex = cx + (t - 0.5) * (W + 0.02);
    const dx = ex - sx, dz = (z1 - 0.012) - (z0 + 0.008);
    const len = Math.hypot(dx, dz);
    const ang = Math.atan2(dx, dz);
    const g = new THREE.BoxGeometry(0.003, 0.004, len);
    g.rotateY(ang);
    add(P.chrome, g, (sx + ex) / 2, Y + 0.008, (z0 + 0.008 + z1 - 0.012) / 2);
    cyl(P.chrome, 0.004, 0.004, ex, Y + 0.008, z1 - 0.012, 8);
  }
  // corner scrolls
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const ox = sx < 0 ? x0 + 0.014 : x1 - 0.014, oz = sz < 0 ? z0 + 0.014 : z1 - 0.014;
    for (let k = 0; k < 10; k++) {
      const a = k * 0.7, r = 0.002 + k * 0.0012;
      sph(P.chrome, 0.0018, ox + Math.cos(a) * r * sx, Y + 0.008, oz + Math.sin(a) * r * sz);
    }
  }
  // medallion
  const mx = M.grilleCenter[0], mz = M.grilleCenter[2];
  const med = (c: string, r: number, h: number, y: number) => {
    const g = new THREE.CylinderGeometry(r, r, h, 16);
    g.scale(1, 1, 1.3);
    add(c, g, mx, y, mz);
  };
  med(P.goldDark, 0.03, 0.004, Y + 0.012);
  med(P.gold, 0.025, 0.004, Y + 0.015);
  sph(P.ruby, 0.008, mx, Y + 0.019, mz);
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2 + Math.PI / 4;
    sph(P.sapphire, 0.004, mx + Math.cos(a) * 0.017, Y + 0.018, mz + Math.sin(a) * 0.022);
  }
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    sph(P.goldBright, 0.0016, mx + Math.cos(a) * 0.022, Y + 0.0175, mz + Math.sin(a) * 0.028);
  }

  // Register panel
  const rx = 0.2;
  box(P.chrome, 0.054, 0.003, 0.164, rx, Y + 0.0015, 0.2);
  box(P.pearlCream, 0.05, 0.004, 0.16, rx, Y + 0.002, 0.2);
  for (let i = 0; i < 6; i++) {
    const z = 0.14 + i * 0.024;
    box(P.chrome, 0.026, 0.004, 0.014, rx, Y + 0.006, z);
    box(P.keyWhite, 0.02, 0.005, 0.011, rx, Y + 0.0105, z, [0.25, 0, 0]);
    cyl(P.keyBlack, 0.0016, 0.001, rx, Y + 0.0135, z + 0.002, 6);
    box(P.gold, 0.008, 0.001, 0.012, rx + 0.0185, Y + 0.0045, z);
  }

  // Maker plaque
  box(P.gold, 0.03, 0.002, 0.014, -0.208, Y + 0.001, 0.275);
  for (let i = 0; i < 5; i++) box(P.keyBlack, 0.0035, 0.0006, 0.0015, -0.208 + (i - 2) * 0.005, Y + 0.0023, 0.275);
  // Marquetry flower
  const fx = -0.21, fz = 0.16;
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5;
    const g = new THREE.CylinderGeometry(0.0045, 0.0045, 0.002, 8);
    g.scale(1, 1, 1.5);
    g.rotateY(-a);
    add(i % 2 ? P.pearlBlue : P.pearlPink, g, fx + Math.sin(a) * 0.007, Y + 0.001, fz + Math.cos(a) * 0.007);
  }
  cyl(P.gold, 0.003, 0.0025, fx, Y + 0.0013, fz, 8);

  for (const c in groups) {
    const geo = mergeGeometries(groups[c].map((g) => (g.index ? g : g)), false);
    if (geo) b.part(geo, (P as any)[c] ?? c, { at: [0, 0, 0] });
  }
  void R;
}
    return buildTrebleTop;
  })(),
  // keyboard
  (() => {
function buildKeyboard({ b, P, M }: any) {
  const Z0 = 0.3;
  const groups: Record<string, THREE.BufferGeometry[]> = {};
  const box = (c: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => {
    const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    (groups[c] ||= []).push(g);
  };
  const cyl = (c: string, x: number, y: number, z: number, r: number, h: number, seg = 8) => {
    const g = new THREE.CylinderGeometry(r, r, h, seg);
    g.rotateX(Math.PI / 2);
    g.translate(x, y, z);
    (groups[c] ||= []).push(g);
  };
  const sph = (c: string, x: number, y: number, z: number, r: number) => {
    const g = new THREE.SphereGeometry(r, 8, 6);
    g.translate(x, y, z);
    (groups[c] ||= []).push(g);
  };

  // white keys
  const x0 = -0.195;
  for (let i = 0; i < 21; i++) {
    const cx = x0 + 0.0093 + i * 0.0186;
    const w = 0.0176;
    box("keyWhite", cx - w / 2, cx + w / 2, 0.06, 0.2, Z0, Z0 + 0.016);
    // front lip edge line
    box("keyEdge", cx - w / 2, cx + w / 2, 0.06, 0.064, Z0 + 0.016, Z0 + 0.0166);
  }
  // black keys after white keys 0,1,2,4,5 of each octave
  const seq = [0, 1, 2, 4, 5];
  for (let o = 0; o < 3; o++)
    for (const k of seq) {
      const bx = x0 + (o * 7 + k + 1) * 0.0186;
      box("keyBlack", bx - 0.0055, bx + 0.0055, 0.125, 0.2, Z0, Z0 + 0.028);
      box("keyWhite", bx - 0.004, bx + 0.004, 0.125, 0.2, Z0 + 0.0278, Z0 + 0.0284);
    }

  // lower rail
  box("chrome", -0.23, 0.23, 0.035, 0.06, Z0, Z0 + 0.025);
  box("feltRed", -0.195, 0.195, 0.06, 0.0635, Z0 + 0.002, Z0 + 0.022);
  box("chromeDark", -0.23, 0.23, 0.035, 0.038, Z0 + 0.025, Z0 + 0.0258);
  // upper rail
  box("pearlCream", -0.23, 0.23, 0.2, 0.235, Z0, Z0 + 0.02);
  box("chrome", -0.23, 0.23, 0.2, 0.203, Z0 + 0.02, Z0 + 0.0225);
  box("chrome", -0.23, 0.23, 0.232, 0.235, Z0 + 0.02, Z0 + 0.0225);
  // nameplate
  box("gold", -0.05, 0.05, 0.208, 0.226, Z0 + 0.02, Z0 + 0.0225);
  for (let i = 0; i < 7; i++)
    box("goldDark", -0.04 + i * 0.0125, -0.04 + i * 0.0125 + 0.008, 0.2165, 0.2175, Z0 + 0.0225, Z0 + 0.023);

  // cheeks
  for (const s of [1, -1]) {
    const a = s > 0 ? 0.195 : -0.23;
    const bb = s > 0 ? 0.23 : -0.195;
    box("pearlCream", a, bb, 0.04, 0.23, Z0, Z0 + 0.03);
    const cx = s * 0.2125;
    box("chrome", a, bb, 0.04, 0.043, Z0 + 0.03, Z0 + 0.0325);
    for (const y of [0.07, 0.11, 0.15, 0.19]) cyl("gold", cx, y, Z0 + 0.031, 0.0025, 0.003, 8);
    sph("sapphire", cx, 0.215, Z0 + 0.031, 0.005);
  }

  for (const c of Object.keys(groups)) {
    const g = mergeGeometries(groups[c]);
    if (g) b.part(g, P[c], { at: [0, 0, 0] });
  }
}
    return buildKeyboard;
  })(),
  // bellows
  (() => {
type Ctx = { b: any; J: any; P: Record<string, string>; M: Record<string, number[]> };

function buildBellows({ b, P }: Ctx) {
  const Z0 = 0.1, Z1 = -0.2, N = 14;
  const pitch = (Z0 - Z1) / N;
  const buckets: Record<string, THREE.BufferGeometry[]> = {};
  const add = (col: string, g: THREE.BufferGeometry) => {
    (buckets[col] ||= []).push(g.index ? g : g);
  };
  const box = (col: string, w: number, h: number, d: number, x: number, y: number, z: number) =>
    add(col, new THREE.BoxGeometry(w, h, d).translate(x, y, z));
  // dims at z
  const dims = (z: number) => {
    const t = (Z0 - z) / (Z0 - Z1);
    return { w: 0.43 + (0.37 - 0.43) * t, h: 0.24 };
  };
  // slab between two rings on one side
  const slab = (col: string, a: THREE.Vector3, bb: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3) => {
    const g = new THREE.BufferGeometry();
    const v = [a, bb, c, a, c, d].flatMap((p) => [p.x, p.y, p.z]);
    g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    g.computeVertexNormals();
    add(col, g.toNonIndexed());
    // back face
    const g2 = new THREE.BufferGeometry();
    const v2 = [a, c, bb, a, d, c].flatMap((p) => [p.x, p.y, p.z]);
    g2.setAttribute("position", new THREE.Float32BufferAttribute(v2, 3));
    g2.computeVertexNormals();
    add(col, g2);
  };
  const ring = (z: number, grow: number) => {
    const { w, h } = dims(z);
    const hw = w / 2 + grow / 2, hh = h / 2 + grow / 2, cy = 0.13;
    return [
      new THREE.Vector3(hw, cy + hh, z),
      new THREE.Vector3(-hw, cy + hh, z),
      new THREE.Vector3(-hw, cy - hh, z),
      new THREE.Vector3(hw, cy - hh, z),
    ];
  };
  const pk = 0.012, vl = -0.014;
  for (let i = 0; i < N; i++) {
    const zp = Z0 - i * pitch - 0.0 ;
    const zv = zp - pitch / 2;
    const zn = zp - pitch;
    const P0 = ring(zp, pk), V = ring(zv, vl), P1 = ring(Math.max(zn, Z1), pk);
    for (let s = 0; s < 4; s++) {
      const s2 = (s + 1) % 4;
      slab(P.bellowsBlack, P0[s], P0[s2], V[s2], V[s]);
      slab(i % 2 ? P.bellowsFold : P.bellowsBlack, V[s], V[s2], P1[s2], P1[s]);
    }
    // felt liner in valley
    const { w, h } = dims(zv);
    const fw = w + vl, fh = h + vl;
    box(P.feltRed, fw + 0.002, 0.003, 0.003, 0, 0.13 + fh / 2 + 0.001, zv);
    box(P.feltRed, fw + 0.002, 0.003, 0.003, 0, 0.13 - fh / 2 - 0.001, zv);
    // corner tapes and studs
    for (const p of P0) {
      box(P.pearlWhite, 0.006, 0.006, pitch * 0.7, p.x * 1, p.y, zp - pitch * 0.15);
      box(P.goldBright, 0.005, 0.005, 0.005, p.x * 1.0, p.y, zp);
    }
    // gold ridge lines every other peak
    if (i % 2 === 0) {
      box(P.goldBright, 0.12, 0.0015, 0.0025, 0, P0[0].y + 0.001, zp);
      box(P.goldBright, 0.12, 0.0015, 0.0025, 0, P0[3].y - 0.001, zp);
    }
  }
  // end frame plates
  for (const [z, dz] of [[Z0 - 0.002, 0], [Z1 + 0.002, 0]] as number[][]) {
    const { w } = dims(z);
    box(P.bellowsFold, w - 0.01, 0.23, 0.004, 0, 0.13, z);
    for (const sy of [1, -1]) box(P.chrome, w - 0.01, 0.0025, 0.0025, 0, 0.13 + sy * 0.1175, z);
    for (const sx of [1, -1]) box(P.chrome, 0.0025, 0.235, 0.0025, sx * (w / 2 - 0.005), 0.13, z);
  }
  // latch strap on +X side
  const sx = dims(-0.15).w / 2 + 0.014;
  box(P.leather, 0.004, 0.2, 0.025, sx, 0.13, -0.15);
  box(P.leatherLight, 0.0015, 0.2, 0.002, sx + 0.002, 0.13, -0.15);
  box(P.chrome, 0.006, 0.03, 0.034, sx + 0.002, 0.15, -0.15);
  box(P.goldDark, 0.007, 0.018, 0.02, sx + 0.003, 0.15, -0.15);
  for (const [col, list] of Object.entries(buckets)) {
    const g = mergeGeometries(list.map((x) => (x.index ? x.toNonIndexed() : x)));
    if (g) b.part(g, col, { at: [0, 0, 0] });
  }
}
    return buildBellows;
  })(),
  // bassBox
  (() => {
function buildBassBox({ b, P }: any) {
  const R = rng(11);
  const geos: Record<string, THREE.BufferGeometry[]> = {};
  const add = (col: string, g: THREE.BufferGeometry, x: number, y: number, z: number, rot?: [number, number, number]) => {
    if (rot) g.rotateX(rot[0]), g.rotateY(rot[1]), g.rotateZ(rot[2]);
    g.translate(x, y, z);
    (geos[col] ||= []).push(g);
  };
  const box = (col: string, w: number, h: number, d: number, x: number, y: number, z: number) =>
    add(col, new THREE.BoxGeometry(w, h, d), x, y, z);
  const cyl = (col: string, r: number, len: number, x: number, y: number, z: number, axis: "x" | "y" | "z", seg = 10) => {
    const g = new THREE.CylinderGeometry(r, r, len, seg);
    if (axis === "x") g.rotateZ(Math.PI / 2);
    if (axis === "z") g.rotateX(Math.PI / 2);
    add(col, g, x, y, z);
  };
  const X0 = -0.19, X1 = 0.19, Y0 = 0, Y1 = 0.26, Z0 = -0.3, Z1 = -0.2;
  const W = X1 - X0, H = Y1 - Y0, D = Z1 - Z0, cx = 0, cy = 0.13, cz = -0.25;

  // base shell
  box("pearlWhite", W, H, D, cx, cy, cz);
  // tile mosaic
  const mix: [string, number][] = [["pearlWhite", .4], ["pearlCream", .2], ["pearlPink", .15], ["pearlBlue", .1], ["pearlMint", .08], ["pearlLilac", .07]];
  const pickC = () => { let r = R(), a = 0; for (const [c, p] of mix) { a += p; if (r < a) return c; } return "pearlWhite"; };
  const T = 0.0045, S = 0.0055, th = 0.0015;
  const tiles = (u0: number, u1: number, v0: number, v1: number, fn: (u: number, v: number, c: string) => void) => {
    for (let u = u0 + T / 2; u < u1; u += S) for (let v = v0 + T / 2; v < v1; v += S) fn(u, v, pickC());
  };
  // sides
  for (const s of [1, -1]) tiles(Z0 + 0.006, Z1 - 0.006, 0.006, Y1 - 0.006, (u, v, c) => box(c, th * 2, T, T, s * (W / 2 + 0.0005), v, u));
  // bottom
  tiles(X0 + .006, X1 - .006, Z0 + .006, Z1 - .006, (u, v, c) => box(c, T, th * 2, T, u, -0.0005 + 0.0015, v));
  // top border (front/back strips)
  tiles(X0 + .006, X1 - .006, Z0 + .006, Z0 + .03, (u, v, c) => box(c, T, th * 2, T, u, Y1 + 0.0005, v));
  tiles(X0 + .006, X1 - .006, Z1 - .02, Z1 - .006, (u, v, c) => box(c, T, th * 2, T, u, Y1 + 0.0005, v));
  // front wall rim tiles (above/below opening)
  tiles(X0 + .006, X1 - .006, Y1 - 0.01, Y1 - 0.004, (u, v, c) => box(c, T, T, th * 2, u, v, Z1 + 0.0005));

  // front mounting frame
  box("pearlShade", 0.37, 0.24, 0.004, 0, 0.13, Z1 + 0.002);
  const rim = (w: number, h: number, z: number) => {
    box("bellowsFold", w, 0.004, 0.004, 0, 0.13 + h / 2, z); box("bellowsFold", w, 0.004, 0.004, 0, 0.13 - h / 2, z);
    box("bellowsFold", 0.004, h, 0.004, w / 2, 0.13, z); box("bellowsFold", 0.004, h, 0.004, -w / 2, 0.13, z);
  };
  rim(0.36, 0.23, Z1 + 0.005);

  // chrome edge rods
  const rr = 0.0025;
  for (const y of [Y0, Y1]) for (const z of [Z0, Z1]) cyl("chrome", rr, W, 0, y, z, "x", 6);
  for (const x of [X0, X1]) for (const z of [Z0, Z1]) cyl("chrome", rr, H, x, cy, z, "y", 6);
  for (const y of [Y0, Y1]) for (const x of [X0, X1]) cyl("chrome", rr, D, x, y, cz, "z", 6);
  // gold corners
  for (const x of [X0, X1]) for (const y of [Y0, Y1]) for (const z of [Z0, Z1]) box("gold", 0.012, 0.012, 0.012, x, y, z);

  // side studs
  for (const s of [1, -1]) {
    const x = s * (W / 2 + 0.002);
    cyl("goldBright", 0.009, 0.003, x, cy, cz, "x", 12);
    add("ruby", new THREE.SphereGeometry(0.005, 8, 6), s * (W / 2 + 0.004), cy, cz);
  }

  // button board
  box("keyBlack", 0.28, 0.19, 0.004, 0, 0.13, Z0 - 0.0005);
  box("chrome", 0.288, 0.003, 0.005, 0, 0.037, Z0 - 0.001); box("chrome", 0.288, 0.003, 0.005, 0, 0.223, Z0 - 0.001);
  box("chrome", 0.003, 0.19, 0.005, -0.14, 0.13, Z0 - 0.001); box("chrome", 0.003, 0.19, 0.005, 0.14, 0.13, Z0 - 0.001);
  box("pearlCream", 0.28, 0.008, 0.004, 0, 0.03, Z0 - 0.001); box("pearlCream", 0.28, 0.008, 0.004, 0, 0.23, Z0 - 0.001);
  for (let i = 0; i < 6; i++) { cyl("gold", 0.002, 0.004, -0.125 + i * 0.05, 0.03, Z0 - 0.004, "z", 6); cyl("gold", 0.002, 0.004, -0.125 + i * 0.05, 0.23, Z0 - 0.004, "z", 6); }
  for (let r = 0; r < 8; r++) for (let c = 0; c < 6; c++) {
    const x = -0.1 + c * 0.04, y = 0.05 + r * 0.0225;
    cyl("chrome", 0.0105, 0.004, x, y, Z0 - 0.0035, "z", 12);
    cyl(r % 2 ? "keyBlack" : "keyWhite", 0.0085, 0.008, x, y, Z0 - 0.0075, "z", 12);
    if (r === 4) cyl("gold", 0.0025, 0.002, x, y, Z0 - 0.0125, "z", 6);
  }

  // top grille
  const gy = Y1;
  box("chrome", 0.16, 0.003, 0.07, 0, gy + 0.0015, cz);
  box("grilleDark", 0.15, 0.004, 0.06, 0, gy + 0.002, cz);
  for (let i = 0; i < 7; i++) box("chrome", 0.0045, 0.005, 0.058, -0.066 + i * 0.022, gy + 0.004, cz);
  cyl("gold", 0.012, 0.004, 0, gy + 0.008, cz, "y", 14);
  add("sapphire", new THREE.SphereGeometry(0.005, 8, 6), 0, gy + 0.0115, cz);

  // bottom plate + feet
  box("leather", 0.34, 0.003, 0.08, 0, 0.0075, cz);
  for (const x of [-0.14, 0, 0.14]) add("chromeDark", new THREE.SphereGeometry(0.006, 8, 4, 0, 6.3, 0, 1.6), x, 0.0, cz + (x === 0 ? 0.02 : -0.02));

  // strap
  const sx = 0.19;
  box("leather", 0.004, 0.2, 0.03, sx + 0.002, 0.13, cz);
  box("leather", 0.1, 0.004, 0.03, sx - 0.05, Y1 + 0.003, cz);
  for (const dz of [-0.011, 0.011]) box("leatherLight", 0.0015, 0.2, 0.0015, sx + 0.0045, 0.13, cz + dz);
  box("chrome", 0.006, 0.02, 0.036, sx + 0.005, 0.2, cz);
  box("leather", 0.004, 0.012, 0.024, sx + 0.0075, 0.2, cz);

  const names: Record<string, string> = {};
  for (const [col, list] of Object.entries(geos)) {
    const m = mergeGeometries(list.map((g) => (g.index ? g : g)), false);
    if (m) b.part(m, P[col], { at: [0, 0, 0], flat: true, name: "bassBox_" + col });
  }
}
    return buildBassBox;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "madreperlaAccordion" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
