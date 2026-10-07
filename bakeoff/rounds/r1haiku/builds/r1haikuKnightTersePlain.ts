import * as THREE from "three";

export const meta = {
  name: "Armored Knight",
  description:
    "A plate-armoured knight at rest: great helm with a red plume, a navy heater shield with a gold cross, a longsword planted point-down and a crimson cape.",
};

export default function createKnight(): THREE.Object3D {
  const root = new THREE.Group();
  const UP = new THREE.Vector3(0, 1, 0);

  const std = (color: number, metalness: number, roughness: number) =>
    new THREE.MeshStandardMaterial({ color, metalness, roughness });

  const M = {
    steel: std(0xc3cad2, 0.92, 0.3),
    dark: std(0x59606a, 0.85, 0.45),
    gold: std(0xd9a441, 1.0, 0.28),
    red: std(0xa3181c, 0.0, 0.75),
    cloth: std(0x5e0f12, 0.0, 0.9),
    navy: std(0x1d3566, 0.1, 0.6),
    leather: std(0x4a2d1a, 0.0, 0.8),
    slit: std(0x0a0a0c, 0.0, 1.0),
  };

  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const add = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    x: number,
    y: number,
    z: number,
    rx = 0,
    ry = 0,
    rz = 0,
    sx = 1,
    sy = 1,
    sz = 1,
  ) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    m.scale.set(sx, sy, sz);
    m.castShadow = true;
    m.receiveShadow = true;
    root.add(m);
    return m;
  };

  // A cylinder stretched between two points (radius rA at a, rB at b).
  const limb = (a: THREE.Vector3, b: THREE.Vector3, rA: number, rB: number, mat: THREE.Material, seg = 10) => {
    const d = new THREE.Vector3().subVectors(b, a);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rB, rA, d.length(), seg), mat);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(UP, d.clone().normalize());
    m.castShadow = true;
    root.add(m);
    return m;
  };

  // A box oriented along a direction (its local Y runs along dir).
  const oriented = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    center: THREE.Vector3,
    dir: THREE.Vector3,
  ) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(center);
    m.quaternion.setFromUnitVectors(UP, dir.clone().normalize());
    m.castShadow = true;
    root.add(m);
    return m;
  };

  // ---------- Legs and sabatons ----------
  for (const s of [-1, 1]) {
    const hip = v(s * 0.13, 1.0, 0);
    const knee = v(s * 0.13, 0.52, 0.02);
    const ankle = v(s * 0.13, 0.12, 0.0);

    limb(hip, knee, 0.1, 0.085, M.steel, 12); // cuisse
    add(new THREE.SphereGeometry(0.09, 12, 8), M.gold, s * 0.13, 0.52, 0.04, 0, 0, 0, 1, 0.9, 0.9); // poleyn
    limb(knee, ankle, 0.075, 0.06, M.steel, 12); // greave
    add(new THREE.BoxGeometry(0.13, 0.1, 0.3), M.dark, s * 0.13, 0.05, 0.08); // sabaton
    add(new THREE.SphereGeometry(0.065, 10, 8), M.dark, s * 0.13, 0.05, 0.19, 0, 0, 0, 1, 0.8, 1.1); // toe cap
  }

  // ---------- Hips, breastplate, tabard ----------
  add(new THREE.CylinderGeometry(0.22, 0.25, 0.22, 12), M.dark, 0, 1.04, 0, 0, 0, 0, 1, 1, 0.72); // fauld
  add(new THREE.CylinderGeometry(0.22, 0.25, 0.35, 12), M.steel, 0, 1.325, 0, 0, 0, 0, 1, 1, 0.72); // breastplate
  add(new THREE.TorusGeometry(0.25, 0.018, 6, 20), M.gold, 0, 1.5, 0, Math.PI / 2, 0, 0, 1, 1, 0.72); // gold lip
  add(new THREE.TorusGeometry(0.235, 0.015, 6, 20), M.gold, 0, 1.13, 0, Math.PI / 2, 0, 0, 1, 1, 0.72); // waist trim

  // Pectoral bulges
  for (const s of [-1, 1]) {
    add(new THREE.SphereGeometry(0.1, 12, 8), M.steel, s * 0.11, 1.36, 0.14, 0, 0, 0, 1, 0.8, 0.55);
  }

  // Tabard with gold cross
  add(new THREE.BoxGeometry(0.26, 0.42, 0.02), M.cloth, 0, 1.07, 0.2);
  add(new THREE.BoxGeometry(0.035, 0.26, 0.01), M.gold, 0, 1.2, 0.215);
  add(new THREE.BoxGeometry(0.16, 0.035, 0.01), M.gold, 0, 1.26, 0.215);

  // Tassets
  for (const x of [-0.2, -0.07, 0.07, 0.2]) {
    add(new THREE.BoxGeometry(0.12, 0.2, 0.02), M.dark, x, 0.88, 0.16, -0.12);
  }

  // Gorget and neck
  add(new THREE.CylinderGeometry(0.09, 0.1, 0.16, 12), M.dark, 0, 1.52, 0);
  add(new THREE.TorusGeometry(0.12, 0.03, 8, 20), M.steel, 0, 1.56, 0, Math.PI / 2);

  // ---------- Pauldrons and arms ----------
  for (const s of [-1, 1]) {
    const sh = v(s * 0.36, 1.46, 0);
    add(new THREE.SphereGeometry(0.15, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.steel, s * 0.36, 1.53, 0, 0, 0, s * 0.3, 1, 0.75, 1.05);
    add(new THREE.TorusGeometry(0.15, 0.025, 6, 16), M.gold, s * 0.36, 1.5, 0, Math.PI / 2);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      add(new THREE.SphereGeometry(0.014, 6, 5), M.gold, s * 0.36 + Math.cos(a) * 0.15, 1.5, Math.sin(a) * 0.15);
    }

    const elbow = v(s * 0.4 + (s < 0 ? -0.02 : 0.02), 1.14, 0.06);
    const wrist = v(s * 0.42, 1.02, s < 0 ? 0.22 : 0.2);
    limb(sh, elbow, 0.07, 0.06, M.steel, 10); // upper arm
    add(new THREE.SphereGeometry(0.075, 10, 8), M.dark, elbow.x, elbow.y, elbow.z); // couter
    limb(elbow, wrist, 0.065, 0.05, M.steel, 10); // vambrace
    add(new THREE.SphereGeometry(0.068, 10, 8), M.dark, wrist.x, wrist.y, wrist.z, 0, 0, 0, 1, 0.8, 1.1); // gauntlet
  }

  // ---------- Shield (left arm, +X side) ----------
  const heater = new THREE.Shape();
  heater.moveTo(-0.2, 0.25);
  heater.lineTo(0.2, 0.25);
  heater.lineTo(0.2, 0.05);
  heater.quadraticCurveTo(0.2, -0.2, 0, -0.32);
  heater.quadraticCurveTo(-0.2, -0.2, -0.2, 0.05);
  heater.closePath();
  const shieldGeo = new THREE.ExtrudeGeometry(heater, { depth: 0.04, bevelEnabled: false });
  const shield = add(shieldGeo, M.navy, 0.48, 1.0, 0.14, 0, Math.PI / 2, 0);
  shield.castShadow = true;
  // Shield rim and emblem
  add(new THREE.BoxGeometry(0.01, 0.3, 0.05), M.gold, 0.525, 0.98, 0.14);
  add(new THREE.BoxGeometry(0.01, 0.05, 0.26), M.gold, 0.525, 0.98, 0.14);
  add(new THREE.BoxGeometry(0.012, 0.56, 0.02), M.dark, 0.49, 1.0, 0.14 - 0.2);
  add(new THREE.SphereGeometry(0.05, 10, 8), M.dark, 0.47, 1.0, 0.16); // shield hand

  // ---------- Longsword (right hand, -X side, point down) ----------
  const T = v(-0.44, 0.02, 0.32);
  const G = v(-0.44, 1.0, 0.27);
  const dir = new THREE.Vector3().subVectors(G, T).normalize();
  const bladeLen = T.distanceTo(G);
  oriented(new THREE.BoxGeometry(0.045, bladeLen, 0.008), M.steel, T.clone().add(G).multiplyScalar(0.5), dir);
  oriented(new THREE.BoxGeometry(0.2, 0.035, 0.04), M.gold, G.clone(), dir); // crossguard
  const P = G.clone().addScaledVector(dir, 0.11);
  limb(G, P, 0.014, 0.014, M.leather, 8); // grip
  add(new THREE.SphereGeometry(0.028, 10, 8), M.gold, P.x + dir.x * 0.02, P.y + dir.y * 0.02, P.z + dir.z * 0.02); // pommel
  add(new THREE.SphereGeometry(0.058, 10, 8), M.dark, G.x, G.y + 0.04, G.z - 0.02, 0, 0, 0, 1, 1.1, 1); // right gauntlet

  // ---------- Head: great helm with plume ----------
  add(new THREE.CylinderGeometry(0.135, 0.135, 0.2, 14), M.steel, 0, 1.68, 0);
  add(new THREE.SphereGeometry(0.135, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.steel, 0, 1.78, 0, 0, 0, 0, 1, 0.8, 1);
  add(new THREE.TorusGeometry(0.136, 0.012, 6, 20), M.gold, 0, 1.78, 0, Math.PI / 2);
  add(new THREE.BoxGeometry(0.2, 0.12, 0.04), M.steel, 0, 1.68, 0.13); // visor
  add(new THREE.BoxGeometry(0.18, 0.02, 0.02), M.slit, 0, 1.7, 0.155); // eye slit
  for (const x of [-0.04, 0, 0.04]) {
    add(new THREE.BoxGeometry(0.02, 0.02, 0.01), M.slit, x, 1.62, 0.155); // breath holes
  }
  add(new THREE.BoxGeometry(0.025, 0.03, 0.24), M.gold, 0, 1.87, 0); // crest ridge

  // Plume: a arc of red ellipsoids sweeping back
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    const s = 0.7 + 0.3 * t;
    add(
      new THREE.SphereGeometry(1, 10, 8),
      M.red,
      0,
      1.9 - 0.12 * t * t,
      -0.02 - 0.2 * t,
      -0.2 * t,
      0,
      0,
      0.035 * s,
      0.07 * s,
      0.05 * s,
    );
  }

  // ---------- Cape ----------
  const capeGeo = new THREE.PlaneGeometry(0.5, 1.05, 6, 8);
  const pos = capeGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    pos.setZ(i, 0.03 * Math.sin(x * 9 + y * 4) - 0.02 * (0.5 - (y + 0.525) / 1.05));
  }
  capeGeo.computeVertexNormals();
  const cape = new THREE.Mesh(capeGeo, new THREE.MeshStandardMaterial({
    color: 0x5e0f12,
    roughness: 0.9,
    metalness: 0,
    side: THREE.DoubleSide,
  }));
  cape.position.set(0, 0.975, -0.2);
  cape.castShadow = true;
  root.add(cape);

  return root;
}
