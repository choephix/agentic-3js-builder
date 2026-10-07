import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Dutch city bicycle",
  description:
    "Vintage mint-green Dutch city bike with whitewall tyres, swept-back bars, a bell, a sprung leather saddle, chrome mudguards, a chain guard and a wicker basket of sunflowers and a baguette.",
};

const MINT = "#9bd6bd";
const CREAM = "#f3ead2";
const BROWN = "#7a4a2a";
const CHROME = "#cfd4d8";
const BLACK = "#222426";
const WICKER = "#b98a4e";
const WICKER2 = "#9d7340";
const YELLOW = "#f2c224";
const YELLOW2 = "#e8a317";
const SEED = "#4a2c14";
const GREEN = "#4a7d2e";
const BREAD = "#d9a25a";
const SCORE = "#f0c27a";
const RED = "#c8312b";
const SILVER = "#e6e9ec";

export default function build() {
  const b = createBuilder({ name: "dutchBike" });

  // ---------- skeleton ----------
  const frameJ = b.joint("frame", { at: [0, 0.5, 0] });
  const rearWheel = b.joint("rearWheel", { at: [0, 0.36, -0.55], parent: frameJ });
  const steer = b.joint("steer", { at: [0.42, 0.9, 0], parent: frameJ });
  const frontWheel = b.joint("frontWheel", { at: [0, 0.36, 0.55], parent: steer });
  const crank = b.joint("crank", { at: [0, 0.3, 0], parent: frameJ });
  const pedalR = b.joint("pedalR", { at: [-0.15, 0.3, 0.17], parent: crank });
  const pedalL = b.joint("pedalL", { at: [0.15, 0.3, -0.17], parent: crank });

  // ---------- helpers ----------
  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
  const Y = new THREE.Vector3(0, 1, 0);
  const Z = new THREE.Vector3(0, 0, 1);
  const add = (g: THREE.BufferGeometry, color: string, bone: any) =>
    b.part(g, color, { bone });

  const tube = (a: number[], c: number[], r: number, color: string, bone: any, seg = 8) => {
    const d = V(c).sub(V(a));
    const len = d.length();
    const g = new THREE.CylinderGeometry(r, r, len, seg);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(Y, d.normalize()));
    g.translate((a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2);
    return add(g, color, bone);
  };
  const obox = (a: number[], c: number[], w: number, h: number, color: string, bone: any) => {
    const d = V(c).sub(V(a));
    const g = new THREE.BoxGeometry(w, h, d.length());
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(Z, d.normalize()));
    g.translate((a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2);
    return add(g, color, bone);
  };
  const orient = (g: THREE.BufferGeometry, pos: number[], dir: THREE.Vector3) => {
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(Y, dir.clone().normalize()));
    g.translate(pos[0], pos[1], pos[2]);
    return g;
  };
  const ball = (p: number[], r: number, color: string, bone: any, sx = 1, sy = 1, sz = 1, seg = 8) => {
    const g = new THREE.SphereGeometry(r, seg, Math.max(4, seg - 2));
    g.scale(sx, sy, sz);
    g.translate(p[0], p[1], p[2]);
    return add(g, color, bone);
  };

  // ---------- wheels ----------
  const wheel = (bone: any, cz: number) => {
    const cy = 0.36;
    add(new THREE.TorusGeometry(0.33, 0.03, 6, 28).rotateY(Math.PI / 2).translate(0, cy, cz), BLACK, bone);
    for (const s of [1, -1]) {
      add(
        new THREE.RingGeometry(0.318, 0.342, 28).rotateY((s * Math.PI) / 2).translate(s * 0.029, cy, cz),
        CREAM,
        bone
      );
    }
    add(new THREE.TorusGeometry(0.29, 0.008, 5, 28).rotateY(Math.PI / 2).translate(0, cy, cz), CHROME, bone);
    add(new THREE.CylinderGeometry(0.026, 0.026, 0.1, 8).rotateZ(Math.PI / 2).translate(0, cy, cz), CHROME, bone);
    for (const s of [1, -1]) {
      add(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 10).rotateZ(Math.PI / 2).translate(s * 0.045, cy, cz), CHROME, bone);
    }
    const n = 24;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const side = i % 2 ? 1 : -1;
      tube(
        [side * 0.045, cy + Math.sin(a) * 0.035, cz + Math.cos(a) * 0.035],
        [0, cy + Math.sin(a) * 0.29, cz + Math.cos(a) * 0.29],
        0.0018, CHROME, bone, 3
      );
    }
    tube([-0.075, cy, cz], [0.075, cy, cz], 0.008, CHROME, bone, 6);
  };
  wheel(rearWheel, -0.55);
  wheel(frontWheel, 0.55);

  // ---------- mudguards ----------
  const guard = (bone: any, cz: number, startDeg: number, arcDeg: number) => {
    const g = new THREE.TorusGeometry(0.386, 0.01, 6, 20, (arcDeg * Math.PI) / 180);
    g.scale(1, 1, 6);
    g.rotateZ((startDeg * Math.PI) / 180);
    g.rotateY(Math.PI / 2);
    g.translate(0, 0.36, cz);
    add(g, CHROME, bone);
  };
  guard(frameJ, -0.55, 15, 105);
  guard(steer, 0.55, 50, 125);
  add(new THREE.BoxGeometry(0.035, 0.04, 0.02).translate(0, 0.46, -0.935), RED, frameJ);

  // ---------- frame ----------
  const BB = [0, 0.3, 0];
  // swooping step-through tube
  const A = [0.43, 0.84, 0], C = [0.33, 0.33, 0];
  const curve: number[][] = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8, u = 1 - t;
    curve.push([0, u * u * A[1] + 2 * t * u * C[1] + t * t * BB[1], u * u * A[0] + 2 * t * u * C[0] + t * t * BB[0]]);
  }
  for (let i = 0; i < 8; i++) {
    tube(curve[i], curve[i + 1], 0.021, MINT, frameJ, 8);
    ball(curve[i + 1], 0.021, MINT, frameJ, 1, 1, 1, 6);
  }
  tube(BB, [0, 0.96, -0.185], 0.017, MINT, frameJ);
  tube([0, 0.96, -0.185], [0, 1.0, -0.2], 0.014, CHROME, frameJ);
  tube([0, 0.78, 0.42], [0, 0.82, -0.15], 0.012, MINT, frameJ); // slim top brace
  for (const s of [1, -1]) {
    tube([s * 0.045, 0.3, 0], [s * 0.06, 0.36, -0.55], 0.011, MINT, frameJ, 6);
    tube([s * 0.035, 0.84, -0.17], [s * 0.06, 0.36, -0.55], 0.009, MINT, frameJ, 6);
  }
  ball(BB, 0.03, MINT, frameJ);
  tube([-0.05, 0.3, 0], [0.05, 0.3, 0], 0.03, CHROME, frameJ, 8);
  tube([-0.07, 0.36, -0.55], [0.07, 0.36, -0.55], 0.007, CHROME, frameJ, 6);

  // head tube + fork
  tube([0, 0.8, 0.435], [0, 1.0, 0.4], 0.026, MINT, steer, 8);
  tube([0, 0.795, 0.437], [0, 0.82, 0.432], 0.03, CHROME, steer, 8);
  tube([0, 0.985, 0.403], [0, 1.0, 0.4], 0.03, CHROME, steer, 8);
  tube([-0.06, 0.8, 0.435], [0.06, 0.8, 0.435], 0.016, MINT, steer);
  for (const s of [1, -1]) {
    tube([s * 0.058, 0.8, 0.435], [s * 0.058, 0.36, 0.55], 0.012, MINT, steer, 6);
  }
  ball([0, 0.9, 0.455], 0.018, CHROME, steer, 0.5, 1.3, 1);

  // handlebar
  tube([0, 1.0, 0.4], [0, 1.1, 0.385], 0.012, CHROME, steer, 6);
  const bar = [
    [0, 1.1, 0.385],
    [0.12, 1.105, 0.4],
    [0.24, 1.12, 0.39],
    [0.31, 1.14, 0.32],
    [0.34, 1.15, 0.2],
    [0.35, 1.155, 0.1],
  ];
  for (const s of [1, -1]) {
    const pts = bar.map((p) => [s * p[0], p[1], p[2]]);
    for (let i = 0; i < 3; i++) {
      tube(pts[i], pts[i + 1], 0.01, CHROME, steer, 6);
      ball(pts[i + 1], 0.01, CHROME, steer, 1, 1, 1, 5);
    }
    tube(pts[3], pts[5], 0.017, CREAM, steer, 8);
    ball(pts[5], 0.017, CREAM, steer, 1, 1, 1, 6);
    // brake lever
    tube([s * 0.3, 1.125, 0.34], [s * 0.3, 1.1, 0.46], 0.005, CHROME, steer, 4);
    ball([s * 0.3, 1.125, 0.34], 0.012, BLACK, steer);
  }
  // bell
  tube([0.13, 1.113, 0.4], [0.13, 1.125, 0.4], 0.012, BLACK, steer, 6);
  add(new THREE.CylinderGeometry(0.043, 0.043, 0.008, 12).translate(0.13, 1.13, 0.4), SILVER, steer);
  add(new THREE.SphereGeometry(0.04, 12, 5, 0, Math.PI * 2, 0, Math.PI / 2).translate(0.13, 1.134, 0.4), SILVER, steer);
  ball([0.13, 1.178, 0.4], 0.008, CHROME, steer);
  add(new THREE.BoxGeometry(0.012, 0.012, 0.03).translate(0.13, 1.14, 0.355), CHROME, steer);

  // headlamp
  ball([0, 0.95, 0.5], 0.04, CHROME, steer, 1, 1, 0.9);
  add(new THREE.CylinderGeometry(0.028, 0.028, 0.02, 10).rotateX(Math.PI / 2).translate(0, 0.95, 0.535), "#fff3b0", steer);
  tube([0, 0.93, 0.44], [0, 0.945, 0.48], 0.008, CHROME, steer, 5);

  // ---------- saddle ----------
  ball([0, 1.07, -0.26], 0.13, BROWN, frameJ, 1.1, 0.35, 1.0, 10);
  ball([0, 1.07, -0.12], 0.08, BROWN, frameJ, 0.65, 0.4, 1.7, 8);
  ball([0, 1.093, -0.24], 0.06, "#8c5a35", frameJ, 1, 0.3, 1.2, 7);
  for (const s of [1, -1]) {
    // rails
    tube([s * 0.07, 1.0, -0.3], [s * 0.04, 1.0, -0.09], 0.005, CHROME, frameJ, 5);
    // springs
    for (const z of [-0.3]) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 24; i++) {
        const t = i / 24, a = t * Math.PI * 2 * 3.5;
        pts.push(new THREE.Vector3(s * 0.07 + Math.cos(a) * 0.026, 1.0 + t * 0.04, z + Math.sin(a) * 0.026));
      }
      add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.0035, 4), CHROME, frameJ);
    }
  }
  tube([-0.075, 1.0, -0.3], [0.075, 1.0, -0.3], 0.006, CHROME, frameJ, 5);
  tube([0, 1.0, -0.2], [0, 1.0, -0.3], 0.007, CHROME, frameJ, 5);

  // ---------- drivetrain ----------
  add(new THREE.CylinderGeometry(0.115, 0.115, 0.014, 16).rotateZ(Math.PI / 2).translate(-0.1, 0.3, 0), MINT, frameJ);
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.01, 8).rotateZ(Math.PI / 2).translate(-0.11, 0.3, 0), CHROME, frameJ);
  add(new THREE.CylinderGeometry(0.075, 0.075, 0.012, 14).rotateZ(Math.PI / 2).translate(-0.1, 0.36, -0.55), MINT, frameJ);
  obox([-0.1, 0.36, -0.55], [-0.1, 0.34, -0.02], 0.014, 0.15, MINT, frameJ);
  tube([-0.1, 0.43, -0.5], [-0.1, 0.4, -0.02], 0.004, CHROME, frameJ, 4);
  add(new THREE.CylinderGeometry(0.1, 0.1, 0.01, 14).rotateZ(Math.PI / 2).translate(-0.082, 0.3, 0), CHROME, crank);
  tube([-0.14, 0.3, 0], [0.12, 0.3, 0], 0.01, CHROME, crank, 6);
  tube([-0.125, 0.3, 0], [-0.125, 0.3, 0.17], 0.011, CHROME, crank, 6);
  tube([0.12, 0.3, 0], [0.12, 0.3, -0.17], 0.011, CHROME, crank, 6);
  // pedals
  add(new THREE.BoxGeometry(0.075, 0.025, 0.11).translate(-0.17, 0.3, 0.17), BLACK, pedalR);
  add(new THREE.BoxGeometry(0.075, 0.025, 0.11).translate(0.17, 0.3, -0.17), BLACK, pedalL);
  add(new THREE.BoxGeometry(0.02, 0.028, 0.115).translate(-0.17, 0.3, 0.17), CHROME, pedalR);
  add(new THREE.BoxGeometry(0.02, 0.028, 0.115).translate(0.17, 0.3, -0.17), CHROME, pedalL);

  // ---------- basket ----------
  const bc = [0, 0.93, 0.7], bw = 0.38, bd = 0.28, bh = 0.26;
  const y0 = bc[1] - bh / 2;
  add(new THREE.BoxGeometry(bw, 0.016, bd).translate(bc[0], y0, bc[2]), WICKER2, steer);
  for (let i = 0; i < 10; i++) {
    const x = -bw / 2 + 0.01 + (i * (bw - 0.02)) / 9;
    for (const s of [1, -1]) add(new THREE.BoxGeometry(0.014, bh, 0.012).translate(x, bc[1], bc[2] + s * bd / 2), WICKER2, steer);
  }
  for (let i = 0; i < 7; i++) {
    const z = bc[2] - bd / 2 + 0.01 + (i * (bd - 0.02)) / 6;
    for (const s of [1, -1]) add(new THREE.BoxGeometry(0.012, bh, 0.014).translate(bc[0] + s * bw / 2, bc[1], z), WICKER2, steer);
  }
  for (let r = 0; r < 6; r++) {
    const y = y0 + 0.03 + r * 0.04;
    const col = r % 2 ? WICKER : "#c99a5a";
    for (const s of [1, -1]) {
      add(new THREE.BoxGeometry(bw + 0.01, 0.026, 0.012).translate(bc[0], y, bc[2] + s * (bd / 2 + 0.007)), col, steer);
      add(new THREE.BoxGeometry(0.012, 0.026, bd + 0.01).translate(bc[0] + s * (bw / 2 + 0.007), y, bc[2]), col, steer);
    }
  }
  const top = y0 + bh;
  for (const s of [1, -1]) {
    tube([-bw / 2 - 0.005, top, bc[2] + s * (bd / 2 + 0.005)], [bw / 2 + 0.005, top, bc[2] + s * (bd / 2 + 0.005)], 0.011, "#8a5f30", steer, 6);
    tube([s * (bw / 2 + 0.005), top, bc[2] - bd / 2], [s * (bw / 2 + 0.005), top, bc[2] + bd / 2], 0.011, "#8a5f30", steer, 6);
  }
  // supports
  for (const s of [1, -1]) {
    tube([s * 0.08, y0, bc[2] - 0.05], [s * 0.065, 0.36, 0.55], 0.005, CHROME, steer, 5);
    tube([s * 0.08, y0 + 0.01, bc[2] - bd / 2], [0, 0.88, 0.44], 0.006, CHROME, steer, 5);
  }

  // sunflowers
  const flowers: { p: number[]; n: number[]; base: number[] }[] = [
    { p: [-0.08, 1.2, 0.74], n: [-0.3, 0.8, 0.5], base: [-0.04, y0 + 0.02, 0.68] },
    { p: [0.1, 1.23, 0.76], n: [0.35, 0.8, 0.4], base: [0.05, y0 + 0.02, 0.72] },
    { p: [0.0, 1.27, 0.66], n: [0, 1, 0.3], base: [0.0, y0 + 0.02, 0.7] },
    { p: [-0.14, 1.15, 0.64], n: [-0.7, 0.6, 0.2], base: [-0.07, y0 + 0.02, 0.66] },
    { p: [0.16, 1.15, 0.65], n: [0.7, 0.6, 0.2], base: [0.08, y0 + 0.02, 0.66] },
  ];
  const r = [0.2, 0.55, 0.9, 0.35, 0.7];
  flowers.forEach((f, k) => {
    const n = V(f.n).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(Y, n);
    const place = (g: THREE.BufferGeometry) => {
      g.applyQuaternion(q);
      g.translate(f.p[0], f.p[1], f.p[2]);
      return g;
    };
    add(place(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 10)), SEED, steer);
    add(place(new THREE.CylinderGeometry(0.02, 0.02, 0.026, 8)), "#6b4220", steer);
    const np = 14;
    for (let layer = 0; layer < 2; layer++) {
      for (let i = 0; i < np; i++) {
        const a = ((i + layer * 0.5) / np) * Math.PI * 2;
        const g = new THREE.ConeGeometry(0.017, 0.065, 4);
        g.scale(1, 1, 0.35);
        g.rotateZ(-Math.PI / 2);
        g.translate(0.05 + layer * 0.004, layer * -0.004, 0);
        g.rotateY(a);
        add(place(g), layer ? YELLOW2 : YELLOW, steer);
      }
    }
    // stem
    const st = V(f.p).addScaledVector(n, -0.02);
    tube([st.x, st.y, st.z], f.base, 0.007, GREEN, steer, 5);
    const m = [(st.x + f.base[0]) / 2, (st.y + f.base[1]) / 2 + 0.02, (st.z + f.base[2]) / 2];
    const lg = new THREE.SphereGeometry(1, 5, 4);
    lg.scale(0.045, 0.008, 0.08);
    lg.rotateY(r[k] * 6);
    lg.rotateX(0.3);
    lg.translate(m[0], m[1], m[2]);
    add(lg, GREEN, steer);
  });

  // baguette
  {
    const a = [0.13, 0.9, 0.78], c = [-0.03, 1.3, 0.42];
    const d = V(c).sub(V(a));
    const len = d.length();
    const g = new THREE.CapsuleGeometry(0.031, len - 0.06, 3, 8);
    const mp = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
    add(orient(g, mp, d), BREAD, steer);
    const dn = d.clone().normalize();
    const perp = new THREE.Vector3().crossVectors(dn, new THREE.Vector3(1, 0, 0)).normalize();
    if (perp.y < 0) perp.negate();
    for (let i = 0; i < 6; i++) {
      const t = 0.3 + i * 0.1;
      const pos = V(a).addScaledVector(d, t).addScaledVector(perp, 0.027);
      const sg = new THREE.SphereGeometry(1, 5, 4);
      sg.scale(0.025, 0.008, 0.012);
      sg.rotateZ(0.5);
      const q = new THREE.Quaternion().setFromUnitVectors(Y, dn);
      sg.applyQuaternion(q);
      sg.translate(pos.x, pos.y, pos.z);
      add(sg, SCORE, steer);
    }
  }

  return b.root;
}
