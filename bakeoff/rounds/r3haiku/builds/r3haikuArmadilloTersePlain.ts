import * as THREE from "three";

export const meta = {
  name: "Armadillo",
  description:
    "A stylized nine-banded armadillo in a relaxed rest pose: domed banded shell, pale belly, pointed snout, long ringed tail and clawed feet.",
};

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >> 14)) >>> 0) / 4294967296;
  };
}

export default function build(): THREE.Object3D {
  const rand = rng(7);

  const M = {
    shell: new THREE.MeshStandardMaterial({ color: 0x9c7b57, roughness: 0.8 }),
    scute: new THREE.MeshStandardMaterial({ color: 0xb08c64, roughness: 0.75 }),
    band: new THREE.MeshStandardMaterial({ color: 0x6e5238, roughness: 0.7 }),
    belly: new THREE.MeshStandardMaterial({ color: 0xd8b9a0, roughness: 0.9 }),
    skin: new THREE.MeshStandardMaterial({ color: 0xb48c7a, roughness: 0.9 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x1d1a17, roughness: 0.4 }),
    claw: new THREE.MeshStandardMaterial({ color: 0xefe6d2, roughness: 0.5 }),
    ear: new THREE.MeshStandardMaterial({ color: 0xd08f85, roughness: 0.8 }),
  };

  const root = new THREE.Group();
  const add = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    p: [number, number, number] = [0, 0, 0],
    s: [number, number, number] = [1, 1, 1],
    r: [number, number, number] = [0, 0, 0],
  ) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...p);
    m.scale.set(...s);
    m.rotation.set(...r);
    root.add(m);
    return m;
  };

  // Shared geometries
  const unitSphere = new THREE.SphereGeometry(1, 16, 12);
  const domeGeo = new THREE.SphereGeometry(1, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.62);
  const bandGeo = new THREE.TorusGeometry(1, 0.035, 4, 20, Math.PI);
  const bumpGeo = new THREE.CylinderGeometry(0.016, 0.018, 0.01, 6);
  const eyeGeo = new THREE.SphereGeometry(0.018, 8, 6);
  const clawGeo = new THREE.ConeGeometry(0.008, 0.028, 5);

  // ---- Body: domed shell and pale belly ----
  const BODY_Y = 0.15;
  const BX = 0.2;
  const BY = 0.12;
  const BZ = 0.27;
  add(domeGeo, M.shell, [0, BODY_Y, 0], [BX, BY, BZ]);
  add(unitSphere, M.belly, [0, 0.1, 0], [0.17, 0.08, 0.23]);

  // ---- Armour bands (nine), each a half ring around the body ----
  const bandZ: number[] = [];
  for (let i = 0; i < 9; i++) bandZ.push(0.13 - i * 0.033);

  const ellipseScale = (z: number) => {
    const f = Math.sqrt(Math.max(0, 1 - (z / BZ) * (z / BZ)));
    return { sx: BX * f * 1.03, sy: BY * f * 1.03 };
  };

  for (const z of bandZ) {
    const { sx, sy } = ellipseScale(z);
    add(bandGeo, M.band, [0, BODY_Y, z], [sx, sy, 1]);
  }

  // ---- Scute bumps filling the rows between bands ----
  for (let i = 0; i < bandZ.length - 1; i++) {
    const zMid = (bandZ[i] + bandZ[i + 1]) / 2;
    const { sx, sy } = ellipseScale(zMid);
    for (let k = 0; k < 6; k++) {
      const t = 0.14 + (0.72 * (k + 0.5 + (rand() - 0.5) * 0.4)) / 6;
      const th = Math.PI * t;
      const c = Math.cos(th);
      const s = Math.sin(th);
      const n = new THREE.Vector3(c / sx, s / sy, 0).normalize();
      const surf = new THREE.Vector3(sx * c, sy * s, 0);
      const pos = surf.add(n.clone().multiplyScalar(0.004));
      const m = new THREE.Mesh(bumpGeo, M.scute);
      const jitter = 0.85 + rand() * 0.3;
      m.scale.set(jitter, 1, jitter);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
      m.position.set(pos.x, BODY_Y + pos.y, zMid);
      root.add(m);
    }
  }

  // ---- Head ----
  const HEAD_Y = 0.18;
  const HEAD_Z = 0.33;
  add(domeGeo, M.shell, [0, HEAD_Y, HEAD_Z], [0.11, 0.1, 0.13]);

  // Pointed snout
  add(new THREE.ConeGeometry(0.055, 0.14, 8), M.skin, [0, 0.16, 0.44], [1, 1, 1], [Math.PI / 2, 0, 0]);

  // Nose tip
  add(eyeGeo, M.dark, [0, 0.16, 0.515], [1.2, 0.9, 1]);

  // Eyes
  for (const sx of [-1, 1]) {
    add(eyeGeo, M.dark, [sx * 0.085, 0.22, 0.4]);
  }

  // Ears: small cones tilted back
  for (const sx of [-1, 1]) {
    add(new THREE.ConeGeometry(0.02, 0.05, 6), M.ear, [sx * 0.055, 0.27, 0.27], [1, 1, 1], [-0.35, 0, sx * 0.15]);
  }

  // ---- Legs and feet ----
  const legGeo = new THREE.CylinderGeometry(0.035, 0.04, 0.12, 8);
  const footGeo = new THREE.BoxGeometry(0.08, 0.03, 0.09);
  const legs: [number, number][] = [
    [-0.13, 0.15],
    [0.13, 0.15],
    [-0.13, -0.12],
    [0.13, -0.12],
  ];
  for (const [lx, lz] of legs) {
    add(legGeo, M.skin, [lx, 0.06, lz]);
    add(footGeo, M.skin, [lx, 0.015, lz + 0.01]);
    for (const cx of [-0.025, 0, 0.025]) {
      add(clawGeo, M.claw, [lx + cx, 0.02, lz + 0.055], [1, 1, 1], [Math.PI / 2 + 0.2, 0, 0]);
    }
  }

  // ---- Tail: tapering, ringed segments pointing back along -Z ----
  const SEG = 8;
  const segLen = 0.06;
  const radiusAt = (i: number) => 0.05 * (1 - i / SEG) + 0.012;
  for (let i = 0; i < SEG; i++) {
    const zc = -0.26 - (i + 0.5) * segLen;
    const yc = 0.13 - 0.006 * i;
    const geo = new THREE.CylinderGeometry(radiusAt(i + 1), radiusAt(i), segLen, 8);
    const mat = i % 2 === 0 ? M.shell : M.band;
    add(geo, mat, [0, yc, zc], [1, 1, 1], [-Math.PI / 2, 0, 0]);
  }

  return root;
}
