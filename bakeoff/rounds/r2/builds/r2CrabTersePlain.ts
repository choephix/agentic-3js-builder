import * as THREE from "three";

export const meta = {
  name: "Crab",
  description: "Stylized low-poly red crab with claws, eye stalks, and jointed legs, built from primitives.",
};

export default function build(): THREE.Object3D {
  let s = 12345;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };

  // textured shell
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#d9442b";
  g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 40; i++) {
    g.fillStyle = rnd() > 0.5 ? "#e8643f" : "#b8321f";
    g.beginPath();
    g.arc(rnd() * 128, rnd() * 128, 2 + rnd() * 6, 0, 7);
    g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;

  const shell = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, flatShading: true });
  const red = new THREE.MeshStandardMaterial({ color: 0xc23a24, roughness: 0.6, flatShading: true });
  const dark = new THREE.MeshStandardMaterial({ color: 0x8e2616, roughness: 0.7, flatShading: true });
  const light = new THREE.MeshStandardMaterial({ color: 0xf2c9a0, roughness: 0.7, flatShading: true });
  const black = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3 });
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });

  const root = new THREE.Group();
  const add = (p: THREE.Object3D, geo: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(x, y, z);
    p.add(mesh);
    return mesh;
  };

  // body
  const body = add(root, new THREE.SphereGeometry(0.2, 8, 6), shell, 0, 0.12, 0);
  body.scale.set(1.5, 0.5, 1.0);
  const rim = add(root, new THREE.TorusGeometry(0.2, 0.025, 4, 10), dark, 0, 0.1, 0);
  rim.rotation.x = Math.PI / 2;
  rim.scale.set(1.5, 1.0, 1);
  const belly = add(root, new THREE.CylinderGeometry(0.2, 0.2, 0.04, 8), light, 0, 0.06, 0);
  belly.scale.set(1.4, 1, 0.9);
  // bumps on shell
  for (let i = 0; i < 6; i++) {
    const b = add(root, new THREE.IcosahedronGeometry(0.03, 0), red, (i % 3 - 1) * 0.12, 0.23 - Math.abs(i % 3 - 1) * 0.04, i < 3 ? -0.04 : 0.07);
    b.scale.y = 0.6;
  }

  // eyes
  for (const sx of [-1, 1]) {
    add(root, new THREE.CylinderGeometry(0.01, 0.012, 0.09, 5), light, sx * 0.07, 0.25, 0.17);
    add(root, new THREE.SphereGeometry(0.026, 6, 5), white, sx * 0.07, 0.31, 0.175);
    add(root, new THREE.SphereGeometry(0.013, 5, 4), black, sx * 0.07, 0.312, 0.197);
  }

  // legs
  for (const sx of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const lg = new THREE.Group();
      const zOff = 0.1 - i * 0.07;
      lg.position.set(sx * 0.27, 0.13, zOff);
      lg.rotation.y = sx * (-0.25 + i * 0.2) * -1;
      root.add(lg);
      const up = add(lg, new THREE.BoxGeometry(0.2, 0.025, 0.03), red, sx * 0.09, 0.05, 0);
      up.rotation.z = sx * 0.5;
      const kx = sx * 0.19, ky = 0.1;
      add(lg, new THREE.SphereGeometry(0.022, 5, 4), dark, kx, ky, 0);
      const lo = add(lg, new THREE.BoxGeometry(0.03, 0.2, 0.025), red, sx * 0.25, 0.0, 0);
      lo.rotation.z = sx * -0.25;
      add(lg, new THREE.ConeGeometry(0.014, 0.05, 4), dark, sx * 0.29, -0.12, 0).rotation.z = Math.PI + sx * 0.25 * -1;
      lg.position.y = 0.13;
      lg.position.y += 0.0;
    }
  }
  // lower root so legs touch floor
  root.children.forEach(() => {});

  // claws
  for (const sx of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(sx * 0.27, 0.15, 0.13);
    arm.rotation.y = sx * -0.5;
    root.add(arm);
    const a1 = add(arm, new THREE.BoxGeometry(0.16, 0.05, 0.05), red, sx * 0.08, 0.02, 0.02);
    a1.rotation.y = sx * 0.0;
    add(arm, new THREE.SphereGeometry(0.035, 5, 4), dark, sx * 0.16, 0.02, 0.02);
    const fore = new THREE.Group();
    fore.position.set(sx * 0.16, 0.03, 0.04);
    fore.rotation.y = sx * 0.9;
    arm.add(fore);
    const palm = add(fore, new THREE.BoxGeometry(0.12, 0.08, 0.1), shell, sx * 0.05, 0, 0.03);
    palm.scale.x = 1;
    const pinA = add(fore, new THREE.ConeGeometry(0.045, 0.14, 4), red, sx * 0.02, 0.0, 0.14);
    pinA.rotation.x = Math.PI / 2;
    pinA.position.x = sx * 0.0;
    pinA.position.z = 0.15;
    pinA.position.y = 0.025;
    pinA.rotation.y = 0.0;
    const pinB = add(fore, new THREE.ConeGeometry(0.04, 0.13, 4), dark, sx * 0.07, -0.015, 0.14);
    pinB.rotation.x = Math.PI / 2;
    add(fore, new THREE.ConeGeometry(0.012, 0.03, 3), light, sx * 0.035, 0, 0.19).rotation.x = Math.PI / 2;
  }

  // mouth bits
  add(root, new THREE.BoxGeometry(0.1, 0.02, 0.02), dark, 0, 0.12, 0.2);

  // ground: shift so lowest leg tips touch y=0
  const box = new THREE.Box3().setFromObject(root);
  root.position.y = -box.min.y;
  const out = new THREE.Group();
  out.add(root);
  return out;
}
