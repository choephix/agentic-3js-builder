import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Pirate Treasure Chest",
  description:
    "Weathered open treasure chest with iron straps, studs, a loose padlock, a carved skull and crossbones, and spilled gold, pearls, a jewelled goblet and gems.",
};

function mk(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function build() {
  const b = createBuilder({ name: "treasureChest" });
  const rand = mk(11);

  // ---- skeleton ----
  const D = 0.275; // half depth
  const HY = 0.4; // hinge height
  const R = D; // lid radius
  const OPEN = (105 * Math.PI) / 180;
  const root = b.joint("chest", { at: [0, 0.2, 0] });
  const lid = b.joint("lidHinge", { at: [0, HY, -D], parent: root });

  // ---- palette ----
  const woods = ["#4a2f1c", "#5a3a22", "#432916", "#523521"];
  const seam = "#241409";
  const iron = "#3b3836";
  const rust = "#7d4526";
  const rust2 = "#5e3a28";
  const red = "#6e1220";
  const gold = ["#e3ab20", "#f2c744", "#c8951a", "#d9a21e"];
  const dark = "#1c1410";

  // ---- helpers ----
  const bx = (w: number, h: number, d: number, x: number, y: number, z: number, c: string, bone: any = root) =>
    b.part(new THREE.BoxGeometry(w, h, d).translate(x, y, z), c, { bone });
  const sp = (r: number, x: number, y: number, z: number, c: string, bone: any = root, sx = 1, sy = 1, sz = 1) =>
    b.part(new THREE.SphereGeometry(r, 7, 5).scale(sx, sy, sz).translate(x, y, z), c, { bone });

  function arch(ro: number, ri: number, len: number) {
    const s = new THREE.Shape();
    s.moveTo(ro, 0);
    s.absarc(0, 0, ro, 0, Math.PI, false);
    s.lineTo(-ri, 0);
    s.absarc(0, 0, ri, Math.PI, 0, true);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: false, curveSegments: 10 });
    g.translate(0, 0, -len / 2);
    g.rotateY(-Math.PI / 2);
    g.translate(0, 0, R);
    return g;
  }
  const L = (g: THREE.BufferGeometry) => {
    g.rotateX(-OPEN);
    g.translate(0, HY, -D);
    return g;
  };
  const lp = (g: THREE.BufferGeometry, c: string) => b.part(L(g), c, { bone: lid });
  const lidPt = (x: number, deg: number, rad: number): [number, number, number] => {
    const a = (deg * Math.PI) / 180;
    return [x, rad * Math.sin(a), R + rad * Math.cos(a)];
  };

  // ---- body ----
  bx(0.9, 0.03, 0.55, 0, 0.015, 0, woods[2]);
  for (let i = 0; i < 3; i++) {
    const y = 0.067 + i * 0.133;
    bx(0.9, 0.131, 0.03, 0, y, D - 0.015, woods[(i + 1) % 4]);
    bx(0.9, 0.131, 0.03, 0, y, -D + 0.015, woods[(i + 2) % 4]);
    bx(0.03, 0.131, 0.49, 0.435, y, 0, woods[(i + 3) % 4]);
    bx(0.03, 0.131, 0.49, -0.435, y, 0, woods[i % 4]);
  }
  // plank seams on front
  for (const y of [0.133, 0.266]) bx(0.9, 0.006, 0.006, 0, y, D + 0.002, seam);
  // red lining
  bx(0.84, 0.02, 0.49, 0, 0.1, 0, red);
  bx(0.84, 0.3, 0.012, 0, 0.25, D - 0.036, red);
  bx(0.84, 0.3, 0.012, 0, 0.25, -D + 0.036, red);
  bx(0.012, 0.3, 0.49, 0.405, 0.25, 0, red);
  bx(0.012, 0.3, 0.49, -0.405, 0.25, 0, red);
  // feet
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bx(0.07, 0.04, 0.07, sx * 0.41, 0.02, sz * 0.24, woods[2]);

  // iron: corners, bands, straps
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      bx(0.06, 0.4, 0.06, sx * 0.435, 0.2, sz * 0.265, iron);
      for (const y of [0.05, 0.2, 0.35]) sp(0.011, sx * 0.435, y, sz * 0.298, rust, root);
    }
  for (const y of [0.045, 0.36]) {
    bx(0.9, 0.045, 0.012, 0, y, D + 0.006, rust2);
    bx(0.9, 0.045, 0.012, 0, y, -D - 0.006, rust2);
    bx(0.012, 0.045, 0.55, 0.45, y, 0, rust2);
    bx(0.012, 0.045, 0.55, -0.45, y, 0, rust2);
  }
  for (const x of [-0.28, 0.28]) {
    bx(0.06, 0.4, 0.012, x, 0.2, D + 0.006, iron);
    bx(0.06, 0.4, 0.012, x, 0.2, -D - 0.006, iron);
    for (let i = 0; i < 5; i++) sp(0.011, x, 0.07 + i * 0.065, D + 0.015, i % 2 ? rust : rust2, root);
  }

  // ---- lid ----
  const T = 0.035;
  lp(arch(R, R - T, 0.9), woods[0]);
  lp(arch(R - T + 0.002, R - T - 0.012, 0.84), red);
  for (const x of [-0.28, 0.28]) {
    lp(arch(R + 0.012, R - 0.005, 0.06).translate(x, 0, 0), iron);
    for (const d of [20, 50, 90, 130, 160]) {
      const [px, py, pz] = lidPt(x, d, R + 0.016);
      lp(new THREE.SphereGeometry(0.011, 6, 4).translate(px, py, pz), rust);
    }
  }
  for (const x of [-0.44, 0.44]) lp(arch(R + 0.008, R - 0.04, 0.03).translate(x * 1.0, 0, 0), rust2);
  for (const d of [30, 60, 90, 120, 150]) {
    const a = (d * Math.PI) / 180;
    const [px, py, pz] = lidPt(0, d, R + 0.002);
    lp(new THREE.BoxGeometry(0.9, 0.004, 0.012).rotateX(Math.PI / 2 - a).translate(px, py, pz), seam);
  }
  for (const x of [-0.2, 0.2]) {
    lp(new THREE.CylinderGeometry(0.018, 0.018, 0.1, 6).rotateZ(Math.PI / 2).translate(x, 0.0, -0.005), iron);
  }
  lp(new THREE.BoxGeometry(0.07, 0.07, 0.022).translate(0.1, 0.0, 2 * R - 0.005), iron);

  // ---- hasp + padlock ----
  bx(0.06, 0.08, 0.008, 0.1, 0.36, D + 0.004, iron);
  b.part(new THREE.TorusGeometry(0.014, 0.004, 4, 8).translate(0.1, 0.335, D + 0.014), iron, { bone: root });
  const lockT = (g: THREE.BufferGeometry, lx: number, ly: number, lz: number) => {
    g.translate(lx, ly, lz);
    g.rotateZ(0.14);
    g.rotateX(-0.12);
    g.translate(0.1, 0.34, D + 0.03);
    return g;
  };
  b.part(lockT(new THREE.BoxGeometry(0.075, 0.07, 0.032), 0, -0.065, 0), "#a67c2e", { bone: root });
  b.part(lockT(new THREE.BoxGeometry(0.083, 0.012, 0.036), 0, -0.098, 0), "#7a5a1e", { bone: root });
  b.part(lockT(new THREE.TorusGeometry(0.022, 0.006, 5, 9, Math.PI), 0, -0.03, 0), "#55504c", { bone: root });
  b.part(lockT(new THREE.BoxGeometry(0.01, 0.022, 0.006), 0, -0.065, 0.018), dark, { bone: root });

  // ---- skull and crossbones ----
  const sx0 = -0.15, sy0 = 0.2, sz0 = D;
  bx(0.17, 0.17, 0.004, sx0, sy0, sz0 + 0.002, "#2a1a10");
  for (const s of [-1, 1]) {
    const g = new THREE.BoxGeometry(0.15, 0.016, 0.008).rotateZ(s * 0.62).translate(sx0, sy0 - 0.005, sz0 + 0.008);
    b.part(g, "#bfae86", { bone: root });
    for (const e of [-1, 1]) {
      const px = Math.cos(s * 0.62) * 0.075 * e, py = Math.sin(s * 0.62) * 0.075 * e;
      sp(0.012, sx0 + px, sy0 - 0.005 + py, sz0 + 0.008, "#bfae86", root);
    }
  }
  sp(0.04, sx0, sy0 + 0.012, sz0 + 0.016, "#d8c9a3", root, 1, 0.92, 0.45);
  bx(0.046, 0.026, 0.016, sx0, sy0 - 0.03, sz0 + 0.014, "#d8c9a3");
  for (const s of [-1, 1]) sp(0.011, sx0 + s * 0.017, sy0 + 0.012, sz0 + 0.027, dark, root, 1, 1.1, 0.5);
  bx(0.008, 0.012, 0.004, sx0, sy0 - 0.008, sz0 + 0.03, dark);
  for (const i of [-1, 0, 1]) bx(0.004, 0.014, 0.003, sx0 + i * 0.011, sy0 - 0.032, sz0 + 0.023, dark);

  // ---- treasure mound ----
  b.part(new THREE.SphereGeometry(0.4, 12, 6).scale(1.0, 0.4, 0.6).translate(0, 0.32, 0), gold[2], { bone: root });

  const coinGeo = () => new THREE.CylinderGeometry(0.032, 0.032, 0.007, 10);
  const coin = (x: number, y: number, z: number, rx: number, ry: number, rz: number) => {
    const g = coinGeo();
    g.rotateX(rx);
    g.rotateZ(rz);
    g.rotateY(ry);
    g.translate(x, y, z);
    b.part(g, gold[Math.floor(rand() * gold.length)], { bone: root });
  };
  for (let i = 0; i < 70; i++) {
    const a = rand() * Math.PI * 2, rr = Math.sqrt(rand()) * 0.95;
    const x = Math.cos(a) * 0.38 * rr, z = Math.sin(a) * 0.22 * rr;
    const h = Math.sqrt(Math.max(0, 1 - (x / 0.4) ** 2 - (z / 0.24) ** 2));
    coin(x, 0.32 + 0.16 * h + 0.005, z, (rand() - 0.5) * 1.0, rand() * 6, (rand() - 0.5) * 1.0);
  }
  // spill on floor
  for (let i = 0; i < 38; i++) {
    const x = -0.75 + rand() * 0.7, z = 0.34 + rand() * 0.4 - Math.abs(x + 0.4) * 0.3;
    coin(x, 0.004 + (rand() < 0.2 ? 0.007 : 0), z, (rand() - 0.5) * 0.12, rand() * 6, (rand() - 0.5) * 0.12);
  }
  for (let i = 0; i < 8; i++) coin(0.1 + rand() * 0.2, 0.004, 0.4 + rand() * 0.25, 0, rand() * 6, 0);
  // stack
  for (let i = 0; i < 7; i++) coin(-0.58, 0.004 + i * 0.0072, 0.52, 0.02 * i, i * 0.7, 0.015 * i);
  // coins leaning on the front
  for (let i = 0; i < 5; i++) coin(-0.35 + i * 0.09 - (i > 1 ? 0.02 : 0), 0.03, 0.305 + (i % 2) * 0.02, -1.3, rand() * 0.4, 0);
  // coins over the rim
  for (let i = 0; i < 3; i++) coin(-0.34 + i * 0.1, 0.41, 0.25, -0.5, rand(), 0.1);

  // ---- gems ----
  const gem = (c: string, x: number, y: number, z: number, r = 0.022, geo?: THREE.BufferGeometry) => {
    const g = geo ?? new THREE.IcosahedronGeometry(r, 0);
    g.rotateY(rand() * 3);
    g.translate(x, y, z);
    b.part(g, c, { bone: root });
  };
  gem("#c4122f", -0.2, 0.47, 0.06, 0.026);
  gem("#1fa55a", 0.0, 0.485, 0.1, 0.024);
  gem("#c4122f", 0.3, 0.4, 0.04, 0.02);
  gem("#1fa55a", -0.32, 0.4, -0.08, 0.022);
  gem("#c4122f", -0.3, 0.02, 0.5, 0.022);
  gem("#1fa55a", -0.45, 0.02, 0.38, 0.02);
  gem("#c4122f", 0.12, 0.02, 0.55, 0.02, new THREE.OctahedronGeometry(0.024));
  gem("#1fa55a", -0.12, 0.02, 0.62, 0.02, new THREE.OctahedronGeometry(0.02));

  // ---- goblet ----
  const prof = [
    [0.0, 0.0], [0.05, 0.0], [0.05, 0.012], [0.016, 0.028], [0.012, 0.07], [0.03, 0.088],
    [0.052, 0.125], [0.058, 0.175], [0.05, 0.2], [0.043, 0.2], [0.043, 0.14], [0.0, 0.125],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const gT = (g: THREE.BufferGeometry) => {
    g.rotateZ(-0.28);
    g.rotateY(0.5);
    g.translate(0.17, 0.455, -0.03);
    return g;
  };
  b.part(gT(new THREE.LatheGeometry(prof, 10)), gold[0], { bone: root });
  b.part(gT(new THREE.SphereGeometry(0.02, 6, 4).translate(0, 0.05, 0)), gold[1], { bone: root });
  b.part(gT(new THREE.TorusGeometry(0.056, 0.006, 4, 10).rotateX(Math.PI / 2).translate(0, 0.198, 0)), gold[1], { bone: root });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    b.part(
      gT(new THREE.OctahedronGeometry(0.0125).translate(Math.cos(a) * 0.0585, 0.155, Math.sin(a) * 0.0585)),
      i % 2 ? "#1fa55a" : "#c4122f",
      { bone: root }
    );
  }

  // ---- pearl necklace ----
  const pts = [
    [0.34, 0.34, -0.1], [0.36, 0.385, 0.08], [0.37, 0.418, 0.24], [0.38, 0.418, 0.285],
    [0.385, 0.3, 0.31], [0.39, 0.15, 0.318], [0.4, 0.032, 0.34], [0.5, 0.018, 0.46],
    [0.58, 0.018, 0.58], [0.46, 0.018, 0.69], [0.3, 0.018, 0.62],
  ].map((p) => new THREE.Vector3(p[0], p[1], p[2]));
  const curve = new THREE.CatmullRomCurve3(pts);
  const sp30 = curve.getSpacedPoints(34);
  sp30.forEach((p, i) => sp(0.017, p.x, Math.max(p.y, 0.017), p.z, i % 2 ? "#f2ede4" : "#e6dfd2", root));
  const e = sp30[sp30.length - 1];
  bx(0.03, 0.012, 0.016, e.x, 0.012, e.z, gold[0]);

  return b.root;
}
