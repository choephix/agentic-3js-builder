import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Reef Octopus with Brass Key",
  description:
    "A curious coral-and-rust octopus with bumpy mottled skin, golden bar-pupil eyes, a grumpy brow, eight curling arms with cream suckers, and one arm holding up an old brass key.",
};

export default function build() {
  const b = createBuilder({ name: "octopus" });
  const root = b.root;

  // ---------- skeleton ----------
  const body = b.joint("body", { at: [0, 0.45, 0] });
  try { b.joint("head", { at: [0, 0.72, -0.1], parent: body }); } catch (e) { /* optional */ }

  // ---------- helpers ----------
  const mats: Record<number, THREE.MeshStandardMaterial> = {};
  const mat = (c: number) =>
    (mats[c] ??= new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, metalness: 0.04, flatShading: true }));
  const metal = (c: number) =>
    (mats[c + 0x1000000] ??= new THREE.MeshStandardMaterial({ color: c, roughness: 0.35, metalness: 0.7, flatShading: true }));
  const add = (g: THREE.BufferGeometry, m: THREE.Material, p: number[], s?: number[], r?: number[]) => {
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(p[0], p[1], p[2]);
    if (s) mesh.scale.set(s[0], s[1], s[2]);
    if (r) mesh.rotation.set(r[0], r[1], r[2]);
    root.add(mesh);
    return mesh;
  };
  let seed = 12345;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const CORAL = 0xe0775a, RUST = 0xb4502f, PALE = 0xf0c3a0, CREAM = 0xf6e6c8, GOLD = 0xe8b020, BRASS = 0xc9983a;
  const sphere = (w = 8, h = 6) => new THREE.SphereGeometry(1, w, h);

  // ---------- body ----------
  add(new THREE.CylinderGeometry(0.26, 0.23, 0.14, 8), mat(CORAL), [0, 0.13, 0]);
  add(sphere(10, 8), mat(CORAL), [0, 0.45, 0], [0.32, 0.3, 0.32]);
  add(sphere(10, 8), mat(CORAL), [0, 0.74, -0.12], [0.3, 0.36, 0.33], [-0.3, 0, 0]);
  // rust cap over the mantle
  add(sphere(10, 6), mat(RUST), [0, 0.8, -0.15], [0.285, 0.33, 0.31], [-0.3, 0, 0]).scale.y = 0.33;

  // bumps and mottling on mantle
  const mantleC = new THREE.Vector3(0, 0.74, -0.12);
  for (let i = 0; i < 90; i++) {
    const th = rnd() * Math.PI * 2;
    const ph = Math.acos(rnd() * 1.5 - 0.5); // upper-biased
    const d = new THREE.Vector3(Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th));
    if (d.y < -0.2) continue;
    const p = new THREE.Vector3(d.x * 0.3, d.y * 0.36, d.z * 0.33).add(mantleC);
    const pale = i % 3 === 0;
    const r = pale ? 0.03 + rnd() * 0.025 : 0.014 + rnd() * 0.012;
    const m = add(sphere(5, 4), mat(pale ? PALE : i % 2 ? CORAL : RUST), [p.x, p.y, p.z], [r, r, r]);
    if (pale) m.scale.multiplyScalar(1).y *= 0.45;
    m.lookAt(p.clone().add(d));
  }
  for (let i = 0; i < 26; i++) {
    const th = rnd() * Math.PI * 2;
    const y = 0.25 + rnd() * 0.25;
    const rr = 0.3;
    const p = [Math.cos(th) * rr * 0.97, y, Math.sin(th) * rr * 0.97];
    if (p[2] < -0.05 && y > 0.4) continue;
    const r = 0.012 + rnd() * 0.012;
    add(sphere(5, 4), mat(i % 2 ? PALE : RUST), p, [r, r, r]);
  }

  // ---------- face ----------
  for (const s of [1, -1]) {
    const eye = new THREE.Vector3(0.19 * s, 0.52, 0.22);
    add(sphere(8, 6), mat(CORAL), [eye.x, eye.y, eye.z], [0.095, 0.085, 0.07]); // socket bulge
    add(sphere(8, 6), mat(GOLD), [eye.x + 0.01 * s, eye.y, eye.z + 0.025], [0.07, 0.07, 0.05]);
    const n = new THREE.Vector3(0.4 * s, 0.1, 0.9).normalize();
    const pu = add(new THREE.BoxGeometry(0.1, 0.022, 0.012), mat(0x151010),
      [eye.x + 0.01 * s + n.x * 0.05, eye.y + n.y * 0.05, eye.z + 0.025 + n.z * 0.05]);
    pu.lookAt(pu.position.clone().add(n));
    // grumpy brow: outer end higher
    add(sphere(7, 5), mat(RUST), [eye.x - 0.005 * s, eye.y + 0.06, eye.z + 0.03], [0.1, 0.03, 0.075],
      [-0.2, 0, 0.45 * s]);
  }
  // siphon + mouth hint
  add(new THREE.CylinderGeometry(0.03, 0.04, 0.09, 6), mat(RUST), [-0.17, 0.33, 0.14], undefined, [1.2, 0, 0.5]);
  add(sphere(6, 4), mat(RUST), [0, 0.3, 0.3], [0.05, 0.03, 0.03]);

  // ---------- arms ----------
  const up = new THREE.Vector3(0, 1, 0);
  const tubeGeo = (pts: THREE.Vector3[], radFn: (s: number) => number) => {
    const curve = new THREE.CatmullRomCurve3(pts);
    const N = 22, R = 6;
    const pos: number[] = [], idx: number[] = [];
    for (let k = 0; k <= N; k++) {
      const t = k / N;
      const p = curve.getPoint(t);
      const T = curve.getTangent(t);
      let S = new THREE.Vector3().crossVectors(T, up);
      if (S.lengthSq() < 1e-4) S.set(1, 0, 0);
      S.normalize();
      const U = new THREE.Vector3().crossVectors(S, T).normalize();
      const r = radFn(t);
      for (let j = 0; j < R; j++) {
        const a = (j / R) * Math.PI * 2;
        const q = p.clone().addScaledVector(S, Math.cos(a) * r).addScaledVector(U, Math.sin(a) * r * 0.9);
        pos.push(q.x, q.y, q.z);
      }
    }
    for (let k = 0; k < N; k++)
      for (let j = 0; j < R; j++) {
        const a = k * R + j, b2 = k * R + (j + 1) % R, c = (k + 1) * R + j, d = (k + 1) * R + (j + 1) % R;
        idx.push(a, c, b2, b2, c, d);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return { geo: g, curve };
  };
  const rad = (s: number) => 0.075 * Math.pow(1 - s, 0.9) + 0.008;

  const armPts: THREE.Vector3[][] = [];
  for (let i = 0; i < 8; i++) {
    const a = i * (Math.PI / 4);
    const pts: THREE.Vector3[] = [];
    if (i === 1) {
      [[0.18, 0.1, 0.16], [0.4, 0.07, 0.34], [0.62, 0.14, 0.5], [0.7, 0.4, 0.6], [0.6, 0.72, 0.6], [0.52, 0.94, 0.55]]
        .forEach((p) => pts.push(new THREE.Vector3(p[0], p[1], p[2])));
    } else {
      const sign = i % 2 ? -1 : 1;
      const lift = [0, 0.12, 0.28, 0.06][i % 4];
      for (let k = 0; k <= 8; k++) {
        const s = k / 8;
        const r = 0.18 + 0.78 * s;
        const ang = a + sign * (s * 0.9 + 0.25 * Math.sin(s * 5 + i));
        pts.push(new THREE.Vector3(Math.sin(ang) * r, rad(s) * 0.85 + lift * s * s * s + 0.02, Math.cos(ang) * r));
      }
    }
    armPts.push(pts);
    try {
      b.chain(`arm${i + 1}`, pts.map((p) => [p.x, p.y, p.z]), { role: "tentacle" });
    } catch (e) { /* skeleton optional */ }

    const { geo, curve } = tubeGeo(pts, rad);
    add(geo, mat(i % 2 ? CORAL : 0xd96c4e), [0, 0, 0]);

    // suckers
    const cnt = i === 1 ? 14 : 12;
    for (let k = 0; k < cnt; k++) {
      const t = 0.08 + (k / cnt) * 0.8;
      const p = curve.getPoint(t);
      const T = curve.getTangent(t);
      const S = new THREE.Vector3().crossVectors(T, up).normalize();
      const r = rad(t);
      for (const sd of [1, -1]) {
        const dir = S.clone().multiplyScalar(sd).addScaledVector(up, 0.3).normalize();
        const pp = p.clone().addScaledVector(dir, r * 0.88);
        const q = new THREE.Quaternion().setFromUnitVectors(up, dir);
        const sr = Math.max(r * 0.42, 0.007);
        const c1 = add(new THREE.CylinderGeometry(sr, sr * 1.1, sr * 0.8, 6), mat(CREAM), [pp.x, pp.y, pp.z]);
        c1.quaternion.copy(q);
        const pp2 = pp.clone().addScaledVector(dir, sr * 0.2);
        const c2 = add(new THREE.CylinderGeometry(sr * 0.5, sr * 0.5, sr * 0.8, 5), mat(PALE), [pp2.x, pp2.y, pp2.z]);
        c2.quaternion.copy(q);
      }
    }
    // pale mottles on arm backs
    for (let k = 0; k < 4; k++) {
      const t = 0.12 + rnd() * 0.5;
      const p = curve.getPoint(t);
      const r = rad(t);
      add(sphere(5, 4), mat(k % 2 ? PALE : RUST), [p.x, p.y + r * 0.8, p.z], [r * 0.5, r * 0.2, r * 0.5]);
    }
  }

  // ---------- brass key ----------
  const kx = 0.52, kz = 0.55;
  const brass = metal(BRASS);
  add(new THREE.BoxGeometry(0.03, 0.5, 0.03), brass, [kx, 1.04, kz]);
  add(new THREE.TorusGeometry(0.075, 0.02, 5, 10), brass, [kx, 1.36, kz]);
  add(new THREE.TorusGeometry(0.03, 0.01, 4, 8), brass, [kx, 1.36, kz]).visible = false;
  add(new THREE.BoxGeometry(0.05, 0.03, 0.03), brass, [kx + 0.04, 0.83, kz]);
  add(new THREE.BoxGeometry(0.07, 0.03, 0.03), brass, [kx + 0.05, 0.88, kz]);
  add(new THREE.BoxGeometry(0.045, 0.03, 0.03), brass, [kx + 0.035, 0.93, kz]);
  add(new THREE.CylinderGeometry(0.026, 0.026, 0.05, 6), metal(0x8a6a2a), [kx, 1.16, kz]); // collar
  // arm tip grip: coil around shaft
  add(new THREE.TorusGeometry(0.03, 0.014, 4, 7), mat(CORAL), [kx, 0.98, kz], undefined, [Math.PI / 2, 0, 0]);
  add(new THREE.TorusGeometry(0.03, 0.012, 4, 7), mat(CORAL), [kx, 1.01, kz], undefined, [Math.PI / 2, 0, 0]);

  // ---------- floor placement ----------
  const box = new THREE.Box3().setFromObject(root);
  if (isFinite(box.min.y) && box.min.y < -0.02) root.position.y -= box.min.y + 0.02 * 0.5;

  return root;
}
