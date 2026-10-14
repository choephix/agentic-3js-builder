```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Bat",
  description: "A stylized fruit bat at rest with wings spread, built from primitives on a rigged skeleton.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "bat" });

  const FUR = "#4a3a33", BELLY = "#86705f", MEM = "#2f2533", BONE = "#3b2d2c";
  const PINK = "#d08a96", DARK = "#111111", TOOTH = "#f2eee0", EARIN = "#b9707e";

  const sub = (p: V, q: V): V => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
  const len = (v: V) => Math.hypot(v[0], v[1], v[2]);
  const midp = (p: V, q: V): V => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2];

  // ---------- skeleton ----------
  const root = b.joint("root", { at: [0, 0.09, 0] });
  const chest = b.joint("chest", { at: [0, 0.095, 0.03], parent: root });
  const neck = b.joint("neck", { at: [0, 0.11, 0.065], parent: chest });
  const head = b.joint("head", { at: [0, 0.12, 0.08], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 0.108, 0.095], parent: head });
  const tail = b.joint("tail1", { at: [0, 0.07, -0.07], parent: root });

  const rod = (a: V, c: V, r: number, color: string, bone: any, taper = 0.7) => {
    const l = len(sub(c, a));
    const g = new THREE.CylinderGeometry(r * taper, r, l, 6);
    // cylinder axis +Y; dir points from a toward c, so flip to put wide end at a
    const d = sub(a, c);
    return b.part(g, color, { at: midp(a, c), dir: d, bone });
  };

  // ---------- body ----------
  b.part(new THREE.SphereGeometry(1, 8, 6), FUR, { at: [0, 0.09, -0.005], scale: [0.045, 0.045, 0.072], bone: root });
  b.part(new THREE.SphereGeometry(1, 8, 6), BELLY, { at: [0, 0.078, 0.01], scale: [0.036, 0.034, 0.06], bone: root });
  b.part(new THREE.SphereGeometry(1, 8, 6), FUR, { at: [0, 0.105, 0.04], scale: [0.05, 0.045, 0.04], bone: chest });
  // mane ruff
  b.part(new THREE.SphereGeometry(1, 7, 5), "#6a5446", { at: [0, 0.1, 0.07], scale: [0.04, 0.035, 0.025], bone: neck });
  // tail
  b.part(new THREE.ConeGeometry(0.012, 0.04, 5), FUR, { at: [0, 0.07, -0.09], dir: [0, -0.2, -1], bone: tail });

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(0.03, 8, 6), FUR, { at: [0, 0.122, 0.085], scale: [1, 0.95, 1], bone: head });
  b.part(new THREE.BoxGeometry(0.03, 0.02, 0.03), "#5a463d", { at: [0, 0.113, 0.113], bone: head });
  b.part(new THREE.BoxGeometry(0.014, 0.009, 0.008), PINK, { at: [0, 0.118, 0.13], bone: head });
  // nose leaf
  b.part(new THREE.ConeGeometry(0.008, 0.014, 4), PINK, { at: [0, 0.13, 0.128], dir: [0, 0.6, 0.6], bone: head });
  // lower jaw
  b.part(new THREE.BoxGeometry(0.026, 0.009, 0.034), "#5a463d", { at: [0, 0.103, 0.11], bone: jaw });
  for (const s of [1, -1]) {
    b.part(new THREE.ConeGeometry(0.0035, 0.01, 4), TOOTH, { at: [s * 0.007, 0.1, 0.126], dir: [0, 1, 0], bone: jaw });
    b.part(new THREE.ConeGeometry(0.0035, 0.01, 4), TOOTH, { at: [s * 0.008, 0.103, 0.128], dir: [0, -1, 0], bone: head });
    // eyes
    b.part(new THREE.SphereGeometry(0.0065, 6, 5), DARK, { at: [s * 0.017, 0.13, 0.108], bone: head });
    b.part(new THREE.SphereGeometry(0.0022, 4, 3), "#ffffff", { at: [s * 0.0185, 0.1325, 0.113], bone: head });
  }

  // ---------- ears ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const ear = b.joint("ear" + side, { at: [s * 0.02, 0.145, 0.078], parent: head });
    b.part(new THREE.ConeGeometry(0.02, 0.06, 4), FUR, { at: [s * 0.028, 0.172, 0.073], dir: [s * 0.35, 1, -0.1], bone: ear });
    b.part(new THREE.ConeGeometry(0.013, 0.045, 4), EARIN, { at: [s * 0.0275, 0.169, 0.08], dir: [s * 0.35, 1, -0.1], bone: ear });
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip = b.joint("hip" + side, { at: [s * 0.03, 0.07, -0.04], parent: root });
    const knee = b.joint("knee" + side, { at: [s * 0.05, 0.04, -0.07], parent: hip });
    const ankle = b.joint("ankle" + side, { at: [s * 0.05, 0.012, -0.1], parent: knee });
    rod([s * 0.03, 0.07, -0.04], [s * 0.05, 0.04, -0.07], 0.012, FUR, hip);
    rod([s * 0.05, 0.04, -0.07], [s * 0.05, 0.012, -0.1], 0.008, FUR, knee);
    // foot with toes
    b.part(new THREE.BoxGeometry(0.014, 0.008, 0.02), BONE, { at: [s * 0.05, 0.005, -0.105], bone: ankle });
    for (let i = -1; i <= 1; i++) {
      b.part(new THREE.BoxGeometry(0.003, 0.004, 0.012), "#d8cdb8", { at: [s * 0.05 + i * 0.004, 0.003, -0.12], bone: ankle });
    }
  }

  // ---------- wings ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const P = (x: number, y: number, z: number): V => [s * x, y, z];

    const shoulderP = P(0.035, 0.11, 0.035);
    const elbowP = P(0.1, 0.14, 0.055);
    const wristP = P(0.17, 0.15, 0.04);
    const tips: V[] = [P(0.3, 0.12, 0.15), P(0.36, 0.1, 0.05), P(0.32, 0.07, -0.06), P(0.23, 0.04, -0.13)];
    const hipP = P(0.045, 0.04, -0.075);

    const shoulder = b.joint("shoulder" + side, { at: shoulderP, parent: chest });
    const elbow = b.joint("elbow" + side, { at: elbowP, parent: shoulder });
    const wrist = b.joint("wrist" + side, { at: wristP, parent: elbow });

    // membrane (double sided, one skin)
    const ring: V[] = [shoulderP, elbowP, wristP, tips[0], tips[1], tips[2], tips[3], hipP, P(0.03, 0.07, -0.05)];
    const c: V = [s * 0.16, 0.09, -0.01];
    const pos: number[] = [];
    const push = (p: V) => pos.push(p[0], p[1], p[2]);
    for (let i = 0; i < ring.length; i++) {
      const p = ring[i], q = ring[(i + 1) % ring.length];
      // scallop: dip midpoints between finger tips
      const tri: V[] = [c, p, q];
      const flip = s > 0;
      (flip ? tri : [tri[0], tri[2], tri[1]]).forEach(push);
      (flip ? [tri[0], tri[2], tri[1]] : tri).forEach((p2) => push(p2));
    }
    const mg = new THREE.BufferGeometry();
    mg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    mg.computeVertexNormals();
    b.part(mg, MEM, { at: [0, 0, 0], bone: wrist });

    // arm bones
    rod(shoulderP, elbowP, 0.007, FUR, shoulder);
    rod(elbowP, wristP, 0.006, FUR, elbow);
    b.part(new THREE.SphereGeometry(0.009, 6, 5), FUR, { at: wristP, bone: wrist });
    b.part(new THREE.SphereGeometry(0.011, 6, 5), FUR, { at: shoulderP, bone: shoulder });

    // fingers, each with a knuckle joint
    tips.forEach((t, i) => {
      const k = midp(wristP, t);
      const kj = b.joint(`finger${i + 1}${side}_a`, { at: k, parent: wrist });
      const tj = b.joint(`finger${i + 1}${side}_b`, { at: t, parent: kj });
      rod(wristP, k, 0.0032, BONE, wrist, 0.85);
      rod(k, t, 0.0028, BONE, kj, 0.5);
      b.part(new THREE.SphereGeometry(0.0035, 4, 3), BONE, { at: t, bone: tj });
    });

    // thumb claw
    const thumb = b.joint("thumb" + side, { at: wristP, parent: wrist });
    const thumbTip = P(0.185, 0.175, 0.075);
    rod(wristP, thumbTip, 0.004, FUR, thumb);
    b.part(new THREE.ConeGeometry(0.004, 0.014, 4), "#d8cdb8", { at: [thumbTip[0] + s * 0.003, thumbTip[1] + 0.006, thumbTip[2] + 0.006], dir: [s * 0.3, 0.6, 0.8], bone: thumb });
  }

  return b.root;
}
```