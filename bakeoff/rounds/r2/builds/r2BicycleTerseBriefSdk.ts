import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Vintage Bicycle",
  description: "A classic city bicycle with a green steel frame, leather saddle and grips, cream fenders, a rear rack, lamp, bell and chain drive.",
};

export default function build() {
  const b = createBuilder({ name: "vintage_bicycle" });

  const GREEN = "#1f5c4a", CHROME = "#c9ced3", TIRE = "#222222", LEATHER = "#7a4a26";
  const CREAM = "#efe6cf", BLACK = "#1a1a1a", BRASS = "#c9a24a", GLASS = "#f6efc0";

  const frameJ = b.joint("frame", { at: [0, 0.3, 0] });
  const fork = b.joint("fork", { at: [0, 0.78, 0.4], parent: frameJ });
  const wheelF = b.joint("wheelF", { at: [0, 0.345, 0.52], parent: fork });
  const wheelR = b.joint("wheelR", { at: [0, 0.345, -0.52], parent: frameJ });
  const crank = b.joint("crank", { at: [0, 0.3, 0], parent: frameJ });
  const pedalR = b.joint("pedalR", { at: [-0.1, 0.18, 0.05], parent: crank });
  const pedalL = b.joint("pedalL", { at: [0.1, 0.42, -0.05], parent: crank });

  const V = (p: number[]) => new THREE.Vector3(p[0], p[1], p[2]);

  function rod(a: number[], c: number[], r: number, color: string, bone: any, seg = 6) {
    const A = V(a), C = V(c);
    const d = C.clone().sub(A);
    const L = d.length();
    const g = new THREE.CylinderGeometry(r, r, L, seg);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    g.applyMatrix4(new THREE.Matrix4().compose(A.clone().add(C).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1)));
    b.part(g, color, { at: [0, 0, 0], bone });
  }
  function put(g: THREE.BufferGeometry, p: number[], color: string, bone: any, rot?: number[]) {
    if (rot) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rot[0], rot[1], rot[2])));
    g.translate(p[0], p[1], p[2]);
    b.part(g, color, { at: [0, 0, 0], bone });
  }

  // ---- frame ----
  const BB = [0, 0.3, 0], ST = [0, 0.95, -0.18], HT = [0, 0.9, 0.37], HB = [0, 0.77, 0.41];
  const RA = [0, 0.345, -0.52];
  rod(BB, [0, 0.93, -0.175], 0.014, GREEN, frameJ);
  rod([0, 0.88, -0.16], HT, 0.014, GREEN, frameJ);
  rod(BB, HB, 0.018, GREEN, frameJ);
  rod(HT, HB, 0.024, GREEN, frameJ, 8);
  rod([0, 0.9, 0.375], [0, 0.78, 0.41], 0.012, CHROME, frameJ);
  for (const s of [-1, 1]) {
    rod(BB, [s * 0.06, RA[1], RA[2]], 0.01, GREEN, frameJ);
    rod([0, 0.86, -0.165], [s * 0.06, RA[1], RA[2]], 0.008, GREEN, frameJ);
  }
  put(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 8), BB, CHROME, frameJ, [0, 0, Math.PI / 2]);

  // seat
  rod([0, 0.93, -0.175], [0, 1.0, -0.19], 0.011, CHROME, frameJ);
  const sad = new THREE.SphereGeometry(1, 8, 6);
  sad.scale(0.095, 0.035, 0.16);
  put(sad, [0, 1.03, -0.2], LEATHER, frameJ);
  const nose = new THREE.SphereGeometry(1, 6, 5);
  nose.scale(0.035, 0.025, 0.08);
  put(nose, [0, 1.035, -0.07], LEATHER, frameJ);
  for (const s of [-1, 1]) rod([s * 0.04, 1.0, -0.33], [s * 0.025, 1.0, -0.1], 0.005, CHROME, frameJ, 4);
  put(new THREE.CylinderGeometry(0.02, 0.02, 0.05, 6), [0, 1.0, -0.19], CHROME, frameJ);

  // drivetrain
  put(new THREE.CylinderGeometry(0.1, 0.1, 0.012, 20), [-0.07, 0.3, 0], CHROME, crank, [0, 0, Math.PI / 2]);
  put(new THREE.CylinderGeometry(0.04, 0.04, 0.01, 10), [-0.085, 0.3, 0], BLACK, crank, [0, 0, Math.PI / 2]);
  rod([-0.1, 0.3, 0], [-0.1, 0.18, 0.05], 0.012, CHROME, crank);
  rod([0.1, 0.3, 0], [0.1, 0.42, -0.05], 0.012, CHROME, crank);
  rod([-0.1, 0.3, 0], [0.1, 0.3, 0], 0.008, CHROME, crank);
  put(new THREE.BoxGeometry(0.1, 0.02, 0.09), [-0.15, 0.18, 0.05], BLACK, pedalR);
  put(new THREE.BoxGeometry(0.1, 0.02, 0.09), [0.15, 0.42, -0.05], BLACK, pedalL);
  put(new THREE.CylinderGeometry(0.045, 0.045, 0.01, 12), [-0.065, 0.345, -0.52], CHROME, wheelR, [0, 0, Math.PI / 2]);
  rod([-0.065, 0.4, 0], [-0.065, 0.388, -0.52], 0.004, BLACK, frameJ, 4);
  rod([-0.065, 0.2, 0], [-0.065, 0.302, -0.52], 0.004, BLACK, frameJ, 4);

  // ---- wheels ----
  function wheel(center: number[], bone: any) {
    const tire = new THREE.TorusGeometry(0.32, 0.026, 6, 28);
    put(tire, center, TIRE, bone, [0, Math.PI / 2, 0]);
    const rim = new THREE.TorusGeometry(0.29, 0.008, 4, 28);
    rim.scale(1, 1, 3);
    put(rim, center, CHROME, bone, [0, Math.PI / 2, 0]);
    put(new THREE.CylinderGeometry(0.025, 0.025, 0.1, 8), center, CHROME, bone, [0, 0, Math.PI / 2]);
    for (const s of [-1, 1]) put(new THREE.CylinderGeometry(0.04, 0.04, 0.006, 8), [center[0] + s * 0.045, center[1], center[2]], CHROME, bone, [0, 0, Math.PI / 2]);
    const n = 14;
    for (let i = 0; i < n; i++) {
      for (const s of [-1, 1]) {
        const a = (i / n) * Math.PI * 2;
        const e = a + s * 0.6;
        rod(
          [center[0] + s * 0.04, center[1] + Math.cos(a) * 0.035, center[2] + Math.sin(a) * 0.035],
          [center[0], center[1] + Math.cos(e) * 0.29, center[2] + Math.sin(e) * 0.29],
          0.0016, CHROME, bone, 3
        );
      }
    }
  }
  wheel([0, 0.345, 0.52], wheelF);
  wheel([0, 0.345, -0.52], wheelR);

  // fenders
  function fender(center: number[], start: number, arcLen: number, bone: any) {
    const g = new THREE.TorusGeometry(0.37, 0.025, 4, 14, arcLen);
    g.rotateZ(start);
    g.rotateY(Math.PI / 2);
    g.scale(2.2, 1, 1);
    put(g, center, CREAM, bone);
  }
  fender([0, 0.345, -0.52], -0.15, 2.3, frameJ);
  fender([0, 0.345, 0.52], 0.9, 2.3, fork);
  rod([0, 0.7, -0.58], [0, 0.4, -0.2], 0.0001, CREAM, frameJ, 3);

  // fork
  put(new THREE.BoxGeometry(0.14, 0.03, 0.04), [0, 0.78, 0.4], GREEN, fork);
  for (const s of [-1, 1]) {
    rod([s * 0.065, 0.78, 0.4], [s * 0.055, 0.345, 0.52], 0.011, GREEN, fork);
    rod([s * 0.055, 0.345, 0.52], [s * 0.055, 0.6, 0.54], 0.004, CHROME, fork, 4);
  }

  // handlebar
  rod([0, 0.9, 0.37], [0, 1.0, 0.35], 0.013, CHROME, fork);
  const bar = [[0.0, 1.0, 0.35], [0.18, 1.02, 0.36], [0.33, 1.0, 0.3], [0.37, 0.97, 0.16], [0.36, 0.95, 0.05]];
  for (const s of [-1, 1]) {
    for (let i = 0; i < bar.length - 1; i++) {
      const p = bar[i], q = bar[i + 1];
      rod([s * p[0], p[1], p[2]], [s * q[0], q[1], q[2]], 0.01, CHROME, fork);
    }
    rod([s * 0.37, 0.97, 0.16], [s * 0.36, 0.95, -0.02], 0.016, LEATHER, fork, 8);
    rod([s * 0.34, 1.0, 0.25], [s * 0.3, 0.99, 0.13], 0.005, BLACK, fork, 4);
  }
  // bell
  const bell = new THREE.SphereGeometry(0.03, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2);
  put(bell, [0.22, 1.035, 0.36], BRASS, fork);
  // lamp
  rod([0, 0.82, 0.43], [0, 0.88, 0.5], 0.006, BLACK, fork, 4);
  put(new THREE.CylinderGeometry(0.05, 0.045, 0.07, 10), [0, 0.89, 0.52], BLACK, fork, [Math.PI / 2, 0, 0]);
  put(new THREE.CylinderGeometry(0.038, 0.038, 0.01, 10), [0, 0.89, 0.558], GLASS, fork, [Math.PI / 2, 0, 0]);

  // rear rack & light
  put(new THREE.BoxGeometry(0.14, 0.012, 0.26), [0, 0.74, -0.6], BLACK, frameJ);
  for (const s of [-1, 1]) {
    rod([s * 0.06, 0.74, -0.5], [s * 0.06, 0.345, -0.52], 0.004, BLACK, frameJ, 4);
    rod([s * 0.06, 0.74, -0.72], [s * 0.06, 0.345, -0.52], 0.004, BLACK, frameJ, 4);
  }
  put(new THREE.BoxGeometry(0.03, 0.03, 0.015), [0, 0.7, -0.73], "#b02020", frameJ);

  return b.root;
}
