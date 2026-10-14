import * as THREE from "three";

export const meta = { name: "Elephant", description: "Stylized low-poly African elephant built from primitives, with big ears, curled trunk, tusks and toenails." };

export default function build(): THREE.Object3D {
  let s = 7;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };

  // canvas skin texture
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#8d8f94"; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 160; i++) {
    g.strokeStyle = rnd() > 0.5 ? "rgba(60,62,68,0.35)" : "rgba(170,172,178,0.3)";
    g.lineWidth = 1;
    const x = rnd() * 128, y = rnd() * 128;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + rnd() * 20 - 10, y + rnd() * 6 - 3); g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;

  const skin = new THREE.MeshStandardMaterial({ map: tex, color: 0xffffff, roughness: 0.95, flatShading: true });
  const dark = new THREE.MeshStandardMaterial({ color: 0x6c6e75, roughness: 0.95, flatShading: true });
  const pink = new THREE.MeshStandardMaterial({ color: 0xc99a9a, roughness: 0.9, flatShading: true });
  const ivory = new THREE.MeshStandardMaterial({ color: 0xf1e8cf, roughness: 0.6, flatShading: true });
  const nail = new THREE.MeshStandardMaterial({ color: 0xd8cfb8, roughness: 0.8, flatShading: true });
  const black = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3 });

  const root = new THREE.Group();
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, p: number[], r: number[] = [0, 0, 0], sc: number[] = [1, 1, 1], parent: THREE.Object3D = root) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(p[0], p[1], p[2]); m.rotation.set(r[0], r[1], r[2]); m.scale.set(sc[0], sc[1], sc[2]);
    parent.add(m); return m;
  };

  // body
  add(new THREE.IcosahedronGeometry(1, 1), skin, [0, 2.0, 0], [0, 0, 0], [1.15, 1.2, 1.9]);
  add(new THREE.IcosahedronGeometry(1, 1), skin, [0, 2.25, -0.9], [0, 0, 0], [1.1, 1.1, 1.1]);
  // spine ridge
  add(new THREE.BoxGeometry(0.3, 0.15, 2.4), dark, [0, 3.2, -0.2]);

  // legs
  const legGeo = new THREE.CylinderGeometry(0.35, 0.42, 1.3, 8);
  const footGeo = new THREE.CylinderGeometry(0.43, 0.46, 0.2, 8);
  const nailGeo = new THREE.BoxGeometry(0.14, 0.12, 0.1);
  for (const [x, z] of [[0.7, 1.05], [-0.7, 1.05], [0.7, -1.2], [-0.7, -1.2]]) {
    add(legGeo, skin, [x, 0.85, z]);
    add(footGeo, dark, [x, 0.1, z]);
    for (let i = -1; i <= 1; i++) {
      const a = i * 0.45;
      add(nailGeo, nail, [x + Math.sin(a) * 0.45, 0.12, z + Math.cos(a) * 0.45], [0, a, 0]);
    }
  }

  // head
  const head = new THREE.Group();
  head.position.set(0, 2.6, 1.9);
  root.add(head);
  add(new THREE.IcosahedronGeometry(1, 1), skin, [0, 0, 0], [0, 0, 0], [0.8, 0.95, 0.9], head);
  add(new THREE.BoxGeometry(0.5, 0.5, 0.3), skin, [0, 0.55, 0.3], [0, 0, 0], [1, 1, 1], head);
  // eyes
  for (const sx of [1, -1]) {
    add(new THREE.SphereGeometry(0.08, 6, 5), black, [sx * 0.62, 0.15, 0.5], [0, 0, 0], [1, 1, 1], head);
    // ears
    const ear = add(new THREE.CylinderGeometry(1, 1, 0.08, 9), skin, [sx * 1.0, 0.25, -0.2], [Math.PI / 2, 0, 0], [0.95, 1, 1.1], head);
    ear.rotation.set(Math.PI / 2, 0, 0);
    ear.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), sx * 0.45);
    ear.position.y = 0.1;
    const inner = add(new THREE.CylinderGeometry(0.75, 0.75, 0.09, 9), pink, [sx * 1.05, 0.2, -0.17], [Math.PI / 2, 0, 0], [0.9, 1, 1.1], head);
    inner.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), sx * 0.45);
    inner.position.y = 0.0;
    // tusks
    const tusk = add(new THREE.ConeGeometry(0.09, 1.1, 6), ivory, [sx * 0.42, -0.65, 1.0], [Math.PI / 2 + 0.5, 0, sx * -0.12], [1, 1, 1], head);
    tusk.rotation.x = 1.0 + 0.0;
  }

  // trunk: segments tapering and curling up
  let tp = new THREE.Vector3(0, 0.35, 0.8);
  let ang = -0.2;
  const N = 9;
  for (let i = 0; i < N; i++) {
    const r0 = 0.3 - i * 0.02, r1 = 0.3 - (i + 1) * 0.02, len = 0.38;
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, len, 7), i % 2 ? skin : dark);
    ang += i < 3 ? 0.12 : 0.28 + (i > 5 ? 0.1 : 0);
    // direction in YZ: pointing down at ang=0, curling forward/up as ang grows
    const dy = -Math.cos(ang), dz = Math.sin(ang);
    seg.position.set(tp.x, tp.y + dy * len / 2, tp.z + dz * len / 2);
    seg.rotation.x = Math.atan2(dz, -dy) * -1 + Math.PI;
    seg.rotation.x = -Math.atan2(dz, dy) + Math.PI;
    head.add(seg);
    tp = new THREE.Vector3(0, tp.y + dy * len, tp.z + dz * len);
  }
  add(new THREE.IcosahedronGeometry(0.17, 0), pink, [0, tp.y, tp.z], [0, 0, 0], [1, 1, 1], head);

  // tail
  const tail = add(new THREE.CylinderGeometry(0.05, 0.08, 1.3, 5), dark, [0, 1.95, -2.05], [-0.25, 0, 0]);
  add(new THREE.ConeGeometry(0.14, 0.35, 5), black, [0, 1.2, -2.2], [Math.PI - 0.0, 0, 0]);

  // sink feet slightly
  root.position.y = 0;
  return root;
}
