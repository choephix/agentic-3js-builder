import * as THREE from "three";

export const meta = {
  name: "Cozy Treehouse",
  description: "A thick old oak with a red-roofed cabin, round window, rope ladder, swing, pennant, lantern, mushrooms and a bicycle on a grassy round base.",
};

// Seeded generator so every run builds the same model.
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

export default function createTreehouse(): THREE.Object3D {
  const rand = mulberry32(7);
  const root = new THREE.Group();

  // ---- Palette: one material per colour, shared ----
  const M = {
    grass: new THREE.MeshStandardMaterial({ color: 0x6fae4a, roughness: 0.95, flatShading: true }),
    grassDark: new THREE.MeshStandardMaterial({ color: 0x4f8a36, roughness: 0.95, flatShading: true }),
    bark: new THREE.MeshStandardMaterial({ color: 0x5b3d26, roughness: 0.9, flatShading: true }),
    leafA: new THREE.MeshStandardMaterial({ color: 0x3f8f3a, roughness: 0.8, flatShading: true }),
    leafB: new THREE.MeshStandardMaterial({ color: 0x5fb24a, roughness: 0.8, flatShading: true }),
    leafC: new THREE.MeshStandardMaterial({ color: 0x2e6e33, roughness: 0.8, flatShading: true }),
    wood: new THREE.MeshStandardMaterial({ color: 0xc98f55, roughness: 0.75, flatShading: true }),
    woodDark: new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.8, flatShading: true }),
    roof: new THREE.MeshStandardMaterial({ color: 0xc23a2e, roughness: 0.6, flatShading: true }),
    trim: new THREE.MeshStandardMaterial({ color: 0xf2e6cf, roughness: 0.6 }),
    glass: new THREE.MeshStandardMaterial({
      color: 0xffe199, emissive: 0xffb84d, emissiveIntensity: 0.9, roughness: 0.3,
    }),
    rope: new THREE.MeshStandardMaterial({ color: 0xd9c08a, roughness: 0.95 }),
    iron: new THREE.MeshStandardMaterial({ color: 0x3a3f47, roughness: 0.5, metalness: 0.4 }),
    mushRed: new THREE.MeshStandardMaterial({ color: 0xd8382b, roughness: 0.5, flatShading: true }),
    mushCream: new THREE.MeshStandardMaterial({ color: 0xf6ecd8, roughness: 0.7 }),
    flagA: new THREE.MeshStandardMaterial({ color: 0xf2c230, roughness: 0.7, side: THREE.DoubleSide }),
    flagB: new THREE.MeshStandardMaterial({ color: 0x2f6fb8, roughness: 0.7 }),
    lanternPost: new THREE.MeshStandardMaterial({ color: 0x2b2a33, roughness: 0.6, metalness: 0.2 }),
  };

  const add = (parent: THREE.Object3D, geom: THREE.BufferGeometry, mat: THREE.Material,
    x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geom, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    parent.add(m);
    return m;
  };

  // Cylinder stretched from point a to point b (tapers from r at a to rt at b).
  const limb = (parent: THREE.Object3D, a: THREE.Vector3, b: THREE.Vector3,
    r: number, mat: THREE.Material, rt = r * 0.8, seg = 6) => {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, r, len, seg), mat);
    m.position.copy(a).addScaledVector(dir, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    parent.add(m);
    return m;
  };

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---- Grassy round base ----
  const base = new THREE.Group();
  root.add(base);
  add(base, new THREE.CylinderGeometry(2.4, 2.55, 0.3, 28), M.grass, 0, 0.15, 0);
  add(base, new THREE.CylinderGeometry(2.42, 2.42, 0.06, 28), M.grassDark, 0, 0.3, 0);
  // Grass tufts
  for (let i = 0; i < 26; i++) {
    const ang = rand() * Math.PI * 2;
    const d = 1.2 + rand() * 1.05;
    const x = Math.cos(ang) * d;
    const z = Math.sin(ang) * d;
    const h = 0.12 + rand() * 0.14;
    add(base, new THREE.ConeGeometry(0.06 + rand() * 0.03, h, 4), rand() < 0.5 ? M.grass : M.grassDark,
      x, 0.3 + h / 2, z);
  }

  // ---- Oak tree ----
  const tree = new THREE.Group();
  root.add(tree);

  // Trunk
  add(tree, new THREE.CylinderGeometry(0.28, 0.5, 3.2, 8), M.bark, 0, 1.6, 0);
  // Root flares
  const roots = [[0.6, 0.6], [-0.5, 0.6], [0.1, -0.7], [-0.6, -0.4]];
  roots.forEach(([x, z]) => limb(tree, V(x * 0.5, 0.05, z * 0.5), V(x, 0.0, z), 0.13, M.bark, 0.03));

  // Branches reaching up into the crown
  limb(tree, V(0, 2.4, 0), V(-1.9, 2.9, -0.4), 0.16, M.bark, 0.06);
  limb(tree, V(0, 2.6, 0), V(1.7, 3.7, -0.5), 0.2, M.bark, 0.07);
  limb(tree, V(0, 3.0, 0), V(-0.9, 4.4, 0.2), 0.18, M.bark, 0.06);
  limb(tree, V(0, 3.0, 0), V(0.5, 4.7, -0.6), 0.17, M.bark, 0.06);
  limb(tree, V(0, 3.1, 0), V(-1.3, 3.6, -1.2), 0.14, M.bark, 0.05);
  limb(tree, V(0, 2.8, 0), V(0.9, 3.4, 1.5), 0.13, M.bark, 0.05);

  // Platform braces from trunk
  limb(tree, V(0.1, 1.8, 0.1), V(0.4, 1.8, 0.1), 0.1, M.woodDark, 0.08);
  limb(tree, V(0.1, 1.8, 0.1), V(0.9, 1.7, 1.45), 0.08, M.woodDark, 0.06);
  limb(tree, V(0.1, 1.8, 0.1), V(1.7, 1.7, 0.2), 0.08, M.woodDark, 0.06);

  // Leafy crown: clusters of faceted blobs
  const leafClusters: [number, number, number, number, THREE.Material][] = [
    [0, 4.2, 0, 1.1, M.leafA],
    [-1.2, 3.9, -0.3, 0.85, M.leafB],
    [1.3, 4.0, -0.6, 0.9, M.leafA],
    [0.3, 4.9, 0.2, 0.8, M.leafB],
    [-0.6, 4.7, -0.9, 0.85, M.leafC],
    [1.0, 4.6, -1.1, 0.75, M.leafB],
    [1.9, 3.6, -0.2, 0.62, M.leafC],
    [-1.9, 3.5, 0.5, 0.6, M.leafA],
    [-0.2, 5.2, -0.4, 0.6, M.leafA],
    [0.2, 3.5, -1.3, 0.7, M.leafC],
    [-1.0, 4.3, 0.9, 0.55, M.leafB],
  ];
  leafClusters.forEach(([x, y, z, r, mat]) => {
    add(tree, new THREE.DodecahedronGeometry(r, 0), mat, x, y, z,
      rand() * 0.5, rand() * 1.5, rand() * 0.5);
    // a few smaller leaf chunks for silhouette
    for (let k = 0; k < 2; k++) {
      const s = r * (0.45 + rand() * 0.2);
      add(tree, new THREE.IcosahedronGeometry(s, 0),
        rand() < 0.5 ? M.leafB : M.leafC,
        x + (rand() - 0.5) * r * 1.6, y + (rand() - 0.2) * r * 0.9, z + (rand() - 0.5) * r * 1.6);
    }
  });

  // ---- Cabin nestled in the branches ----
  const CX = 0.9, CZ = 0.7;
  const cabin = new THREE.Group();
  root.add(cabin);

  // Platform
  add(cabin, new THREE.BoxGeometry(2.0, 0.12, 1.8), M.wood, CX, 1.86, CZ);
  // Platform railing posts
  for (let i = 0; i < 4; i++) {
    const x = CX - 0.9 + i * 0.6;
    add(cabin, new THREE.BoxGeometry(0.06, 0.25, 0.06), M.woodDark, x, 2.0, CZ + 0.82);
  }
  add(cabin, new THREE.BoxGeometry(2.0, 0.05, 0.05), M.woodDark, CX, 2.14, CZ + 0.82);

  // Walls
  add(cabin, new THREE.BoxGeometry(1.4, 1.05, 1.3), M.wood, CX, 2.42, CZ);
  // Board lines on front for character
  for (let i = 0; i < 4; i++) {
    add(cabin, new THREE.BoxGeometry(1.42, 0.03, 0.03), M.woodDark, CX, 2.0 + i * 0.27, CZ + 0.66);
  }
  // Corner posts
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
    add(cabin, new THREE.BoxGeometry(0.1, 1.08, 0.1), M.woodDark,
      CX + sx * 0.7, 2.42, CZ + sz * 0.65);
  });

  // Roof: red shingles as a 4-sided pyramid, rotated to align with walls
  const roofTop = 3.9;
  add(cabin, new THREE.ConeGeometry(1.0, 0.9, 4), M.roof, CX, roofTop - 0.45, CZ, 0, Math.PI / 4, 0);
  // Eave trim
  add(cabin, new THREE.BoxGeometry(1.7, 0.07, 1.6), M.trim, CX, 2.98, CZ);

  // Door on front
  add(cabin, new THREE.BoxGeometry(0.36, 0.62, 0.04), M.woodDark, CX - 0.3, 2.29, CZ + 0.67);
  add(cabin, new THREE.SphereGeometry(0.22, 8, 6), M.woodDark, CX - 0.3, 2.9, CZ + 0.66, 0, 0, 0)
    .scale.set(1, 0.3, 0.3);
  add(cabin, new THREE.SphereGeometry(0.03, 6, 4), M.trim, CX - 0.2, 2.28, CZ + 0.7);

  // Round window on front
  const winX = CX + 0.3, winY = 2.6, winZ = CZ + 0.68;
  add(cabin, new THREE.CylinderGeometry(0.17, 0.17, 0.04, 16), M.glass, winX, winY, winZ, Math.PI / 2, 0, 0);
  add(cabin, new THREE.TorusGeometry(0.19, 0.035, 6, 16), M.trim, winX, winY, winZ + 0.01);
  add(cabin, new THREE.BoxGeometry(0.34, 0.03, 0.03), M.trim, winX, winY, winZ + 0.02);
  add(cabin, new THREE.BoxGeometry(0.03, 0.34, 0.03), M.trim, winX, winY, winZ + 0.02);

  // Small side window on +X wall
  add(cabin, new THREE.BoxGeometry(0.04, 0.3, 0.4), M.glass, CX + 0.71, 2.55, CZ - 0.2);
  add(cabin, new THREE.BoxGeometry(0.05, 0.36, 0.04), M.trim, CX + 0.72, 2.55, CZ - 0.2);
  add(cabin, new THREE.BoxGeometry(0.05, 0.04, 0.44), M.trim, CX + 0.72, 2.55, CZ - 0.2);

  // Chimney
  add(cabin, new THREE.BoxGeometry(0.22, 0.6, 0.22), M.woodDark, CX - 0.4, 3.9, CZ - 0.35);

  // Pennant flag on the roof peak
  const poleX = CX, poleZ = CZ;
  add(cabin, new THREE.CylinderGeometry(0.02, 0.025, 0.85, 6), M.iron, poleX, roofTop + 0.4, poleZ);
  add(cabin, new THREE.SphereGeometry(0.04, 6, 4), M.flagA, poleX, roofTop + 0.85, poleZ);
  const flagShape = new THREE.Shape();
  flagShape.moveTo(0, 0);
  flagShape.lineTo(0.55, 0.1);
  flagShape.lineTo(0.3, 0.2);
  flagShape.lineTo(0.55, 0.3);
  flagShape.lineTo(0, 0.3);
  flagShape.lineTo(0, 0);
  const flagGeom = new THREE.ShapeGeometry(flagShape);
  add(cabin, flagGeom, M.flagA, poleX + 0.02, roofTop + 0.6, poleZ);
  add(cabin, new THREE.CircleGeometry(0.09, 3), M.flagB, poleX + 0.02, roofTop + 0.6, poleZ + 0.002)
    .rotation.z = 0;

  // ---- Rope ladder from platform to ground ----
  const ladderZ = CZ + 0.95;
  const railL = V(0.05, 1.8, ladderZ), railR = V(0.4, 1.8, ladderZ);
  limb(root, V(0.05, 1.8, ladderZ), V(0.05, 0.0, ladderZ), 0.025, M.rope, 0.025, 4);
  limb(root, V(0.4, 1.8, ladderZ), V(0.4, 0.0, ladderZ), 0.025, M.rope, 0.025, 4);
  for (let y = 0.15; y < 1.75; y += 0.26) {
    add(root, new THREE.CylinderGeometry(0.018, 0.018, 0.4, 5), M.woodDark,
      0.225, y, ladderZ, 0, 0, Math.PI / 2);
  }
  void railL; void railR;

  // ---- Swing hanging from a lower branch ----
  const seatY = 1.3;
  const ropeA = V(-1.25, 2.74, -0.27);
  const ropeB = V(-1.05, 2.68, -0.22);
  limb(root, ropeA, V(-1.25, seatY + 0.05, -0.27), 0.012, M.rope, 0.012, 4);
  limb(root, ropeB, V(-1.05, seatY + 0.05, -0.22), 0.012, M.rope, 0.012, 4);
  add(root, new THREE.BoxGeometry(0.6, 0.08, 0.3), M.wood, -1.15, seatY, -0.25);
  add(root, new THREE.BoxGeometry(0.6, 0.06, 0.04), M.woodDark, -1.15, seatY + 0.08, -0.4);

  // ---- Lantern by the door ----
  const lanX = 1.3, lanZ = 1.8;
  add(root, new THREE.CylinderGeometry(0.035, 0.05, 1.0, 6), M.lanternPost, lanX, 0.5, lanZ);
  add(root, new THREE.CylinderGeometry(0.1, 0.12, 0.05, 6), M.lanternPost, lanX, 0.03, lanZ);
  limb(root, V(lanX, 1.0, lanZ), V(lanX - 0.2, 1.15, lanZ + 0.02), 0.012, M.lanternPost, 0.012, 4);
  add(root, new THREE.BoxGeometry(0.2, 0.24, 0.2), M.glass, lanX - 0.22, 1.1, lanZ + 0.02);
  add(root, new THREE.ConeGeometry(0.17, 0.12, 4), M.lanternPost, lanX - 0.22, 1.28, lanZ + 0.02, 0, Math.PI / 4, 0);

  // ---- Mushrooms at the foot of the tree ----
  const mushrooms: [number, number, number, boolean][] = [
    [-0.85, 0.3, 0.45, true],
    [-0.65, 0.3, 0.75, false],
    [-0.95, 0.3, 0.85, false],
    [0.75, 0.3, -0.6, true],
    [0.95, 0.3, -0.35, false],
  ];
  mushrooms.forEach(([x, y, z, big]) => {
    const s = big ? 1.0 : 0.7;
    add(root, new THREE.CylinderGeometry(0.05 * s, 0.07 * s, 0.14 * s, 6), M.mushCream, x, y + 0.07 * s, z);
    const cap = add(root, new THREE.SphereGeometry(0.13 * s, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2),
      M.mushRed, x, y + 0.14 * s, z);
    cap.scale.set(1, 0.7, 1);
    for (let k = 0; k < 3; k++) {
      const a = k * 2.1 + 0.5;
      add(root, new THREE.SphereGeometry(0.022 * s, 5, 4), M.mushCream,
        x + Math.cos(a) * 0.075 * s, y + 0.2 * s, z + Math.sin(a) * 0.075 * s);
    }
  });

  // ---- Bicycle leaning at the foot of the tree ----
  const bike = new THREE.Group();
  bike.position.set(-1.45, 0, 1.0);
  bike.rotation.y = 0.6;
  root.add(bike);
  const wheelGeom = new THREE.TorusGeometry(0.33, 0.03, 6, 18);
  add(bike, wheelGeom, M.iron, -0.5, 0.36, 0);
  add(bike, wheelGeom, M.iron, 0.5, 0.36, 0);
  add(bike, new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8), M.iron, -0.5, 0.36, 0, 0, 0, Math.PI / 2);
  add(bike, new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8), M.iron, 0.5, 0.36, 0, 0, 0, Math.PI / 2);
  const frame = M.leafB; // bright paint colour for the frame
  const bb = V(-0.05, 0.4, 0);
  const seatT = V(-0.25, 0.9, 0);
  const head = V(0.35, 0.95, 0);
  limb(bike, V(-0.5, 0.36, 0), bb, 0.018, frame, 0.018, 5);
  limb(bike, bb, seatT, 0.018, frame, 0.018, 5);
  limb(bike, V(-0.5, 0.36, 0), seatT, 0.014, frame, 0.014, 5);
  limb(bike, seatT, head, 0.018, frame, 0.018, 5);
  limb(bike, bb, head, 0.02, frame, 0.02, 5);
  limb(bike, head, V(0.5, 0.36, 0), 0.016, frame, 0.016, 5);
  limb(bike, head, V(0.38, 1.15, 0), 0.016, M.iron, 0.016, 5);
  limb(bike, V(0.38, 1.15, -0.18), V(0.38, 1.15, 0.18), 0.014, M.iron, 0.014, 5);
  add(bike, new THREE.BoxGeometry(0.18, 0.05, 0.1), M.woodDark, -0.27, 1.0, 0);
  add(bike, new THREE.CylinderGeometry(0.07, 0.07, 0.02, 10), M.iron, bb.x, bb.y, 0.07, Math.PI / 2, 0, 0);
  add(bike, new THREE.BoxGeometry(0.2, 0.02, 0.1), M.iron, bb.x, bb.y, 0.11);
  // Basket on the front
  add(bike, new THREE.BoxGeometry(0.22, 0.14, 0.18), M.wood, 0.5, 0.82, 0);
  add(bike, new THREE.BoxGeometry(0.24, 0.02, 0.2), M.woodDark, 0.5, 0.9, 0);

  // Keep the scene centred on x = 0 (the treehouse sits slightly right of the trunk)
  void cabin;
  return root;
}
