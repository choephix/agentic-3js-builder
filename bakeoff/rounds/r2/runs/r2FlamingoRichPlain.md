```ts
import * as THREE from "three";

export const meta = {
  name: "Flamingo in Shallow Water",
  description: "Stylized low-poly flamingo with S-curved neck, bent bill, knobbly-kneed legs and webbed feet, standing in a shallow pool.",
};

export default function build(): THREE.Object3D {
  const root = new THREE.Group();
  const mats: Record<string, THREE.MeshStandardMaterial> = {};
  const M = (c: number, r = 0.8, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) => {
    const k = c + "_" + r + JSON.stringify(extra);
    if (!mats[k]) mats[k] = new THREE.MeshStandardMaterial({ color: c, roughness: r, flatShading: true, ...extra });
    return mats[k];
  };
  const pink = M(0xff9db8), pink2 = M(0xff86a6), coral = M(0xff6f61), deep = M(0xf0566a),
    leg = M(0xe8708a), knee = M(0xd4577a), beakP = M(0xffd0d8), black = M(0x16121a),
    eye = M(0xfff2a0, 0.4), pupil = M(0x000000, 0.3);

  const add = (g: THREE.BufferGeometry, m: THREE.Material, p: number[], s = [1, 1, 1], r = [0, 0, 0], parent: THREE.Object3D = root) => {
    const me = new THREE.Mesh(g, m);
    me.position.set(p[0], p[1], p[2]);
    me.scale.set(s[0], s[1], s[2]);
    me.rotation.set(r[0], r[1], r[2]);
    parent.add(me);
    return me;
  };
  // limb between two points
  const seg = (a: THREE.Vector3, b: THREE.Vector3, r1: number, r2: number, m: THREE.Material, parent: THREE.Object3D = root) => {
    const d = b.clone().sub(a);
    const len = d.length();
    const me = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, len, 6), m);
    me.position.copy(a.clone().add(b).multiplyScalar(0.5));
    me.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    parent.add(me);
    return me;
  };
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // water
  const waterTex = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    g.fillStyle = "#7cc9d6"; g.fillRect(0, 0, 128, 128);
    g.strokeStyle = "rgba(255,255,255,0.5)"; g.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const x = (i * 37) % 128, y = (i * 53) % 128;
      g.beginPath(); g.ellipse(x, y, 20, 6, 0, 0, 6.3); g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 3);
    return t;
  })();
  const water = add(new THREE.CylinderGeometry(1.1, 1.1, 0.04, 20), new THREE.MeshStandardMaterial({ map: waterTex, color: 0xaadde6, roughness: 0.15, transparent: true, opacity: 0.85, flatShading: true }), [0, 0.0, 0]);
  water.position.y = -0.0;
  // ripple rings
  for (const rr of [0.2, 0.3]) {
    const ring = add(new THREE.TorusGeometry(rr + 0.05, 0.006, 4, 20), M(0xffffff, 0.3), [0.12, 0.025, 0.0], [1, 1, 1], [Math.PI / 2, 0, 0]);
    ring.scale.set(rr * 5, rr * 5, 1);
  }
  // pebbles
  for (let i = 0; i < 7; i++) {
    const a = i * 2.4, rad = 0.6 + (i % 3) * 0.12;
    add(new THREE.DodecahedronGeometry(0.04 + (i % 2) * 0.02, 0), M(0x9a8f86), [Math.cos(a) * rad, 0.02, Math.sin(a) * rad], [1, 0.6, 1]);
  }

  // legs
  const body = new THREE.Group();
  root.add(body);
  for (const side of [1, -1]) {
    const x = side * 0.07;
    const foot = side === 1 ? V(x, 0.03, 0.08) : V(x, 0.03, -0.12);
    const ankle = V(x, 0.07, foot.z - 0.04);
    const kneeP = V(x, 0.5, side === 1 ? 0.0 : -0.04);
    const hip = V(x, 0.82, -0.02);
    seg(ankle, kneeP, 0.011, 0.012, leg);
    add(new THREE.IcosahedronGeometry(0.03, 0), knee, [kneeP.x, kneeP.y, kneeP.z]);
    // upper leg (feathered thigh to knee) bending backward
    seg(kneeP, hip, 0.014, 0.022, leg);
    // webbed foot: three toes + web
    const fz = ankle.z;
    for (const a of [-0.45, 0, 0.45]) {
      const end = V(x + Math.sin(a) * 0.12, 0.03, fz + Math.cos(a) * 0.13);
      seg(V(x, 0.045, fz), end, 0.008, 0.007, knee);
    }
    const web = add(new THREE.CylinderGeometry(0.01, 0.075, 0.006, 3), pink2, [x, 0.03, fz + 0.065], [1, 1, 1], [0, Math.PI / 2 * 0 + Math.PI, 0]);
    web.rotation.y = Math.PI;
    web.scale.set(1.3, 1, 1.2);
    web.rotation.x = 0;
    web.rotation.z = 0;
    web.position.y = 0.032;
    web.geometry = new THREE.CircleGeometry(0.085, 3);
    web.rotation.x = -Math.PI / 2;
    web.rotation.z = -Math.PI / 2;
    web.material = M(0xf08aa0, 0.8, { side: THREE.DoubleSide });
  }

  // body
  add(new THREE.SphereGeometry(0.26, 8, 6), pink, [0, 0.95, -0.02], [0.8, 0.85, 1.35], [0, 0, 0]);
  // tail
  add(new THREE.ConeGeometry(0.11, 0.3, 5), pink2, [0, 0.9, -0.4], [1, 1, 0.5], [-Math.PI / 2 - 0.3, 0, 0]);
  add(new THREE.ConeGeometry(0.07, 0.2, 4), black, [0, 0.86, -0.56], [1, 1, 0.4], [-Math.PI / 2 - 0.45, 0, 0]);
  // chest ruff
  add(new THREE.IcosahedronGeometry(0.15, 0), pink, [0, 1.02, 0.22], [0.9, 1.1, 1]);

  // wings (folded on sides)
  for (const side of [1, -1]) {
    const w = new THREE.Group();
    w.position.set(side * 0.2, 1.05, 0.0);
    w.rotation.set(0, 0, side * -0.1);
    root.add(w);
    add(new THREE.SphereGeometry(0.2, 7, 5), coral, [side * 0.03, -0.06, -0.03], [0.3, 0.9, 1.5], [0.15, 0, 0], w);
    add(new THREE.SphereGeometry(0.15, 6, 5), deep, [side * 0.05, -0.12, -0.12], [0.25, 0.8, 1.4], [0.2, 0, 0], w);
    // covert feather tiers
    for (let i = 0; i < 4; i++) {
      add(new THREE.BoxGeometry(0.03, 0.05, 0.14), i % 2 ? coral : deep, [side * 0.075, 0.05 - i * 0.07, -0.02 - i * 0.03], [1, 1, 1], [0.2, 0, 0], w);
    }
    // black flight feathers
    for (let i = 0; i < 5; i++) {
      const f = add(new THREE.BoxGeometry(0.015, 0.05, 0.22), black, [side * (0.07 + i * 0.002), -0.2 - i * 0.012, -0.28 - i * 0.04], [1, 1, 1], [0.25 - i * 0.03, side * 0.03 * i, 0], w);
      f.scale.set(1, 1, 1 + i * 0.05);
    }
  }

  // neck: S-curve
  const pts = [
    V(0, 1.02, 0.2), V(0, 1.15, 0.32), V(0, 1.32, 0.3), V(0, 1.5, 0.2),
    V(0, 1.68, 0.2), V(0, 1.85, 0.3), V(0, 1.98, 0.36),
  ];
  for (let i = 0; i < pts.length - 1; i++) {
    const t = i / (pts.length - 1);
    const r1 = 0.07 - t * 0.03, r2 = 0.07 - (t + 0.16) * 0.03;
    seg(pts[i], pts[i + 1], r1, r2, i % 2 ? pink : pink2);
    add(new THREE.IcosahedronGeometry(r2 * 1.05, 0), i % 2 ? pink : pink2, [pts[i + 1].x, pts[i + 1].y, pts[i + 1].z]);
  }

  // head
  const head = new THREE.Group();
  head.position.set(0, 2.0, 0.38);
  root.add(head);
  add(new THREE.SphereGeometry(0.058, 7, 6), pink, [0, 0, 0], [0.9, 1, 1.15], [0, 0, 0], head);
  // beak: pale base, bent, black tip
  add(new THREE.BoxGeometry(0.06, 0.05, 0.12), beakP, [0, -0.005, 0.1], [1, 1, 1], [0.05, 0, 0], head);
  const b1 = add(new THREE.ConeGeometry(0.036, 0.13, 4), beakP, [0, -0.04, 0.2], [1, 1, 0.8], [Math.PI / 2 + 0.55, Math.PI / 4, 0], head);
  add(new THREE.ConeGeometry(0.03, 0.09, 4), black, [0, -0.1, 0.27], [1, 1, 0.8], [Math.PI / 2 + 1.1, Math.PI / 4, 0], head);
  void b1;
  // eyes
  for (const s of [1, -1]) {
    add(new THREE.SphereGeometry(0.02, 6, 5), eye, [s * 0.05, 0.015, 0.035], [1, 1, 1], [0, 0, 0], head);
    add(new THREE.SphereGeometry(0.009, 5, 4), pupil, [s * 0.065, 0.015, 0.042], [1, 1, 1], [0, 0, 0], head);
  }

  root.scale.setScalar(1);
  return root;
}
```