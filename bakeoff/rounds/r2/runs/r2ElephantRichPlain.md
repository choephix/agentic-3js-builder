```ts
import * as THREE from "three";

export const meta = {
  name: "Elephant Calf",
  description: "A gentle, dusty African elephant calf built from low-poly primitives, with fan ears, a curled trunk, baby tusks and padded feet.",
};

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function makeSkinTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#8a8486";
  g.fillRect(0, 0, 256, 256);
  const r = rng(7);
  for (let i = 0; i < 700; i++) {
    const x = r() * 256, y = r() * 256;
    g.fillStyle = r() < 0.5 ? "rgba(150,100,80,0.10)" : "rgba(50,50,60,0.10)";
    g.fillRect(x, y, 10 + r() * 20, 6 + r() * 10);
  }
  g.strokeStyle = "rgba(40,35,40,0.35)";
  g.lineWidth = 1;
  for (let i = 0; i < 160; i++) {
    const x = r() * 256, y = r() * 256, l = 8 + r() * 22;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + l, y + (r() - 0.5) * 4);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  const tex = makeSkinTexture();
  const skin = new THREE.MeshStandardMaterial({ color: 0x9a8f90, map: tex, roughness: 1, flatShading: true });
  const dusty = new THREE.MeshStandardMaterial({ color: 0xa88a7c, map: tex, roughness: 1, flatShading: true });
  const dark = new THREE.MeshStandardMaterial({ color: 0x6f676b, map: tex, roughness: 1, flatShading: true });
  const pink = new THREE.MeshStandardMaterial({ color: 0xd99a9a, roughness: 0.9, flatShading: true, side: THREE.DoubleSide });
  const ivory = new THREE.MeshStandardMaterial({ color: 0xf1e8d2, roughness: 0.6, flatShading: true });
  const nail = new THREE.MeshStandardMaterial({ color: 0xe6dccb, roughness: 0.7, flatShading: true });
  const eyeM = new THREE.MeshStandardMaterial({ color: 0x4a2c1a, roughness: 0.3 });
  const black = new THREE.MeshStandardMaterial({ color: 0x151215, roughness: 0.6 });
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const hair = new THREE.MeshStandardMaterial({ color: 0x2e2527, roughness: 1 });

  function add(parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    parent.add(m);
    return m;
  }

  // Body
  add(root, new THREE.IcosahedronGeometry(0.5, 1), skin, 0, 0.78, -0.05, 0.95, 0.9, 1.3);
  add(root, new THREE.IcosahedronGeometry(0.4, 1), dusty, 0, 0.55, -0.05, 1.0, 0.6, 1.5); // dusty belly
  // back ridge
  add(root, new THREE.IcosahedronGeometry(0.3, 0), dark, 0, 1.12, -0.15, 1, 0.4, 1.6);

  // Wrinkle rings on body
  for (let i = 0; i < 5; i++) {
    const z = -0.5 + i * 0.22;
    const t = add(root, new THREE.TorusGeometry(0.45 - Math.abs(z + 0.1) * 0.12, 0.012, 4, 14), dark, 0, 0.78, z);
    t.scale.set(0.95, 0.9, 1);
  }

  // Legs
  const legPos = [[0.25, 0.4], [-0.25, 0.4], [0.25, -0.5], [-0.25, -0.5]];
  legPos.forEach(([x, z]) => {
    const leg = new THREE.Group();
    leg.position.set(x, 0, z);
    root.add(leg);
    add(leg, new THREE.CylinderGeometry(0.17, 0.15, 0.55, 8), skin, 0, 0.4, 0);
    add(leg, new THREE.CylinderGeometry(0.18, 0.18, 0.05, 8), dark, 0, 0.28, 0);
    add(leg, new THREE.CylinderGeometry(0.17, 0.2, 0.14, 8), dusty, 0, 0.09, 0);
    add(leg, new THREE.CylinderGeometry(0.2, 0.2, 0.03, 8), dark, 0, 0.015, 0);
    for (let k = -1; k <= 1; k++) {
      const a = k * 0.5;
      add(leg, new THREE.BoxGeometry(0.06, 0.06, 0.04), nail, Math.sin(a) * 0.19, 0.06, Math.cos(a) * 0.19).rotation.y = a;
    }
  });

  // Head
  const head = new THREE.Group();
  head.position.set(0, 0.95, 0.68);
  root.add(head);
  add(head, new THREE.IcosahedronGeometry(0.4, 1), skin, 0, 0.05, 0, 1, 1, 0.95);
  add(head, new THREE.IcosahedronGeometry(0.22, 0), dark, 0, 0.35, -0.05, 1.2, 0.6, 1); // forehead tuft bump
  add(head, new THREE.IcosahedronGeometry(0.2, 0), dusty, 0, -0.12, 0.25, 1.2, 1, 1);

  // Trunk segments, curling forward
  const trunk = new THREE.Group();
  trunk.position.set(0, -0.08, 0.36);
  head.add(trunk);
  let px = 0, py = 0, pz = 0;
  const n = 9;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const rTop = 0.15 - t * 0.08, rBot = 0.15 - (t + 1 / (n - 1)) * 0.08;
    const len = 0.13;
    const ang = -0.1 + t * t * 2.2; // curls upward at tip
    const seg = new THREE.Group();
    seg.position.set(px, py, pz);
    seg.rotation.x = ang;
    // cylinder along local -Y by default; rotate so it extends downward then curl forward
    const dirY = -Math.cos(ang - 0.0) * 0;
    trunk.add(seg);
    const cyl = add(seg, new THREE.CylinderGeometry(Math.max(rTop, 0.05), Math.max(rBot, 0.05), len, 7), i % 2 ? skin : dusty, 0, -len / 2, 0);
    // advance: segment points along local -Y rotated by ang about X
    px += 0;
    py += -Math.cos(ang) * len;
    pz += Math.sin(ang) * len * -1 * -1;
    cyl.scale.set(1.05, 1, 1.0);
    if (i < n - 1) {
      const ring = add(seg, new THREE.TorusGeometry(Math.max(rBot, 0.05) + 0.005, 0.012, 4, 8), dark, 0, -len, 0);
      ring.rotation.x = Math.PI / 2;
    }
  }
  // tip finger
  add(trunk, new THREE.IcosahedronGeometry(0.05, 0), pink, px, py - 0.02, pz + 0.04);

  // Eyes, lashes
  [1, -1].forEach((s) => {
    const eye = new THREE.Group();
    eye.position.set(s * 0.33, 0.12, 0.22);
    head.add(eye);
    add(eye, new THREE.SphereGeometry(0.05, 8, 6), white, 0, 0, 0, 1, 1, 0.6);
    add(eye, new THREE.SphereGeometry(0.04, 8, 6), eyeM, s * 0.008, 0, 0.012, 1, 1, 0.7);
    add(eye, new THREE.SphereGeometry(0.012, 5, 4), white, s * 0.01, 0.015, 0.035);
    add(eye, new THREE.BoxGeometry(0.1, 0.02, 0.05), dark, 0, 0.055, -0.005).rotation.z = s * -0.2;
    for (let i = 0; i < 5; i++) {
      const a = 0.3 + i * 0.28;
      const l = add(eye, new THREE.BoxGeometry(0.06, 0.008, 0.008), black, s * Math.cos(a) * 0.07, 0.05 + Math.sin(a) * 0.04, 0.02);
      l.rotation.z = s === 1 ? a : Math.PI - a;
    }
  });

  // Tusks
  [1, -1].forEach((s) => {
    const t = add(head, new THREE.ConeGeometry(0.03, 0.2, 6), ivory, s * 0.15, -0.17, 0.33);
    t.rotation.set(-1.9, 0, s * -0.3);
    add(head, new THREE.CylinderGeometry(0.04, 0.04, 0.03, 6), pink, s * 0.145, -0.15, 0.3).rotation.x = 1.2;
  });

  // Ears
  [1, -1].forEach((s) => {
    const ear = new THREE.Group();
    ear.position.set(s * 0.33, 0.15, -0.02);
    ear.rotation.y = s * 0.45;
    head.add(ear);
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.25);
    shape.bezierCurveTo(0.2, 0.45, 0.65, 0.4, 0.7, 0.0);
    shape.bezierCurveTo(0.7, -0.35, 0.4, -0.6, 0.18, -0.55);
    shape.bezierCurveTo(0.05, -0.4, 0, -0.2, 0, 0.25);
    const outerGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.03, bevelEnabled: false, curveSegments: 6 });
    const outer = new THREE.Mesh(outerGeo, skin);
    outer.scale.x = s;
    ear.add(outer);
    const inner = new THREE.Mesh(new THREE.ShapeGeometry(shape, 6), pink);
    inner.scale.set(s * 0.82, 0.82, 1);
    inner.position.set(s * 0.06, -0.02, 0.035);
    ear.add(inner);
    const rim = new THREE.Mesh(new THREE.ShapeGeometry(shape, 6), dusty);
    rim.scale.x = s;
    rim.position.z = -0.002;
    ear.add(rim);
    ear.rotation.x = 0;
    outer.material = skin;
  });

  // Tail
  const tail = new THREE.Group();
  tail.position.set(0, 0.85, -0.78);
  tail.rotation.x = -0.25;
  root.add(tail);
  add(tail, new THREE.CylinderGeometry(0.03, 0.02, 0.4, 5), dark, 0, -0.2, 0);
  const tuft = add(tail, new THREE.ConeGeometry(0.06, 0.16, 6), hair, 0, -0.46, 0);
  tuft.rotation.x = Math.PI;
  const r = rng(3);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const b = add(tail, new THREE.ConeGeometry(0.015, 0.14, 4), hair, Math.cos(a) * 0.04, -0.5, Math.sin(a) * 0.04);
    b.rotation.set(Math.PI + Math.sin(a) * 0.4, 0, -Math.cos(a) * 0.4 + (r() - 0.5) * 0.1);
  }

  return root;
}
```