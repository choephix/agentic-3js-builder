import * as THREE from "three";

export const meta = {
  name: "Sea Turtle",
  description: "A stylized green sea turtle in rest pose: domed scute shell, paddle flippers, small head and tapered tail.",
};

export default function createSeaTurtle(): THREE.Object3D {
  const root = new THREE.Group();
  root.name = "SeaTurtle";

  // ---- Materials (one per colour, shared) ----
  const shellMat = new THREE.MeshStandardMaterial({ color: 0x6b7a3c, roughness: 0.55, metalness: 0.0 });
  const plateMat = new THREE.MeshStandardMaterial({ color: 0x3f4d22, roughness: 0.5 });
  const plateRimMat = new THREE.MeshStandardMaterial({ color: 0xb8a25e, roughness: 0.45 });
  const plastronMat = new THREE.MeshStandardMaterial({ color: 0xd9c98f, roughness: 0.7 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0x5f7f5a, roughness: 0.75 });
  const flipperMat = new THREE.MeshStandardMaterial({ color: 0x4f6e4a, roughness: 0.7 });
  const beakMat = new THREE.MeshStandardMaterial({ color: 0xe0cc86, roughness: 0.5 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.2 });

  // ---- Shell geometry (dome + flat underside) ----
  const RX = 0.42, RY = 0.16, RZ = 0.55;
  const SHELL_Y = 0.08;

  const domeGeo = new THREE.SphereGeometry(0.5, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2);
  const dome = new THREE.Mesh(domeGeo, shellMat);
  dome.scale.set(RX / 0.5 * 1.0, RY / 0.5 * 1.0, RZ / 0.5 * 1.0);
  dome.position.set(0, SHELL_Y, 0);
  dome.castShadow = true;
  root.add(dome);

  // Plastron (belly shield), lower half of a flattened ellipsoid
  const plastronGeo = new THREE.SphereGeometry(0.5, 24, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  const plastron = new THREE.Mesh(plastronGeo, plastronMat);
  plastron.scale.set(0.4 / 0.5, 0.08 / 0.5, 0.52 / 0.5);
  plastron.position.set(0, SHELL_Y, 0);
  root.add(plastron);

  // Rim band around the shell edge
  const rimGeo = new THREE.TorusGeometry(1, 0.025, 6, 40);
  const rim = new THREE.Mesh(rimGeo, plateRimMat);
  rim.rotation.x = Math.PI / 2;
  rim.scale.set(RX * 0.98, RZ * 0.98, 1);
  rim.position.set(0, SHELL_Y + 0.005, 0);
  root.add(rim);

  // ---- Scutes: hexagonal plates following the dome surface ----
  const plateGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.014, 6, 1);
  const plateGeoSmall = new THREE.CylinderGeometry(0.035, 0.035, 0.012, 6, 1);
  const up = new THREE.Vector3(0, 1, 0);

  const addPlate = (a: number, b: number, geo: THREE.BufferGeometry, mat: THREE.Material) => {
    const sa = Math.sin(a), ca = Math.cos(a);
    const x = RX * sa * Math.cos(b);
    const y = RY * ca;
    const z = RZ * sa * Math.sin(b);
    const normal = new THREE.Vector3(
      x / (RX * RX),
      y / (RY * RY),
      z / (RZ * RZ),
    ).normalize();
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, SHELL_Y + y, z).addScaledVector(normal, 0.006);
    m.quaternion.setFromUnitVectors(up, normal);
    m.castShadow = true;
    root.add(m);
  };

  // Rings from the crest outward (polar angle a, count per ring)
  const rings: Array<{ a: number; n: number; geo: THREE.BufferGeometry; mat: THREE.Material; offset: number }> = [
    { a: 0.0, n: 1, geo: plateGeo, mat: plateMat, offset: 0 },
    { a: 0.36, n: 6, geo: plateGeo, mat: plateMat, offset: 0.3 },
    { a: 0.7, n: 9, geo: plateGeo, mat: plateMat, offset: 0.0 },
    { a: 1.02, n: 12, geo: plateGeoSmall, mat: plateRimMat, offset: 0.15 },
  ];
  for (const r of rings) {
    for (let i = 0; i < r.n; i++) {
      const b = (i / r.n) * Math.PI * 2 + r.offset;
      addPlate(r.a, b, r.geo, r.mat);
    }
  }

  // Central keel ridge along the crest
  const keelGeo = new THREE.BoxGeometry(0.03, 0.02, 0.9);
  const keel = new THREE.Mesh(keelGeo, plateMat);
  keel.position.set(0, SHELL_Y + RY * 0.92, 0);
  keel.scale.set(1, 1, 1);
  root.add(keel);

  // ---- Neck ----
  const neckGeo = new THREE.CylinderGeometry(0.06, 0.085, 0.22, 10, 1);
  const neck = new THREE.Mesh(neckGeo, skinMat);
  neck.rotation.x = Math.PI / 2 - 0.25;
  neck.position.set(0, 0.13, 0.4);
  root.add(neck);

  // ---- Head ----
  const headGeo = new THREE.SphereGeometry(0.1, 16, 12);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.scale.set(0.9, 0.82, 1.25);
  head.position.set(0, 0.15, 0.55);
  root.add(head);

  // Beak: a slightly hooked wedge
  const beakGeo = new THREE.ConeGeometry(0.055, 0.09, 6, 1);
  const beak = new THREE.Mesh(beakGeo, beakMat);
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, 0.135, 0.67);
  root.add(beak);

  // Eyes with a small highlight each
  const eyeGeo = new THREE.SphereGeometry(0.018, 10, 8);
  const hiGeo = new THREE.SphereGeometry(0.006, 6, 5);
  const hiMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(s * 0.075, 0.175, 0.6);
    root.add(eye);
    const hi = new THREE.Mesh(hiGeo, hiMat);
    hi.position.set(s * 0.075 + 0.006 * s, 0.183, 0.617);
    root.add(hi);
  }

  // ---- Flippers ----
  const flipGeo = new THREE.SphereGeometry(1, 16, 8);
  const makeFlipper = (
    side: number,
    pos: THREE.Vector3,
    length: number,
    width: number,
    sweepY: number,
    droopZ: number,
  ) => {
    const g = new THREE.Group();
    g.position.copy(pos);
    g.rotation.y = sweepY;
    g.rotation.z = droopZ;
    const m = new THREE.Mesh(flipGeo, flipperMat);
    m.scale.set(length, 0.022, width);
    m.position.set(side * length * 0.9, 0, 0);
    m.castShadow = true;
    g.add(m);
    root.add(g);
  };

  // Front flippers (long paddles, swept forward)
  makeFlipper(+1, new THREE.Vector3(0.3, 0.05, 0.2), 0.3, 0.1, -0.35, -0.22);
  makeFlipper(-1, new THREE.Vector3(-0.3, 0.05, 0.2), 0.3, 0.1, 0.35, 0.22);
  // Rear flippers (shorter, swept back)
  makeFlipper(+1, new THREE.Vector3(0.24, 0.05, -0.32), 0.18, 0.08, 0.55, -0.15);
  makeFlipper(-1, new THREE.Vector3(-0.24, 0.05, -0.32), 0.18, 0.08, -0.55, 0.15);

  // ---- Tail ----
  const tailGeo = new THREE.ConeGeometry(0.045, 0.16, 8, 1);
  const tail = new THREE.Mesh(tailGeo, skinMat);
  tail.rotation.x = -Math.PI / 2;
  tail.position.set(0, 0.06, -0.6);
  root.add(tail);

  return root;
}
