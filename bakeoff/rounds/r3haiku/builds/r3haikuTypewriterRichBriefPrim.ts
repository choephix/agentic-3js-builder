import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "1930s Typewriter",
  description: "Racing green 1930s typewriter with cream-lettered keys, a typebar fan, a black platen with a half-typed sheet, and a brass maker's badge.",
};

const GREEN = "#0b4a2e";
const GREEN_DEEP = "#08382a";
const CHROME = "#d8dde3";
const GUNMETAL = "#3a4046";
const BLACK = "#141414";
const CREAM = "#f1e6c8";
const BRASS = "#b5894a";
const PAPER = "#f4f0e2";
const INK = "#2a2520";

export default function build() {
  const b = createBuilder({ name: "typewriter" });
  const rand = rng(7);

  // Single root joint: a prop, so everything rides this one bone.
  const body = b.joint("body", { at: [0, 0, 0] });

  // Helpers: geometry is baked in model space, then handed to the builder.
  const place = (g: THREE.BufferGeometry, p: number[], color: string) => {
    g.translate(p[0], p[1], p[2]);
    b.part(g, color, { at: [0, 0, 0], bone: body });
  };
  const boxP = (
    w: number, h: number, d: number,
    p: number[], color: string, rot: number[] = [0, 0, 0],
  ) => {
    const g = new THREE.BoxGeometry(w, h, d);
    g.rotateX(rot[0]);
    g.rotateY(rot[1]);
    g.rotateZ(rot[2]);
    place(g, p, color);
  };
  const cylP = (
    r: number, h: number, seg: number,
    p: number[], color: string, rot: number[] = [0, 0, 0],
  ) => {
    const g = new THREE.CylinderGeometry(r, r, h, seg);
    g.rotateX(rot[0]);
    g.rotateY(rot[1]);
    g.rotateZ(rot[2]);
    place(g, p, color);
  };

  // ---- Body -------------------------------------------------------------
  // Four black feet.
  for (const x of [-0.18, 0.18]) {
    for (const z of [-0.14, 0.1]) {
      cylP(0.02, 0.04, 10, [x, 0.02, z], BLACK);
    }
  }

  // Lower base.
  boxP(0.44, 0.10, 0.36, [0, 0.09, -0.02], GREEN);
  // Chrome side trim on the base.
  boxP(0.008, 0.012, 0.34, [-0.224, 0.12, -0.02], CHROME);
  boxP(0.008, 0.012, 0.34, [0.224, 0.12, -0.02], CHROME);

  // Raised back of the body.
  boxP(0.44, 0.06, 0.16, [0, 0.18, -0.12], GREEN);

  // Sloped keyboard panel, tilted so the front dips.
  const th = 0.25;
  const c = Math.cos(th);
  const s = Math.sin(th);
  boxP(0.44, 0.03, 0.24, [0, 0.15, 0.08], GREEN_DEEP, [th, 0, 0]);

  // Point on the panel top surface, local (x, zl).
  const surf = (x: number, zl: number): number[] => [
    x,
    0.15 + 0.015 * c - zl * s,
    0.08 + 0.015 * s + zl * c,
  ];
  // Lift a point along the panel normal (0, c, s).
  const lift = (p: number[], k: number): number[] => [p[0], p[1] + c * k, p[2] + s * k];

  // ---- Keys: four staggered rows ----------------------------------------
  const rows = [
    { zl: -0.075, n: 11, shift: 0 },
    { zl: -0.03, n: 11, shift: 0.016 },
    { zl: 0.015, n: 10, shift: 0.008 },
    { zl: 0.06, n: 9, shift: 0.024 },
  ];
  for (const row of rows) {
    for (let i = 0; i < row.n; i++) {
      const x = (i - (row.n - 1) / 2) * 0.032 + row.shift;
      const sp = surf(x, row.zl);

      // Chrome rim (flat torus lying on the panel).
      const rim = new THREE.TorusGeometry(0.0175, 0.0025, 6, 14);
      rim.rotateX(Math.PI / 2 + th);
      place(rim, lift(sp, 0.003), CHROME);

      // Dark keytop.
      const top = new THREE.CylinderGeometry(0.0155, 0.0155, 0.008, 14);
      top.rotateX(th);
      place(top, lift(sp, 0.007), BLACK);

      // Cream letter: two crossed bars, sometimes diagonal.
      const yaw = rand() < 0.35 ? Math.PI / 4 : 0;
      const bar1 = new THREE.BoxGeometry(0.0055, 0.002, 0.0016);
      const bar2 = new THREE.BoxGeometry(0.0016, 0.002, 0.0065);
      for (const g of [bar1, bar2]) {
        g.rotateY(yaw);
        g.rotateX(th);
        place(g, lift(sp, 0.0115), CREAM);
      }
    }
  }

  // ---- Typebar fan: semicircle behind the keys ---------------------------
  const P = [0, 0.16, -0.02];
  const R = 0.12;
  const N = 17;
  for (let i = 0; i < N; i++) {
    const a = -1.3 + (2.6 * i) / (N - 1);
    const dx = Math.sin(a);
    const dy = Math.cos(a);

    const arm = new THREE.BoxGeometry(0.005, 0.05, 0.008);
    arm.rotateZ(-a);
    place(arm, [P[0] + dx * (R - 0.03), P[1] + dy * (R - 0.03), P[2]], GUNMETAL);

    const head = new THREE.BoxGeometry(0.009, 0.009, 0.012);
    head.rotateZ(-a);
    place(head, [P[0] + dx * R, P[1] + dy * R, P[2]], BRASS);
  }

  // ---- Platen, carriage and knobs ---------------------------------------
  cylP(0.03, 0.42, 20, [0, 0.28, -0.10], BLACK, [0, 0, Math.PI / 2]);
  cylP(0.012, 0.02, 10, [-0.225, 0.28, -0.10], CHROME, [0, 0, Math.PI / 2]);
  cylP(0.012, 0.02, 10, [0.225, 0.28, -0.10], CHROME, [0, 0, Math.PI / 2]);

  boxP(0.46, 0.02, 0.05, [0, 0.245, -0.10], GREEN);
  boxP(0.02, 0.07, 0.08, [-0.225, 0.215, -0.10], GREEN);
  boxP(0.02, 0.07, 0.08, [0.225, 0.215, -0.10], GREEN);

  // ---- Paper sheet, half typed ------------------------------------------
  const ph = -0.2;
  const sp = Math.sin(ph);
  const cp = Math.cos(ph);
  const C = [0, 0.41, -0.11];
  boxP(0.22, 0.2, 0.004, C, PAPER, [ph, 0, 0]);

  // Typed lines in the lower half of the sheet.
  const lines = [-0.05, -0.02, 0.01, 0.04];
  for (const yl of lines) {
    let x = -0.095;
    while (x < 0.095) {
      const w = 0.008 + rand() * 0.012;
      if (x + w > 0.095) break;
      const cx = x + w / 2;
      const g = new THREE.BoxGeometry(w, 0.005, 0.0015);
      g.rotateX(ph);
      place(g, [cx, C[1] + yl * cp - sp * 0.0025, C[2] + yl * sp + cp * 0.0025], INK);
      x += w + 0.004 + (rand() < 0.3 ? 0.008 : 0);
    }
  }

  // ---- Chrome carriage return lever --------------------------------------
  boxP(0.03, 0.02, 0.03, [0.235, 0.25, -0.10], CHROME);
  b.sweep(
    [
      [0.235, 0.255, -0.10],
      [0.265, 0.29, -0.085],
      [0.27, 0.34, -0.04],
      [0.27, 0.36, -0.01],
    ],
    0.006,
    { color: CHROME },
  );
  const knob = new THREE.SphereGeometry(0.014, 12, 8);
  place(knob, [0.27, 0.36, -0.01], BLACK);

  // ---- Brass maker's badge on the front ---------------------------------
  boxP(0.10, 0.04, 0.006, [0, 0.085, 0.162], BRASS);
  boxP(0.08, 0.024, 0.004, [0, 0.085, 0.167], GREEN_DEEP);
  for (let k = 0; k < 4; k++) {
    boxP(0.012, 0.003, 0.002, [-0.03 + k * 0.02, 0.085, 0.170], CREAM);
  }
  for (const dx of [-0.046, 0.046]) {
    for (const dy of [-0.015, 0.015]) {
      const rivet = new THREE.SphereGeometry(0.003, 6, 4);
      place(rivet, [dx, 0.085 + dy, 0.165], BRASS);
    }
  }

  return b.root;
}
