```ts
import * as THREE from "three";

export const meta = {
  name: "Golden Fruit Bat",
  description:
    "A fluffy golden-brown fruit bat with fox-like face, big dark eyes, and charcoal leathery wings spread wide, clutching a half-eaten fig.",
};

// Seeded RNG so every build is identical.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function createModel(): THREE.Object3D {
  const rng = mulberry32(7);
  const UP = new THREE.Vector3(0, 1, 0);

  // ---- Materials (shared, one per colour) ----
  const furMat = new THREE.MeshStandardMaterial({ color: 0xb07a3a, roughness: 0.95, flatShading: true });
  const muzzleMat = new THREE.MeshStandardMaterial({ color: 0xe8c28a, roughness: 0.9, flatShading: true });
  const legMat = new THREE.MeshStandardMaterial({ color: 0x7a4f25, roughness: 0.9 });
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0x2c2e35,
    roughness: 0.7,
    side: THREE.DoubleSide,
    flatShading: true,
  });
  const boneMat = new THREE.MeshStandardMaterial({ color: 0x3a3c44, roughness: 0.6 });
  const clawMat = new THREE.MeshStandardMaterial({ color: 0xd8ccb0, roughness: 0.5 });
  const nosMat = new THREE.MeshStandardMaterial({ color: 0x0d0a0a, roughness: 0.35 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1a0f08, roughness: 0.2 });
  const shineMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, emissive: 0x333333 });
  const earInnerMat = new THREE.MeshStandardMaterial({ color: 0x6b3b2a, roughness: 0.8 });
  const figMat = new THREE.MeshStandardMaterial({ color: 0x5b2a4a, roughness: 0.55 });
  const figInMat = new THREE.MeshStandardMaterial({ color: 0xd9607a, roughness: 0.6 });
  const stalkMat = new THREE.MeshStandardMaterial({ color: 0x4a6b2a, roughness: 0.8 });
  const seedMat = new THREE.MeshStandardMaterial({ color: 0x3b2a1a, roughness: 0.7 });

  const root = new THREE.Group();

  function add(mesh: THREE.Mesh, parent: THREE.Object3D = root) {
    mesh.castShadow = false;
    parent.add(mesh);
    return mesh;
  }

  function ellipsoid(
    r: number,
    s: [number, number, number],
    p: [number, number, number],
    mat: THREE.Material,
    seg = 14,
    flat = false,
  ) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(6, seg - 4)), mat);
    m.scale.set(s[0], s[1], s[2]);
    m.position.set(p[0], p[1], p[2]);
    if (flat) m.geometry = new THREE.IcosahedronGeometry(r, 1);
    return add(m);
  }

  // Place a mesh between two points, aligned along its +Y axis.
  function orient(mesh: THREE.Mesh, a: THREE.Vector3, b: THREE.Vector3) {
    const d = new THREE.Vector3().subVectors(b, a);
    mesh.position.copy(a).addScaledVector(d, 0.5);
    mesh.quaternion.setFromUnitVectors(UP, d.clone().normalize());
  }

  function bone(a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material, parent?: THREE.Object3D) {
    const len = a.distanceTo(b);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.6, len, 6), mat);
    orient(m, a, b);
    return add(m, parent);
  }

  function claw(base: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, parent?: THREE.Object3D) {
    const m = new THREE.Mesh(new THREE.ConeGeometry(r, len, 6), clawMat);
    const tip = base.clone().addScaledVector(dir.clone().normalize(), len);
    orient(m, base, tip);
    // ConeGeometry tip is at +Y, so orient with base->tip puts the tip along dir; swap to point the tip outward
    m.position.copy(base).addScaledVector(dir.clone().normalize(), len * 0.5);
    return add(m, parent);
  }

  // ---- Body ----
  const bodyCenter = new THREE.Vector3(0, 0.22, 0);
  ellipsoid(1, [0.13, 0.14, 0.12], [0, 0.22, 0], furMat, 18);

  // Belly lighter patch
  ellipsoid(1, [0.085, 0.09, 0.07], [0, 0.2, 0.07], muzzleMat, 12);

  // Fluffy tufts on the body surface
  for (let i = 0; i < 18; i++) {
    const u = rng() * 2 - 1;
    const ang = rng() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const dx = s * Math.cos(ang);
    const dy = u * 0.8;
    const dz = s * Math.sin(ang);
    const r = 0.035 + rng() * 0.02;
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), furMat);
    m.position.set(0.13 * dx * 0.95, 0.22 + 0.14 * dy * 0.95, 0.12 * dz * 0.95);
    m.scale.set(1, 0.9, 1);
    add(m);
  }

  // Tail
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.11, 8), furMat);
  tail.position.set(0, 0.17, -0.13);
  tail.quaternion.setFromUnitVectors(UP, new THREE.Vector3(0, 0.35, -1).normalize());
  add(tail);

  // ---- Head ----
  ellipsoid(1, [0.095, 0.09, 0.1], [0, 0.4, 0.06], furMat, 18);

  // Cheek ruffs
  for (const sx of [-1, 1]) {
    ellipsoid(1, [0.04, 0.03, 0.035], [sx * 0.075, 0.37, 0.05], furMat, 10, true);
  }

  // Muzzle (fox-like elongated snout)
  ellipsoid(1, [0.055, 0.045, 0.085], [0, 0.365, 0.15], muzzleMat, 12);

  // Moist black nose
  ellipsoid(0.024, [1.3, 0.9, 1], [0, 0.378, 0.23], nosMat, 10);

  // Big dark eyes with shine
  for (const sx of [-1, 1]) {
    ellipsoid(0.03, [1, 1.2, 0.6], [sx * 0.045, 0.42, 0.13], eyeMat, 12);
    ellipsoid(0.009, [1, 1, 1], [sx * 0.045 + 0.008, 0.43, 0.145], shineMat, 6);
  }

  // Pointed ears, tilted outward, with darker inner ear
  for (const sx of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.13, 6), furMat);
    ear.position.set(sx * 0.055, 0.515, 0.02);
    ear.rotation.z = -sx * 0.35;
    ear.rotation.x = -0.15;
    add(ear);

    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.09, 6), earInnerMat);
    inner.position.set(sx * 0.055, 0.51, 0.04);
    inner.rotation.z = -sx * 0.35;
    inner.rotation.x = -0.15;
    add(inner);
  }

  // ---- Wings (right side built, left mirrored) ----
  const wingGroup = new THREE.Group();

  const zOf = (x: number) => -0.25 * Math.max(0, x - 0.45);

  // Membrane outline in XY; z applied per vertex to cup the wing.
  const S = new THREE.Vector2(0.08, 0.34);
  const W = new THREE.Vector2(0.42, 0.46);
  const T1 = new THREE.Vector2(0.8, 0.44);
  const C1 = new THREE.Vector2(0.66, 0.36);
  const T2 = new THREE.Vector2(0.9, 0.3);
  const C2 = new THREE.Vector2(0.78, 0.22);
  const T3 = new THREE.Vector2(0.74, 0.12);
  const C3 = new THREE.Vector2(0.5, 0.1);
  const H = new THREE.Vector2(0.14, 0.2);

  const shape = new THREE.Shape();
  shape.moveTo(S.x, S.y);
  shape.lineTo(W.x, W.y);
  shape.lineTo(T1.x, T1.y);
  shape.lineTo(C1.x, C1.y);
  shape.lineTo(T2.x, T2.y);
  shape.lineTo(C2.x, C2.y);
  shape.lineTo(T3.x, T3.y);
  shape.lineTo(C3.x, C3.y);
  shape.lineTo(H.x, H.y);
  shape.closePath();

  const membraneGeo = new THREE.ShapeGeometry(shape, 1);
  const pos = membraneGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    pos.setZ(i, zOf(x));
  }
  membraneGeo.computeVertexNormals();
  const membrane = new THREE.Mesh(membraneGeo, wingMat);
  wingGroup.add(membrane);

  const v3 = (v: THREE.Vector2, z: number) => new THREE.Vector3(v.x, v.y, z);
  const shoulder = v3(S, 0.0);
  const wrist = v3(W, zOf(W.x) + 0.01);
  const t1 = v3(T1, zOf(T1.x));
  const t2 = v3(T2, zOf(T2.x));
  const t3 = v3(T3, zOf(T3.x));

  // Arm and long finger bones
  bone(shoulder, wrist, 0.014, boneMat, wingGroup);
  bone(wrist, t1, 0.008, boneMat, wingGroup);
  bone(wrist, t2, 0.008, boneMat, wingGroup);
  bone(wrist, t3, 0.008, boneMat, wingGroup);

  // Joint knuckle at wrist
  const knuckle = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), boneMat);
  knuckle.position.copy(wrist);
  add(knuckle, wingGroup);

  // Hooked thumb claw at the wrist
  const thumbBase = wrist.clone().add(new THREE.Vector3(0.0, 0.01, 0.01));
  const thumbDir = new THREE.Vector3(0.25, 1, 0.5);
  const thumb = new THREE.Mesh(new THREE.ConeGeometry(0.011, 0.055, 6), clawMat);
  thumb.position.copy(thumbBase).addScaledVector(thumbDir.clone().normalize(), 0.0275);
  thumb.quaternion.setFromUnitVectors(UP, thumbDir.clone().normalize());
  add(thumb, wingGroup);

  // Tiny hooked tip at the end of each thumb claw
  const hook = new THREE.Mesh(new THREE.ConeGeometry(0.006, 0.02, 5), clawMat);
  hook.position.copy(thumbBase).addScaledVector(thumbDir.clone().normalize(), 0.055);
  hook.position.z -= 0.012;
  hook.rotation.x = 0.8;
  add(hook, wingGroup);

  const wingR = wingGroup;
  root.add(wingR);

  const wingL = wingGroup.clone(true);
  wingL.scale.x = -1;
  root.add(wingL);

  // ---- Legs and feet ----
  for (const sx of [-1, 1]) {
    const hip = new THREE.Vector3(sx * 0.07, 0.1, 0.0);
    const ankle = new THREE.Vector3(sx * 0.08, 0.03, 0.06);
    bone(hip, ankle, 0.017, legMat);

    // Foot, flattened, touching y = 0
    const foot = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), legMat);
    foot.scale.set(0.04, 0.018, 0.06);
    foot.position.set(sx * 0.08, 0.018, 0.075);
    add(foot);

    // Toe claws curling toward the fig
    for (const tx of [-0.018, 0.018]) {
      const base = new THREE.Vector3(sx * 0.08 + tx, 0.02, 0.11);
      claw(base, new THREE.Vector3(0, 0.3, 1), 0.03, 0.007);
    }
  }

  // ---- Half-eaten fig clutched between the feet ----
  const fig = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), figMat);
  fig.scale.set(0.9, 1.05, 0.9);
  fig.position.set(0, 0.06, 0.09);
  fig.rotation.z = 0.25;
  add(fig);

  // Bite cavity showing pinkish flesh
  const bite = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), figInMat);
  bite.scale.set(0.028, 0.03, 0.022);
  bite.position.set(0.04, 0.07, 0.115);
  add(bite);

  // Seeds in the flesh
  const seedPts: [number, number, number][] = [
    [0.045, 0.07, 0.125],
    [0.035, 0.06, 0.128],
    [0.05, 0.065, 0.118],
    [0.04, 0.08, 0.122],
  ];
  for (const p of seedPts) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.0045, 5, 4), seedMat);
    s.position.set(p[0], p[1], p[2]);
    add(s);
  }

  // Stalk
  const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.007, 0.022, 6), stalkMat);
  stalk.position.set(-0.01, 0.12, 0.085);
  stalk.rotation.z = 0.25;
  add(stalk);

  // ---- Fine finishing: tips of the wing tips show small claws at finger ends ----
  // (The finger bones already end at the membrane tips.)

  root.name = "GoldenFruitBat";
  return root;
}
```