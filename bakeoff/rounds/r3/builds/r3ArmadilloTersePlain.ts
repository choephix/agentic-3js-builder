import * as THREE from "three";

export const meta = {
  name: "Armadillo",
  description: "Stylized nine-banded armadillo built from low-poly primitives with banded armor shell, pointed snout, big ears and tail.",
};

export default function build(): THREE.Object3D {
  let s = 7;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };

  const mat = (c: number, r = 0.85, m = 0) =>
    new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, flatShading: true });
  const shellA = mat(0x8b7260);
  const shellB = mat(0x6b5445);
  const shellC = mat(0xa38a74);
  const skin = mat(0xd9a8a0);
  const skinDark = mat(0xb98582);
  const dark = mat(0x111111, 0.3);
  const claw = mat(0xeee3cc);
  const white = mat(0xffffff, 0.3);

  const root = new THREE.Group();
  const g = new THREE.Group();
  root.add(g);

  const add = (geo: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = g) => {
    const me = new THREE.Mesh(geo, m);
    me.position.set(x, y, z);
    parent.add(me);
    return me;
  };

  // Belly
  const belly = add(new THREE.SphereGeometry(0.5, 8, 6), skin, 0, 0.24, 0);
  belly.scale.set(0.46, 0.4, 0.9);

  // Carapace: shoulder shield, banded middle, pelvic shield
  const dome = (r: number, z: number, y: number, sx: number, sz: number, m: THREE.Material) => {
    const me = add(new THREE.SphereGeometry(r, 9, 5, 0, Math.PI * 2, 0, Math.PI / 2), m, 0, y, z);
    me.scale.set(sx, 1, sz);
    return me;
  };
  dome(0.3, 0.3, 0.2, 1, 0.9, shellA);
  dome(0.3, -0.33, 0.2, 1, 0.9, shellA);

  // Bands in the middle
  const nb = 9;
  for (let i = 0; i < nb; i++) {
    const t = i / (nb - 1);
    const z = 0.14 - t * 0.28;
    const r = 0.3 - Math.abs(t - 0.5) * 0.02;
    const band = add(
      new THREE.SphereGeometry(r, 9, 3, 0, Math.PI * 2, 0, Math.PI / 2),
      i % 2 ? shellB : shellC, 0, 0.2, z
    );
    band.scale.set(1, 1, 0.14);
  }
  // Plate studs on shields
  for (let i = 0; i < 40; i++) {
    const a = (rnd() - 0.5) * 2.4;
    const front = rnd() > 0.5;
    const cz = front ? 0.3 : -0.33;
    const rr = 0.2 + rnd() * 0.09;
    const zz = cz + Math.cos(a + Math.PI / 2) * 0.0 + (rnd() - 0.5) * 0.2;
    const y = 0.2 + Math.sqrt(Math.max(0.0001, 0.3 * 0.3 - (rr * 0.5) ** 2)) * 0.6;
    const p = add(new THREE.BoxGeometry(0.07, 0.025, 0.07), i % 3 ? shellB : shellC, Math.sin(a) * 0.27, y * 0.95 - 0.02 + Math.cos(a) * 0.04, zz);
    p.rotation.z = a * 0.9;
    p.rotation.y = rnd();
    p.scale.y = 1;
  }

  // Head
  const head = new THREE.Group();
  head.position.set(0, 0.22, 0.55);
  g.add(head);
  const skull = add(new THREE.SphereGeometry(0.15, 8, 6), shellA, 0, 0.03, 0.02, head);
  skull.scale.set(1, 0.9, 1.1);
  const snout = add(new THREE.ConeGeometry(0.11, 0.3, 6), skin, 0, -0.02, 0.2, head);
  snout.rotation.x = Math.PI / 2 + 0.15;
  const nose = add(new THREE.SphereGeometry(0.03, 6, 4), skinDark, 0, -0.045, 0.36, head);
  for (const sx of [-1, 1]) {
    const ear = add(new THREE.ConeGeometry(0.07, 0.2, 4), skinDark, sx * 0.1, 0.17, -0.03, head);
    ear.rotation.z = -sx * 0.35;
    ear.scale.z = 0.4;
    const eye = add(new THREE.SphereGeometry(0.025, 6, 4), dark, sx * 0.1, 0.06, 0.1, head);
    add(new THREE.SphereGeometry(0.008, 4, 3), white, sx * 0.105, 0.07, 0.12, head);
    void eye;
  }
  void nose;
  // Head shield cap
  const cap = add(new THREE.SphereGeometry(0.16, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), shellB, 0, 0.04, 0.0, head);
  cap.scale.set(1, 0.7, 1.1);

  // Legs
  const leg = (x: number, z: number, big: boolean) => {
    const lg = new THREE.Group();
    lg.position.set(x, 0.2, z);
    g.add(lg);
    const up = add(new THREE.CylinderGeometry(0.06, 0.05, 0.2, 6), skinDark, 0, -0.08, 0, lg);
    void up;
    add(new THREE.BoxGeometry(0.12, 0.05, 0.18), skinDark, 0, -0.17, 0.03, lg);
    for (let c = -1; c <= 1; c++) {
      const cl = add(new THREE.ConeGeometry(0.018, 0.09, 4), claw, c * 0.04, -0.17, 0.15, lg);
      cl.rotation.x = Math.PI / 2;
    }
    void big;
  };
  leg(0.2, 0.36, true);
  leg(-0.2, 0.36, true);
  leg(0.2, -0.36, false);
  leg(-0.2, -0.36, false);

  // Tail: tapering segments
  let tz = -0.6, ty = 0.2;
  for (let i = 0; i < 6; i++) {
    const r = 0.1 - i * 0.014;
    const seg = add(new THREE.CylinderGeometry(r * 0.85, r, 0.14, 6), i % 2 ? shellB : shellA, 0, ty, tz);
    seg.rotation.x = Math.PI / 2 + 0.12 + i * 0.03;
    tz -= 0.13;
    ty -= 0.012 + i * 0.004;
  }
  add(new THREE.ConeGeometry(0.02, 0.08, 5), shellC, 0, ty - 0.01, tz - 0.02).rotation.x = -Math.PI / 2;

  // Drop to floor: claws/feet bottom at ~0.02
  g.position.y = 0.01;
  return root;
}
