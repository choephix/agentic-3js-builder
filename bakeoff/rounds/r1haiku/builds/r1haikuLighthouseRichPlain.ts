import * as THREE from "three";

export const meta = {
  name: "Cozy Lighthouse Diorama",
  description:
    "A striped lighthouse with a glowing lantern, a keeper's cottage, a jetty with a rowboat, seagulls, and a rocky island on a round base.",
};

// Seeded generator so every build is identical.
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

// Adds a little organic wobble to a radial geometry without breaking its seams.
function organic(geo: THREE.BufferGeometry, amt: number, phase: number) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const a = Math.atan2(z, x);
    const f = 1 + amt * (Math.sin(3 * a + phase) * 0.6 + Math.cos(5 * a + y * 3) * 0.4);
    p.setXYZ(i, x * f, y, z * f);
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

export default function createLighthouseDiorama(): THREE.Object3D {
  const rnd = mulberry32(20240607);
  const range = (a: number, b: number) => a + (b - a) * rnd();
  const root = new THREE.Group();

  const mat = (color: number, o: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0, ...o });

  const M = {
    water: mat(0x35c9c0, { roughness: 0.2, metalness: 0.1 }),
    foam: mat(0xf4fbff, { roughness: 0.6 }),
    wood: mat(0x6b4a2e),
    plank: mat(0xb98a55),
    rock: mat(0x8a8f96),
    rockDark: mat(0x5f666e),
    grass: mat(0x6fbf4a),
    stem: mat(0x3f8f3a),
    red: mat(0xd63c3c),
    white: mat(0xf5f1e8),
    iron: mat(0x22252a),
    brass: mat(0xf2c14e, { roughness: 0.4, metalness: 0.5 }),
    glow: mat(0xffe27a, { emissive: 0xffc940, emissiveIntensity: 1.6, roughness: 0.3 }),
    cream: mat(0xf3e3c3),
    roof: mat(0x9c4a3a),
    blue: mat(0x2f6fd6),
    brick: mat(0xa4503f),
    boat: mat(0xe0574a),
    gullW: mat(0xfbfbfb),
    beak: mat(0xf0a030),
    tip: mat(0x333333),
    flowerBox: mat(0x7a4a2a),
    halo: new THREE.MeshBasicMaterial({
      color: 0xffe27a,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
    }),
  };
  const flowerMats = [mat(0xff7fb0), mat(0xffe066), mat(0xb58cff)];

  // Adds a mesh with transform to a parent.
  const add = (
    geo: THREE.BufferGeometry,
    material: THREE.Material,
    parent: THREE.Object3D,
    x = 0, y = 0, z = 0,
    rx = 0, ry = 0, rz = 0,
  ) => {
    const mesh = new THREE.Mesh(geo, material);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  // Places a thin cylinder between two points.
  const link = (a: THREE.Vector3, b: THREE.Vector3, r: number, material: THREE.Material) => {
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const mesh = add(new THREE.CylinderGeometry(r, r, len, 4), material, root);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return mesh;
  };

  // Key layout values.
  const GY = 1.3;            // island grass top
  const TX = -0.75, TZ = -0.6; // lighthouse position
  const CX = 0.85, CZ = 0.3;   // cottage position

  // ---------- Base, water and foam ----------
  add(new THREE.CylinderGeometry(4.6, 4.6, 0.4, 48), M.wood, root, 0, 0.2, 0);
  add(new THREE.CylinderGeometry(4.66, 4.66, 0.05, 48), M.plank, root, 0, 0.38, 0);
  add(new THREE.CylinderGeometry(4.45, 4.45, 0.06, 64), M.water, root, 0, 0.43, 0);

  const foamRing = add(new THREE.RingGeometry(2.95, 3.3, 48), M.foam, root, 0, 0.468, 0);
  foamRing.rotation.x = -Math.PI / 2;

  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + range(-0.1, 0.1);
    const r = range(3.35, 3.9);
    const blob = add(
      new THREE.SphereGeometry(range(0.1, 0.16), 8, 6),
      M.foam, root,
      Math.cos(a) * r, 0.47, Math.sin(a) * r,
    );
    blob.scale.set(1, 0.35, 1);
  }

  // ---------- Island ----------
  const rockGeo = organic(new THREE.CylinderGeometry(2.6, 3.0, 0.8, 14, 3), 0.07, 1.3);
  add(rockGeo, M.rock, root, 0, 0.86, 0);
  const capGeo = organic(new THREE.CylinderGeometry(2.5, 2.6, 0.1, 14, 2), 0.05, 0.4);
  add(capGeo, M.grass, root, 0, 1.25, 0);

  // Boulders around the island edge.
  for (let i = 0; i < 7; i++) {
    const a = range(0, Math.PI * 2);
    const r = range(2.6, 2.95);
    const b = add(new THREE.DodecahedronGeometry(range(0.22, 0.34), 0), M.rockDark, root,
      Math.cos(a) * r, 1.0, Math.sin(a) * r);
    b.scale.set(1, 0.6, 1.1);
    b.rotation.set(range(0, 3), range(0, 3), range(0, 3));
  }

  // Boulders on the grass.
  for (let i = 0; i < 4; i++) {
    const a = range(0, Math.PI * 2);
    const r = range(1.5, 2.0);
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.hypot(x - TX, z - TZ) < 0.8) continue;
    if (Math.abs(x - CX) < 0.8 && Math.abs(z - CZ) < 0.8) continue;
    const b = add(new THREE.DodecahedronGeometry(range(0.12, 0.2), 0), M.rock, root, x, GY + 0.03, z);
    b.scale.set(1, 0.6, 1);
  }

  // ---------- Lighthouse ----------
  const BANDS = 8;
  for (let i = 0; i < BANDS; i++) {
    const r0 = 0.45 - 0.13 * (i / BANDS);
    const r1 = 0.45 - 0.13 * ((i + 1) / BANDS);
    add(new THREE.CylinderGeometry(r1, r0, 0.4, 14), i % 2 ? M.white : M.red,
      root, TX, GY + 0.2 + i * 0.4, TZ);
  }
  const TOP = GY + BANDS * 0.4; // 4.5

  // Tower door.
  add(new THREE.BoxGeometry(0.16, 0.3, 0.05), M.iron, root, TX, GY + 0.15, TZ + 0.44);

  // Balcony and railing.
  add(new THREE.CylinderGeometry(0.47, 0.47, 0.06, 14), M.iron, root, TX, TOP + 0.03, TZ);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    add(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 4), M.iron, root,
      TX + Math.cos(a) * 0.44, TOP + 0.21, TZ + Math.sin(a) * 0.44);
  }
  add(new THREE.TorusGeometry(0.44, 0.015, 4, 24), M.iron, root, TX, TOP + 0.38, TZ, Math.PI / 2, 0, 0);

  // Lantern room.
  const LANT_Y = TOP + 0.07 + 0.275;
  add(new THREE.CylinderGeometry(0.3, 0.3, 0.55, 8), M.glow, root, TX, LANT_Y, TZ);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    add(new THREE.BoxGeometry(0.035, 0.56, 0.035), M.iron, root,
      TX + Math.cos(a) * 0.3, LANT_Y, TZ + Math.sin(a) * 0.3);
  }
  add(new THREE.SphereGeometry(0.6, 16, 12), M.halo, root, TX, LANT_Y, TZ);

  // Lantern roof, cap, and brass finial.
  add(new THREE.ConeGeometry(0.36, 0.36, 8), M.iron, root, TX, LANT_Y + 0.455, TZ);
  add(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 8), M.iron, root, TX, LANT_Y + 0.66, TZ);
  add(new THREE.SphereGeometry(0.05, 8, 6), M.brass, root, TX, LANT_Y + 0.74, TZ);

  // ---------- Keeper's cottage ----------
  const BODY_TOP = GY + 0.7;
  add(new THREE.BoxGeometry(1.0, 0.7, 0.8), M.cream, root, CX, GY + 0.35, CZ);

  // Gabled roof: two slopes.
  const SLOPE_Y = GY + 0.91;
  add(new THREE.BoxGeometry(0.78, 0.06, 1.0), M.roof, root, CX + 0.3, SLOPE_Y, CZ, 0, 0, -0.644);
  add(new THREE.BoxGeometry(0.78, 0.06, 1.0), M.roof, root, CX - 0.3, SLOPE_Y, CZ, 0, 0, 0.644);

  // Gable ends.
  const gableShape = new THREE.Shape();
  gableShape.moveTo(-0.5, 0);
  gableShape.lineTo(0.5, 0);
  gableShape.lineTo(0, 0.42);
  const gableGeo = new THREE.ExtrudeGeometry(gableShape, { depth: 0.04, bevelEnabled: false });
  add(gableGeo, M.cream, root, CX, BODY_TOP, CZ + 0.4);
  add(gableGeo, M.cream, root, CX, BODY_TOP, CZ - 0.44);

  // Crooked chimney.
  add(new THREE.BoxGeometry(0.16, 0.5, 0.16), M.brick, root, CX + 0.36, GY + 1.1, CZ - 0.2, 0, 0, 0.12);
  add(new THREE.BoxGeometry(0.2, 0.05, 0.2), M.iron, root, CX + 0.38, GY + 1.37, CZ - 0.2, 0, 0, 0.12);

  // Front window with cross frame and flower box.
  add(new THREE.BoxGeometry(0.2, 0.2, 0.03), M.glow, root, CX - 0.25, GY + 0.5, CZ + 0.41);
  add(new THREE.BoxGeometry(0.22, 0.02, 0.04), M.white, root, CX - 0.25, GY + 0.5, CZ + 0.42);
  add(new THREE.BoxGeometry(0.02, 0.22, 0.04), M.white, root, CX - 0.25, GY + 0.5, CZ + 0.42);
  add(new THREE.BoxGeometry(0.24, 0.06, 0.07), M.flowerBox, root, CX - 0.25, GY + 0.36, CZ + 0.44);
  for (let i = 0; i < 5; i++) {
    add(new THREE.SphereGeometry(0.03, 6, 5), flowerMats[i % 3], root,
      CX - 0.36 + i * 0.055, GY + 0.42, CZ + 0.46);
  }

  // Blue door and step.
  add(new THREE.BoxGeometry(0.22, 0.4, 0.03), M.blue, root, CX + 0.2, GY + 0.2, CZ + 0.415);
  add(new THREE.BoxGeometry(0.3, 0.05, 0.12), M.rock, root, CX + 0.2, GY + 0.02, CZ + 0.5);

  // Side window.
  add(new THREE.BoxGeometry(0.03, 0.2, 0.2), M.glow, root, CX + 0.505, GY + 0.5, CZ - 0.1);

  // ---------- Jetty and rowboat ----------
  const JZ = -1.1;
  for (let i = 0; i < 6; i++) {
    add(new THREE.BoxGeometry(0.18, 0.05, 0.5), i % 2 ? M.plank : M.wood, root,
      2.45 + i * 0.2 + 0.1, 0.62, JZ);
  }
  const pilings: [number, number][] = [[2.6, -0.9], [2.6, -1.3], [3.5, -0.9], [3.5, -1.3]];
  for (const [px, pz] of pilings) {
    add(new THREE.CylinderGeometry(0.035, 0.04, 0.5, 6), M.wood, root, px, 0.35, pz);
  }

  const boat = new THREE.Group();
  boat.position.set(3.2, 0.47, -1.95);
  boat.rotation.y = Math.PI / 2 + 0.08;
  root.add(boat);
  const hull = add(new THREE.CylinderGeometry(0.2, 0.12, 1.0, 6, 1), M.boat, boat);
  hull.rotation.z = Math.PI / 2;
  hull.scale.set(1, 1, 0.6);
  add(new THREE.BoxGeometry(0.1, 0.04, 0.4), M.white, boat, -0.25, 0.6, 0);
  add(new THREE.BoxGeometry(0.1, 0.04, 0.4), M.white, boat, 0.25, 0.6, 0);

  // Rope from the piling to the boat.
  link(
    new THREE.Vector3(3.5, 0.6, -1.3),
    new THREE.Vector3(3.2, 0.6, -1.45),
    0.012,
    M.wood,
  );

  // ---------- Shoreline rocks ----------
  for (let i = 0; i < 5; i++) {
    const a = range(-Math.PI * 0.8, Math.PI * 0.4);
    const r = range(3.5, 3.9);
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (x > 2.8 && z < -0.5) continue;
    const s = add(new THREE.DodecahedronGeometry(range(0.12, 0.18), 0), M.rockDark, root, x, 0.44, z);
    s.scale.set(1, 0.5, 1);
    s.rotation.y = range(0, 3);
  }

  // ---------- Grass, flowers and free spot sampling ----------
  const freeSpot = (maxR: number) => {
    for (let t = 0; t < 60; t++) {
      const a = range(0, Math.PI * 2);
      const r = Math.sqrt(rnd()) * maxR;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (Math.hypot(x - TX, z - TZ) < 0.75) continue;
      if (Math.abs(x - CX) < 0.8 && Math.abs(z - CZ) < 0.8) continue;
      if (x > 1.5 && Math.abs(z - JZ) < 0.5) continue;
      return { x, z };
    }
    return null;
  };

  const tuftGeo = new THREE.ConeGeometry(0.035, 1, 5);
  for (let i = 0; i < 28; i++) {
    const p = freeSpot(2.15);
    if (!p) continue;
    const tuft = new THREE.Group();
    tuft.position.set(p.x, GY, p.z);
    tuft.rotation.y = range(0, Math.PI * 2);
    root.add(tuft);
    const blades = 3 + Math.floor(rnd() * 2);
    for (let k = 0; k < blades; k++) {
      const h = range(0.14, 0.24);
      const blade = add(tuftGeo, rnd() > 0.5 ? M.grass : M.stem, tuft,
        range(-0.04, 0.04), h / 2, range(-0.04, 0.04),
        range(-0.2, 0.2), 0, range(-0.25, 0.25));
      blade.scale.set(1, h, 1);
    }
  }

  const flowerGeo = new THREE.SphereGeometry(0.035, 8, 6);
  for (let i = 0; i < 18; i++) {
    const p = freeSpot(2.1);
    if (!p) continue;
    const h = range(0.16, 0.24);
    add(new THREE.CylinderGeometry(0.008, 0.008, h, 4), M.stem, root, p.x, GY + h / 2, p.z);
    add(flowerGeo, flowerMats[i % 3], root, p.x, GY + h + 0.02, p.z);
  }

  // ---------- Seagulls ----------
  const gull = (x: number, y: number, z: number, ry: number) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = ry;
    root.add(g);

    const body = add(new THREE.SphereGeometry(0.13, 12, 8), M.gullW, g);
    body.scale.set(1, 0.85, 1.9);
    add(new THREE.SphereGeometry(0.085, 10, 8), M.gullW, g, 0, 0.1, 0.22);
    add(new THREE.ConeGeometry(0.03, 0.12, 4), M.beak, g, 0, 0.08, 0.34, Math.PI / 2, 0, 0);
    add(new THREE.BoxGeometry(0.1, 0.02, 0.2), M.gullW, g, 0, 0.02, -0.27);

    const wr = 0.25;
    add(new THREE.BoxGeometry(0.5, 0.02, 0.2), M.gullW, g, 0.36, 0.09, -0.02, 0, 0, wr);
    add(new THREE.BoxGeometry(0.5, 0.02, 0.2), M.gullW, g, -0.36, 0.09, -0.02, 0, 0, -wr);
    add(new THREE.BoxGeometry(0.12, 0.025, 0.2), M.tip, g, 0.6, 0.15, -0.02, 0, 0, wr);
    add(new THREE.BoxGeometry(0.12, 0.025, 0.2), M.tip, g, -0.6, 0.15, -0.02, 0, 0, -wr);
  };
  gull(-1.6, 3.1, 1.3, 0.6);
  gull(1.3, 3.6, -1.2, -0.9);

  return root;
}
