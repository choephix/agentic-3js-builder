```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";

export const meta = {
  name: "Moss Stone Forest Spirit",
  description: "A deer-like forest spirit with a river-stone body, moss, wooden legs, flowering antlers, a wooden mask face and fireflies.",
};

export default function build() {
  const b = createBuilder({ name: "forestSpirit" });
  const R = rng(7);

  const hips = b.joint("hips", { at: [0, 0.62, -0.25] });
  const chest = b.joint("chest", { at: [0, 0.68, 0.25], parent: hips });
  const neck = b.joint("neck", { at: [0, 0.88, 0.45], parent: chest });
  const head = b.joint("head", { at: [0, 1.15, 0.6], parent: neck });
  const jaw = b.joint("jaw", { at: [0, 1.1, 0.68], parent: head });
  const tail = b.joint("tail1", { at: [0, 0.72, -0.55], parent: hips });

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const up = V(0, 1, 0);

  function part(geo: THREE.BufferGeometry, color: string, pos: THREE.Vector3, bone: any, scale?: THREE.Vector3, quat?: THREE.Quaternion) {
    const m = new THREE.Matrix4().compose(new THREE.Vector3(), quat ?? new THREE.Quaternion(), scale ?? V(1, 1, 1));
    geo.applyMatrix4(m);
    return b.part(geo, color, { at: [pos.x, pos.y, pos.z], bone });
  }
  function seg(a: THREE.Vector3, c: THREE.Vector3, r0: number, r1: number, color: string, bone: any, sides = 6) {
    const d = c.clone().sub(a);
    const len = d.length();
    const g = new THREE.CylinderGeometry(r1, r0, len, sides);
    const q = new THREE.Quaternion().setFromUnitVectors(up, d.normalize());
    return part(g, color, a.clone().add(c).multiplyScalar(0.5), bone, undefined, q);
  }
  const ball = (r: number, color: string, pos: THREE.Vector3, bone: any, s = V(1, 1, 1), det = 0) =>
    part(new THREE.IcosahedronGeometry(r, det), color, pos, bone, s);

  // Stone body
  const bc = V(0, 0.74, 0);
  const bs = V(0.3, 0.27, 0.58);
  ball(1, "#7c8284", bc, hips, bs, 1);
  ball(1, "#6a7072", V(0, 0.7, 0.28), chest, V(0.26, 0.24, 0.3), 0);
  ball(1, "#8c9294", V(0.12, 0.62, -0.2), hips, V(0.22, 0.2, 0.3), 0);
  // pale river streak
  ball(1, "#b9bfbd", V(0.27, 0.78, 0.05), hips, V(0.04, 0.12, 0.25), 0);
  ball(1, "#b9bfbd", V(-0.27, 0.74, -0.1), hips, V(0.04, 0.1, 0.2), 0);

  // Moss clumps
  const greens = ["#4f8a3a", "#6aa648", "#3d7230", "#86bb58"];
  for (let i = 0; i < 38; i++) {
    const th = R() * Math.PI * 2;
    const el = 0.25 + R() * 1.2;
    const dir = V(Math.cos(el) * Math.cos(th), Math.sin(el), Math.cos(el) * Math.sin(th));
    const p = bc.clone().add(V(dir.x * bs.x, dir.y * bs.y, dir.z * bs.z).multiplyScalar(0.95));
    const r = 0.05 + R() * 0.07;
    ball(r, greens[i % 4], p, i % 2 ? hips : chest, V(1.2, 0.6, 1.2), 0);
  }
  // moss mane along the neck/back
  for (let i = 0; i < 6; i++) {
    ball(0.06, greens[(i + 1) % 4], V(0, 0.98 - i * 0.02 + (i > 3 ? 0 : i * 0.04), 0.5 - i * 0.18), i < 2 ? neck : hips, V(1, 0.7, 1.2), 0);
  }
  // tail tuft
  ball(0.08, "#6aa648", V(0, 0.74, -0.62), tail, V(1, 1.1, 1.3), 0);
  ball(0.05, "#86bb58", V(0, 0.8, -0.7), tail, V(1, 1, 1.3), 0);

  // Legs
  const wood = "#8a6a45", woodD = "#6b4e30", hoofC = "#2e2a26";
  const legs: [string, number, number, any][] = [
    ["FL", 0.17, 0.3, chest], ["FR", -0.17, 0.3, chest],
    ["BL", 0.17, -0.38, hips], ["BR", -0.17, -0.38, hips],
  ];
  for (const [n, x, z, par] of legs) {
    const hp = V(x, 0.55, z), kn = V(x, 0.3, z + (z > 0 ? 0.02 : -0.04)), ft = V(x, 0.07, z + (z > 0 ? 0.0 : 0.02));
    const hj = b.joint("hip" + n, { at: [hp.x, hp.y, hp.z], parent: par });
    const kj = b.joint("knee" + n, { at: [kn.x, kn.y, kn.z], parent: hj });
    const fj = b.joint("hoof" + n, { at: [ft.x, ft.y, ft.z], parent: kj });
    seg(hp, kn, 0.045, 0.032, wood, hj);
    seg(kn, ft, 0.03, 0.022, woodD, kj);
    ball(0.04, wood, hp, hj, V(1, 1, 1), 0);
    ball(0.032, woodD, kn, kj, V(1, 1, 1), 0);
    part(new THREE.CylinderGeometry(0.03, 0.04, 0.08, 6), hoofC, V(x, 0.04, ft.z + 0.005), fj);
    ball(0.035, "#4f8a3a", V(x, 0.5, z), hj, V(1.2, 0.6, 1.2), 0); // moss cuff
  }

  // Neck
  seg(V(0, 0.85, 0.4), V(0, 1.12, 0.6), 0.09, 0.06, wood, neck, 7);
  ball(0.07, "#6aa648", V(0, 0.95, 0.4), neck, V(1.3, 0.7, 1.2), 0);

  // Head: wooden mask
  const mask = "#e0cba2";
  ball(1, mask, V(0, 1.2, 0.64), head, V(0.11, 0.15, 0.1), 1);
  part(new THREE.BoxGeometry(0.1, 0.09, 0.16), mask, V(0, 1.12, 0.74), head, V(1, 1, 1));
  ball(0.025, "#3a2a1a", V(0.025, 1.12, 0.825), head, V(1, 0.8, 0.6), 0);
  ball(0.025, "#3a2a1a", V(-0.025, 1.12, 0.825), head, V(1, 0.8, 0.6), 0);
  part(new THREE.BoxGeometry(0.08, 0.035, 0.13), "#cdb78c", V(0, 1.06, 0.73), jaw);
  // brow ridges and grain lines
  part(new THREE.BoxGeometry(0.07, 0.015, 0.03), woodD, V(0.06, 1.25, 0.73), head, V(1, 1, 1), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -0.35)));
  part(new THREE.BoxGeometry(0.07, 0.015, 0.03), woodD, V(-0.06, 1.25, 0.73), head, V(1, 1, 1), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0.35)));
  part(new THREE.BoxGeometry(0.012, 0.12, 0.012), woodD, V(0, 1.24, 0.745), head);
  // eyes
  for (const s of [1, -1]) {
    ball(0.032, "#1e3a1a", V(s * 0.075, 1.2, 0.72), head, V(1, 1.3, 0.6), 0);
    ball(0.022, "#8dff8a", V(s * 0.078, 1.2, 0.74), head, V(1, 1.3, 0.7), 0);
    // ears
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.2, 0, -s * 1.0));
    part(new THREE.ConeGeometry(0.035, 0.13, 5), woodD, V(s * 0.14, 1.27, 0.58), head, undefined, q);
    part(new THREE.ConeGeometry(0.02, 0.09, 5), "#e8b8a0", V(s * 0.14, 1.265, 0.595), head, undefined, q);
  }

  // Antlers
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const aj = b.joint("antler" + side, { at: [s * 0.07, 1.32, 0.6], parent: head });
    const pts = [V(s * 0.07, 1.31, 0.6), V(s * 0.14, 1.5, 0.55), V(s * 0.2, 1.7, 0.5), V(s * 0.3, 1.9, 0.52), V(s * 0.36, 2.06, 0.58)];
    for (let i = 0; i < pts.length - 1; i++) seg(pts[i], pts[i + 1], 0.024 - i * 0.003, 0.02 - i * 0.003, woodD, aj, 5);
    const tips: THREE.Vector3[] = [pts[4]];
    const tines: [number, THREE.Vector3][] = [
      [1, V(s * 0.3, 1.62, 0.7)],
      [2, V(s * 0.4, 1.9, 0.38)],
      [2, V(s * 0.1, 1.95, 0.6)],
      [3, V(s * 0.2, 2.15, 0.66)],
    ];
    for (const [i, t] of tines) {
      const mid = pts[i].clone().lerp(t, 0.5).add(V(0, 0.03, 0));
      seg(pts[i], mid, 0.014, 0.011, woodD, aj, 5);
      seg(mid, t, 0.011, 0.008, woodD, aj, 5);
      tips.push(t);
    }
    tips.forEach((t, k) => {
      // flower
      const fl = t.clone().add(V(0, 0.015, 0));
      for (let p = 0; p < 5; p++) {
        const a = (p / 5) * Math.PI * 2;
        ball(0.014, "#ffffff", fl.clone().add(V(Math.cos(a) * 0.022, 0.004, Math.sin(a) * 0.022)), aj, V(1, 0.6, 1), 0);
      }
      ball(0.012, "#f4cf3a", fl.clone().add(V(0, 0.01, 0)), aj, undefined, 0);
      // leaves
      for (let l = 0; l < 2; l++) {
        const a = k * 1.7 + l * 3.1;
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.5, a, 0.6));
        part(new THREE.OctahedronGeometry(0.03, 0), greens[(k + l) % 4], t.clone().add(V(Math.cos(a) * 0.04, -0.04 - l * 0.03, Math.sin(a) * 0.04)), aj, V(0.5, 0.25, 1.2), q);
      }
    });
    // small blossoms along beam
    for (let i = 1; i < 4; i++) {
      const p = pts[i].clone().add(V(-s * 0.02, 0, 0.025));
      ball(0.016, "#ffffff", p, aj, V(1, 1, 0.7), 0);
      ball(0.008, "#f4cf3a", p.clone().add(V(0, 0, 0.012)), aj, undefined, 0);
    }
    // moss at antler base
    ball(0.045, "#4f8a3a", V(s * 0.08, 1.3, 0.6), aj, V(1.2, 0.8, 1.2), 0);
  }

  // Fireflies
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const rad = 0.5 + (i % 3) * 0.12;
    const p = V(Math.cos(a) * rad, 1.35 + (i % 4) * 0.17, 0.6 + Math.sin(a) * rad);
    const fj = b.joint("firefly" + i, { at: [p.x, p.y, p.z], parent: head });
    ball(0.016, "#fff27a", p, fj, undefined, 0);
    ball(0.028, "#d8f58a", p, fj, V(1, 1, 1), 0).scale?.setScalar?.(1);
    part(new THREE.BoxGeometry(0.03, 0.004, 0.012), "#ffffff", p.clone().add(V(0, 0.02, 0)), fj);
  }

  return b.root;
}
```