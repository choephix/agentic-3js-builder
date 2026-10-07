import * as THREE from "three";

export const meta = {
  name: "Stumpy the Koala",
  description:
    "A stylized low-poly koala perched on a eucalyptus stump, clutching a sprig of blue-green gum leaves. Fluffy tufted ears, a big glossy nose and canvas-painted fur.",
};

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function canvasTex(size: number, draw: (c: CanvasRenderingContext2D, r: () => number) => void, seed: number) {
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const c = cv.getContext("2d")!;
  draw(c, rng(seed));
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export default function build(): THREE.Object3D {
  const g = new THREE.Group();
  const R = rng(42);

  // ---------- textures ----------
  const furTex = canvasTex(256, (c, r) => {
    c.fillStyle = "#8d939b";
    c.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 1800; i++) {
      const x = r() * 256, y = r() * 256;
      const l = 0.5 + r() * 0.5;
      c.strokeStyle = r() < 0.5 ? `rgba(200,205,212,${0.35 * l})` : `rgba(80,84,92,${0.35 * l})`;
      c.lineWidth = 1 + r() * 1.5;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + (r() - 0.5) * 4, y + 4 + r() * 6);
      c.stroke();
    }
  }, 7);
  furTex.repeat.set(2, 2);

  const creamTex = canvasTex(128, (c, r) => {
    c.fillStyle = "#ece4d4";
    c.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 500; i++) {
      c.fillStyle = r() < 0.5 ? "rgba(255,255,255,0.5)" : "rgba(190,178,160,0.35)";
      c.fillRect(r() * 128, r() * 128, 1 + r() * 2, 2 + r() * 4);
    }
  }, 11);

  const barkTex = canvasTex(256, (c, r) => {
    c.fillStyle = "#6b4a33";
    c.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 70; i++) {
      const x = r() * 256;
      c.strokeStyle = r() < 0.5 ? "rgba(40,26,18,0.6)" : "rgba(150,112,80,0.45)";
      c.lineWidth = 2 + r() * 5;
      c.beginPath();
      c.moveTo(x, 0);
      c.bezierCurveTo(x + (r() - 0.5) * 30, 90, x + (r() - 0.5) * 30, 170, x + (r() - 0.5) * 20, 256);
      c.stroke();
    }
  }, 3);
  barkTex.repeat.set(3, 1);

  const ringTex = canvasTex(256, (c, r) => {
    c.fillStyle = "#d9b27c";
    c.fillRect(0, 0, 256, 256);
    for (let k = 1; k < 14; k++) {
      c.strokeStyle = k % 2 ? "rgba(150,100,55,0.6)" : "rgba(120,80,45,0.35)";
      c.lineWidth = 2 + r() * 2;
      c.beginPath();
      c.arc(128 + (r() - 0.5) * 4, 128 + (r() - 0.5) * 4, k * 9 + r() * 3, 0, Math.PI * 2);
      c.stroke();
    }
    c.strokeStyle = "#6b4a33";
    c.lineWidth = 14;
    c.beginPath();
    c.arc(128, 128, 121, 0, Math.PI * 2);
    c.stroke();
    c.strokeStyle = "rgba(80,50,30,0.7)";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(128, 128);
    c.lineTo(200, 70);
    c.stroke();
  }, 5);

  // ---------- materials ----------
  const M = (o: THREE.MeshStandardMaterialParameters) =>
    new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.9, ...o });
  const fur = M({ map: furTex, color: 0xffffff });
  const cream = M({ map: creamTex, color: 0xffffff });
  const fluff = M({ color: 0xf6f3ee });
  const earInner = M({ color: 0xd9c9c4 });
  const nose = M({ color: 0x2a2726, roughness: 0.35 });
  const eyeM = M({ color: 0x120f0e, roughness: 0.2 });
  const shine = M({ color: 0xffffff, roughness: 0.2, emissive: 0x444444 });
  const claw = M({ color: 0x3a312c, roughness: 0.5 });
  const pad = M({ color: 0x4d4542, roughness: 0.6 });
  const bark = M({ map: barkTex, color: 0xffffff });
  const wood = M({ map: ringTex, color: 0xffffff });
  const leafA = M({ color: 0x7fa89b, side: THREE.DoubleSide });
  const leafB = M({ color: 0x55857a, side: THREE.DoubleSide });
  const leafDry = M({ color: 0xb8956a, side: THREE.DoubleSide });
  const stemM = M({ color: 0x8c4a3c });
  const moss = M({ color: 0x6f8f3e });
  const mush = M({ color: 0xd8613f });
  const mushStem = M({ color: 0xf1e6cf });

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material | THREE.Material[], x: number, y: number, z: number, sx = 1, sy = 1, sz = 1, parent: THREE.Object3D = g) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    parent.add(m);
    return m;
  };
  const UP = new THREE.Vector3(0, 1, 0);
  const limb = (a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material, seg = 8) => {
    const d = b.clone().sub(a);
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, d.length(), 3, seg), mat);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(UP, d.normalize());
    g.add(m);
    return m;
  };
  const cone = (pos: THREE.Vector3, dir: THREE.Vector3, r: number, h: number, mat: THREE.Material) => {
    const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 5), mat);
    m.position.copy(pos);
    m.quaternion.setFromUnitVectors(UP, dir.clone().normalize());
    g.add(m);
    return m;
  };

  const sph = (r: number, w = 10, h = 8) => new THREE.SphereGeometry(r, w, h);
  const ico = new THREE.IcosahedronGeometry(1, 0);

  // ---------- stump ----------
  const stumpH = 0.14;
  add(new THREE.CylinderGeometry(0.28, 0.31, stumpH, 11), [bark, wood, bark], 0, stumpH / 2, 0);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.4;
    const root = add(new THREE.BoxGeometry(0.09, 0.07, 0.17), bark, Math.sin(a) * 0.32, 0.03, Math.cos(a) * 0.32);
    root.rotation.set(0.25, a, 0);
    root.rotation.order = "YXZ";
  }
  // moss patches on stump
  for (let i = 0; i < 4; i++) {
    const a = -0.6 + i * 0.35;
    const m = add(ico, moss, Math.sin(a + Math.PI) * 0.26, stumpH - 0.005, Math.cos(a + Math.PI) * 0.26, 0.05, 0.02, 0.05);
    m.rotation.y = R() * 3;
  }
  // mushrooms at the base
  const mushroom = (x: number, z: number, s: number) => {
    add(new THREE.CylinderGeometry(0.012 * s, 0.016 * s, 0.05 * s, 6), mushStem, x, 0.025 * s, z);
    add(new THREE.SphereGeometry(0.035 * s, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), mush, x, 0.045 * s, z);
    for (let k = 0; k < 3; k++) {
      const a = k * 2.1;
      add(sph(0.006 * s, 4, 3), fluff, x + Math.sin(a) * 0.018 * s, 0.07 * s, z + Math.cos(a) * 0.018 * s);
    }
  };
  mushroom(-0.33, 0.14, 1);
  mushroom(-0.37, 0.05, 0.7);

  // ---------- leaf geometry ----------
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0);
  leafShape.quadraticCurveTo(0.03, 0.04, 0.006, 0.12);
  leafShape.quadraticCurveTo(-0.022, 0.05, 0, 0);
  const leafGeo = new THREE.ShapeGeometry(leafShape, 3);

  // fallen leaves
  const fallen = [
    [0.36, 0.22, 0.4, leafDry], [0.42, -0.1, 2.2, leafB], [-0.2, 0.38, 1.1, leafA],
    [0.1, 0.4, -0.6, leafDry], [-0.4, -0.25, 2.8, leafB],
  ] as const;
  for (const [x, z, a, mat] of fallen) {
    const l = add(leafGeo, mat as THREE.Material, x, 0.004, z);
    l.rotation.set(-Math.PI / 2, 0, a);
  }

  // ---------- koala body ----------
  const top = stumpH;
  add(sph(1, 12, 9), fur, 0, top + 0.24, 0, 0.21, 0.25, 0.19);
  add(sph(1, 10, 8), cream, 0, top + 0.25, 0.11, 0.14, 0.18, 0.09);
  // rump fluff
  add(sph(1, 8, 6), fur, 0, top + 0.12, -0.06, 0.2, 0.1, 0.16);

  // ---------- head ----------
  const hy = 0.68, hz = 0.03;
  add(sph(1, 12, 9), fur, 0, hy, hz, 0.175, 0.15, 0.15);
  // cheek fluff
  for (const s of [-1, 1]) {
    add(ico, fur, s * 0.14, hy - 0.05, hz + 0.04, 0.05, 0.045, 0.05);
    add(ico, fluff, s * 0.12, hy - 0.08, hz + 0.08, 0.03, 0.025, 0.03);
  }
  // chin bib
  add(sph(1, 8, 6), cream, 0, hy - 0.11, hz + 0.1, 0.07, 0.04, 0.04);
  // head tuft
  add(ico, fur, 0.02, hy + 0.14, hz, 0.04, 0.03, 0.04).rotation.set(0.3, 0.5, 0.2);
  add(ico, fur, -0.03, hy + 0.135, hz + 0.02, 0.03, 0.025, 0.03).rotation.set(0.6, 0.1, 0.4);

  // nose: big glossy spoon shape
  add(sph(1, 10, 8), nose, 0, hy - 0.025, hz + 0.145, 0.045, 0.068, 0.04);
  add(sph(1, 8, 6), nose, 0, hy - 0.075, hz + 0.14, 0.04, 0.025, 0.035);
  add(sph(0.009, 5, 4), shine, 0.015, hy + 0.01, hz + 0.18);
  // nostrils
  for (const s of [-1, 1]) add(sph(0.008, 5, 4), eyeM, s * 0.017, hy - 0.08, hz + 0.168, 1, 0.7, 0.6);
  // mouth
  const mouth = add(new THREE.TorusGeometry(0.022, 0.004, 4, 8, Math.PI), nose, 0, hy - 0.1, hz + 0.135);
  mouth.rotation.z = Math.PI;

  // eyes
  for (const s of [-1, 1]) {
    const ex = s * 0.068, ey = hy + 0.025, ez = hz + 0.13;
    add(sph(0.02, 8, 6), eyeM, ex, ey, ez, 1, 1.1, 0.6);
    add(sph(0.006, 4, 3), shine, ex + 0.006, ey + 0.008, ez + 0.012);
    // brow fluff
    add(ico, fur, s * 0.075, ey + 0.035, ez - 0.01, 0.03, 0.012, 0.02).rotation.z = s * 0.3;
  }

  // ears
  for (const s of [-1, 1]) {
    const ear = new THREE.Group();
    ear.position.set(s * 0.17, hy + 0.09, hz - 0.01);
    ear.rotation.set(0, s * 0.35, s * -0.25);
    g.add(ear);
    const disk = add(new THREE.CylinderGeometry(0.095, 0.095, 0.04, 12), fur, 0, 0, 0, 1, 1, 1, ear);
    disk.rotation.x = Math.PI / 2;
    const inner = add(new THREE.CylinderGeometry(0.065, 0.065, 0.02, 10), earInner, 0, -0.005, 0.018, 1, 1, 1, ear);
    inner.rotation.x = Math.PI / 2;
    // white fluffy fringe
    const n = 13;
    for (let i = 0; i < n; i++) {
      const a = (i / (n - 1)) * Math.PI * 1.45 - Math.PI * 0.2;
      const ang = s > 0 ? a : Math.PI - a;
      const rr = 0.088 + R() * 0.01;
      const sz = 0.022 + R() * 0.014;
      const t = add(ico, fluff, Math.cos(ang) * rr, Math.sin(ang) * rr, 0.012 + R() * 0.01, sz, sz, sz * 0.8, ear);
      t.rotation.set(R() * 3, R() * 3, R() * 3);
    }
    // inner tufts
    for (let i = 0; i < 4; i++) {
      const t = add(ico, fluff, (R() - 0.5) * 0.06, (R() - 0.3) * 0.06, 0.03, 0.02, 0.025, 0.012, ear);
      t.rotation.z = R() * 3;
    }
  }

  // ---------- arms ----------
  const handGeo = sph(1, 7, 5);
  const hand = (p: THREE.Vector3, dir: THREE.Vector3) => {
    add(handGeo, fur, p.x, p.y, p.z, 0.045, 0.04, 0.045);
    add(handGeo, pad, p.x, p.y - 0.01, p.z + 0.01, 0.032, 0.022, 0.032);
    for (let i = -1; i <= 1; i++) {
      cone(new THREE.Vector3(p.x + i * 0.02, p.y - 0.015, p.z + 0.04), dir, 0.007, 0.03, claw);
    }
  };
  // right arm resting on knee
  const rS = new THREE.Vector3(-0.155, 0.53, 0.06), rH = new THREE.Vector3(-0.15, 0.32, 0.2);
  limb(rS, rH, 0.055, fur);
  hand(rH, new THREE.Vector3(0, -0.6, 1));
  // left arm holding sprig
  const lS = new THREE.Vector3(0.155, 0.53, 0.06), lH = new THREE.Vector3(0.12, 0.43, 0.22);
  limb(lS, lH, 0.055, fur);
  hand(lH, new THREE.Vector3(-0.6, 0, 1));
  // arm fluff
  for (const s of [-1, 1]) add(ico, fluff, s * 0.18, 0.45, 0.1, 0.025, 0.03, 0.025);

  // ---------- legs ----------
  for (const s of [-1, 1]) {
    const hip = new THREE.Vector3(s * 0.12, top + 0.1, 0.05);
    const knee = new THREE.Vector3(s * 0.15, top + 0.07, 0.25);
    limb(hip, knee, 0.072, fur);
    const fx = s * 0.15, fy = top - 0.005, fz = 0.32;
    add(handGeo, fur, fx, fy, fz, 0.06, 0.045, 0.07);
    add(handGeo, pad, fx, fy - 0.02, fz + 0.01, 0.045, 0.02, 0.05);
    for (let i = -1; i <= 1; i++) {
      cone(new THREE.Vector3(fx + i * 0.022, fy - 0.01, fz + 0.065), new THREE.Vector3(0, -0.5, 1), 0.008, 0.032, claw);
    }
    // thumb toe
    add(handGeo, fur, fx - s * 0.05, fy, fz + 0.02, 0.022, 0.02, 0.03);
  }

  // ---------- eucalyptus sprig ----------
  const p0 = new THREE.Vector3(0.1, 0.34, 0.25);
  const p1 = new THREE.Vector3(0.3, 0.86, 0.2);
  limb(p0, p1, 0.006, stemM, 5);
  const nLeaves = 9;
  for (let i = 0; i < nLeaves; i++) {
    const t = 0.32 + (i / (nLeaves - 1)) * 0.68;
    const p = p0.clone().lerp(p1, t);
    const side = i % 2 === 0 ? 1 : -1;
    const leaf = new THREE.Mesh(leafGeo, R() < 0.5 ? leafA : leafB);
    leaf.position.copy(p);
    leaf.rotation.set((R() - 0.5) * 0.8, R() * Math.PI, side * (0.7 + R() * 0.4) - 0.35);
    const sc = 0.8 + R() * 0.5;
    leaf.scale.setScalar(sc);
    g.add(leaf);
  }
  // tip leaves
  for (const a of [-0.3, 0.4]) {
    const leaf = new THREE.Mesh(leafGeo, leafA);
    leaf.position.copy(p1);
    leaf.rotation.set(0.2, a * 3, a - 0.35);
    leaf.scale.setScalar(0.7);
    g.add(leaf);
  }
  // gum nuts
  for (let i = 0; i < 3; i++) {
    const p = p0.clone().lerp(p1, 0.55 + i * 0.03);
    add(sph(0.01, 5, 4), stemM, p.x + 0.018, p.y - 0.015 * i, p.z + 0.01);
  }

  return g;
}
