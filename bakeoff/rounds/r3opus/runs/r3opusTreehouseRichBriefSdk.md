```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Cozy Treehouse Diorama",
  description:
    "A stylized low-poly diorama: an old oak with a wide faceted crown on a round grassy base, a little plank cabin with a red shingle roof, a round window, a pennant and a lantern, plus a rope ladder, a swing, mushrooms and a bicycle at the foot of the tree.",
};

export default function build() {
  const b = createBuilder({ name: "treehouse" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const swingJ = b.joint("swing", { at: [-2.3, 3.72, 0.23], parent: root });
  const flagJ = b.joint("flag", { at: [1.1, 7.95, 1.35], parent: root });

  const R: any = rng(42);
  const rnd = (): number =>
    typeof R === "function" ? R() : typeof R.next === "function" ? R.next() : R.float();
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length) % arr.length];

  type V = number[];
  const P = (geo: THREE.BufferGeometry, color: string, at: V, bone: any = root) =>
    b.part(geo, color, { at, bone });

  const rotGeo = (g: THREE.BufferGeometry, rot?: V) => {
    if (rot) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rot[0], rot[1], rot[2])));
    return g;
  };
  const box = (w: number, h: number, d: number, color: string, at: V, rot?: V, bone: any = root) =>
    P(rotGeo(new THREE.BoxGeometry(w, h, d), rot), color, at, bone);
  const ball = (r: number, color: string, at: V, ws = 8, hs = 6, bone: any = root, scale?: V) => {
    const g = new THREE.SphereGeometry(r, ws, hs);
    if (scale) g.scale(scale[0], scale[1], scale[2]);
    return P(g, color, at, bone);
  };
  const seg = (a: V, c: V, r0: number, r1: number, color: string, radial = 6, bone: any = root) => {
    const A = new THREE.Vector3(a[0], a[1], a[2]);
    const C = new THREE.Vector3(c[0], c[1], c[2]);
    const d = C.clone().sub(A);
    const len = d.length();
    const g = new THREE.CylinderGeometry(r1, r0, len, radial);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()));
    return P(g, color, A.add(C).multiplyScalar(0.5).toArray(), bone);
  };

  // ---------- palette ----------
  const C = {
    dirt: "#7a5236", dirtDark: "#5e3e28", grass: "#7cbf4f", grassEdge: "#5f9e3c", tuft: "#94d160", tuftDark: "#5c9a38",
    bark: "#6b4a2f", barkDark: "#4a321f", barkLight: "#80593a",
    leafA: "#4f8a3a", leafB: "#3f7432", leafC: "#69a446", leafTop: "#8cc95a", apple: "#d9443a",
    wood: "#c98d52", woodDark: "#a96f3c", woodDeep: "#7a4f2b", plankA: "#b98149", plankB: "#a7713e", beam: "#5a3d24",
    gable: "#e0a868", trim: "#f2e2c0", door: "#7a4a26",
    roofA: "#c0392b", roofB: "#a93226", roofC: "#d64535", ridge: "#7d2620",
    glass: "#9fd6e8", lantern: "#ffd75e", metal: "#3a3a40", gold: "#e0b84a",
    rope: "#d8c08a", stone: "#9a9a92", stoneB: "#b3b0a6", stoneC: "#7f7d78",
    mushRed: "#e0412f", mushOrange: "#e07b39", mushBrown: "#b07040", stem: "#f3ead2", spot: "#fffaf0",
    bike: "#2a9d8f", tire: "#2b2b2b", chrome: "#c9ccd1", saddle: "#6b3b22", wicker: "#c99a5b",
    flagA: "#f4c430", flagB: "#3b7dd8", shutter: "#4c7a5a", pink: "#f28cb1", violet: "#9b7be0", white: "#fbfbf5",
  };

  // ---------- base ----------
  P(new THREE.CylinderGeometry(5.95, 5.7, 0.45, 18), C.dirt, [0, 0.225, 0]);
  P(new THREE.CylinderGeometry(5.98, 5.98, 0.08, 18), C.dirtDark, [0, 0.3, 0]);
  P(new THREE.CylinderGeometry(6.05, 6.05, 0.12, 18), C.grassEdge, [0, 0.47, 0]);
  P(new THREE.CylinderGeometry(5.95, 6.05, 0.08, 18), C.grass, [0, 0.565, 0]);
  const G = 0.605; // ground top

  // rim stones
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2 + rnd() * 0.1;
    const g = new THREE.DodecahedronGeometry(0.22 + rnd() * 0.1, 0);
    g.scale(1.3, 0.6, 1);
    g.rotateY(-a);
    P(g, pick([C.stone, C.stoneB, C.stoneC]), [Math.cos(a) * 5.85, 0.5, Math.sin(a) * 5.85]);
  }

  // stepping stones from ladder
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    const g = new THREE.CylinderGeometry(0.26, 0.28, 0.06, 7);
    g.rotateY(rnd() * 3);
    P(g, i % 2 ? C.stoneB : C.stone, [1.5 + t * 1.4 + (i % 2 ? 0.15 : -0.1), G, 3.75 + t * 1.6]);
  }

  // grass tufts
  let made = 0;
  for (let tries = 0; tries < 200 && made < 40; tries++) {
    const a = rnd() * Math.PI * 2;
    const r = 1.4 + rnd() * 4.2;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.abs(z - 2.9) < 0.6 && x > -2.5 && x < -0.6) continue; // bike
    if (Math.abs(x - 1.42) < 0.5 && z > 2.9 && z < 3.8) continue; // ladder foot
    made++;
    for (let k = 0; k < 3; k++) {
      const h = 0.18 + rnd() * 0.18;
      const g = new THREE.ConeGeometry(0.05, h, 4);
      rotGeo(g, [(rnd() - 0.5) * 0.6, rnd() * 3, (rnd() - 0.5) * 0.6]);
      P(g, k === 1 ? C.tuftDark : C.tuft, [x + (rnd() - 0.5) * 0.15, G + h * 0.45, z + (rnd() - 0.5) * 0.15]);
    }
  }
  // flowers
  for (let i = 0; i < 18; i++) {
    const a = rnd() * Math.PI * 2;
    const r = 1.6 + rnd() * 3.9;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.abs(z - 2.9) < 0.6 && x > -2.5 && x < -0.6) continue;
    seg([x, G, z], [x, G + 0.2, z], 0.012, 0.012, C.tuftDark, 3);
    ball(0.06, pick([C.flagA, C.white, C.pink, C.violet]), [x, G + 0.22, z], 6, 4, root, [1, 0.6, 1]);
  }

  // ---------- trunk ----------
  const trunk: [V, number][] = [
    [[0, 0.5, 0], 0.82],
    [[0.05, 1.6, -0.02], 0.66],
    [[0, 3.0, -0.1], 0.58],
    [[-0.05, 4.5, -0.25], 0.52],
    [[0, 6.0, -0.4], 0.46],
    [[0.1, 7.4, -0.55], 0.38],
    [[0, 8.4, -0.6], 0.28],
  ];
  for (let i = 0; i < trunk.length - 1; i++) {
    const [a, ra] = trunk[i];
    const [c, rc] = trunk[i + 1];
    seg(a, c, ra, rc, C.bark, 9);
    if (i > 0) ball(ra * 1.0, C.bark, a, 9, 6);
    // bark ridges
    if (i < 4) {
      for (let k = 0; k < 7; k++) {
        const ang = (k / 7) * Math.PI * 2 + i * 0.4;
        const ca = Math.cos(ang), sa = Math.sin(ang);
        seg(
          [a[0] + ca * ra * 0.97, a[1] + 0.1, a[2] + sa * ra * 0.97],
          [c[0] + ca * rc * 0.97, c[1] - 0.1, c[2] + sa * rc * 0.97],
          0.07, 0.05, k % 2 ? C.barkDark : C.barkLight, 4,
        );
      }
    }
  }
  // knot hole
  {
    const g = new THREE.TorusGeometry(0.16, 0.06, 5, 10);
    P(g, C.barkLight, [0.02, 2.2, 0.63]);
    P(new THREE.CircleGeometry(0.14, 10), "#2a1a10", [0.02, 2.2, 0.62]);
  }
  // root flares
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const ca = Math.cos(a), sa = Math.sin(a);
    seg([ca * 0.45, 1.0, sa * 0.45], [ca * 1.5, 0.56, sa * 1.5], 0.32, 0.07, i % 2 ? C.bark : C.barkLight, 6);
  }

  // crown branches
  const crownBranches: [V, V, number][] = [
    [[0, 6.6, -0.42], [2.5, 8.2, 0.1], 0.26],
    [[0, 6.9, -0.45], [-2.6, 8.0, -0.3], 0.26],
    [[0, 7.2, -0.5], [0.4, 8.6, -2.5], 0.24],
    [[0, 7.6, -0.55], [-1.0, 8.9, 1.0], 0.2],
  ];
  for (const [a, c, r] of crownBranches) {
    seg(a, c, r, r * 0.4, C.bark, 7);
    ball(r * 0.4, C.bark, c, 6, 4);
  }
  // branch cradling the deck & swing branch
  seg([0.1, 3.3, -0.05], [1.9, 3.85, 1.3], 0.24, 0.09, C.bark, 7);
  seg([-0.3, 3.3, 0], [-2.9, 3.9, 0.3], 0.24, 0.1, C.bark, 7);
  ball(0.1, C.bark, [-2.9, 3.9, 0.3], 6, 4);
  // little leaf sprig at the swing branch tip
  ball(0.35, C.leafC, [-3.05, 4.05, 0.32], 6, 4);
  ball(0.25, C.leafA, [-2.85, 4.2, 0.1], 6, 4);

  // ---------- crown ----------
  const blobs: V[] = [
    [0, 9.4, -0.6, 2.2], [2.2, 8.6, -0.2, 1.7], [-2.3, 8.5, -0.5, 1.8], [0.6, 8.5, -2.4, 1.7],
    [-1.0, 8.85, 1.0, 1.4], [1.3, 10.4, -0.4, 1.5], [-1.3, 10.3, -1.2, 1.5], [2.8, 9.4, -1.6, 1.3],
    [-2.9, 9.3, -1.8, 1.2], [0.0, 10.9, 0.3, 1.2], [3.1, 8.0, 0.9, 1.0], [-3.2, 7.9, 0.6, 1.0],
    [-0.5, 7.9, -2.9, 1.2], [1.8, 9.6, 0.9, 1.1],
  ];
  const leafCols = [C.leafA, C.leafB, C.leafC];
  blobs.forEach((bl, i) => {
    const g = new THREE.IcosahedronGeometry(bl[3], 1);
    g.rotateY(rnd() * 6);
    g.rotateX(rnd() * 0.5);
    P(g, leafCols[i % 3], [bl[0], bl[1], bl[2]]);
    // sunny highlight cap
    if (bl[1] > 9 || i % 3 === 2) {
      const h = new THREE.IcosahedronGeometry(bl[3] * 0.45, 0);
      h.rotateY(rnd() * 6);
      P(h, C.leafTop, [bl[0] + (rnd() - 0.5) * 0.3, bl[1] + bl[3] * 0.65, bl[2] + (rnd() - 0.3) * 0.4]);
    }
  });
  // apples
  for (let i = 0; i < 16; i++) {
    const bl = blobs[Math.floor(rnd() * blobs.length) % blobs.length];
    const th = rnd() * Math.PI * 2;
    const ph = 0.5 + rnd() * 1.4;
    const d = [Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)];
    ball(0.12, C.apple, [bl[0] + d[0] * bl[3] * 0.93, bl[1] + d[1] * bl[3] * 0.93, bl[2] + d[2] * bl[3] * 0.93], 6, 4);
  }

  // ---------- deck ----------
  const DX = 0.2, DZ = 1.4, DY = 4.0;
  for (let i = 0; i < 12; i++) {
    const z = 0.05 + i * 0.233 + 0.11;
    box(3.2, 0.1, 0.21, i % 2 ? C.plankA : C.plankB, [DX + (i % 3 - 1) * 0.03, DY, z]);
  }
  box(3.4, 0.16, 0.18, C.beam, [DX, 3.87, 0.25]);
  box(3.4, 0.16, 0.18, C.beam, [DX, 3.87, 2.6]);
  box(0.14, 0.14, 2.8, C.beam, [-1.25, 3.85, 1.4]);
  box(0.14, 0.14, 2.8, C.beam, [1.65, 3.85, 1.4]);
  // braces from trunk
  seg([-0.2, 2.7, 0.35], [-1.25, 3.8, 2.4], 0.07, 0.07, C.beam, 5);
  seg([0.2, 2.7, 0.35], [1.65, 3.8, 2.4], 0.07, 0.07, C.beam, 5);
  seg([-0.45, 3.1, 0.0], [-1.25, 3.8, 0.4], 0.06, 0.06, C.beam, 5);
  // railing
  const RZ = 2.75;
  const frontPosts = [-1.3, -0.75, -0.2, 0.35, 0.9, 1.75];
  for (const x of frontPosts) box(0.08, 0.6, 0.08, C.woodDeep, [x, 4.35, RZ]);
  box(2.3, 0.06, 0.07, C.woodDeep, [-0.2, 4.64, RZ]);
  box(2.3, 0.05, 0.05, C.woodDark, [-0.2, 4.38, RZ]);
  for (const z of [0.3, 1.1, 1.9]) box(0.08, 0.6, 0.08, C.woodDeep, [1.75, 4.35, z]);
  box(0.07, 0.06, 2.5, C.woodDeep, [1.75, 4.64, 1.5]);
  box(0.05, 0.05, 2.5, C.woodDark, [1.75, 4.38, 1.5]);
  box(0.07, 0.06, 0.5, C.woodDeep, [-1.3, 4.64, 2.5]);
  box(0.08, 0.6, 0.08, C.woodDeep, [-1.3, 4.35, 2.25]);

  // ---------- cabin ----------
  const CX = 0.2, CZ = 1.35, CW = 2.2, CD = 1.8, CB = 4.05, CH = 1.8;
  const xL = CX - CW / 2, xR = CX + CW / 2, zB = CZ - CD / 2, zF = CZ + CD / 2;
  box(CW, CH, CD, C.wood, [CX, CB + CH / 2, CZ]);
  for (let y = CB + 0.15; y < CB + CH - 0.05; y += 0.3) {
    box(CW, 0.04, 0.03, C.woodDark, [CX, y, zF + 0.015]);
    box(0.03, 0.04, CD, C.woodDark, [xR + 0.015, y, CZ]);
    box(0.03, 0.04, CD, C.woodDark, [xL - 0.015, y, CZ]);
  }
  for (const x of [xL, xR]) for (const z of [zB, zF]) box(0.14, CH + 0.05, 0.14, C.woodDeep, [x, CB + CH / 2, z]);
  // gables
  {
    const sh = new THREE.Shape();
    sh.moveTo(-CD / 2, 0);
    sh.lineTo(CD / 2, 0);
    sh.lineTo(0, 1.1);
    sh.closePath();
    for (const x of [xR - 0.05, xL + 0.05]) {
      const g = new THREE.ExtrudeGeometry(sh, { depth: 0.1, bevelEnabled: false });
      g.translate(0, 0, -0.05);
      g.rotateY(Math.PI / 2);
      P(g, C.gable, [x, CB + CH, CZ]);
    }
    // little round vent on right gable
    const v = new THREE.TorusGeometry(0.1, 0.03, 4, 10);
    v.rotateY(Math.PI / 2);
    P(v, C.trim, [xR + 0.01, CB + CH + 0.4, CZ]);
    const vc = new THREE.CircleGeometry(0.09, 10);
    vc.rotateY(Math.PI / 2);
    P(vc, "#3a2416", [xR + 0.005, CB + CH + 0.4, CZ]);
  }
  // door
  box(0.74, 1.37, 0.05, C.trim, [-0.4, CB + 0.68, zF + 0.02]);
  box(0.62, 1.27, 0.07, C.door, [-0.4, CB + 0.64, zF + 0.04]);
  for (const dx of [-0.16, 0, 0.16]) box(0.025, 1.2, 0.02, "#5c3519", [-0.4 + dx, CB + 0.64, zF + 0.085]);
  box(0.5, 0.06, 0.02, "#5c3519", [-0.4, CB + 0.95, zF + 0.09]);
  ball(0.04, C.gold, [-0.18, CB + 0.62, zF + 0.1], 6, 4);
  box(0.9, 0.08, 0.3, C.woodDeep, [-0.4, CB + 0.02, zF + 0.17]); // doorstep
  // round window
  {
    const WX = 0.65, WY = 5.0;
    const glass = new THREE.CylinderGeometry(0.3, 0.3, 0.04, 12);
    glass.rotateX(Math.PI / 2);
    P(glass, C.glass, [WX, WY, zF + 0.02]);
    P(new THREE.TorusGeometry(0.31, 0.06, 5, 14), C.trim, [WX, WY, zF + 0.04]);
    box(0.6, 0.04, 0.03, C.trim, [WX, WY, zF + 0.05]);
    box(0.04, 0.6, 0.03, C.trim, [WX, WY, zF + 0.05]);
    // flower box
    box(0.72, 0.15, 0.2, C.woodDeep, [WX, WY - 0.44, zF + 0.1]);
    for (let i = 0; i < 5; i++) {
      const fx = WX - 0.28 + i * 0.14;
      ball(0.07, C.leafC, [fx, WY - 0.34, zF + 0.1], 6, 4);
      ball(0.05, i % 2 ? C.pink : C.flagA, [fx + 0.02, WY - 0.27, zF + 0.14], 6, 4);
    }
  }
  // side window with shutters
  {
    const SY = 5.0;
    box(0.03, 0.5, 0.5, C.glass, [xR + 0.02, SY, CZ]);
    box(0.05, 0.56, 0.05, C.trim, [xR + 0.04, SY, CZ]);
    box(0.05, 0.05, 0.56, C.trim, [xR + 0.04, SY, CZ]);
    box(0.05, 0.62, 0.06, C.trim, [xR + 0.04, SY, CZ - 0.28]);
    box(0.05, 0.62, 0.06, C.trim, [xR + 0.04, SY, CZ + 0.28]);
    box(0.05, 0.06, 0.62, C.trim, [xR + 0.04, SY + 0.28, CZ]);
    box(0.05, 0.06, 0.62, C.trim, [xR + 0.04, SY - 0.28, CZ]);
    for (const s of [-1, 1]) {
      box(0.04, 0.6, 0.26, C.shutter, [xR + 0.04, SY, CZ + s * 0.46]);
      box(0.05, 0.03, 0.2, "#3a5e45", [xR + 0.06, SY + 0.12, CZ + s * 0.46]);
      box(0.05, 0.03, 0.2, "#3a5e45", [xR + 0.06, SY - 0.12, CZ + s * 0.46]);
    }
  }
  // lantern by the door
  {
    const LX = 0.08, LY = 5.25, LZ = zF + 0.24;
    box(0.04, 0.04, 0.26, C.metal, [LX, 5.47, zF + 0.13]);
    box(0.1, 0.12, 0.03, C.metal, [LX, 5.47, zF + 0.02]);
    seg([LX, 5.47, LZ], [LX, LY + 0.14, LZ], 0.01, 0.01, C.metal, 3);
    const cap = new THREE.ConeGeometry(0.12, 0.1, 4);
    cap.rotateY(Math.PI / 4);
    P(cap, C.metal, [LX, LY + 0.1, LZ]);
    box(0.13, 0.15, 0.13, C.lantern, [LX, LY - 0.02, LZ]);
    for (const dx of [-0.07, 0.07]) for (const dz of [-0.07, 0.07]) box(0.02, 0.17, 0.02, C.metal, [LX + dx, LY - 0.02, LZ + dz]);
    box(0.17, 0.03, 0.17, C.metal, [LX, LY - 0.11, LZ]);
    ball(0.02, C.metal, [LX, LY + 0.17, LZ], 5, 3);
  }

  // ---------- roof ----------
  const eaveY = 5.7, ridgeY = 6.95, run = 1.15, rise = ridgeY - eaveY;
  const th = Math.atan2(rise, run);
  const L = Math.hypot(run, rise);
  const roofCols = [C.roofA, C.roofB, C.roofC];
  const rows = 6;
  for (const s of [1, -1]) {
    const n = [0, Math.cos(th), s * Math.sin(th)];
    box(2.75, 0.08, L, C.ridge, [CX, (eaveY + ridgeY) / 2, CZ + (s * run) / 2], [s * th, 0, 0]);
    for (let i = 0; i < rows; i++) {
      const t = (i + 0.5) / rows;
      const z = CZ + s * run * (1 - t);
      const y = eaveY + rise * t;
      const off = 0.07;
      for (let j = 0; j < 9; j++) {
        const x = CX - 1.2 + 0.3 * j + (i % 2 ? 0.15 : 0);
        if (x > CX + 1.3) continue;
        box(0.28, 0.05, (L / rows) * 1.18, pick(roofCols),
          [x, y + n[1] * off + (rows - i) * 0.004, z + n[2] * off],
          [s * th + (rnd() - 0.5) * 0.05, (rnd() - 0.5) * 0.08, 0]);
      }
    }
  }
  box(2.85, 0.14, 0.22, C.ridge, [CX, ridgeY + 0.08, CZ], [Math.PI / 4, 0, 0]);
  // chimney on back slope
  {
    const chX = -0.45, chZ = CZ - 0.55;
    box(0.36, 0.9, 0.36, C.stone, [chX, 6.8, chZ]);
    for (let i = 0; i < 4; i++) box(0.38, 0.05, 0.38, C.stoneC, [chX, 6.5 + i * 0.22, chZ]);
    box(0.46, 0.1, 0.46, C.stoneC, [chX, 7.28, chZ]);
    ball(0.12, "#e8e8e8", [chX + 0.05, 7.55, chZ - 0.05], 6, 4, root, [1.2, 0.8, 1]);
    ball(0.09, "#f2f2f2", [chX + 0.18, 7.78, chZ - 0.12], 6, 4, root, [1.2, 0.8, 1]);
  }
  // pennant flag
  {
    seg([1.1, ridgeY, CZ], [1.1, 8.0, CZ], 0.025, 0.02, C.woodDeep, 5);
    ball(0.045, C.gold, [1.1, 8.02, CZ], 6, 4, flagJ);
    const sh = new THREE.Shape();
    sh.moveTo(0, 0);
    sh.lineTo(0.75, -0.17);
    sh.lineTo(0, -0.36);
    sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.02, bevelEnabled: false });
    g.translate(0, 0, -0.01);
    P(g, C.flagA, [1.12, 7.95, CZ], flagJ);
    const sh2 = new THREE.Shape();
    sh2.moveTo(0, -0.11);
    sh2.lineTo(0.35, -0.175);
    sh2.lineTo(0, -0.25);
    sh2.closePath();
    const g2 = new THREE.ExtrudeGeometry(sh2, { depth: 0.03, bevelEnabled: false });
    g2.translate(0, 0, -0.015);
    P(g2, C.flagB, [1.12, 7.95, CZ], flagJ);
  }

  // ---------- rope ladder ----------
  {
    const top = [DY, 2.83], bot = [G + 0.02, 3.3];
    for (const x of [1.22, 1.62]) {
      seg([x, top[0], top[1]], [x, bot[0], bot[1]], 0.022, 0.022, C.rope, 4);
      ball(0.05, C.woodDeep, [x, top[0] + 0.02, top[1]], 6, 4);
    }
    const n = 10;
    for (let k = 1; k <= n; k++) {
      const t = k / (n + 1);
      const y = top[0] + (bot[0] - top[0]) * t;
      const z = top[1] + (bot[1] - top[1]) * t;
      box(0.52, 0.05, 0.09, k % 2 ? C.plankA : C.woodDark, [1.42, y, z], [Math.atan2(0.47, 3.4), 0, 0]);
      ball(0.035, C.rope, [1.22, y, z], 5, 3);
      ball(0.035, C.rope, [1.62, y, z], 5, 3);
    }
  }

  // ---------- swing ----------
  {
    const seatY = 1.15;
    for (const z of [0.03, 0.43]) {
      seg([-2.3, 3.72, z], [-2.3, seatY + 0.03, z], 0.018, 0.018, C.rope, 4, swingJ);
      ball(0.05, C.rope, [-2.3, 3.75, z], 6, 4, swingJ);
      ball(0.035, C.rope, [-2.3, seatY + 0.05, z], 5, 3, swingJ);
    }
    box(0.32, 0.07, 0.64, C.wood, [-2.3, seatY, 0.23], undefined, swingJ);
    box(0.34, 0.025, 0.04, C.woodDeep, [-2.3, seatY + 0.04, 0.0], undefined, swingJ);
    box(0.34, 0.025, 0.04, C.woodDeep, [-2.3, seatY + 0.04, 0.46], undefined, swingJ);
  }

  // ---------- mushrooms ----------
  const mush: [number, number, number, number, string][] = [
    [-1.0, 0.95, 0.25, 0.22, C.mushRed],
    [-1.3, 0.6, 0.16, 0.14, C.mushRed],
    [0.95, -1.05, 0.3, 0.26, C.mushRed],
    [1.2, -0.72, 0.15, 0.12, C.mushOrange],
    [-0.6, -1.25, 0.2, 0.17, C.mushRed],
    [2.9, -2.5, 0.22, 0.2, C.mushBrown],
    [3.15, -2.25, 0.13, 0.11, C.mushBrown],
  ];
  for (const [x, z, h, r, col] of mush) {
    seg([x, G - 0.02, z], [x, G + h, z], r * 0.4, r * 0.32, C.stem, 6);
    const cap = new THREE.SphereGeometry(r, 9, 4, 0, Math.PI * 2, 0, Math.PI / 2);
    cap.scale(1, 0.8, 1);
    P(cap, col, [x, G + h - 0.02, z]);
    P(new THREE.CylinderGeometry(r * 0.98, r * 0.85, 0.03, 9), C.stem, [x, G + h - 0.02, z]);
    if (col === C.mushRed) {
      for (let k = 0; k < 5; k++) {
        const t = (k / 5) * Math.PI * 2 + rnd();
        const ph = k === 0 ? 0.1 : 0.75 + rnd() * 0.3;
        const d = [Math.sin(ph) * Math.cos(t), Math.cos(ph) * 0.8, Math.sin(ph) * Math.sin(t)];
        ball(r * 0.17, C.spot, [x + d[0] * r, G + h - 0.02 + d[1] * r, z + d[2] * r], 6, 3, root, [1, 0.5, 1]);
      }
    }
  }

  // ---------- bicycle ----------
  {
    const BZ = 2.9;
    const p = (x: number, y: number, dz = 0): V => [x, G + y, BZ + dz];
    const wheel = (x: number) => {
      P(new THREE.TorusGeometry(0.33, 0.04, 5, 16), C.tire, p(x, 0.34));
      P(new THREE.TorusGeometry(0.28, 0.015, 4, 16), C.chrome, p(x, 0.34));
      for (let k = 0; k < 4; k++) {
        const g = new THREE.CylinderGeometry(0.008, 0.008, 0.56, 3);
        g.rotateZ((k / 4) * Math.PI);
        P(g, C.chrome, p(x, 0.34));
      }
      const hub = new THREE.CylinderGeometry(0.04, 0.04, 0.1, 6);
      hub.rotateX(Math.PI / 2);
      P(hub, C.metal, p(x, 0.34));
    };
    wheel(-2.15);
    wheel(-1.05);
    const axR = p(-2.15, 0.34), axF = p(-1.05, 0.34), BB = p(-1.65, 0.3);
    const seatT = p(-1.82, 0.8), headT = p(-1.18, 0.8), headB = p(-1.13, 0.64);
    const t = 0.028;
    seg(BB, seatT, t, t, C.bike);
    seg(seatT, headT, t, t, C.bike);
    seg(BB, headB, t, t, C.bike);
    seg(BB, axR, 0.02, 0.02, C.bike);
    seg(seatT, axR, 0.02, 0.02, C.bike);
    seg(headT, headB, 0.035, 0.035, C.bike);
    seg(headB, axF, 0.022, 0.018, C.bike);
    seg(seatT, p(-1.86, 0.92), 0.018, 0.018, C.chrome);
    box(0.26, 0.06, 0.13, C.saddle, p(-1.87, 0.95));
    seg(headT, p(-1.22, 0.95), 0.02, 0.02, C.chrome);
    seg(p(-1.22, 0.95, -0.27), p(-1.22, 0.95, 0.27), 0.018, 0.018, C.chrome, 5);
    seg(p(-1.22, 0.95, -0.3), p(-1.22, 0.95, -0.2), 0.03, 0.03, C.saddle, 5);
    seg(p(-1.22, 0.95, 0.2), p(-1.22, 0.95, 0.3), 0.03, 0.03, C.saddle, 5);
    ball(0.03, C.flagA, p(-1.22, 0.99, 0.15), 6, 4); // bell
    // basket with flowers
    box(0.3, 0.22, 0.34, C.wicker, p(-0.97, 0.86));
    for (const dy of [-0.06, 0.03]) box(0.32, 0.025, 0.36, "#a97b43", p(-0.97, 0.86 + dy));
    for (let k = 0; k < 4; k++) {
      ball(0.05, k % 2 ? C.pink : C.white, p(-1.03 + (k % 2) * 0.12, 1.0, -0.1 + k * 0.07), 6, 4);
    }
    ball(0.07, C.leafC, p(-0.97, 0.97), 6, 4);
    // drivetrain
    P(new THREE.TorusGeometry(0.09, 0.015, 4, 10), C.chrome, [BB[0], BB[1], BB[2] + 0.04]);
    seg([BB[0], BB[1], BB[2] + 0.06], [BB[0] + 0.1, BB[1] - 0.12, BB[2] + 0.06], 0.012, 0.012, C.chrome, 4);
    box(0.1, 0.02, 0.08, C.metal, [BB[0] + 0.1, BB[1] - 0.12, BB[2] + 0.11]);
    seg([BB[0], BB[1], BB[2] - 0.06], [BB[0] - 0.1, BB[1] + 0.12, BB[2] - 0.06], 0.012, 0.012, C.chrome, 4);
    box(0.1, 0.02, 0.08, C.metal, [BB[0] - 0.1, BB[1] + 0.12, BB[2] - 0.11]);
    seg([BB[0], BB[1] + 0.05, BB[2] + 0.04], [axR[0], axR[1] + 0.03, axR[2] + 0.04], 0.008, 0.008, C.metal, 3);
    // fender over rear wheel
    const fender = new THREE.TorusGeometry(0.37, 0.025, 3, 10, Math.PI * 0.55);
    fender.rotateZ(Math.PI * 0.35);
    P(fender, C.bike, axR);
  }

  return b.root;
}
```