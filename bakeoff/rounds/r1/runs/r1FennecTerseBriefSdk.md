```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Fennec fox",
  description: "A small sand-coloured desert fox with huge ears, a bushy black-tipped tail and a rigged jaw, ears, legs and tail.",
};

export default function build() {
  const b = createBuilder({ name: "fennec" });
  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const mat = (c: string) =>
    (mats[c] ??= new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, metalness: 0.02, flatShading: true }));

  const JP = new Map<any, THREE.Vector3>();
  const J = (name: string, at: number[], parent?: any) => {
    const j = parent ? b.joint(name, { at: at as any, parent }) : b.joint(name, { at: at as any });
    JP.set(j, new THREE.Vector3(...at));
    return j;
  };
  const place = (j: any, world: THREE.Vector3, m: THREE.Object3D, parent: THREE.Object3D = j) => {
    m.position.copy(world).sub(JP.get(j)!);
    parent.add(m);
    return m;
  };
  const Z = new THREE.Vector3(0, 0, 1);
  const Y = new THREE.Vector3(0, 1, 0);
  // ellipsoid blob, long axis along z, optionally oriented to dir
  const blob = (j: any, c: number[], r: number[], color: string, dir?: number[], seg = 8) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, seg, Math.max(5, seg - 2)), mat(color));
    m.scale.set(r[0], r[1], r[2]);
    if (dir) {
      const q = new THREE.Quaternion().setFromUnitVectors(Z, new THREE.Vector3(...dir).normalize());
      m.quaternion.copy(q);
    }
    return place(j, new THREE.Vector3(...c), m);
  };
  const seg = (j: any, a: number[], c: number[], r1: number, r2: number, color: string) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...c);
    const len = A.distanceTo(B);
    const g = new THREE.CylinderGeometry(r2, r1, len, 6);
    const m = new THREE.Mesh(g, mat(color));
    m.quaternion.setFromUnitVectors(Y, B.clone().sub(A).normalize());
    return place(j, A.clone().add(B).multiplyScalar(0.5), m);
  };
  const cone = (r: number, h: number, sides: number, color: string) => {
    const g = new THREE.ConeGeometry(r, h, sides);
    return new THREE.Mesh(g, mat(color));
  };

  const SAND = "#e6bd86", CREAM = "#f7ead4", DARK = "#2b211d", PINK = "#d99a90", TAN = "#cf9d66", EYE = "#140d0b";

  // ---------- skeleton ----------
  const hips = J("hips", [0, 0.2, -0.14]);
  const spine = J("spine", [0, 0.2, -0.02], hips);
  const chest = J("chest", [0, 0.21, 0.1], spine);
  const neck = J("neck", [0, 0.25, 0.17], chest);
  const head = J("head", [0, 0.29, 0.22], neck);
  const jaw = J("jaw", [0, 0.272, 0.255], head);
  const earL = J("earL", [0.035, 0.325, 0.2], head);
  const earR = J("earR", [-0.035, 0.325, 0.2], head);

  const tp = [[0, 0.2, -0.26], [0, 0.17, -0.37], [0, 0.12, -0.46], [0, 0.07, -0.53]];
  const tails: any[] = [];
  tp.forEach((p, i) => tails.push(J("tail" + (i + 1), p, i ? tails[i - 1] : hips)));

  // ---------- body ----------
  blob(spine, [0, 0.2, -0.04], [0.082, 0.082, 0.2], SAND, undefined, 10);
  blob(chest, [0, 0.205, 0.1], [0.078, 0.082, 0.09], SAND);
  blob(hips, [0, 0.195, -0.15], [0.08, 0.08, 0.09], SAND);
  blob(spine, [0, 0.145, 0.02], [0.06, 0.05, 0.19], CREAM); // belly
  blob(chest, [0, 0.19, 0.17], [0.05, 0.065, 0.05], CREAM); // chest bib
  blob(neck, [0, 0.255, 0.17], [0.055, 0.06, 0.07], SAND);
  blob(neck, [0, 0.235, 0.2], [0.045, 0.045, 0.05], CREAM);

  // ---------- head ----------
  blob(head, [0, 0.29, 0.23], [0.062, 0.054, 0.06], SAND, undefined, 10);
  // cheek ruffs
  for (const s of [1, -1]) {
    blob(head, [0.052 * s, 0.275, 0.23], [0.025, 0.035, 0.04], CREAM, [0.3 * s, 0, 1], 6);
    blob(head, [0.018 * s, 0.31, 0.275], [0.014, 0.012, 0.014], TAN, undefined, 5); // brow tuft
  }
  // snout (upper)
  const snout = cone(0.034, 0.085, 6, SAND);
  snout.geometry.rotateX(Math.PI / 2);
  snout.scale.set(1, 0.75, 1);
  place(head, new THREE.Vector3(0, 0.282, 0.31), snout);
  const bridge = cone(0.03, 0.05, 5, CREAM);
  bridge.geometry.rotateX(Math.PI / 2);
  bridge.scale.set(1, 0.4, 1);
  place(head, new THREE.Vector3(0, 0.268, 0.305), bridge);
  blob(head, [0, 0.285, 0.358], [0.014, 0.011, 0.012], DARK, undefined, 6); // nose
  // lower jaw
  const lj = cone(0.027, 0.07, 5, CREAM);
  lj.geometry.rotateX(Math.PI / 2);
  lj.scale.set(1, 0.4, 1);
  place(jaw, new THREE.Vector3(0, 0.262, 0.3), lj);
  blob(jaw, [0, 0.264, 0.255], [0.03, 0.014, 0.03], CREAM, undefined, 6);
  // eyes
  for (const s of [1, -1]) {
    blob(head, [0.03 * s, 0.3, 0.272], [0.011, 0.014, 0.01], EYE, [0.5 * s, 0, 1], 6);
    blob(head, [0.034 * s, 0.304, 0.279], [0.003, 0.004, 0.003], "#ffffff", undefined, 4);
    // dark eye-line toward nose
    blob(head, [0.03 * s, 0.29, 0.3], [0.006, 0.004, 0.025], DARK, [0.15 * s, -0.1, 1], 4);
  }

  // ---------- ears ----------
  for (const [ej, s] of [[earL, 1], [earR, -1]] as [any, number][]) {
    const g = new THREE.Group();
    g.rotation.z = -0.28 * s;
    g.rotation.x = -0.08;
    const outer = cone(0.04, 0.17, 5, SAND);
    outer.scale.set(1, 1, 0.35);
    outer.position.y = 0.085;
    const rim = cone(0.043, 0.178, 5, CREAM);
    rim.scale.set(1, 1, 0.3);
    rim.position.set(0, 0.085, -0.004);
    const inner = cone(0.031, 0.14, 5, PINK);
    inner.scale.set(1, 1, 0.3);
    inner.position.set(0, 0.075, 0.007);
    const tip = cone(0.012, 0.03, 4, DARK);
    tip.scale.set(1, 1, 0.4);
    tip.position.set(0, 0.17, 0);
    g.add(rim, outer, inner, tip);
    place(ej, JP.get(ej)!, g);
  }

  // ---------- legs ----------
  const leg = (s: number, front: boolean) => {
    const side = s > 0 ? "L" : "R";
    const x = 0.05 * s;
    const z0 = front ? 0.11 : -0.16;
    const top = J((front ? "shoulder" : "hip") + side, [x, 0.19, z0], front ? chest : hips);
    const mid = J((front ? "elbow" : "knee") + side, [x, 0.105, z0 + (front ? -0.01 : 0.03)], top);
    const ank = J((front ? "wrist" : "ankle") + side, [x, 0.045, z0 + (front ? 0.0 : -0.01)], mid);
    const paw = J((front ? "pawF" : "pawB") + side, [x, 0.012, z0 + 0.02], ank);
    blob(top, [x, 0.165, z0], [0.04, 0.07, 0.05], SAND, undefined, 7);
    seg(top, [x, 0.17, z0], [x, 0.105, z0 + (front ? -0.01 : 0.03)], 0.026, 0.02, SAND);
    seg(mid, [x, 0.105, z0 + (front ? -0.01 : 0.03)], [x, 0.045, z0 + (front ? 0 : -0.01)], 0.02, 0.014, front ? TAN : SAND);
    blob(ank, [x, 0.014, z0 + 0.03], [0.021, 0.015, 0.035], front ? CREAM : TAN, undefined, 6);
    blob(paw, [x, 0.012, z0 + 0.05], [0.017, 0.012, 0.018], DARK, undefined, 5); // toe pad hint
  };
  leg(1, true); leg(-1, true); leg(1, false); leg(-1, false);

  // ---------- tail ----------
  blob(tails[0], [0, 0.195, -0.3], [0.05, 0.05, 0.07], SAND, [0, -0.2, -1], 8);
  blob(tails[1], [0, 0.155, -0.4], [0.062, 0.062, 0.085], SAND, [0, -0.5, -1], 8);
  blob(tails[2], [0, 0.105, -0.48], [0.062, 0.062, 0.08], SAND, [0, -0.6, -1], 8);
  blob(tails[3], [0, 0.065, -0.54], [0.05, 0.05, 0.06], DARK, [0, -0.5, -1], 8);
  blob(tails[1], [0, 0.135, -0.4], [0.045, 0.04, 0.07], TAN, [0, -0.5, -1], 6);

  // back saddle tint
  blob(spine, [0, 0.245, -0.04], [0.05, 0.03, 0.17], TAN, undefined, 7);

  return b.root;
}
```