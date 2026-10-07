import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Gramophone",
  description:
    "A stylized antique gramophone: mahogany cabinet with brass columns and gilt inlay, a felt platter with a spinning shellac record, a swivelling brass tonearm and soundbox, a side crank, and a crimson-and-gold petal morning-glory horn.",
};

export default function build() {
  const b = createBuilder({ name: "gramophone" });

  // ---------- skeleton (for spin / swivel / crank animation) ----------
  const root = b.joint("root", { at: [0, 0, 0] });
  const platterJ = b.joint("platter", { at: [0, 0.19, 0], parent: root });
  const armJ = b.joint("tonearm", { at: [-0.13, 0.22, -0.14], parent: root });
  const crankJ = b.joint("crank", { at: [0.19, 0.11, 0.03], parent: root });

  // ---------- palette ----------
  const WOOD = "#7a3b1e";
  const WOOD_DARK = "#4e2412";
  const WOOD_PANEL = "#5c2b15";
  const BRASS = "#d4a63a";
  const BRASS_DARK = "#a97a22";
  const FELT = "#2f6b3a";
  const VINYL = "#141414";
  const GROOVE = "#2c2c2c";
  const LABEL = "#c0392b";
  const CREAM = "#f2ead0";
  const RUBY = "#b3122a";
  const PETAL_A = "#9b1d26";
  const PETAL_B = "#7d141d";
  const INNER_A = "#f0c75e";
  const INNER_B = "#ddb045";
  const KNOB = "#3a1a0c";

  const P = (
    geo: THREE.BufferGeometry,
    color: string,
    at: number[],
    opts: { bone?: any; dir?: number[]; scale?: number[] } = {}
  ) => {
    const o: any = { at, bone: opts.bone ?? root };
    if (opts.dir) o.dir = opts.dir;
    if (opts.scale) o.scale = opts.scale;
    return b.part(geo, color, o);
  };

  const rod = (a: number[], c: number[], r: number, color: string, bone: any = root, seg = 8) => {
    const va = new THREE.Vector3(...(a as [number, number, number]));
    const vc = new THREE.Vector3(...(c as [number, number, number]));
    const len = va.distanceTo(vc);
    const m = va.clone().add(vc).multiplyScalar(0.5);
    const d = vc.clone().sub(va);
    return P(new THREE.CylinderGeometry(r, r, len, seg), color, [m.x, m.y, m.z], {
      bone,
      dir: [d.x, d.y, d.z],
    });
  };

  const tube = (pts: number[][], r: number, color: string, bone: any = root, segs = 20, radial = 8) => {
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
    return P(new THREE.TubeGeometry(curve, segs, r, radial, false), color, [0, 0, 0], { bone });
  };

  const flatRing = (radius: number, thick: number, color: string, at: number[], bone: any = root, tubular = 32) => {
    const g = new THREE.TorusGeometry(radius, thick, 3, tubular);
    g.rotateX(Math.PI / 2);
    return P(g, color, at, { bone });
  };

  // ---------- cabinet ----------
  // brass bun feet
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      P(new THREE.SphereGeometry(0.03, 10, 6), BRASS, [sx * 0.165, 0.021, sz * 0.165], {
        scale: [1, 0.7, 1],
      });
    }
  // plinth
  P(new THREE.BoxGeometry(0.38, 0.025, 0.38), WOOD_DARK, [0, 0.0425, 0]);
  // gilt line on plinth
  P(new THREE.BoxGeometry(0.384, 0.004, 0.384), BRASS, [0, 0.05, 0]);
  // body
  P(new THREE.BoxGeometry(0.34, 0.11, 0.34), WOOD, [0, 0.11, 0]);
  // lid
  P(new THREE.BoxGeometry(0.37, 0.02, 0.37), WOOD_DARK, [0, 0.175, 0]);
  P(new THREE.BoxGeometry(0.374, 0.004, 0.374), BRASS, [0, 0.167, 0]);
  P(new THREE.BoxGeometry(0.35, 0.002, 0.35), WOOD, [0, 0.1855, 0]);

  // brass corner columns with caps & bases
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const x = sx * 0.17;
      const z = sz * 0.17;
      P(new THREE.CylinderGeometry(0.011, 0.011, 0.11, 8), BRASS, [x, 0.11, z]);
      P(new THREE.CylinderGeometry(0.016, 0.016, 0.008, 8), BRASS_DARK, [x, 0.059, z]);
      P(new THREE.CylinderGeometry(0.016, 0.016, 0.008, 8), BRASS_DARK, [x, 0.161, z]);
      // fluting rings
      for (const y of [0.085, 0.11, 0.135])
        flatRing(0.0115, 0.002, BRASS_DARK, [x, y, z], root, 8);
    }

  // raised panels with gilt inlay on front, back and sides
  const panel = (axis: "z" | "x", sign: number, emblem: boolean) => {
    const off = 0.17 + 0.004;
    const W = 0.25,
      H = 0.075,
      T = 0.008,
      y = 0.11;
    const at = axis === "z" ? [0, y, sign * off] : [sign * off, y, 0];
    const size: [number, number, number] = axis === "z" ? [W, H, T] : [T, H, W];
    P(new THREE.BoxGeometry(...size), WOOD_PANEL, at);
    const o = off + 0.0045;
    const bar = (w: number, h: number, du: number, dv: number) => {
      const s: [number, number, number] = axis === "z" ? [w, h, 0.002] : [0.002, h, w];
      const p = axis === "z" ? [du, y + dv, sign * o] : [sign * o, y + dv, du];
      P(new THREE.BoxGeometry(...s), BRASS, p);
    };
    bar(W - 0.02, 0.004, 0, H / 2 - 0.01);
    bar(W - 0.02, 0.004, 0, -H / 2 + 0.01);
    bar(0.004, H - 0.016, W / 2 - 0.012, 0);
    bar(0.004, H - 0.016, -W / 2 + 0.012, 0);
    if (emblem) {
      const ed = axis === "z" ? [0, 0, sign] : [sign, 0, 0];
      const ep = axis === "z" ? [0, y, sign * (o + 0.002)] : [sign * (o + 0.002), y, 0];
      P(new THREE.CylinderGeometry(0.02, 0.02, 0.004, 12), BRASS, ep, { dir: ed });
      const gp = axis === "z" ? [0, y, sign * (o + 0.006)] : [sign * (o + 0.006), y, 0];
      P(new THREE.SphereGeometry(0.009, 8, 6), RUBY, gp);
      // little scroll flourishes
      for (const s of [-1, 1]) {
        const fp = axis === "z" ? [s * 0.05, y, sign * (o + 0.001)] : [sign * (o + 0.001), y, s * 0.05];
        P(new THREE.CylinderGeometry(0.008, 0.008, 0.003, 8), BRASS_DARK, fp, { dir: ed });
        const lp = axis === "z" ? [s * 0.032, y, sign * (o + 0.001)] : [sign * (o + 0.001), y, s * 0.032];
        const ls: [number, number, number] = axis === "z" ? [0.022, 0.003, 0.003] : [0.003, 0.003, 0.022];
        P(new THREE.BoxGeometry(...ls), BRASS_DARK, lp);
      }
    }
  };
  panel("z", 1, true);
  panel("z", -1, false);
  panel("x", 1, false);
  panel("x", -1, true);

  // ---------- turntable ----------
  P(new THREE.CylinderGeometry(0.15, 0.15, 0.012, 32), BRASS_DARK, [0, 0.191, 0], { bone: platterJ });
  flatRing(0.15, 0.003, BRASS, [0, 0.197, 0], platterJ, 32);
  P(new THREE.CylinderGeometry(0.145, 0.145, 0.003, 32), FELT, [0, 0.1985, 0], { bone: platterJ });
  P(new THREE.CylinderGeometry(0.14, 0.14, 0.004, 32), VINYL, [0, 0.202, 0], { bone: platterJ });
  for (let i = 0; i < 7; i++) {
    flatRing(0.055 + i * 0.0125, 0.0007, GROOVE, [0, 0.2041, 0], platterJ, 40);
  }
  P(new THREE.CylinderGeometry(0.045, 0.045, 0.002, 24), LABEL, [0, 0.205, 0], { bone: platterJ });
  flatRing(0.038, 0.0012, BRASS, [0, 0.2062, 0], platterJ, 24);
  flatRing(0.02, 0.0009, CREAM, [0, 0.2062, 0], platterJ, 16);
  // label marker so the spin reads
  P(new THREE.BoxGeometry(0.004, 0.0015, 0.016), CREAM, [0, 0.2063, 0.028], { bone: platterJ });
  P(new THREE.CylinderGeometry(0.004, 0.004, 0.02, 8), BRASS, [0, 0.213, 0], { bone: platterJ });
  P(new THREE.SphereGeometry(0.0045, 8, 5), BRASS, [0, 0.223, 0], { bone: platterJ });

  // speed lever and brake on the deck
  P(new THREE.CylinderGeometry(0.012, 0.012, 0.004, 10), BRASS_DARK, [0.15, 0.188, 0.15]);
  rod([0.15, 0.188, 0.15], [0.135, 0.215, 0.13], 0.0025, BRASS);
  P(new THREE.SphereGeometry(0.007, 8, 6), KNOB, [0.135, 0.217, 0.13]);
  P(new THREE.BoxGeometry(0.03, 0.003, 0.014), BRASS, [0.15, 0.187, -0.155]);
  P(new THREE.BoxGeometry(0.022, 0.001, 0.008), CREAM, [0.15, 0.1888, -0.155]);

  // ---------- tonearm ----------
  P(new THREE.CylinderGeometry(0.032, 0.036, 0.035, 12), BRASS, [-0.13, 0.2025, -0.14]);
  flatRing(0.034, 0.003, BRASS_DARK, [-0.13, 0.2, -0.14], root, 12);
  P(new THREE.CylinderGeometry(0.018, 0.022, 0.016, 10), BRASS_DARK, [-0.13, 0.228, -0.14], { bone: armJ });
  tube(
    [
      [-0.13, 0.235, -0.14],
      [-0.11, 0.25, -0.07],
      [-0.075, 0.262, 0.0],
      [-0.05, 0.255, 0.035],
      [-0.045, 0.243, 0.049],
    ],
    0.008,
    BRASS,
    armJ,
    20,
    8
  );
  // soundbox
  const sbDir = [0.41, 0, 0.91];
  P(new THREE.CylinderGeometry(0.031, 0.031, 0.016, 16), BRASS, [-0.04, 0.24, 0.06], { bone: armJ, dir: sbDir });
  P(new THREE.CylinderGeometry(0.024, 0.024, 0.003, 16), CREAM, [-0.0365, 0.24, 0.0679], { bone: armJ, dir: sbDir });
  P(new THREE.CylinderGeometry(0.006, 0.006, 0.004, 8), BRASS_DARK, [-0.0355, 0.24, 0.0702], {
    bone: armJ,
    dir: sbDir,
  });
  // stylus bar & needle
  P(new THREE.BoxGeometry(0.006, 0.02, 0.006), BRASS_DARK, [-0.036, 0.217, 0.069], { bone: armJ });
  P(new THREE.CylinderGeometry(0.0018, 0.0002, 0.01, 6), "#c9c9c9", [-0.036, 0.2055, 0.069], { bone: armJ });

  // ---------- horn ----------
  const neck = new THREE.Vector3(0, 0.38, -0.2);
  const d = new THREE.Vector3(0, 0.25, 1).normalize();
  const u = new THREE.Vector3(1, 0, 0);
  const w = new THREE.Vector3().crossVectors(u, d);
  const basis = new THREE.Matrix4().makeBasis(u, d, w).setPosition(neck);
  const L = 0.4,
    R0 = 0.026,
    R = 0.2;
  const STEPS = 10;
  const radiusAt = (t: number) => R0 + (R - R0) * Math.pow(t, 2.6);
  const outer: THREE.Vector2[] = [];
  const inner: THREE.Vector2[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    outer.push(new THREE.Vector2(radiusAt(t), L * t));
    inner.push(new THREE.Vector2(Math.max(0.004, radiusAt(t) - 0.003), L * t));
  }
  inner.reverse();
  const PETALS = 10;
  const pl = (Math.PI * 2) / PETALS;
  for (let k = 0; k < PETALS; k++) {
    const go = new THREE.LatheGeometry(outer, 2, k * pl, pl);
    go.applyMatrix4(basis);
    P(go, k % 2 ? PETAL_A : PETAL_B, [0, 0, 0]);
    const gi = new THREE.LatheGeometry(inner, 2, k * pl, pl);
    gi.applyMatrix4(basis);
    P(gi, k % 2 ? INNER_A : INNER_B, [0, 0, 0]);
    // brass seam rib along each petal edge
    const phi = k * pl;
    const ribPts: number[][] = [];
    for (let i = 0; i <= STEPS; i++) {
      const t = i / STEPS;
      const r = radiusAt(t) + 0.002;
      const p = neck
        .clone()
        .addScaledVector(u, r * Math.sin(phi))
        .addScaledVector(d, L * t)
        .addScaledVector(w, r * Math.cos(phi));
      ribPts.push([p.x, p.y, p.z]);
    }
    tube(ribPts, 0.0025, BRASS, root, 12, 4);
    // rivet at each rib's mouth end
    const end = ribPts[ribPts.length - 2];
    P(new THREE.SphereGeometry(0.004, 6, 4), BRASS_DARK, end);
  }
  // rolled brass rim
  const rimG = new THREE.TorusGeometry(R, 0.006, 5, 30);
  rimG.rotateX(Math.PI / 2);
  rimG.applyMatrix4(new THREE.Matrix4().makeBasis(u, d, w).setPosition(neck.clone().addScaledVector(d, L)));
  P(rimG, BRASS, [0, 0, 0]);
  // neck collar
  const collarG = new THREE.TorusGeometry(R0 + 0.002, 0.005, 5, 12);
  collarG.rotateX(Math.PI / 2);
  collarG.applyMatrix4(new THREE.Matrix4().makeBasis(u, d, w).setPosition(neck.clone().addScaledVector(d, 0.01)));
  P(collarG, BRASS_DARK, [0, 0, 0]);

  // elbow tube from tonearm base into the horn neck
  const neckIn = neck.clone().addScaledVector(d, 0.012);
  const neckBack = neck.clone().addScaledVector(d, -0.04);
  tube(
    [
      [-0.13, 0.215, -0.14],
      [-0.125, 0.29, -0.19],
      [-0.07, 0.345, -0.25],
      [neckBack.x, neckBack.y, neckBack.z],
      [neckIn.x, neckIn.y, neckIn.z],
    ],
    0.021,
    BRASS,
    root,
    24,
    10
  );
  flatRing(0.023, 0.004, BRASS_DARK, [-0.129, 0.25, -0.155], root, 10);

  // horn support crane from the back of the cabinet
  P(new THREE.CylinderGeometry(0.015, 0.018, 0.008, 10), BRASS_DARK, [0, 0.189, -0.17]);
  rod([0, 0.189, -0.17], [0, 0.33, -0.235], 0.005, BRASS);
  rod([0, 0.33, -0.235], [-0.05, 0.345, -0.25], 0.004, BRASS);
  P(new THREE.SphereGeometry(0.008, 8, 6), BRASS, [0, 0.33, -0.235]);

  // ---------- winding crank (left side, +X) ----------
  P(new THREE.CylinderGeometry(0.022, 0.024, 0.006, 12), BRASS, [0.173, 0.11, 0.03], { dir: [1, 0, 0] });
  P(new THREE.CylinderGeometry(0.006, 0.006, 0.035, 8), BRASS, [0.19, 0.11, 0.03], {
    bone: crankJ,
    dir: [1, 0, 0],
  });
  P(new THREE.BoxGeometry(0.008, 0.07, 0.014), BRASS, [0.207, 0.085, 0.03], { bone: crankJ });
  P(new THREE.SphereGeometry(0.009, 8, 6), BRASS_DARK, [0.207, 0.11, 0.03], { bone: crankJ });
  P(new THREE.CylinderGeometry(0.009, 0.01, 0.032, 10), KNOB, [0.226, 0.055, 0.03], {
    bone: crankJ,
    dir: [1, 0, 0],
  });
  P(new THREE.SphereGeometry(0.009, 8, 6), BRASS, [0.243, 0.055, 0.03], { bone: crankJ });

  return b.root;
}
