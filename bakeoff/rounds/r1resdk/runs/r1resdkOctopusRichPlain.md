```ts
import * as THREE from "three";

export const meta = {
  name: "Reef Octopus with Brass Key",
  description: "Coral and rust octopus with bumpy mottled skin, golden bar-pupil eyes, grumpy brows, eight curling suckered arms, one holding an old brass key.",
};

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export default function build(): THREE.Object3D {
  const R = rng(7);
  const root = new THREE.Group();

  const mk = (c: number, rough = 0.8, metal = 0) =>
    new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: metal, flatShading: true });
  const coral = mk(0xe8694a);
  const rust = mk(0xb04a2c);
  const pale = mk(0xf2b79a);
  const cream = mk(0xfff0d2, 0.6);
  const gold = mk(0xf2b01e, 0.3);
  const black = mk(0x120a08, 0.4);
  const brass = mk(0xb8892b, 0.35, 0.8);
  const brow = mk(0x8a3520);

  const add = (parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };

  // Head / mantle
  const headG = new THREE.Group();
  headG.position.set(0, 0.5, -0.02);
  headG.rotation.x = -0.25;
  root.add(headG);
  const mantle = add(headG, new THREE.IcosahedronGeometry(0.34, 1), coral);
  mantle.scale.set(1, 1.3, 1.05);
  mantle.position.y = 0.12;
  // bulb top
  add(headG, new THREE.IcosahedronGeometry(0.2, 1), rust, 0, 0.5, -0.06).scale.set(1, 1.1, 1);

  // bumps and mottling on head
  for (let i = 0; i < 90; i++) {
    const th = R() * Math.PI * 2;
    const ph = Math.acos(2 * R() - 1);
    const dir = new THREE.Vector3(Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th));
    const r = 0.34;
    const p = new THREE.Vector3(dir.x * r, dir.y * r * 1.3 + 0.12, dir.z * r * 1.05);
    if (p.z > 0.15 && Math.abs(p.y - 0.2) < 0.2 && Math.abs(p.x) > 0.1) continue;
    const big = R() < 0.4;
    const s = 0.018 + R() * 0.03;
    const b = add(headG, new THREE.IcosahedronGeometry(s, 0), big ? pale : rust, p.x, p.y, p.z);
    b.scale.y = 0.7;
  }

  // Eyes
  for (const sx of [-1, 1]) {
    const eg = new THREE.Group();
    eg.position.set(sx * 0.2, 0.05, 0.3);
    eg.rotation.y = sx * 0.55;
    headG.add(eg);
    add(eg, new THREE.SphereGeometry(0.11, 8, 6), rust).scale.set(1, 1, 0.7);
    add(eg, new THREE.SphereGeometry(0.085, 8, 6), gold, 0, 0, 0.04);
    const pupil = add(eg, new THREE.BoxGeometry(0.15, 0.03, 0.02), black, 0, 0, 0.12);
    pupil.scale.set(1, 1, 1);
    // grumpy brow: slopes down toward center
    const bw = add(eg, new THREE.BoxGeometry(0.2, 0.04, 0.07), brow, -sx * 0.0, 0.1, 0.07);
    bw.rotation.z = sx * 0.4 * -1 + 0;
    bw.rotation.z = -sx * 0.35;
    bw.position.x = 0.0;
  }
  // little mouth hint/siphon
  add(headG, new THREE.CylinderGeometry(0.04, 0.05, 0.12, 6), pale, 0.0, -0.22, 0.3).rotation.x = 1.2;

  // Arms
  const suckerGeo = new THREE.CylinderGeometry(0.018, 0.022, 0.012, 6);
  const nubGeo = new THREE.IcosahedronGeometry(0.012, 0);
  const N = 8;
  let keyArmEnd: { pos: THREE.Vector3; dir: THREE.Vector3 } | null = null;

  for (let a = 0; a < N; a++) {
    const ang = (a / N) * Math.PI * 2 + 0.2;
    const isKey = a === 1;
    const dirX = Math.sin(ang);
    const dirZ = Math.cos(ang);
    const segs = 12;
    const L = 0.75 + R() * 0.15;
    const curlSide = R() < 0.5 ? -1 : 1;
    let pos = new THREE.Vector3(dirX * 0.2, 0.3, dirZ * 0.2);
    let heading = ang;
    let pitch = -0.9; // downward-out
    const baseR = 0.11;
    for (let i = 0; i < segs; i++) {
      const t = i / segs;
      const r0 = baseR * (1 - t * 0.92) + 0.01;
      const r1 = baseR * (1 - (t + 1 / segs) * 0.92) + 0.01;
      const len = L / segs;
      if (isKey) {
        // raised arm: rises up then curls
        pitch = -0.6 + t * 2.6;
        if (i > 0) heading += 0.04;
      } else {
        // lower to floor then curl
        pitch = Math.max(-0.9 + t * 1.2, 0) * 1;
        pitch = i < 3 ? -0.9 + i * 0.4 : 0.0;
        heading += curlSide * (0.05 + t * 0.2);
      }
      const d = new THREE.Vector3(
        Math.sin(heading) * Math.cos(pitch),
        Math.sin(pitch) * -1,
        Math.cos(heading) * Math.cos(pitch)
      );
      if (isKey) d.y = Math.sin(pitch) * 1 * (t < 0.2 ? -0.5 : 1);
      // keep above floor
      let next = pos.clone().addScaledVector(d, len);
      const floorY = r1;
      if (!isKey && next.y < floorY) next.y = floorY;
      const seg = next.clone().sub(pos);
      const slen = seg.length();
      const geo = new THREE.CylinderGeometry(r1, r0, slen, 7);
      const m = new THREE.Mesh(geo, i % 3 === 1 ? rust : coral);
      m.position.copy(pos).addScaledVector(seg, 0.5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), seg.clone().normalize());
      root.add(m);
      // joint ball
      add(root, new THREE.IcosahedronGeometry(r1 * 1.05, 0), i % 3 === 1 ? rust : coral, next.x, next.y, next.z);
      // suckers on the underside (two rows), cream
      const sdir = seg.clone().normalize();
      const side = new THREE.Vector3().crossVectors(sdir, new THREE.Vector3(0, 1, 0));
      if (side.lengthSq() < 1e-4) side.set(1, 0, 0);
      side.normalize();
      const down = new THREE.Vector3().crossVectors(side, sdir).normalize();
      if (down.y > 0) down.negate();
      if (i > 0) {
        for (const o of [-1, 1]) {
          const rp = (r0 + r1) / 2;
          const sp = m.position.clone().addScaledVector(down, rp * 0.8).addScaledVector(side, o * rp * 0.55);
          const s = new THREE.Mesh(suckerGeo, cream);
          s.position.copy(sp);
          s.scale.setScalar(Math.max(0.5, rp / 0.07));
          s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), down.clone().addScaledVector(side, o * 0.5).normalize());
          root.add(s);
        }
      }
      // bumps on top
      const up = down.clone().negate();
      const bp = m.position.clone().addScaledVector(up, r0 * 0.85).addScaledVector(side, (R() - 0.5) * r0);
      add(root, nubGeo, R() < 0.5 ? pale : rust, bp.x, bp.y, bp.z).scale.setScalar(0.6 + R() * 0.8);
      pos = next;
      if (i === segs - 1) keyArmEnd = isKey ? { pos: pos.clone(), dir: d.clone() } : keyArmEnd;
    }
  }

  // Key held by arm 1
  if (keyArmEnd) {
    const k = new THREE.Group();
    k.position.copy(keyArmEnd.pos);
    k.position.y += 0.02;
    root.add(k);
    // shaft
    add(k, new THREE.CylinderGeometry(0.014, 0.014, 0.3, 6), brass, 0, 0.12, 0);
    // bow (ring)
    const ring = add(k, new THREE.TorusGeometry(0.055, 0.016, 5, 8), brass, 0, 0.32, 0);
    ring.rotation.y = 0;
    // teeth
    add(k, new THREE.BoxGeometry(0.07, 0.025, 0.02), brass, 0.04, -0.02, 0);
    add(k, new THREE.BoxGeometry(0.05, 0.025, 0.02), brass, 0.03, 0.03, 0);
    add(k, new THREE.BoxGeometry(0.03, 0.03, 0.025), brass, 0, 0.2, 0); // collar
    // wrap of arm tip around shaft
    add(k, new THREE.TorusGeometry(0.03, 0.012, 5, 7), coral, 0, 0.08, 0).rotation.x = Math.PI / 2;
    k.rotation.y = 0.6;
  }

  // Normalize so lowest is on floor
  const box = new THREE.Box3().setFromObject(root);
  root.position.y -= box.min.y;
  const wrap = new THREE.Group();
  wrap.add(root);
  return wrap;
}
```