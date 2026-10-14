```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Dutch City Bicycle",
  description:
    "Vintage mint-green Dutch omafiets with whitewall tyres, upright chrome bars, cream grips, silver bell, sprung leather saddle, chrome mudguards, chain guard and a wicker basket of sunflowers and a baguette.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "dutch_bike" });

  // ---------- skeleton ----------
  const frameJ = b.joint("frame", { at: [0, 0.3, -0.02] });
  const rearJ = b.joint("rearWheel", { at: [0, 0.34, -0.55], parent: frameJ });
  const crankJ = b.joint("crank", { at: [0, 0.3, -0.02], parent: frameJ });
  const steerJ = b.joint("steer", { at: [0, 0.7, 0.395], parent: frameJ });
  const frontJ = b.joint("frontWheel", { at: [0, 0.34, 0.55], parent: steerJ });

  // ---------- palette ----------
  const MINT = "#8ed4b5";
  const MINT_D = "#6fbf9f";
  const CHROME = "#cfd4da";
  const CHROME_D = "#9aa1a9";
  const CREAM = "#f3ecd6";
  const BLACK = "#232323";
  const LEATHER = "#6b3f22";
  const LEATHER_L = "#8f5a32";

  const Y = new THREE.Vector3(0, 1, 0);

  // ---------- helpers ----------
  const mk = (g: THREE.BufferGeometry, col: string, bone: any, at: V = [0, 0, 0]) =>
    b.part(g, col, { at, bone });

  const rod = (a: V, c: V, r: number, col: string, bone: any, seg = 8) => {
    const A = new THREE.Vector3(...a);
    const B = new THREE.Vector3(...c);
    const d = B.clone().sub(A);
    const L = d.length();
    const g = new THREE.CylinderGeometry(r, r, L, seg, 1);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(Y, d.normalize()));
    const m = A.clone().add(B).multiplyScalar(0.5);
    return mk(g, col, bone, [m.x, m.y, m.z]);
  };

  const ball = (p: V, r: number, col: string, bone: any, seg = 8) =>
    mk(new THREE.SphereGeometry(r, seg, Math.max(4, seg - 2)), col, bone, p);

  const flip = (g: THREE.BufferGeometry) => {
    const idx = g.index;
    if (idx) {
      const a = idx.array as any;
      for (let i = 0; i < a.length; i += 3) {
        const t = a[i + 1];
        a[i + 1] = a[i + 2];
        a[i + 2] = t;
      }
      idx.needsUpdate = true;
    }
    const n = g.attributes.normal;
    for (let i = 0; i < n.count; i++) n.setXYZ(i, -n.getX(i), -n.getY(i), -n.getZ(i));
    return g;
  };

  class Helix extends THREE.Curve<THREE.Vector3> {
    r: number;
    h: number;
    turns: number;
    constructor(r: number, h: number, turns: number) {
      super();
      this.r = r;
      this.h = h;
      this.turns = turns;
    }
    getPoint(t: number, target = new THREE.Vector3()) {
      const a = t * this.turns * Math.PI * 2;
      return target.set(this.r * Math.cos(a), (t - 0.5) * this.h, this.r * Math.sin(a));
    }
  }
  const spring = (p: V, r: number, h: number, turns: number, bone: any) =>
    mk(new THREE.TubeGeometry(new Helix(r, h, turns), 48, 0.0042, 4, false), CHROME_D, bone, p);

  // ---------- wheels ----------
  const wheel = (c: V, bone: any) => {
    const tyre = new THREE.TorusGeometry(0.318, 0.028, 8, 40);
    tyre.rotateY(Math.PI / 2);
    mk(tyre, BLACK, bone, c);
    for (const s of [1, -1]) {
      const ring = new THREE.RingGeometry(0.3071, 0.3289, 40);
      ring.rotateY((s * Math.PI) / 2);
      ring.translate(s * 0.0258, 0, 0);
      mk(ring, CREAM, bone, c);
    }
    const rim = new THREE.TorusGeometry(0.3, 0.01, 6, 40);
    rim.rotateY(Math.PI / 2);
    mk(rim, CHROME, bone, c);
    const hub = new THREE.CylinderGeometry(0.022, 0.022, 0.09, 10);
    hub.rotateZ(Math.PI / 2);
    mk(hub, CHROME, bone, c);
    for (const s of [1, -1]) {
      const fl = new THREE.CylinderGeometry(0.04, 0.04, 0.006, 12);
      fl.rotateZ(Math.PI / 2);
      mk(fl, CHROME_D, bone, [c[0] + s * 0.03, c[1], c[2]]);
    }
    const ax = new THREE.CylinderGeometry(0.01, 0.01, 0.15, 6);
    ax.rotateZ(Math.PI / 2);
    mk(ax, CHROME_D, bone, c);
    const N = 32;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const sx = (i % 2 ? 1 : -1) * 0.028;
      rod(
        [c[0] + sx, c[1] + Math.cos(a) * 0.035, c[2] + Math.sin(a) * 0.035],
        [c[0], c[1] + Math.cos(a) * 0.295, c[2] + Math.sin(a) * 0.295],
        0.0026,
        "#b9bec4",
        bone,
        3
      );
    }
  };
  wheel([0, 0.34, -0.55], rearJ);
  wheel([0, 0.34, 0.55], frontJ);

  // ---------- mudguards ----------
  const fender = (c: V, startDeg: number, arcDeg: number, bone: any) => {
    const g = new THREE.TorusGeometry(0.37, 0.012, 6, 28, (arcDeg * Math.PI) / 180);
    g.scale(1, 1, 4);
    g.rotateZ((startDeg * Math.PI) / 180);
    g.rotateY(Math.PI / 2);
    mk(g, CHROME, bone, c);
  };
  fender([0, 0.34, -0.55], -10, 175, frameJ);
  fender([0, 0.34, 0.55], 55, 140, steerJ);
  // fender stays
  for (const s of [1, -1]) {
    rod([s * 0.058, 0.34, -0.55], [s * 0.05, 0.62, -0.8], 0.004, CHROME_D, frameJ, 4);
    rod([s * 0.05, 0.34, 0.55], [s * 0.05, 0.58, 0.38], 0.004, CHROME_D, steerJ, 4);
  }
  rod([0, 0.7, 0.4], [0, 0.69, 0.4 + 0.0], 0.004, CHROME_D, steerJ, 4);
  rod([0, 0.7, 0.4], [0, 0.703, 0.5], 0.005, CHROME_D, steerJ, 4);
  // rear light reflector
  mk(new THREE.BoxGeometry(0.04, 0.025, 0.012), "#c93b3b", frameJ, [0, 0.4, -0.92]);

  // ---------- frame ----------
  const BB: V = [0, 0.3, -0.02];
  const ST: V = [0, 0.8, -0.235];
  const HB: V = [0, 0.7, 0.395];
  const HT: V = [0, 0.88, 0.435];
  rod(BB, ST, 0.017, MINT, frameJ); // seat tube
  rod(ST, [0, 0.83, 0.425], 0.018, MINT, frameJ); // top tube
  rod(BB, [0, 0.72, 0.4], 0.021, MINT, frameJ); // down tube
  rod(HB, HT, 0.025, MINT, frameJ); // head tube
  mk(
    (() => {
      const g = new THREE.CylinderGeometry(0.029, 0.029, 0.075, 10);
      g.rotateZ(Math.PI / 2);
      return g;
    })(),
    MINT,
    frameJ,
    BB
  );
  for (const s of [1, -1]) {
    rod([s * 0.02, 0.3, -0.03], [s * 0.058, 0.34, -0.55], 0.011, MINT, frameJ);
    rod([s * 0.015, 0.77, -0.225], [s * 0.058, 0.34, -0.55], 0.009, MINT, frameJ);
    mk(new THREE.BoxGeometry(0.014, 0.05, 0.03), MINT_D, frameJ, [s * 0.058, 0.345, -0.545]);
  }
  // headset
  rod([0, 0.875, 0.434], [0, 0.89, 0.438], 0.03, CHROME, frameJ, 10);
  rod([0, 0.695, 0.394], [0, 0.71, 0.398], 0.03, CHROME, frameJ, 10);
  // head badge
  {
    const g = new THREE.CylinderGeometry(0.02, 0.02, 0.006, 10);
    g.rotateX(Math.PI / 2);
    mk(g, "#c9a23c", frameJ, [0, 0.79, 0.457]);
  }

  // ---------- fork ----------
  mk(new THREE.BoxGeometry(0.15, 0.03, 0.045), MINT, steerJ, [0, 0.695, 0.395]);
  for (const s of [1, -1]) {
    rod([s * 0.065, 0.695, 0.395], [s * 0.055, 0.46, 0.49], 0.013, MINT, steerJ);
    rod([s * 0.055, 0.46, 0.49], [s * 0.05, 0.34, 0.55], 0.011, MINT, steerJ);
    ball([s * 0.05, 0.34, 0.55], 0.014, CHROME, steerJ, 6);
  }

  // ---------- handlebars ----------
  rod(HT, [0, 1.07, 0.465], 0.013, CHROME, steerJ);
  const bar: V[] = [
    [0, 1.07, 0.465],
    [0.19, 1.075, 0.455],
    [0.29, 1.09, 0.36],
    [0.3, 1.1, 0.22],
    [0.285, 1.105, 0.09],
  ];
  for (const s of [1, -1]) {
    for (let i = 0; i < bar.length - 1; i++) {
      const A = bar[i], B = bar[i + 1];
      rod([s * A[0], A[1], A[2]], [s * B[0], B[1], B[2]], 0.0105, CHROME, steerJ);
      if (i > 0) ball([s * A[0], A[1], A[2]], 0.0125, CHROME, steerJ, 6);
    }
    // grips
    rod([s * 0.298, 1.1, 0.21], [s * 0.284, 1.105, 0.07], 0.0175, CREAM, steerJ, 8);
    ball([s * 0.284, 1.105, 0.065], 0.0175, CREAM, steerJ, 6);
    // brake lever
    rod([s * 0.292, 1.093, 0.27], [s * 0.272, 1.065, 0.15], 0.0055, CHROME, steerJ, 5);
  }
  mk(new THREE.BoxGeometry(0.05, 0.03, 0.04), CHROME, steerJ, [0, 1.07, 0.465]);
  // bell (silver)
  {
    const dome = new THREE.SphereGeometry(0.04, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    mk(dome, CHROME, steerJ, [-0.15, 1.093, 0.455]);
    const col = new THREE.CylinderGeometry(0.012, 0.012, 0.022, 8);
    mk(col, CHROME_D, steerJ, [-0.15, 1.083, 0.455]);
    mk(new THREE.CylinderGeometry(0.04, 0.04, 0.006, 10), CHROME_D, steerJ, [-0.15, 1.093, 0.455]);
    ball([-0.15, 1.136, 0.455], 0.007, CHROME_D, steerJ, 5);
    rod([-0.18, 1.1, 0.43], [-0.2, 1.106, 0.415], 0.004, CHROME_D, steerJ, 4);
  }

  // ---------- saddle ----------
  rod([0, 0.79, -0.23], [0, 0.945, -0.295], 0.014, CHROME, frameJ);
  mk(new THREE.CylinderGeometry(0.02, 0.02, 0.016, 8), CHROME_D, frameJ, [0, 0.8, -0.235]);
  mk(new THREE.BoxGeometry(0.07, 0.03, 0.06), CHROME_D, frameJ, [0, 0.95, -0.297]);
  for (const s of [1, -1]) {
    rod([s * 0.03, 0.965, -0.2], [s * 0.055, 0.965, -0.37], 0.005, CHROME, frameJ, 5);
    spring([s * 0.055, 0.985, -0.36], 0.022, 0.05, 5, frameJ);
  }
  rod([-0.03, 0.965, -0.2], [0.03, 0.965, -0.2], 0.005, CHROME, frameJ, 5);
  rod([0, 0.95, -0.297], [0, 0.965, -0.28], 0.01, CHROME_D, frameJ, 5);
  spring([0, 0.99, -0.21], 0.016, 0.04, 4, frameJ);
  {
    const rear = new THREE.SphereGeometry(0.105, 10, 8);
    rear.scale(1.15, 0.33, 1.1);
    mk(rear, LEATHER, frameJ, [0, 1.045, -0.37]);
    const mid = new THREE.SphereGeometry(0.08, 10, 8);
    mid.scale(1.0, 0.35, 1.5);
    mk(mid, LEATHER, frameJ, [0, 1.04, -0.28]);
    const nose = new THREE.SphereGeometry(0.06, 8, 6);
    nose.scale(0.75, 0.45, 2.3);
    mk(nose, LEATHER, frameJ, [0, 1.035, -0.2]);
    // piping underside
    const pipe = new THREE.TorusGeometry(0.105, 0.005, 4, 14, Math.PI * 1.1);
    pipe.rotateX(Math.PI / 2);
    pipe.rotateY(Math.PI * 0.45);
    pipe.scale(1.15, 1, 1.1);
    mk(pipe, LEATHER_L, frameJ, [0, 1.02, -0.37]);
    for (const s of [1, -1]) ball([s * 0.09, 1.05, -0.4], 0.008, "#c9a23c", frameJ, 5);
  }

  // ---------- rear rack ----------
  for (const s of [1, -1]) {
    rod([s * 0.06, 0.76, -0.8], [s * 0.06, 0.76, -0.4], 0.006, "#555a60", frameJ, 5);
    rod([s * 0.06, 0.76, -0.8], [s * 0.058, 0.34, -0.55], 0.005, "#555a60", frameJ, 5);
    rod([s * 0.06, 0.76, -0.4], [s * 0.02, 0.77, -0.23], 0.005, "#555a60", frameJ, 5);
  }
  for (let i = 0; i < 6; i++) {
    const z = -0.78 + i * 0.07;
    rod([-0.06, 0.762, z], [0.06, 0.762, z], 0.004, "#555a60", frameJ, 4);
  }

  // ---------- crank, pedals, chain ----------
  {
    const axle = new THREE.CylinderGeometry(0.014, 0.014, 0.22, 8);
    axle.rotateZ(Math.PI / 2);
    mk(axle, CHROME_D, crankJ, BB);
    rod([-0.1, 0.3, -0.02], [-0.1, 0.13, -0.02], 0.012, CHROME, crankJ);
    rod([0.1, 0.3, -0.02], [0.1, 0.47, -0.02], 0.012, CHROME, crankJ);
    ball([-0.1, 0.3, -0.02], 0.02, CHROME, crankJ, 8);
    ball([0.1, 0.3, -0.02], 0.02, CHROME, crankJ, 8);
    mk(new THREE.BoxGeometry(0.1, 0.025, 0.09), "#3a3a3a", crankJ, [-0.16, 0.13, -0.02]);
    mk(new THREE.BoxGeometry(0.1, 0.025, 0.09), "#3a3a3a", crankJ, [0.16, 0.47, -0.02]);
    rod([-0.11, 0.13, -0.02], [-0.21, 0.13, -0.02], 0.006, CHROME, crankJ, 5);
    rod([0.11, 0.47, -0.02], [0.21, 0.47, -0.02], 0.006, CHROME, crankJ, 5);
    const ringG = new THREE.CylinderGeometry(0.078, 0.078, 0.006, 16);
    ringG.rotateZ(Math.PI / 2);
    mk(ringG, CHROME, crankJ, [-0.06, 0.3, -0.02]);
    const spr = new THREE.CylinderGeometry(0.04, 0.04, 0.006, 12);
    spr.rotateZ(Math.PI / 2);
    mk(spr, CHROME, rearJ, [-0.06, 0.34, -0.55]);
    rod([-0.06, 0.378, -0.02], [-0.06, 0.38, -0.55], 0.004, "#333", frameJ, 4);
    rod([-0.06, 0.222, -0.02], [-0.06, 0.3, -0.55], 0.004, "#333", frameJ, 4);
  }

  // ---------- chain guard ----------
  {
    const sh = new THREE.Shape();
    sh.moveTo(0, 0.1);
    sh.lineTo(0.53, 0.09);
    sh.absarc(0.53, 0.04, 0.05, Math.PI / 2, -Math.PI / 2, true);
    sh.lineTo(0, -0.1);
    sh.absarc(0, 0, 0.1, -Math.PI / 2, -(3 * Math.PI) / 2, true);
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.012, bevelEnabled: false, curveSegments: 10 });
    g.rotateY(Math.PI / 2);
    mk(g, MINT_D, frameJ, [-0.088, 0.3, -0.02]);
    const cap = new THREE.CylinderGeometry(0.03, 0.03, 0.008, 10);
    cap.rotateZ(Math.PI / 2);
    mk(cap, CHROME, frameJ, [-0.092, 0.3, -0.02]);
  }

  // ---------- basket ----------
  const cz = 0.7;
  {
    const wall = new THREE.CylinderGeometry(0.19, 0.15, 0.22, 12, 1, true);
    mk(wall, "#c79a5a", steerJ, [0, 0.85, cz]);
    const inner = flip(new THREE.CylinderGeometry(0.182, 0.144, 0.22, 12, 1, true));
    mk(inner, "#8a6330", steerJ, [0, 0.85, cz]);
    mk(new THREE.CylinderGeometry(0.15, 0.15, 0.02, 12), "#8a6330", steerJ, [0, 0.745, cz]);
    const rimT = new THREE.TorusGeometry(0.19, 0.013, 5, 20);
    rimT.rotateX(Math.PI / 2);
    mk(rimT, "#8f6428", steerJ, [0, 0.96, cz]);
    const rimB = new THREE.TorusGeometry(0.152, 0.01, 5, 16);
    rimB.rotateX(Math.PI / 2);
    mk(rimB, "#8f6428", steerJ, [0, 0.74, cz]);
    for (let k = 1; k <= 3; k++) {
      const h = 0.74 + (0.22 * k) / 4;
      const r = 0.15 + (0.04 * (h - 0.74)) / 0.22 + 0.004;
      const t = new THREE.TorusGeometry(r, 0.0085, 4, 16);
      t.rotateX(Math.PI / 2);
      mk(t, "#a97b3d", steerJ, [0, h, cz]);
    }
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      rod(
        [0.153 * Math.sin(a), 0.74, cz + 0.153 * Math.cos(a)],
        [0.193 * Math.sin(a), 0.96, cz + 0.193 * Math.cos(a)],
        0.007,
        "#bb8c4c",
        steerJ,
        4
      );
    }
    // handles
    for (const s of [1, -1]) {
      const hd = new THREE.TorusGeometry(0.03, 0.006, 4, 8, Math.PI);
      hd.rotateZ(Math.PI / 2);
      hd.rotateY(Math.PI / 2);
      mk(hd, "#8f6428", steerJ, [s * 0.193, 0.92, cz]);
    }
    // supports
    for (const s of [1, -1]) {
      rod([s * 0.08, 0.75, cz - 0.1], [s * 0.065, 0.7, 0.4], 0.006, CHROME, steerJ, 5);
      rod([s * 0.12, 0.93, cz - 0.15], [0, 1.065, 0.462], 0.005, CHROME, steerJ, 5);
      rod([s * 0.1, 0.76, cz - 0.1], [s * 0.1, 0.9, cz - 0.15], 0.005, CHROME, steerJ, 5);
    }
    // leather strap
    const strap = new THREE.TorusGeometry(0.188, 0.006, 3, 16);
    strap.rotateX(Math.PI / 2);
    strap.scale(1, 1, 1);
    mk(strap, LEATHER, steerJ, [0, 0.935, cz]);
    mk(new THREE.BoxGeometry(0.03, 0.03, 0.01), "#c9a23c", steerJ, [0, 0.935, cz + 0.2]);
  }

  // ---------- sunflowers ----------
  const sunflower = (pos: V, dirIn: V) => {
    const dir = new THREE.Vector3(...dirIn).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(Y, dir);
    const M = new THREE.Matrix4().compose(new THREE.Vector3(...pos), q, new THREE.Vector3(1, 1, 1));
    const add = (g: THREE.BufferGeometry, col: string) => {
      g.applyMatrix4(M);
      mk(g, col, steerJ);
    };
    add(new THREE.CylinderGeometry(0.036, 0.034, 0.014, 10), "#5a3a1c");
    const dome = new THREE.SphereGeometry(0.03, 8, 5);
    dome.scale(1, 0.3, 1);
    dome.translate(0, 0.006, 0);
    add(dome, "#3d2812");
    for (let i = 0; i < 12; i++) {
      const g = new THREE.ConeGeometry(0.012, 0.056, 4);
      g.rotateZ(-Math.PI / 2);
      g.scale(1, 1, 0.8);
      g.translate(0.062, -0.012, 0);
      g.rotateY((i / 12) * Math.PI * 2 + 0.26);
      add(g, "#e8a012");
    }
    for (let i = 0; i < 12; i++) {
      const g = new THREE.ConeGeometry(0.013, 0.06, 4);
      g.rotateZ(-Math.PI / 2);
      g.scale(1, 1, 0.8);
      g.translate(0.064, -0.003, 0);
      g.rotateY((i / 12) * Math.PI * 2);
      add(g, "#f6c21c");
    }
    const back = pos.map((v, i) => v - dir.toArray()[i] * 0.03) as V;
    return back;
  };
  const flowers: [V, V][] = [
    [[-0.03, 1.12, 0.75], [-0.1, 0.8, 0.6]],
    [[-0.15, 1.06, 0.7], [-0.6, 0.6, 0.5]],
    [[-0.07, 1.1, 0.6], [-0.1, 0.9, 0.15]],
    [[-0.13, 1.03, 0.84], [-0.3, 0.4, 0.9]],
    [[0.03, 1.02, 0.88], [0.1, 0.5, 0.9]],
  ];
  for (const [p, d] of flowers) {
    const back = sunflower(p, d);
    rod([p[0] * 0.3, 0.78, cz], back, 0.006, "#4f8a3a", steerJ, 5);
  }
  const leaves: [V, number][] = [
    [[-0.14, 0.98, 0.6], 0.5],
    [[0.1, 0.99, 0.84], -0.8],
    [[-0.17, 0.99, 0.78], 1.6],
    [[0.0, 0.98, 0.52], 2.4],
    [[-0.08, 1.0, 0.88], -2.2],
  ];
  for (const [p, yaw] of leaves) {
    const g = new THREE.SphereGeometry(0.04, 6, 4);
    g.scale(1, 0.18, 1.7);
    g.rotateX(-0.3);
    g.rotateY(yaw);
    mk(g, "#4f8a3a", steerJ, p);
  }

  // ---------- baguette ----------
  {
    const dir = new THREE.Vector3(0.5, 0.666, 0.555).normalize();
    const base = new THREE.Vector3(0.08, 0.82, 0.7);
    const center = base.clone().add(dir.clone().multiplyScalar(0.28));
    const q = new THREE.Quaternion().setFromUnitVectors(Y, dir);
    const M = new THREE.Matrix4().compose(center, q, new THREE.Vector3(1, 1, 1));
    const cap = new THREE.CapsuleGeometry(0.032, 0.5, 3, 8);
    cap.applyMatrix4(M);
    mk(cap, "#d9a050", steerJ);
    for (let i = 0; i < 6; i++) {
      for (const ang of [0, 2.2]) {
        const g = new THREE.BoxGeometry(0.045, 0.012, 0.008);
        g.rotateZ(0.6);
        g.translate(0, -0.2 + i * 0.075, 0.031);
        g.rotateY(ang);
        g.applyMatrix4(M);
        mk(g, "#b97a32", steerJ);
      }
    }
  }

  return b.root;
}
```