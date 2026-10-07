import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Elephant",
  description: "Stylized African elephant built from primitives, with a jointed trunk, ears, tail, jaw and legs.",
};

export default function build() {
  const b = createBuilder({ name: "elephant" });
  const GREY = "#8a8580", DARK = "#6f6a66", PINK = "#b39590", IVORY = "#efe6cf", NAIL = "#d8cfc0", BLACK = "#1b1b1b";

  const hips = b.joint("hips", { at: [0, 2.0, 0] });
  const chest = b.joint("chest", { at: [0, 2.1, 0.9], parent: hips });
  const head = b.joint("head", { at: [0, 2.4, 1.8], parent: chest });
  const jaw = b.joint("jaw", { at: [0, 1.95, 2.2], parent: head });

  // body
  b.part(new THREE.SphereGeometry(1, 12, 9), GREY, { at: [0, 2.0, 0], bone: hips, scale: [0.98, 0.98, 1.6] });
  b.part(new THREE.SphereGeometry(1, 10, 8), GREY, { at: [0, 2.15, 1.0], bone: chest, scale: [0.9, 0.9, 0.9] });
  // back ridge
  b.part(new THREE.SphereGeometry(1, 8, 6), DARK, { at: [0, 2.9, 0.1], bone: hips, scale: [0.35, 0.15, 1.0] });

  // head
  b.part(new THREE.SphereGeometry(0.66, 10, 8), GREY, { at: [0, 2.4, 1.95], bone: head, scale: [0.95, 1.05, 1.0] });
  b.part(new THREE.SphereGeometry(0.4, 8, 6), GREY, { at: [0, 2.85, 1.9], bone: head, scale: [1.0, 0.7, 0.9] });
  b.part(new THREE.BoxGeometry(0.5, 0.2, 0.5), DARK, { at: [0, 2.0, 2.3], bone: jaw });
  b.part(new THREE.SphereGeometry(0.05, 6, 5), BLACK, { at: [0.43, 2.55, 2.3], bone: head });
  b.part(new THREE.SphereGeometry(0.05, 6, 5), BLACK, { at: [-0.43, 2.55, 2.3], bone: head });

  const seg = (a: number[], c: number[], r0: number, r1: number, color: string, bone: any, n = 8) => {
    const A = new THREE.Vector3(...a), C = new THREE.Vector3(...c);
    const d = C.clone().sub(A);
    b.part(new THREE.CylinderGeometry(r1, r0, d.length(), n), color, {
      at: A.clone().add(C).multiplyScalar(0.5).toArray() as number[], dir: d.normalize().toArray() as number[], bone,
    });
  };

  // trunk
  const tp = [[0, 2.25, 2.4], [0, 1.7, 2.75], [0, 1.1, 2.95], [0, 0.55, 3.05], [0, 0.2, 3.35]];
  const tr = [0.3, 0.25, 0.2, 0.16, 0.11];
  const tj: any[] = [];
  let parent: any = head;
  for (let i = 0; i < 4; i++) {
    const j = b.joint(`trunk${i + 1}`, { at: tp[i], parent });
    tj.push(j); parent = j;
  }
  for (let i = 0; i < 4; i++) {
    seg(tp[i], tp[i + 1], tr[i], tr[i + 1], GREY, tj[i]);
    b.part(new THREE.SphereGeometry(tr[i + 1], 8, 6), GREY, { at: tp[i + 1], bone: tj[i] });
    // wrinkle rings
    const m = [(tp[i][0] + tp[i + 1][0]) / 2, (tp[i][1] + tp[i + 1][1]) / 2, (tp[i][2] + tp[i + 1][2]) / 2];
    b.part(new THREE.TorusGeometry((tr[i] + tr[i + 1]) / 2 + 0.01, 0.02, 4, 10), DARK, {
      at: m, dir: [0, tp[i + 1][1] - tp[i][1], tp[i + 1][2] - tp[i][2]], bone: tj[i],
    });
  }

  // tusks
  for (const s of [1, -1]) {
    const base = new THREE.Vector3(s * 0.38, 2.0, 2.4);
    const tip = new THREE.Vector3(s * 0.55, 1.3, 3.2);
    const d = tip.clone().sub(base);
    b.part(new THREE.ConeGeometry(0.1, d.length(), 7), IVORY, {
      at: base.clone().add(tip).multiplyScalar(0.5).toArray() as number[], dir: d.clone().negate().normalize().toArray() as number[], bone: head,
    });
  }

  // ears
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const ear = b.joint(`ear${n}`, { at: [s * 0.6, 2.75, 1.7], parent: head });
    b.part(new THREE.SphereGeometry(1, 10, 8), GREY, { at: [s * 0.85, 2.5, 1.45], bone: ear, scale: [0.06, 0.8, 0.65] });
    b.part(new THREE.SphereGeometry(1, 10, 8), PINK, { at: [s * 0.9, 2.45, 1.45], bone: ear, scale: [0.04, 0.62, 0.48] });
  }

  // legs
  const legs: [string, number, number][] = [["FL", 1, 1.0], ["FR", -1, 1.0], ["BL", 1, -0.95], ["BR", -1, -0.95]];
  for (const [n, s, z] of legs) {
    const x = s * 0.58;
    const hip = b.joint(`hip${n}`, { at: [x, 1.5, z], parent: hips });
    const foot = b.joint(`foot${n}`, { at: [x, 0.2, z], parent: hip });
    seg([x, 0.2, z], [x, 1.6, z], 0.3, 0.36, GREY, hip, 9);
    b.part(new THREE.CylinderGeometry(0.34, 0.37, 0.24, 9), DARK, { at: [x, 0.12, z], bone: foot });
    for (let k = -1; k <= 1; k++) {
      b.part(new THREE.BoxGeometry(0.16, 0.13, 0.08), NAIL, { at: [x + k * 0.16, 0.08, z + 0.34 - Math.abs(k) * 0.04], bone: foot });
    }
  }

  // tail
  const t1 = b.joint("tail1", { at: [0, 2.6, -1.55], parent: hips });
  const t2 = b.joint("tail2", { at: [0, 2.0, -1.7], parent: t1 });
  const t3 = b.joint("tail3", { at: [0, 1.4, -1.75], parent: t2 });
  seg([0, 2.6, -1.55], [0, 2.0, -1.7], 0.07, 0.05, GREY, t1, 6);
  seg([0, 2.0, -1.7], [0, 1.4, -1.75], 0.05, 0.04, GREY, t2, 6);
  b.part(new THREE.SphereGeometry(0.1, 6, 5), DARK, { at: [0, 1.3, -1.75], bone: t3, scale: [1, 1.5, 1] });

  return b.root;
}
