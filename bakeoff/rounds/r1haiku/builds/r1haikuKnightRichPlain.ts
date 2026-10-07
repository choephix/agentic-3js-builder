import * as THREE from "three";

export const meta = {
  name: "Battle-Worn Griffin Knight",
  description:
    "A dented plate-armoured knight in a deep-blue surcoat with a silver griffin, a tall crimson plume, a kite shield, a broadsword and a torn crimson cape.",
};

type V3 = [number, number, number];

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function createKnight(): THREE.Object3D {
  const rand = mulberry32(1187);

  const mat = (
    color: number,
    metalness: number,
    roughness: number,
    extra: THREE.MeshStandardMaterialParameters = {}
  ) => new THREE.MeshStandardMaterial({ color, metalness, roughness, ...extra });

  const M = {
    steel: mat(0xaeb5bf, 0.9, 0.38),
    dark: mat(0x5d636c, 0.85, 0.55),
    gold: mat(0xd6a63c, 1, 0.3),
    blue: mat(0x1f3c85, 0, 0.8, { side: THREE.DoubleSide }),
    crimson: mat(0x9b1424, 0, 0.7, { side: THREE.DoubleSide }),
    cape: mat(0x7d0f1d, 0, 0.9, { side: THREE.DoubleSide }),
    silver: mat(0xe8edf5, 1, 0.22),
    slit: mat(0x050507, 0, 1),
    leather: mat(0x4b2c17, 0, 0.9),
  };

  const root = new THREE.Group();

  const add = (
    geo: THREE.BufferGeometry,
    m: THREE.Material,
    p: V3 = [0, 0, 0],
    r: V3 = [0, 0, 0],
    s: V3 = [1, 1, 1],
    parent: THREE.Object3D = root
  ) => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(p[0], p[1], p[2]);
    mesh.rotation.set(r[0], r[1], r[2]);
    mesh.scale.set(s[0], s[1], s[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  // Battle damage: small random vertex displacement
  const dent = (geo: THREE.BufferGeometry, amt: number) => {
    const p = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      p.setXYZ(
        i,
        p.getX(i) + (rand() - 0.5) * amt,
        p.getY(i) + (rand() - 0.5) * amt,
        p.getZ(i) + (rand() - 0.5) * amt
      );
    }
    geo.computeVertexNormals();
    return geo;
  };

  // Griffin emblem built from primitives, facing +Z in its local space
  const griffin = (parent: THREE.Object3D, p: V3, s: number) => {
    const g = new THREE.Group();
    g.position.set(p[0], p[1], p[2]);
    g.scale.setScalar(s);
    parent.add(g);
    add(new THREE.SphereGeometry(0.06, 8, 6), M.silver, [0, 0, 0.006], [0, 0, 0], [1.3, 0.85, 0.5], g);
    add(new THREE.SphereGeometry(0.034, 7, 5), M.silver, [0.085, 0.05, 0.006], [0, 0, 0], [1, 1, 0.7], g);
    add(new THREE.ConeGeometry(0.018, 0.05, 5), M.silver, [0.12, 0.045, 0.006], [0, 0, -Math.PI / 2], [1, 1, 1], g);
    add(new THREE.ConeGeometry(0.07, 0.2, 4), M.silver, [-0.02, 0.1, 0.0], [0, 0, 0.45], [1, 1, 0.25], g);
    add(new THREE.ConeGeometry(0.06, 0.16, 4), M.silver, [-0.045, 0.085, -0.012], [0, 0, 0.8], [1, 1, 0.25], g);
    add(new THREE.BoxGeometry(0.016, 0.06, 0.016), M.silver, [0.03, -0.07, 0.006], [0, 0, 0], [1, 1, 1], g);
    add(new THREE.BoxGeometry(0.016, 0.06, 0.016), M.silver, [0.05, -0.07, 0.006], [0, 0, 0], [1, 1, 1], g);
    add(new THREE.ConeGeometry(0.02, 0.1, 4), M.silver, [-0.11, -0.02, 0.0], [0, 0, Math.PI / 2], [1, 1, 0.5], g);
    return g;
  };

  // ---- Legs ----
  for (const side of [-1, 1]) {
    const x = side * 0.13;
    add(new THREE.BoxGeometry(0.2, 0.12, 0.34), M.dark, [x, 0.06, 0.04]);
    add(dent(new THREE.CylinderGeometry(0.078, 0.088, 0.56, 8), 0.006), M.steel, [x, 0.4, 0]);
    add(new THREE.SphereGeometry(0.095, 8, 6), M.steel, [x, 0.73, 0.02], [0, 0, 0], [1, 0.9, 0.8]);
    add(dent(new THREE.CylinderGeometry(0.1, 0.09, 0.42, 8), 0.006), M.steel, [x, 1.0, 0]);
  }

  // ---- Belt and surcoat skirt ----
  add(new THREE.BoxGeometry(0.44, 0.05, 0.3), M.leather, [0, 1.21, 0]);
  add(new THREE.BoxGeometry(0.06, 0.05, 0.02), M.gold, [0, 1.21, 0.165]);
  add(new THREE.CylinderGeometry(0.2, 0.3, 0.55, 8, 1, true), M.blue, [0, 0.95, 0], [0, 0, 0], [1, 1, 0.75]);

  // ---- Breastplate and surcoat front ----
  add(dent(new THREE.CylinderGeometry(0.2, 0.18, 0.5, 8), 0.008), M.steel, [0, 1.45, 0], [0, 0, 0], [1, 1, 0.7]);
  add(new THREE.TorusGeometry(0.2, 0.008, 5, 24), M.gold, [0, 1.66, 0], [Math.PI / 2, 0, 0], [1, 1, 0.7]);
  add(new THREE.TorusGeometry(0.19, 0.008, 5, 24), M.gold, [0, 1.22, 0], [Math.PI / 2, 0, 0], [1, 1, 0.7]);
  add(new THREE.BoxGeometry(0.36, 0.5, 0.02), M.blue, [0, 1.4, 0.155]);
  add(new THREE.BoxGeometry(0.38, 0.015, 0.025), M.gold, [0, 1.16, 0.165]);
  add(new THREE.BoxGeometry(0.38, 0.015, 0.025), M.gold, [0, 1.65, 0.165]);
  griffin(root, [0, 1.4, 0.17], 1.3);

  // Gorget under the helm
  add(new THREE.CylinderGeometry(0.11, 0.12, 0.07, 8), M.dark, [0, 1.7, 0]);

  // ---- Great helm ----
  const helmY = 1.82;
  add(dent(new THREE.CylinderGeometry(0.135, 0.14, 0.26, 8), 0.007), M.steel, [0, helmY, 0]);
  add(dent(new THREE.SphereGeometry(0.135, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), 0.006), M.steel, [0, helmY + 0.13, 0], [0, 0, 0], [1, 0.6, 1]);
  add(new THREE.TorusGeometry(0.136, 0.008, 5, 16), M.gold, [0, 1.92, 0], [Math.PI / 2, 0, 0]);
  add(new THREE.BoxGeometry(0.2, 0.03, 0.04), M.dark, [0, 1.87, 0.13]);
  add(new THREE.BoxGeometry(0.13, 0.02, 0.012), M.slit, [0, 1.84, 0.14]);
  add(new THREE.BoxGeometry(0.025, 0.1, 0.02), M.steel, [0, 1.79, 0.145]);
  for (const bx of [-0.04, 0, 0.04]) {
    add(new THREE.BoxGeometry(0.02, 0.006, 0.012), M.slit, [bx, 1.74, 0.136]);
  }
  // Scratches on the helm
  for (let i = 0; i < 4; i++) {
    const a = rand() * Math.PI * 2;
    add(
      new THREE.BoxGeometry(0.05, 0.003, 0.003),
      M.dark,
      [Math.cos(a) * 0.137, helmY + (rand() - 0.5) * 0.18, Math.sin(a) * 0.137],
      [0, -a, 0.3]
    );
  }
  // Plume: gold socket with stacked crimson lobes sweeping back
  add(new THREE.CylinderGeometry(0.03, 0.035, 0.05, 8), M.gold, [0, 2.04, 0]);
  const plumeParts: [V3, V3][] = [
    [[0, 2.1, -0.02], [0.05, 0.1, 0.03]],
    [[0, 2.2, -0.05], [0.045, 0.1, 0.03]],
    [[0, 2.3, -0.09], [0.04, 0.09, 0.025]],
    [[0, 2.38, -0.14], [0.03, 0.07, 0.02]],
  ];
  plumeParts.forEach(([p, s], i) => {
    add(new THREE.SphereGeometry(1, 6, 5), M.crimson, p, [0.3 + i * 0.2, 0, 0], s);
  });

  // ---- Gorget and shoulders ----
  for (const side of [-1, 1]) {
    const x = side * 0.27;
    // Layered pauldrons
    add(dent(new THREE.SphereGeometry(0.13, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), 0.008), M.steel, [x, 1.68, 0], [0, 0, 0], [1, 0.6, 1]);
    add(dent(new THREE.SphereGeometry(0.15, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), 0.008), M.steel, [x, 1.63, 0], [0, 0, 0], [1, 0.35, 1]);
    add(new THREE.TorusGeometry(0.14, 0.01, 5, 18), M.gold, [x, 1.65, 0], [Math.PI / 2, 0, 0]);
    add(new THREE.TorusGeometry(0.085, 0.006, 4, 14), M.gold, [x, 1.74, 0], [Math.PI / 2, 0, 0]);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      add(new THREE.SphereGeometry(0.012, 5, 4), M.gold, [x + Math.cos(a) * 0.1, 1.7, Math.sin(a) * 0.1]);
    }

    // Upper arm
    add(new THREE.CylinderGeometry(0.06, 0.055, 0.32, 7), M.dark, [x, 1.42, 0]);
    // Elbow cop
    add(new THREE.SphereGeometry(0.07, 7, 5), M.steel, [x, 1.25, 0.02]);
    // Forearm angled forward from elbow to hand
    const elbow: V3 = [x, 1.25, 0.02];
    const hand: V3 = [x, 1.1, 0.27];
    const dy = hand[1] - elbow[1];
    const dz = hand[2] - elbow[2];
    const len = Math.hypot(dy, dz);
    add(
      dent(new THREE.CylinderGeometry(0.055, 0.05, len, 7), 0.005),
      M.steel,
      [x, (elbow[1] + hand[1]) / 2, (elbow[2] + hand[2]) / 2],
      [Math.atan2(dz, dy), 0, 0]
    );
    // Gauntlet
    add(new THREE.BoxGeometry(0.1, 0.09, 0.1), M.dark, hand);
  }

  // ---- Kite shield on the left arm (+X) ----
  const shieldShape = new THREE.Shape();
  shieldShape.moveTo(-0.2, 0.45);
  shieldShape.lineTo(0.2, 0.45);
  shieldShape.lineTo(0.2, 0.1);
  shieldShape.quadraticCurveTo(0.19, -0.25, 0, -0.5);
  shieldShape.quadraticCurveTo(-0.19, -0.25, -0.2, 0.1);
  shieldShape.closePath();

  const shieldGroup = new THREE.Group();
  shieldGroup.position.set(0.36, 1.05, 0.33);
  shieldGroup.rotation.y = 0.4;
  root.add(shieldGroup);

  // Gold rim sitting just behind the crimson field
  add(new THREE.ExtrudeGeometry(shieldShape, { depth: 0.012, bevelEnabled: false }), M.gold, [0, 0, -0.002], [0, 0, 0], [1.08, 1.06, 1], shieldGroup);
  // Crimson field
  add(new THREE.ExtrudeGeometry(shieldShape, { depth: 0.03, bevelEnabled: false }), M.crimson, [0, 0, 0], [0, 0, 0], [1, 1, 1], shieldGroup);
  // Boss
  add(new THREE.SphereGeometry(0.035, 7, 5), M.gold, [0, 0.1, 0.04], [0, 0, 0], [1, 1, 0.6], shieldGroup);
  griffin(shieldGroup, [0, 0.05, 0.04], 1.05);
  // Scratches across the field
  for (let i = 0; i < 6; i++) {
    add(
      new THREE.BoxGeometry(0.1, 0.004, 0.004),
      M.steel,
      [(rand() - 0.5) * 0.3, (rand() - 0.5) * 0.7 - 0.05, 0.032],
      [0, 0, (rand() - 0.5) * 2],
      [1, 1, 1],
      shieldGroup
    );
  }

  // ---- Broadsword in the right hand (-X), point down ----
  const swordGroup = new THREE.Group();
  swordGroup.position.set(-0.27, 1.1, 0.27);
  swordGroup.rotation.x = -0.15;
  root.add(swordGroup);

  add(new THREE.CylinderGeometry(0.017, 0.017, 0.14, 6), M.leather, [0, 0.07, 0], [0, 0, 0], [1, 1, 1], swordGroup);
  add(new THREE.SphereGeometry(0.025, 6, 5), M.gold, [0, 0.16, 0], [0, 0, 0], [1, 1, 1], swordGroup);
  add(new THREE.BoxGeometry(0.22, 0.03, 0.04), M.gold, [0, 0, 0], [0, 0, 0], [1, 1, 1], swordGroup);
  add(dent(new THREE.BoxGeometry(0.045, 0.86, 0.008), 0.004), M.steel, [0, -0.47, 0], [0, 0, 0], [1, 1, 1], swordGroup);
  add(new THREE.ConeGeometry(0.023, 0.08, 4), M.steel, [0, -0.94, 0], [Math.PI, 0, 0], [1, 1, 0.4], swordGroup);
  // Nicks along the edge
  for (let i = 0; i < 4; i++) {
    add(
      new THREE.BoxGeometry(0.012, 0.02, 0.012),
      M.dark,
      [0.024, -0.2 - i * 0.16, 0],
      [0, 0, 0],
      [1, 1, 1],
      swordGroup
    );
  }

  // ---- Torn crimson cape hanging from the shoulders ----
  const capeGeo = new THREE.PlaneGeometry(0.52, 1.1, 12, 14);
  const cp = capeGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < cp.count; i++) {
    const x = cp.getX(i);
    const y = cp.getY(i);
    const t = (0.55 - y) / 1.1; // 0 at shoulders, 1 at hem
    let ny = y;
    if (t > 0.9) ny += (rand() - 0.5) * 0.14; // ragged hem
    const nz = Math.sin(x * 10 + t * 3) * 0.035 * t;
    cp.setXYZ(i, x * (1 + 0.08 * t), ny, nz);
  }
  capeGeo.computeVertexNormals();
  const cape = add(capeGeo, M.cape, [0, 1.0, -0.2], [0.08, 0, 0]);
  cape.castShadow = true;

  return root;
}
