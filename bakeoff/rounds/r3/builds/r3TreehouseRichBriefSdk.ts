import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Oak Treehouse Diorama",
  description:
    "A grassy round base with an old oak, a red-roofed cabin with a round window, rope ladder, swing, pennant, lantern, mushrooms and a bicycle.",
};

export default function build() {
  const b = createBuilder({ name: "treehouse" });
  const root = b.joint("base", { at: [0, 0, 0] });

  const G = 0.2; // ground level on top of the grass
  const tmpM = new THREE.Matrix4();

  // deterministic random
  let seed = 1234567;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  function add(
    geo: THREE.BufferGeometry,
    color: string,
    p: number[] = [0, 0, 0],
    r: number[] = [0, 0, 0],
    s: number[] = [1, 1, 1],
  ) {
    tmpM.compose(
      new THREE.Vector3(p[0], p[1], p[2]),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0], r[1], r[2])),
      new THREE.Vector3(s[0], s[1], s[2]),
    );
    geo.applyMatrix4(tmpM);
    return b.part(geo, color, { bone: root });
  }
  const box = (w: number, h: number, d: number, c: string, p: number[], r: number[] = [0, 0, 0]) =>
    add(new THREE.BoxGeometry(w, h, d), c, p, r);

  // cylinder from a to c; r1 radius at a, r2 radius at c
  function rod(a: number[], c: number[], r1: number, r2: number, color: string, seg = 6) {
    const va = new THREE.Vector3(...a);
    const vc = new THREE.Vector3(...c);
    const d = vc.clone().sub(va);
    const len = d.length();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    const geo = new THREE.CylinderGeometry(r2, r1, len, seg);
    const m = va.clone().add(vc).multiplyScalar(0.5);
    tmpM.compose(m, q, new THREE.Vector3(1, 1, 1));
    geo.applyMatrix4(tmpM);
    return b.part(geo, color, { bone: root });
  }

  // ---------- base ----------
  add(new THREE.CylinderGeometry(2.6, 2.3, 0.14, 14), "#6b4a2f", [0, 0.07, 0]);
  add(new THREE.CylinderGeometry(2.65, 2.62, 0.07, 14), "#4f9a3c", [0, 0.14 + 0.035, 0]);
  // rim of earth stones
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.2;
    add(new THREE.IcosahedronGeometry(0.12, 0), i % 2 ? "#8a8a84" : "#74746f", [Math.cos(a) * 2.45, 0.1, Math.sin(a) * 2.45], [a, a * 2, 0], [1.2, 0.8, 1]);
  }

  // grass tufts
  for (let i = 0; i < 34; i++) {
    const a = rnd() * Math.PI * 2;
    const rr = 0.9 + rnd() * 1.6;
    const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    const col = rnd() > 0.5 ? "#3f8a32" : "#66b349";
    for (let k = 0; k < 3; k++) {
      add(new THREE.ConeGeometry(0.04, 0.16 + rnd() * 0.1, 3), col,
        [x + (k - 1) * 0.04, G + 0.08, z], [(k - 1) * 0.35, 0, (rnd() - 0.5) * 0.4]);
    }
  }
  // flowers
  const flowerCols = ["#ffffff", "#f48fb1", "#ffd54a", "#b39ddb"];
  for (let i = 0; i < 12; i++) {
    const a = rnd() * Math.PI * 2;
    const rr = 1.3 + rnd() * 1.1;
    const x = Math.cos(a) * rr, z = Math.sin(a) * rr;
    add(new THREE.CylinderGeometry(0.01, 0.01, 0.16, 3), "#3f8a32", [x, G + 0.08, z]);
    add(new THREE.IcosahedronGeometry(0.045, 0), flowerCols[i % 4], [x, G + 0.18, z]);
  }
  // stepping stones
  [[0.9, 2.2], [0.75, 1.85], [0.95, 1.55]].forEach(([x, z], i) =>
    add(new THREE.CylinderGeometry(0.2, 0.22, 0.04, 6), "#9a9a92", [x - 0.2 * i * 0, G + 0.02, z + 0.5], [0, i, 0]));

  // ---------- tree ----------
  const bark = "#7a5230";
  const barkD = "#5f3f24";
  add(new THREE.CylinderGeometry(0.38, 0.62, 3.6, 9), bark, [0, G + 1.8, 0]);
  // bark ridges
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const y = G + 0.8 + (i % 3) * 0.9;
    const rad = 0.52 - (y - G) * 0.04;
    add(new THREE.BoxGeometry(0.07, 0.8, 0.07), barkD, [Math.cos(a) * rad, y, Math.sin(a) * rad], [0, -a, 0]);
  }
  // roots
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const dx = Math.cos(a), dz = Math.sin(a);
    rod([dx * 1.1, G, dz * 1.1], [dx * 0.35, G + 0.6, dz * 0.35], 0.06, 0.2, bark, 5);
  }
  // main limbs
  rod([0, 3.2, 0], [-1.4, 4.3, -0.2], 0.28, 0.13, bark, 6);
  rod([0, 3.4, 0], [0.7, 4.5, -0.6], 0.26, 0.12, bark, 6);
  rod([0, 3.3, 0], [1.6, 4.3, -0.5], 0.22, 0.1, bark, 6);
  rod([0, 3.5, 0], [-0.3, 4.6, 0.7], 0.2, 0.1, bark, 6);
  // swing branch
  rod([0, 2.9, 0.05], [-1.9, 3.3, 0.25], 0.2, 0.09, bark, 6);

  // crown
  const greens = ["#3f8f3a", "#2f7a34", "#5aa845"];
  const blobs = [
    [0, 5.0, 0, 1.3], [-1.3, 4.6, 0, 1.1], [1.2, 4.8, -0.9, 1.0], [-0.4, 4.6, -1.1, 1.1],
    [-0.5, 4.5, 0.9, 0.85], [-1.9, 4.2, 0.4, 0.75], [1.9, 4.6, -0.7, 0.8], [0.8, 5.5, -0.2, 0.9],
    [-1.0, 5.4, -0.3, 0.9], [0.9, 4.6, -1.5, 0.8], [-1.6, 4.9, -0.9, 0.8],
  ];
  blobs.forEach((bl, i) => {
    add(new THREE.IcosahedronGeometry(bl[3], 1), greens[i % 3], [bl[0], bl[1], bl[2]],
      [i, i * 0.7, 0], [1, 0.82, 1]);
  });
  // small leaf clumps
  for (let i = 0; i < 10; i++) {
    const bl = blobs[i % blobs.length];
    const a = rnd() * Math.PI * 2;
    add(new THREE.IcosahedronGeometry(0.28, 0), greens[(i + 1) % 3],
      [bl[0] + Math.cos(a) * bl[3] * 0.9, bl[1] - 0.3 + rnd() * 0.6, bl[2] - Math.abs(Math.sin(a)) * bl[3] * 0.8]);
  }

  // ---------- cabin ----------
  const wood = "#c08a52";
  const woodD = "#8a5a32";
  const cx = 1.15;
  // platform + struts
  box(1.7, 0.1, 1.5, woodD, [cx + 0.05, 2.25, 0.15]);
  rod([0.3, 1.8, 0.1], [cx + 0.6, 2.2, 0.7], 0.05, 0.05, woodD);
  rod([0.3, 1.8, 0.1], [cx + 0.6, 2.2, -0.4], 0.05, 0.05, woodD);
  rod([0.3, 1.6, 0.5], [1.55, 2.2, 0.75], 0.04, 0.04, woodD);
  // walls
  box(1.2, 0.9, 1.0, wood, [cx, 2.8, 0]);
  for (let i = 0; i < 4; i++) {
    const y = 2.55 + i * 0.2;
    box(1.2, 0.02, 1.02, woodD, [cx, y, 0]);
    box(1.22, 0.02, 1.0, woodD, [cx, y, 0]);
  }
  // corner posts
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    box(0.07, 0.95, 0.07, woodD, [cx + sx * 0.6, 2.8, sz * 0.5]);
  // gables
  const tri = new THREE.Shape();
  tri.moveTo(-0.6, 0); tri.lineTo(0.6, 0); tri.lineTo(0, 0.65); tri.closePath();
  const gab = new THREE.ExtrudeGeometry(tri, { depth: 1.0, bevelEnabled: false });
  gab.translate(0, 0, -0.5);
  add(gab, "#b07a46", [cx, 3.25, 0]);
  // roof slabs
  const ang = Math.atan2(0.65, 0.75);
  const slope = Math.hypot(0.75, 0.65);
  const roofLen = slope + 0.18;
  const reds = ["#b3302a", "#cf4137"];
  for (const side of [-1, 1]) {
    const mx = cx + side * 0.4, my = 3.25 + 0.34;
    const rz = -side * ang;
    const nx = -side * Math.sin(ang) * -1; // normal x
    add(new THREE.BoxGeometry(roofLen, 0.07, 1.3), "#9e2a24", [mx + side * 0.0 + 0, my + 0.04, 0], [0, 0, side === -1 ? ang : -ang]);
    // shingle rows
    for (let r = 0; r < 6; r++) {
      const s = -slope / 2 + 0.12 + r * 0.17;
      // direction up slope from eave: for left side (side -1) eave is at -x going +x/up
      const ux = -side * -Math.cos(ang) * -1 * -1;
      const dirx = -side * Math.cos(ang) * -1; // placeholder, recomputed below
      void ux; void dirx;
      const along = new THREE.Vector3(side === -1 ? Math.cos(ang) : -Math.cos(ang), Math.sin(ang), 0);
      const nrm = new THREE.Vector3(side === -1 ? -Math.sin(ang) : Math.sin(ang), Math.cos(ang), 0);
      // along points from eave to ridge
      const p = new THREE.Vector3(mx, my + 0.04, 0).add(along.clone().multiplyScalar(-s)).add(nrm.clone().multiplyScalar(0.05));
      add(new THREE.BoxGeometry(0.15, 0.03, 1.32), reds[r % 2], [p.x, p.y, p.z], [0, 0, side === -1 ? ang : -ang]);
    }
  }
  // ridge cap
  box(0.1, 0.08, 1.34, "#7d211d", [cx, 3.93, 0]);
  // chimney
  box(0.18, 0.4, 0.18, "#8c6a55", [cx - 0.3, 3.85, -0.25]);
  box(0.22, 0.05, 0.22, "#6e5242", [cx - 0.3, 4.07, -0.25]);

  // door
  box(0.4, 0.66, 0.03, "#5a361d", [1.45, 2.68, 0.51]);
  box(0.48, 0.04, 0.04, "#3f2512", [1.45, 3.03, 0.51]);
  box(0.04, 0.7, 0.04, "#3f2512", [1.2, 2.68, 0.51]);
  box(0.04, 0.7, 0.04, "#3f2512", [1.7, 2.68, 0.51]);
  add(new THREE.IcosahedronGeometry(0.03, 0), "#e6b422", [1.6, 2.65, 0.54]);
  // round window
  add(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 12), "#9fd8ee", [0.85, 2.85, 0.51], [Math.PI / 2, 0, 0]);
  add(new THREE.TorusGeometry(0.21, 0.035, 4, 12), "#4e2f19", [0.85, 2.85, 0.52]);
  box(0.4, 0.025, 0.03, "#4e2f19", [0.85, 2.85, 0.53]);
  box(0.025, 0.4, 0.03, "#4e2f19", [0.85, 2.85, 0.53]);
  // side window on +x wall
  add(new THREE.CylinderGeometry(0.17, 0.17, 0.04, 12), "#9fd8ee", [cx + 0.6, 2.85, 0], [0, 0, Math.PI / 2]);
  add(new THREE.TorusGeometry(0.18, 0.03, 4, 12), "#4e2f19", [cx + 0.61, 2.85, 0], [0, Math.PI / 2, 0]);
  // flower box under front window
  box(0.46, 0.1, 0.12, "#6b4528", [0.85, 2.58, 0.58]);
  for (let i = 0; i < 4; i++)
    add(new THREE.IcosahedronGeometry(0.05, 0), flowerCols[(i + 1) % 4], [0.7 + i * 0.1, 2.67, 0.58]);

  // porch rail
  for (let i = 0; i < 6; i++) box(0.04, 0.3, 0.04, woodD, [0.45 + i * 0.26, 2.45, 0.85]);
  box(1.4, 0.05, 0.05, woodD, [1.15, 2.62, 0.85]);

  // lantern by the door
  rod([1.82, 3.05, 0.5], [1.82, 3.05, 0.7], 0.02, 0.02, "#2b2b2b", 4);
  rod([1.82, 3.05, 0.7], [1.82, 2.97, 0.7], 0.01, 0.01, "#2b2b2b", 3);
  box(0.12, 0.16, 0.12, "#ffcf5a", [1.82, 2.87, 0.7]);
  add(new THREE.BoxGeometry(0.15, 0.03, 0.15), "#2b2b2b", [1.82, 2.78, 0.7]);
  add(new THREE.BoxGeometry(0.15, 0.03, 0.15), "#2b2b2b", [1.82, 2.96, 0.7]);
  add(new THREE.ConeGeometry(0.11, 0.1, 4), "#2b2b2b", [1.82, 3.02, 0.7], [0, Math.PI / 4, 0]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    box(0.012, 0.16, 0.012, "#2b2b2b", [1.82 + sx * 0.06, 2.87, 0.7 + sz * 0.06]);

  // pennant
  rod([cx, 3.9, 0.3], [cx, 4.6, 0.3], 0.02, 0.02, "#e8e0cf", 5);
  add(new THREE.IcosahedronGeometry(0.04, 0), "#e6b422", [cx, 4.63, 0.3]);
  const fl = new THREE.Shape();
  fl.moveTo(0, 0); fl.lineTo(0, -0.24); fl.lineTo(0.55, -0.12); fl.closePath();
  const flag = new THREE.ExtrudeGeometry(fl, { depth: 0.02, bevelEnabled: false });
  add(flag, "#f2c230", [cx, 4.56, 0.29]);
  const fl2 = new THREE.Shape();
  fl2.moveTo(0, -0.05); fl2.lineTo(0, -0.19); fl2.lineTo(0.25, -0.12); fl2.closePath();
  add(new THREE.ExtrudeGeometry(fl2, { depth: 0.03, bevelEnabled: false }), "#d6452f", [cx, 4.56, 0.285]);

  // ---------- rope ladder ----------
  const lx = [1.2, 1.6];
  const topY = 2.2, botY = G + 0.12, lz = 0.9;
  for (const x of lx) rod([x, botY, lz], [x, topY, lz], 0.02, 0.02, "#d9c08c", 4);
  for (let y = botY + 0.1; y < topY - 0.05; y += 0.26)
    rod([lx[0], y, lz], [lx[1], y, lz], 0.03, 0.03, "#8a5a32", 5);

  // ---------- swing ----------
  const sy = 0.95;
  for (const z of [-0.05, 0.55]) rod([-1.5, 3.14, z], [-1.5, sy, z], 0.02, 0.02, "#d9c08c", 4);
  box(0.24, 0.05, 0.8, "#a2703f", [-1.5, sy - 0.03, 0.25]);
  box(0.26, 0.015, 0.82, woodD, [-1.5, sy - 0.06, 0.25]);

  // ---------- mushrooms ----------
  function mush(x: number, z: number, s: number, cap: string, dots: string) {
    add(new THREE.CylinderGeometry(0.05 * s, 0.07 * s, 0.22 * s, 6), "#f1e6cf", [x, G + 0.11 * s, z]);
    add(new THREE.SphereGeometry(0.17 * s, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), cap, [x, G + 0.2 * s, z], [0, 0, 0], [1, 0.75, 1]);
    add(new THREE.CylinderGeometry(0.15 * s, 0.15 * s, 0.01, 8), "#e8d9b8", [x, G + 0.2 * s, z]);
    for (let i = 0; i < 5; i++) {
      const a = i * 2.4;
      const pol = 0.35 + (i % 2) * 0.4;
      const rr = 0.17 * s * 1.01;
      add(new THREE.IcosahedronGeometry(0.025 * s, 0), dots,
        [x + Math.sin(pol) * Math.cos(a) * rr, G + 0.2 * s + Math.cos(pol) * rr * 0.75, z + Math.sin(pol) * Math.sin(a) * rr]);
    }
  }
  mush(-0.75, 0.6, 1.5, "#d63a2e", "#ffffff");
  mush(-0.95, 0.9, 1.0, "#d63a2e", "#ffffff");
  mush(-0.55, 0.95, 0.7, "#e8913a", "#fff3d6");
  mush(1.5, -0.65, 1.2, "#c0457a", "#ffffff");
  mush(1.75, -0.45, 0.7, "#d63a2e", "#ffffff");

  // ---------- bicycle ----------
  const bx = -0.2, bz = 1.55, wr = 0.3;
  const bc = "#2a9d8f";
  const P = (x: number, y: number, z = bz) => [bx + x, G + y, z];
  for (const wx of [-0.4, 0.4]) {
    add(new THREE.TorusGeometry(wr - 0.02, 0.025, 5, 16), "#262626", P(wx, wr));
    add(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 6), "#bdbdbd", P(wx, wr), [Math.PI / 2, 0, 0]);
    for (let i = 0; i < 3; i++)
      add(new THREE.BoxGeometry(0.5, 0.008, 0.008), "#cfcfcf", P(wx, wr), [0, 0, (i * Math.PI) / 3]);
  }
  const R = P(-0.4, wr), F = P(0.4, wr), Bk = P(-0.02, 0.22), S = P(-0.14, 0.68), H = P(0.3, 0.7);
  rod(R, Bk, 0.018, 0.018, bc);
  rod(R, S, 0.018, 0.018, bc);
  rod(Bk, S, 0.018, 0.018, bc);
  rod(S, H, 0.018, 0.018, bc);
  rod(Bk, H, 0.02, 0.02, bc);
  rod(H, F, 0.016, 0.016, "#bdbdbd");
  rod(H, P(0.27, 0.8), 0.015, 0.015, "#bdbdbd");
  rod(P(0.27, 0.8, bz - 0.17), P(0.27, 0.8, bz + 0.17), 0.015, 0.015, "#262626");
  add(new THREE.BoxGeometry(0.2, 0.05, 0.09), "#3a2a20", P(-0.17, 0.72));
  rod(Bk, P(-0.02, 0.22, bz + 0.12), 0.012, 0.012, "#bdbdbd");
  add(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 8), "#bdbdbd", P(-0.02, 0.22, bz + 0.07), [Math.PI / 2, 0, 0]);
  add(new THREE.BoxGeometry(0.1, 0.02, 0.06), "#262626", P(-0.02, 0.1, bz + 0.14));
  // basket
  box(0.2, 0.14, 0.26, "#b98a4e", P(0.43, 0.7));
  box(0.22, 0.02, 0.28, "#8a5a32", P(0.43, 0.78));
  // kickstand lean
  add(new THREE.IcosahedronGeometry(0.05, 0), "#e8e0cf", P(0.43, 0.82));

  // little barrel by trunk
  add(new THREE.CylinderGeometry(0.16, 0.14, 0.3, 8), "#8a5a32", [1.7, G + 0.15, 0.1]);
  add(new THREE.CylinderGeometry(0.165, 0.165, 0.025, 8), "#3a3a3a", [1.7, G + 0.08, 0.1]);
  add(new THREE.CylinderGeometry(0.15, 0.15, 0.025, 8), "#3a3a3a", [1.7, G + 0.23, 0.1]);

  return b.root;
}
