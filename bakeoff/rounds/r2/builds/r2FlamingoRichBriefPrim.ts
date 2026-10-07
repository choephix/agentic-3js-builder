import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Flamingo",
  description: "Stylized flamingo wading in shallow water: S-curved neck, bent beak, black wing tips, long rose legs with knobbly knees and webbed feet.",
};

export default function build() {
  const b = createBuilder({ name: "flamingo" });
  const PINK = "#f78fa7", LIGHT = "#fbb4c4", CORAL = "#ee6a5e", ROSE = "#d8607a";
  const BLACK = "#1b1416", BEAK = "#f6c4cc", EYE = "#f5e68a", KNEE = "#c24a68", WATER = "#8fd0d8";

  type V = [number, number, number];
  const norm = (v: V): V => { const l = Math.hypot(...v) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const mid = (a: V, c: V): V => [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];

  // ---- skeleton
  const root = b.joint("hips", { at: [0, 0.8, -0.05] });
  const spine = b.joint("spine", { at: [0, 0.86, 0.12], parent: root });
  const neckPts: V[] = [
    [0, 0.92, 0.26], [0, 1.04, 0.36], [0, 1.2, 0.32],
    [0, 1.36, 0.22], [0, 1.5, 0.24], [0, 1.58, 0.32],
  ];
  const neckJ: THREE.Object3D[] = [];
  let prev: any = spine;
  neckPts.forEach((p, i) => { prev = b.joint("neck" + (i + 1), { at: p, parent: prev }); neckJ.push(prev); });
  const head = b.joint("head", { at: [0, 1.6, 0.35], parent: prev });
  const jaw = b.joint("jaw", { at: [0, 1.59, 0.4], parent: head });
  const tail = b.joint("tail1", { at: [0, 0.82, -0.3], parent: root });

  const rod = (a: V, c: V, r1: number, r2: number, color: string, bone: any, seg = 6) => {
    const len = Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    b.part(new THREE.CylinderGeometry(r2, r1, len, seg), color, { at: mid(a, c), dir: norm([c[0] - a[0], c[1] - a[1], c[2] - a[2]]), bone });
  };
  const ball = (p: V, r: number, color: string, bone: any, sc?: V, seg = 8) =>
    b.part(new THREE.SphereGeometry(r, seg, seg - 2), color, { at: p, bone, ...(sc ? { scale: sc } : {}) });

  // ---- body
  ball([0, 0.86, -0.04], 1, PINK, root, [0.2, 0.22, 0.36], 10);
  ball([0, 0.82, 0.12], 1, LIGHT, spine, [0.15, 0.15, 0.2]);
  ball([0, 0.78, -0.02], 1, LIGHT, root, [0.17, 0.12, 0.3]);
  // tail
  b.part(new THREE.BoxGeometry(0.14, 0.03, 0.2), PINK, { at: [0, 0.84, -0.4], dir: norm([0, -0.2, -1]), bone: tail });
  b.part(new THREE.BoxGeometry(0.1, 0.02, 0.14), BLACK, { at: [0, 0.8, -0.52], bone: tail });
  // chest ruffle
  ball([0, 0.92, 0.22], 1, LIGHT, spine, [0.12, 0.13, 0.12]);

  // ---- neck (S-curve)
  neckPts.forEach((p, i) => {
    const r = 0.052 - i * 0.004;
    ball(p, r + 0.004, i % 2 ? PINK : LIGHT, neckJ[i]);
    if (i < neckPts.length - 1) rod(p, neckPts[i + 1], r, r - 0.004, PINK, neckJ[i]);
  });
  // ---- head
  ball([0, 1.61, 0.35], 0.065, PINK, head, [1, 0.95, 1.1]);
  // beak: upper (bent), pale with black tip
  const bk: V = [0, 1.595, 0.41];
  b.part(new THREE.BoxGeometry(0.07, 0.04, 0.12), BEAK, { at: [0, 1.6, 0.44], bone: head });
  b.part(new THREE.BoxGeometry(0.065, 0.045, 0.1), BEAK, { at: [0, 1.585, 0.53], dir: norm([0, -0.35, 1]), bone: head });
  b.part(new THREE.ConeGeometry(0.036, 0.1, 5), BLACK, { at: [0, 1.545, 0.6], dir: norm([0, -0.8, 0.6]), bone: head });
  // lower jaw
  b.part(new THREE.BoxGeometry(0.055, 0.025, 0.14), BEAK, { at: [0, 1.572, 0.47], bone: jaw });
  b.part(new THREE.BoxGeometry(0.05, 0.025, 0.08), BLACK, { at: [0, 1.552, 0.56], dir: norm([0, -0.5, 1]), bone: jaw });
  // eyes
  for (const s of [1, -1]) {
    ball([s * 0.052, 1.63, 0.38], 0.02, EYE, head);
    ball([s * 0.067, 1.63, 0.385], 0.009, BLACK, head, undefined, 6);
    ball([s * 0.04, 1.65, 0.38], 0.022, ROSE, head, [1, 0.3, 1.2], 6);
  }

  // ---- wings
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const w = b.joint("wing" + n, { at: [s * 0.17, 0.95, 0.1], parent: spine });
    const wt = b.joint("wingTip" + n, { at: [s * 0.18, 0.78, -0.38], parent: w });
    const d = norm([0, -0.24, -0.97]);
    b.part(new THREE.SphereGeometry(1, 9, 7), CORAL, { at: [s * 0.18, 0.88, -0.04], dir: d, scale: [0.05, 0.36, 0.17], bone: w });
    b.part(new THREE.SphereGeometry(1, 8, 6), PINK, { at: [s * 0.19, 0.93, 0.08], dir: d, scale: [0.045, 0.2, 0.13], bone: w });
    // coral covert rows
    for (let i = 0; i < 3; i++)
      b.part(new THREE.BoxGeometry(0.035, 0.2, 0.07), i % 2 ? CORAL : ROSE, { at: [s * (0.21), 0.9 - i * 0.03, -0.02 - i * 0.07], dir: d, bone: w });
    // black flight feathers
    for (let i = 0; i < 4; i++) {
      const z = -0.3 - i * 0.045;
      b.part(new THREE.BoxGeometry(0.028, 0.2, 0.06), BLACK, {
        at: [s * (0.185 + i * 0.012), 0.8 - i * 0.012, z], dir: norm([s * 0.05 * i, -0.2, -1]), bone: wt,
      });
    }
  }

  // ---- legs
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const hip: V = [s * 0.08, 0.76, -0.04];
    const knee: V = [s * 0.085, 0.42, -0.06];
    const ankle: V = [s * 0.085, 0.05, 0.03];
    const hipJ = b.joint("hip" + n, { at: hip, parent: root });
    const kneeJ = b.joint("knee" + n, { at: knee, parent: hipJ });
    const ankJ = b.joint("ankle" + n, { at: ankle, parent: kneeJ });
    ball([hip[0], 0.74, hip[2]], 1, PINK, hipJ, [0.09, 0.12, 0.1]);
    rod([hip[0], 0.72, hip[2]], knee, 0.022, 0.018, ROSE, hipJ);
    ball(knee, 0.038, KNEE, kneeJ, [1, 1, 1.05], 7);
    ball([knee[0] + s * 0.015, knee[1] + 0.02, knee[2] + 0.01], 0.02, KNEE, kneeJ, undefined, 5);
    rod(knee, ankle, 0.017, 0.016, ROSE, kneeJ);
    ball(ankle, 0.026, KNEE, ankJ, undefined, 6);
    // toes + web
    const toes: [number, number][] = [[-0.07, 0.17], [0, 0.2], [0.07, 0.17]];
    toes.forEach(([dx, dz], i) => {
      const tip: V = [ankle[0] + s * dx, 0.02, ankle[2] + dz];
      rod([ankle[0], 0.04, ankle[2]], tip, 0.014, 0.01, ROSE, ankJ, 5);
      ball(tip, 0.014, KNEE, ankJ, [1, 0.7, 1.3], 5);
    });
    b.part(new THREE.CylinderGeometry(0.1, 0.01, 0.008, 3), "#f1a0b4", { at: [ankle[0], 0.02, ankle[2] + 0.1], dir: [0, 1, 0], bone: ankJ, scale: [1, 1, 1.2] });
  }

  // ---- shallow water
  const water = b.joint("water", { at: [0, 0, 0], parent: root });
  b.part(new THREE.CylinderGeometry(0.95, 0.95, 0.03, 20), WATER, { at: [0, 0.0, 0], bone: water });
  for (const r of [0.28, 0.45]) {
    b.part(new THREE.TorusGeometry(r, 0.008, 4, 24), "#d6f1f2", { at: [0, 0.02, 0.02], dir: [0, 1, 0], bone: water });
  }
  return b.root;
}
