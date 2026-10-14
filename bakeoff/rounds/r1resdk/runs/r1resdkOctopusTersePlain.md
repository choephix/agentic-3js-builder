```ts
import * as THREE from "three";

export const meta = {
  name: "Octopus",
  description: "Stylized low-poly octopus with eight curling tentacles, suckers, and big expressive eyes.",
};

export default function build(): THREE.Object3D {
  let s = 12345;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };

  const root = new THREE.Group();

  const skin = new THREE.MeshStandardMaterial({ color: 0xd9533b, roughness: 0.6, flatShading: true });
  const skinDark = new THREE.MeshStandardMaterial({ color: 0xb23a2c, roughness: 0.65, flatShading: true });
  const belly = new THREE.MeshStandardMaterial({ color: 0xf5c6a5, roughness: 0.7, flatShading: true });
  const spot = new THREE.MeshStandardMaterial({ color: 0xf08a5d, roughness: 0.6, flatShading: true });
  const white = new THREE.MeshStandardMaterial({ color: 0xfff6e0, roughness: 0.4 });
  const black = new THREE.MeshStandardMaterial({ color: 0x14101a, roughness: 0.2 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xf2b630, roughness: 0.4, flatShading: true });

  // Mantle (head)
  const mantle = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 1), skin);
  mantle.scale.set(1, 1.2, 1.05);
  mantle.position.set(0, 0.62, -0.02);
  mantle.rotation.x = -0.25;
  root.add(mantle);

  // Mantle tip bump
  const tip = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 1), skin);
  tip.scale.set(1, 1.2, 1);
  tip.position.set(0, 0.95, -0.17);
  root.add(tip);

  // Body base / web
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.4, 0.2, 8), skinDark);
  base.position.set(0, 0.22, 0);
  root.add(base);

  // Spots on mantle
  for (let i = 0; i < 16; i++) {
    const a = rnd() * Math.PI * 2;
    const h = 0.55 + rnd() * 0.5;
    const r = 0.04 + rnd() * 0.04;
    const sp = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), spot);
    const rad = 0.27 - Math.abs(h - 0.75) * 0.3;
    const x = Math.sin(a) * rad;
    const z = -0.1 + Math.cos(a) * rad * 0.9;
    if (z > 0.05 && h < 0.7) continue;
    sp.position.set(x, h + 0.08, z);
    sp.scale.set(1, 0.5, 1);
    root.add(sp);
  }

  // Brow ridge / eyes
  for (const sx of [-1, 1]) {
    const brow = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), skinDark);
    brow.position.set(sx * 0.2, 0.5, 0.2);
    brow.scale.set(1, 1, 0.8);
    root.add(brow);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), white);
    eye.position.set(sx * 0.22, 0.5, 0.27);
    root.add(eye);
    const iris = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 10), gold);
    iris.rotation.x = Math.PI / 2;
    iris.position.set(sx * 0.225, 0.5, 0.338);
    root.add(iris);
    const pupil = new THREE.Mesh(new THREE.BoxGeometry(0.1 * 0.25, 0.06, 0.02), black);
    pupil.position.set(sx * 0.225, 0.5, 0.35);
    root.add(pupil);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.03, 0.1), skinDark);
    lid.position.set(sx * 0.22, 0.575, 0.27);
    lid.rotation.z = sx * -0.25;
    root.add(lid);
  }

  // Siphon
  const siphon = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.045, 0.14, 6), skinDark);
  siphon.rotation.x = Math.PI / 2.4;
  siphon.position.set(0.12, 0.3, 0.28);
  root.add(siphon);

  // Tentacles
  const N = 8;
  const segs = 9;
  for (let t = 0; t < N; t++) {
    const ang = (t / N) * Math.PI * 2 + 0.2;
    const dir = new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang));
    const side = new THREE.Vector3(dir.z, 0, -dir.x);
    const curlSign = t % 2 === 0 ? 1 : -1;
    const length = 0.85 + rnd() * 0.25;
    const wob = rnd() * 6;
    let r = 0.1;
    const pos = new THREE.Vector3(dir.x * 0.22, 0.2, dir.z * 0.22);
    let out = 0.0;
    const group = new THREE.Group();
    root.add(group);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= segs; i++) {
      const u = i / segs;
      out = u * length;
      // goes outward and drops to floor, with the tip curling up
      const y = Math.max(0.03, 0.2 * (1 - u * 2.2)) + Math.pow(Math.max(0, u - 0.7) / 0.3, 2) * 0.16;
      const lat = Math.sin(u * 4 + wob) * 0.1 * u + curlSign * Math.pow(u, 2.2) * 0.35;
      const p = pos.clone().addScaledVector(dir, out).addScaledVector(side, lat);
      p.y = y;
      pts.push(p);
    }
    for (let i = 0; i < segs; i++) {
      const a = pts[i], b = pts[i + 1];
      const u = i / segs;
      const r0 = 0.1 * (1 - u * 0.9) + 0.012;
      const r1 = 0.1 * (1 - (u + 1 / segs) * 0.9) + 0.012;
      const len = a.distanceTo(b);
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, len * 1.05, 7), i % 2 ? skin : skinDark);
      const mid = a.clone().add(b).multiplyScalar(0.5);
      seg.position.copy(mid);
      seg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
      group.add(seg);
      const j = new THREE.Mesh(new THREE.SphereGeometry(r1 * 1.0, 7, 5), i % 2 ? skin : skinDark);
      j.position.copy(b);
      group.add(j);
      // suckers on underside, along the sides
      if (i > 0 && i < segs - 1) {
        const sk = new THREE.Mesh(new THREE.CylinderGeometry(r0 * 0.35, r0 * 0.35, 0.02, 6), belly);
        const sd = b.clone().sub(a).normalize();
        const sideV = new THREE.Vector3().crossVectors(sd, new THREE.Vector3(0, 1, 0)).normalize();
        sk.position.copy(mid).addScaledVector(sideV, 0).add(new THREE.Vector3(0, -r0 * 0.55, 0));
        sk.position.y = Math.max(sk.position.y, 0.02);
        sk.position.addScaledVector(dir, 0.02);
        group.add(sk);
        const sk2 = sk.clone();
        sk2.position.x += sideV.x * r0 * 0.5;
        sk2.position.z += sideV.z * r0 * 0.5;
        sk2.scale.setScalar(0.7);
        group.add(sk2);
      }
    }
    const tipM = new THREE.Mesh(new THREE.SphereGeometry(0.012, 5, 4), skinDark);
    tipM.position.copy(pts[segs]);
    group.add(tipM);
    r = r;
  }

  // Shift so lowest point sits at floor
  const box = new THREE.Box3().setFromObject(root);
  root.position.y = -box.min.y;
  const wrap = new THREE.Group();
  wrap.add(root);
  return wrap;
}
```